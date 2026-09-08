# Real-Life MMORPG · Arbeitstitel „Everbloom“

**You are the character. Real life is the progression.**

Ein nachvollziehbares Full-Stack-Lernprojekt mit Angular und später Spring Boot/PostgreSQL.
Der Arbeitstitel ist vorläufig; eigene Figuren, Lore und Assets, keine übernommene Franchise-IP.

## Source of Truth

1. [Game Design](docs/GAME_DESIGN.md): Spielregeln, Inhalte und offene Balancing-Entscheidungen.
2. [Product Requirements](docs/PRODUCT_REQUIREMENTS.md): Umfang, Meilensteine und Abnahmekriterien.
3. [Architektur](docs/ARCHITECTURE.md): Schichten, Datenfluss und spätere Backend-Anbindung.
4. [Domain Model](docs/DOMAIN_MODEL.md): Begriffe, Beziehungen und Invarianten.
5. [Lernpfad](docs/LEARNING_PATH.md): Code lesen und den nächsten Slice umsetzen.
6. [App Store & Reichweite](docs/APP_STORE_READINESS.md): ASO, SEO und Release-Anforderungen.
7. [Validierung](docs/VALIDATION.md): Tests, Browser-Prüfung und bekannte Grenzen.

Diese Dokumente haben Vorrang vor älteren Brainstorming-Vorschlägen. Änderungen an Regeln werden
zusammen mit Code und Tests angepasst. Das Projekt liegt unter `~/dev/everbloom`.
Synchronisierte ChatGPT-Referenzen bleiben unverändert im ursprünglichen Projektordner
`~/.codex/.chatgpt-projects/g-p-69d77296155481918757776d1af8d859/sources/`.

## Projektstruktur

```text
docs/       Produkt, Spielregeln, Domain, Architektur, Lernpfad
frontend/   Angular SPA, TypeScript, Standalone, Signals, Router, SCSS
backend/    M1-Anbindungsplan; noch keine Spring-Boot-Anwendung
database/   M1-Datenbankplan; noch keine Migrationen
```

## Lokal starten

Voraussetzung: Node.js 20.19+ innerhalb der 20er-Serie oder eine zu Angular 21 kompatible neuere Version; npm.

```sh
cd frontend
npm ci
npm start
```

Dashboard: http://localhost:4200/dashboard

```sh
npm test -- --watch=false
npm run build
```

Der erste Slice nutzt ausschließlich Mock-Daten im Arbeitsspeicher. Neuladen setzt die Demo zurück.
Keine Anmeldung, Abrechnung oder Serverpersistenz. „Demo zurücksetzen“ startet denselben Beispieltagesstand.
Angular 21 passt zur vorhandenen Node-20-Umgebung; Versionen werden im Lockfile festgehalten.
Kompatibilitätsquelle: https://angular.dev/reference/versions

## Stand

M0-Dokumentation und Angular-Grundlage sowie erster M1-Dashboard-Slice. Die vollständige M1-Abnahme
(Persistenz, Periodenwechsel, Onboarding, API) steht noch aus; siehe PRD.
# Everbloom
