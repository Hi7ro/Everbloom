import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { BattleReplay, BattleTactic, createPracticeBattle } from '../../domain/auto-battle';
import { Appearance, GameSnapshot } from '../../domain/models';

/** Playback only: this store has no repository or reward-writing capability. */
@Injectable()
export class BattlePlayback implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly replay = signal<BattleReplay | null>(null);
  readonly appearance = signal<Appearance | null>(null);
  readonly cursor = signal(0);
  readonly playing = signal(false);
  readonly speed = signal<1 | 2>(1);
  readonly complete = computed(() => !!this.replay() && this.cursor() >= this.replay()!.turns.length);
  readonly current = computed(() => this.replay()?.turns[this.cursor() - 1] ?? null);
  readonly health = computed(() => this.current() ?? this.replay()?.initial ?? { heroHp: 0, bossHp: 0 });
  readonly recentTurns = computed(() => this.replay()?.turns.slice(0, this.cursor()).slice(-6).reverse() ?? []);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private destroyed = false;
  private readonly onVisibility = () => { if (this.document.hidden) this.pause(); };

  constructor() { this.document.addEventListener('visibilitychange', this.onVisibility); }

  prepare(snapshot: GameSnapshot, tactic: BattleTactic = 'balanced') {
    this.pause();
    this.replay.set(createPracticeBattle(snapshot, { tactic }));
    this.appearance.set(structuredClone(snapshot.character.appearance));
    this.cursor.set(0);
  }

  play() {
    if (this.destroyed || !this.replay() || this.playing() || this.document.hidden) return;
    if (this.complete()) this.cursor.set(0);
    this.playing.set(true);
    this.schedule();
  }

  pause() {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.playing.set(false);
  }

  step() {
    this.pause();
    if (!this.destroyed && this.replay() && !this.complete()) this.cursor.update(value => value + 1);
  }

  skip() {
    this.pause();
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
      this.cursor.update(value => Math.min(value + 1, this.replay()!.turns.length));
      if (this.complete()) this.pause();
      else this.schedule();
    }, 1250 / this.speed());
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.pause();
    this.document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
