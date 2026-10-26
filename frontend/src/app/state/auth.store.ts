import { PendingMembershipStorage } from '../data/pending-membership.storage';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiClient, ApiError } from '../data/api-client';
import { PendingActivityStorage } from '../data/pending-activity.storage';

export interface AuthUser {
  id: string;
  email: string;
  verified: boolean;
}
export type AuthStatus = 'unknown' | 'loading' | 'authenticated' | 'anonymous' | 'error';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly pendingMembership = inject(PendingMembershipStorage);
  private readonly api = inject(ApiClient);
  private readonly pendingActivities = inject(PendingActivityStorage);
  private readonly userState = signal<AuthUser | null>(null);
  private readonly statusState = signal<AuthStatus>('unknown');
  private readonly busyState = signal(false);
  private readonly errorState = signal('');
  private readonly noticeState = signal('');
  private readonly epochState = signal(0);
  private generation = 0;
  private explicitLoginRequired = false;
  private sessionCheck: Promise<boolean> | null = null;
  readonly user = this.userState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly notice = this.noticeState.asReadonly();
  readonly epoch = this.epochState.asReadonly();
  readonly authenticated = computed(() => this.status() === 'authenticated' && !!this.user());

  async ensureSession(revalidate = false): Promise<boolean> {
    // A concurrent /me response must never replace the result of login/logout/reset.
    if (this.busy()) return false;
    if (this.explicitLoginRequired) return false;
    if (this.authenticated() && !revalidate) return true;
    if (this.sessionCheck) return this.sessionCheck;
    const generation = this.generation;
    const expectedOwner = this.user()?.id;
    if (!expectedOwner) this.statusState.set('loading');
    const request = this.api
      .refreshCsrf()
      .then(() => this.api.get<AuthUser>('/api/auth/me'))
      .then((user) => {
        if (generation !== this.generation) return false;
        if (expectedOwner && user.id !== expectedOwner) {
          this.expire('Das Konto wurde in einem anderen Fenster gewechselt. Bitte melde dich erneut an.');
          return false;
        }
        this.setUser(user);
        return true;
      })
      .catch((error: unknown) => {
        if (generation !== this.generation) return false;
        // A temporary connection failure must not discard this owner's open editor or pending work.
        if (!expectedOwner || (error instanceof ApiError && error.status === 401))
          this.clearUser(error instanceof ApiError && error.status === 401 ? 'anonymous' : 'error');
        if (!(error instanceof ApiError && error.status === 401)) this.report(error);
        return false;
      })
      .finally(() => {
        if (this.sessionCheck === request) this.sessionCheck = null;
      });
    this.sessionCheck = request;
    return request;
  }

  /** Bind every account operation to the identity shown in this app, not just the shared cookie. */
  async owned<T>(request: (headers: Record<string, string>) => Promise<T>): Promise<T> {
    const owner = this.user()?.id;
    const epoch = this.epoch();
    if (!owner || !this.authenticated()) throw new ApiError(401, 'UNAUTHENTICATED', 'Bitte melde dich an.');
    try {
      const result = await request({ 'X-Everbloom-Account': owner });
      if (epoch !== this.epoch() || owner !== this.user()?.id)
        throw new ApiError(409, 'ACCOUNT_CHANGED', 'Dein Konto wurde gewechselt. Bitte erneut laden.');
      return result;
    } catch (error) {
      if (epoch === this.epoch() && error instanceof ApiError &&
          (error.code === 'ACCOUNT_CHANGED' || (error.status === 401 && error.code !== 'INVALID_CREDENTIALS'))) {
        this.expire(error.code === 'ACCOUNT_CHANGED'
          ? 'Das Konto wurde in einem anderen Fenster gewechselt. Bitte melde dich erneut an.'
          : undefined);
      }
      throw error;
    }
  }

  register(email: string, password: string): Promise<boolean> {
    return this.command(async (current) => {
      await this.api.post('/api/auth/register', { email, password });
      if (!current()) return;
      this.noticeState.set(
        'Prüfe dein E-Mail-Postfach. Wenn die Registrierung möglich ist, erhältst du einen Bestätigungslink. Danach kannst du dich anmelden.',
      );
    });
  }
  login(email: string, password: string): Promise<boolean> {
    return this.command(async (current) => {
      const user = await this.api.post<AuthUser>('/api/auth/login', { email, password });
      if (!current()) return;
      this.api.clearCsrf();
      this.setUser(user);
    });
  }
  logout(): Promise<boolean> {
    return this.command(async (current) => {
      try {
        await this.owned(headers => this.api.post<void>('/api/auth/logout', {}, headers));
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) throw error;
      }
      if (current()) this.clearUser('anonymous');
    });
  }
  requestVerification(email: string): Promise<boolean> {
    return this.command(async (current) => {
      await this.api.post('/api/auth/verification/request', { email });
      if (!current()) return;
      this.noticeState.set(
        'Falls ein unbestätigtes Konto existiert, erhältst du einen neuen Bestätigungslink.',
      );
    });
  }
  requestPassword(email: string): Promise<boolean> {
    return this.command(async (current) => {
      await this.api.post('/api/auth/password/request', { email });
      if (!current()) return;
      this.noticeState.set(
        'Falls ein passendes Konto existiert, erhältst du einen Link zum Zurücksetzen.',
      );
    });
  }
  verify(token: string): Promise<boolean> {
    return this.command(async (current) => {
      await this.api.post('/api/auth/verification/confirm', { token });
      if (!current()) return;
      this.noticeState.set('Deine E-Mail-Adresse ist bestätigt. Du kannst dich jetzt anmelden.');
    });
  }
  resetPassword(token: string, password: string): Promise<boolean> {
    return this.command(async (current) => {
      await this.api.post('/api/auth/password/reset', { token, password });
      if (!current()) return;
      this.clearUser('anonymous');
      this.noticeState.set('Passwort geändert. Bitte melde dich mit deinem neuen Passwort an.');
    });
  }
  deleteAccount(password: string): Promise<boolean> {
    return this.command(async (current) => {
      const owner = this.user()?.id;
      await this.owned(headers => this.api.post('/api/account/delete', { password }, headers));
      if (!current()) return;
      if (owner) {
        this.pendingActivities.removeForDeletedAccount(owner);
        this.pendingMembership.set(owner, false);
      }
      this.clearUser('anonymous');
      this.noticeState.set('Dein Konto und dein Spielstand wurden gelöscht.');
    });
  }
  expire(message = 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.') {
    this.generation++;
    this.explicitLoginRequired = true;
    this.sessionCheck = null;
    this.clearUser('anonymous');
    this.errorState.set(message);
    this.busyState.set(false);
  }
  clearMessages() {
    this.errorState.set('');
    this.noticeState.set('');
  }

  private setUser(user: AuthUser) {
    const ownerChanged = this.user()?.id !== user.id;
    this.explicitLoginRequired = false;
    this.userState.set(user);
    this.statusState.set('authenticated');
    this.clearMessages();
    if (ownerChanged) this.epochState.update((epoch) => epoch + 1);
  }
  private clearUser(status: 'anonymous' | 'error') {
    this.userState.set(null);
    this.statusState.set(status);
    this.api.clearCsrf();
    this.epochState.update((epoch) => epoch + 1);
  }
  private async command(action: (current: () => boolean) => Promise<void>): Promise<boolean> {
    if (this.busy()) return false;
    const generation = ++this.generation;
    this.sessionCheck = null;
    this.busyState.set(true);
    this.clearMessages();
    try {
      await this.api.refreshCsrf();
      if (generation !== this.generation) return false;
      await action(() => generation === this.generation);
      return generation === this.generation;
    } catch (error) {
      if (generation === this.generation) {
        if (
          error instanceof ApiError &&
          error.status === 401 &&
          error.code !== 'INVALID_CREDENTIALS' &&
          this.user()
        )
          this.clearUser('anonymous');
        this.report(error);
      }
      return false;
    } finally {
      if (generation === this.generation) this.busyState.set(false);
    }
  }
  private report(error: unknown) {
    this.errorState.set(
      error instanceof Error ? error.message : 'Das hat nicht geklappt. Bitte erneut versuchen.',
    );
  }
}
