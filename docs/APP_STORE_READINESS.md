# App Store Readiness & Reichweite · V0.1

Stand: 08.09.2026. Verbindlicher Produkt-/Release-Plan; die App ist noch keine einreichbare Store-Version.
Die konkreten Store-, SDK- und Kontoanforderungen werden beim nativen Scaffold und vor Einreichung
erneut anhand der offiziellen Quellen geprüft.

## Auffindbarkeit: ASO und SEO

ASO (App Store Optimization) betrifft die Auffindbarkeit und Installation im Apple App Store und
bei Google Play. Projektziel: verständliches Nutzenversprechen, passende Suchbegriffe, eigene
wiedererkennbare Art, echte Screenshots und konsistente Sprache. Zielgruppe zuerst: Menschen, die
Training, Lernen und Erholung mit RPG-Progression verbinden möchten. DE zuerst; EN vor einem
internationalen Release vollständig in App und Store übersetzen. Keine Ranking-Garantie.

SEO betrifft die spätere öffentliche Website: Produktseite, Features, FAQ, Support und hilfreiche
eigene Inhalte. Diese Seiten sollen statisch/prerendered auslieferbares HTML, eindeutige Titel und
Beschreibungen, Canonicals, Sitemap und bei mehreren Sprachen hreflang erhalten. Search Console
dient zur Prüfung der Indexierung. Das persönliche Dashboard bleibt eine CSR-App und ist kein
Suchergebnis-Ziel. noindex ersetzt keinen Zugriffsschutz. Diese Aufteilung ist unsere
Architekturentscheidung auf Basis der [Google-Hinweise zu JavaScript-SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Store-Auftritt vorbereiten

| Inhalt | Apple | Google Play |
|---|---|---|
| Name | Bis 30 Zeichen | Bis 30 Zeichen |
| Kurzpositionierung | Subtitle bis 30 Zeichen | Kurzbeschreibung bis 80 Zeichen |
| Beschreibung | Funktions- und Mitgliedschaftsdetails wahrheitsgemäß | Vollbeschreibung bis 4000 Zeichen |
| Suchbegriffe | Eigenes Keywords-Feld: konservativ 100 Bytes; vor Export prüfen | Relevante Begriffe natürlich im Listing verwenden |
| Medien | Eigenes Icon, echte App-Screenshots, optional Preview | Eigenes Icon, Screenshots und erforderliche Grafiken |

Grundlagen: [Apple Product Page](https://developer.apple.com/app-store/product-page/),
[Apple Metadaten-Referenz](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/),
[Google Play Listing](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en).
Nicht automatisch dieselben Texte in beide Stores kopieren.

„Everbloom“ bleibt Arbeitstitel. Name, Domain, Store-Verfügbarkeit und Markenlage vor Branding und
Registrierung prüfen. Suchbegriffe wie „Habit RPG“, „Gewohnheiten“, „reales Leben“, „Quests“ sind
Recherchehypothesen, kein bereits validiertes Keyword-Set. Solo-Leveling-/FFXIV-Namen oder fremde
Figuren gehören nicht ins Listing. Kategorie und Altersfreigabe anhand der tatsächlichen Funktionen
wählen; Trainingsbezug und Health-Erklärungen vor Einreichung prüfen.

Geplante Screenshot-Geschichte: (1) dein Charakter, (2) eine reale Aktivität gibt Fortschritt,
(3) eigene Skills, (4) Daily Quests und Erholung, (5) Wochenboss. Spätere Member-Screens klar
kennzeichnen. Kein Screenshot darf noch fehlende Features als verfügbar verkaufen.

## Technische Entscheidungen ab jetzt

- Angular-Web-Build weiter kapseln: Domain → State → Oberfläche, Plattformfunktionen in kleine
  Adapter. Spring Boot bleibt für Fortschritt und Berechtigungen maßgeblich.
- Capacitor zuerst als Geräte-Probe in M1b, bevor viele neue Screens gebaut werden; voller
  nativer Release weiterhin M4. Produktions-Webassets aus `frontend/dist/everbloom/browser`
  lokal in die App synchronisieren. Keine localhost-/Live-Reload-URL im Store-Build.
  [Capacitor Workflow](https://capacitorjs.com/docs/basics/workflow),
  [Konfiguration](https://capacitorjs.com/docs/config).
- Native Bundle-ID und Android applicationId erst nach bestätigter Produktidentität setzen.
  Keine erfundene Domain als endgültige ID. Signing-Schlüssel getrennt von Quellcode verwalten.
- Jede neue Ansicht für Touch, kleine Displays, große Schrift, VoiceOver/TalkBack, Tastatur,
  Notch/Safe Areas und kurze Unterbrechungen gestalten. Android-Zurück und iOS-Navigation testen.
- Netzverlust, Timeout, Resume, unterbrochene Aktivität und wiederholten Request vor Beta prüfen.
  Keine verlorenen Einträge oder doppelten XP. Offline-Schreib-Sync wird erst mit eigenem Konfliktkonzept
  ergänzt; bis dahin ehrliche Offline-Rückmeldung.
- Texte vor internationalem Release in Angular-i18n überführen. Einheiten, Zahlen, Sprache und
  Zeitperioden zentral behandeln; die Browser-Demo nutzt aktuell Deutsch.
- Benachrichtigungen, Analytics und Health-Anbindungen nur bei konkretem Produktbedarf hinzufügen.
  Datenflüsse und Drittanbieter-SDKs dokumentieren, bevor ein SDK integriert wird.

Bereits im Web-Slice umgesetzt: responsive Layouts, semantische Controls, Fehler-/Statusmeldungen,
reduzierte Bewegung, deutsche Zahlen, Safe-Area-Grundlage und vergrößerte mobile Formfelder.
Die native Abnahme dieser Funktionen ist noch offen.

## Verbindliche Store-Gates vor Release

- [ ] Stabiler vollständiger Kernflow, produktives Backend, korrektes Review-Konto und klare
      Review-Anleitung. Die Demo darf nicht als fertige App eingereicht werden.
- [ ] Datenschutz-/Support-Seiten erreichbar; Datensammlung und alle SDKs vollständig inventarisiert.
      App Privacy und Data Safety stimmen mit dem tatsächlichen Verhalten überein.
- [ ] Mit Accounts: auffindbare Löschfunktion in der App, zusätzlicher öffentlicher Löschweg für
      Google Play, nachvollziehbarer Löschprozess im Backend und definierte Aufbewahrung.
- [ ] Membership: Store-Abrechnung als Basis für digitale Freischaltungen, servergeprüfte Käufe,
      Wiederherstellung, Ablauf/Kündigung, Erstattungen und Gerätewechsel testen. Regionale
      Ausnahmen vor Implementierung prüfen; kein ungeprüfter Web-Checkout in der nativen App.
- [ ] Authentifizierung inklusive gegebenenfalls geltender Login-Alternative prüfen, sobald
      Drittanbieter-Login gewählt wird. Sichere Tokenablage auf Geräten und HTTPS.
- [ ] Rechte an allen Assets, korrekte Alters-/Inhaltseinstufung und wahrheitsgemäße Listings.
- [ ] Aktuelle Xcode-/iOS-SDK- und Android-Target-API-Anforderungen, Signing, Privacy Manifests
      und Konto-/Testvoraussetzungen erfüllt.
- [ ] TestFlight und passende Google-Play-Testspur durchlaufen; echte Geräte, Netzwechsel,
      Schriftvergrößerung, Screenreader, Kauf-/Löschpfade und Crashfreiheit protokolliert.

Gates beruhen auf [Apple Review Guidelines](https://developer.apple.com/app-store/review/guidelines/),
[Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/),
[Google Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en),
[Google Account Deletion](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)
und [Google Payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en).
Sie sind Produktanforderungen für den geplanten Release, keine bereits bestandene Abnahme.

## Reichweite messbar entwickeln

Vor Beta: mit freiwilligen Testern Nutzenversprechen und ersten Aktivitätsflow prüfen.
Vor Launch: lokale Store-Texte/Medien fertigstellen, Website indexierbar machen, funktionierende
Store-Links ergänzen. Keine Domain kaufen, Konten registrieren oder Inhalte veröffentlichen, bevor
Name und Launch-Auftrag feststehen.

Nach Launch: Store-Impressionen → Produktseitenbesuche → Installationen → erste Aktivität sowie
D1/D7-Nutzung und Crash-/Abbruchraten beobachten. Zunächst vorhandene Store-Berichte verwenden;
eigene Analytics erst mit definierter Datensparsamkeit. Pro Experiment eine Hypothese (Icon,
Screenshot-Einstieg, Positionierung) und Erfolgskriterium. Kleine Stichproben nicht überinterpretieren.
Reviews freiwillig über Plattformmechanismen erfragen, ohne XP-/Loot-Anreiz.

## Lieferplan

| Zeitpunkt | Ergebnis |
|---|---|
| Jetzt / M0–M1a | Dieses Dokument, XP-Balancing, mobile Web-Grundlage; keine Veröffentlichung |
| M1b | Früher Capacitor-Gerätetest, Account-/Löschmodell, zuverlässiger Aktivitätsflow |
| M2 | Eigene Art/Assets; lokalisierbare Texte und prüfbare Screenshots |
| M3 | Storefähige Membership und serverseitige Entitlements |
| M4 | Signierte native Builds, Store-Metadaten, Privacy-Angaben, Geräte-/Beta-Abnahme |
| M5 | Öffentliche SEO-Seiten, Release-Freigabe, ASO-Experimente und Qualitätsmessung |
