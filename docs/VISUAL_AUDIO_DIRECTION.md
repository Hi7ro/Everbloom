# Bild, Bewegung und Klang · mobile V1

Stand: 5. Oktober 2026. Öffentliche Produktanalyse und eigener Gestaltungsvorschlag für die
vorhandene Angular-/PixiJS-App. Quellen sind offizielle Entwickler- bzw. Store-Beschreibungen;
die Referenzspiele wurden hierfür nicht installiert, durchgespielt oder akustisch vermessen.
Die Empfehlungen unten sind unsere Ableitungen, keine Aussagen über deren interne Technik.

## Referenzen und konkrete Übertragung

| Referenz | Öffentlich belegt | Eigene Ableitung für unser Spiel |
| --- | --- | --- |
| **Epic Seven**, Smilegate, Android `com.stove.epic7.google` | Der Anbieter stellt 2D-Animation und aufwendig inszenierte Fähigkeiten in den Mittelpunkt. [Offizielle Store-Beschreibung](https://play.google.com/store/apps/details?id=com.stove.epic7.google&hl=en_US). | Unsere gemalten Figuren behalten. Angriffe in kurze Vorbereitung, klare Bewegung und lesbaren Treffer gliedern. Große Inszenierung für besondere Ereignisse reservieren; kein minutenlanges Abspielen für eine normale Tagesaktivität. |
| **AFK Journey**, FARLIGHT, Android `com.farlightgames.igame.gp` | Die Produktseite beschreibt eine illustrierte Bilderbuchwelt, unterschiedliche Fraktionen, Charakteridentitäten und automatisierte Kämpfe. [Offizielle Store-Beschreibung](https://play.google.com/store/apps/details?id=com.farlightgames.igame.gp&hl=en). | Zusammenhängende gemalte Welt statt wechselnder Stilwelten: einheitliche Beleuchtung, unterschiedliche Silhouetten und je Boss ein klarer Material-/Farbklang. Ein dreidimensionaler Eindruck braucht für unsere jetzige Bühne keinen Engine-Wechsel. |
| **Another Eden**, WFS, Android `games.wfs.anothereden` | Die Beschreibung nennt das Solo-Abenteuer sowie Musik mit Orchester und traditionellen Instrumenten; Hauptthema und Komponisten sind ausgewiesen. [Offizielle Store-Beschreibung](https://play.google.com/store/apps/details?id=games.wfs.anothereden&hl=en). | Eine wiedererkennbare eigene musikalische Familie entwickeln: kurze weiche Alltagsklänge, deutlichere Kampfklänge und ein besonderer Abschluss für den Wolkenkönig. Keine bekannte Melodie nachbauen. |
| **Spirit City: Lofi Sessions**, Mooncube Games | Die Entwickler beschreiben ruhige Lofi-Musik, kombinierbare Hintergrundgeräusche und personalisierbare Figur/Begleiter. [Entwicklerseite](https://mooncubegames.com/). | Der Alltag bleibt ein ruhiger Ort. Klang freiwillig und zurückhaltend; eine spätere Ambient-Ebene getrennt von Effekten einstellbar. Kampfspannung darf nicht dauerhaft über dem Dashboard liegen. |

Diese Eigenschaften belegen keine garantierte Kaufbereitschaft, Bindung oder Massentauglichkeit.
Gacha-Systeme, fremde Figuren, Texturen, Videos, Sounddateien und Melodien werden nicht übernommen.
Die Referenzen dienen der Gestaltung eigener Assets und eigener Bewegungs-/Klangregeln.

## Was im Repository bereits vorhanden ist

| Bestand | Nachweis und Konsequenz |
| --- | --- |
| Gemalte modulare Chibis | `shared/character-portrait.ts`, `rendering/portrait-textures.ts`; unsere zwölf Vorlagen und Ausrüstungsdarstellung sind die Grundlage. Kein neuer einfacher Ersatzavatar. |
| Skillbezogene Angriffe | `domain/combat-visual-profile.ts`: Martial, Strength, Endurance, Arcane und je drei visuelle Stufen. Die Darstellung folgt verdienten Skill-XP; sie verändert keine Kampfwerte. |
| Eigene Bossidentitäten | `rendering/boss-visuals.ts`: Wurzeln, Feuer, Schatten, Eis, Wolken, Blutmond, Sterne, Leere, kosmische Drachen und Relikte; zehn Familien mit je vier eigenen Bildformen für Normal/Hard/Episch/Ultimate und unterschiedlichen Arenen. |
| Attacken und Vorbereitung | `rendering/combat-effects.ts`: Vorbereitung bei 150 ms, Treffer bei 330 ms, Gesamteffekt 600 ms; getrennte Schutz-/Aufladefähigkeiten. Pool von maximal 14 Funken. |
| Lebendige Figuren | `rendering/actor-adapter.ts`: Atmung, gekoppelte Bewegung von Kopf und Körper, Ausholen, Treffer- und Siegespose. |
| Mobile Rendergrenzen | `rendering/battle-stage.ts`: 30 FPS, Pixeldichte maximal 2, pausierte Bühne außerhalb der Sichtbarkeit; Reduced Motion und statischer Fallback. |
| Replay | `features/battle/battle-playback.ts`: Pause, Schritt, Überspringen und doppelte Geschwindigkeit; Replay verändert weder XP noch Loot. |
| Erfolgsklang | `shared/success-audio.ts`: eigene kurze Motive für Quest, Level, Boss-Sieg und Loot; `state/progress-feedback.ts` wählt anhand des Haupt-Meilensteins und steuert den Ton-Schalter. |

Pfade in dieser Tabelle sind relativ zu `frontend/src/app/`. Der Stand beschreibt einen
Code-Review; neue visuelle oder akustische Abnahmen werden in [VALIDATION.md](VALIDATION.md)
festgehalten. Vorhandene Systeme werden erweitert und nicht als neue Errungenschaft doppelt gebaut.

## Eigene Bildsprache

### Bossformen des aktuellen Ausbaus

Die Kampagne umfasst Mooswächter (10), Glutwyrm (20), Dämmerungsbestie (30), Frosttitan (40),
Wolkenkönig (50, Kapitel-1-Finale), Blutmondregentin (60), Sternensouverän (70), Nharok (80),
Vaelthar (90) und Aureon (100). Jede Familie hat vier eigenständig illustrierte Formen.
Der Ausbau umfasst 30 neue Hard-/Episch-/Ultimate-Formen und fünf neue Normalformen,
insgesamt 35 neue Bossbilder.
Das sind gemalte transparente Sprites, keine 3D-Modelle oder bereits fertigen Skelettanimationen.

Hard verstärkt Rüstung und Körperbau, Episch verändert Krone, Schulter-/Flügelsilhouette und
Materialdetails, Ultimate zeigt die mächtigste Ausprägung der Elementarkraft. Es genügt nicht,
das gleiche Bild nur größer oder andersfarbig zu zeigen. Gesicht, charakteristische Materialien
und Herkunft müssen durch alle Formen erkennbar bleiben. Die Blutmondregentin ist eine eigene
weibliche Hochelfen-Figur mit Rubin-/Blutmondmotiven; keine übernommene Franchise-Figur.

Die Figuren schauen zur linken Heldenseite. Vollständige Füße, Hörner, Flügel und Waffen,
echte Transparenz, Abstand zum Bildrand und lesbare Silhouetten sind Abnahmekriterien.
Keine Schrift, Kulisse oder fest eingebrannte Aura-Wand. Master und exakte Prompts bleiben unter
`art-source/boss-forms/`; Runtimebilder werden nur mechanisch verkleinert/als WebP gespeichert.
Die ersten Moos-/Glut-Entwürfe mit zu engem Ausschnitt wurden verworfen; die ausgewählten
Neurenderings und die Alpha-Prüfung stehen in ihren jeweiligen `render-manifest.json`.

Die **40 kosmetischen Erstbelohnungen** besitzen 60 Sammlungsbilder: je eine männliche und weibliche Variante
für zehn Haar-/Kronen- und zehn Outfitfamilien sowie zwanzig gemeinsame Aura-Illustrationen. Der heutige Ausbau ergänzt
**20 neue Einzelrenderings** für Dämmerungsbestie, Blutmondregentin, Nharok, Vaelthar und Aureon.
Dusk nutzt Violett/Türkis, Blood Rubinrot/Gold, Void Obsidian/Violett/Türkis, Dragon Nachtblau/
Platin/Weißblau, Relic Gold/Lapis/Elfenbein. Die Stile sind eigene IP; keine Figuren oder Waffen
aus bestehenden Franchises übernehmen.

Haar-/Outfitbilder sind 480 × 480, neue Auren 600 × 750 Pixel als transparente WebP-Dateien.
Alle 20 wurden einzeln erzeugt und visuell geprüft; sie belegen zusammen 2.369.822 Bytes.
Ihre Original-PNGs, exakten Prompts, Alpha-Prüfungen und Manifeste liegen unter
`art-source/loot/<boss>/`. Die Aura-Mitte bleibt für den Chibi offen. Die neuen Haar-/Outfit-
Sammlungsbilder ersetzen **nicht automatisch** das ausgerüstete modulare Körper-/Haarsystem;
dessen Neugestaltung und sichtbare Anschlussprüfung sind ein eigener Arbeitsschritt.

Die ausgestattete Aura nutzt dieselbe Grafik wie ihre Sammlung: 26 IDs mit 26 eigenen Bildern
(ein Starter, fünf Aktivitätsbelohnungen, zwanzig Boss-Auren). Dämmerungs- und Blutmondbilder
ersetzen ihre früheren Tönungsaliase. Das freie Aura-Labor ist entfernt; Farben sind fest
gestaltet und neue Varianten müssen freigeschaltet werden. Nur `none` und `sage` sind Starter;
`rose` folgt bei Level 5, `void` bei 10. Bereits gültiger Altbesitz bleibt erhalten.

Zusätzlich sind zwanzig **weibliche Haar-/Outfitvarianten** erstellt für sämtliche zehn
Bossfamilien, jeweils 480 × 480 als `{loot-id}-female-v1.webp`. Sie sind keine neuen
Besitzgegenstände. Die Charakterdarstellung bestimmt Bild und Modulzuordnung; ein
Darstellungswechsel kostet keinen weiteren Drop. Auren verwenden weiterhin dasselbe Bild.
Master, Prompts und QA dieser Serie liegen unter `art-source/loot/<boss>/female/`.
Alle Varianten wurden als eigene Bilder erzeugt und visuell geprüft; keine reine Farbfilter-Serie.
Ihre WebP-Dateien belegen zusammen 1.381.860 Bytes und enthalten alle echtes Alpha.

### Chibis und Alltag

**Gemalte Anime-Fantasy mit lebendigen Chibis und ruhigem Alltag.** Körper und Kopf behalten die
abgestimmten Proportionen, leicht seitliche Pose und klare Materialien. Metall erhält kleine
gerichtete Reflexe, Stoff breite weiche Schatten, Magie einen farbigen Kern. Kontur, Licht und
Bodenanker müssen zwischen vollständiger Kopfvariante, Körper und Ausrüstung zusammenpassen.

Cozy, Adventurer, Elegant, Dark und Abyssal sind gleichwertige Geschmacksrichtungen. Höhere
Seltenheit verbessert Ausarbeitung und besondere Details; sie zwingt niemanden zu mehr Schwarz,
Hörnern oder Flügeln. Frisuren und Sets müssen auch auf kleinem Bildschirm anhand ihrer Kontur
unterscheidbar sein. Der eigene Charakter bleibt bei Ausrüstungstausch erkennbar.

Die Frisurenwahl entscheidet über **einen vollständigen gemalten Kopf** einschließlich
zusammengehöriger Haare, Gesicht, Ohren, Kiefer und Augen. Kleidung bleibt unabhängig.
Die Laufzeit verwendet weder ein fremdes Vorlagengesicht noch eine zusätzliche Stirnfüllung.
Ohne explizite Augenfarbe gilt die gemalte Augenfarbe des gewählten Kopfes; eine gesetzte
Augenfarbe bleibt erhalten. Haut-, Augen- und Haartönung verwenden Regionen desselben Bildes.
Ein eigener Gesichtswechsel unabhängig von der Frisur ist im aktuellen Renderer nicht vorhanden.
Getrennte Gesicht-/Haarteile bleiben ein späterer Produktionsweg mit exakt passenden Layern.

Auren sitzen hinter Körper und Gesicht; wenige bewusst gesetzte Vordergrundpartikel schaffen
Tiefe. Kirschblüten schweben, Sternenmagie zieht kleine Umlaufbahnen, Energie steigt nach oben,
Feuer flackert weich. Unterschiede entstehen durch Form, Tempo und Material, nicht nur durch
eine neue Farbe. Große Schutzgeister sind spätere eigene Motive; sie verdecken keine Augen,
Belohnungen oder Bedienelemente.

Für neue Assets: konsistente Dreiviertelansicht, gleiche Lichtquelle und Basishöhe, transparente
Ränder ohne eingebackenen Hintergrund, gemeinsame Ankerpunkte, saubere verdeckte Körperteile.
Bei Hairstyle-Wechsel darf darunter keine alte Haarform stehen bleiben. Die Originalvorlagen
werden weiterentwickelt; generierte Varianten sind erst nach Sichtprüfung produktionsfähig.

## Nächster sinnvoller Umsetzungsschritt

Die folgenden Punkte beschreiben das Zielbild. Der anschließend dokumentierte Umsetzungsstand
unterscheidet vorhandenen Code von noch offener Geräte-/Hörabnahme:

1. **Treffer als gemeinsames Ereignis:** Visueller Effekt, Trefferzahl und Klang bekommen dieselbe
   Replay-/Zugidentität. Ein erneuter Renderdurchlauf spielt nichts doppelt. Zwei aufeinanderfolgende
   Angriffe desselben Akteurs starten beide einen Effekt, auch wenn die Pose jeweils `attack` bleibt.
   Der aktuelle Wechsel-der-Pose-Auslöser in `battle-stage.ts` muss für diesen Fall geprüft werden.
2. **Fähigkeitsansage:** Kurzer sichtbarer Name bzw. Schutz-/Aufladesymbol vor dem Treffer. Bei
   Eigenbuffs kein Treffer am Gegner und kein falscher Schadensklang. Der Boss behält seine
   große Silhouette; Effekte verschwinden vor der nächsten Aktion.
3. **Eigene Klangfamilien:** Kurzer Luftimpuls plus trockener Schlag für Martial, tiefer gedämpfter
   Impuls für Strength, leichter Luftzug für Endurance, heller harmonischer Impuls für Arcane.
   Bossvarianten greifen dessen Material auf: Holz, Glut, Schatten, Rubinmond, Sternenglanz, Kristall, Wind/Metall, Leere, Drachenenergie und Relikte.
   Zunächst lokal synthetisierte eigene Klänge; später eigens produzierte oder ausdrücklich
   lizenzierte Samples, falls sie hörbar besser sind.
4. **Unterschiedliche Erfolge:** Quest = kleiner heller Abschluss; Charakter-Level = etwas
   reichere aufsteigende Figur; Loot = kurzer schimmernder Akzent; Boss-Sieg = eigener Abschluss.
   Bei mehreren gleichzeitigen Belohnungen eine priorisierte Feier statt gestapelter Fanfaren.
5. **Ruhigere Alltagsebene:** Keine Kampfloops im Dashboard. Optionale Ambient-Musik ist eine
   spätere Erweiterung mit eigenem Schalter; sie ist kein schon zugesagter Plus-Inhalt.

## Umsetzungsstand dieses Ausbaus

`shared/battle-audio.ts` erzeugt inzwischen eigene kurze Klangmotive für die vier Hero-Stile,
Bossfamilien, Schutz/Aufladen und Heilung. Die erweiterten Bosszuordnungen werden mit dem
Katalogausbau geprüft; eine Hörabnahme aller zehn Familien bleibt separat erforderlich. Ein lazily angelegter AudioContext und maximal
vier gleichzeitig geplante Stimmen begrenzen die Wiedergabe. `BattlePlayback` löst Klänge nur
für neu abgespielte Züge nach Nutzerinteraktion aus. Laden, Skip und historische Züge bleiben
stumm; Pause, Stummschalten, Hintergrundwechsel und Abbau stoppen aktive und geplante Klänge.
Der letzte sichtbare Zug erhält ein 600-ms-Fenster vor dem Ergebnis, auch beim manuellen Schritt.

23 fokussierte Tests für Audio und Playback sind am 5. Oktober 2026 erfolgreich gelaufen.
Sie prüfen unter anderem Abbruch während Audiofreigabe, begrenzte Stimmen, unterschiedliche
Aktionsarten, aufeinanderfolgende Angriffe, letzte Aktion und Pause/Wiederaufnahme.
Das ist noch keine Hörprobe oder physische Geräteabnahme.

Anschließend wurden auch die vier Erfolgsmotive umgesetzt: eine kleine Quest-Tonfolge,
aufsteigende Level-Töne, ein tieferer warmer Auftakt beim Boss-Sieg und ein hellerer Loot-Akzent.
Maximal sechs geplante Stimmen, längste Dauer etwa 1,03 Sekunden; neue Erfolge ersetzen den
laufenden Klang. Ein gemeinsames Ereignis verwendet nur den bereits priorisierten Haupt-
Meilenstein, ein Belohnungsfenster den Loot-Klang. `play()` bleibt als Levelklang kompatibel.
Stummschalten und Schließen beenden auch Klänge, deren Audiofreigabe noch aussteht.
49 fokussierte Tests über Erfolgs-/Kampfaudio, Feedback, Belohnungsdialog und Replay bestanden.
Ambient-Musik bleibt geplant; eine Hörprobe auf physischen Geräten ist weiterhin offen.

## Eigene Klangpalette als Produktionsbriefing

| Ereignis | Klangziel | Visuelle Entsprechung |
| --- | --- | --- |
| Normale Aktivität bestätigt | Sehr kurzer warmer Akzent, kein großer Sieg | Fortschrittswert und bestätigte Speicherung |
| Quest abgeschlossen | Zwei bis drei klare, weiche Töne | Quest wird abgeschlossen; kleine Lichtbewegung |
| Levelaufstieg | Kurze eigene Tonfolge mit breiterem Schluss | Levelzahl, begrenztes Feuerwerk, neues Ziel |
| Physischer Treffer | Luftbewegung vor dem kompakten Impuls | Ausholen → Schlag → kleine Rückbewegung |
| Magischer Treffer | Harmonischer Anstieg vor hellem Impuls | Runenkern → Bewegung → kurzer Lichtkontakt |
| Boss lädt auf / schützt sich | Spannungsaufbau bzw. stabiler dumpfer Klang | Symbol bleibt am Boss; kein falscher Gegner-Treffer |
| Boss besiegt | Eigene kurze Auflösung, kräftiger als Levelklang | Siegespose und tatsächliche neue Belohnung |
| Niederlage | Ruhiger kurzer Ausklang | Nächster erreichbarer Schritt; keine beschämende Inszenierung |

Ton beginnt erst nach Nutzerinteraktion. Stummschalten beendet aktive und vorgemerkte Klänge;
Hintergrundwechsel, Navigation und Replay-Wechsel räumen die Wiedergabe auf. Pause und Skip
dürfen keinen verspäteten Klang auslösen. Ein 2×-Replay stapelt keine halben Effekte. Soundfehler
dürfen das Speichern, einen Kampf oder einen gekauften Zugang niemals fehlschlagen lassen.

## Abnahme dieser Erweiterung

- Mindestens eine physische und eine magische Hero-Attacke sowie alle zehn Bossfamilien ansehen
  und anhören; Schutz/Aufladen gegen echten Treffer unterscheiden.
- Gleiche Attacke zweimal nacheinander, kritischer Treffer, Heilung, letzter Zug, Pause, 2×,
  Skip, Wiederholung, Hintergrundwechsel und Routenwechsel prüfen.
- Lautlos und Reduced Motion: derselbe Informationsgehalt durch Text/Status; keine Abhängigkeit
  allein von Farbe, Ton oder Bewegung. Keine bildfüllenden Blinkeffekte.
- Handy und Tablet: Gesicht, Füße, großer Boss, HP und Aktionsname bleiben lesbar. Bei statischem
  Fallback funktioniert die komplette Bedienung weiter.
- Kein neuer Renderloop, kein Objektwachstum je Zug und keine Samples für nicht geöffnete
  Bereiche vorladen. Speicher und Klang auf echten Geräten prüfen, bevor „performant“ behauptet wird.

Ein späteres vollständiges 3D-Modell ist eine eigenständige Produktionsentscheidung mit Rig,
Materialien, Animationen und Gerätemessung. Für diesen Ausbau bleibt der vorhandene 2D-/PixiJS-
Weg verbindlich; Perspektive, Schatten, überlagerte Ebenen und Bewegung liefern die gewünschte Tiefe.
