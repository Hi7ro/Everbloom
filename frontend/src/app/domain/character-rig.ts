import { Appearance } from './models';
import { ILLUSTRATED_CHARACTERS, resolveCharacterIllustration } from './character-illustrations';
import { CHARACTER_RIGS } from './character-rigs.generated';

export interface SpriteRig {
  id: string;
  width: number;
  height: number;
  divider: number;
  body: { neckX: number; neckY: number; footY: number };
  eyes: { left: { x: number; y: number }; right: { x: number; y: number } };
}
export type SpriteRegion = 'all' | 'body' | 'face' | 'hair' | 'skin' | 'eyes';
export interface PortraitLayer {
  key: string;
  group: 'body' | 'head';
  region: SpriteRegion;
  image: string;
  mask: string;
  width: number;
  height: number;
  clipX: number;
  clipWidth: number;
  transform: string;
  tint?: string;
}

/** Coefficients extract alpha from authored RGB region maps, never from the painted artwork. */
export const REGION_ALPHA: Record<SpriteRegion, string> = {
  all: '1 1 1 0 0',
  body: '0 1 1 0 0',
  face: '0 1 1 0 0',
  hair: '1 -1 0 0 0',
  skin: '-1 -1 1 0 0',
  eyes: '1 1 1 0 -2',
};

export function headTransform(rig: SpriteRig): string {
  // Two eye anchors preserve the three-quarter angle while aligning all hairstyles.
  const dx = rig.eyes.right.x - rig.eyes.left.x;
  const dy = rig.eyes.right.y - rig.eyes.left.y;
  const lengthSquared = dx * dx + dy * dy;
  const a = (47 * dx + 6 * dy) / lengthSquared;
  const b = (6 * dx - 47 * dy) / lengthSquared;
  const e = 105 - a * rig.eyes.left.x + b * rig.eyes.left.y;
  const f = 102 - b * rig.eyes.left.x - a * rig.eyes.left.y;
  return `matrix(${a} ${b} ${-b} ${a} ${e} ${f})`;
}

function bodyTransform(rig: SpriteRig): string {
  const scale = 137 / (rig.body.footY - rig.body.neckY);
  return `translate(${120 - rig.body.neckX * scale} ${143 - rig.body.neckY * scale}) scale(${scale})`;
}

export function portraitLayers(appearance: Appearance): PortraitLayer[] {
  const preset = resolveCharacterIllustration(appearance);
  const resolveModule = (value?: string) => ILLUSTRATED_CHARACTERS.find(
    item => item.id === value && item.presentation === preset.presentation,
  )?.id ?? preset.id;
  const hairId = resolveModule(appearance.illustratedHair);
  const outfitId = resolveModule(appearance.outfitSet);
  const rigs: Record<string, SpriteRig> = CHARACTER_RIGS;
  const presetRig = rigs[preset.id];
  const outfitRig = rigs[outfitId];
  const hairRig = rigs[hairId];
  if (!presetRig || !outfitRig || !hairRig) return [];
  const layers: PortraitLayer[] = [];
  function add(key: string, rig: SpriteRig, region: SpriteRegion, group: 'head' | 'body', tint?: string) {
    const isFaceBase = rig.id.startsWith('face-');
    layers.push({ key, group, region, tint,
      image: `/art/characters/${rig.id}${isFaceBase ? '' : '-sheet'}.png`,
      mask: `/art/characters/${rig.id}-layers.png`, width: rig.width, height: rig.height,
      clipX: group === 'body' || isFaceBase || region === 'hair' ? 0 : rig.divider,
      clipWidth: group === 'body' ? rig.divider : rig.width,
      transform: group === 'body' ? bodyTransform(rig) : headTransform(rig),
    });
  }
  add('outfit', outfitRig, 'body', 'body');
  if (appearance.skinTone) add('hands', outfitRig, 'skin', 'body', appearance.skinTone);
  if (hairId === preset.id) {
    add('head', presetRig, 'all', 'head');
  } else {
    // A painted bald underlay fills areas revealed by shorter bangs; the chosen face stays above it.
    const face = rigs[`face-${preset.presentation}`];
    add('scalp', face, 'all', 'head');
    if (appearance.skinTone) add('scalp-tone', face, 'skin', 'head', appearance.skinTone);
    add('face', presetRig, 'face', 'head');
  }
  if (appearance.skinTone) add('skin', presetRig, 'skin', 'head', appearance.skinTone);
  if (appearance.eyeColor) add('eyes', presetRig, 'eyes', 'head', appearance.eyeColor);
  if (hairId !== preset.id) add('hair', hairRig, 'hair', 'head');
  if (appearance.hairTint) add('hair-color', hairRig, 'hair', 'head', appearance.hairTint);
  return layers;
}

export function usesExactIllustration(appearance: Appearance): boolean {
  return resolveCharacterIllustration(appearance).imagePath.endsWith('-original.png') &&
    !appearance.illustratedHair && !appearance.outfitSet && !appearance.eyeColor &&
    !appearance.skinTone && !appearance.hairTint;
}
