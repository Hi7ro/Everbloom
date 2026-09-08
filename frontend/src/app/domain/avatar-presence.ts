export type AvatarStage = 'beginner' | 'practiced' | 'seasoned';
export type AvatarGesture = 'stretch' | 'breathe' | 'focus' | 'greet';

export interface AvatarPresence {
  stage: AvatarStage;
  gesture: AvatarGesture;
  stageLabel: string;
  gestureLabel: string;
  breathSeconds: number;
  gestureSeconds: number;
  tiltDegrees: number;
}

/** Illustrative presentation rules only. These values never affect XP, stats or rewards. */
export function resolveAvatarPresence(level: number, interest: string): AvatarPresence {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  const stage = safeLevel >= 25 ? 'seasoned' : safeLevel >= 10 ? 'practiced' : 'beginner';
  const key = (interest ?? '').trim().toLowerCase();
  const physical = [
    'physical',
    'running',
    'calisthenics',
    'weightlifting',
    'swimming',
    'boxing',
    'kickboxing',
    'muay-thai',
    'muay thai',
    'bjj',
    'mma',
  ];
  const mindful = ['mind', 'meditation', 'mindfulness', 'breathwork', 'recovery'];
  const knowledge = ['knowledge', 'programming', 'reading', 'languages', 'creative', 'career'];
  const gesture: AvatarGesture = physical.includes(key)
    ? 'stretch'
    : mindful.includes(key)
      ? 'breathe'
      : knowledge.includes(key)
        ? 'focus'
        : 'greet';
  const stageRules = {
    beginner: {
      stageLabel: 'Neugieriger Aufbruch',
      breathSeconds: 5.6,
      gestureSeconds: 19,
      tiltDegrees: 3,
    },
    practiced: {
      stageLabel: 'Im eigenen Rhythmus',
      breathSeconds: 6.2,
      gestureSeconds: 22,
      tiltDegrees: 2,
    },
    seasoned: {
      stageLabel: 'Ruhige Präsenz',
      breathSeconds: 7,
      gestureSeconds: 26,
      tiltDegrees: 1.4,
    },
  };
  const gestureLabels = {
    stretch: 'lockert die Schulter',
    breathe: 'atmet ruhig durch',
    focus: 'sammelt einen Gedanken',
    greet: 'blickt neugierig auf',
  };
  return { stage, gesture, ...stageRules[stage], gestureLabel: gestureLabels[gesture] };
}
