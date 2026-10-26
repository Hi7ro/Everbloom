# Animation Pipeline · Everbloom

Stand: 2026-10-05. Akzeptierte Richtung: **Angular für App und Bedienung, PixiJS für die
2D-Kampfbühne; künftig professionell geriggte Chibis und Bosse.** Die bestätigten gemalten
Anime-Vorlagen bleiben die Art Direction. Unity und eine 3D-Neuentwicklung sind nicht Teil
dieses Schritts.

## Entscheidung und ehrlicher Lieferumfang

Der Nutzer besitzt derzeit keine Spine-Lizenz und hat den Start mit PixiJS bestätigt.
Deshalb enthält dieser Slice **keine Spine-Runtime, keinen Spine-Editor und keine Spine-Exporte**.
PixiJS bildet Bühne, Ebenen und einfache Bewegung ab. Die bestehende Figur wird aus vorhandenem
Profil/Bildmaterial dargestellt. Zehn Bossfamilien besitzen je vier eigene gemalte Bildformen.
Körperbewegung und Posen aus diesen Bildern sind noch kein vollständiges Skelett mit separat
animierbaren Armen, Händen, Augen und Kleidung. Die zwölf vorhandenen Bilder werden dadurch
nicht automatisch zu zwölf fertig geriggten Spielfiguren.

`/battle` bietet accountgebundene, serverautorisierte Kampagnenkämpfe und getrennte Probekämpfe.
Nur ein bestätigter Erstabschluss vergibt genau eine der 40 kosmetischen Belohnungen.
Kämpfe und Replay vergeben keine XP; Probekämpfe verändern keinen Besitz.
Im Live-Betrieb gelten auch für die Wiedergabe von Probekämpfen die Bossrechte: fünf
Normal-Bosse bis Basislevel 50 Free, die übrigen 35 Begegnungen Plus. Nur die ausdrücklich
lokale, gekennzeichnete Billing-Testvorschau öffnet alle Modi ohne gekauften Plus-Status.
Der Renderer zeichnet ausschließlich vorgegebene Ereignisse. Der Aktivitäts-Wochenboss bleibt
davon getrennt und folgt [GAME_DESIGN.md](GAME_DESIGN.md).

Der aktuelle Charakterausbau nutzt zwölf separat gerenderte Körperbilder mit eigenem Outfit-Rig
und vollständige gemalte Köpfe je Frisurenvariante über einen einheitlichen Layerpfad. SVG-Porträts zeigen
einfache interessenbezogene Gesten, Pixi Atmung und Kampfreaktionen. Kragen-/Kombinationsprüfung
und Geräteabnahme bleiben offen; das ist kein fertiges Skelett. Auren nutzen 26 eigene Bilder,
feste freizuschaltende Paletten und eine freie Bildmitte; ein frei umgefärbtes Aura-Labor gibt es nicht.


