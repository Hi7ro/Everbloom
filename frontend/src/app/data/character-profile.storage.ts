import { inject, Injectable } from '@angular/core';
import { CharacterProfile } from '../domain/models';
import { migrateLegacyCharacterProfile, normalizeCharacterProfile } from '../domain/character';
import { BROWSER_STORAGE } from './browser-storage';

export const CHARACTER_PROFILE_KEY = 'everbloom.character.v2';
export const LEGACY_CHARACTER_PROFILE_KEY = 'everbloom.character.v1';

@Injectable({ providedIn: 'root' })
export class CharacterProfileStorage {
  private readonly storage = inject(BROWSER_STORAGE);

  read(): CharacterProfile | null {
    try {
      const raw = this.storage?.getItem(CHARACTER_PROFILE_KEY);
      if (raw !== null && raw !== undefined) {
        return normalizeCharacterProfile(this.readEnvelope(raw, 2));
      }
      const legacy = this.storage?.getItem(LEGACY_CHARACTER_PROFILE_KEY);
      if (!legacy) return null;
      const profile = migrateLegacyCharacterProfile(this.readEnvelope(legacy, 1));
      // Keep the original v1 entry. A denied write still permits this session's migrated look.
      this.save(profile);
      return profile;
    } catch {
      return null;
    }
  }

  save(profile: CharacterProfile): boolean {
    try {
      if (!this.storage) return false;
      const normalized = normalizeCharacterProfile(profile);
      this.storage.setItem(
        CHARACTER_PROFILE_KEY,
        JSON.stringify({ version: 2, profile: normalized }),
      );
      return true;
    } catch {
      return false;
    }
  }

  private readEnvelope(raw: string, version: number): unknown {
    const stored: unknown = JSON.parse(raw);
    if (
      !stored ||
      typeof stored !== 'object' ||
      Array.isArray(stored) ||
      !('version' in stored) ||
      stored.version !== version ||
      !('profile' in stored)
    ) {
      throw new Error('Ungültiges Charakterprofil.');
    }
    return stored.profile;
  }
}
