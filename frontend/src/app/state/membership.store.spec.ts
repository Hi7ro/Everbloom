import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from '../data/api-client';
import { NativeMembershipPurchases } from '../data/native-membership';
import { PendingMembershipStorage } from '../data/pending-membership.storage';
import { NativeMembershipError } from '../data/native-membership';
import { MembershipState } from '../domain/membership';
import { AuthStore } from './auth.store';
import { MembershipStore } from './membership.store';

const inactive: MembershipState = {
  mode: 'live', active: false, verifiedAt: '2026-10-05T12:00:00Z', expiresAt: null,
  willRenew: null, store: null, managementUrl: null, characterXpBonusPercent: 0,
  advancedBosses: false, purchaseConfig: { appUserId: 'owner-a', entitlementId: 'plus',
    appleProductId: 'plus-monthly', googleProductId: 'plus:monthly', offeringId: 'default',
    appleApiKey: 'appl_public', googleApiKey: 'goog_public' },
};
const active: MembershipState = { ...inactive, active: true, advancedBosses: true,
  characterXpBonusPercent: 10, expiresAt: '2099-10-05T12:00:00Z', willRenew: true,
  store: 'app_store', managementUrl: 'https://apps.apple.com/account/subscriptions' };
const offer = { identifier: '$rc_monthly', productId: 'plus-monthly', priceString: '3,99 €', period: 'month' };

