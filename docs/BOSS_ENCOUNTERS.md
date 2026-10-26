# Boss-Begegnungen · Beta 0.2

Verbindliche Entscheidung vom 4. Oktober 2026: Die mobile Beta enthält fünf
permanente Boss-Begegnungen. Alle Figuren und Designs sind eigene IP. Reale Aktivitäten bleiben
die Quelle von Charakter-XP; Kämpfe setzen diese Erfahrung in sichtbare Begegnungen um.

## Bosse und Level

| Boss | Normal: Einstieg / Empfehlung | Hard: Einstieg / Empfehlung | Episch: Einstieg / Empfehlung | Ultimate: Einstieg / Empfehlung |
| --- | --- | --- | --- | --- |
| Der Mooswächter | 10 | 15 / 20 | 25 / 30 | 40 |
| Der Glutwyrm | 20 | 25 / 30 | 35 / 40 | 50 |
| Der Sternensouverän | 30 | 35 / 40 | 45 / 50 | 60 |
| Der Frosttitan | 40 | 45 / 50 | 55 / 60 | 70 |
| Der Wolkenkönig | 50 / 55 | 55 / 65 | 65 / 75 | 80 / 85 |

Der Frosttitan ist ein eigener Gletscherkoloss. Der Wolkenkönig ist ein eigenständig gestalteter
Affenkönig mit Stab und Wolkenmagie, inspiriert von der Sagengestalt Sun Wukong.
Keine Figur oder Darstellung einer bestehenden Anime-/Game-Adaption wird übernommen.

Unter der Einstiegsschwelle ist der echte Kampf gesperrt. Eine ausdrücklich belohnungsfreie
Vorschau bleibt für entdeckte Bosse möglich. Bei nur einer Levelangabe entsprechen sich Einstieg
und Empfehlung. Die ersten vier Bosse sind auf ihrem Basislevel mit ausgewogener Taktik
schaffbar. Der Wolkenkönig ist der anspruchsvollste Endboss dieser ersten Fassung: Auf Level 50
können entwickelte Skills den Unterschied zwischen Niederlage und Sieg ausmachen; die
Normal-Empfehlung liegt bei 55. Hard und Episch können an der unteren Schwelle je nach Skills
und Taktik noch schwierig sein. Ultimate beginnt frühestens 30 Level über dem Basisboss.
Empfehlungen sind keine Sieggarantie für jede Zusammenstellung oder Taktik.

Bosswerte bleiben fest: Der Gegner skaliert nicht mit dem Spieler nach oben. Zusätzliche Level
und Skill-Erfahrung machen bereits freigeschaltete Begegnungen leichter. Erfahrung aus Lernen,
Kreativität und Erholung trägt ebenfalls zur Kampfkraft bei. Kampfschaden und virtuelle Heilung
sind ausschließlich Spielwerte.

## Entdeckung statt vorweggenommener Bossliste

Neue Konten sehen nur den Mooswächter. Der erste Sieg in **einem beliebigen Modus** des
aktuellen Bosses enthüllt den nächsten Gegner der festen Reihenfolge. Bereits entdeckte Bosse
bleiben für schwierigere Modi und Wiederholungen zugänglich. Ein Sieg enthüllt keinen Boss
außerhalb dieser zusammenhängenden Kette; Niederlage, Vorschau und bloßer Levelanstieg
schalten keine Entdeckung frei.

Auswahl, Vorschau und Beutesammlung zeigen keine Namen oder Bilder künftiger Gegner. Der
Server prüft die Entdeckung ebenfalls vor einem neuen Kampf: Auch ein direkter Request eines
Level-100-Charakters erhält ohne vorherige Siege `403 BOSS_NOT_DISCOVERED`. Bereits gespeicherte
Abschlüsse und Ausrüstung werden nicht gelöscht. Bei lückenhaften älteren Spielständen werden
weiter entfernte Siege erst berücksichtigt, sobald die fehlenden Vorgänger besiegt sind.

## Vier eigene Kampfidentitäten vor dem Finale

Die Bossmechaniken verwenden dieselben Regeln in Normal, Hard, Episch und Ultimate. Der
gewählte Modus bestimmt feste Werte und Mindestlevel; Rarität oder Kleidung geben keine
verdeckten Kampfboni. Eigenständige Silhouetten, Namen und Effekte setzen die vereinbarten
Fantasy-/Anime-Einflüsse als eigene Figuren um.

