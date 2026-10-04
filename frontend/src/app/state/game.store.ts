import { computed, inject, Injectable, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class GameStore {
  private readonly repository = inject(GAME_REPOSITORY);
  private readonly journey = inject(JourneyStore);
  private readonly feedback = inject(ProgressFeedback);
  private readonly today = inject(GAME_DAY_CLOCK);
  private readonly persistenceState = signal<ProgressPersistenceStatus>({ state: 'session', message: null });
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
    this.journey.activeSkillIds().flatMap(id => {
      const skill = this.skills().find(skill => skill.id === id);
      return skill ? [skill] : [];
    }),
  );
  readonly avatarInterest = computed(
    () => this.snapshot()?.activities.find((activity) => activity.xp > 0)?.skillId ??
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
  readonly ownedAuras = computed(() => AURA_REWARDS.filter(aura =>
    this.snapshot()?.unlockedAuras.includes(aura.id),
  ));
  canEquipAura(id: string): boolean {
    const snapshot = this.snapshot();
    return !!snapshot && hasAuraAccess(snapshot, id);
  }
  readonly todayMinutes = computed(() => this.snapshot()?.activities
    .filter(activity => activity.dayKey === this.snapshot()?.dayKey)
    .reduce((sum, activity) => sum + activity.minutes, 0) ?? 0);
  readonly totalMinutes = computed(
    () => this.snapshot()?.activities.reduce((sum, a) => sum + a.minutes, 0) ?? 0,
  );
  async load() {
    await this.execute(async () => {
      this.snapshotState.set(await this.repository.load());
    });
  }
  async refresh() {
    // Resume after midnight without resetting rewards while the app stays open.
    if (!this.snapshot() || this.busy()) return;
    let shouldRefresh = true;
    try {
      shouldRefresh = this.snapshot()!.dayKey !== this.today() || this.persistence().state === 'clock';
    } catch {
      // The repository preserves the last valid day and reports a clock warning.
    }
    if (shouldRefresh) await this.load();
  }
  async record(skillId: string, minutes: number): Promise<boolean> {
    this.feedback.prepareAudio();
    return this.execute(async () => {
      if (!this.snapshot()) throw new Error('Bitte zuerst deinen Charakter laden.');
      const before = await this.repository.load();
      this.snapshotState.set(before);
      const result = await this.repository.record({
        requestId: crypto.randomUUID(),
        skillId,
        minutes,
      });
      this.snapshotState.set(result.snapshot);
      const r = result.reward;
      if (!r.duplicate) this.feedback.celebrate(detectMilestones(before, result.snapshot));
      this.messageState.set(
        r.activityXp > 0
          ? 'Aktivität erfasst. +' +
              (r.activityXp + r.questXp) +
              ' XP' +
              (r.questXp ? ', davon ' + r.questXp + ' Quest-XP' : '') +
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
  async updateCharacter(profile: CharacterProfile): Promise<boolean> {
    return this.execute(async () => {
      const result = await this.repository.updateCharacter(profile);
      this.snapshotState.set(result.snapshot);
      this.messageState.set(
        result.persisted
          ? 'Dein Charakter ist gespeichert und bleibt auf diesem Gerät erhalten.'
          : 'Dein Charakter wurde übernommen. Dein Browser blockiert die Speicherung; nach Neuladen geht diese Änderung verloren.',
      );
    });
  }
  async reset() {
    return this.execute(async () => {
      this.snapshotState.set(await this.repository.resetDemo());
      this.feedback.dismiss();
      this.messageState.set(
        'Der lokale Spielstand wurde auf den Beispielstart zurückgesetzt. Verdiente Auren sind wieder gesperrt; dein übriger Look bleibt erhalten.',
      );
    });
  }
  private async execute(action: () => Promise<void>): Promise<boolean> {
    if (this.busyState()) return false;
    this.busyState.set(true);
    this.errorState.set('');
    this.messageState.set('');
    try {
      await action();
      return true;
    } catch (error) {
      this.errorState.set(
        error instanceof Error ? error.message : 'Das hat nicht geklappt. Bitte erneut versuchen.',
      );
      return false;
    } finally {
      this.persistenceState.set(this.repository.progressPersistence?.() ?? { state: 'session', message: 'Fortschritt bleibt nur für diese Sitzung erhalten.' });
      this.busyState.set(false);
    }
  }
}
