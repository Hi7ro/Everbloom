import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { GAME_DAY_CLOCK } from '../data/game-clock';
import { GAME_PROGRESS_KEY } from '../data/game-progress.storage';
import { MockGameRepository } from '../data/mock-game.repository';
import { DailyCareMode, localDayKey } from '../domain/daily-care';
import { DAILY_CARE_KEY, DAY_CLOCK, DailyCareStore } from './daily-care.store';

describe('independent daily care store', () => {
  let today: string;
  let entries: Map<string, string>;
  let storage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    today = '2026-09-08';
    entries = new Map();
    storage = {
      getItem: vi.fn((key: string) => entries.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => entries.set(key, value)),
      removeItem: vi.fn((key: string) => entries.delete(key)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: DAY_CLOCK, useValue: () => today },
        { provide: GAME_DAY_CLOCK, useValue: () => today },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('persists only voluntary daily preferences and leaves the entire game snapshot unchanged', async () => {
    const repository = TestBed.runInInjectionContext(() => new MockGameRepository());
    const before = await repository.load();
    const journalBefore = entries.get(GAME_PROGRESS_KEY);
    const care = TestBed.inject(DailyCareStore);
    expect(care.save('rest', 'low')).toBe(true);
    expect(care.checkIn()).toEqual({ dayKey: today, mode: 'rest', energy: 'low' });
    expect(care.persisted()).toBe(true);
    expect([...entries.keys()]).toEqual([GAME_PROGRESS_KEY, DAILY_CARE_KEY]);
    expect(JSON.parse(entries.get(DAILY_CARE_KEY)!)).toEqual({
      version: 1,
      dayKey: today,
      skipped: false,
      checkIn: { dayKey: today, mode: 'rest', energy: 'low' },
    });
    care.skip();
    care.reset();
    expect(await repository.load()).toEqual(before);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(journalBefore);
  });

  it('restores same-day choices, rereads changes and expires old or future decisions', () => {
    const care = TestBed.inject(DailyCareStore);
    care.save('focus', 'steady');
    const restored = TestBed.runInInjectionContext(() => new DailyCareStore());
    try {
      expect(restored.checkIn()).toEqual(care.checkIn());
      care.save('recovery', 'low');
      restored.refresh();
      expect(restored.checkIn()?.mode).toBe('recovery');
      today = '2026-09-09';
      restored.refresh();
      expect(restored.checkIn()).toBeNull();
      expect(restored.skipped()).toBe(false);
      today = '2026-09-07';
      restored.refresh();
      expect(restored.checkIn()).toBeNull();
    } finally {
      restored.ngOnDestroy();
    }
  });

  it('refreshes when the app is focused or visible and removes listeners on destroy', () => {
    const care = TestBed.inject(DailyCareStore);
    care.save('balanced', 'high');
    today = '2026-09-09';
    window.dispatchEvent(new Event('focus'));
    expect(care.checkIn()).toBeNull();
    expect(care.dayKey()).toBe(today);
    care.save('rest', 'low');
    today = '2026-09-10';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(care.checkIn()).toBeNull();
    expect(care.dayKey()).toBe(today);
    care.ngOnDestroy();
    const refresh = vi.spyOn(care, 'refresh');
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(refresh).not.toHaveBeenCalled();
  });

  it('skips only today, permits choosing again, and updates avatar text without rewards', () => {
    const care = TestBed.inject(DailyCareStore);
    care.skip();
    care.refresh();
    expect(care.checkIn()).toBeNull();
    expect(care.skipped()).toBe(true);
    expect(care.avatarInterest('running')).toBe('running');
    expect(care.avatarMessage('Hallo')).toBe('Hallo');
    care.reset();
    expect(care.skipped()).toBe(false);
    expect(entries.has(DAILY_CARE_KEY)).toBe(false);
    care.save('focus', 'high');
    expect(care.avatarInterest('running')).toBe('programming');
    care.save('recovery', 'low');
    expect(care.avatarInterest('running')).toBe('recovery');
    care.save('rest', 'low');
    expect(care.avatarMessage('Hallo')).toContain('Ruhe');
    care.save('balanced', 'steady');
    expect(care.avatarInterest('running')).toBe('running');
    care.skip();
    today = '2026-09-09';
    care.refresh();
    expect(care.skipped()).toBe(false);
  });

  it('handles malformed storage and invalid runtime choices without accepting them', () => {
    entries.set(DAILY_CARE_KEY, 'not json');
    const care = TestBed.inject(DailyCareStore);
    expect(care.checkIn()).toBeNull();
    care.save('balanced', 'steady');
    const saved = entries.get(DAILY_CARE_KEY);
    expect(care.save('unknown' as DailyCareMode, 'steady')).toBe(false);
    expect(entries.get(DAILY_CARE_KEY)).toBe(saved);
    expect(care.checkIn()?.mode).toBe('balanced');
    entries.set(
      DAILY_CARE_KEY,
      JSON.stringify({
        version: 1,
        dayKey: today,
        skipped: false,
        checkIn: { dayKey: today, mode: 'rest', energy: 'invalid' },
      }),
    );
    care.refresh();
    expect(care.checkIn()).toBeNull();
  });

  it('preserves a session decision when writes fail, including skip and reset', () => {
    const care = TestBed.inject(DailyCareStore);
    care.save('balanced', 'steady');
    storage.setItem.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    expect(care.save('rest', 'low')).toBe(true);
    expect(care.persisted()).toBe(false);
    care.refresh();
    expect(care.checkIn()?.mode).toBe('rest');
    care.skip();
    care.refresh();
    expect(care.skipped()).toBe(true);
    storage.removeItem.mockImplementation(() => {
      throw new Error('Storage denied');
    });
    care.reset();
    care.refresh();
    expect(care.skipped()).toBe(false);
    expect(care.checkIn()).toBeNull();
    expect(care.persisted()).toBe(false);
    care.save('focus', 'steady');
    today = '2026-09-09';
    care.refresh();
    expect(care.checkIn()).toBeNull();
  });

  it('degrades safely when reads, storage or the clock are unavailable', () => {
    storage.getItem.mockImplementation(() => {
      throw new Error('Read denied');
    });
    const care = TestBed.inject(DailyCareStore);
    expect(care.checkIn()).toBeNull();
    expect(care.persisted()).toBe(false);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: BROWSER_STORAGE, useValue: null },
        {
          provide: DAY_CLOCK,
          useValue: () => {
            throw new Error('Clock adapter unavailable');
          },
        },
      ],
    });
    const fallback = TestBed.inject(DailyCareStore);
    expect(fallback.dayKey()).toBe(localDayKey());
    expect(fallback.save('recovery', 'low')).toBe(true);
    expect(fallback.persisted()).toBe(false);
    fallback.refresh();
    expect(fallback.checkIn()?.mode).toBe('recovery');
  });
});
