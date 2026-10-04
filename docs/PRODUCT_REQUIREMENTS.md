# Product Requirements · V0.4

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

Der aktuelle lokale Prototyp besitzt kein Accountsystem. Seine direkte Creator-Route ist ausdrücklich
kein produktiver Gastmodus. Auth-Provider und Loginverfahren sind noch offen. Eine öffentliche reine
Look-Vorschau ohne gespeicherten Charakter ist höchstens eine spätere Option, kein zugesagtes Feature.

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
- [x] Eingabevalidierung, abgeschlossene Quest, Levelwechsel, Boss-Sieg, Statusmeldung, Demo-Reset.
- [x] Lokaler Prototyp mit Beispielstart; Aktivitätsjournal erhält neue Fortschritte beim Neuladen.

## M1a-Ausbau – illustrierter Creator und Erfolgsmomente

Implementierungsumfang des aktuellen Ausbaus; abgeschlossene Prüfungen und offene visuelle Grenzen
stehen in [VALIDATION.md](VALIDATION.md). Die folgenden Punkte sind keine neue Geräte-/Testabnahme:

- Ausschließlich illustrierte Figuren in Creator und Dashboard; der frühere Vektor-Editor ist aus
  der UI entfernt. Zwölf Startdesigns, je sechs männliche/weibliche Vorlagen mit eigener Frisur
  und vollständigem Outfitset, detailliert im [Art Guide](ART_DIRECTION.md).
- Die vier Original-PNGs bleiben ohne Modul-/Farb-Overrides unverändert sichtbar, mit separater
  Hintergrundmaske. Angepasste Figuren verwenden neu erstellte modulare Bildvarianten; diese
  dürfen nicht als pixelidentisch zum ursprünglichen Original bezeichnet werden.
- Name, Darstellung, Vorlage, unabhängig gewählte Frisur und Kleidung, Haut-/Augen-/Haarfarbe
  (je „Original“ plus sechs Farben), Starter-Aura und Bewegung mit direkter Vorschau. Zwölf
  Figuren-Rigs plus zwei Basiskopf-Rigs ermöglichen getrennte Körper-, Gesicht-/Kopf- und Haarlayer.
- Darstellung und Hauttöne sind unsexualisiert und rein visuell, ohne Stats, demografische
  Ableitung oder fachliche Stilsperren. Modulzuordnungen und Paletten werden validiert.
- Outfitsets sind vollständig bekleidet; Waffen und befestigte Accessoires gehören derzeit zum
  Set. Einzelne Ausrüstungsslots, Iteminventar, Waffenwechsel und Item-Loot folgen später.
- Validiertes lokales Charakterprofil im Schema 2 mit Legacy-Migrationspfad. Nur Name/Aussehen
  werden in diesem Profil gespeichert; der Fortschritt hat ein getrenntes Aktivitätsjournal. Ein
  bestätigter Reset erhält das übrige Profil und entfernt verdiente Auren. Fehlende Speicherung
  wird als Sitzungsfallback erklärt.
- Drei Starter-Effekte plus „Keine“ sind speicherbar. Nordlicht (Level 20), Sternenkranz (Level 40)
  und Moosseele (Mooswächter-Sieg) werden einmalig aus belohnten Aktivitäten verdient, lokal
  wiederhergestellt und nach Besitzprüfung im Creator angelegt.
- Zehn erweiterte Auraentwürfe mit sechs Vorschaufarben sind nur im Creator ausprobierbar und
  werden nicht gespeichert. Der bedrohliche Blick verändert derzeit den rückwärtigen Dämonenschatten,
  nicht die Avataraugen. Eigene Mimik/Iris-VFX und Produktions-VFX sind weitere Arbeit.
- Gebündelte Erfolgskarte, kleines Feuerwerk und eigener Vier-Ton-Jingle bei Charakter-/Skill-
  Levelaufstieg, erstem belohntem Tageseintrag, allen abgeschlossenen Daily Quests, Boss-Sieg und Aura-Grant.
- Separate gespeicherte Schalter für Ton, Feuerwerk und Bewegung; Originale atmen geschlossen,
  modulare Körper/Köpfe gekoppelt. Reduzierte Bewegung hält Avatar und Aura statisch.

