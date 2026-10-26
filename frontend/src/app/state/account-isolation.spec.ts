import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ACCOUNT_MODE } from '../data/account-mode';
import { GAME_REPOSITORY } from '../data/game.repository';
import { createMockSnapshot } from '../data/mock-data';
import { ApiClient, ApiError } from '../data/api-client';
import { AuthStore } from './auth.store';
import { GameStore } from './game.store';
import { JourneyStore } from './journey.store';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { DEFAULT_JOURNEY } from '../domain/journey';
import { RewardNotifications } from './reward-notifications';
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
}

describe('account boundaries', () => {
  it('never restores a late login after expiry and never persists credentials', async () => {
    const pending = deferred<unknown>();
    const api = {
      refreshCsrf: vi.fn().mockResolvedValue({}),
      post: vi.fn().mockReturnValue(pending.promise),
      clearCsrf: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api }] });
    const auth = TestBed.inject(AuthStore);
    const login = auth.login('test@example.test', 'long secret test phrase');
    await Promise.resolve();
    auth.expire();
    pending.resolve({ id: 'old', email: 'test@example.test', verified: true });
    expect(await login).toBe(false);
    expect(auth.user()).toBeNull();
    expect(auth.authenticated()).toBe(false);
    expect(JSON.stringify(auth)).not.toContain('long secret test phrase');
  });
  it('deduplicates session checks and rejects late responses after account change', async () => {
    const pending = deferred<unknown>();
    const api = {
      refreshCsrf: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockReturnValue(pending.promise),
      clearCsrf: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api }] });
    const auth = TestBed.inject(AuthStore);
    const a = auth.ensureSession(),
      b = auth.ensureSession();
    await Promise.resolve();
    auth.expire();
    pending.resolve({ id: 'old', email: 'old@example.test', verified: true });
    expect(await a).toBe(false);
    expect(await b).toBe(false);
    expect(api.get).toHaveBeenCalledOnce();
    expect(auth.user()).toBeNull();
  });
  it('rejects duplicate login taps and retains a session after a failed deletion password', async () => {
    const pending = deferred<unknown>();
    const api = {
      refreshCsrf: vi.fn().mockResolvedValue({}),
      post: vi.fn().mockReturnValueOnce(pending.promise),
      clearCsrf: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api }] });
    const auth = TestBed.inject(AuthStore);
    const first = auth.login('one@example.test', 'long secret test phrase');
    expect(await auth.login('two@example.test', 'different secret phrase')).toBe(false);
    await Promise.resolve();
    pending.resolve({ id: 'one', email: 'one@example.test', verified: true });
    await first;
    api.post.mockRejectedValueOnce(
      new ApiError(401, 'INVALID_CREDENTIALS', 'Passwort stimmt nicht.'),
    );
    expect(await auth.deleteAccount('wrong password')).toBe(false);
    expect(auth.user()?.id).toBe('one');
    expect(auth.authenticated()).toBe(true);
  });
});
describe('authentication command serialization', () => {
  it('never launches an old /me check while switching from account A to B', async () => {
    const pending = deferred<unknown>();
    const api = {
      refreshCsrf: vi.fn().mockResolvedValue({}),
      post: vi.fn(),
      get: vi.fn(),
      clearCsrf: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api }] });
    const auth = TestBed.inject(AuthStore);
    api.post.mockResolvedValueOnce({ id: 'A', email: 'a@example.test', verified: true });
    await auth.login('a@example.test', 'first test passphrase');
    api.post.mockReturnValueOnce(pending.promise);
    const next = auth.login('b@example.test', 'second test passphrase');
    expect(await auth.ensureSession()).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
    pending.resolve({ id: 'B', email: 'b@example.test', verified: true });
    expect(await next).toBe(true);
    expect(auth.user()?.id).toBe('B');
  });
});

