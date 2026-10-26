import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BOSS_PHASE_LABELS, BATTLE_TACTICS, BattleTactic } from '../../domain/auto-battle';
import { BOSS_CATALOG, BOSS_DIFFICULTIES, BossDifficulty, BossId, bossEncounter, bossEncounterId, bossRequiresPlus, FREE_BOSS_MAX_LEVEL, discoveredBosses, isBossDiscovered } from '../../domain/boss-catalog';
import { BOSS_LOOT_RARITY_LABELS, bossFirstClearReward, resolveBossCosmetic } from '../../domain/boss-loot';
import { GameSnapshot } from '../../domain/models';
import { BossFightResult } from '../../domain/boss-fight';
import { deriveCombatVisualProfile } from '../../domain/combat-visual-profile';
import { BOSS_VISUALS } from '../../rendering/boss-visuals';
import { MembershipStore } from '../../state/membership.store';
import { GameStore } from '../../state/game.store';
import { ProgressFeedback } from '../../state/progress-feedback';
import { BossLootArt } from '../../shared/boss-loot-art';
import { BattleArena } from './battle-arena';
import { BattlePlayback } from './battle-playback';
import { DemoTourStore } from '../../state/demo-tour.store';
import { RewardNotifications } from '../../state/reward-notifications';

@Component({
  selector: 'app-battle-page',
  imports: [RouterLink, BattleArena, BossLootArt],
  providers: [BattlePlayback],
  templateUrl: './battle.page.html',
  styleUrl: './battle.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlePage {
  readonly game = inject(GameStore);
  readonly membership = this.game.accountMode ? inject(MembershipStore) : null;
  readonly plusLocked = computed(() => this.game.accountMode && this.encounter().futurePlus && !this.membership?.advancedBosses());
  readonly playbackLocked = computed(() => this.plusLocked() && !this.fightResult());
  readonly freeBossMaxLevel = FREE_BOSS_MAX_LEVEL;
  readonly requiresPlus = bossRequiresPlus;
  readonly battle = inject(BattlePlayback);
  readonly feedback = inject(ProgressFeedback);
  readonly tour = this.game.accountMode ? null : inject(DemoTourStore);
  private readonly rewardNotifications = inject(RewardNotifications);
  private readonly destroyRef = inject(DestroyRef);
  readonly tactics = BATTLE_TACTICS;
  private readonly beforeFight = signal<GameSnapshot | null>(null);
  // The server has already committed the result. Reveal its discoveries only when
  // the player reaches the visible result, so the next boss never spoils this fight.
  readonly presentedSnapshot = computed(() => this.fightResult() && !this.battle.complete()
    ? this.beforeFight() ?? this.game.snapshot() : this.game.snapshot());
  readonly bosses = computed(() => discoveredBosses(this.presentedSnapshot() ?? {}));
  readonly difficulties = BOSS_DIFFICULTIES;
  readonly totalBosses = BOSS_CATALOG.length;
  readonly visuals = BOSS_VISUALS;
  readonly rarityLabels = BOSS_LOOT_RARITY_LABELS;
  readonly slotLabels = { hair: 'Frisur', outfit: 'Rüstungsset', aura: 'Aura' };
  readonly selectedTactic = signal<BattleTactic>('balanced');
  readonly visualProfile = computed(() => {
    const snapshot = this.game.snapshot();
    return snapshot ? deriveCombatVisualProfile(snapshot) : undefined;
  });
  readonly selectedBoss = signal<BossId>('mosswarden');
  readonly selectedDifficulty = signal<BossDifficulty>('normal');
  readonly guideOpen = signal(false);
  readonly fightResult = signal<BossFightResult | null>(null);
  readonly encounter = computed(() => bossEncounter(this.selectedBoss(), this.selectedDifficulty()));
  readonly phaseName = computed(() => {
    const phase = this.battle.current()?.bossPhase ?? 'awakening';
    return phase === 'defeated' ? BOSS_PHASE_LABELS.defeated : this.encounter().phaseNames[phase];
  });
  readonly chargeCue = computed(() => {
    if (this.battle.complete()) return null;
    const turns = this.battle.replay()?.turns ?? [];
    // Keep a telegraph visible through the hero's intervening turn. Playback only:
    // the next boss action, or battle completion, clears it without simulating damage.
    for (let index = this.battle.cursor() - 1; index >= 0; index--) {
      const turn = turns[index];
      if (turn?.actor !== 'boss') continue;
      return turn.abilityId && ['ember-charge', 'dusk-guard', 'star-seal', 'frost-charge', 'solar-charge', 'bloodmoon-seal', 'gravity-well', 'prism-charge', 'imperial-charge'].includes(turn.abilityId)
        ? turn.label : null;
    }
    return null;
  });
  readonly reward = computed(() => resolveBossCosmetic(
    bossFirstClearReward(this.selectedBoss(), this.selectedDifficulty()).id,
    this.presentedSnapshot()?.character.appearance.presentation ?? 'male')!);
  readonly earnedReward = computed(() => {
    const result = this.fightResult();
    return result?.reward ? resolveBossCosmetic(result.reward.id, result.snapshot.character.appearance.presentation) : null;
  });
  readonly rewardOwned = computed(() => this.presentedSnapshot()?.bossProgress?.unlockedCosmetics.includes(this.reward().id) ?? false);
  readonly cleared = computed(() => this.presentedSnapshot()?.bossProgress?.clearedEncounterIds.includes(bossEncounterId(this.selectedBoss(), this.selectedDifficulty())) ?? false);
  readonly levelLocked = computed(() => this.game.level().level < this.encounter().minimumLevel);
  readonly canChallenge = computed(() => this.game.accountMode && this.game.profileIsSaved() && !this.levelLocked()
    && !this.plusLocked() && isBossDiscovered(this.game.snapshot() ?? {}, this.selectedBoss()));
  readonly selectionDisabled = computed(() => this.game.busy() || this.battle.playing());
  readonly difficultyName = computed(() => this.difficulties.find(item => item.id === this.selectedDifficulty())!.name);
  readonly resultTitle = computed(() => this.battle.replay()?.outcome === 'victory' ? `${this.encounter().name} ist besiegt.`
    : this.battle.replay()?.outcome === 'defeat' ? `${this.encounter().name} hält stand.` : 'Zwei ebenbürtige Kräfte.');
  readonly heroPose = computed(() => {
    if (this.battle.complete()) return this.battle.replay()?.outcome === 'victory' ? 'victory' : this.battle.replay()?.outcome === 'defeat' ? 'defeat' : 'idle';
    const turn = this.battle.current();
    if (turn && !turn.damage) return 'idle';
    return this.battle.current()?.actor === 'hero' ? 'attack' : this.battle.current() ? 'hit' : 'idle';
  });
  readonly bossPose = computed(() => {
    if (this.battle.complete()) return this.battle.replay()?.outcome === 'victory' ? 'defeat' : this.battle.replay()?.outcome === 'defeat' ? 'victory' : 'idle';
    const turn = this.battle.current();
    if (turn?.healing && !turn.damage) return 'idle';
    return this.battle.current()?.actor === 'boss' ? 'attack' : this.battle.current() ? 'hit' : 'idle';
  });
  private owner: string | null = null;

  constructor() {
    void this.membership?.load();
    effect(() => { if (this.playbackLocked()) this.battle.pause(); });
    effect(() => {
      const result = this.fightResult();
      const complete = this.battle.complete();
      const owner = this.game.snapshot()?.character.id;
      if (complete && result && result.snapshot.character.id === owner)
        untracked(() => { this.beforeFight.set(null); this.rewardNotifications.earnedBoss(result); });
    });
    effect(() => {
      if (!this.game.accountMode && this.battle.complete()) untracked(() => this.tour?.finishBattle());
    });
    effect(() => {
      const snapshot = this.game.snapshot();
      untracked(() => {
        if (!snapshot) { this.owner = null; this.guideOpen.set(false); this.fightResult.set(null); this.battle.reset(); return; }
        if (snapshot.character.id !== this.owner) {
          this.owner = snapshot.character.id;
          this.guideOpen.set(false);
          this.fightResult.set(null);
          this.battle.reset();
        }
        if (!isBossDiscovered(snapshot, this.selectedBoss())) this.selectedBoss.set('mosswarden');
        if (!this.battle.replay()) this.battle.prepare(snapshot, this.selectedTactic(), this.selectedBoss(), this.selectedDifficulty());
      });
    });
    if (!this.game.snapshot()) void this.game.load();
    else void this.game.refresh();
  }

  newBattle() {
    if (this.game.busy()) return;
    const snapshot = this.game.snapshot();
    if (!snapshot) return;
    this.fightResult.set(null);
    this.battle.prepare(snapshot, this.selectedTactic(), this.selectedBoss(), this.selectedDifficulty());
  }

  chooseBoss(bossId: BossId) {
    if (this.selectionDisabled() || !isBossDiscovered(this.game.snapshot() ?? {}, bossId)) return;
    if (this.selectedBoss() !== bossId) this.guideOpen.set(false);
    this.selectedBoss.set(bossId);
    this.newBattle();
  }

  chooseDifficulty(difficulty: BossDifficulty) {
    if (this.selectionDisabled()) return;
    this.selectedDifficulty.set(difficulty);
    this.newBattle();
  }

  chooseTactic(tactic: BattleTactic) {
    if (this.selectionDisabled() || this.battle.cursor() > 0 || this.fightResult()) return;
    this.selectedTactic.set(tactic);
    this.newBattle();
  }

  async challenge() {
    if (!this.canChallenge() || this.selectionDisabled()) return;
    this.feedback.prepareAudio();
    this.battle.prepareAudio();
    this.battle.pause();
    this.beforeFight.set(this.game.snapshot());
    const result = await this.game.fightBoss(this.selectedBoss(), this.selectedDifficulty(), this.selectedTactic());
    if (!result || this.destroyRef.destroyed) return;
    this.fightResult.set(result);
    this.battle.loadReplay(result.replay, result.snapshot.character.appearance, deriveCombatVisualProfile(result.snapshot));
    this.battle.play();
  }

  playPreview() { if (!this.playbackLocked() && !this.game.busy()) this.battle.play(); }
  skipPreview() { if (!this.playbackLocked() && !this.game.busy()) this.battle.skip(); }
  stepPreview() { if (!this.playbackLocked() && !this.game.busy()) this.battle.step(); }

  minimumLevel(baseLevel: number, offset: number) { return baseLevel + offset; }

  toggleGuide(event: Event): void { this.guideOpen.set((event.target as HTMLDetailsElement).open); }
}
