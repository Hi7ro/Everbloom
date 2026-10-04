import { createMockSnapshot } from '../data/mock-data';
import { recordActivity } from './progression';
import { detectMilestones } from './milestones';

describe('meaningful progress milestones', () => {
  it('celebrates an earned aura once alongside the actual boss victory', () => {
    const before = createMockSnapshot();
    before.boss.hp = 8;
    const command = { requestId: 'moss-reward', skillId: 'calisthenics', minutes: 1 };
    const after = recordActivity(before, command).snapshot;
    const unlocks = detectMilestones(before, after).filter((event) => event.kind === 'aura-unlock');
    expect(unlocks).toEqual([
      {
        kind: 'aura-unlock',
        title: 'Neue Aura freigeschaltet!',
        detail: 'Moosseele gehört jetzt dir. Du kannst sie bei deinem Charakter anlegen.',
      },
    ]);
    expect(detectMilestones(after, recordActivity(after, command).snapshot)).toEqual([]);
  });
  it('does not celebrate collection-only edits, unknown IDs or already owned auras', () => {
    const before = createMockSnapshot();
    const loaded = structuredClone(before);
    loaded.unlockedAuras = ['aurora'];
    expect(detectMilestones(before, loaded)).toEqual([]);
    const after = recordActivity(before, {
      requestId: 'one',
      skillId: 'meditation',
      minutes: 1,
    }).snapshot;
    after.unlockedAuras = ['guardian'];
    expect(detectMilestones(before, after).some((event) => event.kind === 'aura-unlock')).toBe(
      false,
    );
    before.unlockedAuras = ['aurora'];
    after.unlockedAuras = ['aurora'];
    expect(detectMilestones(before, after).some((event) => event.kind === 'aura-unlock')).toBe(
      false,
    );
  });
  it('never celebrates an unchanged or merely loaded snapshot', () => {
    const state = createMockSnapshot();
    expect(detectMilestones(state, structuredClone(state))).toEqual([]);
  });
  it('celebrates the first rewarded activity once per day', () => {
    const state = createMockSnapshot();
    const first = recordActivity(state, {
      requestId: 'first',
      skillId: 'meditation',
      minutes: 10,
    }).snapshot;
    expect(detectMilestones(state, first).map((m) => m.kind)).toEqual(['first-activity']);
    const next = recordActivity(first, {
      requestId: 'next',
      skillId: 'meditation',
      minutes: 10,
    }).snapshot;
    expect(detectMilestones(first, next)).toEqual([]);
  });
  it('groups multi-level progress, all daily quests and a boss victory from one action', () => {
    const state = createMockSnapshot();
    const after = structuredClone(state);
    after.character.totalXp += 12000;
    after.skills[0].totalXp += 5000;
    after.quests = after.quests.map((q) => ({
      ...q,
      progressMinutes: q.targetMinutes,
      claimed: true,
    }));
    after.boss.hp = 0;
    const result = detectMilestones(state, after);
    expect(result.map((m) => m.kind)).toEqual([
      'character-level',
      'skill-level',
      'boss-victory',
      'daily-quests',
    ]);
    expect(result.filter((m) => m.kind === 'character-level')).toHaveLength(1);
    expect(result.filter((m) => m.kind === 'skill-level')).toHaveLength(1);
    expect(detectMilestones(after, structuredClone(after))).toEqual([]);
  });
  it('does not celebrate normal XP, a partial quest or a boss phase change', () => {
    const state = createMockSnapshot();
    state.activities = [
      {
        requestId: 'existing',
        skillId: 'running',
        minutes: 1,
        rewardedMinutes: 1,
        xp: 3,
        dayKey: state.dayKey,
      },
    ];
    const after = recordActivity(state, {
      requestId: 'next',
      skillId: 'meditation',
      minutes: 1,
    }).snapshot;
    after.boss.hp = 1000;
    expect(detectMilestones(state, after)).toEqual([]);
  });
  it('does not mistake an empty quest list or a different defeated encounter for completion', () => {
    const state = createMockSnapshot();
    const after = structuredClone(state);
    after.quests = [];
    after.boss = { ...after.boss, id: 'other', hp: 0 };
    expect(detectMilestones(state, after)).toEqual([]);
  });
});