Keine Server-Fortschrittspersistenz oder native Store-Abnahme. **Balance V0.2 bleibt unverändert**;
neue Skills erweitern den Katalog, ohne die ursprünglichen vier Raten/Startstände zu verändern.

## Animations- und Kampfübungs-Slice

- [x] Seitliche lokale Kampfübung unter `/battle` mit eigener Figur, vorläufigem Mooswächter,
      automatisch abgespieltem Zugverlauf und sichtbaren HP-/Ergebniswerten.
- [x] Reine deterministische Kampflogik nutzt Charakter-/Skillfortschritt; wiederholbare Übung
      verändert weder Fortschrittsjournal noch XP, Quests, Wochenboss oder kosmetischen Besitz.
- [x] PixiJS als gesondert geladene Darstellung, gemeinsamer Actor-/Aktionsvertrag für Held und Boss.
      Bestehende Illustrationen und einfacher Bossplatzhalter, noch keine fertige Skelettanimation.
- [x] Dokumentierter Produktionsvertrag in [ANIMATION_PIPELINE.md](ANIMATION_PIPELINE.md).
      Nutzer hat keine Spine-Lizenz: ausschließlich PixiJS, keine Spine-Runtime installiert.
- [ ] Abgenommene geriggte Referenzfiguren (ein männlicher und ein weiblicher Chibi), austauschbare
      Haar-/Outfitteile und ein Boss mit Idle, Angriff, Treffer, Sieg und Niederlage.
- [ ] Echte iOS-/Android-Abnahme von Animation, Speicherbedarf, Hintergrundwechsel und Touch-UI.
- [ ] Produktive Aktivität-zu-Begegnung-Regeln, serverautorisierte Ergebnisse und genau einmalige
      Rewards samt Balanceversion/Migration. Der bisherige Wochenboss bleibt bis dahin unverändert.

Abnahme dieses Slices: identischer Startzustand ergibt denselben Verlauf; Start/Pause/Neustart
oder Navigation erzeugen keine Spielmutation. HP bleiben begrenzt und Kämpfe enden. Ergebnis und
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
Das geplante Preisziel bleibt **3,99 €/Monat**. **4,99 €/Monat** ist ein zu validierender Kandidat,
kein neuer beschlossener Preis und kein bereitgestelltes Kaufangebot. Billing und Entitlements bleiben M3.

Aktueller Implementierungsumfang der nächsten Produktiteration, getrennt von der Abnahme in VALIDATION:

- Bis zu drei freiwillige Vorschläge aus bekannten Fokus-Skills, in gewählter Reihenfolge und mit
  5–20 ganzen Minuten innerhalb des noch verfügbaren Tageslimits. Abgeschlossene Quests und Skills
  mit weniger als fünf belohnbaren Minuten werden nicht erneut vorgeschlagen.
- Erholung/Ruhetag priorisiert vorhandene Recovery-, Meditation- und Breathwork-Skills; Ruhetag
  schlägt höchstens fünf Minuten vor. Ein leerer Vorschlagsbereich oder ausgelassener Tag kostet nichts.
- Genaue Vorschau aus bestehenden Regeln: Aktivitäts-XP, wirklich erreichbarer Questbonus und
  Wochenboss-Schaden. Auswählen füllt das Formular voraus; keine automatische Buchung oder Belohnung.
- Wochenziele zeigen drei belohnte Tage, zwei Skill-Familien und einen Care-Tag anhand vorhandener
  Aktivitäten. Keine zusätzliche XP-Vergabe oder Claim-Schaltfläche. Die XP-Wochensumme heißt
  ausdrücklich „Aktivitäts-XP“ und erfindet keine fehlende Historie von Questboni.
- Balance, Offensiv und Ausdauer als freie, vor Beginn wählbare Übungstaktiken mit echten
  Angriffs-/Verteidigungsabwägungen. Ausdauer kann einen Angriff durch virtuelle HP-Erholung ersetzen.
  Wiederholung behält den eingefrorenen Verlauf; Umstellen verlangt neue Vorbereitung.

