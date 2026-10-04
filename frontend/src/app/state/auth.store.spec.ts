import { TestBed } from '@angular/core/testing';
import { ApiClient } from '../data/api-client';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let api: { refreshCsrf: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { refreshCsrf: vi.fn().mockResolvedValue({ token: 'csrf', headerName: 'X-CSRF-TOKEN' }), get: vi.fn(), post: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api }] });
  });

  it('logs in without persisting credentials and increments the account epoch', async () => {
    api.post.mockResolvedValue({ id: 'account-1', email: 'player@example.com' });
    const store = TestBed.inject(AuthStore);
    expect(await store.login('player@example.com', 'a-strong-password-123')).toBe(true);
    expect(store.user()).toEqual({ id: 'account-1', email: 'player@example.com' });
    expect(store.authenticated()).toBe(true);
    expect(store.epoch()).toBe(1);
    expect(JSON.stringify(store)).not.toContain('a-strong-password-123');
  });

  it('does not show a successful registration as an authenticated session', async () => {
    api.post.mockResolvedValue({ id: 'account-1', email: 'player@example.com' });
    const store = TestBed.inject(AuthStore);
    expect(await store.register('player@example.com', 'a-strong-password-123')).toBe(true);
    expect(store.user()).toBeNull();
    expect(store.status()).toBe('unknown');
    expect(store.notice()).toContain('Konto erstellt');
  });
});
