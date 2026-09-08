# Product Requirements · V0.2

## Nutzerproblem

Persönlicher Fortschritt in Training, Lernen und Erholung ist schwer als zusammenhängende Entwicklung
zu sehen. Die App macht reale Tätigkeiten als dauerhaftes RPG-Profil sichtbar. Sie dient zugleich
als Full-Stack-Lernprojekt: kleine vertikale Slices, lesbare Dateien, klare Regeln, wenige Abhängigkeiten.

## M0 – Foundation (dieser Auftrag)

- [x] Source of Truth: GDD, PRD, Architektur, Domain Model und Lernpfad.
- [x] Angular SPA mit TypeScript strict, Standalone Components, Signals, Router und SCSS.
- [x] Domainregeln ohne Angular, austauschbarer Datenadapter, Signal-State, schlanke View.
- [x] Mobile-first Dashboard und Design-Tokens, einfache Tastaturbedienung.
- [x] Produktionsbuild und relevante automatisierte Tests.

## M1a – Erster vertikaler Slice (dieser Auftrag)

- [x] Charakter mit Chibi-Platzhalter, Name/Titel, Level und XP bis zum nächsten Level.
- [x] Momentum, Mock-Wochenrhythmus, sechs Stats, Daily Quests, vier aktive Skills, Weekly Boss.
- [x] Aktivität auswählen und Minuten eintragen; synchroner sichtbarer Fortschritt aller Systeme.
- [x] Eingabevalidierung, abgeschlossene Quest, Levelwechsel, Boss-Sieg, Statusmeldung, Demo-Reset.
- [x] Arbeitsspeicher-Mock mit sichtbarem Hinweis auf Reset beim Neuladen.

## M1b – Spielbares Solo-MVP (Folgeauftrag)

- [ ] Onboarding mit Name, einfacher modularer Chibi-Auswahl und aktiven Skills.
- [ ] Früher Capacitor-Gerätetest des Kernflows, bevor die Zahl der Screens stark wächst.
- [ ] Account-Löschmodell mit öffentlichem Webweg planen; Texte für spätere Lokalisierung vorbereiten.
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
7. Reset lädt denselben Ausgangsstand. Reload verwirft Demo-Einträge; Oberfläche sagt dies deutlich.
8. Tests prüfen fachliche Grenzfälle und die Verbindung von Formular, Store und Dashboard.
9. Balance V0.2: Eine vollständig belohnte Calisthenics-Aktivität von 60 / 90 Minuten gibt
   240 / 360 Skill-XP und bei Abschluss der Tagesquest 290 / 410 Charakter-XP. Das entspricht
   auf Charakter-Level 12 etwa 8,5 % / 12,1 % und auf Skill-Level 9 etwa 10,9 % / 16,4 % einer
   vollständigen Levelspanne. Fast volle Balken dürfen weiterhin aufsteigen. Das Tageslimit von
   90 Minuten gilt auch bei mehreren Einträgen. Demo-Level und sichtbare Attribute bleiben beim
   neuen Ausgangsstand erhalten. Die vorläufigen Kurven und weitere Levelbeispiele stehen im
   [Game Design](GAME_DESIGN.md#progression--regeln-der-demo).

## Weitere Meilensteine

| Meilenstein | Ergebnis |
|---|---|
| M2 | Produktive Chibi-Assets, Equipment, Loot, Achievements, Titles, umfangreichere Bosse |
| M3 | Free/Member-Entitlements, moderater Bonus, Store-Billing, Restore und serverseitige Kaufprüfung |
| M4 | Capacitor, iOS/Android, sichere Sessions, Store-Builds, lokalisierte Listings/Medien und Privacy-Angaben |
| M5 | Geräte-/Beta-Abnahme, Datenschutz, Account-Löschung, Performance, Store-Freigabe, SEO-Website und ASO-Messung |
| Danach | Classes/Archetypes, Parties, Guilds und Raids |

## Qualitätsanforderungen und Grenzen

Keine Microservices, NgRx, generischen Repository-Hierarchien oder UI-Komponentenbibliothek ohne
konkreten Bedarf. SCSS mit Tokens, semantisches HTML, beschriftete Felder und Fortschrittsanzeigen,
Statusmeldungen per Live-Region, reduzierte Animation bei entsprechender Systemeinstellung.
Keine externe Tracking-/Font-Abhängigkeit. Keine öffentliche Veröffentlichung für diesen lokalen
Projektstart. Vor produktiven Daten: Datenschutz, Zugriffsschutz und Löschkonzept konkret umsetzen.

## Store-Reife und Reichweite als Produktanforderung

ASO, öffentliche Web-SEO, mobile Qualität und Store-Vorgaben werden während der Entwicklung
berücksichtigt. Vor Veröffentlichung müssen die offenen Gates in
[APP_STORE_READINESS.md](APP_STORE_READINESS.md) abgearbeitet sein. Ein erfolgreicher Web-Build
ist noch keine native Abnahme. Store-Texte dürfen nur tatsächlich verfügbare Funktionen versprechen.
