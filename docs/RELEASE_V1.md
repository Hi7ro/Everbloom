# Erste veröffentlichbare Version

Stand: 8. Oktober 2026. Dieses Dokument ist der Abnahmevertrag für die erste spielbare,
abonnierbare iOS-/Android-Version. Es ist **keine Freigabe und kein Nachweis einer Veröffentlichung**.
Spiel-/Kontobasis und native Store-Anbindung sind im Code implementiert; die externe
Store-Konfiguration und tatsächliche Kaufabnahme stehen aus. Aktuelle technische Nachweise stehen in [VALIDATION.md](VALIDATION.md).
Echte Store-Käufe, Signierung, öffentlicher Betrieb und Geräteabnahme sind separat offen.

## Was V1 konkret liefert

| Bereich | Verbindlicher Umfang |
| --- | --- |
| Einstieg | Konto anlegen, E-Mail bestätigen, anmelden, Passwort wiederherstellen; Charakter erst nach Anmeldung erstellen. |
| Eigener Charakter | Bestehende zwölf Anime-Chibi-Vorlagen, verfügbare Haare, Augen, Outfits und Auren; gespeicherte Auswahl, sichtbare Atmung und reduzierte Bewegung. |
| Alltag | Aktivitäten für die vorhandenen Skills eintragen; nachvollziehbare Charakter-/Skill-XP, begrenzte Vergabe, persönliche Tagesquests, Tagespflege und Wochenüberblick. Unbestätigte Einträge dürfen keine doppelten XP erzeugen. |
| Fortschritt | Level, Stats, Meilensteine, sichtbare nächste Freischaltung, Belohnungsfenster und optionaler Erfolgston. Pausen zerstören keinen Charakter und entziehen keine erworbenen Cosmetics. |
| Kampagne | Zehn nacheinander entdeckte Bosse: Mooswächter 10, Glutwyrm 20, Dämmerungsbestie 30, Frosttitan 40, Wolkenkönig 50, Blutmondregentin 60, Sternensouverän 70, Nharok 80, Vaelthar 90, Aureon 100. Normal bis einschließlich Wolkenkönig (Basislevel 50) ist dauerhaft kostenlos; spätere Bosse erfordern in jedem Modus Plus. Der Wolkenkönig bleibt das anspruchsvolle Kapitel-1-Finale; die Begegnungen bis Level 100 folgen danach. Automatisierte Kämpfe, vier eigene Bildformen je Boss, passende Effekte und 40 gespeicherte Erstabschluss-Belohnungen. |
| Plus | Alle Modi der Bosse auf Basislevel 60–100 sowie Hard/Episch/Ultimate der ersten fünf: insgesamt 35 zusätzliche Begegnungen. Probekämpfe haben dieselbe Zugangsgrenze; Skills, XP und Charakterlevel werden nicht durch ein Abo gedeckelt. Dazu 10 % zusätzliche Charakter-XP aus Aktivitäten; keine zusätzlichen Skill-/Quest-XP und kein direkter Schadensbonus. Details in [MONETIZATION.md](MONETIZATION.md). |
| Konto | Geräteübergreifender Server-Spielstand, Export und Kontolöschung. Sichtbarer Hinweis, dass die Kontolöschung ein Store-Abo nicht kündigt. |
| Mobil | Gebündelte Capacitor-App für iPhone/iPad und Android-Handy/Tablet; sichere HTTPS-Verbindung, Safe Areas, verständliche Lade-/Netzfehler und Wiederanmeldung. |

Die lokale Billing-Testvorschau darf alle Modi ohne Kauf/Bonus anbieten, muss aber ausdrücklich als
Testvorschau erkennbar bleiben; sie beweist weder gekaufte Rechte noch Live-Zugriff. Im Live-Test
sind Free, aktives Plus und abgelaufenes Plus separat zu prüfen.

