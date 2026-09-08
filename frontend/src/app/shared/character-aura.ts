import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AURA_DESIGNS } from '../domain/aura-designs';

let nextAuraId = 0;

/** Decorative, authored VFX. Animation runs in CSS and never changes the character or rewards. */
@Component({
  selector: 'app-character-aura',
  host: { 'aria-hidden': 'true' },
  template: `
    @if (design(); as effect) {
      <svg
        viewBox="0 0 240 300"
        focusable="false"
        aria-hidden="true"
        [attr.data-aura]="effect.id"
        [class.animated]="animated()"
        [style.--aura-color]="resolvedColor()"
        [style.--aura-surface]="paint('surface')"
        [style.--aura-edge]="paint('edge')"
        [style.--aura-spark]="paint('spark')"
      >
        <defs>
          <radialGradient [id]="id + '-halo'">
            <stop offset="0" stop-color="#ffffff" stop-opacity=".5" />
            <stop offset=".3" [attr.stop-color]="resolvedColor()" stop-opacity=".72" />
            <stop offset=".64" [attr.stop-color]="resolvedColor()" stop-opacity=".36" />
            <stop offset="1" [attr.stop-color]="resolvedColor()" stop-opacity="0" />
          </radialGradient>
          <linearGradient [id]="id + '-surface'" x1="0" y1="0" x2=".25" y2="1">
            <stop offset="0" stop-color="#ffffff" stop-opacity=".94" />
            <stop offset=".2" [attr.stop-color]="resolvedColor()" stop-opacity=".94" />
            <stop offset=".54" [attr.stop-color]="resolvedColor()" stop-opacity=".56" />
            <stop offset=".86" stop-color="#ffffff" stop-opacity=".88" />
            <stop offset="1" [attr.stop-color]="resolvedColor()" stop-opacity=".9" />
          </linearGradient>
          <linearGradient [id]="id + '-edge'" x1="0" y1="0" x2=".2" y2="1">
            <stop offset="0" stop-color="#ffffff" />
            <stop offset=".28" [attr.stop-color]="resolvedColor()" />
            <stop offset=".55" stop-color="#ffffff" />
            <stop offset=".76" [attr.stop-color]="resolvedColor()" />
            <stop offset="1" stop-color="#ffffff" />
          </linearGradient>
          <radialGradient [id]="id + '-spark'">
            <stop offset="0" stop-color="#ffffff" />
            <stop offset=".18" stop-color="#ffffff" />
            <stop offset=".35" [attr.stop-color]="resolvedColor()" stop-opacity=".96" />
            <stop offset="1" [attr.stop-color]="resolvedColor()" stop-opacity="0" />
          </radialGradient>
        </defs>
        <g class="ambient-glow sway" [attr.fill]="paint('halo')">
          <ellipse cx="120" cy="167" rx="130" ry="143" opacity=".42" />
          <ellipse cx="24" cy="176" rx="47" ry="112" opacity=".74" />
          <ellipse cx="216" cy="176" rx="47" ry="112" opacity=".74" />
        </g>
        <g class="ground-light">
          <ellipse cx="120" cy="284" rx="109" ry="20" [attr.fill]="paint('halo')" />
          <ellipse class="ground-ring" cx="120" cy="284" rx="82" ry="10" />
        </g>
        <g class="aura-form" [attr.data-shape]="effect.id">
          @switch (effect.id) {
            @case ('sage') {
              <g class="sway soft-fill">
                <path d="M63 273C8 228 13 172 49 126 32 174 65 179 54 218 51 239 56 257 63 273Z" />
                <path
                  d="M175 279C230 241 229 183 196 139 212 188 178 197 185 235 190 255 183 269 175 279Z"
                />
                <path
                  d="M36 181C6 162 13 135 40 127 38 146 50 159 36 181ZM200 203C229 184 230 156 207 140 200 160 188 184 200 203Z"
                />
              </g>
              <path
                class="trail rise"
                d="M51 262C22 224 37 198 42 185M189 269C216 230 200 203 199 188M33 126Q18 99 45 74M207 142Q225 113 205 91"
              />
            }
            @case ('rose') {
              <path
                class="trail sway"
                d="M30 254C58 219 1 173 26 124Q36 104 58 102M209 269C179 228 236 187 212 139Q204 126 187 121"
              />
              <g class="soft-fill sway">
                <path
                  d="M26 143C1 132 1 104 26 116 43 91 54 117 26 143ZM207 180C183 169 185 141 208 153 229 133 235 164 207 180Z"
                />
              </g>
            }
            @case ('void') {
              <g class="flames rise soft-fill">
                <path
                  d="M58 282C9 236 47 212 23 175 3 148 33 122 28 95 70 134 39 159 63 188 38 220 76 247 58 282Z"
                />
                <path
                  d="M186 285C230 248 188 220 216 187 239 157 209 141 216 103 174 131 206 163 176 197 207 231 166 250 186 285Z"
                />
                <path
                  d="M86 273C45 229 80 218 72 182 103 205 84 233 98 249ZM156 277C190 245 161 230 169 204 142 221 159 246 146 262Z"
                />
              </g>
              <path
                class="trail"
                d="M40 211Q26 183 41 156M202 229Q218 207 203 182M28 86l9-20 5 15M210 91l-8-25-7 18"
              />
            }
            @case ('stars') {
              <path
                class="trail sway"
                d="M14 208Q10 98 83 34M29 258Q4 165 61 95M224 240Q253 137 168 58M204 282Q245 207 219 130"
              />
              <path
                class="rays soft-fill"
                d="m76 27 5 20 17 6-17 6-5 20-6-20-17-6 17-6Zm99 18 4 15 14 5-14 4-4 17-5-17-15-4 15-5ZM14 185l6 21 20 7-20 6-6 21-6-21-18-6 18-7Z"
              />
            }
            @case ('mystic') {
              <path
                class="trail sway"
                d="M20 235C68 203 0 140 47 90M216 264C172 209 249 162 196 116M38 269Q7 251 13 224M226 128Q233 102 204 82"
              />
              <g class="sigils soft-fill rise">
                <path
                  d="m29 67 16 23-16 23-16-23Zm182 114 17 24-17 24-17-24ZM66 25l12 17-12 17-12-17Z"
                />
              </g>
              <path
                class="trail"
                d="m29 75 0 30m-9-15h18m191 99v31m-9-15h18M177 40l17 10-17 10-17-10Z"
              />
            }
            @case ('chakra') {
              <g class="sway soft-fill">
                <path
                  d="M119 284C48 245 8 168 19 106 60 126 83 171 86 218 48 173 57 90 77 60 104 92 111 124 120 159 130 114 140 85 165 64 185 109 188 165 157 219 173 162 197 132 224 112 235 184 186 259 119 284Z"
                />
                <path
                  d="M117 276C60 274 21 251 7 212 40 211 73 226 91 247M124 276C182 274 219 251 233 212 200 211 168 226 151 247"
                />
              </g>
              <path
                class="trail"
                d="M22 120Q24 199 79 249M220 125Q220 202 162 253M74 80Q56 154 85 199M168 85Q184 153 155 199"
              />
            }
            @case ('demonic') {
              <g class="soft-fill sway">
                <path
                  d="M90 236 34 226 15 248 22 191 0 159 27 163 8 105 49 130 28 62 73 95 83 144 105 189ZM151 236l55-10 19 22-7-57 22-32-27 4 19-58-41 25 21-68-45 33-10 49-22 45Z"
                />
                <path d="M65 112 46 26 84 61 86 99M175 112l19-86-38 35-2 38" />
              </g>
              <path
                class="trail core-flow"
                d="M33 100 65 161 45 203M208 100l-32 61 19 42M39 222l26-23M202 222l-26-23"
              />
              <path class="energy-core core-flow"
                d="m24 254-13-37 10-32 11 27-5 19 14 32Zm194 2 12-39-12-31-9 28 5 19-14 32Z" />
              @if (fierce()) {
                <g class="fierce-eyes" data-fierce="true">
                  <path d="m51-19 48 12-13 11-26-9Zm138 0-48 12 13 11 26-9Z" />
                </g>
              }
            }
            @case ('light') {
              <g class="rays soft-fill sway">
                <path
                  d="m58 218-44-118 42 49-3-82 38 65-7-99 33 88 8-109 19 108 26-80-3 98 38-67-13 80 41-35-42 118-11-60-23 45-12-42-16 50-23-54-11 39Z"
                />
              </g>
              <path
                class="trail"
                d="M20 63 40 98M75 13 81 44M165 19l-7 29M220 72l-18 31M120 1v25"
              />
            }
            @case ('energy') {
              <g class="rays soft-fill rise">
                <path
                  d="m37 282 19-74-28 18 19-59-27 16 34-84-7 51 24-15-13 54 24-12-22 66ZM185 284l-9-62 22 12-13-53 25 15-23-65 10 40-25-20 9 60-21-11 8 53Z"
                />
              </g>
              <path
                class="trail sway"
                d="M24 260 16 214 30 201 12 176 23 159M212 264l17-45-8-29 16-18-10-42M38 83l13-28-5-19M198 103l17-27-5-20"
              />
              <path class="energy-core core-flow"
                d="m26 279-18-44 15-14L7 194l14-24-9-29 23-35-13 51 10 22-12 22 19 23-14 22 15 34Zm188 1 17-43-13-18 15-24-13-27 6-35-19-30 8 53-10 26 12 18-13 25 13 23-16 33Z" />
            }
            @case ('angel') {
              <g class="wings soft-fill sway">
                <path
                  d="M100 201C71 200 41 185 17 159L42 158C17 139 4 116 3 90L30 115C16 90 14 55 27 31 42 74 61 83 84 110 104 135 113 168 100 201ZM140 201C169 200 199 185 223 159L198 158C223 139 236 116 237 90L210 115C224 90 226 55 213 31 198 74 179 83 156 110 136 135 127 168 140 201Z"
                />
              </g>
              <path
                class="trail"
                d="M27 55Q48 101 76 125M22 111Q44 137 73 149M32 159l42 14M213 55Q192 101 164 125M218 111Q196 137 167 149M208 159l-42 14M99 20l21-10 21 10-21 9Z"
              />
              <path class="white-edge core-flow"
                d="M26 47Q31 87 58 115M15 99Q24 127 57 144M26 155l32 16M214 47Q209 87 182 115M225 99Q216 127 183 144M214 155l-32 16" />
            }
            @case ('blossom') {
              <path
                class="trail sway"
                d="M51 284C4 237 32 219 19 180 4 136 29 83 53 59M192 285C236 254 208 226 224 185 241 136 205 106 203 75M22 153 4 126M26 207 6 194M221 170l18-30M215 234l23-17"
              />
              <g class="soft-fill sway">
                <path
                  d="M28 111C2 119-8 97 15 89-1 69 25 58 33 80 52 67 67 86 46 99 68 114 43 133 28 111ZM214 202C189 209 181 190 201 180 187 160 209 151 219 171 237 157 253 176 231 188 251 204 229 222 214 202ZM22 251C0 251 0 232 17 229 15 214 35 211 38 229 56 229 53 250 36 250 32 266 17 266 22 251Z"
                />
              </g>
            }
            @case ('fire') {
              <g class="flames soft-fill rise">
                <path
                  d="M68 286C18 266-6 226 14 184 23 220 43 213 36 188 22 145 22 114 53 79 34 131 76 129 57 176 90 153 101 124 96 94 138 139 85 168 105 209 131 184 130 155 153 140 141 181 168 195 164 226 196 214 200 185 186 162 224 186 227 218 211 242 244 225 234 204 230 189 263 247 214 286 171 292Z"
                />
              </g>
              <path
                class="trail rise"
                d="M39 256C15 227 54 217 45 194M198 271C224 248 185 242 197 221M56 73l7-23 5 18M207 149l8-24 3 17"
              />
              <path class="energy-core core-flow"
                d="M43 274C13 243 18 213 27 198 24 223 47 226 38 246 55 226 50 194 60 174 72 215 48 242 63 271ZM189 280C218 258 232 234 216 207 217 231 199 233 204 250 185 236 199 204 185 193 184 224 172 246 181 271Z" />
            }
            @case ('guardian') {
              <g class="guardian soft-fill sway">
                <path class="guardian-shoulders"
                  d="M82 84 58 50 29 36 5 49-18 84-8 124 21 145 31 191 18 236 38 263 58 248 62 203 51 147 76 125ZM158 84l24-34 29-14 24 13 23 35-10 40-29 21-10 46 13 45-20 27-20-15-4-45 11-56-25-22Z" />
                <path
                  d="m10 64 20-12 22 22-15 41-28-9Zm220 0-20-12-22 22 15 41 28-9ZM26 156l17 12 5 38-14 27-6-27Zm188 0-17 12-5 38 14 27 6-27Z" />
                <path class="guardian-head" data-guardian-head="raised"
                  d="m120-47 26 15 10 26-16 27-20 12-20-12L84-6l10-26Z" />
              </g>
              <path class="trail"
                d="M95-27 103-6 120 9l17-15 8-21M11 69l15 31 17-17M229 69l-15 31-17-17M16 123l25 15 7 35M224 123l-25 15-7 35M33 183l5 28-9 21M207 183l-5 28 9 21" />
              <path class="guardian-gaze white-edge"
                d="m101-18 10 4m28-4-10 4M116 6h8" />
              <path class="energy-core core-flow"
                d="m3 124 12 15 8 38-10-12Zm234 0-12 15-8 38 10-12ZM35 232l9 11-7 12-10-10Zm170 0-9 11 7 12 10-10Z" />
            }
          }
        </g>
        <g class="particles">
          @for (particle of particles; track $index) {
            <g
              class="particle"
              [attr.transform]="'translate(' + particle.x + ' ' + particle.y + ')'"
            >
              <g
                class="particle-drift"
                [style.--delay]="particle.delay + 's'"
                [style.--duration]="particle.duration + 's'"
              >
                <circle class="spark-glow" r="10" [attr.fill]="paint('spark')" />
                @if (effect.id === 'rose' || effect.id === 'blossom') {
                  <path d="M0 0C-10-2-8-11-2-9 0-16 11-10 8-4 12 2 5 7 0 0Z" />
                } @else if (effect.id === 'sage') {
                  <path d="M0 5Q-9-1-2-9 8-5 0 5Z" />
                } @else {
                  <path d="m0-6 1.6 4.4L6 0 1.6 1.6 0 6-1.6 1.6-6 0-1.6-1.6Z" />
                  <circle class="spark-core" r="1.1" />
                }
              </g>
            </g>
          }
        </g>
      </svg>
    }
  `,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        display: block;
        pointer-events: none;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        color: var(--aura-color, #a78bfa);
      }
      .soft-fill {
        fill: var(--aura-surface);
        fill-opacity: .64;
        stroke: var(--aura-edge);
        stroke-opacity: .92;
        stroke-width: 1.3;
        stroke-linejoin: round;
      }
      .trail, .ground-ring {
        fill: none;
        stroke: var(--aura-edge);
        stroke-opacity: .92;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .ground-ring { stroke-width: 1; stroke-opacity: .65; }
      .rays { fill-opacity: .72; }
      .wings { fill-opacity: .8; stroke-width: 1.5; }
      .guardian { fill-opacity: .68; stroke-width: 1.7; }
      [data-aura='fire'] .flames,
      [data-aura='energy'] .rays,
      [data-aura='demonic'] .soft-fill { fill-opacity: .86; }
      .guardian-head { fill-opacity: .94; }
      .energy-core {
        fill: var(--aura-surface);
        fill-opacity: .96;
        stroke: #fff;
        stroke-opacity: .74;
        stroke-width: .9;
        stroke-linejoin: round;
      }
      .white-edge {
        fill: none;
        stroke: #fff;
        stroke-opacity: .92;
        stroke-width: 2;
        stroke-linecap: round;
      }
      .guardian-gaze { stroke-width: 2.7; }
      .fierce-eyes { fill: #fff; stroke: currentColor; stroke-width: 2; }
      .particle-drift { fill: var(--aura-edge); opacity: .9; }
      .spark-core { fill: #fff; }
      .spark-glow { opacity: .86; }
      .sway, .rise, .core-flow { transform-origin: 120px 280px; }
      .animated .sway { animation: aura-breathe 8s ease-in-out infinite; }
      .animated .rise { animation: aura-rise 7s ease-in-out infinite; }
      .animated .core-flow { animation: aura-core-flow 5.6s ease-in-out -2.2s infinite; }
      .animated .particle-drift {
        animation: aura-drift var(--duration, 9s) ease-in-out var(--delay, 0s) infinite;
      }
      @keyframes aura-core-flow {
        0%, 100% { transform: translateY(3px) scaleX(.98); opacity: .72; }
        50% { transform: translateY(-8px) scaleX(1.02); opacity: 1; }
      }
      @keyframes aura-breathe {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.78;
        }
        50% {
          transform: scale(1.025, 1.035);
          opacity: 1;
        }
      }
      @keyframes aura-rise {
        0%,
        100% {
          transform: translateY(2px) scaleX(0.985);
          opacity: 0.72;
        }
        50% {
          transform: translateY(-5px) scaleX(1.015);
          opacity: 1;
        }
      }
      @keyframes aura-drift {
        0%,
        100% {
          transform: translate(0, 4px) rotate(-8deg);
          opacity: 0.5;
        }
        50% {
          transform: translate(3px, -9px) rotate(12deg);
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .animated .sway,
        .animated .rise,
        .animated .particle-drift,
        .animated .core-flow {
          animation: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterAura {
  readonly id = `everbloom-aura-${++nextAuraId}`;
  readonly aura = input('none');
  readonly animated = input(true);
  readonly color = input<string | undefined>(undefined);
  readonly fierce = input(false);
  readonly design = computed(
    () => AURA_DESIGNS.find((design) => design.id === this.aura()) ?? null,
  );
  readonly resolvedColor = computed(() => {
    const color = this.color();
    return typeof color === 'string' && /^#[\da-f]{6}$/i.test(color)
      ? color.toLowerCase()
      : (this.design()?.color ?? '#a78bfa');
  });
  paint(region: 'halo' | 'surface' | 'edge' | 'spark'): string {
    return `url(#${this.id}-${region})`;
  }

  readonly particles = [
    { x: 26, y: 46, delay: -1, duration: 9 },
    { x: 52, y: 26, delay: -6, duration: 11 },
    { x: 199, y: 44, delay: -3, duration: 10 },
    { x: 218, y: 86, delay: -8, duration: 12 },
    { x: 14, y: 104, delay: -4, duration: 11 },
    { x: 44, y: 148, delay: -9, duration: 13 },
    { x: 209, y: 158, delay: -2, duration: 9 },
    { x: 229, y: 206, delay: -7, duration: 12 },
    { x: 12, y: 218, delay: -5, duration: 10 },
    { x: 48, y: 246, delay: -1, duration: 12 },
    { x: 192, y: 252, delay: -4, duration: 13 },
    { x: 65, y: 280, delay: -7, duration: 10 },
    { x: 172, y: 287, delay: -9, duration: 12 },
    { x: 221, y: 278, delay: -3, duration: 11 },
    { x: 18, y: 276, delay: -8, duration: 13 },
    { x: 180, y: 20, delay: -5, duration: 9 },
  ] as const;
}
