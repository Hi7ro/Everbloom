import { computed, Injectable, signal } from '@angular/core';
import { MembershipState, NativeMembershipOffer, readMembershipState } from '../domain/membership';

/** The existing Plus page's real preview state, without Auth/API/Store dependencies. */
@Injectable()
export class PortfolioDemoMembership {
  readonly state = signal<MembershipState>(
    readMembershipState({
      mode: 'preview',
      active: false,
      verifiedAt: null,
      expiresAt: null,
      willRenew: null,
      store: null,
      managementUrl: null,
      characterXpBonusPercent: 0,
      advancedBosses: true,
      purchaseConfig: null,
    }),
  );
  readonly offer = signal<NativeMembershipOffer | null>(null);
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly pendingVerification = signal(false);
  readonly native = false;
  readonly active = computed(() => false);
  readonly bonusPercent = computed(() => 0);
  readonly advancedBosses = computed(() => true);
  readonly canBuy = computed(() => false);
  async load() {
    return true;
  }
  async refresh() {
    this.message.set(
      'Lokale Vorschau: Alle erreichten Bossmodi sind verfügbar. Es gibt keine Käufe und keinen XP-Kaufbonus.',
    );
    return true;
  }
  async purchase() {
    return this.unavailable();
  }
  async restore() {
    return this.unavailable();
  }
  async manage() {
    return this.unavailable();
  }
  retryAfterStoreCancellation() {
    return false;
  }
  private unavailable() {
    this.message.set('In dieser lokalen Fassung findet kein Store-Vorgang statt.');
    return false;
  }
}
