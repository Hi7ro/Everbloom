import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { ACCOUNT_MODE } from '../../data/account-mode';
import { AuthStore } from '../../state/auth.store';

describe('public account deletion entry', () => {
  const ensureSession = vi.fn().mockResolvedValue(false);

  beforeEach(() => {
    ensureSession.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: ACCOUNT_MODE, useValue: true },
        {
          provide: AuthStore,
          useValue: {
            ensureSession,
            authenticated: signal(false),
            busy: signal(false),
            notice: signal(''),
            error: signal(''),
          },
        },
      ],
    });
  });

  it('opens without a session and explains deletion without reinstalling the app', async () => {
    const harness = await RouterTestingHarness.create('/delete-account');
    const page = harness.routeNativeElement!;
    expect(ensureSession).not.toHaveBeenCalled();
    expect(page.textContent).toContain('nicht erneut installieren');
    expect(page.querySelector('a.primary')?.getAttribute('href')).toBe('/account');
    expect(page.querySelector('form')).toBeNull();
    expect(page.textContent).toContain('unabhängig vom Abo-Status');
    expect(page.querySelector('a[href="/auth/reset"]')).not.toBeNull();
  });

  it('requires login for the actual account controls and keeps the return destination', async () => {
    const harness = await RouterTestingHarness.create('/delete-account');
    (harness.routeNativeElement!.querySelector('a.primary') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/auth?returnTo=%2Faccount');
    expect(harness.routeNativeElement!.querySelector('input[type="password"]')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('a[href="/terms"]')).not.toBeNull();
  });
});
