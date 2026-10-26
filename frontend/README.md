# Herovera · Angular Frontend

Lokaler M0/M1-Slice. Umfang und Spielregeln stehen in [Product Requirements](../docs/PRODUCT_REQUIREMENTS.md),
[Master Prompt](../docs/MASTER_PROMPT.md) und [Art Direction](../docs/ART_DIRECTION.md).

## Start und Checks

```sh
npm ci
npm start
npm test -- --watch=false
npm run build
```

Dashboard: http://localhost:4200/dashboard
Creator: http://localhost:4200/character/create
Onboarding: http://localhost:4200/onboarding

Build: `dist/everbloom/browser/`. Ein SPA-Host muss unbekannte Pfade auf `index.html` zurückführen.

## Code lesen

- `src/app/domain`: reine Typen, 14er-Skillkatalog, Balance und Progression.
- `src/app/data`: asynchroner Repository-Vertrag, lokaler Journal-Adapter und getrennte Speicheradapter.
- `src/app/state`: Signals, abgeleitete Views, Commands und Fehlerbehandlung.
- `src/app/features/dashboard`: Dashboard, Aktivitätsformular und freiwilliger Tages-Check-in.
- `src/app/features/character-creator`: illustrierte Vorlagen, Frisur-/Outfitwahl, Farben und Aura-Vorschau.
- `src/app/features/onboarding`: Interessen, Fokus-Skills und Zusammenfassung; Rückweg aus dem Creator.
- `src/app/features/auth` / `src/app/state/auth.store.ts`: mobile E-Mail-Registrierung, Session-Login,
  CSRF-Austausch und Logout; Passwörter bleiben ausschließlich im Request.
- `src/app/data/api-client.ts`: kleiner HTTP-/Fehlervertrag für den späteren servergebundenen Adapter.
- `src/app/domain/character.ts`: reine Profilvalidierung und Legacy-Kompatibilität.
- `src/app/domain/character-illustrations.ts`: zwölf Designs und Haut-/Augen-/Haarpaletten.
- `src/app/domain/character-rig.ts`: getrennte Körper-/Kopf-/Haarlayer, Ankertransformationen und Tönung.
- `src/app/domain/character-rigs.generated.ts`: zwölf Figuren-Rigs und zwei Basiskopf-Rigs.
- `src/app/shared/character-portrait.ts`: vier exakte Originalansichten oder modulare PNG-Komposition.
- `src/app/shared/character-aura.ts`: drei Starter-Effekte, drei erspielbare Auren und zehn weitere Vorschauentwürfe.
- `src/app/domain/journey.ts` / `src/app/state/journey.store.ts`: Interessen-/Fokusregeln und lokaler Zustand.
- `src/app/domain/aura-rewards.ts`: Belohnungsschwellen, einmalige Grants und Besitzprüfung.
- `src/app/domain/game-periods.ts`: lokale Tages-/Wochenwechsel ohne zusätzliche Rewards.
- `src/app/data/game-progress.storage.ts`: validiertes V1-Journal, Speichergrenzen und Fehlerstatus.
- `src/app/domain/milestones.ts`: fachliche Übergänge erkennen, ohne Audio oder DOM.
- `src/app/state/progress-feedback.ts`: gebündelte Erfolgskarte und gespeicherte Einstellungen.
- `src/app/state/daily-care.store.ts`: freiwilliger Check-in mit lokalem Tageswechsel, getrennt von XP.
- `src/app/shared/celebration.ts` / `success-audio.ts`: Feuerwerk und eigener kurzer Web-Audio-Jingle.
- `src/styles/_tokens.scss`: zentrale Designwerte.
- `public/art/characters`: Originale, modulare Sheets, semantische Masken und Rig-Metadaten.

Angular 21 verwendet Standalone Components, zoneless ohne Zone.js sowie strict TypeScript/Templates.
Der Router lädt Dashboard, Creator und Onboarding bei Bedarf. Keine zusätzliche State-, UI- oder
Animationsbibliothek wurde für diese Slices eingeführt.

## Lokaler Zustand und Grenzen

`everbloom.progress.v1` speichert ein versioniertes Aktivitätsjournal mit `startDay` und Commands
(`requestId`, `skillId`, `minutes`, `dayKey`). XP, Boss-HP und Aura-Besitz werden beim Laden aus dem
Beispielstart und akzeptierten Einträgen rekonstruiert; sie stehen nicht als vertrauenswürdige freie
Zahlen im Journal. Der Beispielstart bleibt Level 12. Das Journal ist auf 10.000 Einträge und 2 MiB
begrenzt. `game-periods.ts` setzt Dailies am nächsten lokalen Tag zurück und startet den Boss in
einer neuen Montag–Sonntag-Woche mit voller HP. Historie, XP und Aura-Besitz bleiben erhalten.

