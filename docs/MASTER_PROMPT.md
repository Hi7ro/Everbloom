# Master Prompt · Real-Life MMORPG „Everbloom“

Arbeite am bestehenden Projekt `/Users/xv7ro/dev/everbloom` weiter. Everbloom ist ein vorläufiger Arbeitstitel. Entwickle eine eigenständige Real-Life-MMORPG-App und zugleich ein verständliches Full-Stack-Lernprojekt. Leitsatz: **You are the character. Real life is the progression.**

## Arbeitsgrundlage und Vorgehen

Lies zuerst anwendbare `AGENTS.md`-Anweisungen sowie `README.md`, `docs/GAME_DESIGN.md`, `docs/ART_DIRECTION.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/DOMAIN_MODEL.md`, `docs/APP_STORE_READINESS.md` und `docs/VALIDATION.md`. Dieser Master Prompt bündelt Vision, akzeptierte Produktentscheidungen und Leitplanken. GDD, PRD, Architektur und Domain Model konkretisieren Regeln, Umsetzungsumfang und Abnahme. Neue ausdrückliche Nutzerentscheidungen haben Vorrang; gleiche betroffene Dokumente anschließend miteinander ab. Bei Widersprüchen nicht stillschweigend neu erfinden: prüfe den jüngsten akzeptierten Stand und dokumentiere die Auflösung. Ältere Brainstormings dienen als Kontext. Synchronisierte Referenzen unter `sources/` im ursprünglichen ChatGPT-Projekt bleiben unverändert. Prüfe bestehende Dateien, bevor du Änderungen planst, und erhalte bereits funktionierende Arbeit.

Arbeite in kleinen, überprüfbaren vertikalen Slices. Kein riesiger Code-Dump und keine unnötige Enterprise-Komplexität. Dokumentiere fachliche Entscheidungen zusammen mit Code und passenden Tests. Erkläre knapp, was geändert wurde, warum und wie es geprüft wurde. Unterscheide konsequent zwischen implementierten Funktionen, Mock-Daten, vorläufigen Balancewerten und späteren Zielen. Aktualisiere diesen Master Prompt bei wesentlichen Produktentscheidungen.

## Spielidee und Identität

Der Nutzer verkörpert seinen Charakter. Reale Aktivitäten erzeugen Charakter-XP, Skillfortschritt und passende spielerische Attribute und tragen zu Quests sowie einem persönlichen Wochenboss bei. Sichtbarer Fortschritt, individuelle Gestaltung und erreichbare Ziele motivieren zur nächsten Aktivität. Stats sind Spielwerte und keine objektive Bewertung menschlicher Leistungsfähigkeit.

Der Chibi ist das **digitale Selbst**, die eigene kleine Version des Nutzers. Sich um ihn zu kümmern bedeutet reale Entwicklung in allen Lebenslagen: Bewegung, Lernen, Kreativität, Beruf, Alltag, soziale Beziehungen und Erholung. Der Care Loop lautet **Wahrnehmen → kleine reale Handlung → Chibi-Reaktion → Fortschritt und ruhiger Ausblick**. Das Prinzip eines virtuellen Begleiters schafft Bindung; Produkt, Figuren und Verhalten bleiben eigene IP. Keine Hungerstrafen, kein Tod bei Abwesenheit, kein Verlust verdienter XP und keine Schuldzuweisung bei Pausen. Langfristige Stimmung, Haltung und Gesten reagieren auf freiwillige Interessen, Tagesmodus und Aktivitäten; keine automatische Gesundheits-/Stimmungsdiagnose. Noch kein umfassendes Bedürfnisse-/Mood-System: zunächst Gesten und eine kurze Reaktionszeile zur letzten belohnten Aktivität, ein implementierter freiwilliger Check-in mit Tagesmodus und lokalem Tageswechsel, in M2 reichere Avatarreaktionen.

## Charakter, Gestaltung und Ausrüstung

Verwende die bestätigte [Art Direction](ART_DIRECTION.md) als verbindlichen Qualitätsbrief: eigenständige, ausdrucksstarke Anime-Chibis in leichter Dreiviertelansicht, definierte Haarsträhnen und gemalte 2.5D-Tiefe mit sorgfältigen Stoff-/Metallflächen. Der Körper und seine Kleidung müssen gut sichtbar bleiben; neue modulare Figuren dürfen einen kleineren Kopf als die ursprüngliche Vorlage haben. Die fünf Stilfamilien **Cozy, Adventurer, Elegant, Dark und Abyssal** reichen von süßer Freizeitkleidung bis zu eleganter, gothic und extrem edgy High Fantasy. Sie sind weder Klassen noch Seltenheiten. Ein Katzenhoodie passt zu Kampfsport, dunkle Rüstung zu rosa Aura. Figuren, Lore, Begriffe, Musik und Effekte bleiben eigene IP.

