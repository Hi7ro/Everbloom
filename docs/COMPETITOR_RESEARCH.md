# Everbloom · Wettbewerbsanalyse und Produktentscheidungen

Stand und Quellenabruf: **5. Oktober 2026**. Redaktion: Codex im Auftrag des Projektinhabers.

## Methode und Aussagekraft

Diese Analyse untersucht öffentlich beschriebene Produktmechaniken, Einstiegsabläufe und
Bezahlmodelle. Quellen sind Herstellerhilfen, Herstellerseiten und offizielle Store-Einträge.
Es wurden keine Apps installiert, Käufe getätigt, Binärdateien dekompiliert, private APIs untersucht
oder fremde Implementierungen übernommen. Die Quellen belegen die jeweiligen Anbieterangaben,
nicht deren tatsächliche Qualität, Gesundheitswirkung, Nutzungshäufigkeit oder wirtschaftlichen Erfolg.
Store-Inhalte und regionale Preise können sich ändern.

**Beobachtung** bezeichnet eine Quellenangabe; **Ableitung** ist eine eigene Produktentscheidung.
Der Everbloom-Status unten unterscheidet vorhandene Funktionen, laufende Umsetzung und Planung.
Technische und visuelle Abnahme bleibt in [VALIDATION.md](VALIDATION.md) dokumentiert.

## Fünf unterschiedliche Ansätze

