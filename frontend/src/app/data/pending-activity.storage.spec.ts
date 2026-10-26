import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './browser-storage';
import { ACTIVITY_RECOVERY_LOCKS, parsePendingActivity, PENDING_ACTIVITY_PREFIX, PendingActivityStorage } from './pending-activity.storage';

const command = { requestId: '07fc31e4-1158-49dd-bb13-8e5e7e7a9740', skillId: 'running', minutes: 20 };
const owner = 'account-one';
const key = PENDING_ACTIVITY_PREFIX + owner;
const raw = () => JSON.stringify({ version: 1, ownerId: owner, ...command });

describe('account pending activity storage', () => {
  let entries: Map<string, string>;
  let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn>; removeItem: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    entries = new Map();
    storage = {
      getItem: vi.fn((key: string) => entries.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => { entries.set(key, value); }),
      removeItem: vi.fn((key: string) => { entries.delete(key); }),
    };
    TestBed.configureTestingModule({ providers: [
      { provide: BROWSER_STORAGE, useValue: storage },
      { provide: ACTIVITY_RECOVERY_LOCKS, useValue: null },
    ] });
  });
  it('stores only original input and reads it only for its owner', async () => {
    const pending = TestBed.inject(PendingActivityStorage);
    expect(await pending.reserve(owner, command)).toEqual(command);
    expect(JSON.parse(entries.get(key)!)).toEqual({ version: 1, ownerId: owner, ...command });
    expect(pending.read(owner).command).toEqual(command);
    expect(pending.read('account-two')).toEqual({ command: null, issue: '' });
    entries.set(PENDING_ACTIVITY_PREFIX + 'account-two', raw());
    expect(pending.read('account-two').command).toBeNull();
    expect(pending.read('account-two').issue).toContain('nicht sicher gelesen');
  });
  it.each([
    '{broken', 'null', '[]', JSON.stringify({ version: 2, ownerId: owner, ...command }),
    JSON.stringify({ version: 1, ownerId: owner, ...command, extra: 1 }),
    JSON.stringify({ version: 1, ownerId: owner, ...command, requestId: 'bad-id' }),
    JSON.stringify({ version: 1, ownerId: owner, ...command, skillId: 'unknown' }),
    JSON.stringify({ version: 1, ownerId: owner, ...command, minutes: 0 }),
    JSON.stringify({ version: 1, ownerId: owner, ...command, minutes: 181 }),
    JSON.stringify({ version: 1, ownerId: owner, ...command, minutes: 1.5 }),
    'x'.repeat(1025),
  ])('quarantines invalid stored data without overwriting it: %s', async value => {
    entries.set(key, value);
    const pending = TestBed.inject(PendingActivityStorage);
    expect(pending.read(owner).command).toBeNull();
    await expect(pending.reserve(owner, command)).rejects.toThrow('nicht sicher gelesen');
    expect(entries.get(key)).toBe(value);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('does not overwrite another window’s command or erase its newer reservation', async () => {
    const pending = TestBed.inject(PendingActivityStorage);
    entries.set(key, raw());
    const different = { ...command, requestId: crypto.randomUUID(), skillId: 'meditation', minutes: 10 };
    expect(await pending.reserve(owner, different)).toEqual(command);
    expect(await pending.clear(owner, different.requestId)).toBe(false);
    expect(parsePendingActivity(entries.get(key)!, owner)).toEqual(command);
    expect(await pending.clear(owner, command.requestId)).toBe(true);
    expect(entries.has(key)).toBe(false);
  });
  it('fails before sending if persistence is blocked or its readback cannot be verified', async () => {
    const pending = TestBed.inject(PendingActivityStorage);
    storage.setItem.mockImplementationOnce(() => { throw new Error('quota'); });
    await expect(pending.reserve(owner, command)).rejects.toThrow('kein neuer Eintrag gesendet');
    storage.setItem.mockImplementationOnce(() => {});
    await expect(pending.reserve(owner, command)).rejects.toThrow('kein neuer Eintrag gesendet');
  });
  it('serializes account reservations through the browser lock', async () => {
    const request = vi.fn(async (_key: string, action: () => unknown) => action());
    TestBed.overrideProvider(ACTIVITY_RECOVERY_LOCKS, { useValue: { request } });
    const pending = TestBed.inject(PendingActivityStorage);
    await pending.reserve(owner, command);
    await pending.clear(owner, command.requestId);
    expect(request.mock.calls.map(call => call[0])).toEqual([key, key]);
  });
  it('removes only the deleted account’s recovery record', () => {
    entries.set(key, raw());
    entries.set(PENDING_ACTIVITY_PREFIX + 'account-two', 'keep');
    TestBed.inject(PendingActivityStorage).removeForDeletedAccount(owner);
    expect(entries.has(key)).toBe(false);
    expect(entries.get(PENDING_ACTIVITY_PREFIX + 'account-two')).toBe('keep');
  });
});