Die Gestaltung soll unterschiedliche Altersgruppen ansprechen, ohne eine Altersfreigabe oder Marktwirkung zu versprechen. Männliche und weibliche Darstellung erhalten gleichwertige Materialqualität und sind über Gesicht, Haltung und Silhouette klar lesbar, ohne Sexualisierung. Darstellung und Hauttöne sind rein visuell: keine demografische Ableitung, Statboni oder geschlechtsspezifischen Stilzugänge. Der aktuelle Modulkatalog verwendet passende Anker je Darstellung; daraus entsteht keine fachliche Einschränkung der Skills oder fünf Stilfamilien.

Der Creator zeigt ausschließlich illustrierte Figuren. Der frühere Vektor-Editor ist vollständig aus der Benutzeroberfläche entfernt. Zwölf Startdesigns sind angelegt, je sechs männliche und weibliche, jeweils mit eigener Frisur und vollständigem Outfitset:

| Darstellung | Startdesigns und charakteristische Gestaltung |
|---|---|
| Männlich | **Smaragdwächter:** silberne Spikes, Schwarzgold-Rüstung und Smaragdkern. **Urbaner Abenteurer:** dunkler Messy Cut, Jacke/Hoodie, High-Tops und Gürteltasche. **Frostgelehrter:** aschblaue Curtains, navy-ivory Gelehrtenmantel, Gürtelbuch und Kristall. **Glutkämpfer:** kupfernes Kurzhaar, rot-anthrazites Trainingsgewand, Handschutz und Glutanhänger. **Waldläufer:** dunkler Topknot, grüner Ledermantel, Bogen/Köcher und Taschen. **Abgrundwanderer:** schwarzer Undercut, Obsidianrüstung, violetter Kern, Cape und befestigte Klinge. |
| Weiblich | **Nachtklinge:** violetter Bob, dunkle Plattenrüstung mit Goldkanten und Kristallen. **Sternenweberin:** langer brauner Zopf, heller Reisemantel, Teal-Schärpe und Tasche. **Morgenhüterin:** goldene Wellen, Ivory-Gold-Lichtrobe, Amulett und Gürtelbuch. **Rosenläuferin:** rotbrauner Pferdeschwanz, Rosé-Cream-Sportjacke, Hose/Sneakers und Tasche. **Leerenweberin:** dunkle Twin Tails, Obsidian-Violett-Robe/Rüstung, Grimoire und befestigter Orb. **Himmelsjägerin:** silberner Pixie mit Teal, navy-teal Jägerinnenmantel, Bogen/Köcher und Stiefel. |

Die vier unveränderten Original-PNGs von Smaragdwächter, Urbanem Abenteurer, Nachtklinge und Sternenweberin bleiben bei unveränderter Vorlagenwahl die Standardansicht. Separate Masken blenden ihren Hintergrund aus. Name, Starter-Aura und Bewegung verändern diese Bilddateien nicht. Bei einem expliziten Frisur-, Outfit- oder Farbwechsel wird die modulare Bildkomposition verwendet; ihre neu erstellten Teile sind keine pixelidentische Zerlegung der vier Originale. Behaupte keine unveränderte Originalzeichnung für angepasste Varianten.

Frisur und Outfitset sind unabhängig wählbar, aktuell je sechs passende Optionen pro Darstellung. Gemalte Körper, Gesicht/Basiskopf und Haare werden über separate Masken und feste Anker zusammengesetzt. Haut-, Augen- und Haarfarbe bieten jeweils **Original plus sechs Farben**; Schattierung und Material sollen dabei erhalten bleiben. Jede Auswahl bleibt kosmetisch. Der Vorlagenwechsel setzt diese Anpassungen auf die Vorlage zurück. Die Startsets enthalten immer vollständige Kleidung; angehängte Waffen, Taschen, Bücher, Schmuck oder Rückenobjekte sind derzeit Bestandteil des jeweiligen Sets.

