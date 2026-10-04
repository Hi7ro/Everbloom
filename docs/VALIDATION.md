# Validierung · Prüfverlauf

Der neueste dokumentierte Integrationsstand steht im letzten Abschnitt **2026-09-08 · Illustrierter
Creator, Onboarding und Aura-Polish**. Frühere Abschnitte sind historische Momentaufnahmen:
Testzahlen, damals vorhandene Editor-Modi und damalige Grenzen bleiben als Ergebnisprotokoll erhalten,
beschreiben aber nicht automatisch die heutige Oberfläche. Insbesondere sind weibliche Illustrationen,
modulare Anpassung und gespeicherte Interessen inzwischen vorhanden.

## Historisch · Dashboard, Creator v2 und mobile Shell

Stand: 08.09.2026. Node 20.20.2, Angular CLI 21.2.23, TypeScript 5.9, Vitest.

- `npm run build`: erfolgreich, strict TypeScript-/Templates und Fehlerbudgets bestanden.
  Dashboard-CSS 17,37 kB: 16-kB-Warnbudget überschritten, unter dem unveränderten 20-kB-Fehlerbudget.
- `npm test -- --watch=false`: damals 145 Tests in 16 Dateien erfolgreich, keine unbehandelten Fehler.
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

## Historisch · Balance V0.2 und Projektumzug

- Projekt vollständig nach `~/dev/everbloom` verschoben; synchronisierte Referenzen verbleiben
  im ursprünglichen ChatGPT-Projektordner. Build und alle 27 Tests am neuen Ort erfolgreich.
- Neue Grenztests: 60/90-Minuten-Fortschrittsanteile, beide ersten Level unter 40 %, Aufteilung
  eines Trainings ohne zusätzliche Rewards, gemeinsames 90-Minuten-Limit und Level-Up mit Rest-XP.
- Bestehende Demo-Level und Attribute bleiben beim neuen Seed erhalten. Attribute wachsen
  je 1000 Skill-XP, statt je 100 XP.
- Browser: 90 Minuten Calisthenics → +410 Charakter-XP inklusive Questbonus; Charakter 12
  von 1726/3400 auf 2136/3400 XP, Skill 9 von 1613/2200 auf 1973/2200 XP. Kein Level-Up.
- ASO-/SEO- und Store-Gates dokumentiert. Native App-Abnahme bleibt offen; keine Store-Einreichung.

## Historisch · Character Creator, digitales Selbst und Feedback

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

## Historisch · Anime-Look und visuelle Überarbeitung

- Chibi-Gesicht mit mandelförmigen Augen, Iris-Highlights, schmalerer Kinnkontur und dezenten
  Gesichtslinien; alle drei Frisuren mit definierten Strähnen und Cel-Schatten überarbeitet.
- Körperzeichnung mit versetztem Stand, ausgearbeiteten Stiefeln und Unterarmschutz für
  Dark/Abyssal. Gespeicherte Appearance-Werte, Farben, Layer-Anker und Bewegungsregeln erhalten.
- Alle 80 bestehenden Tests und Produktionsbuild erfolgreich. Keine neue Abhängigkeit.
- Im Browser Bob/Abyssal, Strubbelig/Abyssal bei 360 px sowie Zopf/Cozy mit kompaktem Körper
  bei 1280 px visuell geprüft. Kein horizontaler Überlauf; Testauswahl nicht gespeichert.


## Historisch · Original-Look, Creator v2 und Tages-Check-in

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

Damals geltende Grenzen: lokale Browserabnahme, keine iOS-/Android-/Capacitor-Geräteabnahme, keine vollständige
Tastatur-/Screenreader-/Großschriftprüfung, keine Accounts oder Fortschrittspersistenz. Die
Originalillustration hat noch keine austauschbaren Haare/Kleidung oder weibliche Gegenvariante.
Aktivitätsperioden sind weiterhin Mock-Daten; nur der separate Check-in verwendet echte lokale Tage.


## 2026-09-08 · Illustrierter Creator, Onboarding und Aura-Polish

