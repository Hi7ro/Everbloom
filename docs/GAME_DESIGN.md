# Game Design · V0.5

Stand: 2026-10-05. **Verbindliche Produktrichtung, vorläufiges Balancing.**

**Herovera** ist seit dem 8. Oktober 2026 der gewählte öffentliche App-Name. Everbloom bleibt
in internen technischen Kennungen erhalten. Marken-/Domainprüfung und Store-Registrierung sind offen.

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
Energieangaben bleiben im Kontomodus nur für die Sitzung auf dem Gerät; Auslassen bleibt folgenlos. Der Check-in ändert keine XP,
Quests, Bosswerte oder Momentum. Reichere Avatarreaktionen sind M2. Backend, Authentifizierung und Serverpersistenz sind in der lokalen M1b-Beta angebunden.

## Einstieg und Accountbindung der Produktfassung

Ein Account ist zwingende Voraussetzung für einen eigenen Charakter. Der produktive Ablauf lautet
**registrieren oder anmelden → gültige Session → Charakter erstellen → Interessen-/Fokus-Onboarding
→ Dashboard**. Wer sich mit einem Account ohne Charakter anmeldet, beginnt im Creator. Charakter,
Fortschritt und verdiente Belohnungen sind an diesen Account gebunden und bleiben bei einem Wechsel
von den Daten anderer Accounts getrennt.

