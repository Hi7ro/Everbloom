import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ACCOUNT_MODE } from '../data/account-mode';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { GameStore } from '../state/game.store';
import { JourneyStore } from '../state/journey.store';
import { portfolioDemoConfig } from './portfolio-demo.config';

describe('portfolio demo boundary', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: portfolioDemoConfig.providers }));

  it('disables account mode, browser persistence and backend transport', async () => {
    expect(TestBed.inject(ACCOUNT_MODE)).toBe(false);
    expect(TestBed.inject(BROWSER_STORAGE)).toBeNull();
    const request = vi.spyOn(TestBed.inject(HttpClient), 'request');
    const game = TestBed.inject(GameStore);
    expect(await game.load()).toBe(true);
    expect(await game.record('calisthenics', 20)).toBe(true);
    expect(game.message()).toContain('+150 XP');
    expect(game.snapshot()?.character.totalXp).toBe(26076);
    expect(game.questsDone()).toBe(1);
    expect(game.error()).toBe('');
    expect(request).not.toHaveBeenCalled();
  });

  it('opens the actual dashboard without an account or backend connection', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    expect(harness.routeNativeElement?.querySelector('#character-name')?.textContent).toContain(
      'Ari Demo',
    );
    expect(harness.routeNativeElement?.querySelector('#skills')).toBeTruthy();
    expect(harness.routeNativeElement?.querySelector('app-demo-guide')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('app-progress-storage-note')).toBeNull();
    expect(TestBed.inject(JourneyStore).accountMode).toBe(false);
  });

  it('runs the reused dashboard, creator and onboarding without constructing backend transport', async () => {
    TestBed.overrideProvider(HttpClient, {
      useFactory: () => {
        throw new Error('Backend transport must remain unreachable in the demo');
      },
    });
    const harness = await RouterTestingHarness.create('/dashboard');
    const game = TestBed.inject(GameStore);
    expect(await game.record('calisthenics', 20)).toBe(true);
    expect(game.snapshot()?.character.totalXp).toBe(26076);
    await harness.navigateByUrl('/character/create');
    expect(TestBed.inject(Router).url).toBe('/character/create');
    expect(
      harness.routeNativeElement?.querySelector('#profile-storage-note')?.textContent,
    ).toContain('nur für diese Sitzung');
    const character = game.snapshot()!.character;
    expect(
      await game.updateCharacter({ name: 'Ari Portfolio', appearance: character.appearance }),
    ).toBe(true);
    expect(game.message()).toContain('in dieser Demo nur im aktuellen Tab gespeichert');
    expect(game.message()).not.toContain('blockiert');
    await harness.navigateByUrl('/onboarding');
    expect(TestBed.inject(Router).url).toBe('/onboarding');
  });

  it('clears a rejected local encounter so a valid boss challenge remains playable', async () => {
    const game = TestBed.inject(GameStore);
    await game.load();
    expect(await game.fightBoss('mosswarden', 'ultimate', 'balanced')).toBeNull();
    expect(game.error()).toContain('Level 40');
    const accepted = await game.fightBoss('mosswarden', 'normal', 'balanced');
    expect(accepted?.replay.outcome).toBe('victory');
    expect(accepted?.reward?.id).toBe('moss-crown');
    expect(game.error()).toBe('');
  });

  it('opens membership from the actual dashboard teaser link', async () => {
    TestBed.overrideProvider(HttpClient, {
      useFactory: () => {
        throw new Error('Backend transport must remain unreachable');
      },
    });
    const harness = await RouterTestingHarness.create('/dashboard');
    const link =
      harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a.membership-teaser')!;
    expect(link).toBeTruthy();
    link.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/membership');
    expect(harness.routeNativeElement?.querySelector('#membership-title')).toBeTruthy();
  });

  it('opens the existing membership preview without backend transport or purchases', async () => {
    TestBed.overrideProvider(HttpClient, {
      useFactory: () => {
        throw new Error('Backend transport must remain unreachable');
      },
    });
    const harness = await RouterTestingHarness.create('/membership');
    expect(harness.routeNativeElement?.querySelector('#membership-title')).toBeTruthy();
    expect(harness.routeNativeElement?.textContent).toContain('VORSCHAU · NOCH NICHT BUCHBAR');
    expect(harness.routeNativeElement?.querySelector('.buy-button')).toBeNull();
  });

  it.each([
    ['/terms', 'Deine Reise. Klare Regeln.'],
    ['/privacy', 'Dein Fortschritt. Deine Daten.'],
    ['/support', 'Wir finden den nächsten Schritt.'],
  ])(
    'opens the existing %s information page from its real membership link',
    async (path, heading) => {
      TestBed.overrideProvider(HttpClient, {
        useFactory: () => {
          throw new Error('Backend transport must remain unreachable');
        },
      });
      const harness = await RouterTestingHarness.create('/membership');
      const link = harness.routeNativeElement!.querySelector<HTMLAnchorElement>(
        'a[href$="' + path + '"]',
      )!;
      expect(link).toBeTruthy();
      link.click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(path);
      expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(heading);
      expect(harness.routeNativeElement?.querySelector('#demo-steps')).toBeNull();
    },
  );

  it('recovers account routes to the local-mode information', async () => {
    const harness = await RouterTestingHarness.create();
    for (const path of ['/auth', '/account', '/auth/reset']) {
      await harness.navigateByUrl(path);
      expect(TestBed.inject(Router).url).toBe('/demo');
      expect(harness.routeNativeElement?.querySelector('#demo-steps')).toBeTruthy();
    }
  });
});
