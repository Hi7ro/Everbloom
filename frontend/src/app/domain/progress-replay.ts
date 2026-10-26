import { advanceGamePeriod } from './game-periods';
import { Activity, ActivityCommand, GameSnapshot } from './models';
import { recordActivity } from './progression';

export interface ProgressReplayEntry extends ActivityCommand {
  readonly dayKey: string;
}

/**
 * Rebuild accepted inputs using the same transaction rules as a new activity.
 * Only a small per-skill daily index participates in each calculation; the full
 * newest-first history and calendar rhythm are assembled once at the end.
 * This keeps long journals linear instead of repeatedly scanning/copying history.
 * Storage is responsible for validating journal versions, dates and input bounds.
 */
export function replayProgress(
  initial: GameSnapshot,
  entries: readonly ProgressReplayEntry[],
): GameSnapshot {
  if (!entries.length) return initial;

  const seen = new Map(initial.activities.map((activity) => [activity.requestId, activity]));
  const history = [...initial.activities].reverse();
  const daily = new Map<string, Activity>();
  for (const activity of initial.activities) {
    if (activity.dayKey === initial.dayKey) addDailyActivity(daily, activity);
  }
  let snapshot = { ...initial, activities: [...daily.values()] };

  for (const entry of entries) {
    const period = advanceGamePeriod(snapshot, entry.dayKey);
    if (period.dayKey !== snapshot.dayKey) daily.clear();
    snapshot = { ...period, activities: [...daily.values()] };
    const command = {
      requestId: entry.requestId,
      skillId: entry.skillId,
      minutes: entry.minutes,
    };
    const existing = seen.get(entry.requestId);
    if (existing) {
      // Reuse transaction validation: identical retries earn nothing; conflicting
      // request IDs fail even when their original activity belongs to an old day.
      recordActivity({ ...snapshot, activities: [existing] }, command);
      continue;
    }

    const result = recordActivity(snapshot, command);
    const activity = result.snapshot.activities[0];
    seen.set(activity.requestId, activity);
    history.push(activity);
    addDailyActivity(daily, activity);
    snapshot = { ...result.snapshot, activities: [...daily.values()] };
  }

  return advanceGamePeriod({ ...snapshot, activities: history.reverse() }, snapshot.dayKey);
}

function addDailyActivity(daily: Map<string, Activity>, activity: Activity): void {
  const previous = daily.get(activity.skillId);
  daily.set(
    activity.skillId,
    previous
      ? {
          ...activity,
          minutes: previous.minutes + activity.minutes,
          rewardedMinutes: previous.rewardedMinutes + activity.rewardedMinutes,
          xp: previous.xp + activity.xp,
        }
      : activity,
  );
}
