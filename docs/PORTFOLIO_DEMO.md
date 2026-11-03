# Herovera · vollständige lokale Frontend-Fassung

Die statische Portfolio-Auslieferung verwendet die vorhandenen Oberflächen und Spielregeln der
**geschlossenen Beta**, mit einem isolierten lokalen Adapter. Es ist kein gekürztes Bildschirmmodell:
Dashboard, Aktivitäten, Skills, Tagesquests, Charaktergestaltung, Interessen, Bosskampagne, Sammlung,
Einstellungen und Plus-Vorschauseite sind bedienbar. Die normale Account-Anwendung, Datenbanken,
Backend-Konfiguration und nativen Projekte bleiben getrennt.

## Start und Ausgabe

Im Verzeichnis `frontend`, mit Node.js 24 LTS und installierten Abhängigkeiten:

```sh
npm ci
npm run demo:start
```

Öffnen: **http://127.0.0.1:4392/demos/herovera/**

```sh
npm run demo:build
npm run demo:serve
```

`HEROVERA_DEMO_PORT=4393 npm run demo:serve` wählt einen anderen Loopback-Port.
Kein Spring-Boot-Prozess und keine Datenbank werden gestartet.

Ausgabe: **`frontend/dist/portfolio-demo/browser/`**, unter **`/demos/herovera/`** ausliefern.
Hash-Routen wie `#/dashboard`, `#/battle` und `#/membership` benötigen keine zusätzliche SPA-Regel.
Der Build passt bestehende absolute Artwork-URLs und statische Abschnittslinks ausschließlich im
separaten Demo-Artefakt an. Die Originaldefinitionen bleiben unverändert.

Auslieferbare Allowlist: `index.html`, `*.js`, `*.css`, `art/**`, `favicon.ico`, gegebenenfalls
`3rdpartylicenses.txt` und `demo-manifest.json`. Kein `runtime-config.json`, keine Quell-Rigs,
Datenbanken oder Zugangsdaten gehören ins Paket. Das vollständige Artwork wird bei Bedarf geladen.
Der Portfolio-Link erwartet das Portfolio auf derselben Origin unter `/`.

## Vorhandene Funktionen

- Vollständiges Dashboard mit allen 14 Skills, XP, sechs Attributen, Momentum, Aktivitätsverlauf,
  Tagesvorschlägen und Wochenboss-Schaden.
- Aktivitätsformular mit Minutenprüfung, Tageslimits und idempotenten Eintrags-IDs. Die vorhandene
  `recordActivity`-Transaktion wird unmittelbar verwendet.
- Bis zu drei persönliche Fokusquests. Ihre Ziele, UTC-Epoch-Day-Rotation und levelabhängigen,
  auf fünf XP gerundeten Boni entsprechen der bestehenden Backend-Klasse `DailyQuestPlan`.
  Fokusänderungen dürfen den Plan vor der ersten Aktivität ersetzen; danach gilt er bis morgen.
- Charaktereditor mit den bestehenden Looks, Modulen, Farben, Auren und Boss-Sammlungen.
- Vorhandene PixiJS-Kämpfe: drei Taktiken, vier Schwierigkeitsgrade, Pause, Tempo und Ergebnis.
  Der explizite lokale Adapter nutzt `createBossBattle`, das bestehende Server-Paritätsmodell,
  und die vorhandenen Loot-Definitionen. Erst-Siege entdecken den nächsten Boss und schalten
  Cosmetics im Tab frei. Wiederholungen geben keine doppelte Beute; Kämpfe geben keine XP.
  Die normale Account-Anwendung berechnet weiterhin keine autoritativen Client-Siege.
- Check-in, Erholung, Ton-/Effekt-/Bewegungseinstellungen und der Fortschritts-Horizont.
- Die vollständige vorhandene Membership-Seite im bereits vorgesehenen `preview`-Zustand.
  Alle erreichten Bossmodi sind lokal zugänglich; kein Store-Aufruf, Kauf oder XP-Kaufbonus.
  Die bestehenden statischen Seiten für Nutzungsbedingungen, Dateninformation und Hilfe sind
  über ihre originalen Membership-Links ebenfalls erreichbar; ihre Beta-Hinweise bleiben erhalten.

