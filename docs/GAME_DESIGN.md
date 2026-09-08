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
Der aktuelle Ausdruck beschränkt sich auf visuelle Gesten und eine kurze Reaktionszeile passend
zur letzten belohnten Aktivität oder zum freiwilligen Tages-Check-in. Vier Tagesmodi und drei
Energieangaben sind lokal gespeichert; Auslassen bleibt folgenlos. Der Check-in ändert keine XP,
Quests, Bosswerte oder Momentum. Reichere Avatarreaktionen sind M2. Backend, Authentifizierung und Persistenz
bleiben eigenständige Bestandteile des bestehenden M1b-Plans.

## Identität und Art Direction

Modulare 2D-Chibi-Figur mit ausdrucksstarkem Gesicht und gut sichtbarem, lesbarem Körper. Creator-Ziel: Name,
Körperform, Haut, Gesicht/Augen, Haare/Farbe, Starter-Outfit und Fokus. Spätere Slots: Kopf, Körper,
Schuhe, Waffe, Nebenhand, Rücken, Accessoire, Aura und Companion. Feste Anker, Leinwand und
Zeichenreihenfolge machen Assets austauschbar. Gameplay-Equipment und sichtbarer Look sind getrennt.

Die freigegebene [Art Direction](ART_DIRECTION.md) hält die bestätigte Anime-Chibi-Vorlage mit markanter Ausstrahlung, ausdrucksstarken Augen und detaillierten Stoff-/Metallflächen fest. Auf ausdrücklichen Wunsch wird das exakte Originalmotiv als fester illustrierter Look übernommen; eine reine Freistellung erhält sein Design. Die fünf Stilfamilien und beide Darstellungen behalten denselben Qualitätsanspruch als eigene IP. Der bestehende modulare SVG-Prototyp bleibt davon getrennt; ein passendes Rig und eigene Frisur-/Outfitvarianten in dieser Bildqualität folgen später.

Ästhetiken: **Cozy → Adventurer → Elegant → Dark → Abyssal**. Freie Mischung, keine Klassenbindung.
Jede Ästhetik kann jede Seltenheit haben. Eigenständige Figuren und Lore; Genre-Inspiration erlaubt,
keine übernommenen Designs, Rassen, Jobs, Waffen oder Franchise-Begriffe. UI: ruhiges, dunkles
High Fantasy mit warmen Naturakzenten, gut lesbaren Daten und sparsamem Effektgebrauch.
### M1a-Ausbau – Creator v2

Unter `/character/create` lassen sich Name, männliche/weibliche Darstellung, Körperform, Haare,
Outfit und Aura sowie Haut-, Haar- und Outfitfarbe mit sofortiger Vorschau bearbeiten. Die visuelle
Auswahl `presentation: 'male' | 'female'` unterscheidet Gesicht, Körpersilhouette und Outfitdetails
klar und bleibt eine unsexualisierte Chibi-Darstellung. Sie verändert keine Stats, Skills, Rewards
oder Stilzugänge und ist keine Aussage über das reale Geschlecht des Nutzers.

Beide Darstellungen erhalten je sechs eigene Starterfrisuren:

| Darstellung | Starterfrisuren-IDs |
|---|---|
| Männlich | `m-spiky`, `m-undercut`, `m-curtains`, `m-messy`, `m-swept`, `m-topknot` |
| Weiblich | `f-bob`, `f-long`, `f-ponytail`, `f-twin-tails`, `f-braid`, `f-pixie` |

Namen, Optionen und die Zuordnung der Frisur zur gewählten Darstellung werden validiert. Profil-
Schemaversion 2 speichert nur Name/Aussehen; weder Interessen noch XP gehören hinein. Version 1
wird ausdrücklich migriert: technischer Default `male`, alte Frisuren `tousled` → `m-spiky`,
`bob` → `m-curtains`, `braid` → `m-topknot`. Der Default dient der Datenkompatibilität und leitet
keine demografische Eigenschaft ab. Der Demo-Reset erhält das Profil. Zusätzliche frei wählbare
Gesichts-/Augenoptionen, weitere Slots, aktiver Skillmix und vollständiges Onboarding folgen M1b/M2.

Die aktuelle Gestaltungsrichtung ist ein stylischer Chibi in leicht seitlicher Dreiviertelansicht,
mit Highlights und Schatten für räumliche 2.5D-Wirkung. Zusätzlich zur Originalillustration
besteht der frei gestaltbare modulare SVG-Prototyp. Subtile Atmung/Idle und interessenbezogene Gesten vermitteln Leben. Das Dashboard
verwendet das Charakterlevel und den zuletzt belohnten Skill, ansonsten eine Standarddarstellung;
im Creator sind Interessen-/Levelvarianten lediglich Vorschau. Eine persistente Interessenwahl
ist noch nicht umgesetzt. Vorläufige visuelle Levelbereiche: 1–9, 10–24 und 25+. Sie verändern
weder Stats noch Rewards und sperren keine Stilfamilie. Die Bewegung ist separat abschaltbar
und berücksichtigt reduzierte Bewegung. Die endgültige Assetqualität, ausdrucksstarke Animation
und vollständige modulare Garderobe bleiben ein eigenes Produktionsziel; keine 3D-Engine nötig.

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

Demo aktiv: Calisthenics, Running, Meditation, Programming. Der Datenkatalog ist erweiterbar;
vollständiger Skillbaum und freie Auswahl folgen in M1. Attribute der Zielversion: Strength,
Endurance, Agility, Mobility, Discipline, Focus, Knowledge, Mindfulness, Recovery, Social.
Die Demo zeigt sechs davon; nicht alle Zielsysteme müssen sofort Oberfläche bekommen.

## Recovery, Rest, Cheat Days und Streaks

Erholung ist eine vollwertige Aktivitätsfamilie. Ein geplanter Ruhetag schützt die Kontinuität;
ein freiwilliger Cheat Day pausiert Ziele. Ungeplante Pausen kosten mögliche Tagesbelohnungen,
niemals bereits verdiente XP oder Level. Spätere Momentum-Abnahme bei Inaktivität ist reversibel.
Ein schwieriger Tag kann durch Erholung zum Recovery Day werden. Diese Tagesmodi und automatische
Zeitübergänge sind **noch nicht Teil der Demo**. Der angezeigte Wochenrhythmus ist ein Mock-Snapshot.

Streaks richten sich später nach Zielrhythmus (z. B. dreimal pro Woche statt jeden Tag).
Kein Anreiz, Erholung zugunsten eines täglichen Sport-Streaks auszulassen. Cold Exposure bekommt
keine eskalierenden Risiko-/Dauerbelohnungen. Limits und spätere Personalisierung sind gesondert zu testen.

## Quests, Boss und Rewards

Daily und Weekly Quests bilden kurze bzw. mehrtägige Ziele ab. Persönliche Bosse bündeln einen
Wochenfokus; langfristige Bossquests können Pull-up, Projektabschluss oder Prüfung darstellen.
Phasen geben Feedback, erzwingen keine gefährlicheren Aktivitäten. Loot: Equipment und Cosmetics,
Seltenheit unabhängig von Stil. Achievements für echte Meilensteine (z. B. erster Boss, 100 Einträge),
Titles als sichtbare Identität. Inventar, Drop-Tabellen und Claims folgen nach der Basisprogression.

### Geplanter Aura-Fortschritt

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
