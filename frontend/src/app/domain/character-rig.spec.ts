import { createMockSnapshot } from '../data/mock-data';
import { defaultHairstyle } from './character';
import { ILLUSTRATED_CHARACTERS } from './character-illustrations';
import { CHARACTER_RIGS } from './character-rigs.generated';
import { CHARACTER_OUTFITS } from './character-outfits';
import { headTransform, PORTRAIT_EYES, PORTRAIT_COLLAR_INSET, portraitLayers, REGION_ALPHA, SpriteRig } from './character-rig';
import { Appearance } from './models';

const base = createMockSnapshot().character.appearance;
const rigs: Record<string, SpriteRig> = CHARACTER_RIGS;

function appearanceFor(id: string): Appearance {
  const preset = ILLUSTRATED_CHARACTERS.find(item => item.id === id)!;
  return { ...base, presentation: preset.presentation, hair: defaultHairstyle(preset.presentation), illustration: id };
}
function applyHead(rig: SpriteRig, point: { x: number; y: number }) {
  const [a, b, c, d, e, f] = headTransform(rig).slice(7, -1).split(' ').map(Number);
  return { x: a * point.x + c * point.y + e, y: b * point.x + d * point.y + f };
}
function inside(points: readonly { x: number; y: number }[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

describe('complete illustrated head and outfit composition', () => {
  it('provides twelve complete authored heads and alpha outfits with valid eye and attachment anchors', () => {
    expect(ILLUSTRATED_CHARACTERS).toHaveLength(12);
    expect(Object.keys(CHARACTER_OUTFITS).sort()).toEqual(ILLUSTRATED_CHARACTERS.map(item => item.id).sort());
    for (const design of ILLUSTRATED_CHARACTERS) {
      const head = rigs[design.id], outfit = CHARACTER_OUTFITS[design.id];
      expect(head.head).toBeDefined(); expect(head.iris).toBeDefined();
      expect(head.divider).toBeGreaterThan(0); expect(head.divider).toBeLessThan(head.width);
      expect(head.eyes.left).not.toEqual(head.eyes.right);
      for (const eye of [head.eyes.left, head.eyes.right]) {
        expect(eye.x).toBeGreaterThan(head.divider); expect(eye.x).toBeLessThan(head.width);
        expect(eye.y).toBeGreaterThan(0); expect(eye.y).toBeLessThan(head.height);
      }
      expect(outfit.image).toBe(`/art/characters/${design.id}-body-v2.webp`);
      expect(outfit.footY).toBeGreaterThan(outfit.neckY); expect(outfit.footY).toBeLessThanOrEqual(outfit.height);
      expect(outfit.collarFront!.length).toBeGreaterThanOrEqual(3);
      const defaultLayers = portraitLayers(appearanceFor(design.id));
      expect(defaultLayers.find(layer => layer.key === 'head')!.image).toBe(`/art/characters/${design.id}-sheet.png`);
      expect(defaultLayers.filter(layer => layer.group === 'body').every(layer => !layer.mask && layer.region === 'all')).toBe(true);
    }
  });

  it('aligns the eyes of all twelve complete heads to the same three-quarter portrait anchors', () => {
    for (const design of ILLUSTRATED_CHARACTERS) {
      const rig = rigs[design.id];
      expect(headTransform(rig)).not.toMatch(/NaN|Infinity/);
      for (const side of ['left', 'right'] as const) {
        const eye = applyHead(rig, rig.eyes[side]);
        expect(eye.x).toBeCloseTo(PORTRAIT_EYES[side].x, 8);
        expect(eye.y).toBeCloseTo(PORTRAIT_EYES[side].y, 8);
      }
    }
  });

  it('uses exactly one complete selected head for every preset, hairstyle and outfit combination', () => {
    let combinations = 0;
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const compatible = ILLUSTRATED_CHARACTERS.filter(item => item.presentation === preset.presentation);
      for (const head of compatible) for (const outfit of compatible) {
        const appearance = { ...appearanceFor(preset.id), illustratedHair: head.id, outfitSet: outfit.id };
        const before = structuredClone(appearance);
        const layers = portraitLayers(appearance);
        expect(layers.map(layer => layer.key)).toEqual(['outfit', 'head', ...(rigs[head.id].head!.inset ? ['collar'] : [])]);
        expect(layers.find(layer => layer.key === 'outfit')).toMatchObject({
          image: `/art/characters/${outfit.id}-body-v2.webp`, group: 'body', region: 'all',
        });
        expect(layers.filter(layer => layer.group === 'head')).toHaveLength(1);
        expect(layers.find(layer => layer.key === 'head')).toMatchObject({
          image: `/art/characters/${head.id}-sheet.png`, mask: `/art/characters/${head.id}-layers.png`,
          region: 'all', transform: headTransform(rigs[head.id]),
          clipX: rigs[head.id].divider, clipWidth: rigs[head.id].width - rigs[head.id].divider,
        });
        for (const layer of layers) {
          expect(layer.transform).not.toMatch(/NaN|Infinity/);
          expect(layer).not.toHaveProperty('includedBy'); expect(layer).not.toHaveProperty('occludedBy');
          expect(layer).not.toHaveProperty('portraitClip');
          expect(layer.image).not.toMatch(/face-(male|female)/);
        }
        expect(appearance).toEqual(before);
        combinations++;
      }
    }
    expect(combinations).toBe(432);
  });

  it('attaches all 72 compatible bodies to the selected head rather than the original preset and keeps feet grounded', () => {
    expect(PORTRAIT_COLLAR_INSET).toBe(9);
    let combinations = 0;
    for (const head of ILLUSTRATED_CHARACTERS) {
      const compatible = ILLUSTRATED_CHARACTERS.filter(item => item.presentation === head.presentation);
      const preset = compatible.find(item => item.id !== head.id)!;
      const headRig = rigs[head.id], neck = headRig.head!;
      const tip = applyHead(headRig, { x: neck.neckX, y: neck.neckY });
      for (const outfit of compatible) {
        const layers = portraitLayers({ ...appearanceFor(preset.id), illustratedHair: head.id,
          outfitSet: outfit.id, skinTone: '#996442' });
        const body = layers.find(layer => layer.key === 'outfit')!;
        const [, tx, ty, scale] = /^translate\(([-\d.e]+) ([-\d.e]+)\) scale\(([-\d.e]+)\)$/.exec(body.transform)!.map(Number);
        const rig = CHARACTER_OUTFITS[outfit.id];
        expect(rig.neckX * scale + tx).toBeCloseTo(tip.x, 8);
        expect(tip.y - (rig.neckY * scale + ty)).toBeCloseTo(neck.inset ? 9 : 0, 8);
        expect(rig.footY * scale + ty).toBeCloseTo(280, 8);
        const painted = layers.find(layer => layer.key === 'head')!;
        expect(painted.sourceClip).toBeUndefined(); // Preserve the complete painted jaw.
        const collar = layers.find(layer => layer.key === 'collar');
        if (neck.inset) {
          expect(collar).toMatchObject({ transform: body.transform, image: body.image, sourceClip: rig.collarFront });
          expect(inside(collar!.sourceClip!, (tip.x - tx) / scale, (tip.y - ty) / scale)).toBe(true);
          expect(layers.indexOf(collar!)).toBeGreaterThan(layers.findIndex(layer => layer.key === 'skin'));
        } else expect(collar).toBeUndefined();
        combinations++;
      }
    }
    expect(combinations).toBe(72);
  });

  it('keeps colors optional and places all chosen color regions on the newly selected complete head', () => {
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const head = ILLUSTRATED_CHARACTERS.find(item => item.presentation === preset.presentation && item.id !== preset.id)!;
      const appearance = { ...appearanceFor(preset.id), illustratedHair: head.id };
      const plain = portraitLayers(appearance);
      expect(plain.filter(layer => layer.tint)).toEqual([]); // Painted defaults belong to the selected design.
      const colors = { skinTone: '#68442f', eyeColor: '#5e92c7', hairTint: '#d5dbe0' };
      const before = structuredClone(appearance);
      const colored = portraitLayers({ ...appearance, ...colors });
      expect(colored.filter(layer => !layer.tint)).toEqual(plain);
      expect(colored.filter(layer => layer.tint).map(layer => [layer.key, layer.region, layer.tint])).toEqual([
        ['skin', 'skin', colors.skinTone], ['eyes', 'eyes', colors.eyeColor], ['hair-color', 'hair', colors.hairTint],
      ]);
      for (const layer of colored.filter(item => item.group === 'head')) {
        expect(layer.image).toBe(`/art/characters/${head.id}-sheet.png`);
        expect(layer.mask).toBe(`/art/characters/${head.id}-layers.png`);
        expect(layer.transform).toBe(headTransform(rigs[head.id]));
      }
      expect(appearance).toEqual(before);
    }
  });

  it('uses the selected head iris anchors even when its preset and outfit come from different designs', () => {
    const original = structuredClone(rigs);
    for (const head of ILLUSTRATED_CHARACTERS) {
      const other = ILLUSTRATED_CHARACTERS.filter(item => item.presentation === head.presentation && item.id !== head.id);
      const appearance = { ...appearanceFor(other[0].id), illustratedHair: head.id, outfitSet: other[1].id, eyeColor: '#5e92c7' };
      const rig = rigs[head.id];
      const eyes = portraitLayers(appearance).find(layer => layer.key === 'eyes')!;
      expect(eyes.image).toBe(`/art/characters/${head.id}-sheet.png`);
      expect(eyes.eyeRegions).toEqual([
        { cx: rig.eyes.left.x, cy: rig.eyes.left.y, ...rig.iris!.left },
        { cx: rig.eyes.right.x, cy: rig.eyes.right.y, ...rig.iris!.right },
      ]);
      expect(eyes.tint).toBe('#5e92c7');
    }
    expect(rigs).toEqual(original);
  });

  it('resolves earned head and outfit families with the matching presentation and keeps their exclusive dyes', () => {
    for (const [preset, headId, outfitId] of [['emerald-knight', 'forest-scout', 'abyss-walker'], ['moonblade', 'starweaver', 'moonblade']]) {
      const appearance = { ...appearanceFor(preset), cosmeticHair: 'moss-crown', cosmeticOutfit: 'cinder-forged',
        hairTint: '#d5dbe0', skinTone: '#68442f', eyeColor: '#5e92c7' };
      const before = structuredClone(appearance);
      const layers = portraitLayers(appearance);
      expect(layers.find(layer => layer.key === 'head')!.image).toBe(`/art/characters/${headId}-sheet.png`);
      expect(layers.find(layer => layer.key === 'hair-color')).toMatchObject({ image: `/art/characters/${headId}-sheet.png`, tint: '#6fae96' });
      expect(layers.find(layer => layer.key === 'outfit')).toMatchObject({ image: `/art/characters/${outfitId}-body-v2.webp`, tint: '#cd7158' });
      const collar = layers.find(layer => layer.key === 'collar');
      if (collar) {
        expect(collar.tint).toBe('#cd7158'); expect(collar.mask).toBeUndefined();
        expect(layers.indexOf(collar)).toBeGreaterThan(layers.findIndex(layer => layer.key === 'eyes'));
        expect(layers.indexOf(collar)).toBeLessThan(layers.findIndex(layer => layer.key === 'hair-color'));
      }
      expect(appearance).toEqual(before);
    }
  });

  it('falls back independently for unknown or cross-presentation modules without borrowing an incompatible head', () => {
    for (const preset of ['emerald-knight', 'moonblade']) {
      const compatible = ILLUSTRATED_CHARACTERS.filter(item => item.presentation === appearanceFor(preset).presentation);
      const incompatible = ILLUSTRATED_CHARACTERS.find(item => item.presentation !== appearanceFor(preset).presentation)!.id;
      for (const invalid of ['missing', incompatible, 'https://example.org/hair.png']) {
        expect(portraitLayers({ ...appearanceFor(preset), illustratedHair: invalid, outfitSet: invalid }))
          .toEqual(portraitLayers(appearanceFor(preset)));
        expect(portraitLayers({ ...appearanceFor(preset), illustratedHair: compatible[1].id, outfitSet: invalid }))
          .toEqual(portraitLayers({ ...appearanceFor(preset), illustratedHair: compatible[1].id }));
      }
    }
  });

  it('rejects noisy hair from skin tint and keeps blue skin and white irises out of hair tint', () => {
    const alpha = (region: keyof typeof REGION_ALPHA, rgb: [number, number, number]) => {
      const [r, g, b, , offset] = REGION_ALPHA[region].split(' ').map(Number);
      return Math.max(0, Math.min(1, (r * rgb[0] + g * rgb[1] + b * rgb[2]) / 255 + offset));
    };
    for (const rgb of [[253, 2, 1], [242, 1, 0], [252, 2, 1]] as [number, number, number][]) {
      expect(alpha('skin', rgb)).toBe(0);
      expect(alpha('hair', rgb)).toBeGreaterThan(.94);
    }
    expect(alpha('hair', [27, 4, 230])).toBe(0);
    expect(alpha('skin', [27, 4, 230])).toBeGreaterThan(.75);
    expect(alpha('hair', [255, 255, 255])).toBe(0);
    expect(alpha('skin', [255, 255, 255])).toBe(0);
    expect(alpha('eyes', [255, 255, 255])).toBe(1);
  });
});
