/** Shared equipped artwork. Coordinates use the same 240 × 300 portrait space in SVG and Pixi. */
export interface AuraVisual {
  readonly artwork: string;
  readonly opacity: number;
  readonly tint?: string | number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly motion: 'drift' | 'rise' | 'pulse' | 'wings';
}

function aura(artwork: string, motion: AuraVisual['motion'], opacity = .8): AuraVisual {
  return { artwork, motion, opacity, x: 4, y: 2, width: 232, height: 290 };
}

/** Only the selected asset is loaded. No artwork means no aura; ownership stays in the domain. */
export const AURA_VISUALS: Readonly<Record<string, AuraVisual>> = {
  sage: aura('/art/auras/sage-equipped-v1.webp', 'drift', .82),
  rose: aura('/art/auras/rose-equipped-v1.webp', 'drift', .72),
  void: aura('/art/auras/void-equipped-v1.webp', 'rise', .84),
  aurora: aura('/art/auras/aurora-equipped-v1.webp', 'drift', .78),
  starlight: aura('/art/auras/starlight-equipped-v1.webp', 'pulse', .8),
  'moss-spirit': aura('/art/auras/moss-spirit-equipped-v1.webp', 'drift', .8),
  twilight: aura('/art/loot/twilight-mantle-v1.webp', 'pulse', .78),
  eclipse: aura('/art/loot/eclipse-guardian-v1.webp', 'wings', .72),
  bloodmoon: aura('/art/loot/ruby-orbit-v1.webp', 'pulse', .78),
  'crimson-crown': aura('/art/loot/crimson-corona-v1.webp', 'pulse', .76),
  'void-orbit': aura('/art/loot/abyss-orbit-v1.webp', 'pulse', .78),
  leviathan: aura('/art/loot/world-devourer-v1.webp', 'wings', .72),
  'dragon-oath': aura('/art/loot/dragon-oath-v1.webp', 'rise', .8),
  'primordial-wings': aura('/art/loot/primordial-wings-v1.webp', 'wings', .75),
  'relic-arsenal': aura('/art/loot/relic-arsenal-v1.webp', 'pulse', .8),
  'imperial-gate': aura('/art/loot/imperial-gate-v1.webp', 'pulse', .76),
  stars: aura('/art/loot/star-trail-v1.webp', 'pulse', .76),
  mystic: aura('/art/loot/frozen-runes-v1.webp', 'pulse', .62),
  chakra: aura('/art/loot/celestial-lotus-v1.webp', 'pulse', .68),
  demonic: aura('/art/loot/infernal-wings-v1.webp', 'wings', .72),
  light: aura('/art/loot/solar-corona-v1.webp', 'pulse', .68),
  energy: aura('/art/loot/glacial-current-v1.webp', 'rise', .8),
  angel: aura('/art/loot/celestial-wings-v1.webp', 'wings', .72),
  blossom: aura('/art/loot/eternal-blossom-v1.webp', 'drift', .68),
  fire: aura('/art/loot/wyrmfire-v1.webp', 'rise', .8),
  guardian: aura('/art/loot/ancient-guardian-v1.webp', 'wings', .63),
};