Spine bleibt ein möglicher späterer Produktionsweg für Skins, Attachments und professionell
animierte Skelette. Vor einer Integration werden passende Editor-/Runtime-Nutzungsrechte, die
vereinbarte Exportversion und die tatsächliche Assetlieferung geklärt. Es wurde keine Lizenz
gekauft oder als vorhanden angenommen. Maßgeblich sind die dann aktuellen
[Spine-Runtime-Bedingungen](https://esotericsoftware.com/spine-runtimes-license) und die
[offizielle PixiJS-Anbindung](https://esotericsoftware.com/spine-pixi).

## Rollen und Zuständigkeiten

| Bereich | Verantwortlich für | Nicht verantwortlich für |
|---|---|---|
| Reine Kampf-Domain | Startwerte, deterministische Zugfolge, Treffer, HP, Ende | Dateien, Canvas, Uhrzeit, Sound, Speicherung |
| Angular-Kampfscreen | Start/Pause/Neustart, angezeigter Zug, HP, Textprotokoll, Lade-/Fehlerzustand | Eigene Schadensformeln im Template |
| PixiJS-Darstellung | Szenenaufbau, Actor-Pose, Richtung, Texturen und Bewegung | XP, Loot, Besitz, Aktivitätsbuchungen |
| Art-Produktion | Originaldesign, getrennte Teile, riggbare Anschlüsse, Animationen, geprüfte Exporte | Regeln aus Animationsevents bestimmen |
| Künftige Server-API | Autorisierte Begegnung und genau einmal verbuchte Belohnung | Vertrauen in clientseitig gemeldeten Sieg |

Ein verzögertes Bild, eine ausgeschaltete Animation oder das Wiederholen einer Szene darf nie
zusätzliche Rewards erzeugen. Der reine Simulator liefert reproduzierbare Ereignisse; die Bühne
visualisiert sie. Später kann der Server dieselben fachlichen Eingaben autorisieren und ein
versioniertes Ergebnis liefern, ohne die Bühne zur maßgeblichen Spielregelinstanz zu machen.

## Gemeinsamer Actor-Vertrag

Charakter und Boss benötigen dieselben semantischen Aktionen, dürfen aber unterschiedliche
Skeletons, Proportionen und Körperteile besitzen. Ein eigener Boss wird nicht in ein humanoides
Chibi-Skelett gezwungen. Die folgenden Namen sind der Produktionsvertrag; die genaue Zuordnung
zum TypeScript-Adapter bleibt dessen Aufgabe.

| Aktion / Clip | Gewünschte Darstellung | Ende / Fallback |
|---|---|---|
| `idle` | Ruhige Ganzkörperatmung, leichte Gewichtsverlagerung, Sekundärbewegung | Schleife; statische Standpose |
| `attack` | Lesbare Vorbereitung, kurzer Angriff, Rückführung | Einmal; dann `idle` |
| `hit` | Kurzer Rückstoß, stabile Fuß-/Handanschlüsse | Einmal; dann `idle` |
| `victory` | Freundlicher Jubel passend zur Figur | Einmal; anschließend ruhige Siegerpose |
| `defeat` | Erschöpfte/knieende Pose ohne Verletzungsdarstellung | Letzten Frame halten; keine Strafe für Alltagspausen |

`blink`, `greet`, `rest` und Interessen-Gesten werden anschließend ergänzt. Figuren dürfen ihre
Stimmung nicht allein durch hektische Skalierung ausdrücken. Effekte folgen der Aktion; sichtbare
Schadenszahlen folgen dem Domainereignis, nicht einem vom Künstler platzierten Treffer-Event.

Ein Actor besitzt eine stabile Asset-ID, Revision, Zielausrichtung, einen Ursprung an der Fußlinie,
standardisierte Bounds und einen dokumentierten Maßstab. Held links und Gegner rechts stehen in
leichter Dreiviertelansicht einander gegenüber. Spiegeln darf asymmetrische Waffen oder Symbole
nicht unbemerkt verfälschen; die Produktionsfreigabe benennt unterstützte Ausrichtungen.

Der aktuelle Kopf ist eine vollständige gemalte Einheit pro Frisur, einschließlich Gesicht.
Farbmasken ändern Haut, Augen oder Haare derselben Zeichnung. Die folgenden getrennten
Gesichts-/Haar- und Gelenkteile beschreiben eine künftige Produktion mit exakt passenden
Anschlüssen; sie sind kein vorhandener Runtime-Layeraufbau.

## Rig, Slots und Garderobe als Produktionsziel

Humanoider Vorschlag: `root` → `hips` → `torso` → `neck` → `head`; daran getrennte linke/rechte
Ober-/Unterarme und Hände, Beine und Füße sowie Ketten für vordere/hintere Haare, Mantel und Cape.
Gelenke brauchen fertig gezeichnete Überlappungen. Füße bleiben bei Atmung glaubhaft am Boden,
Schulterpanzer folgen dem Armansatz, ein Handgriff verbindet die Waffe mit der Hand. Ein anderes
Boneschema ist zulässig, wenn es dieselben sichtbaren Aktionen sauber erfüllt.

Kosmetische Slots: **Kopf, Gesicht, Haare, Torso, Arme, Beine, Schuhe, Haupthand, Nebenhand,
Rücken, Accessoire, Aura und Companion**. Haare, Cape und längere Kleidung benötigen getrennte
Vorder-/Hinterteile. Outfitsets bündeln mehrere Slot-IDs; sie dürfen nicht die gesamte Figur
ersetzen und dabei gewählte Augen/Haut/Haare verlieren. Gameplay-Equipment, Besitz und sichtbare
Skins bleiben getrennte Modelle. Vorhandene Outfitbilder enthalten Waffen/Accessoires noch fest;
dieses Ziel ist kein bereits implementierter Einzelwaffenwechsel.

Zeichenreihenfolge: Boden/Schatten → rückwärtige Aura/Rückenobjekte → hintere Haare/Cape →
Beine/Torso → Arme/Hände/Ausrüstung → Kopf/Gesicht → vordere Haare/Schmuck → vordere VFX.
Zugabhängige Überdeckungen werden bewusst animiert. Materialfarben und auswählbare Haut-/Haar-/
Augenfarbe brauchen getrennte Tönungsregionen, damit Metall, Pupille und Reflex erhalten bleiben.

## Assetlieferung und Versionierung

Vor Produktionsauftrag werden für **einen männlichen und einen weiblichen Referenz-Chibi sowie
den Mooswächter** folgende Bestandteile vereinbart. Erst nach dieser Abnahme die zwölf Designs
und weitere Bosse ausbauen:

1. Freigegebene vollständige Standpose und Material-/Farbblatt auf Basis der bestätigten Vorlagen.
   Pro Chibi zwei Frisuren und zwei vollständige Outfitvarianten als kleiner Kombinationsnachweis.
2. Editierbare Quelldateien mit getrennten Körper-/Gesichts-/Haar-/Kleidungs-/Ausrüstungsteilen,
   geschlossenen Anschlussflächen und transparenten Texturen. Dokumentierte Rechte/Provenienz.
3. Rigquelle, Bind-Pose und fünf Pflichtclips aus der Tabelle; kurze Video-/GIF-Vorschauen erleichtern
   Review, ersetzen aber nicht den integrierten Test mit wechselbaren Teilen.
4. Ein Manifest mit `schemaVersion`, `actorId`, `assetRevision`, `renderer`, `sourceToolVersion`,
   Ausrichtungen, Bounds/Fußanker, angebotenen Clips, Skins/Attachments und sämtlichen Assetpfaden.
   Das ist ein **geplanter Assetvertrag**, noch kein implementierter App-Loader.
5. Bei später gewähltem Spine: Projektquelle, Skeleton-Export (`.json` oder `.skel`), `.atlas` und
   alle zugehörigen Bildseiten. Editor-/Export-/Runtime-Versionen werden zusammen festgehalten und
   auf Kompatibilität geprüft. Kein Export-Upgrade ohne erneute Prüfung der App.
6. Pro Revision ein vollständiges Paket unter stabilem, versioniertem Assetpfad, z. B.
   `art/actors/<actor-id>/<revision>/`; alte Pakete nicht durch inkompatible Dateien überschreiben.
   Keine absoluten Künstlerrechner-Pfade und keine willkürlichen externen URLs im Manifest.

Texturen mit echtem Alphakanal statt eingebranntem Schachbrett, passendem Randabstand/Extrusion
und einheitlicher Atlas-/Premultiplied-Alpha-Konfiguration liefern. Auf dunklem wie hellem Untergrund
prüfen, damit keine Halos oder benachbarte Texturausschnitte sichtbar werden. Atlasse enthalten nur
zur Begegnung benötigte Varianten; nicht den gesamten zukünftigen Katalog beim Appstart laden.
Exportformate, Blattgröße und Qualitätsstufen werden nach Messung auf Zielgeräten festgelegt.

## Eigene Bossgestaltung

Der erste Boss ist der **Mooswächter**: massiger Waldhüter mit Stein-/Rindenkörper, Moospolstern,
wurzelartigen Gliedmaßen und sanftem Smaragdlicht. Silhouette und Material wirken neben den Anime-
Chibis zusammengehörig. Er ist deutlich größer als der Held, bleibt aber auf einem schmalen Display
vollständig lesbar. Die aktuelle Grundform liegt unter
`frontend/public/art/bosses/mosswarden-v2.webp`; sie ist ein einzelner Sprite, kein
mehrteiliges Boss-Rig. Der Gesamtbestand umfasst zehn Bosse von Level 10 bis 100 mit je vier
Formen. Master/Prompts liegen unter `art-source/boss-forms/`; der aktuelle Ausbau ist in
[VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md) dokumentiert.

Sein künftiges Rig trennt Körper, Kopf/Kern, Arme/Wurzeln und Blätter. `attack` kann einen lesbaren
Wurzelstoß, `hit` eine kurze Rückbewegung und `defeat` ein ruhiges Zusammensinken zeigen. Phasen
variieren Haltung, Licht und eigene Effekte. Spätere Gegner dürfen nichtmenschliche Rigs besitzen,
verwenden aber dieselben Aktionsnamen. AdventureQuest ist ausschließlich Inspiration für eine
seitliche, rundenweise Begegnungsdarstellung; UI, Figuren, Animationen, Texte und Sounds bleiben
Everblooms eigene Gestaltung. Das automatische Kampfsystem ist eine eigene Produktentscheidung.

## Bewegung, Bedienbarkeit und mobile Abnahme

- Bewegungspräferenz und `prefers-reduced-motion` gelten auch in der Kampfszene. HP, Zugfolge,
  Pausensteuerung und Ergebnis bleiben ohne Bewegung verständlich. Keine schnellen Vollbildblitze.
- Bedienung und Kampflog bleiben semantisches HTML; Canvas ist die dekorative Darstellung.
  Ein Grafik-/Assetfehler darf Fortschritt oder Navigation nicht blockieren.
- Sichtbarkeit, Hintergrundwechsel, Größenänderung und Routenabbau gehören zum Lebenszyklus.
  Keine weiterlaufenden Animationsticker, Listener oder zurückgehaltenen Texturen nach dem Abbau.
- Vor Produktionsfreigabe prüfen: 360/390 px Phone, 768 × 1024 und 1024 × 768 Tablet, große Schrift,
  Reduced Motion, Navigation während Laden/Kampf, Wiederholung, fehlende Assets und Rendererfehler.
- Auf echten iOS-/Android-Geräten Downloadmenge, Startzeit, Framezeit, GPU-/Texturspeicher und
  Verhalten nach Unterbrechung messen. Grenzwerte werden aus dieser Messreihe abgeleitet; eine
  funktionierende Desktopvorschau beweist keine mobile Performance oder Store-Reife.
- Jede Haar-/Outfitkombination über die fünf Clips prüfen: keine Gelenklücken, verschwundenen Hände,
  durchschnittenen Capes, ungewollten Farbtönungen oder schwebenden Füße. Alle zwölf Startbilder
  lediglich aufzuzählen ist kein solcher Qualitätsnachweis.

Technischer Bezug: [PixiJS Application und Lebenszyklus](https://pixijs.com/8.x/guides/components/application).
Umsetzung, Testergebnisse und offene Grenzen stehen ausschließlich in [VALIDATION.md](VALIDATION.md).