Deutsch ist die zuerst abzunehmende Oberfläche. Weitere Sprachen bleiben im Produktplan und
werden erst beworben, wenn vollständig eingebaut und geprüft. Parties, Guilds, Raids, neue
Story-Kapitel, Health-Anbindungen und Push-Nachrichten sind kein Verkaufsversprechen dieser V1.
Die App unterstützt reale Aktivitäten; sie gibt keine medizinischen oder therapeutischen
Erfolgsgarantien. Artwork und öffentliche Texte bleiben eigenständige IP.

## Betreiber, Name und Konten

Apple- und Google-Entwicklerkonten sind laut Betreiber vorhanden. Das belegt noch keine
abgeschlossenen Verträge, Zahlungs-/Steuerdaten, App-Einträge oder funktionierende Signierung.
Ein RevenueCat-Konto wurde bisher nicht bestätigt.

**Herovera ist der am 8. Oktober 2026 vom Betreiber gewählte öffentliche App-Name.**
Leitsatz: „Dein Leben. Dein Abenteuer.“; möglicher Store-Titel: „Herovera: Dein Leben als RPG“.
Oberfläche, E-Mail-Betreff und native Anzeigenamen verwenden Herovera. Der frühere Arbeitstitel
Everbloom bleibt in internen Kennungen: `com.everbloom.app`, API-Headern, gespeicherten
Schlüsseln und Store-Produkt-IDs. Ein Anzeigename erfordert keine Datenmigration.
Die App-ID ist vor dem ersten Store-Eintrag mit den vorhandenen Konten zu prüfen; sie muss
in Capacitor, Android, iOS, Store und RevenueCat übereinstimmen.
Die Namensentscheidung ist keine bestätigte Marken-, Domain- oder Store-Verfügbarkeit.
Vor Registrierung ist eine gesonderte Prüfung nötig.

**Bestätigte Betreiberangaben (8. Oktober 2026): Adderlyn Windsor, Österreich.**
Laut eigener Angabe ist dies die erste App; bisher besteht keine Anmeldung als Selbstständiger
oder Unternehmer. Das dokumentiert den angegebenen Anmeldestand, nicht eine rechtliche
Einordnung der geplanten Tätigkeit. Es wurde keine Gesellschaft oder Gewerbeberechtigung
bestätigt. Keine Bezeichnungen wie „GmbH“ oder „e.U.“ hinzufügen und keine Registrierung behaupten.

Offen bleiben die Einordnung und nötigen Anmeldungen für den geplanten kommerziellen Betrieb,
ladungsfähige Kontaktangaben, Domain, Hosting und Support. Keine erfundene Firma eintragen. Empfohlene
Support-Adresse: `support@<gewählte-domain>`; sie ist ein Muster, kein vorhandenes Postfach.
Zugangsdaten, Private Keys und Zahlungsdaten werden direkt in den Anbieteroberflächen oder
geschützter Serverkonfiguration hinterlegt, niemals in Chat, App-Bundle oder Git.

### Spielmarke und rechtlicher Betreiber

Offizielle Quellen geprüft am 8. Oktober 2026. Österreich und der bürgerliche Name sind bestätigt;
die vollständige Anschrift und die gewerbe-/steuerrechtliche Einordnung sind noch offen.
Die folgenden Angaben ersetzen keine Prüfung des konkreten Betriebs.

- **Herovera** ist der Produktname. Ein Pseudonym oder erfundener Studioname ersetzt nicht die
  verifizierte Identität des Vertragspartners.