Historischer Prüfstand vor dem nachfolgenden Fortschritts-Slice. Die folgenden Test-/Build- und Browserergebnisse wurden im
Haupttask durchgeführt und hier zusammengeführt. Spätere rein visuelle Maskenkorrekturen ersetzen
keine neue Kombinations- oder Geräteabnahme.

### Automatisierte Prüfungen und Build

- Gesamtlauf: **261/261 Tests in 23 Dateien erfolgreich**. Anschließend nach der abschließenden
  Iris-/Guardian-Anpassung **38 gezielte Creator-/Portrait-/Aura-Tests erfolgreich**. Dies sind
  zwei aufeinanderfolgende Prüfstände, keine addierte Anzahl unterschiedlicher Tests.
- Produktionsbuild erfolgreich: Initial-JavaScript/CSS **284,93 kB**. Bekannte SCSS-Warnung:
  Dashboard **17,37 kB**, über 16-kB-Warnbudget, unter unverändertem 20-kB-Fehlerbudget. Keine
  künstliche Budgeterhöhung. Separat geladene PNGs/Masken sind nicht in dieser Initialgröße enthalten.
- Katalog, Profilnormalisierung und Speichergrenzen prüfen zwölf Startdesigns, sechs Frisuren/
  Outfitsets je Darstellung, optionale Module, bekannte Paletten sowie Legacy-`custom` → `original`.
  Profil-/Fokusänderungen vergeben keine XP und entfernen keinen bestehenden Skillfortschritt.
- 14 Skills sind im Seed enthalten; die ursprünglichen vier Raten/Startstände bleiben erhalten,
  zehn Ergänzungen starten mit 0 Skill-XP. Reward-Limits gelten über mehrere Einträge hinweg.
- Journey-Präferenzen validieren sieben Interessenbereiche, primäre Richtung und 1–6 aktive Skills.
  Separater V1-Speicher, gesperrter Speicher, Dreischritt-Ablauf und Creator-Rückweg sind abgedeckt;
  Journey-Speicherung verändert keine Spielprogression.
- **14 Rigs** sind strukturell vorhanden: zwölf Figuren und zwei Basisköpfe. Für **432 Kombinationen**
  aus Vorlage, passender Frisur und Outfitset wurden Layer-/Ankerverträge automatisiert geprüft
  (12 × 6 × 6). Das ist keine visuelle Abnahme aller 432 Kombinationen, Farbvarianten oder Posen.
- Irisfarbflächen verwenden zwei explizite Regionen am ausgewählten Gesicht; Augen bleiben von
  Haar-/Outfitwahl unabhängig. Die vier unveränderten Originalansichten umgehen Modultönungen.
- Aura-Tests prüfen eigene Gradienten-IDs pro Instanz, begrenzte 16 Partikel, keine Blurfilter/
  externen Bilder, sichere Farbeingaben und Trennung von speicherbaren Startern und Vorschauen.
  Guardian-Gesicht/Arme liegen außerhalb der verdeckten Avatarbereiche; der bedrohliche Blick
  bleibt Teil der Schattenaura und verändert nicht die echten Avataraugen.
- Thumbnail-Portraits im Creator werden per `@defer (on viewport)` bei Sichtbarkeit eingebunden
  und statisch gerendert. Bewegung-aus-Vertrag und CSS-`prefers-reduced-motion`-Regeln sind im
  Code/Komponententest geprüft. Keine Prüfung einer tatsächlichen Betriebssystem-Einstellung
  oder vollständige Motion-/Accessibility-Abnahme daraus ableiten.

### Browserprüfung auf Phone- und Tablet-Größe

- Angefordert **390 × 844 px**, verfügbare Inhaltsbreite **375 px**; außerdem **768 × 1024 px**,
  verfügbare Inhaltsbreite **753 px**. Dokumentbreite entsprach jeweils dem Inhalt: **kein
  horizontaler Überlauf** in den geprüften Ansichten.
- Alle zwölf illustrierten Startdesigns wurden im Browser angesehen. Ausgewählte gemischte
  Frisur-/Outfit-/Farbkombinationen, Originalansichten und mobile Creator-Bedienung wurden
  kontrolliert. Die vollständige visuelle Matrix ist noch offen.
