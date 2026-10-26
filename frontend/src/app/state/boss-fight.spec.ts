import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ACCOUNT_MODE } from '../data/account-mode';
import { GAME_REPOSITORY } from '../data/game.repository';
import { createMockSnapshot } from '../data/mock-data';
import { ApiError } from '../data/api-client';
import { AuthStore } from './auth.store';
import { GameStore } from './game.store';
import { JourneyStore } from './journey.store';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { BossFightResult } from '../domain/boss-fight';
import { createBossBattle } from '../domain/auto-battle';
import { bossFirstClearReward } from '../domain/boss-loot';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => (resolve = done));
  return { promise, resolve };
}

describe('account boss resolution', () => {
  const epoch = signal(1);
  const before = createMockSnapshot();
  before.character.createdByPlayer = true;
  let result: BossFightResult;
  let repository: { load: ReturnType<typeof vi.fn>; fightBoss: ReturnType<typeof vi.fn>; record: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    epoch.set(1);
    const reward = bossFirstClearReward('mosswarden', 'normal');
    result = { snapshot: { ...structuredClone(before), bossProgress: { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] } },
      replay: createBossBattle(before, { bossId: 'mosswarden', difficulty: 'normal', tactic: 'balanced' }), firstClear: true, reward, duplicate: false };
    repository = { load: vi.fn().mockResolvedValue(structuredClone(before)), fightBoss: vi.fn().mockResolvedValue(result), record: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      { provide: ACCOUNT_MODE, useValue: true }, { provide: AuthStore, useValue: { epoch, user: () => ({ id: 'boss-owner' }) } },
      { provide: GAME_REPOSITORY, useValue: repository }, { provide: BROWSER_STORAGE, useValue: null },
      { provide: JourneyStore, useValue: { activeSkillIds: () => ['running'], configured: () => false } },
    ] });
  });
  it('adopts the server snapshot and never calculates client rewards or XP', async () => {
    const store = TestBed.inject(GameStore);
    await store.load();
    expect(await store.fightBoss('mosswarden', 'normal', 'balanced')).toEqual(result);
    expect(store.snapshot()?.bossProgress?.unlockedCosmetics).toEqual(['moss-crown']);
    expect(store.snapshot()?.character.totalXp).toBe(before.character.totalXp);
    expect(store.message()).toContain('Waldkrone');
    expect(repository.fightBoss.mock.calls[0][0]).toEqual({ requestId: expect.any(String), bossId: 'mosswarden', difficulty: 'normal', tactic: 'balanced' });
  });
  it('reuses uncertain fight IDs and blocks changing that unresolved encounter', async () => {
    const store = TestBed.inject(GameStore); await store.load();
    repository.fightBoss.mockRejectedValueOnce(new ApiError(0, 'REQUEST_TIMEOUT', 'timeout'));
    expect(await store.fightBoss('mosswarden', 'normal', 'balanced')).toBeNull();
    expect(store.snapshot()?.bossProgress).toEqual(before.bossProgress);
    expect(store.error()).toContain('unbestätigt');
    expect(await store.fightBoss('emberwyrm', 'normal', 'balanced')).toBeNull();
    expect(await store.fightBoss('mosswarden', 'normal', 'guard')).toBeNull();
    expect(repository.fightBoss).toHaveBeenCalledOnce();
    repository.fightBoss.mockResolvedValueOnce({ ...result, duplicate: true });
    expect((await store.fightBoss('mosswarden', 'normal', 'balanced'))?.duplicate).toBe(true);
    expect(repository.fightBoss.mock.calls[1][0].requestId).toBe(repository.fightBoss.mock.calls[0][0].requestId);
    expect(store.message()).toContain('keine doppelte Beute');
  });
  it('clears definitive level rejections so another fight can be selected', async () => {
    const store = TestBed.inject(GameStore); await store.load();
    repository.fightBoss.mockRejectedValueOnce(new ApiError(403, 'BOSS_LEVEL_LOCKED', 'Ab Level 40.'));
    expect(await store.fightBoss('mosswarden', 'ultimate', 'balanced')).toBeNull();
    expect(store.error()).toBe('Ab Level 40.');
    expect(await store.fightBoss('mosswarden', 'normal', 'balanced')).toEqual(result);
    expect(repository.fightBoss.mock.calls[0][0].requestId).not.toBe(repository.fightBoss.mock.calls[1][0].requestId);
  });
  it('serializes mutations and refuses a late result from another account', async () => {
    const store = TestBed.inject(GameStore); await store.load();
    const pending = deferred<BossFightResult>(); repository.fightBoss.mockReturnValueOnce(pending.promise);
    const fight = store.fightBoss('mosswarden', 'normal', 'balanced');
    expect(store.busy()).toBe(true);
    expect(await store.fightBoss('mosswarden', 'normal', 'balanced')).toBeNull();
    expect(await store.record('running', 10)).toBe(false);
    epoch.set(2); TestBed.tick();
    pending.resolve(result);
    expect(await fight).toBeNull(); expect(store.snapshot()).toBeNull(); expect(store.message()).toBe('');
    expect(store.busy()).toBe(false); expect(repository.record).not.toHaveBeenCalled();
  });
});
