# Architecture · V0.3

## Ziel

Angular/TypeScript als CSR-SPA; später identischer Web-Build in Capacitor für iOS/Android.
Spring Boot als modularer Monolith mit PostgreSQL. Kein SSR: das persönliche Dashboard braucht
keine Suchmaschinenoptimierung; ein zusätzlicher Node-Server wäre hier unnötig.
Die öffentliche Produkt-/Support-Website bekommt später statische oder vorgerenderte Seiten
für SEO. ASO optimiert die Store-Seiten separat. Das private App-Shell erhält noindex;
Authentifizierung schützt später die eigentlichen Daten.
Siehe [App Store Readiness & Reichweite](APP_STORE_READINESS.md).

Angular 21 mit kompatibler TypeScript-Version und lokalem CLI unterstützt die vorhandene
Node-20.20-Umgebung. Standalone, zoneless Change Detection, Signals und lazy Router-Routen
für Dashboard und `/character/create`. Neue Routenseiten starten oben; Zurücknavigation stellt
die Scrollposition wieder her, Abschnittsanker bleiben nutzbar.
Versionsreferenz: https://angular.dev/reference/versions

## Frontend-Schichten

```text
features/dashboard/ + features/character-creator/   Darstellung + lokaler Formularzustand
          ↓
state/game.store.ts    Signals, computed Views, Commands, Feedback
          ↓
data/game.repository  Snapshot laden / Aktivität verbuchen / Profil ändern / Demo-Reset
          ↓
data/mock-*            speichert in Memory, ruft Domainfunktion auf
          ↓
domain/                Modelle, Katalog/Balance und reine Progressionsfunktionen
```

Views kennen weder Mock-Seeds noch Transport. Der Store kennt den per InjectionToken bereitgestellten
Adapter. Repository-Methoden sind asynchron, damit ein HttpClient-Adapter später dieselbe Oberfläche
bedient. Die Domain importiert weder Angular noch Browser-APIs. Keine Datenbank-/Java-Entity im Template.

Die Progressionsmutation `recordActivity` liefert einen neuen vollständigen Snapshot und eine
Reward-Zusammenfassung. Im Mock werden Aktivität, XP, Quests und Boss in einem Rechenschritt geändert.
Während eines Requests verhindert `busy` parallele UI-Commands. Errors sind sichtbar, Zustand bleibt erhalten.

## Lokales Profil und Darstellung

`domain/character.ts` definiert den kleinen Optionskatalog und die reine Profilvalidierung.
`CharacterProfile` enthält nur Name und Appearance. `GameRepository.updateCharacter` gibt einen
neuen Snapshot plus den Speicherstatus zurück; der Store zeigt bei fehlender Persistenz eine
verständliche Rückmeldung. Der Memory-Mock verwendet `CharacterProfileStorage` mit Profil-
Schemaversion 2 unter `everbloom.character.v2`. `everbloom.character.v1` bleibt als Legacy-Leseweg
erhalten. Version-1-Daten werden ausdrücklich migriert und anschließend erneut validiert;
fehlerhafte oder unbekannte Versionen fallen auf das Demo-Profil zurück. Browserzugriff liegt
hinter dem `BROWSER_STORAGE`-Token und bleibt außerhalb der Domain. Der nächste explizite
Profil-Speichervorgang schreibt das normalisierte Version-2-Profil; Lesen allein schreibt keinen
Migrierungserfolg vor und löscht keine Legacy-Daten.

Appearance enthält `presentation: 'male' | 'female'`. Der Optionskatalog bietet je sechs eigene
Starterfrisuren; der Validator erzwingt die passende Haar-/Darstellungskombination. Namen, Farben,
Outfits und Auren bleiben reine Profilwerte. Die Legacy-Migration setzt technisch `male` und
mappt `tousled` → `m-spiky`, `bob` → `m-curtains`, `braid` → `m-topknot`. Das ist keine Ableitung
realer demografischer Eigenschaften. Der normale V2-Schreibpfad akzeptiert keine Legacy- oder
falsch zugeordneten Frisur-IDs. Migrations-/Speichertests erhalten vorhandene zulässige Profilwerte
und prüfen, dass keinerlei XP oder Gameplay-Rechte in die Speicherhülle gelangen.

