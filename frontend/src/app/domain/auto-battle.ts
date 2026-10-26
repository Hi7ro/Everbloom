import { ATTRIBUTES, BALANCE, SKILLS } from './catalog';
import { AttributeId, GameSnapshot } from './models';
import { levelProgress } from './progression';
import { BossDifficulty, BossId, bossEncounter } from './boss-catalog';

export type BattleActor = 'hero' | 'boss';
export type BattleOutcome = 'victory' | 'defeat' | 'draw';
export type BattleTactic = 'balanced' | 'power' | 'guard';
export const BATTLE_TACTICS = [
  { id: 'balanced', name: 'Balance', symbol: '◇', description: 'Verlässlicher Angriff und Schutz. Dein vielseitiger Begleiter.' },
  { id: 'power', name: 'Offensiv', symbol: '↟', description: '20 % mehr Angriff, 25 % weniger Verteidigung. Kürzerer Kampf, höheres Risiko.' },
  { id: 'guard', name: 'Ausdauer', symbol: '☾', description: '25 % mehr Verteidigung, 15 % weniger Angriff. Sammelt bei niedriger HP neue Kraft.' },
] as const;
export type CombatBossPhase = 'awakening' | 'resistance' | 'last-stand' | 'defeated';
export type BattleAbilityId = 'root-strike' | 'bark-guard' | 'ember-claw' | 'ember-charge' | 'ember-breath'
  | 'void-rend' | 'gravity-well' | 'event-horizon' | 'primal-claw' | 'prism-charge' | 'cosmic-breath' | 'wing-tempest'
  | 'relic-volley' | 'royal-aegis' | 'sovereign-blade' | 'imperial-charge' | 'imperial-rain'
  | 'ruby-blade' | 'bloodmoon-seal' | 'lunar-eclipse'
  | 'dusk-bite' | 'dusk-leap' | 'dusk-guard' | 'dusk-frenzy'
  | 'astral-strike' | 'star-seal' | 'starburst' | 'frost-strike' | 'frost-guard' | 'frost-charge' | 'frost-crush'
  | 'staff-combo' | 'cloud-step' | 'solar-charge' | 'solar-strike' | 'guarded-strike';
type BossAbility = Exclude<BattleAbilityId, 'guarded-strike'>;
type ChargedAbility = 'event-horizon' | 'cosmic-breath' | 'imperial-rain' | 'lunar-eclipse' | 'dusk-frenzy' | 'ember-breath' | 'starburst' | 'frost-crush' | 'solar-strike';
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
  /** Optional encounter mechanic, separate from the generic animation action. */
  readonly abilityId?: BattleAbilityId;
  readonly label: string;
  /** Actual damage, capped to the opponent's remaining HP. */
  readonly damage: number;
  /** Restores the acting character’s battle HP only, capped to missing HP. Never a real-life recovery claim. */
  readonly healing: number;
  readonly critical: boolean;
  readonly heroHp: number;
  readonly bossHp: number;
  /** Phase after the action; a defeated boss never gets a counterattack. */
  readonly bossPhase: CombatBossPhase;
}

export interface BattleReplay {
  readonly mode: 'practice' | 'boss';
  readonly difficulty: BossDifficulty;
  readonly tactic: BattleTactic;
  readonly hero: { readonly id: string; readonly name: string; readonly stats: HeroCombatStats };
  readonly boss: BossCombatDefinition;
  readonly initial: { readonly heroHp: number; readonly bossHp: number };
  readonly turns: readonly BattleTurn[];
  readonly outcome: BattleOutcome;
  readonly roundCount: number;
  /** Replays never issue XP or loot. The server grants the first-clear cosmetic separately. */
  readonly rewards: { readonly xp: 0; readonly loot: readonly never[] };
}

export interface PracticeBattleOptions {
  readonly bossId?: BossId;
  readonly difficulty?: BossDifficulty;
  readonly tactic?: BattleTactic;
  readonly maxRounds?: number;
  readonly heroHp?: number;
  readonly bossHp?: number;
}

