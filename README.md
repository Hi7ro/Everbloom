# Herovera · Real-Life MMORPG

**You are the character. Real life is the progression.**

Herovera ist ein Full-Stack-Lernprojekt für ein mobiles Lebens-RPG. Reale Aktivitäten entwickeln
den eigenen Anime-Chibi, seine Skills, Tagesquests und einen Wochenboss. Die Figuren, Lore und
Assets bilden eine eigene IP. **Herovera** ist seit dem 8. Oktober 2026 der gewählte öffentliche
App-Name; Everbloom war der bisherige Arbeitstitel. Die Entscheidung ist keine Marken- oder
Domainregistrierung. Repository-Pfad, gespeicherte Daten und technische IDs behalten ihre bisherigen
Kennungen, damit bestehende Installationen und Konten kompatibel bleiben.

Die aktuelle Fassung bereitet eine **geschlossene Beta** vor: Angular/TypeScript, Spring Boot/Java,
PostgreSQL und native Capacitor-Projekte. Android-Debug-APK und iOS-Simulator-App wurden lokal
gebaut, installiert und gestartet; das ist noch keine veröffentlichte Store-App.
Die Umsetzung und die tatsächlich ausgeführten Prüfungen sind getrennt dokumentiert.

Der [V1-Releasevertrag](docs/RELEASE_V1.md) enthält den aktuellen Lieferumfang und die offenen
Freigaben. Der [Beta-Leitfaden](docs/BETA_RELEASE.md) ergänzt die vereinfachte lokale Einrichtung.

## Einstieg und Spielstand

Der Spielpfad lautet **Konto → E-Mail bestätigen → Anmelden → Charakter → Interessen → Dashboard**.
Ein neues Konto beginnt auf Level 1 mit 0 Charakter-/Skill-XP, Basisattributen von jeweils 1,
0 Momentum und einem vollständigen Wochenboss. Es übernimmt keinen früheren lokalen Demo-Spielstand.

Charakter, Interessen, Aktivitäten, Questfortschritt und erspielte Auren werden dem bestätigten
Konto zugeordnet. Das Backend berechnet XP und Belohnungen, begrenzt Tagesminuten und verhindert
Doppelbelohnungen bei wiederholten Anfragen. Ein unbestätigter Aktivitätseintrag bleibt lokal dem
Account zugeordnet und lässt sich auch nach Neustart bewusst mit seiner ursprünglichen ID
wiederholen; es gibt keine automatische Offline-Buchung. Spieltage richten sich nach **Europe/Vienna**;
Montag beginnt eine neue Bosswoche. Account-Löschung entfernt zugehörige Spielstände mit.

Der gewählte Fokus bestimmt bis zu drei persönliche Tagesquests. Ihr Bonus wächst mit dem
Charakterlevel: mindestens 40 XP, sonst rund 2 % der aktuellen Levelspanne, auf fünf XP gerundet.
Beim Erstellen des Plans wird der Bonus festgehalten; ein späterer Levelaufstieg ändert ihn nicht.
Bei mehr Fokus-Skills wechseln die Aufgaben täglich. Nach dem ersten Tageseintrag bleibt der heutige
Plan bestehen; Fokusänderungen greifen dann am nächsten Spieltag.

„Am Horizont“ zeigt im Account die aktuelle entdeckte Bossbegegnung samt Levelvoraussetzung und
Erstabschluss-Belohnung sowie die nächste künftige Level-Aura. Weitere Bosse bleiben verborgen;
die Vorschau vergibt keine zusätzlichen XP. Die [Wettbewerbsanalyse](docs/COMPETITOR_RESEARCH.md)
vergleicht elf passende Apps und Spiele und begründet diese Ableitungen. Eigene Routinen,
Fokustimer und erzählte Kapitel bleiben geplante Erweiterungen.

`/demo` bleibt eine isolierte Vorschau für den Erfolgsmoment. Ihr Beispiel ist kein echtes Profil
und wird nicht in einen Account importiert. Der frühere Browser-Journaladapter bleibt als getestete
Domain-/Lernreferenz vorhanden, wird im Accountmodus aber nicht als Fortschrittsquelle verwendet.

## Lokal starten

Voraussetzungen: **Node.js 24 LTS**, npm, **JDK 21+**, PostgreSQL. Die Java-Ausgabe wird für 21 gebaut.
Frontend und Backend laufen als getrennte Prozesse. Ein reiner Frontendstart erzeugt keinen Server.

