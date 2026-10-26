import { inject, Injectable, InjectionToken } from '@angular/core';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { ApiError, requestTimeoutError, responseApiError } from './api-error';

export const API_REQUEST_TIMEOUT_MS = 20_000;
export const NATIVE_HTTP_REQUEST = new InjectionToken<(options: HttpOptions) => Promise<HttpResponse>>('Capacitor HTTP request', {
  providedIn: 'root', factory: () => options => CapacitorHttp.request(options),
});

/** Uses the OS cookie store. No JavaScript cookie copying, storage, or mutation retries. */
@Injectable({ providedIn: 'root' })
export class NativeTransport {
  private readonly request = inject(NATIVE_HTTP_REQUEST);

  async send<T>(method: string, url: string, body: unknown, headers: Record<string, string>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const response = await Promise.race([
        this.request({ url, method, ...(body === undefined ? {} : { data: body }), headers,
          responseType: 'json', connectTimeout: API_REQUEST_TIMEOUT_MS, readTimeout: API_REQUEST_TIMEOUT_MS,
          disableRedirects: true }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(requestTimeoutError()), API_REQUEST_TIMEOUT_MS); }),
      ]);
      if (response.status < 200 || response.status >= 300) throw responseApiError(response.status, response.data);
      return (response.status === 204 ? null : response.data) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const details = error && typeof error === 'object' ? error as { code?: unknown; message?: unknown } : {};
      if (/timeout|timed out|ETIMEDOUT/i.test(`${details.code ?? ''} ${details.message ?? ''}`)) throw requestTimeoutError();
      throw new ApiError(0, 'NETWORK_ERROR', 'Der Server ist gerade nicht erreichbar. Bitte prüfe deine Verbindung.');
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
