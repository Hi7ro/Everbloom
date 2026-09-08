# Product Requirements · V0.3

## Nutzerproblem

Persönlicher Fortschritt in Training, Lernen und Erholung ist schwer als zusammenhängende Entwicklung
zu sehen. Die App macht reale Tätigkeiten als dauerhaftes RPG-Profil sichtbar. Sie dient zugleich
als Full-Stack-Lernprojekt: kleine vertikale Slices, lesbare Dateien, klare Regeln, wenige Abhängigkeiten.

Der Charakter ist das **digitale Selbst**: die eigene kleine Chibi-Version, um die man sich durch
reale Entwicklung in allen Lebenslagen kümmert. Der Care Loop lautet: Wahrnehmen → kleine reale
Handlung → Chibi-Reaktion → Fortschritt und ruhiger Ausblick. Bewegung, Wissen, Kreativität,
Beruf, Alltag, soziale Beziehungen und Erholung bleiben gleichwertige Ausdrucksmöglichkeiten.
Keine Hungerstrafen, kein Tod bei Abwesenheit, kein XP-Verlust und keine Schuld bei Pausen.
Stimmung/Haltung/Gesten sollen später freiwillige Interessen, Tagesmodus und Aktivitäten aufgreifen;
keine automatische Gesundheitsdiagnose. Ein umfassendes Bedürfnisse-/Mood-System ist noch offen.

## M0 – Foundation

- [x] Source of Truth: GDD, PRD, Architektur, Domain Model und Lernpfad.
- [x] Angular SPA mit TypeScript strict, Standalone Components, Signals, Router und SCSS.
- [x] Domainregeln ohne Angular, austauschbarer Datenadapter, Signal-State, schlanke View.
- [x] Mobile-first Dashboard und Design-Tokens, einfache Tastaturbedienung.
- [x] Produktionsbuild und relevante automatisierte Tests.

## M1a – Erster vertikaler Slice

- [x] Charakter mit Chibi-Platzhalter, Name/Titel, Level und XP bis zum nächsten Level.
- [x] Momentum, Mock-Wochenrhythmus, sechs Stats, Daily Quests, vier aktive Skills, Weekly Boss.
- [x] Aktivität auswählen und Minuten eintragen; synchroner sichtbarer Fortschritt aller Systeme.
- [x] Eingabevalidierung, abgeschlossene Quest, Levelwechsel, Boss-Sieg, Statusmeldung, Demo-Reset.
- [x] Arbeitsspeicher-Mock mit sichtbarem Hinweis auf Reset beim Neuladen.

## M1a-Ausbau – Creator v2 und Erfolgsmomente

Implementierungsumfang des aktuellen Ausbaus; abgeschlossene Prüfungen stehen in
[VALIDATION.md](VALIDATION.md):

- Exakt bestätigter Original-Look in Dashboard/Creator, unveränderte PNG plus separate Maske,
  Aura und abschaltbares Gesamt-Idle. Feste Haare/Farben/Rüstung sind im UI erklärt. Optionales
  `artwork` wird validiert und gespeichert; eine weibliche Originalillustration folgt noch.
- „Selbst gestalten“ unter `/character/create`: Name, männliche/weibliche Darstellung, Körper, Haare, Outfit, Aura und
  drei Farben; sofortige modulare Vorschau. Beide Darstellungen sind an Gesicht, Körpersilhouette
  und Outfitdetails klar unterscheidbar, unsexualisiert und rein visuell.
- Je sechs eigene Starterfrisuren für `male` und `female`; gültige Zuordnung zur Darstellung wird
  an der Domain-/Adapter-Grenze geprüft. Die vollständigen IDs stehen im Domain Model.
- Validiertes lokales Charakterprofil mit Schemaversion 2 und expliziter Version-1-Migration;
  technischer Default `male`, keine demografische Ableitung. Nur Name/Aussehen werden gespeichert.
  XP, Skills, Quests, Boss und Verlauf bleiben im Arbeitsspeicher. Demo-Reset erhält das Profil.
- Vier Starter-Auren bleiben frei verfügbar. Nordlicht (Level 20), Sternenkranz (Level 40) und
  Moosseele (Mooswächter-Bossdrop) werden als spätere Ziele gezeigt. Keine aktuelle Freischaltung,
  Besitzpersistenz, Dropchance oder Loot-Vergabe.
- Gebündelte Erfolgskarte, kleines Feuerwerk und eigener Vier-Ton-Jingle bei Charakter-/Skill-
  Levelaufstieg, erstem belohntem Tageseintrag, allen abgeschlossenen Daily Quests und Boss-Sieg.
