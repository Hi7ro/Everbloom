import { createMockSnapshot } from '../data/mock-data';
import { SKILLS } from './catalog';
import { createBossBattle } from './auto-battle';
import { deriveCombatVisualProfile } from './combat-visual-profile';

function starter() {
  const snapshot = createMockSnapshot();
  snapshot.character.totalXp = 0;
  snapshot.skills = [];
  return snapshot;
}

describe('combat visual profile', () => {
  it('uses a calm first-tier strike for a new character without inventing an earned skill', () => {
    expect(deriveCombatVisualProfile(starter())).toEqual({
      style: 'strength', tier: 1, abilityName: 'Krafthieb', skillId: null, skillName: null,
    });
  });

  it.each([
    ['boxing', 'martial', 'Fokuskombo'], ['bjj', 'martial', 'Fokuskombo'],
    ['calisthenics', 'strength', 'Krafthieb'], ['weightlifting', 'strength', 'Krafthieb'],
    ['running', 'endurance', 'Windschritt'], ['swimming', 'endurance', 'Windschritt'],
    ['programming', 'arcane', 'Lichtimpuls'], ['reading', 'arcane', 'Lichtimpuls'],
    ['languages', 'arcane', 'Lichtimpuls'], ['meditation', 'arcane', 'Lichtimpuls'],
    ['breathwork', 'arcane', 'Lichtimpuls'], ['recovery', 'arcane', 'Lichtimpuls'],
    ['healthy-cooking', 'arcane', 'Lichtimpuls'], ['music', 'arcane', 'Lichtimpuls'],
  ])('makes earned %s experience visible as %s', (skillId, style, abilityName) => {
    const snapshot = starter();
    snapshot.skills = [{ skillId, totalXp: 800 }];
    expect(deriveCombatVisualProfile(snapshot)).toEqual({
      style, tier: 1, abilityName, skillId, skillName: SKILLS.find(skill => skill.id === skillId)!.name,
    });
  });

  it('follows the strongest skill and breaks ties independently of snapshot ordering', () => {
    const snapshot = starter();
    snapshot.skills = [{ skillId: 'programming', totalXp: 700 }, { skillId: 'boxing', totalXp: 699 }];
    expect(deriveCombatVisualProfile(snapshot).style).toBe('arcane');
    snapshot.skills[1].totalXp = 700;
    const profile = deriveCombatVisualProfile(snapshot);
    expect(profile.skillId).toBe('boxing');
    snapshot.skills.reverse();
    expect(deriveCombatVisualProfile(snapshot)).toEqual(profile);
  });

  it.each([
    [56_999, 1, 'Krafthieb'], [57_000, 2, 'Titanenhieb'],
    [194_999, 2, 'Titanenhieb'], [195_000, 3, 'Erdbebenstoß'],
  ])('character XP %i selects tier %i at exact level 20/40 boundaries', (xp, tier, abilityName) => {
    const snapshot = starter();
    snapshot.character.totalXp = xp as number;
    expect(deriveCombatVisualProfile(snapshot)).toMatchObject({ tier, abilityName });
  });

  it.each([
    [14_399, 1, 'Lichtimpuls'], [14_400, 2, 'Runenstoß'],
    [44_649, 2, 'Runenstoß'], [44_650, 3, 'Astralnova'],
  ])('skill XP %i selects tier %i at exact skill level 10/20 boundaries', (xp, tier, abilityName) => {
    const snapshot = starter();
    snapshot.skills = [{ skillId: 'reading', totalXp: xp as number }];
    expect(deriveCombatVisualProfile(snapshot)).toMatchObject({ tier, abilityName, skillId: 'reading' });
  });

  it('ignores unknown skills, invalid XP and duplicate inflation', () => {
    const snapshot = starter();
    snapshot.character.totalXp = Number.NaN;
    snapshot.skills = [
      { skillId: 'invented', totalXp: 10_000_000 },
      { skillId: 'boxing', totalXp: -10 }, { skillId: 'bjj', totalXp: Number.POSITIVE_INFINITY },
      { skillId: 'running', totalXp: 10 }, { skillId: 'running', totalXp: 1_000_000 },
      { skillId: 'programming', totalXp: Number.NaN },
    ];
    expect(deriveCombatVisualProfile(snapshot)).toMatchObject({ style: 'endurance', tier: 1, skillId: 'running' });
  });

  it('does not modify the snapshot, combat replay, damage or rewards', () => {
    const snapshot = createMockSnapshot();
    const before = structuredClone(snapshot);
    const replay = createBossBattle(snapshot, { bossId: 'mosswarden' });
    const profile = deriveCombatVisualProfile(snapshot);
    expect(profile).toEqual(deriveCombatVisualProfile(snapshot));
    expect(snapshot).toEqual(before);
    expect(createBossBattle(snapshot, { bossId: 'mosswarden' })).toEqual(replay);
  });
});
