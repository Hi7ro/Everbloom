# App Store Readiness & Reichweite · V0.2

Produktstand aktualisiert: 08.10.2026. Verbindlicher Produkt-/Release-Plan; die App ist noch keine einreichbare Store-Version.
Die konkreten Store-, SDK- und Kontoanforderungen werden beim nativen Scaffold und vor Einreichung
erneut anhand der offiziellen Quellen geprüft.

## Auffindbarkeit: ASO und SEO

ASO (App Store Optimization) betrifft die Auffindbarkeit und Installation im Apple App Store und
bei Google Play. Projektziel: verständliches Nutzenversprechen, passende Suchbegriffe, eigene
wiedererkennbare Art, echte Screenshots und konsistente Sprache. Zielgruppe zuerst: Menschen, die
Training, Lernen und Erholung mit RPG-Progression verbinden möchten. Finale UI-Zielsprachen:
Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch, Chinesisch, Japanisch, Russisch und
Koreanisch. Der Prototyp ist aktuell deutsch; Übersetzungen und Sprachpakete folgen in der
Endphase/M4. Keine Ranking-Garantie.

Vor der Übersetzungsphase sind Schweizer Hochdeutsch (`de-CH`) versus Schweizerdeutsch (`gsw`),
Portugiesisch Portugal versus Brasilien und vereinfachtes versus traditionelles Chinesisch zu
entscheiden. Keine Sprachvariante gilt bereits als gewählt. App-Screens, Status-/Fehlermeldungen,
Accessibility-Texte, Store und Support werden gemeinsam lokalisiert; Datum, Zahlen, Pluralformen
und Fallback auf Deutsch gehören zur Abnahme. Sprachnamen statt Länderflaggen verwenden. Die
Verfügbarkeit der jeweiligen Store-Locale wird vor Erstellung der Listings geprüft.

