# Product Requirements · V0.5 · Mobile Beta

Standabgleich: 5. Oktober 2026. Implementierungsstand ist von den datierten Nachweisen in
[VALIDATION.md](VALIDATION.md) und den offenen Release-Gates in [BETA_RELEASE.md](BETA_RELEASE.md) getrennt.

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

## Verbindliche Produktanforderung: Account vor Charakter

Die Produktfassung erlaubt Charaktererstellung nur nach Registrierung oder Anmeldung mit gültiger
Session: **Account → Charaktererstellung → Interessen-/Fokus-Onboarding → Dashboard**. Accounts ohne
Charakter starten nach dem Login im Creator. Charakter, Fortschritt und Belohnungen gehören zum
angemeldeten Account. Ein Logout oder Accountwechsel darf keine Daten des vorherigen Accounts zeigen,
übernehmen oder durch spätere Antworten erneut einspielen.

Seit 4. Oktober 2026 ist der Kontofluss in der lokalen Beta implementiert: Registrierung,
E-Mail-Bestätigung, Login, Passwort-Wiederherstellung, Logout, Export und Kontolöschung. Spring Boot
speichert Account und Spielstand in PostgreSQL. Der Server bestimmt Besitzer, Belohnungen und
Perioden; Frontend-Routenschutz ergänzt diese Grenze. Neue Konten starten auf Level 1 mit 0 XP.

`/auth` ist der reguläre Einstieg. `/demo` enthält nur eine isolierte öffentliche Vorschau ohne
Account-Spielstand. Ältere lokale Journale werden nicht importiert. iOS-/Android-Projekte sind mit
Capacitor angelegt; Debug-APK und iOS-Simulator-App wurden gebaut, installiert und gestartet.
Signierte Geräte-Builds, native Account-Abnahme, produktive E-Mail-Zustellung und Hosting bleiben
offene Freigabeschritte; Details und Nachweise stehen in `BETA_RELEASE.md` und `NATIVE_BETA.md`.

## M0 – Foundation

- [x] Source of Truth: GDD, PRD, Architektur, Domain Model und Lernpfad.
- [x] Angular SPA mit TypeScript strict, Standalone Components, Signals, Router und SCSS.
- [x] Domainregeln ohne Angular, austauschbarer Datenadapter, Signal-State, schlanke View.
- [x] Mobile-first Dashboard und Design-Tokens, einfache Tastaturbedienung.
- [x] Produktionsbuild und relevante automatisierte Tests.

## M1a – Erster vertikaler Slice

- [x] Charakter mit illustriertem Portrait, Name/Titel, Level und XP bis zum nächsten Level.
- [x] Momentum, lokale Wochenübersicht, sechs Stats, Daily Quests, Fokus-Skills aus dem 14er-Katalog, Weekly Boss.
- [x] Aktivität auswählen und Minuten eintragen; synchroner sichtbarer Fortschritt aller Systeme.
- [x] Eingabevalidierung, abgeschlossene Quest, Levelwechsel, Boss-Sieg und Statusmeldung.
- [x] Ursprünglicher lokaler Prototyp mit Beispielstart, Aktivitätsjournal und bestätigtem Reset
      als isolierter Testadapter erhalten. Die aktive App speichert serverseitig im Account.

## M1a-Ausbau – illustrierter Creator und Erfolgsmomente

Implementierungsumfang des aktuellen Ausbaus; abgeschlossene Prüfungen und offene visuelle Grenzen
stehen in [VALIDATION.md](VALIDATION.md). Die folgenden Punkte sind keine neue Geräte-/Testabnahme:

- Ausschließlich illustrierte Figuren in Creator und Dashboard; der frühere Vektor-Editor ist aus
  der UI entfernt. Zwölf Startdesigns, je sechs männliche/weibliche Vorlagen mit eigener Frisur
  und vollständigem Outfitset, detailliert im [Art Guide](ART_DIRECTION.md).
- Die vier Original-PNGs und ihre separaten Hintergrundmasken bleiben als Referenz archiviert. Der laufende Ausbau nutzt für alle zwölf Vorlagen
  denselben Layerpfad mit zwölf neuen transparenten Körperbildern und vollständigen gemalten Köpfen je Frisurenvariante; keine Stilumschaltung bei Anpassungen. Diese Teile sind keine pixelidentische
  Zerlegung der Originale. Kragen-/Kombinationsabnahme bleibt offen.
- Name, Darstellung, Vorlage, unabhängig gewählte Frisur und Kleidung, Haut-/Augen-/Haarfarbe
  (je „Original“ plus sechs Farben), Starter-Aura und Bewegung mit direkter Vorschau. Zwölf
  Figuren-Rigs liefern jeweils vollständige Köpfe; zwölf unabhängige Outfit-Rigs liefern die Körper.
- Darstellung und Hauttöne sind unsexualisiert und rein visuell, ohne Stats, demografische
  Ableitung oder fachliche Stilsperren. Modulzuordnungen und Paletten werden validiert.
- Outfitsets sind vollständig bekleidet; Waffen und befestigte Accessoires gehören derzeit zum
  Set. Zehn verdienbare epische Sets und zehn Boss-Frisuren ergänzen die Starter. Einzelne
  Ausrüstungsslots, allgemeines Iteminventar und Waffenwechsel folgen später.
