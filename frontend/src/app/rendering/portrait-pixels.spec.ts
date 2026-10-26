import { describe, expect, it } from 'vitest';
import { createRegionAlpha, portraitTransform, tintChannel } from './portrait-pixels';

describe('portrait pixel contract', () => {
  it('keeps red hair, blue skin, white iris and green outfit masks distinct', () => {
    const hair = createRegionAlpha('hair'), skin = createRegionAlpha('skin');
    const eyes = createRegionAlpha('eyes'), body = createRegionAlpha('body');
    expect(hair(255, 0, 0)).toBe(1);
    expect(hair(0, 0, 255)).toBe(0);
    expect(hair(128, 20, 10)).toBeCloseTo(98 / 255);
    expect(skin(0, 0, 255)).toBe(1);
    expect(skin(255, 255, 255)).toBe(0);
    expect(eyes(255, 255, 255)).toBe(1);
    expect(eyes(0, 255, 0)).toBe(0);
    expect(body(0, 255, 0)).toBe(1);
    expect(body(255, 0, 0)).toBe(0);
  });

  it('preserves head rotation and outfit anchoring from existing portrait transforms', () => {
    expect(portraitTransform('matrix(0.5 0.1 -0.1 0.5 105 -3)')).toEqual([.5, .1, -.1, .5, 105, -3]);
    expect(portraitTransform('translate(-18.5 22) scale(0.4)')).toEqual([.4, 0, 0, .4, -18.5, 22]);
    expect(() => portraitTransform('scale(Infinity)')).toThrow();
  });

  it('keeps iris highlights white and the chosen color at its middle stop', () => {
    expect(tintChannel(1, .4, true)).toBe(255);
    expect(tintChannel(.5, .4, true)).toBe(102);
    expect(tintChannel(0, .5, false)).toBe(20);
  });
});
