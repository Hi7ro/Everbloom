# Master Prompt · Real-Life MMORPG „Herovera“

Arbeite am bestehenden Projekt `/Users/xv7ro/dev/personal/everbloom` weiter. Herovera ist seit dem 8. Oktober 2026 der gewählte öffentliche App-Name. Entwickle eine eigenständige Real-Life-MMORPG-App und zugleich ein verständliches Full-Stack-Lernprojekt. Leitsatz: **You are the character. Real life is the progression.**

Gewählter Name: **Herovera**. Marken-/Domainprüfung und Store-Registrierung bleiben separate
Schritte. Technische IDs, Speicherschlüssel und Projektpfad bleiben zur Kompatibilität unverändert. Der konkrete erste
Releaseumfang steht in [RELEASE_V1.md](RELEASE_V1.md), der Kaufvertrag in
[MONETIZATION.md](MONETIZATION.md), die eigene Bild-/Klangrichtung in
[VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md).

## Rolle und Qualitätsanspruch

Arbeite als technischer und gestalterischer Entwicklungspartner mit dem Qualitätsanspruch eines **Senior Fullstack Software Developers, Software Architects, Code Reviewers, Debugging Mentors, UI-/UX- und Character-Design-Experten, Senior Game Developers und App-Business-Mentors**. Verbinde diese Perspektiven bei Entscheidungen und setze nachvollziehbare Verbesserungen im bestehenden Projekt um.

- **Fullstack und Architektur:** Entwickle Angular/TypeScript und Spring Boot/PostgreSQL entlang klarer fachlicher Grenzen. Bevorzuge die einfachste wartbare Lösung für den aktuellen Meilenstein. Berücksichtige Datenintegrität, Account-Zuordnung, Fehlerbehandlung und spätere native Nutzung; führe zusätzliche Infrastruktur nur bei einem belegten Bedarf ein.
- **Review und Debugging:** Prüfe eigene Änderungen auf fachliche Fehler, Regressionen, Zugriffsgrenzen und mobile Bedienbarkeit. Reproduziere Probleme, unterscheide Ursache und Symptom und überprüfe die Korrektur mit passenden Tests. Begründe Review-Befunde mit konkreten Stellen, Auswirkungen und einem umsetzbaren Lösungsvorschlag.
- **Design und UI/UX:** Gestalte Herovera konsequent für Handy und Tablet. Bewahre die bestätigten Anime-Chibis, eigenständige Art Direction und konsistente Materialien, Typografie, Abstände und Interaktionen. Prüfe Lesbarkeit, Touch-Bedienung, Barrierefreiheit und Animationen in der tatsächlichen Oberfläche; beurteile Grafikänderungen auch visuell.
- **Game Development:** Verbinde reale Aktivitäten, langfristige Progression, Avatarbindung und verständliches Erfolgsfeedback. Begründe Balanceentscheidungen mit Beispielen und prüfe Grenzen, Mehrfachbelohnungen und Pausen. Behalte das dauerhaft spielbare Free-Angebot und den freundlichen Umgang mit Erholung bei.
- **Business und Produkt:** Ordne Features nach Nutzwert, Entwicklungsaufwand und Bedeutung für den nächsten Meilenstein. Beachte den implementierten V1-Membership-Vertrag zum Preisziel 3,99 € monatlich, den tatsächlichen lokalisierten Store-Preis, Betriebskosten, Store-Vorbereitung, ASO/SEO und Lokalisierung. Kennzeichne Annahmen zu Nachfrage, Bindung, Conversion und Wirtschaftlichkeit als zu prüfende Hypothesen; ändere beschlossene Produktregeln nicht stillschweigend. Verifiziere veränderliche Store-Anforderungen und Kosten bei konkreten Entscheidungen anhand aktueller offizieller Quellen.
- **Mentoring:** Erkläre wichtige Entscheidungen, Alternativen und Fehlerursachen in verständlichem Deutsch am tatsächlichen Projekt. Gib pro Arbeitsschritt einen knappen Lernhinweis, wenn er zum Verständnis beiträgt. Halte Erklärungen praxisnah und den Code für ein Full-Stack-Lernprojekt nachvollziehbar.

Beurteile Ideen kritisch und benenne konkrete Zielkonflikte, statt jede Erweiterung ungeprüft zu übernehmen. Arbeite im vereinbarten Umfang selbstständig weiter. Berichte ehrlich, was implementiert und geprüft ist und was noch offen bleibt; ein bestandener Web-Build allein belegt weder native Release-Reife noch wirtschaftlichen Erfolg.

## Arbeitsgrundlage und Vorgehen

Lies zuerst anwendbare `AGENTS.md`-Anweisungen sowie `README.md`, `docs/GAME_DESIGN.md`, `docs/ART_DIRECTION.md`, `docs/ANIMATION_PIPELINE.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/DOMAIN_MODEL.md`, `docs/APP_STORE_READINESS.md` und `docs/VALIDATION.md`. Dieser Master Prompt bündelt Vision, akzeptierte Produktentscheidungen und Leitplanken. GDD, PRD, Architektur und Domain Model konkretisieren Regeln, Umsetzungsumfang und Abnahme. Neue ausdrückliche Nutzerentscheidungen haben Vorrang; gleiche betroffene Dokumente anschließend miteinander ab. Bei Widersprüchen nicht stillschweigend neu erfinden: prüfe den jüngsten akzeptierten Stand und dokumentiere die Auflösung. Ältere Brainstormings dienen als Kontext. Synchronisierte Referenzen unter `sources/` im ursprünglichen ChatGPT-Projekt bleiben unverändert. Prüfe bestehende Dateien, bevor du Änderungen planst, und erhalte bereits funktionierende Arbeit.

Arbeite in kleinen, überprüfbaren vertikalen Slices. Kein riesiger Code-Dump und keine unnötige Enterprise-Komplexität. Dokumentiere fachliche Entscheidungen zusammen mit Code und passenden Tests. Erkläre knapp, was geändert wurde, warum und wie es geprüft wurde. Unterscheide konsequent zwischen implementierten Funktionen, Mock-Daten, vorläufigen Balancewerten und späteren Zielen. Aktualisiere diesen Master Prompt bei wesentlichen Produktentscheidungen.

## Spielidee und Identität

Der Nutzer verkörpert seinen Charakter. Reale Aktivitäten erzeugen Charakter-XP, Skillfortschritt und passende spielerische Attribute und tragen zu Quests sowie einem persönlichen Wochenboss bei. Sichtbarer Fortschritt, individuelle Gestaltung und erreichbare Ziele motivieren zur nächsten Aktivität. Stats sind Spielwerte und keine objektive Bewertung menschlicher Leistungsfähigkeit.

Der Chibi ist das **digitale Selbst**, die eigene kleine Version des Nutzers. Sich um ihn zu kümmern bedeutet reale Entwicklung in allen Lebenslagen: Bewegung, Lernen, Kreativität, Beruf, Alltag, soziale Beziehungen und Erholung. Der Care Loop lautet **Wahrnehmen → kleine reale Handlung → Chibi-Reaktion → Fortschritt und ruhiger Ausblick**. Das Prinzip eines virtuellen Begleiters schafft Bindung; Produkt, Figuren und Verhalten bleiben eigene IP. Keine Hungerstrafen, kein Tod bei Abwesenheit, kein Verlust verdienter XP und keine Schuldzuweisung bei Pausen. Langfristige Stimmung, Haltung und Gesten reagieren auf freiwillige Interessen, Tagesmodus und Aktivitäten; keine automatische Gesundheits-/Stimmungsdiagnose. Noch kein umfassendes Bedürfnisse-/Mood-System: zunächst Gesten und eine kurze Reaktionszeile zur letzten belohnten Aktivität, ein implementierter freiwilliger Check-in mit Tagesmodus und lokalem Tageswechsel, in M2 reichere Avatarreaktionen.

## Kreativer Bezugsrahmen

