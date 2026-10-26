import { DestroyRef, inject, Injectable, InjectionToken } from '@angular/core';
import type { BrowserPlugin } from '@capacitor/browser';
import type { PurchasesPackage, PurchasesPlugin } from '@revenuecat/purchases-capacitor';
import { MembershipPurchaseConfig, NativeMembershipOffer } from '../domain/membership';
import { AuthStore } from '../state/auth.store';
import { NATIVE_ANDROID } from './native-lifecycle';
import { NATIVE_PLATFORM } from './runtime-api-config';

export type NativeMembershipSdk = Pick<PurchasesPlugin,
  'configure' | 'getAppUserID' | 'logIn' | 'getOfferings' | 'purchasePackage' | 'restorePurchases'>;

export const NATIVE_MEMBERSHIP_SDK = new InjectionToken<() => Promise<NativeMembershipSdk>>('Native membership SDK', {
  providedIn: 'root', factory: () => async () => {
    const module = await import('@revenuecat/purchases-capacitor');
    await module.Purchases.setLogLevel({ level: module.LOG_LEVEL.ERROR });
    return module.Purchases;
  },
});
export const NATIVE_MEMBERSHIP_BROWSER = new InjectionToken<() => Promise<Pick<BrowserPlugin, 'open'>>>(
  'Native membership management browser', {
    providedIn: 'root', factory: () => () => import('@capacitor/browser').then(module => module.Browser),
  },
);

type MembershipErrorCode = 'NATIVE_ONLY' | 'ACCOUNT_CHANGED' | 'STORE_UNAVAILABLE' | 'OFFER_CHANGED' |
  'PURCHASE_PENDING' | 'PURCHASE_OWNED_BY_OTHER_ACCOUNT' | 'PURCHASE_ALREADY_OWNED' |
  'PURCHASE_NOT_ALLOWED' | 'STORE_BUSY' | 'STORE_FAILURE' | 'MANAGEMENT_UNAVAILABLE';

/** Safe messages only: SDK failures can contain account, receipt and configuration details. */
export class NativeMembershipError extends Error {
  constructor(readonly code: MembershipErrorCode, message: string) {
    super(message);
    this.name = 'NativeMembershipError';
  }
}

/** This opens store subscription settings, never an external checkout or an arbitrary provider URL. */
export function validateMembershipManagementUrl(value: string): string {
  try {
    const url = new URL(value);
    const apple = ['apps.apple.com', 'itunes.apple.com'].includes(url.hostname) &&
      /^\/account\/subscriptions\/?$/.test(url.pathname);
    const google = url.hostname === 'play.google.com' && /^\/store\/account\/subscriptions\/?$/.test(url.pathname);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash || !(apple || google))
      throw new Error();
    return url.href;
  } catch {
    throw new NativeMembershipError('MANAGEMENT_UNAVAILABLE', 'Die sichere Abo-Verwaltung ist gerade nicht verfügbar.');
  }
}

interface Owner { id: string; epoch: number; }
interface StoredOffer { owner: Owner; configKey: string; offer: NativeMembershipOffer; }