- Kräftigere Aura-Farben, radiale Glowflächen, helle Kerne/Partikel und ruhige Bewegung wurden
  im Creator betrachtet. Für Guardian und den bedrohlichen Dämonenschatten wird oberhalb der
  Figur Platz reserviert; die Silhouette bleibt sichtbar. Keine neuen Franchise-Assets verwendet.
- Bildkomposition und Korrekturen an Maskenkanten sind visuell nachgearbeitet. Feine Säume,
  Überlappungen und einzelne Anschlussflächen können weiterhin Nacharbeit benötigen;
  **keine pixelperfekte Freistellung sämtlicher Kombinationen behauptet**.

### Originaltreue und verbleibende Grenzen

Die archivierte Vorlage und `frontend/public/art/characters/emerald-knight-original.png` sind
weiterhin byteidentisch. Erneut geprüfter SHA-256:
`f917f6af27e12af2706ba0412091160dae1355c7103d2f5206bb50157cc3cd61`.
Die PNG selbst wird nicht nachgezeichnet; eine separate Maske blendet den Hintergrund aus.
Angepasste modulare Varianten sind eigene Bildteile und keine pixelidentische Zerlegung des Originals.

Das Art-Verzeichnis enthält derzeit rund **42 MB Quellassets**. Deferred-Vorschaubilder und
begrenzte VFX sind erste Maßnahmen; sie belegen weder einen 42-MB-Download pro Screen noch eine
abgeschlossene Assetoptimierung. Download, dekodierter Texturspeicher, SVG-Filter-/Layerkosten,
Cachen und Partikelbudgets benötigen Messungen auf vorgesehenen Geräten.

Weiter offen: echte iOS-/Android-/Capacitor-Gerätetests, native Audio-/Lifecycle-Abnahme,
vollständige Tastatur-/Screenreader-/Großschriftprüfung, Store-Performance und finale Assetabnahme.
Ein Browser-Prototyp mit bestandenem Web-Build ist keine native Store-Fassung. Fortschritt bleibt
im Memory-Mock, Spielperioden sind Beispieldaten; nur der getrennte Tages-Check-in nutzt bereits
lokale Tage. Keine API, Accounts, Datenbankpersistenz, Loot-/Aura-Besitzrechte oder Membership-Käufe.


## 2026-09-08 · Lokaler Fortschritt, Spielperioden und verdiente Auren

### Automatisierte Prüfung

- Finaler Gesamtlauf: **396/396 Tests in 28 Dateien erfolgreich** (15:43 UTC).
- Abschließender Produktionsbuild erfolgreich (15:47 UTC): initial **304,92 kB**,
  geschätzte Übertragung **86,70 kB**. Die bekannte Dashboard-SCSS-Warnung bleibt bei
  **17,37 kB** über dem 16-kB-Warnbudget und unter dem unveränderten 20-kB-Fehlerbudget.
  Art-Assets sind in diesen Initialgrößen nicht enthalten.
- `git diff --check` erfolgreich.
- Isolierter Testspeicher prüft Journal-Replay nach neuem Repository, idempotente Einträge,
  ungültige/beschädigte oder neuere Daten, Speicherfehler, Größenlimits und Konflikte zwischen
  Browserfenstern. Beim Laden wird ein bestehendes Charakterprofil nicht still überschrieben,
  wenn Aura-Besitz wegen fehlender oder unlesbarer Fortschrittsdaten nicht nachweisbar ist.
- Tages-/Wochenwechsel einschließlich Monats-/Jahresgrenzen, Schaltjahren und rückwärts
  gestellter Gerätezeit sind abgedeckt. XP und Aura-Besitz bleiben beim Periodenwechsel erhalten.
- Nordlicht (Level 20), Sternenkranz (Level 40) und Moosseele (Mooswächter besiegen) werden
  bei passenden Aktivitäten einmalig vergeben. Tests prüfen Auswahlrechte, Speicherung,
  erneutes Laden sowie ausbleibende Belohnungen/Feiern bei bloßem Laden oder Profiländerungen.
