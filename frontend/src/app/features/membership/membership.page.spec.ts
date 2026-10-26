import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MembershipState, NativeMembershipOffer } from '../../domain/membership';
import { MembershipStore } from '../../state/membership.store';
import { MembershipPage } from './membership.page';

describe('membership page', () => {
  const preview: MembershipState = {
    mode: 'preview', active: false, verifiedAt: null, expiresAt: null, willRenew: null, store: null,
    managementUrl: null, characterXpBonusPercent: 0, advancedBosses: true, purchaseConfig: null,
  };
  const live: MembershipState = {
    ...preview, mode: 'live', advancedBosses: false,
    purchaseConfig: { appUserId: 'account', entitlementId: 'plus', offeringId: 'plus_monthly',
      appleProductId: 'plus_monthly', googleProductId: 'plus:monthly', appleApiKey: 'appl_public', googleApiKey: 'goog_public' },
  };
  const state = signal<MembershipState | null>(preview);
  const offer = signal<NativeMembershipOffer | null>(null);
  const busy = signal(false);
  const loading = signal(false);
  const pendingVerification = signal(false);
  const error = signal('');
  const message = signal('');
  const load = vi.fn();
  const refresh = vi.fn();
  const purchase = vi.fn();
  const restore = vi.fn();
  const manage = vi.fn();

  async function setup(native = true) {
    await TestBed.configureTestingModule({ imports: [MembershipPage], providers: [provideRouter([]), {
      provide: MembershipStore, useValue: {
        state, offer, busy, loading, pendingVerification, error, message, native,
        active: computed(() => !!state()?.active),
        canBuy: computed(() => native && state()?.mode === 'live' && !state()?.active && !!offer() && !busy() && !loading() && !pendingVerification()),
        load, refresh, purchase, restore, manage,
      },
    }] }).compileComponents();
    const fixture = TestBed.createComponent(MembershipPage);
    await fixture.whenStable();
    return fixture;
  }
  function monthly() {
    state.set(live);
    offer.set({ identifier: '$rc_monthly', productId: 'plus_monthly', priceString: '5,49 €', period: 'month' });
  }
  beforeEach(() => {
    state.set(preview); offer.set(null); busy.set(false); loading.set(false); pendingVerification.set(false);
    error.set(''); message.set('');
    for (const method of [load, refresh, purchase, restore, manage]) method.mockResolvedValue(true);
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.resetAllMocks(); });

  it('loads the account status without starting a purchase or restore and labels the preview price honestly', async () => {
    const fixture = await setup();
    const html: HTMLElement = fixture.nativeElement;
    expect(load).toHaveBeenCalledOnce();
    expect(html.querySelector('.price')?.textContent).toContain('3,99');
    expect(html.querySelector('.price')?.textContent).toContain('kein Kauf möglich');
    expect(html.querySelector('.buy-button')).toBeNull();
    expect(html.querySelector('.restore-button')).toBeNull();
    expect(html.textContent).toContain('Alle zehn Bosse mit allen vier Modi sind ohne Abo testbar');
    expect(purchase).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
  });

  it('shows the localized Store price and actual recurring terms before the native purchase action', async () => {
    monthly();
    const fixture = await setup();
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector('.price')?.textContent).toContain('5,49 €');
    expect(html.querySelector('.price')?.textContent).not.toContain('3,99');
    expect(html.querySelector('.subscription-terms')?.textContent).toContain('automatischer Verlängerung');
    const button = html.querySelector<HTMLButtonElement>('.buy-button')!;
    expect(button.textContent).toContain('5,49 € / Monat');
    expect(button.disabled).toBe(false);
    button.click();
    expect(purchase).toHaveBeenCalledOnce();
  });

  it('prevents another payment while verification is pending and keeps recovery actions visible', async () => {
    monthly(); pendingVerification.set(true);
    const fixture = await setup();
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector<HTMLButtonElement>('.buy-button')?.disabled).toBe(true);
    expect(html.querySelector('.pending-note[role="status"]')?.textContent).toContain('Bitte kaufe nicht erneut');
    html.querySelector<HTMLButtonElement>('.refresh-button')!.click();
    html.querySelector<HTMLButtonElement>('.restore-button')!.click();
    expect(refresh).toHaveBeenCalledOnce();
    expect(restore).toHaveBeenCalledOnce();
    expect(purchase).not.toHaveBeenCalled();
  });

  it('does not display a placeholder price or checkout when the native Store has no offering', async () => {
    state.set(live);
    const fixture = await setup();
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector('.price')).toBeNull();
    expect(html.querySelector('.buy-button')).toBeNull();
    expect(html.textContent).toContain('noch kein Monatsangebot');
    expect(html.querySelector('.restore-button')).not.toBeNull();
  });

  it('does not offer a web checkout or fake store price', async () => {
    state.set(live);
    const fixture = await setup(false);
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector('.buy-button')).toBeNull();
    expect(html.querySelector('.restore-button')).toBeNull();
    expect(html.querySelector('.price')).toBeNull();
    expect(html.textContent).toContain('Plus abonnierst du in der iOS- oder Android-App');
  });

  it('shows confirmed access through expiry after cancellation and replaces checkout with management', async () => {
    monthly();
    state.set({ ...live, active: true, characterXpBonusPercent: 10, advancedBosses: true, willRenew: false,
      expiresAt: '2026-11-05T12:00:00Z', managementUrl: 'https://apps.apple.com/account/subscriptions' });
    const fixture = await setup();
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector('.active-plan')?.textContent).toContain('bestätigt');
    expect(html.querySelector('.access-date')?.textContent).toContain('5. November 2026');
    expect(html.textContent).toContain('Verlängerung ist ausgeschaltet');
    expect(html.querySelector('.buy-button')).toBeNull();
    html.querySelector<HTMLButtonElement>('.manage-button')!.click();
    expect(manage).toHaveBeenCalledOnce();
  });

  it('links an existing web subscriber directly to validated store management', async () => {
    const url = 'https://play.google.com/store/account/subscriptions?sku=plus&package=com.everbloom.app';
    state.set({ ...live, active: true, characterXpBonusPercent: 10, advancedBosses: true, managementUrl: url });
    const fixture = await setup(false);
    const link = fixture.nativeElement.querySelector('.manage-link') as HTMLAnchorElement;
    expect(link.href).toBe(url);
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    expect(fixture.nativeElement.querySelector('.manage-button')).toBeNull();
  });

  it('does not render an arbitrary external subscription-management link', async () => {
    state.set({ ...live, active: true, characterXpBonusPercent: 10, advancedBosses: true,
      managementUrl: 'https://malicious.example/checkout' });
    const fixture = await setup(false);
    expect(fixture.nativeElement.querySelector('.manage-link')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('malicious.example');
    expect(fixture.nativeElement.textContent).toContain('direkt in deinem App-Store- oder Google-Play-Konto');
  });

  it.each(['busy', 'loading'])('disables store actions during %s', async phase => {
    monthly();
    if (phase === 'busy') busy.set(true); else loading.set(true);
    const fixture = await setup();
    const html: HTMLElement = fixture.nativeElement;
    for (const selector of ['.buy-button', '.restore-button', '.refresh-button']) {
      expect(html.querySelector<HTMLButtonElement>(selector)?.disabled).toBe(true);
    }
  });

  it('offers a retry after a status error without implying Plus is active', async () => {
    state.set(null); error.set('Der Abo-Status ist gerade nicht erreichbar.');
    const fixture = await setup();
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector('[role="alert"]')?.textContent).toContain('nicht erreichbar');
    expect(html.querySelector('.active-plan')).toBeNull();
    expect(html.querySelector('.buy-button')).toBeNull();
    html.querySelector<HTMLButtonElement>('.refresh-button')!.click();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('describes the implemented content without promising extra skill XP, damage or lost cosmetics', async () => {
    state.set(live);
    const fixture = await setup(false);
    const html: HTMLElement = fixture.nativeElement;
    expect(html.textContent).toContain('5 Bosse · Normal bis Level 50');
    expect(html.textContent).toContain('35 · weitere Bosse & höhere Modi');
    expect(html.textContent).toContain('Bosskampagne von Level 60 bis 100');
    expect(html.textContent).toContain('Die normalen Bosse bis Level 50 bleiben spielbar');
    expect(html.textContent).not.toContain('alle 10 normalen Bosse');
    expect(html.textContent).toContain('Skill-XP, Questboni und Boss-Schaden bleiben gleich');
    expect(html.textContent).toContain('Aus 100 Charakter-Aktivitäts-XP werden 110');
    expect(html.textContent).toContain('Frisuren, Ausrüstungssets und Auren bleiben erhalten');
    expect(html.textContent).not.toContain('Weitere Skillpfade geplant');
    expect(html.textContent).not.toContain('Questkapitel');
  });

  it('keeps terms, privacy and support accessible from the purchase section', async () => {
    monthly();
    const fixture = await setup();
    const hrefs = [...fixture.nativeElement.querySelectorAll('.purchase-links a') as NodeListOf<HTMLAnchorElement>]
      .map(link => link.getAttribute('href'));
    expect(hrefs).toEqual(['/terms', '/privacy', '/support']);
  });
});
