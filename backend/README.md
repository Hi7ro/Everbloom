# Herovera Backend · erste private Beta

Spring Boot 4.1.1 / Java 21, PostgreSQL und Flyway. Der Backend-Stand verbindet verifizierte
Accounts mit serverseitiger Spielprogression. Die lokale Demo und ihr Browserjournal sind
keine Cloud-Spielstände und werden nicht automatisch importiert.

## Konto- und Sessionablauf

| Methode / Pfad | Wirkung |
| --- | --- |
| `GET /api/auth/csrf` | `{token, headerName}` für folgende Schreibzugriffe |
| `POST /api/auth/register` | `{email,password}` → immer generische `202 {message}` bei gültiger Anfrage; keine automatische Anmeldung |
| `POST /api/auth/verification/request` | `{email}` → generische `202`; neuer Link für unbestätigte Konten |
| `POST /api/auth/verification/confirm` | `{token}` → `204`, einmalige E-Mail-Bestätigung |
| `POST /api/auth/login` | `{email,password}` → `{id,email,verified}`; nur bestätigte Konten |
| `GET /api/auth/me` | aktueller Account aus der geprüften Session |
| `POST /api/auth/logout` | `204`; Sitzung und Cookie entfernen |
| `POST /api/auth/password/request` | `{email}` → generische `202`; Wiederherstellung für bestätigte Konten |
| `POST /api/auth/password/reset` | `{token,password}` → `204`; alle Sitzungen dieses Accounts widerrufen |
| `GET /api/account/export` | Account und eigener Snapshot/Journey als JSON-Download |
| `POST /api/account/delete` | `{password}` → `204`; Account, Tokens, Spielstand, Aktivitäts-IDs und Sitzungen löschen |
| `GET /api/health` | öffentlicher DB-Readiness-Check; nur `{status:"UP"}`, keine Konfiguration |

Vor jeder Schreibsequenz den CSRF-Token mit derselben Cookie-Verbindung laden und den
angegebenen Header senden. Nach Login, Logout und Passwortreset erneut laden; Login rotiert
Session-ID und CSRF-Token. Verifikation meldet nicht automatisch an. Fehlende Session ergibt
`401`, fehlendes/ungültiges CSRF `403`, falsche Login-Daten `401 INVALID_CREDENTIALS`, korrektes
Passwort bei unbestätigter Adresse `403 EMAIL_NOT_VERIFIED`, ungültiger/verbrauchter/abgelaufener
Link `400 INVALID_TOKEN`, Limits `429 RATE_LIMITED`. Antworten enthalten keine internen Fehlerdetails.

Passwörter: 15–128 Zeichen, auch Unicode. Neue Hashes verwenden Argon2id (19 MiB, zwei Durchläufe,
Parallelität eins). Bestehende BCrypt-Hashes können erfolgreich angemeldet und dabei auf Argon2
aktualisiert werden; Eingaben über 72 UTF-8-Bytes werden bei Legacy-BCrypt nicht still abgeschnitten.
Ein Dummy-Hash wird auch für unbekannte Login-Adressen geprüft. Passwörter, Cookie-Werte, Mailtexte
und rohe Wiederherstellungstokens werden nicht geloggt oder exportiert.

Einmallinks enthalten 32 kryptografisch zufällige Bytes. Nur SHA-256-Digests stehen in `auth_tokens`;
Verifikation läuft nach einer Stunde, Passwortreset nach 15 Minuten ab. Ein neuer Link widerruft
seinen Vorgänger. Verbrauch und Accountänderung sind gemeinsam transaktional, einschließlich
paralleler Einlösungsversuche. Links verwenden `/auth/verify#token=…` bzw. `/auth/reset#token=…`;
das Fragment wird von der App in den POST-Body übernommen und gehört nicht in Zugriffslogs.

