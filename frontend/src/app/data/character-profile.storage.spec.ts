import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './browser-storage';
import { CharacterProfileStorage, CHARACTER_PROFILE_KEY } from './character-profile.storage';
import { MockGameRepository } from './mock-game.repository';
import { createMockSnapshot } from './mock-data';

describe('device-local character profiles', () => {
  let entries: Map<string, string>;
  beforeEach(() => {
    entries = new Map();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BROWSER_STORAGE,
          useValue: {
            getItem: (key: string) => entries.get(key) ?? null,
            setItem: (key: string, value: string) => {
              entries.set(key, value);
            },
          },
        },
      ],
    });
  });
  it('persists only identity and rehydrates it without persisting mock progress', async () => {
    const repository = TestBed.runInInjectionContext(() => new MockGameRepository());
    const initial = await repository.load();
    const profile = {
      name: 'Liora',
      appearance: { ...initial.character.appearance, outfit: 'cozy', hair: 'bob' },
    };
    const result = await repository.updateCharacter(profile);
    expect(result.persisted).toBe(true);
    expect(result.snapshot.character.name).toBe('Liora');
    expect(result.snapshot.character.totalXp).toBe(initial.character.totalXp);
    expect(entries.get(CHARACTER_PROFILE_KEY)).not.toContain('totalXp');
    await repository.record({ requestId: 'one', skillId: 'running', minutes: 10 });
    const reloaded = TestBed.runInInjectionContext(() => new MockGameRepository());
    const restored = await reloaded.load();
    expect(restored.character).toMatchObject({
      ...profile,
      createdByPlayer: true,
      totalXp: initial.character.totalXp,
    });
    expect(restored.activities).toEqual([]);
    expect((await repository.resetDemo()).character.name).toBe('Liora');
  });
  it('ignores corrupt or invalid stored profiles', () => {
    const storage = TestBed.inject(CharacterProfileStorage);
    entries.set(CHARACTER_PROFILE_KEY, 'not json');
    expect(storage.read()).toBeNull();
    entries.set(
      CHARACTER_PROFILE_KEY,
      JSON.stringify({ version: 1, profile: { name: 'Bad', appearance: {} } }),
    );
    expect(storage.read()).toBeNull();
  });
  it('uses an honest memory-only fallback when storage is unavailable', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: null }] });
    const repository = TestBed.runInInjectionContext(() => new MockGameRepository());
    const result = await repository.updateCharacter({
      name: 'Ari',
      appearance: createMockSnapshot().character.appearance,
    });
    expect(result.persisted).toBe(false);
    expect(result.snapshot.character.createdByPlayer).toBe(true);
    expect((await repository.resetDemo()).character.createdByPlayer).toBe(true);
  });
});
