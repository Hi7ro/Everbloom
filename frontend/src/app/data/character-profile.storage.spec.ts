import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './browser-storage';
import {
  CharacterProfileStorage,
  CHARACTER_PROFILE_KEY,
  LEGACY_CHARACTER_PROFILE_KEY,
} from './character-profile.storage';
import { MockGameRepository } from './mock-game.repository';
import { createMockSnapshot } from './mock-data';
import { CharacterProfile } from '../domain/models';
import { ILLUSTRATED_CHARACTERS } from '../domain/character-illustrations';
import { defaultHairstyle } from '../domain/character';

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
  it('restores a female v2 profile while keeping XP, quests and boss progress in memory only', async () => {
    const repository = TestBed.runInInjectionContext(() => new MockGameRepository());
    const initial = await repository.load();
    const profile: CharacterProfile = {
      name: 'Liora',
      appearance: {
        ...initial.character.appearance,
        presentation: 'female',
        outfit: 'cozy',
        hair: 'f-bob',
        artwork: 'custom',
      },
    };
    const result = await repository.updateCharacter(profile);
    expect(result.persisted).toBe(true);
    expect(result.snapshot.character.name).toBe('Liora');
    expect(result.snapshot.character.totalXp).toBe(initial.character.totalXp);
    expect(JSON.parse(entries.get(CHARACTER_PROFILE_KEY)!)).toEqual({ version: 2, profile });
    expect(entries.get(CHARACTER_PROFILE_KEY)).not.toContain('totalXp');
    await repository.record({ requestId: 'one', skillId: 'meditation', minutes: 10 });
    const reloaded = TestBed.runInInjectionContext(() => new MockGameRepository());
    const restored = await reloaded.load();
    expect(restored.character).toMatchObject({
      ...profile,
      createdByPlayer: true,
      totalXp: initial.character.totalXp,
    });
    expect(restored.activities).toEqual([]);
    expect(restored.skills).toEqual(initial.skills);
    expect(restored.quests).toEqual(initial.quests);
    expect(restored.boss).toEqual(initial.boss);
    expect((await repository.resetDemo()).character).toMatchObject(profile);
  });

  it('persists an explicit original look and its aura without changing earned progress', async () => {
    const repository = TestBed.runInInjectionContext(() => new MockGameRepository());
    await repository.record({ requestId: 'before-look', skillId: 'meditation', minutes: 10 });
    const before = await repository.load();
    const profile: CharacterProfile = {
      name: 'Ari', appearance: { ...before.character.appearance, artwork: 'original', aura: 'rose' },
    };
    const saved = await repository.updateCharacter(profile);
    expect(saved.snapshot.character.totalXp).toBe(before.character.totalXp);
    expect(saved.snapshot.skills).toEqual(before.skills);
    expect(saved.snapshot.quests).toEqual(before.quests);
    expect(saved.snapshot.boss).toEqual(before.boss);
    expect(JSON.parse(entries.get(CHARACTER_PROFILE_KEY)!)).toEqual({ version: 2, profile });
    const restored = TestBed.runInInjectionContext(() => new MockGameRepository());
    expect((await restored.load()).character.appearance).toEqual(profile.appearance);
  });

  it.each(ILLUSTRATED_CHARACTERS)('persists the $id preset without changing earned progress', async (preset) => {
    const repository = TestBed.runInInjectionContext(() => new MockGameRepository());
    await repository.record({ requestId: 'before-preset', skillId: 'meditation', minutes: 10 });
    const before = await repository.load();
    const profile: CharacterProfile = {
      name: 'Ari', appearance: {
        ...before.character.appearance, artwork: 'original', illustration: preset.id,
        presentation: preset.presentation, hair: defaultHairstyle(preset.presentation), aura: 'rose',
      },
    };
    const saved = await repository.updateCharacter(profile);
    expect(saved.snapshot.character.totalXp).toBe(before.character.totalXp);
    expect(saved.snapshot.activities).toEqual(before.activities);
    expect(saved.snapshot.skills).toEqual(before.skills);
    expect(saved.snapshot.quests).toEqual(before.quests);
    expect(saved.snapshot.boss).toEqual(before.boss);
    expect(JSON.parse(entries.get(CHARACTER_PROFILE_KEY)!)).toEqual({ version: 2, profile });
    const restored = TestBed.runInInjectionContext(() => new MockGameRepository());
    expect((await restored.load()).character.appearance).toEqual(profile.appearance);
  });

  it.each(['missing', null, 'moonblade'])('ignores an invalid active male illustration %j on read', (illustration) => {
    entries.set(CHARACTER_PROFILE_KEY, JSON.stringify({ version: 2, profile: {
      name: 'Ari', appearance: { ...createMockSnapshot().character.appearance, artwork: 'original', illustration },
    } }));
    expect(TestBed.inject(CharacterProfileStorage).read()).toBeNull();
  });

  it('rejects a corrupt artwork field on read without restoring an older profile', () => {
    entries.set(CHARACTER_PROFILE_KEY, JSON.stringify({ version: 2, profile: {
      name: 'Ari', appearance: { ...createMockSnapshot().character.appearance, artwork: null },
    } }));
    expect(TestBed.inject(CharacterProfileStorage).read()).toBeNull();
  });

  it('migrates an old v1 look into v2 without deleting or changing the original data', () => {
    const appearance: Record<string, unknown> = { ...createMockSnapshot().character.appearance };
    delete appearance['presentation'];
    appearance['hair'] = 'braid';
    const legacy = JSON.stringify({ version: 1, profile: { name: 'Liora', appearance } });
    entries.set(LEGACY_CHARACTER_PROFILE_KEY, legacy);
    const storage = TestBed.inject(CharacterProfileStorage);
    const migrated = storage.read();
    expect(migrated).toMatchObject({
      name: 'Liora',
      appearance: { presentation: 'male', hair: 'm-topknot' },
    });
    expect(entries.get(LEGACY_CHARACTER_PROFILE_KEY)).toBe(legacy);
    expect(JSON.parse(entries.get(CHARACTER_PROFILE_KEY)!)).toEqual({
      version: 2,
      profile: migrated,
    });
    const selected: CharacterProfile = {
      name: 'Liora',
      appearance: {
        ...createMockSnapshot().character.appearance,
        presentation: 'female',
        hair: 'f-braid',
      },
    };
    expect(storage.save(selected)).toBe(true);
    expect(storage.read()).toEqual(selected);
    expect(entries.get(LEGACY_CHARACTER_PROFILE_KEY)).toBe(legacy);
  });

  it.each([
    'not json',
    JSON.stringify({ version: 1, profile: { name: 'Bad', appearance: {} } }),
    JSON.stringify({ version: 2, profile: { name: 'Bad', appearance: {} } }),
    JSON.stringify({ version: 2, profile: [] }),
    JSON.stringify({ version: 3, profile: createMockSnapshot().character }),
  ])('ignores malformed v2 data and never resurrects an older look: %s', (raw) => {
    entries.set(
      LEGACY_CHARACTER_PROFILE_KEY,
      JSON.stringify({ version: 1, profile: createMockSnapshot().character }),
    );
    entries.set(CHARACTER_PROFILE_KEY, raw);
    expect(TestBed.inject(CharacterProfileStorage).read()).toBeNull();
  });

  it.each([
    'not json',
    JSON.stringify({ version: 1, profile: { name: 'Bad', appearance: {} } }),
    JSON.stringify({
      version: 1,
      profile: {
        ...createMockSnapshot().character,
        appearance: { ...createMockSnapshot().character.appearance, presentation: 'invalid' },
      },
    }),
  ])('ignores malformed v1 data without creating a v2 entry: %s', (raw) => {
    entries.set(LEGACY_CHARACTER_PROFILE_KEY, raw);
    expect(TestBed.inject(CharacterProfileStorage).read()).toBeNull();
    expect(entries.has(CHARACTER_PROFILE_KEY)).toBe(false);
    expect(entries.get(LEGACY_CHARACTER_PROFILE_KEY)).toBe(raw);
  });

  it('discards extra stored fields instead of applying saved progression', async () => {
    const initial = createMockSnapshot();
    entries.set(
      CHARACTER_PROFILE_KEY,
      JSON.stringify({
        version: 2,
        profile: {
          ...initial.character,
          name: 'Liora',
          totalXp: 999999,
          appearance: { ...initial.character.appearance, totalXp: 999999 },
        },
      }),
    );
    const repository = TestBed.runInInjectionContext(() => new MockGameRepository());
    const restored = await repository.load();
    expect(restored.character.name).toBe('Liora');
    expect(restored.character.totalXp).toBe(initial.character.totalXp);
    expect(restored.character.appearance).not.toHaveProperty('totalXp');
  });

  it('uses a migrated v1 profile for this session when writing v2 is denied', () => {
    const appearance: Record<string, unknown> = { ...createMockSnapshot().character.appearance };
    delete appearance['presentation'];
    appearance['hair'] = 'bob';
    const legacy = JSON.stringify({ version: 1, profile: { name: 'Liora', appearance } });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BROWSER_STORAGE,
          useValue: {
            getItem: (key: string) => (key === LEGACY_CHARACTER_PROFILE_KEY ? legacy : null),
            setItem: () => {
              throw new Error('Storage denied');
            },
          },
        },
      ],
    });
    expect(TestBed.inject(CharacterProfileStorage).read()?.appearance).toMatchObject({
      presentation: 'male',
      hair: 'm-curtains',
    });
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
