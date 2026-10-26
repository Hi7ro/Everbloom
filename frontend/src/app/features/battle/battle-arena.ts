import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, InjectionToken, input, signal, viewChild } from '@angular/core';
import { BossDifficulty, BossId, bossEncounter } from '../../domain/boss-catalog';
import { bossVisual } from '../../rendering/boss-visuals';
import { Appearance } from '../../domain/models';
import { CombatVisualProfile } from '../../domain/combat-visual-profile';
import { CharacterPortrait } from '../../shared/character-portrait';
import type { BattleStage, BattleStageOptions } from '../../rendering/battle-stage';

type Pose = 'idle' | 'attack' | 'hit' | 'victory' | 'defeat';
type StageFactory = (host: HTMLElement, options: BattleStageOptions) => Promise<BattleStage>;
interface VisibleTurn { label?: string; index: number; actor: 'hero' | 'boss'; damage: number; healing: number; critical: boolean; }
export const BATTLE_STAGE_FACTORY = new InjectionToken<StageFactory>('Battle stage', {
  providedIn: 'root',
  factory: () => async (host, options) => (await import('../../rendering/battle-stage')).createBattleStage(host, options),
});

@Component({
  selector: 'app-battle-arena',
  imports: [CharacterPortrait],
  template: `
    <div class="scene" role="img" [attr.aria-label]="sceneDescription()" [style.background]="background()">
      @if (!ready()) {
        <div class="fallback" aria-hidden="true">
          <app-character-portrait [appearance]="appearance()" [animated]="false" />
          <img [src]="visual().image" [class.framed]="visual().framed" alt="" />
        </div>
      }
      <div #canvasHost class="canvas-host" aria-hidden="true"></div>
      <span class="scene-label">{{ visual().arenaName }}@if (difficulty() !== 'normal') {<small>{{ visual().formName }}</small>}</span>
      @if (visualProfile(); as profile) { <span class="ability-label">{{ profile.abilityName }}</span> }
      @for (cue of visibleCues(); track cue.index) {
        <div class="combat-cue" aria-hidden="true" [class.boss-cue]="cue.actor === 'boss'" [class.animate-cue]="motion()">
          <span>{{ cue.actor === 'boss' ? 'GEGNER' : 'DEINE FÄHIGKEIT' }}</span><strong>{{ cue.label }}</strong>
        </div>
      }
      @for (hit of visibleHits(); track hit.key) {
        <span class="damage-pop" aria-hidden="true" [class.at-hero]="hit.healing ? hit.actor === 'hero' : hit.actor === 'boss'"
          [class.critical]="hit.critical" [class.healing]="hit.healing > 0" [class.animated]="motion()">
          @if (hit.critical) { <small>KRITISCH</small> }
          {{ hit.healing ? '+' + hit.healing : '−' + hit.damage }}
        </span>
      }
      @if (failed()) { <span class="fallback-note">Statische Ansicht · der Kampf bleibt spielbar</span> }
    </div>
  `,
  styles: [`
    :host { display:block; }
    .scene { position:relative; width:100%; max-width:100%; aspect-ratio: 1.65; min-height:220px; max-height:460px; overflow:hidden;
      background:radial-gradient(ellipse at 50% 0%,#47756050,transparent 62%),linear-gradient(#0d211c,#20352b 80%,#18241c); }
    .canvas-host { position:absolute; inset:0; }
    .fallback { position:absolute; inset:8% 4% 2%; display:flex; align-items:end; justify-content:space-between; }
    app-character-portrait { width:35%; aspect-ratio:4 / 5; height:auto; }
    img { width:58%; height:auto; max-height:100%; object-fit:contain; object-position:center bottom; }
    img.framed { transform:translateY(6%) scale(1.15); transform-origin:center bottom; }
    .scene-label { position:absolute; top:18px; left:20px; color:#acc3ad; font-size:10px; letter-spacing:2px; pointer-events:none; }
    .scene-label small { display:block; margin-top:5px; color:#e8dcb4; font-size:10px; letter-spacing:.07em; }
    .ability-label { position:absolute; bottom:12px; left:16px; border:1px solid #c1d0b42e; border-radius:20px; padding:5px 9px; background:#102016b8; color:#e4e5cd; font-size:10px; pointer-events:none; }
    .combat-cue { position:absolute; left:50%; bottom:38px; transform:translateX(-50%); width:max-content; max-width:88%;
      display:grid; text-align:center; padding:6px 18px; border:1px solid #a6dec650; border-radius:8px;
      background:linear-gradient(90deg,#09231dc9,#163f34ed,#09231dc9); color:#daf5df; pointer-events:none; }
    .combat-cue span { font-size:8px; letter-spacing:.14em; } .combat-cue strong { font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .combat-cue.boss-cue { color:#ffe3c4; border-color:#e6b17170; background:linear-gradient(90deg,#271914d9,#503324ed,#271914d9); }
    .combat-cue.animate-cue { animation:cue-arrive .22s ease-out; }
    @keyframes cue-arrive { from { opacity:0; transform:translate(-50%,5px); } to { opacity:1; transform:translate(-50%,0); } }
    @media(prefers-reduced-motion:reduce) { .combat-cue.animate-cue { animation:none; } }
    .damage-pop { position:absolute; left:73%; top:48%; transform:translate(-50%,-50%); font:800 27px system-ui,sans-serif; color:#fff1c7; text-shadow:0 2px 2px #121416,0 0 8px #121416; pointer-events:none; }
    .damage-pop.at-hero { left:27%; top:57%; color:#f5c0b1; }
    .damage-pop.critical { color:#ffdc7f; font-size:33px; } .damage-pop.healing { color:#a3eac2; }
    .damage-pop small { display:block; text-align:center; font:700 8px system-ui; letter-spacing:.16em; }
    .damage-pop.animated { animation:damage-rise 1s both; }
    @keyframes damage-rise { 0%,24% { opacity:0; transform:translate(-50%,4px) scale(.8); } 38% { opacity:1; transform:translate(-50%,-50%) scale(1.12); } 65% { opacity:1; } 100% { opacity:0; transform:translate(-50%,-48px) scale(1); } }
    @media(prefers-reduced-motion:reduce) { .damage-pop.animated { animation:none; } }
    .fallback-note { position:absolute; bottom:8px; left:0; width:100%; text-align:center; font-size:11px; color:#c6d4c6; }
    @media(min-width:700px) { .scene { min-height:360px; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattleArena {
  readonly appearance = input.required<Appearance>();
  readonly motion = input(true);
  readonly bossId = input<BossId>('mosswarden');
  readonly difficulty = input<BossDifficulty>('normal');
  readonly visualProfile = input<CombatVisualProfile>();
  readonly bossAbility = input<string>();
  readonly turn = input<VisibleTurn | null>(null);
  readonly visibleCues = computed(() => { const turn = this.turn(); return turn?.label ? [turn] : []; });
  readonly visibleHits = computed(() => {
    const turn = this.turn();
    if (!turn) return [];
    // A draining attack damages the target and heals the acting boss at once.
    return [
      ...(turn.damage > 0 ? [{ ...turn, healing: 0, key: `${turn.index}-damage` }] : []),
      ...(turn.healing > 0 ? [{ ...turn, damage: 0, critical: false, key: `${turn.index}-heal` }] : []),
    ];
  });
  readonly visual = computed(() => bossVisual(this.bossId(), this.difficulty()));
  readonly background = computed(() => `linear-gradient(${this.visual().backdrop.join(',')})`);
  readonly sceneDescription = computed(() => `Dein Charakter und ${bossEncounter(this.bossId()).name} ${this.difficulty() === 'normal' ? '' : 'in der Form ' + this.visual().formName + ' '}stehen sich ${this.visual().sceneDescription} gegenüber.`);
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
      const bossId = this.bossId();
      const difficulty = this.difficulty();
      const host = this.host()?.nativeElement;
      if (!host) return;
      const controller = new AbortController();
      let current: BattleStage | undefined;
      this.ready.set(false);
      this.failed.set(false);
      // Motion is synchronized by the separate effect below, without rebuilding textures.
      void this.factory(host, { appearance, bossId, difficulty, motion: false, signal: controller.signal }).then(stage => {
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
      const profile = this.visualProfile();
      if (profile) stage?.setVisualProfile(profile);
      stage?.setBossAbility(this.bossAbility());
      stage?.setPose('hero', this.heroPose());
      stage?.setPose('boss', this.bossPose());
      stage?.setTurn(this.turn());
    });
  }
}
