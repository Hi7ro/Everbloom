import { inject, Injectable } from '@angular/core';
import { JourneyPreferences, normalizeJourneyPreferences } from '../domain/journey';
import { BROWSER_STORAGE } from './browser-storage';

export const JOURNEY_PREFERENCES_KEY = 'everbloom.journey.v1';

@Injectable({ providedIn: 'root' })
export class JourneyPreferencesStorage {
  private readonly storage = inject(BROWSER_STORAGE);

  read(): JourneyPreferences | null {
    try {
      const raw = this.storage?.getItem(JOURNEY_PREFERENCES_KEY);
      if (!raw) return null;
      const stored: unknown = JSON.parse(raw);
      if (
        !stored ||
        typeof stored !== 'object' ||
        Array.isArray(stored) ||
        !('version' in stored) ||
        stored.version !== 1 ||
        !('preferences' in stored)
      ) {
        return null;
      }
      return normalizeJourneyPreferences(stored.preferences);
    } catch {
      return null;
    }
  }

  save(input: unknown): boolean {
    try {
      const preferences = normalizeJourneyPreferences(input);
      if (!this.storage) return false;
      this.storage.setItem(JOURNEY_PREFERENCES_KEY, JSON.stringify({ version: 1, preferences }));
      return true;
    } catch {
      return false;
    }
  }
}
