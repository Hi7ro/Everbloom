import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { ApiError, requestTimeoutError, responseApiError } from './api-error';
import { NativeTransport, API_REQUEST_TIMEOUT_MS } from './native-transport';
import { RuntimeApiConfiguration } from './runtime-api-config';

export { ApiError } from './api-error';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RuntimeApiConfiguration);
  private readonly native = inject(NativeTransport);
  private csrfPromise: Promise<CsrfResponse> | null = null;
  private csrf: CsrfResponse | null = null;
  private csrfEpoch = 0;

  async refreshCsrf(): Promise<CsrfResponse> {
    if (this.csrfPromise) return this.csrfPromise;
    const epoch = this.csrfEpoch;
    const pending = this.request<CsrfResponse>('GET', '/api/auth/csrf').then((value) => {
      if (!value || typeof value.token !== 'string' || !value.token || /[\r\n]/.test(value.token) ||
        typeof value.headerName !== 'string' || !/^X-(?:CSRF|XSRF)-TOKEN$/i.test(value.headerName)) {
        throw new ApiError(0, 'INVALID_SERVER_RESPONSE', 'Die Sicherheitsantwort des Servers ist ungültig.');
      }
      if (epoch !== this.csrfEpoch) throw new ApiError(0, 'SESSION_CHANGED', 'Deine Sitzung hat sich geändert. Bitte lade die Ansicht neu.');
      this.csrf = value;
      return value;
    }).finally(() => { if (this.csrfPromise === pending) this.csrfPromise = null; });
    this.csrfPromise = pending;
    return pending;
  }

  clearCsrf(): void {
    this.csrfEpoch++;
    this.csrf = null;
    this.csrfPromise = null;
  }

  get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, headers);
  }

  post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, body, headers, true);
  }

  put<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, body, headers, true);
  }

  delete<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, body, headers, true);
  }

  async request<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>, csrf = false): Promise<T> {
    try {
      const url = await this.config.url(path);
      let requestHeaders = new HttpHeaders({ Accept: 'application/json', ...headers });
      if (body !== undefined && !requestHeaders.has('Content-Type')) requestHeaders = requestHeaders.set('Content-Type', 'application/json');
      if (csrf) {
        const token = this.csrf ?? await this.refreshCsrf();
        requestHeaders = requestHeaders.set(token.headerName, token.token);
      }
      if (this.config.native) {
        return await this.native.send<T>(method, url, body,
          Object.fromEntries(requestHeaders.keys().map(key => [key, requestHeaders.get(key)!])));
      }
      return await firstValueFrom(this.http.request<T>(method, url, {
        body, headers: requestHeaders, withCredentials: true,
      }).pipe(timeout(API_REQUEST_TIMEOUT_MS)));
    } catch (error) {
      const result = this.toApiError(error);
      if (result.status === 401 || result.status === 403) this.clearCsrf();
      throw result;
    }
  }

  private toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof TimeoutError) return requestTimeoutError();
    if (error instanceof HttpErrorResponse) {
      return responseApiError(error.status, error.error);
    }
    return new ApiError(0, 'NETWORK_ERROR', 'Der Server ist gerade nicht erreichbar.');
  }
}

export interface CsrfResponse { token: string; headerName: string; }
