import { TestBed } from '@angular/core/testing';
import { AUDIO_CONTEXT_FACTORY, MAX_SUCCESS_VOICES, SuccessAudio } from './success-audio';

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

function motifHardware(state = 'running') {
  const nodes: Array<ReturnType<typeof oscillator>> = [];
  const gains: Array<ReturnType<typeof gain>> = [];
  function oscillator() {
    return { type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn(),
      start: vi.fn(), stop: vi.fn(), onended: null as (() => void) | null };
  }
  function gain() {
    return { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(), disconnect: vi.fn() };
  }
  const context = {
    state, currentTime: 10, destination: {}, resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => { const node = oscillator(); nodes.push(node); return node; }),
    createGain: vi.fn(() => { const node = gain(); gains.push(node); return node; }),
  };
  const factory = vi.fn(() => context);
  TestBed.configureTestingModule({ providers: [{ provide: AUDIO_CONTEXT_FACTORY, useValue: factory }] });
  return { audio: TestBed.inject(SuccessAudio), context, factory, nodes, gains };
}

describe('distinct success motifs', () => {
  afterEach(() => TestBed.resetTestingModule());

  it.each([
    ['quest', 3, 392, 'sine'], ['level', 4, 587.33, 'sine'],
    ['boss', 6, 293.66, 'triangle'], ['loot', 4, 659.25, 'sine'],
  ] as const)('plays a short bounded %s motif with its own register', async (cue, count, first, wave) => {
    const { audio, nodes, gains } = motifHardware();
    audio.prepare();
    audio.play(cue);
    await Promise.resolve();
    expect(nodes).toHaveLength(count);
    expect(nodes.length).toBeLessThanOrEqual(MAX_SUCCESS_VOICES);
    expect(nodes[0].frequency.setValueAtTime).toHaveBeenCalledWith(first, 10.02);
    expect(nodes[0].type).toBe(wave);
    expect(Math.max(...nodes.map(node => node.stop.mock.calls[0][0]))).toBeLessThanOrEqual(11.1);
    expect(gains.every(node => node.gain.exponentialRampToValueAtTime.mock.calls[0][0] <= .025)).toBe(true);
  });

  it('replaces an active fanfare and supersedes pending ones without stacking voices', async () => {
    const { audio, nodes, gains } = motifHardware();
    audio.prepare();
    audio.play('boss');
    await Promise.resolve();
    audio.play('level');
    audio.play('quest');
    await Promise.resolve();
    expect(nodes).toHaveLength(9); // Six stopped boss voices plus only the latest three.
    expect(nodes.slice(0, 6).every(node => node.stop.mock.calls.length === 2)).toBe(true);
    expect(nodes.slice(0, 6).every(node => node.disconnect.mock.calls.length === 1)).toBe(true);
    audio.stop();
    expect(nodes.every(node => node.disconnect.mock.calls.length === 1)).toBe(true);
    expect(gains.every(node => node.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('cannot resume a dismissed sound after delayed audio permission completes', async () => {
    const { audio, context, nodes } = motifHardware('suspended');
    let resolve!: () => void;
    context.resume.mockImplementation(() => new Promise<void>(done => { resolve = done; }));
    audio.prepare();
    audio.play('loot');
    audio.stop();
    context.state = 'running';
    resolve();
    await Promise.resolve(); await Promise.resolve();
    expect(nodes).toHaveLength(0);
  });

  it('releases naturally ended voices and closes a single context once on destruction', async () => {
    const { audio, nodes, context, factory } = motifHardware();
    audio.prepare(); audio.prepare();
    audio.play();
    await Promise.resolve();
    nodes[0].onended?.();
    audio.ngOnDestroy(); audio.ngOnDestroy();
    audio.prepare(); audio.play('boss');
    await Promise.resolve();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(nodes).toHaveLength(4);
    expect(nodes.every(node => node.disconnect.mock.calls.length === 1)).toBe(true);
  });
});
