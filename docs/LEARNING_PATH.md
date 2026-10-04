# Lernpfad und nächste Slices

## Den aktuellen Slice verstehen

1. `domain/models.ts` und `domain/progression.ts`: Spielzustand, Commands und reine atomare
   Fortschrittsfunktion. Die Tests erklären Doppelbuchung, Tageslimits und Levelgrenzen.
2. `domain/character.ts`: kleine Optionsliste und Profilvalidierung. Warum können Name und
   Aussehen unabhängig von XP geändert werden?
3. `data/mock-game.repository.ts` und `data/character-profile.storage.ts`: asynchroner Vertrag,
   Journal-Replay und separat versioniertes Browserprofil. `game-progress.storage.ts` validiert
   Inputs, Grenzen und Speicherfehler; `game-periods.ts` trennt Tag/Woche von der Uhr. Ein HTTP-Adapter folgt später.
4. `domain/aura-rewards.ts` und `domain/milestones.ts`: einmaligen Besitz aus einem echten Übergang
   vergeben und dessen Erfolg erkennen. Warum erzeugt Laden keine Musik und kein zusätzlicher Grant?
5. `state/game.store.ts` und `state/progress-feedback.ts`: private Signals, abgeleitete Views,
   Commands, einmalige Erfolgsmeldung und gespeicherte Darstellungspräferenzen.
6. `features/dashboard/` und `features/character-creator/`: Templates zeigen State; Formulare
   senden fachliche Eingaben. Profil- und Effektvorschau verändern keine Spielprogression.
7. `shared/character-portrait.ts` und `domain/character-rig.ts`: Originalillustrationen sowie
   modulare Körper-/Kopf-/Haarlayer mit Masken, Ankern und ruhiger Atmung. `shared/character-aura.ts`
   enthält dekorative Effekte; `shared/success-audio.ts` kapselt die Browser-Audiogrenze.
8. `app.routes.ts` und globale SCSS-Tokens: lazy Routen, konsistente Gestaltung, mobile Bedienung
   und Rücksicht auf reduzierte Bewegung.

## Kleiner Lernversuch: ein Bossdrop überlebt Reload

Mit eigenen Probeeinträgen im lokalen Prototyp: den Mooswächter durch belohnte Aktivitäten besiegen,
Moosseele in der Sammlung ansehen, im Creator wählen und speichern, dann neu laden. Verfolge den
Weg Formular → Store → Repository → reine XP-/Aura-Regel → Journal → View. Im Speicher stehen nur
Commands mit Tag; Besitz und XP werden daraus rekonstruiert. Der Reload zeigt denselben Besitz,
spielt aber keinen Erfolg erneut ab. „Spielstand zurücksetzen“ ist jetzt eine echte lokale Löschung
mit Bestätigung und kein harmloser Reload-Knopf. Die Tests erlauben Grenzfallversuche ohne den
persönlichen Verlauf zu verändern.

## Sinnvolle nächste Reihenfolge

1. Den Creator-/Feedback-Ausbau anhand der PRD-Kriterien abschließen; tatsächliche Checks und
   verbleibende Grenzen in `VALIDATION.md` dokumentieren.
2. Das vorhandene dreistufige Onboarding mit sieben Interessenbereichen und 1–6 Fokus-Skills aus
   14 verstehen: `domain/journey.ts`, `JourneyStore` und separater V1-Speicher. Creator-Rückweg,
   Sitzungsfallback und fehlende XP-Mutation anhand der PRD-Kriterien prüfen.
3. Den Skillkatalog in kleinen Schritten um Familien/Subskills erweitern, inklusive Reward-Limits
   und fachlicher Beispiele. Balance V0.2 bleibt bis zu einer expliziten Regeländerung erhalten.
4. Das vorhandene lokale Tages-/Wochenmodell und Journal-Replay lesen: mehrere Tage, Montagswechsel,
   Boss-Sieg, Aura-Anlegen und Reload nachvollziehen. Danach Recovery-/Rest-/Cheat Days, Zielrhythmus
   und den künftigen servergeführten IANA-Zeitzonenvertrag als reine Regeln konkretisieren.
5. Früh einen Capacitor-Gerätetest des Kernflows durchführen: Navigation, Tastatur, Safe Areas,
   Screenreader, Audio/Animation, Resume. Dies ist noch keine Store-Veröffentlichung.
6. Den begonnenen Spring-Boot-Auth-Slice lesen: Accountmigration, BCrypt, Session-ID-Rotation,
   CSRF, `/me`, Logout und JSON-Fehler. Die mobile Auth-Seite nutzt denselben kleinen HTTP-Vertrag;
   Passwörter gehören weder in localStorage noch in Signals nach dem Request.
7. Als nächsten vertikalen Backend-Slice Character-Create, Dashboard-DTO und den HTTP-Adapter
   verbinden. Erst danach PostgreSQL/Flyway für transaktionale Aktivitätsbuchung, Idempotenz und
   serverautoritative XP erweitern. Integrationstests prüfen Reload, doppelte Requests, Fehler und
   Zugriffsschutz für mindestens zwei Accounts.
8. Weekly Quests, bessere Wochenhistorie und persistente Tagesplanung auf diese Regeln aufsetzen.
   Die drei ersten Aura-Belohnungen sind lokal vorhanden; weitere Produktionsassets, Item-Loot und
   Membership folgen in den dafür vorgesehenen Meilensteinen.

Pro Slice: Problem und Abnahme kurz festhalten → klein implementieren → relevante Checks →
erklären, wie sich UI, State, Domain und Datenquelle ändern. Keine vorgezogene Infrastruktur
für Features, die noch keinen eigenen Nutzerfluss haben. Master Prompt und Detaildokumente
werden bei akzeptierten Produktentscheidungen gemeinsam abgeglichen.