```sh
cd backend
# Datenbank/Benutzer vorher lokal anlegen; Zugangsdaten nur lokal setzen.
export EVERBLOOM_DB_URL='jdbc:postgresql://127.0.0.1:5432/everbloom'
export EVERBLOOM_DB_USER='everbloom'
export EVERBLOOM_DB_PASSWORD='DEIN_LOKALES_DB_PASSWORT'
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

In einem zweiten Terminal:

```sh
cd frontend
npm ci
npm start -- --host 127.0.0.1 --port 4201
```

Einstieg: http://127.0.0.1:4201/auth · Vorschau: http://127.0.0.1:4201/demo

Der Entwicklungsproxy leitet `/api/**` an `127.0.0.1:8080` weiter. Das ausschließlich lokale
`dev`-Profil verwendet eine Mail-Outbox unter `http://127.0.0.1:8080/api/dev/mail/outbox`.
Bestätigungs-/Resetlinks aus dieser Test-Outbox ersetzen einen echten SMTP-Versand nur lokal.
In der öffentlichen Beta sind HTTPS und ein echter SMTP-Dienst erforderlich; das `dev`-Profil
gehört niemals auf einen öffentlichen Server.

## Prüfungen

```sh
cd frontend
npm run test:ci
npm run build
```

```sh
cd backend
./mvnw test
```

Backend-Fachtests nutzen H2 im PostgreSQL-Modus. Sie ersetzen keinen Test der Flyway-Migrationen
und des Betriebs auf PostgreSQL. Die Game-Regeln vergleichen außerdem gespeicherte, mit dem
TypeScript-Code erzeugte Referenzfälle mit Java-Ergebnissen. Aktuelle Laufzeit-, Browser- und
Gerätegrenzen stehen in [Validierung](docs/VALIDATION.md).

## Was spielbar ist

- Mobile Dashboard mit Chibi, Level/XP, Momentum, Attributen, Tagesvorschlägen, Quests und Verlauf.
- Zwölf illustrierte Startdesigns: sechs männliche und sechs weibliche Vorlagen; Frisuren,
  komplette Outfitsets sowie Augen-, Haut- und Haarfarben sind kombinierbar.
- Sieben Interessenbereiche und bis zu sechs Fokus-Skills aus 14 verfügbaren Skills.
- Freiwilliger Tages-Check-in, abschaltbare Ganzkörperatmung, Feuerwerk und eigene kurze Klänge
  für Quests, Level, Boss-Siege und Loot.
- Waldlicht als Starter; Rosenlicht ab Level 5, Schattenflamme ab 10, Nordlicht ab 20,
  Sternenkranz ab 40 und Moosseele als Aktivitäts-Wochenbossdrop. Weitere 20 Auren sind
  Bossbelohnungen. Alle 26 Auren besitzen eigene gemalte Bilder und erscheinen auch ausgerüstet.
  Farben sind Bestandteil des freigeschalteten Designs; das freie Aura-Labor ist entfernt.
- Zehn Bossbegegnungen von Level 10 bis 100 in Zehnerschritten mit Normal/Hard/Episch/Ultimate;
  40 einmalige kosmetische Erstabschluss-Belohnungen, serverseitig gespeichert. Der Wolkenkönig
  bleibt das Kapitel-1-Finale auf Level 50. Jede Schwierigkeit hat eine eigene Bossillustration.

- PixiJS-Kämpfe mit drei Taktiken, Skill-bezogenen Angriffen und eigenen Boss-Effekten.
  Eigene Kampfklänge unterscheiden Treffer, Schutz und Heilung; der letzte Zug bleibt vor dem
  Ergebnis sichtbar. Kämpfe geben keine XP; Probekämpfe und wiederholte Siege keine zusätzliche Beute.
- Konto-Verifikation, Passwort-Wiederherstellung, Datenexport und Konto-Löschung im Beta-Slice.

Outfitsets enthalten Waffen und Accessoires noch als gemeinsames Design. Einzelne Ausrüstungsslots,
weitere Inhalte, echte Skelettanimationen, Partys/Gilden/Raids und ausführliche Übersetzungen
sind weitere Ausbaustufen. Es ist keine Spine-Runtime eingebunden.

Der [Membership-Vertrag](docs/MONETIZATION.md) umfasst **fünf Normal-Bosse bis einschließlich Level 50 Free**.
**35 weitere Begegnungen gehören zu Plus**: alle Modi der Bosse auf Basislevel 60–100 sowie
Hard/Episch/Ultimate der ersten fünf Bosse. Dazu kommen **10 % zusätzliche Charakter-Aktivitäts-XP**. Skill-XP,
Questboni und direkter Kampfschaden bleiben unverändert; verdiente Cosmetics bleiben bei Abo-Ende
ausrüstbar. Preisziel: **3,99 €/Monat**, der tatsächliche lokalisierte Kaufpreis kommt aus dem Store.
Die Grenze betrifft Bosszugang einschließlich Probekämpfen, nicht Skills, XP oder Charakterlevel.
Der ausdrücklich lokale Standardmodus `preview` bleibt als Testvorschau für alle Modi kostenlos,
ohne Kauf und XP-Vorteil; er ist kein gekauftes Plus. RevenueCat-Adapter,
serverseitige Prüfung und Restore sind vorhanden; echte Store-Verbindung und Kaufabnahmen fehlen.
Das ist noch kein öffentlich kaufbares Angebot.

## Mobile Builds und Betrieb

Web-Anfragen bleiben auf derselben Origin wie die Oberfläche. Für einen nativen Beta-Build wird
nur die öffentliche HTTPS-Origin in die gebündelte Konfiguration geschrieben:

```sh
cd frontend
EVERBLOOM_API_ORIGIN=https://beta.example.com npm run native:sync
npm run native:ios
# oder: npm run native:android
```

Xcode und Android SDK sind lokal eingerichtet. Version 0.2.0 / Build 2 wurde auf beiden lokalen
Simulatoren installiert und gestartet. Dieser Nachweis verwendet noch keinen nativen Account-Endpunkt.
Apple-/Google-Entwicklerkonten sind laut Betreiber vorhanden. Öffentliches HTTPS-Backend, SMTP,
Betreiberidentität, Signierung sowie echte Geräte- und Store-Prüfungen bleiben offen.
Zugangsdaten werden nicht in `runtime-config.json` gebündelt.
Details und die Geräte-Abnahme stehen in [Native Beta](docs/NATIVE_BETA.md).

[Beta-Betrieb](docs/BETA_OPERATIONS.md) beschreibt die vorbereiteten Docker-/Caddy-/PostgreSQL-Dateien,
TLS, SMTP, Backups und Wiederherstellung. **Diese Dateien veröffentlichen nichts automatisch.**

## Projektstruktur und Source of Truth

```text
docs/       Produkt, Spielregeln, Architektur, Validierung und Betrieb
frontend/   Angular SPA, Signals, Router, SCSS, PixiJS, Capacitor
backend/    Spring Boot Account-/Game-API, Flyway-Migrationen, JDBC
deploy/     Container-Builds, Caddy, PostgreSQL, Backup-/Restore-Skripte
database/   ursprüngliche Modellierungsnotizen (Migrationen liegen im Backend)
```

1. [Master Prompt](docs/MASTER_PROMPT.md) · [Game Design](docs/GAME_DESIGN.md)
2. [Product Requirements](docs/PRODUCT_REQUIREMENTS.md) · [Produktrichtung](docs/PRODUCT_DIRECTION.md)
3. [Architektur](docs/ARCHITECTURE.md) · [Domain Model](docs/DOMAIN_MODEL.md)
4. [Art Direction](docs/ART_DIRECTION.md) · [Animation Pipeline](docs/ANIMATION_PIPELINE.md)
5. [Lernpfad](docs/LEARNING_PATH.md) · [Validierung](docs/VALIDATION.md)
6. [App Store & Reichweite](docs/APP_STORE_READINESS.md) · [Beta-Betrieb](docs/BETA_OPERATIONS.md)
7. [V1-Freigabe](docs/RELEASE_V1.md) · [Monetarisierung](docs/MONETIZATION.md) · [Bild und Klang](docs/VISUAL_AUDIO_DIRECTION.md)

Neue ausdrücklich vereinbarte Produktentscheidungen haben Vorrang; betroffene Spezifikationen
werden mit Code und Tests abgeglichen. Das Projekt liegt unter `~/dev/personal/everbloom`.
Synchronisierte ChatGPT-Referenzen unter `~/.codex/.chatgpt-projects/.../sources/` bleiben unverändert.
