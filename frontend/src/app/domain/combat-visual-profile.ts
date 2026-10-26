import { BALANCE, SKILLS } from './catalog';
import { GameSnapshot } from './models';
import { levelProgress } from './progression';

export type HeroAttackStyle = 'martial' | 'strength' | 'endurance' | 'arcane';
export type CombatVisualTier = 1 | 2 | 3;

export interface CombatVisualProfile {
  readonly style: HeroAttackStyle;
  readonly tier: CombatVisualTier;
  readonly abilityName: string;
  readonly skillId: string | null;
  readonly skillName: string | null;
}

export const COMBAT_VISUAL_TIER_REQUIREMENTS = {
  2: { characterLevel: 20, skillLevel: 10 },
  3: { characterLevel: 40, skillLevel: 20 },
} as const;

/** Explicit tie priority is independent of saved skill order and the current UI catalog order. */
const VISUAL_SKILLS: readonly { id: string; style: HeroAttackStyle }[] = [
  { id: 'boxing', style: 'martial' },
  { id: 'bjj', style: 'martial' },
  { id: 'calisthenics', style: 'strength' },
  { id: 'weightlifting', style: 'strength' },
  { id: 'running', style: 'endurance' },
  { id: 'swimming', style: 'endurance' },
  { id: 'programming', style: 'arcane' },
  { id: 'reading', style: 'arcane' },
  { id: 'languages', style: 'arcane' },
  { id: 'meditation', style: 'arcane' },
  { id: 'breathwork', style: 'arcane' },
  { id: 'recovery', style: 'arcane' },
  { id: 'healthy-cooking', style: 'arcane' },
  { id: 'music', style: 'arcane' },
];

const ABILITIES: Readonly<Record<HeroAttackStyle, readonly [string, string, string]>> = {
  martial: ['Fokuskombo', 'Wirbelkombo', 'Meteorserie'],
  strength: ['Krafthieb', 'Titanenhieb', 'Erdbebenstoß'],
  endurance: ['Windschritt', 'Sturmklinge', 'Orkanschlag'],
  arcane: ['Lichtimpuls', 'Runenstoß', 'Astralnova'],
};

function visualXp(value: number): number {
  return Number.isFinite(value) ? Math.min(10_000_000, Math.max(0, Math.floor(value))) : 0;
}

/**
 * Presentation only. This never changes damage, critical chance, healing, turns or rewards.
 * The strongest earned skill shapes the effect; character or skill levels increase its visual tier.
 */
export function deriveCombatVisualProfile(
  snapshot: Pick<GameSnapshot, 'character' | 'skills'>,
): CombatVisualProfile {
  let strongest: (typeof VISUAL_SKILLS)[number] | undefined;
  let strongestXp = 0;
  for (const candidate of VISUAL_SKILLS) {
    // Same duplicate policy as combat stats: the first canonical skill entry is used once.
    const xp = visualXp(snapshot.skills.find(skill => skill.skillId === candidate.id)?.totalXp ?? 0);
    if (xp > strongestXp) {
      strongest = candidate;
      strongestXp = xp;
    }
  }
  const characterLevel = levelProgress(visualXp(snapshot.character.totalXp)).level;
  const skillLevel = levelProgress(strongestXp, BALANCE.skillBase, BALANCE.skillStep).level;
  const tier: CombatVisualTier = characterLevel >= COMBAT_VISUAL_TIER_REQUIREMENTS[3].characterLevel ||
    skillLevel >= COMBAT_VISUAL_TIER_REQUIREMENTS[3].skillLevel ? 3 :
    characterLevel >= COMBAT_VISUAL_TIER_REQUIREMENTS[2].characterLevel ||
    skillLevel >= COMBAT_VISUAL_TIER_REQUIREMENTS[2].skillLevel ? 2 : 1;
  const style = strongest?.style ?? 'strength';
  return {
    style,
    tier,
    abilityName: ABILITIES[style][tier - 1],
    skillId: strongest?.id ?? null,
    skillName: SKILLS.find(skill => skill.id === strongest?.id)?.name ?? null,
  };
}
