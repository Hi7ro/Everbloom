import { inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';

export const AUDIO_CONTEXT_FACTORY = new InjectionToken<() => AudioContext | null>(
  'AUDIO_CONTEXT_FACTORY',
  {
    providedIn: 'root',
    factory: () => () => (typeof AudioContext === 'undefined' ? null : new AudioContext()),
  },
);

@Injectable({ providedIn: 'root' })
export class SuccessAudio implements OnDestroy {
  private readonly factory = inject(AUDIO_CONTEXT_FACTORY);
  private context: AudioContext | null = null;
  private ready: Promise<void> | null = null;
  private readonly active = new Set<OscillatorNode>();
  private generation = 0;

  /** Must be called directly from a click/submit, before awaiting any game request. */
  prepare() {
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

  play() {
    this.stop();
    const generation = this.generation;
    if (!this.ready) return;
    void this.ready
      .then(() => {
        const context = this.context;
        if (!context || context.state !== 'running' || generation !== this.generation) return;
        // Original short ascending chime, synthesized locally; no game audio samples.
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((frequency, index) => {
          const start = context.currentTime + 0.02 + index * 0.16;
          const oscillator = context.createOscillator();
          const envelope = context.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, start);
          envelope.gain.setValueAtTime(0.0001, start);
          envelope.gain.exponentialRampToValueAtTime(0.045, start + 0.02);
          envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
          oscillator.connect(envelope);
          envelope.connect(context.destination);
          this.active.add(oscillator);
          oscillator.onended = () => {
            oscillator.disconnect();
            envelope.disconnect();
            this.active.delete(oscillator);
          };
          oscillator.start(start);
          oscillator.stop(start + 0.7);
        });
      })
      .catch(() => {}); // Audio failure must never reject a successful activity.
  }

  stop() {
    this.generation++;
    for (const oscillator of this.active) {
      try {
        oscillator.stop();
      } catch {
        /* Already finished. */
      }
    }
    this.active.clear();
  }

  ngOnDestroy() {
    this.stop();
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {});
  }
}
