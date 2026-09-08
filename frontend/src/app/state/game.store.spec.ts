import { TestBed } from '@angular/core/testing';
import { GAME_REPOSITORY, GameRepository } from '../data/game.repository';
import { MockGameRepository } from '../data/mock-game.repository';
import { GameStore } from './game.store';

describe('GameStore with repository boundary', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [GameStore, { provide: GAME_REPOSITORY, useClass: MockGameRepository }],
    }),
  );
  it('preserves demo levels and stats and requires sustained XP for attribute growth', async () => {
    const store = TestBed.inject(GameStore);
    await store.load();
    const original = structuredClone(store.snapshot());
    expect(store.level().level).toBe(12);
    expect(store.skills().map((s) => s.level)).toEqual([9, 7, 5, 10]);
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
    TestBed.resetTestingModule();
    const repository = new MockGameRepository();
    const record = vi
      .spyOn(repository, 'record')
      .mockRejectedValueOnce(new Error('Verbindung unterbrochen'));
    TestBed.configureTestingModule({
      providers: [GameStore, { provide: GAME_REPOSITORY, useValue: repository }],
    });
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
    TestBed.resetTestingModule();
    const repository = new MockGameRepository();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const record = vi.fn(async (command: Parameters<GameRepository['record']>[0]) => {
      await gate;
      return repository.record(command);
    });
    TestBed.configureTestingModule({
      providers: [
        GameStore,
        {
          provide: GAME_REPOSITORY,
          useValue: {
            load: () => repository.load(),
            resetDemo: () => repository.resetDemo(),
            record,
          },
        },
      ],
    });
    const store = TestBed.inject(GameStore);
    await store.load();
    const first = store.record('running', 10);
    expect(await store.record('running', 10)).toBe(false);
    release();
    expect(await first).toBe(true);
    expect(record).toHaveBeenCalledTimes(1);
  });
});
