import { BALANCE } from './catalog';
import { BOSS_COSMETICS } from './boss-loot';
import { GameSnapshot } from './models';

export const STARTER_AURA_IDS = ['none', 'sage'] as const;

export interface AuraReward {
  readonly id: string;
  readonly label: string;
  readonly unlock:
    | { readonly kind: 'level'; readonly level: number }
    | { readonly kind: 'boss-drop'; readonly bossId: string; readonly bossName: string };
}

/** Earned cosmetics; advanced design previews are deliberately absent. */
export const AURA_REWARDS = [
  { id: 'rose', label: 'Rosenlicht', unlock: { kind: 'level', level: 5 } },
  { id: 'void', label: 'Schattenflamme', unlock: { kind: 'level', level: 10 } },
  { id: 'aurora', label: 'Nordlicht', unlock: { kind: 'level', level: 20 } },
  { id: 'starlight', label: 'Sternenkranz', unlock: { kind: 'level', level: 40 } },
  {
    id: 'moss-spirit',
    label: 'Moosseele',
    unlock: { kind: 'boss-drop', bossId: 'mosswarden', bossName: 'Der Mooswächter' },
  },
] as const satisfies readonly AuraReward[];

export function isKnownAura(auraId: string): boolean {
  return (
    STARTER_AURA_IDS.some((id) => id === auraId) ||
    AURA_REWARDS.some((reward) => reward.id === auraId) ||
    BOSS_COSMETICS.some((reward) => reward.auraId === auraId)
  );
}

/** Ownership, never level alone, permits equipping an earned aura. */
export function hasAuraAccess(
  snapshot: Pick<GameSnapshot, 'unlockedAuras'>,
  auraId: string,
): boolean {
  return (
    STARTER_AURA_IDS.some((id) => id === auraId) ||
    (isKnownAura(auraId) && snapshot.unlockedAuras.includes(auraId))
  );
}

export function totalXpAtLevel(level: number): number {
  const completedLevels = level - 1;
  return (
    completedLevels * BALANCE.characterBase +
    (BALANCE.characterStep * completedLevels * (completedLevels - 1)) / 2
  );
}

/**
 * Called inside one accepted activity transaction, after XP and damage are calculated.
 * A crossing earns the cosmetic once; loading, reset and an already defeated boss do not.
 */
export function grantActivityAuras(
  before: GameSnapshot,
  after: GameSnapshot,
  activityXp: number,
): string[] {
  if (
    !Number.isFinite(activityXp) ||
    activityXp <= 0 ||
    after.character.totalXp <= before.character.totalXp
  ) {
    return before.unlockedAuras;
  }
  const earned = AURA_REWARDS.filter((reward) => {
    if (before.unlockedAuras.includes(reward.id)) return false;
    if (reward.unlock.kind === 'level') {
      const threshold = totalXpAtLevel(reward.unlock.level);
      return before.character.totalXp < threshold && after.character.totalXp >= threshold;
    }
    return (
      before.boss.id === reward.unlock.bossId &&
      after.boss.id === before.boss.id &&
      before.boss.hp > 0 &&
      after.boss.hp === 0
    );
  });
  return earned.length > 0
    ? [...before.unlockedAuras, ...earned.map((reward) => reward.id)]
    : before.unlockedAuras;
}
