import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { DEMO_TOUR_KEY, DemoTourStore } from './demo-tour.store';
import { GameStore } from './game.store';
import { JourneyStore } from './journey.store';

describe('demo tour acknowledgements', () => {
  function setup(raw: string | null = null, blocked = false) {
    const storage = {
      getItem: vi.fn(() => raw),
      setItem: vi.fn((_key: string, value: string) => {
        if (blocked) throw new Error('Quota');
        raw = value;
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: BROWSER_STORAGE, useValue: storage },
        {
          provide: GameStore,
          useValue: { profileIsSaved: signal(true), snapshot: signal({ activities: [] }) },
        },
        { provide: JourneyStore, useValue: { configured: signal(true) } },
      ],
    });
    return { storage, store: TestBed.inject(DemoTourStore) };
  }

  it('restores only completed tutorial acknowledgements, never arbitrary progress', () => {
    const { store, storage } = setup(
      '{"version":1,"activity":true,"battle":true,"totalXp":999999}',
    );
    expect(store.complete()).toBe(true);
    expect(storage.setItem).not.toHaveBeenCalled();
    store.reset();
    expect(store.completedCount()).toBe(2);
    expect(storage.setItem).toHaveBeenCalledWith(
      DEMO_TOUR_KEY,
      '{"version":1,"activity":false,"battle":false}',
    );
  });

  it.each([
    'broken',
    '{"version":2,"activity":true,"battle":true}',
    '{"version":1,"activity":"true","battle":1}',
  ])('ignores malformed or newer flags: %s', (raw) => {
    expect(setup(raw).store.completedCount()).toBe(2);
  });

  it('keeps the tour usable when storage fails and reports session-only state', () => {
    const { store } = setup(null, true);
    store.exploreActivity();
    store.finishBattle();
    expect(store.complete()).toBe(true);
    expect(store.saved()).toBe(false);
  });
});
