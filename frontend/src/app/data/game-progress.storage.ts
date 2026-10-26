import { inject, Injectable } from '@angular/core';
import { BALANCE, SKILLS } from '../domain/catalog';
import { isValidDayKey } from '../domain/game-periods';
import { ActivityCommand } from '../domain/models';
import { BROWSER_STORAGE } from './browser-storage';

export const GAME_PROGRESS_KEY = 'everbloom.progress.v1';
export const MAX_PROGRESS_ENTRIES = 10_000;
export const MAX_PROGRESS_BYTES = 2 * 1024 * 1024;
export interface ProgressEntry extends ActivityCommand {
  readonly dayKey: string;
}
export interface GameProgressJournal {
  readonly version: 1;
  readonly startDay: string;
  readonly entries: readonly ProgressEntry[];
}
export interface ProgressPersistenceStatus {
  readonly state:
    'saved' | 'server' | 'session' | 'unavailable' | 'corrupt' | 'unsupported' | 'limit' | 'clock';
  readonly message: string | null;
}

class JournalError extends Error {
  constructor(
    readonly kind: 'corrupt' | 'unsupported' | 'limit',
    message: string,
  ) {
    super(message);
  }
}
const LIMIT_MESSAGE =
  'Dein lokales Journal ist voll. Weitere Einträge sind vorerst nicht möglich. Dein bisheriger Fortschritt bleibt erhalten.';
const CORRUPT_MESSAGE =
  'Der gespeicherte Spielstand ist beschädigt. Du spielst vorübergehend nur in dieser Sitzung. Die vorhandenen Daten bleiben erhalten; ein Zurücksetzen ersetzt sie ausdrücklich.';
const UNSUPPORTED_MESSAGE =
  'Dieser Spielstand stammt aus einer anderen Version. Du spielst vorübergehend nur in dieser Sitzung; die vorhandenen Daten werden nicht überschrieben.';
const UNAVAILABLE_MESSAGE =
  'Der Gerätespeicher ist nicht verfügbar. Dein Fortschritt bleibt nur in dieser Sitzung erhalten.';
const SESSION_MESSAGE =
  'Dein letzter Fortschritt konnte nicht gespeichert werden. Du kannst weiterspielen; neue Fortschritte bleiben vorerst nur in dieser Sitzung.';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return (
    Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
  );
}
function fail(): never {
  throw new JournalError('corrupt', CORRUPT_MESSAGE);
}

/** Rewards are recomputed. Only accepted, bounded activity inputs may be restored. */
export function normalizeProgressJournal(value: unknown): GameProgressJournal {
  if (!record(value)) return fail();
  if (Object.hasOwn(value, 'version') && value['version'] !== 1) {
    throw new JournalError('unsupported', UNSUPPORTED_MESSAGE);
  }
  if (
    !exactKeys(value, ['version', 'startDay', 'entries']) ||
    value['version'] !== 1 ||
    !isValidDayKey(value['startDay']) ||
    !Array.isArray(value['entries'])
  )
    return fail();
  if (value['entries'].length > MAX_PROGRESS_ENTRIES) {
    throw new JournalError('limit', LIMIT_MESSAGE);
  }
  let previousDay = value['startDay'];
  const requestIds = new Set<string>();
  const entries = value['entries'].map((entry: unknown): ProgressEntry => {
    if (
      !record(entry) ||
      !exactKeys(entry, ['requestId', 'skillId', 'minutes', 'dayKey']) ||
      typeof entry['requestId'] !== 'string' ||
      !entry['requestId'].trim() ||
      entry['requestId'].length > 128 ||
      /[\u0000-\u001f\u007f]/.test(entry['requestId']) ||
      requestIds.has(entry['requestId']) ||
      typeof entry['skillId'] !== 'string' ||
      !SKILLS.some((skill) => skill.id === entry['skillId']) ||
      typeof entry['minutes'] !== 'number' ||
      !Number.isInteger(entry['minutes']) ||
      entry['minutes'] < 1 ||
      entry['minutes'] > BALANCE.maxMinutesPerEntry ||
      !isValidDayKey(entry['dayKey']) ||
      entry['dayKey'] < previousDay
    )
      return fail();
    requestIds.add(entry['requestId']);
    previousDay = entry['dayKey'];
    return {
      requestId: entry['requestId'],
      skillId: entry['skillId'],
      minutes: entry['minutes'],
      dayKey: entry['dayKey'],
    };
  });
  return { version: 1, startDay: value['startDay'], entries };
}

