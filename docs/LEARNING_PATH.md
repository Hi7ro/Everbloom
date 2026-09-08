# Lernpfad und nächste Slices

## Den ersten Slice verstehen

1. `domain/models.ts`: Welche Daten gehören zum Spiel, welche nur zur Darstellung?
2. `domain/progression.ts`: Eine reine Funktion verarbeitet ein Command und erzeugt neuen Zustand.
   Lies die Tests dazu: Warum werden Doppelbuchung und Levelgrenzen dort geprüft?
3. `data/mock-game.repository.ts`: Das gleiche Interface kann später HTTP verwenden.
4. `state/game.store.ts`: Schreibbare Signals bleiben privat, berechnete Werte folgen automatisch.
5. `features/dashboard/`: Template zeigt State; Formular sendet nur Skill und Dauer.
6. `app.routes.ts`: Dashboard wird bei Bedarf geladen. Globale SCSS-Tokens halten Farben konsistent.

## Sinnvolle nächste Reihenfolge

1. Ein neuer Skill als Katalogeintrag, mit Reward-Limit und fachlichem Test.
2. Onboarding und minimaler modularer Character Creator; Appearance vom Fortschritt trennen.
3. Tages-/Wochenmodell mit Zeitzone als reine Domainfunktion samt Grenztests entwickeln.
4. Spring Boot starten, ein Dashboard-DTO liefern und HTTP-Adapter anbinden.
5. Aktivität serverseitig validieren, Transaktion und Idempotenz implementieren.
6. PostgreSQL/Flyway und Accountschutz; Integrationstest für Reload und doppelte Requests.
7. Recovery-/Rest-Day-Planung, Weekly Quests und echte Wochenhistorie ergänzen.

Pro Slice: Problem und Abnahme kurz festhalten → klein implementieren → relevante Checks →
erklären, wie sich UI, State, Domain und Datenquelle ändern. Keine vorgezogene Infrastruktur
für Features, die noch keinen eigenen Nutzerfluss haben.
