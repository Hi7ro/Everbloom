import { SKILLS } from './catalog';
import { DailyCareMode } from './daily-care';
import { formatWeekLabel, isValidDayKey, weekStart } from './game-periods';
import { GameSnapshot, SkillDefinition } from './models';
import { recordActivity } from './progression';

export interface DailyRecommendation {
  readonly id: string;
  readonly skillId: string;
  readonly skillName: string;
  readonly family: string;
  readonly symbol: string;
  readonly color: string;
  readonly title: string;
  readonly description: string;
  readonly minutes: number;
  readonly kind: 'quest' | 'focus' | 'care';
  readonly questId: string | null;
  readonly remainingRewardMinutes: number;
  /** Independent preview against the current snapshot, not a reserved reward. */
  readonly preview: {
    readonly activityXp: number;
    readonly questXp: number;
    readonly membershipXp: number;
    readonly totalXp: number;
    readonly bossDamage: number;
  };
}

export interface WeeklyMilestone {
  readonly id: 'active-days' | 'variety' | 'care';
  readonly title: string;
  readonly description: string;
  readonly progress: number;
  readonly target: number;
  readonly complete: boolean;
  /** These milestones describe activity history; they create no extra rewards. */
  readonly rewardXp: 0;
}

export interface AdventureWeek {
  readonly startDay: string;
  readonly endDay: string;
  readonly label: string;
  /** Recorded activity XP only. Historical quest bonuses are not reconstructible here. */
  readonly activityXp: number;
  readonly activeDays: number;
  readonly skillCount: number;
  readonly familyCount: number;
  readonly careDays: number;
  readonly milestones: readonly WeeklyMilestone[];
}

export interface DailyAdventure {
  readonly dayKey: string;
  readonly mode: DailyCareMode;
  readonly restFriendly: boolean;
  readonly recommendations: readonly DailyRecommendation[];
  readonly week: AdventureWeek;
}

const CARE_SKILLS = ['recovery', 'meditation', 'breathwork'] as const;
const SUGGESTED_MINUTES: Readonly<Record<string, number>> = {
  calisthenics: 20,
  running: 15,
  meditation: 10,
  programming: 20,
  weightlifting: 20,
  swimming: 15,
  boxing: 15,
  bjj: 15,
  breathwork: 5,
  recovery: 10,
  reading: 15,
  languages: 10,
  'healthy-cooking': 20,
  music: 10,
};

/**
 * A small optional next step, never an activity prescription or an automatic entry.
 * All reward calculations call the existing transaction on an unchanged snapshot.
 */
export function buildDailyAdventure(
  snapshot: GameSnapshot,
  focusSkillIds: readonly string[],
  careMode: DailyCareMode = 'balanced',
  characterBonusPercent = 0,
): DailyAdventure {
  const restFriendly = careMode === 'recovery' || careMode === 'rest';
  const selection: readonly string[] = restFriendly
    ? CARE_SKILLS
    : focusSkillIds.length
      ? focusSkillIds
      : snapshot.skills.map((skill) => skill.skillId);
  const knownProgress = new Set(snapshot.skills.map((skill) => skill.skillId));
  const selected = new Set<string>();
  const recommendations: DailyRecommendation[] = [];
  for (const skillId of selection) {
    if (recommendations.length === 3) break;
    if (selected.has(skillId) || !knownProgress.has(skillId)) continue;
    selected.add(skillId);
    const skill = SKILLS.find((definition) => definition.id === skillId);
    if (!skill) continue;
    const recommendation = recommend(snapshot, skill, careMode, characterBonusPercent);
    if (recommendation) recommendations.push(recommendation);
  }
  return {
    dayKey: snapshot.dayKey,
    mode: careMode,
    restFriendly,
    recommendations,
    week: adventureWeek(snapshot),
  };
}

