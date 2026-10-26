import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { BattleReplay, BattleTactic, createPracticeBattle } from '../../domain/auto-battle';
import { BossDifficulty, BossId } from '../../domain/boss-catalog';
import { Appearance, GameSnapshot } from '../../domain/models';
import { CombatVisualProfile, deriveCombatVisualProfile } from '../../domain/combat-visual-profile';
import { BattleAudio } from '../../shared/battle-audio';
import { ProgressFeedback } from '../../state/progress-feedback';

export const FINAL_TURN_PRESENTATION_MS = 600;

/** Playback only: this store has no repository or reward-writing capability. */
@Injectable()
export class BattlePlayback implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly audio = inject(BattleAudio);
  private readonly feedback = inject(ProgressFeedback);
  private visualProfile: CombatVisualProfile | null = null;
  readonly replay = signal<BattleReplay | null>(null);
  readonly appearance = signal<Appearance | null>(null);
  readonly cursor = signal(0);
  readonly playing = signal(false);
  readonly settling = signal(false);
  private readonly finalTurnPending = signal(false);
  readonly speed = signal<1 | 2>(1);
  readonly complete = computed(() => !!this.replay() && !this.finalTurnPending() && this.cursor() >= this.replay()!.turns.length);
  readonly current = computed(() => this.replay()?.turns[this.cursor() - 1] ?? null);
  readonly health = computed(() => this.current() ?? this.replay()?.initial ?? { heroHp: 0, bossHp: 0 });
  readonly recentTurns = computed(() => this.replay()?.turns.slice(0, this.cursor()).slice(-6).reverse() ?? []);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private destroyed = false;
  private readonly onVisibility = () => { if (this.document.hidden) this.pause(); };

  constructor() {
    this.document.addEventListener('visibilitychange', this.onVisibility);
    effect(() => { if (!this.feedback.soundEnabled()) this.audio.stop(); });
  }

  prepare(snapshot: GameSnapshot, tactic: BattleTactic = 'balanced', bossId?: BossId, difficulty: BossDifficulty = 'normal') {
    this.loadReplay(createPracticeBattle(snapshot, { tactic, bossId, difficulty }), snapshot.character.appearance,
      deriveCombatVisualProfile(snapshot));
  }

  /** Server results are already committed. Replaying this copy never grants rewards. */
  loadReplay(replay: BattleReplay, appearance: Appearance, profile?: CombatVisualProfile) {
    this.pause();
    this.replay.set(structuredClone(replay));
    this.appearance.set(structuredClone(appearance));
    this.visualProfile = profile ? structuredClone(profile) : null;
    this.cursor.set(0);
    this.settling.set(false);
    this.finalTurnPending.set(false);
  }

  reset() {
    this.pause();
    this.replay.set(null);
    this.appearance.set(null);
    this.visualProfile = null;
    this.cursor.set(0);
    this.settling.set(false);
    this.finalTurnPending.set(false);
  }

  play() {
    if (this.destroyed || !this.replay() || this.playing() || this.document.hidden) return;
    this.prepareAudio();
    if (this.complete()) this.cursor.set(0);
    this.playing.set(true);
    if (this.finalTurnPending()) { this.settling.set(true); this.scheduleFinish(); }
    else this.schedule();
  }

  pause() {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.playing.set(false);
    this.settling.set(false);
    this.audio.stop();
  }

  prepareAudio() {
    if (!this.destroyed && !this.document.hidden && this.feedback.soundEnabled()) this.audio.prepare();
  }

  step() {
    this.pause();
    if (!this.destroyed && !this.document.hidden && this.replay() && !this.complete()) {
      // Advancing once more from the final held frame explicitly opens the result.
      if (this.finalTurnPending()) { this.finalTurnPending.set(false); return; }
      this.prepareAudio();
      this.advance();
    }
  }

  skip() {
    this.pause();
    this.settling.set(false);
    this.finalTurnPending.set(false);
    if (this.replay()) this.cursor.set(this.replay()!.turns.length);
  }

  toggleSpeed() {
    this.speed.update(value => value === 1 ? 2 : 1);
    if (this.playing()) { this.pause(); this.play(); }
  }

  private schedule() {
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (!this.playing() || this.destroyed) return;
      this.advance();
      if (!this.finalTurnPending()) this.schedule();
    }, 1250 / this.speed());
  }

  private advance() {
    this.cursor.update(value => Math.min(value + 1, this.replay()!.turns.length));
    const turn = this.current();
    if (turn && this.feedback.soundEnabled()) {
      this.audio.playTurn(turn, this.visualProfile?.style ?? 'strength', this.replay()!.boss.id, this.speed());
    }
    if (this.cursor() >= this.replay()!.turns.length) {
      this.settling.set(true);
      this.finalTurnPending.set(true);
      this.scheduleFinish();
    }
  }

  private scheduleFinish() {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.destroyed || !this.finalTurnPending()) return;
      this.settling.set(false);
      this.finalTurnPending.set(false);
      this.playing.set(false);
    }, FINAL_TURN_PRESENTATION_MS);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.pause();
    this.document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