- Store-/UI-Tests decken die Sammlung, gesperrte Auswahl, Speicherhinweise, Resume,
  bestätigten Reset, Abbrechen und Fehlerfälle ab. Der Reset behält den Charakterlook,
  entfernt aber nicht mehr verdiente angelegte Auren.

### Browserprüfung und tatsächliche Grenzen

- Creator einschließlich Aura-Sammlung bei **390 × 844** und **768 × 1024 px** betrachtet.
  Inhaltsbreiten **375 bzw. 753 px** stimmen mit der Dokumentbreite überein: kein horizontaler
  Überlauf in diesen Ansichten. Drei gesperrte Belohnungen und deaktivierte Auswahl bestätigt.
- Keine erfolgreiche manuelle Browserprüfung von Aktivität speichern → Belohnung erhalten →
  Aura anlegen → Seite neu laden behauptet. Die automatische Freigabeprüfung blockierte das
  Speichern einer Testaktivität, da sie die Trennung vom Nutzer-Spielstand nicht als ausreichend
  belegt ansah. Der abgelehnte Schreibvorgang wurde nicht wiederholt. Für diese Abläufe gelten
  die automatisierten Tests mit isoliertem Testspeicher; die Browserprüfung blieb lesend.
- Dies ersetzt den früheren Memory-Mock-Stand: Aktivitäten und daraus abgeleitete Fortschritte
  werden jetzt lokal über ein versioniertes Journal wiederhergestellt; Tage und Wochen nutzen
  das lokale Gerätedatum. Bei blockiertem Speicher kann der Fortschritt nur in der Sitzung
  bleiben, was die Oberfläche ausdrücklich anzeigt.
- Die Startwerte bleiben Prototyp-Beispielwerte (u. a. Character Level 12), keine finale
  Release-Startökonomie. Journal-Replay verwendet aktuelle Domainregeln; spätere Änderungen
  an Balance, Katalog oder Seed benötigen eine passende Journalmigration.
- Die **Accountpflicht vor Charaktererstellung** ist in Master-Prompt, Anforderungen und
  Architektur verankert. Ein erster Spring-Boot-Auth-Slice mit Registrierung/Login, HttpOnly-
  Session, CSRF, `/me`, Logout und PostgreSQL/Flyway-Migration ist implementiert. Der heutige
  lokale Game-Prototyp verwendet ihn noch nicht; Character-/Game-API und serverbestätigter Besitz
  bleiben offen. Lokale Journale sind kein Schutz gegen Manipulation und werden keinem Account
  still zugeordnet.
- Native Geräte-/Store-Abnahme, vollständige Barrierefreiheit, Asset-/Animationsleistung auf
  Zielgeräten und tatsächliche Membership-Käufe bleiben offen. Kein vollständiges Release behauptet.

## 2026-09-08 · Authentifizierungsgrundlage

- Backend-Grundlage kompiliert mit Spring Boot **4.1.1** und Java **21**. PostgreSQL/Flyway-
  Migration `V1__accounts.sql` legt UUID-Accounts mit eindeutiger E-Mail und Passwort-Hash an.
- Auth-Endpunkte sind als erster Backend-Slice vorhanden: Registrierung ohne Auto-Login,
  Session-Login mit Session-ID-Rotation, `/me`, Logout und CSRF-Token für die SPA. Passwortwerte
  werden nicht im Browser gespeichert; Produktion verwendet Secure/HttpOnly/SameSite-Sessioncookies,
  das lokale `dev`-Profil erlaubt nur Loopback ohne Secure-Cookie.
- `/api/game/**` ist bereits geschützt und antwortet ohne gültige Session mit JSON-401. Die
  Character-/Aktivitäts-API, die serverautoritative XP-Berechnung und die Kontozuordnung des
  eigentlichen Spielstands sind noch der nächste Slice.