Abnahmekriterien: Fokuswechsel verliert keine Skills/XP; Vorschau und bestätigte Transaktion stimmen
bei unverändertem Startzustand überein; nur die Bestätigung schreibt. Datum und Wochenwechsel folgen
derselben Zivilkalenderperiode wie das Spiel. Wochenziele erklären ihre Bedingungen und bleiben
freiwillig. Taktiken verändern ausschließlich Übungswerte, niemals lokale Fortschrittsdaten oder
Kaufrechte. Mobile Lesbarkeit und Darstellung müssen zusätzlich in der echten Oberfläche geprüft werden.

## M1b – Spielbares Solo-MVP

- [x] Freiwilliger Check-in: Ausgewogen, Fokus, Erholung oder Ruhetag; drei Energieangaben,
      freundliche Reaktionszeile und lokaler Tageswechsel. Auslassen bleibt ohne Strafe. Speicherung
      getrennt vom GameSnapshot, keine XP-/Quest-/Boss-/Momentum-Änderung. Kein umfassender
      Bedürfnisse-Simulator; Recovery-/Streak-Regeln sind dadurch noch nicht umgesetzt.
- [x] Dreistufiges Onboarding: sieben Interessenbereiche mit primärer Richtung, 1–6 Fokus-Skills
      aus 14 Skills und Zusammenfassung. Lokal im getrennten Schema `everbloom.journey.v1`;
      Überspringen und spätere Änderungen möglich, Creator-Rückkehr erhält den Sitzungsentwurf.
      Keine XP-/Quest-/Bossänderung; noch kein servergespeichertes Interessenprofil.
- [x] Erweiterter Katalog mit 14 protokollierbaren Skills; ursprüngliche vier unverändert, zehn
      Ergänzungen mit 0 Start-XP. Alle Raten/Limits stehen im GDD.
- [ ] Früher Capacitor-Gerätetest des Kernflows, bevor die Zahl der Screens stark wächst.
- [ ] Account-Löschmodell mit öffentlichem Webweg planen; Texte für die neun späteren Zielsprachen
      auslagerbar halten und ein zentrales Locale-Modell vorbereiten.
- [ ] Weiterer Skillkatalog-Ausbau und minimale Subskills; die aktuelle Fokusauswahl ist vorhanden.
- [x] Lokale Tages-/Wochenperioden anhand des Gerätedatums, Tagesquest-/Montagsbosswechsel und
      nachvollziehbarer Aktivitätsverlauf. Keine rückwärts vergebenen Rewards; servergeführte
      IANA-Zeitzone und Regeln für Zeitzonenwechsel bleiben offen.
- [x] Versioniertes lokales Aktivitätsjournal mit Replay, 10.000-Eintrags-/2-MiB-Grenze und sichtbaren
      Speicher-/Uhrproblemen. Reset nach Bestätigung; bisherige Daten bei Fehlern nicht still ersetzen.
- [x] Drei erste Aura-Belohnungen, Sammlung, Besitzprüfung beim Anlegen und einmaliges Erfolgsfeedback.
      Zehn weitere Auren bleiben ungespeicherte Vorschauen; kein allgemeines Iteminventar.
- [ ] Recovery/Rest/Cheat Days und frequenzabhängige Streaks.
- [~] Spring Boot REST-Grundlage mit PostgreSQL/Flyway und verpflichtendem Account: Registrierung,
      BCrypt-Passworthash, HttpOnly-Session, CSRF, Logout und `/me` sind vorhanden. Offen bleiben
      Character-Create-API, Creator-Routenschutz, serverseitige Besitzerprüfung für Spielstände,
      Account-Löschung und E-Mail-/Passwort-Wiederherstellung.
- [ ] Serverautoritative XP, Idempotenz, persistenter Quest- und Bossfortschritt.
- [ ] Lade-/Fehler-/Leerezustände für echte API-Anbindung und Integrationstests.

Das MVP ist **M1a + M1b**. Ein lokales Mock-Dashboard und der neue Auth-Slice sind noch kein fertiges
Full-Stack-MVP. Character-/Aktivitäts-API und serverautoritative Spielregeln bleiben der nächste
vertikale Backend-Schritt.