Das Equipment-Ziel umfasst vollständige Sets sowie getrennte Slots für **Kopf, Gesicht, Haare, Torso, Arme, Beine, Schuhe, Haupthand, Nebenhand, Rücken, Accessoire, Aura und Companion**. Einzelne Ausrüstungsslots, Waffenwechsel, Inventarbesitz und Loot sind noch nicht implementiert. Gameplay-Equipment und sichtbaren Look getrennt modellieren. Neue Assets brauchen stabile Leinwand, Perspektive, Anker, Überlappungen und Zeichenreihenfolge; die Produktions- und Maskenvorgaben stehen im Art Guide. Mobile Assetbudgets sind vor Produktionsfreigabe festzulegen und auf Geräten zu prüfen, keine bereits gemessene Performance behaupten.

Ruhige Ganzkörperatmung ist eingebaut: die Originalillustration bewegt sich geschlossen, modulare Körper- und Kopflayer atmen gekoppelt mit zurückhaltendem Gesamt-Idle. Bewegung lässt sich abschalten; reduzierte Bewegung wird respektiert. Interessenbezogene Gesten und visuelle Entwicklung in den vorläufigen Levelbereichen 1–9, 10–24 und 25+ bleiben die weitere Richtung. Ein vorhandener Darstellungsresolver bedeutet noch keine ausgearbeitete Gestenbibliothek, Gesichtsmimik oder automatische Level-Outfits für alle illustrierten Figuren.

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

60 beziehungsweise 90 vollständig belohnte Calisthenics-Minuten ergeben 240/360 Skill-XP und mit einmaligem 50-XP-Questbonus 290/410 Charakter-XP. Auf Demo-Charakterlevel 12 sind das 8,5/12,1 % einer gesamten Levelspanne; auf Skilllevel 9 etwa 10,9/16,4 %. Eine einzelne längere Einheit soll somit nicht automatisch einen ganzen Balken füllen. Ein bereits fast voller Balken darf selbstverständlich aufsteigen. Höchstens 720 Boss-Schaden pro Calisthenics-Tag. Zeitbeispiele sind Balancewerte, keine Trainingsempfehlungen.

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

Später folgen Loot, Equipment, frei kombinierbare Cosmetics, Seltenheitsstufen, Achievements und Titles. Seltenheit ist vom visuellen Stil unabhängig. Klassen/Archetypen ergänzen Spielstile, ohne reale Fähigkeiten zu sperren. Parties, Guilds und Raids folgen erst nach einem stabilen Solo-Spiel.

## Auren: Gestaltung, Vorschau und Freischaltung

Auren sollen die ganze Figur umgeben: Bodenzeichen, Formen hinter dem Körper, vordere Partikel und optionale Augeneffekte bilden getrennte Ebenen. Gesicht, Silhouette und Bedienung bleiben lesbar. Gewünscht sind Sterne, mystische Siegel, Chakra-/innere Energie, dämonische Energie mit oder ohne bedrohlich leuchtenden Blick, Licht, Energie in verschiedenen Farben, Engelsformen, Kirschblüten, Feuer und eine große geistartige Schutzgestalt. Chakra bezeichnet hier ein Fantasy-Motiv ohne gesundheitliche oder diagnostische Bedeutung. Die genannten Anime-Vorbilder liefern nur Genre-Ideen für Energie und Präsenz; keine Franchise-Figuren, Symbole, konkreten Silhouetten oder Sounds übernehmen.

Verbindliche eigene Namen: **Sternenspuren, Mystischer Schleier, Innere Harmonie, Dämonenschatten, Lichtkrone, Energiefluss, Himmelsflügel, Blütenwind, Flammenherz und Geistwächter**. Der Art Guide beschreibt Motiv und technische ID je Aura. Farben sollen perspektivisch frei variierbar werden; die aktuelle Vorschau bietet sechs Farben.

`CharacterAura` enthält drei Starter-Effekte (`sage`, `rose`, `void`) plus „Keine“ sowie zehn erweiterte SVG/CSS-Effektentwürfe. Die erweiterten Entwürfe sind ausschließlich im Creator ausprobierbar, werden weder gespeichert noch freigeschaltet und sind keine fertige Sammlung gerasterter Produktions-VFX. Der optionale bedrohliche Blick sitzt aktuell im dämonischen Schatten hinter dem Chibi; er verändert noch nicht die tatsächlichen Avataraugen. Ein separater Gesichtsausdruck und präzise an den Irisankern sitzendes Leuchten sind spätere Parameter. Alle Auren bleiben kosmetisch, ohne XP- oder Statwirkung.

