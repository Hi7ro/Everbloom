import { access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// This public value is bundled with the app. Never put credentials or secrets here.
const value = process.env.EVERBLOOM_API_ORIGIN;
if (!value) throw new Error('EVERBLOOM_API_ORIGIN fehlt. Für den nativen Beta-Build ist eine HTTPS-API-Adresse erforderlich.');
const url = new URL(value);
if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('EVERBLOOM_API_ORIGIN muss ein HTTPS-Origin ohne Pfad, Zugangsdaten oder Query sein.');
}
const webDir = new URL('../dist/everbloom/browser/', import.meta.url);
await access(new URL('index.html', webDir));
const target = new URL('runtime-config.json', webDir);
await writeFile(target, JSON.stringify({ schemaVersion: 1, nativeApiOrigin: url.origin }, null, 2) + '\n');
console.log(`Native API-Konfiguration geschrieben: ${fileURLToPath(target)}`);
