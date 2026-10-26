import { inject, Injectable, OnDestroy } from '@angular/core';
import type { BattleTurn } from '../domain/auto-battle';
import type { HeroAttackStyle } from '../domain/combat-visual-profile';
import { AUDIO_CONTEXT_FACTORY } from './success-audio';

type SoundStyle = HeroAttackStyle | 'roots' | 'fire' | 'shadow' | 'bloodmoon' | 'stars' | 'ice' | 'cloud' | 'void' | 'dragon' | 'relic' | 'renewal';
type Voice = { oscillator: OscillatorNode; envelope: GainNode };
export const MAX_BATTLE_VOICES = 4;
const COLORS: Readonly<Record<SoundStyle, readonly [number, number, OscillatorType]>> = {
  martial: [240, 105, 'triangle'], strength: [160, 70, 'triangle'],
  endurance: [510, 290, 'sine'], arcane: [660, 990, 'sine'],
  roots: [190, 90, 'triangle'], fire: [300, 95, 'sawtooth'],
  shadow: [330, 82, 'triangle'],
  void: [145, 48, 'sine'], dragon: [440, 110, 'sawtooth'], relic: [1046, 523, 'triangle'],
  bloodmoon: [554, 277, 'sine'],
  stars: [740, 1110, 'sine'], ice: [880, 1320, 'sine'],
  cloud: [390, 195, 'triangle'], renewal: [440, 660, 'sine'],
};
const BOSSES: Readonly<Record<string, SoundStyle>> = {
  'void-devourer': 'void', 'primordial-dragon': 'dragon', 'relic-sovereign': 'relic',
  mosswarden: 'roots', emberwyrm: 'fire', 'dusk-prowler': 'shadow', 'astral-sovereign': 'stars',
  'frost-titan': 'ice', 'cloud-sovereign': 'cloud', 'bloodmoon-regent': 'bloodmoon',
};

/** Presentation only. A defensive/charging action never gets a damage sound. */
export function battleSoundCue(turn: Pick<BattleTurn, 'actor' | 'damage' | 'healing' | 'abilityId'>,
  heroStyle: HeroAttackStyle, bossId: string): { style: SoundStyle; kind: 'hit' | 'prepare' | 'heal' } {
  if (turn.healing > 0 && turn.damage === 0) return { style: 'renewal', kind: 'heal' };
  if (turn.actor === 'hero') return { style: heroStyle, kind: turn.damage > 0 ? 'hit' : 'prepare' };
  const ability = turn.abilityId ?? '';
  const style: SoundStyle = /^(root|bark)-/.test(ability) ? 'roots'
    : /^ember-/.test(ability) ? 'fire' : /^(astral-|star)/.test(ability) ? 'stars'
    : /^dusk-/.test(ability) ? 'shadow' : /^frost-/.test(ability) ? 'ice' : /^(cloud|solar|staff)-/.test(ability) ? 'cloud'
    : /^(ruby|bloodmoon|lunar)-/.test(ability) ? 'bloodmoon'
    : BOSSES[bossId] ?? 'roots';
  return { style, kind: turn.damage > 0 ? 'hit' : 'prepare' };
}

/** Original procedural effects; one lazy context, no downloads or game samples. */
@Injectable({ providedIn: 'root' })
export class BattleAudio implements OnDestroy {
  private readonly factory = inject(AUDIO_CONTEXT_FACTORY);
  private context: AudioContext | null = null;
  private ready: Promise<void> | null = null;
  private readonly active = new Set<Voice>();
  private generation = 0;
  private destroyed = false;

  /** Call from the control's user gesture, before any asynchronous game request. */
  prepare() {
    if (this.destroyed) return;
    try {
      if (!this.context || this.context.state === 'closed') this.context = this.factory();
      const context = this.context;
      if (!context) return;
      this.ready = context.state === 'suspended' ? context.resume().catch(() => {}) : Promise.resolve();
    } catch { this.ready = null; }
  }

  playTurn(turn: BattleTurn, heroStyle: HeroAttackStyle, bossId: string, speed: 1 | 2 = 1) {
    this.stop();
    if (this.destroyed || !this.ready) return;
    const generation = this.generation;
    const cue = battleSoundCue(turn, heroStyle, bossId);
    void this.ready.then(() => {
      const context = this.context;
      if (!context || context.state !== 'running' || generation !== this.generation || this.destroyed) return;
      const [start, end, wave] = COLORS[cue.style];
      // Visual effects retain their 330 ms impact at both replay speeds.
      const impact = .33;
      const scale = 1 / speed;
      if (cue.kind === 'heal') {
        this.note(start, start, 'sine', .01, .20 * scale, .015);
        this.note(end, end, 'sine', .13 * scale, .24 * scale, .017);
      } else if (cue.kind === 'prepare') {
        this.note(start * .5, start, 'sine', .01, .40 * scale, .018);
        this.note(start, start * 1.5, 'sine', .10 * scale, .31 * scale, .009);
      } else {
        this.note(start * .55, start, 'sine', .01, .15 * scale, .008);
        this.note(start, end, wave, impact, .20 * scale, wave === 'sawtooth' ? .013 : .024);
        this.note(end * 2, end * 1.5, 'sine', impact + .025 * scale, .17 * scale, .009);
        if (turn.critical) this.note(end * 3, end * 3, 'sine', impact + .04 * scale, .19 * scale, .008);
      }
    }).catch(() => {
      if (generation === this.generation) this.stop();
    }); // Playback must survive unavailable audio hardware.
  }

  private note(from: number, to: number, type: OscillatorType, delay: number, duration: number, volume: number) {
    const context = this.context;
    if (!context || this.active.size >= MAX_BATTLE_VOICES) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const voice = { oscillator, envelope };
    this.active.add(voice);
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration * .8);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(volume, start + .012);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(context.destination);
    oscillator.onended = () => this.release(voice);
    oscillator.start(start);
    oscillator.stop(start + duration + .01);
  }

  private release(voice: Voice) {
    if (!this.active.delete(voice)) return;
    voice.oscillator.disconnect();
    voice.envelope.disconnect();
  }

  stop() {
    this.generation++;
    for (const voice of this.active) {
      try { voice.oscillator.stop(); } catch { /* It may already have finished. */ }
      this.release(voice);
    }
  }

  ngOnDestroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stop();
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {});
  }
}
