import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CHARACTER_OPTIONS } from '../domain/character';
import { Appearance } from '../domain/models';
import { resolveAvatarPresence } from '../domain/avatar-presence';
import { resolveChibiHair } from './chibi-hair';
import { OutfitMaterial, resolveChibiOutfit } from './chibi-outfits';

let nextAvatarPaintId = 0;

/** Original anime-chibi prototype. Creator slots remain independent, replaceable layers. */
@Component({
  selector: 'app-chibi',
  template: `
    <svg
      viewBox="0 0 240 290"
      role="img"
      [attr.aria-label]="description()"
      [class.animated]="animated()"
      [attr.data-stage]="presence().stage"
      [attr.data-presentation]="presentation()"
      [attr.data-gesture]="presence().gesture"
      [style.--breath-duration]="presence().breathSeconds + 's'"
      [style.--gesture-duration]="presence().gestureSeconds + 's'"
      [style.--head-tilt]="presence().tiltDegrees + 'deg'"
    >
      <defs>
        <linearGradient [id]="paintIds.skin" x1="0" y1="0" x2="1" y2=".7">
          <stop offset="0" [attr.stop-color]="tone(appearance().skinColor, 0.17)" />
          <stop offset=".72" [attr.stop-color]="appearance().skinColor" />
          <stop offset="1" [attr.stop-color]="tone(appearance().skinColor, -0.18)" />
        </linearGradient>
        <linearGradient [id]="paintIds.hair" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" [attr.stop-color]="tone(appearance().hairColor, 0.22)" />
          <stop offset=".45" [attr.stop-color]="appearance().hairColor" />
          <stop offset="1" [attr.stop-color]="tone(appearance().hairColor, -0.38)" />
        </linearGradient>
        <linearGradient [id]="paintIds.cloth" x1="0" y1=".2" x2="1" y2=".7">
          <stop offset="0" [attr.stop-color]="tone(appearance().outfitColor, 0.19)" />
          <stop offset=".52" [attr.stop-color]="appearance().outfitColor" />
          <stop offset="1" [attr.stop-color]="tone(appearance().outfitColor, -0.3)" />
        </linearGradient>
        <radialGradient [id]="paintIds.ground">
          <stop offset="0" stop-color="#051510" stop-opacity=".65" />
          <stop offset="1" stop-color="#051510" stop-opacity="0" />
        </radialGradient>
      </defs>
      <g data-slot="aura" [attr.data-variant]="appearance().aura" fill="none">
        @switch (appearance().aura) {
          @case ('sage') {
            <ellipse cx="120" cy="153" rx="99" ry="114" stroke="#a7c889" stroke-opacity=".27" />
            <ellipse
              cx="120"
              cy="155"
              rx="108"
              ry="122"
              stroke="#a7c889"
              stroke-opacity=".12"
              stroke-dasharray="3 12"
            />
            <path
              d="M28 118q-14-8-5-17q12 2 5 17M210 197q15-4 10-15q-12-1-10 15M42 233q-12 3-12-10q12-4 12 10"
              fill="#bed998"
            />
            <circle cx="191" cy="58" r="3" fill="#d1e4b7" />
          }
          @case ('rose') {
            <ellipse cx="120" cy="153" rx="104" ry="117" stroke="#eab0cd" stroke-opacity=".25" />
            <g fill="#edb4d0">
              <path
                d="M29 95c-12-11-19 6 0 14c19-8 12-25 0-14M207 182c-12-11-19 6 0 14c19-8 12-25 0-14"
              />
              <path d="m194 57 3-9 3 9 9 3-9 3-3 9-3-9-9-3zM34 227l3-9 3 9 9 3-9 3-3 9-3-9-9-3z" />
            </g>
          }
          @case ('void') {
            <ellipse
              cx="120"
              cy="156"
              rx="105"
              ry="117"
              stroke="#b395ea"
              stroke-width="3"
              stroke-opacity=".25"
            />
            <path
              d="M29 69 15 105 31 103 20 137M208 201l15-30-15 3 14-34M188 39l-8 19 11-4"
              stroke="#c4a6ff"
              stroke-width="3"
              stroke-linejoin="round"
            />
            <path d="m40 205 6 9-6 10-6-10zM199 81l5 8-5 8-5-8z" fill="#c4a6ff" />
          }
        }
      </g>
      <ellipse cx="121" cy="264" rx="64" ry="12" [attr.fill]="paint('ground')" />
      <g class="presence-pose" [attr.transform]="poseTransform()">
        <g class="breathing-body">
          <g data-slot="back" [attr.data-variant]="outfit()">
            @for (part of outfitSet().back; track $index) {
              <path [attr.d]="part.d" [attr.fill]="material(part.fill)" [attr.stroke]="part.stroke ? material(part.stroke) : null"
                [attr.stroke-width]="part.width" stroke-linejoin="round" stroke-linecap="round" />
            }
          </g>
          <g data-slot="body" [attr.data-variant]="appearance().body" [attr.transform]="bodyTransform()">
            <g class="presentation-body" [attr.data-presentation]="presentation()" [attr.transform]="presentationBodyTransform()">
              <g data-slot="legs">
                @for (part of outfitSet().legs; track $index) {
                  <path [attr.d]="part.d" [attr.fill]="material(part.fill)" [attr.stroke]="part.stroke ? material(part.stroke) : null"
                    [attr.stroke-width]="part.width" stroke-linejoin="round" stroke-linecap="round" />
                }
              </g>
              <g data-slot="neck">
                <path [attr.d]="isFemale() ? 'M114 140 132 140 135 164 112 164Z' : 'M105 138 139 137 147 167 101 165Z'"
                  [attr.fill]="paint('skin')" [attr.stroke]="tone(appearance().skinColor, -.3)" stroke-width="1" />
                <path [attr.d]="isFemale() ? 'M126 146 132 144 134 160 126 162Z' : 'M131 143 140 140 144 159 131 162Z'"
                  [attr.fill]="tone(appearance().skinColor, -.25)" />
              </g>
              <g data-slot="far-arm">
                @for (part of outfitSet().farArm; track $index) {
                  <path [attr.d]="part.d" [attr.fill]="material(part.fill)" [attr.stroke]="part.stroke ? material(part.stroke) : null"
                    [attr.stroke-width]="part.width" stroke-linejoin="round" stroke-linecap="round" />
                }
              </g>
              <g data-slot="outfit" [attr.data-variant]="outfit()">
                @for (part of outfitSet().torso; track $index) {
                  <path [attr.d]="part.d" [attr.data-layer]="part.layer" [attr.fill]="material(part.fill)"
                    [attr.stroke]="part.stroke ? material(part.stroke) : null" [attr.stroke-width]="part.width"
                    stroke-linejoin="round" stroke-linecap="round" />
                }
              </g>
              <g class="near-arm" data-slot="near-arm">
                @for (part of outfitSet().nearArm; track $index) {
                  <path [attr.d]="part.d" [attr.fill]="material(part.fill)" [attr.stroke]="part.stroke ? material(part.stroke) : null"
                    [attr.stroke-width]="part.width" stroke-linejoin="round" stroke-linecap="round" />
                }
              </g>
            </g>
          </g>
        </g>
        <g class="breathing-head">
          <g class="head-proportions" transform="translate(124 143) scale(.78) translate(-124 -150)">
          <g class="gesture-head">
            <g data-slot="hair-back" [attr.data-variant]="appearance().hair" [attr.fill]="appearance().hairColor">
              @if (hairShape().back; as back) {
                <path [attr.d]="back" [attr.fill]="paint('hair')"
                  [attr.stroke]="tone(appearance().hairColor, -0.48)" stroke-width="1.3" stroke-linejoin="round" />
              }
              @if (hairShape().backStrands; as strands) {
                <path [attr.d]="strands" fill="none" [attr.stroke]="tone(appearance().hairColor, 0.35)"
                  stroke-opacity=".5" stroke-width="2" stroke-linecap="round" />
              }
              @if (hairShape().tie; as tie) {
                <path [attr.d]="tie" fill="none" stroke="#d8c19b" stroke-width="5" stroke-linecap="round" />
              }
            </g>
            <g data-slot="face" [attr.data-presentation]="presentation()">
              <ellipse cx="80" cy="112" [attr.rx]="isFemale() ? 10 : 12" [attr.ry]="isFemale() ? 13 : 15" [attr.fill]="appearance().skinColor" />
              <ellipse
                cx="80"
                cy="114"
                rx="6"
                ry="9"
                [attr.fill]="tone(appearance().skinColor, -0.16)"
              />
              <path
                [attr.d]="faceShape()"
                data-layer="face-contour"
                [attr.stroke]="tone(appearance().skinColor, -0.3)"
                stroke-width="1.1"
                stroke-linejoin="round"
                [attr.fill]="paint('skin')"
              />
              <path
                [attr.d]="faceShade()"
                [attr.fill]="tone(appearance().skinColor, -0.23)"
                opacity=".55"
              />
              <path
                d="M89 86 110 70 146 74 156 94 138 88 121 94 105 89 94 100Z"
                [attr.fill]="tone(appearance().skinColor, -0.25)"
                opacity=".28"
              />
              <path
                [attr.d]="isFemale() ? 'M96 97Q107 93 120 97M142 92q8-4 15 0' : 'M96 98 119 98M143 94 158 94'"
                fill="none"
                [attr.stroke]="tone(appearance().hairColor, -0.67)"
                [attr.stroke-width]="isFemale() ? 2 : 3.6" data-layer="brows"
                stroke-linecap="round"
              />
              <g data-slot="eyes">
                <path
                  [attr.d]="isFemale() ? 'M95 109Q105 100 119 106L123 110Q119 124 107 122Q100 120 95 109Z' : 'M97 109Q108 103 120 108L123 111Q117 120 106 119Z'"
                  fill="#f4f0e8"
                />
                <path [attr.d]="isFemale() ? 'M141 104Q149 98 158 102L160 106Q156 118 147 116Z' : 'M143 105Q150 100 158 103L160 106Q155 114 148 113Z'" fill="#eee9e1" />
                <ellipse cx="111" cy="112.7" [attr.rx]="isFemale() ? 6.8 : 5.8" [attr.ry]="isFemale() ? 8 : 6" fill="#375f67" />
                <ellipse cx="152" cy="108" [attr.rx]="isFemale() ? 4.5 : 3.6" [attr.ry]="isFemale() ? 6.7 : 5" fill="#375f67" />
                <path
                  [attr.d]="isFemale() ? 'M106 114Q111 118 116 113L115 118Q110 121 107 117ZM149 109q3 3 6-1l-1 5-3 1Z' : 'M107 113Q111 116 115 112L115 116 108 116ZM149 109l5-1-1 3-3 0Z'"
                  fill="#90d5ca"
                />
                <path [attr.d]="isFemale() ? 'M109 108q4-2 4 4t-4 4Z M151 104q3-1 3 3t-3 4Z' : 'M109 109q4-2 4 2t-4 3Z M151 105q3-1 3 2t-3 3Z'" fill="#152b37" />
                <circle cx="109" cy="109" r="2.1" fill="#fffdf4" />
                <circle cx="151" cy="105.5" r="1.5" fill="#fffdf4" />
                <circle cx="114" cy="115" r=".9" fill="#daf5e4" />
                <path
                  [attr.d]="isFemale() ? 'M91 103 97 107Q105 99 119 106L124 109M139 102 143 104Q151 98 158 102L162 104' : 'M97 109Q107 103 120 108L122 110M143 105Q150 100 158 103'"
                  fill="none"
                  stroke="#26303c"
                  stroke-width="2.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  [attr.d]="isFemale() ? 'M100 120q9 6 19-1M146 115q8 4 12-3' : 'M104 119 116 118M148 113 156 112'"
                  fill="none"
                  stroke="#574849"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
                @if (isFemale()) {
                  <path d="M95 107 91 99M143 103l-3-6" fill="none" stroke="#26303c" stroke-width="1.8" stroke-linecap="round" />
                }
              </g>
              <path
                d="m139 115 4 7-5 2"
                fill="none"
                [attr.stroke]="tone(appearance().skinColor, -0.38)"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M126 135q8 2 14-3"
                fill="none"
                stroke="#895f54"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="m129 140 7-1"
                stroke="#fff0d9"
                stroke-opacity=".5"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              @if (isFemale()) {
              <path
                d="m96 125 7 2m-5 2 8 1" data-layer="blush"
                stroke="#c67c79"
                stroke-width="1.2"
                stroke-linecap="round"
                opacity=".22"
              />
              }
            </g>
            <g data-slot="hair" [attr.data-variant]="appearance().hair" [attr.fill]="appearance().hairColor">
              <g [attr.fill]="paint('hair')" [attr.stroke]="tone(appearance().hairColor, -0.5)"
                stroke-width="1.25" stroke-linejoin="round">
                <path data-layer="hair-silhouette" [attr.d]="hairShape().front" />
                <path [attr.d]="hairShape().shade" [attr.fill]="tone(appearance().hairColor, -0.28)" stroke="none" />
                <path [attr.d]="hairShape().highlights" [attr.fill]="tone(appearance().hairColor, 0.35)" stroke="none" />
                <path [attr.d]="hairShape().strands" fill="none" stroke-opacity=".4" />
              </g>
            </g>
            <g data-slot="accessory">
              @for (part of outfitSet().headpiece; track $index) {
                <path [attr.d]="part.d" [attr.fill]="material(part.fill)" [attr.stroke]="part.stroke ? material(part.stroke) : null"
                  [attr.stroke-width]="part.width" stroke-linejoin="round" stroke-linecap="round" />
              }
            </g>
          </g>
          </g>
        </g>
        @if (presence().gesture === 'focus') {
          <g
            class="focus-mote"
            data-slot="interest-gesture"
            aria-hidden="true"
            fill="none"
            stroke="#dddbbc"
            stroke-width="1.5"
          >
            <path d="m185 131 4-9 4 9 9 4-9 4-4 9-4-9-9-4Z" />
            <path d="M178 116v5M200 147v5" stroke-linecap="round" />
          </g>
        }
      </g>
    </svg>
  `,
  styles: [
    `
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .breathing-body {
        transform-origin: 120px 260px;
      }
      .breathing-head {
        transform-origin: 125px 150px;
      }
      .gesture-head {
        transform-origin: 124px 147px;
      }
      .near-arm {
        transform-origin: 95px 160px;
      }
      .focus-mote {
        transform-origin: 189px 135px;
        opacity: 0.4;
      }
      svg.animated .breathing-body {
        animation: quiet-breath var(--breath-duration) ease-in-out infinite;
      }
      svg.animated .breathing-head {
        animation: quiet-head var(--breath-duration) ease-in-out infinite;
      }
      svg.animated[data-gesture='stretch'] .near-arm {
        animation: shoulder-release var(--gesture-duration) ease-in-out infinite;
      }
      svg.animated[data-gesture='breathe'] .gesture-head {
        animation: mindful-nod var(--gesture-duration) ease-in-out infinite;
      }
      svg.animated[data-gesture='focus'] .gesture-head,
      svg.animated[data-gesture='greet'] .gesture-head {
        animation: curious-glance var(--gesture-duration) ease-in-out infinite;
      }
      svg.animated .focus-mote {
        animation: thought-spark var(--gesture-duration) ease-in-out infinite;
      }
      @keyframes quiet-breath {
        0%,
        100% {
          transform: scaleY(1);
        }
        50% {
          transform: scaleY(1.012);
        }
      }
      @keyframes quiet-head {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-1.4px);
        }
      }
      @keyframes shoulder-release {
        0%,
        72%,
        91%,
        100% {
          transform: rotate(0);
        }
        79%,
        84% {
          transform: rotate(-17deg) translateY(-1px);
        }
      }
      @keyframes mindful-nod {
        0%,
        70%,
        94%,
        100% {
          transform: rotate(0);
        }
        79%,
        86% {
          transform: rotate(var(--head-tilt)) translateY(1px);
        }
      }
      @keyframes curious-glance {
        0%,
        76%,
        95%,
        100% {
          transform: rotate(0);
        }
        84%,
        89% {
          transform: rotate(calc(var(--head-tilt) * -1));
        }
      }
      @keyframes thought-spark {
        0%,
        77%,
        95%,
        100% {
          opacity: 0;
          transform: translateY(2px) scale(0.8);
        }
        84%,
        89% {
          opacity: 0.65;
          transform: translateY(-2px) scale(1);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        svg.animated .breathing-body,
        svg.animated .breathing-head,
        svg.animated .near-arm,
        svg.animated .gesture-head,
        svg.animated .focus-mote {
          animation: none !important;
          transform: none !important;
        }
        .focus-mote {
          opacity: 0.4;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chibi {
  readonly appearance = input.required<Appearance>();
  readonly presentation = computed(() => this.appearance().presentation === 'female' ? 'female' : 'male');
  readonly isFemale = computed(() => this.presentation() === 'female');
  readonly hairShape = computed(() => resolveChibiHair(this.appearance().hair));
  readonly presentationBodyTransform = computed(() => this.isFemale()
    ? 'translate(120 153) scale(.91 1) translate(-120 -153)'
    : 'translate(120 153) scale(1.11 1) translate(-120 -153)');
  readonly outfitSet = computed(() => resolveChibiOutfit(this.outfit(), this.isFemale()));
  material(token: OutfitMaterial): string {
    const armor = this.outfit() === 'abyssal';
    const color = this.appearance().outfitColor;
    const materials: Record<OutfitMaterial, string> = {
      none: 'none', color, cloth: this.paint('cloth'), skin: this.paint('skin'),
      shade: this.tone(color, -.32), light: this.tone(color, .42),
      lining: this.tone(color, -.69), leather: '#443b35', leatherLight: '#9a8870',
      sole: '#172228', metal: '#bcc8bd', gold: '#d4c29c',
      plate: armor ? '#303044' : '#495460',
      plateShade: armor ? '#202334' : '#2e3945',
      plateDeep: armor ? '#111827' : '#1c2732',
      edge: armor ? '#818198' : '#93a0ab',
    };
    return materials[token];
  }
  readonly faceShape = computed(() => this.isFemale()
    ? 'M77 94Q72 54 112 45Q154 39 167 79L166 105Q173 117 165 128Q151 145 130 153Q115 152 99 141Q88 134 85 123Z'
    : 'M77 94Q73 53 112 45Q155 39 169 79L169 105 175 116 171 130 159 145 143 155 120 156 104 150 91 137 83 122Z');
  readonly faceShade = computed(() => this.isFemale()
    ? 'M154 82 165 95 165 107Q173 117 165 128Q151 145 130 153L122 149Q145 140 152 122L150 103Z'
    : 'M156 82 168 95 169 105 174 116 170 130 159 145 143 155 120 156 118 151 143 141 155 124 153 103Z');
  readonly level = input(1);
  readonly interest = input('adventurer');
  readonly animated = input(true);
  readonly presence = computed(() => resolveAvatarPresence(this.level(), this.interest()));
  private readonly paintPrefix = 'chibi-paint-' + ++nextAvatarPaintId;
  readonly paintIds = {
    skin: this.paintPrefix + '-skin',
    hair: this.paintPrefix + '-hair',
    cloth: this.paintPrefix + '-cloth',
    ground: this.paintPrefix + '-ground',
  };
  readonly poseTransform = computed(() =>
    !this.isFemale() ? '' : this.presence().stage === 'beginner'
      ? 'rotate(-1.2 120 260)'
      : this.presence().stage === 'seasoned'
        ? 'rotate(.6 120 260)'
        : '',
  );
  paint(slot: keyof typeof this.paintIds) {
    return 'url(#' + this.paintIds[slot] + ')';
  }
  tone(hex: string, amount: number): string {
    const base = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#718967';
    const target = amount >= 0 ? 255 : 0;
    return (
      '#' +
      [1, 3, 5]
        .map((offset) => {
          const channel = parseInt(base.slice(offset, offset + 2), 16);
          return Math.round(channel + (target - channel) * Math.abs(amount))
            .toString(16)
            .padStart(2, '0');
        })
        .join('')
    );
  }
  readonly outfit = computed(() =>
    this.appearance().outfit === 'wanderer' ? 'adventurer' : this.appearance().outfit,
  );
  readonly bodyTransform = computed(() => {
    switch (this.appearance().body) {
      case 'compact':
        return 'translate(120 153) scale(.91 .96) translate(-120 -153)';
      case 'broad':
        return 'translate(120 260) scale(1.16 1) translate(-120 -260)';
      default:
        return '';
    }
  });
  readonly description = computed(() => {
    const style =
      CHARACTER_OPTIONS.outfit.find((option) => option.id === this.outfit())?.label ?? 'Adventurer';
    const hair =
      CHARACTER_OPTIONS.hair.find((option) => option.id === this.appearance().hair)?.label ??
      'Strubbelig';
    return (
      'Dein Chibi: ' +
      style +
      ', Frisur ' +
      hair +
      (this.isFemale() ? '. Weibliche Chibi-Figur' : '. Männliche Chibi-Figur') +
      ' im Anime-Look in Dreiviertelansicht. ' +
      this.presence().stageLabel +
      '. Vorläufige Illustration.'
    );
  });
}
