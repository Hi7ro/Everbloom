import { createMockSnapshot } from '../data/mock-data';
import { createBossBattle } from './auto-battle';
import { BOSS_DIFFICULTIES, bossEncounter } from './boss-catalog';

function build(level: number, skillShare = 0) {
  const snapshot = createMockSnapshot();
  snapshot.character.totalXp = (level - 1) * 1200 + (level - 1) * (level - 2) * 100;
  snapshot.character.attributes = { strength: 1, endurance: 1, focus: 1, knowledge: 1, mindfulness: 1, recovery: 1 };
  snapshot.skills = skillShare ? ['calisthenics', 'running', 'bjj', 'programming', 'meditation', 'recovery']
    .map(skillId => ({ skillId, totalXp: Math.floor(snapshot.character.totalXp * skillShare / 6) })) : [];
  return snapshot;
}

describe('cloud sovereign finale', () => {
  it('requires developed skills at level 50, while level 55 provides a conservative recommendation', () => {
    expect(createBossBattle(build(50), { bossId: 'cloud-sovereign' }).outcome).toBe('defeat');
    expect(createBossBattle(build(50, .35), { bossId: 'cloud-sovereign' }).outcome).toBe('victory');
    expect(createBossBattle(build(55), { bossId: 'cloud-sovereign' }).outcome).toBe('victory');
  });

  it.each(BOSS_DIFFICULTIES)('$id keeps its entry gate but offers the full deterministic finale mechanic', mode => {
    const encounter = bossEncounter('cloud-sovereign', mode.id);
    const replay = createBossBattle(build(encounter.recommendedLevel), { bossId: 'cloud-sovereign', difficulty: mode.id });
    expect(replay.outcome).toBe('victory');
    const bossTurns = replay.turns.filter(turn => turn.actor === 'boss');
    expect(new Set(bossTurns.map(turn => turn.abilityId))).toEqual(new Set(['staff-combo', 'cloud-step', 'solar-charge', 'solar-strike']));
    for (let index = 0; index < bossTurns.length; index++) {
      if (bossTurns[index].abilityId === 'solar-strike') {
        expect(bossTurns[index - 1]?.abilityId).toBe('solar-charge');
        expect(bossTurns[index - 1].damage).toBe(0);
        expect(bossTurns[index].damage).toBeGreaterThan(0);
      }
    }
    expect(replay.turns.some(turn => turn.abilityId === 'guarded-strike')).toBe(true);
  });

  it('uses a genuine two-hit staff combo, one guarded attack and a visible non-damaging charge', () => {
    const replay = createBossBattle(build(50), { bossId: 'cloud-sovereign' });
    expect(replay.turns[0].damage).toBe(128);
    expect(replay.turns[1]).toMatchObject({ abilityId: 'staff-combo', damage: 70, heroHp: 755 });
    expect(replay.turns[3]).toMatchObject({ abilityId: 'cloud-step', damage: 31 });
    expect(replay.turns[4]).toMatchObject({ abilityId: 'guarded-strike', damage: 83 });
    expect(replay.turns[6].abilityId).toBeUndefined();
    expect(replay.turns[6].damage).toBe(128);
    expect(replay.turns[7]).toMatchObject({ abilityId: 'solar-charge', damage: 0, heroHp: 654 });
    expect(replay.turns[9]).toMatchObject({ abilityId: 'solar-strike', damage: 283, critical: true });
    expect(replay.turns.filter(turn => turn.abilityId === 'guarded-strike').every(turn => turn.damage > 0)).toBe(true);
  });

  it('lets a trained build choose any tactic at level 50 while preserving meaningful tradeoffs', () => {
    const results = ['balanced', 'power', 'guard'].map(tactic => createBossBattle(build(50, .35), {
      bossId: 'cloud-sovereign', tactic: tactic as 'balanced' | 'power' | 'guard',
    }));
    expect(results.map(result => result.outcome)).toEqual(['victory', 'victory', 'victory']);
    expect(results.map(result => result.roundCount)).toEqual([10, 7, 13]);
    expect(new Set(results.map(result => result.turns.at(-1)?.heroHp)).size).toBe(3);
  });
});
