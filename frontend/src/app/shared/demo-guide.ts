import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoTourStore } from '../state/demo-tour.store';

@Component({
  selector: 'app-demo-guide',
  imports: [RouterLink],
  template: `<a routerLink="/demo" fragment="demo-steps"
    ><span aria-hidden="true">{{ tour.complete() ? '✧' : '◇' }}</span
    ><span class="copy"
      ><strong>{{
        tour.complete() ? 'Dein erster Rundgang ist geschafft.' : 'Entdecke dein kleines Abenteuer.'
      }}</strong
      ><small>{{
        tour.complete()
          ? 'Du kannst die Demo frei weiterspielen.'
          : tour.completedCount() + ' von 4 Schritten erlebt · weiter zum Demo-Rundgang'
      }}</small></span
    ><span aria-hidden="true">↗</span></a
  >`,
  styles: [
    `
      :host {
        display: block;
        margin: 0 0 20px;
      }
      a {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        border: 1px solid #b1c88a44;
        border-radius: 14px;
        background: linear-gradient(100deg, #30402b66, #1e2d26);
        color: #c5d8ad;
      }
      .copy {
        flex: 1;
        min-width: 0;
      }
      strong {
        display: block;
        font-size: 13px;
        font-weight: 500;
      }
      small {
        display: block;
        margin-top: 5px;
        font-size: 11px;
        color: #adbea2;
        line-height: 1.5;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoGuide {
  readonly tour = inject(DemoTourStore);
}
