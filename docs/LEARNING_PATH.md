# Lernpfad und nächste Slices

## Den aktuellen Slice verstehen

1. `domain/models.ts` und `domain/progression.ts`: Spielzustand, Commands und reine atomare
   Fortschrittsfunktion. Die Tests erklären Doppelbuchung, Tageslimits und Levelgrenzen.
2. `domain/character.ts`: kleine Optionsliste und Profilvalidierung. Warum können Name und
   Aussehen unabhängig von XP geändert werden?
3. `data/mock-game.repository.ts` und `data/character-profile.storage.ts`: asynchroner Vertrag,
   flüchtiger Fortschritt und separat versioniertes Browserprofil. Ein HTTP-Adapter folgt später.
4. `domain/milestones.ts`: Vorher/Nachher vergleichen, ohne UI, Audio oder neue XP-Vergabe.
5. `state/game.store.ts` und `state/progress-feedback.ts`: private Signals, abgeleitete Views,
   Commands, einmalige Erfolgsmeldung und gespeicherte Darstellungspräferenzen.
6. `features/dashboard/` und `features/character-creator/`: Templates zeigen State; Formulare
   senden fachliche Eingaben. Profil- und Effektvorschau verändern keine Spielprogression.
7. `shared/character-portrait.ts` und `domain/character-rig.ts`: Originalillustrationen sowie
   modulare Körper-/Kopf-/Haarlayer mit Masken, Ankern und ruhiger Atmung. `shared/character-aura.ts`
   enthält dekorative Effekte; `shared/success-audio.ts` kapselt die Browser-Audiogrenze.
8. `app.routes.ts` und globale SCSS-Tokens: lazy Routen, konsistente Gestaltung, mobile Bedienung
   und Rücksicht auf reduzierte Bewegung.

## Sinnvolle nächste Reihenfolge

1. Den Creator-/Feedback-Ausbau anhand der PRD-Kriterien abschließen; tatsächliche Checks und
   verbleibende Grenzen in `VALIDATION.md` dokumentieren.
2. Das vorhandene dreistufige Onboarding mit sieben Interessenbereichen und 1–6 Fokus-Skills aus
   14 verstehen: `domain/journey.ts`, `JourneyStore` und separater V1-Speicher. Creator-Rückweg,
   Sitzungsfallback und fehlende XP-Mutation anhand der PRD-Kriterien prüfen.
3. Den Skillkatalog in kleinen Schritten um Familien/Subskills erweitern, inklusive Reward-Limits
   und fachlicher Beispiele. Balance V0.2 bleibt bis zu einer expliziten Regeländerung erhalten.
4. Tages-/Wochenmodell mit IANA-Zeitzone, Recovery-/Rest-/Cheat Days und Zielrhythmus als reine
   Domainregeln konkretisieren und Grenzfälle prüfen.
5. Früh einen Capacitor-Gerätetest des Kernflows durchführen: Navigation, Tastatur, Safe Areas,
   Screenreader, Audio/Animation, Resume. Dies ist noch keine Store-Veröffentlichung.
6. Spring Boot mit Dashboard-DTO und HTTP-Adapter starten. Auth-/Account-Löschmodell und sicheren
   Sessionzugriff festlegen, bevor personenbezogene Daten gespeichert werden.
7. PostgreSQL/Flyway, transaktionale Aktivitätsbuchung, Idempotenz und serverautoritatives XP
   ergänzen. Integrationstests prüfen Reload, doppelte Requests, Fehler und Zugriffsschutz.
8. Echte Weekly Quests, Wochenhistorie und persistente Tagesplanung auf diese Regeln aufsetzen.
   Produktionsassets, Loot und Membership folgen in den dafür vorgesehenen Meilensteinen.

Pro Slice: Problem und Abnahme kurz festhalten → klein implementieren → relevante Checks →
erklären, wie sich UI, State, Domain und Datenquelle ändern. Keine vorgezogene Infrastruktur
für Features, die noch keinen eigenen Nutzerfluss haben. Master Prompt und Detaildokumente
werden bei akzeptierten Produktentscheidungen gemeinsam abgeglichen.