Profiländerungen verändern keine XP, Skills, Quests, Boss-HP oder Momentum. Demo-Reset setzt nur
Fortschritt zurück und behält das aktuell gewählte Profil. Keine Accountdaten oder Auth-Tokens
werden hier gespeichert. Eine spätere `PATCH`-API kann denselben Profilvertrag nutzen.

`shared/chibi.ts` rendert dieselben Appearance-Layer in Creator und Dashboard. Die räumliche
Dreiviertel-Darstellung verwendet SVG-Geometrie, Highlights und Schatten; es gibt keine 3D-Engine.
Level und eine Aktivitäts-/Interessenauswahl sind reine Darstellungsinputs. Vorläufige visuelle
Levelbereiche: 1–9, 10–24 und 25+. Das Dashboard leitet die Auswahl aus dem letzten belohnten Skill
ab oder nutzt den Standard; Creator-Vorschauen bleiben lokaler UI-Zustand. Ein dauerhaftes
Interessenmodell folgt erst mit vollständigem Onboarding. Idle/Atmung und Gesten sind abschaltbar
und beachten reduzierte Bewegung. Die male-/female-Auswahl steuert unsexualisierte Unterschiede
in Gesicht, Körperkontur und Outfitdetails; alle sechs Haarvarianten pro Darstellung werden in
SVG-Layern gezeichnet. Sie wird weder zur Berechnung von Stats noch zur Wahl von Skillzugängen
verwendet.

`AURA_PROGRESSION_PLAN` speist im Creator nur einen gekennzeichneten Ausblick: Nordlicht ab Level
20, Sternenkranz ab Level 40, Moosseele als Mooswächter-Bossdrop. Keine Dropchance ist festgelegt.
Die vier Starter-Auren bleiben im ausrüstbaren Katalog. Der Plan erzeugt keine Ownership, keine
Loot-Mutation und keine Freischaltung durch Preview-Level; ein späterer servergeprüfter Grant-/
Claim-Pfad wird getrennt ergänzt.

## Erfolgsfeedback ohne zusätzliche Progressionsmutation

`domain/milestones.ts` vergleicht die Snapshots eines akzeptierten Aktivitätsrequests. Erkannte
Übergänge: Charakter-/Skill-Level, erster belohnter Eintrag des Tages, alle Daily Quests erledigt,
Wochenboss besiegt. Der Store reicht diese nur bei einem neuen, belohnten Ergebnis an
`ProgressFeedback` weiter. Laden, Reset, Profiländerungen und Duplikate passieren diesen Pfad nicht.
Einzelne Questabschlüsse sind kein eigener Audio-Auslöser.

`ProgressFeedback` bündelt Erfolge zu einer etwa sechs Sekunden sichtbaren Meldung. Feuerwerk
liegt in `shared/celebration.ts`; `SuccessAudio` erzeugt einen eigenen kurzen Vier-Ton-Jingle über
Web Audio. Audio wird im Rahmen einer Nutzerinteraktion vorbereitet. Fehlende Unterstützung,
blockiertes Audio und Aufräumen beim Schließen dürfen keine Spielbuchung verändern. Einstellungen
für Ton, Feuerwerk und Charakterbewegung werden separat vom Profil unter `everbloom.feedback.v1`
gespeichert. Vorschau ist ausdrücklich UI-Feedback ohne Domainmutation. Die Meldung ist kein
persistiertes Achievement und kein Event-Bus.

## API-Anbindung in M1b

Vorgeschlagene REST-Grenze (noch nicht implementiert):

- `GET /api/v1/me/dashboard` → `GameSnapshot` DTO mit Revision und Server-Zeit.
- `POST /api/v1/me/activities` → Skill-ID, Minuten, Zeitpunkt, Idempotency-Key; Antwort Snapshot + Rewards.
- `GET /api/v1/skills` → versionierter Katalog.
- `PATCH /api/v1/me/character` → Name/Appearance, separat vom XP-Schreibpfad.

Der Server ermittelt User-ID aus der Session, akzeptiert **keine** clientberechneten XP, Stats oder
Boss-Schäden. Eine DB-Transaktion plus eindeutiger Request-Key pro Nutzer verhindert Doppelbuchungen;
Revision/optimistisches Locking verhindert verlorene Updates zwischen Geräten. Wiederholte Requests
liefern dasselbe fachliche Resultat. Frontend ersetzt Mock-Provider durch HTTP-Provider, Regeln werden
serverseitig umgesetzt und mit denselben fachlichen Beispielen geprüft.