| Boss | Grundangriff | Schutz / Vorbereitung | Spezialwirkung |
| --- | --- | --- | --- |
| Mooswächter | Wurzelhieb | Jede dritte Runde baut Lebende Rinde ohne Schaden ein Schild auf. | Der nächste Heldenangriff verursacht 30 % weniger Schaden. Danach ist die Rinde verbraucht. |
| Glutwyrm | Klauenhieb | Glut sammeln verursacht keinen Schaden und kündigt Feueratem an. | Die nächste Bossaktion ist Feueratem mit Faktor 1,85 vor Verteidigung und Phasenstärke. |
| Sternensouverän | Astralklinge | Sternensiegel verursacht keinen Schaden, reduziert den nächsten Heldenangriff um 45 % und kündigt Sternenbruch an. | Die nächste Bossaktion entfesselt die Konstellation mit Faktor 2,0. |
| Frosttitan | Eishieb | Gletscherpanzer schützt zwei Heldenangriffe mit je 35 % Schadensreduktion. Gletscherkraft sammeln kündigt den Eisbrecher an. Beide Vorbereitungen verursachen keinen Schaden. | Eisbrecher folgt auf die Aufladung mit Faktor 2,05. Der Titan bleibt langsam und berechenbar. |

Der Mooswächter vermittelt abwechselnden Angriff und Schutz. Der Glutwyrm verkürzt seinen
Aufladezyklus von vier auf drei Positionen. Der Sternensouverän verbindet Schutz und
Ankündigung, mit fünf, vier und drei Zykluspositionen. Die laufende Rundennummer bestimmt
die Position; bei Glutwyrm und Sternensouverän beginnt die Vorbereitung in den ersten beiden
Phasen an Position 2, in der letzten Phase an Position 1. Bereits angekündigte Angriffe haben
immer Vorrang vor einer neuen Phasenentscheidung.

Der Frosttitan verwendet einen festen Sechserrhythmus: Eishieb, Panzer, Eishieb, Aufladung,
Eisbrecher, Eishieb. Sein Phasenwechsel erhöht die Stärke, nicht die Geschwindigkeit. Damit
bestraft ein schnellerer Heldenangriff den Spieler nicht durch unerwartet mehr Bossaktionen.

Phasenstärke bleibt **1,0 / 1,15 / 1,4** bei mehr als 60 %, mehr als 25 % und den letzten 25 %
Boss-HP. Die vorbereiteten Spezialangriffe der ersten vier Bosse speichern die Phasenstärke
beim Ankündigen. Ein Heldenangriff in der Zwischenzeit kann die angekündigte Schadensbasis
nicht nachträglich erhöhen. Ein Schild wird nur durch einen tatsächlichen Angriff verbraucht;
eine Heilrunde zählt nicht. Reduktion wird vor Begrenzung auf verbliebene Boss-HP berechnet,
jeder abgewehrte Angriff verursacht mindestens einen Schadenspunkt. Es gibt kein zufälliges
Ausweichen, keine zusätzliche XP-Quelle und keinen verlorenen Fortschritt bei Niederlagen.

### Balanceprobe der vier Kampagnenbosse

Wie beim Finale: Basisattribute 1, optional 35 % der Charakter-XP auf sechs verschiedene
Skills verteilt. Die Werte sind verbleibende HP nach einem Sieg; alle hier gezeigten Beispiele
gewinnen. Sie belegen Grundspielbarkeit und Levelvorteil, keine statistische Gewinnchance.

| Boss | Level / Skill-Anteil | Balance | Offensiv | Ausdauer |
| --- | --- | --- | --- | --- |
| Mooswächter | 10 / 0 % | 173 HP | 161 HP | 163 HP |
| Mooswächter | 10 / 35 % | 182 HP | 203 HP | 175 HP |
| Mooswächter | 20 / 0 % | 379 HP | 369 HP | 368 HP |
| Glutwyrm | 20 / 0 % | 234 HP | 290 HP | 209 HP |
| Glutwyrm | 20 / 35 % | 303 HP | 309 HP | 244 HP |
| Glutwyrm | 30 / 0 % | 456 HP | 442 HP | 468 HP |
| Sternensouverän | 30 / 0 % | 310 HP | 228 HP | 281 HP |
| Sternensouverän | 30 / 35 % | 396 HP | 419 HP | 392 HP |
| Sternensouverän | 40 / 0 % | 551 HP | 533 HP | 539 HP |
| Frosttitan | 40 / 0 % | 440 HP | 570 HP | 398 HP |
| Frosttitan | 40 / 35 % | 661 HP | 639 HP | 555 HP |
| Frosttitan | 50 / 0 % | 744 HP | 702 HP | 634 HP |