## Abnahme des ersten Slice

1. `/` leitet nach `/dashboard`; unbekannte Pfade führen ebenfalls dorthin.
2. Bei 360 px Breite passen Karten und Formular ohne horizontales Scrollen; größere Ansichten
   nutzen mehrere Spalten. Texte und native Controls bleiben lesbar und fokussierbar.
3. Ein Eintrag von 10 Minuten Meditation gibt 30 Skill-/Charakter-XP, 60 Boss-Schaden und erfüllt
   das entsprechende Tagesziel mit einmalig 30 zusätzlichen Charakter-XP.
4. Derselbe Request kann nicht doppelt belohnt werden; weitere Einträge können keinen Questbonus wiederholen.
5. Ungültige Dauer, unbekannter Skill und bereits ausgeschöpftes Tageslimit erzeugen keine falschen XP.
6. Mehrere Level-Ups und ein besiegter Boss werden korrekt dargestellt; Balken bleiben zwischen 0 und 100 %.
7. Reload stellt akzeptierte Aktivitäten, XP, Quests, Boss und verdiente Auren aus dem Journal her,
   ohne Erfolge erneut abzuspielen. Ein bestätigter Reset startet mit Beispielwerten für heute und
   entfernt Journal/verdiente Auren; Name, übriger Look und Interessen bleiben erhalten.
