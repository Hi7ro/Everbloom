import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './browser-storage';
import { GAME_DAY_CLOCK } from './game-clock';
import { GAME_PROGRESS_KEY, MAX_PROGRESS_ENTRIES } from './game-progress.storage';
import { CHARACTER_PROFILE_KEY } from './character-profile.storage';
import { MockGameRepository } from './mock-game.repository';
import { createMockSnapshot } from './mock-data';
import { CharacterProfile } from '../domain/models';

const command = (requestId = 'one', skillId = 'calisthenics', minutes = 60) => ({
  requestId,
  skillId,
  minutes,
});

describe('replayable local game repository', () => {
  let entries: Map<string, string>;
  let today: string;
  let writeDenied: boolean;
  const repository = () => TestBed.runInInjectionContext(() => new MockGameRepository());
  beforeEach(() => {
    entries = new Map();
    today = '2026-09-08';
    writeDenied = false;
    TestBed.configureTestingModule({
      providers: [
        { provide: GAME_DAY_CLOCK, useValue: () => today },
        {
          provide: BROWSER_STORAGE,
          useValue: {
            getItem: (key: string) => entries.get(key) ?? null,
            setItem: (key: string, value: string) => {
              if (writeDenied) throw new Error('quota');
              entries.set(key, value);
            },
          },
        },
      ],
    });
  });

  it('dates and persists the existing demo baseline without resetting its earned levels', async () => {
    today = '2026-10-02';
    const repo = repository();
    const snapshot = await repo.load();
    expect(snapshot.dayKey).toBe(today);
    expect(snapshot.character.totalXp).toBe(createMockSnapshot().character.totalXp);
    expect(snapshot.skills).toEqual(createMockSnapshot().skills);
    expect(snapshot.boss.hp).toBe(1460);
    expect(snapshot.unlockedAuras).toEqual([]);
    expect(JSON.parse(entries.get(GAME_PROGRESS_KEY)!)).toEqual({
      version: 1,
      startDay: today,
      entries: [],
    });
    expect(repo.progressPersistence().state).toBe('saved');
  });

  it('reconstructs XP, daily limits, quests, momentum and weekly boss damage across a reload', async () => {
    const repo = repository();
    await repo.record(command('day-one'));
    await repo.record(command('capped', 'calisthenics', 90));
    today = '2026-09-09';
    await repo.record(command('day-two', 'calisthenics', 60));
    await repo.record(command('meditation', 'meditation', 10));
    const live = await repo.load();
    const reloaded = await repository().load();
    expect(reloaded).toEqual(live);
    expect(reloaded.activities).toHaveLength(4);
    expect(reloaded.activities.find((entry) => entry.requestId === 'capped')?.rewardedMinutes).toBe(
      30,
    );
    expect(reloaded.quests.filter((quest) => quest.claimed)).toHaveLength(2);
    const raw = entries.get(GAME_PROGRESS_KEY)!;
    expect(raw).not.toContain('totalXp');
    expect(raw).not.toContain('unlockedAuras');
    expect(raw).not.toContain('rewardedMinutes');
    expect(raw).not.toContain('maxHp');
  });

  it('records capped entries once and preserves request idempotence across reloads and days', async () => {
    const repo = repository();
    await repo.record(command('full', 'calisthenics', 90));
    const capped = await repo.record(command('extra', 'calisthenics', 90));
    expect(capped.reward.activityXp).toBe(0);
    const before = await repo.load();
    today = '2026-09-09';
    const reloaded = repository();
    const beforeRetry = await reloaded.load();
    expect((await reloaded.record(command('extra', 'calisthenics', 90))).reward.duplicate).toBe(
      true,
    );
    expect((await reloaded.load()).character.totalXp).toBe(before.character.totalXp);
    expect((await reloaded.load()).activities).toEqual(beforeRetry.activities);
    expect(JSON.parse(entries.get(GAME_PROGRESS_KEY)!).entries).toHaveLength(2);
    await expect(reloaded.record(command('extra', 'running', 90))).rejects.toThrow(
      'andere Aktivität',
    );
  });

  it('replays boss aura ownership, allows equipping it, and resets progress while retaining the look', async () => {
    const repo = repository();
    await expect(
      repo.updateCharacter({
        name: 'Liora',
        appearance: { ...createMockSnapshot().character.appearance, aura: 'moss-spirit' },
      }),
    ).rejects.toThrow('noch nicht');
    await repo.record(command('strength', 'calisthenics', 90));
    await repo.record(command('run', 'running', 60));
    await repo.record(command('code', 'programming', 90));
    await repo.record(command('mind', 'meditation', 10));
    const won = await repo.load();
    expect(won.boss.hp).toBe(0);
    expect(won.unlockedAuras).toEqual(['moss-spirit']);
    const profile: CharacterProfile = {
      name: 'Liora',
      appearance: { ...won.character.appearance, aura: 'moss-spirit', hairTint: '#d5dbe0' },
    };
    await repo.updateCharacter(profile);
    const reloaded = repository();
    expect((await reloaded.load()).character.appearance.aura).toBe('moss-spirit');
    expect((await reloaded.load()).unlockedAuras).toEqual(['moss-spirit']);
    today = '2026-09-14';
    expect((await reloaded.load()).boss.hp).toBe(2400);
    expect((await reloaded.load()).unlockedAuras).toEqual(['moss-spirit']);
    const reset = await reloaded.resetDemo();
    expect(reset.unlockedAuras).toEqual([]);
    expect(reset.activities).toEqual([]);
    expect(reset.character).toMatchObject({
      name: 'Liora',
      appearance: { aura: 'none', hairTint: '#d5dbe0' },
    });
    expect(JSON.parse(entries.get(CHARACTER_PROFILE_KEY)!).profile.appearance.aura).toBe('none');
    expect(await repository().load()).toEqual(reset);
  });

  it('uses an accessible runtime aura without changing the stored identity or modular appearance', async () => {
    const profile = {
      name: 'Liora',
      appearance: {
        ...createMockSnapshot().character.appearance,
        aura: 'starlight',
        hairTint: '#9478bc',
      },
    };
    entries.set(CHARACTER_PROFILE_KEY, JSON.stringify({ version: 2, profile }));
    const snapshot = await repository().load();
    expect(snapshot.character).toMatchObject({
      name: 'Liora',
      appearance: { aura: 'none', hairTint: '#9478bc' },
    });
    expect(snapshot.unlockedAuras).toEqual([]);
    expect(JSON.parse(entries.get(CHARACTER_PROFILE_KEY)!).profile.appearance.aura).toBe(
      'starlight',
    );
  });

  it('does not revoke a saved earned aura when its journal is temporarily unreadable', async () => {
    const profile = {
      name: 'Liora',
      appearance: { ...createMockSnapshot().character.appearance, aura: 'moss-spirit' },
    };
    const rawProfile = JSON.stringify({ version: 2, profile });
    const rawJournal = JSON.stringify({ version: 99, startDay: today, entries: [] });
    entries.set(CHARACTER_PROFILE_KEY, rawProfile);
    entries.set(GAME_PROGRESS_KEY, rawJournal);
    const repo = repository();
    const snapshot = await repo.load();
    expect(snapshot.character).toMatchObject({ name: 'Liora', appearance: { aura: 'none' } });
    expect(repo.progressPersistence().state).toBe('unsupported');
    expect(entries.get(CHARACTER_PROFILE_KEY)).toBe(rawProfile);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(rawJournal);
  });

  it('keeps accepted rewards in the session after a quota failure and never doubles a retry', async () => {
    const repo = repository();
    const stored = entries.get(GAME_PROGRESS_KEY);
    writeDenied = true;
    const first = await repo.record(command());
    expect(first.reward.activityXp).toBe(240);
    expect(repo.progressPersistence().state).toBe('session');
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(stored);
    expect((await repo.record(command())).reward.duplicate).toBe(true);
    expect((await repo.load()).activities).toHaveLength(1);
    writeDenied = false;
    await repo.record(command('after-recovery', 'meditation', 10));
    expect(repo.progressPersistence().state).toBe('saved');
    const live = await repo.load();
    expect(await repository().load()).toEqual(live);
    expect(JSON.parse(entries.get(GAME_PROGRESS_KEY)!).entries).toHaveLength(2);
  });

  it.each(['broken', JSON.stringify({ version: 9, startDay: '2026-09-08', entries: [] })])(
    'never overwrites a corrupt or unsupported journal during play: %s',
    async (raw) => {
      entries.set(GAME_PROGRESS_KEY, raw);
      const repo = repository();
      await repo.record(command());
      expect((await repo.load()).activities).toHaveLength(1);
      expect(['corrupt', 'unsupported']).toContain(repo.progressPersistence().state);
      expect(entries.get(GAME_PROGRESS_KEY)).toBe(raw);
      await repo.resetDemo();
      expect(repo.progressPersistence().state).toBe('saved');
      expect(JSON.parse(entries.get(GAME_PROGRESS_KEY)!).entries).toEqual([]);
    },
  );

  it('preserves the whole live and stored game when reset storage fails', async () => {
    const repo = repository();
    await repo.record(command());
    const before = await repo.load();
    const raw = entries.get(GAME_PROGRESS_KEY);
    writeDenied = true;
    await expect(repo.resetDemo()).rejects.toThrow('nicht zurückgesetzt');
    expect(await repo.load()).toEqual(before);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(raw);
  });

  it('blocks new rewards after clock rollback or invalid dates while preserving saved progress', async () => {
    const repo = repository();
    await repo.record(command());
    const raw = entries.get(GAME_PROGRESS_KEY);
    const before = await repo.load();
    today = '2026-09-07';
    const reloaded = repository();
    expect(await reloaded.load()).toEqual(before);
    expect(reloaded.progressPersistence().state).toBe('clock');
    await expect(reloaded.record(command('backwards'))).rejects.toThrow('Gerätedatum');
    expect((await reloaded.record(command())).reward.duplicate).toBe(true);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(raw);
    today = 'invalid';
    await expect(reloaded.record(command('invalid'))).rejects.toThrow('Datum');
    today = '2026-09-09';
    await reloaded.record(command('later'));
    expect(reloaded.progressPersistence().state).toBe('saved');
  });

  it('rejects journal input bounds before changing rewards or persistence', async () => {
    const repo = repository();
    const before = await repo.load();
    const raw = entries.get(GAME_PROGRESS_KEY);
    await expect(repo.record(command('x'.repeat(129)))).rejects.toThrow();
    await expect(repo.record(command('invalid', 'unknown'))).rejects.toThrow();
    await expect(repo.record(command('fraction', 'running', 1.5))).rejects.toThrow();
    expect(await repo.load()).toEqual(before);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(raw);
  });

  it('rejects additions to a full journal before mutating accepted progress', async () => {
    entries.set(
      GAME_PROGRESS_KEY,
      JSON.stringify({
        version: 1,
        startDay: today,
        entries: Array.from({ length: MAX_PROGRESS_ENTRIES }, (_, i) => ({
          ...command(String(i), 'meditation', 1),
          dayKey: today,
        })),
      }),
    );
    const repo = repository();
    const before = await repo.load();
    const raw = entries.get(GAME_PROGRESS_KEY);
    await expect(repo.record(command('over-limit'))).rejects.toThrow('voll');
    expect(await repo.load()).toEqual(before);
    expect(entries.get(GAME_PROGRESS_KEY)).toBe(raw);
  }, 30_000);
});
