import { inject, Injectable } from '@angular/core';
import { CharacterProfile } from '../domain/models';
import { normalizeCharacterProfile } from '../domain/character';
import { BROWSER_STORAGE } from './browser-storage';

export const CHARACTER_PROFILE_KEY = 'everbloom.character.v1';

@Injectable({ providedIn: 'root' })
export class CharacterProfileStorage {
  private readonly storage = inject(BROWSER_STORAGE);

  read(): CharacterProfile | null {
    try {
      const raw = this.storage?.getItem(CHARACTER_PROFILE_KEY);
      if (!raw) return null;
      const stored: unknown = JSON.parse(raw);
      if (
        !stored ||
        typeof stored !== 'object' ||
        !('version' in stored) ||
        stored.version !== 1 ||
        !('profile' in stored)
      )
        return null;
      return normalizeCharacterProfile(stored.profile as CharacterProfile);
    } catch {
      return null;
    }
  }

  save(profile: CharacterProfile): boolean {
    try {
      if (!this.storage) return false;
      this.storage.setItem(CHARACTER_PROFILE_KEY, JSON.stringify({ version: 1, profile }));
      return true;
    } catch {
      return false;
    }
  }
}