Spring Session JDBC persistiert Sessions. Der Cookie `EVERBLOOM_SESSION` ist `HttpOnly`,
`SameSite=Lax`, produktiv `Secure`, mit explizitem `Max-Age=1800` für die native Cookie-Brücke.
Der Server erzwingt zusätzlich 30 Minuten Inaktivität; das Cookie begrenzt den Client unabhängig
davon auf 30 Minuten ab Ausstellung. Reset erhöht `accounts.session_version` und löscht alle
zugehörigen Sessions. Jede authentifizierte Anfrage prüft Account, Verifikation und Sessionversion,
damit auch ein verspätet gespeicherter alter Kontext nicht wieder nutzbar wird.

## Schutzgrenzen

- Gemeinsame JDBC-Zähler begrenzen IP und normalisierte Accountadresse separat. Standardfenster:
  15 Minuten; 60 Auth-Anfragen/IP, 10 Loginversuche/Account, drei Registrierungs- bzw.
  Verifikations-/Resetanfragen/Account. CSRF, Tokenbestätigung, Export und Löschung haben eigene
  Grenzen. Abgelaufene Einträge werden bereinigt, der Schlüsselbestand ist begrenzt; DB-Schlüssel
  enthalten nur Digests. Die Zähler überleben Prozessneustarts und gelten über Instanzen hinweg.
- Standardmäßig zählt ausschließlich die direkte Servlet-IP. `X-Forwarded-For` wird ignoriert.
  Nur ausdrücklich über `EVERBLOOM_TRUSTED_PROXY_IPS` angegebene einzelne Proxy-IP-Adressen dürfen
  ein validiertes `X-Real-IP` liefern. Der Proxy muss diesen Header mit der tatsächlichen Client-IP
  überschreiben. Keine Hostnamen, CIDRs oder pauschalen privaten Netze werden akzeptiert.
- Account-Schreibanfragen haben ein 16-KiB-Bodylimit, auch ohne `Content-Length`. DTOs validieren
  E-Mail, Passwort und Tokenformat. Besitzer-ID und XP kommen niemals aus freien Accountfeldern.
- Der öffentliche Readiness-Check prüft die Datenbank. Er beweist keine SMTP-Zustellung, kein
  externes TLS-Setup und keine native Store-Freigabe.

## Game-API

Nur verifizierte, angemeldete Besitzer können `GET /api/game`, `PUT /api/game/character`,
`POST /api/game/activities` sowie `GET/PUT /api/game/journey` verwenden. Neue Accounts starten
bei null XP; `createdByPlayer=false` führt zum Creator. Es gibt keinen öffentlichen Demo-Reset.
Serverdatum/Perioden folgen Europe/Vienna. Der Server berechnet XP, Quests, Boss-Schaden und
Aura-Freischaltungen. Eine wiederholte Aktivitäts-ID erzeugt keinen zweiten Reward; eine andere
Nutzlast unter derselben ID ergibt `409`. Export enthält den vorhandenen Zustand ohne Initialisierung
oder zusätzliche Progression. `ON DELETE CASCADE` entfernt auch die Game-Daten.

Wiederholte Abrufe am selben Serverdatum verwenden den bestehenden Tageszustand. Erst beim Datumswechsel
werden Quests und Wochenrhythmus neu aufgebaut; dadurch entfällt beim normalen Laden ein erneuter Scan
des Aktivitätsjournals. Der Preview-Membershippfad prüft weiterhin das Konto, liest aber keine ungenutzten Kaufdaten.

`POST /api/game/bosses/{bossId}/fight` akzeptiert ausschließlich `{requestId,difficulty,tactic}`.
Boss-IDs: `mosswarden`, `emberwyrm`, `dusk-prowler`, `frost-titan`, `cloud-sovereign`, `bloodmoon-regent`, `astral-sovereign`, `void-devourer`, `primordial-dragon`, `relic-sovereign`; Modi: `normal`, `hard`, `epic`, `ultimate`;
Taktiken: `balanced`, `power`, `guard`. Die normalen Bosse beginnen auf Level 10/20/30/40/50/60/70/80/90/100. Zusätzliche
Mindestlevel sind +5/+15/+30; die empfohlenen Level +10/+20/+30. Die Gegner skalieren nicht mit dem
Spieler. Der Server verwendet nur gespeicherte Charakter-XP, Skills und Attribute; ein neuer Account
braucht zuerst einen erstellten Charakter.

