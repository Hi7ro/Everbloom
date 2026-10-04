import { Container, Sprite, Texture } from 'pixi.js';
import { Appearance } from '../domain/models';
import { resolveCharacterIllustration } from '../domain/character-illustrations';
import { portraitLayers, PortraitLayer, REGION_ALPHA, usesExactIllustration } from '../domain/character-rig';
import { ActorAdapter, createLayeredActor } from './actor-adapter';
import { portraitTransform, tintChannel } from './portrait-pixels';

const RASTER_SCALE = 2;

function canvas(width: number, height: number): HTMLCanvasElement {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  return element;
}

function context(element: HTMLCanvasElement): CanvasRenderingContext2D {
  const result = element.getContext('2d', { willReadFrequently: true });
  if (!result) throw new Error('Character canvas is unavailable');
  return result;
}

function checkSignal(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Character loading was cancelled', 'AbortError');
}

/** Per-stage decode cache; every source bitmap is closed after rasterization. */
function bitmapLoader(signal?: AbortSignal) {
  const pending = new Map<string, Promise<ImageBitmap>>();
  const decoded = new Set<ImageBitmap>();
  let disposed = false;
  return {
    load(path: string): Promise<ImageBitmap> {
      const previous = pending.get(path);
      if (previous) return previous;
      const request = (async () => {
        checkSignal(signal);
        const response = await fetch(path, { signal });
        if (!response.ok) throw new Error(`Character artwork could not load (${response.status})`);
        const bitmap = await createImageBitmap(await response.blob());
        if (disposed || signal?.aborted) {
          bitmap.close();
          throw new DOMException('Character loading was cancelled', 'AbortError');
        }
        if (bitmap.width * bitmap.height > 16_777_216) {
          bitmap.close();
          throw new Error('Character artwork exceeds the texture budget');
        }
        decoded.add(bitmap);
        return bitmap;
      })();
      pending.set(path, request);
      return request;
    },
    dispose() {
      disposed = true;
      decoded.forEach(bitmap => bitmap.close());
      decoded.clear();
      pending.clear();
    },
  };
}

