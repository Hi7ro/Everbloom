import { Appearance } from './models';
import { ILLUSTRATED_CHARACTERS, resolveCharacterIllustration } from './character-illustrations';
import { CHARACTER_RIGS } from './character-rigs.generated';
import { bossCosmeticForAppearance } from './boss-loot';
import { CHARACTER_OUTFITS, OutfitRig } from './character-outfits';

export interface SpriteRig {
  id: string;
  width: number;
  height: number;
  divider: number;
  body: { neckX: number; neckY: number; footY: number; collarFront?: readonly RigPoint[] };
  /** Lower neck attachment in source pixels; inset tucks visible neck skin inside the collar. */
  head?: { neckX: number; neckY: number; inset: number };
  eyes: { left: { x: number; y: number }; right: { x: number; y: number } };
  iris?: { left: { rx: number; ry: number }; right: { rx: number; ry: number } };
}
export interface RigPoint { x: number; y: number }
export type SpriteRegion = 'all' | 'body' | 'clothing' | 'face' | 'hair' | 'skin' | 'eyes';
/** One complete authored head and its independently interchangeable outfit. */
export interface PortraitLayer {
  key: string;
  group: 'body' | 'head';
  image: string;
  region: SpriteRegion;
  /** Undefined means the body asset already supplies its complete alpha silhouette. */
  mask?: string;
  width: number;
  height: number;
  clipX: number;
  clipWidth: number;
  transform: string;
  /** Authored front lip of a collar in the outfit image's source coordinates. */
  sourceClip?: readonly RigPoint[];
  tint?: string;
  eyeRegions?: { cx: number; cy: number; rx: number; ry: number }[];
}

/**
 * Region maps contain compression/color noise, not exact RGB labels. Subtract competing
 * channels so red hair never survives in a face layer and blue skin never becomes hair.
 * Both SVG and Pixi consume these same coefficients; painted artwork stays untouched.
 */
export const REGION_ALPHA: Record<SpriteRegion, string> = {
  all: '1 1 1 0 0',
  body: '-1 1 1 0 0',
  clothing: '-1 1 -1 0 0',
  face: '-1 1 1 0 0',
  hair: '1 -1 -1 0 0',
  skin: '-1 -1 1 0 0',
  eyes: '1 1 1 0 -2',
};

export const PORTRAIT_HEAD_SCALE = .94;
/** Painted necks sit inside the front collar; neckless source faces keep their jaw attachment. */
export const PORTRAIT_COLLAR_INSET = 9;
export const PORTRAIT_EYES = {
  left: { x: 128.5 - 23.5 * PORTRAIT_HEAD_SCALE, y: 105 - 3 * PORTRAIT_HEAD_SCALE },
  right: { x: 128.5 + 23.5 * PORTRAIT_HEAD_SCALE, y: 105 + 3 * PORTRAIT_HEAD_SCALE },
} as const;

export function headTransform(rig: SpriteRig): string {
  // Two eye anchors preserve the three-quarter angle while aligning all hairstyles.
  const dx = rig.eyes.right.x - rig.eyes.left.x;
  const dy = rig.eyes.right.y - rig.eyes.left.y;
  const lengthSquared = dx * dx + dy * dy;
  const a = (47 * dx + 6 * dy) * PORTRAIT_HEAD_SCALE / lengthSquared;
  const b = (6 * dx - 47 * dy) * PORTRAIT_HEAD_SCALE / lengthSquared;
  const e = PORTRAIT_EYES.left.x - a * rig.eyes.left.x + b * rig.eyes.left.y;
  const f = PORTRAIT_EYES.left.y - b * rig.eyes.left.x - a * rig.eyes.left.y;
  return `matrix(${a} ${b} ${-b} ${a} ${e} ${f})`;
}

function bodyTransform(rig: OutfitRig, face: SpriteRig): string {
  const [a, b, c, d, e, f] = headTransform(face).slice(7, -1).split(' ').map(Number);
  const neck = face.head;
  const x = neck ? a * neck.neckX + c * neck.neckY + e : 120;
  const inset = neck?.inset ? PORTRAIT_COLLAR_INSET : 0;
  const y = neck ? b * neck.neckX + d * neck.neckY + f - inset : 143;
  // The front collar meets the jaw; raising the body hides its painted neck without clipping the chin.
  // Face/hair anchors stay unchanged and the outfit keeps its feet on the ground.
  const scale = (280 - y) / (rig.footY - rig.neckY);
  return `translate(${x - rig.neckX * scale} ${y - rig.neckY * scale}) scale(${scale})`;
}

export function portraitLayers(appearance: Appearance): PortraitLayer[] {
  const preset = resolveCharacterIllustration(appearance);
  const resolveModule = (value?: string) => ILLUSTRATED_CHARACTERS.find(
    item => item.id === value && item.presentation === preset.presentation,
  )?.id ?? preset.id;
  const hairReward = bossCosmeticForAppearance(appearance, 'hair');
  const outfitReward = bossCosmeticForAppearance(appearance, 'outfit');
  const hairId = resolveModule(hairReward?.modules?.[preset.presentation] ?? appearance.illustratedHair);
  const outfitId = resolveModule(outfitReward?.modules?.[preset.presentation] ?? appearance.outfitSet);
  const rigs: Record<string, SpriteRig> = CHARACTER_RIGS;
  const outfitRig = CHARACTER_OUTFITS[outfitId];
  const hairRig = rigs[hairId];
  if (!outfitRig || !hairRig) return [];
  const layers: PortraitLayer[] = [];
  function addHead(key: string, region: SpriteRegion, tint?: string) {
    layers.push({ key, group: 'head', region, tint,
      eyeRegions: region === 'eyes' && hairRig.iris ? (['left', 'right'] as const).map(side => ({
        cx: hairRig.eyes[side].x, cy: hairRig.eyes[side].y, ...hairRig.iris![side],
      })) : undefined,
      image: `/art/characters/${hairRig.id}-sheet.png`,
      mask: `/art/characters/${hairRig.id}-layers.png`, width: hairRig.width, height: hairRig.height,
      clipX: hairRig.divider, clipWidth: hairRig.width - hairRig.divider,
      transform: headTransform(hairRig),
    });
  }
  const outfitLayer: PortraitLayer = {
    key: 'outfit', group: 'body', region: 'all', image: outfitRig.image,
    width: outfitRig.width, height: outfitRig.height, clipX: 0, clipWidth: outfitRig.width,
    transform: bodyTransform(outfitRig, hairRig), tint: outfitReward?.tint,
  };
  layers.push(outfitLayer);
  // Keep eyes, ears, jaw and hairstyle from one drawing. Combining unrelated face
  // silhouettes creates missing temples or duplicate facial edges when hair changes.
  addHead('head', 'all');
  if (appearance.skinTone) addHead('skin', 'skin', appearance.skinTone);
  if (appearance.eyeColor) addHead('eyes', 'eyes', appearance.eyeColor);
  if (hairRig.head?.inset && outfitRig.collarFront) {
    layers.push({ ...outfitLayer, key: 'collar', sourceClip: outfitRig.collarFront });
  }
  const hairTint = hairReward?.tint ?? appearance.hairTint;
  if (hairTint) addHead('hair-color', 'hair', hairTint);
  return layers;
}
