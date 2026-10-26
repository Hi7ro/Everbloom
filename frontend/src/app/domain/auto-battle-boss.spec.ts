import { createMockSnapshot } from '../data/mock-data';
import { createBossBattle, createPracticeBattle, BattleTactic } from './auto-battle';
import { BOSS_CATALOG, BOSS_DIFFICULTIES, bossEncounter, BossId } from './boss-catalog';
import { GameSnapshot } from './models';

/** Conservative build: actual level XP with only starter attributes, no earned skill bonuses. */
function atLevel(level: number): GameSnapshot {
  const snapshot = createMockSnapshot();
  snapshot.character.totalXp = (level - 1) * 1200 + (level - 1) * (level - 2) * 100;
  snapshot.character.attributes = { strength: 1, endurance: 1, focus: 1, knowledge: 1, mindfulness: 1, recovery: 1 };
  snapshot.skills = [];
  return snapshot;
}

function encounterBuild(bossId: BossId, level: number): GameSnapshot {
  const snapshot = atLevel(level);
  if (bossEncounter(bossId).baseLevel >= 80) snapshot.skills = ['calisthenics', 'running', 'bjj', 'programming', 'meditation', 'recovery']
    .map(skillId => ({ skillId, totalXp: Math.floor(snapshot.character.totalXp * .35 / 6) }));
  return snapshot;
}

const encounters = BOSS_CATALOG.flatMap(boss => BOSS_DIFFICULTIES.map(mode => ({ bossId: boss.id, difficulty: mode.id })));

describe('authoritative boss resolver reference', () => {
  it.each(encounters)('$bossId / $difficulty is beatable at the recommended level with the intended progression build', options => {
    const encounter = bossEncounter(options.bossId, options.difficulty);
    const snapshot = encounterBuild(options.bossId, encounter.recommendedLevel);
    const before = structuredClone(snapshot);
    const result = createBossBattle(snapshot, options);
    expect(result.outcome).toBe('victory');
    expect(result.mode).toBe('boss');
    expect(result.difficulty).toBe(options.difficulty);
    expect(result.hero.stats.level).toBe(encounter.recommendedLevel);
    expect(result.boss.stats).toEqual(encounter.stats);
    expect(result.turns.at(-1)?.bossHp).toBe(0);
    expect(result.turns.at(-1)?.heroHp).toBeGreaterThan(0);
    expect(result.turns.length).toBeGreaterThan(4);
    expect(result.rewards).toEqual({ xp: 0, loot: [] });
    expect(result).toEqual(createBossBattle(snapshot, options));
    expect(snapshot).toEqual(before);
  });

  it.each(encounters)('$bossId / $difficulty enforces its minimum level even with inflated attributes', options => {
    const encounter = bossEncounter(options.bossId, options.difficulty);
    const below = atLevel(encounter.minimumLevel - 1);
    below.character.attributes = { strength: 1000, endurance: 1000, focus: 1000, knowledge: 1000, mindfulness: 1000, recovery: 1000 };
    expect(() => createBossBattle(below, options)).toThrow(`Level ${encounter.minimumLevel}`);
    expect(() => createBossBattle(atLevel(encounter.minimumLevel), options)).not.toThrow();
  });

  it.each(encounters)('$bossId / $difficulty becomes easier when the hero gains levels', options => {
    const encounter = bossEncounter(options.bossId, options.difficulty);
    const base = createBossBattle(encounterBuild(options.bossId, encounter.recommendedLevel), options);
    const stronger = createBossBattle(encounterBuild(options.bossId, encounter.recommendedLevel + 10), options);
    const muchStronger = createBossBattle(encounterBuild(options.bossId, encounter.recommendedLevel + 30), options);
    const healthRatio = (replay: typeof base) => replay.turns.at(-1)!.heroHp / replay.hero.stats.maxHp;
    expect(stronger.boss).toEqual(base.boss);
    expect(muchStronger.boss).toEqual(base.boss);
    expect(stronger.roundCount).toBeLessThanOrEqual(base.roundCount);
    expect(muchStronger.roundCount).toBeLessThanOrEqual(stronger.roundCount);
    expect(healthRatio(stronger)).toBeGreaterThan(healthRatio(base));
    expect(healthRatio(muchStronger)).toBeGreaterThan(healthRatio(stronger));
  });

  it('makes the first Ultimate encounter unavailable on level 39 and winnable on level 40', () => {
    expect(() => createBossBattle(atLevel(39), { bossId: 'mosswarden', difficulty: 'ultimate' })).toThrow('Level 40');
    const result = createBossBattle(atLevel(40), { bossId: 'mosswarden', difficulty: 'ultimate' });
    expect(result.outcome).toBe('victory');
    expect(result.boss.stats.maxHp).toBe(600);
  });

  it('requires level 80 for the cloud king on Ultimate and wins without skill bonuses at that level', () => {
    expect(() => createBossBattle(atLevel(79), { bossId: 'cloud-sovereign', difficulty: 'ultimate' })).toThrow('Level 80');
    expect(createBossBattle(atLevel(80), { bossId: 'cloud-sovereign', difficulty: 'ultimate' }).outcome).toBe('victory');
  });

  it('allows a harmless rehearsal below the gate but never changes the account', () => {
    const snapshot = atLevel(1);
    const before = structuredClone(snapshot);
    const result = createPracticeBattle(snapshot, { bossId: 'astral-sovereign', difficulty: 'ultimate' });
    expect(result.mode).toBe('practice');
    expect(result.outcome).toBe('defeat');
    expect(result.boss.stats.level).toBe(100);
    expect(result.rewards).toEqual({ xp: 0, loot: [] });
    expect(snapshot).toEqual(before);
  });

  it('all tactics remain bounded, deterministic and use the selected boss attacks', () => {
    for (const boss of BOSS_CATALOG) for (const tactic of ['balanced', 'power', 'guard'] as BattleTactic[]) {
      const snapshot = atLevel(boss.baseLevel);
      const options = { bossId: boss.id, tactic };
      const replay = createBossBattle(snapshot, options);
      expect(replay).toEqual(createBossBattle(snapshot, options));
      expect(replay.turns.length).toBeLessThanOrEqual(40);
      const firstBossAction = replay.turns.find(turn => turn.actor === 'boss')!;
      expect(firstBossAction.label).toBe({ mosswarden: 'Wurzelhieb', emberwyrm: 'Klauenhieb', 'dusk-prowler': 'Säbelbiss', 'bloodmoon-regent': 'Rubinklinge', 'void-devourer': 'Leerenriss', 'primordial-dragon': 'Urklauen · zwei Treffer', 'relic-sovereign': 'Reliktsalve · drei Treffer', 'astral-sovereign': 'Astralklinge', 'frost-titan': 'Eishieb', 'cloud-sovereign': 'Goldene Stabkombo · zwei Treffer' }[boss.id]);
    }
  });
});
