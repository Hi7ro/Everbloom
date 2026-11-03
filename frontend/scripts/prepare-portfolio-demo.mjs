import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const frontend = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(frontend, 'dist/portfolio-demo/browser');
const base = '/demos/herovera/';
const textExtensions = new Set(['.js', '.css', '.html', '.svg']);
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? files(join(directory, entry.name)) : join(directory, entry.name),
    ),
  );
  return nested.flat();
}
await access(join(output, 'index.html'));
let rewritten = 0;
for (const file of await files(output)) {
  if (!textExtensions.has(extname(file))) continue;
  const source = await readFile(file, 'utf8');
  // Only rewrite isolated build output; account/native source definitions stay unchanged.
  const prepared = source
    .replace(/(?<!\/demos\/herovera)\/art\//g, base + 'art/')
    .replace(/(?<!\/demos\/herovera\/#)\/dashboard#/g, base + '#/dashboard#')
    .replace(/(?<!\/demos\/herovera\/#)\/character\/create#/g, base + '#/character/create#');
  if (prepared !== source) {
    await writeFile(file, prepared);
    rewritten++;
  }
}
const manifest = {
  product: 'Herovera',
  mode: 'portfolio-demo',
  basePath: base,
  routes: ['#/dashboard', '#/demo', '#/character/create', '#/onboarding', '#/battle', '#/membership', '#/terms', '#/privacy', '#/support'],
  storage: 'tab-memory-only',
  examples: ['everyday', 'campaign', 'endgame'],
  backendApi: false,
  accountAccess: false,
  outputAllowlist: [
    'index.html',
    '*.js',
    '*.css',
    'art/**',
    'favicon.ico',
    '3rdpartylicenses.txt',
    'demo-manifest.json',
  ],
};
await writeFile(join(output, 'demo-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `Herovera demo ready: ${output}\nMount at ${base} (${rewritten} text artifacts adapted; hash routes require no SPA rewrite).`,
);
