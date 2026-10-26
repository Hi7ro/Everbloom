/** Full-alpha, fully clothed bodies. Face and hair remain independent authored modules. */
export interface OutfitRig {
  readonly image: string;
  readonly width: number;
  readonly height: number;
  /** Center of the front collar rim, where it meets the jaw (not the empty collar opening). */
  readonly neckX: number;
  readonly neckY: number;
  readonly footY: number;
  readonly collarFront?: readonly { x: number; y: number }[];
}

// Registration coordinates are calibrated to each exported body, never to its thumbnail.
export const CHARACTER_OUTFITS: Readonly<Record<string, OutfitRig>> = {
  'emerald-knight': { image: '/art/characters/emerald-knight-body-v2.webp', width: 700, height: 900,
    neckX: 405, neckY: 106, footY: 849, collarFront: [{ x: 343, y: 80 }, { x: 372, y: 97 }, { x: 405, y: 106 }, { x: 452, y: 111 }, { x: 465, y: 190 }, { x: 337, y: 190 }] },
  'urban-ranger': { image: '/art/characters/urban-ranger-body-v2.webp', width: 600, height: 900,
    neckX: 346, neckY: 123, footY: 852, collarFront: [{ x: 282, y: 100 }, { x: 312, y: 118 }, { x: 346, y: 123 }, { x: 377, y: 117 }, { x: 402, y: 198 }, { x: 280, y: 198 }] },
  'frost-scholar': { image: '/art/characters/frost-scholar-body-v2.webp', width: 600, height: 900,
    neckX: 326, neckY: 115, footY: 847, collarFront: [{ x: 276, y: 90 }, { x: 307, y: 109 }, { x: 326, y: 115 }, { x: 370, y: 113 }, { x: 391, y: 190 }, { x: 267, y: 190 }] },
  'ember-striker': { image: '/art/characters/ember-striker-body-v2.webp', width: 600, height: 900,
    neckX: 300, neckY: 103, footY: 843, collarFront: [{ x: 246, y: 84 }, { x: 272, y: 98 }, { x: 300, y: 103 }, { x: 344, y: 100 }, { x: 365, y: 178 }, { x: 238, y: 178 }] },
  'forest-scout': { image: '/art/characters/forest-scout-body-v2.webp', width: 600, height: 900,
    neckX: 333, neckY: 119, footY: 866, collarFront: [{ x: 272, y: 95 }, { x: 306, y: 109 }, { x: 333, y: 119 }, { x: 374, y: 119 }, { x: 395, y: 194 }, { x: 266, y: 194 }] },
  'abyss-walker': { image: '/art/characters/abyss-walker-body-v2.webp', width: 750, height: 900,
    neckX: 367, neckY: 84, footY: 875, collarFront: [{ x: 311, y: 54 }, { x: 343, y: 74 }, { x: 367, y: 84 }, { x: 419, y: 97 }, { x: 434, y: 159 }, { x: 301, y: 159 }] },
  'moonblade': { image: '/art/characters/moonblade-body-v2.webp', width: 700, height: 900,
    neckX: 383, neckY: 181, footY: 793, collarFront: [{ x: 338, y: 164 }, { x: 353, y: 172 }, { x: 381, y: 181 }, { x: 411, y: 185 }, { x: 425, y: 179 }, { x: 421, y: 265 }, { x: 381, y: 269 }, { x: 338, y: 245 }] },
  'starweaver': { image: '/art/characters/starweaver-body-v2.webp', width: 700, height: 900,
    neckX: 351, neckY: 182, footY: 778, collarFront: [{ x: 306, y: 160 }, { x: 320, y: 171 }, { x: 348, y: 181 }, { x: 373, y: 185 }, { x: 390, y: 180 }, { x: 393, y: 258 }, { x: 352, y: 272 }, { x: 306, y: 237 }] },
  'dawn-priestess': { image: '/art/characters/dawn-priestess-body-v2.webp', width: 700, height: 900,
    neckX: 361, neckY: 140, footY: 792, collarFront: [{ x: 315, y: 123 }, { x: 332, y: 132 }, { x: 359, y: 139 }, { x: 384, y: 144 }, { x: 399, y: 137 }, { x: 397, y: 226 }, { x: 358, y: 226 }, { x: 317, y: 202 }] },
  'rose-runner': { image: '/art/characters/rose-runner-body-v2.webp', width: 700, height: 900,
    neckX: 355, neckY: 147, footY: 801, collarFront: [{ x: 318, y: 134 }, { x: 332, y: 141 }, { x: 355, y: 147 }, { x: 378, y: 150 }, { x: 390, y: 144 }, { x: 389, y: 225 }, { x: 355, y: 228 }, { x: 317, y: 216 }] },
  'void-sorceress': { image: '/art/characters/void-sorceress-body-v2.webp', width: 700, height: 900,
    neckX: 354, neckY: 160, footY: 796, collarFront: [{ x: 307, y: 139 }, { x: 320, y: 148 }, { x: 353, y: 160 }, { x: 383, y: 172 }, { x: 400, y: 153 }, { x: 396, y: 237 }, { x: 354, y: 241 }, { x: 310, y: 218 }] },
  'sky-ranger': { image: '/art/characters/sky-ranger-body-v2.webp', width: 700, height: 900,
    neckX: 390, neckY: 162, footY: 780, collarFront: [{ x: 369, y: 146 }, { x: 375, y: 155 }, { x: 391, y: 162 }, { x: 411, y: 167 }, { x: 424, y: 159 }, { x: 421, y: 243 }, { x: 391, y: 245 }, { x: 369, y: 231 }] },
};
