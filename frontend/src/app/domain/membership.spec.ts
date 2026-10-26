import { createMockSnapshot } from '../data/mock-data';
import { buildDailyAdventure } from './daily-adventure';
import { recordActivity } from './progression';
import { SKILLS } from './catalog';
import { membershipBonus, readMembershipState, MembershipState } from './membership';

const preview: MembershipState = { mode: 'preview', active: false, verifiedAt: null,
  expiresAt: null, willRenew: null, store: null, managementUrl: null,
  characterXpBonusPercent: 0, advancedBosses: true, purchaseConfig: null };

describe('membership contract', () => {
  it('keeps the preview free without granting paid XP', () => {
    expect(readMembershipState(preview).advancedBosses).toBe(true);
    expect(membershipBonus(180, 0)).toBe(0);
  });
  it('awards only whole character bonus XP from a capped activity', () => {
    expect(membershipBonus(180, 10)).toBe(18);
    expect(membershipBonus(45, 10)).toBe(4);
    expect(membershipBonus(0, 10)).toBe(0);
    expect(membershipBonus(-20, 10)).toBe(0);
    expect(membershipBonus(20, 100)).toBe(0);
  });
  it('rejects contradictory provider state and malformed dates', () => {
    expect(() => readMembershipState({ ...preview, active: true })).toThrow();
    expect(() => readMembershipState({ ...preview, mode: 'live' })).toThrow();
    expect(() => readMembershipState({ ...preview, expiresAt: 'tomorrow' })).toThrow();
    expect(() => readMembershipState({ ...preview, purchaseConfig: {} })).toThrow();
  });
  it('adds 8 character XP to an 80 XP activity while preserving its 50 XP quest and combat damage', () => {
    const snapshot = createMockSnapshot();
    const command = { requestId: 'plus-preview', skillId: 'calisthenics', minutes: 20 };
    const free = recordActivity(snapshot, command);
    const plus = recordActivity(snapshot, command, SKILLS, 10);
    expect(plus.reward).toMatchObject({ activityXp: 80, questXp: 50, membershipXp: 8, damage: 160 });
    expect(plus.snapshot.character.totalXp - free.snapshot.character.totalXp).toBe(8);
    expect(plus.snapshot.skills).toEqual(free.snapshot.skills);
    expect(plus.snapshot.boss).toEqual(free.snapshot.boss);
    expect(plus.snapshot.activities[0].membershipXp).toBe(8);
    const preview = buildDailyAdventure(snapshot, ['calisthenics'], 'balanced', 10).recommendations[0].preview;
    expect(preview).toMatchObject({ totalXp: 138, membershipXp: 8, questXp: 50, bossDamage: 160 });
    const retry = recordActivity(plus.snapshot, command, SKILLS, 10);
    expect(retry.snapshot).toBe(plus.snapshot);
    expect(retry.reward.activityXp).toBe(0);
    expect(retry.reward.membershipXp ?? 0).toBe(0);
  });

});
