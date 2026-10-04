import { createMockSnapshot } from '../data/mock-data';
import { SKILLS } from './catalog';
import { normalizeCharacterProfile } from './character';
import {
  AURA_REWARDS,
  STARTER_AURA_IDS,
  grantActivityAuras,
  hasAuraAccess,
  isKnownAura,
} from './aura-rewards';
import { levelProgress, recordActivity } from './progression';

const level20Xp = 57000;
const level40Xp = 195000;

function nearLevel(totalXp: number) {
  const snapshot = createMockSnapshot();
  snapshot.character.totalXp = totalXp;
  snapshot.quests = [];
  return snapshot;
}

const workout = { requestId: 'rewarded-activity', skillId: 'calisthenics', minutes: 1 };

describe('earned aura rewards', () => {
  it.each([
    ['aurora', level20Xp, 20],
    ['starlight', level40Xp, 40],
  ] as const)(
    'earns %s exactly when an activity crosses its level boundary',
    (id, threshold, level) => {
      const before = nearLevel(threshold - 4);
      expect(levelProgress(before.character.totalXp).level).toBe(level - 1);
      const result = recordActivity(before, workout);
      expect(levelProgress(result.snapshot.character.totalXp).level).toBe(level);
      expect(result.snapshot.unlockedAuras).toEqual([id]);
      expect(before.unlockedAuras).toEqual([]);
      expect(result.reward.activityXp).toBe(4);
    },
  );

  it('does not grant a level aura one XP before the boundary', () => {
    const result = recordActivity(nearLevel(level20Xp - 5), workout);
    expect(result.snapshot.character.totalXp).toBe(level20Xp - 1);
    expect(result.snapshot.unlockedAuras).toEqual([]);
  });

  it('includes the once-only quest XP in an accepted level crossing', () => {
    const before = nearLevel(level20Xp - 54);
    before.quests = [{ ...createMockSnapshot().quests[0], progressMinutes: 19 }];
    const result = recordActivity(before, workout);
    expect(result.reward).toMatchObject({ activityXp: 4, questXp: 50 });
    expect(result.snapshot.unlockedAuras).toEqual(['aurora']);
  });

  it('handles several level thresholds in one accepted reward without changing the balance catalog', () => {
    const before = nearLevel(level20Xp - 1);
    const originalSkill = SKILLS.find((skill) => skill.id === workout.skillId)!;
    const testCatalog = [{ ...originalSkill, xpPerMinute: level40Xp - before.character.totalXp }];
    const result = recordActivity(before, workout, testCatalog);
    expect(result.snapshot.unlockedAuras).toEqual(['aurora', 'starlight', 'moss-spirit']);
    expect(levelProgress(result.snapshot.character.totalXp).level).toBe(40);
    expect(originalSkill.xpPerMinute).toBe(4);
  });

  it('does not backfill a level reward for a pre-existing high-level snapshot', () => {
    const before = nearLevel(level40Xp);
    expect(recordActivity(before, workout).snapshot.unlockedAuras).toEqual([]);
    expect(grantActivityAuras(before, structuredClone(before), 0)).toEqual([]);
  });

  it('drops Moosseele on the first actual Mooswächter victory', () => {
    const before = nearLevel(0);
    before.boss.hp = 8;
    const result = recordActivity(before, workout);
    expect(result.reward.damage).toBe(8);
    expect(result.snapshot.boss.hp).toBe(0);
    expect(result.snapshot.unlockedAuras).toEqual(['moss-spirit']);
  });

  it('awards level and boss auras in the same immutable transaction', () => {
    const before = nearLevel(level20Xp - 4);
    before.boss.hp = 8;
    const unchanged = structuredClone(before);
    const result = recordActivity(before, workout);
    expect(result.snapshot.unlockedAuras).toEqual(['aurora', 'moss-spirit']);
    expect(before).toEqual(unchanged);
  });

  it('does not drop a reward for a different boss or an already defeated encounter', () => {
    const wrongBoss = nearLevel(0);
    wrongBoss.boss = { ...wrongBoss.boss, id: 'unreleased-boss', hp: 1 };
    expect(recordActivity(wrongBoss, workout).snapshot.unlockedAuras).toEqual([]);
    const defeated = nearLevel(0);
    defeated.boss.hp = 0;
    expect(recordActivity(defeated, workout).snapshot.unlockedAuras).toEqual([]);
  });

  it('never adds the same aura twice, including repeated victories', () => {
    const before = nearLevel(level20Xp - 4);
    before.unlockedAuras = ['aurora', 'moss-spirit'];
    before.boss.hp = 1;
    const result = recordActivity(before, workout);
    expect(result.snapshot.unlockedAuras).toEqual(['aurora', 'moss-spirit']);
    const next = recordActivity(result.snapshot, { ...workout, requestId: 'next' });
    expect(next.snapshot.unlockedAuras).toEqual(['aurora', 'moss-spirit']);
  });

  it('does not reward duplicate request IDs or produce a new snapshot for a retry', () => {
    const first = recordActivity(nearLevel(level20Xp - 4), workout);
    const retry = recordActivity(first.snapshot, workout);
    expect(retry.reward.duplicate).toBe(true);
    expect(retry.snapshot).toBe(first.snapshot);
    expect(retry.snapshot.unlockedAuras).toEqual(['aurora']);
  });

  it('does not grant an aura to an activity beyond its daily XP cap', () => {
    const before = nearLevel(level20Xp - 1);
    before.boss.hp = 1;
    before.activities = [
      {
        requestId: 'daily-cap',
        skillId: 'calisthenics',
        minutes: 90,
        rewardedMinutes: 90,
        xp: 360,
        dayKey: before.dayKey,
      },
    ];
    const result = recordActivity(before, workout);
    expect(result.reward).toMatchObject({ activityXp: 0, damage: 0 });
    expect(result.snapshot.unlockedAuras).toEqual([]);
    expect(result.snapshot.boss.hp).toBe(1);
  });

  it.each([0, -1, NaN, Infinity])(
    'rejects reward grants without positive finite activity XP: %s',
    (xp) => {
      const before = nearLevel(level20Xp - 1);
      const after = structuredClone(before);
      after.character.totalXp = level40Xp;
      after.boss.hp = 0;
      expect(grantActivityAuras(before, after, xp)).toEqual([]);
    },
  );

  it('does not manufacture rewards when XP did not actually increase', () => {
    const before = nearLevel(0);
    const after = structuredClone(before);
    after.boss.hp = 0;
    expect(grantActivityAuras(before, after, 4)).toEqual([]);
  });
});