## Beispielstände und Reset

Die kleine Modusleiste bietet explizit vorbereitete Stände:

| Beispiel | Inhalt |
| --- | --- |
| Alltag · Level 12 | Erster Kampagnenboss und fortgeschrittener Alltagscharakter |
| Kampagne · Level 50 | Vier vorbereitete Normal-Siege, Wolkenkönig als nächste Begegnung |
| Späte Reise · Level 130 | Neun vorbereitete Normal-Siege, alle zehn Bosse und Modi erreichbar |

Diese früheren Siege sind Beispiele, keine vom Besucher oder in einem Konto verdienten Ergebnisse.
Von jedem Stand aus laufen echte lokale Transaktionen weiter. Im Level-12-Beispiel am
3. November 2026 geben die ersten 20 Minuten Calisthenics **80 Aktivitäts-XP + 70 Quest-XP = 150 XP**
und **160 Wochenboss-Schaden**. Andere Tage/Fokuspläne können andere verfügbare Quests haben.

„Neu starten“ lädt den gewählten Beispielstand vollständig neu: Look, Interessen, Einstellungen,
Aktivitäten und lokale Kampfbelohnungen werden wieder durch das Beispiel ersetzt. Der vorhandene
Fortschritts-Reset in den Spieleinstellungen behält den aktuellen Look und Fokus wie bisher.
Neuladen speichert nichts dauerhaft; sämtliche Zustände leben nur im Arbeitsspeicher des Tabs.

## Grenzen zur realen Anwendung

`ACCOUNT_MODE=false`, `BROWSER_STORAGE=null`. Nur der eigene Adapter hat die expliziten Fähigkeiten
für lokale Bossentscheidungen und Fokusquests. Die Account- und HTTP-Adapter behalten ihre bisherigen
Sicherheits- und Persistenzregeln. Der lokale Spielstand wird nie in ein Konto importiert.

Anmeldung, E-Mail-Verifikation, Passwort-Wiederherstellung, echte Käufe, Cloud-Synchronisierung,
Account-Export und Account-Löschung erfordern die separate echte Backend-/Store-Verbindung.
Sie werden hier nicht als funktionierende Onlinevorgänge vorgetäuscht. Account-Routen führen zur
Information über diese lokale Fassung; die normale Anwendung und deren Routen bleiben unverändert.

## Verifikation

```sh
npm run test:ci -- --include='src/app/portfolio-demo/*.spec.ts'
npm run test:ci
npm run demo:build
npm run build
```

Die zusätzlichen Tests prüfen feste XP-/Quest-/Boss-Outcomes, Tageslimits, Request-Idempotenz,
Kampagnenentdeckung, Erst-Sieg-Beute, den echten Ultimate-Endkampf, vorbereitete Stände,
Fokus-/Tageswechsel und eingefrorene Questpläne. Ein Test ersetzt `HttpClient` durch eine werfende
Factory: Dashboard, Aktivität, Creator, Onboarding und Plus-Vorschau benötigen keinen Backend-Transport.

Der bestehende PixiJS-Hinweis zu `@xmldom/xmldom` betrifft eine Drittmodul-Optimierung und wird nicht
unterdrückt. Statische HTTP-/Unitprüfungen sind getrennt von grafischer Browser-, Request- und
Kampfwiedergabe-Abnahme auf dem tatsächlichen Portfolio-Host zu bewerten.

Automatisierte Nachweise vom 3. November 2026:

- Letzter vollständiger Frontendlauf: **1.071 Tests in 78 Dateien erfolgreich**.
- Nach den abschließenden Auswahl- und Informationsseiten-Korrekturen: **29 gezielte Tests
  in vier Dateien erfolgreich**, einschließlich echter Linknavigation und korrekter Auswahl
  aller drei Beispielstände im gerenderten App-Shell.
- Regulärer Produktionsbuild und separater statischer Build erfolgreich. Der vorhandene
  PixiJS-/CommonJS-Hinweis bleibt sichtbar.
