# Architecture · V0.5 · Account-/Native-Beta

Standabgleich: 5. Oktober 2026. Datierte Laufzeitnachweise stehen in [VALIDATION.md](VALIDATION.md);
native Installationen und verbleibende Geräteabnahmen in [NATIVE_BETA.md](NATIVE_BETA.md).

## Ziel

Angular/TypeScript als CSR-SPA; derselbe Web-Build wird mit Capacitor 8 für iOS/Android gebündelt.
Spring Boot als modularer Monolith mit PostgreSQL. Kein SSR: das persönliche Dashboard braucht
keine Suchmaschinenoptimierung; ein zusätzlicher Node-Server wäre hier unnötig.
Die öffentliche Produkt-/Support-Website bekommt später statische oder vorgerenderte Seiten
für SEO. ASO optimiert die Store-Seiten separat. Das private App-Shell erhält noindex;
Session-Authentifizierung schützt die Account- und Spiel-API.
Siehe [App Store Readiness & Reichweite](APP_STORE_READINESS.md).

Angular 21 mit kompatibler TypeScript-Version und lokalem CLI läuft mit Node ab 22.12 bzw. Node 24.
Die native Einrichtung verwendet Node 24.21; Node 20 reicht für Capacitor 8 nicht mehr aus.
Standalone, zoneless Change Detection, Signals und lazy Router-Routen
für Dashboard, `/character/create`, `/onboarding` und die gesonderte Kampfbühne `/battle`. Neue Routenseiten starten oben; Zurücknavigation stellt
die Scrollposition wieder her, Abschnittsanker bleiben nutzbar.
Versionsreferenz: https://angular.dev/reference/versions

### Abhängigkeiten und Security-Patches