- Haar-/Outfit-Loot folgt der aktuellen männlichen/weiblichen Darstellung mit passenden
  Sammlungsbildern und Modulen. Besitz bleibt die Belohnungsfamilie; Darstellungswechsel
  braucht keinen zweiten Drop. Auren und Fortschritt bleiben gleich.
- Validiertes accountgebundenes Charakterprofil mit serverseitiger Besitzprüfung. Name/Aussehen
  bleiben fachlich vom Fortschritt getrennt. Das lokale Schema 2 und sein Legacy-Migrationspfad
  gehören nur zum Testadapter; ein Verbindungsfehler erzeugt keinen lokalen Account-Ersatz.
- Nur Waldlicht und „Keine“ sind Starter. Rosenlicht (Level 5), Schattenflamme (Level 10),
  Nordlicht (Level 20), Sternenkranz (Level 40) und Moosseele (Aktivitäts-Wochenboss-Sieg)
  werden einmalig aus belohnten Aktivitäten verdient, gespeichert und nach Besitzprüfung angelegt.
  Bereits gültiger alter Besitz von Rosenlicht/Schattenflamme bleibt erhalten.
- Zwanzig weitere Auren sind einmalige epische/ultimate Bossbelohnungen. Alle 26 Designs
  verwenden eigene gemalte Bilder in Portrait und Pixi-Kampf. Farben sind fest gestaltet;
  das freie Aura-Labor samt Farb- und Schattenblickreglern ist entfernt. Weitere Farbvarianten
  benötigen eigene Freischaltungen. Eigene Mimik/Iris-VFX und Produktions-VFX sind weitere Arbeit.

- Gebündelte Erfolgskarte und kleines Feuerwerk bei Charakter-/Skill-Levelaufstieg, erstem
  belohntem Tageseintrag, allen abgeschlossenen Daily Quests, Boss-Sieg und Aura-Grant.
  Eigene kurze Web-Audio-Motive unterscheiden Quest, Level, Boss-Sieg und Loot; das priorisierte
  Ereignis bestimmt den Klang.
- Separate gespeicherte Schalter für Ton, Feuerwerk und Bewegung; Originale atmen geschlossen,
  modulare Körper/Köpfe gekoppelt. Reduzierte Bewegung hält Avatar und Aura statisch.

Server-Fortschrittspersistenz ist Bestandteil der aktuellen Beta; eine native Store-Abnahme fehlt.
**Aktivitäts-Balance V0.2 bleibt unverändert**. Neue Accounts starten mit 0 XP; fortgeschrittene
Startwerte gehören ausschließlich zu isolierten Demo-/Testdaten.

## Animation und Bosskampagne

- [x] Seitliche Kampfbühne unter `/battle` mit eigener Figur, zehn illustrierten Bossen,
      automatisch abgespieltem Zugverlauf, drei Taktiken und sichtbaren HP-/Ergebniswerten.
- [x] Accountgebundene Kampagne: zehn aufeinander folgende Bossbegegnungen ab Level 10/20/30/40/50/60/70/80/90/100,
      vier Modi, servergeprüfte Freigaben und 40 genau einmalige kosmetische Erstbelohnungen.
      Keine Kampf-XP. Wiederholung und Probekampf vergeben keine zusätzliche Beute.
- [x] Reine deterministische Kampflogik nutzt Charakter-/Skillfortschritt; wiederholbare Übung
      verändert weder Fortschrittsjournal noch XP, Quests, Wochenboss oder kosmetischen Besitz.
- [x] PixiJS als gesondert geladene Darstellung, gemeinsamer Actor-/Aktionsvertrag für Held und Boss.
      Illustrierte Figuren/Bosse, Skill-bezogene Angriffe und individuelle Bossmechaniken;
      noch keine fertige Skelettanimation.
- [x] Dokumentierter Produktionsvertrag in [ANIMATION_PIPELINE.md](ANIMATION_PIPELINE.md).
      Nutzer hat keine Spine-Lizenz: ausschließlich PixiJS, keine Spine-Runtime installiert.
- [ ] Abgenommene geriggte Referenzfiguren (ein männlicher und ein weiblicher Chibi), austauschbare
      Haar-/Outfitteile und ein Boss mit Idle, Angriff, Treffer, Sieg und Niederlage.
- [ ] Echte iOS-/Android-Abnahme von Animation, Speicherbedarf, Hintergrundwechsel und Touch-UI.
- [x] Serverautoritative Kampfergebnisse und transaktionale Erstbelohnungen mit idempotenten
      Requests. Der Aktivitäts-Wochenboss bleibt separat und behält seine 2-Schaden-pro-XP-Regel.
- [ ] Bewusste Versionierungs-/Migrationsstrategie für künftige Kampfbalance- und Katalogänderungen.

Abnahme dieses Slices: identischer Startzustand ergibt denselben Verlauf; Start/Pause/Neustart
oder Navigation erzeugen keine zusätzlichen Rewards. Nur ein autorisierter Kampfbefehl darf
Erstabschluss/Besitz verändern. HP bleiben begrenzt und Kämpfe enden. Ergebnis und
Verlauf sind auch ohne Animation lesbar. Bewegung aus, reduzierte Bewegung, Größenänderung,
Routenwechsel und Grafikfehler werden geprüft. Tatsächliche Prüfergebnisse stehen in VALIDATION;
diese Anforderungen belegen noch keine mobile Produktionsfreigabe.

## Aktueller Mobile-Ausbau

