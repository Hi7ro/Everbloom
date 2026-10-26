import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AURA_DESIGNS } from '../domain/aura-designs';
import { AURA_VISUALS } from '../rendering/aura-visuals';
import { ViewportMotion } from './viewport-motion';

let nextAuraId = 0;
/** The equipped aura uses the same painted artwork and portrait coordinates as Pixi. */
@Component({
  selector: 'app-character-aura',
  imports: [ViewportMotion],
  host: { 'aria-hidden': 'true' },
  template: `
    @if (design(); as design) {
      @if (visual(); as visual) {
        <svg viewBox="0 0 240 300" focusable="false" aria-hidden="true"
          [appViewportMotion]="animated()" [class.animated]="animated()"
          [attr.data-aura]="design.id" [attr.data-motion]="visual.motion"
          [style.--aura-color]="resolvedColor()">
          @if (tintMatrix(); as matrix) {
            <defs><filter [id]="id + '-tint'" color-interpolation-filters="sRGB">
              <feColorMatrix type="matrix" [attr.values]="matrix" />
            </filter></defs>
          }
          @if (!failedArtwork()) {
            <g class="painted-aura" [attr.opacity]="visual.opacity" [attr.filter]="tintMatrix() ? 'url(#' + id + '-tint)' : null">
              @for (artwork of [visual.artwork]; track artwork) {
                <image class="aura-sprite" [attr.href]="artwork" [attr.x]="visual.x" [attr.y]="visual.y"
                  [attr.width]="visual.width" [attr.height]="visual.height" preserveAspectRatio="none"
                  (error)="artworkFailed(artwork)" />
              }
            </g>
            <g class="particles" [attr.fill]="resolvedColor()">
              @for (particle of particles; track $index) {
                <g class="particle" [attr.transform]="'translate(' + particle.x + ' ' + particle.y + ')'">
                  <g class="particle-drift" [style.--delay]="particle.delay + 's'">
                    <circle r="1.5" /><circle r=".55" fill="#fff7de" />
                  </g>
                </g>
              }
            </g>
          } @else {
            <defs><radialGradient [id]="id + '-fallback'"><stop offset="0" [attr.stop-color]="resolvedColor()" stop-opacity=".18" /><stop offset="1" [attr.stop-color]="resolvedColor()" stop-opacity="0" /></radialGradient></defs>
            <g class="aura-fallback" data-aura-fallback="true" [attr.fill]="'url(#' + id + '-fallback)'">
              <ellipse cx="120" cy="184" rx="112" ry="105" /><ellipse cx="120" cy="282" rx="83" ry="13" />
            </g>
          }
        </svg>
      }
    }
  `,
  styles: [`
    :host { position:absolute; inset:0; display:block; pointer-events:none; }
    svg { display:block; width:100%; height:100%; overflow:visible; }
    .painted-aura { transform-origin:120px 280px; }
    .aura-sprite { pointer-events:none; }
    .particle-drift { opacity:.64; }
    .animated[data-motion=drift] .painted-aura { animation:aura-drift 9s ease-in-out infinite; }
    .animated[data-motion=rise] .painted-aura { animation:aura-rise 9s ease-in-out infinite; }
    .animated[data-motion=pulse] .aura-sprite { animation:aura-pulse 9s ease-in-out infinite; }
    .animated[data-motion=wings] .painted-aura { animation:aura-wings 9s ease-in-out infinite; }
    .animated .particle-drift { animation:aura-spark 9s ease-in-out var(--delay,0s) infinite; }
    .animated .painted-aura, .animated .aura-sprite, .animated .particle-drift { animation-play-state:var(--motion-play-state,running); }
    @keyframes aura-drift { 0%,100% {transform:translate(-.7px,1.5px)} 50% {transform:translate(.7px,-1.5px)} }
    @keyframes aura-rise { 0%,100% {transform:translateY(0)} 50% {transform:translateY(-2.5px)} }
    @keyframes aura-pulse { 0%,100% {opacity:.94} 50% {opacity:1} }
    @keyframes aura-wings { 0%,100% {transform:scale(1)} 50% {transform:scale(1.012,1.004)} }
    @keyframes aura-spark { 0%,100% {transform:translateY(2px);opacity:.45} 50% {transform:translateY(-3px);opacity:.8} }
    @media(prefers-reduced-motion:reduce) { .animated .painted-aura, .animated .aura-sprite, .animated .particle-drift {animation:none;} }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterAura {
  readonly id = `everbloom-aura-${++nextAuraId}`;
  readonly aura = input('none');
  readonly animated = input(true);
  readonly design = computed(() => AURA_DESIGNS.find(design => design.id === this.aura()) ?? null);
  readonly visual = computed(() => AURA_VISUALS[this.aura()] ?? null);
  readonly tintMatrix = computed(() => {
    const tint = this.visual()?.tint;
    if (tint === undefined) return null;
    const value = typeof tint === 'number' ? tint : parseInt(tint.slice(1), 16);
    return `${(value >> 16 & 255) / 255} 0 0 0 0 0 ${(value >> 8 & 255) / 255} 0 0 0 0 0 ${(value & 255) / 255} 0 0 0 0 0 1 0`;
  });
  readonly failedArtwork = signal(false);
  readonly resolvedColor = computed(() => this.design()?.color ?? '#a78bfa');
  readonly particles = [
    { x: 26, y: 75, delay: -1 }, { x: 211, y: 101, delay: -5 },
    { x: 18, y: 204, delay: -3 }, { x: 220, y: 223, delay: -7 },
    { x: 56, y: 278, delay: -4 }, { x: 188, y: 281, delay: -8 },
  ] as const;

  constructor() { effect(() => { this.visual()?.artwork; this.failedArtwork.set(false); }); }

  artworkFailed(artwork: string): void {
    if (this.visual()?.artwork === artwork) this.failedArtwork.set(true);
  }
}
