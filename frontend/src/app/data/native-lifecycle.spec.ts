import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NATIVE_PLATFORM } from './runtime-api-config';
import { NativeLifecycle, NATIVE_ANDROID, NATIVE_APP_PLUGIN } from './native-lifecycle';

describe('native lifecycle', () => {
  const callbacks = new Map<string, (event?: { canGoBack: boolean }) => void>();
  const remove = vi.fn();
  const app = { addListener: vi.fn(), minimizeApp: vi.fn() };
  const loader = vi.fn();
  const router = { url: '/dashboard', navigateByUrl: vi.fn() };
  const location = { back: vi.fn() };
  function setup(native = true, android = true) {
    TestBed.configureTestingModule({ providers: [
      { provide: NATIVE_PLATFORM, useValue: native }, { provide: NATIVE_ANDROID, useValue: android },
      { provide: NATIVE_APP_PLUGIN, useValue: loader }, { provide: Router, useValue: router },
      { provide: Location, useValue: location },
    ] });
    return TestBed.inject(NativeLifecycle);
  }
  beforeEach(() => {
    callbacks.clear();
    remove.mockResolvedValue(undefined);
    app.addListener.mockImplementation(async (event: string, callback) => {
      callbacks.set(event, callback);
      return { remove };
    });
    app.minimizeApp.mockResolvedValue(undefined);
    router.navigateByUrl.mockResolvedValue(true);
    router.url = '/dashboard';
    loader.mockResolvedValue(app);
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.resetAllMocks(); });

  it('does not load native plugins in a browser', async () => {
    await setup(false).initialize();
    expect(loader).not.toHaveBeenCalled();
  });
  it('registers once, delegates session checks and coalesces a pending resume refresh', async () => {
    let finish!: () => void;
    let authenticated = false;
    const refresh = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    const resume = () => authenticated ? refresh() : undefined;
    const lifecycle = setup();
    await lifecycle.initialize(resume);
    await lifecycle.initialize(resume);
    expect(app.addListener).toHaveBeenCalledTimes(2);
    callbacks.get('resume')!();
    await vi.waitFor(() => expect(refresh).not.toHaveBeenCalled());
    await new Promise(resolve => setTimeout(resolve));
    authenticated = true;
    callbacks.get('resume')!();
    callbacks.get('resume')!();
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    finish();
  });
  it('minimizes Android on its root page without exiting the process', async () => {
    await setup().initialize();
    callbacks.get('backButton')!({ canGoBack: true });
    expect(app.minimizeApp).toHaveBeenCalledOnce();
    expect(location.back).not.toHaveBeenCalled();
  });
  it('uses navigation history for a nested page and the guarded dashboard for a direct entry', async () => {
    router.url = '/account';
    await setup().initialize();
    callbacks.get('backButton')!({ canGoBack: true });
    expect(location.back).toHaveBeenCalledOnce();
    callbacks.get('backButton')!({ canGoBack: false });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
  it('does not install Android back handling on iOS, and removes the resume listener', async () => {
    const callback = vi.fn();
    await setup(true, false).initialize(callback);
    expect(callbacks.has('backButton')).toBe(false);
    TestBed.resetTestingModule();
    expect(remove).toHaveBeenCalledOnce();
    callbacks.get('resume')!();
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();
  });
  it('removes a listener that finishes registering after the application is destroyed', async () => {
    let finish!: (value: { remove: typeof remove }) => void;
    app.addListener.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const pending = setup().initialize();
    await Promise.resolve();
    TestBed.resetTestingModule();
    finish({ remove });
    await pending;
    expect(remove).toHaveBeenCalledOnce();
    expect(app.addListener).toHaveBeenCalledOnce();
  });
});