export interface BossBattleOptions {
  readonly bossId: BossId;
  readonly difficulty?: BossDifficulty;
  readonly tactic?: BattleTactic;
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
 * Catalog previews may bypass the level gate; they never grant a clear or reward.
 */
export function createPracticeBattle(
  snapshot: CombatSnapshot,
  options: PracticeBattleOptions = {},
): BattleReplay {
  return resolveBattle(snapshot, options, 'practice');
}

/** Server parity reference. The client must never persist this result as an authoritative win. */
export function createBossBattle(snapshot: CombatSnapshot, options: BossBattleOptions): BattleReplay {
  const encounter = bossEncounter(options.bossId, options.difficulty ?? 'normal');
  if (deriveHeroCombatStats(snapshot).level < encounter.minimumLevel) {
    throw new Error(`Dieser Kampf wird auf Level ${encounter.minimumLevel} freigeschaltet.`);
  }
  return resolveBattle(snapshot, options, 'boss');
}

function resolveBattle(snapshot: CombatSnapshot, options: PracticeBattleOptions, mode: 'practice' | 'boss'): BattleReplay {
  const stats = deriveHeroCombatStats(snapshot);
  const tactic = BATTLE_TACTICS.some(item => item.id === options.tactic) ? options.tactic! : 'balanced';
  const multipliers = tactic === 'power' ? [1.2, .75] : tactic === 'guard' ? [.85, 1.25] : [1, 1];
  // The tactical tradeoff modifies only this encounter, never the character's saved attributes.
  const combatStats = { ...stats,
    attack: boundedInteger(stats.attack * multipliers[0], 1, AUTO_BATTLE_LIMITS.maxStat),
    defense: boundedInteger(stats.defense * multipliers[1], 0, AUTO_BATTLE_LIMITS.maxStat),
  };
  const definition = options.bossId ? bossEncounter(options.bossId, options.difficulty ?? 'normal') : MOSSWARDEN_BOSS;
  const boss: BossCombatDefinition = { id: definition.id, name: definition.name, stats: { ...definition.stats } };
  let heroHp = boundedInteger(options.heroHp ?? stats.maxHp, 0, stats.maxHp, stats.maxHp);
  let bossHp = boundedInteger(
    options.bossHp ?? boss.stats.maxHp,
    0,
    boss.stats.maxHp,
    boss.stats.maxHp,
  );
  const initial = { heroHp, bossHp };
  const turns: BattleTurn[] = [];
  let guardedHits = 0;
  let guardFactor = 1;
  let chargedAbility: ChargedAbility | undefined;
  let chargedPhaseMultiplier = 1;
  const maxRounds = boundedInteger(options.maxRounds ?? 20, 1, AUTO_BATTLE_LIMITS.maxRounds, 20);

  for (let round = 1; round <= maxRounds && heroHp > 0 && bossHp > 0; round++) {
    const renewing = tactic === 'guard' && round % 3 === 0 && heroHp < stats.maxHp * .6;
    const healing = renewing ? Math.min(stats.maxHp - heroHp,
      Math.max(1, Math.floor(stats.maxHp * .12 + stats.attributes.recovery * .5 + stats.attributes.mindfulness * .25))) : 0;
    heroHp += healing;
    const critical = !renewing && round % stats.criticalEvery === 0;
    const guarded = guardedHits > 0 && !renewing;
    const rawHeroDamage = Math.max(1, Math.floor(combatStats.attack * (critical ? 1.5 : 1)) - boss.stats.defense);
    const heroDamage = renewing ? 0 : Math.min(bossHp,
      guarded ? Math.max(1, Math.floor(rawHeroDamage * guardFactor)) : rawHeroDamage);
    if (guarded) guardedHits--;
    bossHp -= heroDamage;
    const phase = combatBossPhase(bossHp, boss.stats.maxHp);
    turns.push({
      index: turns.length,
      round,
      actor: 'hero',
      action: renewing ? 'renewal' : critical ? 'focused-strike' : 'strike',
      label: (renewing ? 'Neue Kraft' : critical ? 'Fokusschlag' : 'Entschlossener Hieb') + (guarded ? ` · ${bossGuardLabel(boss.id)} dämpft den Treffer` : ''),
      ...(guarded ? { abilityId: 'guarded-strike' as const } : {}),
      damage: heroDamage,
      healing,
      critical,
      heroHp,
      bossHp,
      bossPhase: phase,
    });
    if (bossHp === 0) break;

    const pressure = boss.id === 'relic-sovereign' ? 1 + Math.min(.28, Math.max(0, round - 5) * .04) : 1;
    const phaseMultiplier = (phase === 'last-stand' ? 1.4 : phase === 'resistance' ? 1.15 : 1) * pressure;
    const heavy = round % 3 === 0;
    const ability = options.bossId ? bossAbility(options.bossId, phase, round, chargedAbility) : undefined;
    let incoming = Math.max(1, Math.floor(boss.stats.attack * phaseMultiplier * (heavy ? 1.2 : 1)) - combatStats.defense);
    if (ability === 'relic-volley' || ability === 'primal-claw' || ability === 'wing-tempest') {
      const count = ability === 'primal-claw' ? 2 : 3;
      const multiplier = ability === 'primal-claw' ? .7 : ability === 'wing-tempest' ? .52 : .55;
      incoming = count * Math.max(1, Math.floor(boss.stats.attack * phaseMultiplier * multiplier) - combatStats.defense);
    } else if (ability === 'imperial-rain') {
      incoming = 3 * Math.max(1, Math.floor(boss.stats.attack * chargedPhaseMultiplier * .8) - combatStats.defense);
      chargedAbility = undefined;
    } else if (ability === 'sovereign-blade') {
      incoming = Math.max(1, Math.floor(boss.stats.attack * phaseMultiplier * 1.1) - combatStats.defense);
    } else if (ability === 'staff-combo') {
      // Armor reduces each hit separately, making defense a real answer to the staff combo.
      incoming = 2 * Math.max(1, Math.floor(boss.stats.attack * phaseMultiplier * .58) - combatStats.defense);
    } else if (ability === 'cloud-step') {
      incoming = Math.max(1, Math.floor(boss.stats.attack * phaseMultiplier * .55) - combatStats.defense);
      guardedHits = 1; guardFactor = .65;
    } else if (ability === 'dusk-leap') {
      incoming = Math.max(1, Math.floor(boss.stats.attack * phaseMultiplier * 1.1) - combatStats.defense);
    } else if (ability === 'dusk-frenzy') {
      incoming = 2 * Math.max(1, Math.floor(boss.stats.attack * chargedPhaseMultiplier * .72) - combatStats.defense);
      chargedAbility = undefined;
    } else if (ability === 'gravity-well' || ability === 'royal-aegis' || ability === 'bloodmoon-seal' || ability === 'dusk-guard' || ability === 'bark-guard' || ability === 'star-seal' || ability === 'frost-guard') {
      incoming = 0;
      guardedHits = ability === 'frost-guard' || ability === 'gravity-well' ? 2 : 1;
      guardFactor = ability === 'gravity-well' ? .75 : ability === 'royal-aegis' ? .55 : ability === 'dusk-guard' ? .6 : ability === 'bark-guard' ? .7 : ability === 'star-seal' ? .55 : .65;
      if (ability === 'gravity-well') { chargedAbility = 'event-horizon'; chargedPhaseMultiplier = phaseMultiplier; }
      if (ability === 'bloodmoon-seal') { chargedAbility = 'lunar-eclipse'; chargedPhaseMultiplier = phaseMultiplier; }
      if (ability === 'dusk-guard') { chargedAbility = 'dusk-frenzy'; chargedPhaseMultiplier = phaseMultiplier; }
      if (ability === 'star-seal') { chargedAbility = 'starburst'; chargedPhaseMultiplier = phaseMultiplier; }
    } else if (ability === 'prism-charge' || ability === 'imperial-charge' || ability === 'ember-charge' || ability === 'frost-charge' || ability === 'solar-charge') {
      incoming = 0;
      chargedPhaseMultiplier = phaseMultiplier;
      chargedAbility = ability === 'prism-charge' ? 'cosmic-breath' : ability === 'imperial-charge' ? 'imperial-rain' : ability === 'ember-charge' ? 'ember-breath' : ability === 'frost-charge' ? 'frost-crush' : 'solar-strike';
    } else if (ability === 'event-horizon' || ability === 'cosmic-breath' || ability === 'lunar-eclipse' || ability === 'ember-breath' || ability === 'starburst' || ability === 'frost-crush' || ability === 'solar-strike') {
      const multiplier = ability === 'event-horizon' ? 1.8 : ability === 'cosmic-breath' ? 1.85 : ability === 'lunar-eclipse' ? 1.75 : ability === 'ember-breath' ? 1.85 : ability === 'starburst' ? 2 : ability === 'frost-crush' ? 2.05 : 2.1;
      // Earlier bosses lock the announced power; crossing a phase during the tell cannot raise it.
      const announcedPhase = ability === 'solar-strike' ? phaseMultiplier : chargedPhaseMultiplier;
      incoming = Math.max(1, Math.floor(boss.stats.attack * announcedPhase * multiplier) - combatStats.defense);
      chargedAbility = undefined;
    } else if (ability) {
      incoming = Math.max(1, Math.floor(boss.stats.attack * phaseMultiplier) - combatStats.defense);
    }
    const bossDamage = Math.min(heroHp, incoming);
    heroHp -= bossDamage;
    const bossHealing = ability === 'lunar-eclipse'
      ? Math.min(boss.stats.maxHp - bossHp, Math.floor(boss.stats.maxHp * .02), Math.floor(bossDamage * .2)) : 0;
    bossHp += bossHealing;
    turns.push({
      index: turns.length,
      round,
      actor: 'boss',
      action: phase === 'last-stand' ? 'thorn-burst' : heavy ? 'stone-crash' : 'root-strike',
      label: ability ? BOSS_ABILITY_LABELS[ability] : bossActionLabel(boss.id, phase, heavy),
      ...(ability ? { abilityId: ability } : {}),
      damage: bossDamage,
      healing: bossHealing,
      critical: ability ? ['event-horizon', 'cosmic-breath', 'imperial-rain', 'lunar-eclipse', 'dusk-frenzy', 'ember-breath', 'starburst', 'frost-crush', 'solar-strike'].includes(ability) : heavy,
      heroHp,
      bossHp,
      bossPhase: combatBossPhase(bossHp, boss.stats.maxHp),
    });
  }

  const outcome: BattleOutcome =
    bossHp === 0 && heroHp > 0 ? 'victory' : heroHp === 0 && bossHp > 0 ? 'defeat' : 'draw';
  return {
    mode,
    difficulty: options.difficulty ?? 'normal',
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

function bossActionLabel(bossId: string, phase: CombatBossPhase, heavy: boolean): string {
  if (bossId === 'frost-titan') return phase === 'last-stand' ? 'Absoluter Frost' : heavy ? 'Gletscherschlag' : 'Eishieb';
  if (bossId === 'cloud-sovereign') return phase === 'last-stand' ? 'Himmelswirbel' : heavy ? 'Wolkensprung' : 'Stabhieb';
  if (bossId === 'emberwyrm') return phase === 'last-stand' ? 'Infernosturm' : heavy ? 'Glutatem' : 'Klauenhieb';
  if (bossId === 'astral-sovereign') return phase === 'last-stand' ? 'Sternenfall' : heavy ? 'Kometenschlag' : 'Astralklinge';
  return phase === 'last-stand' ? 'Dornensturm' : heavy ? 'Steinschlag' : 'Wurzelhieb';
}

export const BOSS_ABILITY_LABELS: Readonly<Record<BossAbility, string>> = {
  'root-strike': 'Wurzelhieb',
  'bark-guard': 'Lebende Rinde · Schutz für den nächsten Angriff',
  'ember-claw': 'Klauenhieb',
  'ember-charge': 'Glut sammeln · Feueratem folgt',
  'ember-breath': 'Entfesselter Feueratem',
  'dusk-bite': 'Säbelbiss',
  'dusk-leap': 'Schattensprung',
  'dusk-guard': 'Runenschild · Schutz und Schattenraserei folgt',
  'dusk-frenzy': 'Schattenraserei · zwei Treffer',
  'void-rend': 'Leerenriss',
  'gravity-well': 'Gravitationssog · Schutz und Ereignishorizont folgt',
  'event-horizon': 'Kollaps des Ereignishorizonts',
  'primal-claw': 'Urklauen · zwei Treffer',
  'prism-charge': 'Prismenaufladung · kosmischer Atem folgt',
  'cosmic-breath': 'Kosmischer Atem',
  'wing-tempest': 'Prismenflügelsturm · drei Treffer',
  'relic-volley': 'Reliktsalve · drei Treffer',
  'royal-aegis': 'Königsaegis · Schutz für den nächsten Angriff',
  'sovereign-blade': 'Klinge des Sonnenreichs',
  'imperial-charge': 'Arsenalaufladung · Reliktregen folgt',
  'imperial-rain': 'Goldener Reliktregen · drei Treffer',
  'ruby-blade': 'Rubinklinge',
  'bloodmoon-seal': 'Blutmondsiegel · Schutz und Mondfinsternis folgt',
  'lunar-eclipse': 'Mondfinsternis · begrenzte Lebenskraft',
  'astral-strike': 'Astralklinge',
  'star-seal': 'Sternensiegel · Schild und Sternenbruch folgt',
  'starburst': 'Brechende Sternenkonstellation',
  'frost-strike': 'Eishieb',
  'frost-guard': 'Gletscherpanzer · Schutz für zwei Angriffe',
  'frost-charge': 'Gletscherkraft sammeln · Eisbrecher folgt',
  'frost-crush': 'Gewaltiger Eisbrecher',
  'staff-combo': 'Goldene Stabkombo · zwei Treffer',
  'cloud-step': 'Wolkenschritt · Schild für den nächsten Angriff',
  'solar-charge': 'Sonnenkraft sammeln · Sonnenschlag folgt',
  'solar-strike': 'Himmlischer Sonnenschlag',
};

/** Shorter phase cycles increase pressure, but every solar strike is announced one boss turn ahead. */
function cloudBossAbility(phase: CombatBossPhase, round: number): BossAbility {
  const cycle: readonly BossAbility[] = phase === 'last-stand'
    ? ['cloud-step', 'solar-charge', 'solar-strike']
    : phase === 'resistance'
      ? ['staff-combo', 'cloud-step', 'solar-charge', 'solar-strike']
      : ['staff-combo', 'cloud-step', 'staff-combo', 'solar-charge', 'solar-strike'];
  const ability = cycle[(round - 1) % cycle.length];
  return ability === 'solar-strike' ? 'solar-charge' : ability;
}


function bossGuardLabel(bossId: string): string {
  return bossId === 'void-devourer' ? 'Gravitationsfeld' : bossId === 'relic-sovereign' ? 'Königsaegis' : bossId === 'bloodmoon-regent' ? 'Blutmondbarriere' : bossId === 'dusk-prowler' ? 'Runenschild' : bossId === 'mosswarden' ? 'Rindenschild' : bossId === 'astral-sovereign' ? 'Sternensiegel'
    : bossId === 'frost-titan' ? 'Gletscherpanzer' : 'Wolkenschild';
}

/** Small authored patterns. Charged actions always resolve before a phase can choose a new move. */
function bossAbility(bossId: BossId, phase: CombatBossPhase, round: number, charged?: ChargedAbility): BossAbility {
  if (charged) return charged;
  if (bossId === 'cloud-sovereign') return cloudBossAbility(phase, round);
  if (bossId === 'mosswarden') return round % 3 === 0 ? 'bark-guard' : 'root-strike';
  if (bossId === 'emberwyrm') {
    const interval = phase === 'awakening' ? 4 : 3;
    return round % interval === (phase === 'last-stand' ? 1 : 2) ? 'ember-charge' : 'ember-claw';
  }
  if (bossId === 'dusk-prowler') {
    const beat = (round - 1) % 5;
    return beat === 2 ? 'dusk-guard' : beat === 1 ? 'dusk-leap' : 'dusk-bite';
  }
  if (bossId === 'void-devourer') return round % (phase === 'last-stand' ? 3 : 5) === 2 ? 'gravity-well' : 'void-rend';
  if (bossId === 'primordial-dragon') {
    const beat = (round - 1) % (phase === 'last-stand' ? 4 : 6);
    return beat === 1 || beat === 2 ? 'prism-charge' : beat === 3 || beat === 5 ? 'wing-tempest' : 'primal-claw';
  }
  if (bossId === 'relic-sovereign') {
    const beat = (round - 1) % 6;
    return beat === 1 ? 'royal-aegis' : beat === 2 ? 'sovereign-blade' : beat === 3 || beat === 4 ? 'imperial-charge' : 'relic-volley';
  }
  if (bossId === 'bloodmoon-regent') return round % 4 === 2 ? 'bloodmoon-seal' : 'ruby-blade';
  if (bossId === 'astral-sovereign') {
    const interval = phase === 'awakening' ? 5 : phase === 'resistance' ? 4 : 3;
    return round % interval === (phase === 'last-stand' ? 1 : 2) ? 'star-seal' : 'astral-strike';
  }
  // The titan keeps a slow, readable six-beat rhythm; phase strength increases instead of speed.
  const cycle: readonly BossAbility[] = ['frost-strike', 'frost-guard', 'frost-strike', 'frost-charge', 'frost-crush', 'frost-strike'];
  const ability = cycle[(round - 1) % cycle.length];
  return ability === 'frost-crush' ? 'frost-charge' : ability;
}
