# Validierung · Creator v2, Original-Look und mobile Shell

Stand: 08.09.2026. Node 20.20.2, Angular CLI 21.2.23, TypeScript 5.9, Vitest.

- `npm run build`: erfolgreich, strict TypeScript-/Templates und Fehlerbudgets bestanden.
  Dashboard-CSS 17,37 kB: 16-kB-Warnbudget überschritten, unter dem unveränderten 20-kB-Fehlerbudget.
- `npm test -- --watch=false`: aktuell 145 Tests in 16 Dateien erfolgreich, keine unbehandelten Fehler.
  Die nachfolgenden 27-/80-Test-Abnahmen dokumentieren frühere Zwischenstände.
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

## Balance V0.2 und Projektumzug

- Projekt vollständig nach `~/dev/everbloom` verschoben; synchronisierte Referenzen verbleiben
  im ursprünglichen ChatGPT-Projektordner. Build und alle 27 Tests am neuen Ort erfolgreich.
- Neue Grenztests: 60/90-Minuten-Fortschrittsanteile, beide ersten Level unter 40 %, Aufteilung
  eines Trainings ohne zusätzliche Rewards, gemeinsames 90-Minuten-Limit und Level-Up mit Rest-XP.
- Bestehende Demo-Level und Attribute bleiben beim neuen Seed erhalten. Attribute wachsen
  je 1000 Skill-XP, statt je 100 XP.
- Browser: 90 Minuten Calisthenics → +410 Charakter-XP inklusive Questbonus; Charakter 12
  von 1726/3400 auf 2136/3400 XP, Skill 9 von 1613/2200 auf 1973/2200 XP. Kein Level-Up.
- ASO-/SEO- und Store-Gates dokumentiert. Native App-Abnahme bleibt offen; keine Store-Einreichung.

## Aktueller Ausbau · Character Creator, digitales Selbst und Feedback

- Produktionsbuild erfolgreich: Initial-Bundle rund 260 kB unkomprimiert; TypeScript-, Template- und CSS-Budgets bestanden.
- 80 Tests in 12 Dateien: zusätzlich Profilvalidierung, Speicherung nur von Name/Appearance,
  beschädigter/gesperrter Speicher, Cancel/Save/Retry, Vorschau ohne XP-Mutation, akzeptierte
  Meilensteine, Duplikate, Gruppenmeldung/Timer/Mute und Audio-Fallback.
- Avatar: Stufengrenzen 1–9 / 10–24 / 25+, Interessenauflösung, einzigartige SVG-Farbreferenzen,
  modulare Slots und Bewegungsschalter automatisiert geprüft. Ruhige CSS-Animationen und
  `prefers-reduced-motion`-Regeln im Code geprüft; kein vollständiger Motion-/Accessibility-Audit.
- Creator im Browser bei 360 × 800 und 1280 × 900 geprüft. Dokumentbreite entspricht jeweils
  der verfügbaren Inhaltsbreite (345 bzw. 1265 px mit Scrollbar); kein horizontaler Überlauf.
  Mobile Gestenvorschau als aufklappbarer Bereich mit voller Kartenbreite korrigiert.
- Browser: Abyssal + Blütenzauber + Bob kombiniert und gespeichert; nach Reload identischer
  Look, Charakter weiterhin Level 12 und 1726/3400 XP. Level-30-/Meditationsvorschau verändert
  den echten Level/Fokus nicht. Bewegungsschalter entfernt die Animationen aktivierende Klasse.
- Browser: Effekt-Vorschau zeigt Erfolgskarte/Partikel ohne XP; ausgeschaltetes Feuerwerk zeigt
  weiterhin den Text. Ton, Feuerwerk und Charakterbewegung sind unabhängig bedienbar.
- Browser: 10 Minuten Meditation → +60 Charakter-XP, Boss 1400 HP, „Dein erster Schritt heute!“,
  Durchatmen-Geste und passende kurze Chibi-Reaktion. 90 Minuten Calisthenics sowie 90 Minuten
  Programming vervollständigen alle Daily Quests → „Tagesziel erreicht!“. Weitere 60 Minuten
  Running besiegen den Boss → „Wochenboss besiegt!“, HP 0.
- Demo-Reset anschließend: keine Erfolgskarte, Boss 1460 HP, Charakter-XP 1726; gewählter Look
  bleibt erhalten. Levelaufstiege sind über Domain-/Meilensteintests geprüft; die langsamere
  Demo-Balance wurde nicht zugunsten eines Effekts verändert.
- Web-Audio-Erzeugung, Nutzerinteraktions-Freigabe, Abbruch und blockiertes Audio automatisiert
  geprüft. Kein subjektiver Hörtest und keine native iOS-/Android-Audioabnahme behauptet.
- Routenwechsel zum Creator öffnet die neue Seite oben; im Browser bestätigt. Zurücknavigation
  stellt die Scrollposition wieder her. Temporäre Browsergrößen nach der Prüfung zurückgesetzt.
