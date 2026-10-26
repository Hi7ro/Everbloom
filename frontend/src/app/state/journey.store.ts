import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ACCOUNT_MODE } from '../data/account-mode';
import { ApiClient, ApiError } from '../data/api-client';
import { AuthStore } from './auth.store';
import { JourneyPreferencesStorage } from '../data/journey-preferences.storage';
import {
  DEFAULT_JOURNEY,
  JourneyPreferences,
  normalizeJourneyPreferences,
  resolvePrimaryAvatarInterest,
} from '../domain/journey';

/** Player preferences only. Game progression and character artwork belong to other stores. */
@Injectable({ providedIn: 'root' })
export class JourneyStore {
  readonly accountMode = inject(ACCOUNT_MODE);
  private readonly auth = this.accountMode ? inject(AuthStore) : null;
  private readonly api = this.accountMode ? inject(ApiClient) : null;
  private ownerEpoch = this.auth?.epoch();
  private revision = 0;
  private writing = false;
  constructor() {
    if (this.auth)
      effect(() => {
        const epoch = this.auth!.epoch();
        if (epoch !== this.ownerEpoch) this.clear(epoch);
      });
  }
  private clear(epoch: number) {
    this.revision++;
    this.writing = false;
    this.ownerEpoch = epoch;
    this.preferencesState.set(structuredClone(DEFAULT_JOURNEY));
    this.configuredState.set(false);
    this.persistedState.set(false);
    this.messageState.set('');
    this.errorState.set('');
  }
  async load(): Promise<boolean> {
    if (!this.api || !this.auth) return true;
    const epoch = this.auth.epoch();
    if (epoch !== this.ownerEpoch) this.clear(epoch);
    const revision = this.revision;
    try {
      const preferences = await this.auth.owned(headers => this.api!.get<JourneyPreferences | null>('/api/game/journey', headers));
      if (epoch !== this.auth.epoch() || revision !== this.revision) return false;
      this.preferencesState.set(normalizeJourneyPreferences(preferences ?? DEFAULT_JOURNEY));
      this.configuredState.set(preferences !== null);
      this.persistedState.set(true);
      return true;
    } catch (error) {
      if (epoch === this.auth.epoch()) {
        this.errorState.set(
          error instanceof Error ? error.message : 'Deine Auswahl konnte nicht geladen werden.',
        );
        if (error instanceof ApiError && error.status === 401) this.auth.expire();
      }
      return false;
    }
  }
  async commit(input: unknown): Promise<boolean> {
    if (!this.api || !this.auth) return this.save(input);
    if (this.writing) return false;
    const epoch = this.auth.epoch();
    if (epoch !== this.ownerEpoch) this.clear(epoch);
    this.writing = true;
    this.revision++;
    try {
      const preferences = normalizeJourneyPreferences(input);
      const saved = await this.auth.owned(headers => this.api!.put<JourneyPreferences>('/api/game/journey', preferences, headers));
      if (epoch !== this.auth.epoch()) return false;
      this.revision++;
      this.preferencesState.set(normalizeJourneyPreferences(saved));
      this.configuredState.set(true);
      this.persistedState.set(true);
      this.messageState.set('Deine Interessen und Skills sind in deinem Konto gespeichert.');
      this.errorState.set('');
      return true;
    } catch (error) {
      if (epoch === this.auth.epoch()) {
        this.errorState.set(
          error instanceof Error ? error.message : 'Deine Auswahl konnte nicht gespeichert werden.',
        );
        if (error instanceof ApiError && error.status === 401) this.auth.expire();
      }
      return false;
    } finally {
      if (epoch === this.auth.epoch()) this.writing = false;
    }
  }
  private readonly storage = this.accountMode ? null : inject(JourneyPreferencesStorage);
  private readonly restored = this.storage?.read() ?? null;
  private readonly preferencesState = signal<JourneyPreferences>(
    normalizeJourneyPreferences(this.restored ?? DEFAULT_JOURNEY),
  );
  private readonly configuredState = signal(this.restored !== null);
  private readonly persistedState = signal(this.restored !== null);
  private readonly messageState = signal('');
  private readonly errorState = signal('');
  readonly preferences = this.preferencesState.asReadonly();
  readonly configured = this.configuredState.asReadonly();
  readonly persisted = this.persistedState.asReadonly();
  readonly message = this.messageState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly activeSkillIds = computed(() => this.preferences().activeSkillIds);
  readonly primaryAvatarInterest = computed(() => resolvePrimaryAvatarInterest(this.preferences()));

  save(input: unknown): boolean {
    if (this.accountMode)
      throw new Error('Kontoeinstellungen müssen mit commit() gespeichert werden.');
    this.messageState.set('');
    this.errorState.set('');
    let preferences: JourneyPreferences;
    try {
      preferences = normalizeJourneyPreferences(input);
    } catch (error) {
      this.errorState.set(
        error instanceof Error ? error.message : 'Bitte prüfe deine Interessen und Skills.',
      );
      return false;
    }
    const persisted = this.storage?.save(preferences) ?? false;
    this.preferencesState.set(preferences);
    this.configuredState.set(true);
    this.persistedState.set(persisted);
    this.messageState.set(
      persisted
        ? 'Deine Interessen und Skills sind auf diesem Gerät gespeichert.'
        : 'Deine Auswahl gilt für diese Sitzung. Sie konnte auf diesem Gerät nicht gespeichert werden und geht beim Neuladen verloren.',
    );
    return true;
  }
}
