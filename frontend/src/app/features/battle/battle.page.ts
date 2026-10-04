import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BOSS_PHASE_LABELS, BATTLE_TACTICS, BattleTactic } from '../../domain/auto-battle';
import { GameStore } from '../../state/game.store';
import { ProgressFeedback } from '../../state/progress-feedback';
import { BattleArena } from './battle-arena';
import { BattlePlayback } from './battle-playback';

@Component({
  selector: 'app-battle-page',
  imports: [RouterLink, BattleArena],
  providers: [BattlePlayback],
  templateUrl: './battle.page.html',
  styleUrl: './battle.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlePage {
  readonly game = inject(GameStore);
  readonly battle = inject(BattlePlayback);
  readonly feedback = inject(ProgressFeedback);
  readonly phaseLabels = BOSS_PHASE_LABELS;
  readonly tactics = BATTLE_TACTICS;
  readonly selectedTactic = signal<BattleTactic>('balanced');
  readonly resultTitle = computed(() => this.battle.replay()?.outcome === 'victory' ? 'Die Lichtung gehört dir.'
    : this.battle.replay()?.outcome === 'defeat' ? 'Der Wächter hält stand.' : 'Zwei ebenbürtige Kräfte.');
  readonly heroPose = computed(() => {
    if (this.battle.complete()) return this.battle.replay()?.outcome === 'victory' ? 'victory' : this.battle.replay()?.outcome === 'defeat' ? 'defeat' : 'idle';
    if (this.battle.current()?.healing) return 'idle';
    return this.battle.current()?.actor === 'hero' ? 'attack' : this.battle.current() ? 'hit' : 'idle';
  });
  readonly bossPose = computed(() => {
    if (this.battle.complete()) return this.battle.replay()?.outcome === 'victory' ? 'defeat' : this.battle.replay()?.outcome === 'defeat' ? 'victory' : 'idle';
    if (this.battle.current()?.healing) return 'idle';
    return this.battle.current()?.actor === 'boss' ? 'attack' : this.battle.current() ? 'hit' : 'idle';
  });

  constructor() {
    effect(() => {
      const snapshot = this.game.snapshot();
      if (snapshot && !untracked(() => this.battle.replay())) untracked(() => this.battle.prepare(snapshot));
    });
    if (!this.game.snapshot()) void this.game.load();
    else void this.game.refresh();
  }

  newBattle() {
    const snapshot = this.game.snapshot();
    if (snapshot) this.battle.prepare(snapshot, this.selectedTactic());
  }

  chooseTactic(tactic: BattleTactic) {
    if (this.battle.cursor() > 0 || this.battle.playing()) return;
    this.selectedTactic.set(tactic);
    this.newBattle();
  }
}
