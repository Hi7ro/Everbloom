# Herovera · Mobile Beta 0.2

Stand: 5. Oktober 2026. **Lokal integrierter Beta-Kern, noch kein verteilter oder signierter Store-Build.**
Das Ziel sind installierbare iOS-/Android-Apps. Browserprüfungen belegen die Web-Oberfläche und die
API-Verbindung, ersetzen aber keine Abnahme auf iPhone, iPad und Android.

## Was jetzt enthalten ist

- Regulärer Einstieg `/auth`: registrieren, E-Mail bestätigen, anmelden, Passwort erneuern.
- Geschützte Charaktererstellung mit den vorhandenen zwölf Looks und modularen Anpassungen.
- Interessen-/Skill-Onboarding; alternativ bewusst mit vorgeschlagenem Standardfokus starten.
- Persönliche Tagesquests aus dem Fokus: bis zu drei Aufgaben. Je Quest mindestens 40 Bonus-XP,
  sonst 2 % der beim Erstellen geltenden Levelspanne, auf fünf XP gerundet: Level 1/10/20/50 gibt
  40/60/100/220 XP. Bei mehr Fokus-Skills rotiert die Auswahl täglich. Nach dem ersten Eintrag
  wirken Fokusänderungen ab morgen; ein Levelaufstieg bewertet den laufenden Plan nicht neu.
- „Am Horizont“ im Account-Dashboard: aktuelle entdeckte Bossbegegnung auf Normal mit Mindest- und
  Empfehlungslevel, Erstabschluss-Cosmetic und nächster künftiger unbesessener Level-Aura.
  Reine Vorschau ohne zusätzliche XP oder Spoiler; in der öffentlichen Demo ausgeblendet.
- Accountgebundener Spielstand in PostgreSQL. Neue Konten starten bei Level 1 und 0 XP.
- Aktivitäten mit serverseitigen XP, Tageslimits, Quest-Boni, Momentum und Wochenboss-Schaden.
- Unbestätigte Aktivitäten bleiben mit ursprünglichem Skill, Dauer und Eintrags-ID kontobezogen
  auf dem Gerät erhalten. Nach Navigation, App-Neustart oder erneuter Anmeldung ermöglicht
  „Unbestätigten Eintrag prüfen“ die ausdrückliche Wiederholung ohne doppelte XP. Keine automatische
  Übertragung und kein Offline-Sync; diese offene Bestätigung ist nicht geräteübergreifend verfügbar.
- Bei blockierter oder beschädigter Gerätesicherung werden neue Aktivitäten vor dem Senden
  gesperrt. Einträge bleiben nach Fehlern erhalten, auch wenn ein späterer Versuch abgewiesen wird.
  Bestätigte Wiederholungen verändern weder XP noch Erfolgspopups. Ein zuvor gar nicht gespeicherter
  Eintrag zählt bei seiner späteren Annahme zum dann aktuellen Spieltag; der Dialog erklärt dies.
- Spiel-, Interessen- und Kontoaktionen prüfen das erwartete Konto gegen die Serversitzung.
  Ein Wechsel in einem anderen Fenster führt zur erneuten Anmeldung, statt fremde Fortschritte zu
  übernehmen. Wiederaufnahme mit demselben Konto bewahrt offene Entwürfe.
- Account-Export, Logout und passwortbestätigte Löschung inklusive Spielstand.
- Native Capacitor-Projekte, HTTPS-API-Konfiguration, native Cookies, Export/Teilen,
  App-Wiederaufnahme, Android-Zurück-Verhalten, eigene Beta-Icons und Startbildschirme.
- Öffentliche isolierte Vorschau `/demo`; keine Übernahme der alten lokalen Demo-XP.
- Elf Apps und Spiele als öffentliche Referenzen in der [Wettbewerbsanalyse](COMPETITOR_RESEARCH.md).
  Eigene Routinen, Fokustimer und erzählte Kapitel sind weiterhin Planung, kein Beta-Lieferumfang.
