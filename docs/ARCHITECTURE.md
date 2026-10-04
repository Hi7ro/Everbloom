# Architecture · V0.4

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
für Dashboard, `/character/create`, `/onboarding` und die gesonderte Kampfübung `/battle`. Neue Routenseiten starten oben; Zurücknavigation stellt
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
data/*storage            validiertes Fortschrittsjournal, Profile und Präferenzen
          ↓
data/mock-*              lokaler Adapter rekonstruiert Journal mit Domainregeln
domain/                  Modelle, Katalog, Progression, Profil-/Journey-/Rigregeln
```

Views kennen weder Mock-Seeds noch Transport. Der Store kennt den per InjectionToken bereitgestellten
Adapter. Repository-Methoden sind asynchron, damit ein HttpClient-Adapter später dieselbe Oberfläche
bedient. Die Domain importiert weder Angular noch Browser-APIs. Keine Datenbank-/Java-Entity im Template.

Die Progressionsmutation `recordActivity` liefert einen neuen vollständigen Snapshot und eine
Reward-Zusammenfassung. Im Mock werden Aktivität, XP, Quests und Boss in einem Rechenschritt geändert.
Während eines Requests verhindert `busy` parallele UI-Commands. Errors sind sichtbar, Zustand bleibt erhalten.

## Lokales Journal und Perioden

`GameProgressStorage` speichert unter `everbloom.progress.v1` ein `GameProgressJournal` mit exakt
`{ version: 1, startDay, entries }`. Jeder Eintrag enthält ausschließlich Request-ID, bekannte
Skill-ID, ganze Minuten und Day-Key. Exakte Schlüssel, gültige aufsteigende Kalendertage, eindeutige
Request-IDs (höchstens 128 Zeichen), maximal 10.000 Einträge und 2 MiB werden geprüft. Gespeicherte
XP, HP oder Besitzlisten gehören nicht in diesen Inputvertrag.

`MockGameRepository` bleibt der Adaptername, führt aber einen lokalen persistenten Prototyp aus.
Er setzt `createMockSnapshot()` auf den Journal-Starttag und rekonstruiert Einträge mit
`advanceGamePeriod` und `recordActivity`. Der Seed bleibt Level 12 mit vier fortgeschrittenen Skills
und 1.460/2.400 Boss-HP. Beim Wiederherstellen entstehen keine Feedback-Ereignisse. Journale sind
noch kein serverautoritatives Audit-Log und kein Sync-Protokoll; Regeln/Seed brauchen vor künftigen
Änderungen einen versionierten Replay-/Migrationspfad.

`GAME_DAY_CLOCK` liefert das lokale Gerätedatum. Reine zivile Kalenderarithmetik in
`domain/game-periods.ts` setzt neue Dailies auf 0/ungeclaimt und den Boss am neuen Wochenmontag auf
volle HP. Sie verarbeitet Monats-/Jahreswechsel ohne dauerhaften Timer. Historie, XP und verdiente
Auren bleiben erhalten; verstrichene Tage erzeugen keine Rewards. Der Wochenrhythmus wird aus
belohnten Aktivitätstagen abgeleitet. Der Store lädt vor Einträgen und beim passenden Resume/Fokus
nach; eine zurückgestellte oder ungültige Uhr blockiert neue Buchungen, keine alten Duplikatantworten.
Clientzeit bleibt manipulierbar, die servergeführte IANA-Zeitzone folgt später.

Der Schreibpfad prüft Journalgrenzen vor der Übernahme des Ergebnisses. `localStorage.setItem`
ersetzt den einen Journal-Key atomar. Fehlende Verfügbarkeit/Schreibfehler lassen einen erklärten
Sitzungsstand zu. Beschädigte/fremde/überlange gespeicherte Journale werden bis zum expliziten Reset
nicht überschrieben; eine Änderung durch einen zweiten Tab sperrt automatisches Überschreiben.
`ProgressPersistenceStatus` meldet `saved`, `session`, `unavailable`, `corrupt`, `unsupported`,
`limit` oder `clock` über Repository → Store → `ProgressStorageNote`; fachliche Ablehnungen erscheinen
zusätzlich als Fehler. Das ist weder Cloud-Backup noch ein vollständiger Konflikt-/Offline-Sync.

Ein im Dashboard bestätigter Reset ersetzt zuerst das Journal durch einen leeren Beispielstart für
heute. Danach werden In-Memory-Fortschritt und Aura-Besitz zurückgesetzt. Name, übriger Look und
separat gespeicherte Interessen/Einstellungen bleiben erhalten. Eine angelegte verdiente Aura wird
auf `none` korrigiert. Schlägt der Schreib-Reset fehl, bleibt der bisherige Spielstand erhalten.

## Lokales Profil und illustrierte Darstellung

`domain/character.ts` validiert `CharacterProfile` mit Name und Appearance. `GameRepository.updateCharacter`
liefert einen neuen Snapshot plus Speicherstatus; `GameStore` erklärt fehlende Persistenz. Der
lokale Prototypadapter verwendet `CharacterProfileStorage` unter `everbloom.character.v2`. Version 1 bleibt
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
übrige Profil; eine verdiente angelegte Aura wird ohne Besitz entfernt. Keine Accountdaten, Auth-Tokens oder Kaufrechte werden in diesem Profil gespeichert. Eine
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
Dashboard/Creator verwenden weiterhin diesen Portraitpfad. Die neue Kampfroute lädt PixiJS für
eine eigene 2D-Bühne; eine 3D-Engine oder Spine-Runtime ist nicht eingeführt.

Die aktuelle Kleidung ist ein vollständiges Set mit befestigten Waffen/Accessoires. Künftige Slots
für Kopf, Gesicht, Haare, Torso, Arme, Beine, Schuhe, Haupthand, Nebenhand, Rücken, Accessoire, Aura
und Companion benötigen eigene Anker/Layer und Verträge. Weder einzelne Items noch Inventarbesitz
entstehen automatisch aus der bestehenden Körpermaske. Asset-/Maskenvertrag und Produktionsprompt
stehen in [ART_DIRECTION.md](ART_DIRECTION.md).

### PixiJS-Kampfbühne und reine Kampfsimulation

`/battle` ist ein eigener lazy geladener Angular-Screen. Die Kampf-Domain berechnet aus einem
Startsnapshot einen deterministischen Ereignisverlauf; keine Browser-API, Renderabhängigkeit
oder Speicherung in diesen Regeln. Die View steuert Abspielposition und Pause, zeigt HP und
Textverlauf und übergibt semantische Posen an die PixiJS-Bühne. Es gibt keinen Aufruf des
Aktivitäts-/Reward-Schreibpfads. Neustart oder Rendererfehler ändern keinen GameSnapshot.

`domain/auto-battle.ts` enthält `deriveHeroCombatStats`, `createPracticeBattle` und den
`BattleReplay` mit einer endlichen Liste von `BattleTurn`-Ereignissen. Die Regeln verwenden keinen
Zufall oder Zeitgeber. Ein Replay enthält stets `rewards: { xp: 0, loot: [] }`.

`rendering/battle-stage.ts` kapselt Laden, Canvas, Scene Graph und Lebenszyklus. Held und Boss
verwenden einen gemeinsamen kleinen Actor-Adapter mit `idle`, `attack`, `hit`, `victory`,
`defeat`. Heldendarstellung liest validierte Appearance und bestehende Original-/Modulbilder;
der Boss verwendet zunächst die eigene Illustration `art/bosses/mosswarden-v1.png`. Die Bildlayer besitzen noch kein vollständiges
Skelett. Der Renderpfad bleibt austauschbar für später professionell produzierte Rigassets.

PixiJS wird erst bei Bedarf geladen. Controls/HP/Log bleiben HTML und funktionieren auch bei
Grafikfehlern. Routenabbau entfernt Bühne, Listener und Ticker; Größenänderung, Hintergrund und
Bewegungseinstellungen gehören zum Darstellungslebenszyklus. Der Asset-/Clipvertrag und die
mobile Abnahme stehen in [ANIMATION_PIPELINE.md](ANIMATION_PIPELINE.md). Es liegt keine Spine-
Lizenz vor und keine Spine-Runtime wird ausgeliefert; deren spätere Einbindung ist ein eigener
Schritt nach geklärter Nutzung und passenden Exporten.

Eine spätere Kampf-API autorisiert Begegnungen aus akzeptierten Aktivitäten und verbucht Rewards
pro Begegnung genau einmal. Clientanimationen/Animationsevents dürfen keine XP oder Beute
vergeben. Dieser neue Pfad braucht Regelversion und bewusste Migration, bevor er den bisherigen
Wochenbossmechanismus ergänzt oder ersetzt; aktueller Journal-Replay und 2-Schaden-Regel bleiben
unverändert. Die lokale Kampfübung ist keine bereits gelieferte serverautoritative Begegnung.

### Aura-Belohnungen und getrennte Vorschau

`domain/aura-designs.ts` beschreibt drei Starter-Effekte, drei erspielbare Auren und zehn weitere Designs.
`shared/character-aura.ts` rendert sie dekorativ mit SVG/CSS, ohne Gameplay-Zugriff. Der Creator hält
`previewAura`, Vorschaufarbe und bedrohlichen Blick ausschließlich im UI-State und blendet während
der erweiterten Vorschau die angelegte Aura aus. Diese Werte werden nicht gespeichert. Der Blick
erzeugt aktuell Augen im hinteren Dämonenschatten; er ändert nicht die tatsächlichen Avataraugen.
Separate Gesichtsmimik/Iris-VFX und vollständige Produktions-VFX bleiben Erweiterungen.

`domain/aura-rewards.ts` ist die kanonische Regelquelle: `STARTER_AURA_IDS`, `AURA_REWARDS`,
`isKnownAura`, `hasAuraAccess` und `grantActivityAuras`. `AURA_PROGRESSION_PLAN` bleibt ein Alias
für den Katalog. Ein akzeptierter Eintrag mit positiver Aktivitäts-XP vergibt Nordlicht bei Übertritt
zu Level 20, Sternenkranz bei Level 40 und Moosseele bei lebendem→besiegtem Mooswächter. Besitz liegt
als `unlockedAuras` im Snapshot und wird beim Journal-Replay rekonstruiert. Kein Zufallsdrop, kein
Claim-Endpoint und kein Grant aus Vorschau oder unverändertem Laden.

Der Creator und `AuraCollection` lesen Besitz über den Store. `updateCharacter` lehnt bekannte, aber
nicht verdiente Auren ab; die reine Profilnormalisierung prüft nur bekannte IDs. Beim Laden eines
Profils ohne passenden Besitz wird allein die Aura auf `none` korrigiert. Drei eigene VFX nutzen
instanzlokale SVG-Gradienten und CSS; keine zusätzlichen Bilddateien oder Filtersysteme.
Die zehn erweiterten Designs behalten `previewOnly: true` und erzeugen keine Besitzmutation.
Servergeprüfte Vergabe/Kaufrechte sowie individuelle Itemslots bleiben eigene Erweiterungen.

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
Server-Synchronisierung von Profil/Präferenzen und serverseitige Fortschrittspersistenz fehlen weiterhin.

## Erfolgsfeedback ohne zusätzliche Progressionsmutation

`domain/milestones.ts` vergleicht die Snapshots eines akzeptierten Aktivitätsrequests. Erkannte
Übergänge: Charakter-/Skill-Level, erster belohnter Eintrag des Tages, alle Daily Quests erledigt,
Wochenboss besiegt und eine neue Aura verdient. Der Store reicht diese nur bei einem neuen, belohnten Ergebnis an
`ProgressFeedback` weiter. Laden, Reset, Profiländerungen und Duplikate passieren diesen Pfad nicht.
Einzelne Questabschlüsse sind kein eigener Audio-Auslöser.

`ProgressFeedback` bündelt Erfolge zu einer etwa sechs Sekunden sichtbaren Meldung. Feuerwerk
liegt in `shared/celebration.ts`; `SuccessAudio` erzeugt einen eigenen kurzen Vier-Ton-Jingle über
Web Audio. Audio wird im Rahmen einer Nutzerinteraktion vorbereitet. Fehlende Unterstützung,
blockiertes Audio und Aufräumen beim Schließen dürfen keine Spielbuchung verändern. Einstellungen
für Ton, Feuerwerk und Charakterbewegung werden separat vom Profil unter `everbloom.feedback.v1`
gespeichert. Vorschau ist ausdrücklich UI-Feedback ohne Domainmutation. Die Meldung ist kein
persistiertes Achievement und kein Event-Bus.

## Verpflichtende Authentifizierung vor Charaktererstellung

Produktreihenfolge: Registrierung/Login → gültige Session → Charaktererstellung → Interessen-/
Fokus-Onboarding → Dashboard. Ein angemeldeter Account ohne Charakter wird zum Creator geführt.
Der heutige lokale Prototyp hat keine Session/Auth-Funktion; seine offene Route ist kein erlaubter
produktiver Gast-Create-Pfad. Provider und konkrete Authentifizierungsverfahren werden erst im
Auth-Slice gewählt; keine Fake-Login-Schicht vorziehen.

Der Angular-Creator erhält einen Auth-Guard für Navigation/Weiterleitung zur Anmeldung. Die API
prüft unabhängig davon jede Anfrage. `POST /api/v1/me/character` ist als geschützte Create-Grenze
vorgesehen: ohne gültige Session 401, ohne Seiteneffekt. Der Server ermittelt `accountId` aus der
geprüften Session, niemals aus einem frei angegebenen Body-/Query-Feld. Auch bestehende Charakter-,
Aktivitäts-, Fortschritts- und Reward-Routen erzwingen diese Besitzergrenze. Fremde Charakter-IDs
berechtigen weder zum Lesen noch zum Schreiben. Sessionprüfung und Zugriffsfehler werden in
Integrationstests mit mindestens zwei Accounts geprüft.

Bei Logout/Accountwechsel werden private Signals, Entwürfe, Caches und Feedback verworfen oder
nach Account getrennt. Laufende Antworten sind an ihre Session/Account-Zuordnung gebunden und dürfen
nicht im nächsten Account landen. Lokale Prototyp-Journale gehören noch keinem Account und werden
nicht still importiert. Eine spätere Übernahme verlangt einen eigenen fachlichen Vertrag; lokale
XP-/Aura-Werte gelten nicht als serverbestätigt. Eine öffentliche reine Look-Vorschau ohne Speichern
ist nur eine mögliche spätere Entscheidung, kein produktiver Gastcharakter oder Gastspielstand.

## API-Anbindung in M1b

Die erste Backend-Grundlage ist implementiert: Spring Boot 4.1.1/Java 21, PostgreSQL/Flyway-
Migration für Accounts, BCrypt-Passworthashes, serverseitige HttpOnly-Session, CSRF-Endpoint,
Logout und stabile JSON-Fehler. `GET /api/auth/me` liest die Besitzer-ID aus der Session. Der
Frontend-Auth-Slice besitzt noch keinen lokalen Token und speichert kein Passwort.

Der Game-Teil folgt derselben Grenze; folgende Endpunkte sind der verbindliche Vertrag und noch
nicht vollständig implementiert:

- `POST /api/v1/me/character` → validierte Name-/Appearance-Daten, Besitzer aus gültiger Session.
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
Zeitzonenänderung; keine produktive XP-Vergabe allein auf Basis einer verstellbaren Client-Uhr.
Der lokale Prototyp nutzt bis dahin Gerätedatum, vorwärts laufende Perioden und einen festen Seed.

## Backend und Datenhaltung

Spring Boot-Pakete zunächst `auth`, `character`, `activity`, `progression`, `quest`, `boss` mit
Controller, Service und Persistence nur dort, wo benötigt. PostgreSQL + Flyway, REST DTOs und
Bean Validation. Der Auth-Slice ist mit Boot 4.1.1/Java 21 begonnen; ein vollständiger Game-Slice
benötigt noch JUnit-/Testcontainers-Abnahme für Transaktionen. Keine Tokens in localStorage als
stillschweigender Default. Für Capacitor wird ein eigenes Session-/Token-ADR vor der nativen
Anbindung erstellt.

## Bewusste Grenzen

Kein Offline-Sync, Event Bus, GraphQL, SSR für das persönliche Dashboard, Microservice, Nx oder NgRx.
Charakterprofil, Journey-Präferenzen, Feedback-Einstellungen und freiwilliger Tages-Check-in werden
getrennt vom lokalen Fortschrittsjournal gespeichert. Reset ist ein bestätigtes Prototypkommando
und wird nicht als produktiver Account-Reset übernommen. Serverperioden, authentifizierter Besitz
und Synchronisierung folgen mit der API. Das Journal ist durch den Nutzer veränderbar und deshalb
kein belastbarer Leistungs-/Berechtigungsnachweis.

## Tests und Änderungen

Reine Domain-Tests prüfen XP/Levelgrenzen, Limits, Idempotenz und atomare Rewards.
Kampftests prüfen reproduzierbare Zugfolgen, Fortschrittseinfluss, begrenzte HP, endliche Kämpfe
und unveränderte Eingabesnapshots. Render- und Abspieltempo dürfen das Ergebnis nicht verändern.
Reine Profil-/Meilensteintests prüfen erlaubte Eingaben und einmalige Übergänge.
Angular-Tests prüfen den echten Store/Mock-Datenfluss, das Formular, Profilgrenzen und Feedback.
Speichertests prüfen Version-1-Migration, gültige V2-Profile, ungültige Daten, fehlenden Speicher
und Reload-Verhalten. Journal-/Periodentests prüfen Rekonstruktion, Grenzen, Uhr-/Speicherfehler,
Datumssprünge, Reset und einmalige Aura-Grants. Katalog-/Rigtests sichern zwölf Vorlagen, sechs Module je Darstellung,
Palettegrenzen, Layerzuordnung und die Trennung von Starter-, verdienten und Vorschau-Auren. Journey-
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

## Abgeleitete Tages- und Wochenbegleitung

`domain/daily-adventure.ts` erstellt aus einem Snapshot, Fokus-Skill-IDs und Tagesmodus maximal
drei Vorschläge. Die XP-/Quest-/Boss-Vorschau verwendet dieselbe reine `recordActivity`-Regel wie
ein tatsächlicher Eintrag, ohne den Snapshot zu verändern. Das Öffnen einer Empfehlung befüllt
nur den bestehenden Aktivitätsdialog. Erst dessen Bestätigung ruft das Repository auf.
Wochenziele werden aus gültigen belohnten Verlaufseinträgen abgeleitet; es gibt keinen zweiten
Zielspeicher, keine gesonderte Reward-Engine und keine zusätzlichen Wochenziel-XP.

Die Membership-Route ist eine Angebotsvorschau. Sie schreibt weder Zahlungsdaten noch Entitlements
und aktiviert keine Mitgliedschaft. Produktrichtung und offene Angebotsprüfung stehen in
`PRODUCT_DIRECTION.md`.
