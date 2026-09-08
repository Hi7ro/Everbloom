import { TestBed } from '@angular/core/testing';
import { AUDIO_CONTEXT_FACTORY, SuccessAudio } from './success-audio';

describe('success audio browser boundary', () => {
  it('creates audio only after a user gesture, schedules an original chime and stops it', async () => {
    const oscillators: Array<{ start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }> =
      [];
    const context = {
      state: 'running',
      currentTime: 0,
      destination: {},
      close: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => {
        const node = {
          type: '',
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          disconnect: vi.fn(),
          onended: null,
          start: vi.fn(),
          stop: vi.fn(),
        };
        oscillators.push(node);
        return node;
      }),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
    };
    const factory = vi.fn(() => context);
    TestBed.configureTestingModule({
      providers: [{ provide: AUDIO_CONTEXT_FACTORY, useValue: factory }],
    });
    const audio = TestBed.inject(SuccessAudio);
    audio.play();
    expect(factory).not.toHaveBeenCalled();
    audio.prepare();
    audio.play();
    await Promise.resolve();
    expect(oscillators).toHaveLength(4);
    expect(oscillators.every((o) => o.start.mock.calls.length === 1)).toBe(true);
    audio.stop();
    expect(oscillators.every((o) => o.stop.mock.calls.length === 2)).toBe(true);
  });
  it('handles unsupported audio and rejected autoplay without unhandled errors', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: AUDIO_CONTEXT_FACTORY, useValue: () => null }],
    });
    const audio = TestBed.inject(SuccessAudio);
    expect(() => {
      audio.prepare();
      audio.play();
    }).not.toThrow();
    TestBed.resetTestingModule();
    const context = {
      state: 'suspended',
      resume: vi.fn().mockRejectedValue(new Error('Blocked')),
      close: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: AUDIO_CONTEXT_FACTORY, useValue: () => context }],
    });
    const blocked = TestBed.inject(SuccessAudio);
    blocked.prepare();
    blocked.play();
    await Promise.resolve();
    await Promise.resolve();
    expect(context.createOscillator).not.toHaveBeenCalled();
  });
});