describe('server game state', () => {
  const epoch = signal(1);
  const snapshot = createMockSnapshot();
  let repository: {
    load: ReturnType<typeof vi.fn>;
    record: ReturnType<typeof vi.fn>;
    updateCharacter: ReturnType<typeof vi.fn>;
    resetDemo: ReturnType<typeof vi.fn>;
  };
  beforeEach(() => {
    epoch.set(1);
    const entries = new Map<string, string>();
    repository = {
      load: vi.fn().mockResolvedValue(structuredClone(snapshot)),
      record: vi.fn(),
      updateCharacter: vi.fn(),
      resetDemo: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ACCOUNT_MODE, useValue: true },
        { provide: AuthStore, useValue: { epoch, user: () => ({ id: 'test-owner' }), owned: (request: (headers: Record<string, string>) => Promise<unknown>) => request({ 'X-Everbloom-Account': 'test-owner' }) } },
        { provide: GAME_REPOSITORY, useValue: repository },
        { provide: BROWSER_STORAGE, useValue: {
          getItem: (key: string) => entries.get(key) ?? null,
          setItem: (key: string, value: string) => entries.set(key, value),
          removeItem: (key: string) => entries.delete(key),
        } },
        {
          provide: JourneyStore,
          useValue: { activeSkillIds: () => ['running'], configured: () => false },
        },
      ],
    });
  });
  it('clears visible progress and refuses stale responses after switching accounts', async () => {
    const store = TestBed.inject(GameStore);
    await store.load();
    const rewards = TestBed.inject(RewardNotifications);
    const earned = structuredClone(snapshot); earned.unlockedAuras = ['aurora'];
    rewards.earnedActivity(snapshot, earned, false);
    expect(rewards.current()?.name).toBe('Nordlicht');
    const pending = deferred<typeof snapshot>();
    repository.load.mockReturnValueOnce(pending.promise);
    const loading = store.load();
    epoch.set(2);
    TestBed.tick();
    expect(store.snapshot()).toBeNull();
    expect(rewards.current()).toBeNull();
    pending.resolve(snapshot);
    expect(await loading).toBe(false);
    expect(store.snapshot()).toBeNull();
    expect(store.busy()).toBe(false);
  });
  it('shares concurrent initial loads and refreshes from server on the same day', async () => {
    const store = TestBed.inject(GameStore);
    const pending = deferred<typeof snapshot>();
    repository.load.mockReturnValueOnce(pending.promise);
    const one = store.load(),
      two = store.load();
    pending.resolve(snapshot);
    expect(await one).toBe(true);
    expect(await two).toBe(true);
    expect(repository.load).toHaveBeenCalledOnce();
    await store.refresh();
    expect(repository.load).toHaveBeenCalledTimes(2);
    expect(await store.reset()).toBe(false);
    expect(repository.resetDemo).not.toHaveBeenCalled();
  });
  it('reuses an uncertain activity ID without double XP or celebration', async () => {
    const store = TestBed.inject(GameStore);
    await store.load();
    repository.record
      .mockRejectedValueOnce(new ApiError(0, 'REQUEST_TIMEOUT', 'timeout'))
      .mockResolvedValueOnce({
        snapshot,
        reward: { activityXp: 0, questXp: 0, damage: 0, rewardedMinutes: 0, duplicate: true },
      });
    expect(await store.record('running', 20)).toBe(false);
    expect(store.error()).toContain('unbestätigt');
    expect(await store.record('meditation', 10)).toBe(false);
    expect(repository.record).toHaveBeenCalledOnce();
    expect(await store.record('running', 20)).toBe(true);
    expect(repository.record.mock.calls[1][0].requestId).toBe(
      repository.record.mock.calls[0][0].requestId,
    );
    expect(store.message()).toContain('keine doppelten XP');
  });
});
describe('server journey preferences', () => {
  it('never imports local demo preferences or accepts another account’s response', async () => {
    const epoch = signal(1);
    const pending = deferred<unknown>();
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    const api = { get: vi.fn().mockReturnValue(pending.promise) };
    TestBed.configureTestingModule({
      providers: [
        { provide: ACCOUNT_MODE, useValue: true },
        { provide: AuthStore, useValue: { epoch, owned: (request: (headers: Record<string, string>) => Promise<unknown>) => request({ 'X-Everbloom-Account': 'test-owner' }) } },
        { provide: ApiClient, useValue: api },
        { provide: BROWSER_STORAGE, useValue: storage },
      ],
    });
    const journey = TestBed.inject(JourneyStore);
    expect(storage.getItem).not.toHaveBeenCalled();
    const loading = journey.load();
    epoch.set(2);
    TestBed.tick();
    pending.resolve({
      interestIds: ['creative'],
      activeSkillIds: ['creative'],
      primaryInterestId: 'creative',
    });
    expect(await loading).toBe(false);
    expect(journey.preferences()).toEqual(DEFAULT_JOURNEY);
    expect(journey.configured()).toBe(false);
  });
});

describe('journey response ordering', () => {
  it('keeps saved preferences when an earlier read arrives late', async () => {
    const epoch = signal(1);
    const pending = deferred<unknown>();
    const chosen = {
      interestIds: ['knowledge'],
      activeSkillIds: ['reading'],
      primaryInterestId: 'knowledge',
    };
    const api = {
      get: vi.fn().mockReturnValue(pending.promise),
      put: vi.fn().mockResolvedValue(chosen),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ACCOUNT_MODE, useValue: true },
        { provide: AuthStore, useValue: { epoch, owned: (request: (headers: Record<string, string>) => Promise<unknown>) => request({ 'X-Everbloom-Account': 'test-owner' }) } },
        { provide: ApiClient, useValue: api },
        { provide: BROWSER_STORAGE, useValue: null },
      ],
    });
    const journey = TestBed.inject(JourneyStore);
    const read = journey.load();
    expect(await journey.commit(chosen)).toBe(true);
    pending.resolve(DEFAULT_JOURNEY);
    expect(await read).toBe(false);
    expect(journey.preferences()).toEqual(chosen);
    expect(journey.configured()).toBe(true);
  });
});
