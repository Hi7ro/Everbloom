import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ACCOUNT_MODE } from '../data/account-mode';
import { ApiError } from '../data/api-client';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { GAME_REPOSITORY } from '../data/game.repository';
import { createMockSnapshot } from '../data/mock-data';
import { ACTIVITY_RECOVERY_LOCKS, PENDING_ACTIVITY_PREFIX } from '../data/pending-activity.storage';
import { ActivityCommand } from '../domain/models';
import { AuthStore } from './auth.store';
import { GameStore } from './game.store';
import { JourneyStore } from './journey.store';
import { ProgressFeedback } from './progress-feedback';
import { RewardNotifications } from './reward-notifications';

describe('activity confirmation recovery', () => {
  const before = createMockSnapshot();
  const result = {
    snapshot: { ...before, character: { ...before.character, totalXp: before.character.totalXp + 20 } },
    reward: { activityXp: 20, questXp: 0, damage: 40, rewardedMinutes: 10, duplicate: false },
  };
  let user = signal<{ id: string } | null>({ id: 'first-owner' });
  let epoch = signal(1);
  let entries: Map<string, string>;
  let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn>; removeItem: ReturnType<typeof vi.fn> };
  let repository: { load: ReturnType<typeof vi.fn>; record: ReturnType<typeof vi.fn> };

  function configure() {
    TestBed.configureTestingModule({ providers: [
      { provide: ACCOUNT_MODE, useValue: true },
      { provide: AuthStore, useValue: { user, epoch } },
      { provide: GAME_REPOSITORY, useValue: repository },
      { provide: BROWSER_STORAGE, useValue: storage },
      { provide: ACTIVITY_RECOVERY_LOCKS, useValue: null },
      { provide: JourneyStore, useValue: { activeSkillIds: () => ['running'], configured: () => false } },
    ] });
    return TestBed.inject(GameStore);
  }
  beforeEach(() => {
    user = signal<{ id: string } | null>({ id: 'first-owner' }); epoch = signal(1);
    entries = new Map();
    storage = {
      getItem: vi.fn((key: string) => entries.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => { entries.set(key, value); }),
      removeItem: vi.fn((key: string) => { entries.delete(key); }),
    };
    repository = { load: vi.fn().mockResolvedValue(before), record: vi.fn().mockResolvedValue(result) };
  });
  it('restores the exact uncertain ID after a fresh app instance and retries without duplicate rewards', async () => {
    const original = configure(); await original.load();
    repository.record.mockRejectedValueOnce(new ApiError(0, 'REQUEST_TIMEOUT', 'timeout'));
    expect(await original.record('running', 10)).toBe(false);
    const command = repository.record.mock.calls[0][0] as ActivityCommand;
    expect(JSON.parse(entries.get(PENDING_ACTIVITY_PREFIX + 'first-owner')!).requestId).toBe(command.requestId);
    TestBed.resetTestingModule();
    const restored = configure();
    expect(restored.pendingActivity()).toEqual(command);
    expect(repository.record).toHaveBeenCalledOnce();
    await restored.load();
    const celebrate = vi.spyOn(TestBed.inject(ProgressFeedback), 'celebrate');
    const rewards = TestBed.inject(RewardNotifications);
    repository.record.mockResolvedValueOnce({ ...result, reward: { ...result.reward, duplicate: true } });
    expect(await restored.record('meditation', 20)).toBe(false);
    expect(repository.record).toHaveBeenCalledOnce();
    expect(await restored.retryPendingActivity()).toBe(true);
    expect(repository.record.mock.calls[1][0]).toEqual(command);
    expect(restored.pendingActivity()).toBeNull();
    expect(entries.has(PENDING_ACTIVITY_PREFIX + 'first-owner')).toBe(false);
    expect(celebrate).not.toHaveBeenCalled();
    expect(rewards.current()).toBeNull();
    expect(restored.message()).toContain('keine doppelten XP');
  });
  it.each([0, 408, 429, 500, 503])('keeps the original command for uncertain status %s', async status => {
    const store = configure(); await store.load();
    repository.record.mockRejectedValueOnce(new ApiError(status, 'UNAVAILABLE', 'retry'));
    expect(await store.record('running', 10)).toBe(false);
    expect(store.pendingActivity()?.requestId).toBe(repository.record.mock.calls[0][0].requestId);
    expect(entries.size).toBe(1);
  });
  it('keeps an initially rejected reservation because another tab might already have accepted the same ID', async () => {
    const store = configure(); await store.load();
    repository.record.mockRejectedValueOnce(new ApiError(400, 'INVALID_ACTIVITY', 'Ungültiger Eintrag.'));
    expect(await store.record('running', 10)).toBe(false);
    const original = store.pendingActivity();
    expect(original).not.toBeNull();
    expect(store.error()).toContain('Ungültiger Eintrag.');
    expect(await store.record('meditation', 20)).toBe(false);
    expect(repository.record).toHaveBeenCalledOnce();
    expect(await store.retryPendingActivity()).toBe(true);
    expect(repository.record.mock.calls[1][0]).toEqual(original);
  });
  it('never forgets an uncertain original attempt when a later retry receives a CSRF rejection', async () => {
    const store = configure(); await store.load();
    repository.record
      .mockRejectedValueOnce(new ApiError(0, 'REQUEST_TIMEOUT', 'timeout'))
      .mockRejectedValueOnce(new ApiError(403, 'FORBIDDEN', 'Bitte neu anmelden.'))
      .mockResolvedValueOnce({ ...result, reward: { ...result.reward, duplicate: true } });
    expect(await store.record('running', 10)).toBe(false);
    const original = store.pendingActivity();
    expect(await store.retryPendingActivity()).toBe(false);
    expect(store.pendingActivity()).toEqual(original);
    expect(await store.retryPendingActivity()).toBe(true);
    expect(repository.record.mock.calls.map(call => call[0].requestId)).toEqual([
      original!.requestId, original!.requestId, original!.requestId,
    ]);
    expect(store.message()).toContain('keine doppelten XP');
  });
  it('never submits an activity if its device reservation fails', async () => {
    const store = configure(); await store.load();
    storage.setItem.mockImplementation(() => { throw new Error('quota'); });
    expect(await store.record('running', 10)).toBe(false);
    expect(repository.record).not.toHaveBeenCalled();
    expect(store.recoveryIssue()).toContain('kein neuer Eintrag gesendet');
    expect(store.snapshot()).toEqual(before);
  });
  it('quarantines corrupted or mismatched owner data instead of inventing a new ID', async () => {
    const key = PENDING_ACTIVITY_PREFIX + 'first-owner'; entries.set(key, '{corrupt');
    const store = configure(); await store.load();
    expect(await store.record('running', 10)).toBe(false);
    expect(store.recoveryIssue()).toContain('nicht sicher gelesen');
    expect(repository.record).not.toHaveBeenCalled();
    expect(entries.get(key)).toBe('{corrupt');
  });
  it('hides an old owner’s command on logout and ignores its late response, while retaining re-login recovery', async () => {
    const store = configure(); await store.load();
    let finish!: (value: typeof result) => void;
    repository.record.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const sending = store.record('running', 10);
    await vi.waitFor(() => expect(repository.record).toHaveBeenCalledOnce());
    const original = store.pendingActivity();
    user.set({ id: 'second-owner' }); epoch.update(value => value + 1); TestBed.tick();
    expect(store.pendingActivity()).toBeNull(); expect(store.snapshot()).toBeNull();
    finish(result); expect(await sending).toBe(false);
    expect(entries.has(PENDING_ACTIVITY_PREFIX + 'first-owner')).toBe(true);
    user.set({ id: 'first-owner' }); epoch.update(value => value + 1); TestBed.tick();
    expect(store.pendingActivity()).toEqual(original);
    expect(store.message()).toBe('');
  });
  it('retains an accepted command if its local cleanup fails, allowing one safe duplicate check', async () => {
    const store = configure(); await store.load();
    storage.removeItem.mockImplementationOnce(() => { throw new Error('blocked'); });
    expect(await store.record('running', 10)).toBe(true);
    const command = store.pendingActivity(); expect(command).not.toBeNull();
    expect(store.recoveryIssue()).toContain('noch nicht abgeschlossen');
    repository.record.mockResolvedValueOnce({ ...result, reward: { ...result.reward, duplicate: true } });
    expect(await store.retryPendingActivity()).toBe(true);
    expect(repository.record.mock.calls[1][0]).toEqual(command);
    expect(store.pendingActivity()).toBeNull();
  });
  it('does not change the original request after a day rollover', async () => {
    const store = configure(); await store.load();
    repository.record.mockRejectedValueOnce(new ApiError(0, 'REQUEST_TIMEOUT', 'timeout'));
    await store.record('running', 10);
    const command = store.pendingActivity();
    repository.load.mockResolvedValue({ ...before, dayKey: '2026-09-09' });
    await store.refresh();
    expect(await store.retryPendingActivity()).toBe(true);
    expect(repository.record.mock.calls[1][0]).toEqual(command);
  });
});
