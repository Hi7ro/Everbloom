import { ATTRIBUTES, BALANCE, SKILLS } from './catalog';
import { AttributeId, GameSnapshot } from './models';
import { levelProgress } from './progression';

export type BattleActor = 'hero' | 'boss';
export type BattleOutcome = 'victory' | 'defeat' | 'draw';
export type BattleTactic = 'balanced' | 'power' | 'guard';
export const BATTLE_TACTICS = [
  { id: 'balanced', name: 'Balance', symbol: '◇', description: 'Verlässlicher Angriff und Schutz. Dein vielseitiger Begleiter.' },
  { id: 'power', name: 'Offensiv', symbol: '↟', description: '20 % mehr Angriff, 25 % weniger Verteidigung. Kürzerer Kampf, höheres Risiko.' },
  { id: 'guard', name: 'Ausdauer', symbol: '☾', description: '25 % mehr Verteidigung, 15 % weniger Angriff. Sammelt bei niedriger HP neue Kraft.' },
] as const;
export type CombatBossPhase = 'awakening' | 'resistance' | 'last-stand' | 'defeated';
export type BattleAction =
  'strike' | 'focused-strike' | 'root-strike' | 'stone-crash' | 'thorn-burst' | 'renewal';

export const BOSS_PHASE_LABELS: Readonly<Record<CombatBossPhase, string>> = {
  awakening: 'Erwachen',
  resistance: 'Widerstand',
  'last-stand': 'Letzter Widerstand',
  defeated: 'Besiegt',
};

/** Prototype safety limits, not the final character level or reward caps. */
export const AUTO_BATTLE_LIMITS = Object.freeze({
  maxRounds: 30,
  maxXp: 10_000_000,
  maxAttribute: 1_000,
  maxHp: 100_000,
  maxStat: 10_000,
});

export interface CombatStats {
  readonly level: number;
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
}

export interface HeroCombatStats extends CombatStats {
  /** A focused strike happens every nth hero turn; replay never rerolls. */
  readonly criticalEvery: number;
  readonly attributes: Readonly<Record<AttributeId, number>>;
}

export interface BossCombatDefinition {
  readonly id: string;
  readonly name: string;
  readonly stats: CombatStats;
}

/** Separate sparring values; the activity-driven weekly boss keeps its own HP. */
export const MOSSWARDEN_BOSS: BossCombatDefinition = Object.freeze({
  id: 'mosswarden',
  name: 'Der Mooswächter',
  stats: Object.freeze({ level: 12, maxHp: 560, attack: 52, defense: 20 }),
});

export interface BattleTurn {
  readonly index: number;
  readonly round: number;
  readonly actor: BattleActor;
  readonly action: BattleAction;
  readonly label: string;
  /** Actual damage, capped to the opponent's remaining HP. */
  readonly damage: number;
  /** Restores battle HP only, capped to missing HP. Never a real-life recovery claim. */
  readonly healing: number;
  readonly critical: boolean;
  readonly heroHp: number;
  readonly bossHp: number;
  /** Phase after the action; a defeated boss never gets a counterattack. */
  readonly bossPhase: CombatBossPhase;
}

export interface BattleReplay {
  readonly mode: 'practice';
  readonly tactic: BattleTactic;
  readonly hero: { readonly id: string; readonly name: string; readonly stats: HeroCombatStats };
  readonly boss: BossCombatDefinition;
  readonly initial: { readonly heroHp: number; readonly bossHp: number };
  readonly turns: readonly BattleTurn[];
  readonly outcome: BattleOutcome;
  readonly roundCount: number;
  /** Practice cannot issue rewards or update the activity journal. */
  readonly rewards: { readonly xp: 0; readonly loot: readonly never[] };
}

export interface PracticeBattleOptions {
  readonly tactic?: BattleTactic;
  readonly maxRounds?: number;
  readonly heroHp?: number;
  readonly bossHp?: number;
}

type CombatSnapshot = Pick<GameSnapshot, 'character' | 'skills'>;

function boundedInteger(
  value: number,
  minimum: number,
  maximum: number,
  fallback = minimum,
): number {
  return Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, Math.floor(value)))
    : fallback;
}

/**
 * Reads canonical total XP and base attributes, never appearance or membership.
 * All six attribute families contribute, including learning and recovery skills.
 */
export function deriveHeroCombatStats(snapshot: CombatSnapshot): HeroCombatStats {
  const attributes = {} as Record<AttributeId, number>;
  // Iterate the bounded catalog; unknown or duplicate skill IDs cannot inflate stats.
  for (const attribute of ATTRIBUTES) {
    let earnedXp = 0;
    for (const definition of SKILLS) {
      if (definition.attribute !== attribute.id) continue;
      const skill = snapshot.skills.find((entry) => entry.skillId === definition.id);
      earnedXp += boundedInteger(skill?.totalXp ?? 0, 0, AUTO_BATTLE_LIMITS.maxXp);
    }
    const base = boundedInteger(
      snapshot.character.attributes[attribute.id],
      0,
      AUTO_BATTLE_LIMITS.maxAttribute,
    );
    attributes[attribute.id] = Math.min(
      AUTO_BATTLE_LIMITS.maxAttribute,
      base + Math.floor(earnedXp / BALANCE.attributeXpPerPoint),
    );
  }
  const xp = boundedInteger(snapshot.character.totalXp, 0, AUTO_BATTLE_LIMITS.maxXp);
  const level = levelProgress(xp).level;
  return {
    level,
    maxHp: boundedInteger(
      120 + level * 14 + attributes.endurance * 3 + attributes.recovery * 2,
      1,
      AUTO_BATTLE_LIMITS.maxHp,
    ),
    attack: boundedInteger(
      12 +
        level * 3 +
        attributes.strength * 0.7 +
        attributes.knowledge * 0.7 +
        attributes.focus * 0.3,
      1,
      AUTO_BATTLE_LIMITS.maxStat,
    ),
    defense: boundedInteger(
      3 +
        level * 0.8 +
        attributes.endurance * 0.25 +
        attributes.mindfulness * 0.25 +
        attributes.recovery * 0.25,
      0,
      AUTO_BATTLE_LIMITS.maxStat,
    ),
    criticalEvery: boundedInteger(
      5 - Math.floor((attributes.focus + attributes.mindfulness) / 50),
      3,
      5,
    ),
    attributes,
  };
}

