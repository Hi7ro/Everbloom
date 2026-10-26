// @vitest-environment jsdom
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Sprite } from 'pixi.js';
import { createAuraLayer } from './aura-layer';
import { AURA_VISUALS } from './aura-visuals';

// These tests inspect display resources and pose state; no WebGL renderer is created.
const canvasProbe = vi.hoisted(() => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null));
afterAll(() => canvasProbe.mockRestore());
afterEach(() => vi.unstubAllGlobals());
const fetchArt = vi.fn();
const decodeArt = vi.fn();
const decoded: (HTMLCanvasElement & { close: ReturnType<typeof vi.fn> })[] = [];
beforeEach(() => {
  decoded.length = 0;
  fetchArt.mockReset().mockResolvedValue({ ok: true, blob: async () => new Blob() });
  decodeArt.mockReset().mockImplementation(async () => {
    const image = Object.assign(document.createElement('canvas'), { close: vi.fn() });
    image.width = 480; image.height = 480;
    decoded.push(image);
    return image;
  });
  vi.stubGlobal('fetch', fetchArt);
  vi.stubGlobal('createImageBitmap', decodeArt);
});

describe('equipped painted battle aura', () => {
  it('uses exactly the shared portrait artwork and bounds for every selectable aura', async () => {
    for (const [id, visual] of Object.entries(AURA_VISUALS)) {
      const aura = await createAuraLayer(id);
      expect(aura.loaded).toBe(true);
      expect(fetchArt).toHaveBeenLastCalledWith(visual.artwork, { signal: undefined });
      expect(aura.view.children).toHaveLength(1);
      const sprite = aura.view.children[0] as Sprite;
      expect(sprite.x).toBe(visual.x + visual.width / 2 - 120);
      expect(sprite.y).toBe(visual.y + visual.height - 280);
      expect(sprite.width).toBeCloseTo(visual.width, 8);
      expect(sprite.height).toBeCloseTo(visual.height, 8);
      expect(sprite.alpha).toBe(visual.opacity);
      const texture = sprite.texture;
      aura.destroy(); aura.destroy(); aura.update(.1, true);
      expect(texture.destroyed).toBe(true);
      expect(decoded.at(-1)!.close).toHaveBeenCalledOnce();
      expect(aura.view.destroyed).toBe(true);
    }
  });

  it('does not fetch, render or invent a ring for none and unknown aura identifiers', async () => {
    for (const id of ['none', 'unknown', 'toString', '__proto__']) {
      const aura = await createAuraLayer(id);
      expect(aura.loaded).toBe(false);
      expect(aura.view.children).toHaveLength(0);
      aura.update(.1, true); aura.destroy();
    }
    expect(fetchArt).not.toHaveBeenCalled();
    expect(decodeArt).not.toHaveBeenCalled();
  });

  it('bounds motion and resets exactly to the shared still pose without allocating new resources', async () => {
    for (const id of ['sage', 'fire', 'stars', 'angel']) {
      const aura = await createAuraLayer(id);
      const visual = AURA_VISUALS[id];
      const sprite = aura.view.children[0] as Sprite;
      const texture = sprite.texture;
      const initial = { x: sprite.x, y: sprite.y, width: sprite.width, height: sprite.height, alpha: sprite.alpha };
      for (let index = 0; index < 100; index++) {
        aura.update(.1, true);
        expect(Math.abs(sprite.x - initial.x)).toBeLessThanOrEqual(.71);
        expect(Math.abs(sprite.y - initial.y)).toBeLessThanOrEqual(2.51);
        expect(sprite.width).toBeLessThanOrEqual(visual.width * 1.012 + .01);
        expect(sprite.alpha).toBeGreaterThanOrEqual(visual.opacity * .94 - .001);
        expect(sprite.alpha).toBeLessThanOrEqual(visual.opacity);
      }
      aura.update(Number.NaN, false);
      aura.update(100, false);
      expect({ x: sprite.x, y: sprite.y, width: sprite.width, height: sprite.height, alpha: sprite.alpha }).toEqual(initial);
      expect(sprite.texture).toBe(texture);
      expect(aura.view.children).toHaveLength(1);
      aura.destroy();
    }
  });

  it('lets the arena continue without a decorative aura when an image is unavailable', async () => {
    fetchArt.mockResolvedValueOnce({ ok: false });
    const missing = await createAuraLayer('fire');
    expect(missing.loaded).toBe(false); expect(missing.view.children).toHaveLength(0);
    expect(decodeArt).not.toHaveBeenCalled(); missing.destroy();
    decodeArt.mockRejectedValueOnce(new Error('Invalid image'));
    const malformed = await createAuraLayer('fire');
    expect(malformed.loaded).toBe(false); malformed.destroy();
  });

  it('releases a decoded image after cancellation or rejection of an oversized texture', async () => {
    const controller = new AbortController();
    const image = Object.assign(document.createElement('canvas'), { close: vi.fn() });
    image.width = 480; image.height = 480;
    decodeArt.mockImplementationOnce(async () => { controller.abort(); return image; });
    await expect(createAuraLayer('fire', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(image.close).toHaveBeenCalledOnce();
    const tooLarge = Object.assign(document.createElement('canvas'), { close: vi.fn() });
    tooLarge.width = 3000; tooLarge.height = 3000;
    decodeArt.mockResolvedValueOnce(tooLarge);
    const aura = await createAuraLayer('angel');
    expect(aura.loaded).toBe(false); expect(tooLarge.close).toHaveBeenCalledOnce();
    aura.destroy(); expect(tooLarge.close).toHaveBeenCalledOnce();
  });
});
