import { TestBed } from '@angular/core/testing';
import { createMockSnapshot } from '../../data/mock-data';
import { BattlePlayback } from './battle-playback';

describe('practice battle playback', () => {
  let playback: BattlePlayback;
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [BattlePlayback] });
    playback = TestBed.inject(BattlePlayback);
    playback.prepare(createMockSnapshot());
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.useRealTimers(); });

  it('plays each turn once even after repeated play clicks and freezes during pause', () => {
    playback.play(); playback.play(); playback.play();
    vi.advanceTimersByTime(1250);
    expect(playback.cursor()).toBe(1);
    expect(playback.health().bossHp).toBeLessThan(560);
    playback.pause();
    const health = playback.health();
    vi.advanceTimersByTime(20_000);
    expect(playback.cursor()).toBe(1);
    expect(playback.health()).toEqual(health);
    playback.play();
    vi.advanceTimersByTime(1250);
    expect(playback.cursor()).toBe(2);
  });

  it('finishes without a remaining timer and can replay the same result', () => {
    playback.play();
    vi.runAllTimers();
    expect(playback.complete()).toBe(true);
    expect(playback.playing()).toBe(false);
    expect(playback.health().bossHp).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    const health = playback.health();
    playback.play();
    expect(playback.cursor()).toBe(0);
    vi.runAllTimers();
    expect(playback.health()).toEqual(health);
  });

  it('changing speed never stacks timers or skips turns', () => {
    playback.play();
    playback.toggleSpeed();
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(625);
    expect(playback.cursor()).toBe(1);
    playback.toggleSpeed();
    vi.advanceTimersByTime(1249);
    expect(playback.cursor()).toBe(1);
    vi.advanceTimersByTime(1);
    expect(playback.cursor()).toBe(2);
  });

  it('skipping and stepping award nothing and preserve the complete original snapshot', () => {
    const snapshot = createMockSnapshot();
    const original = structuredClone(snapshot);
    playback.prepare(snapshot);
    playback.step();
    expect(playback.cursor()).toBe(1);
    playback.play();
    playback.skip();
    playback.step();
    vi.runAllTimers();
    expect(playback.cursor()).toBe(playback.replay()!.turns.length);
    expect(playback.replay()!.rewards).toEqual({ xp: 0, loot: [] });
    expect(snapshot).toEqual(original);
  });

  it('keeps the starting appearance independent from later profile edits', () => {
    const snapshot = createMockSnapshot();
    playback.prepare(snapshot);
    snapshot.character.appearance.outfitSet = 'forest-scout';
    expect(playback.appearance()?.outfitSet).not.toBe('forest-scout');
  });

  it('pauses on hidden tabs and never automatically resumes', () => {
    const hidden = vi.spyOn(document, 'hidden', 'get');
    playback.play();
    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(10_000);
    expect(playback.cursor()).toBe(0);
    expect(playback.playing()).toBe(false);
    playback.play();
    expect(playback.playing()).toBe(false);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(playback.playing()).toBe(false);
    hidden.mockRestore();
  });

  it('cleans playback when leaving the page', () => {
    playback.play();
    playback.ngOnDestroy();
    playback.play();
    vi.runAllTimers();
    expect(playback.cursor()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
