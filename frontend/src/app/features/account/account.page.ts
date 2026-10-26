import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';
import { ApiClient, ApiError } from '../../data/api-client';
import { AccountExport } from '../../data/account-export';

@Component({
  selector: 'app-account-page',
  imports: [FormsModule, RouterLink],
  styleUrl: '../auth/account-page.scss',
  template: ` <main class="auth-shell">
    <a class="brand" routerLink="/dashboard">✳ herovera.</a>
    <section class="auth-card">
      <p class="eyebrow">DEIN KONTO</p>
      <h1>Deine Reise bleibt bei dir.</h1>
      <p class="account-email">{{ auth.user()?.email }}</p>
      <p>
        Charakter, Interessen, Aktivitäten und Belohnungen werden in deinem Konto gespeichert. Du
        kannst dich auf einem anderen Gerät mit demselben Konto anmelden.
      </p>
      @if (auth.error()) {
        <p class="error" role="alert">{{ auth.error() }}</p>
      }
      @if (message()) {
        <p class="notice" role="status">{{ message() }}</p>
      }
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      <div class="actions">
        <a class="primary" routerLink="/dashboard">Zurück zu meinem Abenteuer →</a
        ><button class="secondary" [disabled]="busy() || auth.busy()" (click)="exportData()">
          {{ busy() ? 'Wird vorbereitet …' : 'Meine Daten exportieren' }}</button
        ><button class="secondary" [disabled]="busy() || auth.busy()" (click)="logout()">
          Abmelden
        </button>
      </div>
      <p class="hint">
        Der Export enthält persönliche Angaben und deinen Spielverlauf. Bewahre ihn an einem
        sicheren Ort auf.
      </p>
      <a class="section-link" routerLink="/membership">Plus & Abo verwalten</a><a class="section-link" routerLink="/auth/reset">Passwort ändern</a
      ><a class="section-link" routerLink="/privacy">Datenschutz & Speicherung</a
      ><a class="section-link" routerLink="/support">Hilfe & Kontakt</a>
      <details (toggle)="clearDeletion($event)">
        <summary>Konto dauerhaft löschen</summary>
        <p>
          Dein Charakter, alle Aktivitäten, Interessen und Freischaltungen werden gelöscht. Dieser
          Schritt kann nicht rückgängig gemacht werden.
        </p>
        <p class="notice">Ein Store-Abo endet durch die Kontolöschung nicht automatisch.
          Kündige es bei Bedarf vorab in der Aboverwaltung von
          <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">Apple</a> oder
          <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener noreferrer">Google Play</a>.
          Ein neues Spielkonto erhält dein altes Abo nicht automatisch.</p>
        <form (submit)="$event.preventDefault(); remove()">
          <label
            >Mit deinem Passwort bestätigen<input
              name="delete-password"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="password"
              [disabled]="auth.busy()"
              required
              maxlength="128" /></label
          ><label class="check"
            ><input
              name="confirm-delete"
              type="checkbox"
              [(ngModel)]="confirmed"
              [disabled]="auth.busy()"
            /><span>Ich möchte mein Konto und meinen Spielstand dauerhaft löschen.</span></label
          ><button
            class="secondary danger"
            [disabled]="auth.busy() || busy() || !confirmed || !password"
          >
            Konto endgültig löschen
          </button>
        </form>
      </details>
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  readonly auth = inject(AuthStore);
  private readonly api = inject(ApiClient);
  private readonly exporter = inject(AccountExport);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  password = '';
  confirmed = false;
  async logout() {
    if (await this.auth.logout()) await this.router.navigateByUrl('/auth');
  }
  async exportData() {
    if (this.busy() || this.auth.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    const epoch = this.auth.epoch();
    try {
      const data = await this.auth.owned(headers => this.api.get<unknown>('/api/account/export', headers));
      if (epoch !== this.auth.epoch()) return;
      await this.exporter.exportAccountData(data);
      this.message.set('Dein Export wurde zum Speichern oder Teilen bereitgestellt.');
    } catch (error) {
      if (epoch === this.auth.epoch()) {
        this.error.set(
          error instanceof Error ? error.message : 'Der Export konnte nicht erstellt werden.',
        );
        if (error instanceof ApiError && error.status === 401) this.auth.expire();
      }
    } finally {
      this.busy.set(false);
    }
  }
  async remove() {
    if (!this.confirmed || !this.password || this.auth.busy() || this.busy()) return;
    const password = this.password;
    this.password = '';
    if (await this.auth.deleteAccount(password)) await this.router.navigateByUrl('/auth');
  }
  clearDeletion(event: Event) {
    if (!(event.target as HTMLDetailsElement).open) {
      this.password = '';
      this.confirmed = false;
    }
  }
}
