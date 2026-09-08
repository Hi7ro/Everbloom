import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { JOURNEY_PREFERENCES_KEY } from '../data/journey-preferences.storage';
import { DEFAULT_JOURNEY } from '../domain/journey';
import { JourneyStore } from './journey.store';

describe('journey preference state', () => {
  let entries: Map<string, string>;
  let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    entries = new Map();
    storage = {
      getItem: vi.fn((key: string) => entries.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => entries.set(key, value)),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: BROWSER_STORAGE, useValue: storage }],
    });
  });

  it('starts with valid familiar skills without claiming onboarding has been completed', () => {
    const journey = TestBed.inject(JourneyStore);
    expect(journey.preferences()).toEqual(DEFAULT_JOURNEY);
    expect(journey.preferences().interestIds).not.toBe(DEFAULT_JOURNEY.interestIds);
    expect(journey.activeSkillIds()).toEqual([
      'calisthenics',
      'running',
      'meditation',
      'programming',
    ]);
    expect(journey.primaryAvatarInterest()).toBe('calisthenics');
    expect(journey.configured()).toBe(false);
    expect(journey.persisted()).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('marks only valid restored preferences as configured and derives their avatar context', () => {
    const preferences = {
      interestIds: ['mind', 'knowledge'],
      activeSkillIds: ['meditation', 'programming'],
      primaryInterestId: 'mind',
    };
    entries.set(JOURNEY_PREFERENCES_KEY, JSON.stringify({ version: 1, preferences }));
    const journey = TestBed.inject(JourneyStore);
    expect(journey.configured()).toBe(true);
    expect(journey.persisted()).toBe(true);
    expect(journey.preferences()).toEqual(preferences);
    expect(journey.primaryAvatarInterest()).toBe('recovery');
    expect(storage.setItem).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    entries.set(JOURNEY_PREFERENCES_KEY, 'not valid');
    TestBed.configureTestingModule({
      providers: [{ provide: BROWSER_STORAGE, useValue: storage }],
    });
    expect(TestBed.inject(JourneyStore).configured()).toBe(false);
  });

  it('accepts ordered preferences synchronously and keeps input mutations outside its state', () => {
    const journey = TestBed.inject(JourneyStore);
    const input = {
      interestIds: ['knowledge', 'physical'],
      activeSkillIds: ['programming', 'running'],
      primaryInterestId: 'knowledge',
      totalXp: 999999,
    };
    expect(journey.save(input)).toBe(true);
    expect(journey.configured()).toBe(true);
    expect(journey.persisted()).toBe(true);
    expect(journey.activeSkillIds()).toEqual(['programming', 'running']);
    expect(journey.primaryAvatarInterest()).toBe('reading');
    expect(journey.preferences()).not.toHaveProperty('totalXp');
    expect(journey.message()).toContain('gespeichert');
    input.activeSkillIds.reverse();
    input.interestIds.push('mind');
    expect(journey.activeSkillIds()).toEqual(['programming', 'running']);
    expect(journey.preferences().interestIds).toEqual(['knowledge', 'physical']);
  });

  it('keeps prior state on invalid input and permits correction without any reward API', () => {
    const journey = TestBed.inject(JourneyStore);
    journey.save(DEFAULT_JOURNEY);
    const before = structuredClone(journey.preferences());
    const stored = entries.get(JOURNEY_PREFERENCES_KEY);
    storage.setItem.mockClear();
    expect(journey.save({ ...DEFAULT_JOURNEY, primaryInterestId: 'life' })).toBe(false);
    expect(journey.error()).toContain('Schwerpunkt');
    expect(journey.preferences()).toEqual(before);
    expect(journey.persisted()).toBe(true);
    expect(entries.get(JOURNEY_PREFERENCES_KEY)).toBe(stored);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(journey.save({ ...DEFAULT_JOURNEY, primaryInterestId: 'mind' })).toBe(true);
    expect(journey.error()).toBe('');
    expect(journey.primaryAvatarInterest()).toBe('recovery');
  });

  it('retains valid preferences for the session when storage is blocked and explains this clearly', () => {
    storage.setItem.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    const journey = TestBed.inject(JourneyStore);
    expect(journey.save({ ...DEFAULT_JOURNEY, primaryInterestId: 'knowledge' })).toBe(true);
    expect(journey.configured()).toBe(true);
    expect(journey.persisted()).toBe(false);
    expect(journey.primaryAvatarInterest()).toBe('reading');
    expect(journey.message()).toContain('für diese Sitzung');
    expect(journey.message()).toContain('beim Neuladen verloren');
    expect(journey.error()).toBe('');
    expect(entries.size).toBe(0);
  });

  it('can be configured with browser storage entirely unavailable', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: null }] });
    const journey = TestBed.inject(JourneyStore);
    expect(journey.save(DEFAULT_JOURNEY)).toBe(true);
    expect(journey.configured()).toBe(true);
    expect(journey.persisted()).toBe(false);
    expect(journey.preferences()).toEqual(DEFAULT_JOURNEY);
  });
});
