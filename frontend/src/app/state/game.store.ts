import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ACCOUNT_MODE } from '../data/account-mode';
import { AuthStore } from './auth.store';
import { ApiError } from '../data/api-client';
import { ActivityCommand } from '../domain/models';
import { GAME_REPOSITORY } from '../data/game.repository';
import { ATTRIBUTES, BALANCE, SKILLS } from '../domain/catalog';
import { CharacterProfile, GameSnapshot } from '../domain/models';
import { bossPhase, levelProgress } from '../domain/progression';
import { detectMilestones } from '../domain/milestones';
import { GAME_DAY_CLOCK } from '../data/game-clock';
import { ProgressPersistenceStatus } from '../data/game-progress.storage';
import { AURA_REWARDS, hasAuraAccess } from '../domain/aura-rewards';
import { ProgressFeedback } from './progress-feedback';
import { JourneyStore } from './journey.store';
import { BossFightCommand, BossFightResult } from '../domain/boss-fight';
import { BossDifficulty, BossId, isBossId, isBossDifficulty } from '../domain/boss-catalog';
import { BattleTactic, BATTLE_TACTICS } from '../domain/auto-battle';
import { BOSS_COSMETICS } from '../domain/boss-loot';
import { RewardNotifications } from './reward-notifications';
import { PendingActivityStorage } from '../data/pending-activity.storage';

const ACTIVITY_CONFIRMED_ELSEWHERE = 'Eintrag wurde in einem anderen Fenster bestätigt. Prüfe deinen Verlauf.';