Umgesetzt: mobile App-Shell, gut erreichbare Creator-Fußleiste und Tablet-Layouts. Die verbindlichen
Qualitätsziele stehen unten; abgeschlossene Browser-/Geräteprüfungen stehen ausschließlich in
VALIDATION. Diese Arbeit macht das Spiel noch nicht zu einer abgenommenen nativen App.

## Produktüberarbeitung: hilfreicher Alltag, sichtbare Spieltiefe

Die professionelle Produktfassung verbindet den Chibi, einen klaren nächsten Schritt, verständliche
Wochenfortschritte und eigene Bossbegegnungen. Der Free-Kern muss bereits als zusammenhängendes Spiel
funktionieren. Eine Monatsmembership rechtfertigt sich durch regelmäßig gepflegte zusätzliche Inhalte
und Gestaltungsmöglichkeiten; eine bloße zusätzliche Sperre vor dem bestehenden Kern ist kein Mehrwert.
Das Preisziel bleibt **3,99 €/Monat**, der tatsächliche Kaufpreis wird lokalisiert vom Store geladen.
Der frühere 4,99-€-Kandidat ändert dieses Ziel nicht. Billing-Adapter und serverseitige Entitlements
sind implementiert. Der aktuelle V1-Vertrag umfasst fünf Normal-Bosse bis Basislevel 50 Free;
alle Modi der fünf Bosse ab Basislevel 60 und alle höheren Modi der ersten fünf ergeben
35 Plus-Begegnungen. Plus ergänzt +10 % ausschließlich auf Charakter-Aktivitäts-XP.
Die Grenze gilt auch für Probekämpfe; Skills, XP und Charakterlevel bleiben ohne Abo-Grenze.
Skill-XP, Questboni und direkter Kampfschaden erhalten keinen Zuschlag;
verdiente Cosmetics bleiben nach Abo-Ende ausrüstbar. `preview` ist weiterhin die ausdrückliche
lokale Testvorschau aller Modi ohne Kauf und Bonus; sie wird nicht als gekauftes Plus ausgegeben.
Echte Store-Verbindung, Käufe und Freigaben sind noch nicht abgenommen.
Details: [MONETIZATION.md](MONETIZATION.md), [RELEASE_V1.md](RELEASE_V1.md) und
[VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md).

Implementierte Produktiteration, getrennt von der Abnahme in VALIDATION:

- Bis zu drei freiwillige Vorschläge aus bekannten Fokus-Skills, in gewählter Reihenfolge und mit
  5–20 ganzen Minuten innerhalb des noch verfügbaren Tageslimits. Abgeschlossene Quests und Skills
  mit weniger als fünf belohnbaren Minuten werden nicht erneut vorgeschlagen.
- Erholung/Ruhetag priorisiert vorhandene Recovery-, Meditation- und Breathwork-Skills; Ruhetag
  schlägt höchstens fünf Minuten vor. Ein leerer Vorschlagsbereich oder ausgelassener Tag kostet nichts.
- Genaue Vorschau aus bestehenden Regeln: Aktivitäts-XP, wirklich erreichbarer Questbonus und
  Wochenboss-Schaden. Auswählen füllt das Formular voraus; keine automatische Buchung oder Belohnung.
- Persönliche Account-Tagesquests aus den gewählten Fokus-Skills: 1–3 Quests, bei mehr als drei
  Skills täglich deterministisch wechselnde Auswahl. Der Bonus wird beim Erstellen des Plans aus
  dem aktuellen Charakterlevel bestimmt: mindestens 40 XP, sonst 2 % der aktuellen Levelspanne,
  auf fünf XP gerundet. Level 1/10/20/50 ergibt 40/60/100/220 XP je Quest und höchstens
  120/180/300/660 Quest-XP bei drei Quests. Weniger ausgewählte Skills erzeugen keine fremden Pflichtaufgaben.
  Vor dem ersten Eintrag darf ein Fokuswechsel den unberührten Plan aktualisieren. Jede heutige
  Aktivität, auch ohne XP, oder begonnene/abgeschlossene Quest fixiert den Plan bis morgen.
  Ein Levelaufstieg erhöht gespeicherte Questboni nicht nachträglich.
  Minutenraten, Tageslimits und Wochenboss-Schaden bleiben unverändert; die isolierte Demo behält
  ihre drei Beispielquests. Quellen aus elf Apps und Spielen und weitere Prioritäten:
  [Wettbewerbsanalyse](COMPETITOR_RESEARCH.md).
- „Am Horizont“ im Account-Dashboard zeigt den aktuellen entdeckten, noch unbesiegten Storyboss
  auf Normal mit Mindest-/Empfehlungslevel, fehlenden Charakter-XP und seiner Erstabschluss-Kosmetik.
  Dazu kommt die nächste noch nicht erhaltene Level-Aura mit künftig erreichbarer Schwelle.
  Keine weiteren Bossidentitäten, doppelten Besitzversprechen, zusätzlichen XP oder Claims;
  die öffentliche Demo zeigt diese Karte nicht. Eigene Routinen, Fokustimer und Geschichten bleiben geplant.
- Wochenziele zeigen drei belohnte Tage, zwei Skill-Familien und einen Care-Tag anhand vorhandener
  Aktivitäten. Keine zusätzliche XP-Vergabe oder Claim-Schaltfläche. Die XP-Wochensumme heißt
  ausdrücklich „Aktivitäts-XP“ und erfindet keine fehlende Historie von Questboni.