- Kein umfassendes Mood-/Bedürfnissystem, keine dauerhafte Interessenwahl oder serverseitige
  Progression. Freiwilliger Check-in/Tagesmodus ist nächster M1b-Slice; tiefere Reaktionen folgen.

## Anime-Look · visuelle Überarbeitung

- Chibi-Gesicht mit mandelförmigen Augen, Iris-Highlights, schmalerer Kinnkontur und dezenten
  Gesichtslinien; alle drei Frisuren mit definierten Strähnen und Cel-Schatten überarbeitet.
- Körperzeichnung mit versetztem Stand, ausgearbeiteten Stiefeln und Unterarmschutz für
  Dark/Abyssal. Gespeicherte Appearance-Werte, Farben, Layer-Anker und Bewegungsregeln erhalten.
- Alle 80 bestehenden Tests und Produktionsbuild erfolgreich. Keine neue Abhängigkeit.
- Im Browser Bob/Abyssal, Strubbelig/Abyssal bei 360 px sowie Zopf/Cozy mit kompaktem Körper
  bei 1280 px visuell geprüft. Kein horizontaler Überlauf; Testauswahl nicht gespeichert.


## Aktuelle Abnahme · Original-Look, Creator v2 und Tages-Check-in

- 145 Tests in 16 Dateien erfolgreich. Produktionsbuild erfolgreich, Initial-JavaScript/CSS
  zusammen 272,19 kB (geschätzt übertragen 76,99 kB), zusätzliche lazy Feature-Chunks.
  Original-PNG und Maske kommen separat hinzu; Bildgröße ist nicht im Initial-JS-Budget enthalten.
- Dashboard-CSS durch Entfernen überholter Breakpoint-Regeln reduziert; aktuelle Größe 17,37 kB,
  Warnung 16 kB bleibt offen. Fehlergrenze 20 kB unverändert, keine künstliche Budgeterhöhung.
- Creator: zwölf zugeordnet validierte Frisuren, zwei Darstellungen, fünf neu gezeichnete
  Custom-Outfitsets, breite/maskulinere Custom-Geometrie und Legacy-Migration geprüft.
  Original-/Custom-Wechsel, feste Originaloptionen, Aura ohne Bildaustausch und alte Profile getestet.
- Das im Projekt verwendete Originalbild ist byteidentisch mit der freigegebenen Vorlage:
  SHA-256 f917f6af27e12af2706ba0412091160dae1355c7103d2f5206bb50157cc3cd61.
  Die separate Luminanzmaske erhält die Originalpixel und blendet den Schachbretthintergrund aus.
  Kein transparentes PNG oder vollständiges Animations-Rig behauptet.
- Im Browser freigestelltes Original in Dashboard und Creator visuell geprüft; mobile Creator-
  Vorschau 300 px hoch, Tablet-Vorschau neben Editor. Original verwendet ausschließlich ruhiges
  Gesamt-Idle, Custom behält seine Interessen-/Levelgesten.
- Creator-Ansichten bei angeforderten 360×800, 768×1024 und 1024×768 geprüft. Tatsächliche
  Inhaltsbreiten 345, 753, 1009 px wegen Scrollbar; Dokumentbreite jeweils gleich, kein horizontaler
  Überlauf. Original/Custom/Weiblich gewechselt: sechs eigene weibliche Frisuren sichtbar.
  Testentwürfe nicht gespeichert; vorhandenes Nutzerprofil bleibt erhalten.
- Dashboard bei 390×844 (375 px Inhalt) und 1024×768 (1009 px Inhalt) geprüft, kein horizontaler
  Überlauf. Der Custom-Avatarüberhang in die rechte Textspalte wurde begrenzt.
- Untere Navigation zu Quests setzt den richtigen aktiven Eintrag, springt zum Abschnitt und
  erhält Charakter-XP 1726. Aktivitätsdialog am Phone bedient und ohne Eintrag geschlossen;
  Eingabefelder und beide Aktionen passen in die verfügbare Dialogfläche.
- Freiwilliger Tages-Check-in: Domain-/Store-/Paneltests prüfen Tageswechsel, Resume, Auslassen,
  ungültige Daten, Speicherfehler und unveränderte Spielprogression. Dashboardintegration mit
  freundlicher Reaktionszeile/Custom-Ruhegeste ebenfalls geprüft. Im Browser Panel und Tablet-
  Spaltenlayout kontrolliert; keine echten Nutzerpräferenzen zu Testzwecken gespeichert.

Grenzen: lokale Browserabnahme, keine iOS-/Android-/Capacitor-Geräteabnahme, keine vollständige
Tastatur-/Screenreader-/Großschriftprüfung, keine Accounts oder Fortschrittspersistenz. Die
Originalillustration hat noch keine austauschbaren Haare/Kleidung oder weibliche Gegenvariante.
Aktivitätsperioden sind weiterhin Mock-Daten; nur der separate Check-in verwendet echte lokale Tage.