Zeitzone ist ein IANA-Wert am Profil. Server definiert Day-/Week-Keys, Reset-Zeitpunkte und Umgang mit
Zeitzonenänderung; keine XP-Vergabe allein auf Basis einer verstellbaren Client-Uhr. Demo verwendet
einen festen Beispieltagesstand, um deterministisch und verständlich zu bleiben.

## Backend und Datenhaltung

Spring Boot-Pakete zunächst `character`, `activity`, `progression`, `quest`, `boss` mit Controller,
Service und Persistence nur dort, wo benötigt. PostgreSQL + Flyway, REST DTOs und Bean Validation.
Tests: JUnit für Regeln, Testcontainers für transaktionale API/Persistenz sobald diese existieren.
Java-/Spring-Version erst beim Backend-Scaffold anhand dann unterstützter Versionen festlegen.
Authentifizierung vor personenbezogener Persistenz; Web-Sessionkonzept und Capacitor-Tokenablage
in einem eigenen ADR konkretisieren. Keine Tokens in localStorage als stillschweigender Default.

## Bewusste Grenzen

Kein Offline-Sync, Event Bus, GraphQL, SSR für das persönliche Dashboard, Microservice, Nx oder NgRx.
Nur Charakterprofil und Darstellungspräferenzen werden lokal gespeichert; Fortschritt bleibt
im Arbeitsspeicher. Reset ist ein Mock-Adapter-Kommando und wird nicht als produktiver Account-Reset
übernommen. Serverperioden, echte Wochenhistorie und Berechtigungen folgen mit der API.

## Tests und Änderungen

Reine Domain-Tests prüfen XP/Levelgrenzen, Limits, Idempotenz und atomare Rewards.
Reine Profil-/Meilensteintests prüfen erlaubte Eingaben und einmalige Übergänge.
Angular-Tests prüfen den echten Store/Mock-Datenfluss, das Formular, Profilgrenzen und Feedback.
Speichertests prüfen Version-1-Migration, gültige V2-Profile, ungültige Daten, fehlenden Speicher
und Reload-Verhalten. Katalogtests sichern je sechs Frisuren, Darstellungskompatibilität und
die Trennung geplanter Auren vom ausrüstbaren Katalog. `npm run build` prüft
Templates und TypeScript sowie Bundle-Budgets. Fachregel ändern → GDD, Balance und Test gemeinsam
ändern. API hinzufügen → Adapter implementieren, Provider tauschen, Fehlerfälle testen.

Für die responsive Dashboard-Ansicht gilt ein Komponenten-CSS-Budget von 16 kB (Warnung) und
20 kB (Fehler); tatsächliche Größen werden beim Produktionsbuild geprüft. Das Initial-Bundle bleibt bei den
CLI-Grenzen 500 kB / 1 MB. Kleinere Karten werden erst bei Wiederverwendung separat extrahiert.

## Responsive Mobile-Game-Shell

Priorität haben Smartphones im Hochformat sowie Tablets im Hoch-/Querformat. Die Shell und
Feature-Layouts verwenden Inhaltsbreiten und responsive Spalten statt gerätespezifischer doppelter
Screens. Mobile Bottom-Navigation und Creator-Fußleiste reservieren Platz für sich und Safe Areas;
scrollbarer Inhalt, fokussiertes Feld und Tastatur dürfen nicht gegeneinander überlagert werden.
Der primäre Aktivitätsbutton bleibt gut mit einer Hand erreichbar. Browser-Viewport- und Tastatur-
verhalten muss praktisch geprüft werden; feste Höhen dürfen keine Inhalte abschneiden.

Projektziele sind 44 CSS-px Mindest-Touchfläche, bevorzugt 48 CSS-px, Haupttext 14–16 CSS-px,
sekundärer Text ab 12 CSS-px und mobile Formfelder ab 16 CSS-px. Schriftvergrößerung, semantische
Controls, Fokus und Screenreader sind Teil des Layouts. Diese CSS-Projektwerte sind keine bereits
bestandene native Plattformabnahme.