Nutze World of Warcraft und die Warcraft-Serie, Final Fantasy IV, V, VI, VII, VIII, IX, X, XII, XIII, XIV, XV, XVI sowie Journey to the West als gestalterische Einflüsse. Folge der konkreten Ableitung in [art/INFLUENCES.md](art/INFLUENCES.md): markante Silhouetten, vielseitige Fashion, Materialien mit gemalter Anime-Tiefe, elementare Bossidentitäten, klar angekündigte Fähigkeiten und eine persönliche Reise. Entwickle eigenständige Figuren, Namen, Ausrüstung, Lore und Musik. Bewahre den bestätigten Chibi-Look und den Kern aus realem Fortschritt. Spätere Archetypen bleiben unabhängig von gewählter Kleidung.

## Produktbeobachtung und eigene Ableitung

Nutze die öffentliche Analyse von elf passenden Apps und Spielen in
[COMPETITOR_RESEARCH.md](COMPETITOR_RESEARCH.md): Solo Leveling Your Self, SelfQuest, Habitica,
Finch, LifeUp, HabitKit, SuperBetter, Habit Hunter, Spirit City: Lofi Sessions, Cozy Grove und
Ring Fit Adventure. Übernimm nachvollziehbare Funktionsprinzipien:
persönliche Tagesziele, sichtbar verknüpften Skill-/Abenteuerfortschritt, eine freundliche
Begleiterbindung und praktische Routinen. Bewahre Heroveras eigene Gestaltung, Figuren, Texte
und Balance. Store-Beschreibungen und einzelne Bewertungen sind keine nachgewiesenen Wirkungen
auf Bindung oder Zahlungsbereitschaft und verraten keine internen Algorithmen.

Umgesetzt sind echte persönliche Tagesquests aus den ausgewählten Skills und der Account-Ausblick
„Am Horizont“. Dieser zeigt ausschließlich den aktuell entdeckten, noch unbesiegten Storyboss auf
Normal samt Mindest-/Empfehlungslevel und noch nicht besessener Erstabschluss-Kosmetik sowie die
nächste künftige unbesessene Level-Aura. Keine Spoiler, zusätzlichen XP, Claims oder Spielstandsänderungen;
die öffentliche Demo zeigt diese Karte nicht. Kuratierte Geschichten und mehrtägige Zielpfade,
eigene Routinen/Termine und ein einfacher Fokusmodus bleiben geplant. Bereits vorhandene Tagesvorschläge und
Wochenübersichten weiterentwickeln statt parallel neu bauen. Zusätzliche Kapitel, vielseitige
Cosmetics und vertiefte Rückblicke sind Hypothesen für Plus-Mehrwert zum Zielpreis 3,99 €; sie
ersetzen keine Nutzertests. Grundlegendes Tracking, verlässliches Speichern und Erholung bleiben
im Free-Kern. Der implementierte Plus-Vorteil beträgt 10 % ausschließlich auf Charakter-Aktivitäts-XP; die genaue V1-Grenze steht in MONETIZATION.md.

## Verbindlicher Account-Einstieg

In der regulären App ist ein Account vor der Charaktererstellung zwingend. Die Reihenfolge lautet: **Account registrieren oder anmelden → gültige authentifizierte Session → Charakter erstellen → Interessen-/Fokus-Onboarding → Dashboard**. Nach Registrierung oder Login führt ein Account ohne Charakter in den Creator; ein bestehender Charakter wird geladen, anschließend gegebenenfalls die noch offene Einführung. Der reguläre App-Modus nutzt seit 4. Oktober 2026 echte Session-Accounts und die serverseitige Game-API. Eine öffentliche, isolierte Vorschau darf Beispiele zeigen, aber keinen eigenen Gastcharakter speichern. Lokale Prototyp-Journale werden nicht in echte Konten importiert.

Schütze den Creator mit einer Frontend-Routenprüfung und die Character-Create-API serverseitig. Ohne gültige Session führt die UI zur Anmeldung; die API antwortet mit 401 und legt nichts an. Der Server leitet die Besitzer-ID ausschließlich aus der geprüften Session ab und vertraut keiner übergebenen Account-ID. Charakter, Fortschritt, Aktivitäten, Belohnungen und spätere Kaufrechte sind accountgebunden; fremde Accounts dürfen sie weder lesen noch verändern. Logout und Accountwechsel müssen alte Signals, Entwürfe, Cache und laufende Antwortzuordnungen trennen, damit keine Daten zwischen Accounts vermischt werden. Lokale Prototypdaten werden nicht still einem angemeldeten Account zugeschrieben.

Jede kontogebundene App-Anfrage bindet die angezeigte Besitzer-ID zusätzlich als `X-Everbloom-Account` an die Cookie-Session. Der Server lehnt einen Widerspruch als `ACCOUNT_CHANGED` ab; dieser Header ersetzt nie Authentifizierung. Resume prüft die Session erneut: gleicher Account erhält offene Entwürfe, unerwarteter Wechsel verlangt explizite Neuanmeldung. Eine kurz unterbrochene Verbindung darf den Entwurf nicht löschen.

Implementiert ist E-Mail/Passwort mit E-Mail-Bestätigung, Argon2-Passworthash, servergespeicherter HttpOnly-Session, CSRF, Passwortreset, Export und passwortbestätigter Kontolöschung. Ein externer Identitätsprovider wurde nicht ausgewählt. `/demo` ist die bereits vorhandene, isolierte öffentliche Vorschau; sie legt keinen Gastspielstand an.

## Charakter, Gestaltung und Ausrüstung

Verwende die bestätigte [Art Direction](ART_DIRECTION.md) als verbindlichen Qualitätsbrief: eigenständige, ausdrucksstarke Anime-Chibis in leichter Dreiviertelansicht, definierte Haarsträhnen und gemalte 2.5D-Tiefe mit sorgfältigen Stoff-/Metallflächen. Der Körper und seine Kleidung müssen gut sichtbar bleiben; neue modulare Figuren dürfen einen kleineren Kopf als die ursprüngliche Vorlage haben. Die fünf Stilfamilien **Cozy, Adventurer, Elegant, Dark und Abyssal** reichen von süßer Freizeitkleidung bis zu eleganter, gothic und extrem edgy High Fantasy. Sie sind weder Klassen noch Seltenheiten. Ein Katzenhoodie passt zu Kampfsport, dunkle Rüstung zu rosa Aura. Figuren, Lore, Begriffe, Musik und Effekte bleiben eigene IP.

Die Gestaltung soll unterschiedliche Altersgruppen ansprechen, ohne eine Altersfreigabe oder Marktwirkung zu versprechen. Männliche und weibliche Darstellung erhalten gleichwertige Materialqualität und sind über Gesicht, Haltung und Silhouette klar lesbar, ohne Sexualisierung. Darstellung und Hauttöne sind rein visuell: keine demografische Ableitung, Statboni oder geschlechtsspezifischen Stilzugänge. Der aktuelle Modulkatalog verwendet passende Anker je Darstellung; daraus entsteht keine fachliche Einschränkung der Skills oder fünf Stilfamilien.

Der Creator zeigt ausschließlich illustrierte Figuren. Der frühere Vektor-Editor ist vollständig aus der Benutzeroberfläche entfernt. Zwölf Startdesigns sind angelegt, je sechs männliche und weibliche, jeweils mit eigener Frisur und vollständigem Outfitset:

| Darstellung | Startdesigns und charakteristische Gestaltung |
|---|---|
| Männlich | **Smaragdwächter:** silberne Spikes, Schwarzgold-Rüstung und Smaragdkern. **Urbaner Abenteurer:** dunkler Messy Cut, Jacke/Hoodie, High-Tops und Gürteltasche. **Frostgelehrter:** aschblaue Curtains, navy-ivory Gelehrtenmantel, Gürtelbuch und Kristall. **Glutkämpfer:** kupfernes Kurzhaar, rot-anthrazites Trainingsgewand, Handschutz und Glutanhänger. **Waldläufer:** dunkler Topknot, grüner Ledermantel, Bogen/Köcher und Taschen. **Abgrundwanderer:** schwarzer Undercut, Obsidianrüstung, violetter Kern, Cape und befestigte Klinge. |
| Weiblich | **Nachtklinge:** violetter Bob, dunkle Plattenrüstung mit Goldkanten und Kristallen. **Sternenweberin:** langer brauner Zopf, heller Reisemantel, Teal-Schärpe und Tasche. **Morgenhüterin:** goldene Wellen, Ivory-Gold-Lichtrobe, Amulett und Gürtelbuch. **Rosenläuferin:** rotbrauner Pferdeschwanz, Rosé-Cream-Sportjacke, Hose/Sneakers und Tasche. **Leerenweberin:** dunkle Twin Tails, Obsidian-Violett-Robe/Rüstung, Grimoire und befestigter Orb. **Himmelsjägerin:** silberner Pixie mit Teal, navy-teal Jägerinnenmantel, Bogen/Köcher und Stiefel. |

Die vier ursprünglichen PNGs bleiben unverändert als Stilreferenz archiviert. Der aktuelle
Charakterausbau stellt alle zwölf Vorlagen auf denselben Layer-Renderer um: zwölf separat
gerenderte, vollständig bekleidete Körper-Sprites mit eigenen Outfitankern werden mit den
jeweils einem vollständigen gemalten Kopf aus der gewählten Frisurenvariante kombiniert. Dadurch wechselt eine Farb- oder Frisurwahl
nicht mehr zwischen Original-Gesamtbild und einer anderen Komposition. Die neuen Teile sind
keine pixelidentische Zerlegung der vier Originalzeichnungen. Die abschließende Sichtprüfung
aller Kragen, Haare und Kombinationen auf Handy/Tablet ist noch offen.

Frisur und Outfitset sind unabhängig wählbar, aktuell je sechs passende Optionen pro Darstellung. Separate transparente Körper-Sprites und vollständige Kopfvarianten werden über feste Anker zusammengesetzt. Haut-, Augen- und Haarfarbe bieten jeweils **Original plus sechs Farben**; Schattierung und Material sollen dabei erhalten bleiben. Jede Auswahl bleibt kosmetisch. Der Vorlagenwechsel setzt diese Anpassungen auf die Vorlage zurück. Die Startsets enthalten immer vollständige Kleidung; angehängte Waffen, Taschen, Bücher, Schmuck oder Rückenobjekte sind derzeit Bestandteil des jeweiligen Sets.

Die Frisurenwahl entscheidet über **einen vollständigen gemalten Kopf** einschließlich
zusammengehöriger Haare, Gesicht, Ohren, Kiefer und Augen. Kleidung bleibt unabhängig.
Die Laufzeit verwendet weder ein fremdes Vorlagengesicht noch eine zusätzliche Stirnfüllung.
Ohne explizite Augenfarbe gilt die gemalte Augenfarbe des gewählten Kopfes; eine gesetzte
Augenfarbe bleibt erhalten. Haut-, Augen- und Haartönung verwenden Regionen desselben Bildes.
Ein eigener Gesichtswechsel unabhängig von der Frisur ist im aktuellen Renderer nicht vorhanden.
Getrennte Gesicht-/Haarteile bleiben ein späterer Produktionsweg mit exakt passenden Layern.

Das Equipment-Ziel umfasst vollständige Sets sowie getrennte Slots für **Kopf, Gesicht, Haare, Torso, Arme, Beine, Schuhe, Haupthand, Nebenhand, Rücken, Accessoire, Aura und Companion**. Einzelne Ausrüstungsslots, Waffenwechsel und ein allgemeines Iteminventar sind noch nicht implementiert. Vorhanden sind fünf Aktivitäts-Aura-Belohnungen sowie 40 einmalige Bossbelohnungen: zehn Frisuren, zehn komplette Outfitsets und zwanzig Auren. Gameplay-Equipment und sichtbaren Look getrennt modellieren. Neue Assets brauchen stabile Leinwand, Perspektive, Anker, Überlappungen und Zeichenreihenfolge; die Produktions- und Maskenvorgaben stehen im Art Guide. Mobile Assetbudgets sind vor Produktionsfreigabe festzulegen und auf Geräten zu prüfen, keine bereits gemessene Performance behaupten.

Ein Bossabschluss verleiht weiterhin genau **eine Belohnungsfamilie**. Haar und Outfit besitzen
je eine männliche und weibliche Darstellung; Sammlungsbild und passende Modulzuordnung folgen
der aktuellen Charakterdarstellung. Ein Wechsel der Darstellung erfordert keinen zweiten Drop
und vergibt keine doppelte Belohnung. Das sind weiterhin **40 Besitz-IDs**, nicht 60.
Die zwanzig Aura-Belohnungen bleiben für beide Darstellungen gemeinsam. Farben und Aura-Besitz
ändern sich durch diese Varianten nicht.

Ruhige Ganzkörperatmung koppelt Körper- und Kopflayer. Bewegung lässt sich abschalten;
reduzierte Bewegung wird respektiert. SVG-Porträts nutzen jetzt auch zurückhaltende Gesten
aus Level/Interessen (Begrüßen, Strecken, ruhiges Atmen oder Fokus); Pixi bleibt bei Atmung und
Kampfreaktionen. Dies ist keine fertige Skelett-/Mimikbibliothek und verleiht keine Outfits
oder Stats. Die gesamte Kombination wird im laufenden Charakterausbau visuell geprüft.

## Animierte Figuren, Bosse und automatische Kämpfe

Akzeptierte Render-Richtung: **Angular für App/Bedienung, PixiJS für animierte 2D-Szenen**, weiterhin gemalte Anime-2.5D-Optik. Der Nutzer besitzt keine Spine-Lizenz; der Start mit PixiJS ohne Spine ist bestätigt. Keine Spine-Runtime integrieren oder Lizenz kaufen, bevor deren Nutzung eigens geklärt ist. Die aktuelle PixiJS-Bühne bewegt die illustrierten Charaktere und zehn Bossfamilien mit jeweils vier eigenen Formen mit Skill-bezogenen Angriffen und individuellen Bossmechaniken; sie liefert noch keine professionell geriggten zwölf Charaktere. Die verbindliche Produktionsvorbereitung steht in [ANIMATION_PIPELINE.md](ANIMATION_PIPELINE.md). Zuerst ein männlicher und ein weiblicher Referenz-Chibi mit austauschbaren Teilen sowie ein Boss, jeweils mit `idle`, `attack`, `hit`, `victory`, `defeat`; danach die Bibliothek ausbauen.

Kämpfe sollen automatisch und rundenweise ablaufen: eigener Charakter links, Boss rechts, erkennbare Angriffe/Treffer, HP und verständlicher Verlauf. AdventureQuest liefert nur die abstrakte Inspiration einer seitlichen RPG-Begegnung; Figuren, UI, Regeln, Animationen und Sounds bleiben eigene IP. Charakterlevel und Skill-Erfahrung bestimmen spielerische Kampfstärke. Reale Aktivität bleibt der Ursprung der Progression; Wiederholen einer Animation ist keine neue Leistung.

Unter `/battle` sind **serverautorisierte Bosskampagne und lokale Kampfübung** getrennt. Eine reine deterministische Domain berechnet die Zugfolge; Angular spielt sie ab und PixiJS stellt sie dar. Nur ein bestätigter Kampagnen-Erstabschluss vergibt die feste kosmetische Belohnung. Die Übung bleibt ohne Belohnung oder Speicherung. Start/Pause/Wiederholung eines Replays erzeugen keine zusätzlichen Rewards. Kämpfe vergeben keine XP und verändern den separaten Aktivitäts-Wochenboss nicht; dort gelten weiterhin 2 Schaden je belohnter Aktivitäts-XP.

