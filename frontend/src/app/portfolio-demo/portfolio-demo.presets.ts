import { InjectionToken } from '@angular/core';
import { createMockSnapshot } from '../data/mock-data';
import { AURA_REWARDS, totalXpAtLevel } from '../domain/aura-rewards';
import { BOSS_CATALOG, bossEncounterId } from '../domain/boss-catalog';
import { bossFirstClearReward } from '../domain/boss-loot';
import { startGamePeriod } from '../domain/game-periods';
import { GameSnapshot } from '../domain/models';

export const DEMO_PRESETS = [
  { id: 'everyday', label: 'Alltag · Level 12', level: 12, clearedBosses: 0 },
  { id: 'campaign', label: 'Kampagne · Level 50', level: 50, clearedBosses: 4 },
  { id: 'endgame', label: 'Späte Reise · Level 130', level: 130, clearedBosses: 9 },
] as const;
export type DemoPreset = (typeof DEMO_PRESETS)[number]['id'];
export const DEMO_PRESET = new InjectionToken<DemoPreset>('Portfolio sample preset', {
  providedIn: 'root',
  factory: () => {
    const value = new URL(globalThis.location.href).searchParams.get('example');
    return DEMO_PRESETS.find((preset) => preset.id === value)?.id ?? 'everyday';
  },
});

/** Prepared examples, not earned account state. The same real rules continue from each snapshot. */
export function createPortfolioExample(day: string, id: DemoPreset): GameSnapshot {
  const preset = DEMO_PRESETS.find((value) => value.id === id)!;
  const example = startGamePeriod(createMockSnapshot(), day);
  example.character = {
    ...example.character,
    name: 'Ari Demo',
    createdByPlayer: true,
    appearance: {
      ...example.character.appearance,
      artwork: 'original',
      illustration: 'emerald-knight',
      illustratedHair: 'emerald-knight',
      outfitSet: 'emerald-knight',
    },
  };
  if (preset.level > 12) {
    example.character.totalXp = totalXpAtLevel(preset.level);
    example.character.attributes = {
      strength: 1,
      endurance: 1,
      focus: 1,
      knowledge: 1,
      mindfulness: 1,
      recovery: 1,
    };
    const trained = ['calisthenics', 'running', 'bjj', 'programming', 'meditation', 'recovery'];
    example.skills = example.skills.map((skill) => ({
      ...skill,
      totalXp: trained.includes(skill.skillId)
        ? Math.floor((example.character.totalXp * 0.35) / trained.length)
        : 0,
    }));
    example.unlockedAuras = AURA_REWARDS.filter(
      (reward) => reward.unlock.kind === 'level' && reward.unlock.level <= preset.level,
    ).map((reward) => reward.id);
  }
  const previous = BOSS_CATALOG.slice(0, preset.clearedBosses);
  const rewards = previous.map((boss) => bossFirstClearReward(boss.id, 'normal'));
  example.bossProgress = {
    clearedEncounterIds: previous.map((boss) => bossEncounterId(boss.id, 'normal')),
    unlockedCosmetics: rewards.map((reward) => reward.id),
  };
  example.unlockedAuras = [
    ...new Set([
      ...example.unlockedAuras,
      ...rewards.flatMap((reward) => (reward.auraId ? [reward.auraId] : [])),
    ]),
  ];
  return example;
}
