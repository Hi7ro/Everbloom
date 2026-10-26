import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-recovery-page',
  imports: [FormsModule, RouterLink],
  styleUrl: './account-page.scss',
  template: `<main class="auth-shell">
    <a class="brand" routerLink="/auth">✳ herovera.</a>
    <section class="auth-card">
      <p class="eyebrow">DEIN KONTO</p>
      <h1>{{ verification ? 'Eine kleine Bestätigung.' : 'Zurück zu deiner Reise.' }}</h1>
      @if (auth.notice()) {
        <p class="notice" role="status">{{ auth.notice() }}</p>
      }
      @if (auth.error()) {
        <p class="error" role="alert">{{ auth.error() }}</p>
      }
      @if (!done()) {
        @if (verification) {
          <p>Bestätige deine E-Mail-Adresse, damit du deinen eigenen Charakter erstellen kannst.</p>
          @if (token) {
            <button class="primary" [disabled]="auth.busy()" (click)="verify()">
              {{ auth.busy() ? 'Wird bestätigt …' : 'E-Mail-Adresse bestätigen' }}
            </button>
          } @else {
            <p class="error">
              Der Bestätigungslink fehlt. Öffne bitte den vollständigen Link aus deiner E-Mail.
            </p>
          }
        } @else if (token) {
          <form (submit)="$event.preventDefault(); reset()">
            <label
              >Neues Passwort<input
                name="password"
                type="password"
                autocomplete="new-password"
                [(ngModel)]="password"
                minlength="15"
                maxlength="128"
                required
                [disabled]="auth.busy()"
            /></label>
            <p class="hint">
              Mindestens 15 Zeichen. Nach der Änderung werden bestehende Sitzungen beendet.
            </p>
            <button class="primary" [disabled]="auth.busy() || password.length < 15">
              Neues Passwort speichern
            </button>
          </form>
        } @else {
          <p>Wir schicken dir einen Link, mit dem du dein Passwort erneuern kannst.</p>
          <form (submit)="$event.preventDefault(); auth.requestPassword(email.trim())">
            <label
              >E-Mail-Adresse<input
                name="email"
                type="email"
                autocomplete="email"
                autocapitalize="none"
                [(ngModel)]="email"
                maxlength="254"
                required
                [disabled]="auth.busy()" /></label
            ><button class="primary" [disabled]="auth.busy() || !email.trim()">
              Link anfordern
            </button>
          </form>
        }
      }
      <a class="switch" routerLink="/auth">Zur Anmeldung</a>
      @if (done()) {
        <p class="hint">Du kannst dich auch wieder in der Herovera-App anmelden.</p>
      }
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryPage {
  readonly auth = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly verification = this.route.snapshot.routeConfig?.path === 'auth/verify';
  readonly token = new URLSearchParams(this.route.snapshot.fragment ?? '').get('token') ?? '';
  readonly done = signal(false);
  email = '';
  password = '';
  constructor() {
    this.auth.clearMessages();
    // Tokens never enter request URLs, analytics or the retained browser history.
    if (this.token)
      void this.router.navigate([], {
        relativeTo: this.route,
        fragment: undefined,
        replaceUrl: true,
        queryParamsHandling: 'preserve',
      });
  }
  async verify() {
    if (this.token && (await this.auth.verify(this.token))) this.done.set(true);
  }
  async reset() {
    if (!this.token || this.password.length < 15 || this.auth.busy()) return;
    const password = this.password;
    this.password = '';
    if (await this.auth.resetPassword(this.token, password)) this.done.set(true);
  }
}
