import { AttributeId, SkillDefinition } from './models';
export const BALANCE = {
  // A 60–90 min session fills ~9–12% at character 12, ~11–16% at skill 9.
  characterBase: 1200,
  characterStep: 200,
  skillBase: 1000,
  skillStep: 150,
  attributeXpPerPoint: 1000,
  damagePerXp: 2,
  dailyMomentum: 5,
  maxMinutesPerEntry: 180,
} as const;
export const ATTRIBUTES: ReadonlyArray<{ id: AttributeId; label: string; symbol: string }> = [
  { id: 'strength', label: 'Stärke', symbol: '↟' },
  { id: 'endurance', label: 'Ausdauer', symbol: '↝' },
  { id: 'focus', label: 'Fokus', symbol: '◎' },
  { id: 'knowledge', label: 'Wissen', symbol: '◇' },
  { id: 'mindfulness', label: 'Achtsamkeit', symbol: '✧' },
  { id: 'recovery', label: 'Erholung', symbol: '☾' },
];
export const SKILLS: readonly SkillDefinition[] = [
  {
    id: 'calisthenics',
    name: 'Calisthenics',
    family: 'Körper',
    attribute: 'strength',
    xpPerMinute: 4,
    dailyMinuteLimit: 90,
    symbol: '↟',
    color: '#dda982',
  },
  {
    id: 'running',
    name: 'Running',
    family: 'Körper',
    attribute: 'endurance',
    xpPerMinute: 3,
    dailyMinuteLimit: 60,
    symbol: '↝',
    color: '#a6c8b5',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    family: 'Geist',
    attribute: 'mindfulness',
    xpPerMinute: 3,
    dailyMinuteLimit: 30,
    symbol: '✧',
    color: '#b8add6',
  },
  {
    id: 'programming',
    name: 'Programming',
    family: 'Wissen',
    attribute: 'knowledge',
    xpPerMinute: 2,
    dailyMinuteLimit: 90,
    symbol: '⌘',
    color: '#a1bacf',
  },
];