[108 vollständige Kampagnenfälle](balance/campaign-bosses-v1.csv) vergleichen drei Skillprofile,
alle drei Taktiken und Basislevel / +10 / +30. Zusätzlich prüfen feste Tests alle vier Modi,
jeweils alle erwarteten Fähigkeiten, Ankündigung vor Spezialangriff, echtes Schildverhalten
und Heilrunden ohne Schildverbrauch. Der Wolkenkönig bleibt auf jedem vergleichbaren Modus
werte- und kampfseitig die schwierigste Begegnung.

## Finale: der Wolkenkönig

Sein festes Werteprofil liegt über den anderen Bossen. Normal verwendet 1.390 HP, 135 Angriff
und 35 Verteidigung. Hard, Episch und Ultimate verstärken dieses Profil, verwenden aber dieselben
lesbaren Regeln. Skills aus Wissen, Achtsamkeit und Erholung wirken über die vorhandenen
Charakterattribute ebenso wie Bewegung; mehr reale Trainingsminuten sind kein Zwang zur Lösung.

| Fähigkeit | Tatsächliche Wirkung |
| --- | --- |
| Goldene Stabkombo | Zwei Treffer; die Heldenverteidigung wird auf jeden einzeln angewandt. |
| Wolkenschritt | Leichter Angriff und Schild, das den nächsten Heldenangriff um 35 % reduziert. Kein zufälliges Ausweichen und immer mindestens ein Schadenspunkt. |
| Sonnenkraft sammeln | Kein Schaden; kündigt den Sonnenschlag ausdrücklich für die nächste Bossaktion an. |
| Himmlischer Sonnenschlag | Schwerer Angriff mit 2,1-fachem Bossangriff vor Verteidigung und Phasenfaktor. |

Über 60 % Boss-HP hat der Zyklus fünf Positionen (Stab, Wolke, Stab, Laden, Sonne), zwischen
60 % und 25 % vier (Stab, Wolke, Laden, Sonne), darunter drei (Wolke, Laden, Sonne). Die laufende
Rundennummer bestimmt die Zyklusposition. Ein Phasenwechsel kann daher die nächste Fähigkeit
wechseln, aber niemals die Ankündigung überspringen: Jede vorgesehene Sonne ohne Ladung wird
zuerst zum Laden; eine bestehende Ladung führt bei der nächsten Bossaktion sicher zur Sonne.
Der Schild bleibt während einer reinen Heilrunde bestehen und wird erst bei einem Angriff
verbraucht. Kampfwerte, Effekte und Rundenbegrenzung werden vom Server aufgelöst; das Replay
trägt stabile `abilityId`-Werte für Darstellung und Fähigkeitenhinweise.

### Reproduzierbare Balanceprobe

Alle Basisattribute starten bei 1. „Skills 35 % / 70 %“ verteilt diesen Anteil der jeweiligen
Charakter-XP gleichmäßig auf Calisthenics, Running, BJJ, Programming, Meditation und Recovery.
„0 %“ ist die bewusste Untergrenze ohne erworbene Skill-XP. Diese Testdaten sind lokale
synthetische Figuren, keine neuen XP-Vergaberegeln. Angegeben ist Sieg mit verbleibenden HP
oder Niederlage; dies sind berechnete Beispiele, keine Erfolgswahrscheinlichkeiten.

| Level / Modus | Skill-Anteil | Ausgewogen | Kraft | Schutz |
| --- | --- | --- | --- | --- |
| 50 / Normal | 0 % | Niederlage | Niederlage | Niederlage |
| 50 / Normal | 35 % | Sieg, 118 HP | Sieg, 450 HP | Sieg, 192 HP |
| 50 / Normal | 70 % | Sieg, 370 HP | Sieg, 643 HP | Sieg, 422 HP |
| 55 / Normal | 0 % | Sieg, 78 HP | Sieg, 32 HP | Niederlage |
| 55 / Normal | 35 % | Sieg, 321 HP | Sieg, 273 HP | Sieg, 230 HP |
| 55 / Normal | 70 % | Sieg, 524 HP | Sieg, 697 HP | Sieg, 560 HP |
| 65 / Hard | 0 % | Sieg, 98 HP | Sieg, 43 HP | Niederlage |
| 65 / Hard | 35 % | Sieg, 428 HP | Sieg, 762 HP | Sieg, 498 HP |
| 65 / Hard | 70 % | Sieg, 1.033 HP | Sieg, 867 HP | Sieg, 1.055 HP |
| 75 / Episch | 0 % | Sieg, 116 HP | Sieg, 52 HP | Niederlage |
| 75 / Episch | 35 % | Sieg, 963 HP | Sieg, 895 HP | Sieg, 1.010 HP |
| 75 / Episch | 70 % | Sieg, 1.228 HP | Sieg, 1.057 HP | Sieg, 1.255 HP |
| 85 / Ultimate | 0 % | Sieg, 134 HP | Sieg, 62 HP | Niederlage |
| 85 / Ultimate | 35 % | Sieg, 1.035 HP | Sieg, 1.047 HP | Sieg, 1.173 HP |
| 85 / Ultimate | 70 % | Sieg, 1.440 HP | Sieg, 1.265 HP | Sieg, 1.475 HP |

