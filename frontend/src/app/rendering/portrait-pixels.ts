import { SpriteRegion, REGION_ALPHA } from '../domain/character-rig';

/** Prepare each layer once; its per-pixel calculation matches the SVG channel equation. */
export function createRegionAlpha(region: SpriteRegion): (red: number, green: number, blue: number) => number {
  const [r, g, b, , offset] = REGION_ALPHA[region].split(' ').map(Number);
  return (red, green, blue) => Math.max(0, Math.min(1, (red * r + green * g + blue * b) / 255 + offset));
}

export function portraitTransform(transform: string): [number, number, number, number, number, number] {
  const matrix = /^matrix\(([^)]+)\)$/.exec(transform);
  if (matrix) {
    const values = matrix[1].trim().split(/[\s,]+/).map(Number);
    if (values.length === 6 && values.every(Number.isFinite)) {
      return values as [number, number, number, number, number, number];
    }
  }
  const translatedScale = /^translate\(([-\d.e]+) ([-\d.e]+)\) scale\(([-\d.e]+)\)$/.exec(transform);
  if (translatedScale) {
    const [, x, y, scale] = translatedScale.map(Number);
    if ([x, y, scale].every(Number.isFinite)) return [scale, 0, 0, scale, x, y];
  }
  throw new Error('Unsupported portrait transform');
}

/** SVG feComponentTransfer table interpolation, applied after grayscale. */
export function tintChannel(luminance: number, color: number, eyes: boolean): number {
  const table = eyes ? [0, color, 1] : [color * .16, color * .55, color, .5 + color * .5];
  const position = Math.max(0, Math.min(1, luminance)) * (table.length - 1);
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, table.length - 1);
  return Math.round((table[lower] + (table[upper] - table[lower]) * (position - lower)) * 255);
}
