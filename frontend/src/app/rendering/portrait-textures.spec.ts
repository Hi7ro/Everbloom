// @vitest-environment jsdom
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { createMockSnapshot } from '../data/mock-data';
import { portraitLayers } from '../domain/character-rig';
import { portraitTransform } from './portrait-pixels';
import { createHeroActor } from './portrait-textures';

// These tests exercise composition and resource ownership, without claiming a GPU/visual check.
const contexts = vi.hoisted(() => {
  const records: { element: HTMLCanvasElement; draws: unknown[][]; reads: number; clips: number; written?: number[];
    operations: { transform: number[]; image: unknown }[] }[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((function (this: HTMLCanvasElement) {
    const record: typeof records[number] = { element: this, draws: [], reads: 0, clips: 0, operations: [] };
    let matrix: number[] = [];
    const stack: number[][] = [];
    records.push(record);
    return {
      drawImage: (...args: unknown[]) => { record.draws.push(args); record.operations.push({ transform: [...matrix], image: args[0] }); },
      getImageData: (_x: number, _y: number, width: number, height: number) => {
        record.reads++;
        const data = new Uint8ClampedArray(width * height * 4).fill(255);
        const source = record.draws.at(-1)?.[0] as { path?: string } | undefined;
        if (source?.path?.endsWith('-layers.png')) data.set([255, 0, 0, 255, 0, 0, 255, 255]);
        if (source?.path?.endsWith('-body-v2.webp')) data.set([80, 120, 200, 0, 80, 120, 200, 123]);
        return { data };
      },
      clearRect() {}, putImageData: ({ data }: ImageData) => { record.written = [...data.slice(0, 8)]; }, scale() {},
      save() { stack.push([...matrix]); },
      restore() { matrix = stack.pop() ?? []; },
      transform(...values: number[]) { matrix = values; },
      beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() { record.clips++; }, fillRect() {},
      measureText: () => ({ width: 0 }),
    } as unknown as CanvasRenderingContext2D;
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  return records;
});

function artworkTransport(failedPath?: string) {
  const bitmaps: { path: string; width: number; height: number; close: ReturnType<typeof vi.fn> }[] = [];
  const requested: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (path: string) => {
    requested.push(path);
    return { ok: path !== failedPath, status: path === failedPath ? 503 : 200, blob: async () => ({ path }) };
  }));
  vi.stubGlobal('createImageBitmap', vi.fn(async ({ path }: { path: string }) => {
    const bitmap = { path, width: 600, height: 900, close: vi.fn() };
    bitmaps.push(bitmap);
    return bitmap;
  }));
  return { bitmaps, requested };
}

afterAll(() => vi.restoreAllMocks());
afterEach(() => { vi.unstubAllGlobals(); contexts.length = 0; });

describe('painted character canvas composition', () => {
  it('uses the new body alpha directly, reuses it for the collar and releases decoded art', async () => {
    const transport = artworkTransport();
    const appearance = { ...createMockSnapshot().character.appearance, illustration: 'emerald-knight' };
    const actor = await createHeroActor(appearance);
    expect(transport.requested).toEqual([
      '/art/characters/emerald-knight-body-v2.webp',
      '/art/characters/emerald-knight-sheet.png',
      '/art/characters/emerald-knight-layers.png',
    ]);
    const body = transport.bitmaps.find(item => item.path.endsWith('-body-v2.webp'))!;
    const surfaces = contexts.filter(item => item.draws.some(draw => draw[0] === body));
    expect(surfaces).toHaveLength(2); // Base body and its foreground collar.
    expect(surfaces.every(item => item.reads === 0)).toBe(true);
    expect(transport.bitmaps.every(item => item.close.mock.calls.length === 1)).toBe(true);
    actor.update(1.4, true);
    expect(actor.view.children.some(child => child.scale.y > 1)).toBe(true);
    actor.destroy();
    expect(actor.view.destroyed).toBe(true);
    expect(transport.bitmaps.every(item => item.close.mock.calls.length === 1)).toBe(true);
  });

  it('applies earned body dyes to the same alpha artwork while retaining the separate head', async () => {
    const transport = artworkTransport();
    const actor = await createHeroActor({ ...createMockSnapshot().character.appearance,
      illustration: 'emerald-knight', cosmeticOutfit: 'cinder-forged', skinTone: '#68442f' });
    expect(transport.requested.filter(path => path.endsWith('-body-v2.webp')))
      .toEqual(['/art/characters/abyss-walker-body-v2.webp']);
    expect(transport.requested).toContain('/art/characters/emerald-knight-sheet.png');
    expect(transport.requested).not.toContain('/art/characters/abyss-walker-layers.png');
    const body = transport.bitmaps.find(item => item.path.endsWith('-body-v2.webp'))!;
    const surfaces = contexts.filter(item => item.draws.some(draw => draw[0] === body));
    expect(surfaces.map(item => item.reads)).toEqual([1, 1]);
    for (const surface of surfaces) {
      expect(surface.written?.[3]).toBe(0);
      expect(surface.written?.[7]).toBe(123);
      expect(surface.written?.slice(4, 7)).not.toEqual([80, 120, 200]);
    }
    expect(transport.bitmaps.every(item => item.close.mock.calls.length === 1)).toBe(true);
    actor.destroy();
  });

  it('does not fetch or retain artwork for an already cancelled stage', async () => {
    const transport = artworkTransport();
    const controller = new AbortController(); controller.abort();
    await expect(createHeroActor(createMockSnapshot().character.appearance, controller.signal))
      .rejects.toMatchObject({ name: 'AbortError' });
    expect(transport.requested).toEqual([]);
    expect(transport.bitmaps).toEqual([]);
  });
  it('loads only the selected complete head and paints its colors and collar on one shared surface', async () => {
    const transport = artworkTransport();
    const appearance = { ...createMockSnapshot().character.appearance, illustration: 'emerald-knight',
      illustratedHair: 'ember-striker', skinTone: '#996442', eyeColor: '#5e92c7', hairTint: '#d5dbe0' };
    const layers = portraitLayers(appearance);
    const actor = await createHeroActor(appearance);
    expect(transport.requested).toEqual([
      '/art/characters/emerald-knight-body-v2.webp',
      '/art/characters/ember-striker-sheet.png',
      '/art/characters/ember-striker-layers.png',
    ]);
    const composite = contexts.find(record => record.element.width === 480 && record.element.height === 600)!;
    const paintedSources = composite.draws.map(draw => {
      const surface = contexts.find(record => record.element === draw[0])!;
      expect(surface.element.width).toBe(1); // Temporary source surface released after painting.
      return (surface.draws.at(-1)![0] as { path: string }).path;
    });
    expect(paintedSources).toEqual([
      '/art/characters/emerald-knight-body-v2.webp',
      '/art/characters/ember-striker-sheet.png',
      '/art/characters/ember-striker-sheet.png',
      '/art/characters/ember-striker-sheet.png',
      '/art/characters/emerald-knight-body-v2.webp',
      '/art/characters/ember-striker-sheet.png',
    ]);
    expect(composite.clips).toBe(1); // Only the authored foreground collar is clipped.
    expect(composite.operations.map(draw => draw.transform))
      .toEqual(layers.map(layer => portraitTransform(layer.transform)));
    expect(transport.bitmaps.every(bitmap => bitmap.close.mock.calls.length === 1)).toBe(true);
    actor.destroy();
    expect(composite.element.width).toBe(1);
  });

  it('releases decoded modules when the selected head mask cannot load', async () => {
    const transport = artworkTransport('/art/characters/ember-striker-layers.png');
    await expect(createHeroActor({ ...createMockSnapshot().character.appearance,
      illustration: 'emerald-knight', illustratedHair: 'ember-striker' }))
      .rejects.toThrow('Character artwork could not load (503)');
    expect(transport.requested).toEqual([
      '/art/characters/emerald-knight-body-v2.webp',
      '/art/characters/ember-striker-sheet.png',
      '/art/characters/ember-striker-layers.png',
    ]);
    expect(transport.bitmaps.length).toBeGreaterThan(0);
    expect(transport.bitmaps.every(bitmap => bitmap.close.mock.calls.length === 1)).toBe(true);
  });

});