Die vollständigen [45 Balancefälle als CSV](balance/cloud-sovereign-v1.csv) enthalten zusätzlich
Runden und maximale HP. `node frontend/scripts/generate-boss-fixtures.mjs` erzeugt diese Tabelle
sowie die 162 Replay- und 20 Kosmetikfixtures für den Java-Paritätstest aus dem reinen
TypeScript-Modell. Grenztests prüfen zusätzlich alle zwanzig Mindestlevel und positive
Levelvorteile. Weiteres Balancing soll diese festen Fälle ergänzen, nicht Ergebnisse manuell
in Fixtures abändern. Ein höheres Level verbessert die Heldenwerte; durch andere Phasenzeitpunkte
ist verbleibende HP kein streng monotoner Schwierigkeitsindikator für jeden einzelnen Kampf.

## Modi und Plus

Die ersten fünf Bosse mit Basislevel 10 bis einschließlich 50 sind auf Normal dauerhaft kostenlos.
Ab der Blutmondregentin auf Level 60 benötigen auch normale Begegnungen Plus; Hard, Episch und
Ultimate benötigen bei jedem Boss Plus. Damit sind fünf der 40 Begegnungen kostenlos und 35 Plus.
Die Grenze gilt für Begegnungen, nicht für Charakterlevel, XP oder bereits verdiente Kosmetik.
Im Live-Modus prüft der Server den Bosskatalog und das bestätigte Entitlement. Nur der explizite
Billing-Preview-Modus lässt weiterhin alle Modi bei erreichtem Level für lokale QA zu; diese
Freigabe ist kein Abo und kein Nachweis eines funktionierenden Store-Kaufs. Akzeptierte Kampf-
Wiederholungen bleiben auch nach Abo-Ende idempotent; neue Plus-Kämpfe erfordern aktive Rechte.
Das geplante Membership-Ziel bleibt 3,99 € monatlich; 4,99 € ist nur eine mögliche Alternative.

## Zwanzig erste Bossbelohnungen

| Boss | Normal · Selten | Hard · Episch | Episch · Legendär | Ultimate · Mythisch |
| --- | --- | --- | --- | --- |
| Mooswächter | Waldkrone (Haar-Edition) | Rüstung des Waldhüters | Ewige Blüte | Uralter Geistwächter |
| Glutwyrm | Glutkrone (Haar-Edition) | Glutgeschmiedetes Set | Wyrmfeuer | Höllenschwingen |
| Sternensouverän | Sternenkrone (Haar-Edition) | Gewand der Sternenwacht | Unendliche Sternenspuren | Himmelsschwingen |
| Frosttitan | Frostkrone (Haar-Edition) | Nordlicht-Expeditionsset | Frostrunen | Ewiger Eisstrom |
| Wolkenkönig | Wolkenkrone (Haar-Edition) | Gewand des Wolkenkönigs | Himmelslotus | Sonnenkrone |

Die letzten beiden Spalten sind zehn verschiedene Auren. Die vier neuen Belohnungen verwenden
die bereits dargestellten Effektformen `mystic`, `energy`, `chakra` und `light`; sie sind nun
nach dem jeweiligen ersten Sieg dauerhaft ausrüstbar. Haar- und Outfit-Editionen verwenden vorhandene gemalte,
passend zur Charakterdarstellung gewählte Module mit exklusiven Färbungen. Sie sind tatsächlich
ausrüstbar, jedoch keine neu gezeichneten individuellen Waffen- oder Rüstungsslots. Die bisherigen
zwölf Startlooks bleiben frei verfügbar. Kosmetische Seltenheit verändert keine Kampfwerte.

Die fünf epischen Sets unterscheiden sich auch ausgerüstet in ihrer Silhouette. Jede
Charakterdarstellung verwendet fünf unterschiedliche gemalte Outfitmodule; die Bossfarbe
ergänzt die Form, statt dieselbe Rüstung fünfmal einzufärben. Die Sammlung nennt den Stil
direkt am Set und bietet weiterhin die Vorschau „An deinem Chibi“.