- Frontend-Auth-Seite und Account-Menü sind mobile-first vorhanden. Die bestehende Demo bleibt
  absichtlich lokal, bis der Game-API-Vertrag implementiert und der Provider sicher umgeschaltet
  wird; direkte lokale Charaktererstellung ist deshalb weiterhin als Prototyp gekennzeichnet.
- Frontend-Gesamtlauf nach dem Auth-Slice: **398/398 Tests in 29 Dateien erfolgreich**. Der
  Produktionsbuild kompiliert in einem isolierten Ausgabeordner; Initialgröße **328,51 kB**,
  geschätzte Übertragung **93,17 kB**. Bekannte Dashboard-SCSS-Warnung: **17,37 kB** über
  Warnbudget, unter dem unveränderten Fehlerbudget.
- Backend-Produktions- und Testquellen kompilieren im isolierten Maven-Lauf. Der vollständige
  Surefire-Lauf konnte in dieser Umgebung nicht gestartet werden, weil das fehlende Plugin nicht
  aus dem gesperrten Maven-Netz nachgeladen werden konnte; die Testklassen wurden kompiliert.

Offen bleiben E-Mail-Verifikation, Passwort-Reset, Kontolöschung, serverseitiger Character-/Game-
Slice, Testcontainers-Abnahme und die echte Umschaltung des produktiven Angular-Providers. Diese
Grenzen sind bewusst sichtbar und werden nicht als fertige Kontofunktion für den gesamten Game-Loop
behauptet.

## 2026-10-04 · Mobile-Spielgestaltung, Tagesbegleitung und PixiJS-Kampfübung

### Umsetzung und automatisierte Prüfung

- Vollständiger Frontendlauf: **467/467 Tests in 36 Dateien bestanden** (12:51 UTC).
  Nach der abschließenden rein visuellen Platzierung der Taktikauswahl unter der Bühne erneut
  **3/3 Battle-Page-Tests bestanden** (12:54 UTC).
- Letzter Produktionsbuild erfolgreich (12:54 UTC): **330,19 kB initial**, geschätzte Übertragung
  **94,31 kB**. Art-Downloads und nachgeladene PixiJS-Chunks sind keine Bestandteile dieser
  Initialgröße. Die frühere Dashboard-SCSS-Budgetwarnung ist durch das neu strukturierte
  Stylesheet behoben; Budgets wurden nicht erhöht.
- Eine Buildwarnung bleibt: PixiJS referenziert im WebWorker-Adapter das CommonJS-Modul
  `@xmldom/xmldom`. Der Build gelingt; dies ist kein Beleg abgeschlossener Bündeloptimierung.
- `git diff --check` erfolgreich. Vorhandene Änderungen aus früheren Slices erhalten;
  keine synchronisierten ChatGPT-Quelldateien verändert.
- Pure Domain-Tests prüfen Kampfwerte, Taktiken, Bossphasen, Heilung statt Angriff, HP-Grenzen,
  deterministische Wiederholung und Rundenlimit. Replay/Renderer vergeben keine Rewards.
- Tagesvorschlags-Tests prüfen genaue XP-/Quest-/Boss-Vorschau, Tageslimits, Erholungsmodus,
  gültige Wochenperioden, Vielfalt und unveränderte Eingabesnapshots. Wochenziele vergeben keine
  zusätzlichen XP. Die bestehenden Journal-/Idempotenz-/Aura-/Periodentests bestehen weiter.
- Angular-Tests prüfen unter anderem Taktiksperre, fehlgeschlagenes Laden, Abbruch langsamer
  Bühneninitialisierung, Ressourcenfreigabe, gespeicherte Creator-Entwürfe zwischen Bereichen,
  Aura-Direktlink und Vorschlag → passend ausgefüllter Aktivitätsdialog.

### Sichtbare Browserprüfung

- Dashboard bei **360×800, 390×844, 768×1024 und 1024×768** geprüft. Gemessene Inhaltsbreiten
  **345, 375, 753 und 1009 px** entsprechen jeweils der Dokumentbreite, ohne seitlichen Überlauf.