export function combatBossPhase(hp: number, maxHp: number): CombatBossPhase {
  const maximum = boundedInteger(maxHp, 1, AUTO_BATTLE_LIMITS.maxHp, 1);
  const remaining = boundedInteger(hp, 0, maximum);
  if (remaining === 0) return 'defeated';
  if (remaining / maximum > 0.6) return 'awakening';
  return remaining / maximum > 0.25 ? 'resistance' : 'last-stand';
}

/**
 * Pure, finite, reproducible rehearsal. A UI only plays back these events.
 * Real encounters must later be granted and resolved by the server after activities.
 */
export function createPracticeBattle(
  snapshot: CombatSnapshot,
  options: PracticeBattleOptions = {},
): BattleReplay {
  const stats = deriveHeroCombatStats(snapshot);
  const tactic = BATTLE_TACTICS.some(item => item.id === options.tactic) ? options.tactic! : 'balanced';
  const multipliers = tactic === 'power' ? [1.2, .75] : tactic === 'guard' ? [.85, 1.25] : [1, 1];
  // The tactical tradeoff modifies only this encounter, never the character's saved attributes.
  const combatStats = { ...stats,
    attack: boundedInteger(stats.attack * multipliers[0], 1, AUTO_BATTLE_LIMITS.maxStat),
    defense: boundedInteger(stats.defense * multipliers[1], 0, AUTO_BATTLE_LIMITS.maxStat),
  };
  const boss: BossCombatDefinition = { ...MOSSWARDEN_BOSS, stats: { ...MOSSWARDEN_BOSS.stats } };
  let heroHp = boundedInteger(options.heroHp ?? stats.maxHp, 0, stats.maxHp, stats.maxHp);
  let bossHp = boundedInteger(
    options.bossHp ?? boss.stats.maxHp,
    0,
    boss.stats.maxHp,
    boss.stats.maxHp,
  );
  const initial = { heroHp, bossHp };
  const turns: BattleTurn[] = [];
  const maxRounds = boundedInteger(options.maxRounds ?? 20, 1, AUTO_BATTLE_LIMITS.maxRounds, 20);

  for (let round = 1; round <= maxRounds && heroHp > 0 && bossHp > 0; round++) {
    const renewing = tactic === 'guard' && round % 3 === 0 && heroHp < stats.maxHp * .6;
    const healing = renewing ? Math.min(stats.maxHp - heroHp,
      Math.max(1, Math.floor(stats.maxHp * .12 + stats.attributes.recovery * .5 + stats.attributes.mindfulness * .25))) : 0;
    heroHp += healing;
    const critical = !renewing && round % stats.criticalEvery === 0;
    const heroDamage = renewing ? 0 : Math.min(
      bossHp,
      Math.max(1, Math.floor(combatStats.attack * (critical ? 1.5 : 1)) - boss.stats.defense),
    );
    bossHp -= heroDamage;
    const phase = combatBossPhase(bossHp, boss.stats.maxHp);
    turns.push({
      index: turns.length,
      round,
      actor: 'hero',
      action: renewing ? 'renewal' : critical ? 'focused-strike' : 'strike',
      label: renewing ? 'Neue Kraft' : critical ? 'Fokusschlag' : 'Entschlossener Hieb',
      damage: heroDamage,
      healing,
      critical,
      heroHp,
      bossHp,
      bossPhase: phase,
    });
    if (bossHp === 0) break;

    const phaseMultiplier = phase === 'last-stand' ? 1.4 : phase === 'resistance' ? 1.15 : 1;
    const heavy = round % 3 === 0;
    const bossDamage = Math.min(
      heroHp,
      Math.max(
        1,
        Math.floor(boss.stats.attack * phaseMultiplier * (heavy ? 1.2 : 1)) - combatStats.defense,
      ),
    );
    heroHp -= bossDamage;
    turns.push({
      index: turns.length,
      round,
      actor: 'boss',
      action: phase === 'last-stand' ? 'thorn-burst' : heavy ? 'stone-crash' : 'root-strike',
      label: phase === 'last-stand' ? 'Dornensturm' : heavy ? 'Steinschlag' : 'Wurzelhieb',
      damage: bossDamage,
      healing: 0,
      critical: heavy,
      heroHp,
      bossHp,
      bossPhase: phase,
    });
  }

  const outcome: BattleOutcome =
    bossHp === 0 && heroHp > 0 ? 'victory' : heroHp === 0 && bossHp > 0 ? 'defeat' : 'draw';
  return {
    mode: 'practice',
    tactic,
    hero: { id: snapshot.character.id, name: snapshot.character.name, stats: combatStats },
    boss,
    initial,
    turns,
    outcome,
    roundCount: turns.at(-1)?.round ?? 0,
    rewards: { xp: 0, loot: [] },
  };
}
