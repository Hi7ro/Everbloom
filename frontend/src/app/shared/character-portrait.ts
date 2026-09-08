import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { resolveCharacterIllustration } from '../domain/character-illustrations';
import { resolveAvatarPresence } from '../domain/avatar-presence';
import { portraitLayers, REGION_ALPHA, SpriteRegion, usesExactIllustration } from '../domain/character-rig';
import { Appearance } from '../domain/models';
import { CharacterAura } from './character-aura';

let nextPortraitId = 0;

@Component({
  selector: 'app-character-portrait',
  imports: [CharacterAura],
  template: `
    <app-character-aura [aura]="appearance().aura" [animated]="animated()" />
    <svg class="illustrated-portrait" viewBox="0 0 240 300" role="img"
      [attr.aria-label]="description()" [class.animated]="animated()"
      [attr.data-stage]="presence().stage" data-artwork="original"
      [attr.data-illustration]="illustration().id" data-gesture="idle"
      [attr.data-renderer]="isExact() ? 'exact-illustration' : 'layered'"
      [style.--breath-duration]="presence().breathSeconds + 's'">
      <defs>
        @for (region of regions; track region) {
          <filter [id]="id + '-' + region" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
            <feColorMatrix type="matrix" [attr.values]="'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ' + alpha[region]" />
            <feMorphology operator="dilate" radius="0.7" />
          </filter>
        }
        <clipPath [id]="id + '-head-boundary'"><rect x="0" y="-50" width="240" height="202" /></clipPath>
        @if (isExact()) {
          <mask [id]="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="1224" height="1285" style="mask-type:luminance">
            <image [attr.href]="illustration().maskPath" width="1224" height="1285" />
          </mask>
        } @else {
          @for (layer of layers(); track layer.key) {
            <clipPath [id]="id + '-clip-' + layer.key">
              <rect [attr.x]="layer.clipX" y="0" [attr.width]="layer.clipWidth" [attr.height]="layer.height" />
            </clipPath>
            <mask [id]="id + '-mask-' + layer.key" maskUnits="userSpaceOnUse" x="0" y="0"
              [attr.width]="layer.width" [attr.height]="layer.height" style="mask-type:alpha">
              <image [attr.href]="layer.mask" [attr.width]="layer.width" [attr.height]="layer.height"
                preserveAspectRatio="none" [attr.filter]="'url(#' + id + '-' + layer.region + ')'" />
            </mask>
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
        }
      </defs>
      <ellipse cx="120" cy="284" rx="56" ry="6" fill="#06150f" opacity=".3" />
      @if (isExact()) {
        <g class="original-figure">
          <g transform="translate(1 22) scale(.195)">
            <image [attr.href]="illustration().imagePath" width="1224" height="1285" [attr.mask]="'url(#' + maskId + ')'" />
          </g>
        </g>
      } @else {
        <g class="whole-figure">
          @for (layer of layers(); track layer.key) {
            <g [class.body-breath]="layer.group === 'body'" [class.head-breath]="layer.group === 'head'"
              [attr.data-layer]="layer.key">
              <g [attr.clip-path]="layer.key.startsWith('scalp') ? 'url(#' + id + '-head-boundary)' : null">
                <g [attr.transform]="layer.transform">
                  <g [attr.clip-path]="'url(#' + id + '-clip-' + layer.key + ')'">
                    <image [attr.href]="layer.image" [attr.width]="layer.width" [attr.height]="layer.height"
                      [attr.mask]="'url(#' + id + '-mask-' + layer.key + ')'"
                      [attr.filter]="layer.tint ? 'url(#' + id + '-tint-' + layer.key + ')' : null" />
                  </g>
                </g>
              </g>
            </g>
          }
        </g>
      }
    </svg>
  `,
  styles: [`
    :host { display:block; min-width:0; position:relative; isolation:isolate; }
    svg { position:relative; display:block; width:100%; height:100%; overflow:visible; }
    app-character-aura { z-index:0; }
    .original-figure, .whole-figure, .body-breath { transform-origin:120px 280px; }
    .animated .original-figure { animation:portrait-breath var(--breath-duration,6s) ease-in-out infinite; }
    .animated .whole-figure { animation:portrait-sway 11s ease-in-out infinite; }
    .animated .body-breath { animation:body-breath var(--breath-duration,6s) ease-in-out infinite; }
    .animated .head-breath { animation:head-breath var(--breath-duration,6s) ease-in-out infinite; transform-origin:120px 143px; }
    @keyframes portrait-breath { 0%,100% {transform:scale(1) rotate(-.25deg)} 50% {transform:scale(1.012,1.024) rotate(.25deg)} }
    @keyframes body-breath { 0%,100% {transform:scale(1)} 50% {transform:scale(1.016,1.026)} }
    @keyframes head-breath { 0%,100% {transform:translateY(0) rotate(0)} 50% {transform:translateY(-3.6px) rotate(-.35deg)} }
    @keyframes portrait-sway { 0%,100% {transform:rotate(-.35deg)} 50% {transform:rotate(.35deg)} }
    @media(prefers-reduced-motion:reduce) { .animated .original-figure,.animated .whole-figure,.animated .body-breath,.animated .head-breath {animation:none;} }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterPortrait {
  readonly appearance = input.required<Appearance>();
  readonly level = input(1);
  readonly interest = input('adventurer');
  readonly animated = input(true);
  readonly id = `everbloom-portrait-${++nextPortraitId}`;
  readonly maskId = this.id + '-exact-mask';
  readonly illustration = computed(() => resolveCharacterIllustration(this.appearance()));
  readonly isExact = computed(() => usesExactIllustration(this.appearance()));
  readonly layers = computed(() => this.isExact() ? [] : portraitLayers(this.appearance()));
  readonly presence = computed(() => resolveAvatarPresence(this.level(),this.interest()));
  readonly description = computed(() => this.illustration().description + (this.isExact() ? '' : ' Mit gewählter Frisur, Kleidung und Farben.'));
  readonly regions = Object.keys(REGION_ALPHA) as SpriteRegion[];
  readonly alpha = REGION_ALPHA;
  tintTable(hex: string, channel: number, region: SpriteRegion): string {
    const c = Number.parseInt(hex.slice(1 + channel * 2, 3 + channel * 2),16) / 255;
    return region === 'eyes' ? `0 ${c} 1` : `${c * .16} ${c * .55} ${c} ${.5 + c * .5}`;
  }
}