describe('MembershipStore', () => {
  const auth = { epoch: signal(1), authenticated: signal(true), user: signal({ id: 'owner-a' }),
    owned: (request: (headers: Record<string, string>) => Promise<unknown>) => request({ 'X-Everbloom-Account': auth.user().id }) };
  const api = { get: vi.fn(), post: vi.fn() };
  const purchases = { native: true, getOffer: vi.fn(), purchase: vi.fn(), restore: vi.fn(), manage: vi.fn() };
  const pendingOwners = new Set<string>();
  const pendingStorage = { has: (owner: string) => pendingOwners.has(owner), set: (owner: string, pending: boolean) => pending ? pendingOwners.add(owner) : pendingOwners.delete(owner) };
  let store: MembershipStore;
  beforeEach(() => {
    pendingOwners.clear(); vi.resetAllMocks(); auth.epoch.set(1); auth.user.set({ id: 'owner-a' }); auth.authenticated.set(true);
    api.get.mockResolvedValue(inactive); api.post.mockResolvedValue(inactive);
    purchases.getOffer.mockResolvedValue(offer); purchases.purchase.mockResolvedValue('purchased');
    purchases.restore.mockResolvedValue(undefined);
    TestBed.configureTestingModule({ providers: [
      { provide: PendingMembershipStorage, useValue: pendingStorage },
      { provide: AuthStore, useValue: auth }, { provide: ApiClient, useValue: api },
      { provide: NativeMembershipPurchases, useValue: purchases },
    ] });
    store = TestBed.inject(MembershipStore); TestBed.tick();
  });
  it('opens no SDK or checkout in preview mode', async () => {
    api.get.mockResolvedValue({ ...inactive, mode: 'preview', advancedBosses: true, purchaseConfig: null });
    await store.load();
    expect(store.advancedBosses()).toBe(true); expect(store.canBuy()).toBe(false);
    expect(store.bonusPercent()).toBe(0); expect(purchases.getOffer).not.toHaveBeenCalled();
  });
  it('requires server confirmation after the Store succeeds', async () => {
    await store.load();
    expect(await store.purchase()).toBe(false);
    expect(store.active()).toBe(false); expect(store.pendingVerification()).toBe(true);
    expect(store.canBuy()).toBe(false); expect(store.bonusPercent()).toBe(0);
    expect(api.post).toHaveBeenCalledWith('/api/billing/refresh', {}, { 'X-Everbloom-Account': 'owner-a' });
  });
  it('enables benefits only after an authenticated provider refresh', async () => {
    await store.load(); api.post.mockResolvedValueOnce(inactive).mockResolvedValueOnce(active);
    expect(await store.purchase()).toBe(true);
    expect(store.active()).toBe(true); expect(store.bonusPercent()).toBe(10);
    expect(store.pendingVerification()).toBe(false);
  });
  it('does not send a second purchase when confirmation was interrupted', async () => {
    await store.load(); api.post.mockResolvedValueOnce(inactive).mockRejectedValueOnce(new Error('Verbindung unterbrochen'));
    await store.purchase(); await store.purchase();
    expect(purchases.purchase).toHaveBeenCalledTimes(1); expect(store.pendingVerification()).toBe(true);
    api.post.mockResolvedValue(active); await store.refresh();
    expect(store.active()).toBe(true); expect(store.pendingVerification()).toBe(false);
  });
  it('treats Store cancellation as no change and can retry deliberately', async () => {
    await store.load(); purchases.purchase.mockResolvedValue('cancelled');
    expect(await store.purchase()).toBe(false);
    expect(store.pendingVerification()).toBe(false); expect(store.canBuy()).toBe(true);
  });
  it('does not open checkout when preflight finds an existing membership', async () => {
    await store.load(); api.post.mockResolvedValue(active); await store.purchase();
    expect(purchases.purchase).not.toHaveBeenCalled(); expect(store.active()).toBe(true);
  });
  it('restores the current owner then verifies access on the server', async () => {
    await store.load(); api.post.mockResolvedValue(active);
    expect(await store.restore()).toBe(true);
    expect(purchases.restore).toHaveBeenCalledWith(inactive.purchaseConfig);
    expect(store.active()).toBe(true);
  });
  it('rejects a provider configuration for another owner', async () => {
    api.get.mockResolvedValue({ ...inactive, purchaseConfig: { ...inactive.purchaseConfig, appUserId: 'owner-b' } });
    expect(await store.load()).toBe(false); expect(purchases.getOffer).not.toHaveBeenCalled();
  });
  it('discards an offer which arrives after an account change and clears loading', async () => {
    let resolve!: (value: typeof offer) => void;
    purchases.getOffer.mockImplementation(() => new Promise(res => { resolve = res; }));
    const pending = store.load(); await Promise.resolve(); await Promise.resolve();
    auth.epoch.set(2); auth.user.set({ id: 'owner-b' }); TestBed.tick(); resolve(offer);
    expect(await pending).toBe(false); expect(store.state()).toBeNull();
    expect(store.offer()).toBeNull(); expect(store.loading()).toBe(false);
  });
  it('does not refresh or grant access for a late Store callback after logout', async () => {
    await store.load(); let resolve!: (value: string) => void;
    purchases.purchase.mockImplementation(() => new Promise(res => { resolve = res; }));
    const pending = store.purchase(); await Promise.resolve(); await Promise.resolve();
    auth.epoch.set(2); auth.authenticated.set(false); TestBed.tick(); resolve('purchased');
    expect(await pending).toBe(false); expect(api.post).toHaveBeenCalledTimes(1);
    expect(store.active()).toBe(false); expect(store.busy()).toBe(false);
  });
  it('keeps uncertain payments blocked after an inactive refresh or restore', async () => {
    await store.load(); await store.purchase();
    await store.refresh(); expect(store.pendingVerification()).toBe(true);
    await store.restore(); expect(store.pendingVerification()).toBe(true);
    expect(store.canBuy()).toBe(false);
    expect(pendingOwners.has('owner-a')).toBe(true);
  });
  it('recovers the uncertain marker only for the original account after a new session', async () => {
    await store.load(); await store.purchase();
    auth.user.set({ id: 'owner-b' }); auth.epoch.set(2); TestBed.tick();
    expect(store.pendingVerification()).toBe(false);
    auth.user.set({ id: 'owner-a' }); auth.epoch.set(3); TestBed.tick();
    expect(store.pendingVerification()).toBe(true);
    api.get.mockResolvedValue(active); await store.load();
    expect(pendingOwners.has('owner-a')).toBe(false);
  });
  it('does not retain an uncertain charge when the offer changed before checkout', async () => {
    await store.load(); purchases.purchase.mockRejectedValue(new NativeMembershipError('OFFER_CHANGED', 'Preis geändert'));
    await store.purchase(); expect(store.pendingVerification()).toBe(false);
    expect(pendingOwners.has('owner-a')).toBe(false);
  });
  it('allows deliberate recovery only after another successful server check, without buying', async () => {
    await store.load(); await store.purchase();
    api.post.mockRejectedValueOnce(new Error('Offline'));
    expect(await store.retryAfterStoreCancellation()).toBe(false);
    expect(store.pendingVerification()).toBe(true);
    expect(await store.retryAfterStoreCancellation()).toBe(true);
    expect(store.pendingVerification()).toBe(false);
    expect(store.canBuy()).toBe(true);
    expect(purchases.purchase).toHaveBeenCalledTimes(1);
  });
  it('does not offer a duplicate checkout when a manual recovery finds an existing subscription', async () => {
    await store.load(); await store.purchase(); api.post.mockResolvedValue(active);
    await store.retryAfterStoreCancellation();
    expect(store.active()).toBe(true); expect(store.canBuy()).toBe(false);
    expect(purchases.purchase).toHaveBeenCalledTimes(1);
  });

});
