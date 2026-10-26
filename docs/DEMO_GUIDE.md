# Spielbare lokale Demo

## Abgeschlossener Umfang

Der Einstieg `/demo` führt durch einen vollständigen Rundgang:

1. **Figur:** Name und Look im vorhandenen Character Creator speichern. Zwölf Vorlagen,
   gemalte Haar-/Outfitmodule und Farb-/Auraauswahl bleiben verfügbar.
2. **Richtung:** Interessen und Fokus-Skills im Onboarding wählen.
3. **Aktivität verstehen:** Ein explizit isoliertes Calisthenics-Beispiel ausprobieren.
   20 Minuten ergeben 80 Aktivitäts-/Skill-XP, 50 einmalige Quest-XP und 160 Wochenboss-Schaden.
   Der vorbereitete Beispielstand beginnt mit 1.100 Charakter-XP und erreicht Level 2 mit
   30/1.400 XP. Er dient nur zur Erklärung, verändert weder Journal noch echten Democharakter.
4. **Abenteuer:** Automatischen Probekampf bis zum Ergebnis ansehen. Auch „Zum Ergebnis“
   zählt als angesehen; es gibt keine Kampfbelohnung. Danach führt ein sichtbarer Link zum
   Rundgang beziehungsweise seiner Abschlusskarte.

Die vier Schritte dürfen frei besucht werden. Zwei werden aus Profil und Interessen abgeleitet;
XP-Beispiel und angesehenes Kampfergebnis werden separat unter `everbloom.demo-tour.v1` gemerkt.
Ein bereits vorhandener Aktivitätseintrag erfüllt den Aktivitätsschritt ebenfalls. Diese Flags
verleihen keinerlei XP, Items, Membership-Rechte oder Accountzugriff. Bei blockiertem Speicher
bleiben sie nur in der Sitzung. Nach dem Abschluss kann die lokale Demo frei weitergespielt werden.

Dashboard und Footer führen jederzeit zurück zum Rundgang. „Spielstand zurücksetzen“ setzt nach
der bestehenden Bestätigung auch die beiden Rundgang-Flags zurück; Name/Look/Interessen bleiben.

## Was regulär spielbar ist

- Dashboard mit Level, langsamem XP-Wachstum, sechs Attributen und 14 Skills.
- Aktivitäten mit Tageslimits, einmaligen Quest-Boni, Wochenboss-Schaden und Momentum.
- Gerätelokales Journal, Wiederherstellung, Tages-/Wochenwechsel und Aura-Freischaltungen.
- Freiwilliger Tages-Check-in, Erholung ohne Fortschrittsverlust und anpassbare Erfolgseffekte.
- Charaktergestaltung mit gemeinsamen SVG-/Pixi-Layern; Atmung/Auren pausieren außerhalb der
  Sichtfläche und bei verdeckter Seite. Reduzierte Bewegung wird berücksichtigt.
- Automatischer Probekampf mit drei Taktiken, Pause, 2×-Tempo und Ergebnisanzeige.
- Membership-Vorschau: geplant 3,99 €/Monat, derzeit nicht buchbar.

## Bewusst außerhalb dieser Demo

Die spätere Produktfassung verlangt ein Konto vor der eigenen Charaktererstellung. `/auth`
erklärt das; es ist kein halb funktionsfähiges Registrierungsformular im Spielweg mehr.
Der vorbereitete Auth-Slice bleibt als Entwicklerwerkzeug unter `/dev/auth`, mit separat
anzubindendem Spring-Backend. Ein Testlogin übernimmt keine lokalen Daten.

Accountgebundener Server-Spielstand, vollständige Ausrüstungs-/Lootökonomie, weitere Bossmodelle
und Kapitel, bezahlte Membership, Übersetzungen sowie Capacitor-/Store-Veröffentlichung bleiben
Produktmeilensteine. Dieser Rundgang ist eine abgeschlossene lokale Demo, kein fertiger Store-Release.

## Technische Grenze

`DemoTourStore` speichert nur Rundgangstatus. Das Beispiel verwendet dieselbe reine
`recordActivity`-Transaktion wie das Spiel, aber mit einem eigenen Snapshot ohne Repository.
`BattlePlayback` bleibt ohne Zugriff auf schreibende Game-APIs. Eine einzelne UI-Präferenz ist
kein Grund, Spielfortschritt oder Accountdaten miteinander zu vermischen.

Große Journale werden über `replayProgress` mit einem Tagesindex wiederhergestellt. Die normalen
Transaktionsregeln bleiben unverändert; vollständige Originaleinträge werden einmal am Ende
eingesetzt. Vergleichstests sichern Reihenfolge, Limits, Quest-/Aura-Besitz und Kalenderwechsel.

## Reproduzierbare Abnahme

Im Verzeichnis `frontend`: `npm ci`, `npm run test:ci`, `npm run build`, `npm start`.
Für manuelle Tests mit frischem Spielstand einen anderen lokalen Port verwenden, damit
gespeicherte Nutzerstände nicht verändert werden. Keine Kennzahlen oder Testaktivitäten in den
Nutzerspielstand schreiben. Prüfprotokoll und Screenshots: [VALIDATION.md](VALIDATION.md).