SEO betrifft die spätere öffentliche Website: Produktseite, Features, FAQ, Support und hilfreiche
eigene Inhalte. Diese Seiten sollen statisch/prerendered auslieferbares HTML, eindeutige Titel und
Beschreibungen, Canonicals, Sitemap und bei mehreren Sprachen hreflang erhalten. Search Console
dient zur Prüfung der Indexierung. Das persönliche Dashboard bleibt eine CSR-App und ist kein
Suchergebnis-Ziel. noindex ersetzt keinen Zugriffsschutz. Diese Aufteilung ist unsere
Architekturentscheidung auf Basis der [Google-Hinweise zu JavaScript-SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Store-Auftritt vorbereiten

Das konkrete deutsche Textpaket mit geprüften Feldlängen, Screenshot-Motiven und Review-Anleitung
steht in [STORE_LISTING_DE.md](STORE_LISTING_DE.md). Es ist lokal vorbereitet; öffentliche URLs,
funktionierende Review-Zugänge und die Freigabe des nativen Release-Kandidaten stehen noch aus.

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

„Herovera“ ist der gewählte App-Name. Domain, Store-Verfügbarkeit und Markenlage vor
Registrierung gesondert prüfen. Suchbegriffe wie „Habit RPG“, „Gewohnheiten“, „reales Leben“, „Quests“ sind
Recherchehypothesen, kein bereits validiertes Keyword-Set. Solo-Leveling-/FFXIV-Namen oder fremde
Figuren gehören nicht ins Listing. Kategorie und Altersfreigabe anhand der tatsächlichen Funktionen
wählen; Trainingsbezug und Health-Erklärungen vor Einreichung prüfen.

Geplante Screenshot-Geschichte: (1) dein Charakter, (2) eine reale Aktivität gibt Fortschritt,
(3) persönliche Quests und Skills, (4) Charaktergestaltung, (5) erster Kampagnenboss,
(6) ein klar als optionales Plus gekennzeichnetes späteres Kapitel. Die konkreten Motive und
Bildtexte stehen im Textpaket. Kein Screenshot darf noch fehlende Features als verfügbar verkaufen.

## Beschlossenes Membership-Preisziel

Geplant sind **3,99 € pro Monat** als monatlicher Endkundenpreis; ein Jahrespreis wurde nicht
festgelegt. Free bleibt dauerhaft spielbar und umfasst die fünf Normal-Bosse bis Level 50. Plus ergänzt
35 Bossbegegnungen sowie +10 % Charakter-Aktivitäts-XP. Kauf-/Restore-Anbindung, serverseitige
Entitlements und Bonus sind implementiert. Store-Produkte sind noch nicht nachgewiesen; echte
Käufe und die externe Provider-Einrichtung bleiben offen. Maßgeblich ist MONETIZATION.md.

Vor M3 regionale Store-Preisstufen, Steuern, Plattformabzüge und Nettoerlös prüfen. Im produktiven
Checkout den vom jeweiligen Store gelieferten lokalisierten Preis verwenden. Der Zielpreis allein
ersetzt weder die Store-Konfiguration noch Kaufprüfung, Restore oder Kündigungs-/Ablaufregeln.

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
- Jede neue Ansicht zuerst für Smartphones im Hochformat und Tablets im Hoch-/Querformat
  gestalten. Projektziele: Touchflächen mindestens 44 CSS-px, bevorzugt 48 CSS-px; gut erreichbarer
  Aktivitätsbutton, Creator-Speichern in erreichbarer Fußleiste, große Schrift und VoiceOver/
  TalkBack. Navigation/Fußleisten berücksichtigen Tastatur, Notch und Safe Areas und verdecken
  keine Inhalte. Android-Zurück, iOS-Navigation und kurze Unterbrechungen auf Geräten testen.
- Netzverlust, Timeout, Resume, unterbrochene Aktivität und wiederholten Request vor Beta prüfen.
  Keine verlorenen Einträge oder doppelten XP. Offline-Schreib-Sync wird erst mit eigenem Konfliktkonzept
  ergänzt; bis dahin ehrliche Offline-Rückmeldung.
- Texte jetzt auslagerbar halten und ein zentrales Locale-Modell planen; konkrete Sprachpakete
  erst zur Übersetzungsphase ergänzen. Einheiten, Zahlen, Datum, Pluralformen, Sprache und
  Zeitperioden zentral behandeln. Die Browser-Demo nutzt aktuell Deutsch.
- Benachrichtigungen, Analytics und Health-Anbindungen nur bei konkretem Produktbedarf hinzufügen.
  Datenflüsse und Drittanbieter-SDKs dokumentieren, bevor ein SDK integriert wird.

Bereits im Web-Slice umgesetzt: responsive Layouts, semantische Controls, Fehler-/Statusmeldungen,
reduzierte Bewegung, deutsche Zahlen, Safe-Area-Grundlage und vergrößerte mobile Formfelder.
Charakter und Fortschritt werden im bestätigten Konto serverseitig gespeichert. Ton-, Feuerwerk-
und Bewegungspräferenzen liegen getrennt davon auf dem Gerät. Die öffentliche Demo bleibt isoliert.
Es gibt kein Tracking- oder Health-SDK. Account-/Serverregeln sind lokal geprüft; der Nachweis
des Gerätewechsels über ein öffentliches Backend steht weiterhin aus.

Der Chibi verwendet modulare SVG-Grafik mit räumlicher Wirkung und optionalem Idle. Kurzes
Feuerwerk und ein eigener Web-Audio-Jingle begleiten ausgewählte Meilensteine. Separate Controls
und reduzierte Bewegung gehören zur Web-Abnahme; Audio-Unterbrechung, Gerätestummschaltung,
Hintergrund/Resume und Screenreader sind zusätzlich auf echten Geräten zu prüfen. Die native
Abnahme dieser Funktionen ist noch offen.

## Mobile-Game-Abnahme

Phone-Hochformat hat Priorität; Tablets erhalten im Hoch-/Querformat angepasste Spalten und
sinnvolle Inhaltsbreiten. Haupttexte haben als Projektziel 14–16 CSS-px, sekundäre Texte mindestens
12 CSS-px; Vergrößerung darf Bedienung nicht abschneiden. Mobile Formfelder bleiben gut lesbar.
Inklusive geöffneter Tastatur müssen Aktivität, Navigation und Creator-Speichern erreichbar bleiben.

Der aktuelle Ausbau verbessert mobile Shell, Creator-Fußleiste und Tablet-Layouts; tatsächlich
bestandene Prüfungen stehen in VALIDATION. Bewegung bleibt abschaltbar. SVG-Gradienten und andere
Defs brauchen pro Chibi-Instanz eindeutige IDs; Idle/Effekte sollen auf mobilen Geräten sparsam
bleiben. Lade-, Fehler-, Offline- und Resume-Verhalten gehören zum Kernflow. Der lokale Memory-
Mock ist kein Beleg für funktionierende Netzwerkwiederaufnahme oder Offline-Synchronisation.

Lifecycle- und Store-Billing-Adapter sind vorhanden; Kauf-, Audio-Unterbrechungs- und
Wiederaufnahmeverhalten sind noch auf echten Geräten zu prüfen. Native Haptik bleibt eine Erweiterung. Haptik bleibt optional. Browserprüfungen
ersetzen keine native Abnahme und erfüllen allein keine der folgenden Store-Gates.

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
| Jetzt / M0–M1a | Mobile Web-Grundlage, Balance V0.2, lokaler Creator und Erfolgsfeedback; keine Veröffentlichung |
| M1b | Früher Capacitor-Gerätetest, Account-/Löschmodell, zuverlässiger Aktivitätsflow |
| M2 | Eigene Art/Assets; lokalisierbare Texte und prüfbare Screenshots |
| M3 | Storefähige Membership und serverseitige Entitlements |
| M4 | Signierte native Builds, neun UI-Zielsprachen mit geklärten Varianten, Store-Metadaten, Privacy-Angaben, Geräte-/Beta-Abnahme |
| M5 | Öffentliche SEO-Seiten, Release-Freigabe, ASO-Experimente und Qualitätsmessung |