- Zehn serverseitige Bossbegegnungen: Mooswächter 10, Glutwyrm 20, Dämmerungsbestie 30, Frosttitan 40, Wolkenkönig 50, Blutmondregentin 60, Sternensouverän 70, Nharok 80, Vaelthar 90 und Aureon 100. Vier Modi und 40 feste Erstabschluss-Belohnungen; der Wolkenkönig bleibt das Kapitel-1-Finale.
- Je Boss vier eigenständige Bildformen; 30 neue Hard-/Episch-/Ultimate-Bilder plus fünf neue Grundformen: insgesamt 35 neue Bossbilder. Weitere 20 neue Lootbilder ergänzen die bestehenden 20, darunter zehn eigenständige neue Aura-Illustrationen. Illustrierte Beute, größere Bosse, Skill-bezogene Angriffe und abschaltbare Effekte.
- Automatischer Probekampf bleibt ohne Rewards. Der ausdrücklich lokale Modus `preview` kennzeichnet eine kostenlose Testvorschau aller Modi, ohne Kauf oder XP-Bonus; kein gekauftes Plus. Die native Membership-Anbindung ist implementiert; echte Käufe benötigen konfigurierte Stores und ausstehende Abnahmen.

Die Beta wird zunächst kostenlos und auf Deutsch getestet. Im später freigegebenen `live`-Betrieb
bleiben die fünf Normal-Bosse bis einschließlich Basislevel 50 Free. Alle Modi der Bosse
60–100 sowie höhere Modi der ersten fünf ergeben 35 Plus-Begegnungen; auch Probekämpfe beachten
diese Grenze. Skills, XP und Charakterlevel bleiben ohne Abo-Grenze. Plus ergänzt +10 % Charakter-Aktivitäts-XP. Weitere Sprachen, echte Raids/Parties und die große Inhalts-Roadmap bleiben Erweiterungen.
Der verbindliche Umfang und die offenen Freigaben stehen in [RELEASE_V1.md](RELEASE_V1.md).

Seit dem 8. Oktober 2026 lautet der öffentliche Name **Herovera**. Die bestehenden technischen
Kennungen und Spielstände bleiben kompatibel; die Umbenennung erfordert keinen neuen Account.

## Lokal ausprobieren

Voraussetzungen: Node 24 (oder passendes Node 22), Java 21+, PostgreSQL mit `psql` und eine lokal
zugängliche Administratorrolle. Java 25 und PostgreSQL 18.6 wurden auf diesem Mac verwendet.
Die Schritte verwenden nur eine eigene Entwicklungsdatenbank; vorhandene Projekte werden nicht verändert.

```sh
# Im Projektverzeichnis, einmalig:
python3 scripts/setup-local-beta.py

# Terminal 1:
./scripts/start-backend-local.sh

# Terminal 2:
cd frontend
npm ci
npm start -- --host 127.0.0.1 --port 4201
```

Öffne `http://127.0.0.1:4201/auth`. Das Frontend leitet `/api` lokal an Port 8080 weiter.
Für die lokale Entwicklung werden **keine echten E-Mails gesendet**. Bestätigungs- und Reset-Links
liegen im lokalen Testpostfach `http://127.0.0.1:8080/api/dev/mail/outbox`. Diese Ansicht existiert nur
mit lokalem dev/test-Profil; Links nicht teilen oder in öffentliche Logs kopieren.

`.local/beta.env` enthält ausschließlich lokale Konfiguration/Secrets (Dateirechte 0600, Git-ignoriert).
Kein Passwort, Token oder SMTP-Schlüssel gehört in das Frontend oder die native Runtime-Konfiguration.
Die aktive Produkt-App verwendet den HTTP-Adapter. Der alte Mock-Adapter dient isolierten Tests und
wird nicht als Gastspielstand angeboten.

### Wenn Port 8080 bereits von einem anderen Projekt verwendet wird

Den fremden Server weiterlaufen lassen. Für die lokale Abnahme des gebauten Frontends kann
Herovera eigene Ports verwenden; die Vorschau bindet immer nur an die Loopback-Adresse:

```sh
./scripts/start-backend-local.sh '-Dspring-boot.run.arguments=--server.port=8081 --app.auth.public-base-url=http://127.0.0.1:4203'
# In einem zweiten Terminal, nach erfolgreichem Frontend-Produktionsbuild:
python3 scripts/preview-production.py --port 4203 --backend-port 8081
```

