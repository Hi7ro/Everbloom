# Validierung · erster Slice

Stand: 08.09.2026. Node 20.20.2, Angular CLI 21.2.23, TypeScript 5.9, Vitest.

- `npm run build`: erfolgreich, einschließlich strict TypeScript-/Template-Prüfung und Budgets.
- `npm test -- --watch=false`: 22 Tests in 4 Dateien erfolgreich, keine unbehandelten Fehler.
- Fachregeln: Levelgrenzen, mehrere Level-Ups, unveränderter Eingabezustand, atomare Meditation-
  Rewards, einmalige Quest-/Momentum-Boni, Idempotenz und kollidierende Request-IDs, Tageslimits,
  ungültige Minuten, unbekannte Skills, Boss-Phasen, HP-Untergrenze und Momentum-Obergrenze.
- State/Integration: abgeleitete Attribute, Reset, Fehler und Retry, konkurrierende Eingaben,
  tatsächlicher Angular-Formularfluss und Router-Weiterleitungen.
- Browser-Smoke-Test: 10 Minuten Meditation → +60 Charakter-XP inklusive +30 Quest-XP,
  Boss-HP von 1460 auf 1400; anschließender Demo-Reset auf 1460 erfolgreich.
- Abschnittsnavigation zu Skills erhält den eingetragenen Fortschritt.
- Responsive Ansichten bei angeforderten Viewports 360 × 800 und 1280 × 900 geprüft:
  Dokumentbreite entspricht jeweils der verfügbaren Inhaltsbreite, kein horizontaler Überlauf.
- Nativen Dialog zusätzlich im echten Browser bedient; jsdom ersetzt nur die fehlenden
  nativen Dialogmethoden im Komponententest.

Grenzen: kein Geräte-/Capacitor-Test, keine API-/Datenbankintegration, kein vollständiger
Barrierefreiheits-Audit. Zahlen, Zeitperioden, Wochenrhythmus und Charakter sind Demo-Inhalte.
