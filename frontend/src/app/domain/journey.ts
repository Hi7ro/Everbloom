import { SKILLS } from './catalog';

export interface JourneyPreferences {
  interestIds: string[];
  activeSkillIds: string[];
  primaryInterestId: string;
}

export const INTERESTS = [
  { id: 'physical', label: 'Bewegung', avatarInterest: 'calisthenics' },
  { id: 'combat', label: 'Kampfsport', avatarInterest: 'boxing' },
  { id: 'mind', label: 'Ruhe & Erholung', avatarInterest: 'recovery' },
  { id: 'knowledge', label: 'Wissen & Lernen', avatarInterest: 'reading' },
  { id: 'creative', label: 'Kreativität', avatarInterest: 'creative' },
  { id: 'career', label: 'Beruf & Projekte', avatarInterest: 'career' },
  { id: 'life', label: 'Alltag', avatarInterest: 'adventurer' },
] as const;

export const MAX_ACTIVE_SKILLS = 6;
export const DEFAULT_JOURNEY: JourneyPreferences = {
  interestIds: ['physical', 'mind', 'knowledge'],
  activeSkillIds: ['calisthenics', 'running', 'meditation', 'programming'],
  primaryInterestId: 'physical',
};

function selectedIds(
  input: unknown,
  allowed: ReadonlySet<string>,
  maximum: number,
  label: string,
): string[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > maximum) {
    throw new Error('Bitte wähle 1–' + maximum + ' ' + label + '.');
  }
  if (!input.every((id): id is string => typeof id === 'string' && allowed.has(id))) {
    throw new Error('Deine Auswahl für ' + label + ' enthält einen nicht verfügbaren Eintrag.');
  }
  if (new Set(input).size !== input.length) {
    throw new Error('Bitte wähle jeden Eintrag für ' + label + ' nur einmal.');
  }
  // Preserve the user's order and keep mutable input arrays outside our domain state.
  return [...input];
}

/** Only interests and active skills are accepted; no input field can grant progression. */
export function normalizeJourneyPreferences(input: unknown): JourneyPreferences {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Bitte wähle deine Interessen, deinen Schwerpunkt und deine Skills aus.');
  }
  const value = input as Record<string, unknown>;
  const interestIds = selectedIds(
    value['interestIds'],
    new Set(INTERESTS.map((interest) => interest.id)),
    INTERESTS.length,
    'Interessenbereiche',
  );
  const activeSkillIds = selectedIds(
    value['activeSkillIds'],
    new Set(SKILLS.map((skill) => skill.id)),
    MAX_ACTIVE_SKILLS,
    'aktive Skills',
  );
  const primaryInterestId = value['primaryInterestId'];
  if (typeof primaryInterestId !== 'string' || !interestIds.includes(primaryInterestId)) {
    throw new Error('Dein Schwerpunkt muss zu deinen gewählten Interessen gehören.');
  }
  return { interestIds, activeSkillIds, primaryInterestId };
}

export function resolvePrimaryAvatarInterest(preferences: JourneyPreferences): string {
  return (
    INTERESTS.find((interest) => interest.id === preferences.primaryInterestId)?.avatarInterest ??
    'adventurer'
  );
}