Übung und Kampagne bieten vor Beginn drei freie Taktiken: Balance behält die bisherigen Werte, Offensiv erhöht Angriff um 20 % und senkt Verteidigung um 25 %, Ausdauer senkt Angriff um 15 % und erhöht Verteidigung um 25 %; ganzzahlige Werte werden abgerundet. Ausdauer ersetzt bei unter 60 % HP in jeder dritten Runde den eigenen Angriff durch begrenzte virtuelle Heilung aus Max-HP, Recovery und Mindfulness. Der lebende Boss greift danach weiterhin an. Exakte Formeln stehen im GDD und `auto-battle.ts`. Taktik ist Teil des eingefrorenen Replays; keine Umstellung während laufender Züge, keine zusätzlichen Rewards oder echte Gesundheitsbedeutung. Eine neue Taktik benötigt eine neue Vorbereitung; Wiederholung spielt dasselbe Ergebnis ab.

Die implementierte Kampagne nutzt die durch reale Aktivitäten erworbenen Level und Skills. Serverregeln prüfen die Reihenfolge sowie Level-/Modusgrenzen und speichern Erstabschlüsse und Besitz atomar; wiederholte Requests erzeugen keine zweite Beute. Eine eigene Aktivität als Eintrittsticket pro Kampf ist nicht implementiert. Kein zusätzlicher paralleler Rewardpfad und keine stillschweigende Umdeutung gespeicherter Daten: Regeländerungen brauchen einen bewussten Versions-/Migrationspfad. Eine Niederlage entzieht keine verdienten XP und bestraft keine Alltagspausen.

## Fortschritt und aktuelle Balance V0.2

Charakter- und Skill-Level werden aus dauerhaft aufsummierten XP abgeleitet. Überschüssige XP bleiben beim Aufstieg erhalten; mehrere Levelwechsel müssen korrekt funktionieren. Die derzeitige Balance ist ein testbarer Ausgangspunkt:

- Charakter: Level 1 beginnt bei 0 XP; nächstes Level kostet `1200 + 200 × (Level − 1)`.
- Skill: nächstes Level kostet `1000 + 150 × (Level − 1)`.
- Ein Aktivitätseintrag akzeptiert 1–180 ganze Minuten. XP entstehen aus belohnten Minuten mal Skillrate. Tageslimits gelten über alle Einträge hinweg; darüber bleibt die Aktivität im Verlauf, erzeugt aber keine zusätzlichen Rewards.
- Calisthenics: 4 XP/Minute, höchstens 90 belohnte Minuten/Tag; Running: 3/Minute, höchstens 60; Meditation: 3/Minute, höchstens 30; Programming: 2/Minute, höchstens 90.
- Ein Attribut wächst je 1000 kumulierten XP seiner zugeordneten Skills um einen Punkt gegenüber dem Basiswert.
- Daily Quests zählen belohnte Minuten bis zum Ziel und geben ihren Charakter-XP-Bonus genau einmal.
- Momentum liegt zwischen 0 und 100. Der erste belohnte Tageseintrag gibt +5; weitere Einträge keinen Bonus. Derzeit kein Momentum-XP-Multiplikator.
- Wochenboss: 2 Schaden je Aktivitäts-XP, kein Schaden aus Questboni, HP mindestens 0. Phasen: über 60 % Erwachen, über 25 % Widerstand, sonst Letzter Widerstand; bei 0 Besiegt.

60 beziehungsweise 90 vollständig belohnte Calisthenics-Minuten ergeben 240/360 Skill-XP. Eine passende offene persönliche Tagesquest aus einem auf Level 1 erstellten Plan ergänzt einmalig 40 Charakter-XP, insgesamt 280/400. Auf höheren Levels gilt 240/360 plus der gespeicherte persönliche Questbonus. Das klassische Demo-Board behält seinen 50-XP-Bonus und damit 290/410 Charakter-XP; historische Replay-Werte werden nicht rückwirkend geändert. Eine einzelne längere Einheit soll somit nicht automatisch einen ganzen Balken füllen. Ein bereits fast voller Balken darf selbstverständlich aufsteigen. Höchstens 720 Boss-Schaden pro Calisthenics-Tag. Zeitbeispiele sind Balancewerte, keine Trainingsempfehlungen.

Persönliche Tagesquests: maximal drei verschiedene gewählte Fokus-Skills. Je Quest gilt beim
Erstellen des Plans `max(40, round((1200 + 200 × (Level − 1)) × 0,02 / 5) × 5)` Bonus-XP,
also 40/60/100/220 auf Level 1/10/20/50. Bis zu drei Quests geben entsprechend höchstens
120/180/300/660 Bonus-XP. Der Bonus bleibt im Plan gespeichert; ein Levelaufstieg bewertet
laufende oder abgeschlossene Quests nicht neu. Bei mehr als drei Skills rotiert die Auswahl deterministisch
nach dem Servertag. Vor der ersten Tagesaktivität kann der Fokus das unberührte Board ersetzen;
danach gelten Änderungen erst morgen. Jeder Aktivitätseintrag, auch ohne XP, sowie vorhandener
Questfortschritt oder Abschluss frieren das heutige Board ein. Minutenlimits und Serverkontrolle
bleiben bestehen. Ziele pro Skill und Übergangsregeln stehen im GDD; Demo-Journale bleiben beim
klassischen Board. Kein zusätzliches Quest-Abhaken neben derselben Aktivitätsbuchung.

## Skills, Alltag und Belohnungen

Der aktuelle Katalog enthält **14 aktiv protokollierbare Skills**. Calisthenics, Running, Meditation und Programming behalten ihre oben genannten XP-Raten, Tageslimits und bisherigen Demo-Startstände. Die zehn Ergänzungen starten mit 0 Skill-XP:

| Skill | Kategorie / Attribut | XP je Minute | Belohnte Minuten je Tag |
|---|---|---:|---:|
| Weightlifting | Körper / Strength | 4 | 90 |
| Swimming | Körper / Endurance | 3 | 60 |
| Boxing | Kampfsport / Strength | 3 | 60 |
| BJJ | Kampfsport / Focus | 3 | 60 |
| Breathwork | Geist / Mindfulness | 2 | 15 |
| Recovery | Geist / Recovery | 2 | 30 |
| Reading | Wissen / Knowledge | 2 | 60 |
| Languages | Wissen / Knowledge | 2 | 60 |
| Healthy Cooking | Alltag / Recovery | 2 | 45 |
| Instrument üben | Kreativität / Focus | 2 | 60 |

Diese Grenzen sind vorläufige Spielbalance, keine Trainings-, Gesundheits- oder Zeitvorgaben. Die Fokusauswahl verändert weder Raten noch verdiente XP. Plane darüber hinaus einen erweiterbaren Skillkatalog mit Kategorien und Subskills:

- Physical: Calisthenics, Weightlifting, Running, Swimming, Mobility; beispielsweise Pull-ups und Handstand.
- Combat: Boxing, Kickboxing, Muay Thai, BJJ und MMA; beispielsweise Guard und Passing.
- Mind & Recovery: Meditation, Breathwork, Recovery, Cold Exposure und Attention/Digital Reset.
- Knowledge: Reading, Programming mit TypeScript/Angular/Java sowie Languages je Sprache.
- Creative: Instrumente je Instrument, Writing, Drawing und Design.
- Career: Deep Work, Communication, Leadership und Personal Projects.
- Life: Healthy Cooking, Planning, Household und Social Skills.

Aktuell implementiert sind Strength, Endurance, Focus, Knowledge, Mindfulness und Recovery. Zielattribute ergänzen Agility, Mobility, Discipline und Social. Ein Eintrag hat zunächst einen primären Skill; spätere Gewichtung darf Charakter-XP nicht über Eltern- und Subskills mehrfach erzeugen.

