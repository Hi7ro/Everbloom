import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Milestone } from '../domain/milestones';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { SuccessAudio, SuccessCue } from '../shared/success-audio';

const MILESTONE_SOUND: Readonly<Record<Milestone['kind'], SuccessCue>> = {
  'character-level': 'level', 'skill-level': 'level', 'first-activity': 'quest',
  'daily-quests': 'quest', 'boss-victory': 'boss', 'aura-unlock': 'loot',
};

export interface Celebration {
  id: number;
  title: string;
  details: string[];
  preview: boolean;
}
export const FEEDBACK_PREFERENCES_KEY = 'everbloom.feedback.v1';

@Injectable({ providedIn: 'root' })
export class ProgressFeedback implements OnDestroy {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly audio = inject(SuccessAudio);
  private readonly preferences = this.readPreferences();
  private readonly soundState = signal(this.preferences.sound);
  private readonly effectsState = signal(this.preferences.effects);
  private readonly motionState = signal(this.preferences.motion);
  private readonly noticeState = signal<Celebration | null>(null);
  readonly soundEnabled = this.soundState.asReadonly();
  readonly effectsEnabled = this.effectsState.asReadonly();
  readonly motionEnabled = this.motionState.asReadonly();
  readonly notice = this.noticeState.asReadonly();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private nextId = 0;

  prepareAudio() {
    if (this.soundEnabled()) this.audio.prepare();
  }

  rewardCue() {
    if (this.soundEnabled()) this.audio.play('loot');
  }

  celebrate(milestones: Milestone[], preview = false) {
    if (!milestones.length) return;
    this.dismiss();
    const main =
      milestones.find((m) => m.kind === 'boss-victory') ??
      milestones.find((m) => m.kind === 'character-level') ??
      milestones[0];
    this.noticeState.set({
      id: ++this.nextId,
      title: preview ? 'Dein Erfolgsmoment' : main.title,
      details: preview
        ? ['Effekt-Vorschau · deine XP bleiben unverändert.']
        : milestones.map((m) => m.detail),
      preview,
    });
    if (this.soundEnabled()) this.audio.play(MILESTONE_SOUND[main.kind]);
    this.timer = setTimeout(() => this.dismiss(), 6000);
  }

  preview() {
    this.prepareAudio();
    this.celebrate([{ kind: 'character-level', title: '', detail: '' }], true);
  }

  toggleSound() {
    this.soundState.update((value) => !value);
    if (!this.soundEnabled()) this.audio.stop();
    this.savePreferences();
  }
  toggleEffects() {
    this.effectsState.update((value) => !value);
    this.savePreferences();
  }

  toggleMotion() {
    this.motionState.update((value) => !value);
    this.savePreferences();
  }

  dismiss() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    this.noticeState.set(null);
    this.audio.stop();
  }
  ngOnDestroy() {
    this.dismiss();
  }

  private readPreferences(): { sound: boolean; effects: boolean; motion: boolean } {
    try {
      const raw = this.storage?.getItem(FEEDBACK_PREFERENCES_KEY);
      const value = raw ? JSON.parse(raw) : null;
      return {
        sound: typeof value?.sound === 'boolean' ? value.sound : true,
        effects: typeof value?.effects === 'boolean' ? value.effects : true,
        motion: typeof value?.motion === 'boolean' ? value.motion : true,
      };
    } catch {
      return { sound: true, effects: true, motion: true };
    }
  }
  private savePreferences() {
    try {
      this.storage?.setItem(
        FEEDBACK_PREFERENCES_KEY,
        JSON.stringify({
          sound: this.soundEnabled(),
          effects: this.effectsEnabled(),
          motion: this.motionEnabled(),
        }),
      );
    } catch {
      /* Preferences still work for this session when storage is blocked. */
    }
  }
}