Die lokale Beta implementiert diesen Ablauf mit E-Mail/Passwort, bestätigter E-Mail-Adresse,
persistenter HttpOnly-Session und einer geschützten Game-API. Der Server bestimmt den Besitzer;
Clientwerte können keine fremde Figur lesen oder verändern. Neue Accounts starten mit Level 1
und 0 XP, ohne den früheren Level-12-Demoseed. Die öffentliche Vorschau `/demo` bleibt isoliert.
Native Projekte sind angelegt; Store-Builds und Live-Betrieb sind noch nicht abgenommen.
Details und Freigabeschritte: `BETA_RELEASE.md`.

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
Garderobe steht im [Art Guide](ART_DIRECTION.md#aktueller-bild--und-creator-stand).
Die vier ursprünglichen PNGs bleiben unverändert als Stilreferenz archiviert. Der aktuelle
Charakterausbau stellt alle zwölf Vorlagen auf denselben Layer-Renderer um: zwölf separat
gerenderte, vollständig bekleidete Körper-Sprites mit eigenen Outfitankern werden mit den
jeweils einem vollständigen gemalten Kopf aus der gewählten Frisurenvariante kombiniert. Dadurch wechselt eine Farb- oder Frisurwahl
nicht mehr zwischen Original-Gesamtbild und einer anderen Komposition. Die neuen Teile sind
keine pixelidentische Zerlegung der vier Originalzeichnungen. Die abschließende Sichtprüfung
aller Kragen, Haare und Kombinationen auf Handy/Tablet ist noch offen.

Die Frisurenwahl entscheidet über **einen vollständigen gemalten Kopf** einschließlich
zusammengehöriger Haare, Gesicht, Ohren, Kiefer und Augen. Kleidung bleibt unabhängig.
Die Laufzeit verwendet weder ein fremdes Vorlagengesicht noch eine zusätzliche Stirnfüllung.
Ohne explizite Augenfarbe gilt die gemalte Augenfarbe des gewählten Kopfes; eine gesetzte
Augenfarbe bleibt erhalten. Haut-, Augen- und Haartönung verwenden Regionen desselben Bildes.
Ein eigener Gesichtswechsel unabhängig von der Frisur ist im aktuellen Renderer nicht vorhanden.
Getrennte Gesicht-/Haarteile bleiben ein späterer Produktionsweg mit exakt passenden Layern.

Name und Auswahlwerte werden validiert. Profil-Schema 2 speichert nur Name/Aussehen; Interessen
werden separat gespeichert. Aktivitätsjournal und daraus rekonstruierte XP/Belohnungen bleiben
lokal in diesem Browser erhalten. Frühere Profile werden über den bestehenden
Migrations-/Normalisierungspfad gelesen; alte technische Felder sind keine weiter angebotenen
Editor-Modi. Ein bestätigter Reset erhält das übrige Profil, entfernt aber verdiente Auren. Gesperrter Speicher
wird als Sitzungsfallback erklärt.

Ruhige Ganzkörperatmung koppelt Körper-/Kopfteile. Bewegung lässt sich abschalten und
respektiert reduzierte Bewegung. SVG-Porträts führen zurückhaltende interessenbezogene Gesten
aus; Pixi nutzt Atmung und Kampfreaktionen. Gesichtsmimik und professionell geriggte
Körperanimationen bleiben weitere Arbeit, ohne Stats oder Stilfreischaltungen zu verändern.

### Onboarding und Fokus

`/onboarding` bietet drei Schritte: **Interessen → Fokus-Skills → Zusammenfassung**. Sieben Bereiche
stehen zur Wahl: Bewegung, Kampfsport, Ruhe & Erholung, Wissen & Lernen, Kreativität, Beruf & Projekte
und Alltag. Mindestens ein Interesse, eine dazugehörige primäre Richtung und 1–6 aktive Skills aus
dem 14er-Katalog werden validiert. Die Startauswahl umfasst Calisthenics, Running, Meditation und
Programming. Änderungen vergeben selbst keine XP oder Rewards; sie beeinflussen Darstellung,
Vorschläge und den nächsten noch unberührten persönlichen Tagesquestplan.

Im Account werden Präferenzen über die Journey-API serverseitig gespeichert, getrennt vom Profil.
Nur der historische lokale Testadapter verwendet `everbloom.journey.v1`. Überspringen und spätere
Änderung bleiben möglich; ein Abstecher zum Creator erhält den laufenden Onboarding-Entwurf in der
Sitzung. Ein bereits begonnener Tagesquestplan bleibt bei einer Fokusänderung erhalten.

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
Der erste belohnte Wochenboss-Sieg über den Mooswächter vergibt einmalig die kosmetische Aura
Moosseele. Dieser Wochenboss gibt keinen zusätzlichen XP-Bonus; die getrennten Kampagnenbegegnungen
vergeben ihre festen kosmetischen Erstabschluss-Belohnungen.

Calisthenics gibt weiterhin 4 XP pro belohnter Minute. Das tägliche Reward-Limit beträgt jetzt
90 Minuten und gilt über alle Einträge desselben Tages hinweg. XP-Raten aller Skills
und der Faktor von 2 Boss-Schaden pro Aktivitäts-XP bleiben unverändert. Neue persönliche
Tagesquests erhalten einen beim Erstellen festgelegten, levelabhängigen Bonus gemäß der Regel
unten; bereits begonnene und klassische Beispielquests behalten ihre gespeicherten Boni. Daraus entstehen mit
Calisthenics höchstens `90 × 4 × 2 = 720` Boss-Schaden pro Tag, begrenzt auf die verbleibenden HP.

Die folgende historische Kalibrierung des klassischen Beispielboards verwendet jeweils 60 bzw. 90 vollständig belohnte Calisthenics-Minuten:
240 bzw. 360 Aktivitäts-XP und einmalig 50 zusätzliche Charakter-XP aus der Tagesquest. Jeder
Prozentwert bezieht sich auf die **gesamte XP-Spanne eines Levels**, nicht auf den noch fehlenden
Teil des Balkens. Der Questbonus zählt nur für den Charakter.

| Levelstand | Charakter: 60 / 90 Min. | Skill: 60 / 90 Min. |
|---|---:|---:|
| Charakter 1 / Skill 1 | 24,2 % / 34,2 % | 24,0 % / 36,0 % |
| Charakter 12 / Skill 9 (Demo) | 8,5 % / 12,1 % | 10,9 % / 16,4 % |
| Charakter 25 / Skill 25 | 4,8 % / 6,8 % | 5,2 % / 7,8 % |

Bei einem auf **Level 1 erstellten persönlichen Board** ergeben dieselben Calisthenics-Einträge
mit einer offenen Calisthenics-Quest **280 / 400 Charakter-XP** (240 / 360 Aktivitäts-XP + 40 Quest-XP).
Später gilt `240 / 360 + gespeicherter Questbonus`: Ein auf Level 20 erstellter Plan gibt zum Beispiel
340 / 460 Charakter-XP. Ohne passende offene Quest gibt es keinen Questbonus. Skill-XP und
Boss-Schaden ändern sich nicht.

Ein bereits fast voller Balken darf durch eine einzelne Aktivität weiterhin ein Level erreichen;
überschüssige XP bleiben erhalten. Die Zeitbeispiele dienen ausschließlich dem Spielbalancing
und sind keine Trainingsvorgabe. Weitere Spieltests sollen die langfristige Progression kalibrieren.

Die Beispiel-Gesamt-XP und Basisattribute erhalten weiterhin die bisherigen Charakter-/Skill-Level
und sichtbaren Attribute. Ein frischer lokaler Spielstand startet deshalb bei Charakter-Level 12
mit 25.926 Gesamt-XP und Boss-HP 1.460/2.400. Das ist ein klar benannter Beispielstart; ein echtes
Level-1-Konto startet dagegen bei 0 XP mit serverseitigem Onboarding. Der alte lokale Testadapter
rekonstruiert Einträge weiterhin mit den klassischen Questregeln. Balanceänderungen dürfen dessen
Journal nicht nachträglich anders auswerten.

### Persönliche Tagesquests im Account

Aus den im Fokus gewählten Skills entstehen höchstens drei verschiedene Tagesquests. Bei ein
oder zwei Skills gibt es entsprechend weniger Quests; es werden keine fremden Interessen ergänzt.
Ab vier ausgewählten Skills rotiert der Ausschnitt deterministisch pro Servertag. Ein Neustart
oder erneutes Laden würfelt keine anderen Aufgaben aus.

| Skill | Zielminuten |
| --- | ---: |
| Calisthenics / Weightlifting / Healthy Cooking | 20 |
| Running / Swimming / Boxing / BJJ / Reading | 15 |
| Meditation / Recovery / Languages / Instrument üben | 10 |
| Programming | 30 |
| Breathwork | 5 |

Der Bonus einer persönlichen Quest wächst mit dem Charakterlevel beim Erstellen des Tagesplans:
`max(40, round((1200 + 200 × (Level − 1)) × 0,02 / 5) × 5)` Charakter-XP. Gerundet wird auf den
nächstgelegenen Fünferschritt. Es zählt die gesamte aktuelle Levelspanne, nicht der noch fehlende Balken.

| Level beim Erstellen | Bonus je Quest | Maximaler Bonus bei drei Quests |
| --- | ---: | ---: |
| 1 | 40 XP | 120 XP |
| 10 | 60 XP | 180 XP |
| 20 | 100 XP | 300 XP |
| 50 | 220 XP | 660 XP |

`bonusXp` wird mit der Quest gespeichert. Ein Levelaufstieg während des Tages erhöht laufende oder
abgeschlossene Questboni nicht nachträglich; der nächste neu erzeugte Plan verwendet das dann
aktuelle Level. Weniger als drei ausgewählte Skills ergeben entsprechend weniger Boni. Diese XP
zählen nur für den Charakter, nicht für Skills oder Wochenboss-Schaden. Die Minuten bleiben
optionale Spielziele, keine Trainings- oder Gesundheitsvorgaben. Belohnte Minuten, Tageslimits,
Questfortschritt und Idempotenz bleiben serverseitig kontrolliert.

Beim ersten Onboarding oder vor jeder Aktivität des laufenden Tages darf eine Fokusänderung
das noch unberührte Board ersetzen. Sobald eine Aktivität vorhanden ist — auch ohne XP — oder
eine Quest Fortschritt/Abschluss hat, bleibt das gesamte Board bis morgen erhalten. Dadurch
lassen sich durch Fokuswechsel keine zusätzlichen Bonusquests erzeugen. Am nächsten Servertag
wird das Board aus der dann gespeicherten Auswahl gebildet. Frühere XP werden nicht neu berechnet.

Das öffentliche Beispiel und der lokale Replay-Testadapter behalten ihr klassisches Board mit
50/30/40 Bonus-XP. Sie haben keine historischen Questplan-Ereignisse und geben keine Accountrechte.
Die Produktableitung aus elf passenden Apps und Spielen sowie weitere priorisierte Ideen stehen in
[COMPETITOR_RESEARCH.md](COMPETITOR_RESEARCH.md). Eigene Routinen, Fokustimer und erzählte Kapitel
bleiben geplante Erweiterungen.

### Sichtbarer Ausblick: Am Horizont

Das Account-Dashboard zeigt die aktuelle bereits entdeckte, noch unbesiegte Storybegegnung auf
Normal: Mindestlevel, empfohlenes Level, fehlende Charakter-XP und die konkrete Kosmetik beim
ersten Sieg. Ein erreichtes Mindestlevel öffnet die Begegnung, garantiert aber keinen Sieg.
Daneben steht die nächste noch nicht erhaltene Level-Aura mit einer künftig erreichbaren Schwelle.
Bereits überschrittene Schwellen ohne gespeicherten Besitz werden nicht als nachträgliche Belohnung
versprochen. Erhaltene Kosmetik wird nicht erneut angeboten; spätere Bossidentitäten bleiben verborgen.

Dieser Ausblick verändert keinen Spielstand und vergibt weder XP noch Claims. Nach allen passenden
Zielen verschwindet er. Die öffentliche Demo zeigt ihn nicht, da Probekämpfe dort keine Bossbeute geben.

### Perioden und historischer lokaler Verlauf

Im Account-Spiel bestimmt Spring Boot den Tag in `Europe/Vienna`; Tagesquests folgen dem
persönlichen Plan oben. Die folgenden Regeln zum Gerätedatum und Journal gelten nur für den
isolierten lokalen Testadapter, nicht für die aktive Online-Kontofassung.

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
Die Taktikwahl erweitert nicht den Bosszugang: Live-Free-Probekämpfe bleiben auf die fünf
Normal-Bosse bis Basislevel 50 begrenzt.

### Automatische Begegnungen und separate Kampfübung

Die akzeptierte Richtung ergänzt den sichtbaren Fortschritt um seitliche, automatisch
ablaufende RPG-Begegnungen: Held links, Boss rechts, abwechselnde Angriffe, HP und ein lesbarer
Verlauf. AdventureQuest ist nur eine Präsentationsreferenz; Herovera verwendet eigene Figuren,
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

### Erspielbare Auren mit festem Design

`CharacterAura` stellt Waldlicht, fünf Aktivitätsbelohnungen und zwanzig Boss-Auren dar.
Insgesamt 26 eigenständige transparente Bilder werden auf Dashboard, im Creator und im Kampf
gleich ausgerüstet angezeigt. Dämmerungs-/Blutmondvarianten haben eigene neue Bilder statt
Tönungsaliasen. Die zehn Bossfamilien vergeben ihre Auren bei epischen und ultimativen Erst-Siegen.
Gesicht und Körper bleiben durch eine offene Bildmitte erkennbar. Alle Effekte sind kosmetisch;
Chakra bezeichnet ein Fantasy-Motiv ohne gesundheitliche Bedeutung.

**Nur Ohne Aura und Waldlicht sind Starter.** Freie Aura-Farben und das bisherige Aura-Labor
sind entfernt. Jede neue Palette gehört zu einem eigenständig freigeschalteten Design.
Gesichtsausdruck und Irisleuchten sind spätere Erweiterungen. Alte gültige Rosenlicht-/
Schattenflamme-Ausrüstung oder verdiente Rechte bleiben durch eine enge Bestandsmigration erhalten.

`AURA_REWARDS` enthält fünf Aktivitätsbelohnungen:

| Aura | Einmaliger Auslöser | Eigener Effekt |
|---|---|---|
| Rosenlicht · `rose` | Belohnte Aktivität erreicht von unten Charakterlevel 5 | Rosa Blüten und Licht |
| Schattenflamme · `void` | Belohnte Aktivität erreicht von unten Charakterlevel 10 | Violette Flammenschweife |
| Nordlicht · `aurora` | Belohnte Aktivität erreicht von unten Charakterlevel 20, einschließlich Quest-XP | Grün/petrol/violette Lichtbänder |
| Sternenkranz · `starlight` | Belohnte Aktivität erreicht von unten Charakterlevel 40 | Gold/violette Konstellationen |
| Moosseele · `moss-spirit` | Belohnte Aktivität besiegt den lebenden Mooswächter | Leuchtende Blattranken und Waldgeist |

Diese Grants erfolgen automatisch atomar mit dem Aktivitätsergebnis; keine Zufallschance oder
zusätzlicher Claim. Jede Aura wird nur einmal gesammelt. Mehrere gleichzeitig erfüllte
Bedingungen sind möglich. Duplicate-Requests, Einträge ohne Aktivitäts-XP und bereits besiegte
Wochenbosse vergeben nichts. Level-Auren werden beim echten Schwellenübertritt verdient,
nicht beim bloßen Laden eines hohen Levels.

`unlockedAuras` gehört zum servergespeicherten Account-Snapshot. Dashboard und Creator zeigen die
Sammlung; nur Starter und verdiente IDs sind anlegbar. Server und Profilnormalisierung kennen die
fünf Aktivitäts- und zwanzig Boss-Auren; der Server prüft den tatsächlichen Besitz. Der lokale
Demo-Adapter verwendet weiterhin sein Aktivitätsjournal und erzeugt keine Account-Belohnungen.
Ein allgemeines Iteminventar bleibt offen; die Boss-Sammlung ist bereits serverautorisiert.

## Erfolgsmomente

Nach einem akzeptierten Aktivitätseintrag werden alter und neuer Zustand verglichen. Auslöser:
Charakter-Levelaufstieg, Skill-Levelaufstieg, erster belohnter Eintrag des Tages, Abschluss aller
Daily Quests, Sieg über den Wochenboss oder eine neu verdiente Aura. Einzelne Questabschlüsse erhalten normales Fortschritts-
feedback, aber keinen eigenen Jingle. Die Erfolgskarte bündelt gleichzeitig erreichte Meilensteine
für ungefähr sechs Sekunden; ein kleines CSS-Feuerwerk und eigene kurze Web-Audio-Motive für
Quest, Level, Boss-Sieg und Loot begleiten sie. Das priorisierte Ereignis bestimmt den Klang.
Es werden keine RuneScape-Sounds oder fremden
Assets verwendet. Mehrere übersprungene Level erzeugen einen zusammengefassten Übergang.

Ton, Feuerwerk und Charakterbewegung werden separat gesteuert und lokal gespeichert. Reduzierte
Bewegung unterdrückt bewegte Effekte; der Erfolg bleibt als Text sichtbar. Audio startet nur im
Rahmen einer Nutzerinteraktion und darf bei fehlender Browserunterstützung die Aktivität nicht
blockieren. Laden, Demo-Reset, Profilspeicherung und doppelte Requests lösen keine wiederholte
Feier aus. Eine ausdrücklich beschriftete Vorschau demonstriert den Effekt ohne Spielmutation.
Diese Rückmeldung ist noch kein persistiertes Achievement-/Inventarsystem.

## Free und Membership

Der V1-Vertrag ist implementiert: Free enthält den grundlegenden Aktivitäts-/Avatar-/Skill-/
Questkreislauf, Erholung, permanente Progression und **fünf Normal-Bosse bis einschließlich
Wolkenkönig auf Basislevel 50**. Skills, XP und Charakterlevel haben keine neue Abo-Grenze.
Aktives Plus öffnet **35 weitere Begegnungen**: alle Modi der Bosse auf Basislevel 60–100
und Hard/Episch/Ultimate der ersten fünf Bosse. Bestehende Entdeckungs- und Levelvoraussetzungen
bleiben bestehen. Derselbe Zugang gilt für Probekämpfe; Wiedergabe ist kein Umgehungsweg. Dazu kommen **10 % Charakter-Aktivitäts-XP**
(`floor(Aktivitäts-XP / 10)`), keine zusätzlichen Skill-XP, Questboni oder direkten Kampfboni.
Dokumentierte reale Leistungen und Tageslimits ändern sich nicht.

Nach Abo-Ende bleiben verdiente XP, Level und Cosmetics im bestehenden Konto; erworbene Looks
bleiben ausrüstbar. Nur der Zugang zu Plus-Kämpfen und der XP-Zuschlag enden.
Kontolöschung ist davon getrennt und kündigt kein Store-Abo. Kein bezahlter Erholungszwang.
Neue Skills/Subskills, Questreihen und Story-Kapitel sind spätere Ziele und kein V1-Kaufversprechen.

Preisziel: **3,99 € pro Monat**; der tatsächliche lokalisierte Preis stammt aus dem Store.
Kein beschlossener Jahresplan oder Probezeitraum. Der frühere 4,99-€-Kandidat ist keine
Preisänderung. Der ausdrücklich lokale Standard `EVERBLOOM_BILLING_MODE=preview` bleibt eine
gekennzeichnete kostenlose Testvorschau aller Modi, ohne Käufe und Bonus; kein gekauftes Plus. In `live` prüft der Server die Plus-Berechtigung über
RevenueCat. Store-Produkte, reale Kauf-/Restore-Abnahmen und öffentlicher Betrieb stehen aus.
Verbindliche Details: [MONETIZATION.md](MONETIZATION.md), Freigabe: [RELEASE_V1.md](RELEASE_V1.md).
Eigene Bild-/Klangrichtung: [VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md).

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
- Regionale Store-Preisumsetzung, tatsächliche Provider-Verbindung, Kauf-/Restore-/Ablaufabnahmen
  und Support bei gelöschtem Kaufkonto vor Verkaufsfreigabe; V1-Inhaltsgrenzen sind festgelegt.
- Professionelle Rig-/Bossassets nach festgelegter [Animation Pipeline](ANIMATION_PIPELINE.md),
  mobile Budgets und gegebenenfalls Spine-Nutzungsrechte vor breiter Content-Produktion.
- Produktive Begegnungsauslöser, Kampfgewichtung, Schwierigkeit, Rewards und versionierte
  Ablösung/Verknüpfung des bisherigen Wochenboss-Schadens vor serverseitiger Kampfanbindung.


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

Ein Bossabschluss verleiht weiterhin genau **eine Belohnungsfamilie**. Haar und Outfit besitzen
je eine männliche und weibliche Darstellung; Sammlungsbild und passende Modulzuordnung folgen
der aktuellen Charakterdarstellung. Ein Wechsel der Darstellung erfordert keinen zweiten Drop
und vergibt keine doppelte Belohnung. Das sind weiterhin **40 Besitz-IDs**, nicht 60.
Die zwanzig Aura-Belohnungen bleiben für beide Darstellungen gemeinsam. Farben und Aura-Besitz
ändern sich durch diese Varianten nicht.

Der Server entscheidet Kampf und Besitz; Vorschauen und Wiederholungen gewähren keine
zusätzliche Beute oder Charakter-XP. Verbindliche Regeln und Grenzen stehen in
[BOSS_ENCOUNTERS.md](BOSS_ENCOUNTERS.md). Die konkreten Bild- und Klangvorgaben stehen in
[VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md). Datierte ältere Abnahmen beschreiben
jeweils ihren damaligen Katalog; aktuelle Nachweise stehen in [VALIDATION.md](VALIDATION.md).