describe('aura ownership boundaries', () => {
  it('always allows the four starter auras without recording them as earned loot', () => {
    const snapshot = createMockSnapshot();
    expect(STARTER_AURA_IDS).toEqual(['none', 'sage', 'rose', 'void']);
    for (const auraId of STARTER_AURA_IDS) expect(hasAuraAccess(snapshot, auraId)).toBe(true);
    expect(snapshot.unlockedAuras).toEqual([]);
  });

  it('requires ownership for known reward IDs regardless of character level', () => {
    const snapshot = nearLevel(level40Xp);
    for (const aura of AURA_REWARDS) {
      expect(isKnownAura(aura.id)).toBe(true);
      expect(hasAuraAccess(snapshot, aura.id)).toBe(false);
    }
    snapshot.unlockedAuras = ['aurora', 'moss-spirit'];
    expect(hasAuraAccess(snapshot, 'aurora')).toBe(true);
    expect(hasAuraAccess(snapshot, 'moss-spirit')).toBe(true);
    expect(hasAuraAccess(snapshot, 'starlight')).toBe(false);
  });

  it.each(['stars', 'guardian', 'demonic', 'unreleased', ''])(
    'never treats preview/unknown ID %s as owned loot',
    (auraId) => {
      const snapshot = createMockSnapshot();
      snapshot.unlockedAuras = [auraId];
      expect(isKnownAura(auraId)).toBe(false);
      expect(hasAuraAccess(snapshot, auraId)).toBe(false);
      expect(() =>
        normalizeCharacterProfile({
          name: 'Ari',
          appearance: { ...snapshot.character.appearance, aura: auraId },
        }),
      ).toThrow('nicht verfügbar');
    },
  );
});