- Separate gespeicherte Schalter für Ton, Feuerwerk und Charakterbewegung; reduzierte Bewegung.
- Frei gestaltbarer Chibi mit 2.5D-Tiefenwirkung, subtiler Atmung/Idle und interessenbezogenen
  Gesten. Vorläufige visuelle Levelbereiche 1–9, 10–24, 25+. Dashboard nutzt letzten belohnten
  Skill; Creator bietet rein visuelle Vorschau. Kein gespeichertes Interessenprofil.

Keine Fortschrittspersistenz, neue XP-Kurve, fertige Produktionsassets oder native Store-Abnahme.
Die Dokumentation beschreibt den Ausbau V0.3; **Balance V0.2 bleibt unverändert**.

## Aktueller Mobile-Ausbau

Umgesetzt: mobile App-Shell, gut erreichbare Creator-Fußleiste und Tablet-Layouts. Die verbindlichen
Qualitätsziele stehen unten; abgeschlossene Browser-/Geräteprüfungen stehen ausschließlich in
VALIDATION. Diese Arbeit macht das Spiel noch nicht zu einer abgenommenen nativen App.

## M1b – Spielbares Solo-MVP

- [x] Freiwilliger Check-in: Ausgewogen, Fokus, Erholung oder Ruhetag; drei Energieangaben,
      freundliche Reaktionszeile und lokaler Tageswechsel. Auslassen bleibt ohne Strafe. Speicherung
      getrennt vom GameSnapshot, keine XP-/Quest-/Boss-/Momentum-Änderung. Kein umfassender
      Bedürfnisse-Simulator; Recovery-/Streak-Regeln sind dadurch noch nicht umgesetzt.
- [ ] Vollständiges Onboarding auf Basis des einfachen Creators, aktive Skills und gespeicherte
      Interessen; weitere Gesicht-/Augenoptionen und spätere Asset-Slots nach Umfang M1b/M2.
- [ ] Früher Capacitor-Gerätetest des Kernflows, bevor die Zahl der Screens stark wächst.
- [ ] Account-Löschmodell mit öffentlichem Webweg planen; Texte für die neun späteren Zielsprachen
      auslagerbar halten und ein zentrales Locale-Modell vorbereiten.
- [ ] Vollständiger konfigurierbarer Skillkatalog und minimale Subskills.
- [ ] Daily/Weekly-Perioden, echte lokale Zeitzone und nachvollziehbarer Aktivitätsverlauf.
- [ ] Recovery/Rest/Cheat Days und frequenzabhängige Streaks.
- [ ] Spring Boot REST, PostgreSQL/Flyway, Account und Authentifizierung.
- [ ] Serverautoritative XP, Idempotenz, persistenter Quest- und Bossfortschritt.
- [ ] Lade-/Fehler-/Leerezustände für echte API-Anbindung und Integrationstests.

Das MVP ist **M1a + M1b**. Ein lokales Mock-Dashboard ist noch kein fertiges Full-Stack-MVP.
Backend/DB werden jetzt strukturell vorbereitet, nicht als Scheinfunktion implementiert.

## Abnahme des ersten Slice

1. `/` leitet nach `/dashboard`; unbekannte Pfade führen ebenfalls dorthin.
2. Bei 360 px Breite passen Karten und Formular ohne horizontales Scrollen; größere Ansichten
   nutzen mehrere Spalten. Texte und native Controls bleiben lesbar und fokussierbar.
3. Ein Eintrag von 10 Minuten Meditation gibt 30 Skill-/Charakter-XP, 60 Boss-Schaden und erfüllt
   das entsprechende Tagesziel mit einmalig 30 zusätzlichen Charakter-XP.
4. Derselbe Request kann nicht doppelt belohnt werden; weitere Einträge können keinen Questbonus wiederholen.
5. Ungültige Dauer, unbekannter Skill und bereits ausgeschöpftes Tageslimit erzeugen keine falschen XP.
6. Mehrere Level-Ups und ein besiegter Boss werden korrekt dargestellt; Balken bleiben zwischen 0 und 100 %.
7. Reset lädt denselben Fortschritts-Ausgangsstand und erhält das Charakterprofil. Reload verwirft
   Demo-Einträge und lädt das lokal gespeicherte Profil; Oberfläche erklärt den Unterschied.