| Set | Stil und Bossfarbe | Modul männlich | Modul weiblich |
| --- | --- | --- | --- |
| Rüstung des Waldhüters | Waldläufer und leichte Reisekleidung, Jadegrün | `forest-scout` | `sky-ranger` |
| Glutgeschmiedetes Set | Dunkle Ritterrüstung, Kupferglut | `abyss-walker` | `moonblade` |
| Gewand der Sternenwacht | Magiergewand mit fließenden Stofflagen, Sternenviolett | `frost-scholar` | `starweaver` |
| Nordlicht-Expeditionsset | Gemütliche Expeditionskleidung mit Jacke/Hoodie, Gletscherblau | `urban-ranger` | `rose-runner` |
| Gewand des Wolkenkönigs | Himmlisches Kampfgewand, Himmelsgold | `ember-striker` | `dawn-priestess` |

Die Besitz-IDs bleiben unverändert, insbesondere `astral-regalia` und `glacier-guard`.
Bereits verdiente und ausgerüstete Sets erhalten deshalb die neue Form ohne erneuten Sieg
oder Datenmigration. Gesichtsform, Frisur, Hautfarbe und Kampfwerte bleiben vom Setwechsel
unabhängig; freiliegende Hände behalten die gewählte Hautfarbe.

Der erste Sieg pro Boss und Modus gewährt die zugehörige Belohnung garantiert und dauerhaft.
Für die Beta gibt es keine zufällige Dropchance, keine doppelten Items und kein Loot durch
wiederholtes Abspielen. Die Seltenheitsstufen bezeichnen hier die Schwierigkeit des Erwerbs.
Zufällige Drop-Pools und zusätzliche unabhängige Equipment-Slots sind spätere Ausbaustufen.

## Spielablauf und Datenintegrität

1. Entdeckten Boss, Modus und Taktik wählen; Levelschwelle und konkrete Belohnung sind vor dem Start sichtbar.
2. Der Server lädt den eigenen gespeicherten Charakter und berechnet den gesamten Kampf.
3. Bei einem erstmaligen Sieg werden Abschluss und kosmetischer Besitz in derselben Transaktion
   gespeichert. Keine vom Client behaupteten Level, Siege oder Belohnungen werden akzeptiert.
4. Die Oberfläche spielt die serverseitigen Runden mit Angriffen, HP und Bossphasen ab. Ein
   App-Abbruch verliert bereits bestätigte Beute nicht; erneutes Laden zeigt die Sammlung.
5. Wiederholung derselben Eintrags-ID erzeugt keine zweite Belohnung. Eine neue Kampf-ID gegen
   einen bereits abgeschlossenen Boss/Modus erlaubt weitere Kämpfe ohne erneute Beute.

Kämpfe vergeben keine Charakter-XP. Niederlagen nehmen keine XP, Level oder Ausrüstung weg.
Die frühere aktivitätsgetriebene Wochenherausforderung bleibt ein zusätzliches Alltagsziel mit
separaten HP; ihre Einträge und Aura-Regeln werden nicht durch das Kampf-Replay verändert.

## Abnahme

- Alle fünf Bosse besitzen eine eigene erkennbare Silhouette und dynamische Namen im Kampf.
- Alle zwanzig Levelschwellen werden im Client und Server gleich angewandt.
- Erste vier Bosse auf Basislevel schaffbar; Endboss auf Level 50 mit entwickelten Skills,
  Normal-Empfehlung 55. Höhere Spielerlevel verbessern die Werte gegen denselben Boss.
- Neue Konten sehen nur den ersten Boss; Sieg enthüllt genau den nächsten. Direkte Requests
  umgehen die serverseitige Entdeckungsprüfung nicht.
- Jeder Feueratem, Sternenbruch, Eisbrecher und Sonnenschlag ist vorher angekündigt; Schild und Stabkombo verändern die tatsächliche
  Kampfberechnung. Alle fünf Bosse nutzen eigene Mechaniken in allen vier Modi.
- Kein Loot unter Mindestlevel, in Vorschauen, nach Niederlage oder erneutem Erstabschluss.
- Belohnungen über Reload erhalten und im Charakter-Editor ausrüstbar; gesperrte Designs nicht
  per direkt manipuliertem Profilrequest erschleichbar.
- Handy/Tablet, reduzierte Bewegung und statische Ersatzdarstellung bleiben nutzbar.

Aktuelle Belege und noch offene native Grenzen stehen in [VALIDATION.md](VALIDATION.md).