- Balance, Offensiv und Ausdauer als freie, vor Beginn wählbare Kampftaktiken mit echten
  Angriffs-/Verteidigungsabwägungen. Ausdauer kann einen Angriff durch virtuelle HP-Erholung ersetzen.
  Wiederholung behält den eingefrorenen Verlauf; Umstellen verlangt neue Vorbereitung.

Abnahmekriterien: Fokuswechsel verliert keine Skills/XP; Vorschau und bestätigte Transaktion stimmen
bei unverändertem Startzustand überein; nur die Bestätigung schreibt. Datum und Wochenwechsel folgen
derselben Zivilkalenderperiode wie das Spiel. Wochenziele erklären ihre Bedingungen und bleiben
freiwillig. Taktiken verändern Kampfwerte; sie vergeben selbst keine XP oder Kaufrechte.
Ein autorisierter Kampagnensieg kann die feste Erstabschlussbelohnung auslösen. Mobile Lesbarkeit
und Darstellung müssen zusätzlich in der echten Oberfläche geprüft werden.

## M1b – Spielbares Solo-MVP

- [x] Freiwilliger Check-in: Ausgewogen, Fokus, Erholung oder Ruhetag; drei Energieangaben,
      freundliche Reaktionszeile und lokaler Tageswechsel. Auslassen bleibt ohne Strafe. Im
      Accountmodus nur während der Sitzung, im Testadapter lokal gespeichert; stets
      getrennt vom GameSnapshot, keine XP-/Quest-/Boss-/Momentum-Änderung. Kein umfassender
      Bedürfnisse-Simulator; Recovery-/Streak-Regeln sind dadurch noch nicht umgesetzt.
- [x] Dreistufiges Onboarding: sieben Interessenbereiche mit primärer Richtung, 1–6 Fokus-Skills
      aus 14 Skills und Zusammenfassung. Accountgebundenes Speichern über die Journey-API;
      `everbloom.journey.v1` bleibt nur im Testadapter. Überspringen und spätere Änderungen
      möglich, Creator-Rückkehr erhält den Sitzungsentwurf. Keine XP-/Bossänderung; ein unberührter
      Tagesquestplan wird an den Fokus angepasst, ein begonnener bleibt bis morgen bestehen.
- [x] Erweiterter Katalog mit 14 protokollierbaren Skills; ursprüngliche vier unverändert, zehn
      Ergänzungen mit 0 Start-XP. Alle Raten/Limits stehen im GDD.
- [ ] Früher Capacitor-Gerätetest des Kernflows, bevor die Zahl der Screens stark wächst.
- [x] Account-Löschung inklusive Spielstand und geschütztem Webweg unter `/account`.
- [ ] Öffentlichen HTTPS-Löschweg bereitstellen, finale Betreibertexte ergänzen; Texte für die neun
      späteren Zielsprachen auslagerbar halten und ein zentrales Locale-Modell vorbereiten.
- [ ] Weiterer Skillkatalog-Ausbau und minimale Subskills; die aktuelle Fokusauswahl ist vorhanden.
- [x] Serverseitige Tages-/Wochenperioden in `Europe/Vienna`, Tagesquest-/Montagsbosswechsel
      und nachvollziehbarer Aktivitätsverlauf. Keine rückwärts vergebenen Rewards. Frei wählbare
      Accountzeitzonen und Regeln für deren Wechsel bleiben offen.
- [x] Historischer Testadapter: versioniertes lokales Aktivitätsjournal mit Replay,
      10.000-Eintrags-/2-MiB-Grenze, sichtbaren Speicher-/Uhrproblemen und bestätigtem Reset.
      Kein Gastspielstand oder Importweg im Accountmodus.
- [x] Drei erste Aura-Belohnungen, Sammlung, Besitzprüfung beim Anlegen und einmaliges Erfolgsfeedback.
      Zehn weitere Auren sind einmalige Belohnungen der epischen und ultimativen Bosskämpfe;
      Vorschauen allein vergeben nichts. Noch kein allgemeines Iteminventar.
- [ ] Recovery/Rest/Cheat Days und frequenzabhängige Streaks.
- [x] Spring Boot REST mit PostgreSQL/Flyway: Registrierung, Argon2-Passworthash,
      persistente HttpOnly-Sessions, CSRF, E-Mail-Bestätigung, Passwort-Reset und Kontolöschung.
- [x] Geschützte Character-/Journey-/Game-API, Besitzerprüfung aus der Session.
- [x] Serverautoritative XP, transaktionale Idempotenz, Tageslimits, Quest-/Boss-Fortschritt.
- [x] Lade-/Fehlerzustände, Kontowechsel-Isolation und erwartete Account-ID pro Anfrage.
- [x] Ein ursprünglicher Aktivitätsbefehl wird vor dem POST accountgebunden lokal gesichert;
      bewusste Wiederholung nach Neustart verwendet dieselbe UUID, Skill und Minuten. Keine
      automatischen Retries. Neue Einträge bleiben bis zur Bestätigung gesperrt; defekte oder
      fehlende Gerätesicherung wird sichtbar. Duplikate vergeben keine zweite Belohnung.
- [x] Native iOS-/Android-Projekte und HTTPS-Transport mit nativer Cookie-Verwaltung.
- [x] Android-Debug-APK und iOS-Simulator-App 0.2.0 / Build 2 lokal gebaut, installiert, gestartet.
- [ ] Signierte Geräte-Builds und Abnahme mit TestFlight/Google Play-Testern.
- [ ] Produktivhosting, Domain, SMTP, veröffentlichungsreife Datenschutz-/Betreiberangaben.

