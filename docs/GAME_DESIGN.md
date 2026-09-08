# Game Design · V0.2

Stand: 2026-09-08. **Verbindliche Produktrichtung, vorläufiges Balancing.**

## Vision und Core Loop

Der Nutzer ist der Charakter. Eine reale Aktivität wird eingetragen, gibt Charakter- und Skill-XP,
entwickelt passende Attribute und zählt zu Quests und einem persönlichen Wochenboss. Fortschritt
wird sofort sichtbar. Neue Ziele und kosmetische Belohnungen führen zur nächsten realen Aktivität.
Keine automatische Bewertung der tatsächlichen menschlichen Leistungsfähigkeit: Stats sind Spielwerte.

## Identität und Art Direction

Modulare 2D-Chibi-Figur mit großen Köpfen und kompakten, lesbaren Körpern. Creator-Ziel: Name,
Körperform, Haut, Gesicht/Augen, Haare/Farbe, Starter-Outfit und Fokus. Spätere Slots: Kopf, Körper,
Schuhe, Waffe, Nebenhand, Rücken, Accessoire, Aura und Companion. Feste Anker, Leinwand und
Zeichenreihenfolge machen Assets austauschbar. Gameplay-Equipment und sichtbarer Look sind getrennt.

Ästhetiken: **Cozy → Adventurer → Elegant → Dark → Abyssal**. Freie Mischung, keine Klassenbindung.
Jede Ästhetik kann jede Seltenheit haben. Eigenständige Figuren und Lore; Genre-Inspiration erlaubt,
keine übernommenen Designs, Rassen, Jobs, Waffen oder Franchise-Begriffe. UI: ruhiges, dunkles
High Fantasy mit warmen Naturakzenten, gut lesbaren Daten und sparsamem Effektgebrauch.
Der erste Slice verwendet bewusst einen einfachen Chibi-Platzhalter statt fertiger Produktionsassets.

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
persistierten Spielstände; eine Datenmigration ist daher nicht erforderlich.

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

## Free und Membership

Free bleibt dauerhaft spielbar: sinnvoller Skillmix, wiederkehrende Daily/Weekly Quests,
persönliche Bosse und permanente Progression. Membership erweitert das Spiel um zusätzliche
Skills/Subskills, Questreihen, Bosse, Progressionspfade und Cosmetics. Vorläufiger Kandidat:
10 % mehr **Charakter-Aktivitäts-XP**, keine Veränderung dokumentierter realer Leistungen.
Kein bezahlter Zwang zur Erholung, keine verlorenen verdienten Inhalte bei Kündigung;
genaue Nutzbarkeit von Member-Inhalten nach Ablauf ist vor M3 festzulegen.
Entitlements und Preis werden nicht im UI erfunden. Demo ist Free, ohne Checkout oder XP-Vorteil.

## Spätere Welt

Classes/Archetypes entstehen optional aus Spielstil, sperren keine reale Fähigkeit.
Parties, Guilds und Raids folgen erst nach stabilem Solo-Spiel. Keine Social-Plattform im MVP.

## Offene Entscheidungen

- Finales XP-Balancing, Tageslimits, Skillgewichtung und Maximallevel durch Spieltests.
- Momentum-Abnahme, Zeitzonenwechsel, Recovery-/Cheat-Day-Kontingente und Streak-Regeln vor Persistenz.
- Membership-Inhaltsgrenzen, Kündigungsregeln, Preise und Store-Abrechnung vor M3.
- Asset-Pipeline, Barrierefreiheit der Effekte und verbindliche eigene Welt vor breiter Content-Produktion.