Die Oberfläche liegt dann auf `http://127.0.0.1:4203/auth`; der API-Smoke kann ebenfalls diese
Adresse verwenden. Der normale Angular-Entwicklungsproxy bleibt davon unabhängig auf 8080.
Dies ist keine öffentlich erreichbare Bereitstellung.

## Reproduzierbare Prüfungen

```sh
cd frontend
npm run test:ci
npm run build
npm audit

cd ../backend
./mvnw test

cd ..
python3 scripts/smoke-beta.py
python3 scripts/smoke-personal-quests.py
# Optional durch den Frontend-Proxy:
python3 scripts/smoke-beta.py --base-url http://127.0.0.1:4201
```

Der HTTP-Smoke registriert zufällige synthetische Konten, bestätigt über das lokale Testpostfach,
prüft die tatsächliche Datenbankverbindung und löscht seine Konten anschließend. Keine echten
Empfänger werden angeschrieben. Sehr häufige Wiederholungen können absichtlich die IP-Limits
ansprechen; nicht die Schutzmechanismen für eine Live-Beta deaktivieren.

Zusätzlich prüft er falsche erwartete Konten bei Lesen, Export, Aktivität, Logout und Löschung:
Die echte Sitzung und der Spielstand des anderen Kontos bleiben erhalten. Die Wiederholung einer
bereits gespeicherten Aktivität wird in einer neu angemeldeten Sitzung geprüft. Der Header
`X-Everbloom-Account` ist eine zusätzliche Konsistenzprüfung der aktuellen App; die Identität stammt
weiterhin ausschließlich aus der Serversitzung. Ältere API-Clients dürfen den Header weglassen.

Grenzen der Wiederaufnahme: Nur Aktivitäten sind gerätelokal dauerhaft vorgemerkt; unbestätigte
Bosskampf-IDs bleiben derzeit in der laufenden App-Sitzung. Erstabschluss-Beute bleibt serverseitig
einmalig. Web Locks koordinieren Aktivitätsreservierungen zwischen Fenstern, wenn verfügbar;
ältere Laufzeitumgebungen haben nur Lese-/Vergleichsschutz, keine garantierte atomare Reservierung.
Löschen der App-/Browserdaten entfernt auch eine offene lokale Aktivitätsbestätigung.

Nachweis dieser Umsetzung: Flyway V1–V4 gegen PostgreSQL erfolgreich; Registrierung/Verifikation,
zwei isolierte Konten, CSRF/JDBC-Sessions, Idempotenz/409, Export, Passwortreset mit Sitzungswiderruf,
Logout und Löschung direkt auf 8080 sowie durch den Proxy auf 4202 getestet. Browserfluss:
Login → Nori erstellen → Fokus wählen → 60 Minuten Calisthenics → 290 Charakter-XP, 240 Skill-XP,
1.920 Boss-HP → Reload mit unveränderten Werten. JSON-Export heruntergeladen und auf richtigen
Besitzer, Spielstand und ausgeschlossene Passwörter geprüft. Aktuelle Gesamtzahlen stehen in `VALIDATION.md`.

## Was die mobile Verteilung noch braucht

