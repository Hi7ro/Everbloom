# Plus · Angebot und Kaufvertrag der V1

Stand: 5. Oktober 2026. Die Store-Anbindung ist im Code implementiert; dieser Vertrag legt das
tatsächlich auszuliefernde Angebot fest. Externe Store-Konfiguration und Kaufabnahme stehen aus. Ein laufendes Abo oder ein erfolgreicher Store-Test
wurde dadurch noch nicht nachgewiesen. Freigabe-Gates stehen in [RELEASE_V1.md](RELEASE_V1.md).

## Ein einfaches Monatsangebot

Zielpreis für den Euro-Markt: **3,99 € pro Monat**. Der kaufbare Preis und die Währung kommen
aus dem jeweiligen Store-Produkt und werden vor dem Kauf angezeigt. Ein fester UI-Text darf
keinen abweichenden Store-Preis überdecken. Es gibt in V1 keinen zugesagten Jahresplan,
kostenlosen Probezeitraum oder zusätzlichen Währungsshop.

| Leistung | Free | Plus während aktiver Laufzeit |
| --- | --- | --- |
| Konto, Charakter, Aktivitätserfassung, vorhandene Skills, persönliche Tagesquests, Tagespflege, Wochenüberblick und Charakterfortschritt | Enthalten | Enthalten |
| Fünf Normal-Bosse auf Basislevel 10/20/30/40/50 einschließlich Wolkenkönig | Enthalten | Enthalten |
| Hard, Episch und Ultimate der ersten fünf Bosse | Nicht verfügbar, auch nicht als Probekampf | 15 zusätzliche Begegnungen |
| Bosse auf Basislevel 60/70/80/90/100 in allen vier Modi | Nicht verfügbar, auch nicht als Probekampf | 20 zusätzliche Begegnungen; Entdeckungs- und Levelvoraussetzungen bleiben bestehen |
| Charakter-XP aus tatsächlich erfassten Aktivitäten | Regulärer Wert | Zusätzlich `floor(Aktivitäts-XP / 10)`; Beispiel: 75 → 7 zusätzliche Charakter-XP |
| Skill-XP, Quest-Bonus und direkter Boss-Schaden | Reguläre Regeln | Gleiche Regeln; kein zusätzlicher Plus-Multiplikator |
| Bereits verdiente Cosmetics | Bleiben verfügbar | Bleiben nach Abo-Ablauf verfügbar und ausrüstbar |

Der Bosszugang umfasst damit **fünf Free- und 35 Plus-Begegnungen**, unverändert 40 insgesamt.
Skills, Aktivitäten, XP und Charakterlevel erhalten keine Abo-bedingte Obergrenze. Die 40
kosmetischen Erstbelohnungsfamilien bleiben unverändert; Besitz wird beim Abo-Ende nicht entzogen.
Live-Probekämpfe beachten dieselbe Grenze und umgehen sie nicht durch Abspielen oder Überspringen.
Nur die ausdrücklich lokale Billing-Testvorschau öffnet alle Modi ohne Kauf/Bonus und wird
als Testvorschau gekennzeichnet, nicht als gekauftes Plus.

„Bleiben verfügbar“ gilt für den bestehenden Account nach Abo-Ende. Bei ausdrücklich
gewünschter Kontolöschung wird dessen Spielstand gelöscht; daraus folgt kein ewiger
Speicheranspruch. XP-, Minuten- und Tagesgrenzen bleiben bestehen. Das Monatsangebot verkauft
Zugang zu den vorhandenen späteren Bossen und höheren Modi sowie einen moderaten Fortschrittsbonus.
Zukünftige Storys, soziale Systeme oder Sprachen werden erst nach Umsetzung Teil des Angebots.

## Kauf, Prüfung und Kontobindung

