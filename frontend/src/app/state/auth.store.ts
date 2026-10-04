import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiClient, ApiError } from '../data/api-client';

export interface AuthUser { id: string; email: string; }
export type AuthStatus = 'unknown' | 'loading' | 'authenticated' | 'anonymous' | 'error';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(ApiClient);
  private readonly userState = signal<AuthUser | null>(null);
  private readonly statusState = signal<AuthStatus>('unknown');
  private readonly busyState = signal(false);
  private readonly errorState = signal('');
  private readonly noticeState = signal('');
  private sessionCheck: Promise<boolean> | null = null;
  readonly user = this.userState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly notice = this.noticeState.asReadonly();
  readonly authenticated = computed(() => this.status() === 'authenticated' && !!this.user());
  private epochState = signal(0);
  readonly epoch = this.epochState.asReadonly();

  async ensureSession(): Promise<boolean> {
    if (this.authenticated()) return true;
    if (this.sessionCheck) return this.sessionCheck;
    this.statusState.set('loading');
    this.sessionCheck = this.api.refreshCsrf().then(() => this.api.get<AuthUser>('/api/auth/me'))
      .then((user) => { this.setUser(user); return true; })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          this.clearUser('anonymous');
          return false;
        }
        this.statusState.set('error');
        this.errorState.set(error instanceof Error ? error.message : 'Anmeldung konnte nicht geprüft werden.');
        return false;
      }).finally(() => { this.sessionCheck = null; });
    return this.sessionCheck;
  }

  async register(email: string, password: string): Promise<boolean> {
    this.startCommand();
    try {
      await this.api.refreshCsrf();
      await this.api.post('/api/auth/register', { email, password });
      this.noticeState.set('Konto erstellt. Bitte melde dich jetzt an.');
      return true;
    } catch (error) { this.setError(error); return false; }
    finally { this.busyState.set(false); }
  }

  async login(email: string, password: string): Promise<boolean> {
    this.startCommand();
    try {
      await this.api.refreshCsrf();
      const user = await this.api.post<AuthUser>('/api/auth/login', { email, password });
      this.setUser(user);
      return true;
    } catch (error) { this.setError(error); return false; }
    finally { this.busyState.set(false); }
  }

  async logout(): Promise<boolean> {
    this.startCommand();
    try {
      await this.api.post<void>('/api/auth/logout', {});
      this.clearUser('anonymous');
      await this.api.refreshCsrf();
      return true;
    } catch (error) { this.setError(error); return false; }
    finally { this.busyState.set(false); }
  }

  expire(message = 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.') {
    this.clearUser('anonymous');
    this.errorState.set(message);
  }

  private setUser(user: AuthUser) {
    this.userState.set(user);
    this.statusState.set('authenticated');
    this.errorState.set('');
    this.noticeState.set('');
    this.epochState.update((epoch) => epoch + 1);
  }

  private clearUser(status: 'anonymous' | 'error') {
    this.userState.set(null);
    this.statusState.set(status);
    this.epochState.update((epoch) => epoch + 1);
  }

  private startCommand() {
    this.busyState.set(true);
    this.errorState.set('');
    this.noticeState.set('');
  }

  private setError(error: unknown) {
    this.statusState.set(error instanceof ApiError && error.status === 401 ? 'anonymous' : 'error');
    this.errorState.set(error instanceof Error ? error.message : 'Das hat nicht geklappt. Bitte erneut versuchen.');
  }
}
