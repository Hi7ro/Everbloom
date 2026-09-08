import { computed, inject, Injectable, signal } from '@angular/core';
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
  private readonly storage = inject(JourneyPreferencesStorage);
  private readonly restored = this.storage.read();
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
    const persisted = this.storage.save(preferences);
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