Daily/Weekly Quests und persönliche Wochenbosse geben Struktur. Langfristige Bossquests können reale Projektziele abbilden. Recovery ist vollwertiger Fortschritt. Geplante Rest Days schützen Kontinuität; freiwillige Cheat Days pausieren Ziele. Pausen entziehen niemals verdiente XP oder Level. Streaks richten sich nach Zielrhythmus, beispielsweise dreimal wöchentlich. Fördere weder Übertraining noch riskante Kälteexposition durch eskalierende Belohnungen.

Ein erster kosmetischer Boss-Loot-Katalog mit Seltenheiten ist umgesetzt. Später folgen individuelles Equipment, ein allgemeines Inventar, zusätzliche frei kombinierbare Slots, Achievements und auswählbare Titles. Seltenheit ist vom visuellen Stil unabhängig. Klassen/Archetypen ergänzen Spielstile, ohne reale Fähigkeiten zu sperren. Parties, Guilds und Raids folgen erst nach einem stabilen Solo-Spiel.

## Auren: Gestaltung und Freischaltung

Auren sollen die ganze Figur umgeben: Bodenzeichen, Formen hinter dem Körper, vordere Partikel und optionale Augeneffekte bilden getrennte Ebenen. Gesicht, Silhouette und Bedienung bleiben lesbar. Gewünscht sind Sterne, mystische Siegel, Chakra-/innere Energie, dämonische Energie mit oder ohne bedrohlich leuchtenden Blick, Licht, Energie in verschiedenen Farben, Engelsformen, Kirschblüten, Feuer und eine große geistartige Schutzgestalt. Chakra bezeichnet hier ein Fantasy-Motiv ohne gesundheitliche oder diagnostische Bedeutung. Die genannten Anime-Vorbilder liefern nur Genre-Ideen für Energie und Präsenz; keine Franchise-Figuren, Symbole, konkreten Silhouetten oder Sounds übernehmen.

Verbindliche eigene Namen: **Sternenspuren, Mystischer Schleier, Innere Harmonie, Dämonenschatten, Lichtkrone, Energiefluss, Himmelsflügel, Blütenwind, Flammenherz und Geistwächter**. Der Art Guide beschreibt Motiv und technische ID je Aura. Jede Aura hat eine fest gestaltete Farbpalette. Andere Farben oder Formen sind eigene freizuschaltende Designs; kein freier Farbpicker und kein Aura-Labor.

Die tatsächlich ausgerüstete Aura verwendet auf Dashboard, im Creator und in der Pixi-Kampfbühne dieselbe gemalte Grafik aus der zentralen Registry `AURA_VISUALS`. Sie enthält **26 Aura-IDs aus 26 transparenten WebP-Assets**: Waldlicht als Starter, fünf Aktivitätsbelohnungen und zwanzig Boss-Auren. Dämmerungsbestie, Blutmondregentin, Nharok, Vaelthar und Aureon besitzen jeweils zwei neu gerenderte Aura-Illustrationen; alte Dämmerungs-/Blutmond-Tönungsaliase sind ersetzt. Gemeinsame Position, Größe, Deckkraft und Bewegungsart gelten in beiden Renderern. „Keine“ zeichnet nichts. Keine zusätzlichen alten Linien-/Outline-Effekte. Auren bleiben kosmetisch, ohne XP- oder Statwirkung. Das freie Aura-Labor mit Farb- und Schattenblickvorschau ist entfernt; anlegen darf man nur Starter und verdiente Designs. Eigene Gesichtsmimik und präzise Iris-VFX sind spätere Parameter.

**Ohne Aura und Waldlicht** stehen zu Beginn zur Verfügung. **Rosenlicht wird beim Übertritt zu Level 5, Schattenflamme bei Level 10, Nordlicht bei Level 20, Sternenkranz bei Level 40 und Moosseele beim belohnten Sieg über den lebenden Aktivitäts-Mooswächter** verdient. Diese fünf Grants erfolgen automatisch, einmalig und atomar mit der Aktivitätsbuchung. Keine Zufallschance oder manuelle Claim-Pflicht. Die zwanzig Kampagnen-Auren stammen aus serverbestätigten epischen und ultimativen Erstabschlüssen. Der Server speichert Besitz; der lokale Testadapter rekonstruiert ihn per Journal-Replay. Duplicate-Requests, Einträge ohne Aktivitäts-XP, schon besiegte Wochenbosse und das bloße Laden hoher Level vergeben nichts. Eine enge Bestandsmigration erhält früher gültig ausgerüstetes oder verdientes Rosenlicht/Schattenflamme, ohne andere Rechte hinzuzufügen. Lokale Demo-Daten verleihen keine Account-Rechte. Bewegungsabschaltung und reduzierte Bewegung gelten auch für Aura-VFX.

Aura-Abnahme: gespeicherte Auswahl nach Reload in Dashboard, Creator und Kampf vergleichen; nur das ausgewählte Bild laden, keine laufende Animation außerhalb des Sichtbereichs. Bewegung aus und reduzierte Bewegung behalten das Bild statisch. Pixi nutzt den Szenenticker, begrenzte Texturen und saubere Freigabe bei Abbruch/Destroy. Unbekannte IDs laden nichts; Fehler dürfen die App nicht blockieren oder alte Outline-Grafiken zurückbringen. Renderer verändern niemals Besitz, XP oder Loot. Die konkreten Anforderungen stehen in [ART_DIRECTION.md](ART_DIRECTION.md).

Bei einem Frisurwechsel wird der vollständige Kopf aus der gewählten Variante ersetzt.
Keine alte Kopf-/Haarzeichnung darunter behalten: Das würde Haarreste, zweite Kieferkanten
oder fehlende Schläfen verursachen. Kopf und Kragen sitzen unmittelbar zusammen; vorhandene
gemalte Halsanteile werden über den gemeinsamen Kragenversatz von neun Portrait-Einheiten
im Kragen verborgen. Kopf-/Körperatmung in SVG und Pixi bleibt gekoppelt.
Smaragdwächter mit Kupferkurzhaar sowie alle zwölf Kopf-/Outfitfamilien sind sichtbare
Regressionsfälle. Technische Checks allein ersetzen diese Kombinationsabnahme nicht.

## Erfolgsfeedback, Accountprofil und Onboarding

Erfolgsfeedback umfasst Charakter-/Skill-Levelaufstiege, den ersten belohnten Tageseintrag, alle vollständig abgeschlossenen Daily Quests, einen besiegten Wochenboss und eine neu verdiente Aura. Einzelne Questabschlüsse erzeugen keinen eigenen Jingle. Eine etwa sechs Sekunden sichtbare Erfolgskarte bündelt Ereignisse mit kleinem CSS-Feuerwerk und eigenen kurzen Web-Audio-Motiven für Quest, Level, Boss-Sieg und Loot; das priorisierte Ereignis bestimmt den Klang. Das soll ein angenehmes Erfolgserlebnis ähnlich dem Prinzip klassischer MMORPGs vermitteln. Keine kopierten RuneScape-Sounds oder Assets. Ton, Feuerwerk und Charakterbewegung sind separat steuerbar; Einstellungen werden lokal gespeichert. Respektiere reduzierte Bewegung, Browser-Audioregeln und Unterbrechungen. Erfolg muss auch ohne Ton und Bewegung verständlich bleiben. Reload, Reset und doppelte Requests dürfen Erfolge nicht erneut abspielen.

Der Creator unter `/character/create` bietet Name, Darstellung, zwölf illustrierte Vorlagen, getrennte Frisur-/Outfitwahl, drei Farbpaletten, verfügbare Auren und optionale Bewegung mit direkter Vorschau. Im Accountmodus speichert die geschützte Profil-API ausschließlich validierte Name-/Appearance-Daten; Vorlagen und Module müssen zur Darstellung passen, Farben zur jeweiligen Palette und Belohnungen zum bestätigten Besitz. Der frühere Speicher `everbloom.character.v2` mit Legacy-Migration bleibt ausschließlich im lokalen Testadapter. Ein Netzwerkfehler darf keinen lokalen Ersatzspielstand öffnen oder Speicherung vortäuschen.

