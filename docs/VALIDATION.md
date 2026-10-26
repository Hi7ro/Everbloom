# Validierung · Prüfverlauf

Der letzte vollständige Integrationsstand steht im Abschnitt **2026-10-05 · Kontobindung und
sichere Aktivitätswiederaufnahme** am Ende dieses Dokuments.
Frühere Abschnitte sind historische Momentaufnahmen:
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

## 2026-10-04 · Überlagerung beim Frisurwechsel korrigiert

- Reproduziert: Smaragdwächter-Gesicht + Dunkler Topknot + Waldläufermantel + Bernsteinaugen.
  Beim abweichenden Haarmodul lag ein vollständiger Basiskopf unter dem ausgewählten Gesicht.
  Sein längerer Hals blieb sichtbar und erzeugte den gemeldeten doppelten Übergang zur Kleidung.
- Korrektur: Nur Stirnhaut als Unterlage, mit gemeinsamer polygonaler Grenze oberhalb beider
  Augenanker. Die zusätzliche Hautton-Ebene erhält dieselbe Begrenzung. SVG-Porträt und
  PixiJS-Texturaufbau nutzen die gemeinsame Layer-Metadatenregel vor der Quelltransformation.
  Gemalte PNGs, Maskendateien, Gesichtsanker und gespeicherte Profile wurden nicht verändert.
- Neue Regressionstests prüfen, dass die Unterlage Stirnlücken füllt, aber beide Augen, Ohr,
  Kiefer und Hals ausschließt; gewähltes Gesicht, Haar und Outfit bleiben unbeschnitten.
- **469/469 Tests in 36 Dateien bestanden**, Produktionsbuild erfolgreich. Die bereits bekannte
  PixiJS-CommonJS-Warnung bleibt; keine neue Buildwarnung. `git diff --check` erfolgreich.
- Im Browser zwölf repräsentative Kombinationen mit sechs männlichen und sechs weiblichen
  Haar-/Outfitmodulen auf Smaragdwächter- beziehungsweise Morgenhüterin-Gesicht betrachtet,
  einschließlich kurzem Haar und Haut-/Haar-/Augenfarben. Gemeldete Kombination sowie kurzer
  weiblicher Pixie zusätzlich auf der animierten PixiJS-Bühne kontrolliert. Kein doppelter Hals
  in diesen Ansichten. Das ist keine pixelweise Abnahme jeder möglichen Kombination.
- Gemeldete Kombination auch im mobilen Editor bei 390×844 geprüft; Dokumentbreite und
  Inhaltsbreite jeweils 390 px. Keine Browserfehler in den kontrollierten Logs. Testauswahlen
  ausschließlich als Entwurf; kein Profil und keine Aktivität gespeichert. Temporäre, schreibfreie
  Sichtprüfungsroute nach der Prüfung wieder entfernt.
- Bildnachweise: [Editor](screenshots/character-layer-fix-2026-10-04.jpg) und
  [Prüfkombinationen mit Kampfbühne](screenshots/portrait-layer-combinations-2026-10-04.jpg).
## 2026-10-04 · Bereinigung und abgeschlossener lokaler Demo-Rundgang

### Implementierung

- `/demo` ist der neue Einstieg: Figur → Interessen → isoliertes XP-Beispiel → Probekampf.
  Ein abgeschlossener Rundgang erhält eine Abschlusskarte und führt zurück ins freie Spiel.
  Dashboard und Kampfergebnis haben passende Rückwege; Details in [DEMO_GUIDE.md](DEMO_GUIDE.md).
- `DemoExample` enthält ausschließlich komponentenlokalen Beispielzustand; `DemoTourStore`
  speichert getrennte UI-Flags. Das XP-Beispiel verwendet echte Domainregeln ohne Repository-
  Schreibzugriff und ohne Veränderung des Nutzerjournals. Blockierter Gerätespeicher bleibt sichtbar.
- Creator übernimmt einen verspätet geladenen Spielstand, ohne einen bereits bearbeiteten
  Entwurf zu überschreiben. Zwei Regressionen decken das vorherige Laderennen ab.
- Journal-Wiederherstellung nutzt einen Tagesindex statt wiederholter vollständiger Kopien und
  Suchen. Acht Kompatibilitätsfälle und der 10.000-Einträge-Test sichern Originalhistorie,
  Reihenfolge, Kalenderwechsel, Limits, Idempotenz, Quest-Boni und Aura-Besitz.
  Derselbe isolierte Repository-Testlauf sank lokal von 950 auf 218 ms reine Testzeit;
  das ist keine allgemeine FPS-/Geräte-Leistungszusage.
- Unsichtbare Figuren/Auren pausieren ihre CSS-Animationen. Listener/Observer werden entfernt,
  statische Vorschauen benötigen keine Observer. Die erfolgreiche Pixi-Bühne entfernt ihre
  Ersatzgrafik aus dem DOM. Bestehende Frisur-/Hals-Clips und Grafikdateien unverändert.
- 984 Zeilen ungenutzter Vektor-Chibi-Code und seine Tests entfernt; anschließend auch die
  nicht angebundenen AccountMenu-/AuthGuard-Bausteine. Profilnormalisierung bleibt erhalten.
- `/auth` ist eine verständliche Informationsseite; das separat anzubindende Backend-Testformular
  bleibt unter `/dev/auth`. Moduswechsel während eines Auth-Requests und verspätete Navigation
  wurden abgesichert. Widersprüchliche Angaben in README, PRD und Architektur korrigiert.

### Technische Prüfung nach allen Änderungen

- `npm ci` erfolgreich mit aktualisiertem Lockfile; Framework/CLI/Builder Angular **21.2.24**,
  gezielter Builder-Override Piscina **5.3.2**, weitere kompatible transitive Korrekturen.
  Keine Major-Upgrades; Begründung und Entfernen des Overrides sind in der Architektur dokumentiert.
- **494/494 Tests in 40 Dateien bestanden** (abschließender Lauf 14:33 UTC).
- Produktionsbuild erfolgreich: **326,49 kB** initiales JS/CSS, geschätzter Transfer **93,28 kB**;
  Bilddateien und später geladene Pixi-Chunks sind darin nicht enthalten. Keine Größenbudgetwarnung.
  Der bekannte CommonJS-Hinweis des optionalen Pixi-Worker-Adapters bleibt bestehen.
