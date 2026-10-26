import { TestBed } from '@angular/core/testing';
import { createMockSnapshot } from '../data/mock-data';
import { createBossBattle, createPracticeBattle } from '../domain/auto-battle';
import { BossFightResult } from '../domain/boss-fight';
import { bossFirstClearReward } from '../domain/boss-loot';
import { RewardNotifications } from './reward-notifications';

export function earnedBossFixture(): BossFightResult {
  const snapshot = createMockSnapshot();
  snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] };
  return { snapshot, replay: createBossBattle(snapshot, { bossId: 'mosswarden' }),
    firstClear: true, duplicate: false, reward: bossFirstClearReward('mosswarden', 'normal') };
}

describe('reward notification queue', () => {
  it('queues accepted cosmetic rewards once, preserves order and never changes the accepted game state', () => {
    const queue = TestBed.inject(RewardNotifications);
    const result = earnedBossFixture();
    const original = structuredClone(result);
    queue.earnedBoss(result); queue.earnedBoss(result);
    const before = createMockSnapshot(), after = structuredClone(before);
    after.unlockedAuras = ['aurora', 'moss-spirit'];
    queue.earnedActivity(before, after, false);
    expect(queue.current()?.name).toBe('Waldkrone · Jade-Topknot');
    expect(queue.remaining()).toBe(2);
    queue.dismiss(); expect(queue.current()?.name).toBe('Nordlicht');
    expect(queue.current()?.fragment).toBe('aura-rewards');
    queue.dismiss(); expect(queue.current()?.name).toBe('Moosseele');
    queue.dismiss(); expect(queue.current()).toBeNull();
    queue.earnedBoss(result); queue.earnedActivity(before, after, false);
    expect(queue.current()).toBeNull();
    expect(result).toEqual(original);
    expect(before.unlockedAuras).toEqual([]);
  });

  it('rejects practice, defeat, duplicate responses, unowned rewards and mismatched encounters', () => {
    const queue = TestBed.inject(RewardNotifications);
    const result = earnedBossFixture();
    const variants: BossFightResult[] = [
      { ...result, duplicate: true }, { ...result, firstClear: false },
      { ...result, replay: createPracticeBattle(result.snapshot) },
      { ...result, replay: { ...result.replay, outcome: 'defeat' } },
      { ...result, reward: bossFirstClearReward('emberwyrm', 'normal') },
      { ...result, snapshot: { ...result.snapshot, bossProgress: { clearedEncounterIds: [], unlockedCosmetics: ['moss-crown'] } } },
      { ...result, snapshot: { ...result.snapshot, bossProgress: { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: [] } } },
    ];
    for (const variant of variants) queue.earnedBoss(variant);
    expect(queue.current()).toBeNull();
  });

  it('ignores existing, unknown and cross-owner auras and releases all queued data on owner reset', () => {
    const queue = TestBed.inject(RewardNotifications);
    const before = createMockSnapshot(), after = structuredClone(before);
    before.unlockedAuras = ['aurora']; after.unlockedAuras = ['aurora', 'made-up-aura', 'starlight'];
    queue.earnedActivity(before, after, true); expect(queue.current()).toBeNull();
    after.character.id = 'different-owner';
    queue.earnedActivity(before, after, false); expect(queue.current()).toBeNull();
    after.character.id = before.character.id;
    queue.earnedActivity(before, after, false); expect(queue.current()?.name).toBe('Sternenkranz');
    expect(queue.remaining()).toBe(0);
    queue.clear(); expect(queue.current()).toBeNull(); expect(queue.remaining()).toBe(0);
    queue.earnedActivity(before, after, false); expect(queue.current()?.name).toBe('Sternenkranz');
  });
  it('freezes the accepted result presentation and resolves canonical fields instead of trusting supplied display data', () => {
    const queue = TestBed.inject(RewardNotifications);
    const base = earnedBossFixture();
    const result = { ...base, reward: { ...base.reward!, name: 'Forged title', modules: { male: 'bad-module', female: 'bad-module' } } };
    result.snapshot.character.appearance.presentation = 'female';
    queue.earnedBoss(result);
    const notification = queue.current();
    expect(notification).toMatchObject({ name: 'Waldkrone · Jade-Seitenzopf', boss: {
      id: 'moss-crown', variant: 'female', moduleId: 'starweaver', variantLabel: 'Weibliche Ausführung',
    } });
    result.snapshot.character.appearance.presentation = 'male';
    queue.earnedBoss(result);
    expect(queue.current()).toBe(notification);
    expect(queue.current()?.boss?.variant).toBe('female');
    expect(queue.remaining()).toBe(0);
    queue.dismiss(); queue.earnedBoss(result); expect(queue.current()).toBeNull();
    expect(result.snapshot.bossProgress).toEqual({ clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] });
  });

  it('rejects an invented presentation-specific reward ID even when supplied in the result ownership array', () => {
    const queue = TestBed.inject(RewardNotifications);
    const base = earnedBossFixture();
    const result = { ...base, reward: { ...base.reward!, id: 'moss-crown:female' } };
    result.snapshot.character.appearance.presentation = 'female';
    result.snapshot.bossProgress!.unlockedCosmetics = ['moss-crown:female'];
    const original = structuredClone(result);
    queue.earnedBoss(result);
    expect(queue.current()).toBeNull();
    expect(result).toEqual(original);
  });

});