@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly accountMode = inject(ACCOUNT_MODE);
  private readonly auth = this.accountMode ? inject(AuthStore) : null;
  private operation = 0;
  private ownerEpoch = this.auth?.epoch();
  private ownerId = this.auth?.user()?.id ?? null;
  private loadRequest: Promise<boolean> | null = null;
  private readonly pendingActivityState = signal<ActivityCommand | null>(null);
  readonly pendingActivity = this.pendingActivityState.asReadonly();
  private readonly recoveryIssueState = signal('');
  readonly recoveryIssue = this.recoveryIssueState.asReadonly();
  private readonly pendingStorage = inject(PendingActivityStorage);
  private pendingFight: BossFightCommand | null = null;

  constructor() {
    if (this.auth) {
      this.restorePendingActivity();
      effect(() => this.syncOwner());
    }
  }
  private syncOwner() {
    const epoch = this.auth?.epoch();
    if (epoch === this.ownerEpoch) return;
    this.ownerEpoch = epoch;
    this.ownerId = this.auth?.user()?.id ?? null;
    this.operation++;
    this.snapshotState.set(null);
    this.busyState.set(false);
    this.messageState.set('');
    this.errorState.set('');
    this.pendingActivityState.set(null);
    this.recoveryIssueState.set('');
    this.restorePendingActivity();
    this.pendingFight = null;
    this.loadRequest = null;
    this.feedback.dismiss();
    this.rewardNotifications.clear();
  }
  private readonly repository = inject(GAME_REPOSITORY);
  private readonly journey = inject(JourneyStore);
  private readonly feedback = inject(ProgressFeedback);
  private readonly rewardNotifications = inject(RewardNotifications);
  private readonly today = inject(GAME_DAY_CLOCK);
  private readonly persistenceState = signal<ProgressPersistenceStatus>({
    state: 'session',
    message: null,
  });
  readonly persistence = this.persistenceState.asReadonly();
  private readonly snapshotState = signal<GameSnapshot | null>(null);
  private readonly busyState = signal(false);
  private readonly errorState = signal('');
  private readonly messageState = signal('');
  readonly snapshot = this.snapshotState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly message = this.messageState.asReadonly();
  readonly profileIsSaved = computed(() => this.snapshot()?.character.createdByPlayer ?? false);
  readonly level = computed(() => levelProgress(this.snapshot()?.character.totalXp ?? 0));
  readonly skills = computed(() =>
    (this.snapshot()?.skills ?? []).map((progress) => {
      const definition = SKILLS.find((s) => s.id === progress.skillId)!;
      return {
        ...definition,
        ...progress,
        ...levelProgress(progress.totalXp, BALANCE.skillBase, BALANCE.skillStep),
      };
    }),
  );
  // Focus changes presentation only; every earned skill remains in the snapshot.
  readonly focusSkills = computed(() =>
    this.journey.activeSkillIds().flatMap((id) => {
      const skill = this.skills().find((skill) => skill.id === id);
      return skill ? [skill] : [];
    }),
  );
  readonly avatarInterest = computed(
    () =>
      this.snapshot()?.activities.find((activity) => activity.xp > 0)?.skillId ??
      (this.journey.configured() ? this.journey.primaryAvatarInterest() : 'adventurer'),
  );
  readonly attributes = computed(() =>
    ATTRIBUTES.map((attribute) => {
      const earned = this.skills()
        .filter((s) => s.attribute === attribute.id)
        .reduce((sum, s) => sum + s.totalXp, 0);
      return {
        ...attribute,
        value:
          (this.snapshot()?.character.attributes[attribute.id] ?? 0) +
          Math.floor(earned / BALANCE.attributeXpPerPoint),
      };
    }),
  );
  readonly questsDone = computed(
    () => this.snapshot()?.quests.filter((q) => q.claimed).length ?? 0,
  );
  readonly phase = computed(() => {
    const boss = this.snapshot()?.boss;
    return boss ? bossPhase(boss.hp, boss.maxHp) : '';
  });
  readonly ownedAuras = computed(() =>
    AURA_REWARDS.filter((aura) => this.snapshot()?.unlockedAuras.includes(aura.id)),
  );
  /** All earned auras, including encounter loot; the activity collection keeps its own 3-item count. */
  readonly earnedAuraCount = computed(() => {
    const available = new Set<string>([
      ...AURA_REWARDS.map(aura => aura.id),
      ...BOSS_COSMETICS.flatMap(reward => reward.auraId ? [reward.auraId] : []),
    ]);
    const owned = new Set(this.snapshot()?.unlockedAuras ?? []);
    return [...available].filter(id => owned.has(id)).length;
  });
  canEquipAura(id: string): boolean {
    const snapshot = this.snapshot();
    return !!snapshot && hasAuraAccess(snapshot, id);
  }
  readonly todayMinutes = computed(
    () =>
      this.snapshot()
        ?.activities.filter((activity) => activity.dayKey === this.snapshot()?.dayKey)
        .reduce((sum, activity) => sum + activity.minutes, 0) ?? 0,
  );
  readonly totalMinutes = computed(
    () => this.snapshot()?.activities.reduce((sum, a) => sum + a.minutes, 0) ?? 0,
  );
  async load(): Promise<boolean> {
    this.syncOwner();
    const previousPending = this.pendingActivity();
    this.restorePendingActivity();
    const resolvedElsewhere = this.accountMode && !!previousPending && !this.pendingActivity() && !this.recoveryIssue();
    if (this.loadRequest) return this.loadRequest;
    const request = this.execute(async (current) => {
      const snapshot = await this.repository.load();
      if (current()) {
        this.snapshotState.set(snapshot);
        if (resolvedElsewhere && !this.pendingActivity()) this.messageState.set(ACTIVITY_CONFIRMED_ELSEWHERE);
      }
    });
    this.loadRequest = request;
    try {
      return await request;
    } finally {
      if (this.loadRequest === request) this.loadRequest = null;
    }
  }
  async refresh() {
    // Resume after midnight without resetting rewards while the app stays open.
    if (!this.snapshot() || this.busy()) return;
    let shouldRefresh = true;
    try {
      shouldRefresh =
        this.accountMode ||
        this.snapshot()!.dayKey !== this.today() ||
        this.persistence().state === 'clock';
    } catch {
      // The repository preserves the last valid day and reports a clock warning.
    }
    if (shouldRefresh) await this.load();
  }
  async record(skillId: string, minutes: number): Promise<boolean> {
    this.feedback.prepareAudio();
    return this.execute(async (current) => {
      if (!this.snapshot()) throw new Error('Bitte zuerst deinen Charakter laden.');
      this.restorePendingActivity();
      const pending = this.pendingActivity();
      if (
        pending &&
        (pending.skillId !== skillId || pending.minutes !== minutes)
      ) {
        throw new Error(
          'Der letzte Eintrag ist noch unbestätigt. Bitte wiederhole ihn mit demselben Skill und denselben Minuten, bevor du einen neuen erfasst.',
        );
      }
      if (
        !Number.isInteger(minutes) ||
        minutes < 1 ||
        minutes > BALANCE.maxMinutesPerEntry ||
        !SKILLS.some((s) => s.id === skillId)
      ) {
        throw new Error(
          'Bitte einen bekannten Skill und ganze Minuten zwischen 1 und 180 eintragen.',
        );
      }
      const ownerId = this.ownerId;
      let command = pending ?? { requestId: crypto.randomUUID(), skillId, minutes };
      if (this.accountMode) {
        if (!ownerId) throw new Error('Bitte melde dich erneut an.');
        try {
          command = await this.pendingStorage.reserve(ownerId, command);
        } catch (error) {
          if (current()) this.recoveryIssueState.set(error instanceof Error ? error.message : 'Die Gerätesicherung ist nicht verfügbar.');
          throw error;
        }
        if (!current()) return;
        this.recoveryIssueState.set('');
      }
      this.pendingActivityState.set(command);
      if (command.skillId !== skillId || command.minutes !== minutes)
        throw new Error('In einem anderen Fenster gibt es noch einen unbestätigten Eintrag. Bitte prüfe zuerst diesen Eintrag.');
      // Persist the ID before either request: a reload during a lost response can safely recover it.
      const before = await this.repository.load();
      if (!current()) return;
      this.snapshotState.set(before);
      let result;
      try {
        result = await this.repository.record(command);
      } catch (error) {
        // Even a 4xx cannot disprove that an earlier request (or another tab's retry) committed.
        // Only a successful server response may retire an account reservation.
        if (current() && !this.accountMode) await this.clearPendingActivity(ownerId, command.requestId);
        throw error;
      }
      if (!current()) return;
      await this.clearPendingActivity(ownerId, command.requestId);
      if (!current()) return;
      this.snapshotState.set(result.snapshot);
      const r = result.reward;
      if (!r.duplicate) this.feedback.celebrate(detectMilestones(before, result.snapshot));
      this.rewardNotifications.earnedActivity(before, result.snapshot, r.duplicate);
      this.messageState.set(
        r.duplicate
          ? 'Dein Eintrag ist bereits gespeichert. Es wurden keine doppelten XP vergeben.'
          : r.activityXp > 0
            ? 'Aktivität erfasst. +' +
              (r.activityXp + r.questXp + (r.membershipXp ?? 0)) +
              ' XP' +
              (r.questXp ? ', davon ' + r.questXp + ' Quest-XP' : '') +
              (r.membershipXp ? ', inkl. ' + r.membershipXp + ' Plus-XP' : '') +
              '. ' +
              r.damage +
              ' Boss-Schaden.' +
              (r.rewardedMinutes < minutes
                ? ' Tageslimit erreicht; zusätzliche Minuten wurden ohne XP erfasst.'
                : '')
            : 'Aktivität erfasst. Dein XP-Tageslimit für diesen Skill ist erreicht.',
      );
    });
  }
  /** Explicit recovery only: re-opening the app never submits an activity automatically. */
  async retryPendingActivity(expectedRequestId?: string): Promise<boolean> {
    this.syncOwner();
    const previousRequestId = expectedRequestId ?? this.pendingActivity()?.requestId;
    this.restorePendingActivity();
    const pending = this.pendingActivity();
    if (pending) return this.record(pending.skillId, pending.minutes);
    if (previousRequestId && this.accountMode && this.ownerId && !this.recoveryIssue()) {
      const refreshed = await this.load();
      if (refreshed) this.messageState.set(ACTIVITY_CONFIRMED_ELSEWHERE);
      return refreshed;
    }
    return false;
  }
  checkActivityRecovery() {
    this.syncOwner();
    const previousIssue = this.recoveryIssue();
    this.restorePendingActivity();
    if (!this.recoveryIssue() && this.errorState() === previousIssue) this.errorState.set('');
  }
  private restorePendingActivity() {
    if (!this.accountMode || !this.ownerId) return;
    const restored = this.pendingStorage.read(this.ownerId);
    this.pendingActivityState.set(restored.command);
    this.recoveryIssueState.set(restored.issue);
  }
  private async clearPendingActivity(ownerId: string | null, requestId: string) {
    if (!this.accountMode) {
      this.pendingActivityState.set(null);
      return;
    }
    if (!ownerId) return;
    const cleared = await this.pendingStorage.clear(ownerId, requestId);
    // Logout/account changes may happen while waiting for another tab's lock.
    if (ownerId !== this.auth?.user()?.id) return;
    this.restorePendingActivity();
    if (!cleared && !this.recoveryIssue()) this.recoveryIssueState.set(
      'Die Gerätesicherung konnte noch nicht abgeschlossen werden. Prüfe den Eintrag erneut; bereits gespeicherte Aktivitäten erhalten keine doppelten XP.',
    );
  }
  async fightBoss(bossId: BossId, difficulty: BossDifficulty, tactic: BattleTactic): Promise<BossFightResult | null> {
    let accepted: BossFightResult | null = null;
    const completed = await this.execute(async (current) => {
      if (!this.accountMode || !this.repository.fightBoss)
        throw new Error('Echte Bosskämpfe benötigen ein angemeldetes Konto. Das Training bleibt ohne Beute.');
      if (!this.snapshot()?.character.createdByPlayer)
        throw new Error('Erstelle zuerst deinen Charakter.');
      if (!isBossId(bossId) || !isBossDifficulty(difficulty) || !BATTLE_TACTICS.some(item => item.id === tactic))
        throw new Error('Bitte einen verfügbaren Boss, Modus und eine Taktik wählen.');
      if (this.pendingFight && (this.pendingFight.bossId !== bossId || this.pendingFight.difficulty !== difficulty || this.pendingFight.tactic !== tactic))
        throw new Error('Der letzte Kampf ist noch unbestätigt. Bitte wiederhole denselben Boss, Modus und dieselbe Taktik.');
      this.pendingFight ??= { requestId: crypto.randomUUID(), bossId, difficulty, tactic };
      let result: BossFightResult;
      try {
        result = await this.repository.fightBoss(this.pendingFight);
      } catch (error) {
        if (current() && error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429)
          this.pendingFight = null;
        throw error;
      }
      if (!current()) return;
      this.pendingFight = null;
      this.snapshotState.set(result.snapshot);
      accepted = result;
      this.messageState.set(result.duplicate
        ? 'Der Kampf war bereits gespeichert. Es wurde keine doppelte Beute vergeben.'
        : result.firstClear && result.reward
          ? 'Erster Sieg! ' + result.reward.name + ' gehört jetzt zu deiner Sammlung.'
          : result.replay.outcome === 'victory'
            ? 'Sieg! Die Erstabschluss-Beute dieses Modus besitzt du bereits.'
            : 'Kampf gespeichert. Dein Fortschritt bleibt erhalten.');
    });
    return completed ? accepted : null;
  }
  async updateCharacter(profile: CharacterProfile): Promise<boolean> {
    return this.execute(async (current) => {
      const result = await this.repository.updateCharacter(profile);
      if (!current()) return;
      this.snapshotState.set(result.snapshot);
      this.messageState.set(
        result.persisted
          ? this.accountMode
            ? 'Dein Charakter ist in deinem Konto gespeichert.'
            : 'Dein Charakter ist gespeichert und bleibt auf diesem Gerät erhalten.'
          : 'Dein Charakter wurde übernommen. Dein Browser blockiert die Speicherung; nach Neuladen geht diese Änderung verloren.',
      );
    });
  }
  async reset() {
    if (this.accountMode) return false;
    return this.execute(async (current) => {
      const snapshot = await this.repository.resetDemo();
      if (!current()) return;
      this.snapshotState.set(snapshot);
      this.feedback.dismiss();
      this.rewardNotifications.clear();
      this.messageState.set(
        'Der lokale Spielstand wurde auf den Beispielstart zurückgesetzt. Verdiente Auren sind wieder gesperrt; dein übriger Look bleibt erhalten.',
      );
    });
  }
  private async execute(action: (current: () => boolean) => Promise<void>): Promise<boolean> {
    this.syncOwner();
    if (this.busyState()) return false;
    const operation = ++this.operation;
    const epoch = this.auth?.epoch();
    const current = () => operation === this.operation && epoch === this.auth?.epoch();
    this.busyState.set(true);
    this.errorState.set('');
    this.messageState.set('');
    try {
      await action(current);
      return current();
    } catch (error) {
      if (!current()) return false;
      this.errorState.set(
        this.pendingActivity() && this.accountMode
          ? 'Die Speicherung ist noch unbestätigt. Bitte denselben Eintrag erneut prüfen. Bereits gespeicherte Einträge vergeben keine weiteren XP.' +
            (error instanceof ApiError && error.status >= 400 && error.status < 500 ? ' ' + error.message : '')
          : this.pendingFight && this.accountMode
            ? 'Der Kampf ist noch unbestätigt. Bitte denselben Boss, Modus und dieselbe Taktik erneut starten; die Kampf-ID verhindert doppelte Beute.'
          : error instanceof Error
            ? error.message
            : 'Das hat nicht geklappt. Bitte erneut versuchen.',
      );
      return false;
    } finally {
      if (current()) {
        this.persistenceState.set(
          this.repository.progressPersistence?.() ?? {
            state: 'session',
            message: 'Fortschritt bleibt nur für diese Sitzung erhalten.',
          },
        );
        this.busyState.set(false);
      }
    }
  }
}
