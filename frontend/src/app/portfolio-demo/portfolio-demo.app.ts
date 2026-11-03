import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MobileNav } from '../shared/mobile-nav';
import { CelebrationNotice } from '../shared/celebration';
import { RewardDialog } from '../shared/reward-dialog';
import { GameStore } from '../state/game.store';
import { DEMO_PRESET, DEMO_PRESETS, DemoPreset } from './portfolio-demo.presets';

export function exampleUrl(current: string, preset: DemoPreset): string {
  const url = new URL(current);
  url.searchParams.set('example', preset);
  url.hash = '/dashboard';
  return url.href;
}

@Component({
  selector: 'app-root',
  host: { '(window:focus)': 'resume()', '(document:visibilitychange)': 'resume()' },
  imports: [RouterLink, RouterOutlet, MobileNav, CelebrationNotice, RewardDialog],
  template: `
    <aside class="local-mode" aria-label="Lokale Herovera-Fassung">
      <a href="/">← Portfolio</a><strong>Herovera</strong
      ><span class="mode-label">Lokaler Spielstand</span>
      <nav aria-label="Lokale Fassung">
        <label
          ><span class="sr-only">Vorbereiteten Beispielstand wählen</span
          ><select [value]="preset" (change)="chooseExample($event)">
            @for (example of examples; track example.id) {
              <option [value]="example.id" [selected]="example.id === preset">
                {{ example.label }}
              </option>
            }
          </select></label
        >
        <a routerLink="/demo">Info</a><button type="button" (click)="restart()">Neu starten</button>
      </nav>
    </aside>
    <router-outlet /><app-mobile-nav /><app-celebration /><app-reward-dialog />
  `,
  styles: [
    `
      .local-mode {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        border-bottom: 1px solid #b5d59535;
        background: #192c23;
        padding: 10px max(16px, calc((100vw - 1160px) / 2));
        color: #d3dfc6;
        font-size: 11px;
      }
      .local-mode > a {
        color: #aabf9f;
      }
      .local-mode strong {
        font-size: 12px;
      }
      .mode-label {
        color: #abbca3;
      }
      nav {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      nav a,
      nav button,
      select {
        min-height: 36px;
        padding: 7px 10px;
        border: 1px solid #b5d59535;
        border-radius: 6px;
        background: #122018;
        color: #d9e6ca;
        font-size: 11px;
      }
      @media (max-width: 600px) {
        .local-mode {
          gap: 8px 12px;
        }
        nav {
          width: 100%;
          margin-left: 0;
        }
        nav label {
          flex: 1;
        }
        select {
          width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioDemoApp {
  private readonly game = inject(GameStore);
  readonly preset = inject(DEMO_PRESET);
  readonly examples = DEMO_PRESETS;
  chooseExample(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const preset = DEMO_PRESETS.find((example) => example.id === value);
    if (preset) globalThis.location.assign(exampleUrl(globalThis.location.href, preset.id));
  }
  resume() {
    if (document.visibilityState === 'visible') void this.game.refresh();
  }
  restart() {
    globalThis.location.reload();
  }
}
