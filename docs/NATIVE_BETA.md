# Native Beta · iOS und Android

Stand: 8. Oktober 2026. Das Repository enthält echte Capacitor-Plattformprojekte und einen
konfigurierbaren Transport für den Account-Server. Ein erfolgreicher Web-Build und `cap sync`
sind keine native Kompilierung und keine Geräteabnahme. Es wurde keine App hochgeladen.

## Bestand und Werkzeuge

| Bestandteil | Stand |
| --- | --- |
| Angular | 21.2.24, unveränderte Hauptversion |
| Capacitor Core / CLI / iOS / Android | 8.5.2, exakt im Lockfile |
| Native Plugins | App 8.1.2, Filesystem 8.1.4, Share 8.0.3 |
| App-ID | `com.everbloom.app`, vorläufig; vor Store-Anlage final bestätigen |
| Native Versionsnummer | 0.2.0, Build 2 |
| Plattformen | iOS 15+, Android API 24+; Android Compile-/Target-SDK 36 |
| Web-Inhalt | `frontend/dist/everbloom/browser`, lokal gebündelt |

Capacitor 8 benötigt Node 22+, Xcode 26+ und Android Studio 2025.2.1+.
Das Projekt setzt Node `^22.12.0 || >=24.0.0` voraus. Die Einrichtung wurde mit dem bereits
installierten Node 24.21.0 ausgeführt. Lokal ist auch Node 20 vorhanden; dieses reicht für die
neue Capacitor-CLI nicht. Für Android ist JDK 21 die dokumentierte Projektbasis.
[Offizielle Systemanforderungen](https://capacitorjs.com/docs/getting-started/environment-setup).

Auf diesem Mac eingerichtet und am 4. Oktober 2026 geprüft:

| Werkzeug | Lokaler Stand |
| --- | --- |
| Xcode | 26.6, Build 17F113, `/Applications/Xcode.app`; First-Launch-Einrichtung abgeschlossen |
| Android Studio | 2026.2, `/Applications/Android Studio.app` |
| Android SDK | `~/Library/Android/sdk`; Platform API 36, Build Tools 36.0.0, Platform Tools und Emulator |
| Java für Android | Amazon Corretto 21, über `/usr/libexec/java_home -v 21` gefunden |
| Android-Testgerät | `Everbloom_Pixel_API36`, arm64-Systemimage für API 36 |
| iOS-Simulator-Runtime | iOS 26.5 (23F77), arm64, installiert und verfügbar |

Die globale Xcode-Auswahl zeigt weiterhin auf die Command Line Tools. Der Projekt-Starthelfer
setzt für iOS ausschließlich innerhalb seines Prozesses
`DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`; er verändert keine globale Einstellung.
Android-Builds verwenden ebenso nur lokal Java 21 und das konfigurierte SDK. Signing-Team,
Provisioning, Android-Uploadschlüssel und Store-Konten sind weiterhin nicht eingerichtet.

## App bauen und synchronisieren

Im Ordner `frontend`, mit Node 24 als aktivem Node:

```sh
npm ci
EVERBLOOM_API_ORIGIN='https://DEIN-TATSAECHLICHER-HOST' npm run native:sync
npm run native:ios
# oder
npm run native:android
```

Der Host ist ein Platzhalter und muss durch das tatsächlich eingerichtete HTTPS-Backend ersetzt
werden. Backend, PostgreSQL, SMTP und HTTPS-Betrieb stehen in [BETA_OPERATIONS.md](BETA_OPERATIONS.md).
`native:sync` erstellt den Produktions-Web-Build, validiert `EVERBLOOM_API_ORIGIN`, schreibt die
öffentliche Zieladresse in dessen `runtime-config.json` und synchronisiert beide Plattformen.
Die URL darf keinen Pfad, Query, Fragment oder Zugangsdaten enthalten. Keine Secrets gehören in
diese Datei. Die Quell-Datei `public/runtime-config.json` bleibt absichtlich unkonfiguriert:

```json
{ "schemaVersion": 1, "nativeApiOrigin": null }
```

Ohne Backend lässt `npm run native:sync:demo` die App-Shell und öffentliche Vorschau bundeln.
Account-Anfragen scheitern in diesem Build mit einer verständlichen Konfigurationsmeldung,
bevor Zugangsdaten gesendet werden. Das ist kein registrierbarer Beta-Release.
Ein späterer normaler Web-Build setzt die Build-Konfiguration wieder auf den Quellwert zurück;
deshalb vor jedem nativen Release erneut `native:sync` mit Zieladresse ausführen.

`capacitor.config.ts` hat keine Live-Reload-`server.url`, keine erlaubten fremden Navigationsziele
und keine HTTP-/Mixed-Content-Ausnahme. Web-Anfragen bleiben relativ zu `/api`; native
Account-/Game-Anfragen gehen an den gebündelten HTTPS-Origin. Das lokale WebView lädt seine
Bilder weiterhin lokal. Native Bridge Logging ist ausgeschaltet, damit Debug-Ausgaben keine
Account-Anfragekörper enthalten. Es gibt keine Store- oder Signing-Secrets im Repository.

## Native Builds ohne globale Umstellung

Aus dem Projektroot, nachdem der gewünschte Web-Stand synchronisiert wurde:

```sh
scripts/native-local.sh doctor
scripts/native-local.sh android-debug
scripts/native-local.sh ios-simulator
```

Der Doctor prüft die tatsächlichen lokalen Werkzeuge einschließlich Java, ADB, Android-Testgerät,
Xcode-Ersteinrichtung, installierter iOS-Runtimes und aktiver Node-Version. Für die Node-Prüfung
muss Node 22.12 oder neuer aus Version 22 beziehungsweise Node 24+ aktiv sein. `npm run native:doctor`
im Frontend bleibt ergänzend die Capacitor-Prüfung der Projektabhängigkeiten.

Die Build-Helfer führen bewusst **keinen** Web-Build und **keinen** `cap sync` aus. So werden
Zieladresse und gebündelter Inhalt nicht unbeabsichtigt ersetzt. Zuerst synchronisieren, dann
kompilieren. Ausgabeziele:

- Android-Debug-APK: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.
- iOS-Simulator-App: `.local/ios-derived-data/Build/Products/Debug-iphonesimulator/App.app`.

Die Android-Ausgabe ist eine lokal installierbare Debug-App. Die iOS-Ausgabe ist ausschließlich
für Simulatoren und wird mit `CODE_SIGNING_ALLOWED=NO` gebaut. Beide sind keine Store-Uploads.
Für ein echtes iPhone/iPad benötigt Xcode anschließend ein vom Betreiber gewähltes Team und
passendes Provisioning; für Play-Verteilung wird ein eigener Uploadschlüssel benötigt.

## Android-Release mit eigenem Uploadschlüssel

Die Release-Konfiguration ist optional und verändert den Debug-Build nicht. Ein Release benötigt
einen **bereits vorhandenen, vom Betreiber ausgewählten Uploadschlüssel außerhalb des Repositorys**.
Die Helfer erzeugen keinen Schlüssel, wählen keine Identität und laden keine App hoch. Für ein
Play-App-Bundle wird der Uploadschlüssel verwendet; die spätere Verteilung übernimmt Play App
Signing. [Android: App-Signierung](https://developer.android.com/studio/publish/app-signing).

Die folgenden Variablen gelten ausschließlich für den Build-Prozess:

| Variable | Inhalt |
| --- | --- |
| `HEROVERA_ANDROID_KEYSTORE` | Absoluter Pfad zur vorhandenen JKS-/PKCS12-Datei außerhalb dieses Repositorys |
| `HEROVERA_ANDROID_STORE_PASSWORD` | Passwort des Keystores |
| `HEROVERA_ANDROID_KEY_ALIAS` | Alias des privaten Uploadschlüssels |
| `HEROVERA_ANDROID_KEY_PASSWORD` | Passwort dieses privaten Schlüssels |
| `EVERBLOOM_API_ORIGIN` | Tatsächlich eingerichteter HTTPS-Origin für den nativen Account-Server |

Passwörter über die geschützte lokale Umgebung oder den Secret-Speicher der Build-Umgebung
bereitstellen. Nicht als Kommandozeilenargument, in Shell-Verlauf, `gradle.properties`, Git oder
Chat eintragen. Keystore und dessen Backup bleiben außerhalb des Projekts. Die neuen Variablen
ändern weder die vorhandenen internen IDs noch gespeicherte Daten. `com.everbloom.app` und
Version 0.2.0 / Build 2 bleiben unverändert; für spätere Store-Uploads muss die Versionsnummer
jeweils bewusst abgestimmt werden.

Nach Bereitstellung der Variablen, aus dem Projektroot mit aktivem Node 24:

```sh
scripts/native-release-android.sh
```

Der Helfer prüft die Angaben und den privaten Schlüssel, baut die Web-App neu, bündelt den
angegebenen HTTPS-Origin, synchronisiert **Android** und ruft anschließend `:app:bundleRelease`
auf. Java 21 und Android SDK werden wie beim lokalen Debug-Helfer pro Prozess ausgewählt.
Ein dauerhafter Gradle-Daemon und der Konfigurationscache sind für diesen Ablauf ausgeschaltet.
Abschließend wird die JAR-Signatur des erzeugten Bundles geprüft. Ausgabe:
`frontend/android/app/build/outputs/bundle/release/app-release.aab`.
[Android: Kommandozeilen-Build](https://developer.android.com/build/building-cmdline).

Zur reinen Schlüsselprüfung ohne Web-Build, Signierung oder Paketierung:

```sh
cd frontend/android
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew --no-daemon --no-configuration-cache :app:validateReleaseSigning
```

Fehlende Variablen, ein nicht lesbarer oder im Repository liegender Keystore, falsche Passwörter,
ein fehlender privater Schlüssel und ein ungültiges Zertifikat brechen die Prüfung ab. Standard-
Debug-Dateiname, Debug-Alias und Android-Debug-Zertifikat sind ausgeschlossen. Die Prüfung hängt
auch an den direkten Release-Build-/Paketierungsaufgaben; es gibt keinen Rückfall auf die
Debug-Signatur oder ein still erfolgreiches unsigniertes Release. `assembleDebug` benötigt
weiterhin keine Release-Zugangsdaten. Injektionen über `android.injected.signing.*` werden
abgelehnt, damit sie die geprüfte Identität nicht überschreiben. Keine `--debug`-/Build-Scan-Logs
mit Signing-Secrets teilen.

**Abnahmegrenze:** Die Konfiguration und ihre Fehlerpfade können ohne Uploadschlüssel geprüft
werden. Ein erfolgreich signiertes AAB, das zu einem Play-Console-Eintrag passt, ist damit noch
nicht nachgewiesen. Der Uploadschlüssel, Play App Signing, ein funktionierendes öffentliches
Backend sowie Store- und Geräteabnahme bleiben erforderlich. Es wurde kein Schlüssel erzeugt
und kein Release signiert oder hochgeladen.

Lokal geprüft am 8. Oktober: elf Negativfälle einschließlich direkter Release-Paketierung,
ungültigem Keystore, Debug-Alias und HTTP-Origin wurden nachvollziehbar abgewiesen. Anschließend
war `assembleDebug` ohne Release-Variablen erfolgreich; alle 233 Webdateien des aktuellen
Produktionsbuilds stimmen bytegenau mit dem Debug-APK überein. Lokaler Nachweis:
`.local/android-release-signing-checks-2026-10-08.json`. Die erfolgreiche Prüfung eines echten
Uploadschlüssels und eines damit signierten AAB steht weiterhin aus.

## Sitzung, CSRF und Fehler

`ApiClient` nutzt im Browser Angular HttpClient mit Credentials, nativ die offiziellen direkten
`CapacitorHttp.request`-Methoden. Globales Patching von `fetch`, XHR oder `document.cookie` bleibt
aus. Der native Transport lässt keine Redirects zu. API-Pfade werden auf `/api/…` begrenzt.
Der Browser bleibt beim gleichen Origin; für diesen nativen Transport ist kein pauschales
Credential-CORS oder `SameSite=None` nötig. [Capacitor HTTP](https://capacitorjs.com/docs/apis/http).

Der Server setzt `EVERBLOOM_SESSION` als HttpOnly-/Secure-Cookie. Browser bzw. nativer Cookie-Store
verwalten es. Die Anwendung liest oder kopiert weder Sessioncookie noch Passwort in Local Storage,
Preferences, Exportdateien oder Logs. CSRF-Token kommen von `/api/auth/csrf`, werden ausschließlich
im Speicher gehalten und nach Accountwechsel oder 401/403 verworfen. Der CSRF-Header ist auch
bei nativen Schreibrequests nötig. Mehrere wartende Requests teilen eine CSRF-Abfrage.

Die installierte Android-Bridge entfernt beim Start Cookies ohne Ablaufdatum. Deshalb setzt
der Server eine explizite Cookie-Lebensdauer von 30 Minuten; zusätzlich gilt die serverseitige
Session-Prüfung. Das ist keine dauerhafte Anmeldung. Native Cookie-Persistenz, insbesondere
Kaltstart und Logout, muss auf beiden Betriebssystemen geprüft werden. iOS-WebView-Cookies und
native HTTP-Cookies sind kein austauschbarer Browserbeweis.
[Capacitor Cookie-Hinweise](https://capacitorjs.com/docs/apis/cookies).

Anfragen haben ein 20-Sekunden-Limit; Konfigurationsladen ein 5-Sekunden-Limit. Fehler werden als
`ApiError` geliefert. Es gibt keinen automatischen Retry für Schreibrequests. Ein Timeout beweist
nicht, dass der Server nichts gespeichert hat: besonders ein nativer Bridge-Request kann nach
dem UI-Timeout noch eintreffen. Daher erst Spielstand aktualisieren; eine Wiederholung derselben
Aktivität braucht dieselbe Request-ID. Server-Idempotenz bleibt die verbindliche Grenze.

## Native Oberfläche und Datenexport

`viewport-fit=cover` und die vorhandenen CSS-Safe-Areas werden durch Capacitor SystemBars ergänzt.
Android verwendet `EdgeToEdge` sowie `insetsHandling: native`, damit ältere WebViews nicht
zusätzlich falsche Safe-Area-Werte verwenden. Systemleisten bleiben sichtbar mit hellen Icons
auf dem dunklen App-Hintergrund. Beide Plattformen starten dunkel.

`NativeLifecycle` registriert Resume einmal und räumt Listener beim Abbau auf. Der App-Callback
entscheidet anhand des Auth-Zustands, ob der Spielstand aktualisiert werden darf. Android Zurück
geht in Unterseiten durch die Navigation zurück; ohne History zur geschützten Dashboard-Route.
Auf Dashboard/Anmeldung/Vorschau wird die App minimiert. Es wird kein Prozess hart beendet.
[App-Plugin](https://capacitorjs.com/docs/apis/app).

`AccountExport` liefert das originale JSON: im Web als temporären Blob-Download, nativ über
Filesystem `Directory.Cache` und das Share-Sheet. Die zufällig benannte Datei liegt ausschließlich
unter `account-exports/`; Androids FileProvider erlaubt nur diesen Cache-Unterordner. Nach Teilen,
Abbruch oder Fehler wird die Datei nach Möglichkeit gelöscht. Ein Betriebssystemabbruch oder
fehlgeschlagenes Löschen kann eine private Cache-Datei bis zur Bereinigung des Caches hinterlassen.
Der Nutzer entscheidet selbst, wohin er über das Systemdialogfeld exportiert. Android-Backup ist
deaktiviert; es werden keine Speicher-/Medienberechtigungen angefordert.
[Filesystem](https://capacitorjs.com/docs/apis/filesystem), [Share](https://capacitorjs.com/docs/apis/share).

Das iOS-Target enthält `PrivacyInfo.xcprivacy` mit der Filesystem-Dateizeitstempel-Kategorie und
Grund C617.1. Das ersetzt weder die Datenschutzinformationen zur serverseitigen Verarbeitung
noch die Store-Angaben. Das eigene neutrale Beta-Blattzeichen liegt als bearbeitbares SVG unter
`frontend/native-assets/beta-icon.svg`, als Android VectorDrawable und als opakes 1024×1024-PNG
im iOS-AppIcon-Set. Es ist bewusst ein Beta-Zeichen; finale Marketinggrafik/Store-Screenshots folgen.

## Verifiziert und noch offen

Am 4. Oktober geprüft: 45 fokussierte Transport-/Konfigurations-/Export-/Lifecycle-Tests, Angular-
Produktionsbuild, Asset-Copy und Plugin-Sync für beide Plattformen, passende Capacitor-Versionen
im Doctor, parsebare Xcode-/Plist-Dateien und `npm audit` ohne Befund. Der Doctor meldet die
Projektstruktur als passend, prüft aber hier kein Signing und ersetzt keinen nativen Build.
Der bestehende Pixi/CommonJS-Buildhinweis ist unabhängig von Capacitor.

Zusätzlich nativ geprüft: Android `assembleDebug` unter Java 21/API 36 erfolgreich, Debug-APK
auf `Everbloom_Pixel_API36` installiert und `com.everbloom.app/.MainActivity` kalt gestartet
(`Status: ok`, 919 ms). Der App-Prozess lief anschließend und der Android-Crashpuffer war leer.
Auch der iOS-Simulator-Build mit Xcode 26.6 und iOS-SDK/Runtime 26.5 ist erfolgreich
(`BUILD SUCCEEDED`, Debug, arm64, Signing deaktiviert). Die Ausgabe liegt in der oben genannten
`App.app`; Swift-Package-Abhängigkeiten wurden erfolgreich aufgelöst. Diese App wurde im
iPhone-17-Simulator installiert und als `com.everbloom.app` gestartet; der App-Prozess lief
anschließend weiter.

Der abschließende Web-Stand mit fünf Bossen, gemalten ausgerüsteten Auren, Haar-/Kragenfix,
Belohnungsfenster und unterschiedlichen Set-Stilen wurde erneut synchronisiert und auf beiden
Plattformen erfolgreich kompiliert. Es gibt weiterhin kein öffentliches HTTPS-Backend.
Die Toolchain-Tests beweisen native Kompilierung, Installation und Start auf beiden Simulatoren; die visuelle
Abnahme und echte Account-Flows auf beiden Plattformen bleiben separate Prüfungen.

Vor interner Verteilung auf echtem iPhone/iPad und Android-Handy/Tablet prüfen:

1. Registrierung, Verifikation, Login, Profil, Aktivität und erneutes Laden mit echtem HTTPS/SMTP.
2. Session nach Kaltstart; Hintergrund über die Sessionfrist hinaus; Logout/Reset/Löschen und
   anschließender Accountwechsel ohne alte private Daten oder gültiges altes Cookie.
3. Netzausfall und Timeout während Aktivität; keine doppelte XP-Buchung, keine stillen Retries.
4. Account-Export speichern und Teilen abbrechen; Cache-Bereinigung und Original-JSON prüfen.
5. Notch, Systemleisten, große Schrift, Bildschirmrotation, Tastatur, Zurück, VoiceOver/TalkBack.
6. Pixi-Renderer, Speicher bei wiederholten Routenwechseln, Audio-Unterbrechung und Reduced Motion.
7. Native Release-Kompilierung, Signing und Versionsnummern, anschließend erst interner Store-Test.

Universal Links/App Links, direkte E-Mail-Rückkehr in die App und Push sind nicht implementiert.
Verifikations-/Reset-Links öffnen aktuell die Webseiten des konfigurierten öffentlichen Hosts;
danach meldet sich der Nutzer in der App an. Kauf, Restore und servergeprüfte Bezahl-Entitlements
sind inzwischen implementiert. Offen sind die externe Store-/RevenueCat-Einrichtung und die
echte Kaufabnahme auf beiden Plattformen. Die lokale Membership-Vorschau bleibt ausdrücklich
ohne Kauf und darf keine Zahlungsbereitschaft als aktives Abo speichern.

### Abschließender Installationsnachweis · 0.2.0 / Build 2

Der finale Web-Stand wurde nach dem Haarmaskenfix und der expliziten Aura-/Figuren-Reihenfolge
neu gebaut, für beide Plattformen synchronisiert und nativ kompiliert. Beide Ergebnisse wurden
auf den lokalen Simulatoren **erneut installiert und gestartet**:

- Android: Installation `Success`, Kaltstart `Status: ok`, 1.033 ms; App-Prozess läuft,
  Paket meldet `versionCode=2`, `versionName=0.2.0`.
- iOS: Installation erfolgreich, `simctl launch` gibt den laufenden App-Prozess zurück;
  die gebaute Info.plist enthält Version 0.2.0 und Build 2.
- Beide Pakete enthalten die neuen Aura- und Set-Grafiken. `nativeApiOrigin` bleibt bei beiden
  `null`; dieser Installationsnachweis beweist deshalb weiterhin keinen nativen Account-Login.

Die für diesen Abschluss eigens wieder gestarteten Testgeräte wurden danach beendet.

### Aktualisierung am 5. Oktober 2026

Kontobindung und Aktivitätswiederaufnahme wurden erneut in beide nativen Projekte synchronisiert.
Android-Debug-APK und iOS-Simulator-App lassen sich erfolgreich bauen; ihre gebündelten Einstiege
entsprechen dem aktuellen Produktionsbuild. Version bleibt 0.2.0 / Build 2, noch kein verteilter
Store-Build. Diese Aktualisierung bestätigt die Erstellung der Artefakte; die neuen Online-Flüsse
wurden im Browser und gegen die lokale API geprüft, nicht erneut auf physischen Geräten oder in
Simulatoren. Detaillierte Abgrenzung in [VALIDATION.md](VALIDATION.md).
