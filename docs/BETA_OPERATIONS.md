# Herovera · Geschlossene Beta · Betrieb

Stand: 8. Oktober 2026. Die Dateien unter `deploy/` bereiten eine einzelne VPS-Instanz vor.
Es wurde damit kein Hosting gekauft, keine Domain geändert und kein öffentlicher Server gestartet.
**Noch keine Freigabe für externe Nutzer:** Domain, echter Maildienst, Betreiber-/Kontaktangaben
und die ausstehenden Betriebs-/Geräteprüfungen fehlen noch. Der Standardmodus `preview` ist
kostenlos und bietet keinen Kauf. Der vorhandene Live-Billing-Pfad braucht weiterhin seine
Store-/RevenueCat-Konfiguration und tatsächliche Kaufabnahme. Technische `EVERBLOOM_*`-Schlüssel
und Datenbanknamen bleiben bestehen; der sichtbare Absender-Vorschlag lautet Herovera.

## Hostingvorschlag und Kosten

Am 8. Oktober 2026 bestätigt: bereits vorhandener **ALL-INKL PrivatPlus**-Vertrag.
Empfehlung für die kleine geschlossene Beta: Domain/DNS und Support-Postfach dort weiterverwenden;
App und PostgreSQL auf einem Hetzner-CAX11 in Deutschland betreiben. PrivatPlus nennt PHP und
MySQL/MariaDB, aber keinen SSH-Zugang und keine passende Java-/PostgreSQL-/Docker-Laufzeit.
Ein Tarifupgrade allein ist deshalb keine Lösung für den vorhandenen Spielserver.
Siehe [Leistungsumfang PrivatPlus](https://all-inkl.com/webhosting/privatplus).

Zusätzliche laufende Kosten, vorläufige Kalkulation mit österreichischer Umsatzsteuer von 20 %:

| Position | Netto pro Monat | Brutto pro Monat, gerundet |
|---|---:|---:|
| Hetzner CAX11, Deutschland, 2 vCPU / 4 GiB | 5,99 € | 7,19 € |
| Eine öffentliche IPv4 | 0,50 € | 0,60 € |
| Sieben Server-Backupplätze, 20 % des Serverpreises | 1,20 € | 1,44 € |
| Storage Box BX11 für separat verschlüsselte Datenbank-Backups | ca. 3,20 € | ca. 3,84 € |
| Summe | ca. 10,89 € | **ca. 13,07 €** |

Quellen: [aktuelle Serverpreise](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/),
[IPv4](https://docs.hetzner.com/cloud/servers/primary-ips/overview/),
[Backup-Abrechnung](https://docs.hetzner.com/cloud/billing/faq/),
[Storage Box BX11](https://www.hetzner.com/storage/storage-box/bx11/),
[Umsatzsteuer](https://docs.hetzner.com/general/billing-and-account-management/billing-at-hetzner/value-added-tax/).
Endpreise und verfügbare deutsche Rechenzentren müssen in der tatsächlichen Bestellung geprüft werden.
Hetzners öffentliche Cloud-Seite weist auf begrenzte Verfügbarkeit der günstigen Tarife hin;
es wird kein teurerer Ersatz ohne neue Abstimmung gebucht. Die Kosten sind Grundkosten,
kein technischer Ausgabendeckel; Mehrverbrauch über das enthaltene Traffic-Kontingent wird
gesondert berechnet. Kostenalarme und Verbrauchskontrolle gehören zur Einrichtung.
Der Server ist selbst verwaltet: Updates, Überwachung und Wiederherstellung bleiben Betriebsaufgaben.

`herovera.app` ist nur der Domainvorschlag, **weder bestellt noch als verfügbar bestätigt**.
`.app` gehört nicht zu den fünf im Tarif enthaltenen Standard-Endungen. ALL-INKL nennt
29,90 €/Jahr einschließlich 19 % deutscher Umsatzsteuer, rechnerisch etwa **30,15 €/Jahr**
mit 20 % österreichischer Umsatzsteuer. Maßgeblich sind Verfügbarkeit und finaler Preis in
der MembersArea. [Zusatzdomains](https://all-inkl.com/webhosting/domains).
Ein Support-Postfach kann innerhalb der vorhandenen Tarifkontingente eingerichtet werden;
erst den tatsächlichen Account prüfen. Bestehende Website, Nameserver und Mailzustellung
nicht pauschal umstellen.

Für Bestätigungs- und Resetmails ist zunächst **Brevo Free** vorgesehen: 300 Nachrichten pro Tag,
kein monatlicher Tarifpreis. Senderfreigabe, DNS-Authentifizierung, Limits und reale Zustellung
müssen geprüft werden; bei Wachstum neu kalkulieren.
[Brevo-Free-Limits](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan).
SMTP auf Port 587 mit STARTTLS verwenden; die Ports 25 und 465 sind bei Hetzner standardmäßig
gesperrt. [Hetzner SMTP](https://docs.hetzner.com/cloud/servers/faq/).

Die vorhandenen ALL-INKL-Vertragskosten und Store-/Billingkosten sind in dieser Zusatzkalkulation
nicht enthalten. Budgetfreigabe, Anbieteranmeldung und tatsächliche Bestellung bleiben getrennte
Schritte. Es wurde noch kein Anbieter beauftragt und keine Zugangsinformation in diese Anleitung übernommen.

## Aufbau

```text
Browser / native App
        │ HTTPS :443
        ▼
      Caddy ─── Angular-Dateien
        │ /api/*, internes Netz
        ▼
   Spring Boot ─── SMTP über STARTTLS
        │ internes Datenbanknetz
        ▼
   PostgreSQL 17 ─── persistentes Volume
```

Nur Caddy veröffentlicht Ports: 80/TCP, 443/TCP und 443/UDP. Backend und PostgreSQL besitzen
keinen veröffentlichten Hostport. Die App-Datenbankrolle `everbloom` hat keine Superuser-,
Createdb- oder Createrole-Rechte. Der getrennte Administrator wird nur für Datenbankinitialisierung
und Betriebsskripte verwendet. Flyway verwaltet Accounts, Sessions und Spielstände.

Die Container haben Speicher-/CPU-Grenzen, Healthchecks und rotierende Standardausgaben.
Compose wartet vor dem Backendstart auf eine gesunde Datenbank. Das ist eine Betriebsbasis,
keine Hochverfügbarkeits- oder Lastzusage. Ein VPS mit etwa 2 vCPU und 4 GiB RAM ist ein
Startpunkt für eine kleine geschlossene Testgruppe; Builds und reale Nutzung müssen gemessen werden.

## Hetzner-Server sicher vorbereiten

`deploy/scripts/prepare-hetzner.py` erstellt ausschließlich zwei lokale Dateien für einen
**frischen Ubuntu-24.04-Server mit ARM64**: `cloud-init.yaml` und `firewall-rules.json`.
Es bucht keinen Server, ruft keine Provider-API auf und erzeugt keine Schlüssel. Nicht auf
einem bestehenden Server anwenden. Der zugehörige private SSH-Schlüssel bleibt auf dem eigenen
Rechner; vorab sicherstellen, dass er zum angegebenen öffentlichen Schlüssel gehört.

Die folgenden Variablen müssen auf den **eigenen vorhandenen `.pub`-Schlüssel**, die aktuelle
öffentliche Administrator-IP und ein neues Verzeichnis außerhalb des Repositories zeigen:

```sh
python3 deploy/scripts/prepare-hetzner.py \
  --ssh-public-key "$SSH_PUBLIC_KEY_FILE" \
  --admin-ip "$ADMIN_PUBLIC_IP" \
  --output-dir "$BOOTSTRAP_OUTPUT_DIR"
```

Mehrere feste Zugänge können durch zusätzliche `--admin-ip`-Argumente erlaubt werden. Zulässig
sind nur einzelne öffentliche IPv4-/IPv6-Adressen (`/32` bzw. `/128`), keine offenen Netze,
privaten Adressen oder Beispiel-IP-Adressen. Der Generator prüft den Schlüssel mit `ssh-keygen`,
verwirft private/ungültige Schlüssel und SSH-Schlüsseloptionen und akzeptiert RSA erst ab 3072 Bit.
Ed25519 und ECDSA sind ebenfalls möglich. Ohne gültige Eingaben entstehen keine Dateien.
Bestehende Ausgabeordner werden nie überschrieben; Ordner erhalten `0700`, Dateien `0600`.

Die Cloud-Firewall muss **bereits bei der Servererstellung** angehängt sein. Die JSON-Datei
enthält das Regelformat für Hetzners `hcloud --rules-file`; alternativ dieselben vier Regeln
in der Hetzner-Konsole eintragen:

| Eingehend | Quelle | Zweck |
|---|---|---|
| TCP 22 | Nur die geprüften Admin-IP-Adressen | SSH-Verwaltung |
| TCP 80 | Öffentlich, IPv4 und IPv6 | HTTPS-Weiterleitung und Zertifikate |
| TCP 443 | Öffentlich, IPv4 und IPv6 | HTTPS |
| UDP 443 | Öffentlich, IPv4 und IPv6 | HTTP/3 |

Alle anderen neuen eingehenden Verbindungen bleiben gesperrt. Es gibt keine Freigabe für
PostgreSQL oder das Backend. Es werden keine ausgehenden Regeln angelegt; ausgehender Verkehr
bleibt für Paketupdates, DNS, Mailversand und die App-Dienste erlaubt. Hetzner kombiniert die
Regeln mehrerer angehängter Firewalls: Keine weitere Firewall darf SSH weltweit freigeben.
Eine wechselnde Heim-IP muss bewusst in der Cloud-Firewall aktualisiert werden. Die Netzwerk-
Firewall ist maßgeblich; alleinige UFW-Regeln schützen veröffentlichte Docker-Ports nicht zuverlässig.
Siehe [Hetzners Firewall-Verhalten](https://docs.hetzner.com/cloud/firewalls/faq/) und
[Dockers Ubuntu-Anleitung](https://docs.docker.com/engine/install/ubuntu/).

Bei der Servererstellung die erzeugte `cloud-init.yaml` als User Data verwenden. Sie legt den
technischen Administrator `herovera` mit dem geprüften Schlüssel und gesperrtem Passwort an;
dieser Schlüssel erlaubt Administration über `sudo`. Andere Schlüssel aus Provider-Metadaten
werden nicht zusätzlich importiert. Root-/Passwortanmeldung werden deaktiviert. Vor der
SSH-Konfigurationsänderung prüft das Startskript den vorhandenen Benutzer und dessen Schlüssel,
vor dem Neuladen prüft es die Serverkonfiguration. Docker und Compose werden aus Dockers
offiziellem, signiertem Apt-Repository installiert. Es wird kein fremdes Shellskript direkt aus
dem Internet ausgeführt. App, Datenbank, Domain, Mail und Secrets werden noch nicht eingerichtet.

Nach dem ersten Start den SSH-Hostfingerabdruck über die Provider-Konsole abgleichen, als
`herovera` anmelden und `sudo cloud-init status --wait --long` prüfen. Fehler stehen in
`/var/log/cloud-init-output.log`. Anschließend `sudo docker version`, `sudo docker compose version`
und `sudo sshd -T` kontrollieren: `permitrootlogin`, `passwordauthentication` und
`kbdinteractiveauthentication` müssen `no` sein. Eine zweite SSH-Anmeldung prüfen, bevor die
erste Sitzung geschlossen wird. Ein erforderlicher Neustart nach Paketupdates bleibt eine
bewusste Betriebsentscheidung. Der spätere Release kann unter `/srv/herovera` abgelegt werden.

Lokale Generatorprüfung: `python3 deploy/tests/hetzner_bootstrap.py`. Diese Prüfung verwendet
ausschließlich einen öffentlichen Testschlüssel und temporäre Dateien; sie startet keinen VPS
und wendet keine Firewall an. Eine bestandene Prüfung ersetzt die Erststart- und SSH-Abnahme
auf dem tatsächlich bestellten Server nicht.

Am 8. Oktober 2026 bestanden sieben Generatorprüfungen. Die erzeugte Testkonfiguration bestand
zusätzlich `cloud-init schema` mit Cloud-init 26.1 aus Ubuntu 24.04 in einem temporären Container.
Das Startskript wurde dort **nicht ausgeführt**. Der Prüfcontainer wurde entfernt; es gibt weiterhin
keinen Nachweis für den Erststart auf einem tatsächlichen Hetzner-VPS.

## Geprüftes Quellpaket für die Bereitstellung

`deploy/scripts/package-release.py` erzeugt ein lokales `.tar.gz` für die beiden Docker-Builds
und den späteren Compose-Betrieb. Ein fester Satz von Builddateien und Quellverzeichnissen
schließt lokale Konfiguration, Datenbanken, native Projekte, Schlüsseldateien, Buildausgaben
und nicht zur Laufzeit benötigte Originalgrafiken aus. Unbekannte Dateitypen oder Symlinks
stoppen die Paketierung. Eine bereits vorhandene Ausgabedatei wird nicht ersetzt.

```sh
python3 deploy/tests/package_release.py
python3 deploy/scripts/package-release.py --output /GESCHUETZTER-PFAD/herovera-release.tar.gz
```

Das Paket enthält `herovera-release/RELEASE_MANIFEST.json` mit Dateigrößen und SHA-256-Prüfsummen.
Es wird mit Rechten `0600` erstellt. Die Aufnahme von Anwendungscode ist kein automatischer
Secret-Scan: vor einer Übertragung den konkreten Inhalt prüfen. `deploy/.env.example` enthält
nur die Beispielkonfiguration; echte Zugangsdaten separat auf dem Server einrichten.
Es erfolgt kein Upload und keine Änderung eines laufenden Deployments.

Am 8. Oktober wurde `.local/herovera-deployment-2026-10-08.tar.gz` mit **427 Quelldateien**
erstellt, alle Manifestwerte gegen die enthaltenen Bytes geprüft und beide Dockerfiles direkt
aus dem entpackten Paket erfolgreich für Linux/ARM64 gebaut. Sieben Paketierungsprüfungen
bestanden. Lokale Image-Tags: `herovera-web:archive-20261008` und
`herovera-backend:archive-20261008`. Das ist ein Buildnachweis, kein Start auf dem späteren VPS.

## Konfiguration vor dem ersten Start

1. Docker Engine und das Compose-Plugin auf dem Linux-VPS einrichten.
2. Eine eigene Subdomain direkt auf die öffentliche VPS-Adresse zeigen lassen. Ports 80/443
   in der Firewall freigeben, Datenbank-/Backendports geschlossen halten.
3. `deploy/.env.example` nach `deploy/.env` kopieren und **alle Beispielwerte** ersetzen.
   Danach `chmod 600 deploy/.env`. Unterschiedliche zufällige DB-Passwörter verwenden.
4. `EVERBLOOM_DOMAIN` ist nur der Hostname; `EVERBLOOM_PUBLIC_BASE_URL` ist exakt dieselbe
   Origin mit `https://`. Diese Adresse wird auch für Bestätigungs-/Passwortlinks genutzt.
5. Einen echten SMTP-Dienst mit authentifiziertem STARTTLS und verifiziertem Absender eintragen.
   Der Produktivmodus prüft die Verbindung beim Start. Das lokale `dev`-/`test`-Profil und die
   Mail-Outbox dürfen hier nicht aktiviert werden.
6. Betreiber-, Kontakt-, Hosting- und Aufbewahrungsangaben in der App vervollständigen.
   Die derzeitige Datenschutz-/Support-Vorschau ist noch kein veröffentlichungsfertiger Text.

Die reservierte Docker-Subnetzvorlage ist `172.30.73.0/24`, Caddy nutzt darin `172.30.73.2`.
Falls sie mit vorhandenen Netzen kollidiert, `EVERBLOOM_EDGE_SUBNET` und
`EVERBLOOM_CADDY_INTERNAL_IP` gemeinsam ändern. Nur diese einzelne Proxy-IP darf dem Backend
`X-Real-IP` liefern. Caddy überschreibt den Header aus der echten direkten Verbindung.
Ein zusätzlicher CDN-/Load-Balancer benötigt ein gesondert geprüftes Vertrauensmodell.

Alle folgenden Befehle werden vom Repository-Stamm aus ausgeführt:

```sh
docker compose --env-file deploy/.env -f deploy/compose.yml config --quiet
docker compose --env-file deploy/.env -f deploy/compose.yml build --pull
docker compose --env-file deploy/.env -f deploy/compose.yml up -d
docker compose --env-file deploy/.env -f deploy/compose.yml ps
```

Die Basisimages verwenden gepflegte Major-Tags: Node 24, Maven 3.9/Java 21, Java-21-Runtime,
Caddy 2 und PostgreSQL 17. Vor einer konkreten Freigabe die getesteten Image-Digests festhalten
und für den Release pinnen. Der Frontend-Lockfile-Build läuft über `npm ci`; Container enthalten
keine `.env`, lokalen Journale oder nativen Buildordner. Secrets gehören ausschließlich in die
geschützte Serverkonfiguration, nie in Frontendassets oder Git.

Der Datenbank-Initialisierungsschritt läuft nur für ein neues Volume. Ein späteres Ändern von
Passwörtern in `.env` rotiert bestehende PostgreSQL-Rollen nicht automatisch. Solche Änderungen
müssen als abgestimmte DB-/App-Rotation erfolgen. `docker compose down -v` gehört nicht zum Updatepfad.

## Web, Cache und native App

Web verwendet dieselbe Origin für Oberfläche und `/api/**`; Caddy gibt API-Fehler unverändert
weiter und nutzt die Angular-Fallbackdatei nur für Seiten. API, HTML und `runtime-config.json`
werden nicht im Browsercache behalten. Gehashte Angular-Bundles sind langfristig cachebar,
Illustrationen mit stabilen Namen zunächst eine Stunde. Fehlende Assets liefern 404 statt HTML.

`runtime-config.json` enthält nur `{ "schemaVersion": 1, "nativeApiOrigin": null }` für den Webbuild.
Web ignoriert den nativen Originwert. Das native Paket wird **separat** erzeugt:

```sh
cd frontend
EVERBLOOM_API_ORIGIN=https://beta.example.com npm run native:sync
```

Der Befehl schreibt die öffentliche HTTPS-Origin ausschließlich in den Build und synchronisiert
Capacitor. Er stellt keinen Server bereit und enthält keine Zugangsdaten. Cookie-/CSRF-Verhalten,
Neustart, Hintergrundwechsel und Export müssen auf iOS und Android überprüft werden.
Siehe [Native Beta](NATIVE_BETA.md).

## Abnahme nach einem Start oder Update

```sh
deploy/scripts/smoke.sh https://DEINE-BETA-DOMAIN
```

Dieser Smokecheck prüft `/api/health`, eine geschützte Game-Anfrage ohne Anmeldung (401),
einen direkten SPA-Link und die öffentliche Konfiguration. Er testet keinen Mailprovider und
keine Zahlungs-/Storefunktion. Danach auf einem eigenen Testkonto prüfen:

- Registrieren, E-Mail erhalten/bestätigen, anmelden, Charakter und Interessen speichern.
- Eine Aktivität eintragen, Seite neu laden, XP-/Quest-/Bosswerte vergleichen.
- Zweites Konto hat eigenen Anfangsstand; Abmeldung zeigt keine Daten des ersten Kontos.
- Passwort zurücksetzen, alte Sitzung beendet; Export herunterladen und Testkonto löschen.
- Handy/Tablet, reduzierte Bewegung, PixiJS-Szene und native Geräte getrennt prüfen.

Die Caddy-CSP erlaubt lokale Skripte/Assets und die benötigten dynamischen Styles. Ihre Wirkung
auf PixiJS und den gesamten Accountflow muss im realen HTTPS-Deployment geprüft werden.
Access-Logs mit vollständigen URLs sind standardmäßig nicht aktiviert, damit E-Mail-Linkparameter
nicht unnötig protokolliert werden. Auch zusätzliche Monitoringdienste dürfen keine Token,
Passwörter, Exporte oder vollständigen Aktivitätsdaten erfassen.

## Backup

```sh
deploy/scripts/backup.sh
# oder ein separat geschütztes Ziel:
deploy/scripts/backup.sh /GESCHUETZTER-BACKUP-PFAD
```

Das Skript erzeugt jedes Mal eine neue Datei mit restriktiven Rechten im PostgreSQL-Customformat.
Ein fehlgeschlagener Dump entfernt nur seine eigene unvollständige Ausgabedatei. Bestehende Dumps
und Datenbanken bleiben erhalten. Das Format wird mit `pg_restore` gelesen, nicht mit `psql`.

Backups enthalten personenbezogene Daten, Passwort-Hashes und Sitzungstabellen. Sie müssen
verschlüsselt außerhalb des VPS gesichert, zugriffsbeschränkt und nach einer festgelegten Frist
gelöscht werden. Der mitgelieferte Dump ist noch keine externe Backupstrategie. Häufigkeit,
Aufbewahrungsdauer, Alarmierung bei Fehlschlag und regelmäßige Wiederherstellungsproben müssen
vor der Freigabe festgelegt werden. Hier wurde kein Backup-Zeitplan automatisch angelegt.

## Wiederherstellen, ohne eine bestehende Datenbank zu ersetzen

```sh
deploy/scripts/restore.sh \
  --file /PFAD/ZUM/EIGENEN-BACKUP \
  --database everbloom_restore_20261004 \
  --confirm-create-database
```

Das Skript verlangt Datei, ausdrücklichen Erstellungs-Schalter und einen neuen Namen mit
`everbloom_restore_`. Es verweigert bereits bestehende Datenbanken und enthält kein `DROP DATABASE`
oder `pg_restore --clean`. Zuerst wird das Archiv geprüft, dann eine neue Datenbank aus `template0`
angelegt. Der Import läuft als einzelne Transaktion mit Fehlerabbruch. Bei einem Fehler bleibt die
neue Datenbank zur Prüfung erhalten; sie wird nicht automatisch gelöscht.

In dieser neuen Wiederherstellungskopie werden Sessions und E-Mail-Tokens entfernt und
Sessionversionen erhöht. Alte Sicherungen sollen keine inzwischen abgelaufenen Zugangsdaten
wiederbeleben. Konten, Spielstände und Aktivitäten bleiben erhalten. Neue Anmeldung und bei
Bedarf neue Bestätigungs-/Resetlinks sind erforderlich. Nur eigene, vertrauenswürdige Archive verwenden.

Der Restore schaltet die laufende App **nicht** um. Die Kopie zuerst separat prüfen; erst danach
einen bewussten Wartungs-/Umschaltplan und aktuellen Sicherungspunkt festlegen. Produktivdaten
dürfen nicht durch einen ungeprüften Rücksprung ersetzt werden. PostgreSQL-Rollen und
Caddy-Zertifikatsdaten werden vom App-Dump nicht mitgesichert und brauchen eigene Wiederanlaufpläne.

## Nachweise und offene Betriebsprüfungen

Am **8. Oktober 2026** wurde die bereits installierte OrbStack-Runtime gestartet. Docker 29.4.0
und Compose 5.1.2 waren anschließend erreichbar; der frühere fehlende Daemon ist kein aktueller
Blocker mehr. Beide vorhandenen Produktions-Dockerfiles wurden erfolgreich gebaut, mit den
lokalen Tags `herovera-backend:local-readiness` und `herovera-web:local-readiness` für Linux/ARM64. Das ist ein
Container-Buildnachweis, noch kein gestarteter produktiver Gesamtstack und keine Veröffentlichung.

Die tatsächlichen Skripte `backup.sh` und `restore.sh` bestanden **sechs Integrationstests** mit
PostgreSQL 17.11 in einem eigenen Container. Die SQL-Migrationen V1–V5 und ausschließlich
synthetische Zeilen dienten als Testdaten. Es wurde keine vorhandene Datenbank gelesen oder verändert:

- Customformat-Dump mit Dateirechten `0600`; Account-, Game-, Aktivitäts-, Boss- und Billingdaten im Archiv.
- Fortschritt und Anfrage-IDs in einer neuen Datenbank erhalten; App-Rolle ohne Cluster-Adminrechte.
- Sessions und Tokens ausschließlich in der Restore-Kopie entfernt; Sessionversion dort erhöht.
  Die Quelldatenbank blieb unverändert.
- Vorhandene Ziel-Datenbank inklusive Kontrollzeile unverändert; ungültiges Archiv schon vor
  Datenbankerstellung abgewiesen. Live-Name, unzulässige/überlange Namen und fehlende Bestätigung blockiert.
- Bei einem Dumpfehler nur die neu angelegte Teildatei entfernt; bestehende Sicherung erhalten.

Die echte Caddyfile wurde mit Caddy 2.11.7 ohne Netzwerkzugriff validiert. Der zusätzliche
Web-Containertest bestand **fünf Prüfungen** mit dem gebauten Frontend und einer synthetischen
internen API, ohne Hostports. Er prüft SPA-Direktlinks, API-401/404 ohne HTML-Fallback, fehlende Assets, Sicherheits-/Cacheheader,
`runtime-config.json`, die Account-Zuordnungsheader und das Überschreiben gefälschter Proxy-IPs.
Dabei wurde eine konkrete Headerreihenfolge korrigiert: Gehashte Angular-Bundles erhalten jetzt
tatsächlich `max-age=31536000, immutable`; normale Illustrationen behalten eine Stunde Cachezeit.

Die isolierten Testcontainer und ihre Netze werden nach jedem Lauf entfernt. Testdaten liegen nur
in temporären Verzeichnissen bzw. im Container-RAM. Buildimages und Buildcache bleiben lokal.
Wiederholen vom Repository-Stamm:

```sh
python3 deploy/tests/backup_restore.py
docker build --file deploy/frontend.Dockerfile --tag everbloom-web:local-beta .
docker build --file deploy/backend.Dockerfile --tag everbloom-backend:local-beta .
python3 deploy/tests/web_routing.py
# Anderes lokal gebautes Webimage wählen:
EVERBLOOM_TEST_WEB_IMAGE=herovera-web:local-readiness \
EVERBLOOM_TEST_API_IMAGE=herovera-backend:local-readiness python3 deploy/tests/web_routing.py
```

Die Backup-Prüfung wählt über `EVERBLOOM_COMPOSE_FILE` ausdrücklich eine temporäre,
datenbankexklusive Compose-Datei. Ohne diesen optionalen Parameter verwenden die Betriebsskripte
weiterhin `deploy/compose.yml` und `deploy/.env`. Der Test schreibt keine produktive `.env` und
braucht weder Domain noch Mailprovider. Er verwendet einen gestarteten Docker-Daemon; die Runtime
wird vom Test selbst nicht installiert oder gestartet.

**Weiterhin offen:** vollständiger Stack mit eigener öffentlicher Domain, echtes ACME/TLS inklusive
Erneuerung, authentifizierte SMTP-Zustellung und Ausfallalarmierung, verschlüsselter externer
Backupspeicher sowie Restore aus diesem Speicher auf dem späteren Host. Die isolierte lokale
Wiederherstellung belegt nicht diese externe Betriebsabnahme. App-, Geräte- und Storeprüfungen
bleiben getrennt in [VALIDATION.md](VALIDATION.md) und [RELEASE_V1.md](RELEASE_V1.md).

Die am 8. Oktober geprüften Runtime-Image-Digests zur Reproduktion:

- `postgres:17-bookworm`: `sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826`
- `caddy:2-alpine`: `sha256:d8542f48d34a9cf4e4c11a478865229840e87e4c96ea3f439101f31a5d35f75f`

Die Compose-Datei bleibt bei Major-Tags; ein späteres Release muss seine dann geprüften Digests
festhalten. Die Anbieterempfehlung steht oben; beauftragt wurde noch kein Hosting-/SMTP-Anbieter.

## Offizielle Grundlagen

- [Caddy: SPA und API getrennt routen](https://caddyserver.com/docs/caddyfile/patterns)
- [Caddy: automatische HTTPS-Zertifikate](https://caddyserver.com/docs/automatic-https)
- [Docker Compose: Startreihenfolge und Healthchecks](https://docs.docker.com/compose/how-tos/startup-order/)
- [Docker: Dockerfile-spezifische Ignore-Dateien](https://docs.docker.com/build/building/context/#dockerignore-files)
- [PostgreSQL 17: konsistente Dumps und Wiederherstellung](https://www.postgresql.org/docs/17/backup-dump.html)
- [Node.js: unterstützte Release-Linien](https://nodejs.org/en/about/previous-releases)