Angular-Framework, `compiler-cli`, `build` und `cli` sind gemeinsam auf **21.2.24** fixiert;
das Lockfile hält die konkrete Auflösung reproduzierbar. Die Framework-Pakete werden wegen
ihrer exakten Peer-Abhängigkeiten gemeinsam aktualisiert. TypeScript bleibt in der kompatiblen
5.9-Linie. Der Router-Patch schließt die [SSR-Lücke GHSA-ff3f-86qr-9cv3](https://github.com/angular/angular/security/advisories/GHSA-ff3f-86qr-9cv3);
die aktuelle reine Client-SPA nutzt den betroffenen SSR-Pfad nicht.

`@angular/build@21.2.24` bindet noch `piscina@5.2.0` fest ein. Ein ausschließlich auf diesen
Builder begrenzter npm-Override verwendet vorübergehend **Piscina 5.3.2**. Diese Version
schließt den [Prototype-Pollution-Gadget GHSA-67c8-pqhq-4rmx](https://github.com/piscinajs/piscina/security/advisories/GHSA-67c8-pqhq-4rmx)
und bleibt in derselben Hauptversion. Bei jedem Builder-Update dessen Abhängigkeit prüfen:
sobald Angular selbst eine behobene Piscina-Version einbindet, den Override entfernen und
Lockfile, Produktionsbuild, vollständige Tests sowie Audit erneut prüfen. Der Override ersetzt
keine Validierung des Build-Werkzeugs und betrifft nicht den ausgelieferten Browsercode.

Ein npm-Audit zählt auch Entwicklungswerkzeuge und weitergereichte Dependency-Befunde.
Das aktuelle Lockfile verwendet `http-cache-semantics@4.3.0`. Für das transitive CLI-Werkzeug
`xcode` begrenzt ein Override `uuid` auf 11.1.1; dessen verwendete CommonJS-`v4`-Schnittstelle und
Xcode-Projektparser wurden geprüft. Beide Overrides sind bei Updates erneut zu bewerten.
Der Audit bei der nativen Einrichtung meldete null Befunde; das ist keine Prüfung der gesamten
Anwendungssicherheit. Exakte Versionen und native Grenzen: [NATIVE_BETA.md](NATIVE_BETA.md).

### Produktionsbuild und Content Security Policy

Der Caddy-Webserver erlaubt Scripts nur vom eigenen Ursprung. Angular lädt die globale CSS-Datei
deshalb regulär (`optimization.styles.inlineCritical: false`): das sonst erzeugte Inline-`onload`
würde unter dieser CSP blockiert und die Styles blieben auf `media=print` stehen. CSS und JavaScript
bleiben minifiziert. Pixis CSP-Adapter (`pixi.js/unsafe-eval`) ersetzt dynamische Shader-Funktionen
durch feste Implementierungen; die CSP selbst erhält **keine** `unsafe-eval`-Freigabe.
Der Produktionsbuild wurde mit den tatsächlichen CSP-Headern lokal geprüft, einschließlich Pixi-Canvas,
Kampfablauf und globalem Button-Styling. `scripts/preview-production.py` dient nur diesem lokalen Test.

## Frontend-Schichten

```text
features/                Views, Formulare, isolierte öffentliche Vorschau
          ↓
state/auth.store.ts      Sitzung, Account-Epoch, Login/Logout/Verifikation
state/game.store.ts      Spielstand, Aktivitäten, Profilcommands, Feedback
state/journey.store.ts   Interessen/Fokus; im Accountmodus servergespeichert
state/daily-care.store.ts freiwilliger Check-in; im Accountmodus nur Sitzung
          ↓
data/game.repository     Snapshot / Aktivität / Profil / Bosskampf
  HttpGameRepository     aktiver Provider → ApiClient → Spring Boot
  MockGameRepository     isolierte lokale Demo-/Testbausteine
          ↓
domain/                  reine Regeln, Modelle, Vorschau, Katalog und Rig
```

Views kennen weder Mock-Seeds noch Transport. `app.config.ts` aktiviert `ACCOUNT_MODE` und
`HttpGameRepository`. Der Store spricht den asynchronen Repository-Vertrag; `ApiClient` wählt
Same-Origin-HttpClient für Web oder den nativen HTTPS-Transport. Die Domain importiert weder
Angular noch Browser-APIs. Keine Datenbank-/Java-Entity liegt im Template. Der Defaultwert des
Mode-Tokens dient isolierten Tests und ist kein öffentlich umschaltbarer Gastmodus.

Die öffentliche Vorschau `/demo` ist lazy geladen und verlangt kein Konto.
`DemoExample` wird nur für diese Seite bereitgestellt und ruft die unveränderte Domaintransaktion
auf einem eigenen Beispielstand auf. Er hat keinen Repository-/Speicherzugriff. Sein Ergebnis
kann daher keine persönlichen Aktivitäten, XP oder Aura-Rechte verändern. Details: [DEMO_GUIDE.md](DEMO_GUIDE.md).

Die Progressionsmutation `recordActivity` liefert einen neuen vollständigen Snapshot und eine
Reward-Zusammenfassung. Im Mock werden Aktivität, XP, Quests und Boss in einem Rechenschritt geändert.
Während eines Requests verhindert `busy` parallele UI-Commands. Errors sind sichtbar, Zustand bleibt erhalten.

## Lokales Journal und Perioden im Demo-/Testadapter

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
Clientzeit bleibt im lokalen Adapter manipulierbar; der aktive Accountpfad verwendet dagegen
die Server-Clock und die feste Beta-Zeitzone `Europe/Vienna`.

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

## Profil und illustrierte Darstellung

Im Accountmodus validiert und speichert `/api/game/character` das Profil auf dem Server.
Der folgende lokale Speicherpfad bleibt ausschließlich für Demo-/Testadapter erhalten.

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
übrige Profil; eine verdiente angelegte Aura wird ohne Besitz entfernt. Keine Accountdaten, Auth-Tokens oder Kaufrechte werden in diesem Profil gespeichert. Die
aktive Profil-API verwendet denselben fachlichen Vertrag.

### Bildkomposition und Rig

`shared/character-portrait.ts` rendert illustrierte Figuren in Dashboard, Creator und Onboarding.
Die vier ursprünglichen PNGs bleiben unverändert als Stilreferenz archiviert. Der aktuelle
Charakterausbau stellt alle zwölf Vorlagen auf denselben Layer-Renderer um: zwölf separat
gerenderte, vollständig bekleidete Körper-Sprites mit eigenen Outfitankern werden mit den
jeweils einem vollständigen gemalten Kopf aus der gewählten Frisurenvariante kombiniert. Dadurch wechselt eine Farb- oder Frisurwahl
nicht mehr zwischen Original-Gesamtbild und einer anderen Komposition. Die neuen Teile sind
keine pixelidentische Zerlegung der vier Originalzeichnungen. Die abschließende Sichtprüfung
aller Kragen, Haare und Kombinationen auf Handy/Tablet ist noch offen.


`domain/character-rig.ts` erzeugt reine `PortraitLayer`-Daten: Bild-/Maskenpfad, Region,
Clip, Transformation, Kopf-/Körpergruppe und optionale Tönung. `character-rigs.generated.ts`
hält zwölf Figuren-Rigs und zwei ältere Basiskopfquellen. Die Laufzeit verwendet den vollständigen
Kopf des ausgewählten `hairRig`: zusammengehörige Haare, Gesicht, Ohren, Kiefer und Augen
stammen aus einer Zeichnung. Die zwei Basisköpfe und eine freie Stirnfüllung werden nicht
in die aktive Komposition gemischt. Die Frisurkarte repräsentiert damit eine Kopfvariante.

`character-outfits.ts` hält zwölf separate `OutfitRig`-Einträge mit Alpha-Bild, Maßen,
Hals-/Fußanker und Vorderkragen. Diese Körper brauchen keine RGB-Labelmaske. Das Outfit
bleibt unabhängig wählbar. Zwei Irisanker richten den Kopf aus; dessen Kiefer-/Halsanker
bestimmt den Kragenanschluss. `PORTRAIT_COLLAR_INSET = 9` verbirgt vorhandene gemalte Halsanteile
im Kragen; ohne Halsanteil bleibt der Kieferanschluss unverändert. Füße behalten ihre Bodenlinie.

Die vollständige Kopfebene wird einmal gezeichnet. Optionale Haut-, Augen- und Haartönungen
lesen ausschließlich Regionen desselben `hairRig`-Bildes, nicht Teile anderer Gesichter.
Ohne explizite Augenfarbe gilt die Originalfarbe der gewählten Kopfvariante. Gesetzte
Augenfarbe bleibt beim Frisurwechsel erhalten. `REGION_ALPHA` trennt die Tönungsregionen;
Iris-Ellipsen bewahren Pupillen und Reflexe. Pro Portrait eindeutige Masken-/Filter-/Clip-IDs
vermeiden Kollisionen in Galerien. Der komplette Kopfwechsel ersetzt den fehleranfälligen
Mix aus Vorlagengesicht, neuen Haaren und Stirn-Unterlage.

SVG und Pixi koppeln Kopf-/Körperatmung; Bewegung aus und `prefers-reduced-motion` stoppen
Avatar und Aura. `resolveAvatarPresence` nutzt Level/Interesse als reine Darstellungsinputs
für einfache SVG-Gesten. Pixi ergänzt Kampfreaktionen. Diese Ebenen sind kein vollständiges
Skelett und keine Mimikbibliothek. Kragen, Silhouetten und Farben bleiben visuell auf Phone
und Tablet abzunehmen; Quellcode allein belegt keine Produktionsreife.

Die aktuelle Kleidung ist ein vollständiges Set mit befestigten Waffen/Accessoires. Künftige Slots
für Kopf, Gesicht, Haare, Torso, Arme, Beine, Schuhe, Haupthand, Nebenhand, Rücken, Accessoire, Aura
und Companion benötigen eigene Anker/Layer und Verträge. Weder einzelne Items noch Inventarbesitz
entstehen automatisch aus der bestehenden Körpermaske. Asset-/Maskenvertrag und Produktionsprompt
stehen in [ART_DIRECTION.md](ART_DIRECTION.md).

### PixiJS-Kampfbühne und reine Kampfsimulation

`/battle` ist ein eigener lazy geladener Angular-Screen. Die Kampf-Domain berechnet aus einem
Startsnapshot einen deterministischen Ereignisverlauf; keine Browser-API, Renderabhängigkeit
oder Speicherung in diesen Regeln. Die View steuert Abspielposition und Pause, zeigt HP und
Textverlauf und übergibt semantische Posen an die PixiJS-Bühne. Eine lokale Probe bleibt ohne
Spielmutation. Ein echter Kampagnensieg wird dagegen vor dem Abspielen serverseitig berechnet und
mit seiner einmaligen Belohnung bestätigt; Darstellung, Replay-Neustart und Rendererfehler können
keine weiteren Rewards erzeugen. Die Belohnungskarte erscheint erst am Ende des Abspielens.

`domain/auto-battle.ts` enthält `deriveHeroCombatStats`, `createPracticeBattle` und den
`BattleReplay` mit einer endlichen Liste von `BattleTurn`-Ereignissen. Die Regeln verwenden keinen
Zufall oder Zeitgeber. Ein Replay enthält stets `rewards: { xp: 0, loot: [] }`; ein echter
`BossFightResult` trägt Erstabschluss/Belohnung getrennt. TypeScript-Vorschau und Java-Entscheidung
werden mit gemeinsamen Replay-Fixtures abgeglichen.

`rendering/battle-stage.ts` kapselt Laden, Canvas, Scene Graph und Lebenszyklus. Held und Boss
verwenden einen gemeinsamen kleinen Actor-Adapter mit `idle`, `attack`, `hit`, `victory`,
`defeat`. Heldendarstellung liest validierte Appearance und bestehende Original-/Modulbilder;
Zehn Bossfamilien verwenden je vier eigene Illustrationen aus `art/bosses/` und wirken größer als der Held.
`bossVisual(bossId, difficulty)` liefert dieselbe Form für Pixi-Bühne und statischen Fallback.
Der Katalog folgt Mooswächter 10 → Glutwyrm 20 → Dämmerungsbestie 30 → Frosttitan 40 →
Wolkenkönig 50 (Kapitel-1-Finale) → Blutmondregentin 60 → Sternensouverän 70 → Nharok 80 → Vaelthar 90 → Aureon 100.
Die Bildlayer besitzen noch kein vollständiges Skelett. Der Renderpfad bleibt austauschbar für später professionell produzierte Rigassets.

PNG-Master und exakte Renderprompts der Bossformen liegen unter `art-source/boss-forms/`,
die mobilen transparenten WebP-Bilder unter `frontend/public/art/bosses/`. Veraltete Boss-/
Lootdateien wurden aus den ausgelieferten Assets entfernt. Die 14 Character-Rig-JSONs bleiben
als Generatorquellen erhalten, sind aber per Angular-Assetkonfiguration vom Bundle ausgeschlossen;
die Laufzeit importiert `character-rigs.generated.ts`. Die aktive öffentliche Vorschau nutzt
`PreviewPage`; die ungenutzte ältere Demo-Seite ist entfernt. Der Mock-Repository-Adapter bleibt
für isolierte Domain-/State-Tests erhalten.

PixiJS wird erst bei Bedarf geladen. Controls/HP/Log bleiben HTML und funktionieren auch bei
Grafikfehlern. Routenabbau entfernt Bühne, Listener und Ticker; Größenänderung, Hintergrund und
Bewegungseinstellungen gehören zum Darstellungslebenszyklus. Der Asset-/Clipvertrag und die
mobile Abnahme stehen in [ANIMATION_PIPELINE.md](ANIMATION_PIPELINE.md). Es liegt keine Spine-
Lizenz vor und keine Spine-Runtime wird ausgeliefert; deren spätere Einbindung ist ein eigener
Schritt nach geklärter Nutzung und passenden Exporten.

`POST /api/game/bosses/{bossId}/fight` autorisiert die aktuelle Kampagne anhand von Account,
Level, Entdeckungsreihenfolge und Modus. Der Server berechnet den Verlauf und verbucht den
Erstabschluss samt kosmetischer Belohnung transaktional. Wiederholte Request-IDs oder Siege
erzeugen keine zweite Beute; Kämpfe vergeben keine XP. Zehn Bosse erscheinen nacheinander,
Normal/Hard/Episch/Ultimate haben eigene Levelgrenzen. Der Aktivitäts-Wochenboss bleibt getrennt
und behält die 2-Schaden-pro-XP-Regel. Künftige Balance-/Katalogänderungen benötigen einen
bewussten Versions-/Migrationspfad für gespeicherte Abschlüsse.

Haar-/Outfit-Sammlungsbilder haben eine Zuordnung je Charakterdarstellung; weibliche Dateien
enden auf `-female-v1.webp`. Die gespeicherte Cosmetic-ID bleibt die Familie; ausgerüstete
Module werden für die aktuelle Darstellung aufgelöst. Es gibt weiter 40 Besitz-IDs und 60
Sammlungsbilder. Aura-IDs, Erstabschlussregeln und Accountbesitz werden dadurch nicht dupliziert.

### Aura-Belohnungen mit festem Design

`domain/aura-designs.ts` beschreibt Waldlicht, fünf Aktivitäts-Auren und zwanzig Boss-Auren.
`rendering/aura-visuals.ts` ist die gemeinsame Registry für **26 Aura-IDs und 26 transparente
WebP-Dateien** mit Position, Größe, Deckkraft und Bewegung. Dämmerungs-/Blutmond-Auren besitzen
eigene neue Bilder; die früheren Tönungsaliase sind ersetzt. `shared/character-aura.ts` zeichnet
das gewählte Bild in SVG/CSS, `rendering/aura-layer.ts` dieselbe Grafik im Pixi-Szenenticker.
Keine alten Outline-Auren als zusätzliche Ebene. Beide Renderer bleiben ohne Gameplay-Zugriff.
Das freie Aura-Labor und seine Farb-/Schattenblicksignale sind entfernt. Neue Farbvarianten
sind eigene freizuschaltende Katalogeinträge; Gesichtsmimik und Iris-VFX bleiben Erweiterungen.

`domain/aura-rewards.ts` ist die kanonische Regelquelle: `STARTER_AURA_IDS`, `AURA_REWARDS`,
`isKnownAura`, `hasAuraAccess` und `grantActivityAuras`. Starter sind ausschließlich `none`
und `sage`. Die fünf Aktivitätsbelohnungen entstehen bei einem akzeptierten Eintrag mit
positiver Aktivitäts-XP: Rosenlicht bei Übertritt zu Level 5, Schattenflamme bei 10, Nordlicht
bei 20, Sternenkranz bei 40 sowie Moosseele bei lebendem→besiegtem Aktivitäts-Mooswächter.
Boss-Auren stammen aus `BOSS_COSMETICS`. Besitz liegt als `unlockedAuras` im Server-Snapshot;
im lokalen Testadapter wird er beim Journal-Replay rekonstruiert. Kein Zufallsdrop,
Claim-Endpoint oder Grant aus unverändertem Laden. Eine schmale Bestandsmigration erhält
früher gültig angelegte oder verdiente `rose`/`void`-Rechte, ohne weitere Freischaltungen.

Creator und `AuraCollection` lesen Besitz über den Store. `updateCharacter` lehnt bekannte,
aber nicht verdiente Auren ab; reine Profilnormalisierung prüft bekannte IDs. Ohne passenden
Besitz fällt allein die Aura auf `none` zurück. Erst ein passender epischer/ultimativer
Boss-Erstabschluss schaltet eine der zwanzig Kampagnen-Auren serverseitig frei.
Kaufrechte bleiben getrennt in der Membership-Prüfung; individuelle Itemslots sind eine Erweiterung.

## Interessen und Onboarding ohne XP-Mutation

`domain/journey.ts` definiert `JourneyPreferences`: eindeutige `interestIds`, `activeSkillIds` und eine
in der Auswahl enthaltene `primaryInterestId`. Validiert werden 1–7 bekannte Interessen und 1–6
aktive Skills aus dem 14er-Katalog. `JourneyStore` lädt/speichert im Accountmodus über `GET/PUT /api/game/journey` und verwirft
verspätete Antworten nach Accountwechsel. Im lokalen Adapter speichert `JourneyPreferencesStorage` eine separate V1-Hülle
unter `everbloom.journey.v1`, `JourneyStore` hält Präferenzen, Konfigurations-/Persistenzstatus und
Rückmeldungen. Ungültige Eingaben ändern nichts; ein gesperrter Speicher erlaubt Sitzungsnutzung mit
Hinweis. Die Defaults enthalten Calisthenics, Running, Meditation und Programming.

`features/onboarding` bietet Interessen, Fokus-Skills und Zusammenfassung. Ein flüchtiger
`OnboardingDraft` erhält Schritt und Auswahl beim Abstecher zum Creator, ohne Browser-Speicherung.
Der Creator akzeptiert nur `returnTo=onboarding` als Rückweg; ohne gespeichertes Profil und ohne
konfigurierte Reise führt der erste erfolgreiche Profilabschluss ebenfalls zur Einführung.
Abbrechen/Überspringen und spätere Änderung bleiben möglich. `GameStore` leitet aktive Skill-Views
und Avatarinteresse aus den Präferenzen ab; der letzte belohnte Skill hat bei der Darstellung Vorrang.
Journey-Speicherung vergibt keine XP und ändert keine Bosswerte. Vor dem ersten Tageseintrag
aktualisiert sie einen noch unberührten Tagesquestplan; ein begonnener Plan bleibt erhalten.

`DailyQuestPlan` ist eine reine Java-Funktion mit festen Zielen je Skill und einem beim Erstellen
gespeicherten Bonus. Sie erhält Charakter-XP, leitet daraus das aktuelle Level ab und verwendet
`max(40, round((1200 + 200 × (Level − 1)) × 0,02 / 5) × 5)` Bonus-XP je Quest.
Level 1/10/20/50 gibt 40/60/100/220 XP; höchstens drei Quests ergeben 120/180/300/660 Bonus-XP.
Ein späterer Levelaufstieg bewertet den gespeicherten Plan nicht neu.
Sie wählt höchstens drei unterschiedliche Fokus-Skills; bei mehr als drei rotiert die Auswahl mit
`floorMod(LocalDate.toEpochDay(), skillCount)`, sonst bleibt die Auswahlreihenfolge erhalten.
`GameService` erzeugt den Plan unter der bestehenden Account-Zeilensperre bei einem echten
Tageswechsel oder einer Journey-Speicherung ohne heutige Aktivitäten und ohne Questfortschritt/Claim.
Schon ein heutiger Eintrag mit 0 XP sperrt den Austausch. Damit können Fokuswechsel und parallele
Requests keine zusätzlichen täglichen Questboni erzeugen. Der Server-Spieltag bleibt Europe/Vienna.

Die API liefert die Definitionen im vorhandenen Snapshot; keine neue Tabelle oder DTO-Version.
Nach erfolgreichem Onboarding lädt der bestehende `gameGuard` den aktuellen Spielstand vor dem
Dashboard. Ohne gespeicherte Journey bleibt der bisherige Standardplan erhalten. Öffentliche Demo
und historisches V1-Journal behalten ihre festen Questregeln, weil alte Journale keine wechselnden
Questdefinitionen speichern. Eine spätere Änderung historischer Regeln braucht eine eigene Migration.

Der 14er-Katalog liegt weiterhin in `domain/catalog.ts`; `mock-data.ts` erzeugt für jeden Skill
Fortschritt. Die ursprünglichen vier Demo-Startstände bleiben bestehen, zehn neue starten bei 0 XP.
Raten und Tageslimits bleiben reine Domainwerte; Fokusauswahl löscht keinen Skillfortschritt.
Accountprofile, Journey-Präferenzen und Fortschritt werden serverseitig gespeichert. Neue Accounts
starten mit 0 XP und vollem Wochenboss; die fortgeschrittenen Seeds bleiben auf die Vorschau begrenzt.

### Nur lesender Fortschrittsausblick

`domain/progression-horizon.ts` leitet den Account-Ausblick „Am Horizont“ aus dem vorhandenen
Snapshot ab. Der Helper verwendet `discoveredBosses`, `bossEncounter`, `bossFirstClearReward` und
die bestehende Level-Aura-Kurve. Ergebnis sind höchstens eine aktuell entdeckte, noch unbesiegte
Normal-Begegnung mit Mindest-/Empfehlungslevel und Erstabschluss-Cosmetic sowie eine künftige
unbesessene Level-Aura. Besitz, Rest-XP und Levelzugang werden nur angezeigt; es gibt weder eine
neue Reward-Mutation noch persistierten Vorschau-State oder zusätzliche Serveranfragen.

`shared/progression-horizon.ts` rendert das Ergebnis im Dashboard. Der Accountmodus begrenzt die
Anzeige; die öffentliche Demo zeigt sie nicht. Leere Ziele blenden die Karte aus. Spätere Bossnamen
bleiben verborgen, Levelzugang wird nicht mit einem sicheren Sieg gleichgesetzt. Überschrittene
Aura-Schwellen ohne Besitz werden nicht nachträglich belohnt oder als neuer Anspruch beworben.
Der [Vergleich von elf Apps und Spielen](COMPETITOR_RESEARCH.md) begründet die Produktauswahl;
Fokustimer, eigene Routinen und Geschichten sind weiterhin Planung.

## Erfolgsfeedback ohne zusätzliche Progressionsmutation

`domain/milestones.ts` vergleicht die Snapshots eines akzeptierten Aktivitätsrequests. Erkannte
Übergänge: Charakter-/Skill-Level, erster belohnter Eintrag des Tages, alle Daily Quests erledigt,
Wochenboss besiegt und eine neue Aura verdient. Der Store reicht diese nur bei einem neuen, belohnten Ergebnis an
`ProgressFeedback` weiter. Laden, Reset, Profiländerungen und Duplikate passieren diesen Pfad nicht.
Einzelne Questabschlüsse sind kein eigener Audio-Auslöser.

`ProgressFeedback` bündelt Erfolge zu einer etwa sechs Sekunden sichtbaren Meldung. Feuerwerk
liegt in `shared/celebration.ts`; `SuccessAudio` erzeugt eigene kurze Web-Audio-Motive für Quest,
Level, Boss-Sieg und Loot, höchstens sechs Stimmen und etwa eine Sekunde lang. Das priorisierte
Haupt-Meilensteinereignis bestimmt den Klang; `rewardCue()` verwendet Loot. Audio wird im Rahmen
einer Nutzerinteraktion vorbereitet. Fehlende Unterstützung,
blockiertes Audio und Aufräumen beim Schließen dürfen keine Spielbuchung verändern. Einstellungen
für Ton, Feuerwerk und Charakterbewegung werden separat vom Profil unter `everbloom.feedback.v1`
gespeichert. Vorschau ist ausdrücklich UI-Feedback ohne Domainmutation. Die Meldung ist kein
persistiertes Achievement und kein Event-Bus.

`BattleAudio` ergänzt eigenständige Treffer-, Schutz- und Heilklänge aus Hero-Stil und
Boss-/Fähigkeits-ID. `BattlePlayback` löst sie nur für neu dargestellte Züge aus; Laden und Skip
bleiben stumm. Pose und Effekt werden über die Zugidentität auch bei aufeinanderfolgenden
Angriffen desselben Akteurs erneut ausgelöst. Ein 600-ms-Abschlussfenster lässt die letzte Aktion
vor der Ergebnisdarstellung sichtbar. Pause, Hintergrund, Mute und Abbau stoppen Klänge;
Resume wiederholt keinen bereits gezeigten Treffer. Gestaltungsquellen, Grenzen und Hörabnahme:
[VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md).

## Accountfluss und Besitzergrenze

Die aktive App startet auf `/auth`. Registrierung → E-Mail-Verifikation → Login →
Charaktererstellung → Interessen-Onboarding → Dashboard ist implementiert. `/demo` bleibt eine
öffentliche isolierte Vorschau ohne Kontoimport oder echte XP. `/dev/auth` leitet nur noch zu
`/auth` um. `accountGuard`/`gameGuard` prüfen Session und Charakterstatus; die API prüft jede
Anfrage unabhängig vom Router. `/account` bietet Export, Logout und Kontolöschung.

`AuthStore` hält Sessionzustand im Speicher. Identitätswechsel, Logout und Sessionablauf erhöhen
seine Epoch; Game-/Journey-State und verspätete Antworten werden daran gebunden. Kontogebundene
Anfragen verwenden `AuthStore.owned` und den Header `X-Everbloom-Account` mit der in dieser App
angezeigten Account-ID. Der Server vergleicht ihn vor Controller/CSRF mit der authentifizierten
Session und antwortet bei Abweichung mit `409 ACCOUNT_CHANGED`, ohne die tatsächlich gültige
Cookie-Session des anderen Fensters zu beenden. Der Header ist eine Konsistenzprüfung, keine
Authentifizierungsquelle; ältere direkte API-Clients können ihn weglassen.

App-Resume prüft `/api/auth/me` erneut. Dieselbe Identität behält ihre Epoch und offenen Entwürfe;
eine unerwartete Identität leert den lokalen Kontostand und verlangt explizite Neuanmeldung.
Ein vorübergehender Netzwerkfehler erhält den bestehenden Entwurf und bleibt sichtbar.
`HttpGameRepository` verwirft verspätete Antworten aus alten Accounts; 401 lässt die Sitzung auslaufen.

Private Spielstände werden weder aus alten Journals importiert noch als Account-Cache in Local
Storage abgelegt. Dort liegt ausschließlich der begrenzte unbestätigte Aktivitätsbefehl zur sicheren
Wiederholung (siehe unten), ohne Auth-Daten oder vorhergesagte Rewards. Der freiwillige Check-in
ist im Accountmodus flüchtig, Feedbackpräferenzen bleiben Geräteeinstellungen. Eine verlorene
Verbindung öffnet keinen lokalen Ersatz-Spielstand.

Der Browser spricht `/api` auf seinem Origin an (lokal über Angular-Proxy). Nativ liest
`RuntimeApiConfiguration` die öffentliche gebündelte HTTPS-Zieladresse. Ohne gültige Konfiguration
werden keine Account-Anfragen gesendet. `NativeTransport` verwendet CapacitorHttp und den nativen
Cookie-Store. CSRF-Token sind ausschließlich im Speicher; jeder schreibende Methodenhelfer hängt
sie an. Die Transportgrenze vereinheitlicht HTTP-/Offline-/Timeoutfehler als `ApiError`, folgt
nativ keinen Redirects und wiederholt Schreibrequests nicht automatisch.

## Implementierte Beta-API

| Endpunkte | Verantwortung |
| --- | --- |
| `GET /api/auth/csrf`, `GET /api/auth/me` | CSRF und aktuelle Session |
| `POST /api/auth/register`, `/login`, `/logout` | Registrierung und Sessionwechsel |
| `POST /api/auth/verification/request`, `/verification/confirm` | E-Mail bestätigen |
| `POST /api/auth/password/request`, `/password/reset` | Passwort wiederherstellen |
| `GET /api/account/export`, `POST /api/account/delete` | vollständiger Serverdatenexport; Löschung mit Passwortbestätigung |
| `GET /api/game` | aktueller Snapshot, serverseitiger Periodenwechsel |
| `PUT /api/game/character` | validiertes Profil anlegen/ändern, ohne Progressionsmutation |
| `POST /api/game/activities` | `{requestId, skillId, minutes}` → Snapshot und Rewards |
| `POST /api/game/bosses/{bossId}/fight` | `{requestId, difficulty, tactic}` → Replay, Snapshot, Erstabschluss und gegebenenfalls kosmetische Belohnung |
| `GET/PUT /api/game/journey` | Interessen und aktive Skills |

Der Server ermittelt die Besitzer-ID aus der geprüften Session; Clientwerte für Account-ID, XP,
Stats, Tagesdatum oder Boss-Schaden sind keine Schreibparameter. Neue Accounts starten bei Level 1
und 0 XP. Authentifizierte Ladevorgänge können den persönlichen Basisstand initialisieren;
Charaktererstellung setzt separat `createdByPlayer`.

`GameService` serialisiert Profil- und Aktivitätsänderungen über eine Account-Zeilensperre in
DB-Transaktionen. Der eindeutige Schlüssel `(account_id, request_id)` verhindert Doppelbuchungen.
Gleiche ID und gleiche Eingabe liefert den aktuellen Snapshot mit `duplicate: true`, ohne Rewards;
abweichende Eingabe zu einer bereits benutzten ID wird abgelehnt. Das ist bewusst keine Rückgabe
eines veralteten historischen Snapshots. Idempotenz ersetzt keine Offline-Warteschlange.

Der Server berechnet Day-/Week-Keys aus seiner Clock in `Europe/Vienna`. Diese feste Beta-Zeitzone
ist noch keine pro Account wählbare IANA-Zeitzone. Reale Aktivitäten treiben XP, Quests, Wochenboss
und Aktivitäts-Aura-Vergabe. Die separate Bosskampagne vergibt kosmetische Erstbelohnungen;
Probekämpfe bleiben ohne Servermutation.
Der TypeScript-Katalog ermöglicht Vorschauen; die Java-Regeln sind für gespeicherte Rewards
maßgeblich. Gemeinsame fachliche Fixtures prüfen die Übereinstimmung.

## Wiederaufnahme eines unbestätigten Aktivitätseintrags

`PendingActivityStorage` sichert vor dem ersten POST genau einen Originalbefehl je Account unter
`everbloom.pending-activity.v1.<account-id>`: Version, Besitzer-ID, ursprüngliche UUID, Skill und
Minuten. Exakte Schlüssel, bekannte Skills, gültige Minuten/UUID und eine kleine Größenbegrenzung
werden beim Laden geprüft. Keine XP, kein Token, kein Spielstand und keine Offline-Warteschlange.
Web Locks serialisieren Reservieren und Löschen zwischen Fenstern, sofern die Engine sie anbietet;
ältere Engines erhalten die Lese-/Vergleichsprüfungen, aber keine vollständige Tab-Sperre.

Nach Netzfehler, Sessionwechsel oder App-Neustart zeigt nur derselbe angemeldete Account den
unbestätigten Eintrag. Die Wiederholung zeigt unveränderbare Originalwerte und verwendet dieselbe
UUID. Sie wird ausschließlich bewusst ausgelöst, niemals automatisch. Neue Aktivitätseinträge
bleiben bis zur Klärung gesperrt. Ein Timeout kann bereits serverseitig gespeichert worden sein;
auch ein späterer Fehlerstatus beweist nicht das Gegenteil und löscht die Reservierung nicht.
Erst eine bestätigte 2xx-Antwort einschließlich `duplicate: true` gibt sie frei. Ein Duplikat zeigt
Bestätigung, vergibt keine zusätzlichen XP und spielt keine zweite Erfolgsfeier.

Logout erhält die Reservierung; bestätigte Kontolöschung entfernt sie nach Möglichkeit lokal.
Andere Accounts sehen diesen Befehl nicht. Fehlender Gerätespeicher blockiert einen neuen POST;
unlesbare Daten werden nicht still verworfen, sondern verlangen Prüfung des Verlaufs und bei
Bedarf Support. Wurde der ursprüngliche Eintrag schon angenommen, bleibt sein gespeicherter Tag
erhalten. Wurde er nie angenommen, zählt die erste erfolgreiche Wiederholung nach dem aktuellen
Servertag; dieser Hinweis steht in der Oberfläche. Es gibt keine rückdatierte Aktivitätsbuchung.

Diese Wiederaufnahme gilt nur für Aktivitäten. Die Request-ID eines laufenden Bosskampfs liegt
weiterhin im Sitzungsspeicher; seine genau einmalige Erstbelohnung wird unabhängig davon auf dem
Server geschützt. Geräte-/Betriebsnachweise bleiben getrennt in VALIDATION und NATIVE_BETA.

## Backend, Sitzungen und Datenhaltung

Spring Boot 4.1.1 / Java 21 bleibt ein kleiner Monolith mit `auth`, `game` und `common`.
PostgreSQL und Flyway halten Accounts, gehashte Einmaltokens, Spring-Session-JDBC-Tabellen,
Game-Snapshots, Journey-Auswahl, Activity-Request-IDs und Bosskampf-/Erstabschlussdaten. Es gibt keinen zusätzlichen Service
pro Skill oder Boss. Die V2–V4-Migrationen erweitern die vorhandene Accountbasis.

Neue Passwörter verwenden Argon2; vorhandene BCrypt-Hashes bleiben über einen Delegating-Encoder
lesbar. Verifikations-/Reset-Tokens sind zeitlich begrenzt und nur gehasht gespeichert.
Registrierung und E-Mail-Anfragen verwenden allgemeine Antworten. Rate-Limits und begrenzte
Requestgrößen liegen vor den betreffenden Schreibpfaden. Limits sind für einen Backend-Prozess
implementiert; ein verteiltes Deployment braucht dafür eine gemeinsame Grenze.

`EVERBLOOM_SESSION` ist HttpOnly, in der Produktionskonfiguration Secure und SameSite=Lax.
Die Cookie-Lebensdauer ist explizit 30 Minuten, auch für Androids Cookie-Persistenz. Der Server
prüft Session und Accountversion unabhängig davon. Passwortreset/Kontolöschung entziehen alte
Sitzungen die Berechtigung. CSRF gilt auch für native Clients. Weder Browser noch App speichern
Login-Tokens in Local Storage oder Preferences. Native Plattformentscheidungen und notwendige
Geräteabnahme stehen in [NATIVE_BETA.md](NATIVE_BETA.md).

Produktionsstart benötigt SMTP und einen echten öffentlichen HTTPS-Host. Nur das an Loopback
gebundene `dev`-Profil bietet eine lokale Mail-Outbox, ohne E-Mails zu versenden. Export und
Löschung sind reale Accountoperationen; ein Prototyp-Reset gehört nicht zum Account-Repository.
Deployment, Backups und Betrieb: [BETA_OPERATIONS.md](BETA_OPERATIONS.md).

## Bewusste Grenzen

Kein Offline-Sync, Event Bus, GraphQL, SSR für private Screens, Microservice, Nx oder NgRx.
Demo-Journale sind kein Leistungs- oder Berechtigungsnachweis und werden nicht automatisch in
Accounts übernommen. Kauf-/Restore-Adapter und serverseitige Entitlements sind implementiert;
reale Store-Verbindung und Kaufabnahmen fehlen. Push und native E-Mail-Deep-Links bleiben geplant.
Capacitor-Projekte und erfolgreiche Synchronisation sind kein signierter Gerätebuild.
Kampfanimationen vergeben keine Rewards; die öffentliche Vorschau ist vom Account getrennt.

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
abgebildet. Der Mock ist kein Netz- oder Synchronisationsbeweis. Resume und Android-Zurück werden bereits durch den kleinen `NativeLifecycle`-Adapter behandelt.
Der native Membership-Adapter ist vorhanden; Haptik bleibt geplant. Geräteprüfungen müssen
Zurück-Navigation, Tastatur, App-Unterbrechung, Audio, wiederholte Requests und die
Kauf-/Restore-Flows abdecken.

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

## Native Beta und mobile Abnahme

Capacitor 8 ist für iOS und Android mit `webDir: dist/everbloom/browser` eingerichtet. Das
Web-Bundle liegt lokal in der App; es gibt keine Live-Reload-URL im Release. `SystemBars` und
Android `EdgeToEdge` ergänzen die CSS-Safe-Areas. App-Resume aktualisiert den authentifizierten
Spielstand; Android-Zurück nutzt den Router/History und minimiert an der Rootseite. Der
Account-Export verwendet eine temporäre private Cache-Datei und das native Share-Sheet.

Xcode 26.6 und Android SDK/API 36 sind auf diesem Mac eingerichtet. Version 0.2.0 / Build 2
wurde als Android-Debug-APK und iOS-Simulator-App gebaut, installiert und gestartet. Dieser
Nachweis verwendet noch keinen konfigurierten nativen Account-Endpunkt. Öffentliches HTTPS-Backend,
Signierung sowie Account-Flows, Cookie-Kaltstart, Tastatur, Screenreader, Resume, Export und
Renderer-Performance auf echten Geräten bleiben offen.
Die konkreten Befehle und offenen Punkte stehen in [NATIVE_BETA.md](NATIVE_BETA.md).

Store-Billing-Adapter, serverseitige Kaufprüfung, Wiederherstellung und Entitlement-Lebenszyklus
sind implementiert. Apple-/Google-Entwicklerkonten sind laut Betreiber vorhanden; die reale
Store-/RevenueCat-Verbindung, Signierung, öffentliche Betreiberidentität und Kaufabnahme bleiben
offen. Datenschutz und Store-Angaben richten sich nach den tatsächlichen Datenflüssen.
Die Freigabe-Gates und offiziellen Quellen stehen in [RELEASE_V1.md](RELEASE_V1.md).
Herovera ist nur eine Namensempfehlung; die technische App-ID wurde nicht umbenannt.

## Freiwilliger Check-in ohne neue Backend-Schicht

Reine Validatoren und Datumsregeln liegen in `domain/daily-care.ts`; `DailyCareStore` kapselt
Signale und den injizierbaren lokalen Tagesgeber. Im Accountmodus bleibt der Check-in in der
Sitzung; ausschließlich der lokale Demo-/Testmodus nutzt Browser-Speicherung. Das Panel bearbeitet einen
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

## Membership: native Käufe, serverseitige Berechtigungen

`data/native-membership.ts` kapselt das RevenueCat-Capacitor-SDK und externe Store-Verwaltung;
`state/membership.store.ts` hält den Konto-/Statusfluss. Kaufpreise kommen aus dem passenden
monatlichen Store-Produkt. Apple-Produkt-ID und Googles `subscription:basePlan`-ID bleiben
getrennt. SDK-Konfiguration verwendet die vom Backend zugeordnete App User ID, keine anonyme
Kaufidentität und keine vom Client vorgeschlagene Account-ID.

`GET /api/billing/membership` liefert Status und öffentliche Kaufkonfiguration;
`POST /api/billing/refresh` prüft den Provider neu. Der autorisierte RevenueCat-Webhook
`POST /api/billing/revenuecat/webhook` löst ebenfalls einen Serverabgleich aus. Server-API-Key
und Webhook-Authentifizierung bleiben ausschließlich im Backend. Der Store-Checkout allein
verleiht keine vom Client selbst gesetzten Rechte. Konfiguration und Restore-Policy:
[MONETIZATION.md](MONETIZATION.md).

`EVERBLOOM_BILLING_MODE=preview` ist die ausdrücklich lokale Testvorschau aller Modi ohne Kauf
und XP-Zuschlag; sie ist nicht mit gekauftem Plus gleichzusetzen.
Im konfigurierten `live`-Modus sind die fünf Normal-Bosse auf Basislevel 10–50 Free.
Alle Modi der Bosse 60–100 und sämtliche höheren Modi der ersten fünf sind an aktives Plus
gebunden: 35 Plus-Begegnungen bei 40 insgesamt. Auch Probekämpfe und deren Wiedergabesteuerung
beachten diese Grenze. Skills, XP und Charakterlevel haben keine Abo-bedingte Obergrenze. Nur Charakter-Aktivitäts-XP erhalten `floor(Aktivitäts-XP / 10)` zusätzlich;
Skill-XP, Questboni und direkter Kampfschaden bleiben unverändert. Der Server prüft diese Regeln.
Nach Ablauf bleiben verdiente Cosmetics im Spielstand und ausrüstbar. Kontolöschung und
Store-Kündigung bleiben unterschiedliche Vorgänge. Die Implementierung belegt noch keinen
echten Kauf, Restore auf Geräten oder öffentlichen Betrieb.