- Creator bei **390×844 und 768×1024**: Figur → Stil → Aura, sechs männliche/sechs weibliche
  Vorlagen, Vorschauwechsel und gesperrte verdiente Auren kontrolliert. Regulärer Speicherstatus
  erscheint kompakt unten. Weiblichen Entwurf anschließend verworfen, kein Profil gespeichert.
- Onboarding bei Handy-/Tabletgröße geöffnet, Interesse- und Skill-Schritt auf dem Handy
  betrachtet; Schrittwechsel und Breite geprüft. Einrichtung nicht gespeichert.
- Membership bei **390×844 und 768×1024** visuell betrachtet: Preis **3,99 € geplant**,
  Verfügbarkeit ausdrücklich „noch nicht buchbar“, Free-Looks als kostenlos gekennzeichnet.
- Taktik Offensiv: Angriff **124**, Verteidigung **20**, erster Treffer **104 Schaden**;
  Auswahl nach einem Zug gesperrt. Ergebnis **5 Runden**, Held **242/396 HP**, Boss **0/560 HP**.
  Ausdauer im automatischen 2×-Ablauf: **8 Runden**, Held **184/396 HP**, Boss **0/560 HP**.
  Balance zuvor: **7 Runden**, Held **165/396 HP**, Boss **0/560 HP**. Dies sind Ergebnisse der
  Demofigur, kein Nachweis finaler Taktikbalance über alle Charakterstände und künftigen Bosse.
- PixiJS-Bühne enthält genau ein Canvas; nach Navigation zurück zum Dashboard kein Canvas.
  Die zuletzt geprüften Browserlogs enthalten keine Warnungen oder Fehler. Zurück auf dem
  Dashboard bleiben **Level 12, 1726/3400 XP**, **2400/2400 Wochenboss-HP** und **0/3 Quests**.
- Einen Tagesvorschlag geöffnet: Calisthenics und **20 Minuten** korrekt vorbefüllt; Dialog
  abgebrochen. Keine Testaktivität in den Nutzer-Spielstand geschrieben. Fortschrittsmutationen
  sind durch isolierte automatisierte Tests geprüft, nicht durch einen hier behaupteten manuellen
  Ende-zu-Ende-Belohnungsdurchlauf.
- Temporäre Viewportvorgaben am Ende zurückgesetzt. Überarbeitetes Dashboard bleibt geöffnet.

Bildnachweise: [Handy-Dashboard](screenshots/dashboard-phone-2026-10-04.jpg),
[Tablet-Dashboard](screenshots/dashboard-tablet-2026-10-04.jpg),
[Tablet-Kampf](screenshots/battle-tablet-2026-10-04.jpg).

### Art, Produktumfang und verbleibende Grenzen

Der neue eigenständige Mooswächter ist als PNG mit echtem Alphakanal im Projekt gespeichert:
`frontend/public/art/bosses/mosswarden-v1.png` (1254×1254).
[Generierungsauftrag und Herkunft](art/mosswarden-prompts.md) sind dokumentiert.
Die Bühne bewegt aktuell illustrierte Bildteile beziehungsweise Boss-Sprite. Sie liefert noch
keine eigenständigen Gelenk-/Knochenanimationen für Arme, Beine und Waffen. PixiJS **8.22.0**
ist eingebunden; kein Spine-Paket und keine Editorlizenz wurden installiert oder erworben.

Dies ist eine umfangreiche Überarbeitung der spielbaren Kernansichten, keine vollständige
Store-Freigabe. Der Kampf ist als belohnungsfreier Probekampf vom Wochenboss getrennt. Echte
Abenteuerkapitel, Loot-/Inventarsystem, serverseitiger Character-/Aktivitäts-Slice, accountgebundener
Spielstand, native Geräteabnahme und Käufe bleiben weitere Meilensteine. Membership ist eine
Vorschau und aktiviert keine Rechte oder XP-Vorteile. **4,99 € bleibt ein ungetesteter Preiskandidat**;
Nachfrage, langfristige Bindung oder Abo-Abschlüsse wurden nicht gemessen.
Siehe [Produktrichtung](PRODUCT_DIRECTION.md) und [Animationspipeline](ANIMATION_PIPELINE.md).
