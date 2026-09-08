# Art Direction · freigegebene Chibi-Stilrichtung

Stand: 08.09.2026. Der Nutzer hat die folgende Bildrichtung ausdrücklich bestätigt:
„in die Richtung perfekt“ und anschließend die **exakte Vorlage** verlangt. Das bestätigte
Originalmotiv wird als fester illustrierter Look für die App übernommen. Eine Freistellung
darf den Hintergrund entfernen; Gesicht, Haare, Proportionen, Kleidung und Farben des Motivs
bleiben erhalten. Eine neue SVG-Interpretation erfüllt diesen konkreten Original-Look nicht.

![Freigegebene Anime-Chibi-Stilreferenz](art/chibi-style-reference.png)

## Visuelle Leitlinie

Eigenständige Anime-Chibis in leicht seitlicher Dreiviertelansicht mit markanter, sympathischer
Ausstrahlung. Ausdrucksstarke Augen mit lesbarer Iris, kontrollierte Konturen und klar getrennte
Haarsträhnen tragen die Identität. Große Anime-Augen bleiben erlaubt; männliche und weibliche
Darstellung sollen sich durch das gesamte Gesicht, Haltung und Silhouette nachvollziehbar
unterscheiden und dieselbe gestalterische Qualität erhalten.

Bei späteren modularen Varianten darf der Kopf kleiner ausfallen als in dieser Referenz.
Körper, Haltung und Kleidung müssen gut sichtbar bleiben; ein übergroßer Kopf ist kein
festgeschriebenes Stilmerkmal für alle künftigen Figuren. Die ausdrücklich gewählte Originalvorlage
behält ihre Proportionen. Weitere Varianten werden als vollständige Figuren auf Handy und Tablet beurteilt.

Die Referenz setzt das Ziel für Materialqualität: nachvollziehbare Stofffalten und Nähte,
geschichtete Kleidung, gefasste Metallkanten, gezielte Glanzlichter und klare Schattenflächen.
Jedes Outfit bildet ein zusammenhängendes Set aus Torso, Ärmeln, Handschuhen oder Händen,
Schuhen und gegebenenfalls Mantel oder Rückenaccessoire. Details folgen Material und Funktion;
die Silhouette und wenige starke Farbakzente bleiben auch in kleiner Darstellung lesbar.

Die Figuren sollen unterschiedliche Altersgruppen ansprechen: zugänglich und ausdrucksstark,
mit genügend Charakter und Materialtiefe für anspruchsvollere Looks. Das ist ein Gestaltungsziel,
keine belegte Aussage über Zielgruppenwirkung oder ein Versprechen für Markterfolg. Die Wirkung
wird später mit tatsächlichen Nutzern und den vorgesehenen Displaygrößen überprüft.

## Fünf Stilfamilien, ein gemeinsamer Qualitätsanspruch

| Familie | Richtung des vollständigen Sets |
|---|---|
| Cozy | Weiche, hochwertige Freizeitkleidung, lesbare Stoffformen, Hoodie und passende Schuhe; süße Details dürfen Teil des Looks sein. |
| Adventurer | Reisekleidung mit asymmetrischen Lagen, Leder, Mantel, praktischen Taschen und robusten Stiefeln. |
| Elegant | Lange, klar geführte Stoffflächen, präziser Schnitt und sparsame, hochwertige Metall- oder Schmuckdetails. |
| Dark | Strukturierte dunkle Plattenrüstung mit plausiblen Übergängen, Schulterplatten, Armschutz, Stiefeln und Cape. |
| Abyssal | Mächtige Obsidian-/Void-Rüstung, geschichtete Platten, markanter Kern und scharfe, eigenständige Rückenformen. |

Alle fünf Familien erhalten männliche und weibliche Varianten in gleicher Qualität und bleiben
unsexualisierte Chibi-Darstellungen. Körperform, Haut- und Haarfarben sowie Stilzugang verändern
keine Spielwerte. Stile, Farben und Auren bleiben im vorgesehenen Slot-System frei kombinierbar;
eine Stilfamilie ist weder Klasse noch Seltenheit. Figuren, Garderobe, Lore und Gestaltung sind
eigene IP. Die Referenz begründet keine Übernahme fremder Franchise-Designs.

## Referenzdatei und aktueller Umsetzungsstand

