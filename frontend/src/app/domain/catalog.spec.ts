import { createMockSnapshot } from '../data/mock-data';
import { ATTRIBUTES, BALANCE, SKILLS } from './catalog';
import { recordActivity } from './progression';

const additions = [
  ['weightlifting', 4, 90],
  ['swimming', 3, 60],
  ['boxing', 3, 60],
  ['bjj', 3, 60],
  ['breathwork', 2, 15],
  ['recovery', 2, 30],
  ['reading', 2, 60],
  ['languages', 2, 60],
  ['healthy-cooking', 2, 45],
  ['music', 2, 60],
] as const;

describe('expanded skill catalog', () => {
  it('contains unique complete skills with bounded integer reward rules and known attributes', () => {
    expect(SKILLS).toHaveLength(14);
    expect(new Set(SKILLS.map((skill) => skill.id)).size).toBe(SKILLS.length);
    for (const skill of SKILLS) {
      expect(skill.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(skill.name.trim()).not.toBe('');
      expect(skill.family.trim()).not.toBe('');
      expect(skill.symbol.trim()).not.toBe('');
      expect(skill.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(ATTRIBUTES.some((attribute) => attribute.id === skill.attribute)).toBe(true);
      expect(Number.isInteger(skill.xpPerMinute)).toBe(true);
      expect(skill.xpPerMinute).toBeGreaterThan(0);
      expect(skill.xpPerMinute).toBeLessThanOrEqual(4);
      expect(Number.isInteger(skill.dailyMinuteLimit)).toBe(true);
      expect(skill.dailyMinuteLimit).toBeGreaterThan(0);
      expect(skill.dailyMinuteLimit).toBeLessThanOrEqual(BALANCE.maxMinutesPerEntry);
    }
  });

  it('seeds the complete catalog while retaining the exact four original XP totals', () => {
    const snapshot = createMockSnapshot();
    expect(snapshot.skills.map((skill) => skill.skillId)).toEqual(SKILLS.map((skill) => skill.id));
    expect(snapshot.skills.slice(0, 4)).toEqual([
      { skillId: 'calisthenics', totalXp: 13813 },
      { skillId: 'running', totalXp: 8804 },
      { skillId: 'meditation', totalXp: 5433 },
      { skillId: 'programming', totalXp: 14400 },
    ]);
    expect(snapshot.skills.slice(4)).toHaveLength(10);
    expect(snapshot.skills.slice(4).every((skill) => skill.totalXp === 0)).toBe(true);
    expect(snapshot.character.totalXp).toBe(25926);
  });

  it.each(additions)('records %s with its intended rewards, caps and duplicate protection', (skillId, rate, limit) => {
    const before = createMockSnapshot();
    const once = recordActivity(before, { requestId: 'whole', skillId, minutes: limit });
    const expectedXp = rate * limit;
    expect(once.reward).toMatchObject({ activityXp: expectedXp, questXp: 0, damage: expectedXp * 2, rewardedMinutes: limit, duplicate: false });
    expect(once.snapshot.skills.find((skill) => skill.skillId === skillId)?.totalXp).toBe(expectedXp);
    expect(once.snapshot.character.totalXp).toBe(before.character.totalXp + expectedXp);
    expect(once.snapshot.quests).toEqual(before.quests);

    const duplicate = recordActivity(once.snapshot, { requestId: 'whole', skillId, minutes: limit });
    expect(duplicate.snapshot).toBe(once.snapshot);
    expect(duplicate.reward).toMatchObject({ activityXp: 0, questXp: 0, damage: 0, duplicate: true });

    const firstMinutes = Math.floor(limit / 2);
    const first = recordActivity(before, { requestId: 'split-1', skillId, minutes: firstMinutes });
    const second = recordActivity(first.snapshot, { requestId: 'split-2', skillId, minutes: limit - firstMinutes + 5 });
    expect(second.reward.rewardedMinutes).toBe(limit - firstMinutes);
    expect(second.snapshot.character).toEqual(once.snapshot.character);
    expect(second.snapshot.skills).toEqual(once.snapshot.skills);
    expect(second.snapshot.boss).toEqual(once.snapshot.boss);
    const extra = recordActivity(second.snapshot, { requestId: 'extra', skillId, minutes: 10 });
    expect(extra.reward).toMatchObject({ activityXp: 0, questXp: 0, damage: 0, rewardedMinutes: 0 });
    expect(extra.snapshot.activities[0].minutes).toBe(10);
    expect(extra.snapshot.character).toEqual(once.snapshot.character);
  });

  it.each([[60, 240], [90, 360]])('keeps %i minutes of Calisthenics at %i activity XP', (minutes, expectedXp) => {
    const result = recordActivity(createMockSnapshot(), { requestId: 'unchanged-calisthenics', skillId: 'calisthenics', minutes });
    expect(result.reward.activityXp).toBe(expectedXp);
    expect(result.reward.questXp).toBe(50);
  });
});