Die Dämmerungsbestie besetzt Level 30; ihr Runenschild kündigt eine Raserei mit zwei Treffern an.
Der Wolkenkönig bleibt das Finale des ersten Kapitels. Die Blutmondregentin folgt auf Level 60
(Modusgrenzen 60/65/75/90): Ihr schadensfreies Siegel schützt einen Treffer und kündigt eine
Mondfinsternis mit begrenzter Selbstheilung an. `BattleTurn.healing` heilt den handelnden Akteur,
bei Bosszügen also nur dessen `bossHp`. Der Sternensouverän folgt auf Level 70
mit Modusgrenzen 70/75/85/100. Vorhandene Sternen-Siege, Belohnungen und gespeicherte Replays
bleiben unverändert erhalten. Für neue Kämpfe muss der sichtbare Kampagnenpfad einschließlich
der neuen Dämmerungsbestie und Blutmondregentin abgeschlossen sein; alte Einzel-Siege überspringen keine Lücke.

Nharok auf Level 80 schützt sich beim Gravitationssog vor zwei Treffern und kündigt einen Ereignishorizont an. Vaelthar auf Level 90 wechselt Mehrfachtreffer und angekündigten kosmischen Atem. Aureon auf Level 100 kombiniert Königsaegis, Klinge und angekündigten Reliktregen; sein Druck wächst ab Runde 6 um 4 Prozentpunkte pro Runde bis maximal 28 Prozent. Alle drei Aufladungen verursachen zunächst null Schaden und speichern die angekündigte Stärke. Die Ultimate-Grenzen sind 110/120/130. Normale Begegnungen bei 80/90/100 setzen ausgewogene verdiente Skills voraus; 35 % der Charakter-XP verteilt auf sechs Attribute gewinnen mit ausgewogener Taktik. Levelvorsprung erleichtert diese Kämpfe.

Start-Auren sind ausschließlich `none` und `sage`. `rose` wird auf Level 5 (6000 XP), `void` auf Level 10 (18000 XP) verdient. Die schmale Lade-Migration erhält früher bereits ausgerüstete Rosen-/Schattenauren und ergänzt die Rechte alter Konten oberhalb dieser Level; XP, Journal, Quests und Bossbelohnungen bleiben unverändert. Andere verdiente Auren werden dadurch nicht rückwirkend vergeben. Alle Aura-IDs und ihr Besitz werden beim Profil-Speichern geprüft.

Die Antwort `{snapshot,replay,firstClear,reward,duplicate}` enthält den deterministischen Kampflauf
und den bereits atomar gespeicherten Zustand. Ein Sieg pro Boss/Modus schaltet genau ein garantiertes
kosmetisches Fundstück frei: selten/episch/legendär/mythisch. Wiederholungen vergeben weder weitere
Gegenstände noch XP. `bossProgress` enthält abgeschlossene Begegnungen und kosmetische Besitz-IDs;
verdiente Auren stehen zusätzlich in `unlockedAuras`. `cosmeticHair`/`cosmeticOutfit` werden beim
Profil-Speichern auf erlaubten Slot und tatsächlichen Besitz geprüft. Im Standardmodus `preview` sind alle
Modi nach Erreichen ihrer Levelgrenze frei. Bei ausdrücklich eingerichtetem `live`-Billing benötigt ein
neuer Kampf auf Hard/Epic/Ultimate eine bestätigte Plus-Membership, ebenso jeder normale Boss ab
Basislevel 60. Kostenlos bleiben die ersten fünf Normalbosse bis einschließlich des Wolkenkönigs
auf Basislevel 50; Charakter-XP und Charakterlevel werden dadurch nicht begrenzt. Verdiente
Kosmetik und idempotente Wiederholungen bereits akzeptierter Kämpfe bleiben nach Abo-Ende erhalten.
Haar- und Outfitbelohnungen behalten ihre gemeinsamen Besitz-IDs. Jedes Fundstück enthält zwei unterschiedliche, zur Darstellung passende `modules`-Einträge; die Oberfläche löst Name, Sammlungsbild und getragenes Modul anhand der aktuellen `appearance.presentation` auf. Ein Wechsel zwischen männlicher/weiblicher Darstellung bewahrt Besitz, XP und gespeicherte Kampf-Replays. Auren bleiben für beide gleich. Profile dürfen keine fremden Darstellungs-Module oder zusätzlichen `moduleId`-/Variantenfelder einschleusen; die API prüft ihre erlaubten Felder und Module unabhängig vom Besitz.