- `npm audit --omit=dev`: **0 gemeldete Befunde**. Gesamtaudit: **1 hoher Befund** in
  `http-cache-semantics`, einer transitiven CLI-Entwicklungsabhängigkeit ohne bestätigten Fix.
  Kein ungeprüfter Override zur Unterdrückung dieses Befunds. Details/Primärquellen in
  [ARCHITECTURE.md](ARCHITECTURE.md#abhängigkeiten-und-security-patches).
- `git diff --check` erfolgreich. Keine Commits, Pushes oder Deployments.

### Sichtbare Browserprüfung

- Vollständiger Rundgang auf separatem Testursprung `127.0.0.1:4202`: Figur **Nori** gespeichert,
  alle drei Onboarding-Schritte abgeschlossen, **2/4** Rundgangschritte sichtbar.
- XP-Beispiel: vorbereitet **1.100/1.200 XP** → **Level 2, 30/1.400 XP**; **80 Aktivitäts-XP**,
  **50 Quest-XP**, **160 Boss-Schaden** sichtbar. Danach **3/4** Rundgangschritte.
- Automatischer Balance-Kampf bei **2×** vollständig abgespielt: **7 Runden**, Sieg, Link
  „Demo abschließen“, vollständige Abschlusskarte und **4/4**. Wiederbesuch/Neuladen erhält die Flags.
- Zurück auf dem Dashboard nach Beispiel und Probekampf: weiterhin **Level 12, 1.726/3.400 XP**,
  **1.460/2.400 Wochenboss-HP**. Kein falscher echter Fortschritt durch den Rundgang.
- Danach regulären Calisthenics-Testeintrag mit **20 Minuten** nur auf diesem separaten Ursprung
  gespeichert. Nach Neuladen: **1.856/3.400 XP**, **1/3 Quests**, **1.300/2.400 Boss-HP**.
  Der Nutzer-Spielstand auf Port 4201 blieb unverändert.
- Demo bei **390×844**, schmaler Abschluss bei **360×800**, Tablet bei **768×1024** visuell
  kontrolliert; zusätzlich Breite **600×900** geprüft. Dokumentinhalt entspricht jeweils der
  verfügbaren Breite: kein horizontaler Überlauf. Abschlussanker scrollt zur ganzen Karte.
- Am Dashboard wechselt der Portrait-Stil nach Wegscrollen von `running` auf `paused`.
  Fertige Kampfbühne: **1 Canvas, 0 Ersatzgrafiken**.
- Nach Paketupdate den Hauptserver neu gestartet: Demo und Pixi-Kampf bei Port 4201 erneut
  geprüft, **keine Fehler/Warnungen in den zuletzt erfassten Browserlogs**. Testtab und Testserver
  geschlossen, Viewport zurückgesetzt; Haupttab bleibt auf `/demo` geöffnet.

Nachweise: [Demo-Einstieg auf dem Tablet](screenshots/demo-entry-tablet-2026-10-04.jpg),
[abgeschlossener Rundgang auf dem Handy](screenshots/demo-completion-phone-2026-10-04.jpg),
[Teststand auf dem Tablet](screenshots/demo-tablet-2026-10-04.jpg).

### Grenze der Fertigstellung

Die lokale Demo ist durchgängig spielbar und hat einen vollständigen Einstieg und Abschluss.
Sie ist kein fertiger Store-Release: Accountbindung/Serverfortschritt, Käufe, vollständiges Loot-
und Inventarsystem, weitere Kapitel/Assets, Übersetzungen und native Geräteabnahme bleiben offen.
Backend- und native Laufzeit wurden in diesem Durchgang nicht als fertig geprüft behauptet.

## 2026-10-04 · Mächtigere Boss-Proportionen

- Held-Skalierung 1,15 → 1,00; Mooswächter 1,00 → 1,30. Boss-Anker auf (550, 398)
  verschoben, damit Geweih und Bewegungen innerhalb der 800×440-Bühne bleiben.
  Bodenschatten und Helden-Auraring angepasst; statische Ersatzansicht ebenfalls abgestimmt.
- Sichtprüfung bei 360×800, 390×844 und 768×1024: Boss etwa 1,5-mal so hoch wie die
  sichtbare Heldensilhouette, im Idle vollständig im Bild, kein horizontaler Überlauf.
  Ersten Angriff im Browser ausgelöst. Kampflogik, HP, Schaden und Fortschrittsregeln unverändert.
- 9/9 fokussierte Tests für Rendergrenze und Aktionsadapter bestanden; Produktionsbuild
  erfolgreich, nur der bereits bekannte Pixi-CommonJS-Hinweis. Keine neuen Tests für die
  reine Größenanpassung. Viewport nach Prüfung zurückgesetzt.
- Nachweise: [Handy](screenshots/boss-scale-phone-2026-10-04.jpg),
  [Tablet](screenshots/boss-scale-tablet-2026-10-04.jpg).

## 2026-10-04 · Mobile Beta 0.1, Konten und Serverfortschritt

### Technische Prüfung

- **556/556 Frontend-Tests in 47 Dateien bestanden**, abschließender Lauf 17:44 CEST mit
  Node 24.21.0. Enthalten sind Konto-Isolation, verspätete Antworten nach Kontowechsel,
  Route-Guards, sichere Rücksprungziele, native Transport-/Export-/Resume-Grenzen und Spielregeln.
- **45/45 Backend-Tests bestanden**, keine übersprungen: Authentifizierung, Verifikation,
  Passwortreset/Sitzungswiderruf, CSRF, Proxy-Vertrauen, Datenisolation und Game-API.
  Game-Parität vergleicht unabhängige TypeScript-Referenzfälle mit Java-Ergebnissen.
- Produktionsbuild erfolgreich: **334,58 kB** initiales JS/CSS, geschätzter Transfer **96,39 kB**.
  Nachgeladene Pixi-Chunks und Bilder sind darin nicht enthalten. Keine Größenbudgetwarnung;
  der bekannte Pixi-CommonJS-Hinweis zu `@xmldom/xmldom` bleibt bestehen.
- Abschließendes vollständiges `npm audit`: **0 gemeldete Befunde**. Das ist keine vollständige
  Sicherheitszertifizierung. `git diff --check` erfolgreich; lokale Zugangsdaten Git-ignoriert.
- `cap sync` mit dem finalen Build für **iOS und Android erfolgreich**; App-, Filesystem- und
  Share-Plugins eingebunden. Native Kompilierung, Signierung und Installation sind nicht geprüft.
- Isolierte lokale PostgreSQL-18.6-Datenbank; Flyway V1–V3 ausgeführt. Reale HTTP-Prüfungen direkt
  und über den Entwicklungsproxy erfolgreich. Letzter Lauf gegen Port 4201 nach Backend-Neustart:
  Registrierung, Verifikation, CSRF, zwei getrennte Konten, feste XP-Erwartungen, wiederholte
  Eintrags-ID ohne doppelte XP, 409 bei abweichender Wiederholung, Export, Passwortreset mit
  Widerruf zweier Sitzungen, Logout und Löschung. Synthetische Smoke-Konten werden entfernt.
- Deploy-Konfiguration syntaktisch geprüft: Compose-Konfiguration, Shell-Syntax und vier
  Restore-Schutzfälle. Kein echter Containerstart und kein echter Backup-/Restore-Durchlauf,
  da der lokale Docker-Daemon nicht verfügbar ist.

### Sichtbarer Kontofluss und Produktionsbuild

- Synthetisches bestätigtes Testkonto im Browser: Login → Nori erstellen → Interessen wählen
  → 60 Minuten Calisthenics. Ergebnis **290/1.200 Charakter-XP**, davon 240 Aktivitäts-XP und
  50 Quest-XP, **240/1.000 Skill-XP**, **1.920/2.400 Boss-HP**. Neuladen erhält diese Werte.
- Account-JSON heruntergeladen und auf richtigen Eigentümer, Nori/290 XP sowie fehlende
  Passwortdaten kontrolliert. Export-Datei enthält ausschließlich synthetische Testdaten.
- Finalen Produktionsbuild unter der CSP aus `deploy/Caddyfile` lokal auf Port 4203 geprüft.
  Dabei fehlende globale Styles durch blockiertes Inline-`onload` behoben; jetzt normaler CSS-Link.
  Pixi arbeitet mit CSP-Adapter ohne `unsafe-eval`-Freigabe: **ein Canvas**, automatischer Kampf
  bis Ergebnis, korrekte Button-Farben und keine Fehler/Warnungen in den erfassten Browserlogs.
- Level-1-Probekampf gegen den Level-12-Wächter endet erwartungsgemäß nach drei Runden mit
  Niederlage. Rückkehr zum Dashboard erhält **290 XP / 1.920 Boss-HP**; keine Kampf-Rewards
  und keine alten Demo-Abschlusslinks im Accountmodus.
- Responsive Prüfung: Kampf bei **360×800**, Dashboard bei **390×844 und 768×1024**;
  Dokumentbreite entspricht jeweils der Viewportbreite. Handy- und Tabletansicht visuell geprüft.
- Logout führt sichtbar zur Anmeldung. Direkter Aufruf von `/character/create` nach Logout
  bleibt gesperrt und führt mit sicherem Rücksprungziel zur Anmeldung.

Nachweise: [Handy-Dashboard](screenshots/beta-dashboard-phone-2026-10-04.jpg),
[Tablet-Dashboard](screenshots/beta-dashboard-tablet-2026-10-04.jpg).

### Noch keine Verteilungsfreigabe

Dieser Stand ist ein lokal integrierter Beta-Kern. Xcode und Android SDK sind inzwischen
eingerichtet; Debug-/Simulator-Builds sind erfolgreich. Entwicklerkonten/Signierung,
HTTPS-Hosting, Domain, echter Mailversand und vollständige Betreiber-/Datenschutzangaben
fehlen weiterhin. Native Cookies beim Kaltstart, Tastatur, Safe Areas,
Rotation, Teilen, Audio, Hintergrundwechsel und Netzwerkfehler müssen auf Geräten geprüft werden.
Eine Debug-APK und eine iOS-Simulator-App wurden erstellt. Es gibt keine signierte IPA/AAB,
keine echten versandten E-Mails und keine Veröffentlichung.
SMTP arbeitet bislang mit einer nicht dauerhaften Queue; Zustellfehler müssen im Betrieb überwacht
werden. Der genaue Weg zur Testverteilung steht in [BETA_RELEASE.md](BETA_RELEASE.md).

## Beta 0.2.0 · Bosskampagne, tatsächliche Kosmetik und native Builds

Abnahme vom 4. Oktober 2026; ersetzt frühere Zählstände und Toolchain-Aussagen.

- Vollständige Frontend-Suite: **743 Tests in 60 Dateien bestanden**.
- Vollständige Backend-Suite: **62 Tests bestanden**. 162 feste TS-/Java-Kampf-Replays
  stimmen überein; 108 zusätzliche Kampagnen-Balancefälle dokumentiert.
- Echter lokaler PostgreSQL-/HTTP-Smoke: alle fünf Bossmechaniken, Reihenfolge, Level-/Modus-
  Grenzen, Erstbelohnung, wiederholte Requests, Ausrüstung, Reload, Export und Kontotrennung.
- Fünf Bosse bei Level 10/20/30/40/50. Der Wolkenkönig bleibt der anspruchsvollere Abschluss.
  Der Glutwyrm kündigt seinen Feueratem sichtbar an; die Warnung bleibt über den Heldenzug
  erhalten, verschwindet beim Feueratem, und die HP ändern sich erst beim tatsächlichen Treffer.
- 16 gemalte **ausgerüstete** Auren: sechs neue transparente WebP-Dateien plus zehn vorhandene
  Boss-Aurabilder. Dashboard/Editor/Sammlungs-Vorschau und Pixi verwenden eine gemeinsame
  Darstellungstabelle. Waldlicht am Chibi und im Pixi-Kampf sowie Geistwächter im Editor
  visuell geprüft. Kein Ersatz durch ein reines Sammlungsbild und kein alter Bodenkreis.
- Die fünf epischen Sets haben für jede Charakterdarstellung fünf verschiedene Outfitmodule:
  Waldläufer, dunkle Rüstung, Magiergewand, gemütlicher Expeditionslook, himmlisches Kampfgewand.
  Der API-Test rüstet alle fünf Sets für beide Darstellungen aus. Zwei neue Sammlungsbilder
  begleiten Magier-/Expeditionsstil; diese Illustrationen bleiben von der echten Modulvorschau
  unterscheidbar. Es wurden keine zehn neuen modularen Vollrüstungen geriggt.
- Haar-/Kragenkorrektur: fremde Maskenkanäle ausgeschlossen, Stirnfüllung durch gewählte
  Haarmaske ausgespart, Frontkragen und gemeinsame Atmung erhalten. Gemeldete Kombination
  Smaragdwächter + Kupferkurzhaar nach frischem Build visuell kontrolliert; keine sichtbare
  alte graue Frisur, kein heller Stirnfüllungs-Halbkreis. 432 Kombinationen strukturell getestet.
- Belohnungsfenster beim echten Wolkenkönig-Erstsieg sichtbar geprüft: Wolkenkrone, Quelle,
  Seltenheit, Schließen und Sammlungslink. Wiederholtes Abspielen öffnet kein zweites Fenster.
- Produktionsvorschau mit der Projekt-CSP: mobile Kampfansicht 390×844, Editor 360×800 und
  1024×900; jeweils keine horizontale Dokumentüberbreite. Speichern bleibt bei 360 px erreichbar.
  Pixi nutzt ein Canvas; erfasste Browserlogs ohne Warnung/Fehler. Test-Viewport zurückgesetzt.
- Produktionsbuild erfolgreich: **368,13 kB initial / 108,44 kB geschätzter Transfer**.
  Zwei bestehende Hinweise bleiben: Dashboard-SCSS 466 Byte über Warnbudget und Pixi-XMLDOM-
  CommonJS-Abhängigkeit. Keine Fehler; keine pauschale Anhebung der Budgets.
- Web-Stand anschließend für beide Capacitor-Projekte synchronisiert. Android-Debug-APK und
  iOS-Simulator-App bauen erfolgreich mit Versionsnummer **0.2.0 / Build 2**. Der native
  Account-Endpunkt bleibt absichtlich unkonfiguriert, bis ein reales HTTPS-Backend besteht.

Nachweise: [Kampf und tatsächliche Aura](screenshots/ember-boss-aura-phone-2026-10-04.jpg),
[Charakter/Haarfix](screenshots/equipped-aura-hair-fix-2026-10-04.jpg),
[Belohnungsfenster](screenshots/boss-reward-popup-phone-2026-10-04.jpg).

Grafiken und genaue ImageGen-Prompts: [Auren](art/EQUIPPED_AURA_PROMPTS.md),
[Set-Stile](art/EPIC_SET_STYLE_PROMPTS.md), [Bosse](art/BOSS_RENDER_PROMPTS.md),
[Beute](art/LOOT_RENDER_PROMPTS.md). Alle Originale liegen im Projekt unter `art-source/`.

## 2026-10-05 · Kontobindung und sichere Aktivitätswiederaufnahme

Der bestehende Beta-Kern wurde um zwei Zuverlässigkeitsregeln erweitert. Das Aussehen und die
Spielbalance wurden in diesem Schritt nicht verändert.

- **Frontend:** 787 Tests in 64 Dateien bestanden. Enthalten sind ursprüngliche Aktivitäts-ID nach
  neuer Store-Instanz, Wiederanmeldung und Kontowechsel, beschädigter/gesperrter Speicher,
  veraltete Löschantworten, Timeout → spätere 403 → sichere Wiederholung sowie ein bereits in einem
  anderen Fenster bestätigter Eintrag. Der alte Wiederholungsdialog darf dann kein neues Formular
  mit denselben Daten werden; normale neue Entwürfe bleiben erhalten.
- **Backend:** 63 Tests bestanden, keine Fehler oder übersprungenen Tests. Der neue echte
  Sitzungs-Cookie-Test prüft das erwartete Konto vor Lesen/Schreiben, Export, Löschung und Logout.
  Der Header authentifiziert niemanden; CSRF, Verifikation und serverseitige Besitzerzuordnung
  bleiben notwendig. Abweisung verändert weder Daten noch Sitzung des tatsächlich angemeldeten Kontos.
- **Echter HTTP-/PostgreSQL-Smoke:** direkt auf Port 8080 und durch den Produktionsvorschau-Proxy
  auf 4203 erfolgreich. Zufällige synthetische Konten wurden nach den Prüfungen entfernt.
  Die Wiederholung in einer frisch angemeldeten Sitzung bleibt bei exakt einem 60-Minuten-Eintrag
  und 290 Charakter-XP. Falsches erwartetes Konto liefert 409 `ACCOUNT_CHANGED`; kein Lesen eines
  anderen Spielstands und kein fremder Schreib-/Logout-/Lösch-Effekt.
- **Browserablauf mit verloren gegangener Antwort:** Ein separater Loopback-QA-Proxy leitete
  47 Minuten Swimming erfolgreich an den echten Server weiter und ersetzte ausschließlich diese
  Antwort durch einen Fehler. Der Dialog hielt Swimming/47 unveränderbar fest. Nach Schließen des
  Tabs und Öffnen einer neuen App-Instanz erschien die Wiederaufnahme erneut, während der Server
  schon 141 XP zeigte. Ausdrückliche Wiederholung schloss den Dialog mit „bereits gespeichert“:
  weiterhin 141 XP und ein Verlaufseintrag, kein neues Erfolgspopup.
- **Oberfläche:** Fehlerdialog bei 390 × 844 visuell bedient; wiederhergestellter Dialog zusätzlich
  in der breiten Ansicht geprüft. Die abschließende Dashboard-Messung ergab 480 px Dokumentbreite
  bei 480 px verfügbarer Breite, ohne horizontalen Überlauf. Keine Browser-Konsolenfehler im
  abschließenden Prüf-Tab. Screenshot: [Wiederhergestellter Dialog](screenshots/activity-recovery-dialog-2026-10-05.jpg).
- **Dokumentation:** Masterprompt, Anforderungen, Architektur, README und Beta-Leitfaden auf den
  gelieferten Stand abgeglichen. Die Dateninformation erklärt die kontobezogene Gerätesicherung.
- **Produktionsbuild und Capacitor-Sync:** erfolgreich. Zwei bekannte Warnungen bleiben:
  Dashboard-SCSS über dem 16-kB-Warnbudget (weiter unter der 20-kB-Fehlergrenze) und Pixis
  transitive CommonJS-Abhängigkeit `@xmldom/xmldom`. Kein Budget erhöht.

Prüfgrenzen: Die Browserprüfung ist kein physischer iOS-/Android-Neustarttest. Keine neue
Store-Signierung, externe Bereitstellung oder SMTP-Zustellung durchgeführt. Bei gelöschten
App-/Browserdaten ist auch eine offene Gerätesicherung weg. Web Locks sichern die Reservierung
nur in Laufzeitumgebungen mit dieser API atomar ab. Bosskampf-IDs bleiben weiterhin sitzungsgebunden;
deren Erstabschluss-Belohnungen werden unabhängig davon serverseitig nur einmal vergeben.

**Native Build-Abnahme dieses Stands:** Android `assembleDebug` erfolgreich (184 Tasks), iOS-
Simulator-Build mit deaktivierter Signierung erfolgreich. Das jeweils gebündelte `index.html`
stimmt bytegenau mit dem aktuellen Produktionsbuild überein. Bestehende Version 0.2.0 / Build 2;
die Artefakte wurden lokal aktualisiert, in diesem Schritt nicht erneut auf Simulatoren installiert
oder auf physischen Geräten gestartet. Native Runtime-Konfiguration weiterhin ohne öffentliches
HTTPS-Backend, deshalb kein neuer Nachweis für native Online-Kontoflüsse.

## 2026-10-05 · Persönliche Quests, Levelboni und sichtbare Freischaltungen

Die öffentliche Produktanalyse umfasst elf Apps/Spiele; Quellen, Beobachtungen und eigene
Ableitungen stehen in [COMPETITOR_RESEARCH.md](COMPETITOR_RESEARCH.md). Keine Installation oder
praktische Wettbewerberabnahme, keine Untersuchung fremden Quellcodes. Umgesetzt wurden die
persönlichen Tagesquests und die Vorschau „Am Horizont“; die Bonus-Skalierung folgt der zusätzlichen
Nutzerentscheidung. Eigene Routinen, Timer und erzählte Entwicklungspfade bleiben Planung.

- **Frontend:** 809 Tests in 66 Dateien bestanden. Dazu zählen Fokus-Onboarding → echte
  Router-Navigation → Laden der Serverquests, 1/2/3-Questzähler, passende Symbole aller 14 Skills,
  Lade-/Sitzungsfehler und die vorhandenen Wiederaufnahmefälle. Die reine Horizont-Berechnung
  verrät keine späteren Bosse, verspricht keine bereits besessenen Cosmetics und verändert nichts.
  Wolkenkönig-Zugang 50 und Empfehlung 55 werden getrennt geprüft. Darstellung und Navigation
  der Vorschau sind zusätzlich getestet.
- **Backend:** 88 Tests in acht Klassen bestanden, keine Fehler oder übersprungenen Tests.
  Geprüft: tägliche Auswahlrotation, vor Beginn austauschbarer Plan, Sperre ab jeder heutigen
  Aktivität (auch 0 XP), konkurrierende Präferenz-/Aktivitätsspeicherung, mehrfacher Request und
  abgewiesene clientseitige Bonusmanipulation. Feste Beispiele der Skalierung: Level 1/10/20/50
  ergeben 40/60/100/220 Bonus-XP. Ein Aufstieg von Level 9 auf 10 lässt gespeicherte 55 XP heute
  unverändert; Reload und Wiederholung bleiben identisch, der nächste Tag erzeugt 60-XP-Quests.
  Extremwerte und die Summe von drei Boni bleiben innerhalb des Integerbereichs.
- **Echtes HTTP/PostgreSQL:** `scripts/smoke-personal-quests.py` gegen das aktualisierte Backend
  durch den Produktionsproxy 4203 erfolgreich; `scripts/smoke-beta.py` direkt gegen 8080 erfolgreich.
  Der persönliche Level-1-Plan enthält Swimming/Reading/Music mit 15/15/10 Minuten. Swimming 15
  ergibt exakt 45 Aktivitäts-XP + 40 Quest-XP und 90 Wochenboss-Schaden. Ein erneuter Login und
  dieselbe Eintrags-ID geben nichts doppelt. Neuer Fokus nach Aktivität bleibt für morgen gespeichert;
  zusätzliche Recovery erzeugt heute keinen fremden Questbonus. Der Legacy-Smoke bleibt bei 290 XP.
  Diese Smoke-Konten wurden anschließend gelöscht. Hohe Level/Tageswechsel wurden mit kontrollierter
  Test-Clock in der Backend-Suite geprüft, nicht durch Verstellen der echten Serverzeit.
- **Echte Oberfläche:** Frisches synthetisches Konto durch das Onboarding geführt. Swimming,
  Reading und Instrument gewählt; drei passende Quests und korrekte Vorschau erschienen direkt.
  Swimming abgeschlossen: 85 Charakter-XP, 45 Skill-XP, 1/3 Quests und 2.310 Wochenboss-HP.
  Danach Swimming im Fokus durch Recovery ersetzt: bestätigte Quest, XP und Historie blieben
  erhalten; Recovery erschien als Vorschlag mit 20 Aktivitäts-XP ohne erfundenen Questbonus.
  Reload bewahrte den Stand ohne neue Belohnung. Keine Konsolenfehler im Prüf-Tab.
- **Mobil/Tablet:** Bei 390 × 844 und 820 × 1180 geprüft. Dokumentbreite 375 bzw. 805 px bei
  390 bzw. 820 px Viewport (Scrollleiste berücksichtigt), kein horizontaler Überlauf.
  Die Zielvorschau steht am Handy untereinander, am Tablet nebeneinander. Nachweise:
  [Persönliche Tagesquests](screenshots/personal-quests-phone-2026-10-05.jpg) und
  [Am Horizont](screenshots/progression-horizon-tablet-2026-10-05.jpg).
- **Build:** Produktionsbuild erfolgreich. Bekannte Warnungen: Dashboard-SCSS 16,64 kB bei
  16-kB-Warnbudget (unter 20-kB-Fehlergrenze) und Pixis transitive CommonJS-Abhängigkeit
  `@xmldom/xmldom`. Keine Budgets erhöht, keine neuen Laufzeit-Abhängigkeiten.

Prüfgrenzen: Dieser Stand aktualisiert den Web-Build und das lokale Backend. Native Pakete wurden
für diese Produktiteration nicht erneut gebaut oder auf Geräten abgenommen. Die Recherche belegt
keine Bindungs-, Umsatz- oder Gesundheitswirkung; das Membership-Preisziel ist weiter zu validieren.

## 2026-10-05 · Bereinigung, sieben Bosse und gerenderte Schwierigkeitsformen

Der folgende Stand ersetzt die älteren Katalog- und Buildzahlen oben. Die Reihenfolge lautet
Mooswächter 10 → Glutwyrm 20 → Dämmerungsbestie 30 → Frosttitan 40 → Wolkenkönig 50 →
Blutmondregentin 60 → Sternensouverän 70. Der Wolkenkönig bleibt das Finale des ersten Kapitels.
Neue Begegnungen werden weiterhin erst nach einem vorhergehenden Sieg entdeckt. Bereits
gespeicherte Sternen-Siege, Kosmetik und identische alte Kampf-Anfragen bleiben erhalten;
neue Versuche verwenden die aktuelle Reihenfolge und Levelgrenzen.

- **Bereinigung:** Vier nicht mehr geroutete Demo-Dateien entfernt; die echte PreviewPage bleibt
  mit eigenen Tests erhalten. Unbenutzte Exporte, überschrieben berechneter Boss-Schaden und
  unnötige Rendering-Helfer entfernt. Spielstands-/Test-Repositories und Replay-Prüfungen bleiben
  erhalten, weil sie weiterhin genutzt werden. `noUnusedLocals` und `noUnusedParameters` aktiv.
  Nur benötigte SVG-Filter werden angelegt; Maskenvorbereitung geschieht einmal statt pro Pixel.
  Der häufige Same-Day-Pfad vermeidet vollständige Journalscans. Alte Bildversionen und nicht
  benötigte Rig-JSONs im App-Paket sparen rund **2,5 MB** gegenüber der Ausgangsbasis.
  Das ist keine gemessene FPS-Verbesserung und berücksichtigt die anschließend ergänzte Kunst nicht.
- **Neue Kunst:** 21 eigenständige Hard-/Episch-/Ultimate-Bilder sowie die zwei Grundformen
  Dämmerungsbestie und Blutmondregentin: **23 neue Bilder, 28 Bossbilder insgesamt**.
  Transparente, optimierte 900×900-WebPs; PNG-Master, exakte Prompts und Prüfprotokolle unter
  `art-source/boss-forms/`. Die 23 neuen Laufzeitbilder benötigen zusammen **5.372.632 Bytes**.
  Eng abgeschnittene Moos-/Glut-Erstentwürfe wurden verworfen und neu gerendert. Finale Motive
  einzeln bzw. als Kontaktbogen auf Körperkonturen und transparente Ränder geprüft.
  Keine Originale oder Prompts werden in die App kopiert; geladen wird nur die gewählte Form.
- **Kampf und Darstellung:** Pixi-Bühne und statischer Ersatz verwenden denselben Formenresolver.
  Ein schneller Moduswechsel verwirft spät fertig geladene alte Bühnen. Dämmerungsbestie hat
  eigene Schattenhiebe und Runenschutz; Blutmondregentin Rubinklinge, schadensfreies Siegel
  und angekündigte Mondfinsternis. Bossheilung ist auf tatsächlich verursachten Schaden,
  fehlende HP und 2 % Boss-MaxHP begrenzt. Schaden am Ziel und Heilung am handelnden Boss
  erscheinen getrennt; der Boss bleibt dabei in Angriffspose. Neue Auren verwenden vorhandene
  Bilder mit identischer RGB-Tönung in SVG/Pixi: 20 Aura-IDs, 16 verschiedene Bilddateien.
  Die neuen Loot-Illustrationen sind bewusst vorhandene Bildzuordnungen, keine acht neuen Render.
- **Frontend:** **971 Tests in 72 Dateien bestanden**, einschließlich sieben Bossfamilien,
  schadensfreier Schutz-VFX, Moduswechsel mit verspäteter Antwort, getrenntem Drain-Feedback,
  Level-70-Horizont, historischen Siegen und unveränderter Vorschau. Produktionsbuild erfolgreich:
  initial **395,64 kB**, geschätzter Transfer **117,07 kB**. Keine zusätzlichen Runtime-Pakete.
- **Backend:** **112 Tests in zehn Klassen bestanden**. 246 gemeinsame TypeScript-/Java-
  Replay-Fixtures und 28 Loot-Verträge. `smoke-beta`, `smoke-personal-quests` und der erweiterte
  `smoke-bosses` gegen HTTP/PostgreSQL erfolgreich; inklusive Mondfinsternis-Heilung,
  Kampfreihenfolge, einmaligen Belohnungen und Ausrüsten. Diese Smoke-Konten wurden entfernt.
  Die visuelle Prüfung verwendet ein getrenntes lokales QA-Konto mit kontrollierten Levelwerten,
  das für die laufende lokale Prüfung erhalten bleibt; keine fremden Spielstände angehoben.
- **Browser:** 390×844 und 820×1180 geprüft, jeweilige Dokumentbreite 390/820 ohne horizontalen
  Überlauf. Blutmond-Normal/Hard/Episch/Ultimate wechseln die Form, ein Pixi-Canvas bleibt aktiv;
  Dämmerungs-Ultimate erscheint deutlich größer als der Chibi. Sternensouverän zeigt sichtbar
  die Grenzen 70/75/85/100. Kein statischer Fehlerersatz und keine Konsolenfehler im Prüf-Tab.
  Lange deutsche Bossnamen trennen sich im schmalen HP-Bereich. Nachweise:
  [Blutmondregentin Ultimate am Tablet](screenshots/bloodmoon-ultimate-tablet-2026-10-05.png),
  [Dämmerungsbestie Ultimate am Handy](screenshots/dusk-ultimate-phone-2026-10-05.png).
- **Native Pakete:** Capacitor-Sync, Android-Debug-APK und unsignierter iOS-Simulator-Build
  erfolgreich. **168 Webdateien bytegleich** in Native-Quellassets, APK, iOS-App und Simulator-ZIP;
  ausschließlich zwei erwartete Cordova-Bridge-Dateien zusätzlich. Alle 23 neuen Bilder in jedem
  Paket per SHA256 bestätigt. APK **62.648.492 Bytes**, Simulator-ZIP **69.228.061 Bytes**.
  Vollständiges iOS-Archiv mit 197 Dateien ebenfalls bytegleich. Maschinenlesbarer Nachweis:
  `.local/native-boss-forms-proof-2026-10-05.json`.

Die beiden bekannten Buildwarnungen bleiben: Dashboard-SCSS 16,64 kB über dem 16-kB-Warnbudget
(unter 20-kB-Fehlergrenze) und Pixis transitive CommonJS-Abhängigkeit. Kein Budget hochgesetzt.
Die Pakete bleiben lokale Testbuilds mit `nativeApiOrigin: null`, Version 0.2.0 / Build 2.
Kein neuer physischer Gerätetest, kein signiertes iPhone-IPA, kein Store-Sandbox-Kauf und keine
Veröffentlichung nachgewiesen. Der Release-Check meldet weiterhin **NOT_READY: 27 fehlende
Konfigurationen und sieben externe Abnahmen**; Details in `RELEASE_V1.md`.

## 2026-10-05 · Zehn Bosse, zwölf Looks und korrigierter Kopf-/Kragenanschluss

Dieser abschließende Stand ersetzt die Zahlen des unmittelbar vorhergehenden Sieben-Bosse-
Abschnitts. Die historischen Nachweise bleiben zur Einordnung erhalten.

- **Kampagne:** zehn Bossfamilien auf Level 10 bis 100; zusätzlich Nharok 80, Vaelthar 90
  und Aureon 100. Je vier eigenständige Normal-/Hard-/Episch-/Ultimate-Illustrationen:
  **40 Bossformen**. Entdeckung bleibt an den vorherigen Normalsieg gebunden. Der Wolkenkönig
  bleibt das erste Kapitelfinale. 372 gemeinsame Java-/TypeScript-Replayfälle und 40 Lootverträge.
- **Belohnungen:** 40 Besitzfamilien; 20 Haar-/Outfitfamilien mit jeweils männlicher und
  weiblicher Illustration plus 20 gemeinsame Aura-Belohnungen ergeben **60 Lootbilder**.
  Familienbesitz bleibt bei einem Darstellungswechsel erhalten. Namen, Module und Sammlungskunst
  folgen der Figur; ein bereits ausgelöstes Popup behält die beim Verdienen aufgelöste Variante.
  Sammlungsillustrationen sind von den ausgerüsteten Kopf-/Outfitmodulen zu unterscheiden.
  26 verschiedene ausgerüstete Aura-Designs, keine freie Farbauswahl. Rosenlicht und Schattenflamme
  werden freigeschaltet; die serverseitige Normalisierung erhält berechtigten alten Besitz.
- **Charaktere:** zwölf neue vollständige Outfitkörper, sechs je Darstellung; zwölf Frisurvorschauen.
  Der tatsächlich gewählte Frisurkopf wird als **eine vollständige Zeichnung** verwendet.
  Die alte Kombination aus Vorlagengesicht, fremder Frisur und Stirnunterlage ist entfernt:
  Sie verursachte Aussparungen an den Schläfen und doppelte Ohr-/Kieferkanten. Ohne explizite
  Farbauswahl gelten die Originalfarben des gewählten Kopfes. Haut-, Augen- und Haarfarbauswahl
  werden weiterhin auf genau diesen Kopf angewendet. Die Kragenbefestigung folgt dem Kopf,
  versenkt gemalte Hälse um neun Portrait-Einheiten und hält die Füße bei y=280. Bereits halslose
  Quellköpfe behalten ihren direkten Anschluss. Körper und Kopf atmen gemeinsam. SVG und Pixi
  verwenden dieselbe Ebenenplanung; es werden keine fremden Gesichtsunterlagen mehr geladen.
- **Nachvollziehbarkeit:** Quellen, exakte Generierungsprompts, Alpha-/Randprüfungen und aktuelle
  Körperanker unter `art-source/characters-v2/`; frühere weibliche Kragenanker bleiben als Referenz
  erhalten. 124 relevante neue WebPs (40 Bossformen, 60 Lootbilder, zwölf Körper, zwölf
  Frisurvorschauen) vollständig geprüft: **16.917.224 Bytes**, keine identischen Duplikate in
  den jeweiligen Kunstgruppen. Die Prüfung der Pixelmaße allein ist kein Qualitätsurteil;
  Einzelbilder und die reale Komposition wurden zusätzlich angesehen.
- **Bereinigung:** unbenutzte Illustrationspfade sowie die mehrfache Stirn-/Gesichtsmontage entfernt.
  Zwölf ungenutzte Original-/Masken-/Gesichts-PNGs bleiben als Entwicklungsquellen erhalten,
  werden aber nicht gebündelt: **14.459.838 Bytes Rohdateien eingespart**. Das ist keine behauptete
  FPS-Messung. Doppelte Dashboard-Styles zusammengeführt; das bestehende CSS-Warnbudget wird
  jetzt eingehalten. Bossauswahl als seitlich scrollbarere Kartenreihe auch am Tablet, statt
  zehn zusammengedrückter Spalten. Keine Budgetgrenze erhöht.
- **Automatisierte Prüfung:** **1.038 Frontendtests in 73 Dateien bestanden**, einschließlich
  432 kompatibler Preset-/Kopf-/Outfit-Auswahlkombinationen, 72 Kopf-/Körperanschlüsse, Farbwechsel,
  eigener Irisanker, Look-Zurücksetzen, vergrößerter Vorschau, korrekter Lootvariante und
  Ressourcenfreigabe bei abgebrochenen Bildanfragen. Nach dem abschließenden Tablet-CSS-Fix
  zusätzlich die 13 Battle-Page-Tests bestanden. **117 Backendtests ohne Fehler**; die drei
  lokalen HTTP-/PostgreSQL-Smokes der erweiterten Kampagne ebenfalls erfolgreich. Keine
  weitere Backendänderung durch die abschließende Grafikreparatur. `git diff --check` sauber.
- **Browserprüfung:** alle zwölf Vorlagen im realen Editor ausgewählt und deren tatsächliche
  SVG-Komposition zusätzlich vergrößert angesehen. Gemeldeter Kupferkopf/Obsidian-Look ohne
  zweite Haarsilhouette und ohne sichtbaren Hals. Weiblicher Pixie mit Leerenrobe, Bronzehaut
  und blauen Augen im Editor und in der Pixi-Arena geprüft. Weibliche Reliktkrone nach einem
  echten lokalen Normal-Erstabschluss als Popup bestätigt. Nach erneuter Anmeldung bleiben
  Look und Spielstand erhalten. Prüfung in eigener lokaler QA-Identität auf `qa.localhost`;
  keine bestehenden Nutzerkonten verändert. Dokumentbreite 390/390 und 820/820; Bosskarten
  138/180 Pixel breit und nur ihr Auswahlbereich horizontal scrollbar. Zwei frühere Lazy-Chunk-
  Ladefehler entstanden während laufender Bundle-Neubauten; im frisch geladenen finalen
  Rundgang keine neuen Browserwarnungen oder Fehler. Nachweise:
  [Korrigierter Chibi am Handy](screenshots/character-neckless-phone-2026-10-05.png),
  [zwölf tatsächlich gerenderte Looks](screenshots/character-12-looks-render-review-2026-10-05.png),
  [gemischter weiblicher Look](screenshots/character-female-mixed-tablet-2026-10-05.png),
  [weibliche Belohnung](screenshots/female-relic-reward-popup-2026-10-05.png),
  [Aureon Ultimate am Tablet](screenshots/aureon-ultimate-tablet-2026-10-05.png),
  [Aureon Ultimate am Handy](screenshots/aureon-ultimate-phone-2026-10-05.png),
  [lesbare Bossauswahl am Tablet](screenshots/boss-campaign-tablet-2026-10-05.png).
- **Build und native Pakete:** initial **406,27 kB**, geschätzter Transfer **119,79 kB**.
  Nur die bekannte transitive Pixi-CommonJS-Warnung bleibt. Capacitor-Sync, Android-Debug und
  unsignierter iOS-Simulator-Build einschließlich finalem Tabletfix erfolgreich.
  **232 Webdateien / 49.017.347 Bytes bytegleich** in Android-/iOS-Quellassets, APK, iOS-App
  und Simulator-ZIP, ausschließlich zwei erwartete Cordova-Zusatzdateien. Enthalten sind
  154 Kunstdateien. APK **62.654.791 Bytes**, Simulator-ZIP **63.544.732 Bytes**.
  Hashes und vollständige Prüfung: `.local/native-character-campaign-proof-2026-10-05.json`;
  Logs `.local/native-character-campaign-{web,android,ios}-2026-10-05.log`.

Die Pakete bleiben lokale Tests mit `nativeApiOrigin: null`, Version 0.2.0 / Build 2. Die
Browserprüfung ist keine native Geräteabnahme. Weder ein signiertes Geräte-IPA noch Store-Käufe,
Produktionshosting oder eine öffentliche Veröffentlichung wurden in diesem Schritt eingerichtet.

## 2026-10-05 · Free-Bosskampagne bis Level 50

- **Produktregel:** Die fünf normalen Bosse von Level 10 bis einschließlich Wolkenkönig auf
  Level 50 sind kostenlos. Bosse ab Level 60 und alle höheren Modi benötigen Plus: insgesamt
  fünf kostenlose und 35 Plus-Begegnungen. Keine zusätzliche Charakterlevel-, XP- oder Skillgrenze.
  Bestehende Siege und kosmetische Belohnungen bleiben auch nach Abo-Ende erhalten.
- **Durchsetzung:** Frontend und Java verwenden die Bossbasisstufe, nicht das empfohlene
  Charakterlevel. Deshalb bleibt der Wolkenkönig trotz Empfehlung Level 55 kostenlos.
  Neue nicht berechtigte Serverkämpfe antworten mit `403 PLUS_REQUIRED`. Live-Probekämpfe
  sperren auch Start, Einzelzug und Überspringen. Ein bereits serverseitig bestätigter Kampf
  kann nach Abo-Ende zu Ende angesehen werden. Akzeptierte Request-IDs bleiben idempotent.
  Nur der ausdrückliche lokale Billing-Preview-Modus lässt alle Begegnungen ohne Abo testen.
- **Anzeige:** Bossauswahl, Dashboard-Ausblick, Plus-Vergleich, FAQ, Nutzungsinformationen
  und Produktdokumentation verwenden dieselbe Grenze. Ohne Plus verspricht das Dashboard
  keinen sofort spielbaren Level-60-Boss. Verdiente Looks werden nicht erneut gesperrt.
- **Prüfung:** **1.046 Frontendtests in 73 Dateien**, **120 Backendtests** und drei lokale
  HTTP-/PostgreSQL-Smokes bestanden. Abgedeckt sind die Level-50-/60-Grenze, alle 35
  Plus-Begegnungen, gültige und abgelaufene Rechte, gefälschte Clientfelder, fremde Konten,
  unveränderte XP/Beute und bestätigte Wiederholungen. Live-Entitlements wurden mit
  kontrollierter Providerverifizierung in Spring/H2 geprüft; der echte lokale HTTP-Durchlauf
  verwendet weiterhin Preview. Dies ist kein Nachweis für einen echten Store-Kauf.
  Logs: `/tmp/everbloom-free50-full-tests.log`, `/tmp/everbloom-free50-ui-tests.log`.
- **Browser:** aktuelle Produktionsdateien in einem separaten lokalen QA-Tab geprüft.
  Vergleichstabelle bei 390 × 844 und 820 × 1180 lesbar, Dokumentbreite jeweils exakt
  390 bzw. 820 Pixel, keine Konsolenfehler. Testtab geschlossen und Ansichtsgröße zurückgesetzt.
  [Handyvergleich](screenshots/free-plus-boss-limit-phone-2026-10-05.png),
  [Tabletvergleich](screenshots/free-plus-boss-limit-tablet-2026-10-05.png).
- **Pakete:** Produktionsbuild erfolgreich, initial **406,46 kB**, geschätzter Transfer
  **119,82 kB**; nur die bekannte transitive Pixi-CommonJS-Warnung. Android-Debug und
  iOS-Simulator erneut erfolgreich gebaut. **232 Webdateien / 49.020.330 Bytes** bytegleich
  in beiden nativen Quellverzeichnissen, APK, Simulator-App und ZIP; 154 Kunstdateien enthalten.
  Neuer Nachweis `.local/native-free-boss-limit-proof-2026-10-05.json`, Logs
  `.local/native-free-boss-limit-{web,sync,android,ios}-2026-10-05.log`.

Die nativen Pakete bleiben lokale Vorschauen mit `nativeApiOrigin: null`. Keine öffentliche
Veröffentlichung, physische Geräteabnahme oder Store-Kaufprüfung ist damit behauptet.

## 2026-10-08 · Herovera-Name und erneute Releasevorbereitung

- **Namensentscheidung umgesetzt:** Herovera ist der vom Nutzer gewählte öffentliche Name.
  Sichtbare Oberfläche, Routen-/Dokumenttitel, Plus, Kontotexte, Exportdateinamen, SVG-Titel,
  E-Mail-Betreff sowie Android-/iOS-Anzeigename aktualisiert. Technische App-/Produkt-IDs,
  API-Header, Datenbank, Storagekeys und Repository-Pfad bleiben unverändert. Kein Reset oder
  Import bestehender Spielstände. Master Prompt und aktuelle Produktdokumentation abgeglichen;
  veraltete Aussagen zu angeblich fehlender Kauf-/Restore-Implementierung korrigiert.
- **Automatisierte Abnahme:** erneut **1.046 Frontendtests in 73 Dateien** und **120 Backendtests**
  ohne Fehler. Alle drei lokalen HTTP-/PostgreSQL-Smokes für Account-Lebenszyklus, persönliche
  Tagesquests und komplette Bosskampagne erfolgreich über den Produktionsbundle-Proxy geprüft.
  Nur eigene synthetische Smoke-Konten wurden angelegt und wieder entfernt. Bestehende
  Nutzer-/QA-Konten bleiben bestehen. Logs `.local/herovera-tests-2026-10-08.log`,
  `/tmp/herovera-backend-tests.log` und `/tmp/herovera-smoke-{beta,quests,bosses}.log`.
- **Konfliktfreier lokaler Start:** Auf Port 8080 läuft ein anderes Nutzerprojekt. Herovera
  verwendet für diesen Prüflauf Backend 8081 und Oberfläche 4203, beide nur Loopback. Der
  Vorschauhelfer akzeptiert validierte Portargumente; der Starter reicht Mavenargumente weiter.
  Ungültiger Port 65536 wird abgewiesen, Python-/Shellsyntax geprüft. Kein fremder Prozess
  beendet und keine globalen Laufzeit-/Projektkonfigurationen geändert.
- **Browserabnahme:** Herovera-Anmeldung bei 390 × 844, echtes Login mit bestehendem isoliertem
  QA-Konto, unveränderter Charakter auf Level 130 und vorhandener Look im Dashboard; anschließend
  Plus-Seite mit korrekten fünf Free-/35 Plus-Begegnungen geprüft. Keine Konsolenfehler.
  Dokumentbreite 390/390, keine horizontale Seitenverschiebung.
  [Anmeldung](screenshots/herovera-auth-phone-2026-10-08.png),
  [Dashboard](screenshots/herovera-dashboard-phone-2026-10-08.png).
- **Native Pakete:** Produktionsbuild und Capacitor-Sync erfolgreich; Android-Debug und
  unsignierter iOS-Simulatorbuild erfolgreich. Herovera direkt im tatsächlichen APK, in der
  iOS-App und beiden gebündelten Capacitor-Konfigurationen nachgewiesen. App-ID bleibt
  `com.everbloom.app`. Alle **232 Webdateien / 49.020.346 Bytes** sind bytegleich in dist,
  beiden nativen Quellbundles sowie APK und Simulator-App.
  Nachweis: `.local/native-herovera-brand-proof-2026-10-08.json`; Logs
  `.local/herovera-{web,sync,android,ios}-2026-10-08.log`.

Die Namensentscheidung bestätigt keine Marken-/Domainregistrierung. Betriebssitz und Rechtsform
sind noch nicht beantwortet; rechtliche Betreibertexte wurden nicht mit erfundenen Angaben gefüllt.
Öffentliches HTTPS/SMTP, echte Store-/RevenueCat-Einrichtung, Signing und physische Geräteabnahme
bleiben offen. Die nativen Builds enthalten weiterhin keine öffentliche API-Origin.

### Lokale Betriebsprüfung am selben Tag

- Vorhandene OrbStack-Runtime gestartet; Docker/Compose ist verfügbar. Beide produktiven
  Dockerfiles erfolgreich lokal gebaut: `herovera-backend:local-readiness` und
  `herovera-web:local-readiness`. Keine Images veröffentlicht.
- **Sechs Backup-/Restore-Integrationstests** mit tatsächlichen Betriebsskripten, PostgreSQL 17
  und Migrationen V1–V5 bestanden. Nur synthetische Daten in einem isolierten Container verwendet;
  keine Hostports geöffnet und keine vorhandene Datenbank angefasst. Wiederhergestellte Konten,
  Aktivitäten, Boss-/Billingdaten stimmen; Sessions/Tokens nur in der neuen Kopie ungültig gemacht.
  Bestehende Ziel-Datenbanken und vorhandene Sicherungen bleiben auch bei Fehlern geschützt.
- **Fünf Webserver-Integrationstests** mit dem gebauten Webimage und einer isolierten API-Testantwort
  bestanden: SPA-Direktlinks, echte API-401/404 statt HTML-Fallback, fehlende Assets, Accountheader,
  Schutz vor gefälschten Proxy-IPs, CSP und Cacheverhalten. Dabei wurde eine reale Caddy-Regelreihenfolge
  korrigiert: Gehashte JavaScript-/CSS-Bundles bekommen jetzt die vorgesehene lange, unveränderliche
  Cachefreigabe. Bilder bleiben eine Stunde cachebar; API und Laufzeitkonfiguration bleiben `no-store`.
- Nachweise und Wiederholungsbefehle stehen in [BETA_OPERATIONS.md](BETA_OPERATIONS.md).
  Tests: `deploy/tests/backup_restore.py`, `deploy/tests/web_routing.py`; finaler Webserverlauf
  `/tmp/herovera-web-routing-test.log`. Vorherige Fehler des HTTP-Prüfclients wurden durch die
  curl-Probe im vorhandenen Backendimage behoben; nur der abschließende Lauf gilt als Nachweis.

Der Dateicheck bleibt korrekt bei `NOT_READY`: **27 fehlende Konfigurationspunkte und sieben
externe Abnahmen**. Lokale Containerprüfungen ersetzen keinen öffentlichen HTTPS-/SMTP-Betrieb,
keine Sicherung außerhalb des Servers und keinen Store-Kauf.

### 2026-10-08 · Betreiberangaben und Gründungsvorbereitung

- Nutzer bestätigt Adderlyn Windsor und Österreich; erste eigene App, bislang laut eigener
  Angabe keine Anmeldung als Selbstständiger oder Unternehmer. Keine Gesellschaft oder
  Gewerbeberechtigung daraus abgeleitet und keine Anmeldung vorgenommen.
- Lokale Datenschutz-, Nutzungs- und Supportseite nennen den bestätigten Namen und das Land.
  Anschrift, Kontakt und abschließende Rechtstexte bleiben ausdrücklich offen. Masterprompt
  und Release-Vertrag enthalten den aktuellen Stand und die nächsten Klärungen in Österreich.
- Produktions-Webbuild erfolgreich; bestätigter Betreiber in allen drei gebauten Seiten-Bundles
  enthalten. `git diff --check` ohne Fehler. Weiterhin bekannte Pixi/CommonJS-Warnung.
- Release-Vorprüfung bleibt bei 27 fehlenden Konfigurationspunkten und sieben externen Abnahmen.
  Kein neuer nativer Build oder neuer Gesamt-Testlauf für diese Textänderung. Die zuvor
  erstellten APK-/Simulator-Pakete enthalten die neuen Betreibertexte noch nicht; ihre
  frühere Byte-Gleichheit gilt nicht für diesen neu erzeugten Webbuild.

### 2026-10-08 · Öffentlicher Löschweg und Store-Vorbereitung

- Neue ohne Anmeldung erreichbare Route `/delete-account`, aus Anmeldung, Datenschutz und Hilfe
  verlinkt. Sie erklärt Browserzugang ohne Neuinstallation, Datenumfang, separate RevenueCat-
  Verarbeitung und Aboverwaltung. Die eigentliche Löschung bleibt hinter Login, Passwort und
  ausdrücklicher Bestätigung. Kein Konto wurde bei dieser UI-Prüfung gelöscht.
- Anmeldung beschreibt die kostenlose Basis und optionales Plus statt pauschal „kein Abo“ zu
  versprechen; Datenschutz und Nutzungsinformationen sind direkt erreichbar. Passwortfeld und
  Sichtbarkeitsbutton haben nun getrennte zugängliche Beschriftungen.
- **24 fokussierte Tests in vier Dateien bestanden**: öffentlicher Einstieg, Route/Login-Rückkehr,
  bestehende Auth- und Guard-Flows, App-Routing und Passwortbeschriftung. Produktions-Webbuild
  erfolgreich. Bekannter Pixi/CommonJS-Hinweis unverändert. Logs:
  `/tmp/herovera-deletion-tests-2026-10-08.log`, `/tmp/herovera-release-prep-web-2026-10-08.log`.
- Browser auf isolierter Origin `release-qa.localhost:4203`: anonymer Einstieg → Anmeldung mit
  bestehendem synthetischem Testkonto → `/account` → Löschbereich geprüft → abgemeldet.
  Löschbutton ohne Passwort/Bestätigung deaktiviert. Keine Browser-Konsolenfehler. Sichtprüfung
  für Smartphone/Tablet, gemessene CSS-Breiten 355, 390 und 853 px ohne horizontales Überlaufen.
  Temporäre Größenänderung zurückgesetzt und eigener Testtab geschlossen.
- Screenshots: `screenshots/herovera-delete-account-phone-2026-10-08.png` und
  `screenshots/herovera-delete-account-tablet-2026-10-08.png`. Browserprüfung ist keine physische
  Geräteprüfung und keine öffentliche Erreichbarkeit.
- `STORE_LISTING_DE.md` enthält deutsche Apple-/Google-Metadaten, überprüfte Feldlängen,
  sechs Screenshot-Motive und Review-Anleitung. Aktuelle Funktionen beschrieben; keine
  Veröffentlichung, keine erfundenen URLs/Zugänge und kein fertiger nativer Screenshot-Satz.
- Release-Vorprüfung weiterhin `NOT_READY` mit 27 Konfigurationspunkten und sieben externen
  Abnahmen. Gründungsklärung, Domain/HTTPS/SMTP, vollständige Betreiberangaben, echte Store-Käufe
  und signierte Geräteabnahme bleiben offen.

### Android-Release-Vorbereitung zum selben Stand

- Optionale Uploadschlüssel-Konfiguration über vier `HEROVERA_ANDROID_*`-Umgebungsvariablen;
  `scripts/native-release-android.sh` bereitet den wiederholbaren AAB-Build vor. Kein Schlüssel
  erstellt, keine tatsächliche Release-Signierung und kein Upload vorgenommen.
- **Elf Negativfälle bestanden**, darunter fehlende Angaben bei vollständigem und direktem
  Release-Paketaufruf, ungeeignete Keystore-Pfade, ungültiger Keystore, Debug-Alias,
  Signing-Overrides und unsicherer API-Origin. Nachweis:
  `.local/android-release-signing-checks-2026-10-08.json`.
- Aktuellen Produktions-Webstand nach Android kopiert; Debug-Build ohne Release-Variablen
  erfolgreich (245 Tasks). **Alle 233 Webdateien bytegleich im Debug-APK**. App-ID
  `com.everbloom.app`, Anzeigename Herovera und Version 0.2.0 / Build 2 beibehalten.
- Dieser Schritt aktualisiert nur Android. Der vorherige iOS-Simulator-Build enthält die
  zuletzt ergänzten Betreiber-/Löschtexte noch nicht. Öffentliche API-Origin weiterhin nicht
  eingerichtet; keine neue Aussage zu nativen Account-Flows oder physischen Geräten.

### 2026-10-08 · Hostingvorbereitung mit bestehendem ALL-INKL PrivatPlus

- Bestehenden Tarif anhand offizieller Leistungsdaten eingeordnet. Empfehlung/Kosten für
  ALL-INKL-Domain und Supportpostfach, Hetzner CAX11 in Deutschland samt Sicherungen und
  Brevo Free im Betriebsleitfaden festgehalten. Verfügbarkeit, finale Preise und Budgetfreigabe
  offen. Keine Anbieteranmeldung, Bestellung, DNS-Änderung oder E-Mail-Übermittlung vorgenommen.
- `prepare-hetzner.py`: lokale Cloud-init-/Firewallvorbereitung nur mit validiertem öffentlichem
  SSH-Schlüssel und einzelnen öffentlichen Admin-Adressen. **Sieben Regressionstests bestanden**;
  Testkonfiguration zusätzlich mit Cloud-init 26.1 in Ubuntu 24.04 schemavalidiert.
  Kein Bootstrap ausgeführt, kein echter Server bereitgestellt.
- `package-release.py`: explizite Quellauswahl, Überschreibschutz, Dateirechte `0600` und
  Manifest mit SHA-256 je Datei. **Sieben Regressionstests bestanden**; private Laufzeitdateien,
  native Ordner und nicht benötigte Originalgrafiken ausgeschlossen. Keine pauschale Aussage,
  dass beliebig künftig hinzugefügter Quelltext keine Geheimnisse enthalten kann.
- Lokales Paket `.local/herovera-deployment-2026-10-08.tar.gz`: 427 Dateien, 47.850.571 Bytes,
  SHA-256 `b1e59b9dc0762595f17fd1a83cd0bc2c499b490711fcb0e5a2c269d93ea40aa0`.
  Manifest vollständig gegen Archivbytes geprüft. Beide Dockerfiles **aus genau diesem
  entpackten Paket** für Linux/ARM64 erfolgreich gebaut; bestehende Docker-Buildcaches verwendet.
  Tags `herovera-web:archive-20261008` und `herovera-backend:archive-20261008`.
  Logs: `/tmp/herovera-archive-web-build.log`, `/tmp/herovera-archive-backend-build.log`.
- Erneute Release-Vorprüfung: **NOT_READY, 27 Konfigurationspunkte und sieben externe Abnahmen**.
  Kein öffentlicher HTTPS-/SMTP-Nachweis, kein externes Backup und kein Store-Release entstanden.
