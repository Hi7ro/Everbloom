import { createMockSnapshot } from '../data/mock-data';
import { defaultHairstyle } from './character';
import { ILLUSTRATED_CHARACTERS } from './character-illustrations';
import { CHARACTER_RIGS } from './character-rigs.generated';
import {
  headTransform,
  portraitLayers,
  REGION_ALPHA,
  SpriteRig,
  usesExactIllustration,
} from './character-rig';
import { Appearance } from './models';

const base = createMockSnapshot().character.appearance;
const rigs: Record<string, SpriteRig> = CHARACTER_RIGS;
const exactIds = ['emerald-knight', 'urban-ranger', 'moonblade', 'starweaver'];

function appearanceFor(id: string): Appearance {
  const preset = ILLUSTRATED_CHARACTERS.find((item) => item.id === id)!;
  return {
    ...base,
    presentation: preset.presentation,
    hair: defaultHairstyle(preset.presentation),
    illustration: id,
  };
}

describe('illustrated character rig composition', () => {
  it('supplies complete, nondegenerate rigs for all twelve designs and both face underlays', () => {
    expect(ILLUSTRATED_CHARACTERS).toHaveLength(12);
    expect(Object.keys(rigs).sort()).toEqual(
      [...ILLUSTRATED_CHARACTERS.map((item) => item.id), 'face-male', 'face-female'].sort(),
    );
    for (const [id, rig] of Object.entries(rigs)) {
      expect(rig.id).toBe(id);
      expect(rig.width).toBeGreaterThan(0);
      expect(rig.height).toBeGreaterThan(0);
      expect(rig.body.footY).toBeGreaterThan(rig.body.neckY);
      expect(rig.eyes.left).not.toEqual(rig.eyes.right);
      for (const eye of [rig.eyes.left, rig.eyes.right]) {
        expect(eye.x).toBeGreaterThanOrEqual(0);
        expect(eye.x).toBeLessThanOrEqual(rig.width);
        expect(eye.y).toBeGreaterThanOrEqual(0);
        expect(eye.y).toBeLessThanOrEqual(rig.height);
      }
      if (!id.startsWith('face-')) {
        expect(rig.divider).toBeGreaterThan(0);
        expect(rig.divider).toBeLessThan(rig.width);
      }
    }
  });

  it('aligns both painted eye anchors to the same three-quarter view without infinite transforms', () => {
    for (const rig of Object.values(rigs)) {
      const matrix = headTransform(rig);
      expect(matrix).not.toMatch(/NaN|Infinity/);
      const [a, b, c, d, e, f] = matrix.slice(7, -1).split(' ').map(Number);
      const apply = (point: { x: number; y: number }) => [
        a * point.x + c * point.y + e,
        b * point.x + d * point.y + f,
      ];
      const left = apply(rig.eyes.left);
      const right = apply(rig.eyes.right);
      expect(left[0]).toBeCloseTo(105, 8);
      expect(left[1]).toBeCloseTo(102, 8);
      expect(right[0]).toBeCloseTo(152, 8);
      expect(right[1]).toBeCloseTo(108, 8);
    }
  });

  it('keeps exactly the four approved originals while routing new designs and actual overrides through layers', () => {
    expect(
      ILLUSTRATED_CHARACTERS.filter((item) => usesExactIllustration(appearanceFor(item.id)))
        .map((item) => item.id)
        .sort(),
    ).toEqual(exactIds.sort());
    const original = appearanceFor('emerald-knight');
    for (const patch of [{ aura: 'rose' }, { artwork: 'custom' as const }])
      expect(usesExactIllustration({ ...original, ...patch })).toBe(true);
    for (const patch of [
      { illustratedHair: 'urban-ranger' },
      { outfitSet: 'forest-scout' },
      { eyeColor: '#5e92c7' },
      { skinTone: '#68442f' },
      { hairTint: '#d5dbe0' },
    ]) {
      expect(usesExactIllustration({ ...original, ...patch })).toBe(false);
    }
  });

  it('composes every same-presentation hair and outfit combination with the chosen face intact', () => {
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const own = ILLUSTRATED_CHARACTERS.filter(
        (item) => item.presentation === preset.presentation,
      );
      for (const hair of own)
        for (const outfit of own) {
          const appearance = {
            ...appearanceFor(preset.id),
            illustratedHair: hair.id,
            outfitSet: outfit.id,
          };
          const before = structuredClone(appearance);
          const layers = portraitLayers(appearance);
          expect(layers.map((layer) => layer.key)).toEqual(
            hair.id === preset.id ? ['outfit', 'head'] : ['outfit', 'scalp', 'face', 'hair'],
          );
          expect(layers.find((layer) => layer.key === 'outfit')).toMatchObject({
            group: 'body',
            region: 'body',
            image: `/art/characters/${outfit.id}-sheet.png`,
          });
          const face = layers.find(
            (layer) => layer.key === (hair.id === preset.id ? 'head' : 'face'),
          )!;
          expect(face.image).toBe(`/art/characters/${preset.id}-sheet.png`);
          if (hair.id !== preset.id) {
            expect(layers.find((layer) => layer.key === 'scalp')?.image).toBe(
              `/art/characters/face-${preset.presentation}.png`,
            );
            expect(layers.find((layer) => layer.key === 'hair')).toMatchObject({
              region: 'hair',
              image: `/art/characters/${hair.id}-sheet.png`,
            });
          }
          expect(new Set(layers.map((layer) => layer.key)).size).toBe(layers.length);
          for (const layer of layers) {
            expect(layer.transform).not.toMatch(/NaN|Infinity/);
            expect(layer.mask).toMatch(/-layers\.png$/);
            expect(layer.width).toBeGreaterThan(0);
            expect(layer.height).toBeGreaterThan(0);
            expect(layer.clipX).toBeGreaterThanOrEqual(0);
            expect(layer.clipWidth).toBeGreaterThan(0);
          }
          expect(appearance).toEqual(before);
        }
    }
  });

  it('adds color overlays only to their selected regions while keeping painted modules underneath', () => {
    const appearance = {
      ...appearanceFor('moonblade'),
      illustratedHair: 'rose-runner',
      outfitSet: 'dawn-priestess',
    };
    const baseLayers = portraitLayers(appearance);
    const tint = { skinTone: '#68442f', hairTint: '#d5dbe0', eyeColor: '#5e92c7' };
    const layers = portraitLayers({ ...appearance, ...tint });
    expect(layers.filter((layer) => !layer.tint)).toEqual(baseLayers);
    expect(
      layers.filter((layer) => layer.tint).map((layer) => [layer.key, layer.region, layer.tint]),
    ).toEqual([
      ['hands', 'skin', tint.skinTone],
      ['scalp-tone', 'skin', tint.skinTone],
      ['skin', 'skin', tint.skinTone],
      ['eyes', 'eyes', tint.eyeColor],
      ['hair-color', 'hair', tint.hairTint],
    ]);
    expect(layers.find((layer) => layer.key === 'hands')?.image).toBe(
      '/art/characters/dawn-priestess-sheet.png',
    );
    expect(layers.find((layer) => layer.key === 'skin')?.image).toBe(
      '/art/characters/moonblade-sheet.png',
    );
    expect(layers.find((layer) => layer.key === 'hair-color')?.image).toBe(
      '/art/characters/rose-runner-sheet.png',
    );
    expect(layers.findIndex((layer) => layer.key === 'skin')).toBeGreaterThan(
      layers.findIndex((layer) => layer.key === 'face'),
    );
    expect(layers.findIndex((layer) => layer.key === 'hair-color')).toBeGreaterThan(
      layers.findIndex((layer) => layer.key === 'hair'),
    );
  });

  it('uses two complete iris regions centered on the selected face anchors regardless of hair and outfit', () => {
    const originalRigs = structuredClone(rigs);
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const rig = rigs[preset.id];
      expect(rig.iris).toBeDefined();
      const other = ILLUSTRATED_CHARACTERS.find(
        (item) => item.presentation === preset.presentation && item.id !== preset.id,
      )!;
      const appearance = {
        ...appearanceFor(preset.id),
        illustratedHair: other.id,
        outfitSet: other.id,
        eyeColor: '#5e92c7',
      };
      const originalAppearance = structuredClone(appearance);
      const eyes = portraitLayers(appearance).find((layer) => layer.key === 'eyes')!;
      expect(eyes.image).toBe(`/art/characters/${preset.id}-sheet.png`);
      expect(eyes.eyeRegions).toEqual([
        { cx: rig.eyes.left.x, cy: rig.eyes.left.y, ...rig.iris!.left },
        { cx: rig.eyes.right.x, cy: rig.eyes.right.y, ...rig.iris!.right },
      ]);
      for (const region of eyes.eyeRegions!) {
        expect(region.rx).toBeGreaterThan(0);
        expect(region.ry).toBeGreaterThan(0);
        expect(region.cx - region.rx).toBeGreaterThanOrEqual(0);
        expect(region.cx + region.rx).toBeLessThanOrEqual(rig.width);
        expect(region.cy - region.ry).toBeGreaterThanOrEqual(0);
        expect(region.cy + region.ry).toBeLessThanOrEqual(rig.height);
      }
      expect(appearance).toEqual(originalAppearance);
    }
    expect(rigs).toEqual(originalRigs);
  });

  it('uses matching preset modules when untrusted module IDs are unknown or cross-presentation', () => {
    for (const id of ['missing', 'moonblade', 'https://example.org/hair.png']) {
      expect(
        portraitLayers({ ...appearanceFor('emerald-knight'), illustratedHair: id, outfitSet: id }),
      ).toEqual(portraitLayers(appearanceFor('emerald-knight')));
    }
  });

  it('extracts mask labels without tinting hair as skin or eyes as hair', () => {
    const alpha = (region: keyof typeof REGION_ALPHA, rgb: [number, number, number]) => {
      const [r, g, b, , offset] = REGION_ALPHA[region].split(' ').map(Number);
      return Math.max(0, Math.min(1, r * rgb[0] + g * rgb[1] + b * rgb[2] + offset));
    };
    expect(alpha('hair', [1, 0, 0])).toBe(1);
    expect(alpha('hair', [0, 0, 1])).toBe(0);
    expect(alpha('hair', [1, 1, 1])).toBe(0);
    expect(alpha('skin', [0, 0, 1])).toBe(1);
    expect(alpha('skin', [1, 0, 0])).toBe(0);
    expect(alpha('skin', [1, 1, 1])).toBe(0);
    expect(alpha('eyes', [1, 1, 1])).toBe(1);
    for (const pixel of [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ] as [number, number, number][])
      expect(alpha('eyes', pixel)).toBe(0);
  });
});
