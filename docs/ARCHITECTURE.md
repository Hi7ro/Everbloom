# Architecture · V0.1

## Ziel

Angular/TypeScript als CSR-SPA; später identischer Web-Build in Capacitor für iOS/Android.
Spring Boot als modularer Monolith mit PostgreSQL. Kein SSR: das persönliche Dashboard braucht
keine Suchmaschinenoptimierung; ein zusätzlicher Node-Server wäre hier unnötig.

Angular 21 mit kompatibler TypeScript-Version und lokalem CLI unterstützt die vorhandene
Node-20.20-Umgebung. Standalone, zoneless Change Detection, Signals und lazy Router-Route.
Versionsreferenz: https://angular.dev/reference/versions

## Frontend-Schichten

```text
features/dashboard/     Darstellung + lokaler Formularzustand
          ↓
state/game.store.ts    Signals, computed Views, Commands, Feedback
          ↓
data/game.repository  expliziter Vertrag: Snapshot laden / Aktivität verbuchen / Demo-Reset
          ↓
data/mock-*            speichert in Memory, ruft Domainfunktion auf
          ↓
domain/                Modelle, Katalog/Balance und reine Progressionsfunktionen
```

Views kennen weder Mock-Seeds noch Transport. Der Store kennt den per InjectionToken bereitgestellten
Adapter. Repository-Methoden sind asynchron, damit ein HttpClient-Adapter später dieselbe Oberfläche
bedient. Die Domain importiert weder Angular noch Browser-APIs. Keine Datenbank-/Java-Entity im Template.

Die einzige fachliche Mutation `recordActivity` liefert einen neuen vollständigen Snapshot und eine
Reward-Zusammenfassung. Im Mock werden Aktivität, XP, Quests und Boss in einem Rechenschritt geändert.
Während eines Requests verhindert `busy` parallele UI-Commands. Errors sind sichtbar, Zustand bleibt erhalten.

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

Kein Offline-Sync, Event Bus, GraphQL, SSR, Microservice, Nx oder NgRx. Keine dauerhafte Speicherung
im ersten Slice. Reset ist ein Mock-Adapter-Kommando und wird nicht als produktiver Account-Reset
übernommen. Serverperioden, echte Wochenhistorie und Berechtigungen folgen mit der API.

## Tests und Änderungen

Reine Domain-Tests prüfen XP/Levelgrenzen, Limits, Idempotenz und atomare Rewards.
Angular-Tests prüfen den echten Store/Mock-Datenfluss und das Formular. `npm run build` prüft
Templates und TypeScript sowie Bundle-Budgets. Fachregel ändern → GDD, Balance und Test gemeinsam
ändern. API hinzufügen → Adapter implementieren, Provider tauschen, Fehlerfälle testen.

Für die responsive Dashboard-Ansicht gilt ein Komponenten-CSS-Budget von 16 kB (Warnung) und
20 kB (Fehler); die aktuelle Ansicht benötigt rund 14 kB. Das Initial-Bundle bleibt bei den
CLI-Grenzen 500 kB / 1 MB. Kleinere Karten werden erst bei Wiederverwendung separat extrahiert.
