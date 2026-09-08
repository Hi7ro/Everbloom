export type AttributeId =
  'strength' | 'endurance' | 'focus' | 'knowledge' | 'mindfulness' | 'recovery';
export type CharacterPresentation = 'male' | 'female';
export type CharacterArtwork = 'original' | 'custom';
export interface Appearance {
  presentation: CharacterPresentation;
  artwork?: CharacterArtwork;
  illustration?: string;
  body: string;
  hair: string;
  outfit: string;
  aura: string;
  skinColor: string;
  hairColor: string;
  outfitColor: string;
}
export interface CharacterProfile {
  name: string;
  appearance: Appearance;
}
export interface Character {
  createdByPlayer: boolean;
  id: string;
  name: string;
  title: string;
  totalXp: number;
  attributes: Record<AttributeId, number>;
  appearance: Appearance;
}
export interface SkillDefinition {
  id: string;
  name: string;
  family: string;
  attribute: AttributeId;
  xpPerMinute: number;
  dailyMinuteLimit: number;
  symbol: string;
  color: string;
}
export interface SkillProgress {
  skillId: string;
  totalXp: number;
}
export interface ActivityCommand {
  requestId: string;
  skillId: string;
  minutes: number;
}
export interface Activity extends ActivityCommand {
  dayKey: string;
  rewardedMinutes: number;
  xp: number;
}
export interface Quest {
  id: string;
  title: string;
  description: string;
  skillId: string;
  targetMinutes: number;
  progressMinutes: number;
  bonusXp: number;
  claimed: boolean;
}
export interface WeeklyBoss {
  id: string;
  name: string;
  weekLabel: string;
  maxHp: number;
  hp: number;
}
export interface RhythmDay {
  label: string;
  status: 'done' | 'rest' | 'today' | 'upcoming';
}
export interface GameSnapshot {
  dayKey: string;
  character: Character;
  skills: SkillProgress[];
  quests: Quest[];
  boss: WeeklyBoss;
  activities: Activity[];
  momentum: { value: number; lastRewardDay: string | null; rhythm: RhythmDay[] };
}
export interface Reward {
  activityXp: number;
  questXp: number;
  damage: number;
  rewardedMinutes: number;
  duplicate: boolean;
}
export interface ActivityResult {
  snapshot: GameSnapshot;
  reward: Reward;
}
