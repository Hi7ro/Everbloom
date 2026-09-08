import { TestBed } from '@angular/core/testing';
import { GAME_REPOSITORY } from '../data/game.repository';
import { MockGameRepository } from '../data/mock-game.repository';
import { GameStore } from './game.store';
import { ProgressFeedback } from './progress-feedback';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { JourneyStore } from './journey.store';

describe('GameStore with repository boundary', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        GameStore,
        { provide: GAME_REPOSITORY, useClass: MockGameRepository },
        { provide: BROWSER_STORAGE, useValue: null },
      ],
    }),
  );
  it('preserves demo levels and stats and requires sustained XP for attribute growth', async () => {
    const store = TestBed.inject(GameStore);
    await store.load();
    const original = structuredClone(store.snapshot());
    expect(store.level().level).toBe(12);
    expect(store.skills()).toHaveLength(14);
    expect(
      store
        .skills()
        .slice(0, 4)
        .map((s) => s.level),
    ).toEqual([9, 7, 5, 10]);
    expect(
      store
        .skills()
        .slice(4)
        .every((s) => s.level === 1 && s.totalXp === 0),
    ).toBe(true);
    expect(store.attributes().map((a) => a.value)).toEqual([36, 24, 22, 35, 17, 18]);
    const mindfulness = store.attributes().find((a) => a.id === 'mindfulness')!.value;
    expect(await store.record('meditation', 10)).toBe(true);
    expect(store.questsDone()).toBe(1);
    expect(store.attributes().find((a) => a.id === 'mindfulness')!.value).toBe(mindfulness);
    expect(store.message()).toContain('+60 XP');
    await store.record('calisthenics', 60);
    expect(store.attributes().find((a) => a.id === 'strength')!.value).toBe(37);
    await store.reset();
    expect(store.snapshot()).toEqual(original);
  });
  it('preserves state on rejected input and permits retry', async () => {
    const store = TestBed.inject(GameStore);
    await store.load();
    const before = store.snapshot();
    expect(await store.record('meditation', -1)).toBe(false);
    expect(store.snapshot()).toBe(before);
    expect(store.error()).toContain('ganze Minuten');
    expect(store.busy()).toBe(false);
    expect(await store.record('meditation', 10)).toBe(true);
    expect(store.error()).toBe('');
  });
  it('handles transport failure and clears busy for retry', async () => {
    const repository = TestBed.inject(GAME_REPOSITORY);
    const record = vi
      .spyOn(repository, 'record')
      .mockRejectedValueOnce(new Error('Verbindung unterbrochen'));
    const store = TestBed.inject(GameStore);
    await store.load();
    const before = store.snapshot();
    expect(await store.record('running', 10)).toBe(false);
    expect(store.snapshot()).toBe(before);
    expect(store.error()).toBe('Verbindung unterbrochen');
    expect(store.busy()).toBe(false);
    expect(await store.record('running', 10)).toBe(true);
    expect(record).toHaveBeenCalledTimes(2);
  });
  it('blocks concurrent submissions while a request is pending', async () => {
    const repository = TestBed.inject(GAME_REPOSITORY);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const originalRecord = repository.record.bind(repository);
    const record = vi.spyOn(repository, 'record').mockImplementation(async (command) => {
      await gate;
      return originalRecord(command);
    });
    const store = TestBed.inject(GameStore);
    await store.load();
    const first = store.record('running', 10);
    expect(await store.record('running', 10)).toBe(false);
    release();
    expect(await first).toBe(true);
    expect(record).toHaveBeenCalledTimes(1);
  });
  it('celebrates accepted activity milestones, while load, appearance edits and reset stay silent', async () => {
    const store = TestBed.inject(GameStore);
    const feedback = TestBed.inject(ProgressFeedback);
    const celebrate = vi.spyOn(feedback, 'celebrate');
    await store.load();
    expect(celebrate).not.toHaveBeenCalled();
    expect(store.avatarInterest()).toBe('adventurer');
    await store.record('meditation', 10);
    expect(feedback.notice()?.title).toBe('Dein erster Schritt heute!');
    expect(store.avatarInterest()).toBe('meditation');
    celebrate.mockClear();
    await store.updateCharacter({
      name: 'Ari',
      appearance: store.snapshot()!.character.appearance,
    });
    await store.reset();
    expect(celebrate).not.toHaveBeenCalled();
    expect(feedback.notice()).toBeNull();
    expect(store.avatarInterest()).toBe('adventurer');
  });
  it('does not replay a server-marked duplicate reward', async () => {
    const store = TestBed.inject(GameStore);
    const repository = TestBed.inject(GAME_REPOSITORY);
    const feedback = TestBed.inject(ProgressFeedback);
    const celebrate = vi.spyOn(feedback, 'celebrate');
    await store.load();
    const accepted = await repository.record({
      requestId: 'already-applied',
      skillId: 'running',
      minutes: 10,
    });
    vi.spyOn(repository, 'record').mockResolvedValue({
      ...accepted,
      reward: { ...accepted.reward, duplicate: true },
    });
    await store.record('running', 10);
    expect(celebrate).not.toHaveBeenCalled();
  });

  it('changes focus order and primary avatar interest without touching progression or celebrations', async () => {
    const store = TestBed.inject(GameStore);
    const journey = TestBed.inject(JourneyStore);
    const feedback = TestBed.inject(ProgressFeedback);
    const celebrate = vi.spyOn(feedback, 'celebrate');
    expect(journey.configured()).toBe(false);
    expect(store.focusSkills()).toEqual([]);
    expect(store.avatarInterest()).toBe('adventurer');
    await store.load();
    const snapshot = structuredClone(store.snapshot());
    const levels = store.skills().map((skill) => skill.level);
    const attributes = structuredClone(store.attributes());
    expect(store.focusSkills().map((skill) => skill.id)).toEqual([
      'calisthenics',
      'running',
      'meditation',
      'programming',
    ]);
    expect(
      journey.save({
        interestIds: ['mind', 'knowledge'],
        activeSkillIds: ['reading', 'meditation', 'boxing'],
        primaryInterestId: 'mind',
      }),
    ).toBe(true);
    expect(store.focusSkills().map((skill) => skill.id)).toEqual([
      'reading',
      'meditation',
      'boxing',
    ]);
    expect(store.avatarInterest()).toBe('recovery');
    expect(store.snapshot()).toEqual(snapshot);
    expect(store.skills().map((skill) => skill.level)).toEqual(levels);
    expect(store.attributes()).toEqual(attributes);
    expect(celebrate).not.toHaveBeenCalled();
    expect(feedback.notice()).toBeNull();
  });

  it('continues rewarding skills outside the selected focus and retains their earned progress', async () => {
    const store = TestBed.inject(GameStore);
    const journey = TestBed.inject(JourneyStore);
    journey.save({
      interestIds: ['mind'],
      activeSkillIds: ['meditation'],
      primaryInterestId: 'mind',
    });
    await store.load();
    const before = store.snapshot()!;
    expect(await store.record('boxing', 20)).toBe(true);
    expect(store.focusSkills().map((skill) => skill.id)).toEqual(['meditation']);
    expect(store.skills().find((skill) => skill.id === 'boxing')?.totalXp).toBe(60);
    expect(store.snapshot()!.character.totalXp).toBe(before.character.totalXp + 60);
    expect(store.snapshot()!.boss.hp).toBe(before.boss.hp - 120);
    expect(store.snapshot()!.quests).toEqual(before.quests);
    const recorded = structuredClone(store.snapshot());
    const feedback = TestBed.inject(ProgressFeedback);
    const celebrate = vi.spyOn(feedback, 'celebrate');
    journey.save({
      interestIds: ['knowledge'],
      activeSkillIds: ['programming', 'reading'],
      primaryInterestId: 'knowledge',
    });
    expect(store.focusSkills().map((skill) => skill.id)).toEqual(['programming', 'reading']);
    expect(store.snapshot()).toEqual(recorded);
    expect(store.avatarInterest()).toBe('boxing');
    expect(celebrate).not.toHaveBeenCalled();
  });

  it('retains journey preferences across a progress reset and falls back to the primary interest', async () => {
    const store = TestBed.inject(GameStore);
    const journey = TestBed.inject(JourneyStore);
    journey.save({
      interestIds: ['knowledge', 'mind'],
      activeSkillIds: ['reading', 'programming'],
      primaryInterestId: 'knowledge',
    });
    await store.load();
    const initial = structuredClone(store.snapshot());
    const preferences = structuredClone(journey.preferences());
    expect(store.avatarInterest()).toBe('reading');
    await store.record('boxing', 10);
    expect(store.avatarInterest()).toBe('boxing');
    const feedback = TestBed.inject(ProgressFeedback);
    const celebrate = vi.spyOn(feedback, 'celebrate');
    await store.reset();
    expect(store.snapshot()).toEqual(initial);
    expect(journey.preferences()).toEqual(preferences);
    expect(journey.configured()).toBe(true);
    expect(store.focusSkills().map((skill) => skill.id)).toEqual(['reading', 'programming']);
    expect(store.avatarInterest()).toBe('reading');
    expect(celebrate).not.toHaveBeenCalled();
    expect(feedback.notice()).toBeNull();
  });
});
