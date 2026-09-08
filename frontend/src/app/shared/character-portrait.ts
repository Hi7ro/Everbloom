import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { resolveCharacterArtwork } from '../domain/character';
import { resolveCharacterIllustration } from '../domain/character-illustrations';
import { resolveAvatarPresence } from '../domain/avatar-presence';
import { Appearance } from '../domain/models';
import { Chibi } from './chibi';

let nextPortraitId = 0;

/** The approved artwork stays byte-for-byte intact; a separate matte hides its background. */
@Component({
  selector: 'app-character-portrait',
  imports: [Chibi],
  template: `
    @if (isOriginal()) {
      <svg class="illustrated-portrait" viewBox="0 0 1224 1385" role="img"
        [attr.aria-label]="illustration().description"
        [class.animated]="animated()" [attr.data-stage]="presence().stage"
        data-artwork="original" [attr.data-illustration]="illustration().id" data-gesture="idle"
        [style.--breath-duration]="presence().breathSeconds + 's'">
        <defs>
          <mask [id]="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="1224" height="1285" mask-type="luminance">
            <image [attr.href]="illustration().maskPath" x="0" y="0" width="1224" height="1285" />
          </mask>
        </defs>
        <g class="portrait-aura" aria-hidden="true" [attr.data-variant]="appearance().aura">
          @if (auraColor(); as color) {
            <ellipse cx="612" cy="746" rx="572" ry="585" fill="none" [attr.stroke]="color" stroke-width="6" opacity=".2" />
            <ellipse cx="612" cy="746" rx="588" ry="605" fill="none" [attr.stroke]="color" stroke-width="3" stroke-dasharray="8 42" opacity=".16" />
            <path d="m90 888 13 24 25 13-25 13-13 24-13-24-25-13 25-13zM1100 655l9 17 17 9-17 9-9 17-9-17-17-9 17-9z" [attr.fill]="color" opacity=".7" />
          }
        </g>
        <ellipse cx="612" cy="1318" rx="235" ry="24" fill="#06150f" opacity=".36" />
        <g class="original-figure">
          <image [attr.href]="illustration().imagePath" x="0" y="0" width="1224" height="1285" [attr.mask]="'url(#' + maskId + ')'" />
        </g>
      </svg>
    } @else {
      <app-chibi [appearance]="appearance()" [level]="level()" [interest]="interest()" [animated]="animated()" />
    }
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    svg, app-chibi { display: block; width: 100%; height: 100%; overflow: visible; }
    .original-figure { transform-origin: 612px 1280px; }
    .animated .original-figure { animation: portrait-breath var(--breath-duration, 5s) ease-in-out infinite; }
    @keyframes portrait-breath { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.004, 1.008); } }
    @media (prefers-reduced-motion: reduce) { .animated .original-figure { animation: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterPortrait {
  readonly appearance = input.required<Appearance>();
  readonly level = input(1);
  readonly interest = input('adventurer');
  readonly animated = input(true);
  readonly illustration = computed(() => resolveCharacterIllustration(this.appearance()));
  readonly maskId = `everbloom-original-mask-${++nextPortraitId}`;
  readonly isOriginal = computed(() => resolveCharacterArtwork(this.appearance()) === 'original');
  readonly presence = computed(() => resolveAvatarPresence(this.level(), this.interest()));
  readonly auraColor = computed(() => {
    switch (this.appearance().aura) {
      case 'sage': return '#b6d791';
      case 'rose': return '#edb4d0';
      case 'void': return '#c4a6ff';
      default: return null;
    }
  });
}
