import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { SuccessAudio } from '../shared/success-audio';
import { ProgressFeedback, FEEDBACK_PREFERENCES_KEY } from './progress-feedback';

describe('progress feedback lifecycle', () => {
  const audio = { prepare: vi.fn(), play: vi.fn(), stop: vi.fn() };
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ProgressFeedback,
        { provide: BROWSER_STORAGE, useValue: null },
        { provide: SuccessAudio, useValue: audio },
      ],
    });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it('starts silently and expires a grouped notification', () => {
    const feedback = TestBed.inject(ProgressFeedback);
    expect(audio.prepare).not.toHaveBeenCalled();
    expect(audio.play).not.toHaveBeenCalled();
    feedback.prepareAudio();
    expect(audio.prepare).toHaveBeenCalledOnce();
    feedback.celebrate([
      { kind: 'character-level', title: 'Levelaufstieg!', detail: 'Charakter 13' },
      { kind: 'skill-level', title: 'Skill!', detail: 'Calisthenics 10' },
    ]);
    expect(feedback.notice()?.details).toEqual(['Charakter 13', 'Calisthenics 10']);
    expect(audio.play).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(6000);
    expect(feedback.notice()).toBeNull();
  });
  it('keeps a newer achievement when the old expiration time passes', () => {
    const feedback = TestBed.inject(ProgressFeedback);
    feedback.preview();
    vi.advanceTimersByTime(3000);
    feedback.celebrate([{ kind: 'boss-victory', title: 'Boss besiegt', detail: 'Mooswächter' }]);
    vi.advanceTimersByTime(3000);
    expect(feedback.notice()?.title).toBe('Boss besiegt');
    vi.advanceTimersByTime(3000);
    expect(feedback.notice()).toBeNull();
  });
  it('muting stops scheduled audio but preserves text and independent effects', () => {
    const feedback = TestBed.inject(ProgressFeedback);
    feedback.toggleSound();
    feedback.preview();
    expect(audio.prepare).not.toHaveBeenCalled();
    expect(audio.play).not.toHaveBeenCalled();
    expect(feedback.notice()?.preview).toBe(true);
    expect(feedback.effectsEnabled()).toBe(true);
    feedback.toggleEffects();
    expect(feedback.effectsEnabled()).toBe(false);
    expect(feedback.notice()).not.toBeNull();
  });
  it('restores device preferences without playing and tolerates denied storage', () => {
    TestBed.resetTestingModule();
    const storage = {
      getItem: vi.fn(() => JSON.stringify({ sound: false, effects: false, motion: false })),
      setItem: vi.fn(() => {
        throw new Error('Denied');
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: SuccessAudio, useValue: audio },
      ],
    });
    const feedback = TestBed.inject(ProgressFeedback);
    expect(storage.getItem).toHaveBeenCalledWith(FEEDBACK_PREFERENCES_KEY);
    expect(feedback.soundEnabled()).toBe(false);
    expect(feedback.effectsEnabled()).toBe(false);
    expect(feedback.motionEnabled()).toBe(false);
    feedback.toggleMotion();
    expect(feedback.motionEnabled()).toBe(true);
    expect(feedback.soundEnabled()).toBe(false);
    expect(audio.play).not.toHaveBeenCalled();
    expect(() => feedback.toggleSound()).not.toThrow();
    expect(feedback.soundEnabled()).toBe(true);
  });
});
