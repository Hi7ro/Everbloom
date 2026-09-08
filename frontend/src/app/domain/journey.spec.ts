import { SKILLS } from './catalog';
import {
  DEFAULT_JOURNEY,
  INTERESTS,
  MAX_ACTIVE_SKILLS,
  normalizeJourneyPreferences,
  resolvePrimaryAvatarInterest,
} from './journey';

describe('journey preference boundaries', () => {
  it('preserves input order, clones arrays and accepts only preference fields', () => {
    const input = {
      interestIds: Object.freeze(['knowledge', 'physical', 'mind']),
      activeSkillIds: Object.freeze(['programming', 'calisthenics', 'meditation']),
      primaryInterestId: 'mind',
      totalXp: 999999,
      character: { artwork: 'custom' },
    };
    const before = structuredClone(input);
    const result = normalizeJourneyPreferences(input);
    expect(result).toEqual({
      interestIds: ['knowledge', 'physical', 'mind'],
      activeSkillIds: ['programming', 'calisthenics', 'meditation'],
      primaryInterestId: 'mind',
    });
    expect(input).toEqual(before);
    expect(result.interestIds).not.toBe(input.interestIds);
    expect(result.activeSkillIds).not.toBe(input.activeSkillIds);
  });

  it('accepts the defaults and the maximum supported selections', () => {
    expect(normalizeJourneyPreferences(DEFAULT_JOURNEY)).toEqual({
      interestIds: ['physical', 'mind', 'knowledge'],
      activeSkillIds: ['calisthenics', 'running', 'meditation', 'programming'],
      primaryInterestId: 'physical',
    });
    const activeSkillIds = SKILLS.slice(0, MAX_ACTIVE_SKILLS).map((skill) => skill.id);
    expect(activeSkillIds).toHaveLength(6);
    expect(
      normalizeJourneyPreferences({
        interestIds: INTERESTS.map((interest) => interest.id),
        activeSkillIds,
        primaryInterestId: 'life',
      }),
    ).toEqual({
      interestIds: ['physical', 'combat', 'mind', 'knowledge', 'creative', 'career', 'life'],
      activeSkillIds,
      primaryInterestId: 'life',
    });
  });

  it.each([
    null,
    [],
    {},
    { ...DEFAULT_JOURNEY, interestIds: [] },
    { ...DEFAULT_JOURNEY, activeSkillIds: [] },
    { ...DEFAULT_JOURNEY, interestIds: ['physical', 'unknown'] },
    { ...DEFAULT_JOURNEY, activeSkillIds: ['unknown'] },
    { ...DEFAULT_JOURNEY, interestIds: ['physical', 'physical'] },
    { ...DEFAULT_JOURNEY, activeSkillIds: ['running', 'running'] },
    { ...DEFAULT_JOURNEY, activeSkillIds: ['running', 5] },
    { ...DEFAULT_JOURNEY, primaryInterestId: 'combat' },
    { ...DEFAULT_JOURNEY, primaryInterestId: null },
    { ...DEFAULT_JOURNEY, interestIds: Array(8).fill('physical') },
    { ...DEFAULT_JOURNEY, activeSkillIds: Array(7).fill('running') },
  ])('rejects invalid selections %j', (input) => {
    expect(() => normalizeJourneyPreferences(input)).toThrow(/Bitte|Dein/);
  });

  it('reports duplicates, maximum size and missing primary interest clearly in German', () => {
    expect(() =>
      normalizeJourneyPreferences({ ...DEFAULT_JOURNEY, activeSkillIds: ['running', 'running'] }),
    ).toThrow('nur einmal');
    expect(() =>
      normalizeJourneyPreferences({ ...DEFAULT_JOURNEY, activeSkillIds: Array(7).fill('running') }),
    ).toThrow('1–6');
    expect(() =>
      normalizeJourneyPreferences({ ...DEFAULT_JOURNEY, primaryInterestId: 'life' }),
    ).toThrow('Schwerpunkt');
  });

  it('maps each primary interest to the agreed avatar context without modifying preferences', () => {
    const expected: Record<string, string> = {
      physical: 'calisthenics',
      combat: 'boxing',
      mind: 'recovery',
      knowledge: 'reading',
      creative: 'creative',
      career: 'career',
      life: 'adventurer',
    };
    for (const interest of INTERESTS) {
      const preferences = normalizeJourneyPreferences({
        interestIds: [interest.id],
        activeSkillIds: ['running'],
        primaryInterestId: interest.id,
      });
      const before = structuredClone(preferences);
      expect(resolvePrimaryAvatarInterest(preferences)).toBe(expected[interest.id]);
      expect(preferences).toEqual(before);
    }
  });
});
