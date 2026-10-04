# Game Design · V0.4

Stand: 2026-10-04. **Verbindliche Produktrichtung, vorläufiges Balancing.**

## Vision und Core Loop

Der Nutzer ist der Charakter. Eine reale Aktivität wird eingetragen, gibt Charakter- und Skill-XP,
entwickelt passende Attribute und zählt zu Quests und einem persönlichen Wochenboss. Fortschritt
wird sofort sichtbar. Neue Ziele und kosmetische Belohnungen führen zur nächsten realen Aktivität.
Keine automatische Bewertung der tatsächlichen menschlichen Leistungsfähigkeit: Stats sind Spielwerte.

### Das digitale Selbst und der Care Loop

Der Chibi ist die eigene kleine digitale Version des Nutzers. Sich um ihn zu kümmern bedeutet,
sich im echten Leben weiterzuentwickeln: Bewegung, Lernen, Kreativität, Beruf, Alltag, soziale
Beziehungen und Erholung zählen gleichermaßen. Das vertraute Prinzip eines virtuellen Begleiters
inspiriert die Bindung; Figuren, Verhalten und Produktidentität bleiben eigenständig.

**Wahrnehmen → kleine reale Handlung → Chibi-Reaktion → Fortschritt und ruhiger Ausblick.**
Der Nutzer kann einen Bedarf wahrnehmen, eine passende kleine Aktivität wählen und eine freundliche
Reaktion seines digitalen Selbst erleben. Keine Pflegeroutine soll zusätzliche Pflicht neben dem
realen Alltag werden. Es gibt keine Hungerstrafen, keinen Tod bei Abwesenheit, keinen Verlust
verdienter XP und keine Schuldzuweisung bei Pausen. Erholung ist Fürsorge, keine Niederlage.

Langfristig drücken Stimmung, Haltung und Gesten freiwillig angegebene Interessen, Tagesmodus und
Aktivitäten aus. Das sind nachvollziehbare Spielreaktionen, keine automatische Gesundheits- oder
Stimmungsdiagnose. Ein umfassendes Bedürfnisse-/Mood-System ist noch nicht implementiert.
Die illustrierten Figuren zeigen derzeit ruhige Atmung/Idle; eine kurze Reaktionszeile passt
zur letzten belohnten Aktivität oder zum freiwilligen Tages-Check-in. Ausgearbeitete Gesten und
Gesichtsausdrücke sind noch nicht für alle Figuren vorhanden. Vier Tagesmodi und drei
Energieangaben sind lokal gespeichert; Auslassen bleibt folgenlos. Der Check-in ändert keine XP,
Quests, Bosswerte oder Momentum. Reichere Avatarreaktionen sind M2. Backend, Authentifizierung und Serverpersistenz
bleiben eigenständige Bestandteile des bestehenden M1b-Plans.

## Einstieg und Accountbindung der Produktfassung

Ein Account ist zwingende Voraussetzung für einen eigenen Charakter. Der produktive Ablauf lautet
**registrieren oder anmelden → gültige Session → Charakter erstellen → Interessen-/Fokus-Onboarding
→ Dashboard**. Wer sich mit einem Account ohne Charakter anmeldet, beginnt im Creator. Charakter,
Fortschritt und verdiente Belohnungen sind an diesen Account gebunden und bleiben bei einem Wechsel
von den Daten anderer Accounts getrennt.

Die heutige lokale Erstellung ohne Login dient ausschließlich dem Entwicklungsprototyp. Sie ist
kein Accountsystem und kein erlaubter produktiver Gastmodus. Frontend-Routenschutz und geschützte
Create-API werden im Auth-/Backend-Slice umgesetzt; der Server bestimmt den Besitzer anhand der
Session. Ohne gültige Anmeldung darf kein Charakter angelegt werden. Auth-Anbieter und Verfahren
sind noch nicht festgelegt. Eine öffentliche reine Stilvorschau ohne gespeicherten Charakter wäre
allenfalls eine spätere Option, kein beschlossenes Gastspiel.

## Identität und Art Direction

Die freigegebene [Art Direction](ART_DIRECTION.md) definiert eigenständige Anime-Chibis in leichter
Dreiviertelansicht: markante Gesichter, ausdrucksstarke Jewel-Augen, definierte Haarsträhnen und
gemalte 2.5D-Tiefe mit sorgfältigen Stoff-/Metallflächen. Neue modulare Figuren dürfen einen kleineren
Kopf haben, damit Körper und Kleidung sichtbar bleiben. Die vier ursprünglichen Illustrationen
behalten ihre Proportionen. Die Gestaltung soll unterschiedliche Altersgruppen ansprechen, ohne
Altersfreigabe oder Zielgruppenwirkung zu versprechen.