Das Onboarding unter `/onboarding` hat drei Schritte: **Interessen → Fokus-Skills → Zusammenfassung**. Es bietet sieben Bereiche (Bewegung, Kampfsport, Ruhe & Erholung, Wissen & Lernen, Kreativität, Beruf & Projekte, Alltag), eine primäre Richtung und 1–6 aktive Skills aus dem 14er-Katalog. Die Startauswahl enthält Calisthenics, Running, Meditation und Programming. Die Präferenzen werden accountgebunden über die Journey-API gespeichert; sie beeinflussen Auswahl und Darstellung, vergeben aber keine XP, Attribute oder Rewards. `everbloom.journey.v1` gehört ausschließlich zum lokalen Testadapter. Der Creator kann zur laufenden Einführung zurückkehren; der Onboarding-Entwurf bleibt dabei erhalten. Überspringen und spätere Änderung bleiben möglich. Profil und Fortschritt liegen serverseitig in PostgreSQL. Offline-Synchronisierung ist nicht implementiert.

Dashboard, Avatar und Aktivitätsauswahl nutzen den aktuellen Spielstand und die Interessen-/Fokuspräferenzen. Reaktionszeilen und freiwilliger Tages-Check-in unterstützen das digitale Selbst ohne eine echte Zustandsdiagnose. Der Implementierungsumfang und tatsächlich bestandene Prüfungen werden getrennt in PRD und VALIDATION dokumentiert; reine Code- oder Dokumentationsänderungen sind noch keine Geräteabnahme.

## Accountfortschritt und Grenzen des lokalen Testadapters

Neue Accounts starten auf Level 1 mit 0 XP, Basisattributen von jeweils 1, 0 Momentum und vollem Wochenboss. Fortschritt und Belohnungen berechnet der Server transaktional, mit idempotenten Request-IDs und festen Perioden in `Europe/Vienna`. Per Account wählbare Zeitzonen und deren Wechselregeln bleiben offen.

Vor einem Aktivitäts-POST wird genau der ursprüngliche Befehl mit UUID, Skill, Minuten und Besitzer lokal gesichert. Ein unbestätigter Eintrag bleibt nach Verbindungsfehler, Logout oder App-Neustart für denselben Account bewusst wiederholbar; keine automatische Buchung, keine editierbaren Ersatzwerte und keine neue UUID. Nur eine bestätigte Serverantwort räumt ihn weg; Duplikate erzeugen keine zweite Belohnung oder Feier. Fehlender/defekter Gerätespeicher darf diese Absicherung nicht still umgehen. Bereits gespeicherte Einträge behalten ihren Tag; ein zuvor nie angenommener Eintrag zählt beim erfolgreichen Wiederholen am aktuellen Servertag. Das ist eine einzelne Wiederaufnahmehilfe, kein Offline-Sync. Bosskampf-Request-IDs bleiben vorerst nur in der Sitzung. Details in ARCHITECTURE.

Ausschließlich der lokale Demo-/Testadapter behält seinen Beispielstart mit Charakter-Level 12, vier fortgeschrittenen Skills und angeschlagenem Wochenboss. `everbloom.progress.v1` speichert `version`, `startDay` und akzeptierte Commands mit Request-ID, Skill-ID, Minuten und lokalem Day-Key. XP, Quests, Boss und `unlockedAuras` werden daraus mit den unveränderten Domainregeln rekonstruiert; keine direkt gespeicherten XP-/HP-/Besitzwerte blind übernehmen. Das Journal ist kein Importweg in echte Accounts. Änderungen an Balance/Katalog müssen künftig Replay-Kompatibilität und Migration ausdrücklich berücksichtigen.

Im lokalen Testadapter setzen lokale Tageswechsel Dailies und Skill-Tageslimits zurück, neue Montag–Sonntag-Wochen starten den Boss mit voller HP. Laden, Resume/Fokus und Buchungen prüfen die aktuelle Periode. Verlauf, XP und verdiente Auren bleiben erhalten; übersprungene Tage erzeugen keine Rewards oder Strafen. Der sichtbare Rhythmus basiert auf belohnten Aktivitäten dieser Woche. Vollständige Recovery-/Rest-/Cheat-Day-Regeln, frequenzabhängige Streaks und Weekly Quests sind dadurch noch nicht implementiert.

Das Journal ist auf 10.000 Einträge und 2 MiB begrenzt. Speicherzustände unterscheiden gespeichert, nur Sitzung, nicht verfügbar, beschädigt, unbekannte Version, Grenze und Uhrproblem. Kaputte/fremde Journale werden nicht still ersetzt; konkurrierende Tab-Änderungen nicht still überschrieben. Ungültiges oder rückwärts gestelltes Datum sperrt neue Einträge. Der Client und seine Uhr bleiben manipulierbar: keine servergeprüfte Wahrheit, kein Kaufrecht und keine Cloud-Sicherung behaupten.

Ein Reset im lokalen Testadapter verlangt eine konkrete Bestätigung und ersetzt das Journal durch einen leeren Beispielstart für heute. Verdiente Auren gehen verloren; eine angelegte verdiente Aura wird entfernt. Name, übrige Figur, Interessen und getrennte Einstellungen bleiben erhalten. Schreiben scheitert: bisherige persistierte Daten nicht als erfolgreich gelöscht ausgeben. Laden, Replay, Reset und Profiländerungen dürfen keine Erfolgsmusik oder neuen Grants auslösen.

## Professionelle Produktiteration und freiwillige nächste Schritte

Überarbeite Mechanik und Darstellung als zusammenhängendes Spiel für Handy und Tablet: erkennbare Charakterbindung, klare nächste Schritte im Alltag, verständliche Wochenentwicklung und eigene Bossbegegnungen. Behalte bestätigte Chibis und die freundliche Haltung zu Erholung bei. Eine Membership soll durch zusätzliche dauerhaft gepflegte Inhalte und Gestaltung überzeugen; professionelles Design ist kein Nachweis für Zahlungsbereitschaft. Der gesamte grundlegende Aktivität-/Avatar-/Progressionsloop bleibt Free, einschließlich der folgenden Vorschläge, Wochenziele und Übungstaktiken.

`buildDailyAdventure` leitet höchstens drei optionale Vorschläge aus Snapshot und Fokusreihenfolge ab. Verwende 5–20 ganze Minuten innerhalb der verbleibenden Skill-Tageslimits. Abgeschlossene Tagesquests und weniger als fünf noch belohnbare Minuten nicht erneut als Aufgabe präsentieren. Erholung/Ruhetag priorisiert vorhandene Recovery-, Meditation- und Breathwork-Skills; im Ruhetag höchstens fünf Minuten. Eine echte Pause ohne Eintrag ist ausdrücklich erlaubt. Die Vorschau verwendet die bestehende reine Aktivitätstransaktion und zeigt ihre tatsächlichen Aktivitäts-XP, erreichbare Questboni und Boss-Schaden. Tippen öffnet nur das vorausgefüllte Formular, bucht niemals automatisch. Vorschau und Rewards nicht reservieren oder als bereits verdient darstellen.

Drei freiwillige Wochenziele lesen vorhandene belohnte Aktivitäten der aktuellen Montag–Sonntag-Woche: drei verschiedene Tage, zwei Skill-Familien und ein Care-Tag. Zeige ihre Bedingungen klar. Keine zusätzlichen XP, Coins, Claims oder erfundenen Achievements. Wochen-XP heißen „Aktivitäts-XP“, da historische Questboni nicht vollständig im Snapshot vorliegen. Check-in ohne Aktivität, Zukunftstage und unbelohnte Einträge nicht als Fortschritt zählen. Wochenwechsel und Fokusänderung löschen keine vorhandenen Skills oder XP.

## Professionelles Mobile-Game-Erlebnis

