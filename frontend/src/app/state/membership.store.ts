import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApiClient } from '../data/api-client';
import { PendingMembershipStorage } from '../data/pending-membership.storage';
import { NativeMembershipError, NativeMembershipPurchases } from '../data/native-membership';
import { MembershipState, NativeMembershipOffer, readMembershipState } from '../domain/membership';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class MembershipStore {
  private readonly auth = inject(AuthStore);
  private readonly api = inject(ApiClient);
  private readonly pendingStorage = inject(PendingMembershipStorage);
  private readonly purchases = inject(NativeMembershipPurchases);
  private readonly stateValue = signal<MembershipState | null>(null);
  private readonly offerValue = signal<NativeMembershipOffer | null>(null);
  private readonly busyValue = signal(false);
  private readonly loadingValue = signal(false);
  private readonly errorValue = signal('');
  private readonly messageValue = signal('');
  private readonly pendingValue = signal(false);
  private loadRequest: Promise<boolean> | null = null;
  readonly state = this.stateValue.asReadonly();
  readonly offer = this.offerValue.asReadonly();
  readonly busy = this.busyValue.asReadonly();
  readonly loading = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();
  readonly message = this.messageValue.asReadonly();
  readonly pendingVerification = this.pendingValue.asReadonly();
  readonly native = this.purchases.native;
  readonly active = computed(() => !!this.state()?.active);
  readonly bonusPercent = computed(() => this.state()?.characterXpBonusPercent ?? 0);
  readonly advancedBosses = computed(() => this.state()?.advancedBosses ?? false);
  readonly canBuy = computed(() => this.native && this.state()?.mode === 'live' &&
    !!this.offer() && !this.active() && !this.busy() && !this.loading() && !this.pendingVerification());

  constructor() {
    effect(() => {
      this.auth.epoch();
      this.loadingValue.set(false);
      this.stateValue.set(null);
      this.offerValue.set(null);
      const owner = this.auth.user()?.id;
      this.pendingValue.set(owner ? this.pendingStorage.has(owner) : false);
      this.errorValue.set('');
      this.messageValue.set('');
      this.loadRequest = null;
    });
  }

  load(): Promise<boolean> {
    if (this.busy()) return Promise.resolve(false);
    if (this.loadRequest) return this.loadRequest;
    const epoch = this.auth.epoch();
    const request = this.loadState(false, epoch).finally(() => {
      if (this.loadRequest === request) this.loadRequest = null;
    });
    this.loadRequest = request;
    return request;
  }

  async refresh(): Promise<boolean> {
    if (this.busy() || this.loading()) return false;
    const epoch = this.auth.epoch();
    const result = await this.loadState(true, epoch);
    if (result && this.current(epoch)) {
      if (this.active()) this.setPending(false);
      this.messageValue.set(this.active() ? 'Dein Plus-Zugang ist bestätigt.' :
        'Für dieses Herovera-Konto ist aktuell kein aktives Plus-Abo bestätigt. Falls du bereits bezahlt hast, stelle deinen Kauf wieder her.');
    }
    return result;
  }

  private setPending(pending: boolean): void {
    this.pendingValue.set(pending);
    const owner = this.auth.user()?.id;
    if (owner) this.pendingStorage.set(owner, pending);
  }

  private current(epoch: number): boolean {
    return epoch === this.auth.epoch() && this.auth.authenticated();
  }

  private async fetchState(refresh: boolean, epoch: number): Promise<MembershipState | null> {
    const value = await this.auth.owned(headers => refresh
      ? this.api.post<unknown>('/api/billing/refresh', {}, headers)
      : this.api.get<unknown>('/api/billing/membership', headers));
    if (!this.current(epoch)) return null;
    const state = readMembershipState(value);
    if (state.purchaseConfig && state.purchaseConfig.appUserId !== this.auth.user()?.id)
      throw new Error('Der Store gehört nicht zum angezeigten Konto. Bitte melde dich erneut an.');
    this.stateValue.set(state);
    if (state.active) this.setPending(false);
    return state;
  }

  private async loadState(refresh: boolean, epoch: number): Promise<boolean> {
    this.loadingValue.set(true);
    this.errorValue.set('');
    try {
      const state = await this.fetchState(refresh, epoch);
      if (!state) return false;
      this.offerValue.set(null);
      if (this.native && state.purchaseConfig && !state.active) {
        const offer = await this.purchases.getOffer(state.purchaseConfig);
        if (!this.current(epoch)) return false;
        this.offerValue.set(offer);
      }
      return true;
    } catch (error) {
      if (this.current(epoch)) {
        this.offerValue.set(null);
        this.errorValue.set(error instanceof Error ? error.message : 'Dein Abo-Status ist gerade nicht erreichbar.');
      }
      return false;
    } finally {
      if (epoch === this.auth.epoch()) this.loadingValue.set(false);
    }
  }

  async purchase(): Promise<boolean> {
    if (!this.canBuy()) return false;
    const epoch = this.auth.epoch();
    const offer = this.offer()!;
    this.busyValue.set(true);
    this.errorValue.set('');
    this.messageValue.set('');
    let storeOpened = false;
    try {
      const state = await this.fetchState(true, epoch);
      if (!state || state.active || !state.purchaseConfig) return !!state?.active;
      storeOpened = true;
      this.setPending(true);
      const result = await this.purchases.purchase(state.purchaseConfig, offer);
      if (!this.current(epoch)) return false;
      if (result === 'cancelled') {
        this.setPending(false);
        this.messageValue.set('Kauf abgebrochen. Dein kostenloser Spielstand bleibt erhalten.');
        return false;
      }
      this.setPending(true);
      const confirmed = await this.fetchState(true, epoch);
      if (!confirmed) return false;
      this.setPending(!confirmed.active);
      this.messageValue.set(confirmed.active ? 'Willkommen bei Herovera Plus. Dein Zugang ist bestätigt.' :
        'Dein Store-Kauf wird noch geprüft. Bitte kaufe nicht erneut; aktualisiere den Status oder stelle den Kauf wieder her.');
      return confirmed.active;
    } catch (error) {
      if (this.current(epoch)) {
        // A timed-out SDK or server response is not evidence that no payment happened.
        if (storeOpened) {
          const noCheckout = error instanceof NativeMembershipError &&
            ['NATIVE_ONLY', 'ACCOUNT_CHANGED', 'STORE_UNAVAILABLE', 'OFFER_CHANGED', 'STORE_BUSY', 'PURCHASE_NOT_ALLOWED'].includes(error.code);
          this.setPending(!noCheckout);
        }
        this.errorValue.set(error instanceof Error ? error.message : 'Der Kauf konnte noch nicht bestätigt werden.');
      }
      return false;
    } finally {
      this.busyValue.set(false);
    }
  }

  async restore(): Promise<boolean> {
    const config = this.state()?.purchaseConfig;
    if (!this.native || !config || this.busy() || this.loading()) return false;
    const epoch = this.auth.epoch();
    this.busyValue.set(true);
    this.errorValue.set('');
    this.messageValue.set('');
    try {
      await this.purchases.restore(config);
      if (!this.current(epoch)) return false;
      const state = await this.fetchState(true, epoch);
      if (!state) return false;
      if (state.active) this.setPending(false);
      this.messageValue.set(state.active ? 'Dein Plus-Kauf wurde wiederhergestellt.' :
        'Kein aktives Abo für dieses Konto gefunden. Nutze dasselbe Herovera- und Store-Konto wie beim Kauf.');
      return state.active;
    } catch (error) {
      if (this.current(epoch)) this.errorValue.set(error instanceof Error ? error.message : 'Wiederherstellung gerade nicht möglich.');
      return false;
    } finally {
      this.busyValue.set(false);
    }
  }

  /** Explicit user acknowledgement after checking cancellation in the Store.
   * An ordinary inactive refresh cannot resolve an uncertain payment by itself.
   * This only releases the local safeguard; it never opens or authorizes a purchase.
   */
  async retryAfterStoreCancellation(): Promise<boolean> {
    if (!this.pendingVerification() || this.busy() || this.loading()) return false;
    const epoch = this.auth.epoch();
    const checked = await this.loadState(true, epoch);
    if (!checked || !this.current(epoch)) return false;
    this.setPending(false);
    this.messageValue.set(this.active()
      ? 'Der Store bestätigt bereits Plus. Ein weiterer Kauf ist nicht nötig.'
      : 'Deine Prüfung ist vermerkt. Es wurde nichts gekauft. Du kannst bei Bedarf eine neue Kaufanfrage starten.');
    return true;
  }

  async manage(): Promise<void> {
    const url = this.state()?.managementUrl;
    if (!url || this.busy()) return;
    const epoch = this.auth.epoch();
    try { await this.purchases.manage(url); }
    catch (error) { if (this.current(epoch)) this.errorValue.set(error instanceof Error ? error.message : 'Bitte öffne deine Abos direkt im App Store oder Google Play.'); }
  }
}