Ästhetiken: **Cozy → Adventurer → Elegant → Dark → Abyssal**. Stile, Skills, Klassen und Seltenheit
bleiben unabhängig. Männliche und weibliche Darstellung sind über Gesicht, Haltung und Silhouette
lesbar, gleichwertig gestaltet und unsexualisiert. Hauttöne und Darstellung ändern keine Stats,
Rewards oder Stilzugänge und sagen nichts über reale demografische Eigenschaften aus. Eigene
Figuren, Lore, Musik und Effekte; keine übernommenen Franchise-Designs. UI: ruhiges, dunkles
High Fantasy mit warmen Naturakzenten, gut lesbaren Daten und sparsamem Effektgebrauch.

### Aktueller Creator und illustrierte Figuren

Unter `/character/create` gibt es ausschließlich illustrierte Figuren. Der frühere Vektor-Editor
ist aus der Benutzeroberfläche entfernt. Name, Darstellung, Vorlage, Frisur, vollständiges Outfitset,
Haut-/Augen-/Haarfarbe und verfügbare Auren sind mit direkter Vorschau wählbar. Jede Farbgruppe bietet
„Original“ plus sechs Farben. Der Vorlagenwechsel setzt eigene Modul-/Farbwerte auf diese Vorlage
zurück; Darstellung und Anpassung verändern keine Spielprogression.

| Darstellung | Sechs Startdesigns mit jeweils eigener Frisur und eigenem Outfitset |
|---|---|
| Männlich | Smaragdwächter, Urbaner Abenteurer, Frostgelehrter, Glutkämpfer, Waldläufer, Abgrundwanderer |
| Weiblich | Nachtklinge, Sternenweberin, Morgenhüterin, Rosenläuferin, Leerenweberin, Himmelsjägerin |

