import { inject, Injectable } from '@angular/core';
import { ActivityCommand, CharacterProfile } from '../domain/models';
import { normalizeCharacterProfile } from '../domain/character';
import { recordActivity } from '../domain/progression';
import { GameRepository } from './game.repository';
import { createMockSnapshot } from './mock-data';
import { CharacterProfileStorage } from './character-profile.storage';

@Injectable()
export class MockGameRepository implements GameRepository {
  private readonly profiles = inject(CharacterProfileStorage);
  private snapshot = createMockSnapshot();

  constructor() {
    const profile = this.profiles.read();
    if (profile) this.applyProfile(profile);
  }
  async load() {
    return structuredClone(this.snapshot);
  }
  async record(command: ActivityCommand) {
    const result = recordActivity(this.snapshot, command);
    this.snapshot = result.snapshot;
    return structuredClone(result);
  }
  async updateCharacter(profile: CharacterProfile) {
    const normalized = normalizeCharacterProfile(profile);
    const persisted = this.profiles.save(normalized);
    this.applyProfile(normalized);
    return { snapshot: await this.load(), persisted };
  }
  async resetDemo() {
    // Reset game progress, retain the player's chosen identity (also in memory-only mode).
    const profile = this.snapshot.character.createdByPlayer
      ? { name: this.snapshot.character.name, appearance: this.snapshot.character.appearance }
      : null;
    this.snapshot = createMockSnapshot();
    if (profile) this.applyProfile(profile);
    return this.load();
  }
  private applyProfile(profile: CharacterProfile) {
    this.snapshot = {
      ...this.snapshot,
      character: {
        ...this.snapshot.character,
        ...structuredClone(profile),
        createdByPlayer: true,
      },
    };
  }
}
