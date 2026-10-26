import { inject, Injectable, InjectionToken } from '@angular/core';
import { BALANCE, SKILLS } from '../domain/catalog';
import { ActivityCommand } from '../domain/models';
import { BROWSER_STORAGE } from './browser-storage';

export const PENDING_ACTIVITY_PREFIX = 'everbloom.pending-activity.v1.';
const MAX_BYTES = 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNAVAILABLE = 'Die Gerätesicherung ist gerade nicht verfügbar. Es wurde kein neuer Eintrag gesendet. Bitte prüfe den Gerätespeicher und versuche es erneut.';
const CORRUPT = 'Ein unbestätigter Eintrag konnte nicht sicher gelesen werden. Neue Einträge bleiben zum Schutz vor doppelten XP gesperrt. Bitte prüfe deinen Verlauf unter „Zuletzt erlebt“ und wende dich an den Support, falls erneutes Prüfen nicht hilft.';

export const ACTIVITY_RECOVERY_LOCKS = new InjectionToken<Pick<LockManager, 'request'> | null>(
  'ACTIVITY_RECOVERY_LOCKS', {
    providedIn: 'root',
    factory: () => globalThis.navigator?.locks ?? null,
  },
);

export interface PendingActivityRead {
  command: ActivityCommand | null;
  issue: string;
}

function validOwner(ownerId: string): boolean {
  return !!ownerId.trim() && ownerId.length <= 128 && !/[\u0000-\u001f\u007f]/.test(ownerId);
}

/** Only the original input is persisted, never authentication data or predicted rewards. */
export function parsePendingActivity(raw: string, ownerId: string): ActivityCommand {
  if (!validOwner(ownerId) || raw.length > MAX_BYTES) throw new Error(CORRUPT);
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(CORRUPT);
  const record = value as Record<string, unknown>;
  const keys = ['version', 'ownerId', 'requestId', 'skillId', 'minutes'];
  if (
    Object.keys(record).length !== keys.length || !keys.every(key => Object.hasOwn(record, key)) ||
    record['version'] !== 1 || record['ownerId'] !== ownerId ||
    typeof record['requestId'] !== 'string' || !UUID.test(record['requestId']) ||
    typeof record['skillId'] !== 'string' || !SKILLS.some(skill => skill.id === record['skillId']) ||
    typeof record['minutes'] !== 'number' || !Number.isInteger(record['minutes']) ||
    record['minutes'] < 1 || record['minutes'] > BALANCE.maxMinutesPerEntry
  ) throw new Error(CORRUPT);
  return { requestId: record['requestId'], skillId: record['skillId'], minutes: record['minutes'] };
}

@Injectable({ providedIn: 'root' })
export class PendingActivityStorage {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly locks = inject(ACTIVITY_RECOVERY_LOCKS);

  read(ownerId: string): PendingActivityRead {
    if (!this.storage || !validOwner(ownerId)) return { command: null, issue: UNAVAILABLE };
    let raw: string | null;
    try {
      raw = this.storage.getItem(this.key(ownerId));
    } catch {
      return { command: null, issue: UNAVAILABLE };
    }
    if (raw === null) return { command: null, issue: '' };
    try {
      return { command: parsePendingActivity(raw, ownerId), issue: '' };
    } catch {
      // Keep unreadable entries intact: discarding an unknown request ID could duplicate XP.
      return { command: null, issue: CORRUPT };
    }
  }

  /** Reuse an existing reservation, even if another tab created it moments ago. */
  reserve(ownerId: string, candidate: ActivityCommand): Promise<ActivityCommand> {
    return this.exclusive(ownerId, () => {
      const existing = this.read(ownerId);
      if (existing.issue) throw new Error(existing.issue);
      if (existing.command) return existing.command;
      const raw = JSON.stringify({ version: 1, ownerId, ...candidate });
      parsePendingActivity(raw, ownerId);
      try {
        this.storage!.setItem(this.key(ownerId), raw);
      } catch {
        throw new Error(UNAVAILABLE);
      }
      const saved = this.read(ownerId);
      if (saved.issue || !saved.command) throw new Error(saved.issue || UNAVAILABLE);
      return saved.command;
    });
  }

  /** A late response must never erase a newer reservation from another window. */
  clear(ownerId: string, requestId: string): Promise<boolean> {
    return this.exclusive(ownerId, () => {
      const current = this.read(ownerId);
      if (current.issue) return false;
      if (!current.command) return true;
      if (current.command.requestId !== requestId) return false;
      try {
        this.storage!.removeItem(this.key(ownerId));
        return this.storage!.getItem(this.key(ownerId)) === null;
      } catch {
        return false;
      }
    });
  }

  /** Only after the server confirms account deletion; logout keeps recovery available. */
  removeForDeletedAccount(ownerId: string): void {
    if (!validOwner(ownerId)) return;
    try { this.storage?.removeItem(this.key(ownerId)); } catch { /* Account deletion already succeeded. */ }
  }

  private key(ownerId: string): string { return PENDING_ACTIVITY_PREFIX + encodeURIComponent(ownerId); }

  private async exclusive<T>(ownerId: string, action: () => T): Promise<T> {
    // Web Locks serialize reservations across tabs. Older engines still get read/compare checks.
    return this.locks ? this.locks.request(this.key(ownerId), action) : action();
  }
}
