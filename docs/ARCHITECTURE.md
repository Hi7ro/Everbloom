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
für Dashboard, `/character/create` und `/onboarding`. Neue Routenseiten starten oben; Zurücknavigation stellt
die Scrollposition wieder her, Abschnittsanker bleiben nutzbar.
Versionsreferenz: https://angular.dev/reference/versions

## Frontend-Schichten

```text
features/dashboard/ + character-creator/ + onboarding/   Views + Formularentwürfe
          ↓
state/game.store.ts       Spielstand, Aktivitäten, Profilcommands, Feedback
state/journey.store.ts    Interessen und Fokusauswahl, getrennt von Progression
state/daily-care.store.ts freiwilliger Tages-Check-in, getrennt von Progression
          ↓
data/game.repository     Snapshot / Aktivität / Profil / Demo-Reset
data/*storage            validierte lokale Profile und Präferenzen
          ↓
data/mock-*              Memory-Adapter ruft reine Domainregeln auf
domain/                  Modelle, Katalog, Progression, Profil-/Journey-/Rigregeln
```

Views kennen weder Mock-Seeds noch Transport. Der Store kennt den per InjectionToken bereitgestellten
Adapter. Repository-Methoden sind asynchron, damit ein HttpClient-Adapter später dieselbe Oberfläche
bedient. Die Domain importiert weder Angular noch Browser-APIs. Keine Datenbank-/Java-Entity im Template.

Die Progressionsmutation `recordActivity` liefert einen neuen vollständigen Snapshot und eine
Reward-Zusammenfassung. Im Mock werden Aktivität, XP, Quests und Boss in einem Rechenschritt geändert.
Während eines Requests verhindert `busy` parallele UI-Commands. Errors sind sichtbar, Zustand bleibt erhalten.

## Lokales Profil und illustrierte Darstellung

`domain/character.ts` validiert `CharacterProfile` mit Name und Appearance. `GameRepository.updateCharacter`
liefert einen neuen Snapshot plus Speicherstatus; `GameStore` erklärt fehlende Persistenz. Der
Memory-Mock verwendet `CharacterProfileStorage` unter `everbloom.character.v2`. Version 1 bleibt
Legacy-Leseweg; gültige Daten werden migriert, normalisiert und bereits beim Legacy-Lesen nach V2
zu speichern versucht. Der alte Key wird nicht gelöscht. Fehlende/fehlerhafte Daten fallen auf das
Demo-Profil zurück; gesperrter Speicher lässt einen gekennzeichneten Sitzungsstand zu. Browserzugriff
liegt hinter `BROWSER_STORAGE`, außerhalb der reinen Domain.

Appearance enthält die Darstellung `male`/`female`, illustrierte Vorlage (`illustration`), optionale
Module (`illustratedHair`, `outfitSet`) und optionale Palettewerte (`eyeColor`, `skinTone`, `hairTint`).
`character-illustrations.ts` definiert zwölf Vorlagen, sechs je Darstellung, sowie Original plus sechs
Farben je Farbgruppe. Der Validator erlaubt nur passende Modul-/Darstellungskombinationen und
bekannte Palettenwerte. Frühere technische Appearance-Felder bleiben Teil des Kompatibilitätspfads;
der frühere Vektor-Editor ist vollständig aus der UI entfernt. `artwork` wird auf den illustrierten
Pfad normalisiert. Keine Darstellung oder Hautfarbe beeinflusst Spielregeln oder reale Demografie.

Profiländerungen verändern keine XP, Skills, Quests, Boss-HP oder Momentum. Demo-Reset behält das
Profil. Keine Accountdaten, Auth-Tokens oder Kaufrechte werden in diesem Profil gespeichert. Eine
spätere Profil-API kann denselben fachlichen Vertrag nutzen.

### Bildkomposition und Rig

`shared/character-portrait.ts` rendert illustrierte Figuren in Dashboard, Creator und Onboarding.
Vier Vorlagen haben unveränderte Original-PNGs mit separater Luminanzmaske. `usesExactIllustration`
verwendet diesen Pfad nur ohne explizite Frisur-/Outfit-/Farbwerte. Name, Starter-Aura und Bewegung
ändern die Bilddateien nicht. Bei Anpassungen nutzt der Renderer modulare, neu erstellte Sheets;
deren Pixel sind keine exakte Zerlegung der vier Originale.

