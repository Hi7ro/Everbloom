import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './browser-storage';
import { DEFAULT_JOURNEY } from '../domain/journey';
import { JOURNEY_PREFERENCES_KEY, JourneyPreferencesStorage } from './journey-preferences.storage';

describe('journey preferences device storage', () => {
  let entries: Map<string, string>;
  let browserStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    entries = new Map();
    browserStorage = {
      getItem: vi.fn((key: string) => entries.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => entries.set(key, value)),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: BROWSER_STORAGE, useValue: browserStorage }],
    });
  });

  it('round-trips versioned preferences with a fresh clone on every read', () => {
    const storage = TestBed.inject(JourneyPreferencesStorage);
    expect(storage.save(DEFAULT_JOURNEY)).toBe(true);
    expect(JSON.parse(entries.get(JOURNEY_PREFERENCES_KEY)!)).toEqual({
      version: 1,
      preferences: DEFAULT_JOURNEY,
    });
    const first = storage.read()!;
    const second = storage.read()!;
    expect(second).toEqual(DEFAULT_JOURNEY);
    expect(first).not.toBe(second);
    expect(first.interestIds).not.toBe(second.interestIds);
    expect(first.activeSkillIds).not.toBe(second.activeSkillIds);
    first.interestIds.push('career');
    first.activeSkillIds.reverse();
    expect(storage.read()).toEqual(DEFAULT_JOURNEY);
  });

  it('writes only the journey key and strips attempted XP or character data', () => {
    const characterKey = 'everbloom.character.v2';
    const character = JSON.stringify({ version: 2, profile: { artwork: 'original' } });
    entries.set(characterKey, character);
    const storage = TestBed.inject(JourneyPreferencesStorage);
    expect(
      storage.save({ ...DEFAULT_JOURNEY, totalXp: 999999, character: { artwork: 'custom' } }),
    ).toBe(true);
    expect(entries.get(characterKey)).toBe(character);
    expect([...entries.keys()]).toEqual([characterKey, JOURNEY_PREFERENCES_KEY]);
    expect(JSON.parse(entries.get(JOURNEY_PREFERENCES_KEY)!)).toEqual({
      version: 1,
      preferences: DEFAULT_JOURNEY,
    });
    expect(
      browserStorage.setItem.mock.calls.every(([key]) => key === JOURNEY_PREFERENCES_KEY),
    ).toBe(true);
  });

  it.each([
    'invalid JSON',
    JSON.stringify([]),
    JSON.stringify({ version: 2, preferences: DEFAULT_JOURNEY }),
    JSON.stringify({ version: 1, preferences: null }),
    JSON.stringify({
      version: 1,
      preferences: { ...DEFAULT_JOURNEY, activeSkillIds: ['unknown'] },
    }),
    JSON.stringify({ version: 1, preferences: { ...DEFAULT_JOURNEY, primaryInterestId: 'life' } }),
  ])('ignores malformed stored preferences: %s', (value) => {
    entries.set(JOURNEY_PREFERENCES_KEY, value);
    expect(TestBed.inject(JourneyPreferencesStorage).read()).toBeNull();
    expect(browserStorage.setItem).not.toHaveBeenCalled();
  });

  it('rejects invalid saves without replacing a valid choice', () => {
    const storage = TestBed.inject(JourneyPreferencesStorage);
    storage.save(DEFAULT_JOURNEY);
    const before = entries.get(JOURNEY_PREFERENCES_KEY);
    browserStorage.setItem.mockClear();
    expect(storage.save({ ...DEFAULT_JOURNEY, interestIds: [] })).toBe(false);
    expect(browserStorage.setItem).not.toHaveBeenCalled();
    expect(entries.get(JOURNEY_PREFERENCES_KEY)).toBe(before);
  });

  it('returns safe fallbacks for denied reads, denied writes and unavailable storage', () => {
    const storage = TestBed.inject(JourneyPreferencesStorage);
    browserStorage.getItem.mockImplementation(() => {
      throw new Error('Read denied');
    });
    browserStorage.setItem.mockImplementation(() => {
      throw new Error('Write denied');
    });
    expect(storage.read()).toBeNull();
    expect(storage.save(DEFAULT_JOURNEY)).toBe(false);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: null }] });
    const unavailable = TestBed.inject(JourneyPreferencesStorage);
    expect(unavailable.read()).toBeNull();
    expect(unavailable.save(DEFAULT_JOURNEY)).toBe(false);
  });
});
