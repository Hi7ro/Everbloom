# Everbloom · Angular Frontend

Lokaler M0/M1-Slice. Produkt und Regeln stehen in [../docs](../docs/PRODUCT_REQUIREMENTS.md).

## Start und Checks

```sh
npm ci
npm start
npm test -- --watch=false
npm run build
```

Dashboard: http://localhost:4200/dashboard. Build: `dist/everbloom/browser/`.
Ein SPA-Host muss unbekannte Pfade auf `index.html` zurückführen.

## Code lesen

- `src/app/domain`: Framework-unabhängige Typen, Katalog und Progression.
- `src/app/data`: asynchroner Repository-Vertrag und austauschbarer Memory-Mock.
- `src/app/state`: private Signals, abgeleitete Views, Commands und Fehlerbehandlung.
- `src/app/features/dashboard`: Standalone-Dashboard und Aktivitätsformular.
- `src/app/shared/chibi.ts`: bewusst einfacher SVG-Platzhalter mit Asset-Layer-Gruppen.
- `src/styles/_tokens.scss`: zentrale Designwerte.

Standalone ist in Angular 21 der Default. Zoneless läuft ohne Zone.js. Router lädt das Dashboard
bei Bedarf. TypeScript und Templates sind strict. Keine State- oder UI-Zusatzbibliothek.

Mock-Daten sind flüchtig: Reload oder Demo-Reset laden den festen Beispieltagesstand.
Creator, Server, Konten und Subscriptions sind noch nicht implementiert.
