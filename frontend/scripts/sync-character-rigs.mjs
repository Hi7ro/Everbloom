import { open, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = join(root, 'public/art/characters');
const output = join(root, 'src/app/domain/character-rigs.generated.ts');
const expectedCount = 14; // Twelve illustrated designs and two painted face underlays.

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function record(value, label) {
  requireValue(
    value && typeof value === 'object' && !Array.isArray(value),
    `${label}: Objekt erwartet.`,
  );
  return value;
}

function dimension(value, label) {
  requireValue(
    Number.isSafeInteger(value) && value > 0,
    `${label}: positive ganze Pixelzahl erwartet.`,
  );
  return value;
}

function coordinate(value, min, max, label) {
  requireValue(
    typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max,
    `${label}: endliche Koordinate zwischen ${min} und ${max} erwartet.`,
  );
  return value;
}

async function pngDimensions(filename) {
  const file = await open(join(assets, filename), 'r');
  try {
    const header = Buffer.alloc(24);
    const { bytesRead } = await file.read(header, 0, 24, 0);
    requireValue(
      bytesRead === 24 &&
        header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
        header.readUInt32BE(8) === 13 &&
        header.toString('ascii', 12, 16) === 'IHDR',
      `${filename}: gültiger PNG-Kopf erwartet.`,
    );
    return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
  } finally {
    await file.close();
  }
}

async function readRig(filename) {
  const id = filename.slice(0, -'-rig.json'.length);
  requireValue(
    /^[a-z]+(?:-[a-z]+)*$/.test(id),
    `${filename}: Dateiname muss eine kanonische Rig-ID enthalten.`,
  );
  const source = record(JSON.parse(await readFile(join(assets, filename), 'utf8')), id);
  const width = dimension(source.width, `${id}.width`);
  const height = dimension(source.height, `${id}.height`);
  const face = id === 'face-male' || id === 'face-female';
  const divider = coordinate(source.divider, 0, width, `${id}.divider`);
  requireValue(
    face ? divider === 0 : divider > 0 && divider < width,
    `${id}.divider: Figur und Kopf müssen korrekt getrennt sein.`,
  );
  const body = record(source.body, `${id}.body`);
  const neckX = coordinate(body.neckX, 0, face ? width : divider, `${id}.body.neckX`);
  const neckY = coordinate(body.neckY, 0, height, `${id}.body.neckY`);
  const footY = coordinate(body.footY, 0, height, `${id}.body.footY`);
  requireValue(footY > neckY, `${id}: Fußanker muss unter dem Halsanker liegen.`);
  const eyes = record(source.eyes, `${id}.eyes`);
  const eye = (side) => {
    const point = record(eyes[side], `${id}.eyes.${side}`);
    return {
      x: coordinate(point.x, divider, width, `${id}.eyes.${side}.x`),
      y: coordinate(point.y, 0, height, `${id}.eyes.${side}.y`),
    };
  };
  const left = eye('left');
  const right = eye('right');
  requireValue(right.x > left.x, `${id}: Augenanker müssen links und rechts getrennt liegen.`);
  // Filename is authoritative: older hand-authored JSON files may omit or contain a stale id.
  const rig = { id, width, height, divider, body: { neckX, neckY, footY }, eyes: { left, right } };
  if (source.iris !== undefined) {
    const iris = record(source.iris, `${id}.iris`);
    requireValue(
      Object.keys(iris).sort().join(',') === 'left,right',
      `${id}.iris: genau left und right erwartet.`,
    );
    const region = (side) => {
      const radii = record(iris[side], `${id}.iris.${side}`);
      const center = rig.eyes[side];
      const rx = coordinate(
        radii.rx,
        0,
        Math.min(center.x, width - center.x),
        `${id}.iris.${side}.rx`,
      );
      const ry = coordinate(
        radii.ry,
        0,
        Math.min(center.y, height - center.y),
        `${id}.iris.${side}.ry`,
      );
      requireValue(rx > 0 && ry > 0, `${id}.iris.${side}: positive Radien erwartet.`);
      return { rx, ry };
    };
    rig.iris = { left: region('left'), right: region('right') };
  }
  if (source.head !== undefined) {
    const head = record(source.head, `${id}.head`);
    rig.head = {
      neckX: coordinate(head.neckX, divider, width, `${id}.head.neckX`),
      neckY: coordinate(head.neckY, 0, height, `${id}.head.neckY`),
    };
  }
  if (source.maskWidth !== undefined)
    rig.maskWidth = dimension(source.maskWidth, `${id}.maskWidth`);
  if (source.maskHeight !== undefined)
    rig.maskHeight = dimension(source.maskHeight, `${id}.maskHeight`);
  const imageName = `${id}${face ? '' : '-sheet'}.png`;
  const maskName = `${id}-layers.png`;
  const imageSize = await pngDimensions(imageName);
  const maskSize = await pngDimensions(maskName);
  requireValue(
    imageSize.width === width && imageSize.height === height,
    `${imageName}: ${imageSize.width}×${imageSize.height} stimmt nicht mit ${width}×${height} im Rig überein.`,
  );
  requireValue(
    maskSize.width === (rig.maskWidth ?? width) && maskSize.height === (rig.maskHeight ?? height),
    `${maskName}: PNG-Größe stimmt nicht mit dem Rig überein; abweichende Maskengrößen in maskWidth/maskHeight angeben.`,
  );
  return [id, rig];
}

try {
  const filenames = (await readdir(assets, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('-rig.json'))
    .map((entry) => entry.name)
    .sort();
  requireValue(
    filenames.length === expectedCount,
    `Erwartet: ${expectedCount} Rig-JSONs, gefunden: ${filenames.length}.`,
  );
  for (const face of ['face-male-rig.json', 'face-female-rig.json'])
    requireValue(filenames.includes(face), `${face} fehlt.`);
  const entries = [];
  for (const filename of filenames) entries.push(await readRig(filename));
  const contents =
    '// Generated from public/art/characters/*-rig.json. Edit source anchors, then run npm run art:sync-rigs.\n' +
    `export const CHARACTER_RIGS = ${JSON.stringify(Object.fromEntries(entries), null, 2)};\n`;
  // Validate every source before touching the output; unchanged inputs produce identical bytes.
  const previous = await readFile(output, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (contents !== previous) await writeFile(output, contents, 'utf8');
  console.log(
    `${entries.length} Charakter-Rigs geprüft; ${contents === previous ? 'Ausgabe unverändert' : 'Definitionen aktualisiert'}.`,
  );
} catch (error) {
  console.error(
    `Charakter-Rigs nicht synchronisiert: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