/** Native checkout only. The server, never SDK customerInfo, decides whether Plus is active. */
@Injectable({ providedIn: 'root' })
export class NativeMembershipPurchases {
  readonly native = inject(NATIVE_PLATFORM);
  private readonly android = inject(NATIVE_ANDROID);
  private readonly auth = inject(AuthStore);
  private readonly loadSdk = inject(NATIVE_MEMBERSHIP_SDK);
  private readonly loadBrowser = inject(NATIVE_MEMBERSHIP_BROWSER);
  private sdk?: Promise<NativeMembershipSdk>;
  private configuredKey?: string;
  private readonly offers = new Map<string, StoredOffer>();
  private tail: Promise<void> = Promise.resolve();
  private mutationPending = false;
  private disposed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => { this.disposed = true; this.offers.clear(); });
  }

  async getOffer(config: MembershipPurchaseConfig): Promise<NativeMembershipOffer | null> {
    if (!this.native) return null;
    const owner = this.owner(config);
    const settings = { ...config };
    return this.serial(owner, async () => {
      const sdk = await this.bind(settings, owner);
      this.offers.clear();
      const selected = await this.selectPackage(sdk, settings, owner);
      if (!selected) return null;
      const offer = Object.freeze(this.describe(selected));
      this.offers.set(offer.identifier, { owner, configKey: this.configKey(settings), offer });
      return offer;
    });
  }

  async purchase(config: MembershipPurchaseConfig, offer: NativeMembershipOffer): Promise<'purchased' | 'cancelled'> {
    const owner = this.owner(config);
    const settings = { ...config };
    const displayed = { ...offer };
    return this.mutate(owner, async () => {
      const sdk = await this.bind(settings, owner);
      const stored = this.offers.get(displayed.identifier);
      if (!stored || stored.owner.id !== owner.id || stored.owner.epoch !== owner.epoch ||
          stored.configKey !== this.configKey(settings) || !this.sameOffer(stored.offer, displayed))
        throw this.changedOffer();
      // Re-read price/product before opening payment. Never silently purchase a replacement package.
      const selected = await this.selectPackage(sdk, settings, owner);
      if (!selected || !this.sameOffer(displayed, this.describe(selected))) throw this.changedOffer();
      await this.assertSdkOwner(sdk, owner);
      try {
        await sdk.purchasePackage({ aPackage: selected });
        this.assertOwner(owner);
        return 'purchased';
      } catch (error) {
        this.assertOwner(owner);
        if (purchaseErrorCode(error) === '1') return 'cancelled';
        throw error;
      }
    });
  }

  async restore(config: MembershipPurchaseConfig): Promise<void> {
    const owner = this.owner(config);
    const settings = { ...config };
    return this.mutate(owner, async () => {
      const sdk = await this.bind(settings, owner);
      await this.assertSdkOwner(sdk, owner);
      // Explicit user action only. RevenueCat must use "Keep with original App User ID".
      await sdk.restorePurchases();
      this.assertOwner(owner);
    });
  }

  async manage(url: string): Promise<void> {
    const owner = this.owner();
    const destination = validateMembershipManagementUrl(url);
    return this.serial(owner, async () => {
      const browser = await this.loadBrowser();
      this.assertOwner(owner);
      await browser.open({ url: destination });
      this.assertOwner(owner);
    });
  }

  private owner(config?: MembershipPurchaseConfig): Owner {
    if (!this.native) throw new NativeMembershipError('NATIVE_ONLY', 'Käufe sind in der iOS- und Android-App verfügbar.');
    const id = this.auth.user()?.id;
    if (!id || !this.auth.authenticated() || (config && config.appUserId !== id)) throw this.changedOwner();
    const owner = { id, epoch: this.auth.epoch() };
    this.assertOwner(owner);
    return owner;
  }

  private assertOwner(owner: Owner): void {
    if (this.disposed || !this.auth.authenticated() || this.auth.user()?.id !== owner.id || this.auth.epoch() !== owner.epoch) {
      this.offers.clear();
      throw this.changedOwner();
    }
  }

  private async bind(config: MembershipPurchaseConfig, owner: Owner): Promise<NativeMembershipSdk> {
    this.assertOwner(owner);
    const apiKey = this.android ? config.googleApiKey : config.appleApiKey;
    const prefix = this.android ? 'goog_' : 'appl_';
    if (!apiKey?.startsWith(prefix) || /\s/.test(apiKey) ||
        ![this.productId(config), config.offeringId, config.entitlementId].every(value => typeof value === 'string' && !!value.trim()))
      throw new NativeMembershipError('STORE_UNAVAILABLE', 'Der Store ist noch nicht vollständig eingerichtet.');
    if (this.configuredKey && this.configuredKey !== apiKey)
      throw new NativeMembershipError('STORE_UNAVAILABLE', 'Die Store-Konfiguration wurde geändert. Bitte starte die App erneut.');
    const sdk = await (this.sdk ??= this.loadSdk().catch(error => { this.sdk = undefined; throw error; }));
    this.assertOwner(owner);
    if (!this.configuredKey) {
      await sdk.configure({ apiKey, appUserID: owner.id });
      this.configuredKey = apiKey;
      this.assertOwner(owner);
    }
    const current = await sdk.getAppUserID();
    this.assertOwner(owner);
    if (current.appUserID !== owner.id) {
      this.offers.clear();
      // All accounts use stable IDs. logOut would create an unwanted anonymous purchase identity.
      await sdk.logIn({ appUserID: owner.id });
      this.assertOwner(owner);
    }
    await this.assertSdkOwner(sdk, owner);
    return sdk;
  }

  private async assertSdkOwner(sdk: NativeMembershipSdk, owner: Owner): Promise<void> {
    this.assertOwner(owner);
    const current = await sdk.getAppUserID();
    this.assertOwner(owner);
    if (current.appUserID !== owner.id) throw this.changedOwner();
  }

  private async selectPackage(sdk: NativeMembershipSdk, config: MembershipPurchaseConfig, owner: Owner): Promise<PurchasesPackage | null> {
    const offerings = await sdk.getOfferings();
    this.assertOwner(owner);
    const offering = offerings.all[config.offeringId];
    if (!offering || offering.identifier !== config.offeringId) return null;
    const matches = offering.availablePackages.filter(candidate =>
      candidate.packageType === 'MONTHLY' && candidate.product.identifier === this.productId(config) &&
      candidate.product.subscriptionPeriod === 'P1M' &&
      candidate.presentedOfferingContext?.offeringIdentifier === config.offeringId &&
      Number.isFinite(candidate.product.price) && candidate.product.price > 0 && !!candidate.product.priceString?.trim());
    return matches.length === 1 ? matches[0] : null;
  }

  private describe(value: PurchasesPackage): NativeMembershipOffer {
    return { identifier: value.identifier, productId: value.product.identifier, priceString: value.product.priceString, period: 'month' };
  }
  private sameOffer(a: NativeMembershipOffer, b: NativeMembershipOffer): boolean {
    return a.identifier === b.identifier && a.productId === b.productId && a.priceString === b.priceString && a.period === b.period;
  }
  private configKey(config: MembershipPurchaseConfig): string {
    return JSON.stringify([config.appUserId, config.entitlementId, this.productId(config), config.offeringId,
      this.android ? config.googleApiKey : config.appleApiKey]);
  }
  private productId(config: MembershipPurchaseConfig): string {
    return this.android ? config.googleProductId : config.appleProductId;
  }
  private changedOwner(): NativeMembershipError {
    return new NativeMembershipError('ACCOUNT_CHANGED', 'Das Konto wurde gewechselt. Bitte lade den Abo-Status erneut.');
  }
  private changedOffer(): NativeMembershipError {
    this.offers.clear();
    return new NativeMembershipError('OFFER_CHANGED', 'Das Store-Angebot hat sich geändert. Bitte lade Preis und Angebot erneut.');
  }

  private async mutate<T>(owner: Owner, work: () => Promise<T>): Promise<T> {
    if (this.mutationPending) throw new NativeMembershipError('STORE_BUSY', 'Ein Store-Vorgang läuft bereits. Bitte schließe ihn zuerst ab.');
    this.mutationPending = true;
    // No timeout: a pending OS payment sheet must not allow a second purchase or an SDK account switch.
    try { return await this.serial(owner, work); }
    finally { this.mutationPending = false; }
  }

  private serial<T>(owner: Owner, work: () => Promise<T>): Promise<T> {
    const result = this.tail.then(async () => {
      this.assertOwner(owner);
      try { return await work(); }
      catch (error) { this.assertOwner(owner); throw safePurchaseError(error); }
    });
    this.tail = result.then(() => undefined, () => undefined);
    return result;
  }
}

function purchaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const value = error as { code?: unknown; userCancelled?: unknown };
  if (typeof value.code === 'string' || typeof value.code === 'number') return String(value.code);
  return value.userCancelled === true ? '1' : undefined;
}

function safePurchaseError(error: unknown): NativeMembershipError {
  if (error instanceof NativeMembershipError) return error;
  switch (purchaseErrorCode(error)) {
    case '20': return new NativeMembershipError('PURCHASE_PENDING', 'Deine Zahlung wartet auf Bestätigung im Store. Bitte kaufe nicht erneut; prüfe den Abo-Status später.');
    case '7': case '13': return new NativeMembershipError('PURCHASE_OWNED_BY_OTHER_ACCOUNT', 'Dieses Abo gehört bereits zu einem anderen Herovera-Konto. Bitte melde dich mit dem ursprünglichen Konto an.');
    case '6': return new NativeMembershipError('PURCHASE_ALREADY_OWNED', 'Dieses Abo wurde bereits gekauft. Bitte stelle den Kauf wieder her.');
    case '3': return new NativeMembershipError('PURCHASE_NOT_ALLOWED', 'Dieser Store-Account kann gerade keine Käufe abschließen. Bitte prüfe seine Kaufberechtigungen.');
    case '15': return new NativeMembershipError('STORE_BUSY', 'Ein Store-Vorgang läuft bereits. Bitte schließe ihn zuerst ab.');
    default: return new NativeMembershipError('STORE_FAILURE', 'Der Store-Vorgang konnte nicht bestätigt werden. Prüfe deinen Abo-Status, bevor du erneut kaufst.');
  }
}
