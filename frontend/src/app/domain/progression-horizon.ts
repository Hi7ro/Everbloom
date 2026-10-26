import { AURA_REWARDS, totalXpAtLevel } from './aura-rewards';
import { BOSS_DIFFICULTIES, BossId, bossEncounter, bossEncounterId, discoveredBosses } from './boss-catalog';
import { ResolvedBossCosmetic, bossFirstClearReward, hasBossCosmetic, resolveBossCosmetic } from './boss-loot';
import { GameSnapshot } from './models';

interface XpGoal {
  readonly requiredXp: number;
  readonly remainingXp: number;
  readonly progressXp: number;
}

export interface BossHorizonGoal extends XpGoal {
  readonly id: BossId;
  readonly name: string;
  readonly difficulty: 'normal';
  readonly minimumLevel: number;
  readonly recommendedLevel: number;
  readonly requiresPlus: boolean;
  /** This means the level gate is open, not that the player is guaranteed to win. */
  readonly readyToEnter: boolean;
  readonly reward: ResolvedBossCosmetic | null;
}

export interface AuraHorizonGoal extends XpGoal {
  readonly id: string;
  readonly label: string;
  readonly targetLevel: number;
}

export interface ProgressionHorizon {
  readonly boss: BossHorizonGoal | null;
  readonly aura: AuraHorizonGoal | null;
}

/** Read-only goals from existing progression. Never unlocks content or reveals future bosses. */
export function buildProgressionHorizon(
  snapshot: Pick<GameSnapshot, 'character' | 'bossProgress' | 'unlockedAuras'> | null | undefined,
): ProgressionHorizon {
  if (!snapshot || !Number.isFinite(snapshot.character.totalXp) || snapshot.character.totalXp < 0) {
    return { boss: null, aura: null };
  }
  const totalXp = snapshot.character.totalXp;
  const xpGoal = (level: number): XpGoal => {
    const requiredXp = totalXpAtLevel(level);
    return {
      requiredXp,
      remainingXp: Math.max(0, requiredXp - totalXp),
      progressXp: Math.min(totalXp, requiredXp),
    };
  };

  let boss: BossHorizonGoal | null = null;
  const current = discoveredBosses(snapshot).at(-1);
  const clears = new Set(snapshot.bossProgress?.clearedEncounterIds ?? []);
  if (current && !BOSS_DIFFICULTIES.some(mode => clears.has(bossEncounterId(current.id, mode.id)))) {
    const encounter = bossEncounter(current.id, 'normal');
    const goal = xpGoal(encounter.minimumLevel);
    const reward = bossFirstClearReward(current.id, 'normal');
    boss = {
      id: current.id,
      name: current.name,
      difficulty: 'normal',
      minimumLevel: encounter.minimumLevel,
      recommendedLevel: encounter.recommendedLevel,
      requiresPlus: encounter.futurePlus,
      readyToEnter: goal.remainingXp === 0,
      ...goal,
      reward: hasBossCosmetic(snapshot, reward.id) ? null : resolveBossCosmetic(reward.id, snapshot.character.appearance.presentation) ?? null,
    };
  }

  let aura: AuraHorizonGoal | null = null;
  for (const reward of AURA_REWARDS) {
    if (reward.unlock.kind !== 'level' || snapshot.unlockedAuras.includes(reward.id)) continue;
    const goal = xpGoal(reward.unlock.level);
    // Existing rewards are granted on crossing only. Do not promise a retroactive grant.
    if (goal.remainingXp === 0 || (aura && aura.requiredXp <= goal.requiredXp)) continue;
    aura = { id: reward.id, label: reward.label, targetLevel: reward.unlock.level, ...goal };
  }
  return { boss, aura };
}
