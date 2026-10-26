import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink],
  styleUrl: '../auth/account-page.scss',
  template: ` <main class="auth-shell">
    <a class="brand" routerLink="/auth">✳ herovera.</a>
    <article class="auth-card">
      <p class="eyebrow">LOKALE BETA · DATENINFORMATION</p>
      <h1>Dein Fortschritt. Deine Daten.</h1>
      <p class="notice">
        Diese App wird noch für die geschlossene Beta vorbereitet. Anschrift, Hosting-Standort und
        Kontakt werden vor der Freigabe ergänzt. Diese Vorschau ist noch keine
        veröffentlichungsfertige Datenschutzerklärung.
      </p>
      <h2>Verantwortlicher</h2>
      <p>Adderlyn Windsor, Österreich. Anschrift und Kontakt werden vor der Freigabe ergänzt.</p>
      <h2>Was gespeichert wird</h2>
      <p>
        Zum Konto gehören deine E-Mail-Adresse, ein geschützter Passwort-Hash, die
        E-Mail-Bestätigung und deine Sitzungen. Der Spielstand enthält deinen Chibi-Look, Namen,
        Interessen, Skill-Auswahl, Aktivitäten mit Datum und Dauer, XP, Quests und
        Aura-Freischaltungen.
      </p>
      <h2>Wofür die Daten da sind</h2>
      <p>
        Sie ermöglichen die Anmeldung, Wiederherstellung des Zugangs, geräteübergreifenden
        Fortschritt und Schutz vor doppelten Einträgen. Für Bestätigungen und Passwort-Links wird
        ein E-Mail-Dienst benötigt. Zum Schutz der Anmeldung werden zeitlich begrenzte
        Zugriffs-Zähler geführt.
      </p>
      <h2>Was auf deinem Gerät bleibt</h2>
      <p>
        Ton- und Bewegungseinstellungen bleiben auf dem Gerät. Dein freiwilliges Tagesgefühl bleibt
        im Kontomodus nur in der aktuellen Sitzung und wird beim Abmelden verworfen. Eine ältere
        lokale Demo wird nicht in dein Konto übertragen.
      </p>
      <p>
        Solange die Speicherung einer Aktivität unbestätigt ist, bleiben ihre Eintrags-ID, ihr Skill
        und ihre Dauer deinem Konto zugeordnet auf diesem Gerät. So kannst du nach einem Neustart
        denselben Eintrag wiederholen, ohne doppelte XP zu erhalten. Die Sicherung bleibt beim
        Abmelden erhalten und wird nach erfolgreicher Bestätigung oder Kontolöschung entfernt.
        Auf einem anderen Gerät ist dieser offene Eintrag nicht verfügbar.
      </p>
      <p>Bei einem unklaren Store-Kaufergebnis bleibt eine Kennzeichnung der offenen Prüfung
        unter deiner Konto-ID auf dem Gerät. Sie enthält keine Zahlungsdaten und verhindert
        versehentliche neue Kaufversuche, auch nach einem Neustart. Sie wird bei bestätigtem Zugang,
        eindeutigem Kaufabbruch oder Kontolöschung entfernt.</p>
      <h2>Wenn du Plus verwendest</h2>
      <p>Für native Käufe verarbeitet RevenueCat deine pseudonyme Konto-ID, Store-Produktkennungen,
        Kauf- und Abo-Status sowie technische SDK-Daten. Apple beziehungsweise Google wickeln die
        Zahlung ab; die App erhält keine Kreditkartendaten. Das Backend prüft den Zugang beim Anbieter.
        Bei Kontolöschung wird auch die Löschung des zugeordneten RevenueCat-Profils vorgemerkt.
        Die Abrechnung und Aufbewahrung durch den Store sind davon getrennt. Details zu Anbietern,
        Aufbewahrung und Rechtsgrundlagen werden vor Veröffentlichung ergänzt.</p>
      <h2>Keine Werbung oder Standorterfassung</h2>
      <p>
        Diese Version enthält keine Werbung, Analyse-Tracker, Standorterfassung oder Anbindung an
        Apple Health beziehungsweise Health Connect. Reale Aktivitäten trägst du selbst ein. Du
        kannst Erfolgsmusik und Effekte ausschalten.
      </p>
      <h2>Exportieren und löschen</h2>
      <p>
        Im Konto kannst du deine gespeicherten Kontodaten und deinen Spielstand exportieren oder mit
        Passwortbestätigung dauerhaft löschen. Bei einer späteren Live-Beta werden auch die
        Aufbewahrungsfristen für Sicherungskopien und technische Protokolle angegeben.
      </p>
      <a class="section-link" routerLink="/account">Mein Konto verwalten →</a
      ><a class="section-link" routerLink="/delete-account">Konto im Browser löschen →</a
      ><a class="section-link" routerLink="/support">Hilfe & Kontakt →</a
      ><a class="switch" routerLink="/auth">Zur Anmeldung</a>
    </article>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPage {}