Das MVP ist **M1a + M1b**. Der Full-Stack-Kern ist lokal implementiert; die Freigabe als mobile Beta
hängt zusätzlich von den ausdrücklich offenen nativen und betrieblichen Abnahmen ab.

## Abnahme des ersten Slice

1. `/` leitet nach `/auth`; geschützte Routen prüfen die Session. Unbekannte Pfade führen über den Dashboard-Guard zum passenden Einstieg.
2. Bei 360 px Breite passen Karten und Formular ohne horizontales Scrollen; größere Ansichten
   nutzen mehrere Spalten. Texte und native Controls bleiben lesbar und fokussierbar.
3. Ein Eintrag von 10 Minuten Meditation gibt 30 Skill-/Charakter-XP und 60 Boss-Schaden.
   Ist eine auf Level 1 erzeugte persönliche Meditationsquest offen, kommen einmalig 40 Charakter-XP
   dazu (insgesamt 70). Höhere Pläne verwenden ihren gespeicherten levelabhängigen Questbonus.
   Die historische Beispielquest behält ihren Bonus von 30 XP; ohne passende offene Quest kein Bonus.
4. Derselbe Request kann nicht doppelt belohnt werden; weitere Einträge können keinen Questbonus wiederholen.
5. Ungültige Dauer, unbekannter Skill und bereits ausgeschöpftes Tageslimit erzeugen keine falschen XP.
6. Mehrere Level-Ups und ein besiegter Boss werden korrekt dargestellt; Balken bleiben zwischen 0 und 100 %.
7. Reload lädt akzeptierte Aktivitäten, XP, Quests, Boss und verdiente Auren aus dem Account,
   ohne Erfolge erneut abzuspielen. Ein Prototyp-Reset ist im aktiven Accountmodus nicht verfügbar;
   die historische Journal-/Reset-Abnahme steht getrennt unten.
