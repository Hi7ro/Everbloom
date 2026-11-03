import { TestBed } from '@angular/core/testing';
import { ACCOUNT_MODE } from '../data/account-mode';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { JourneyStore } from '../state/journey.store';
import { GAME_DAY_CLOCK } from '../data/game-clock';
import { discoveredBosses } from '../domain/boss-catalog';
import { PortfolioDemoRepository } from './portfolio-demo.repository';

describe('isolated portfolio demo repository', () => {
  let day: string;
  let repository: PortfolioDemoRepository;
  beforeEach(() => {
    day = '2026-11-03';
    TestBed.configureTestingModule({
      providers: [
        { provide: ACCOUNT_MODE, useValue: false },
        { provide: BROWSER_STORAGE, useValue: null },
        PortfolioDemoRepository,
        { provide: GAME_DAY_CLOCK, useValue: () => day },
      ],
    });
    repository = TestBed.inject(PortfolioDemoRepository);
  });

  it('starts with an explicitly prepared character and session-only persistence', async () => {
    const snapshot = await repository.load();
    expect(snapshot.character.name).toBe('Ari Demo');
    expect(snapshot.character.totalXp).toBe(25926);
    expect(snapshot.dayKey).toBe('2026-11-03');
    expect(snapshot.activities).toEqual([]);
    expect(repository.progressPersistence().state).toBe('session');
  });

  it('records a real activity with the fixed XP, quest and boss outcomes', async () => {
    const result = await repository.record({
      requestId: 'demo-first',
      skillId: 'calisthenics',
      minutes: 20,
    });
    expect(result.reward).toMatchObject({
      activityXp: 80,
      questXp: 70,
      damage: 160,
      rewardedMinutes: 20,
    });
    expect(result.snapshot.character.totalXp).toBe(26076);
    expect(result.snapshot.boss.hp).toBe(1300);
    expect(result.snapshot.skills.find((skill) => skill.skillId === 'calisthenics')?.totalXp).toBe(
      13893,
    );
    expect(result.snapshot.quests.find((quest) => quest.skillId === 'calisthenics')?.claimed).toBe(
      true,
    );
    expect(result.snapshot.activities).toHaveLength(1);
  });

  it('never rewards the same entry ID twice', async () => {
    const command = { requestId: 'one-entry', skillId: 'calisthenics', minutes: 20 };
    await repository.record(command);
    const repeated = await repository.record(command);
    expect(repeated.reward).toMatchObject({
      activityXp: 0,
      questXp: 0,
      damage: 0,
      duplicate: true,
    });
    expect(repeated.snapshot.character.totalXp).toBe(26076);
    expect(repeated.snapshot.activities).toHaveLength(1);
  });

  it('enforces the daily limit and grants the quest bonus once', async () => {
    await repository.record({ requestId: 'first', skillId: 'calisthenics', minutes: 20 });
    const capped = await repository.record({
      requestId: 'second',
      skillId: 'calisthenics',
      minutes: 180,
    });
    const exhausted = await repository.record({
      requestId: 'third',
      skillId: 'calisthenics',
      minutes: 20,
    });
    expect(capped.reward).toMatchObject({ activityXp: 280, questXp: 0, rewardedMinutes: 70 });
    expect(exhausted.reward).toMatchObject({
      activityXp: 0,
      questXp: 0,
      damage: 0,
      rewardedMinutes: 0,
    });
    expect(exhausted.snapshot.character.totalXp).toBe(26356);
    expect(exhausted.snapshot.activities).toHaveLength(3);
  });

  it('rejects invalid input without altering the example', async () => {
    const before = await repository.load();
    await expect(
      repository.record({ requestId: 'invalid', skillId: 'calisthenics', minutes: -5 }),
    ).rejects.toThrow();
    expect(await repository.load()).toEqual(before);
  });

  it('resets only demo progression and never shares state with a second adapter', async () => {
    await repository.record({ requestId: 'first', skillId: 'calisthenics', minutes: 20 });
    const second = TestBed.runInInjectionContext(() => new PortfolioDemoRepository());
    expect((await second.load()).activities).toEqual([]);
    expect((await second.load()).character.totalXp).toBe(25926);
    const edited = await repository.load();
    await repository.updateCharacter({ name: 'Nova', appearance: edited.character.appearance });
    const reset = await repository.resetDemo();
    expect(reset.activities).toEqual([]);
    expect(reset.character.totalXp).toBe(25926);
    expect(reset.boss.hp).toBe(1460);
    expect(reset.character.name).toBe('Nova');
    expect(reset.character.appearance.illustration).toBe('emerald-knight');
  });

  it('resolves real boss combat and unlocks its first-clear reward and next encounter locally', async () => {
    const before = await repository.load();
    const result = await repository.fightBoss({
      requestId: 'boss-one',
      bossId: 'mosswarden',
      difficulty: 'normal',
      tactic: 'balanced',
    });
    expect(result.replay.mode).toBe('boss');
    expect(result.replay.outcome).toBe('victory');
    expect(result.firstClear).toBe(true);
    expect(result.reward?.id).toBe('moss-crown');
    expect(result.snapshot.bossProgress?.unlockedCosmetics).toContain('moss-crown');
    expect(discoveredBosses(result.snapshot).map((boss) => boss.id)).toEqual([
      'mosswarden',
      'emberwyrm',
    ]);
    expect(result.snapshot.character.totalXp).toBe(before.character.totalXp);
    expect(result.snapshot.boss.hp).toBe(before.boss.hp);
    const retry = await repository.fightBoss({
      requestId: 'boss-one',
      bossId: 'mosswarden',
      difficulty: 'normal',
      tactic: 'balanced',
    });
    expect(retry.duplicate).toBe(true);
    const replay = await repository.fightBoss({
      requestId: 'boss-two',
      bossId: 'mosswarden',
      difficulty: 'normal',
      tactic: 'balanced',
    });
    expect(replay.firstClear).toBe(false);
    expect(replay.reward).toBeNull();
    expect(
      replay.snapshot.bossProgress?.unlockedCosmetics.filter((id) => id === 'moss-crown'),
    ).toHaveLength(1);
  });

  it('keeps undiscovered and over-level encounters locked instead of inventing wins', async () => {
    await expect(
      repository.fightBoss({
        requestId: 'hidden',
        bossId: 'relic-sovereign',
        difficulty: 'normal',
        tactic: 'balanced',
      }),
    ).rejects.toThrow('entdeckten Boss');
    await expect(
      repository.fightBoss({
        requestId: 'level',
        bossId: 'mosswarden',
        difficulty: 'ultimate',
        tactic: 'balanced',
      }),
    ).rejects.toThrow('Level 40');
    expect((await repository.load()).bossProgress?.unlockedCosmetics).toEqual([]);
  });

  it('rebuilds focus quests before play and freezes the current board after an activity', async () => {
    const journey = TestBed.inject(JourneyStore);
    journey.save({
      interestIds: ['knowledge'],
      activeSkillIds: ['reading', 'languages'],
      primaryInterestId: 'knowledge',
    });
    const changed = await repository.load();
    expect(changed.quests.map((quest) => quest.skillId)).toEqual(['reading', 'languages']);
    expect(changed.quests.map((quest) => quest.bonusXp)).toEqual([70, 70]);
    await repository.record({ requestId: 'read', skillId: 'reading', minutes: 15 });
    journey.save({
      interestIds: ['physical'],
      activeSkillIds: ['calisthenics'],
      primaryInterestId: 'physical',
    });
    expect((await repository.load()).quests.map((quest) => quest.skillId)).toEqual([
      'reading',
      'languages',
    ]);
    day = '2026-11-04';
    expect((await repository.load()).quests.map((quest) => quest.skillId)).toEqual([
      'calisthenics',
    ]);
  });

  it('keeps exported snapshots outside the mutable session state', async () => {
    const exported = await repository.load();
    exported.character.totalXp = 999999;
    expect((await repository.load()).character.totalXp).toBe(25926);
  });
});
