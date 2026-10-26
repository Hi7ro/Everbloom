import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { AuthStore, AuthUser } from '../../state/auth.store';
import { AuthPage } from './auth.page';

describe('beta auth page', () => {
  const busy = signal(false);
  const user = signal<AuthUser | null>(null);
  const routeSnapshot = { queryParamMap: convertToParamMap({}) };
  const login = vi.fn<(...args: string[]) => Promise<boolean>>();
  const register = vi.fn<(...args: string[]) => Promise<boolean>>();
  const logout = vi.fn<() => Promise<boolean>>();

  beforeEach(async () => {
    busy.set(false);
    user.set(null);
    routeSnapshot.queryParamMap = convertToParamMap({});
    login.mockReset().mockResolvedValue(true);
    register.mockReset().mockResolvedValue(true);
    logout.mockReset().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: routeSnapshot } },
        {
          provide: AuthStore,
          useValue: {
            busy,
            user,
            authenticated: computed(() => user() !== null),
            notice: signal(''),
            error: signal(''),
            login,
            register,
            logout,
            clearMessages: vi.fn(),
          },
        },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('keeps a pending login in login mode and disables edits until it finishes', async () => {
    routeSnapshot.queryParamMap = convertToParamMap({ returnTo: '/dashboard' });
    let resolve!: (value: boolean) => void;
    login.mockImplementationOnce(() => {
      busy.set(true);
      return new Promise<boolean>((done) => {
        resolve = done;
      });
    });
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.email = 'learner@example.test';
    page.password = 'a long test password';
    const pending = page.submit();
    page.toggleMode();
    await fixture.whenStable();
    expect(page.registerMode()).toBe(false);
    expect(fixture.nativeElement.querySelector('button.switch').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('input[name="email"]').disabled).toBe(true);
    expect(register).not.toHaveBeenCalled();
    resolve(true);
    busy.set(false);
    await pending;
    expect(page.password).toBe('');
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledExactlyOnceWith('/dashboard');
  });

  it('does not log out a test account when switching form modes', async () => {
    user.set({ id: 'test-account', email: 'learner@example.test', verified: true });
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    fixture.componentInstance.password = 'a long test password';
    fixture.componentInstance.toggleMode();
    expect(fixture.componentInstance.registerMode()).toBe(true);
    expect(fixture.componentInstance.password).toBe('');
    expect(user()?.id).toBe('test-account');
    expect(logout).not.toHaveBeenCalled();
  });

  it('handles a registration response using the mode that issued the request', async () => {
    let resolve!: (value: boolean) => void;
    register.mockImplementationOnce(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.toggleMode();
    page.email = 'learner@example.test';
    page.password = 'a long test password';
    const pending = page.submit();
    // Even an external mode update cannot reinterpret registration as a successful login.
    page.registerMode.set(false);
    resolve(true);
    await pending;
    expect(login).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    expect(page.registerMode()).toBe(false);
  });

  it.each([null, '//example.test', 'https://example.test', '/auth', '/dev/auth'])(
    'returns safely to the dashboard instead of an unsafe path: %s',
    async (returnTo) => {
      routeSnapshot.queryParamMap = convertToParamMap(returnTo === null ? {} : { returnTo });
      const fixture = TestBed.createComponent(AuthPage);
      await fixture.whenStable();
      const page = fixture.componentInstance;
      page.email = 'learner@example.test';
      page.password = 'a long test password';
      await page.submit();
      expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledExactlyOnceWith('/dashboard');
    },
  );

  it('does not navigate after a late login response when the page has been left', async () => {
    routeSnapshot.queryParamMap = convertToParamMap({ returnTo: '/character/create' });
    let resolve!: (value: boolean) => void;
    login.mockImplementationOnce(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    fixture.componentInstance.email = 'learner@example.test';
    fixture.componentInstance.password = 'a long test password';
    const pending = fixture.componentInstance.submit();
    fixture.destroy();
    resolve(true);
    await pending;
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
  });

  it('returns a signed-in visitor from the deletion entry to account management', async () => {
    routeSnapshot.queryParamMap = convertToParamMap({ returnTo: '/account' });
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    fixture.componentInstance.email = 'learner@example.test';
    fixture.componentInstance.password = 'a long test password';
    await fixture.componentInstance.submit();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledExactlyOnceWith('/account');
  });

  it('labels the password independently from its visibility button', async () => {
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[name="password"]') as HTMLInputElement;
    expect(Array.from(input.labels ?? []).map(label => label.textContent?.trim())).toEqual(['Passwort']);
    expect(fixture.nativeElement.querySelector('button[aria-label="Passwort anzeigen"]')).not.toBeNull();
    fixture.componentInstance.showPassword.set(true);
    await fixture.whenStable();
    expect(input.type).toBe('text');
    expect(Array.from(input.labels ?? []).map(label => label.textContent?.trim())).toEqual(['Passwort']);
  });
});
