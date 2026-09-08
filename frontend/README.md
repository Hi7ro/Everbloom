# Everbloom · Angular Frontend

Lokaler M0/M1-Slice. Produkt und Regeln stehen in [../docs](../docs/PRODUCT_REQUIREMENTS.md).

## Start und Checks

```sh
npm ci
npm start
npm test -- --watch=false
npm run build
```

Dashboard: http://localhost:4200/dashboard. Creator: http://localhost:4200/character/create.
Build: `dist/everbloom/browser/`.
Ein SPA-Host muss unbekannte Pfade auf `index.html` zurückführen.

## Code lesen

- `src/app/domain`: Framework-unabhängige Typen, Katalog und Progression.
- `src/app/data`: asynchroner Repository-Vertrag, Memory-Mock und versionierter lokaler Profilspeicher.
- `src/app/state`: private Signals, abgeleitete Views, Commands und Fehlerbehandlung.
- `src/app/features/dashboard`: Standalone-Dashboard und Aktivitätsformular.
- `src/app/features/character-creator`: Name/Aussehen bearbeiten und sofortige Vorschau.
- `src/app/domain/character.ts`: Optionskatalog und reine Profilvalidierung.
- `src/app/domain/milestones.ts`: fachliche Übergänge erkennen, ohne Audio oder DOM.
- `src/app/state/progress-feedback.ts`: gebündelte Erfolgskarte und gespeicherte Einstellungen.
- `src/app/shared/chibi.ts`: modularer SVG-Prototyp mit Tiefenwirkung und optionaler Bewegung.
- `src/app/shared/character-portrait.ts`: unveränderte Originalillustration mit separater Hintergrundmaske oder frei gestaltbarer Chibi.
- `src/app/state/daily-care.store.ts`: freiwilliger Check-in mit lokalem Tageswechsel, getrennt von XP.
- `src/app/shared/celebration.ts` / `success-audio.ts`: Feuerwerk und eigener kurzer Web-Audio-Jingle.
- `src/styles/_tokens.scss`: zentrale Designwerte.

Standalone ist in Angular 21 der Default. Zoneless läuft ohne Zone.js. Router lädt das Dashboard
und den Creator bei Bedarf. TypeScript und Templates sind strict. Keine State- oder UI-Zusatzbibliothek.

Spielprogression bleibt flüchtig: Reload oder Demo-Reset laden den festen Beispieltagesstand.
Der Creator speichert nur Name und Appearance als validiertes Profil im lokalen Browser-Speicher
(Schemaversion 2 unter `everbloom.character.v2`); Demo-Reset erhält dieses Profil. Version 1
bleibt Legacy-Leseweg und wird mit technischem Default `male` und expliziter Haarzuordnung
migriert. Der Adapter versucht die normalisierten V2-Daten bereits beim Lesen zu speichern; bei
gesperrtem Speicher bleibt das Profil für die Sitzung nutzbar. Feedback-Einstellungen werden separat
gespeichert. Vorschauen erzeugen keine XP, Quests oder andere Spielmutationen. Server, Konten,
Subscriptions und ein gespeichertes Interessenprofil sind noch nicht implementiert.
Der Creator bietet eine rein visuelle männliche/weibliche Darstellung und je sechs eigene
Starterfrisuren. Geplante Level-/Boss-Auren sind nur ein Ausblick ohne Besitz-/Loot-Vergabe.

Zielsprachen für Endphase/M4: Deutsch, Englisch, Spanisch, Schweizerisch, Portugiesisch,
Chinesisch, Japanisch, Russisch und Koreanisch. Die aktuelle UI bleibt deutsch. Varianten für
Schweizerisch, Portugiesisch und Chinesisch sind offen; Texte jetzt auslagerbar halten, Formate/
Pluralregeln zentral planen, Fallback Deutsch und Sprachnamen ohne Flaggen verwenden.

Ton, Feuerwerk und Charakterbewegung sind separat steuerbar; reduzierte Bewegung wird
berücksichtigt. Level-/Interessenvarianten des Chibis sind visuelle Prototypen, keine 3D-Engine
oder Gameplay-Freischaltungen. Aktuelle Browser-/Testabnahme siehe [Validierung](../docs/VALIDATION.md).
