import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-support-page',
  imports: [RouterLink],
  styleUrl: '../auth/account-page.scss',
  template: ` <main class="auth-shell">
    <a class="brand" routerLink="/auth">✳ herovera.</a>
    <article class="auth-card">
      <p class="eyebrow">HILFE · BETA</p>
      <h1>Wir finden den nächsten Schritt.</h1>
      <h2>Ich kann mich nicht anmelden</h2>
      <p>
        Bestätige zuerst deine E-Mail-Adresse. Falls die Nachricht fehlt, prüfe den Spam-Ordner und
        fordere auf der Anmeldeseite einen neuen Link an. Ein abgelaufener Link lässt sich ebenfalls
        ersetzen.
      </p>
      <a class="section-link" routerLink="/auth/reset">Passwort zurücksetzen →</a>
      <h2>Ein Eintrag bleibt unbestätigt</h2>
      <p>
        Prüfe deine Internetverbindung und sende denselben Skill mit denselben Minuten erneut. Seine
        Eintrags-ID verhindert doppelte XP. Erstelle vor dieser Bestätigung keinen anderen Eintrag.
      </p>
      <h2>Wo sind meine Demo-XP?</h2>
      <p>
        Ein echtes Konto beginnt mit Level 1. Vorbereitete Beispiele und lokale Demo-Spielstände
        werden nicht übernommen. Dein persönlicher Fortschritt entsteht aus deinen realen
        Aktivitäten.
      </p>
      <h2>Wann startet die neue Woche?</h2>
      <p>
        In dieser Beta gelten Tageswechsel und Montag nach der Zeitzone Europe/Vienna. Dein
        Betriebssystem-Datum verändert die Vergabe von Belohnungen nicht.
      </p>
      <h2>Konto ohne App löschen</h2>
      <p>Auch nach einer Deinstallation kannst du dein Konto im Browser verwalten und dauerhaft löschen.</p>
      <a class="section-link" routerLink="/delete-account">Zur Kontolöschung →</a>
      <h2>Feedback & Kontakt</h2>
      <p>Herovera wird von Adderlyn Windsor in Österreich entwickelt.</p>
      <p class="notice">
        Für diese lokale Vorabversion ist noch kein öffentlicher Supportkanal eingerichtet. Vor der
        Verteilung der Beta werden die vollständige Anschrift und der Supportkontakt hier ergänzt.
      </p>
      <p>
        Für einen Fehlerbericht helfen Gerätemodell, Betriebssystem, die angezeigte Meldung und die
        Schritte davor. Teile keine Passwörter oder Bestätigungslinks.
      </p>
      <a class="switch" routerLink="/auth">Zur Anmeldung</a>
    </article>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportPage {}
