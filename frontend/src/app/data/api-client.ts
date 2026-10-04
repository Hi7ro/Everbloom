import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ApiErrorBody { code?: string; message?: string; }

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private csrfPromise: Promise<CsrfResponse> | null = null;
  private csrf: CsrfResponse | null = null;

  async refreshCsrf(): Promise<CsrfResponse> {
    if (this.csrfPromise) return this.csrfPromise;
    this.csrfPromise = firstValueFrom(
      this.http.get<CsrfResponse>('/api/auth/csrf', { withCredentials: true }),
    ).then((value) => {
      this.csrf = value;
      return value;
    }).finally(() => { this.csrfPromise = null; });
    return this.csrfPromise;
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

  async request<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>, csrf = false): Promise<T> {
    let requestHeaders = new HttpHeaders(headers ?? {});
    if (csrf) {
      const token = this.csrf ?? await this.refreshCsrf();
      requestHeaders = requestHeaders.set(token.headerName, token.token);
    }
    try {
      return await firstValueFrom(this.http.request<T>(method, path, {
        body, headers: requestHeaders, withCredentials: true,
      }));
    } catch (error) {
      throw this.toApiError(error);
    }
  }

  private toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof HttpErrorResponse) {
      const body = (error.error ?? {}) as ApiErrorBody;
      return new ApiError(error.status, body.code ?? (error.status === 401 ? 'UNAUTHENTICATED' : 'NETWORK_ERROR'), body.message ?? 'Der Server ist gerade nicht erreichbar.');
    }
    return new ApiError(0, 'NETWORK_ERROR', 'Der Server ist gerade nicht erreichbar.');
  }
}

export interface CsrfResponse { token: string; headerName: string; }
