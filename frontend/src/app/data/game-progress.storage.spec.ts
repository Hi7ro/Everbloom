import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './browser-storage';
import {
  GAME_PROGRESS_KEY,
  GameProgressJournal,
  GameProgressStorage,
  MAX_PROGRESS_BYTES,
  MAX_PROGRESS_ENTRIES,
  normalizeProgressJournal,
  serializeProgressJournal,
} from './game-progress.storage';

const empty = (): GameProgressJournal => ({ version: 1, startDay: '2026-09-08', entries: [] });
const one = (): GameProgressJournal => ({
  ...empty(),
  entries: [{ requestId: 'first', skillId: 'calisthenics', minutes: 60, dayKey: '2026-09-08' }],
});

describe('versioned local activity journal', () => {
  let entries: Map<string, string>;
  let denied: boolean;
  let readDenied: boolean;
  let writes: number;
  beforeEach(() => {
    entries = new Map();
    denied = false;
    readDenied = false;
    writes = 0;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BROWSER_STORAGE,
          useValue: {
            getItem: (key: string) => {
              if (readDenied) throw new Error('denied');
              return entries.get(key) ?? null;
            },
            setItem: (key: string, value: string) => {
              writes++;
              if (denied) throw new Error('quota');
              entries.set(key, value);
            },
          },
        },
      ],
    });
  });

  it('stores only bounded accepted inputs and keeps other device preferences untouched', () => {
    entries.set('everbloom.character.v2', 'profile');
    const storage = TestBed.inject(GameProgressStorage);
    expect(storage.read()).toBeNull();
    expect(storage.save(one())).toBe(true);
    expect(JSON.parse(entries.get(GAME_PROGRESS_KEY)!)).toEqual(one());
    expect(storage.read()).toEqual(one());
    expect(storage.status()).toEqual({ state: 'saved', message: null });
    expect(entries.get('everbloom.character.v2')).toBe('profile');
  });

  it.each([
    'not JSON',
    'null',
    '[]',
    JSON.stringify({ version: 1, startDay: '2026-02-30', entries: [] }),
    JSON.stringify({ version: 1, startDay: '0000-01-01', entries: [] }),
    JSON.stringify({ ...empty(), totalXp: 999999, unlockedAuras: ['starlight'] }),
    JSON.stringify({ ...one(), entries: [{ ...one().entries[0], xp: 999999 }] }),
  ])('quarantines malformed or reward-bearing data without overwriting it: %s', (raw) => {
    entries.set(GAME_PROGRESS_KEY, raw);
    const storage = TestBed.inject(GameProgressStorage);
    expect(storage.read()).toBeNull();
    expect(storage.status().state).toBe('corrupt');
    expect(storage.save(empty())).toBe(false);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(raw);
    expect(writes).toBe(0);
  });

  it.each([0, 2, 99, '1', null])('preserves unsupported journal version %s', (version) => {
    const raw = JSON.stringify({ ...one(), version });
    entries.set(GAME_PROGRESS_KEY, raw);
    const storage = TestBed.inject(GameProgressStorage);
    expect(storage.read()).toBeNull();
    expect(storage.status().state).toBe('unsupported');
    expect(storage.save(empty())).toBe(false);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(raw);
  });

  it.each([
    { requestId: '' },
    { requestId: ' '.repeat(4) },
    { requestId: 'x'.repeat(129) },
    { requestId: 'line\nbreak' },
    { skillId: 'unknown' },
    { minutes: 0 },
    { minutes: 181 },
    { minutes: 1.5 },
    { minutes: '10' },
    { minutes: NaN },
    { dayKey: '2026-02-30' },
    { dayKey: '2026-09-07' },
    { dayKey: '2026-9-08' },
    { dayKey: '0000-01-01' },
  ])('rejects malformed activity input %j', (patch) => {
    expect(() =>
      normalizeProgressJournal({ ...one(), entries: [{ ...one().entries[0], ...patch }] }),
    ).toThrow();
  });

  it('rejects duplicate IDs and backward dates across entries, while accepting same-day entries', () => {
    expect(() =>
      normalizeProgressJournal({ ...one(), entries: [one().entries[0], one().entries[0]] }),
    ).toThrow();
    expect(() =>
      normalizeProgressJournal({
        ...one(),
        entries: [
          { ...one().entries[0], dayKey: '2026-09-10' },
          { ...one().entries[0], requestId: 'second', dayKey: '2026-09-09' },
        ],
      }),
    ).toThrow();
    expect(
      normalizeProgressJournal({
        ...one(),
        entries: [one().entries[0], { ...one().entries[0], requestId: 'second' }],
      }).entries,
    ).toHaveLength(2);
  });

  it('bounds entry counts and encoded byte size before writing', () => {
    const storage = TestBed.inject(GameProgressStorage);
    storage.read();
    const large = {
      ...empty(),
      entries: Array.from({ length: MAX_PROGRESS_ENTRIES + 1 }, (_, i) => ({
        ...one().entries[0],
        requestId: String(i),
      })),
    };
    expect(() => storage.save(large)).toThrow('voll');
    const utf8 = {
      ...empty(),
      entries: Array.from({ length: 7000 }, (_, i) => ({
        ...one().entries[0],
        requestId: `${i}-${'界'.repeat(110)}`,
      })),
    };
    expect(() => serializeProgressJournal(utf8)).toThrow('voll');
    expect(writes).toBe(0);
    entries.set(GAME_PROGRESS_KEY, ' '.repeat(MAX_PROGRESS_BYTES + 1));
    expect(storage.read()).toBeNull();
    expect(storage.save(empty())).toBe(false);
  });

  it('keeps an old journal intact after a quota failure and later saves the full newer journal', () => {
    const storage = TestBed.inject(GameProgressStorage);
    storage.read();
    storage.save(empty());
    const previous = entries.get(GAME_PROGRESS_KEY);
    denied = true;
    expect(storage.save(one())).toBe(false);
    expect(storage.status().state).toBe('session');
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(previous);
    denied = false;
    expect(storage.save(one())).toBe(true);
    expect(storage.status().state).toBe('saved');
    expect(storage.read()).toEqual(one());
  });

  it('does not overwrite a journal that could not be read', () => {
    entries.set(GAME_PROGRESS_KEY, JSON.stringify(one()));
    readDenied = true;
    const storage = TestBed.inject(GameProgressStorage);
    expect(storage.read()).toBeNull();
    expect(storage.status().state).toBe('unavailable');
    readDenied = false;
    expect(storage.save(empty())).toBe(false);
    expect(writes).toBe(0);
  });

  it('detects a second tab and quarantines this session until an explicit reset', () => {
    const storage = TestBed.inject(GameProgressStorage);
    storage.read();
    storage.save(empty());
    entries.set(GAME_PROGRESS_KEY, JSON.stringify(one()));
    expect(storage.save(empty())).toBe(false);
    expect(storage.status().message).toContain('anderen Fenster');
    expect(JSON.parse(entries.get(GAME_PROGRESS_KEY)!)).toEqual(one());
    expect(storage.reset(empty())).toBe(true);
    expect(storage.save(one())).toBe(true);
  });

  it('resets quarantined data atomically and keeps it untouched when resetting is blocked', () => {
    entries.set(GAME_PROGRESS_KEY, 'broken');
    const storage = TestBed.inject(GameProgressStorage);
    storage.read();
    denied = true;
    expect(() => storage.reset(empty())).toThrow('nicht zurückgesetzt');
    expect(entries.get(GAME_PROGRESS_KEY)).toBe('broken');
    denied = false;
    expect(storage.reset(empty())).toBe(true);
    expect(storage.status().state).toBe('saved');
    expect(storage.read()).toEqual(empty());
  });

  it('supports an explicitly temporary session when browser storage is absent', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: null }] });
    const storage = TestBed.inject(GameProgressStorage);
    expect(storage.read()).toBeNull();
    expect(storage.save(one())).toBe(false);
    expect(storage.reset(empty())).toBe(false);
    expect(storage.status().state).toBe('unavailable');
  });
});
