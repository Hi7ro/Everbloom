import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { DAILY_CARE_MODES, DAILY_ENERGIES, DailyCareMode, DailyEnergy } from '../domain/daily-care';
import { DailyCareStore } from '../state/daily-care.store';

@Component({
  selector: 'app-daily-care-panel',
  template: `
    <section class="care-panel" aria-labelledby="daily-care-heading">
      @if (!editing() && care.checkIn(); as checkIn) {
        <div class="care-summary">
          <span class="summary-symbol" aria-hidden="true">{{ modeSymbol(checkIn.mode) }}</span>
          <div>
            <p class="care-kicker">DEIN TAG</p>
            <h2 id="daily-care-heading">{{ modeLabel(checkIn.mode) }}</h2>
            <p class="summary-energy">Energie: {{ energyLabel(checkIn.energy) }}</p>
          </div>
          <button type="button" class="care-change" (click)="beginEditing()">Ändern</button>
        </div>
      } @else if (!editing() && care.skipped()) {
        <div class="care-summary skipped">
          <div>
            <h2 id="daily-care-heading">Heute ohne Check-in</h2>
            <p class="summary-energy">Dein Tempo bleibt deine Entscheidung.</p>
          </div>
          <button type="button" class="care-change" (click)="askAgain()">Doch auswählen</button>
        </div>
      } @else {
        <p class="care-kicker">EIN MOMENT FÜR DICH · FREIWILLIG</p>
        <h2 id="daily-care-heading">Wie möchtest du heute unterwegs sein?</h2>
        <p class="care-intro">
          Gib deinem Begleiter eine Richtung. Du kannst sie jederzeit ändern.
        </p>
        <form (submit)="submit($event)">
          <fieldset>
            <legend>Dein Tagesmodus</legend>
            <div class="mode-options">
              @for (mode of modes; track mode.id) {
                <label class="mode-option" [class.selected]="selectedMode() === mode.id">
                  <input
                    type="radio"
                    name="daily-care-mode"
                    [id]="'daily-care-mode-' + mode.id"
                    [value]="mode.id"
                    [checked]="selectedMode() === mode.id"
                    (change)="selectedMode.set(mode.id)"
                  />
                  <span class="mode-symbol" aria-hidden="true">{{ mode.symbol }}</span>
                  <strong>{{ mode.label }}</strong>
                  <span class="mode-description">{{ mode.description }}</span>
                </label>
              }
            </div>
          </fieldset>
          <fieldset>
            <legend>Wie ist deine Energie gerade?</legend>
            <div class="energy-options">
              @for (energy of energies; track energy.id) {
                <label class="energy-option" [class.selected]="selectedEnergy() === energy.id">
                  <input
                    type="radio"
                    name="daily-care-energy"
                    [id]="'daily-care-energy-' + energy.id"
                    [value]="energy.id"
                    [checked]="selectedEnergy() === energy.id"
                    (change)="selectedEnergy.set(energy.id)"
                  />
                  <span>{{ energy.label }}</span>
                </label>
              }
            </div>
          </fieldset>
          <div class="care-actions">
            <button type="submit" class="care-save">Für heute übernehmen</button>
            <button type="button" class="care-skip" (click)="skip()">Auslassen</button>
          </div>
        </form>
      }
      <p class="care-status" role="status" aria-live="polite">{{ care.message() }}</p>
      @if (!care.accountMode && !care.persisted() && care.message()) {
        <p class="storage-note">
          Nur für diese Sitzung: Auf diesem Gerät konnte deine Auswahl nicht gespeichert werden.
        </p>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .care-panel {
        container-type: inline-size;
        padding: 22px;
        border: 1px solid var(--line-bright, #455243);
        border-radius: 18px;
        background: linear-gradient(145deg, #26342c, #202c26);
        color: var(--text, #f0f0df);
      }
      .care-kicker {
        margin: 0 0 10px;
        color: #c0cdb0;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.9px;
        line-height: 1.5;
      }
      h2 {
        margin: 0;
        font-family: inherit;
        font-size: 21px;
        font-weight: 600;
        line-height: 1.35;
        text-wrap: balance;
      }
      .care-intro,
      .summary-energy,
      .storage-note,
      .care-status {
        color: #c9d2c1;
        font-size: 14px;
        line-height: 1.6;
      }
      .care-intro {
        margin: 10px 0 22px;
      }
      fieldset {
        min-width: 0;
        margin: 0 0 22px;
        padding: 0;
        border: 0;
      }
      legend {
        margin: 0 0 10px;
        padding: 0;
        font-size: 16px;
        line-height: 1.5;
        font-weight: 600;
      }
      .mode-options {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .mode-option,
      .energy-option {
        position: relative;
        cursor: pointer;
        border: 1px solid #586550;
        border-radius: 12px;
        background: #202b23;
      }
      .mode-option {
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr);
        align-content: start;
        align-items: center;
        gap: 8px;
        min-height: 112px;
        padding: 14px 12px;
      }
      .mode-option strong {
        font-size: 15px;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }
      .mode-symbol {
        font-size: 22px;
        line-height: 1;
        color: #d4dfbd;
      }
      .mode-description {
        grid-column: 1 / -1;
        color: #c4ceb9;
        font-size: 14px;
        line-height: 1.45;
      }
      .selected {
        border-color: #d0dfad;
        background: #35482f;
        box-shadow: inset 0 0 0 1px #d0dfad;
      }
      label:focus-within {
        outline: 2px solid #e3edc5;
        outline-offset: 3px;
      }
      input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        clip-path: inset(50%);
      }
      .energy-options {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }
      .energy-option {
        display: flex;
        min-height: 48px;
        align-items: center;
        justify-content: center;
        padding: 12px;
        font-size: 15px;
        line-height: 1.4;
        text-align: center;
      }
      .care-actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      button {
        min-height: 48px;
        border-radius: 10px;
        padding: 12px 16px;
        font: inherit;
        font-size: 15px;
        line-height: 1.4;
      }
      .care-save {
        flex: 1 1 220px;
        background: #cbdcac;
        color: #22301d;
        border: 1px solid #cbdcac;
        font-weight: 650;
      }
      .care-skip,
      .care-change {
        background: transparent;
        border: 1px solid #69765f;
        color: #e0e8d5;
      }
      .care-skip {
        flex: 1 1 100px;
      }
      .care-summary {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .care-summary > div {
        flex: 1;
        min-width: 130px;
      }
      .care-summary .care-kicker {
        margin-bottom: 3px;
      }
      .summary-symbol {
        font-size: 34px;
        color: #d4dfbd;
      }
      .summary-energy {
        margin: 5px 0 0;
      }
      .care-status {
        margin: 12px 0 0;
      }
      .care-status:empty {
        display: none;
      }
      .storage-note {
        color: #eed6aa;
        margin: 10px 0 0;
      }
      @container (min-width: 440px) {
        .energy-options {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @container (min-width: 640px) {
        .mode-options {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      @media (max-width: 380px) {
        .care-panel {
          padding: 18px 16px;
        }
        .mode-option {
          grid-template-columns: 1fr;
        }
        .mode-description {
          grid-column: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyCarePanel {
  readonly care = inject(DailyCareStore);
  readonly modes = DAILY_CARE_MODES;
  readonly energies = DAILY_ENERGIES;
  readonly selectedMode = signal<DailyCareMode>('balanced');
  readonly selectedEnergy = signal<DailyEnergy>('steady');
  readonly editing = signal(false);

  constructor() {
    effect(() => {
      this.care.dayKey();
      untracked(() => {
        this.selectedMode.set('balanced');
        this.selectedEnergy.set('steady');
        this.editing.set(false);
      });
    });
  }

  beginEditing(): void {
    this.care.refresh();
    const current = this.care.checkIn();
    this.selectedMode.set(current?.mode ?? 'balanced');
    this.selectedEnergy.set(current?.energy ?? 'steady');
    this.editing.set(true);
  }

  askAgain(): void {
    this.care.reset();
    this.beginEditing();
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.care.save(this.selectedMode(), this.selectedEnergy())) this.editing.set(false);
  }

  skip(): void {
    this.care.skip();
    this.editing.set(false);
  }

  modeLabel(mode: DailyCareMode): string {
    return this.modes.find((option) => option.id === mode)?.label ?? 'Ausgewogen';
  }

  modeSymbol(mode: DailyCareMode): string {
    return this.modes.find((option) => option.id === mode)?.symbol ?? '◇';
  }

  energyLabel(energy: DailyEnergy): string {
    return this.energies.find((option) => option.id === energy)?.label ?? 'Ausgeglichen';
  }
}