Der bestehende Freischaltungsplan bleibt unverändert: **Nordlicht ab Charakterlevel 20, Sternenkranz ab Level 40, Moosseele als Bossdrop des Mooswächters**. Keine Dropchance erfinden. Diese drei Ziele sind derzeit nur als geplant sichtbar; Besitzrechte und Loot-Vergabe fehlen. Vorschau-Level und Demo-Siege gewähren sie nicht. Bewegungsabschaltung und reduzierte Bewegung gelten auch für Aura-VFX.

## Erfolgsfeedback, lokales Profil und Onboarding

Erfolgsfeedback umfasst Charakter-/Skill-Levelaufstiege, den ersten belohnten Tageseintrag, alle vollständig abgeschlossenen Daily Quests und einen besiegten Wochenboss. Einzelne Questabschlüsse erzeugen keinen eigenen Jingle. Eine etwa sechs Sekunden sichtbare Erfolgskarte bündelt Ereignisse mit kleinem CSS-Feuerwerk und eigenem Vier-Ton-Jingle über Web Audio. Das soll ein angenehmes Erfolgserlebnis ähnlich dem Prinzip klassischer MMORPGs vermitteln. Keine kopierten RuneScape-Sounds oder Assets. Ton, Feuerwerk und Charakterbewegung sind separat steuerbar; Einstellungen werden lokal gespeichert. Respektiere reduzierte Bewegung, Browser-Audioregeln und Unterbrechungen. Erfolg muss auch ohne Ton und Bewegung verständlich bleiben. Reload, Reset und doppelte Requests dürfen Erfolge nicht erneut abspielen.

Der Creator unter `/character/create` bietet Name, Darstellung, zwölf illustrierte Vorlagen, getrennte Frisur-/Outfitwahl, drei Farbpaletten, Starter-Aura und optionale Bewegung mit direkter Vorschau. Profil-Schemaversion 2 unter `everbloom.character.v2` speichert ausschließlich validierte Name-/Appearance-Daten; Vorlagen und Module müssen zur Darstellung passen, Farben zur jeweiligen Palette. Frühere Profile werden über den bestehenden Migrations-/Normalisierungspfad weiter eingelesen; alte technische Felder sind keine weiterhin angebotenen Editor-Modi. Bei gesperrtem Browser-Speicher bleibt nur ein ehrlich gekennzeichneter Sitzungsstand. Demo-Reset erhält das Profil. Fortschritts-XP sind weiterhin nicht dauerhaft gespeichert.

Das Onboarding unter `/onboarding` hat drei Schritte: **Interessen → Fokus-Skills → Zusammenfassung**. Es bietet sieben Bereiche (Bewegung, Kampfsport, Ruhe & Erholung, Wissen & Lernen, Kreativität, Beruf & Projekte, Alltag), eine primäre Richtung und 1–6 aktive Skills aus dem 14er-Katalog. Die Startauswahl enthält Calisthenics, Running, Meditation und Programming. Die Präferenzen liegen getrennt im validierten lokalen Schema `everbloom.journey.v1`; sie beeinflussen Auswahl und Darstellung, vergeben aber keine XP, Attribute oder Rewards. Der Creator kann zur laufenden Einführung zurückkehren; der Onboarding-Entwurf bleibt dabei erhalten. Überspringen und spätere Änderung bleiben möglich. Serverprofile, Synchronisierung und vollständige Fortschrittspersistenz fehlen weiterhin.

Dashboard, Avatar und Aktivitätsauswahl nutzen den aktuellen Spielstand und die Interessen-/Fokuspräferenzen. Reaktionszeilen und freiwilliger Tages-Check-in unterstützen das digitale Selbst ohne eine echte Zustandsdiagnose. Der Implementierungsumfang und tatsächlich bestandene Prüfungen werden getrennt in PRD und VALIDATION dokumentiert; reine Code- oder Dokumentationsänderungen sind noch keine Geräteabnahme.

## Professionelles Mobile-Game-Erlebnis

Optimiere jeden Screen für Smartphones im Hochformat und Tablets im Hoch-/Querformat; Phone-Querformat bleibt bedienbar. Verwende angepasste Spalten und Inhaltsbreiten, eine gut einhändig erreichbare Aktivitätsaktion sowie eine erreichbare Creator-Speicherleiste. Bottom-Navigation, Footer, Safe Areas und Tastatur dürfen Inhalte, Fokus oder Aktionen nicht verdecken. Projektziele: Touchflächen mindestens 44 × 44 CSS-px, bevorzugt 48 × 48; Haupttext 14–16 CSS-px, sekundäre Texte mindestens 12, mobile Formfelder mindestens 16. Große Schrift und Screenreader berücksichtigen.