function recommend(
  snapshot: GameSnapshot,
  skill: SkillDefinition,
  careMode: DailyCareMode,
  characterBonusPercent: number,
): DailyRecommendation | null {
  const quests = snapshot.quests.filter((quest) => quest.skillId === skill.id);
  const openQuests = quests.filter(
    (quest) => !quest.claimed && quest.progressMinutes < quest.targetMinutes,
  );
  // A finished quest is not presented as something the player must repeat.
  if (quests.length && !openQuests.length) return null;
  const usedMinutes = snapshot.activities
    .filter((activity) => activity.dayKey === snapshot.dayKey && activity.skillId === skill.id)
    .reduce((sum, activity) => sum + activity.rewardedMinutes, 0);
  const remainingRewardMinutes = Math.max(0, skill.dailyMinuteLimit - usedMinutes);
  if (!Number.isFinite(remainingRewardMinutes) || remainingRewardMinutes < 5) return null;
  const restFriendly = careMode === 'recovery' || careMode === 'rest';
  const nextQuest = openQuests[0];
  const preferredMinutes = careMode === 'rest' ? 5 : (SUGGESTED_MINUTES[skill.id] ?? 10);
  const questMinutes = nextQuest
    ? Math.max(5, nextQuest.targetMinutes - nextQuest.progressMinutes)
    : preferredMinutes;
  const minutes = Math.floor(Math.min(20, preferredMinutes, questMinutes, remainingRewardMinutes));
  let requestId = `adventure-preview:${snapshot.dayKey}:${skill.id}`;
  const existingIds = new Set(snapshot.activities.map((activity) => activity.requestId));
  while (existingIds.has(requestId)) requestId += ':next';
  const reward = recordActivity(snapshot, { requestId, skillId: skill.id, minutes }, SKILLS, characterBonusPercent).reward;
  if (!Number.isFinite(reward.activityXp) || reward.activityXp <= 0) return null;
  return {
    id: `daily:${snapshot.dayKey}:${skill.id}`,
    skillId: skill.id,
    skillName: skill.name,
    family: skill.family,
    symbol: skill.symbol,
    color: skill.color,
    title: nextQuest?.title ?? (restFriendly ? 'Ein Moment für dich' : `Zeit für ${skill.name}`),
    description:
      careMode === 'rest'
        ? 'Nur wenn es dir guttut. Auch eine Pause ohne Eintrag ist ein guter Tag.'
        : restFriendly
          ? 'Ein freiwilliger, ruhiger Schritt in deinem Tempo.'
          : nextQuest
            ? 'Ein kleiner Schritt für deine heutige Quest.'
            : 'Ein kleiner Schritt in deinem gewählten Schwerpunkt.',
    minutes,
    kind: restFriendly ? 'care' : nextQuest ? 'quest' : 'focus',
    questId: nextQuest?.id ?? null,
    remainingRewardMinutes,
    preview: {
      activityXp: reward.activityXp,
      questXp: reward.questXp,
      membershipXp: reward.membershipXp ?? 0,
      totalXp: reward.activityXp + reward.questXp + (reward.membershipXp ?? 0),
      bossDamage: reward.damage,
    },
  };
}

function adventureWeek(snapshot: GameSnapshot): AdventureWeek {
  const startDay = weekStart(snapshot.dayKey);
  const sunday = new Date(`${startDay}T12:00:00Z`);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  const endDay = sunday.toISOString().slice(0, 10);
  const activeDays = new Set<string>();
  const skills = new Set<string>();
  const families = new Set<string>();
  const careDays = new Set<string>();
  const processed = new Set<string>();
  let activityXp = 0;
  for (const activity of snapshot.activities) {
    const definition = SKILLS.find((skill) => skill.id === activity.skillId);
    if (
      !definition ||
      !isValidDayKey(activity.dayKey) ||
      activity.dayKey < startDay ||
      activity.dayKey > snapshot.dayKey ||
      activity.dayKey > endDay ||
      !activity.requestId.trim() ||
      processed.has(activity.requestId) ||
      !Number.isInteger(activity.rewardedMinutes) ||
      activity.rewardedMinutes <= 0 ||
      activity.rewardedMinutes > activity.minutes ||
      !Number.isInteger(activity.xp) ||
      activity.xp <= 0
    )
      continue;
    processed.add(activity.requestId);
    activityXp += activity.xp;
    activeDays.add(activity.dayKey);
    skills.add(definition.id);
    families.add(definition.family);
    if ((CARE_SKILLS as readonly string[]).includes(definition.id)) careDays.add(activity.dayKey);
  }
  const milestone = (
    id: WeeklyMilestone['id'],
    title: string,
    description: string,
    progress: number,
    target: number,
  ): WeeklyMilestone => ({
    id,
    title,
    description,
    progress: Math.min(progress, target),
    target,
    complete: progress >= target,
    rewardXp: 0,
  });
  return {
    startDay,
    endDay,
    label: formatWeekLabel(snapshot.dayKey),
    activityXp,
    activeDays: activeDays.size,
    skillCount: skills.size,
    familyCount: families.size,
    careDays: careDays.size,
    milestones: [
      milestone(
        'active-days',
        'Dein eigener Rhythmus',
        'An drei verschiedenen Tagen einen kleinen Schritt sammeln. Pausen bleiben willkommen.',
        activeDays.size,
        3,
      ),
      milestone(
        'variety',
        'Mehr als eine Seite',
        'Zwei verschiedene Lebensbereiche entdecken.',
        families.size,
        2,
      ),
      milestone(
        'care',
        'Raum zum Auftanken',
        'Einen freiwilligen Moment mit Erholung, Meditation oder Breathwork festhalten.',
        careDays.size,
        1,
      ),
    ],
  };
}
