import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom, timeout } from 'rxjs';
import { ApiError } from './api-error';

export const NATIVE_PLATFORM = new InjectionToken<boolean>('Native Capacitor platform', {
  providedIn: 'root', factory: () => Capacitor.isNativePlatform(),
});

/** Public deployment configuration only. Session credentials never enter this file. */
export interface RuntimeApiConfig { schemaVersion: 1; nativeApiOrigin: string | null; }

export function nativeApiOrigin(value: unknown): string {
  const config = value as Partial<RuntimeApiConfig> | null;
  try {
    if (!config || config.schemaVersion !== 1 || typeof config.nativeApiOrigin !== 'string') throw new Error();
    const url = new URL(config.nativeApiOrigin);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
    return url.origin;
  } catch {
    throw new ApiError(0, 'API_NOT_CONFIGURED', 'Diese App-Version hat noch keine sichere Serververbindung. Bitte verwende eine konfigurierte Beta-Version.');
  }
}

export function validateApiPath(path: string): void {
  try {
    const url = new URL(path, 'https://everbloom.invalid');
    const decoded = decodeURIComponent(url.pathname);
    if (!path.startsWith('/api/') || /[\\#\s]/.test(path) || url.origin !== 'https://everbloom.invalid' ||
      !decoded.startsWith('/api/') || decoded.includes('\\') || decoded.split('/').includes('..')) throw new Error();
  } catch {
    throw new ApiError(0, 'INVALID_API_PATH', 'Die Serveranfrage ist ungültig.');
  }
}

@Injectable({ providedIn: 'root' })
export class RuntimeApiConfiguration {
  readonly native = inject(NATIVE_PLATFORM);
  private readonly http = inject(HttpClient);
  private origin: Promise<string> | undefined;

  async url(path: string): Promise<string> {
    validateApiPath(path);
    if (!this.native) return path;
    if (!this.origin) {
      this.origin = firstValueFrom(this.http.get<unknown>('/runtime-config.json').pipe(timeout(5000)))
        .then(nativeApiOrigin)
        .catch((error: unknown) => {
          this.origin = undefined;
          if (error instanceof ApiError) throw error;
          throw new ApiError(0, 'API_NOT_CONFIGURED', 'Die Serverkonfiguration dieser App konnte nicht geladen werden. Bitte starte die App erneut.');
        });
    }
    return (await this.origin) + path;
  }
}
