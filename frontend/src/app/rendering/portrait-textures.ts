import { BossDifficulty, BossId } from '../domain/boss-catalog';
import { BOSS_VISUALS, bossVisual } from './boss-visuals';
import { Container, Sprite, Texture } from 'pixi.js';
import { Appearance } from '../domain/models';
import { portraitLayers, PortraitLayer } from '../domain/character-rig';
import { ActorAdapter, createLayeredActor } from './actor-adapter';
import { createRegionAlpha, portraitTransform, tintChannel } from './portrait-pixels';

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

function maskedLayer(source: ImageBitmap, mask: ImageBitmap | undefined,
  layer: Pick<PortraitLayer, 'width' | 'height' | 'region' | 'clipX' | 'clipWidth' | 'tint' | 'eyeRegions'>,
): HTMLCanvasElement {
  const surface = canvas(layer.width, layer.height);
  const ctx = context(surface);
  if (mask) ctx.drawImage(mask, 0, 0, layer.width, layer.height);
  const region = mask ? ctx.getImageData(0, 0, layer.width, layer.height).data : undefined;
  ctx.clearRect(0, 0, layer.width, layer.height);
  ctx.drawImage(source, 0, 0, layer.width, layer.height);
  if (!mask && !layer.tint && !layer.eyeRegions) return surface; // Full-alpha body needs no pixel readback.
  const pixels = ctx.getImageData(0, 0, layer.width, layer.height);
  const regionAlpha = createRegionAlpha(layer.region);
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
        : region ? regionAlpha(region[i], region[i + 1], region[i + 2]) : 1;
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
  const bodyContext = context(bodyCanvas);
  bodyContext.scale(RASTER_SCALE, RASTER_SCALE);
  try {
    const layers = portraitLayers(appearance);
    if (!layers.length) throw new Error('Character modules are unavailable');
    for (const layer of layers) {
      const [source, mask] = await Promise.all([loader.load(layer.image), layer.mask ? loader.load(layer.mask) : undefined]);
      checkSignal(signal);
      const surface = maskedLayer(source, mask, layer);
      // Preserve the SVG painter order, including the collar over the neck. One shared
      // breathing surface keeps their attachment closed throughout the animation.
      bodyContext.save();
      bodyContext.transform(...portraitTransform(layer.transform));
      if (layer.sourceClip?.length) {
        bodyContext.beginPath();
        bodyContext.moveTo(layer.sourceClip[0].x, layer.sourceClip[0].y);
        for (const point of layer.sourceClip.slice(1)) bodyContext.lineTo(point.x, point.y);
        bodyContext.closePath();
        bodyContext.clip();
      }
      bodyContext.drawImage(surface, 0, 0);
      bodyContext.restore();
      surface.width = surface.height = 1;
    }
  } finally {
    loader.dispose();
  }
  checkSignal(signal);
  const view = new Container();
  const texture = Texture.from(bodyCanvas);
  const sprite = new Sprite(texture);
  sprite.width = 240;
  sprite.height = 300;
  sprite.pivot.set(texture.width / 2, texture.height * 280 / 300);
  // One composite preserves collar/neck attachment; its container owns the breathing scale.
  const body = new Container();
  body.addChild(sprite);
  view.addChild(body);
  return createLayeredActor({
    view, body, facing: 1,
    dispose: () => {
      texture.destroy(true);
      bodyCanvas.width = bodyCanvas.height = 1;
    },
  });
}

/** Boss art can later be replaced by a skeletal adapter with the same pose contract. */
export async function createBossActor(bossId: BossId, signal?: AbortSignal, difficulty: BossDifficulty = 'normal'): Promise<ActorAdapter> {
  const loader = bitmapLoader(signal);
  const surface = canvas(720, 720);
  try {
    const bitmap = await loader.load(bossVisual(bossId, difficulty).image);
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
    view, body, facing: -1, attackStyle: BOSS_VISUALS[bossId].attack, attackColor: BOSS_VISUALS[bossId].glow,
    attackTier: bossId === 'mosswarden' ? 1 : bossId === 'emberwyrm' ? 2 : 3,
    dispose: () => {
      texture.destroy(true);
      surface.width = surface.height = 1;
    },
  });
}