`art/chibi-style-reference.png` ist die unveränderte generierte Einzelillustration der bestätigten
Bildrichtung. Sie hat 1224 × 1285 Pixel und keinen Alphakanal; das sichtbare Schachbrett ist Teil
des Bildes. Diese archivierte Datei bleibt unverändert. Die App verwendet dieselbe unveränderte Datei unter
`frontend/public/art/characters/emerald-knight-original.png`. Eine separat vom integrierten
Bildwerkzeug erstellte Luminanzmaske blendet den Hintergrund beim Rendern aus; das Originalbild
bekommt dadurch keinen eigenen Alphakanal. Diese Maske ist separat prüfbar und austauschbar.
Die erste neu generierte Freistellung wurde wegen veränderter Details verworfen.
Die Illustration enthält keine getrennten Körper-, Haar- oder Outfit-Layer, keine austauschbaren
Slots, keine weiteren Ansichten und keine Animations-Rigs. Ein fester Original-Look darf daher
nicht als vollständig modularer Character Creator oder als bereits geriggter Avatar beschrieben werden.

Der aktuelle SVG-Charakter bleibt ein funktionaler Prototyp: zwei Darstellungen, zwölf eigene
Starterfrisuren, fünf Outfit-Sets, Körpervarianten, Farben, Auren sowie optionale ruhige Atmung
und Gesten. Seine Austauschbarkeit und Bedienbarkeit sind bereits testbar. Er erreicht damit
nicht automatisch die Material- und Illustrationsqualität dieser Rasterreferenz; beides ist in
Fortschrittsberichten ausdrücklich auseinanderzuhalten. Der bestätigte illustrierte Original-Look
und die editierbare SVG-Figur sind zwei unterschiedliche Darstellungen. Eigene Frisurvarianten,
Outfitwechsel und ein Rig in der Qualität des Originalmotivs folgen als spätere Assetarbeit.

Für Produktionsassets müssen die bestätigte Formensprache und Materialqualität auf eine
gemeinsame Leinwand, Perspektive, Ankerpunkte und Zeichenreihenfolge übertragen werden.
Zusätzlich braucht es freigestellte Ebenen, saubere Überlappungen aller vorgesehenen Kombinationen
und ein gewähltes Animationsverfahren. Erst danach lassen sich ruhige Idle-Bewegungen und
interessenbezogene Gesten mit dieser Assetqualität zuverlässig liefern. Reduzierte Bewegung
und die separate Abschaltmöglichkeit bleiben Teil der Gestaltung.

## Eingebauter Original-Look

Dashboard und Creator verwenden `CharacterPortrait`: beim Original eine SVG-Komposition aus
unveränderter PNG und Luminanzmaske mit instanzsicherer ID; bei „Selbst gestalten“ den modularen
Chibi. Das ist keine neue Vektorzeichnung der Figur. Original und archivierte Referenz haben
SHA-256 `f917f6af27e12af2706ba0412091160dae1355c7103d2f5206bb50157cc3cd61`.
Die Assets sind rund 1,9 MiB plus 649 KiB groß und werden separat vom JavaScript geladen.
Spätere mobile Assetoptimierung und native Maskenprüfung sind noch offen.

Der feste Look hat vorerst unveränderliche Haare, Hautfarbe und Rüstung; seine Aura ist separat
wählbar. Der Creator zeigt dafür keine wirkungslosen Kleidungs-/Farbregler. Männliche ältere
Profile ohne explizite Artwork-Auswahl zeigen nun diesen vom Nutzer verlangten Original-Look;
gespeicherte eigene Optionen bleiben erhalten und sind unter „Selbst gestalten“ erreichbar.
Weibliche Darstellung verwendet vorerst den modularen Prototyp. Eine entsprechende illustrierte
weibliche Variante ist noch nicht produziert.

Ruhiges Gesamt-Idle bewegt die vollständige Illustration geringfügig. Der Bewegungsschalter und
reduzierte Bewegung werden berücksichtigt. Keine einzelnen Arm-/Kopfgesten oder Level-Outfitwechsel
für das Original behaupten. Alle verwendeten Prompts und der verworfene Freistellungsversuch sind
unter [Bildprompts](art/chibi-style-prompt.md) dokumentiert; integriertes Bildwerkzeug, kein CLI-Fallback.
