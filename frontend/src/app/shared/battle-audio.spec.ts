import { TestBed } from '@angular/core/testing';
import type { BattleTurn } from '../domain/auto-battle';
import { AUDIO_CONTEXT_FACTORY } from './success-audio';
import { BattleAudio, battleSoundCue, MAX_BATTLE_VOICES } from './battle-audio';

const turn = (patch: Partial<BattleTurn> = {}): BattleTurn => ({
  index: 1, round: 1, actor: 'hero', action: 'strike', label: 'Treffer',
  damage: 24, healing: 0, critical: false, heroHp: 100, bossHp: 80,
  bossPhase: 'awakening', ...patch,
});
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

function hardware(initialState = 'running') {
  const nodes: Array<ReturnType<typeof makeOscillator>> = [];
  function makeOscillator() {
    return {
      type: '', frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(),
      onended: null as (() => void) | null,
    };
  }
  const context = {
    state: initialState, currentTime: 10, destination: {},
    resume: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => { const node = makeOscillator(); nodes.push(node); return node; }),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(), disconnect: vi.fn(),
    })),
  };
  const factory = vi.fn(() => context);
  TestBed.configureTestingModule({ providers: [{ provide: AUDIO_CONTEXT_FACTORY, useValue: factory }] });
  return { context, nodes, factory, audio: TestBed.inject(BattleAudio) };
}

describe('original battle audio', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('stays silent before a gesture and reuses one context across later gestures', async () => {
    const { audio, factory, nodes } = hardware();
    audio.playTurn(turn(), 'strength', 'mosswarden');
    await flush();
    expect(factory).not.toHaveBeenCalled();
    expect(nodes).toHaveLength(0);
    audio.prepare(); audio.prepare();
    audio.playTurn(turn(), 'strength', 'mosswarden');
    await flush();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(nodes).toHaveLength(3);
  });

  it('puts the impact at the visible 330ms moment with bounded short voices at both speeds', async () => {
    const { audio, nodes } = hardware();
    audio.prepare();
    audio.playTurn(turn(), 'strength', 'mosswarden');
    await flush();
    expect(nodes[1].start).toHaveBeenCalledWith(10.33);
    expect(nodes[1].frequency.setValueAtTime).toHaveBeenCalledWith(160, 10.33);
    expect(nodes[1].frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(70, 10.49);
    audio.playTurn(turn({ index: 2 }), 'strength', 'mosswarden', 2);
    await flush();
    expect(nodes[4].start).toHaveBeenCalledWith(10.33);
    expect(nodes[4].stop.mock.calls[0][0]).toBeLessThan(10.625);
    expect(nodes.slice(0, 3).every(node => node.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('chooses each boss family and gives ability metadata priority over its fallback', () => {
    for (const [boss, style] of [['mosswarden', 'roots'], ['emberwyrm', 'fire'],
      ['dusk-prowler', 'shadow'], ['bloodmoon-regent', 'bloodmoon'], ['astral-sovereign', 'stars'], ['frost-titan', 'ice'], ['cloud-sovereign', 'cloud']]) {
      expect(battleSoundCue(turn({ actor: 'boss' }), 'martial', boss)).toEqual({ style, kind: 'hit' });
    }
    expect(battleSoundCue(turn({ actor: 'boss', abilityId: 'solar-strike' }), 'arcane', 'mosswarden'))
      .toEqual({ style: 'cloud', kind: 'hit' });
    expect(battleSoundCue(turn({ actor: 'hero' }), 'endurance', 'emberwyrm'))
      .toEqual({ style: 'endurance', kind: 'hit' });
    expect(battleSoundCue(turn({ actor: 'boss', abilityId: 'dusk-guard', damage: 0 }), 'martial', 'mosswarden'))
      .toEqual({ style: 'shadow', kind: 'prepare' });
    expect(battleSoundCue(turn({ actor: 'boss', abilityId: 'lunar-eclipse', damage: 176, healing: 28 }), 'martial', 'mosswarden'))
      .toEqual({ style: 'bloodmoon', kind: 'hit' });
  });

  it('separates guard/charge and recovery cues from a damaging hit', async () => {
    const { audio, nodes } = hardware();
    audio.prepare();
    audio.playTurn(turn({ actor: 'boss', abilityId: 'bark-guard', damage: 0 }), 'martial', 'mosswarden');
    await flush();
    expect(nodes).toHaveLength(2);
    expect(nodes[0].frequency.setValueAtTime).toHaveBeenCalledWith(95, 10.01);
    expect(battleSoundCue(turn({ damage: 0, healing: 15 }), 'strength', 'mosswarden'))
      .toEqual({ style: 'renewal', kind: 'heal' });
    audio.playTurn(turn({ damage: 0, healing: 15 }), 'strength', 'mosswarden');
    await flush();
    expect(nodes).toHaveLength(4);
    expect(nodes[2].frequency.setValueAtTime).toHaveBeenCalledWith(440, 10.01);
  });

  it('caps critical-hit voices and stops old and scheduled voices before a new turn', async () => {
    const { audio, nodes } = hardware();
    audio.prepare();
    audio.playTurn(turn({ critical: true }), 'arcane', 'mosswarden');
    await flush();
    expect(nodes).toHaveLength(MAX_BATTLE_VOICES);
    audio.playTurn(turn({ index: 2 }), 'martial', 'mosswarden');
    audio.playTurn(turn({ index: 3 }), 'martial', 'mosswarden');
    await flush();
    expect(nodes).toHaveLength(7); // Superseded pending turn never creates nodes.
    expect(nodes.slice(0, 4).every(node => node.stop.mock.calls.length === 2)).toBe(true);
    audio.stop();
    expect(nodes.every(node => node.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('cannot play a late cue after stop while the audio context is still resuming', async () => {
    const { audio, context, nodes } = hardware('suspended');
    let resume!: () => void;
    context.resume.mockImplementation(() => new Promise<void>(resolve => { resume = resolve; }));
    audio.prepare();
    audio.playTurn(turn(), 'strength', 'mosswarden');
    audio.stop();
    context.state = 'running';
    resume();
    await flush();
    expect(nodes).toHaveLength(0);
  });

  it('survives rejected autoplay and unsupported audio without touching game playback', async () => {
    const { audio, context, nodes } = hardware('suspended');
    context.resume.mockRejectedValue(new Error('Autoplay blocked'));
    audio.prepare();
    audio.playTurn(turn(), 'strength', 'mosswarden');
    await flush();
    expect(nodes).toHaveLength(0);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: AUDIO_CONTEXT_FACTORY, useValue: () => null }] });
    const unsupported = TestBed.inject(BattleAudio);
    expect(() => { unsupported.prepare(); unsupported.playTurn(turn(), 'arcane', 'mosswarden'); }).not.toThrow();
  });

  it('disconnects ended nodes, closes on destroy, and never reopens after destruction', async () => {
    const { audio, context, nodes, factory } = hardware();
    audio.prepare();
    audio.playTurn(turn(), 'endurance', 'mosswarden');
    await flush();
    nodes[0].onended?.();
    audio.ngOnDestroy();
    audio.prepare();
    audio.playTurn(turn(), 'strength', 'mosswarden');
    await flush();
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(nodes).toHaveLength(3);
    expect(nodes.every(node => node.disconnect.mock.calls.length === 1)).toBe(true);
  });
});