Accountzeilen-Sperren serialisieren Kampfauflösung, Erstabschluss und Loot. Eine gleiche Anfrage-ID
liefert den ursprünglichen Replay und den aktuellen Spielstand; eine geänderte Anfrage unter derselben
ID ergibt `409`. Das Kampfjournal ist auf 5.000 angenommene Anfragen pro Beta-Konto begrenzt. Export
enthält auch das eigene Kampfjournal; Kontolöschung entfernt es per Cascade. Der lokale Probekampf
ruft dieses Endpoint nicht auf und kann nichts freischalten.

Flyway-Migrationen: `V1` Accounts, `V2` Kontolebenszyklus/Sessions/Rate-Limits, `V3` Game-Zustand,
`V4` idempotentes Boss-Kampfjournal, `V5` verifizierte Memberships, Webhook-Deduplizierung und externe Löschaufträge.
JDBC-Sessiontabellen werden ausschließlich über Flyway angelegt, nicht bei jedem Start ersetzt.

## Native Membership / RevenueCat

`GET /api/billing/membership` und `POST /api/billing/refresh` mit leerem `{}` gehören dem angemeldeten,
verifizierten Konto. Auch hier gilt `X-Everbloom-Account`; Refresh benötigt CSRF. Nach einem nativen Kauf oder
Wiederherstellen muss die App Refresh aufrufen. Der Server liest den RevenueCat-Kunden mit seiner eigenen
Account-UUID und übernimmt keine vom Client behaupteten Rechte, XP oder Kaufbelege.

Antwort: `mode`, `active`, `verifiedAt`, `expiresAt`, `willRenew`, `store`, `managementUrl`,
`characterXpBonusPercent`, `advancedBosses`, `purchaseConfig`. Zeitwerte sind ISO-8601 oder `null`.
`purchaseConfig` enthält ausschließlich die Account-UUID als `appUserId`, `entitlementId`, `appleProductId`,
`googleProductId`, `offeringId` und die öffentlichen SDK-Schlüssel `appleApiKey`/`googleApiKey`.
Im Standardmodus `preview` ist sie `null`: kein Kauf, kein behauptetes Abo, kein XP-Bonus, alle Beta-Modi frei.

Für `EVERBLOOM_BILLING_MODE=live` erforderlich:

- `REVENUECAT_SECRET_API_KEY`: ausschließlich auf dem Server, niemals Runtime-JSON oder App-Bundle.
- `REVENUECAT_WEBHOOK_AUTHORIZATION`: frei gewählter geheimer Wert mit mindestens 32 Zeichen; exakt denselben
  Authorization-Header in RevenueCat für `POST /api/billing/revenuecat/webhook` eintragen.
- `REVENUECAT_APPLE_API_KEY` (`appl_…`) und `REVENUECAT_GOOGLE_API_KEY` (`goog_…`): öffentliche native SDK-Schlüssel.
- Store-Produkte im RevenueCat-Offering zuordnen: `REVENUECAT_ENTITLEMENT_ID` (Default `everbloom_plus`),
  `REVENUECAT_APPLE_PRODUCT_ID` (Default `everbloom_plus_monthly`), `REVENUECAT_GOOGLE_PRODUCT_ID`
  (Default `everbloom_plus:monthly`, **Subscription-ID:Base-Plan-ID**), `REVENUECAT_OFFERING_ID` (Default `default`).
  Diese Defaults legen keine Produkte im Store an. Google wird anhand beider separater REST-Felder geprüft;
  eine andere oder fehlende Base-Plan-ID gewährt keine Rechte.
- RevenueCat Restore Behavior: **Keep with original App User ID**. Die App muss vor jedem Kauf den richtigen
  Herovera-Account verwenden; die Wiederherstellung bei vergessenem Konto erfolgt über den bestehenden Login.
