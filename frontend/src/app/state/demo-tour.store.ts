import { computed, inject, Injectable, signal } from '@angular/core';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { GameStore } from './game.store';
import { JourneyStore } from './journey.store';

export const DEMO_TOUR_KEY = 'everbloom.demo-tour.v1';

/** Tutorial acknowledgements only. Never grants XP, items or account access. */
@Injectable({ providedIn: 'root' })
export class DemoTourStore {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly game = inject(GameStore);
  private readonly journey = inject(JourneyStore);
  private readonly initial = this.read();
  private readonly activity = signal(this.initial.activity);
  private readonly battle = signal(this.initial.battle);
  readonly saved = signal(this.storage !== null);
  readonly steps = computed(() => [
    {
      id: 'character',
      title: 'Dein kleines Ich',
      description: 'Wähle deinen Look und einen Namen.',
      route: '/character/create',
      done: this.game.profileIsSaved(),
    },
    {
      id: 'interests',
      title: 'Deine Richtung',
      description: 'Was möchtest du in deinem Alltag stärken?',
      route: '/onboarding',
      done: this.journey.configured(),
    },
    {
      id: 'activity',
      title: 'Ein Schritt wird zu XP',
      description: 'Probiere eine Aktivität am Beispiel aus.',
      route: '/demo',
      done: this.activity() || !!this.game.snapshot()?.activities.length,
    },
    {
      id: 'battle',
      title: 'Dein erstes Abenteuer',
      description: 'Sieh deinen Chibi im automatischen Probekampf.',
      route: '/battle',
      done: this.battle(),
    },
  ]);
  readonly completedCount = computed(() => this.steps().filter((step) => step.done).length);
  readonly complete = computed(() => this.completedCount() === this.steps().length);
  readonly next = computed(() => this.steps().find((step) => !step.done));

  exploreActivity() {
    this.activity.set(true);
    this.save();
  }
  finishBattle() {
    if (!this.battle()) {
      this.battle.set(true);
      this.save();
    }
  }
  reset() {
    this.activity.set(false);
    this.battle.set(false);
    this.save();
  }

  private read(): { activity: boolean; battle: boolean } {
    try {
      const raw = this.storage?.getItem(DEMO_TOUR_KEY);
      const value: unknown = raw ? JSON.parse(raw) : null;
      if (value && typeof value === 'object' && 'version' in value && value.version === 1) {
        const flags = value as Record<string, unknown>;
        return { activity: flags['activity'] === true, battle: flags['battle'] === true };
      }
    } catch {
      /* A broken tutorial marker must never prevent playing. */
    }
    return { activity: false, battle: false };
  }

  private save() {
    try {
      if (!this.storage) {
        this.saved.set(false);
        return;
      }
      this.storage.setItem(
        DEMO_TOUR_KEY,
        JSON.stringify({ version: 1, activity: this.activity(), battle: this.battle() }),
      );
      this.saved.set(true);
    } catch {
      this.saved.set(false);
    }
  }
}