Ton, Feuerwerk und Charakterbewegung bleiben separat steuerbar. Beachte reduzierte Bewegung und mobile Performance; SVG-Gradienten-/Masken-IDs müssen pro Chibi-Instanz eindeutig sein. Prüfe Lade-, Fehler-, Leer-, Offline- und Resume-Zustände sowie wiederholte Requests. Behaupte keinen Offline-Sync auf Basis des Memory-Mocks. Native Haptik, Lifecycle, Audio-Unterbrechungen und spätere Käufe/Restore benötigen kleine Plattformadapter und echte iOS-/Android-Geräteprüfungen. Die mobile Shell, Creator-Fußleiste und Tablet-Anpassung sind umgesetzt; Abnahmeberichte stehen in VALIDATION.

## Technik und Domain

Frontend: Angular 21, kompatibles TypeScript strict, Standalone Components, Signals/computed, zoneless Change Detection, Router mit lazy Routes und SCSS mit Design-Tokens. Mobile-first CSR-App; später Capacitor für iOS und Android. Trenne reine Domainregeln, asynchronen Datenadapter, Signal-State und Darstellung. Plattformfunktionen erhalten kleine Adapter. Keine Microservices, NgRx, Nx, GraphQL oder generischen Repository-Hierarchien ohne konkreten Bedarf.

Backend-Ziel: Java/Spring Boot als modularer Monolith, PostgreSQL und Flyway. Lege unterstützte Versionen beim Scaffold fest. Kernmodelle: Character, Appearance, CharacterProfile, JourneyPreferences, SkillDefinition, SkillProgress, Activity, Quest, WeeklyBoss, Momentum, GameSnapshot und ActivityResult; später Inventar, Achievements, Tagespläne und Entitlements. Aktivität, XP, Quest und Boss werden atomar aktualisiert. Idempotente Requests verhindern Doppelbelohnungen. Der Server berechnet Fortschritt, verifiziert Berechtigungen und definiert Zeitzonen/Perioden; der Client darf keine maßgeblichen XP vorgeben. Plane Authentifizierung, sichere Sessions und Löschung vor personenbezogener Persistenz. Keine Auth-Tokens als stillschweigenden localStorage-Default. Validiere Eingaben und Zugriffe serverseitig; trenne Profildaten, Fortschritt und Kaufberechtigungen. Dokumentiere Datenflüsse und integriere Tracking oder Health-SDKs nur bei konkretem Produktbedarf.

## Geschäftsmodell, Store-Reife und Meilensteine

Free bleibt dauerhaft sinnvoll spielbar mit Skills, wiederkehrenden Quests, Bossen und permanenter Progression. Membership erweitert Inhalte, Skills/Subskills, Questreihen, Bosse, Progressionspfade und Cosmetics. Vorläufiger Kandidat: +10 % ausschließlich auf Charakter-Aktivitäts-XP. Der geplante monatliche Endkundenpreis beträgt **3,99 € pro Monat**. Ein Jahrespreis ist nicht festgelegt. Regionale Store-Preisstufen, Steuern und Nettoerlös sind vor der Billing-Implementierung zu prüfen; das Preisziel ist beschlossen, aber noch kein registriertes Store-Produkt. Entitlements und genaue Nutzbarkeit von Member-Inhalten nach Ablauf bleiben vor M3 zu entscheiden. Verdiente XP, Level und freigespielte Inhalte werden nicht durch Kündigung gelöscht. Kein erfundener Checkout und kein bezahlter Erholungszwang. Die derzeitige Demo bleibt Free ohne Membership-Bonus.

Berücksichtige Apple App Store und Google Play früh: Touch, Safe Areas, große Schrift, Screenreader, Navigation, Tastatur, Resume, Fehlerfälle, Datenschutz und spätere Account-Löschung. Native Membership benötigt passende Store-Abrechnung, serverseitige Kaufprüfung, Restore und getestete Laufzeiten. Prüfe aktuelle offizielle Anforderungen beim nativen Scaffold und vor Einreichung.

