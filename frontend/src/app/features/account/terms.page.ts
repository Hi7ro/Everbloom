import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-terms-page', imports: [RouterLink], styleUrl: '../auth/account-page.scss',
  template: `<main class="auth-shell"><a class="brand" routerLink="/dashboard">✳ herovera.</a>
    <article class="auth-card"><p class="eyebrow">NUTZUNG & PLUS</p><h1>Deine Reise. Klare Regeln.</h1>
      <p class="notice">Vorbereitung für den ersten Release. Anschrift, Kontakt und die abschließenden
      Vertragsinformationen stehen noch aus. Diese Seite beschreibt das Produkt und ersetzt noch
      keine vollständigen veröffentlichten Nutzungsbedingungen. Im Vorschau-Modus sind keine Käufe möglich.</p>
      <h2>Anbieter</h2><p>Adderlyn Windsor, Österreich. Anschrift und Kontakt werden vor der Freigabe ergänzt.</p>
      <h2>Kostenlos spielen</h2><p>Dein Charakter und die Aktivitäten bleiben ohne Abo spielbar.
      Die fünf normalen Bossbegegnungen bis Level 50 einschließlich Wolkenkönig gehören zu Free.
      Diese Bossgrenze begrenzt weder dein Charakterlevel noch deine XP oder Skills.
      Fortschritt entsteht durch deine eingetragenen Aktivitäten.</p>
      <h2>Plus pro Monat</h2><p>Plus eröffnet die Bosse von Level 60 bis 100 sowie Hard, Episch
      und Ultimate bei allen entdeckten Bossen, sobald
      dein Charakter das nötige Level hat. Es gewährt 10 % zusätzliche Charakter-Aktivitäts-XP,
      pro Eintrag abgerundet. Skill-XP, Questboni und direkter Boss-Schaden bleiben unverändert.</p>
      <p>Für einen Kauf gelten der im Apple App Store oder Google Play angezeigte Preis und die
      dort bestätigte monatliche Laufzeit. Das Abo verlängert sich automatisch, bis du es im
      jeweiligen Store kündigst. Die Store-Kaufbestätigung zeigt Zahlungs- und Kündigungsdetails.</p>
      <h2>Nach einer Kündigung</h2><p>Plus gilt bis zum bestätigten Ende des Zugangs. Bereits verdiente
      Level, XP und kosmetische Belohnungen bleiben in deinem Spielkonto. Neue Kämpfe ab Bosslevel 60
      sowie Hard, Episch und Ultimate benötigen danach erneut Plus. Normale Bosse bis Level 50 bleiben zugänglich.</p>
      <h2>Konto und Wiederherstellung</h2><p>Verwende auf deinen Geräten dasselbe Spielkonto.
      Stelle einen Kauf mit demselben Store-Konto wieder her. Bei Zugangsproblemen nutze zuerst
      die Passwortwiederherstellung. Kontolöschung kündigt kein Store-Abo; ein neues Spielkonto
      erhält ein altes Abo nicht automatisch.</p>
      <h2>Dein Tempo zählt</h2><p>Auch Pausen sind Teil der Reise. Die App ersetzt keine persönliche
      Trainings- oder Gesundheitsberatung. Trage nur tatsächlich durchgeführte Aktivitäten ein.</p>
      <a class="section-link" routerLink="/membership">Plus verwalten →</a>
      <a class="section-link" routerLink="/privacy">Dateninformation →</a>
      <a class="section-link" routerLink="/support">Hilfe →</a>
    </article></main>`, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsPage {}