Der Creator speichert Name/Appearance getrennt als validiertes Profil unter `everbloom.character.v2`.
Ein bestätigter Reset ersetzt das Journal durch einen leeren Beispielstart für heute. Name, Figur
und Interessen bleiben erhalten; eine angelegte verdiente Aura wird auf „Keine“ gesetzt. Version 1 bleibt Legacy-Leseweg, wird explizit migriert und normalisiert.
Der Adapter versucht die V2-Daten bereits beim Legacy-Lesen zu speichern. Alte Appearance-Felder
sind keine weiterhin angebotenen Editor-Modi; die UI zeigt ausschließlich illustrierte Figuren.

`everbloom.journey.v1` speichert Interessen und 1–6 aktive Skills separat. Das dreistufige Onboarding
bietet sieben Interessenbereiche und den 14er-Katalog. Calisthenics, Running, Meditation und
Programming bleiben die Startauswahl; ihre bisherigen Balance-/Startwerte sind unverändert.
Zehn zusätzliche Skills starten mit 0 XP. Auswahlwechsel und Ausblenden löschen keinen Fortschritt.
Ein flüchtiger Onboarding-Entwurf erhält den Schritt beim Abstecher zum Creator.

Feedback-Einstellungen und freiwilliger Tages-Check-in haben eigene Speicherpfade. Der Fortschritts-
adapter meldet `saved`, `session`, `unavailable`, `corrupt`, `unsupported`, `limit` oder `clock`.
Blockierter Browser-Speicher lässt die Sitzung mit ehrlichem Hinweis nutzbar. Kaputte/fremde Journale
bleiben bis zu einem ausdrücklich bestätigten Reset unangetastet; Änderungen aus einem zweiten Tab
werden nicht still überschrieben. Journalgrenzen werden vor der Buchung geprüft. Bei ungültigem oder
zurückgestelltem Gerätedatum sind neue Einträge gesperrt. Diese lokalen Regeln ersetzen weder eine
vertrauenswürdige Serverzeit noch einen Schutz gegen manipulierte Aktivitäten. Vorschauen, Profil- und
Interessenänderungen erzeugen keine XP, Quests, Bossrewards oder Besitzrechte. Der erste Account-
Auth-Slice ist vorhanden; Game-API, Synchronisierung und servergespeicherte Spielprogression sind
noch nicht implementiert. Der lokale Mock bleibt bis zum vollständigen API-Vertrag aktiv.

## Illustrierter Creator

Zwölf Vorlagen bieten je sechs Frisuren und vollständige Outfitsets pro Darstellung. Frisur und
Kleidung werden unabhängig gewählt; Haut-/Augen-/Haarfarbe bieten jeweils Original plus sechs Farben.
Die vier ursprünglichen PNGs bleiben ohne Modul-/Farb-Overrides exakt. Anpassungen verwenden neu
erstellte Bildteile und sind keine pixelidentische Zerlegung dieser Originale. Basiskopf, Gesicht,
Haare und Körper werden mit Masken/Ankern ausgerichtet. Waffen und Accessoires gehören aktuell
zum Outfitset; einzelne Equipment-Slots und Item-Loot folgen später.

Originale zeigen geschlossene Ganzkörperatmung, modulare Kopf-/Körperlayer atmen gekoppelt. Ton,
Feuerwerk und Bewegung sind separat steuerbar; reduzierte Bewegung wird berücksichtigt. Drei
Starter-Effekte plus „Keine“ sind speicherbar. `aura-rewards.ts` vergibt Nordlicht beim Übertritt zu
Level 20, Sternenkranz bei Level 40 und Moosseele beim ersten belohnten Mooswächter-Sieg. Sammlung
und Creator prüfen `hasAuraAccess`; das Profil allein gewährt keine Aura. Ein neuer Grant wird als
Erfolg gefeiert, Journal-Replay und Reset nicht. Zehn erweiterte Auren, deren Farben und optionaler
bedrohlicher Schattenblick bleiben ungespeicherte Creator-Vorschauen. Der Blick verändert noch
nicht die echten Avataraugen.

Masken, Anker und sämtliche Kombinationen benötigen visuelle Abnahme. Der vorhandene Renderer
belegt keine fertige mobile Assetoptimierung, Gesten-/Mimikbibliothek oder native Store-Reife.
Aktuelle Ergebnisse und offene Prüfungen stehen in [Validierung](../docs/VALIDATION.md).

## Weitere Richtung

Zielsprachen für Endphase/M4: Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch,
Chinesisch, Japanisch, Russisch und Koreanisch. Die aktuelle UI bleibt deutsch. Varianten für
Schweizerisch, Portugiesisch und Chinesisch sind offen; Texte auslagerbar halten, Formate/
Pluralregeln zentral planen, Fallback Deutsch und Sprachnamen ohne Flaggen verwenden.

Spring Boot/PostgreSQL und serverautoritative Progression bleiben M1b-Arbeit; die Authentifizierung
ist als erster Backend-Slice begonnen. Capacitor-Gerätetests, native Funktionen und Store-Abnahme
folgen mit konkreten Plattformadaptern.
