import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { resolveCharacterIllustration } from '../domain/character-illustrations';
import { resolveAvatarPresence } from '../domain/avatar-presence';
import { portraitLayers, REGION_ALPHA, SpriteRegion } from '../domain/character-rig';
import { Appearance } from '../domain/models';
import { CharacterAura } from './character-aura';
import { ViewportMotion } from './viewport-motion';

let nextPortraitId = 0;

@Component({
  selector: 'app-character-portrait',
  imports: [CharacterAura, ViewportMotion],
  template: `
    <app-character-aura [aura]="appearance().aura" [animated]="animated()" />
    <svg class="illustrated-portrait" viewBox="0 0 240 300" role="img" [appViewportMotion]="animated()"
      [attr.aria-label]="description()" [class.animated]="animated()"
      [attr.data-stage]="presence().stage" data-artwork="original"
      [attr.data-illustration]="illustration().id" [attr.data-gesture]="presence().gesture"
      data-renderer="layered"
      [style.--gesture-duration]="presence().gestureSeconds + 's'"
      [style.--gesture-tilt]="presence().tiltDegrees + 'deg'"
      [style.--breath-duration]="presence().breathSeconds + 's'">
      <defs>
        @for (region of regions(); track region) {
          <filter [id]="id + '-' + region" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
            <feColorMatrix type="matrix" [attr.values]="'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ' + alpha[region]" />
            <feMorphology operator="dilate" radius="0.7" />
          </filter>
        }
          @for (layer of layers(); track layer.key) {
            @if (layer.sourceClip; as boundary) {
              <clipPath [id]="id + '-source-' + layer.key" clipPathUnits="userSpaceOnUse">
                <polygon [attr.points]="clipPoints(boundary)" />
              </clipPath>
            }
            <clipPath [id]="id + '-clip-' + layer.key">
              <rect [attr.x]="layer.clipX" y="0" [attr.width]="layer.clipWidth" [attr.height]="layer.height" />
            </clipPath>
            @if (layer.mask || layer.eyeRegions) {
            <mask [id]="id + '-mask-' + layer.key" maskUnits="userSpaceOnUse" x="0" y="0"
              [attr.width]="layer.width" [attr.height]="layer.height" style="mask-type:alpha">
              @if (layer.eyeRegions; as eyes) {
                @for (eye of eyes; track $index) {
                  <ellipse [attr.cx]="eye.cx" [attr.cy]="eye.cy" [attr.rx]="eye.rx" [attr.ry]="eye.ry" fill="white" />
                }
              } @else {
                <image [attr.href]="layer.mask" [attr.width]="layer.width" [attr.height]="layer.height"
                  preserveAspectRatio="none" [attr.filter]="'url(#' + id + '-' + layer.region + ')'" />
              }
            </mask>
            }
            @if (layer.tint; as tint) {
              <filter [id]="id + '-tint-' + layer.key" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncR type="table" [attr.tableValues]="tintTable(tint, 0, layer.region)" />
                  <feFuncG type="table" [attr.tableValues]="tintTable(tint, 1, layer.region)" />
                  <feFuncB type="table" [attr.tableValues]="tintTable(tint, 2, layer.region)" />
                </feComponentTransfer>
              </filter>
            }
          }
      </defs>
      <ellipse cx="120" cy="284" rx="56" ry="6" fill="#06150f" opacity=".3" />
        <g class="whole-figure">
          <g class="rig-breath">
          @for (layer of layers(); track layer.key) {
            <g [attr.data-layer]="layer.key" [attr.transform]="layer.transform">
              <g [attr.clip-path]="'url(#' + id + '-clip-' + layer.key + ')'">
                <g [attr.clip-path]="layer.sourceClip ? 'url(#' + id + '-source-' + layer.key + ')' : null">
                  <image [attr.href]="layer.image" [attr.width]="layer.width" [attr.height]="layer.height"
                    [attr.mask]="layer.mask || layer.eyeRegions ? 'url(#' + id + '-mask-' + layer.key + ')' : null"
                    [attr.filter]="layer.tint ? 'url(#' + id + '-tint-' + layer.key + ')' : null" />
                </g>
              </g>
            </g>
          }
          </g>
        </g>
    </svg>
  `,
  styles: [`
    :host { display:block; min-width:0; position:relative; isolation:isolate; }
    svg { position:relative; display:block; width:100%; height:100%; overflow:visible; }
    .illustrated-portrait { z-index:1; }
    app-character-aura { z-index:0; }
    .whole-figure, .rig-breath { transform-origin:120px 280px; }
    .animated .whole-figure { animation:portrait-greet var(--gesture-duration,22s) ease-in-out infinite; }
    .animated[data-gesture=stretch] .whole-figure { animation-name:portrait-stretch; }
    .animated[data-gesture=breathe] .whole-figure { animation-name:portrait-settle; }
    .animated[data-gesture=focus] .whole-figure { animation-name:portrait-focus; }
    .animated .rig-breath { animation:body-breath var(--breath-duration,6s) ease-in-out infinite; }
    .animated .whole-figure, .animated .rig-breath { animation-play-state:var(--motion-play-state,running); }
    @keyframes body-breath { 0%,100% {transform:scale(1)} 50% {transform:scale(1.014,1.024)} }
    @keyframes portrait-stretch {
      0%,68%,100% { transform:rotate(0) scale(1); }
      77% { transform:rotate(calc(var(--gesture-tilt,2deg) * -.35)) scale(1.022,1.012); }
      86% { transform:rotate(calc(var(--gesture-tilt,2deg) * .35)) scale(.996,1.018); }
    }
    @keyframes portrait-settle {
      0%,64%,100% { transform:scale(1); }
      78% { transform:scale(1.008,1.016); }
      89% { transform:scale(1.006,.997); }
    }
    @keyframes portrait-focus {
      0%,70%,100% { transform:rotate(0) scale(1); }
      79%,84% { transform:rotate(calc(var(--gesture-tilt,2deg) * .25)) scale(.996,.994); }
      90% { transform:rotate(calc(var(--gesture-tilt,2deg) * -.12)) scale(1); }
    }
    @keyframes portrait-greet {
      0%,70%,100% { transform:rotate(0) scale(1); }
      80% { transform:rotate(calc(var(--gesture-tilt,2deg) * -.4)) scale(1.006,1.01); }
      88% { transform:rotate(calc(var(--gesture-tilt,2deg) * .25)) scale(1); }
    }
    @media(prefers-reduced-motion:reduce) { .animated .whole-figure,.animated .rig-breath {animation:none;} }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterPortrait {
  readonly appearance = input.required<Appearance>();
  readonly level = input(1);
  readonly interest = input('adventurer');
  readonly animated = input(true);
  readonly id = `everbloom-portrait-${++nextPortraitId}`;
  readonly illustration = computed(() => resolveCharacterIllustration(this.appearance()));
  readonly layers = computed(() => portraitLayers(this.appearance()));
  readonly presence = computed(() => resolveAvatarPresence(this.level(),this.interest()));
  readonly description = computed(() => this.illustration().description + ' Mit gewählter Frisur, Kleidung und Farben.');
  readonly regions = computed(() => [...new Set(this.layers().filter(layer => layer.mask && !layer.eyeRegions).map(layer => layer.region))]);
  readonly alpha = REGION_ALPHA;
  clipPoints(boundary: readonly { x: number; y: number }[]): string {
    return boundary.map(point => `${point.x},${point.y}`).join(' ');
  }
  tintTable(hex: string, channel: number, region: SpriteRegion): string {
    const c = Number.parseInt(hex.slice(1 + channel * 2, 3 + channel * 2),16) / 255;
    return region === 'eyes' ? `0 ${c} 1` : `${c * .16} ${c * .55} ${c} ${.5 + c * .5}`;
  }
}