export function serializeProgressJournal(journal: GameProgressJournal): string {
  const raw = JSON.stringify(normalizeProgressJournal(journal));
  if (new TextEncoder().encode(raw).byteLength > MAX_PROGRESS_BYTES) {
    throw new JournalError('limit', LIMIT_MESSAGE);
  }
  return raw;
}

/** Atomic localStorage writes; corrupt/newer journals are quarantined until explicit reset. */
@Injectable({ providedIn: 'root' })
export class GameProgressStorage {
  private readonly storage = inject(BROWSER_STORAGE);
  private state: ProgressPersistenceStatus = { state: 'saved', message: null };
  private lastRaw: string | null = null;
  private readable = false;
  private quarantined = false;

  status(): ProgressPersistenceStatus {
    return { ...this.state };
  }

  read(): GameProgressJournal | null {
    this.readable = false;
    this.quarantined = false;
    if (!this.storage) {
      this.state = { state: 'unavailable', message: UNAVAILABLE_MESSAGE };
      return null;
    }
    try {
      const raw = this.storage.getItem(GAME_PROGRESS_KEY);
      this.lastRaw = raw;
      this.readable = true;
      if (raw === null) {
        this.state = { state: 'saved', message: null };
        return null;
      }
      if (new TextEncoder().encode(raw).byteLength > MAX_PROGRESS_BYTES) {
        throw new JournalError('limit', LIMIT_MESSAGE);
      }
      const journal = normalizeProgressJournal(JSON.parse(raw));
      this.state = { state: 'saved', message: null };
      return journal;
    } catch (error) {
      this.quarantined = true;
      this.state = !this.readable
        ? { state: 'unavailable', message: UNAVAILABLE_MESSAGE }
        : error instanceof JournalError
          ? { state: error.kind, message: error.message }
          : { state: 'corrupt', message: CORRUPT_MESSAGE };
      return null;
    }
  }

  save(journal: GameProgressJournal): boolean {
    const raw = serializeProgressJournal(journal);
    if (!this.storage || !this.readable || this.quarantined) return false;
    try {
      // An open second tab must not silently replace this session's newer/older history.
      if (this.storage.getItem(GAME_PROGRESS_KEY) !== this.lastRaw) {
        this.quarantined = true;
        this.state = {
          state: 'session',
          message:
            'Der Spielstand wurde in einem anderen Fenster geändert. Neue Fortschritte bleiben nur in dieser Sitzung. Lade die App neu, um den gespeicherten Stand zu übernehmen.',
        };
        return false;
      }
      this.storage.setItem(GAME_PROGRESS_KEY, raw);
      this.lastRaw = raw;
      this.state = { state: 'saved', message: null };
      return true;
    } catch {
      this.state = { state: 'session', message: SESSION_MESSAGE };
      return false;
    }
  }

  /** A reset replaces the single journal key before any in-memory progress changes. */
  reset(journal: GameProgressJournal): boolean {
    const raw = serializeProgressJournal(journal);
    if (!this.storage) {
      this.state = { state: 'unavailable', message: UNAVAILABLE_MESSAGE };
      return false;
    }
    try {
      this.storage.setItem(GAME_PROGRESS_KEY, raw);
      this.lastRaw = raw;
      this.readable = true;
      this.quarantined = false;
      this.state = { state: 'saved', message: null };
      return true;
    } catch {
      this.state = { state: 'session', message: SESSION_MESSAGE };
      throw new Error(
        'Der Spielstand konnte nicht zurückgesetzt werden. Dein bisheriger Fortschritt bleibt erhalten.',
      );
    }
  }
}
