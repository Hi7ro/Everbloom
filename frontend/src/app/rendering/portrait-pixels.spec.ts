import { describe, expect, it } from 'vitest';
import { portraitTransform, regionAlpha, tintChannel } from './portrait-pixels';

describe('portrait pixel contract', () => {
  it('keeps red hair, blue skin, white iris and green outfit masks distinct', () => {
    expect(regionAlpha(255, 0, 0, 'hair')).toBe(1);
    expect(regionAlpha(0, 0, 255, 'hair')).toBe(0);
    expect(regionAlpha(0, 0, 255, 'skin')).toBe(1);
    expect(regionAlpha(255, 255, 255, 'skin')).toBe(0);
    expect(regionAlpha(255, 255, 255, 'eyes')).toBe(1);
    expect(regionAlpha(0, 255, 0, 'eyes')).toBe(0);
    expect(regionAlpha(0, 255, 0, 'body')).toBe(1);
    expect(regionAlpha(255, 0, 0, 'body')).toBe(0);
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
