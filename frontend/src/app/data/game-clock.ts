import { InjectionToken } from '@angular/core';
import { localDayKey } from '../domain/daily-care';

/** A replaceable local-calendar clock, shared by journal tests and the repository. */
export const GAME_DAY_CLOCK = new InjectionToken<() => string>('GAME_DAY_CLOCK', {
  providedIn: 'root',
  factory: () => () => localDayKey(),
});
