import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameStore } from '../state/game.store';

@Component({
  selector: 'app-progress-storage-note',
  template: `
    <p role="status" [class.warning]="!store.accountMode && store.persistence().state !== 'saved'">
      <span aria-hidden="true">{{
        store.accountMode || store.persistence().state === 'saved' ? '✓' : '◇'
      }}</span>
      {{
        store.persistence().message ||
          (store.persistence().state === 'saved'
            ? 'Aktivitäten und verdiente Auren bleiben in diesem Browser gespeichert.'
            : 'Fortschritt bleibt vorerst nur für diese Sitzung erhalten.')
      }}
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      p {
        display: flex;
        gap: 10px;
        margin: 12px 0;
        padding: 12px 14px;
        border: 1px solid #80976938;
        border-radius: 12px;
        background: #20342880;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.6;
      }
      span {
        color: var(--accent);
        flex-shrink: 0;
      }
      .warning {
        background: #49392355;
        border-color: #c39e6466;
        color: #efddbc;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressStorageNote {
  readonly store = inject(GameStore);
}