Frisur und Outfit sind unabhängig innerhalb der passenden Darstellung kombinierbar. Die konkrete
Garderobe steht im [Art Guide](ART_DIRECTION.md#aktueller-bild--und-creator-stand). Smaragdwächter,
Urbaner Abenteurer, Nachtklinge und Sternenweberin verwenden ohne Modul-/Farb-Overrides ihre vier
unveränderten Original-PNGs mit separater Hintergrundmaske. Anpassungen nutzen neu erstellte
modulare Bildvarianten; diese sind keine pixelidentische Zerlegung der Originale. Zwölf Figuren-Rigs
und zwei Basiskopf-Rigs unterstützen getrennte Körper-, Gesicht-/Basiskopf- und Haarmasken.

Name und Auswahlwerte werden validiert. Profil-Schema 2 speichert nur Name/Aussehen; Interessen
werden separat gespeichert. Aktivitätsjournal und daraus rekonstruierte XP/Belohnungen bleiben
lokal in diesem Browser erhalten. Frühere Profile werden über den bestehenden
Migrations-/Normalisierungspfad gelesen; alte technische Felder sind keine weiter angebotenen
Editor-Modi. Ein bestätigter Reset erhält das übrige Profil, entfernt aber verdiente Auren. Gesperrter Speicher
wird als Sitzungsfallback erklärt.

Ruhige Ganzkörperatmung ist vorhanden: Originale bewegen sich geschlossen, modulare Körper-/Kopfteile
atmen gekoppelt. Bewegung lässt sich abschalten und respektiert reduzierte Bewegung. Interessen-
bezogene Gesten, Gesichtsmimik und visuelle Entwicklung in den vorläufigen Levelbereichen 1–9,
10–24 und 25+ bleiben die weitere Richtung, ohne Stats oder Stilfreischaltungen zu verändern.

### Onboarding und Fokus

`/onboarding` bietet drei Schritte: **Interessen → Fokus-Skills → Zusammenfassung**. Sieben Bereiche
stehen zur Wahl: Bewegung, Kampfsport, Ruhe & Erholung, Wissen & Lernen, Kreativität, Beruf & Projekte
und Alltag. Mindestens ein Interesse, eine dazugehörige primäre Richtung und 1–6 aktive Skills aus
dem 14er-Katalog werden validiert. Die Startauswahl umfasst Calisthenics, Running, Meditation und
Programming. Änderungen beeinflussen Auswahl und Darstellung, niemals XP oder Rewards.

Die Präferenzen werden getrennt als `everbloom.journey.v1` lokal gespeichert. Überspringen und spätere
Änderung bleiben möglich; ein Abstecher zum Creator erhält den laufenden Onboarding-Entwurf in der
Sitzung. Das ist noch kein synchronisiertes Accountprofil; Fortschritt wird separat lokal gespeichert.

### Equipment-Ziel

Aktuelle Outfitsets sind vollständig bekleidet; Waffen, Taschen, Bücher, Cape und andere befestigte
Accessoires gehören zum jeweiligen Bildset. Einzelne Slots und Inventarbesitz sind noch nicht
implementiert. Das Zielsystem umfasst vollständige Sets und **Kopf, Gesicht, Haare, Torso, Arme,
Beine, Schuhe, Haupthand, Nebenhand, Rücken, Accessoire, Aura und Companion**. Gameplay-Equipment
und sichtbarer Look bleiben getrennt. Feste Anker, gemeinsame Perspektive, verdeckte Anschlussflächen,
Masken und definierte Zeichenreihenfolge sind der Produktionsvertrag; eine einzelne gelungene
Kombination belegt weder alle Kombinationen noch mobile Produktionsreife.

## Progression – Regeln der Demo

Balance V0.2 verlangsamt Levelaufstiege gegenüber den ursprünglichen Demo-Werten. Eine längere
Aktivität soll einen sichtbaren Teil eines Levels beitragen. Alle Zahlen bleiben vorläufige,
testbare Kalibrierungswerte, keine finalen Versprechen.

| System | Regel |
|---|---|
| Charakter | Gesamt-XP bleiben erhalten. Level 1 startet bei 0 XP. Kosten für nächstes Level: `1200 + 200 × (Level − 1)`. |
| Skills | Eigene Gesamt-XP; nächstes Level kostet `1000 + 150 × (Level − 1)`. |
| Aktivität | Ganze Minuten 1–180. `Minuten × XP-Rate` mit skillabhängigem täglichem Minutenlimit; darüber keine weiteren Rewards. |
| Attribute | Zugeordneter Spielwert erhält einen Punkt je 1000 kumulierten XP seiner Skills, zusätzlich zum Demo-Basiswert. |
| Quests | Tagesziel in Minuten eines Skills, Fortschritt auf Ziel begrenzt. Automatischer einmaliger Charakter-XP-Bonus beim Erreichen. |
| Momentum | 0–100. Erster belohnter Eintrag eines Tages gibt +5, weitere Einträge desselben Tages keinen Bonus. Kein XP-Multiplikator in der Demo. |
| Wochenboss | Jede belohnte Aktivitäts-XP verursacht 2 Schaden. Questbonus verursacht keinen Schaden. HP nie unter 0. |
| Bossphasen | Über 60 % HP: Erwachen; über 25 %: Widerstand; sonst Letzter Widerstand; bei 0: Besiegt. |

Ein Eintrag wird atomar verbucht. Wiederholung derselben Request-ID gibt keine zweite Belohnung.
Aktivitäten bleiben auch über dem Reward-Limit im Verlauf, Questfortschritt zählt nur belohnte Minuten.
Der erste belohnte Mooswächter-Sieg vergibt einmalig die kosmetische Aura Moosseele. Ein zusätzlicher
Boss-XP-Bonus und Item-Loot sind noch nicht implementiert.

Calisthenics gibt weiterhin 4 XP pro belohnter Minute. Das tägliche Reward-Limit beträgt jetzt
90 Minuten und gilt über alle Einträge desselben Tages hinweg. XP-Raten aller Skills, Questboni
und der Faktor von 2 Boss-Schaden pro Aktivitäts-XP bleiben unverändert. Daraus entstehen mit
Calisthenics höchstens `90 × 4 × 2 = 720` Boss-Schaden pro Tag, begrenzt auf die verbleibenden HP.

Die folgende Kalibrierung verwendet jeweils 60 bzw. 90 vollständig belohnte Calisthenics-Minuten:
240 bzw. 360 Aktivitäts-XP und einmalig 50 zusätzliche Charakter-XP aus der Tagesquest. Jeder
Prozentwert bezieht sich auf die **gesamte XP-Spanne eines Levels**, nicht auf den noch fehlenden
Teil des Balkens. Der Questbonus zählt nur für den Charakter.

| Levelstand | Charakter: 60 / 90 Min. | Skill: 60 / 90 Min. |
|---|---:|---:|
| Charakter 1 / Skill 1 | 24,2 % / 34,2 % | 24,0 % / 36,0 % |
| Charakter 12 / Skill 9 (Demo) | 8,5 % / 12,1 % | 10,9 % / 16,4 % |
| Charakter 25 / Skill 25 | 4,8 % / 6,8 % | 5,2 % / 7,8 % |

Ein bereits fast voller Balken darf durch eine einzelne Aktivität weiterhin ein Level erreichen;
überschüssige XP bleiben erhalten. Die Zeitbeispiele dienen ausschließlich dem Spielbalancing
und sind keine Trainingsvorgabe. Weitere Spieltests sollen die langfristige Progression kalibrieren.

Die Beispiel-Gesamt-XP und Basisattribute erhalten weiterhin die bisherigen Charakter-/Skill-Level
und sichtbaren Attribute. Ein frischer lokaler Spielstand startet deshalb bei Charakter-Level 12
mit 25.926 Gesamt-XP und Boss-HP 1.460/2.400. Das ist ein klar benannter Beispielstart; ein echtes
Level-1-Onboarding ist noch offen. Neue Einträge sind jetzt lokal persistent. Balanceänderungen
müssen deshalb künftig eine versionierte Replay-/Migrationsstrategie berücksichtigen.

### Lokale Tage, Wochen und Verlauf

Die Tagesgrenze ist das lokale Gerätedatum. Beim Laden, Wiederaufnehmen und vor Einträgen wird die
Periode geprüft. Am neuen Tag beginnen die drei Tagesquests mit 0 Minuten/ungeclaimt; die täglichen
Skilllimits gelten für den neuen Day-Key. In einer neuen Montag–Sonntag-Woche beginnt derselbe Boss
mit voller HP. Übersprungene Tage erzeugen keine XP, Claims, Drops oder Strafen. XP, alte Aktivitäten
und verdiente Auren bleiben erhalten. Der Rhythmus zeigt die aktuelle Woche anhand belohnter Tage;
vergangene Tage ohne belohnte Aktivität sind als Ruhe markiert. Das ist keine validierte Streak-
oder Rest-Day-Planung. Weekly Quests sind weiterhin Zukunftsinhalt.

Das Browser-Journal speichert akzeptierte Commands und ihren Tag, keine frei übernehmbaren XP-/HP-
oder Besitzwerte. Beim Laden wird der Verlauf aus dem Beispielstart nachgerechnet, ohne erneut
Erfolge abzuspielen. Höchstens 10.000 Einträge und 2 MiB; neue Einträge jenseits dieser Grenze werden
vor der Buchung abgelehnt. Bei Speicherproblemen bleibt gegebenenfalls nur ein gekennzeichneter
Sitzungsstand. Beschädigte oder fremde Speicherstände werden bis zum bewussten Reset erhalten.
Ungültige oder rückwärts gestellte Uhrzeit sperrt neue Einträge. Das ist kein Schutz gegen alle
Manipulationen einer Client-Uhr und keine Cloud-Sicherung oder servergeprüfte Aktivitätsmessung.

„Spielstand zurücksetzen“ verlangt eine Bestätigung und ersetzt Journal/Fortschritt durch den
Beispielstart für heute. Verdiente Auren gehen dabei verloren, eine angelegte Belohnungsaura wird
entfernt. Name, übrige Figur, Interessen und getrennte Einstellungen bleiben erhalten.

## Skills und Subskills

Ein Skill ist eine konkrete Fähigkeit. Kategorien organisieren, Subskills verfeinern; Eltern- und
Kind-XP dürfen nicht versehentlich mehrfach Charakter-XP erzeugen. Ein Eintrag hat zunächst genau
einen primären Skill. Später explizite Gewichtung statt unkontrollierter Mehrfachbelohnung.

| Familie | Geplante Skills / Beispiele für Subskills |
|---|---|
| Physical | Calisthenics (Pull-ups, Handstand), Weightlifting, Running, Swimming, Mobility |
| Combat | Boxing, Kickboxing, Muay Thai, BJJ (Guard, Passing), MMA |
| Mind & Recovery | Meditation, Breathwork, Recovery, Cold Exposure, Attention / Digital Reset |
| Knowledge | Reading, Programming (TypeScript, Angular, Java), Languages (je Sprache) |
| Creative | Instrumente (je Instrument), Writing, Drawing, Design |
| Career | Deep Work, Communication, Leadership, Personal Projects |
| Life | Healthy Cooking, Planning, Household, Social Skills |

Aktuell sind 14 Skills protokollierbar. Die ursprünglichen vier behalten ihre Balance und Demo-
Startstände; zehn neue Skills starten mit 0 Skill-XP. Fokusauswahl und Ausblenden löschen keine XP.

| Skill | Attribut | XP/Minute | Belohnte Minuten/Tag |
|---|---|---:|---:|
| Calisthenics | Strength | 4 | 90 |
| Running | Endurance | 3 | 60 |
| Meditation | Mindfulness | 3 | 30 |
| Programming | Knowledge | 2 | 90 |
| Weightlifting | Strength | 4 | 90 |
| Swimming | Endurance | 3 | 60 |
| Boxing | Strength | 3 | 60 |
| BJJ | Focus | 3 | 60 |
| Breathwork | Mindfulness | 2 | 15 |
| Recovery | Recovery | 2 | 30 |
| Reading | Knowledge | 2 | 60 |
| Languages | Knowledge | 2 | 60 |
| Healthy Cooking | Recovery | 2 | 45 |
| Instrument üben | Focus | 2 | 60 |

Das sind vorläufige Reward-Grenzen, keine Trainings-/Gesundheitsvorgaben. Subskills und ein vollständiger
Skillbaum folgen später. Implementierte Attribute: Strength, Endurance, Focus, Knowledge, Mindfulness
und Recovery. Die Zielversion ergänzt Agility, Mobility, Discipline und Social.

## Recovery, Rest, Cheat Days und Streaks

Erholung ist eine vollwertige Aktivitätsfamilie. Ein geplanter Ruhetag schützt die Kontinuität;
ein freiwilliger Cheat Day pausiert Ziele. Ungeplante Pausen kosten mögliche Tagesbelohnungen,
niemals bereits verdiente XP oder Level. Spätere Momentum-Abnahme bei Inaktivität ist reversibel.
Ein schwieriger Tag kann durch Erholung zum Recovery Day werden. Die freiwillige Tagesmoduswahl
mit lokalem Datumswechsel ist vorhanden; ihre vollständigen Recovery-/Rest-/Cheat-Day-Regeln sind
**noch nicht umgesetzt**. Lokale Tages-/Wochenwechsel und ein Rhythmus aus belohnten Tagen sind
vorhanden, erzeugen aber noch keine frequenzabhängige Streak oder geplante Ruhetagsberechtigung.

Streaks richten sich später nach Zielrhythmus (z. B. dreimal pro Woche statt jeden Tag).
Kein Anreiz, Erholung zugunsten eines täglichen Sport-Streaks auszulassen. Cold Exposure bekommt
keine eskalierenden Risiko-/Dauerbelohnungen. Limits und spätere Personalisierung sind gesondert zu testen.

## Quests, Boss und Rewards

Daily und Weekly Quests bilden kurze bzw. mehrtägige Ziele ab. Persönliche Bosse bündeln einen
Wochenfokus; langfristige Bossquests können Pull-up, Projektabschluss oder Prüfung darstellen.
Phasen geben Feedback, erzwingen keine gefährlicheren Aktivitäten. Loot: Equipment und Cosmetics,
Seltenheit unabhängig von Stil. Achievements für echte Meilensteine (z. B. erster Boss, 100 Einträge),
Titles als sichtbare Identität. Inventar, Drop-Tabellen und Claims folgen nach der Basisprogression.

### Tagesvorschläge und freiwillige Wochenziele

Das Dashboard ergänzt den bestehenden Aktivitätsfluss um höchstens drei konkrete nächste Schritte.
Bekannte Fokus-Skills erscheinen in der gewählten Reihenfolge. Jeder Vorschlag enthält 5–20 ganze
Minuten, begrenzt auf die verbleibenden belohnten Minuten des Skills an diesem Tag. Unter fünf
verbleibenden Minuten gibt es keinen Vorschlag; der normale manuelle Eintrag bleibt erreichbar.
Vollständig abgeschlossene Tagesquests werden nicht als neue Aufgabe wieder vorgeschlagen. Noch
offene Quests können die vorgeschlagene Dauer auf ihre verbleibenden Minuten verkürzen.

Die Modi Erholung und Ruhetag bevorzugen Recovery, Meditation und Breathwork, sofern diese Skills
im Spielstand vorhanden sind. Im Ruhetag werden höchstens fünf Minuten vorgeschlagen. Das sind
freiwillige Spielvorschläge und keine gesundheitlichen Empfehlungen; eine Pause ohne Eintrag bleibt
gleichwertig und folgenlos. Andere Aktivitäten und bereits verdiente Skills/XP werden nicht gesperrt.

Die Belohnungsvorschau ruft dieselbe reine `recordActivity`-Regel wie ein späterer akzeptierter Eintrag
auf: Aktivitäts-XP, tatsächlich ausgelöster Questbonus, Gesamt-XP und auf Rest-HP begrenzter
Wochenboss-Schaden. Sie simuliert den jetzigen Snapshot, reserviert nichts und speichert nichts.
Auswählen öffnet ausschließlich das vorausgefüllte Aktivitätsformular. Erst nach realer Tätigkeit und
bewusstem Bestätigen entsteht ein Eintrag. Mehrere Karten sind jeweils unabhängige Vorschauen, kein
gemeinsam vorab zugesagtes Rewardpaket.

Die Wochenübersicht wird aus gültigen belohnten Aktivitäten der aktuellen Montag–Sonntag-Woche bis
einschließlich heute abgeleitet. Zukunft, andere Wochen, unbekannte Skills und unbelohnte Einträge
zählen nicht. Wiederholungen am gleichen Tag beziehungsweise im gleichen Bereich erhöhen die
entsprechende Anzahl nicht mehrfach.

| Freiwilliges Wochenziel | Voraussetzung | Zusätzliche Belohnung |
|---|---|---|
| Dein eigener Rhythmus | Aktivitäten an drei verschiedenen Tagen | Keine |
| Mehr als eine Seite | Aktivitäten aus zwei verschiedenen Skill-Familien | Keine |
| Raum zum Auftanken | An einem Tag Recovery, Meditation oder Breathwork protokolliert | Keine |

Die Ziele zeigen vorhandenen Fortschritt und erzeugen keine weiteren XP, Claims, Coins oder
Achievements. Ein freiwilliger Check-in allein wird nicht als Aktivität umgedeutet. „Aktivitäts-XP
diese Woche“ summiert ausschließlich die bekannten `Activity.xp`; historische Questboni sind im
aktuellen Snapshot nicht vollständig verfügbar und werden nicht erfunden. Der volle Alltag-/Avatar-
Fortschrittsloop, diese Vorschläge, Wochenziele und alle drei Übungstaktiken gehören zum Free-Kern.

### Automatische Begegnungen und separate Kampfübung

Die akzeptierte Richtung ergänzt den sichtbaren Fortschritt um seitliche, automatisch
ablaufende RPG-Begegnungen: Held links, Boss rechts, abwechselnde Angriffe, HP und ein lesbarer
Verlauf. AdventureQuest ist nur eine Präsentationsreferenz; Everbloom verwendet eigene Figuren,
Bühnen, Regeln und Sounds. Charakterlevel und erworbene Skill-Erfahrung beeinflussen die
Kampfstärke. Die Darstellung nutzt PixiJS; geriggte Figuren/Bosse folgen dem
[Animationsvertrag](ANIMATION_PIPELINE.md). Aktuell gibt es keine Spine-Runtime.

Der erste umgesetzte Ablauf unter `/battle` ist eine lokale Kampfübung gegen den Mooswächter.
Ein beim Start eingefrorener Spielstand erzeugt einen deterministischen Zugverlauf. Wiederholung
desselben Starts ergibt dasselbe Ergebnis. Es gibt keine aktiven Kampftasten für zusätzliche
Schadensboni. Die Zahlen sind eine eigenständige vorläufige Kampfbalance, keine Umrechnung der
bisherigen 2.400 Wochenboss-HP. Die Kampfübung speichert und belohnt nichts: kein XP-Farming,
kein Questfortschritt, kein Aura-Grant und keine Veränderung des angeschlagenen Wochenbosses.
Eine Niederlage kostet keine bestehenden XP oder Level.

Die vorläufige **Kampfbalance V0.1** steht in `domain/auto-battle.ts`. Level wird aus Charakter-XP
berechnet; Attribute sind Basiswerte plus ein Punkt je 1.000 XP ihrer Skills. Alle sechs Familien
tragen bei, auch Wissen und Erholung. Aussehen, Fokusauswahl und Membership geben keinen Kampfbonus.

| Wert | Kampfübungs-Regel |
|---|---|
| Held-HP | `120 + 14 × Level + 3 × Endurance + 2 × Recovery` |
| Angriff | Abgerundet: `12 + 3 × Level + 0,7 × Strength + 0,7 × Knowledge + 0,3 × Focus` |
| Verteidigung | Abgerundet: `3 + 0,8 × Level + 0,25 × (Endurance + Mindfulness + Recovery)` |
| Fokusschlag | Jeder `5 − floor((Focus + Mindfulness) / 50)`-te Heldenzug, begrenzt auf jeden 3.–5. Zug; 1,5-facher Angriff vor Verteidigung |
| Übungs-Mooswächter | Level 12, 560 HP, Angriff 52, Verteidigung 20; unabhängig vom Wochenbosszustand |
| Bossphasen | Nach dem Heldenzug: über 60 % HP Faktor 1, über 25 % Faktor 1,15, sonst Faktor 1,4 |
| Schwerer Bossschlag | In jeder dritten Runde zusätzlich Faktor 1,2; keine zufällige Chance |
| Schaden | `max(1, floor(Angriff × Faktoren) − Verteidigung)`, höchstens verbleibende HP |
| Zugfolge und Ende | Held zuerst, dann lebender Boss; bei 0 HP sofort Ende, sonst nach standardmäßig 20 Runden unentschieden |

Optionale Test-/Simulationslimits erlauben höchstens 30 Runden. Defensive Zahlengrenzen (u. a.
10 Millionen Eingangs-XP, 1.000 Attributpunkte) sind technische Prototypgrenzen, keine beschlossenen
Maximallevel. Die Formeln werden erst nach Spieltests produktiv übernommen. Wiederholungen würfeln
keine Chance neu und ersetzen keine reale Aktivität.

Vor der Übung wird eine von drei vorläufigen Taktiken gewählt. Sie verändern ausschließlich die
Angriffs-/Verteidigungswerte dieser Begegnung; Basisattribute und gespeicherter Fortschritt bleiben
unverändert. Änderungen nach Beginn sind gesperrt. Ein neu vorbereiteter Kampf kann eine andere
Taktik erhalten; „erneut ansehen“ spielt den bestehenden Verlauf mit derselben Taktik ab.

| Taktik | Angriff / Verteidigung | Besonderheit |
|---|---|---|
| Balance (`balanced`) | Unveränderte Basiswerte | Bisheriger Verlauf bleibt unverändert |
| Offensiv (`power`) | `floor(Angriff × 1,2)` / `floor(Verteidigung × 0,75)` | Mehr Schaden bei geringerem Schutz |
| Ausdauer (`guard`) | `floor(Angriff × 0,85)` / `floor(Verteidigung × 1,25)` | Automatischer Erholungszug unter den folgenden Bedingungen |

Ausdauer ersetzt in jeder dritten Runde den eigenen Angriff durch „Neue Kraft“, falls die Helden-HP
zu Beginn des Zugs unter 60 % des Maximums liegen. Heilung ist
`floor(0,12 × Max-HP + 0,5 × Recovery + 0,25 × Mindfulness)`, mindestens ein Punkt und höchstens die
fehlenden HP. Dieser Zug verursacht null Schaden und ist kein Fokusschlag; der lebende Boss greift
danach normal an. Heilung betrifft nur virtuelle Kampf-HP und ist keine Aussage über reale Erholung.
Fokusschläge folgen weiter dem Rundenrhythmus und werden durch einen Erholungszug nicht nachgeholt.
Unbekannte Taktikwerte fallen auf Balance zurück. Der Demo-Basiskampf bleibt bei Balance mit
396 HP, Angriff 104 und Verteidigung 27 unverändert; Offensiv ergibt 124/20, Ausdauer 88/33.
Diese Regeln sind testbare Entwürfe, keine behauptete endgültige Wettbewerbsbalance.

Das Produktionsziel verbindet künftig **akzeptierte reale Aktivität → serverautorisierte
Begegnung → einmaliges Ergebnis/Reward**. Welche Aktivität eine Begegnung auslöst, welche
Schwierigkeit/Skillgewichtung gilt und wie Phasen und Belohnungen verteilt sind, muss vor der
Anbindung mit Beispielen entschieden werden. Ein wiederholt abgespielter Kampf darf nie ein
zweites Ergebnis verbuchen. Dafür werden Regelversion, Begegnungs-ID, atomare Vergabe und ein
Migrationspfad für bestehende Journale benötigt. Bis dahin bleiben die bisherigen Aktivitäts-,
Wochenboss- und Aura-Regeln vollständig unverändert.

### Erspielbare Auren und ungespeicherte Vorschau

`CharacterAura` stellt drei Starter-Effekte, drei verdiente Auren sowie zehn weitere Entwürfe dar:
Sterne, mystische Zeichen, innere Energie/Chakra, Dämonenschatten, Licht, Energieströme, Engelsflügel,
Kirschblüten, Feuer und Geistwächter. Die eigene Namens- und Formensprache steht im
[Art Guide](ART_DIRECTION.md#aura-richtung-und-aktueller-vorschauumfang). Die erweiterten Entwürfe
sind ausdrücklich nur Vorschau, mit sechs Farben und ohne Speicherung/Freischaltung. Der optionale
bedrohliche Blick sitzt derzeit im Schatten hinter der Figur, nicht in ihren echten Augen.
Gesichtsausdruck und Irisleuchten werden später separat gestaltet. Auren sind rein kosmetisch;
Chakra ist ein Fantasy-Motiv ohne gesundheitliche Bedeutung. Ganzkörper-VFX mit Boden-, Rücken-
und Vorderpartikeln sind das Ausbauziel, keine bereits vollständige Produktions-VFX-Bibliothek.

Die vier Starter-Optionen bleiben verfügbar: Ohne Aura, Waldlicht, Blütenzauber und Leere.
`AURA_REWARDS` (auch als `AURA_PROGRESSION_PLAN` exportiert) enthält drei implementierte Belohnungen:

| Aura | Einmaliger Auslöser | Eigener Effekt |
|---|---|---|
| Nordlicht · `aurora` | Belohnte Aktivität erreicht von unten Charakterlevel 20, einschließlich Quest-XP | Grün/petrol/violette Lichtbänder |
| Sternenkranz · `starlight` | Belohnte Aktivität erreicht von unten Charakterlevel 40 | Gold/violette Konstellationen |
| Moosseele · `moss-spirit` | Belohnte Aktivität besiegt den lebenden Mooswächter | Leuchtende Blattranken und Waldgeist |

Die Belohnung wird automatisch atomar mit dem Aktivitätsergebnis vergeben; keine Zufallschance
oder zusätzlicher Claim. Jede Aura wird nur einmal gesammelt, selbst wenn mehrere Wochenbosse
besiegt werden. Mehrere gleichzeitig erfüllte Bedingungen sind möglich. Duplicate-Requests,
Einträge ohne Aktivitäts-XP, schon besiegte Bosse und reine Vorschauen vergeben nichts. Level-Auren
werden beim echten Schwellenübertritt verdient, nicht beim bloßen Laden eines hohen Levels.

`unlockedAuras` gehört zum Snapshot und wird beim Journal-Replay wiederhergestellt. Dashboard und
Creator zeigen die Sammlung; nur Starter und verdiente IDs sind anlegbar. Die Profilnormalisierung
kennt die drei IDs, der Repository-Pfad prüft zusätzlich Besitz. Zehn weitere Entwürfe bleiben ohne
Besitzrechte. Es handelt sich um lokale Prototyprechte, keinen vertrauenswürdigen Servernachweis.
Serververgabe und ein allgemeines Item-/Inventarsystem bleiben offen; Balance V0.2 ist unverändert.

## Erfolgsmomente

Nach einem akzeptierten Aktivitätseintrag werden alter und neuer Zustand verglichen. Auslöser:
Charakter-Levelaufstieg, Skill-Levelaufstieg, erster belohnter Eintrag des Tages, Abschluss aller
Daily Quests, Sieg über den Wochenboss oder eine neu verdiente Aura. Einzelne Questabschlüsse erhalten normales Fortschritts-
feedback, aber keinen eigenen Jingle. Die Erfolgskarte bündelt gleichzeitig erreichte Meilensteine
für ungefähr sechs Sekunden; ein kleines CSS-Feuerwerk und ein eigener Jingle aus
vier aufeinanderfolgenden Tönen begleiten sie. Es werden keine RuneScape-Sounds oder fremden
Assets verwendet. Mehrere übersprungene Level erzeugen einen zusammengefassten Übergang.

Ton, Feuerwerk und Charakterbewegung werden separat gesteuert und lokal gespeichert. Reduzierte
Bewegung unterdrückt bewegte Effekte; der Erfolg bleibt als Text sichtbar. Audio startet nur im
Rahmen einer Nutzerinteraktion und darf bei fehlender Browserunterstützung die Aktivität nicht
blockieren. Laden, Demo-Reset, Profilspeicherung und doppelte Requests lösen keine wiederholte
Feier aus. Eine ausdrücklich beschriftete Vorschau demonstriert den Effekt ohne Spielmutation.
Diese Rückmeldung ist noch kein persistiertes Achievement-/Inventarsystem.

## Free und Membership

Free bleibt dauerhaft spielbar: sinnvoller Skillmix, wiederkehrende Daily/Weekly Quests,
persönliche Bosse und permanente Progression. Membership erweitert das Spiel um zusätzliche
Skills/Subskills, Questreihen, Bosse, Progressionspfade und Cosmetics. Vorläufiger Kandidat:
10 % mehr **Charakter-Aktivitäts-XP**, keine Veränderung dokumentierter realer Leistungen.
Kein bezahlter Zwang zur Erholung, keine verlorenen verdienten Inhalte bei Kündigung;
genaue Nutzbarkeit von Member-Inhalten nach Ablauf ist vor M3 festzulegen.
Geplanter monatlicher Endkundenpreis: **3,99 € pro Monat**. Ein Jahrespreis ist nicht festgelegt.
**4,99 € pro Monat** ist ein zusätzlich zu prüfender Preiskandidat aus der Produktüberarbeitung,
keine beschlossene Preisänderung. Vor einer Entscheidung stehen wiederkehrender Mehrwert,
Inhaltspflege, Nutzung und Zahlungsbereitschaft; professionelles Design allein belegt keine Nachfrage.
Der gesamte grundlegende Spielkreislauf bleibt Free. Membership erweitert Inhalte und Gestaltung,
nicht die Möglichkeit, reale Aktivitäten zu protokollieren, sich zu erholen oder den eigenen Fortschritt
zu behalten. Beide Preisideen sind noch keine aktiv kaufbaren Store-Produkte.
Regionale Store-Preisstufen, Steuern und Nettoerlös werden vor der Billing-Implementierung geprüft.
Das ist ein beschlossenes Preisziel, noch kein registriertes Store-Produkt. Entitlements werden
nicht im UI erfunden. Demo ist Free, ohne Checkout oder XP-Vorteil.

## Finale UI-Sprachen

Release-Ziel sind Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch, Chinesisch,
Japanisch, Russisch und Koreanisch. Die konkrete Übersetzung folgt in der Endphase/M4; die aktuelle
Demo bleibt deutsch. Schweizer Hochdeutsch (`de-CH`) versus Schweizerdeutsch (`gsw`), Portugiesisch
Portugal versus Brasilien sowie vereinfachtes versus traditionelles Chinesisch bleiben vor der
Übersetzungsphase zu entscheiden. Keine Flaggen als Sprachlabels; konsistente Begriffe für Spiel,
Support und Store, lokale Daten-/Zahlenformate und verständlicher deutscher Fallback.

## Spätere Welt

Classes/Archetypes entstehen optional aus Spielstil, sperren keine reale Fähigkeit.
Parties, Guilds und Raids folgen erst nach stabilem Solo-Spiel. Keine Social-Plattform im MVP.

## Offene Entscheidungen

- Finales XP-Balancing, Tageslimits, Skillgewichtung und Maximallevel durch Spieltests.
- Momentum-Abnahme, Zeitzonenwechsel, Recovery-/Cheat-Day-Kontingente und Streak-Regeln vor serverseitiger Persistenz.
- Membership-Inhaltsgrenzen, Kündigungsregeln, regionale Preisumsetzung und Store-Abrechnung vor M3.
- Professionelle Rig-/Bossassets nach festgelegter [Animation Pipeline](ANIMATION_PIPELINE.md),
  mobile Budgets und gegebenenfalls Spine-Nutzungsrechte vor breiter Content-Produktion.
- Produktive Begegnungsauslöser, Kampfgewichtung, Schwierigkeit, Rewards und versionierte
  Ablösung/Verknüpfung des bisherigen Wochenboss-Schadens vor serverseitiger Kampfanbindung.
