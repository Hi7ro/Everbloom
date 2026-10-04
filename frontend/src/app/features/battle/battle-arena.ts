import { ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, InjectionToken, input, signal, viewChild } from '@angular/core';
import { Appearance } from '../../domain/models';
import { CharacterPortrait } from '../../shared/character-portrait';
import type { BattleStage } from '../../rendering/battle-stage';

type Pose = 'idle' | 'attack' | 'hit' | 'victory' | 'defeat';
type StageFactory = (host: HTMLElement, options: { appearance: Appearance; motion: boolean; signal?: AbortSignal }) => Promise<BattleStage>;
export const BATTLE_STAGE_FACTORY = new InjectionToken<StageFactory>('Battle stage', {
  providedIn: 'root',
  factory: () => async (host, options) => (await import('../../rendering/battle-stage')).createBattleStage(host, options),
});

@Component({
  selector: 'app-battle-arena',
  imports: [CharacterPortrait],
  template: `
    <div class="scene" role="img" aria-label="Dein Charakter und der Mooswächter stehen sich auf einer Waldlichtung gegenüber.">
      <div class="fallback" [class.hidden]="ready()" aria-hidden="true">
        <app-character-portrait [appearance]="appearance()" [animated]="false" />
        <img src="/art/bosses/mosswarden-v1.png" alt="" />
      </div>
      <div #canvasHost class="canvas-host" aria-hidden="true"></div>
      <span class="scene-label">DIE MOOSLICHTUNG</span>
      @if (failed()) { <span class="fallback-note">Statische Ansicht · der Kampf bleibt spielbar</span> }
    </div>
  `,
  styles: [`
    :host { display:block; }
    .scene { position:relative; width:100%; max-width:100%; aspect-ratio: 1.65; min-height:220px; max-height:460px; overflow:hidden;
      background:radial-gradient(ellipse at 50% 0%,#47756050,transparent 62%),linear-gradient(#0d211c,#20352b 80%,#18241c); }
    .canvas-host { position:absolute; inset:0; }
    .fallback { position:absolute; inset:8% 4% 2%; display:flex; align-items:end; justify-content:space-between; }
    .fallback.hidden { visibility:hidden; }
    app-character-portrait { width:40%; height:100%; }
    img { width:47%; height:100%; object-fit:contain; }
    .scene-label { position:absolute; top:18px; left:20px; color:#acc3ad; font-size:10px; letter-spacing:2px; pointer-events:none; }
    .fallback-note { position:absolute; bottom:8px; left:0; width:100%; text-align:center; font-size:11px; color:#c6d4c6; }
    @media(min-width:700px) { .scene { min-height:360px; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattleArena {
  readonly appearance = input.required<Appearance>();
  readonly motion = input(true);
  readonly heroPose = input<Pose>('idle');
  readonly bossPose = input<Pose>('idle');
  readonly ready = signal(false);
  readonly failed = signal(false);
  private readonly host = viewChild<ElementRef<HTMLDivElement>>('canvasHost');
  private readonly factory = inject(BATTLE_STAGE_FACTORY);
  private readonly stage = signal<BattleStage | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    effect(onCleanup => {
      const appearance = this.appearance();
      const host = this.host()?.nativeElement;
      if (!host) return;
      const controller = new AbortController();
      let current: BattleStage | undefined;
      this.ready.set(false);
      this.failed.set(false);
      // Motion is synchronized by the separate effect below, without rebuilding textures.
      void this.factory(host, { appearance, motion: false, signal: controller.signal }).then(stage => {
        if (controller.signal.aborted || destroyRef.destroyed) { stage.destroy(); return; }
        current = stage;
        this.stage.set(stage);
        this.ready.set(true);
      }).catch(() => { if (!controller.signal.aborted && !destroyRef.destroyed) this.failed.set(true); });
      onCleanup(() => { controller.abort(); current?.destroy(); this.stage.set(null); });
    });
    effect(() => {
      const stage = this.stage();
      stage?.setMotion(this.motion());
      stage?.setPose('hero', this.heroPose());
      stage?.setPose('boss', this.bossPose());
    });
  }
}
