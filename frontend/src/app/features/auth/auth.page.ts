import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <a class="brand" routerLink="/dashboard" aria-label="Everbloom">everbloom<span>.</span></a>
      <section class="auth-card" aria-labelledby="auth-title">
        <p class="eyebrow">DEINE REISE BEGINNT HIER</p>
        <h1 id="auth-title">{{ registerMode() ? 'Dein Konto anlegen.' : 'Willkommen zurück.' }}</h1>
        <p class="intro">Charakter, Aktivitäten und Belohnungen gehören zu deinem persönlichen Spielstand.</p>
        @if (auth.notice()) { <p class="notice" role="status">{{ auth.notice() }}</p> }
        @if (auth.error()) { <p class="error" role="alert">{{ auth.error() }}</p> }
        <form (submit)="$event.preventDefault(); submit()" novalidate>
          <label>E-Mail-Adresse<input name="email" type="email" autocomplete="email" [(ngModel)]="email" required /></label>
          <label>Passwort<input name="password" type="password" [autocomplete]="registerMode() ? 'new-password' : 'current-password'" [(ngModel)]="password" minlength="15" maxlength="128" required /></label>
          @if (registerMode()) { <p class="hint">Mindestens 15 Zeichen. Dein Passwort wird nicht im Browser gespeichert.</p> }
          <button class="primary" type="submit" [disabled]="auth.busy() || !email.trim() || password.length < 15">
            {{ auth.busy() ? 'Einen Moment …' : registerMode() ? 'Konto erstellen' : 'Anmelden' }}
          </button>
        </form>
        <button class="switch" type="button" (click)="toggleMode()">
          {{ registerMode() ? 'Ich habe bereits ein Konto' : 'Noch kein Konto? Jetzt registrieren' }}
        </button>
        <p class="fine-print">Mit deinem Konto wird dein Spielstand später geräteübergreifend sicher zugeordnet.</p>
      </section>
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100svh; background:radial-gradient(circle at 50% 0,#263b31,#132019 48%,#0e1713); }
    .auth-shell { min-height:100svh; display:grid; place-items:center; padding:32px 20px 48px; }
    .brand { position:fixed; top:24px; left:24px; color:#dbe7c7; font-size:18px; letter-spacing:.08em; font-weight:700; }
    .brand span { color:#d1e79f; }
    .auth-card { width:min(100%,460px); padding:32px 24px; border:1px solid #9dbb7738; border-radius:22px; background:#16271fee; box-shadow:0 24px 80px #08100baa; }
    .eyebrow { color:#b8c99f; font-size:11px; letter-spacing:.18em; }
    h1 { margin:12px 0 10px; font-size:clamp(28px,7vw,42px); line-height:1.05; color:#e9f0dd; }
    .intro,.fine-print,.hint { color:#aebcab; line-height:1.65; }
    form { display:grid; gap:18px; margin-top:24px; }
    label { display:grid; gap:8px; color:#d7e2cf; font-weight:600; font-size:14px; }
    input { width:100%; min-height:48px; border:1px solid #9bb68c55; border-radius:10px; background:#0e1914; color:#eff7e8; padding:12px 14px; font-size:16px; }
    .primary { width:100%; min-height:50px; margin-top:4px; }
    .switch { display:block; margin:22px auto 0; border:0; background:none; color:#cbe0a9; text-decoration:underline; min-height:44px; padding:8px; }
    .notice { padding:12px 14px; border-radius:10px; background:#30462b; color:#e0efc5; line-height:1.5; }
    .error { color:#f3b9a9; line-height:1.5; }
    .fine-print { font-size:12px; margin:20px 0 0; text-align:center; }
    @media (min-width:700px) { .auth-card { padding:44px 48px; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly registerMode = signal(false);
  email = '';
  password = '';

  toggleMode() { this.registerMode.update((mode) => !mode); this.auth.expire(''); }

  async submit() {
    if (this.auth.busy() || !this.email.trim() || this.password.length < 15) return;
    const ok = this.registerMode()
      ? await this.auth.register(this.email.trim(), this.password)
      : await this.auth.login(this.email.trim(), this.password);
    this.password = '';
    if (ok && !this.registerMode()) await this.router.navigateByUrl(this.safeReturnTo());
    if (ok && this.registerMode()) this.registerMode.set(false);
  }

  private safeReturnTo() {
    const value = this.route.snapshot.queryParamMap.get('returnTo') ?? '/character/create';
    return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/auth') ? value : '/character/create';
  }
}
