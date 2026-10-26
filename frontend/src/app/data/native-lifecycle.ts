import { Location } from '@angular/common';
import { DestroyRef, inject, Injectable, InjectionToken } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import type { AppPlugin } from '@capacitor/app';
import { NATIVE_PLATFORM } from './runtime-api-config';

export const NATIVE_APP_PLUGIN = new InjectionToken<() => Promise<AppPlugin>>('Native app plugin', {
  providedIn: 'root', factory: () => () => import('@capacitor/app').then(module => module.App),
});
export const NATIVE_ANDROID = new InjectionToken<boolean>('Native Android platform', {
  providedIn: 'root', factory: () => Capacitor.getPlatform() === 'android',
});

/** Native events only; the caller decides whether a signed-in session may refresh. */
@Injectable({ providedIn: 'root' })
export class NativeLifecycle {
  private readonly native = inject(NATIVE_PLATFORM);
  private readonly android = inject(NATIVE_ANDROID);
  private readonly loadPlugin = inject(NATIVE_APP_PLUGIN);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly handles: PluginListenerHandle[] = [];
  private initialized?: Promise<void>;
  private disposed = false;
  private refreshing = false;
  private onResume?: () => unknown | Promise<unknown>;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.disposed = true;
      for (const handle of this.handles.splice(0)) void handle.remove().catch(() => undefined);
    });
  }

  initialize(onResume?: () => unknown | Promise<unknown>): Promise<void> {
    this.onResume = onResume;
    if (!this.native || this.disposed) return Promise.resolve();
    return this.initialized ??= this.connect();
  }

  private async connect(): Promise<void> {
    const app = await this.loadPlugin();
    if (this.disposed) return;
    await this.keep(await app.addListener('resume', () => {
      if (this.disposed || this.refreshing) return;
      this.refreshing = true;
      // Auth/Game stores surface their own offline/expired-session state.
      void Promise.resolve().then(() => this.onResume?.()).catch(() => undefined)
        .finally(() => { this.refreshing = false; });
    }));
    if (this.android && !this.disposed) {
      await this.keep(await app.addListener('backButton', ({ canGoBack }) => {
        if (this.disposed) return;
        const path = this.router.url.split(/[?#]/)[0];
        if (['/', '/dashboard', '/auth', '/demo'].includes(path)) {
          void app.minimizeApp().catch(() => undefined);
        } else if (canGoBack) {
          this.location.back();
        } else {
          void this.router.navigateByUrl('/dashboard').catch(() => undefined);
        }
      }));
    }
  }

  private async keep(handle: PluginListenerHandle): Promise<void> {
    if (this.disposed) await handle.remove();
    else this.handles.push(handle);
  }
}