| Voraussetzung | Stand und nächster Schritt |
| --- | --- |
| Xcode + iOS SDK | Xcode 26.6 und iOS-26.5-Simulator installiert, Lizenz bestätigt. Simulator-App erfolgreich gebaut und gestartet. Signierter Geräte-Build steht aus. |
| Android Studio + SDK | Android Studio, SDK/API 36 und ARM64-Emulator installiert, Lizenzen bestätigt. Debug-APK gebaut, installiert und gestartet. Signiertes Release-Bundle steht aus. |
| Entwicklerkonten | Apple-/Google-Entwicklerkonten sind laut Betreiber vorhanden; konkrete Verträge, Zahlungs-/Steuerangaben und Signing sind noch nicht bestätigt. |
| Signierung | Apple-Team/Provisioning sowie Android-Upload-Key fehlen; Schlüssel sicher verwahren und niemals ins Repo schreiben. |
| HTTPS-Backend | Domain und Hosting sind noch nicht gebucht. `deploy/` bereitet einen einzelnen Server mit Caddy, Spring Boot und PostgreSQL vor. |
| E-Mail-Zustellung | Einen Transaktionsmail-Dienst buchen/einrichten, eigene Absenderdomain mit SPF/DKIM/DMARC konfigurieren, Bestätigung und Reset mit echten Testadressen prüfen. |
| Betreiber/Datenschutz/Support | Adderlyn Windsor und Österreich sind bestätigt. `/privacy`, `/terms` und `/support` bleiben Vorabtexte; Anschrift, Kontakt, tatsächliche Anbieter/Standorte und Aufbewahrung müssen vor Verteilung ergänzt und geprüft sein. |
| Betrieblicher Test | Sicherung in getrennten Speicher, Wiederherstellung in eigene Test-DB, TLS-Erneuerung, Healthcheck und SMTP-Ausfallalarm tatsächlich durchführen. |
| Geräteabnahme | Native Cookie-Verhalten bei Login/Logout, Neustart und Ablauf; Export/Teilen, Tastatur, Safe Areas, Rotation, App-Wechsel, Audio, reduzierter Bewegung und Rendering prüfen. |
| Store-Inhalte | Rechte an allen Assets prüfen, finale Produktkennung, Altersangabe, Datenschutz-/Data-Safety-Angaben, Screenshots und Review-Zugang vervollständigen. |

Ein vorbereiteter Quellcode oder `cap sync` ist **keine** IPA/APK und keine Store-Freigabe. Details zu
nativen Anforderungen stehen in [NATIVE_BETA.md](NATIVE_BETA.md), Betrieb und Sicherungen in
[BETA_OPERATIONS.md](BETA_OPERATIONS.md). Noch keine öffentliche Bereitstellung, Store-Einreichung
oder kostenpflichtige Buchung ist erfolgt.

## Gemeinsamer Weg zur ersten Testversion

1. Toolchains und Simulator-Builds sind eingerichtet. Mit konfiguriertem HTTPS-Backend folgt die Abnahme auf echten Geräten.
2. Betreiberangaben und einen verfügbaren Domainnamen festlegen. Namen und Bundle-ID erst vor dem
   ersten Store-Datensatz endgültig reservieren; `com.everbloom.app` ist derzeit ein Arbeitswert.
3. Einen kleinen Server in einer geeigneten Region und einen SMTP-Dienst auswählen. Die vorbereitete
   Architektur braucht einen Docker-fähigen Host, persistenten PostgreSQL-Speicher und separate Backups.
   Anbieter, tatsächliche Kosten und Verträge vor einer Buchung gemeinsam prüfen.
4. DNS/TLS/SMTP einrichten, dann Kontofluss und Backups in einer eigenen Staging-Umgebung testen.
5. HTTPS-Origin in den nativen Build übernehmen, auf echten Geräten testen, dann signieren.
6. Kleine geschlossene Testergruppe einladen; erst nach Fehlerbehebung breiter verteilen.

Apple verteilt iOS-Betas über [TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).
Android bietet [interne und geschlossene Test-Tracks](https://support.google.com/googleplay/android-developer/answer/9845334).
Die tatsächliche Testfreigabe und ggf. Review erfolgen im jeweiligen Entwicklerkonto.

Die vorhandene Kontolöschung bildet die technische Grundlage für Apples
[In-App-Kontolöschung](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
und Googles [In-App- plus Web-Löschweg](https://support.google.com/googleplay/android-developer/answer/13327111).
Die HTTPS-Webfassung muss dafür erreichbar sein: `/delete-account` erklärt ohne Anmeldung den
Löschweg und führt über `/account` mit Login zur bestehenden Löschfunktion. Die Store-Angaben
verlinken `/delete-account`; Neuinstallation und Abo-Kündigung sind keine Voraussetzung zur
Kontolöschung. Betreibertexte und Store-Fragebögen müssen den tatsächlichen
Betrieb beschreiben; dieser technische Stand bestätigt keine rechtliche oder Store-seitige Abnahme.