8. Tests prüfen fachliche Grenzfälle und die Verbindung von Formular, Store und Dashboard.
9. Balance V0.2: Eine vollständig belohnte Calisthenics-Aktivität von 60 / 90 Minuten gibt
   240 / 360 Skill-XP und bei Abschluss der Tagesquest 290 / 410 Charakter-XP. Das entspricht
   auf Charakter-Level 12 etwa 8,5 % / 12,1 % und auf Skill-Level 9 etwa 10,9 % / 16,4 % einer
   vollständigen Levelspanne. Fast volle Balken dürfen weiterhin aufsteigen. Das Tageslimit von
   90 Minuten gilt auch bei mehreren Einträgen. Demo-Level und sichtbare Attribute bleiben beim
   neuen Ausgangsstand erhalten. Die vorläufigen Kurven und weitere Levelbeispiele stehen im
   [Game Design](GAME_DESIGN.md#progression--regeln-der-demo).

## Abnahme des Creator-v2-/Erfolgsausbaus

1. Profiländerung aktualisiert die Figur im Dashboard ohne XP-, Quest-, Boss- oder Momentumänderung.
2. Name und alle Auswahlwerte werden an der Domain-/Datenadapter-Grenze geprüft; ungültige Werte
   beschädigen den Zustand nicht. Abbrechen speichert keine Vorschau.
3. Reload erhält ein gültiges gespeichertes Profil; kaputte/fremde Speicherdaten werden ignoriert.
   Blockierter Browser-Speicher verhindert die Nutzung für die laufende Sitzung nicht; fehlende
   Profilpersistenz wird sichtbar erklärt. Fortschritt bleibt ausdrücklich flüchtig.
4. Ein akzeptierter Übergang löst die zutreffenden Erfolge einmal gebündelt aus. Einzelne Daily
   Quests, doppelte Requests, Profiländerung, Reload und Reset erzeugen keine zusätzliche Feier.
5. Ton, Feuerwerk und Idle-Bewegung sind unabhängig steuerbar. Reduzierte Bewegung bleibt
   wirksam; Tonfehler verhindern keine XP-Vergabe. Vorschauen ändern keinerlei Spielwerte.
6. Dreiviertel-Silhouette, Highlights/Schatten, Outfit-/Haarvarianten und die drei visuellen
   Levelbereiche sind lesbar. Interessenbezogene Animation ist rein visuell und darf keine
   versteckten Skill-, Interessen- oder Fortschrittsdaten speichern.
7. Creator und Erfolgskarte sind bei 360 px Breite nutzbar; Fokus, beschriftete Controls und
   verständlicher Erfolgstext funktionieren ohne Ton/Animation. Browser und relevante Tests prüfen.
8. Männlich/weiblich sind in Creator und Dashboard sichtbar unterscheidbar. Je sechs Frisuren
   werden eigenständig gerendert; ein Wechsel der Darstellung hinterlässt keine ungültige Frisur.
   Jeder Style und jede Farbe bleiben zugänglich. Die Auswahl ändert keinerlei Spielwerte.
9. Gültige Version-1-Profile werden nachvollziehbar nach Version 2 migriert; Name, Farben und andere
   zulässige Auswahlwerte bleiben erhalten. `tousled` → `m-spiky`, `bob` → `m-curtains`, `braid` →
   `m-topknot`; `male` ist allein technischer Default. V2 akzeptiert keine unpassende Haarzuordnung.
10. Die drei geplanten Aura-Ziele können weder gespeichert noch ausgerüstet werden. Weder Level-
    Vorschau noch ein Demo-Boss-Sieg erzeugen Besitzrechte. Starter-Auren funktionieren weiterhin.

## Weitere Meilensteine

| Meilenstein | Ergebnis |
|---|---|
| M2 | Produktive Chibi-Assets und reichere Avatarreaktionen, geprüfte Aura-Freischaltungen/Bossdrops, Equipment, Loot, Achievements, Titles, umfangreichere Bosse |
| M3 | Free/Member-Entitlements, Preisziel 3,99 €/Monat, moderater Bonus, Store-Billing, Restore und serverseitige Kaufprüfung |
| M4 | Capacitor, iOS/Android, sichere Sessions, Store-Builds, neun UI-Zielsprachen sowie lokalisierte Listings/Medien und Privacy-Angaben |
| M5 | Geräte-/Beta-Abnahme, Datenschutz, Account-Löschung, Performance, Store-Freigabe, SEO-Website und ASO-Messung |
| Danach | Classes/Archetypes, Parties, Guilds und Raids |

## Qualitätsanforderungen und Grenzen

Keine Microservices, NgRx, generischen Repository-Hierarchien oder UI-Komponentenbibliothek ohne
konkreten Bedarf. SCSS mit Tokens, semantisches HTML, beschriftete Felder und Fortschrittsanzeigen,
Statusmeldungen per Live-Region, reduzierte Animation bei entsprechender Systemeinstellung.
Keine externe Tracking-/Font-Abhängigkeit. Keine öffentliche Veröffentlichung für diesen lokalen
Projektstart. Vor produktiven Daten: Datenschutz, Zugriffsschutz und Löschkonzept konkret umsetzen.

## Professionelle Bedienung auf Handy und Tablet

Diese Anforderungen gelten für alle neuen Screens, nicht nur für das Dashboard:

1. Smartphones bevorzugt im Hochformat, Tablets im Hoch- und Querformat gestalten; Phone-Querformat
   bleibt bedienbar. Karten passen sich dem Platz an, keine gestreckte Desktopseite. Als Web-
   Prüfraster mindestens 360/390 px Phone-Breite sowie 768 × 1024 und 1024 × 768 px Tablet.
2. Touchflächen mindestens 44 × 44 CSS-px, bevorzugt 48 × 48 CSS-px. Primäre Aktivität ist einhändig
   gut erreichbar. Creator-Speichern bleibt in einer gut erreichbaren Fußleiste; Navigation und
   Speichern verdecken einander oder den letzten Inhalt nicht.
3. Notch/Safe Areas, untere Navigation, Tastatur und scrollbare Formulare zusammen prüfen. Namen,
   Validierungsfehler und Save/Cancel bleiben bei offener Tastatur erreichbar. Fokus darf nicht
   hinter festen Elementen verschwinden.
4. Haupttexte als Projektziel 14–16 CSS-px, sekundäre Texte mindestens 12 CSS-px; sinnvolle Zeilenlänge,
   deutliche Hierarchie und große Systemschrift unterstützen. Mobile Formfelder mindestens 16 CSS-px.
   Information hängt nicht allein an Farben, Animation oder Audio.
5. Ton, Feuerwerk und Idle/Charakterbewegung unabhängig steuern und reduzierte Bewegung beachten.
   Chibi-Instanzen dürfen sich durch doppelte SVG-Gradienten-/Masken-IDs nicht beeinflussen.
6. Animation und Effekte auf mobilen Geräten sparsam einsetzen. Produktions-Budgets und echte
   Geräteperformance prüfen; flüssige Desktopdarstellung ist kein mobiler Performancebeleg.
7. Lade-, Fehler-, Leer-, Offline- und Resume-Situationen verständlich behandeln. Wiederholte
   Requests dürfen keine Doppelrewards erzeugen. Ein Memory-Mock simuliert keinen verlässlichen
   Offline-Sync; bis zu dessen eigener Umsetzung Offline-Grenzen ehrlich anzeigen.
8. Native Navigation, Lifecycle, optionale Haptik, Audio-Unterbrechungen und später Käufe/Restore
   auf iOS und Android mit echten Geräten prüfen. Haptik/Billing sind derzeit keine gelieferten
   Funktionen; Plattformadapter klein und konkret halten.

## Lokalisierung in der Endphase/M4

Zielsprachen: **Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch, Chinesisch, Japanisch,
Russisch und Koreanisch**. Aktuell werden keine Übersetzungen als fertig behauptet. Vor Beginn
müssen Schweizer Hochdeutsch (`de-CH`) oder Schweizerdeutsch (`gsw`), Portugiesisch Portugal oder
Brasilien sowie vereinfachtes oder traditionelles Chinesisch entschieden werden.

Die Abnahme umfasst sämtliche Screens, Status-/Fehler-/Leerezustände, Accessibility-Texte,
Support und Store-Auftritte; außerdem Datum, Zahlen, Pluralformen und deutschen Fallback.
Sprachwahl über Sprachnamen, ohne Länderflaggen. Übersetzungen werden im Zusammenhang und auf
kleinen Displays geprüft; nur Texte auslagerbar zu halten erfüllt diese Abnahme noch nicht.

## Store-Reife und Reichweite als Produktanforderung

ASO, öffentliche Web-SEO, mobile Qualität und Store-Vorgaben werden während der Entwicklung
berücksichtigt. Vor Veröffentlichung müssen die offenen Gates in
[APP_STORE_READINESS.md](APP_STORE_READINESS.md) abgearbeitet sein. Ein erfolgreicher Web-Build
ist noch keine native Abnahme. Store-Texte dürfen nur tatsächlich verfügbare Funktionen versprechen.
