import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-delete-account-page',
  imports: [RouterLink],
  styleUrl: '../auth/account-page.scss',
  template: `<main class="auth-shell">
    <a class="brand" routerLink="/auth">✳ herovera.</a>
    <article class="auth-card" aria-labelledby="deletion-title">
      <p class="eyebrow">KONTO & DATEN</p>
      <h1 id="deletion-title">Dein Konto löschen.</h1>
      <p>Du kannst dein Herovera-Konto hier im Browser löschen, auch wenn du die App bereits
        deinstalliert hast. Du musst sie dafür nicht erneut installieren.</p>
      <a class="primary" routerLink="/account">Zur Kontoverwaltung →</a>

      <h2>So funktioniert es</h2>
      <ol>
        <li>Melde dich mit der E-Mail-Adresse deines Herovera-Kontos an.</li>
        <li>Öffne in der Kontoverwaltung „Konto dauerhaft löschen“.</li>
        <li>Bestätige mit deinem Passwort und dem Kontrollkästchen. Erst „Konto endgültig
          löschen“ führt die Löschung aus.</li>
      </ol>
      <p>Du kannst deine Daten vorher in der Kontoverwaltung exportieren. Die Löschung ist
        dauerhaft und kann nicht rückgängig gemacht werden.</p>

      <h2>Was gelöscht wird</h2>
      <p>Dein Konto samt Anmeldedaten und Sitzungen sowie dein Charakter, Aktivitäten,
        Interessen, Fortschritt und Freischaltungen werden aus der aktiven Datenbank entfernt.
        Danach kannst du dich mit diesem Konto nicht mehr anmelden.</p>
      <p>Falls ein RevenueCat-Profil für Store-Käufe vorhanden ist, wird dessen Löschung
        beim Anbieter vorgemerkt und separat verarbeitet. Daten bei Apple oder Google und
        ihre gesetzlichen Aufbewahrungspflichten sind davon getrennt.</p>

      <h2>Ein Abo separat verwalten</h2>
      <p>Du kannst dein Konto unabhängig vom Abo-Status löschen. Die Kontolöschung kündigt
        ein Store-Abo jedoch nicht automatisch. Verwalte es bei
        <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">Apple</a>
        oder <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener noreferrer">Google Play</a>.
        Ein neues Spielkonto erhält dein bisheriges Abo nicht automatisch.</p>

      <h2>Passwort vergessen?</h2>
      <p>Setze dein Passwort zurück und melde dich anschließend erneut an.</p>
      <a class="section-link" routerLink="/auth/reset">Passwort zurücksetzen →</a>
      <p class="notice">Lokale Vorabversion: Der öffentliche Supportkontakt sowie die Fristen
        für Sicherungskopien und technische Protokolle stehen noch aus. Diese Angaben werden
        vor der Veröffentlichung ergänzt.</p>
      <a class="section-link" routerLink="/privacy">Dateninformation →</a>
      <a class="section-link" routerLink="/support">Hilfe & Kontakt →</a>
    </article>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountPage {}
