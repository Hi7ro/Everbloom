import { TestBed } from '@angular/core/testing';
import { ApiClient, ApiError } from '../data/api-client';
import { AuthStore } from './auth.store';
import { PendingActivityStorage } from '../data/pending-activity.storage';

describe('AuthStore', () => {
  const pendingActivities = { removeForDeletedAccount: vi.fn() };
  let api: {
    refreshCsrf: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    clearCsrf: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      refreshCsrf: vi.fn().mockResolvedValue({ token: 'csrf', headerName: 'X-CSRF-TOKEN' }),
      get: vi.fn(),
      post: vi.fn(),
      clearCsrf: vi.fn(),
    };
    pendingActivities.removeForDeletedAccount.mockClear();
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api },
      { provide: PendingActivityStorage, useValue: pendingActivities }] });
  });

  it('logs in without persisting credentials and increments the account epoch', async () => {
    api.post.mockResolvedValue({ id: 'account-1', email: 'player@example.com', verified: true });
    const store = TestBed.inject(AuthStore);
    expect(await store.login('player@example.com', 'a-strong-password-123')).toBe(true);
    expect(store.user()).toEqual({ id: 'account-1', email: 'player@example.com', verified: true });
    expect(store.authenticated()).toBe(true);
    expect(store.epoch()).toBe(1);
    expect(JSON.stringify(store)).not.toContain('a-strong-password-123');
  });

  it('does not show a successful registration as an authenticated session', async () => {
    api.post.mockResolvedValue({ id: 'account-1', email: 'player@example.com', verified: true });
    const store = TestBed.inject(AuthStore);
    expect(await store.register('player@example.com', 'a-strong-password-123')).toBe(true);
    expect(store.user()).toBeNull();
    expect(store.status()).toBe('unknown');
    expect(store.notice()).toContain('Bestätigungslink');
  });

  it('revalidates a shared cookie without resetting the same owner or open drafts', async () => {
    const user = { id: 'account-1', email: 'player@example.com', verified: true };
    api.post.mockResolvedValue(user);
    api.get.mockResolvedValue(user);
    const store = TestBed.inject(AuthStore);
    await store.login(user.email, 'test passphrase');
    const epoch = store.epoch();
    expect(await store.ensureSession(true)).toBe(true);
    expect(api.get).toHaveBeenCalledWith('/api/auth/me');
    expect(store.epoch()).toBe(epoch);
    expect(store.authenticated()).toBe(true);
  });

  it('requires a new login when a different account owns the shared cookie', async () => {
    api.post.mockResolvedValue({ id: 'A', email: 'a@example.test', verified: true });
    api.get.mockResolvedValue({ id: 'B', email: 'b@example.test', verified: true });
    const store = TestBed.inject(AuthStore);
    await store.login('a@example.test', 'test passphrase');
    const epoch = store.epoch();
    expect(await store.ensureSession(true)).toBe(false);
    expect(store.user()).toBeNull();
    expect(store.epoch()).toBe(epoch + 1);
    expect(store.error()).toContain('anderen Fenster');
    // The auth page checks automatically on entry; it must not silently re-adopt B.
    expect(await store.ensureSession()).toBe(false);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(store.user()).toBeNull();
  });

  it('preserves an authenticated editor during a temporary resume connection failure', async () => {
    api.post.mockResolvedValue({ id: 'A', email: 'a@example.test', verified: true });
    api.get.mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'Verbindung unterbrochen.'));
    const store = TestBed.inject(AuthStore);
    await store.login('a@example.test', 'test passphrase');
    const epoch = store.epoch();
    expect(await store.ensureSession(true)).toBe(false);
    expect(store.user()?.id).toBe('A');
    expect(store.epoch()).toBe(epoch);
  });

  it('binds an operation to the visible owner and expires only the stale local state on mismatch', async () => {
    api.post.mockResolvedValue({ id: 'A', email: 'a@example.test', verified: true });
    const store = TestBed.inject(AuthStore);
    await store.login('a@example.test', 'test passphrase');
    const request = vi.fn().mockRejectedValue(new ApiError(409, 'ACCOUNT_CHANGED', 'Konto gewechselt.'));
    await expect(store.owned(request)).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    expect(request).toHaveBeenCalledWith({ 'X-Everbloom-Account': 'A' });
    expect(store.user()).toBeNull();
    // Never send a logout using the other account's cookie.
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('rejects late results after local account changes', async () => {
    api.post.mockResolvedValue({ id: 'A', email: 'a@example.test', verified: true });
    const store = TestBed.inject(AuthStore);
    await store.login('a@example.test', 'test passphrase');
    let resolve!: (value: string) => void;
    const pending = store.owned(() => new Promise<string>(done => { resolve = done; }));
    store.expire();
    api.post.mockResolvedValue({ id: 'B', email: 'b@example.test', verified: true });
    await store.login('b@example.test', 'test passphrase');
    resolve('old private data');
    await expect(pending).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    expect(store.user()?.id).toBe('B');
  });

  it('binds account deletion and logout even after CSRF refresh', async () => {
    const user = { id: 'A', email: 'a@example.test', verified: true };
    api.post.mockResolvedValue(user);
    const store = TestBed.inject(AuthStore);
    await store.login(user.email, 'test passphrase');
    api.post.mockRejectedValueOnce(new ApiError(401, 'INVALID_CREDENTIALS', 'Falsches Passwort.'));
    expect(await store.deleteAccount('wrong')).toBe(false);
    expect(api.post).toHaveBeenLastCalledWith('/api/account/delete', { password: 'wrong' }, { 'X-Everbloom-Account': 'A' });
    expect(store.authenticated()).toBe(true);
    expect(pendingActivities.removeForDeletedAccount).not.toHaveBeenCalled();
    expect(await store.logout()).toBe(true);
    expect(api.post).toHaveBeenLastCalledWith('/api/auth/logout', {}, { 'X-Everbloom-Account': 'A' });
    expect(pendingActivities.removeForDeletedAccount).not.toHaveBeenCalled();
    await store.login(user.email, 'test passphrase');
    expect(await store.deleteAccount('correct')).toBe(true);
    expect(pendingActivities.removeForDeletedAccount).toHaveBeenCalledExactlyOnceWith('A');
  });
});
