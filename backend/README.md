# Backend · M1b Auth-Slice

Das Backend ist jetzt ein ausführbarer Spring-Boot-4.1.1-Slice auf Java 21. Die erste vertikale
Funktion ist die Konto-Grundlage:

- `POST /api/auth/register` legt ein Konto mit BCrypt-Hash an und meldet nicht automatisch an.
- `POST /api/auth/login` erstellt eine serverseitige HttpOnly-Session und rotiert die Session-ID.
- `GET /api/auth/me` liest ausschließlich das Konto aus der geprüften Session.
- `POST /api/auth/logout` beendet die Session.
- `GET /api/auth/csrf` liefert den kurzlebigen CSRF-Token samt Headernamen für die SPA.

E-Mail/Passwort werden validiert, Rate-Limits schützen den ersten Single-Instance-Slice und
Fehlerantworten verwenden `{ code, message }` ohne Stacktraces. CSRF bleibt für Schreibzugriffe
aktiv; Cookies sind in Produktion `Secure`, im lokalen `dev`-Profil für Loopback nicht.

`/api/game/**` ist bereits authentifizierungspflichtig. Charakter, Aktivitäten und der
serverautoritative Fortschritt folgen als nächster Backend-Slice; der Angular-Demo-Adapter bleibt
bis dahin getrennt. PostgreSQL/Flyway ist das Laufziel, die Migration `V1__accounts.sql` enthält
die Accounttabelle. Für lokale Entwicklung werden Zugangsdaten über Umgebungsvariablen gesetzt:

```sh
cd backend
EVERBLOOM_DB_PASSWORD='…' ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Vor einem öffentlichen Release fehlen noch E-Mail-Verifikation, Passwort-Reset, Konto-Löschung,
gemeinsames Rate-Limiting, Audit/Monitoring und der vollständige Game-API-Slice.
