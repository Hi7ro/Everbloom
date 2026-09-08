import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProgressFeedback } from '../state/progress-feedback';

@Component({
  selector: 'app-celebration',
  template: `
    <div class="announcement" role="status" aria-live="polite" aria-atomic="true">
      @for (notice of notices(); track notice.id) {
        <section class="celebration-card" [attr.data-celebration-id]="notice.id">
          @if (feedback.effectsEnabled()) {
            <div class="fireworks" aria-hidden="true">
              @for (particle of particles; track particle.id) {
                <span
                  [style.--x]="particle.x"
                  [style.--y]="particle.y"
                  [style.--delay]="particle.delay"
                  [style.--color]="particle.color"
                ></span>
              }
            </div>
          }
          <span class="crest" aria-hidden="true">✦</span>
          <div class="copy">
            <p class="eyebrow">{{ notice.preview ? 'VORSCHAU' : 'DAS HAST DU DIR VERDIENT' }}</p>
            <h2>{{ notice.title }}</h2>
            @for (detail of notice.details; track $index) {
              <p class="detail">{{ detail }}</p>
            }
          </div>
          <button type="button" (click)="feedback.dismiss()" aria-label="Erfolgsmeldung schließen">
            ×
          </button>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .announcement {
        position: fixed;
        left: 50%;
        top: max(18px, env(safe-area-inset-top));
        transform: translateX(-50%);
        width: min(440px, calc(100vw - 32px));
        z-index: 100;
        pointer-events: none;
      }
      .celebration-card {
        position: relative;
        display: flex;
        gap: 14px;
        align-items: flex-start;
        background: linear-gradient(120deg, #2d3e2c, #1d2b24);
        border: 1px solid #d2c891;
        border-radius: 14px;
        padding: 21px 40px 21px 20px;
        box-shadow:
          0 16px 55px #0006,
          0 0 22px #d2c89118;
        pointer-events: auto;
      }
      .crest {
        font-size: 31px;
        color: #e1d195;
        padding-top: 9px;
      }
      .copy {
        min-width: 0;
        max-height: 45dvh;
        overflow-y: auto;
      }
      .eyebrow {
        font-size: 8px;
        letter-spacing: 1.5px;
      }
      h2 {
        font:
          25px Georgia,
          serif;
        margin: 8px 0;
        color: #f3ecd0;
      }
      .detail {
        font-size: 12px;
        line-height: 1.6;
        color: #d7ddc9;
        margin: 5px 0 0;
      }
      button {
        position: absolute;
        right: 2px;
        top: 2px;
        width: 44px;
        height: 44px;
        border: 0;
        color: #c3cbb8;
        background: none;
        font-size: 22px;
      }
      .fireworks {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: visible;
      }
      .fireworks span {
        position: absolute;
        left: 50%;
        top: 30%;
        width: 5px;
        height: 5px;
        background: var(--color);
        border-radius: 50%;
        opacity: 0;
        animation: burst 1.5s ease-out var(--delay) both;
      }
      @keyframes burst {
        0% {
          opacity: 0;
          transform: translate(0, 0) scale(0.3);
        }
        12% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(var(--x), var(--y)) scale(0.35);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .fireworks {
          display: none;
        }
      }
      @media (max-width: 480px) {
        h2 {
          font-size: 22px;
        }
        .celebration-card {
          gap: 10px;
          padding-left: 16px;
        }
        .detail {
          font-size: 11px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CelebrationNotice {
  readonly feedback = inject(ProgressFeedback);
  readonly notices = computed(() => {
    const notice = this.feedback.notice();
    return notice ? [notice] : [];
  });
  readonly particles = Array.from({ length: 24 }, (_, id) => {
    const angle = (id / 24) * Math.PI * 2;
    return {
      id,
      x: Math.round(Math.cos(angle) * (80 + (id % 3) * 18)) + 'px',
      y: Math.round(Math.sin(angle) * (60 + (id % 4) * 15)) + 'px',
      delay: (id % 3) * 0.08 + 's',
      color: ['#f1d48a', '#c9dfa8', '#a8cddd'][id % 3],
    };
  });
}
