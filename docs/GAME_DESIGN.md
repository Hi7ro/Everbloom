# Game Design · V0.3

Stand: 2026-09-08. **Verbindliche Produktrichtung, vorläufiges Balancing.**

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
Quests, Bosswerte oder Momentum. Reichere Avatarreaktionen sind M2. Backend, Authentifizierung und Persistenz
bleiben eigenständige Bestandteile des bestehenden M1b-Plans.

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
Haut-/Augen-/Haarfarbe und Starter-Aura sind mit direkter Vorschau wählbar. Jede Farbgruppe bietet
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
werden separat gespeichert, XP bleiben flüchtig. Frühere Profile werden über den bestehenden
Migrations-/Normalisierungspfad gelesen; alte technische Felder sind keine weiter angebotenen
Editor-Modi. Der Demo-Reset erhält das Profil. Gesperrter Speicher wird als Sitzungsfallback erklärt.

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
Sitzung. Das ist noch kein synchronisiertes Accountprofil oder dauerhafter Fortschrittsstand.

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
Loot und Boss-Siegbonus kommen später; die Demo zeigt beim Sieg den besiegten Zustand.

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

Die Demo-Gesamt-XP und Basisattribute sind an die neue Kurve angepasst, sodass die vorhandenen
Charakter-/Skill-Level und sichtbaren Attribute erhalten bleiben. Es existieren keine echten oder
persistierten Fortschrittsstände; eine XP-Datenmigration ist daher nicht erforderlich. Die separate
lokale Speicherung von Name/Aussehen ändert diese Aussage nicht.

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
mit lokalem Datumswechsel ist vorhanden; ihre vollständigen Recovery-/Rest-/Cheat-Day-Regeln und
automatische Spielperioden sind **noch nicht Teil der Demo**. Der Wochenrhythmus ist ein Mock-Snapshot.

Streaks richten sich später nach Zielrhythmus (z. B. dreimal pro Woche statt jeden Tag).
Kein Anreiz, Erholung zugunsten eines täglichen Sport-Streaks auszulassen. Cold Exposure bekommt
keine eskalierenden Risiko-/Dauerbelohnungen. Limits und spätere Personalisierung sind gesondert zu testen.

## Quests, Boss und Rewards

Daily und Weekly Quests bilden kurze bzw. mehrtägige Ziele ab. Persönliche Bosse bündeln einen
Wochenfokus; langfristige Bossquests können Pull-up, Projektabschluss oder Prüfung darstellen.
Phasen geben Feedback, erzwingen keine gefährlicheren Aktivitäten. Loot: Equipment und Cosmetics,
Seltenheit unabhängig von Stil. Achievements für echte Meilensteine (z. B. erster Boss, 100 Einträge),
Titles als sichtbare Identität. Inventar, Drop-Tabellen und Claims folgen nach der Basisprogression.

### Aura-Vorschau und geplanter Fortschritt

`CharacterAura` stellt drei Starter-Effekte sowie zehn erweiterte Entwürfe im Creator dar:
Sterne, mystische Zeichen, innere Energie/Chakra, Dämonenschatten, Licht, Energieströme, Engelsflügel,
Kirschblüten, Feuer und Geistwächter. Die eigene Namens- und Formensprache steht im
[Art Guide](ART_DIRECTION.md#aura-richtung-und-aktueller-vorschauumfang). Die erweiterten Entwürfe
sind ausdrücklich nur Vorschau, mit sechs Farben und ohne Speicherung/Freischaltung. Der optionale
bedrohliche Blick sitzt derzeit im Schatten hinter der Figur, nicht in ihren echten Augen.
Gesichtsausdruck und Irisleuchten werden später separat gestaltet. Auren sind rein kosmetisch;
Chakra ist ein Fantasy-Motiv ohne gesundheitliche Bedeutung. Ganzkörper-VFX mit Boden-, Rücken-
und Vorderpartikeln sind das Ausbauziel, keine bereits vollständige Produktions-VFX-Bibliothek.

Die vier Starter-Auren bleiben verfügbar: Ohne Aura, Waldlicht, Blütenzauber und Leere.
`AURA_PROGRESSION_PLAN` beschreibt drei spätere kosmetische Ziele: **Nordlicht ab Charakterlevel 20**,
**Sternenkranz ab Charakterlevel 40** und **Moosseele als Bossdrop des Mooswächters**. Eine Dropchance
ist nicht festgelegt. Diese Ziele erscheinen im Creator ausdrücklich als geplant und sind noch
nicht freischaltbar oder ausrüstbar. Ein Preview-Level darf keine Aura gewähren. Es existieren noch
keine persistierten Besitzrechte, Loot-Vergabe oder Claims. Die spätere Freischaltung benötigt einen
geprüften Besitz-/Reward-Pfad in M2; die aktuellen Level-/XP-Regeln bleiben unverändert.

## Erfolgsmomente

Nach einem akzeptierten Aktivitätseintrag werden alter und neuer Zustand verglichen. Auslöser:
Charakter-Levelaufstieg, Skill-Levelaufstieg, erster belohnter Eintrag des Tages, Abschluss aller
Daily Quests oder Sieg über den Wochenboss. Einzelne Questabschlüsse erhalten normales Fortschritts-
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
- Momentum-Abnahme, Zeitzonenwechsel, Recovery-/Cheat-Day-Kontingente und Streak-Regeln vor Persistenz.
- Membership-Inhaltsgrenzen, Kündigungsregeln, regionale Preisumsetzung und Store-Abrechnung vor M3.
- Asset-Pipeline, Barrierefreiheit der Effekte und verbindliche eigene Welt vor breiter Content-Produktion.