8. Tests prüfen fachliche Grenzfälle und die Verbindung von Formular, Store und Dashboard.
9. Balance V0.2: Eine vollständig belohnte Calisthenics-Aktivität von 60 / 90 Minuten gibt
   240 / 360 Skill-XP und bei Abschluss der Tagesquest 290 / 410 Charakter-XP. Das entspricht
   auf Charakter-Level 12 etwa 8,5 % / 12,1 % und auf Skill-Level 9 etwa 10,9 % / 16,4 % einer
   vollständigen Levelspanne. Fast volle Balken dürfen weiterhin aufsteigen. Das Tageslimit von
   90 Minuten gilt auch bei mehreren Einträgen. Demo-Level und sichtbare Attribute bleiben beim
   neuen Ausgangsstand erhalten. Die vorläufigen Kurven und weitere Levelbeispiele stehen im
   [Game Design](GAME_DESIGN.md#progression--regeln-der-demo).

## Abnahme von Creator, Onboarding und Erfolgsfeedback

Diese Kriterien beschreiben die nötige Prüfung des aktuellen Ausbaus. Ergebnisse werden erst nach
Durchführung in VALIDATION eingetragen, insbesondere visuelle Kombinationen und Geräteverhalten.

1. Profiländerungen aktualisieren das Dashboard ohne XP-, Skill-, Quest-, Boss- oder Momentumänderung.
   Abbrechen speichert keine Vorschau. Name, Module und Paletten werden an Domain-/Adapter-Grenzen validiert.
2. Zwölf Vorlagen sind vorhanden, sechs je Darstellung. Frisur und vollständiges Outfitset lassen
   sich unabhängig innerhalb der passenden Darstellung wählen. Wechsel hinterlässt keine ungültigen
   Module. Original plus sechs Optionen je Haut-, Augen- und Haarpalette wirken auf die richtige Region.
3. Die vier Originalansichten verwenden unveränderte PNGs, solange keine Modul-/Farbwerte gesetzt sind.
   Anpassungen verwenden den modularen Pfad. Vorlagenwechsel stellt dessen Standardwerte wieder her.
4. Zwölf Figuren- und zwei Basiskopf-Rigs haben nutzbare Maße/Anker. Kurze/lange Haare und alle Outfit-
   Silhouetten sind mit geschlossenem Hals-/Schulteranschluss, sichtbaren Händen und vollständiger
   Kleidung zu prüfen. Kein doppeltes Haar, kahler Bereich oder schwebender Kopf. Einzelne Slots
   dürfen nicht als verfügbar erscheinen, solange sie nur im vollständigen Outfitbild existieren.
5. Reload erhält ein gültiges Profil; kaputte/fremde Speicherdaten werden ignoriert. Legacy-Daten
   werden nachvollziehbar normalisiert, ohne demografische Ableitung. Blockierter Speicher erlaubt
   die laufende Sitzung mit sichtbarem Hinweis. Gültiger Fortschritt wird separat lokal wiederhergestellt.
6. Interessenwahl validiert mindestens einen der sieben Bereiche und eine darin enthaltene primäre
   Richtung. Fokuswahl akzeptiert 1–6 bekannte, eindeutige Skills aus 14. Speichern ändert nur Präferenzen;
   bestehende Skill-XP gehen weder bei Auswahlwechsel noch beim Ausblenden verloren.
7. Onboarding hat drei Schritte, klare Zurück-/Weiteraktionen und eine Zusammenfassung. Überspringen
   ändert keinen Fortschritt. Der Creator-Rückweg erhält den laufenden Entwurf; lokale Speicherung
   von Interessen/Fokus ist getrennt vom Charakterprofil und erklärt einen möglichen Sitzungsfallback.
8. Originale zeigen Gesamtatmung, modulare Körper-/Kopflayer eine gekoppelte ruhige Bewegung.
   Bewegung aus und reduzierte Bewegung halten Figuren/Auren statisch. Level-/Interesseninputs sind
   keine versteckten Rewards oder automatisch freigeschalteten Gesten/Outfits.
9. Ton, Feuerwerk und Bewegung sind unabhängig steuerbar. Ein akzeptierter Meilenstein löst Erfolge
   einmal gebündelt aus; einzelne Daily Quests, doppelte Requests, Profilspeicherung, Reload und Reset
   erzeugen keine zusätzliche Feier. Tonfehler verhindern keine XP-Vergabe.
10. Drei Starter-Effekte plus „Keine“ funktionieren weiterhin. Nordlicht, Sternenkranz und Moosseele
    entstehen einmalig beim passenden belohnten Übergang, bleiben über Reload/Perioden erhalten und
    sind nur mit Besitz anlegbar. Profiländerung, alte hohe Level, unbelohnte Tageslimit-Minuten,
    bereits besiegte Bosse und Duplicate-Requests gewähren nichts. Zehn erweiterte Entwürfe,
    Vorschaufarbe und Schattenblick bleiben ungespeichert; Aura-Auswahl beendet die Vorschau.
11. Creator, Onboarding und Erfolgskarte sind bei 360 px Breite und den Tablet-Prüfgrößen bedienbar.
    Fokus, beschriftete Controls und Erfolgstext funktionieren ohne Ton/Animation. Avatar und Aura
    blockieren keine Bedienung; Safe Areas, Speicherleiste und offene Tastatur verdecken keine Aktion.
12. Mobile Download-/Textur-/Layer-/VFX-Budgets werden vor Produktionsfreigabe festgelegt und mit
    echten Geräten geprüft. Ein Web-Build oder vollständiger Assetkatalog erfüllt diese Abnahme nicht.

## Abnahme von lokalem Fortschritt und Perioden

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
- Fehlende/abgelaufene Session und fehlgeschlagene Anmeldung erzeugen keinen scheinbaren Login.
  Die Frontend-Routenprüfung ersetzt die serverseitige Authentifizierung/Autorisierung nicht.

Diese Anforderungen bleiben für die geschützte Charakter- und Game-API offen. Der Auth-Slice nutzt
vorerst E-Mail/Passwort mit eigener Session; ein externer Provider wurde nicht ausgewählt. Es gibt
keine lokale Fake-Anmeldung, kein Passwort im Browser und keine produktive Gast-Charaktererstellung.

## Weitere Meilensteine

| Meilenstein | Ergebnis |
|---|---|
| M2 | Geriggte Chibis und Bosse, serverautorisierte automatische Begegnungen mit versionierter Balance und einmaligen Rewards, Produktionsreife der modularen Art, individuelle Ausrüstungsslots, reichere Gesten/Mimik, weitere Aura-VFX mit servergeprüften Freischaltungen/Bossdrops, Equipment, Item-Loot, Achievements, Titles und weitere Bosse |
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
   Requests dürfen keine Doppelrewards erzeugen. Das lokale Journal implementiert keinen verlässlichen
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