`domain/character-rig.ts` erzeugt reine `PortraitLayer`-Daten: Bild-/Maskenpfad, Region, Clip,
Transformation, Kopf-/Körpergruppe und optionale Tönung. `character-rigs.generated.ts` enthält die
zwölf Figuren-Rigs sowie `face-male` und `face-female`, insgesamt 14. Körper werden über Halsanker
und Fußlinie ausgerichtet, Köpfe über zwei Irisanker. Ein gemalter Basiskopf füllt beim Frisurwechsel
Bereiche unter kürzeren Haaren; Gesicht, ausgewählte Haare und Outfitset bleiben unabhängig.

Die semantischen Masken codieren Rot = Haare, Blau = Haut, Weiß = Iris einschließlich Pupille/Reflex,
Grün = übriger Figurenvordergrund und Schwarz = Hintergrund. SVG-Filter extrahieren Regionen; gezielte
Tönungen bewahren Helligkeitsabstufung. Pro Portrait eindeutige Masken-/Filter-/Clip-IDs vermeiden
Kollisionen in Galerien. Masken werden auf die jeweilige Sheetgröße abgebildet; generierte Kanten
und geschätzte Anker brauchen visuelle Kombinationsprüfung. Vorhandene Assets sind kein Beleg
pixelgenauer Masken oder fertiger mobiler Produktionsqualität.

Originale atmen als geschlossene Figur. Modulare Kopf-/Körperlayer sind zeitlich gekoppelt und
zeigen ein ruhiges Gesamt-Idle. Bewegung aus und `prefers-reduced-motion` stoppen Avatar und Aura.
`resolveAvatarPresence` erhält Level/Interesse als reine Darstellungsinputs; seine vorläufigen
Levelbereiche 1–9, 10–24 und 25+ sind noch keine ausgearbeitete Gesten-/Mimikbibliothek für alle Assets.
Keine 3D-Engine oder zusätzliche Animationsabhängigkeit ist eingeführt.

Die aktuelle Kleidung ist ein vollständiges Set mit befestigten Waffen/Accessoires. Künftige Slots
für Kopf, Gesicht, Haare, Torso, Arme, Beine, Schuhe, Haupthand, Nebenhand, Rücken, Accessoire, Aura
und Companion benötigen eigene Anker/Layer und Verträge. Weder einzelne Items noch Inventarbesitz
entstehen automatisch aus der bestehenden Körpermaske. Asset-/Maskenvertrag und Produktionsprompt
stehen in [ART_DIRECTION.md](ART_DIRECTION.md).

### Aura-Vorschau ohne Rechtevergabe

`domain/aura-designs.ts` beschreibt drei Starter-Effekte plus zehn erweiterte Designs.
`shared/character-aura.ts` rendert sie dekorativ mit SVG/CSS, ohne Gameplay-Zugriff. Der Creator hält
`previewAura`, Vorschaufarbe und bedrohlichen Blick ausschließlich im UI-State und blendet während
der erweiterten Vorschau die Starter-Aura aus. Diese Werte werden nicht gespeichert. Der Blick
erzeugt aktuell Augen im hinteren Dämonenschatten; er ändert nicht die tatsächlichen Avataraugen.
Separate Gesichtsmimik/Iris-VFX und vollständige Produktions-VFX bleiben Erweiterungen.

`AURA_PROGRESSION_PLAN` zeigt nur den Ausblick: Nordlicht ab Level 20, Sternenkranz ab Level 40,
Moosseele als Mooswächter-Bossdrop. Keine Dropchance ist festgelegt. Drei Starter-Effekte plus „Keine“
bleiben speicherbar; Plan und Vorschauen erzeugen keine Ownership, Loot-Mutation oder Freischaltung.
Ein späterer servergeprüfter Grant-/Claim-Pfad wird getrennt ergänzt.

## Interessen und Onboarding ohne XP-Mutation

`domain/journey.ts` definiert `JourneyPreferences`: eindeutige `interestIds`, `activeSkillIds` und eine
in der Auswahl enthaltene `primaryInterestId`. Validiert werden 1–7 bekannte Interessen und 1–6
aktive Skills aus dem 14er-Katalog. `JourneyPreferencesStorage` speichert eine separate V1-Hülle
unter `everbloom.journey.v1`, `JourneyStore` hält Präferenzen, Konfigurations-/Persistenzstatus und
Rückmeldungen. Ungültige Eingaben ändern nichts; ein gesperrter Speicher erlaubt Sitzungsnutzung mit
Hinweis. Die Defaults enthalten Calisthenics, Running, Meditation und Programming.

