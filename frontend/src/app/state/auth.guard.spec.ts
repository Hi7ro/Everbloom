import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { ACCOUNT_MODE } from '../data/account-mode';
import { AuthStore } from './auth.store';
import { GameStore } from './game.store';
import { JourneyStore } from './journey.store';
import { gameGuard, safeReturnPath } from './auth.guard';

describe('account route protection', () => {
  let auth: { ensureSession: ReturnType<typeof vi.fn> };
  let game: {
    snapshot: ReturnType<typeof vi.fn>;
    load: ReturnType<typeof vi.fn>;
    profileIsSaved: ReturnType<typeof vi.fn>;
  };
  let journey: { load: ReturnType<typeof vi.fn>; configured: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    auth = { ensureSession: vi.fn().mockResolvedValue(true) };
    game = {
      snapshot: vi.fn().mockReturnValue(null),
      load: vi.fn().mockResolvedValue(true),
      profileIsSaved: vi.fn().mockReturnValue(true),
    };
    journey = { load: vi.fn().mockResolvedValue(true), configured: vi.fn().mockReturnValue(true) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ACCOUNT_MODE, useValue: true },
        { provide: AuthStore, useValue: auth },
        { provide: GameStore, useValue: game },
        { provide: JourneyStore, useValue: journey },
      ],
    });
  });
  function guard(data = { needsCharacter: true, needsJourney: true }) {
    return TestBed.runInInjectionContext(() =>
      gameGuard(
        { data } as unknown as ActivatedRouteSnapshot,
        { url: '/dashboard' } as RouterStateSnapshot,
      ),
    );
  }
  it('requires login before even requesting a game snapshot', async () => {
    auth.ensureSession.mockResolvedValue(false);
    expect(((await guard()) as UrlTree).toString()).toBe('/auth?returnTo=%2Fdashboard');
    expect(game.load).not.toHaveBeenCalled();
    expect(journey.load).not.toHaveBeenCalled();
  });
  it('routes an account with no character to creation', async () => {
    game.profileIsSaved.mockReturnValue(false);
    expect(((await guard()) as UrlTree).toString()).toBe('/character/create');
  });
  it('requires the first focus choice before gameplay', async () => {
    journey.configured.mockReturnValue(false);
    expect(((await guard()) as UrlTree).toString()).toBe('/onboarding');
    expect(await guard({ needsCharacter: true, needsJourney: false })).toBe(true);
  });
  it('shows connection recovery instead of a mock game after an API failure', async () => {
    game.load.mockResolvedValue(false);
    expect(((await guard()) as UrlTree).toString()).toBe('/connection?returnTo=%2Fdashboard');
    expect(journey.load).not.toHaveBeenCalled();
  });
  it('also preserves an unavailable journey instead of silently saving defaults', async () => {
    journey.load.mockResolvedValue(false);
    expect(((await guard()) as UrlTree).toString()).toBe('/connection?returnTo=%2Fdashboard');
  });
  it('continues an existing character only after both account-bound loads succeed', async () => {
    expect(await guard()).toBe(true);
    expect(game.load).toHaveBeenCalledOnce();
    expect(journey.load).toHaveBeenCalledOnce();
  });
  it('reconciles ownership even when a previous account snapshot is still cached', async () => {
    game.snapshot.mockReturnValue({ character: { name: 'Previous account' } });
    game.load.mockResolvedValue(false);
    expect(((await guard()) as UrlTree).toString()).toBe('/connection?returnTo=%2Fdashboard');
    expect(game.load).toHaveBeenCalledOnce();
    expect(journey.load).not.toHaveBeenCalled();
  });
  it('uses only known local return destinations', () => {
    for (const value of [
      'https://evil.test',
      '//evil.test',
      '/auth',
      '/dashboard;other=x',
      '/account?redirect=https://evil.test',
      null,
    ])
      expect(safeReturnPath(value)).toBe('/dashboard');
    expect(safeReturnPath('/character/create')).toBe('/character/create');
  });
});