function maskedLayer(source: ImageBitmap, mask: ImageBitmap, layer: PortraitLayer): HTMLCanvasElement {
  const surface = canvas(layer.width, layer.height);
  const ctx = context(surface);
  ctx.drawImage(mask, 0, 0, layer.width, layer.height);
  const region = ctx.getImageData(0, 0, layer.width, layer.height).data;
  ctx.clearRect(0, 0, layer.width, layer.height);
  ctx.drawImage(source, 0, 0, layer.width, layer.height);
  const pixels = ctx.getImageData(0, 0, layer.width, layer.height);
  const [r, g, b, , offset] = REGION_ALPHA[layer.region].split(' ').map(Number);
  const tint = layer.tint ? [0, 1, 2].map(channel => {
    const color = Number.parseInt(layer.tint!.slice(channel * 2 + 1, channel * 2 + 3), 16) / 255;
    return Array.from({ length: 256 }, (_, light) => tintChannel(light / 255, color, layer.region === 'eyes'));
  }) : undefined;
  for (let y = 0; y < layer.height; y++) {
    for (let x = 0; x < layer.width; x++) {
      const i = (y * layer.width + x) * 4;
      if (x < layer.clipX || x >= layer.clipX + layer.clipWidth) {
        pixels.data[i + 3] = 0;
        continue;
      }
      const alpha = layer.eyeRegions
        ? (layer.eyeRegions.some(eye => ((x - eye.cx) / eye.rx) ** 2 + ((y - eye.cy) / eye.ry) ** 2 <= 1) ? 1 : 0)
        : Math.max(0, Math.min(1, (region[i] * r + region[i + 1] * g + region[i + 2] * b) / 255 + offset));
      pixels.data[i + 3] *= alpha;
      if (tint && alpha > 0) {
        const light = Math.round(pixels.data[i] * .2126 + pixels.data[i + 1] * .7152 + pixels.data[i + 2] * .0722);
        pixels.data[i] = tint[0][light];
        pixels.data[i + 1] = tint[1][light];
        pixels.data[i + 2] = tint[2][light];
      }
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return surface;
}

/** The source PNGs stay untouched. Canvas combines the already-authored region maps. */
export async function createHeroActor(appearance: Appearance, signal?: AbortSignal): Promise<ActorAdapter> {
  const loader = bitmapLoader(signal);
  const bodyCanvas = canvas(240 * RASTER_SCALE, 300 * RASTER_SCALE);
  const headCanvas = canvas(240 * RASTER_SCALE, 300 * RASTER_SCALE);
  const bodyContext = context(bodyCanvas);
  const headContext = context(headCanvas);
  bodyContext.scale(RASTER_SCALE, RASTER_SCALE);
  headContext.scale(RASTER_SCALE, RASTER_SCALE);
  let hasHead = false;
  try {
    if (usesExactIllustration(appearance)) {
      const preset = resolveCharacterIllustration(appearance);
      const [source, mask] = await Promise.all([loader.load(preset.imagePath), loader.load(preset.maskPath)]);
      checkSignal(signal);
      const surface = canvas(source.width, source.height);
      const ctx = context(surface);
      ctx.drawImage(mask, 0, 0, source.width, source.height);
      const alpha = ctx.getImageData(0, 0, source.width, source.height).data;
      ctx.clearRect(0, 0, source.width, source.height);
      ctx.drawImage(source, 0, 0);
      const pixels = ctx.getImageData(0, 0, source.width, source.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 3] *= (alpha[i] * .2126 + alpha[i + 1] * .7152 + alpha[i + 2] * .0722) / 255;
      }
      ctx.putImageData(pixels, 0, 0);
      bodyContext.drawImage(surface, 1, 22, 1224 * .195, 1285 * .195);
      surface.width = surface.height = 1;
    } else {
      const layers = portraitLayers(appearance);
      if (!layers.length) throw new Error('Character modules are unavailable');
      for (const layer of layers) {
        const [source, mask] = await Promise.all([loader.load(layer.image), loader.load(layer.mask)]);
        checkSignal(signal);
        const surface = maskedLayer(source, mask, layer);
        const ctx = layer.group === 'head' ? headContext : bodyContext;
        if (layer.group === 'head') hasHead = true;
        ctx.save();
        if (layer.key.startsWith('scalp')) {
          ctx.beginPath();
          ctx.rect(0, -50, 240, 202);
          ctx.clip();
        }
        ctx.transform(...portraitTransform(layer.transform));
        ctx.drawImage(surface, 0, 0);
        ctx.restore();
        surface.width = surface.height = 1;
      }
    }
  } finally {
    loader.dispose();
  }
  checkSignal(signal);
  const view = new Container();
  const textures: Texture[] = [];
  const addPart = (surface: HTMLCanvasElement) => {
    const texture = Texture.from(surface);
    textures.push(texture);
    const part = new Sprite(texture);
    part.width = 240;
    part.height = 300;
    part.pivot.set(texture.width / 2, texture.height * 280 / 300);
    // Separate scale-normalized container keeps breathing independent of texture resolution.
    const group = new Container();
    group.addChild(part);
    view.addChild(group);
    return group;
  };
  const body = addPart(bodyCanvas);
  const head = hasHead ? addPart(headCanvas) : undefined;
  return createLayeredActor({
    view, body, head, facing: 1,
    dispose: () => {
      textures.forEach(texture => texture.destroy(true));
      bodyCanvas.width = bodyCanvas.height = 1;
      headCanvas.width = headCanvas.height = 1;
    },
  });
}

/** Boss art can later be replaced by a skeletal adapter with the same pose contract. */
export async function createMosswardenActor(signal?: AbortSignal): Promise<ActorAdapter> {
  const loader = bitmapLoader(signal);
  const surface = canvas(720, 720);
  try {
    const bitmap = await loader.load('/art/bosses/mosswarden-v1.png');
    checkSignal(signal);
    const scale = Math.min(720 / bitmap.width, 720 / bitmap.height);
    context(surface).drawImage(bitmap, (720 - bitmap.width * scale) / 2,
      720 - bitmap.height * scale, bitmap.width * scale, bitmap.height * scale);
  } finally {
    loader.dispose();
  }
  checkSignal(signal);
  const texture = Texture.from(surface);
  const sprite = new Sprite(texture);
  sprite.anchor.set(.5, 1);
  sprite.width = 288;
  sprite.height = 288;
  const view = new Container();
  const body = new Container();
  body.addChild(sprite);
  view.addChild(body);
  return createLayeredActor({
    view, body, facing: -1,
    dispose: () => {
      texture.destroy(true);
      surface.width = surface.height = 1;
    },
  });
}
