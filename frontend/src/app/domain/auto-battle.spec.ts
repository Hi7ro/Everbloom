import { createMockSnapshot } from '../data/mock-data';
import {
  AUTO_BATTLE_LIMITS,
  combatBossPhase,
  createPracticeBattle,
  deriveHeroCombatStats,
  MOSSWARDEN_BOSS,
} from './auto-battle';
import { GameSnapshot } from './models';

function beginner(): GameSnapshot {
  const snapshot = createMockSnapshot();
  snapshot.character.totalXp = 0;
  snapshot.character.attributes = {
    strength: 0,
    endurance: 0,
    focus: 0,
    knowledge: 0,
    mindfulness: 0,
    recovery: 0,
  };
  snapshot.skills = [];
  return snapshot;
}

describe('practice auto battle', () => {
  it('offers real offensive and defensive tradeoffs without changing base attributes', () => {
    const snapshot = createMockSnapshot();
    const before = structuredClone(snapshot);
    const power = createPracticeBattle(snapshot, { tactic: 'power' });
    const guard = createPracticeBattle(snapshot, { tactic: 'guard' });
    expect(power.hero.stats).toMatchObject({ attack: 124, defense: 20, maxHp: 396 });
    expect(guard.hero.stats).toMatchObject({ attack: 88, defense: 33, maxHp: 396 });
    expect(power.turns[0].damage).toBe(104);
    expect(guard.turns[0].damage).toBe(68);
    expect(power.turns[1].damage).toBe(32);
    expect(guard.turns[1].damage).toBe(19);
    expect(snapshot).toEqual(before);
  });

  it('uses a defensive recovery turn only at low HP and sacrifices that attack', () => {
    const replay = createPracticeBattle(createMockSnapshot(), { tactic: 'guard', heroHp: 100 });
    const renewal = replay.turns.find(turn => turn.action === 'renewal')!;
    expect(renewal).toMatchObject({ round: 3, actor: 'hero', healing: 60, damage: 0, critical: false });
    const previous = replay.turns[renewal.index - 1];
    expect(renewal.heroHp).toBe(previous.heroHp + 60);
    expect(renewal.bossHp).toBe(previous.bossHp);
    expect(replay.turns.every(turn => turn.heroHp <= replay.hero.stats.maxHp)).toBe(true);
    expect(createPracticeBattle(createMockSnapshot()).turns.every(turn => turn.healing === 0)).toBe(true);
  });

  it('falls back to balanced combat for unrecognized tactics and keeps every tactic deterministic', () => {
    const snapshot = createMockSnapshot();
    expect(createPracticeBattle(snapshot, { tactic: 'unknown' as never })).toEqual(createPracticeBattle(snapshot));
    for (const tactic of ['balanced', 'power', 'guard'] as const) {
      const replay = createPracticeBattle(snapshot, { tactic });
      expect(replay).toEqual(createPracticeBattle(snapshot, { tactic }));
      expect(replay.rewards).toEqual({ xp: 0, loot: [] });
      expect(replay.turns.length).toBeLessThanOrEqual(60);
    }
  });

  it('gives the demo hero a complete, reproducible victory with no rewards', () => {
    const snapshot = createMockSnapshot();
    const replay = createPracticeBattle(snapshot);
    expect(replay).toEqual(createPracticeBattle(snapshot));
    expect(replay).toMatchObject({
      mode: 'practice',
      outcome: 'victory',
      roundCount: 7,
      rewards: { xp: 0, loot: [] },
    });
    expect(replay.hero.stats).toMatchObject({ level: 12, maxHp: 396, attack: 104, defense: 27 });
    expect(replay.turns[0]).toMatchObject({ actor: 'hero', damage: 84, heroHp: 396, bossHp: 476 });
    expect(replay.turns.at(-1)).toMatchObject({ actor: 'hero', bossHp: 0, bossPhase: 'defeated' });
    expect(replay.turns.filter((turn) => turn.actor === 'hero' && turn.critical)).toHaveLength(1);
  });

  it('lets a beginner lose the rehearsal without any account progression penalty', () => {
    const snapshot = beginner();
    const before = structuredClone(snapshot);
    const replay = createPracticeBattle(snapshot);
    expect(replay.outcome).toBe('defeat');
    expect(replay.turns.at(-1)).toMatchObject({ actor: 'boss', heroHp: 0 });
    expect(snapshot).toEqual(before);
    expect(replay.rewards).toEqual({ xp: 0, loot: [] });
  });

  it('returns a draw when the configured round limit is reached', () => {
    const replay = createPracticeBattle(createMockSnapshot(), { maxRounds: 1 });
    expect(replay).toMatchObject({ outcome: 'draw', roundCount: 1 });
    expect(replay.turns).toHaveLength(2);
    expect(replay.turns.at(-1)).toMatchObject({ heroHp: 371, bossHp: 476 });
  });

  it('enforces the hard round cap even when both fighters survive every exchange', () => {
    const snapshot = beginner();
    snapshot.character.attributes.endurance = 1000;
    snapshot.character.attributes.recovery = 1000;
    snapshot.character.attributes.mindfulness = 1000;
    const replay = createPracticeBattle(snapshot, { maxRounds: 100_000 });
    expect(replay).toMatchObject({ outcome: 'draw', roundCount: 30 });
    expect(replay.turns).toHaveLength(60);
    expect(replay.turns.at(-1)!.heroHp).toBeGreaterThan(0);
    expect(replay.turns.at(-1)!.bossHp).toBeGreaterThan(0);
  });

  it('caps final damage and never allows a defeated fighter to counterattack', () => {
    const victory = createPracticeBattle(createMockSnapshot(), { bossHp: 1 });
    expect(victory.turns).toHaveLength(1);
    expect(victory.turns[0]).toMatchObject({ damage: 1, bossHp: 0 });
    expect(victory.outcome).toBe('victory');
    const defeat = createPracticeBattle(beginner(), { heroHp: 1 });
    expect(defeat.turns).toHaveLength(2);
    expect(defeat.turns.at(-1)).toMatchObject({ damage: 1, heroHp: 0 });
    expect(defeat.outcome).toBe('defeat');
  });

  it.each([
    [{ heroHp: 0 }, 'defeat'],
    [{ bossHp: 0 }, 'victory'],
    [{ heroHp: 0, bossHp: 0 }, 'draw'],
    [{ heroHp: -10 }, 'defeat'],
  ] as const)('resolves an already-ended encounter without actions: %j', (options, outcome) => {
    expect(createPracticeBattle(createMockSnapshot(), options)).toMatchObject({
      turns: [],
      roundCount: 0,
      outcome,
    });
  });

  it('derives progression from total XP and improves combat at the next level', () => {
    const snapshot = beginner();
    const before = deriveHeroCombatStats(snapshot);
    expect(before).toMatchObject({ level: 1, maxHp: 134, attack: 15, defense: 3 });
    snapshot.character.totalXp = 1200;
    const after = deriveHeroCombatStats(snapshot);
    expect(after).toMatchObject({ level: 2, maxHp: 148, attack: 18, defense: 4 });
  });

  it('adds earned skill attributes to their base values without double counting', () => {
    const snapshot = beginner();
    snapshot.character.attributes.strength = 10;
    snapshot.skills = [
      { skillId: 'calisthenics', totalXp: 1500 },
      { skillId: 'weightlifting', totalXp: 500 },
      { skillId: 'calisthenics', totalXp: 999999 },
      { skillId: 'invented', totalXp: 999999 },
    ];
    expect(deriveHeroCombatStats(snapshot).attributes.strength).toBe(12);
  });

  it.each(['calisthenics', 'running', 'bjj', 'programming', 'meditation', 'recovery'])(
    'gives %s a combat contribution',
    (skillId) => {
      const snapshot = beginner();
      const before = deriveHeroCombatStats(snapshot);
      snapshot.skills = [{ skillId, totalXp: 10_000 }];
      const after = deriveHeroCombatStats(snapshot);
      expect(
        after.maxHp >= before.maxHp &&
          after.attack >= before.attack &&
          after.defense >= before.defense,
      ).toBe(true);
      expect(
        after.maxHp > before.maxHp ||
          after.attack > before.attack ||
          after.defense > before.defense,
      ).toBe(true);
    },
  );

  it('keeps presentation, skin, aura, hair and outfits cosmetic', () => {
    const snapshot = createMockSnapshot();
    const expected = createPracticeBattle(snapshot);
    snapshot.character.appearance = {
      ...snapshot.character.appearance,
      presentation: 'female',
      hair: 'another-hair',
      outfit: 'abyssal',
      aura: 'moss-spirit',
      skinColor: '#000000',
      hairColor: '#ffffff',
    };
    expect(createPracticeBattle(snapshot)).toEqual(expected);
  });

  it('uses all three boss phases as HP declines', () => {
    const replay = createPracticeBattle(createMockSnapshot());
    const bossTurns = replay.turns.filter((turn) => turn.actor === 'boss');
    expect(new Set(bossTurns.map((turn) => turn.bossPhase))).toEqual(
      new Set(['awakening', 'resistance', 'last-stand']),
    );
    expect(bossTurns.some((turn) => turn.action === 'stone-crash')).toBe(true);
    expect(bossTurns.some((turn) => turn.action === 'thorn-burst')).toBe(true);
    expect(bossTurns.find((turn) => turn.bossPhase === 'last-stand')!.damage).toBeGreaterThan(
      bossTurns[0].damage,
    );
  });

  it('defines exact boss phase boundaries', () => {
    expect(combatBossPhase(61, 100)).toBe('awakening');
    expect(combatBossPhase(60, 100)).toBe('resistance');
    expect(combatBossPhase(26, 100)).toBe('resistance');
    expect(combatBossPhase(25, 100)).toBe('last-stand');
    expect(combatBossPhase(0, 100)).toBe('defeated');
    expect(combatBossPhase(Number.NaN, 0)).toBe('defeated');
  });

  it('does not read or mutate weekly boss HP, activities, auras, XP or quests', () => {
    const snapshot = createMockSnapshot();
    snapshot.boss.hp = 0;
    const before = structuredClone(snapshot);
    const replay = createPracticeBattle(snapshot);
    expect(replay.initial.bossHp).toBe(560);
    expect(replay.turns.length).toBeGreaterThan(0);
    expect(snapshot).toEqual(before);
    // Consumer edits to replay values cannot reach the catalog or source snapshot.
    (replay.boss.stats as { attack: number }).attack = 0;
    (replay.hero.stats.attributes as { strength: number }).strength = 0;
    expect(MOSSWARDEN_BOSS.stats.attack).toBe(52);
    expect(snapshot).toEqual(before);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -500, 1e100])(
    'bounds unsafe numeric input %s',
    (value) => {
      const snapshot = beginner();
      snapshot.character.totalXp = value;
      snapshot.character.attributes.strength = value;
      snapshot.skills = [{ skillId: 'calisthenics', totalXp: value }];
      const replay = createPracticeBattle(snapshot, {
        heroHp: value,
        bossHp: value,
        maxRounds: value,
      });
      expect(replay.turns.length).toBeLessThanOrEqual(AUTO_BATTLE_LIMITS.maxRounds * 2);
      for (const number of [
        replay.hero.stats.level,
        replay.hero.stats.maxHp,
        replay.hero.stats.attack,
        replay.hero.stats.defense,
      ]) {
        expect(Number.isFinite(number) && Number.isInteger(number) && number >= 0).toBe(true);
      }
      for (const turn of replay.turns) {
        expect(Number.isInteger(turn.damage) && turn.damage > 0).toBe(true);
        expect(turn.heroHp).toBeGreaterThanOrEqual(0);
        expect(turn.heroHp).toBeLessThanOrEqual(replay.hero.stats.maxHp);
        expect(turn.bossHp).toBeGreaterThanOrEqual(0);
        expect(turn.bossHp).toBeLessThanOrEqual(replay.boss.stats.maxHp);
      }
    },
  );
});
