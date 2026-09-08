# Real-Life MMORPG · Arbeitstitel „Everbloom“

**You are the character. Real life is the progression.**

Ein nachvollziehbares Full-Stack-Lernprojekt mit Angular und später Spring Boot/PostgreSQL.
Der Arbeitstitel ist vorläufig; eigene Figuren, Lore und Assets, keine übernommene Franchise-IP.

## Source of Truth

0. [Master Prompt](docs/MASTER_PROMPT.md): Gesamtvision, akzeptierte Entscheidungen und Leitplanken.
1. [Game Design](docs/GAME_DESIGN.md): Spielregeln, Inhalte und offene Balancing-Entscheidungen.
2. [Product Requirements](docs/PRODUCT_REQUIREMENTS.md): Umfang, Meilensteine und Abnahmekriterien.
3. [Architektur](docs/ARCHITECTURE.md): Schichten, Datenfluss und spätere Backend-Anbindung.
4. [Domain Model](docs/DOMAIN_MODEL.md): Begriffe, Beziehungen und Invarianten.
5. [Lernpfad](docs/LEARNING_PATH.md): Code lesen und den nächsten Slice umsetzen.
6. [App Store & Reichweite](docs/APP_STORE_READINESS.md): ASO, SEO und Release-Anforderungen.
7. [Validierung](docs/VALIDATION.md): Tests, Browser-Prüfung und bekannte Grenzen.
8. [Art Direction](docs/ART_DIRECTION.md): illustrierte Figuren, modulare Teile, Aura-Richtung und Produktionsvertrag.

Der Master Prompt bündelt Vision und Leitplanken; GDD, PRD, Architektur und Domain Model
konkretisieren Regeln, Umfang und Abnahme. Neue ausdrückliche Nutzerentscheidungen haben Vorrang;
betroffene Dokumente werden anschließend miteinander abgeglichen. Ältere Brainstormings dienen
als Kontext. Änderungen an Regeln werden zusammen mit Code und Tests angepasst. Das Projekt liegt unter `~/dev/everbloom`.
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
Character Creator: http://localhost:4200/character/create
Onboarding: http://localhost:4200/onboarding

```sh
npm test -- --watch=false
npm run build
```

XP, Quests, Boss und Aktivitätsverlauf verwenden Mock-Daten im Arbeitsspeicher. Neuladen und
„Demo zurücksetzen“ starten denselben Beispieltagesstand. Name und Aussehen werden separat
lokal im Browser als Profilversion 2 gespeichert und bleiben beim Demo-Reset erhalten. Gültige
ältere Profile werden aus Version 1 migriert; die Darstellungswahl verändert keine Spielwerte.
Interessen und Fokus-Skills werden getrennt als Journey-Version 1 lokal gespeichert. Auch der
freiwillige Tages-Check-in sowie Einstellungen für Ton, Feuerwerk und Bewegung bleiben lokal. Bei blockiertem Speicher bleibt
die Funktion für die laufende Sitzung nutzbar. Keine Anmeldung, Abrechnung oder Serverpersistenz.
Angular 21 passt zur vorhandenen Node-20-Umgebung; Versionen werden im Lockfile festgehalten.
Kompatibilitätsquelle: https://angular.dev/reference/versions

## Handy und Tablet

Die App wird zuerst für Smartphones im Hochformat und Tablets im Hoch-/Querformat gestaltet.
Mobile Bottom-Navigation, erreichbare Creator-Speicherleiste und Tablet-Layouts sind umgesetzt.
Touchflächen, Schriftvergrößerung, Safe Areas, Tastatur, Bewegungseinstellungen sowie Fehler- und
Resume-Zustände gehören zur Abnahme. Native Haptik, Lifecycle und Billing folgen später mit
Gerätetests; der Browser-Prototyp ist noch keine fertige mobile Store-App.

## Stand

M0 und der Dashboard-Slice sind vorhanden. Der Creator verwendet zwölf illustrierte Startdesigns,
je sechs männliche/weibliche, mit unabhängig wählbarer Frisur und vollständigem Outfitset. Haut-,
Augen- und Haarfarben bieten jeweils Original plus sechs Farben. Die vier ursprünglichen PNG-Looks
bleiben ohne Anpassung exakt erhalten; Modul-/Farbwechsel nutzen neu erstellte Bildvarianten.
Der frühere Vektor-Editor ist aus der UI entfernt. Outfitsets enthalten derzeit ihre Waffen und
Accessoires fest; einzelne Ausrüstungsslots und Inventar folgen später.

Ruhige Ganzkörperatmung ist abschaltbar und respektiert reduzierte Bewegung. Erfolgsmomente zeigen
ein kleines Feuerwerk mit eigenem Jingle. Drei Starter-Auren plus „Keine“ sind wählbar; zehn weitere
Auraentwürfe lassen sich nur im Creator ausprobieren und werden nicht gespeichert oder freigeschaltet.

Das dreistufige Onboarding enthält sieben Interessenbereiche, 1–6 Fokus-Skills aus 14 und eine
Zusammenfassung. Die ursprünglichen vier Skill-Balancewerte bleiben unverändert; zehn Ergänzungen
starten mit 0 Skill-XP. Freiwilliger Tages-Check-in und lokaler Tageswechsel sind umgesetzt. Aktuelle
Prüfungen und Grenzen stehen in [VALIDATION.md](docs/VALIDATION.md).

Das Projekt bleibt ein Web-Prototyp. Echte Spielperioden, dauerhafter Verlauf, vollständige Recovery-/
Streak-Regeln, API, Authentifizierung und PostgreSQL-Fortschrittspersistenz fehlen weiterhin im M1b-
Umfang. Mobile Assetqualität und native Store-Abnahme sind eigene Arbeitsschritte. Membership ist
mit **3,99 € pro Monat** geplant; Käufe und Membership-Boni sind noch nicht implementiert.

Die spätere Oberfläche ist für Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch,
Chinesisch, Japanisch, Russisch und Koreanisch vorgesehen. Die Demo ist derzeit deutsch;
Übersetzungen folgen in der Endphase/M4. Varianten für Schweizerisch (`de-CH`/`gsw`),
Portugiesisch (Portugal/Brasilien) und Chinesisch (vereinfacht/traditionell) sind noch offen.
Sprachpakete, Store und Support werden gemeinsam geplant; Sprachnamen statt Länderflaggen.
