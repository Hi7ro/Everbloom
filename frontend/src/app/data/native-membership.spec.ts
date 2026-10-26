import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { MembershipPurchaseConfig } from '../domain/membership';
import { AuthStore } from '../state/auth.store';
import { NATIVE_ANDROID } from './native-lifecycle';
import { NATIVE_PLATFORM } from './runtime-api-config';
import {
  NATIVE_MEMBERSHIP_BROWSER, NATIVE_MEMBERSHIP_SDK, NativeMembershipPurchases,
  validateMembershipManagementUrl,
} from './native-membership';

describe('native membership purchases', () => {
  const first = '6b1bac6b-7e79-4bfc-805f-19525b9f64ad';
  const second = 'b4a23e84-71a3-41bc-9a86-1d9c71bf4ef2';
  const config: MembershipPurchaseConfig = {
    appUserId: first, entitlementId: 'plus', appleProductId: 'everbloom_plus_monthly',
    googleProductId: 'everbloom_plus:monthly', offeringId: 'plus_monthly',
    appleApiKey: 'appl_publicAppleKey', googleApiKey: 'goog_publicGoogleKey',
  };
  const auth = {
    user: signal<{ id: string } | null>({ id: first }), epoch: signal(1), authenticated: signal(true),
  };
  const sdk = {
    configure: vi.fn(), getAppUserID: vi.fn(), logIn: vi.fn(), logOut: vi.fn(),
    getOfferings: vi.fn(), purchasePackage: vi.fn(), restorePurchases: vi.fn(),
  };
  const browser = { open: vi.fn() };
  const loader = vi.fn();
  const browserLoader = vi.fn();
  let sdkOwner = first;
  let monthly: PurchasesPackage;
  function offerings(packages = [monthly], identifier = config.offeringId): PurchasesOfferings {
    return { current: null, all: { [identifier]: { identifier, availablePackages: packages } } } as unknown as PurchasesOfferings;
  }
  function setup(native = true, android = false): NativeMembershipPurchases {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthStore, useValue: auth },
      { provide: NATIVE_PLATFORM, useValue: native }, { provide: NATIVE_ANDROID, useValue: android },
      { provide: NATIVE_MEMBERSHIP_SDK, useValue: loader },
      { provide: NATIVE_MEMBERSHIP_BROWSER, useValue: browserLoader },
    ] });
    return TestBed.inject(NativeMembershipPurchases);
  }
  function switchOwner(id: string) {
    auth.user.set({ id });
    auth.epoch.update(value => value + 1);
  }
  beforeEach(() => {
    auth.user.set({ id: first }); auth.authenticated.set(true); auth.epoch.set(1); sdkOwner = first;
    monthly = {
      identifier: '$rc_monthly', packageType: 'MONTHLY', offeringIdentifier: config.offeringId,
      presentedOfferingContext: { offeringIdentifier: config.offeringId, placementIdentifier: null, targetingContext: null },
      product: { identifier: config.appleProductId, subscriptionPeriod: 'P1M', price: 4.49, priceString: '4,49 €' },
    } as PurchasesPackage;
    loader.mockResolvedValue(sdk); browserLoader.mockResolvedValue(browser); browser.open.mockResolvedValue(undefined);
    sdk.configure.mockImplementation(async ({ appUserID }: { appUserID: string }) => { sdkOwner = appUserID; });
    sdk.getAppUserID.mockImplementation(async () => ({ appUserID: sdkOwner }));
    sdk.logIn.mockImplementation(async ({ appUserID }: { appUserID: string }) => { sdkOwner = appUserID; return {}; });
    sdk.getOfferings.mockImplementation(async () => offerings());
    // Deliberately includes a client-side entitlement: it must never be returned as access authority.
    sdk.purchasePackage.mockResolvedValue({ customerInfo: { entitlements: { active: { plus: {} } } } });
    sdk.restorePurchases.mockResolvedValue({ customerInfo: { entitlements: { active: { plus: {} } } } });
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.resetAllMocks(); });

  it('does not load a checkout SDK or pretend to sell in the web app', async () => {
    const adapter = setup(false);
    expect(adapter.native).toBe(false);
    expect(await adapter.getOffer(config)).toBeNull();
    await expect(adapter.restore(config)).rejects.toMatchObject({ code: 'NATIVE_ONLY' });
    await expect(adapter.purchase(config, { identifier: 'x', productId: 'x', priceString: '3,99 €', period: 'month' }))
      .rejects.toMatchObject({ code: 'NATIVE_ONLY' });
    expect(loader).not.toHaveBeenCalled();
  });

  it('uses the authenticated account and exact localized monthly store price without SDK data in the DTO', async () => {
    const adapter = setup();
    expect(await adapter.getOffer(config)).toEqual({ identifier: '$rc_monthly', productId: config.appleProductId, priceString: '4,49 €', period: 'month' });
    expect(sdk.configure).toHaveBeenCalledWith({ apiKey: config.appleApiKey, appUserID: first });
    await adapter.getOffer(config);
    expect(sdk.configure).toHaveBeenCalledOnce();
    expect(sdk.restorePurchases).not.toHaveBeenCalled();
  });

  it('uses the Google SDK key and exact subscription/base-plan product on Android', async () => {
    monthly = { ...monthly, product: { ...monthly.product, identifier: config.googleProductId } };
    expect(await setup(true, true).getOffer(config)).toMatchObject({ productId: 'everbloom_plus:monthly' });
    expect(sdk.configure).toHaveBeenCalledWith({ apiKey: config.googleApiKey, appUserID: first });
  });

  it('does not normalize or substitute a different Google base plan', async () => {
    monthly = { ...monthly, product: { ...monthly.product, identifier: 'everbloom_plus:annual' } };
    expect(await setup(true, true).getOffer(config)).toBeNull();
  });

  it('rejects a config owned by another account before loading the SDK', async () => {
    await expect(setup().getOffer({ ...config, appUserId: second })).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    expect(loader).not.toHaveBeenCalled();
  });

  it('requires a signed-in account and rejects server secret or test-store keys', async () => {
    const adapter = setup();
    auth.authenticated.set(false);
    await expect(adapter.getOffer(config)).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    auth.authenticated.set(true);
    for (const key of ['sk_secret', 'test_key', 'goog_wrongplatform', '']) {
      await expect(adapter.getOffer({ ...config, appleApiKey: key })).rejects.toMatchObject({ code: 'STORE_UNAVAILABLE' });
    }
    expect(loader).not.toHaveBeenCalled();
  });

  it.each(['annual', 'another-product', 'another-offering', 'duplicate', 'empty-price', 'zero-price'])
    ('does not substitute an unconfigured or ambiguous offer: %s', async variant => {
      let packages = [monthly];
      if (variant === 'annual') packages = [{ ...monthly, product: { ...monthly.product, subscriptionPeriod: 'P1Y' } }];
      if (variant === 'another-product') packages = [{ ...monthly, product: { ...monthly.product, identifier: 'unrelated' } }];
      if (variant === 'another-offering') packages = [{ ...monthly, presentedOfferingContext: { ...monthly.presentedOfferingContext, offeringIdentifier: 'another' } }];
      if (variant === 'duplicate') packages = [monthly, monthly];
      if (variant === 'empty-price') packages = [{ ...monthly, product: { ...monthly.product, priceString: '' } }];
      if (variant === 'zero-price') packages = [{ ...monthly, product: { ...monthly.product, price: 0 } }];
      sdk.getOfferings.mockResolvedValue(offerings(packages));
      expect(await setup().getOffer(config)).toBeNull();
      expect(sdk.purchasePackage).not.toHaveBeenCalled();
    });

  it('ignores the default offering when the configured one is missing', async () => {
    sdk.getOfferings.mockResolvedValue({ current: { availablePackages: [monthly] }, all: {} });
    expect(await setup().getOffer(config)).toBeNull();
  });

  it('buys only the displayed configured package and returns no client entitlement', async () => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    expect(await adapter.purchase(config, offer!)).toBe('purchased');
    expect(sdk.purchasePackage).toHaveBeenCalledWith({ aPackage: monthly });
    expect(sdk.getOfferings).toHaveBeenCalledTimes(2);
  });

  it('rejects tampered or never-presented offers before any charge', async () => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    await expect(adapter.purchase(config, { ...offer!, priceString: '0,01 €' })).rejects.toMatchObject({ code: 'OFFER_CHANGED' });
    await expect(adapter.purchase(config, offer!)).rejects.toMatchObject({ code: 'OFFER_CHANGED' });
    expect(sdk.purchasePackage).not.toHaveBeenCalled();
  });

  it('requires a new user decision when the price changes after display', async () => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    monthly = { ...monthly, product: { ...monthly.product, price: 5.99, priceString: '5,99 €' } };
    await expect(adapter.purchase(config, offer!)).rejects.toMatchObject({ code: 'OFFER_CHANGED' });
    expect(sdk.purchasePackage).not.toHaveBeenCalled();
  });

  it.each([{ code: '1' }, { code: 1 }, { userCancelled: true }])('recognizes an explicit cancellation: %j', async error => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    sdk.purchasePackage.mockRejectedValue(error);
    expect(await adapter.purchase(config, offer!)).toBe('cancelled');
  });

  it.each([
    ['20', 'PURCHASE_PENDING'], ['7', 'PURCHASE_OWNED_BY_OTHER_ACCOUNT'], ['13', 'PURCHASE_OWNED_BY_OTHER_ACCOUNT'],
    ['6', 'PURCHASE_ALREADY_OWNED'], ['3', 'PURCHASE_NOT_ALLOWED'], ['15', 'STORE_BUSY'], ['10', 'STORE_FAILURE'],
  ])('classifies store failure %s without leaking raw account or receipt data', async (code, expected) => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    sdk.purchasePackage.mockRejectedValue({ code, userCancelled: true, message: 'secret receipt: abc/private-account' });
    const result = await adapter.purchase(config, offer!).catch(error => error);
    expect(result).toMatchObject({ name: 'NativeMembershipError', code: expected });
    expect(result.message).not.toMatch(/secret|receipt|private-account/);
  });

  it('restores only on explicit action, using the authenticated custom ID without returning customerInfo', async () => {
    const adapter = setup();
    expect(await adapter.restore(config)).toBeUndefined();
    expect(sdk.restorePurchases).toHaveBeenCalledOnce();
    expect(sdk.purchasePackage).not.toHaveBeenCalled();
    expect(sdk.getOfferings).not.toHaveBeenCalled();
  });

  it('switches directly between custom IDs without creating an anonymous user', async () => {
    const adapter = setup();
    const oldOffer = await adapter.getOffer(config);
    switchOwner(second);
    const nextConfig = { ...config, appUserId: second };
    await expect(adapter.purchase(nextConfig, oldOffer!)).rejects.toMatchObject({ code: 'OFFER_CHANGED' });
    await adapter.getOffer(nextConfig);
    expect(sdk.configure).toHaveBeenCalledOnce();
    expect(sdk.logIn).toHaveBeenCalledWith({ appUserID: second });
    expect(sdk.logOut).not.toHaveBeenCalled();
    expect(sdk.purchasePackage).not.toHaveBeenCalled();
  });

  it('does not trust a failed SDK identity switch', async () => {
    const adapter = setup();
    await adapter.getOffer(config);
    switchOwner(second);
    sdk.logIn.mockResolvedValue({});
    await expect(adapter.restore({ ...config, appUserId: second })).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    expect(sdk.restorePurchases).not.toHaveBeenCalled();
  });

  it('discards an offering response after account change', async () => {
    const result = deferred<PurchasesOfferings>();
    sdk.getOfferings.mockReturnValue(result.promise);
    const pending = setup().getOffer(config);
    const assertion = expect(pending).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    await vi.waitFor(() => expect(sdk.getOfferings).toHaveBeenCalledOnce());
    switchOwner(second);
    result.resolve(offerings());
    await assertion;
  });

  it('rejects a stale offer even when the same owner signed back in', async () => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    auth.epoch.update(value => value + 1);
    await expect(adapter.purchase(config, offer!)).rejects.toMatchObject({ code: 'OFFER_CHANGED' });
    expect(sdk.purchasePackage).not.toHaveBeenCalled();
  });

  it('keeps SDK identity stable until a payment settles and discards its result after switching accounts', async () => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    const transaction = deferred<unknown>();
    sdk.purchasePackage.mockReturnValue(transaction.promise);
    const payment = adapter.purchase(config, offer!);
    const assertion = expect(payment).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    await vi.waitFor(() => expect(sdk.purchasePackage).toHaveBeenCalledOnce());
    switchOwner(second);
    const next = adapter.getOffer({ ...config, appUserId: second });
    await Promise.resolve();
    expect(sdk.logIn).not.toHaveBeenCalled();
    await expect(adapter.restore({ ...config, appUserId: second })).rejects.toMatchObject({ code: 'STORE_BUSY' });
    transaction.resolve({ customerInfo: { entitlements: { active: { plus: {} } } } });
    await assertion;
    expect(await next).toMatchObject({ priceString: '4,49 €' });
    expect(sdk.logIn).toHaveBeenCalledWith({ appUserID: second });
  });

  it('rejects a second purchase instead of silently queueing another charge', async () => {
    const adapter = setup();
    const offer = await adapter.getOffer(config);
    const transaction = deferred<unknown>();
    sdk.purchasePackage.mockReturnValue(transaction.promise);
    const payment = adapter.purchase(config, offer!);
    await expect(adapter.purchase(config, offer!)).rejects.toMatchObject({ code: 'STORE_BUSY' });
    transaction.resolve({});
    expect(await payment).toBe('purchased');
    expect(sdk.purchasePackage).toHaveBeenCalledOnce();
  });

  it('does not reconfigure the SDK in-process if the provider project key changes', async () => {
    const adapter = setup();
    await adapter.getOffer(config);
    await expect(adapter.getOffer({ ...config, appleApiKey: 'appl_differentProject' }))
      .rejects.toMatchObject({ code: 'STORE_UNAVAILABLE' });
    expect(sdk.configure).toHaveBeenCalledOnce();
  });

  it('opens only store management, without restoring or buying', async () => {
    const url = 'https://play.google.com/store/account/subscriptions?sku=everbloom_plus_monthly&package=com.everbloom.app';
    await setup().manage(url);
    expect(browser.open).toHaveBeenCalledWith({ url });
    expect(loader).not.toHaveBeenCalled();
  });

  it('does not open management after the user logs out while its native plugin loads', async () => {
    const loading = deferred<typeof browser>();
    browserLoader.mockReturnValue(loading.promise);
    const pending = setup().manage('https://apps.apple.com/account/subscriptions');
    const assertion = expect(pending).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    await vi.waitFor(() => expect(browserLoader).toHaveBeenCalledOnce());
    auth.authenticated.set(false);
    loading.resolve(browser);
    await assertion;
    expect(browser.open).not.toHaveBeenCalled();
  });

  it('discards responses after destruction', async () => {
    const loading = deferred<PurchasesOfferings>();
    sdk.getOfferings.mockReturnValue(loading.promise);
    const pending = setup().getOffer(config);
    const assertion = expect(pending).rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    await vi.waitFor(() => expect(sdk.getOfferings).toHaveBeenCalledOnce());
    TestBed.resetTestingModule();
    loading.resolve(offerings());
    await assertion;
  });
});

describe('membership management URL', () => {
  it.each(['https://apps.apple.com/account/subscriptions', 'https://itunes.apple.com/account/subscriptions',
    'https://play.google.com/store/account/subscriptions?sku=monthly&package=com.everbloom.app'])
    ('permits real store settings: %s', url => expect(validateMembershipManagementUrl(url)).toBe(url));
  it.each(['http://apps.apple.com/account/subscriptions', 'https://apps.apple.com.evil.example/account/subscriptions',
    'https://apps.apple.com@evil.example/account/subscriptions', 'https://evil@play.google.com/store/account/subscriptions',
    'javascript:alert(1)', 'https://play.google.com/store/apps', 'https://apps.apple.com:8443/account/subscriptions',
    'https://apps.apple.com/account/subscriptions#external'])
    ('rejects other destinations: %s', url => expect(() => validateMembershipManagementUrl(url)).toThrow());
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(finish => { resolve = finish; });
  return { promise, resolve };
}
