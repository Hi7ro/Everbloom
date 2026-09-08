import { createMockSnapshot } from '../data/mock-data';
import { BALANCE } from './catalog';
import { bossPhase, levelProgress, recordActivity } from './progression';

describe('progression rules', () => {
  it.each([60, 90])('paces a %i-minute workout across several sessions per level', (minutes) => {
    const before = createMockSnapshot();
    const { snapshot, reward } = recordActivity(before, {
      requestId: 'long-workout',
      skillId: 'calisthenics',
      minutes,
    });
    const character = levelProgress(before.character.totalXp);
    const skill = before.skills.find((s) => s.skillId === 'calisthenics')!;
    const skillLevel = levelProgress(skill.totalXp, BALANCE.skillBase, BALANCE.skillStep);
    const characterFraction = (reward.activityXp + reward.questXp) / character.required;
    const skillFraction = reward.activityXp / skillLevel.required;
    expect(characterFraction).toBeGreaterThanOrEqual(0.08);
    expect(characterFraction).toBeLessThanOrEqual(0.13);
    expect(skillFraction).toBeGreaterThanOrEqual(0.1);
    expect(skillFraction).toBeLessThanOrEqual(0.17);
    expect(reward.activityXp).toBe(minutes * 4);
    expect(reward.questXp).toBe(50);
    expect(levelProgress(snapshot.character.totalXp).level).toBe(12);
    expect(
      levelProgress(
        snapshot.skills.find((s) => s.skillId === 'calisthenics')!.totalXp,
        BALANCE.skillBase,
        BALANCE.skillStep,
      ).level,
    ).toBe(9);
  });
  it('keeps even a 90-minute workout below 40% of either first-level bar', () => {
    const initial = createMockSnapshot();
    initial.character.totalXp = 0;
    initial.skills = initial.skills.map((s) => ({ ...s, totalXp: 0 }));
    const { snapshot } = recordActivity(initial, {
      requestId: 'beginner',
      skillId: 'calisthenics',
      minutes: 90,
    });
    expect(levelProgress(snapshot.character.totalXp)).toMatchObject({ level: 1, xp: 410 });
    expect(levelProgress(snapshot.character.totalXp).percent).toBeLessThan(40);
    expect(
      levelProgress(snapshot.skills[0].totalXp, BALANCE.skillBase, BALANCE.skillStep),
    ).toMatchObject({ level: 1, xp: 360, percent: 36 });
  });
  it('counts 90 minutes across entries, with no benefit from splitting a workout', () => {
    const initial = createMockSnapshot();
    const whole = recordActivity(initial, {
      requestId: 'whole',
      skillId: 'calisthenics',
      minutes: 90,
    });
    const first = recordActivity(initial, {
      requestId: 'part-1',
      skillId: 'calisthenics',
      minutes: 60,
    });
    const second = recordActivity(first.snapshot, {
      requestId: 'part-2',
      skillId: 'calisthenics',
      minutes: 30,
    });
    expect(second.snapshot.character).toEqual(whole.snapshot.character);
    expect(second.snapshot.skills).toEqual(whole.snapshot.skills);
    expect(second.snapshot.boss).toEqual(whole.snapshot.boss);
    expect(second.snapshot.quests).toEqual(whole.snapshot.quests);
    const extra = recordActivity(second.snapshot, {
      requestId: 'extra',
      skillId: 'calisthenics',
      minutes: 30,
    });
    expect(extra.reward).toMatchObject({
      activityXp: 0,
      questXp: 0,
      damage: 0,
      rewardedMinutes: 0,
    });
    expect(extra.snapshot.activities[0].minutes).toBe(30);
  });
  it('still levels up a nearly full bar and carries the surplus forward', () => {
    const initial = createMockSnapshot();
    initial.character.totalXp = 27550; // Level 12, 50 XP left.
    initial.skills[0].totalXp = 14350; // Skill 9, 50 XP left.
    const { snapshot } = recordActivity(initial, {
      requestId: 'level-up',
      skillId: 'calisthenics',
      minutes: 60,
    });
    expect(levelProgress(snapshot.character.totalXp)).toMatchObject({ level: 13, xp: 240 });
    expect(
      levelProgress(snapshot.skills[0].totalXp, BALANCE.skillBase, BALANCE.skillStep),
    ).toMatchObject({ level: 10, xp: 190 });
  });
  it('derives exact boundaries and multiple level-ups from total XP', () => {
    expect(levelProgress(0)).toMatchObject({ level: 1, xp: 0, required: 1200 });
    expect(levelProgress(1199)).toMatchObject({ level: 1, xp: 1199, required: 1200 });
    expect(levelProgress(1200)).toMatchObject({ level: 2, xp: 0, required: 1400 });
    expect(levelProgress(4210)).toMatchObject({ level: 4, xp: 10, required: 1800 });
    expect(levelProgress(2150, BALANCE.skillBase, BALANCE.skillStep)).toMatchObject({
      level: 3,
      xp: 0,
      required: 1300,
    });
  });
  it('records meditation and all rewards atomically without mutating the input', () => {
    const before = createMockSnapshot();
    const unchanged = structuredClone(before);
    const { snapshot, reward } = recordActivity(before, {
      requestId: 'meditate',
      skillId: 'meditation',
      minutes: 10,
    });
    expect(before).toEqual(unchanged);
    expect(reward).toEqual({
      activityXp: 30,
      questXp: 30,
      damage: 60,
      rewardedMinutes: 10,
      duplicate: false,
    });
    expect(snapshot.character.totalXp).toBe(before.character.totalXp + 60);
    expect(snapshot.skills.find((s) => s.skillId === 'meditation')?.totalXp).toBe(5463);
    expect(snapshot.quests.find((q) => q.skillId === 'meditation')).toMatchObject({
      claimed: true,
      progressMinutes: 10,
    });
    expect(snapshot.boss.hp).toBe(1400);
    expect(snapshot.momentum.value).toBe(81);
    expect(snapshot.activities).toHaveLength(1);
  });
  it('does not repeat a quest bonus or the daily momentum bonus', () => {
    const first = recordActivity(createMockSnapshot(), {
      requestId: 'one',
      skillId: 'meditation',
      minutes: 10,
    });
    const second = recordActivity(first.snapshot, {
      requestId: 'two',
      skillId: 'meditation',
      minutes: 10,
    });
    expect(second.reward.questXp).toBe(0);
    expect(second.snapshot.momentum.value).toBe(81);
  });
  it('makes repeated requests idempotent and rejects conflicting payloads', () => {
    const command = { requestId: 'same', skillId: 'running', minutes: 20 };
    const first = recordActivity(createMockSnapshot(), command);
    const again = recordActivity(first.snapshot, command);
    expect(again.snapshot).toEqual(first.snapshot);
    expect(again.reward.duplicate).toBe(true);
    expect(again.reward.activityXp).toBe(0);
    expect(() => recordActivity(first.snapshot, { ...command, minutes: 21 })).toThrow(
      /andere Aktivität/,
    );
  });
  it('caps daily rewards across entries but retains all recorded minutes', () => {
    const first = recordActivity(createMockSnapshot(), {
      requestId: 'one',
      skillId: 'meditation',
      minutes: 25,
    });
    const second = recordActivity(first.snapshot, {
      requestId: 'two',
      skillId: 'meditation',
      minutes: 20,
    });
    expect(second.reward.rewardedMinutes).toBe(5);
    expect(second.reward.activityXp).toBe(15);
    expect(second.snapshot.activities[0].minutes).toBe(20);
    const third = recordActivity(second.snapshot, {
      requestId: 'three',
      skillId: 'meditation',
      minutes: 10,
    });
    expect(third.reward).toMatchObject({ activityXp: 0, questXp: 0, damage: 0 });
    expect(third.snapshot.activities).toHaveLength(3);
  });
  it.each([0, -1, 1.5, 181, NaN, Infinity])('rejects invalid duration %s', (minutes) => {
    expect(() =>
      recordActivity(createMockSnapshot(), { requestId: 'invalid', skillId: 'running', minutes }),
    ).toThrow(/ganze Minuten/);
  });
  it('rejects unknown skills and blank request IDs', () => {
    expect(() =>
      recordActivity(createMockSnapshot(), { requestId: 'x', skillId: 'unknown', minutes: 10 }),
    ).toThrow(/aktiven Skill/);
    expect(() =>
      recordActivity(createMockSnapshot(), { requestId: ' ', skillId: 'running', minutes: 10 }),
    ).toThrow(/Eintrags-ID/);
  });
  it('stops damage at zero HP and bounds momentum at 100', () => {
    const initial = createMockSnapshot();
    initial.boss.hp = 10;
    initial.momentum.value = 99;
    const first = recordActivity(initial, {
      requestId: 'victory',
      skillId: 'running',
      minutes: 20,
    });
    expect(first.snapshot.boss.hp).toBe(0);
    expect(first.reward.damage).toBe(10);
    expect(first.snapshot.momentum.value).toBe(100);
    const second = recordActivity(first.snapshot, {
      requestId: 'after',
      skillId: 'running',
      minutes: 10,
    });
    expect(second.reward.damage).toBe(0);
    expect(second.reward.activityXp).toBe(30);
  });
  it('shows all phase thresholds including victory', () => {
    expect(bossPhase(61, 100)).toBe('Erwachen');
    expect(bossPhase(60, 100)).toBe('Widerstand');
    expect(bossPhase(25, 100)).toBe('Letzter Widerstand');
    expect(bossPhase(0, 100)).toBe('Besiegt');
  });
});
