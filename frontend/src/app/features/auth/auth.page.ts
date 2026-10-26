import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';
import { ACCOUNT_MODE } from '../../data/account-mode';
import { safeReturnPath } from '../../state/auth.guard';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <a class="brand" routerLink="/demo">✳ herovera<span>.</span></a>
      <section class="auth-card" aria-labelledby="auth-title">
        <div class="hero-emblem" aria-hidden="true">✧</div>
        <p class="eyebrow">DEIN LEBEN. DEIN ABENTEUER.</p>
        <h1 id="auth-title">
          {{ registerMode() ? 'Hier beginnt deine Reise.' : 'Dein kleines Ich wartet.' }}
        </h1>
        <p class="intro">
          Ein bisschen bewegen. Neues lernen. Durchatmen. Lass deinen Chibi mit dir wachsen.
        </p>
        <div class="features">
          <span>Dein eigener Chibi</span><span>Echte Fortschritte</span><span>In deinem Tempo</span>
        </div>
        @if (auth.notice()) {
          <p class="notice" role="status">{{ auth.notice() }}</p>
        }
        @if (auth.error()) {
          <p class="error" role="alert">{{ auth.error() }}</p>
        }
        @if (auth.authenticated()) {
          <p class="account-email">Angemeldet als {{ auth.user()?.email }}</p>
          <a class="primary" routerLink="/dashboard">Meine Reise fortsetzen →</a>
          <a class="switch" routerLink="/account">Konto verwalten</a>
        } @else {
          <form (submit)="$event.preventDefault(); submit()">
            <label
              >E-Mail-Adresse<input
                name="email"
                type="email"
                autocomplete="email"
                inputmode="email"
                autocapitalize="none"
                spellcheck="false"
                [(ngModel)]="email"
                [disabled]="auth.busy()"
                maxlength="254"
                required
            /></label>
            <div class="password-field">
              <label for="auth-password">Passwort</label>
              <div class="password-row">
                <input
                  id="auth-password"
                  name="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [autocomplete]="registerMode() ? 'new-password' : 'current-password'"
                  [(ngModel)]="password"
                  [disabled]="auth.busy()"
                  minlength="15"
                  maxlength="128"
                  required
                /><button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Passwort verbergen' : 'Passwort anzeigen'"
                  [attr.aria-pressed]="showPassword()"
                >
                  {{ showPassword() ? '◉' : '◎' }}
                </button>
              </div>
            </div>
            @if (registerMode()) {
              <p class="hint">
                Mindestens 15 Zeichen. Eine lange, einzigartige Passphrase funktioniert gut.
                Bestätige anschließend deine E-Mail-Adresse.
              </p>
            }
            <button
              class="primary"
              type="submit"
              [disabled]="auth.busy() || !email.trim() || password.length < 15"
            >
              {{
                auth.busy()
                  ? 'Einen Moment …'
                  : registerMode()
                    ? 'Kostenloses Konto erstellen'
                    : 'Anmelden & weiterwachsen →'
              }}
            </button>
          </form>
          <button class="switch" type="button" [disabled]="auth.busy()" (click)="toggleMode()">
            {{ registerMode() ? 'Ich habe bereits ein Konto' : 'Neu hier? Kostenlos registrieren' }}
          </button>
          @if (!registerMode()) {
            <a class="switch" routerLink="/auth/reset">Passwort vergessen?</a>
          }
          <details>
            <summary>Bestätigungs-E-Mail fehlt?</summary>
            <p class="hint">
              Prüfe auch deinen Spam-Ordner. Gib oben deine E-Mail-Adresse ein, um einen neuen Link
              anzufordern.
            </p>
            <button
              class="secondary"
              [disabled]="auth.busy() || !email.trim()"
              (click)="auth.requestVerification(email.trim())"
            >
              Neuen Link anfordern
            </button>
          </details>
        }
        <p class="fine-print">
          Dein Konto und das Basisspiel sind kostenlos. Plus ist optional.<br />Vor deiner Registrierung:
          <a routerLink="/privacy">Datenschutz</a> und <a routerLink="/terms">Nutzung & Plus</a>.
        </p>
      </section>
      <nav class="quiet-links" aria-label="Informationen">
        <a routerLink="/demo">Erst einmal entdecken</a><a routerLink="/support">Hilfe</a
        ><a routerLink="/privacy">Datenschutz</a><a routerLink="/delete-account">Konto löschen</a>
      </nav>
    </main>
  `,
  styleUrl: './account-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly registerMode = signal(false);
  readonly showPassword = signal(false);
  constructor() {
    if (inject(ACCOUNT_MODE)) void this.auth.ensureSession();
  }
  email = '';
  password = '';
  toggleMode() {
    if (this.auth.busy()) return;
    this.registerMode.update((mode) => !mode);
    this.password = '';
    this.showPassword.set(false);
    this.auth.clearMessages();
  }
  async submit() {
    if (this.auth.busy() || !this.email.trim() || this.password.length < 15) return;
    const registering = this.registerMode();
    const ok = registering
      ? await this.auth.register(this.email.trim(), this.password)
      : await this.auth.login(this.email.trim(), this.password);
    if (this.destroyRef.destroyed) return;
    this.password = '';
    this.showPassword.set(false);
    if (ok && !registering)
      await this.router.navigateByUrl(
        safeReturnPath(this.route.snapshot.queryParamMap.get('returnTo')),
      );
    if (ok && registering) this.registerMode.set(false);
  }
}