- **Apple Individual / Einzelunternehmer:** persönlicher gesetzlicher Name als Verkäufer und
  Entwicklername. Ein Organisationskonto setzt einen tatsächlichen Rechtsträger voraus; nur
  dort ist ein abweichender registrierter Handelsname als Entwicklername möglich.
  [Apple Enrollment](https://developer.apple.com/programs/enroll/),
  [Entwicklername](https://developer.apple.com/help/app-store-connect/create-an-app-record/set-your-developer-name/).
- **Google Play:** ein anderer öffentlicher Entwicklername ist möglich. Zusätzlich zeigt Google
  bei persönlichen Konten den rechtlichen Namen, das Land und die Entwickler-E-Mail; bei
  Monetarisierung auch die vollständige Anschrift.
  [Kontoinformationen](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en).
- **Österreich:** Einzelunternehmer benötigen grundsätzlich Vor- und
  Familiennamen in den Betreiberangaben. Ein abweichender eingetragener Firmenname beseitigt
  die zusätzliche Pflicht zum bürgerlichen Namen nicht. Rechtsträger, Anschrift und Kontakte
  werden nur mit tatsächlichen Angaben ergänzt. Die lokalen Vorabseiten nennen bereits
  Adderlyn Windsor und Österreich; sie bleiben bis zur Vervollständigung als Entwurf gekennzeichnet.
  [WKO: Informationspflichten](https://www.wko.at/internetrecht/informationspflichten-nach-dem-e-commerce-gesetz--dem-unte).

`herovera.com` war bei der Registry-Prüfung bereits registriert. Für `herovera.app` lieferte die
Registry kein RDAP-Objekt; das ist keine Zusicherung der Erwerbsmöglichkeit. Keine Domain wurde
gekauft oder dem Betreiber zugeschrieben. Markenprüfung und verbindliche Registrar-Abfrage
bleiben vor einer Registrierung erforderlich.
[Verisign](https://rdap.verisign.com/com/v1/domain/herovera.com),
[Google Registry](https://pubapi.registry.google/rdap/domain/herovera.app).

### Erste App: Gründung vor dem kommerziellen Angebot klären

Die lokale Entwicklung und technische Vorbereitung laufen weiter. Der angegebene fehlende
Anmeldestand ist keine Zusicherung, dass ein späteres Abo-Angebot als privates Hobby gilt.
Bei einer selbstständigen, regelmäßigen Tätigkeit mit Ertragsabsicht kann die Gewerbeordnung
greifen; bereits öffentliches Anbieten kann einer Ausübung gleichstehen. Nicht erst den ersten
zahlenden Nutzer als Anlass zur Klärung verwenden. Eine GmbH ist nicht zwingend erforderlich.
[GewO § 1](https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10007517&Paragraf=1),
[AMS: Unternehmensstart](https://www.ams.at/arbeitsuchende/topicliste/selbststaendig-machen-ohne-eigenkapital).

1. **Tätigkeit einordnen lassen:** WKO-Gründerservice bzw. Gewerbebehörde die tatsächliche
   Leistung beschreiben: selbstentwickeltes mobiles Spiel, kostenlose Basis, Monatsabo mit
   Preisziel 3,99 €, laufender Serverbetrieb und Softwarepflege, aktuell keine Auftragsentwicklung.
   Als Anlaufstelle liegt das freie IT-Gewerbe nahe; das ist noch keine verbindliche Einordnung.
   Für dieses freie Gewerbe ist kein besonderer Ausbildungs- oder Prüfungsnachweis erforderlich.
   Eine mögliche Ausnahme für Urheber/Selbstverlag darf nicht pauschal auf einen laufenden
   App-Dienst übertragen werden. Ergebnis festhalten und erforderliche Anmeldung erledigen.
   [WKO: IT-Gründung](https://www.wko.at/information-consulting/unternehmensberatung-buchhaltung-informationstechnologie/it-dienstleistung/unternehmensgruendung),
   [GewO § 2](https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10007517&Paragraf=2).
2. **Steuerliche Erfassung:** Der Beginn der Tätigkeit ist mit dem Finanzamt zu klären;
   die Betriebseröffnung ist innerhalb eines Monats anzuzeigen. Beginn nicht automatisch
   mit dem Storestart gleichsetzen. Abrechnung über Apple/Google ersetzt nicht die eigenen
   steuerlichen Pflichten. [USP: steuerliche Pflichten](https://www.usp.gv.at/themen/steuern-finanzen/steuerliche-rechte-und-pflichten/pflichten-des-unternehmers.html).
3. **Sozialversicherung und laufende Kosten:** Mit der SVS Versicherung und mögliche
   Ausnahmen prüfen. Die Kleinunternehmer-Ausnahme für Gewerbetreibende ist an Voraussetzungen
   und Antrag gebunden. Sie ist von der umsatzsteuerlichen Kleinunternehmerregelung getrennt;
   kleine Einnahmen bedeuten nicht automatisch keine Beiträge.
   [SVS: Kleinunternehmer](https://www.svs.at/cdscontent/?contentid=10007.846813&portal=svsportal&viewmode=content).

Keine Anmeldung wurde vorgenommen und keine individuelle steuerliche Einstufung bestätigt.
Betreiberangaben in der lokalen App ersetzen weder diese Klärung noch ein vollständiges Impressum.

## Reihenfolge bis zur ersten Verteilung

1. **Öffentliche Identität und Gründung klären:** Herovera, Adderlyn Windsor und Österreich sind bestätigt.
   Vor dem kommerziellen Angebot die nötigen Anmeldungen klären; danach Anschrift, endgültige App-ID,
   Domain und Supportkontakt. Datenschutz, Nutzungsbedingungen, Kontakt und öffentlicher
   Kontolöschweg müssen den tatsächlichen Betrieb beschreiben.
2. **Server betreiben:** Die vorhandene Anleitung [BETA_OPERATIONS.md](BETA_OPERATIONS.md) nutzen.
   PostgreSQL, Spring Boot, Caddy/TLS und echter SMTP-Absender; keine Dev-Outbox in Produktion.
   Registrierung, Bestätigung und Passwort-Reset von außerhalb des Entwicklungsrechners testen.
3. **Store-Angebot verbinden:** Ein Monatsprodukt, ein Entitlement und ein Offering gemäß
   [MONETIZATION.md](MONETIZATION.md) einrichten. Zunächst Sandbox/Testnutzer; Kauf-, Restore-,
   Ablauf- und Rückerstattungsfälle auf beiden Plattformen abnehmen.
4. **Native Release-Kandidaten bauen:** Öffentliche HTTPS-Origin bundeln, auf die finalen IDs
   synchronisieren und mit eigenem Team bzw. Uploadschlüssel signieren. TestFlight und einen
   Google-Play-Testtrack verwenden. Ein Simulator-Build ist kein signierter Release-Kandidat.
5. **Abnahme dokumentieren:** Untenstehende Gates mit Datum, Build-Version und Ergebnis in
   [VALIDATION.md](VALIDATION.md) festhalten. Erst danach Store-Review und kontrollierte Freigabe.

Für die erste Apple-Subscription müssen App-Version, Subscription-Gruppe und Subscription
gemeinsam zur Prüfung eingereicht werden. [Apple: erste Einreichung](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/).
Bei persönlichen Google-Entwicklerkonten, die nach dem 13. November 2023 erstellt wurden, gilt
vor dem Antrag auf Produktionszugang der geschlossene Test mit mindestens zwölf durchgehend
14 Tage angemeldeten Testern. Kontotyp und Erstellungsdatum müssen im vorhandenen Konto geprüft
werden. [Google: Testanforderungen](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

## Freigabe-Gates

| Gate | Erforderlicher Nachweis |
| --- | --- |
| Spielbarer Anfang | Frisches Konto → Bestätigung → Charakter → erste echte Aktivität → Quest-/Level-Fortschritt → Neustart. Keine Demo-Daten im neuen Konto. |
| Vollständige Kampagne | Alle zehn Normal-Bosse mit kontrollierten Testständen prüfen; Entdeckungsreihenfolge, Levelgrenzen, Wolkenkönig, Sieg/Niederlage und einmalige Loot-Vergabe. |
| Free/Plus | Free behält Tracking und die fünf Normal-Bosse 10–50. Plus öffnet 35 weitere Begegnungen. Free darf Normal 50 spielen, Normal 60 und höhere Modi auch als Probekampf nicht; +10 % nur auf Charakter-Aktivitäts-XP. Kündigung entzieht bereits verdiente Ausrüstung/Auren nicht. |
| Zahlung | Beide Stores: Produkt/Preis, Abschluss, Abbruch, ausstehender Kauf, Restore nach Neuinstallation, Verlängerung, Kündigung bis Laufzeitende, Ablauf, Rückerstattung und erneute Prüfung nach Netzausfall. |
| Kontobindung | Konto A kauft; Konto B erhält den Kauf nicht. Rückkehr zu A stellt Zugang her. Wiederherstellung des Kontozugangs funktioniert; Umgang mit gelöschtem Kaufkonto ist geklärt. |
| Datenschutz | Öffentliche Betreiber-/Kontakt-/Datenschutz-/Nutzungsseiten passen zur App inklusive RevenueCat. Export und sofortige Kontolöschung funktionieren; Store-Abo-Verwaltung bleibt erreichbar. |
| Infrastruktur | Öffentliches HTTPS, echte SMTP-Zustellung, Datenbankmigration, Neustart ohne Datenverlust, Backup und Wiederherstellung in separater Datenbank; Verantwortlicher und Aufbewahrungsfristen dokumentiert. |
| Native Qualität | Physisches iPhone/iPad und Android-Handy/Tablet: Login, Kaltstart, Hintergrund, Sessionablauf, Kauf-Rückkehr, Tastatur/Safe Areas, große Schrift, Screenreader, Reduced Motion, stummer Modus und Kampfperformance. |
| Store-Paket | Signierte Builds mit eindeutiger Version; finale IDs, Icon/Screenshots, tatsächliche Features/Sprachen, Alters- und Datenschutzangaben, Support-/Lösch-URLs sowie erreichbares Review-Konto. |

Google verlangt bei Apps mit Kontenerstellung einen Weg in der App **und** eine öffentliche
Webmöglichkeit zur Löschanfrage. Eine authentifizierte Web-Kontoverwaltung kann Bestandteil
dieses Wegs sein; der öffentliche Einstieg muss auffindbar sein und ohne erneute Installation
funktionieren. [Google: Kontolöschung](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

Der lokale Einstieg `/delete-account` ist ohne Anmeldung erreichbar und in Anmeldung,
Support und Datenschutz verlinkt. Er erklärt den Ablauf und führt zur geschützten
Kontoverwaltung `/account`. Die bestehenden Passwort- und Bestätigungsschritte bleiben nötig;
das Öffnen eines Links löscht nichts. Öffentliche HTTPS-Adresse, Supportkontakt und tatsächliche
Aufbewahrungsfristen müssen vor Verwendung dieser URL im Store noch ergänzt/geprüft werden.

## Lokale Vorprüfung

```sh
python3 scripts/check-release-readiness.py
```

Die Vorprüfung liest nur Dateien. Sie prüft unter anderem geschützte Deployment-Konfiguration,
gebündelte HTTPS-Origin, übereinstimmende App-IDs und Billing-Konfiguration. Die tatsächlichen
Betreiber-/Supportangaben bleiben eine manuelle Abnahme; dafür wird keine neue
Konfigurationsquelle erfunden. Die Prüfung gibt keine Secret-Werte aus und startet weder Server noch Käufe.
`MISSING` bedeutet fehlende/ungeeignete Konfiguration; `VERIFY` kennzeichnet externe Nachweise,
die Dateiinhalte nicht liefern können. Solange eines davon offen ist, lautet das Ergebnis
`NOT_READY` mit Exitcode 1. `PASS` bei einem Einzelpunkt bestätigt nur die beschriebene
Dateiprüfung, keine Store-Freigabe. Es wird keine zweite Release-Konfigurationsdatei angelegt.

Die derzeitigen lokalen Bundles enthalten noch keine öffentliche API-Origin; `deploy/.env`
fehlt. Ein positiver Build allein hebt diese Gates nicht auf. Historische Beta-Dokumente
beschreiben frühere kostenlose Vorschauen; für den abonnierbaren V1-Umfang gelten dieses
Dokument und [MONETIZATION.md](MONETIZATION.md).

Offizielle Quellen zuletzt geprüft am **5. Oktober 2026**. Store-Vorgaben vor tatsächlicher
Einreichung erneut prüfen; weder Name, Umsatz noch Review-Zulassung sind garantiert.
