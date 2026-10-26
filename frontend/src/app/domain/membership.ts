/** Public native SDK identifiers only; secret store/provider credentials stay on the server. */
export interface MembershipPurchaseConfig {
  appUserId: string;
  entitlementId: string;
  appleProductId: string;
  googleProductId: string;
  offeringId: string;
  appleApiKey: string;
  googleApiKey: string;
}

export interface MembershipState {
  mode: 'preview' | 'live';
  active: boolean;
  verifiedAt: string | null;
  expiresAt: string | null;
  willRenew: boolean | null;
  store: 'app_store' | 'play_store' | null;
  managementUrl: string | null;
  characterXpBonusPercent: number;
  advancedBosses: boolean;
  purchaseConfig: MembershipPurchaseConfig | null;
}

/** Display values come from a real monthly Store product, not from a configured marketing price. */
export interface NativeMembershipOffer {
  identifier: string;
  productId: string;
  priceString: string;
  period: 'month';
}

export function membershipBonus(activityXp: number, percent: number): number {
  return percent === 10 && Number.isSafeInteger(activityXp) && activityXp > 0
    ? Math.floor(activityXp / 10) : 0;
}

export function readMembershipState(value: unknown): MembershipState {
  const state = value as MembershipState | null;
  if (!state || !['preview', 'live'].includes(state.mode) || typeof state.active !== 'boolean' ||
    typeof state.advancedBosses !== 'boolean' || ![0, 10].includes(state.characterXpBonusPercent) ||
    ![true, false, null].includes(state.willRenew) || ![null, 'app_store', 'play_store'].includes(state.store))
    throw new Error('Der Abo-Status konnte nicht sicher gelesen werden.');
  for (const date of [state.verifiedAt, state.expiresAt]) {
    if (date !== null && (typeof date !== 'string' || !Number.isFinite(Date.parse(date))))
      throw new Error('Der Abo-Status enthält ein ungültiges Datum.');
  }
  if (state.managementUrl !== null && typeof state.managementUrl !== 'string')
    throw new Error('Die Abo-Verwaltung ist gerade nicht verfügbar.');
  if (state.mode === 'preview' && (state.active || state.characterXpBonusPercent !== 0 || state.purchaseConfig !== null))
    throw new Error('Der Abo-Status widerspricht dieser Vorschau.');
  if (state.mode === 'live' && (state.characterXpBonusPercent !== (state.active ? 10 : 0) || state.advancedBosses !== state.active))
    throw new Error('Die Mitgliedschaft konnte nicht bestätigt werden.');
  if (state.purchaseConfig !== null) {
    const config = state.purchaseConfig;
    if (!config || ['appUserId', 'entitlementId', 'appleProductId', 'googleProductId', 'offeringId', 'appleApiKey', 'googleApiKey']
      .some(key => typeof config[key as keyof MembershipPurchaseConfig] !== 'string' || !config[key as keyof MembershipPurchaseConfig].trim()))
      throw new Error('Der Store ist noch nicht vollständig eingerichtet.');
  }
  return state;
}