V1 verwendet auf iOS und Android die normalen Store-Käufe über das offizielle
`@revenuecat/purchases-capacitor`-SDK. RevenueCat vermittelt StoreKit/Google Play Billing;
das eigene Backend entscheidet über Spielberechtigungen. Im Browser wird kein Store-Kauf
simuliert. [RevenueCat: Capacitor](https://www.revenuecat.com/docs/getting-started/installation/capacitor).

Das bestätigte Konto muss vor Kauf oder Restore angemeldet sein. Das Backend liefert dessen
stabile App User ID. Keine E-Mail-Adresse, keine Client-Wunsch-ID und keine anonyme Kaufidentität
verwenden. Die Membership-Seite zeigt den echten monatlichen Store-Preis, Laufzeit,
automatische Verlängerung, Leistungsumfang sowie Verwaltung, Restore, Datenschutz und Bedingungen.
Ein abgebrochener oder ausstehender Kauf gewährt keine neuen Plus-Rechte. Google verlangt
Kaufprüfung vor Freischaltung und rechtzeitige Bestätigung abgeschlossener Käufe; auch bei
SDK-Nutzung muss der Sandbox-Test diese Verarbeitung nachweisen.
[Google: Kaufverarbeitung](https://developer.android.com/google/play/billing/integrate).

Öffentliche API-Verträge:

| Anfrage | Zweck |
| --- | --- |
| `GET /api/billing/membership` | Serverseitig bestimmter Status und öffentliche native Kaufkonfiguration des angemeldeten Kontos. |
| `POST /api/billing/refresh` mit `{}` | Erneute Provider-Prüfung nach Kauf, Restore oder Rückkehr; keine Übernahme eines vom Client behaupteten Plus-Flags. |

Statusfelder: `mode` (`preview`/`live`), `active`, `verifiedAt`, `expiresAt`, `willRenew`,
`store` (`app_store`/`play_store`/`null`), `managementUrl`, `characterXpBonusPercent`,
`advancedBosses` und `purchaseConfig`. Letzteres enthält ausschließlich `appUserId`,
`entitlementId`, `appleProductId`, `googleProductId`, `offeringId`, `appleApiKey`,
`googleApiKey` oder ist `null`.
Die SDK-Schlüssel sind öffentlich; Provider-Serverkey und Webhook-Authentifizierung sind geheim.
Preview ist kein bezahlter Status und darf keinen echten Checkout freischalten.

Ohne Internet wird kein Kauf als erfolgreich behauptet. Nach unklarem Ergebnis zuerst Status
erneut abgleichen; keine zweite Zahlung als automatische Fehlerbehandlung. Der tatsächliche
Serverzustand ist maßgeblich. Bereits gespeicherter kosmetischer Besitz hängt nicht vom gerade
erreichbaren Store ab.

## Einrichtung durch den Betreiber

Apple-/Google-Konten sind vorhanden; RevenueCat ist noch nicht bestätigt. Folgende Schritte
erfordern die jeweiligen Betreiber-Dashboards, keine Passwörter im Chat:

1. Finalen Namen und identische App-ID festlegen; je einen iOS- und Android-App-Eintrag anlegen.
   Verträge sowie Bank-/Steuerdaten in den Stores vervollständigen.
2. Bei Apple die monatliche automatisch verlängernde Subscription `everbloom_plus_monthly`
   anlegen. Bei Google Subscription `everbloom_plus` mit monatlichem Base Plan `monthly`
   anlegen und aktivieren; im SDK-/RevenueCat-Katalog entspricht das `everbloom_plus:monthly`.
   Das sind die vereinbarten Konfigurationswerte, noch keine vorhandenen Store-Produkte.
   Preise und verfügbare Länder bewusst setzen.
3. Ein RevenueCat-Projekt mit beiden Store-Apps verbinden. Apple-/Google-Zugangsdaten nur dort
   nach der jeweiligen Einrichtungsanleitung hinterlegen. Das Entitlement `everbloom_plus`
   erstellen und beide Store-Produkte damit verbinden.
4. Offering `default` mit einem Monthly-Package anlegen, beide passenden Produkte zuordnen und
   als aktuelles Offering einstellen. Die App kauft nur das erwartete Monatsprodukt.
   [RevenueCat: Produkte, Entitlements und Offerings](https://www.revenuecat.com/docs/offerings/products-overview).
5. Unter Project settings → General **Keep with original App User ID** wählen. Diese
   Betreiberentscheidung muss vor Verkauf bestätigt und in beiden Sandbox-Apps geprüft sein.
   Restore erfolgt ausdrücklich über die Nutzerschaltfläche und verlangt das ursprüngliche
   Konto; keine automatische Übertragung auf ein anderes Herovera-Konto.
6. Öffentliche SDK-Keys und geheime Backend-Konfiguration gemäß untenstehendem Vertrag setzen.
   RevenueCat-Webhook an `https://<öffentlicher-host>/api/billing/revenuecat/webhook` mit einem
   eigenen zufälligen Authorization-Wert einrichten.
   Der gleiche Wert gehört ausschließlich in die geschützte Backend-Konfiguration. Store-
   Serverbenachrichtigungen an RevenueCat ebenfalls nach dessen Dashboard-Anleitung verbinden.
   [RevenueCat: Webhooks](https://www.revenuecat.com/docs/integrations/webhooks).
7. Im Store-Testkonto kaufen, Status/Verlängerung/Ablauf beobachten, Webhook-Zustellung prüfen
   und auf einem zweiten Gerät mit demselben Spielkonto wiederherstellen. Erst danach verkaufen.

**Restore-Randfall:** Die gewählte Bindung kann auch einen erneuten Kauf über denselben
Apple-Beleg einem alten Spielkonto zuordnen. Vor Kontolöschung muss klar sein, dass das Store-Abo
nicht automatisch endet. Der Betreiber braucht einen dokumentierten Supportprozess für ein
gelöschtes ursprüngliches Kaufkonto, bevor Verkäufe freigegeben werden. Account-Recovery hat
bei verlorenem Zugang Vorrang; keine automatische Kontozusammenführung versprechen.
[RevenueCat: Restore-Verhalten](https://www.revenuecat.com/docs/projects/restore-behavior).
Eine Restore-Anfrage erfolgt nur nach Nutzeraktion, weil sie eine Store-Anmeldung auslösen kann.
[RevenueCat: Käufe wiederherstellen](https://www.revenuecat.com/docs/getting-started/restoring-purchases).

## Server- und Build-Konfiguration

Der Vertrag gehört zur Backend-Konfiguration und zu `deploy/.env.example`:

| Variable | Bedeutung |
| --- | --- |
| `EVERBLOOM_BILLING_MODE` | `preview` ist die ausdrücklich lokale Testvorschau aller Modi: kein XP-Bonus, kein Kauf und kein gekaufter Plus-Status. `live` prüft die Plus-Berechtigung und verlangt vollständige Provider-Konfiguration. |
| `REVENUECAT_SECRET_API_KEY` | Geheimer Server-API-Key, ausschließlich im Backend. |
| `REVENUECAT_WEBHOOK_AUTHORIZATION` | Eigener zufälliger Wert mit mindestens 32 Zeichen; exakt als Authorization-Header in RevenueCat hinterlegen. |
| `REVENUECAT_APPLE_API_KEY` | Öffentlicher iOS-SDK-Key mit `appl_`-Präfix. |
| `REVENUECAT_GOOGLE_API_KEY` | Öffentlicher Android-SDK-Key mit `goog_`-Präfix. |
| `REVENUECAT_ENTITLEMENT_ID` | `everbloom_plus`. |
| `REVENUECAT_APPLE_PRODUCT_ID` | `everbloom_plus_monthly`. |
| `REVENUECAT_GOOGLE_PRODUCT_ID` | `everbloom_plus:monthly` im Format `subscription:basePlan`. |
| `REVENUECAT_OFFERING_ID` | `default`. |
| `REVENUECAT_ALLOW_SANDBOX` | `false` für produktive Berechtigungen; `true` nur auf einer getrennten Testumgebung für Store-Sandbox-Nachweise. |

Produktive Werte gehören nach `deploy/.env` mit restriktiven Dateirechten oder in die
entsprechende geschützte Serverumgebung. Der Readiness-Checker liest die Datei, ohne ihren
Inhalt als Shellcode auszuführen. Der Webhook prüft den vereinbarten Authorization-Wert und
liest anschließend den Provider-Status neu; ein beliebiges Ereignis allein vergibt kein Plus.
Der native Build benötigt `EVERBLOOM_API_ORIGIN` mit der tatsächlichen öffentlichen HTTPS-Origin;
`frontend/scripts/configure-native.mjs` schreibt nur öffentliche Angaben ins gebündelte
`runtime-config.json`. Es gibt keine zusätzliche Kopie von Store-Serversecrets im Frontend.

## Kündigung, Ablauf und Löschung

Verwaltung führt zum Store, über den abgeschlossen wurde. Eine Kündigung beendet normalerweise
die nächste Verlängerung; der bestätigte Zugang bleibt bis zum bezahlten Ablauf bestehen.
Refund/Revocation und andere Store-Korrekturen werden gesondert berücksichtigt. Bei Ablauf
endet der neue Zugang zu höheren Modi und der XP-Bonus, nicht der Account und nicht sein
verdienter kosmetischer Besitz. [Google: transparente Abonnements](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en).

Die Kontolöschung bleibt unmittelbar möglich und darf keine erzwungene Supportanfrage werden.
Vorher Store-Abo-Verwaltung und den Unterschied zur Kündigung erklären. Abrechnungsdaten beim
Store/Provider und deren berechtigte Aufbewahrung werden in der tatsächlichen
Datenschutzerklärung behandelt.
[Apple: Kontolöschung](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion).

## Kosten und ehrliche Verkaufsdarstellung

RevenueCat nennt für den Pro-Plan unter 2.500 USD monatlich erfasstem Umsatz kostenfreie Nutzung,
oberhalb dieser Schwelle 1 % des gesamten erfassten Umsatzes, vor Store-Provisionen und Steuern.
Das ist eine zusätzliche Providerkalkulation, kein Nettoerlös und kein Ersatz für Store-Gebühren.
Aktuelle Konditionen vor Aktivierung im Betreiberkonto prüfen.
[RevenueCat: Abrechnung](https://www.revenuecat.com/docs/welcome/set-up-revenuecat/account-management).

Apple verlangt für automatisch verlängernde Abos fortlaufenden Nutzen und klare Angaben vor
dem Abschluss. Deshalb das verfügbare Angebot beschreiben und keine noch ungebaute Roadmap
verkaufen. Die tatsächliche Review-Entscheidung bleibt beim Store.
[Apple: App Review Guidelines, 3.1](https://developer.apple.com/app-store/review/guidelines/).

Offizielle Quellen zuletzt geprüft am **5. Oktober 2026**. Die technische Integration ist
getrennt von bezahltem Betrieb, Käufernachfrage und Store-Zulassung nachzuweisen.