- `REVENUECAT_ALLOW_SANDBOX=false` ist Standard. Nur ein getrenntes Testbackend ausdrücklich auf `true` setzen.

Live-Konfiguration mit fehlenden Pflichtwerten verhindert den Start. Aktive Rechte sind höchstens fünf Minuten
gecacht und enden spätestens zur bestätigten Ablaufzeit; vom Provider gewährte Grace Periods werden berücksichtigt.
Ein fehlgeschlagener Refresh gewährt keine neuen Rechte. Bei einem bisher aktiven, nun veralteten Nachweis wird eine
neue Aktivität mit `503 BILLING_UNAVAILABLE` zurückgewiesen, statt ihren Plus-Bonus still zu verlieren. Ein bereits
freier Account kann weiter seine normalen Aktivitäten eintragen. `membershipXp` wird auf Aktivitäts- und Rewarddaten
separat ausgewiesen: zehn Prozent der gedeckelten Aktivitäts-XP, abgerundet, nur auf Charakter-XP. Skill-XP,
Quest-Bonus und Boss-Schaden werden nicht erhöht. Alte gespeicherte Einträge lesen diesen Wert als null Bonus.

Webhook: exakter Authorization-Vergleich, kein CSRF (nur auf diesem POST-Pfad), maximal 64 KiB, Ereignis-ID für
30 Tage dedupliziert. Der Inhalt gewährt niemals selbst Rechte; für alle bekannten betroffenen Account-IDs
(einschließlich Transfer-Ursprung/Ziel) wird der Provider erneut gefragt. Unbekannte IDs erstellen keine Accounts.
Fehlgeschlagene Verarbeitung rollt auch die Deduplizierung zurück, damit RevenueCat erneut zustellen kann.
Refresh: 20 Aufrufe/Konto und 100/IP pro 15 Minuten; Membership-Lesen 120/Konto pro Minute.

Export enthält gespeicherte Membership-Metadaten, keine Schlüssel oder Belege. Kontolöschung löscht lokale Rechte
sofort und hinterlegt in derselben Transaktion einen externen Löschauftrag mit nur der UUID. Der Worker fragt jede
Minute bis zu zehn fällige Aufträge ab; Fehler werden nach 15 Minuten erneut versucht. Die Warteschlange muss im
Betrieb überwacht werden. Provider-Löschung **kündigt kein Apple-/Google-Abo**: dafür vorher die Store-Verwaltung nutzen.
Es wurden keine echten Käufe oder externen Kunden mit dieser Implementierung angelegt/geändert.

