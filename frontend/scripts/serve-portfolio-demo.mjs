import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const output = fileURLToPath(new URL('../dist/portfolio-demo/browser/', import.meta.url));
const base = '/demos/herovera/';
const port = Number(process.env['HEROVERA_DEMO_PORT'] ?? 4392);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('Invalid HEROVERA_DEMO_PORT.');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};
await stat(resolve(output, 'index.html'));
createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method ?? '')) {
    response.writeHead(405);
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/' || pathname === '/demos/herovera') {
      response.writeHead(302, { Location: base });
      response.end();
      return;
    }
    if (!pathname.startsWith(base)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const relative = pathname.slice(base.length) || 'index.html';
    const file = resolve(output, relative);
    if (!file.startsWith(resolve(output) + sep) || !(await stat(file)).isFile())
      throw new Error('Not found');
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Herovera demo: http://127.0.0.1:${port}${base}`));