`features/onboarding` bietet Interessen, Fokus-Skills und Zusammenfassung. Ein flüchtiger
`OnboardingDraft` erhält Schritt und Auswahl beim Abstecher zum Creator, ohne Browser-Speicherung.
Der Creator akzeptiert nur `returnTo=onboarding` als Rückweg; ohne gespeichertes Profil und ohne
konfigurierte Reise führt der erste erfolgreiche Profilabschluss ebenfalls zur Einführung.
Abbrechen/Überspringen und spätere Änderung bleiben möglich. `GameStore` leitet aktive Skill-Views
und Avatarinteresse aus den Präferenzen ab; der letzte belohnte Skill hat bei der Darstellung Vorrang.
Journey-Speicherung ruft keine Progressionsmutation auf und ändert keine XP, Quests oder Bosswerte.

Der 14er-Katalog liegt weiterhin in `domain/catalog.ts`; `mock-data.ts` erzeugt für jeden Skill
Fortschritt. Die ursprünglichen vier Demo-Startstände bleiben bestehen, zehn neue starten bei 0 XP.
Raten und Tageslimits bleiben reine Domainwerte; Fokusauswahl löscht keinen Skillfortschritt.
Server-Synchronisierung von Profil/Präferenzen und eigentliche Fortschrittspersistenz fehlen weiterhin.

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
Charakterprofil, Journey-Präferenzen, Feedback-Einstellungen und freiwilliger Tages-Check-in werden
getrennt lokal gespeichert; Spielprogression bleibt im Arbeitsspeicher. Reset ist ein Mock-Adapter-Kommando und wird nicht als produktiver Account-Reset
übernommen. Serverperioden, echte Wochenhistorie und Berechtigungen folgen mit der API.

## Tests und Änderungen

Reine Domain-Tests prüfen XP/Levelgrenzen, Limits, Idempotenz und atomare Rewards.
Reine Profil-/Meilensteintests prüfen erlaubte Eingaben und einmalige Übergänge.
Angular-Tests prüfen den echten Store/Mock-Datenfluss, das Formular, Profilgrenzen und Feedback.
Speichertests prüfen Version-1-Migration, gültige V2-Profile, ungültige Daten, fehlenden Speicher
und Reload-Verhalten. Katalog-/Rigtests sichern zwölf Vorlagen, sechs Module je Darstellung,
Palettegrenzen, Layerzuordnung und die Trennung geplanter Auren vom ausrüstbaren Katalog. Journey-
Tests prüfen Auswahlgrenzen, getrennte Speicherung und fehlende XP-Mutation; UI-Tests prüfen den
dreistufigen Ablauf und Creator-Rückweg. Bestehende Testergebnisse und laufende Prüfungen bleiben
in VALIDATION getrennt; eine neue Dokumentation ergänzt keine bestandenen Testzahlen. `npm run build` prüft
Templates und TypeScript sowie Bundle-Budgets. Fachregel ändern → GDD, Balance und Test gemeinsam
ändern. API hinzufügen → Adapter implementieren, Provider tauschen, Fehlerfälle testen.

Für Komponentenstyles gilt laut `angular.json` ein CSS-Budget von 16 kB (Warnung) und
20 kB (Fehler); tatsächliche Größen werden beim Produktionsbuild geprüft. Das Initial-Bundle bleibt bei den
CLI-Grenzen 500 kB / 1 MB. Diese CLI-Budgets belegen keine mobilen Raster-/VFX-Kosten. Eigene
Download-, Texturspeicher-, Layer-/Filter- und Partikelbudgets sind vor Produktionsfreigabe auf
Geräten zu kalibrieren. Kleinere Karten werden erst bei Wiederverwendung separat extrahiert.

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
Reaktionszeile und Darstellungsinteresse. Illustrierte Figuren bieten derzeit ruhige Ganzkörperatmung;
ausgearbeitete interessenbezogene Gesten folgen separat.
Der Store kennt das GameRepository nicht; Check-in und Auslassen können keine Rewards erzeugen.