Referenzen: [RevenueCat Kunden-API](https://www.revenuecat.com/docs/api-v1/customers),
[Webhooks](https://www.revenuecat.com/docs/integrations/webhooks),
[Restore Behavior](https://www.revenuecat.com/docs/projects/restore-behavior).

## Lokal starten und prüfen

Der Root-Starthelfer `scripts/start-backend-local.sh` verwendet eine isolierte lokale Datenbank.
Alternativ vorhandene PostgreSQL-Zugangsdaten über `EVERBLOOM_DB_URL`, `EVERBLOOM_DB_USER` und
`EVERBLOOM_DB_PASSWORD` bereitstellen und aus diesem Ordner starten:

```sh
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
./mvnw test
```

`dev` bindet ausschließlich Loopback und darf nicht als öffentlicher Server betrieben werden.
Das Profil deaktiviert nur lokal Secure-Cookies und nutzt eine begrenzte Mail-Outbox im Speicher
(maximal 100 Nachrichten, eine Stunde Aufbewahrung). `GET /api/dev/mail/outbox` ist nur in `dev`
oder `test` vorhanden; direkte Peer-IP und Host müssen Loopback sein, fremde Browser-Origin-Anfragen
werden abgelehnt. Die Outbox enthält rohe Testlinks und ist deshalb niemals ein Produktionsfeature.
Kein SMTP-Konto ist für diesen lokalen Ablauf nötig. Der Prozessstart verweigert `dev/test` mit
einer öffentlichen Bind-Adresse sowie Outbox-Modus außerhalb dieser Profile.

Aus dem Projektroot prüft `python3 scripts/smoke-beta.py` den echten HTTP-Ablauf gegen das lokale
Backend; `--base-url http://127.0.0.1:4202` prüft zusätzlich den Frontendproxy. Testkonten haben
zufällige `@example.test`-Adressen und werden anschließend gelöscht. `--keep-ui-account` legt
zusätzlich einen bestätigten Account ohne angelegten Charakter an; seine Zugangsdaten stehen
nur in der ignorierten Datei `.local/browser-qa.json` mit Rechten `0600`, nie im Konsolenoutput.
Das Script akzeptiert ausschließlich lokale HTTP-Loopback-Ziele.

`python3 scripts/smoke-bosses.py` prüft die drei echten Kämpfe, Levelgrenzen, Ultimate ab Level 40,
Wiederholungen, Besitzprüfung, Profil-Speicherung, Export, Kontotrennung und Löschung gegen HTTP und
PostgreSQL. Für die Level-Grenzwerte setzt es gezielt XP ausschließlich bei einem in diesem Lauf neu
angelegten synthetischen Konto in `everbloom_beta_dev`. Bestehende Konten werden nicht angefasst.
`--keep-ui-account` bewahrt diesen als Level-40-Testcharakter auf und speichert Zugangsdaten in
`.local/boss-browser-qa.json` (`0600`). Das ist Testvorbereitung, kein öffentliches Fortschritts-Feature.

## Produktiver Beta-Betrieb

Ohne `dev/test` ist SMTP verpflichtend. Erforderliche Werte:

- `EVERBLOOM_DB_URL`, `EVERBLOOM_DB_USER`, `EVERBLOOM_DB_PASSWORD`
- `EVERBLOOM_PUBLIC_BASE_URL`: öffentliche HTTPS-Basis für Verifikations-/Resetlinks
- `EVERBLOOM_SMTP_HOST`, `EVERBLOOM_SMTP_PORT` (Standard 587), `EVERBLOOM_SMTP_USER`,
  `EVERBLOOM_SMTP_PASSWORD`, `EVERBLOOM_MAIL_FROM`
- optional `EVERBLOOM_BIND_ADDRESS`, `EVERBLOOM_PORT`, `EVERBLOOM_TRUSTED_PROXY_IPS`

SMTP nutzt Authentifizierung und verpflichtendes STARTTLS mit begrenzten Verbindungs-/Lese- und
Schreibzeiten. Der Start prüft die Verbindung standardmäßig; `EVERBLOOM_SMTP_TEST_CONNECTION=false`
ist nur ein bewusster Betriebs-Override und ersetzt keine Zustellprüfung. Fehlende SMTP-Konfiguration,
unsichere öffentliche Links oder unsichere Produktionscookies verhindern den Start.

Der Versand erfolgt erst nach dem DB-Commit über eine begrenzte In-Memory-Warteschlange. SMTP-Latenz
ändert die generischen Accountantworten nicht. Fehlgeschlagene oder bei voller Queue verworfene
Zustellungen erhöhen `AccountMail.failedDeliveryCount()` und erzeugen eine feste Warnmeldung ohne
Adresse, Transportdetails oder Token. Diese Warnung kann im Betrieb alarmiert werden. Die Queue ist nicht
dauerhaft: nach einem Ausfall kann der Nutzer einen neuen Link anfordern. Ein echter Provider,
SPF/DKIM/DMARC, Zustellmonitoring und Alerting dieses Fehlerzählers müssen für eine öffentliche Beta
betrieben und außerhalb der lokalen Tests geprüft werden. Es gibt keinen stillen Produktionsfall
auf die Entwickler-Outbox und keine Behauptung, dass reale E-Mails bereits zugestellt wurden.

## Technische Referenzen

- [Spring Session JDBC und Boot-Konfiguration](https://docs.spring.io/spring-boot/reference/web/spring-session.html)
- [Explizite Session-Authentifizierung und Kontextpersistenz](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html)
- [CSRF bei SPA-Integration](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html)
- [Adaptive und migrierbare Passwort-Hashes](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
- [SMTP und Timeouts](https://docs.spring.io/spring-boot/reference/io/email.html)