| Produkt und Identität | Öffentlich beschriebene Mechaniken | Ableitung für Everbloom | Direkte Quellen |
| --- | --- | --- | --- |
| **Solo Leveling Your Self**, Jksol Infotech LLP; iOS `6770878729`. Eine identische Android-Ausgabe ist nicht belegt. | Zehn Lebenspfade liefern passende Quests und Ziele. Tages-/Wochenplanung mit Kalender, rückgängig machbarem Abschluss und Sperre für Zukunftstage; steigende XP-Schwellen, fünf Werte, Übungsstunden für Skills, persönliche Belohnungen, mehr als 50 Achievements und Verlauf nach XP-Quelle. | Interessen sollen den tatsächlichen Tagesplan beeinflussen. Kuratierte Meilensteine und nachvollziehbare Fortschritte sind wichtiger als eine große Zahl abstrakter Rangtitel. | [App Store Österreich](https://apps.apple.com/at/app/solo-leveling-your-self/id6770878729) |
| **SelfQuest**, James Kirkham; iOS `6498150329`, Android `com.jameskirkham.sq`. | Trainingsplan nach Ziel und Zeit, eigene Hauptquests und zufällige Nebenaufgaben. Kamera-Repszähler; XP, Gold und Ausrüstung. Klassen, kombinierbare Rüstung, Dungeons/Gate-Bosse, Freunde, Gilden und PvP. | Eine sichtbare Verbindung zwischen realer Aktivität, Charakter und nächster Begegnung. Für die Beta den Solo-Kreislauf verständlich halten; Kooperation später ergänzen. Repszählung und soziale Systeme nicht als Voraussetzung für gutes Tracking behandeln. | [Google Play](https://play.google.com/store/apps/details?id=com.jameskirkham.sq&hl=en), [Herstellerseite](https://selfquest.net/) |
| **Habitica**, HabitRPG Inc. | Flexible Habits, regelmäßig fällige Dailies und einmalige To-dos. Erfolge ergeben Gold/XP/Ausrüstung; Party-Quests verbinden Aufgaben mit gemeinsamen Gegnern. Kostüm und Kampfausrüstung sind getrennt. Negative Habits und verpasste Dailies können HP kosten; Questschaden kann die Gruppe betreffen. | Klare Aufgabentypen, freie Modewahl und spätere Zusammenarbeit übernehmen. HP-Strafen für verpasste Alltagspflichten und Schuld gegenüber einer Gruppe passen nicht zu Everblooms Erholungsprinzip. | [FAQ](https://habitica.com/static/faq), [Features](https://habitica.com/static/features) |
| **Finch**, Finch Care | Wenige Startziele; Abschlüsse geben dem Begleiter Energie für Abenteuer mit Geschichten und Entdeckungen. Ziele sind wiederholbar, pausierbar und verschiebbar. Kleidung/Wohnraum und freiwillige Self-Care-Angebote ergänzen den Alltag. | Der eigene Chibi soll freundlich auf reale Fortschritte reagieren. Wenige nächste Schritte, Pausen und ein ruhiger Wiedereinstieg bleiben gleichwertig zu großen Erfolgen. Kein zusätzliches Haustier nötig. | [Einstieg](https://help.finchcare.com/hc/en-us/articles/42149821015693-New-User-Guide), [Ziele](https://help.finchcare.com/hc/en-us/articles/37779940291213-Creating-and-Completing-Goals) |
| **LifeUp: Gamify Tasks & Habits**, LifeUp Apps; Android `net.sarasarasa.lifeup`. | Eigene Skills mit XP, wiederkehrende Aufgaben, Checklisten, Erinnerungen und Fokustimer. Eigener Belohnungsshop, konfigurierbare Achievements, Items und Crafting; Export/Backup und Offline-Nutzung werden angeboten. | Später einfache eigene Routinen und persönliche Ziele erlauben. Die Beta verlangt keine selbst entworfene Wirtschaft oder XP-Formel; bestehende Tageslimits bleiben verbindlich. | [Google Play](https://play.google.com/store/apps/details?id=net.sarasarasa.lifeup) |

Namensabgrenzung: SelfQuest hier ist das Fitness-RPG von James Kirkham, nicht `selfquest.com`.
Das exakt gefundene Solo-Produkt ist nicht „Solo X Player“ oder „Level Up: Solo Leveling System“.
LifeUp wird nicht mit **ulives**, dem separaten iOS-/Android-Nachfolger, gleichgesetzt.
[Herstellerinformation zu ulives](https://ulives.lifeupapp.net/)

## Weitere App-Referenzen

Diese drei Produkte ergänzen den Vergleich um flexible Routinen, kleine Zielschritte und eine
direkte Verbindung zwischen Aufgaben und RPG-Fortschritt. Auch hier sind die Ableitungen eigene
Entscheidungen, keine gemessenen Vorteile für Everbloom.

| Produkt | Belegte Anbieterangabe mit Quelle | Ableitung und Grenze für Everbloom |
| --- | --- | --- |
| **HabitKit**, Sebastian Röhl | Tages-, Wochen- oder Monatsziele zählen erfolgreiche Tage; mehrere Einträge eines Tages ersetzen keine mehreren Tage. Ein Wochenziel lässt freie Tage zu. Eigene feste Wochentage für die Streak-Regel werden in dieser Hilfe ausdrücklich nicht angeboten. Das Kalenderraster zeigt Tageszellen und Teilfortschritt. [Streak-Regeln](https://habitkit.app/help/habits-and-streaks/how-streaks-are-counted), [Kalenderraster](https://habitkit.app/help/getting-started/how-the-grid-works) | Später Frequenzziele wie dreimal pro Woche statt einer Pflicht zu täglichen Erfolgen. Die vorhandene Wochenübersicht mit echten gespeicherten Aktivitäten verwenden; keine Streak-Regel oder Pausensicherung als bereits implementiert ausgeben. |
| **SuperBetter** | Thematische Challenges verbinden ein persönliches Ziel mit kleinen Quests, Hindernissen, hilfreichen Handlungen und Unterstützung. Die Hilfe empfiehlt eine sinnvolle Reihenfolge; verpasste Challenge-Tage lassen sich nachholen. [Challenges](https://superbetter.zendesk.com/hc/en-us/articles/13566227442075-What-is-a-Challenge), [Reihenfolge](https://superbetter.zendesk.com/hc/en-us/articles/13070030167963-Do-I-need-to-play-Challenges-in-Order) | Eigene kleine Zielpfade mit klarer nächster Etappe planen; Rückkehr ohne Scham. Keine Gesundheitswirkung für Everbloom aus fremden Wirksamkeitsaussagen ableiten und keine Texte oder Methodennamen übernehmen. |
| **Habit Hunter: Gamified Routine**, iOS `1417258775`, Android `co.au.goalhero` | Eigene Routinen und Aufgaben geben XP/Gold; Ausrüstung und Gegner verbinden Tracking mit Spielzielen. Der Store beschreibt Zielzerlegung, Erinnerungen, Pomodoro und ein Widget. [App Store](https://apps.apple.com/us/app/habit-hunter-rpg-habit-tracker/id1417258775), [Google Play](https://play.google.com/store/apps/details?id=co.au.goalhero&hl=en) | Den Zusammenhang Aktivität → Fortschritt → nächste Begegnung direkt zeigen. Bestehende Boss- und Cosmetic-Regeln wiederverwenden; keine zusätzliche Währung oder unbegrenzte Timer-Belohnung einführen. |

## Spiel-Referenzen für Tempo, Ausdruck und Rückmeldung

| Spiel | Belegte Anbieterangabe mit Quelle | Ableitung und Grenze für Everbloom |
| --- | --- | --- |
| **Spirit City: Lofi Sessions**, Mooncube Games; Steam `2113850` | Fokuswerkzeuge mit Aufgabenliste, Timer, Habit-Tracker und Journal. Avatar/Raum sind gestaltbar; Fortschritt liefert kosmetische Inhalte. Raumaktivitäten und Atmosphäre helfen bei der Entdeckung sammelbarer Spirits. [Offizieller Steam-Eintrag](https://store.steampowered.com/app/2113850/Spirit_City_Lofi_Sessions/) | Geplanter Fokusmodus mit vorhandenem Chibi und sichtbarem nächstem Sammelziel. Keine zweite Wohnraum-/Haustiersimulation nötig. Ein laufender Timer beweist keine reale Leistung; neue Audioinhalte brauchen eigene oder passende Lizenzen. |
| **Cozy Grove**, Spry Fox; Steam `1458100` | Reale Tage gliedern neue Quests und langsam erzählte Charaktergeschichten. Helfen verändert die Landschaft sichtbar; Sammeln und Gestalten bleiben daneben möglich. [Offizieller Steam-Eintrag](https://store.steampowered.com/app/1458100/Cozy_Grove/) Im separaten Nachfolger **Camp Spirit** sind zeitbegrenzte Quests optional und wiederkehrend; Verpassen beeinträchtigt laut Hilfe weder Beziehungen noch Gesamtfortschritt. [Camp-Spirit-Hilfe](https://games-netflix.helpshift.com/hc/en/4-cozy-grove-camp-spirit/faq/289-how-do-campaign-days-and-time-work/?p=all) | Später kleine Kapitel und Chibi-Reaktionen an bereits erreichte Etappen knüpfen. Keine täglich notwendige lange App-Sitzung und keine künstliche Wartezeit vor bereits verdienten Bossfreischaltungen. Ausgelassene Tage vernichten keinen Inhalt. |
| **Ring Fit Adventure**, Nintendo | Reale Bewegung trägt das Abenteuer. Daneben gibt es kurze Minispiele und eigene Routinen. Die Intensitätsskala 1–30 verändert Wiederholungen/Haltedauer; Einstellungen sind anpassbar. Nintendo berücksichtigt Pausen und Ruhetage. [Nintendo-Produktseite](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-games/Ring-Fit-Adventure-1638708.html), [Spielmodi](https://en-americas-support.nintendo.com/app/answers/detail/a_id/47747/p/1095/c/120) | Persönlichen Aufgabenumfang von virtueller Boss-Schwierigkeit trennen. Ein höheres Everbloom-Level verlangt nicht automatisch mehr Training. Unsere manuelle Minuteneingabe ersetzt weder Bewegungssensorik noch eine individuelle Trainingsanleitung. |

Gemeinsame Produktentscheidung: Einen nachvollziehbaren Horizont aus **bestehenden** Freischaltungen
zeigen, bevor neue Sammelsysteme entstehen. Sichtbar wird nur die aktuelle bereits entdeckte
Bossbegegnung mit Voraussetzungen und Erstabschluss-Cosmetic sowie die nächste noch nicht besessene,
künftig über ein Level erreichbare Aura. Weitere Bosse bleiben gemäß Kampagnenreihenfolge verborgen.
Geschichten, Fokusmodus und eigene mehrtägige Pfade bleiben geplante Erweiterungen.

## Bezahlmodelle: Beobachtung, keine Umsatzprognose

| Produkt | Belegter Stand | Bedeutung für die Entscheidung |
| --- | --- | --- |
| Solo Leveling Your Self | Österreichischer Store zeigt kostenlos; die Beschreibung nennt „Premium“-Funktionen, aber keinen belegten Preis oder nachgewiesenen Paywall-Umfang. [Quelle](https://apps.apple.com/at/app/solo-leveling-your-self/id6770878729) | Keine Abo-Kalkulation aus einer Überschrift ableiten. |
| SelfQuest | US-App-Store führt **Monarch Month: 6,99 USD** und **Monarch Year: 39,99 USD** sowie Schlüssel-/Paketkäufe. Keine Bestätigung eines Österreich-Preises. [Quelle](https://apps.apple.com/us/app/selfquest/id6498150329) | Abo und Verbrauchsgüter sind unterschiedliche Modelle; ihre Existenz belegt keine Zahlungsbereitschaft für Everbloom. |
| Habitica | Kostenloser Kern mit optionalen Käufen/Abos; die Hilfe beschreibt zusätzliche monatliche Ausrüstung und Abovorteile. [Store](https://apps.apple.com/us/app/habitica-gamified-taskmanager/id994882113), [FAQ](https://habitica.com/static/faq) | Wiederkehrende Inhalte können Teil eines nachvollziehbaren Angebots sein. |
| Finch | Kern-Self-Care bleibt laut Hersteller kostenlos. Plus ergänzt Gestaltung, Inhalte, Shop-Auswahl und Eventbelohnungen. [Plus-Hilfe](https://help.finchcare.com/hc/en-us/articles/37780200600589-Benefits-of-Finch-Plus) | Zusätzliche Ausdrucksmöglichkeiten und Inhalte erweitern einen nutzbaren kostenlosen Kern. |
| LifeUp | Der Anbieter beschreibt einen Einmalkauf ohne Pflichtabo oder Werbung. Es wird hier kein regionaler Betrag übertragen. [Quelle](https://play.google.com/store/apps/details?id=net.sarasarasa.lifeup) | Ein gutes Produkt benötigt nicht zwangsläufig ein Abo. Everbloom muss seinen laufenden Mehrwert selbst belegen. |

Datenschutz ist nicht praktisch geprüft. Insbesondere widersprechen sich bei Solo die Aussage
„keine Datenerhebung“ im Beschreibungstext und das vom Entwickler gelieferte Store-Label mit
Nutzungs-/Diagnosedaten und Tracking. Das ist ein offener Widerspruch, keine Sicherheitsprüfung.
[Store-Label](https://apps.apple.com/at/app/solo-leveling-your-self/id6770878729)

## Drei einzelne Nutzerhinweise

Diese Rezensionen sind **anekdotisch, nicht repräsentativ** und kein Nachweis heutiger Fehler.
Sie dienen als Fragen für unsere eigenen Tests, nicht als Wettbewerberbewertung.

| Quelle und Datum | Beschriebener Wunsch | Everbloom-Testfrage |
| --- | --- | --- |
| Solo, Hauserj, 9. Juli; Jahr im angezeigten Eintrag nicht genannt. [Rezension im US-Store](https://apps.apple.com/us/app/solo-leveling-your-self/id6770878729) | Dieselbe Lernaufgabe mehrfach pro Tag zählen. | Sind mehrere reale Einheiten nachvollziehbar protokollierbar, ohne Tageslimits oder einmalige Questboni zu umgehen? |
| SelfQuest, Sxrdy, 05.07.2024. [Rezension im US-Store](https://apps.apple.com/us/app/selfquest/id6498150329) | Vorgegebene Schwierigkeitsziele und manuelle Eingabe neben automatischer Erfassung. | Gibt es sofort verständliche Vorschläge und bleibt Tracking ohne Wearable möglich? |
| SelfQuest, Ramil Santos, 10.09.2024. [Rezension bei Google Play](https://play.google.com/store/apps/details?id=com.jameskirkham.sq&hl=en) | Ruhetage berücksichtigen. | Kann jemand aussetzen und später freundlich zurückkehren, ohne bereits verdiente Leistung zu verlieren? |

## Anwendung auf Everbloom

Ausgangslage ist der vorhandene Spielstand, kein Neubau der App. Die folgenden Zuordnungen beziehen
sich auf [GAME_DESIGN.md](GAME_DESIGN.md), [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md),
[BETA_RELEASE.md](BETA_RELEASE.md) sowie die vorhandenen Domain-Funktionen.

| Priorität | Bestehende Grundlage | Nächster Schritt und Status |
| --- | --- | --- |
| **P1 · Passende Tagesquests** | Interessen-Onboarding, 14 protokollierbare Skills, 1–6 Fokus-Skills, freiwillige Tagesvorschläge und serverseitige Questbelohnungen. | **Implementiert und geprüft:** Die tatsächlichen Tagesquests berücksichtigen den persönlichen Fokus. Ihre Boni wachsen mit dem Charakterlevel. Nur bestätigte Aktivität erzeugt Fortschritt; Empfehlungen und Quests sind keine doppelte Belohnungsschicht. |
| **P1 · Sichtbares nächstes Ziel** | Charakter-/Skilllevel, Erfolgseffekte, fünf aufeinanderfolgende Kampagnenbosse und feste Erstabschluss-Cosmetics. | **Implementiert:** „Am Horizont“ zeigt den aktuell entdeckten Boss mit Mindest-/Empfehlungslevel und Erstabschluss-Cosmetic sowie die nächste künftige noch nicht erhaltene Level-Aura. Keine Spoiler weiterer Bosse, zusätzlichen XP oder Claims. Kuratierte Geschichten und mehrtägige Zielpfade bleiben **geplant**. |
| **P1 · Wochenrückblick** | Wochenübersicht mit belohnten Tagen, Skill-Familien, Care-Tag und Aktivitäts-XP. | **Geplant:** Daraus einen kurzen verständlichen Rückblick entwickeln. Die vorhandene Übersicht weiterverwenden; keine fiktive Historie fehlender Questboni oder erfundene Langzeitstatistik. |
| **P2 · Eigene Routinen** | Wiederholte Aktivitätseinträge, Tageslimits, Skillkatalog und persönliche Fokuseinstellungen. | **Geplant:** Einfache Vorlagen, Wochentage, Pausen und optionale Erinnerungen. Vorher Terminwechsel, Kontowechsel und doppelte Eingaben sauber definieren. |
| **P2 · Fokustimer** | Manuelle Minuteneingabe und unverbindliche XP-Vorschau. | **Geplant:** Timer als Eingabehilfe; Hintergrund-/Abbruchverhalten klären. Erst ausdrückliche Bestätigung speichert Aktivität, abgelaufene Zeit ist kein automatischer Leistungsnachweis. |
| **Später · Kooperation** | Der Solo-Kern und persönliche Bosse bestehen; Parties/Gilden/Raids sind Roadmap. | **Geplant:** Freiwillige kleine Gruppen und gemeinsame Ziele. Keine Gruppenstrafe für Krankheit oder ausgelassene Aufgaben. |

Personalisierte Tagesquests, ihre Bonus-Skalierung und die Freischaltungsvorschau sind implementiert.
Automatische Prüfungen, tatsächliche HTTP-Abläufe und die mobile Oberfläche werden getrennt von
weiteren geplanten Funktionen beurteilt. Details und datierte Prüfergebnisse stehen in
[VALIDATION.md](VALIDATION.md).

### Ergänzende Nutzerentscheidung: Questbonus wächst mit dem Level

Diese Regel stammt aus der anschließenden Nutzeranforderung, nicht aus einem übernommenen
Wettbewerbermodell. **Implementiert:** Beim Erstellen eines persönlichen Tagesplans beträgt der
Bonus je Quest mindestens 40 Charakter-XP, sonst 2 % der benötigten XP des aktuellen Levelabschnitts,
auf das nächstgelegene Vielfache von 5 gerundet. Beispiele: Level 1 → 40, Level 10 → 60,
Level 20 → 100, Level 50 → 220 XP. Ein Plan enthält höchstens drei Quests.

Sobald Aktivitäten des Tages beginnen, bleibt der Plan einschließlich der Boni für diesen Tag
fest; ein Levelaufstieg am selben Tag erhöht bestehende Boni nicht nachträglich. Minutenziele,
Aktivitäts-XP pro Minute und Tageslimits ändern sich dadurch nicht. Der Tageshöchstwert von
120 Quest-XP gilt deshalb nur für drei Level-1-Quests, nicht pauschal für höhere Level. Die isolierte
öffentliche Demo behält ihre bisherigen Questboni 50/30/40. Eine rein technische Obergrenze schützt
extreme, praktisch unerreichbare Zahlen vor Überlauf; sie ist keine Spielbalance-Schwelle.

## Konsequenz für Free und Plus

Das beschlossene Preisziel bleibt **3,99 €/Monat**; 4,99 € bleibt ein Prüf-Kandidat. Diese Analyse
aktiviert weder Billing noch Entitlements und ändert nicht die vorhandene Entscheidung über einen
moderaten XP-Vorteil: Der im GDD festgehaltene vorläufige Kandidat von 10 % zusätzlicher
Charakter-Aktivitäts-XP bleibt unverändert, ist aber derzeit nicht kaufbar oder aktiv.

Free umfasst weiterhin verlässliches Tracking, sinnvolle Progression, freundliche Erholung und den
grundlegenden Spielkreislauf. Geplante grundlegende Erinnerungen sollen keine künstliche Plus-Sperre
werden. Für Plus priorisieren wir als **zu prüfende Inhalte** zusätzliche Kapitel/Questreihen,
Bossvarianten, unterschiedliche kosmetische Stile und reichere persönliche Rückblicke. Das ist eine
Angebotshypothese, keine Behauptung, dass Nutzer dafür bereits zahlen würden. Pausen, Datensicherheit
oder das Behalten verdienten Fortschritts sind kein kostenpflichtiger Vorteil.

## Fragen für die eigene Beta

- Finden neue Spieler ohne Erklärung eine passende erste Aktivität? Verständnis und Aufwand beobachten,
  anschließend Vorschläge und freie Auswahl vergleichen.
- Können Spieler vor dem Speichern erklären, welche XP, welcher Skillfortschritt und welcher Questbonus
  entstehen? Auch mehrere Einheiten desselben Tages und erreichte Limits prüfen.
- Vermittelt die nächste Freischaltung Vorfreude, ohne unrealistische Trainingsziele zu fördern?
- Wird der Wochenrückblick als hilfreich erlebt, einschließlich Wochen mit Erholung oder wenig Aktivität?
- Welche konkreten zusätzlichen Inhalte würden wiederholt genutzt und welche beim Preisziel vermisst?
  Eine unverbindliche Kaufabsicht getrennt von einem später tatsächlich abgeschlossenen Abo erfassen.

Es gibt hierfür noch keine gemessenen Erfolgsquoten oder Retention-Ziele. Metriken und Auswertung
werden vor einer Beta-Untersuchung definiert; sie ersetzen weder Interviews noch reproduzierbare
Funktionsprüfungen. Everbloom behält eigene Namen, Geschichten, Grafiken, Texte und Spielbalance.