Jede Chibi-Instanz benötigt eindeutige SVG-Defs-/Gradienten-/Masken-IDs, insbesondere in
Creator-Vorschauen. Animation möglichst über günstige Transform-/Opacity-Effekte; keine dauerhaft
teuren Filter oder unnötigen Render-Schleifen für ruhende Figuren. Nutzerpräferenzen und
`prefers-reduced-motion` gelten auch für Tablet- und Gallery-Darstellung. Produktions-Budgets
bleiben eine Grenze; Geräteprofiling folgt vor breiter Asset-Produktion.

Lade-, Fehler-, Leer-, Offline- und Resume-Zustände werden über bestehende State-/Adapter-Grenzen
abgebildet. Der Mock ist kein Netz- oder Synchronisationsbeweis. Haptik, App-Lifecycle und spätere
Store-Käufe erhalten kleine konkrete Plattformadapter erst bei nativer Anbindung; keine neuen
Framework-Schichten für diese Planung. Geräteprüfungen müssen Zurück-Navigation, Tastatur,
App-Unterbrechung, Audio, wiederholte Requests und später Kauf-/Restore-Flows abdecken.

## Sprach- und Locale-Modell als Release-Ziel

Die finale Oberfläche soll Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch, Chinesisch,
Japanisch, Russisch und Koreanisch unterstützen. Jetzt Texte auslagerbar halten und ein zentrales
Locale-Modell vorsehen; die konkreten Sprachpakete und Übersetzungen folgen in der Endphase/M4.
Keine zusätzliche Internationalisierungsbibliothek allein für diese Planentscheidung einführen.
Noch zu klären: Schweizer Hochdeutsch (`de-CH`) oder Schweizerdeutsch (`gsw`), Portugiesisch
Portugal oder Brasilien, vereinfachtes oder traditionelles Chinesisch. Keine dieser Varianten
wird ohne Produktentscheidung als gewählt gespeichert oder versprochen.

Alle Screens, Validierungs-/Fehlermeldungen, Accessibility-Texte, Support und Store-Auftritte
gehören zum Übersetzungsumfang. Datums-/Zahlenformate, Pluralregeln und Fallback auf Deutsch sind
zentral zu behandeln. Die Sprachauswahl verwendet Sprachnamen, keine Länderflaggen. Der Prototyp
bleibt aktuell deutsch; ein geplanter Sprachkatalog ist noch keine gelieferte Übersetzung.

## Frühe mobile Abnahme

Schon in M1b einen kleinen Capacitor-Gerätetest des Aktivitätsflows durchführen; die vollständige
Store-Fassung bleibt M4. webDir wird auf `dist/everbloom/browser` zeigen. Plattformfunktionen
hinter kleinen Adaptern halten, keine dauerhafte Live-Reload-URL in Release-Builds. Der aktuelle
Web-Slice berücksichtigt Safe Areas und scrollbare Dialoge; mobile Shell, Creator-Fußleiste und
Tablet-Layouts sind umgesetzt. Native Back-Navigation, Tastatur,
Screenreader, Resume, Netzausfall und sichere Sessions benötigen echte Geräteprüfungen.

Vor Account-Persistenz den Löschprozess modellieren; vor Membership Store-Billing mit serverseitiger
Kaufprüfung, Wiederherstellung und Entitlement-Lebenszyklus. Datenschutz und Store-Angaben folgen
den tatsächlichen Datenflüssen. Die vollständige Liste und offiziellen Quellen stehen im Readiness-Dokument.

## Freiwilliger Check-in ohne neue Backend-Schicht

Reine Validatoren und Datumsregeln liegen in `domain/daily-care.ts`; `DailyCareStore` kapselt
Signale, den injizierbaren lokalen Tagesgeber und Browser-Speicherung. Das Panel bearbeitet einen
Formularentwurf und übernimmt ihn erst beim Absenden. Der Store hört auf Fokus/Visibility und
prüft vor Commands, ohne dauerhaften Timer. Das Dashboard verwendet die freiwillige Auswahl für
Reaktionszeile und Custom-Avatarinteresse. Original-Artwork bietet zunächst nur dezentes Gesamt-Idle.
Der Store kennt das GameRepository nicht; Check-in und Auslassen können keine Rewards erzeugen.