ASO betrifft Store-Positionierung, Suchbegriffe, eigene Icons, echte Screenshots und lokalisierte Listings. SEO betrifft eine spätere öffentliche Produkt-/FAQ-/Support-Website mit statischen oder vorgerenderten Seiten. Das private Dashboard bleibt CSR und erhält keine SEO-Umbaupflicht. Die endgültige Oberfläche erhält Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch, Chinesisch, Japanisch, Russisch und Koreanisch. Jetzt Texte auslagerbar halten und ein zentrales Locale-Modell planen; Sprachpakete und Übersetzungen folgen in der Endphase/M4. Noch offen: Schweizer Hochdeutsch (`de-CH`) oder Schweizerdeutsch (`gsw`), Portugiesisch Portugal/Brasilien und vereinfachtes/traditionelles Chinesisch. Keine Variante erfinden. Alle Screens, Fehler-/Statusmeldungen, Accessibility-Texte, Store und Support sowie Datum, Zahlen und Pluralformen einbeziehen; deutscher Fallback und Sprachnamen statt Flaggen. Aktuell bleibt die Demo deutsch. Name und Markenlage vor verbindlichem Branding prüfen. Versprich nur vorhandene Funktionen; veröffentliche erst mit ausdrücklichem Release-Auftrag.

Plane und kennzeichne die Meilensteine ausdrücklich:

- **M0 – Fundament:** dokumentierte Regeln, Domain Model und Angular-Struktur; bereits vorhanden. Kein fertiges Backend behaupten.
- **M1a – Dashboard und lokale Personalisierung:** illustriertes Portrait, Level/XP, Momentum, sechs Stats, Daily Quests, aktive Skills aus dem 14er-Katalog, Weekly Boss, Aktivitätsformular und Erfolgsfeedback sind vorhanden. Creator mit zwölf Designs, getrennten Frisuren/Outfitsets, Farben und lokalem Profil ist eingebaut. Progression bleibt im Arbeitsspeicher; Wochenrhythmus und Zeitperiode sind Mock-Snapshots. Assetkompositionen und mobile Darstellung benötigen fortlaufende visuelle Abnahme.
- **M1b – spielbares Solo-MVP, teilweise umgesetzt:** dreistufiges Interessen-/Fokus-Onboarding sowie freiwilliger Check-in/Tagesmodus sind lokal vorhanden. Offen bleiben minimale Subskills, echte Tages-/Wochenperioden, dauerhafter Verlauf, vollständige Recovery/Rest/Cheat-Day-Regeln, frequenzabhängige Streaks, früher Capacitor-Gerätetest sowie Spring Boot, Authentifizierung und PostgreSQL-Persistenz. Lade-, Fehler- und Leerezustände gehören dazu. Erst M1a plus die offenen M1b-Bausteine ergibt das vollständige MVP; keine fertige Vollversion behaupten.
- **M2 – Spieltiefe:** Produktionsreife der modularen Art, erweiterte Slots/Garderobe, reichere Gesten und Gesichtsausdrücke, Aura-VFX samt geprüften Freischaltungen/Bossdrops, Equipment, Loot, Achievements, Titles und vielfältigere Bosse. Zehn Auraentwürfe sind bereits als unverbindliche Creator-Vorschau vorhanden. Keine vorschnelle soziale Plattform.
- **M3 – Membership:** inhaltliche Entitlements, moderater Bonus und geprüfte Store-Abrechnung mit Restore und vollständigem Berechtigungslebenszyklus. Kein clientseitiges Kaufvertrauen.
- **M4 – native Fassung:** Capacitor für iOS/Android, sichere Sessions, signierte Builds, neun UI-Zielsprachen mit geklärten Varianten, lokalisierte Listings und echte Medien, Privacy-Angaben sowie Geräte-/Beta-Vorbereitung. Ein Web-Build ersetzt diese Abnahme nicht.
- **M5 – Release:** vollständige Beta-/Geräteprüfung, Performance, Datenschutz und Löschung, Store-Freigabe sowie öffentliche SEO-Seiten und ASO-Messung. Kein automatisch zugesicherter Store-Erfolg.
- **Danach:** optionale Classes/Archetypes, Parties, Guilds und Raids auf stabiler Solo- und Backend-Grundlage.

Endgültige XP-Kurven, Maximallevel, weitere Tageslimits, Momentum-Abnahme, Zeitzonenwechsel und Tagesmodusregeln werden mit Beispielen und Tests entschieden, bevor davon abhängige Persistenz implementiert wird. Vollständigkeit dieses Briefings bedeutet eine klare gemeinsame Richtung, keine erfundene Endgültigkeit ungeprüfter Zahlen.

Prüfe pro Slice relevante fachliche Grenzfälle, Store-/UI-Datenfluss, Produktionsbuild und mobile Browserdarstellung. Native Qualität benötigt echte Geräteprüfungen. Halte Validierung und offene Grenzen aktuell und erkläre den nächsten sinnvollen Lernschritt.
