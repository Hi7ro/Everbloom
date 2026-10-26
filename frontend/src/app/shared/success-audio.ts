import { inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';

export const AUDIO_CONTEXT_FACTORY = new InjectionToken<() => AudioContext | null>(
  'AUDIO_CONTEXT_FACTORY',
  {
    providedIn: 'root',
    factory: () => () => (typeof AudioContext === 'undefined' ? null : new AudioContext()),
  },
);

export type SuccessCue = 'level' | 'quest' | 'boss' | 'loot';
export const MAX_SUCCESS_VOICES = 6;
type Note = readonly [frequency: number, delay: number, duration: number, volume: number, wave?: OscillatorType];
type Voice = { oscillator: OscillatorNode; envelope: GainNode };

/** Original small motifs: one family, different rhythm/register for each kind of success. */
const MOTIFS: Readonly<Record<SuccessCue, readonly Note[]>> = {
  quest: [[392, .02, .22, .021], [493.88, .12, .22, .018], [783.99, .24, .28, .022]],
  level: [[587.33, .02, .28, .021], [659.25, .14, .28, .018],
    [880, .30, .34, .020], [1174.66, .48, .38, .021]],
  boss: [[293.66, .02, .40, .012, 'triangle'], [440, .02, .48, .009],
    [587.33, .14, .26, .020], [880, .28, .34, .018],
    [1108.73, .42, .30, .015], [1174.66, .60, .42, .022]],
  loot: [[659.25, .02, .28, .017], [987.77, .09, .30, .014],
    [1318.51, .19, .32, .016], [1661.22, .31, .35, .012]],
};

@Injectable({ providedIn: 'root' })
export class SuccessAudio implements OnDestroy {
  private readonly factory = inject(AUDIO_CONTEXT_FACTORY);
  private context: AudioContext | null = null;
  private ready: Promise<void> | null = null;
  private readonly active = new Set<Voice>();
  private generation = 0;
  private destroyed = false;

  /** Must be called directly from a click/submit, before awaiting any game request. */
  prepare() {
    if (this.destroyed) return;
    try {
      if (!this.context || this.context.state === 'closed') this.context = this.factory();
      const context = this.context;
      if (!context) return;
      this.ready =
        context.state === 'suspended' ? context.resume().catch(() => {}) : Promise.resolve();
    } catch {
      this.ready = null;
    }
  }

  play(cue: SuccessCue = 'level') {
    this.stop();
    const generation = this.generation;
    if (this.destroyed || !this.ready) return;
    void this.ready
      .then(() => {
        const context = this.context;
        if (!context || context.state !== 'running' || generation !== this.generation || this.destroyed) return;
        // Synthesized locally; no game samples, music download or background loop.
        for (const [frequency, delay, duration, volume, wave] of MOTIFS[cue]) {
          if (this.active.size >= MAX_SUCCESS_VOICES) break;
          const start = context.currentTime + delay;
          const oscillator = context.createOscillator();
          const envelope = context.createGain();
          const voice = { oscillator, envelope };
          this.active.add(voice);
          oscillator.type = wave ?? 'sine';
          oscillator.frequency.setValueAtTime(frequency, start);
          envelope.gain.setValueAtTime(0.0001, start);
          envelope.gain.exponentialRampToValueAtTime(volume, start + 0.018);
          envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          oscillator.connect(envelope);
          envelope.connect(context.destination);
          oscillator.onended = () => this.release(voice);
          oscillator.start(start);
          oscillator.stop(start + duration + .01);
        }
      })
      .catch(() => {
        if (generation === this.generation) this.stop();
      }); // Audio failure must never reject a successful activity.
  }

  private release(voice: Voice) {
    if (!this.active.delete(voice)) return;
    voice.oscillator.disconnect();
    voice.envelope.disconnect();
  }

  stop() {
    this.generation++;
    for (const voice of this.active) {
      try {
        voice.oscillator.stop();
      } catch {
        /* Already finished. */
      }
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