8. Tests prüfen fachliche Grenzfälle und die Verbindung von Formular, Store und Dashboard.
9. Minutenbalance V0.2: Eine vollständig belohnte Calisthenics-Aktivität von 60 / 90 Minuten gibt
   240 / 360 Skill-XP und mit einer offenen, auf Level 1 erzeugten persönlichen Tagesquest
   280 / 400 Charakter-XP. Auf höheren Levels gilt 240 / 360 plus gespeicherter Questbonus.
   Bestehende Beispielpläne mit 50-XP-Bonus bleiben bei 290 / 410 Charakter-XP. Fast volle Balken
   dürfen weiterhin aufsteigen. Das Tageslimit von 90 Minuten gilt auch bei mehreren Einträgen.
   Neue Accounts beginnen bei Level 1. Die vorläufigen Kurven und weitere Levelbeispiele stehen im
   [Game Design](GAME_DESIGN.md#progression--regeln-der-demo).
10. Ein erster Fokus auf Swimming, Reading und Music auf Level 1 ergibt genau diese drei Tagesquests mit
    15 / 15 / 10 Minuten und je 40 Bonus-XP. Swimming 15 ergibt 45 Aktivitäts-XP, 40 Quest-XP
    und 90 Wochenboss-Schaden. Wiederholen desselben Eintrags oder ein anschließender Fokuswechsel
    erzeugt keine zweite Belohnung. Am nächsten Server-Spieltag gilt die neue Fokusauswahl.
11. Ein neu erstellter persönlicher Plan auf Level 10/20/50 speichert 60/100/220 Bonus-XP pro Quest.
    Ein Levelaufstieg während des Tages ändert bestehende Boni nicht. Alte persönliche Pläne und
    klassische Beispielquests behalten ihre gespeicherten Werte; Minutenraten und Skill-XP bleiben gleich.
12. Der Horizont zeigt nur die aktuelle bekannte Begegnung und eine künftige Level-Aura. Hohe Level
    allein verraten keine späteren Bosse. Der Wolkenkönig bleibt ab Level 50 zugänglich, mit Empfehlung 55;
    ein erfülltes Mindestlevel wird nicht als garantierter Sieg bezeichnet. Die Vorschau verändert nichts.

## Abnahme von Creator, Onboarding und Erfolgsfeedback

Diese Kriterien beschreiben die nötige Prüfung des aktuellen Ausbaus. Ergebnisse werden erst nach
Durchführung in VALIDATION eingetragen, insbesondere visuelle Kombinationen und Geräteverhalten.

1. Profiländerungen aktualisieren das Dashboard ohne XP-, Skill-, Quest-, Boss- oder Momentumänderung.
   Abbrechen speichert keine Vorschau. Name, Module und Paletten werden an Domain-/Adapter-Grenzen validiert.
2. Zwölf Vorlagen sind vorhanden, sechs je Darstellung. Frisur und vollständiges Outfitset lassen
   sich unabhängig innerhalb der passenden Darstellung wählen. Wechsel hinterlässt keine ungültigen
   Module. Original plus sechs Optionen je Haut-, Augen- und Haarpalette wirken auf die richtige Region.
3. Alle zwölf Vorlagen verwenden denselben Layerpfad. Frisurwahl ersetzt einen vollständigen Kopf
   einschließlich Gesicht und Augen, kein Mix mit dem alten Vorlagengesicht. Ohne eigene Augenfarbe
   gilt die gemalte Farbe des gewählten Kopfes; eine explizite Farbe bleibt erhalten.
4. Zwölf vollständige Kopfvarianten und zwölf Outfit-Rigs haben nutzbare Maße/Anker. Kurze/lange
   Haare und alle Outfits sind mit direktem Kiefer-/Kragenanschluss und vollständig bekleideten
   Händen zu prüfen. Gemalter Hals bleibt im Kragen verborgen; keine Basiskopf-/Stirn-Unterlage. Kein doppeltes Haar, kahler Bereich oder schwebender Kopf. Einzelne Slots
   dürfen nicht als verfügbar erscheinen, solange sie nur im vollständigen Outfitbild existieren.
5. Reload lädt das Profil und den Fortschritt des angemeldeten Accounts vom Server. Ein
   Netzwerkfehler zeigt den Fehler und öffnet keinen lokalen Ersatz. Nur im Testadapter werden
   Legacy-Profile nachvollziehbar normalisiert und lokale Speicherfehler als Sitzungsfallback erklärt.
6. Interessenwahl validiert mindestens einen der sieben Bereiche und eine darin enthaltene primäre
   Richtung. Fokuswahl akzeptiert 1–6 bekannte, eindeutige Skills aus 14. Speichern ändert nur Präferenzen;
   bestehende Skill-XP gehen weder bei Auswahlwechsel noch beim Ausblenden verloren.
7. Onboarding hat drei Schritte, klare Zurück-/Weiteraktionen und eine Zusammenfassung. Überspringen
   ändert keinen Fortschritt. Der Creator-Rückweg erhält den laufenden Entwurf; Interessen/Fokus
   werden unabhängig vom Charakterprofil accountgebunden gespeichert. Ein Fehler bleibt sichtbar.
8. Alle zwölf Vorlagen verwenden gekoppelte Körper-/Kopflayer; keine Umschaltung zwischen
   Original-Gesamtbild und anderem Stil bei der ersten Anpassung. SVG nutzt einfache Interessengesten,
   Pixi Atmung und Kampfreaktionen. Kragen und Silhouette sind pro Kombination sichtbar zu prüfen.
   Bewegung aus und reduzierte Bewegung halten Figuren/Auren statisch. Level-/Interesseninputs sind
   keine versteckten Rewards oder automatisch freigeschalteten Gesten/Outfits.
9. Ton, Feuerwerk und Bewegung sind unabhängig steuerbar. Ein akzeptierter Meilenstein löst Erfolge
   einmal gebündelt aus; einzelne Daily Quests, doppelte Requests, Profilspeicherung, Reload und Reset
   erzeugen keine zusätzliche Feier. Tonfehler verhindern keine XP-Vergabe.
10. Nur Waldlicht plus „Keine“ sind Starter. Rosenlicht (5), Schattenflamme (10), Nordlicht (20),
    Sternenkranz (40) und Moosseele (Aktivitäts-Wochenboss) entstehen einmalig beim passenden
    belohnten Übergang und bleiben über Reload/Perioden erhalten. Zwanzig Boss-Auren benötigen
    den serverbestätigten epischen/ultimativen Erst-Sieg. Profiländerung, bloß hohe Level,
    unbelohnte Tageslimit-Minuten, bereits besiegte Wochenbosse und Duplikate gewähren nichts.
    Altbesitz von `rose`/`void` bleibt erhalten. Freier Farbpicker und Aura-Labor sind entfernt.

11. Creator, Onboarding und Erfolgskarte sind bei 360 px Breite und den Tablet-Prüfgrößen bedienbar.
    Fokus, beschriftete Controls und Erfolgstext funktionieren ohne Ton/Animation. Avatar und Aura
    blockieren keine Bedienung; Safe Areas, Speicherleiste und offene Tastatur verdecken keine Aktion.
12. Mobile Download-/Textur-/Layer-/VFX-Budgets werden vor Produktionsfreigabe festgelegt und mit
    echten Geräten geprüft. Ein Web-Build oder vollständiger Assetkatalog erfüllt diese Abnahme nicht.

## Historische Abnahme des lokalen Testadapters

Diese Anforderungen gelten für den erhaltenen Testadapter, nicht als Account-Speichervertrag.
Die aktive App verwendet die serverseitige API und feste Beta-Zeitzone in `Europe/Vienna`.

- Reload rekonstruiert denselben Verlauf einschließlich mehrfacher Levelschwellen und einmaliger
  Auren. Veränderte XP-/HP-/Besitzfelder werden nicht als gültige Journal-Eingaben angenommen.
- Neue lokale Tage setzen Dailies und Tageslimits zurück; eine neue Montag–Sonntag-Woche setzt
  Boss-HP auf Maximum. Monat/Jahr, Schaltjahr und übersprungene Tage sind fachliche Grenzfälle.
- Defekter/gesperrter Speicher, Schreibfehler, fremde Version, zweite Tabs, Journalgrenze und
  zurückgestellte/ungültige Uhrzeit führen zu sichtbaren, passenden Zuständen. Abgelehnte Einträge
  verändern keinen Fortschritt. Gültige frühere Daten werden bei Fehlern nicht still überschrieben.
- Reset-Abbrechen verändert nichts. Bestätigen ersetzt den lokalen Verlauf und die verdienten
  Auren, behält das übrige Profil und Interessen. Ein fehlgeschlagener Schreib-Reset erhält den
  bisherigen Spielstand. Eine angelegte Belohnung ohne Besitz fällt auf „Keine“ zurück.
- Lokale Speicherung ist keine Cloud-Sicherung, serverseitige Wahrheit oder App-Store-Abnahme.
  Die bisherigen Beispielstartwerte und XP-Raten bleiben unverändert.

## Abnahme von Account und geschützter Charaktererstellung in M1b

- Nicht angemeldet: Aufruf des Creators führt zur Anmeldung. Ein direkter Character-Create-Request
  ohne gültige Session liefert 401 und erzeugt weder Charakter noch Fortschritt.
- Registrierung bzw. Login mit Account ohne Charakter führt in den Creator; nach erfolgreicher
  Erstellung folgt die Interessen-/Fokus-Einführung, danach das Dashboard. Ein vorhandener Charakter
  wird dem richtigen Account zugeordnet geladen, nicht bei jedem Login neu angelegt.
- Besitzer-ID wird serverseitig aus der geprüften Session bestimmt. Manipulierte Account-/Charakter-IDs
  verschaffen keinen Lese- oder Schreibzugriff auf Figuren, Aktivitäten, Fortschritt und Belohnungen
  anderer Accounts; Integrationstests prüfen diese Zugriffsgrenzen ausdrücklich.
- Logout/Accountwechsel entfernen private Ansichten und trennen Signals, Entwürfe, Caches sowie
  verspätete Antworten. Prototyp-Journale werden nicht ohne einen eigenen geklärten Übernahmepfad
  einem Account zugeordnet. Lokale Aura-Listen gelten nicht als serverbestätigter Besitz.
- Ein anderes Konto im geteilten Browser-Cookie darf keinen Befehl aus einem veralteten Fenster
  für dieses Konto ausführen: erwartete Account-ID prüfen, `ACCOUNT_CHANGED` zurückgeben und
  die tatsächlich gültige fremde Session erhalten. Resume mit gleichem Account erhält Entwürfe;
  ein unerwarteter Accountwechsel verlangt eine explizite Anmeldung.
- Unbestätigte Aktivitätsbefehle bleiben nach Reload/Neustart und Logout dem ursprünglichen
  Account zugeordnet und werden nur bewusst unverändert wiederholt. Erst Bestätigung entfernt
  die Reservierung. Bei bereits verbuchtem Eintrag bleibt der Tag erhalten; andernfalls gilt
  beim ersten erfolgreichen Speichern der aktuelle Servertag. Kein Offline- oder Rückdatierungsversprechen.
- Fehlende/abgelaufene Session und fehlgeschlagene Anmeldung erzeugen keinen scheinbaren Login.
  Die Frontend-Routenprüfung ersetzt die serverseitige Authentifizierung/Autorisierung nicht.

Diese Anforderungen beschreiben den implementierten lokalen Full-Stack-Beta-Vertrag. Der konkrete
Prüfstand steht in VALIDATION; native Geräte- und Live-Betriebsabnahmen bleiben offen. Der Auth-Slice nutzt E-Mail/Passwort mit eigener Session; ein
externer Identitätsprovider wurde nicht ausgewählt. Es gibt
keine lokale Fake-Anmeldung, keine gespeicherten Passwörter im Browser und keine produktive Gast-Charaktererstellung.

## Weitere Meilensteine

| Meilenstein | Ergebnis |
|---|---|
| M2 | Zehn serverautorisierte Bosse, 40 Erstbelohnungen und ausgerüstete gemalte Auren bereits vorgezogen; offen: geriggte Chibis/Bosse, Art-Produktionsreife, individuelle Ausrüstungsslots/Inventar, reichere Gesten/Mimik, Achievements, Titles, weitere Kapitel und Migration künftiger Balanceversionen |
| M3 | V1-Entitlements, +10 % Charakter-Aktivitäts-XP, nativer Billing-Adapter, Restore und serverseitige Prüfung implementiert; offen: reale Store-/RevenueCat-Konfiguration und Kauf-/Ablaufabnahmen. Preisziel 3,99 €/Monat, keine Verkaufsfreigabe. |
| M4 | Capacitor-Projekte und lokale native Builds bereits vorhanden; offen: native Account-/Geräteabnahme, signierte Store-Builds, neun UI-Zielsprachen sowie lokalisierte Listings/Medien und finale Privacy-Angaben |
| M5 | Vollständige Geräte-/Beta-Abnahme, produktiver Betrieb, Datenschutz-/Löschweg-Abnahme, Performance, Store-Freigabe, SEO-Website und ASO-Messung |
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
   Requests dürfen keine Doppelrewards erzeugen. Das lokale Journal implementiert keinen verlässlichen
   Offline-Sync; bis zu dessen eigener Umsetzung Offline-Grenzen ehrlich anzeigen.
8. Native Navigation, Lifecycle, Audio-Unterbrechungen sowie implementierte Kauf-/Restore-Adapter
   auf iOS und Android mit echten Geräten prüfen. Haptik bleibt geplant; vorhandener Billing-Code
   ist kein Nachweis realer Store-Käufe. Plattformadapter klein und konkret halten.

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
Apple-/Google-Entwicklerkonten sind laut Betreiber vorhanden; öffentlicher Betreibername,
Supportdomain, Hosting, SMTP, Signierung und Store-Abnahmen bleiben offen. **Herovera** ist eine
Namensempfehlung mit ausstehender Marken-/Domainprüfung; technische IDs sind unverändert.


## Bosskampagne: zehn Begegnungen und vier Modi

Aktueller Katalog vom 5. Oktober 2026, strikt nacheinander entdeckt:

| Basislevel | Boss | Rolle |
| --- | --- | --- |
| 10 | Mooswächter | Einstieg: Wurzelhiebe und Rindenschild |
| 20 | Glutwyrm | Angekündigte Aufladung und Feueratem |
| 30 | Dämmerungsbestie | Gepanzerter Schattenpanther: Runenschutz und zweifache Schattenraserei |
| 40 | Frosttitan | Zweifacher Gletscherpanzer und angekündigter Eisbrecher |
| 50 | Wolkenkönig | Anspruchsvolles Kapitel-1-Finale mit Stabkombo, Wolkenschild und Sonnenschlag |
| 60 | Blutmondregentin | Eigene Hochelfen-Gegnerin: Rubinklinge, Blutmondsiegel und angekündigte Mondfinsternis |
| 70 | Sternensouverän | Spätere Herausforderung mit Sternensiegel und Sternenbruch |
| 80 | Nharok, der Weltenverschlinger | Leerenleviathan: Gravitationssog dämpft zwei Treffer und kündigt den Ereignishorizont an |
| 90 | Vaelthar, der Urdrache | Kosmischer Drache: Mehrfachtreffer, Prismenaufladung und angekündigter kosmischer Atem |
| 100 | Aureon, König der Relikte | Reliktsalven, Königsaegis und angekündigter Reliktregen; zunehmender Rundendruck |

Hard beginnt bei **+5** (empfohlen +10), Episch bei **+15** (empfohlen +20), Ultimate bei
**+30** gegenüber dem Basislevel. Für den Wolkenkönig bleiben Mindestlevel **50 / 55 / 65 / 80**
und Empfehlungen **55 / 65 / 75 / 85** erhalten. Entwickelte Skills können Normal bereits auf
Level 50 ermöglichen; eine Levelgrenze ist keine Siegsgarantie. Nach dem Kapitel-1-Finale folgen
Blutmondregentin 60, Sternensouverän 70, Nharok 80, Vaelthar 90 und Aureon 100.
Aureons Mindestlevel sind **100 / 105 / 115 / 130**, Empfehlungen **100 / 110 / 120 / 130**.
Ab Runde 6 steigt sein Angriffsdruck um vier Prozentpunkte je Runde, höchstens 28 %;
der Reliktregen behält die bei seiner schadensfreien Aufladung angekündigte Stärke.
Die Blutmondregentin hat Mindestlevel **60 / 65 / 75 / 90** und Empfehlungen **60 / 70 / 80 / 90**.
Ihre Mondfinsternis heilt einen begrenzten Anteil des tatsächlich verursachten Schadens;
Runen-/Siegelaufbau und Treffer bleiben klar getrennt.

Vorbereitung und Ausführung bleiben unterscheidbar; Schilde reduzieren kommende Angriffe,
Heilrunden verbrauchen sie nicht. Fest bleibende Bosswerte lassen höhere Spielerlevel stärker
wirken. Neue Konten sehen nur den ersten Boss; ein bestätigter Sieg in einem beliebigen Modus
enthüllt den nächsten Gegner. Der Server prüft die Entdeckung; künftige Bossnamen und Beute
bleiben in der UI verborgen.

**Free umfasst die fünf Normal-Bosse auf Basislevel 10/20/30/40/50 einschließlich Wolkenkönig.**
Bosse auf Basislevel 60–100 erfordern in jedem Modus Plus; Hard/Episch/Ultimate der ersten
fünf Bosse ebenfalls. Damit bestehen **fünf Free- und 35 Plus-Begegnungen, 40 insgesamt**.
Skills, Aktivitäten, XP und Charakterlevel erhalten dadurch keine Abo-bedingte Obergrenze.
Im konfigurierten `live`-Modus gilt dieselbe Grenze auch für Probekämpfe; Wiedergabesteuerung
darf sie nicht umgehen. Der ausdrücklich lokale Billing-Modus `preview` ist eine gekennzeichnete
Testvorschau mit allen Modi, kein gekauftes Plus. Er vergibt keinen Kauf oder XP-Zuschlag.

**40 einmalige Erst-Sieg-Belohnungen** umfassen zehn Haar-Editionen, zehn
Outfitsets und zwanzig Auren. Jede Bossfamilie besitzt eine Grundform und drei eigenständig
illustrierte Steigerungen für Hard, Episch und Ultimate. Der Ausbau umfasst 30 höhere Formen
und fünf neue Grundformen (Dämmerungsbestie, Blutmondregentin, Nharok, Vaelthar, Aureon),
insgesamt **35 neue Bossbilder**. Hinzu kommen **20 neue Loot-Illustrationen** für diese fünf
Familien: je ein Haar-/Kronenbild, ein Outfitbild und zwei eigenständige, ausrüstbare Auren.
Sammlungsbilder sind keine automatisch neu geriggten Haar- oder Körpermodule.

Der Server entscheidet Kampf und Besitz; Vorschauen und Wiederholungen gewähren keine
zusätzliche Beute oder Charakter-XP. Verbindliche Regeln und Grenzen stehen in
[BOSS_ENCOUNTERS.md](BOSS_ENCOUNTERS.md). Die konkreten Bild- und Klangvorgaben stehen in
[VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md). Datierte ältere Abnahmen beschreiben
jeweils ihren damaligen Katalog; aktuelle Nachweise stehen in [VALIDATION.md](VALIDATION.md).