Optimiere jeden Screen für Smartphones im Hochformat und Tablets im Hoch-/Querformat; Phone-Querformat bleibt bedienbar. Verwende angepasste Spalten und Inhaltsbreiten, eine gut einhändig erreichbare Aktivitätsaktion sowie eine erreichbare Creator-Speicherleiste. Bottom-Navigation, Footer, Safe Areas und Tastatur dürfen Inhalte, Fokus oder Aktionen nicht verdecken. Projektziele: Touchflächen mindestens 44 × 44 CSS-px, bevorzugt 48 × 48; Haupttext 14–16 CSS-px, sekundäre Texte mindestens 12, mobile Formfelder mindestens 16. Große Schrift und Screenreader berücksichtigen.

Ton, Feuerwerk und Charakterbewegung bleiben separat steuerbar. Beachte reduzierte Bewegung und mobile Performance; SVG-Gradienten-/Masken-IDs müssen pro Chibi-Instanz eindeutig sein. Prüfe Lade-, Fehler-, Leer-, Offline- und Resume-Zustände sowie wiederholte Requests. Behaupte keinen Offline-Sync oder Cloud-Backup auf Basis des lokalen Journals. Native Haptik bleibt geplant; Lifecycle, Audio-Unterbrechungen und die implementierten Kauf-/Restore-Adapter benötigen echte iOS-/Android-Geräteprüfungen. Die mobile Shell, Creator-Fußleiste und Tablet-Anpassung sind umgesetzt; Abnahmeberichte stehen in VALIDATION.

## Technik und Domain

Frontend: Angular 21, kompatibles TypeScript strict, Standalone Components, Signals/computed, zoneless Change Detection, Router mit lazy Routes und SCSS mit Design-Tokens. Mobile-first CSR-App mit vorhandenen Capacitor-8-Projekten für iOS und Android. Trenne reine Domainregeln, asynchronen Datenadapter, Signal-State und Darstellung. Plattformfunktionen erhalten kleine Adapter. Keine Microservices, NgRx, Nx, GraphQL oder generischen Repository-Hierarchien ohne konkreten Bedarf.

Backend: Spring Boot 4.1.1 / Java 21 als modularer Monolith, PostgreSQL und Flyway. Unterstützte Paketversionen sind im Projekt festgehalten. Kernmodelle: Character, Appearance, CharacterProfile, JourneyPreferences, SkillDefinition, SkillProgress, Activity, Quest, DailyQuestPlan, WeeklyBoss, Momentum, GameSnapshot, ActivityResult, GameProgressJournal und AuraReward; der reine View-Typ ProgressionHorizon zeigt bestehende Ziele. Membership-State, Kaufadapter und serverseitig verifizierte Entitlements sind implementiert. Später folgen allgemeines Inventar, Achievements und eigene mehrtägige Pläne. Aktivität, XP, Quest und Boss werden atomar aktualisiert. Idempotente Requests verhindern Doppelbelohnungen. Der Server berechnet Fortschritt, verifiziert Berechtigungen und definiert Zeitzonen/Perioden; der Client darf keine maßgeblichen XP vorgeben. Erhalte die implementierte Authentifizierung, sicheren Sessions und vollständige Kontolöschung; prüfe zusätzliche personenbezogene Datenflüsse vor ihrer Einführung. Keine Auth-Tokens als stillschweigenden localStorage-Default. Validiere Eingaben und Zugriffe serverseitig; trenne Profildaten, Fortschritt und Kaufberechtigungen. Dokumentiere Datenflüsse und integriere Tracking oder Health-SDKs nur bei konkretem Produktbedarf.

## Geschäftsmodell, Store-Reife und Meilensteine

Der V1-Vertrag umfasst **fünf Normal-Bosse Free bis einschließlich Wolkenkönig (Basislevel 50)**.
**35 Begegnungen benötigen aktives Plus**: sämtliche Modi der fünf Bosse auf Basislevel 60–100
sowie Hard/Episch/Ultimate der ersten fünf Bosse. Die Grenze gilt auch für Probekämpfe.
Der grundlegende Aktivitäts-/Avatar-/Skill-/Questloop, Erholung und Progression bleiben kostenlos;
Skills, XP und Charakterlevel werden nicht durch die Membership gedeckelt. Plus ergänzt **10 % Charakter-Aktivitäts-XP**,
gerundet als `floor(Aktivitäts-XP / 10)`. Keine zusätzlichen Skill-XP, Questboni oder direkten
Kampfboni; reale Minuten, Tagesgrenzen und Entdeckungs-/Levelvoraussetzungen bleiben bestehen.
Verdiente XP, Level und Cosmetics bleiben nach Abo-Ende erhalten und ausrüstbar; der Zugang zu
Plus-Kämpfen und der XP-Zuschlag enden; bereits verdiente Inhalte bleiben erhalten. Kontolöschung ist getrennt und kündigt kein Store-Abo.
Neue Storys, zusätzliche Skills/Subskills und Questreihen sind spätere Ziele, kein V1-Kaufversprechen.

Preisziel: **3,99 € monatlich**. Die Kaufansicht verwendet den tatsächlichen lokalisierten
Store-Preis; Jahresplan und Trial sind nicht festgelegt. Der frühere 4,99-€-Kandidat ist keine
beschlossene Preisänderung. Native RevenueCat-Adapter, Restore, Serverprüfung und
Entitlement-Lebenszyklus sind im Code vorhanden. `EVERBLOOM_BILLING_MODE=preview` ist Standard:
ausdrückliche lokale Testvorschau aller Modi, keine Käufe und kein XP-Vorteil. Diese QA-Ausnahme
ist kein gekauftes Plus und muss entsprechend gekennzeichnet sein. Erst vollständig konfiguriertes
`live` verwendet die Plus-Grenzen. Echte Store-Verbindung, Kaufabnahmen, Hosting und vollständige
Betreiber-/Kontaktangaben sind offen. Implementierung ist keine Verkaufsfreigabe. Verbindlich:
[MONETIZATION.md](MONETIZATION.md) und [RELEASE_V1.md](RELEASE_V1.md).

Berücksichtige Apple App Store und Google Play früh: Touch, Safe Areas, große Schrift, Screenreader, Navigation, Tastatur, Resume, Fehlerfälle, Datenschutz und die vorhandene Account-Löschung. Die implementierte native Membership benötigt jetzt echte Store-Verbindung sowie Kauf-, Restore- und Laufzeitabnahmen. Prüfe aktuelle offizielle Anforderungen beim nativen Scaffold und vor Einreichung.

ASO betrifft Store-Positionierung, Suchbegriffe, eigene Icons, echte Screenshots und lokalisierte Listings. SEO betrifft eine spätere öffentliche Produkt-/FAQ-/Support-Website mit statischen oder vorgerenderten Seiten. Das private Dashboard bleibt CSR und erhält keine SEO-Umbaupflicht. Die endgültige Oberfläche erhält Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch, Chinesisch, Japanisch, Russisch und Koreanisch. Jetzt Texte auslagerbar halten und ein zentrales Locale-Modell planen; Sprachpakete und Übersetzungen folgen in der Endphase/M4. Noch offen: Schweizer Hochdeutsch (`de-CH`) oder Schweizerdeutsch (`gsw`), Portugiesisch Portugal/Brasilien und vereinfachtes/traditionelles Chinesisch. Keine Variante erfinden. Alle Screens, Fehler-/Statusmeldungen, Accessibility-Texte, Store und Support sowie Datum, Zahlen und Pluralformen einbeziehen; deutscher Fallback und Sprachnamen statt Flaggen. Aktuell bleibt die Demo deutsch. Name und Markenlage vor verbindlichem Branding prüfen. Versprich nur vorhandene Funktionen; veröffentliche erst mit ausdrücklichem Release-Auftrag.

Plane und kennzeichne die Meilensteine ausdrücklich:

- **M0 – Fundament:** dokumentierte Regeln, Domain Model und Angular-Struktur sind vorhanden.
- **M1a – Dashboard und Personalisierung:** illustriertes Portrait, Level/XP, Momentum, sechs Stats, Daily Quests, aktive Skills aus dem 14er-Katalog, Weekly Boss, Aktivitätsformular und Erfolgsfeedback sind vorhanden. Creator mit zwölf Designs, getrennten Frisuren/Outfitsets, Farben und accountgebundenem Profil ist eingebaut. Die lokalen Beispielstarts sind auf Vorschau und Testadapter begrenzt. Assetkompositionen und mobile Darstellung benötigen fortlaufende visuelle Abnahme.
- **M1b – integrierter Solo-Beta-Kern:** geschützter Kontofluss mit Verifikation/Reset/Export/Löschung, Character-/Journey-/Game-API, serverautoritativer Fortschritt und fünf Aktivitäts-Aura-Belohnungen sind implementiert. Onboarding, freiwilliger Check-in, Tages-/Wochenwechsel sowie Lade-/Fehlerzustände sind vorhanden. Der Check-in bleibt im Accountmodus flüchtig. Minimale Subskills, vollständige Recovery/Rest/Cheat-Day-Regeln und frequenzabhängige Streaks bleiben offen. Native Account-Flows und Betrieb brauchen noch Abnahme; keine fertige Vollversion behaupten.
- **M2 – Spieltiefe, teilweise vorgezogen:** zehn serverautorisierte Bossbegegnungen, vier Modi, einmalige kosmetische Rewards, 26 ausgerüstete Auren und unterschiedliche epische Set-Stile sind vorhanden. Offen bleiben Produktionsreife geriggter Chibis/Bosse gemäß Animation Pipeline, erweiterte Slots/Garderobe, reichere Gesten/Mimik, allgemeines Equipment/Iteminventar, Achievements, Titles und weitere Kapitel. Keine vorschnelle soziale Plattform.
- **M3 – Membership:** V1-Entitlements, +10 % Charakter-Aktivitäts-XP, nativer Kauf-/Restore-Adapter und serverseitige Prüfung sind implementiert. Reale Store-/RevenueCat-Verbindung, Kauf-, Verlängerungs-, Ablauf- und Rückerstattungsabnahmen sind offen. Kein clientseitiges Kaufvertrauen und keine behauptete Verkaufsfreigabe.
- **M4 – native Fassung, teilweise vorgezogen:** Capacitor-Projekte und native Transportadapter sind vorhanden; Android-Debug-APK und iOS-Simulator-App wurden lokal gebaut, installiert und gestartet. Offen bleiben HTTPS-Account-Abnahme auf echten Geräten, Signierung/Verteilung, neun UI-Zielsprachen mit geklärten Varianten, lokalisierte Listings/Medien und finale Privacy-Angaben. Ein Simulatorstart ersetzt diese Abnahme nicht.
- **M5 – Release:** vollständige Beta-/Geräteprüfung, Performance, Datenschutz und Löschung, Store-Freigabe sowie öffentliche SEO-Seiten und ASO-Messung. Kein automatisch zugesicherter Store-Erfolg.
- **Danach:** optionale Classes/Archetypes, Parties, Guilds und Raids auf stabiler Solo- und Backend-Grundlage.

Endgültige XP-Kurven, Maximallevel, weitere Tageslimits, Momentum-Abnahme, Zeitzonenwechsel und Tagesmodusregeln werden mit Beispielen und Tests entschieden, bevor gespeicherte Spielstände von einer Regeländerung betroffen sind. Bereits vorhandene serverseitige Daten und lokale Testjournale brauchen dabei einen bewussten Versions-/Migrationspfad. Vollständigkeit dieses Briefings bedeutet eine klare gemeinsame Richtung, keine erfundene Endgültigkeit ungeprüfter Zahlen.

Prüfe pro Slice relevante fachliche Grenzfälle, Store-/UI-Datenfluss, Produktionsbuild und mobile Browserdarstellung. Native Qualität benötigt echte Geräteprüfungen. Halte Validierung und offene Grenzen aktuell und erkläre den nächsten sinnvollen Lernschritt.


## Verbindlicher Beta-Stand · abgeglichen am 5. Oktober 2026

Zielplattform bleibt eine mobile App für **iOS und Android**, verpackt mit Capacitor. Ein Browser-Test
ist kein Ersatz für signierte native Builds und echte Gerätetests. Der vorhandene Quellcode enthält
beide App-Projekte. Version 0.2.0 / Build 2 wurde am 4. Oktober lokal als Android-Debug-APK und iOS-Simulator-App gebaut, installiert und gestartet. Ohne endgültige HTTPS-API-Adresse verweigert der native Client Kontozugriffe.
Keine Produktions-`server.url`, kein stiller localhost-Fallback, keine Session-Tokens im Gerätespeicher.

Account zuerst: Registrierung → E-Mail bestätigen → Login → eigenen Chibi erstellen → Interessen
wählen → Dashboard. Passwort-Reset widerruft vorhandene Sitzungen. Konto bietet Export und endgültige
Löschung mit erneuter Passwortbestätigung. Spielstände gehören ausschließlich zur serverseitig
authentifizierten Account-ID. Aktivitäten akzeptieren nur Skill, Minuten und eine Request-ID;
Belohnungen, Tageslimits und Wochenboss werden atomar vom Server berechnet. Wiederholungen derselben
ID erzeugen keine weiteren Belohnungen. Die erste Beta verwendet Europe/Vienna als Spielzeitzone.

Neue Konten beginnen bei Level 1 und 0 XP. Demo-Level 12, Übungskämpfe und Erfolgsvorschauen
verleihen keine echten Account-Rewards. Spielstände sind online; kein ungetesteter Offline-Sync.
Der ausdrücklich lokale Defaultmodus `preview` bleibt eine gekennzeichnete kostenlose
Testvorschau aller Modi ohne Kauf und XP-Bonus. Er ist kein gekauftes Plus. Die V1-Implementierung
enthält native Käufe/Restore und serverseitige Entitlements für einen später konfigurierten
`live`-Betrieb zum Preisziel **3,99 € monatlich**; reale Store-Käufe sind noch nicht abgenommen.

Apple-/Google-Entwicklerkonten sind laut Betreiber vorhanden. Bestätigt am 8. Oktober 2026:
bürgerlicher Name **Adderlyn Windsor**, Land **Österreich**, erste eigene App; bislang laut eigener
Angabe keine Anmeldung als Selbstständiger oder Unternehmer. Keine Gesellschaft, Gewerbeberechtigung
oder abgeschlossene Gründung unterstellen. Vor einem kommerziellen Angebot Einordnung und nötige
Anmeldungen klären. Anschrift und Supportkontakt sind noch offen, ebenso öffentliche Domain, Hosting
und SMTP; RevenueCat ist nicht als eingerichtet bestätigt.
Vorbereitung und Nachweise: `RELEASE_V1.md`, `MONETIZATION.md`, `BETA_RELEASE.md`,
`NATIVE_BETA.md`, `BETA_OPERATIONS.md`. Vor öffentlicher Verteilung müssen
Betreiber/Kontakt, Datenverarbeitung, Asset-Rechte, Sicherung/Wiederherstellung und native Builds
geprüft werden. Niemals allein aus erfolgreichen Tests eine Store-Zulassung oder einen Live-Release
behaupten. Offene Features aus dem großen Masterprompt bleiben Roadmap, keine zugesagte Beta-Funktion.


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

Der Server entscheidet Kampf und Besitz; Vorschauen und Wiederholungen gewähren keine
zusätzliche Beute oder Charakter-XP. Verbindliche Regeln und Grenzen stehen in
[BOSS_ENCOUNTERS.md](BOSS_ENCOUNTERS.md). Die konkreten Bild- und Klangvorgaben stehen in
[VISUAL_AUDIO_DIRECTION.md](VISUAL_AUDIO_DIRECTION.md). Datierte ältere Abnahmen beschreiben
jeweils ihren damaligen Katalog; aktuelle Nachweise stehen in [VALIDATION.md](VALIDATION.md).
