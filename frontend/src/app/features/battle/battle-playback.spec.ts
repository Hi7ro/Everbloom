import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { createMockSnapshot } from '../../data/mock-data';
import { createBossBattle } from '../../domain/auto-battle';
import { BattlePlayback } from './battle-playback';
import { BattleAudio } from '../../shared/battle-audio';
import { ProgressFeedback } from '../../state/progress-feedback';
import { deriveCombatVisualProfile } from '../../domain/combat-visual-profile';

describe('practice battle playback', () => {
  let playback: BattlePlayback;
  let sound: ReturnType<typeof signal<boolean>>;
  let audio: { prepare: ReturnType<typeof vi.fn>; playTurn: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    vi.useFakeTimers();
    sound = signal(true);
    audio = { prepare: vi.fn(), playTurn: vi.fn(), stop: vi.fn() };
    TestBed.configureTestingModule({ providers: [BattlePlayback,
      { provide: BattleAudio, useValue: audio },
      { provide: ProgressFeedback, useValue: { soundEnabled: sound.asReadonly() } },
    ] });
    playback = TestBed.inject(BattlePlayback);
    playback.prepare(createMockSnapshot());
    TestBed.tick();
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

  it('loads an independent server replay, cancels its predecessor, and resets all owner data', () => {
    playback.play();
    const snapshot = createMockSnapshot();
    const replay = createBossBattle(snapshot, { bossId: 'mosswarden' });
    playback.loadReplay(replay, snapshot.character.appearance);
    expect(playback.playing()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(playback.replay()).toEqual(replay);
    expect(playback.replay()).not.toBe(replay);
    expect(playback.appearance()).not.toBe(snapshot.character.appearance);
    playback.play();
    playback.reset();
    vi.runAllTimers();
    expect(playback.replay()).toBeNull();
    expect(playback.appearance()).toBeNull();
    expect(playback.cursor()).toBe(0);
    expect(playback.complete()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cleans playback when leaving the page', () => {
    playback.play();
    playback.ngOnDestroy();
    playback.play();
    vi.runAllTimers();
    expect(playback.cursor()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('prepares only after play/step controls and plays each newly shown turn once', () => {
    expect(audio.prepare).not.toHaveBeenCalled();
    expect(audio.playTurn).not.toHaveBeenCalled();
    playback.play(); playback.play();
    expect(audio.prepare).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1250);
    expect(audio.playTurn).toHaveBeenCalledTimes(1);
    expect(audio.playTurn.mock.calls[0][0]).toEqual(playback.current());
    playback.step();
    expect(audio.playTurn).toHaveBeenCalledTimes(2);
    expect(audio.prepare).toHaveBeenCalledTimes(2);
    playback.skip();
    expect(audio.playTurn).toHaveBeenCalledTimes(2);
  });

  it('keeps load, skip, mute and historical turns silent', () => {
    sound.set(false);
    playback.play();
    vi.advanceTimersByTime(1250);
    expect(audio.prepare).not.toHaveBeenCalled();
    expect(audio.playTurn).not.toHaveBeenCalled();
    sound.set(true);
    playback.step();
    expect(audio.playTurn).toHaveBeenCalledTimes(1);
    expect(audio.playTurn.mock.calls[0][0].index).toBe(playback.replay()!.turns[1].index);
    const previousCalls = audio.stop.mock.calls.length;
    sound.set(false);
    TestBed.tick();
    expect(audio.stop.mock.calls.length).toBeGreaterThan(previousCalls);
    playback.skip();
    playback.loadReplay(playback.replay()!, playback.appearance()!);
    expect(audio.playTurn).toHaveBeenCalledTimes(1);
  });

  it('uses the supplied earned profile and cues consecutive turns by index rather than pose', () => {
    const snapshot = createMockSnapshot();
    const original = createBossBattle(snapshot, { bossId: 'mosswarden' });
    const repeated = { ...original, turns: [original.turns[0], { ...original.turns[0], index: 2 }] };
    const profile = { ...deriveCombatVisualProfile(snapshot), style: 'arcane' as const };
    playback.loadReplay(repeated, snapshot.character.appearance, profile);
    playback.step(); playback.step();
    expect(audio.playTurn).toHaveBeenCalledTimes(2);
    expect(audio.playTurn.mock.calls.map(call => [call[0].index, call[1], call[2]])).toEqual([
      [original.turns[0].index, 'arcane', 'mosswarden'], [2, 'arcane', 'mosswarden'],
    ]);
  });

  it('allows the final short cue to finish naturally while explicit pause still cancels it', () => {
    playback.play();
    const stops = audio.stop.mock.calls.length;
    vi.runAllTimers();
    expect(audio.playTurn).toHaveBeenCalledTimes(playback.replay()!.turns.length);
    expect(audio.stop).toHaveBeenCalledTimes(stops);
    playback.pause();
    expect(audio.stop).toHaveBeenCalledTimes(stops + 1);
  });

  it('holds the final damaging turn for 600ms before showing the result', () => {
    const snapshot = createMockSnapshot();
    const replay = createBossBattle(snapshot, { bossId: 'mosswarden' });
    playback.loadReplay({ ...replay, turns: [replay.turns[0]] }, snapshot.character.appearance);
    playback.play();
    vi.advanceTimersByTime(1250);
    expect(playback.cursor()).toBe(1);
    expect(playback.settling()).toBe(true);
    expect(playback.playing()).toBe(true);
    expect(playback.complete()).toBe(false);
    vi.advanceTimersByTime(599);
    expect(playback.complete()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(playback.complete()).toBe(true);
    expect(playback.settling()).toBe(false);
    expect(playback.playing()).toBe(false);
    expect(audio.playTurn).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('presents the final manual step, pauses that window, and resumes without repeating damage/audio', () => {
    const snapshot = createMockSnapshot();
    const replay = createBossBattle(snapshot, { bossId: 'mosswarden' });
    playback.loadReplay({ ...replay, turns: [replay.turns[0]] }, snapshot.character.appearance);
    playback.step();
    expect(playback.settling()).toBe(true);
    expect(playback.playing()).toBe(false);
    playback.pause();
    expect(playback.settling()).toBe(false);
    vi.advanceTimersByTime(10_000);
    expect(playback.complete()).toBe(false);
    playback.play();
    expect(playback.settling()).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(600);
    expect(playback.complete()).toBe(true);
    expect(audio.playTurn).toHaveBeenCalledTimes(1);
  });

  it('skips or replaces a pending final presentation without leaving a delayed callback', () => {
    const snapshot = createMockSnapshot();
    const replay = createBossBattle(snapshot, { bossId: 'mosswarden' });
    playback.loadReplay({ ...replay, turns: [replay.turns[0]] }, snapshot.character.appearance);
    playback.step();
    playback.skip();
    expect(playback.complete()).toBe(true);
    expect(playback.settling()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    playback.play();
    vi.advanceTimersByTime(1250);
    playback.prepare(snapshot);
    vi.advanceTimersByTime(600);
    expect(playback.cursor()).toBe(0);
    expect(playback.complete()).toBe(false);
    expect(playback.settling()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
