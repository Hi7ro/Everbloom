import { SKILLS } from '../domain/catalog';
import { Quest } from '../domain/models';
import { levelProgress } from '../domain/progression';

// Local counterpart of backend DailyQuestPlan: same goals, epoch-day rotation and captured bonus.
const GOALS: Readonly<Record<string, readonly [string, number]>> = {
  calisthenics: ['Werde ein Stück stärker', 20],
  running: ['Finde deinen Laufrhythmus', 15],
  meditation: ['Finde deine innere Ruhe', 10],
  programming: ['Baue an deiner Zukunft', 30],
  weightlifting: ['Wachse mit jedem Satz', 20],
  swimming: ['Gleite in deinen Rhythmus', 15],
  boxing: ['Feile an deiner Technik', 15],
  bjj: ['Verbinde Ruhe und Technik', 15],
  breathwork: ['Nimm dir einen Atemzug Zeit', 5],
  recovery: ['Sammle neue Kraft', 10],
  reading: ['Öffne eine neue Gedankenwelt', 15],
  languages: ['Lerne neue Worte kennen', 10],
  'healthy-cooking': ['Koche dir etwas Gutes', 20],
  music: ['Lass deine Musik wachsen', 10],
};

export function localDailyQuests(
  day: string,
  focus: readonly string[],
  characterXp: number,
): Quest[] {
  const skills = [...new Set(focus.filter((id) => GOALS[id]))];
  if (!skills.length) throw new Error('Bitte wähle mindestens einen verfügbaren Fokus-Skill.');
  const epochDay = Math.floor(Date.parse(day + 'T00:00:00Z') / 86_400_000);
  const offset =
    skills.length > 3 ? ((epochDay % skills.length) + skills.length) % skills.length : 0;
  const span = levelProgress(characterXp).required;
  const bonusXp = Math.max(40, Math.floor((span + 125) / 250) * 5);
  return Array.from({ length: Math.min(3, skills.length) }, (_, index) => {
    const skillId = skills[(offset + index) % skills.length];
    const [title, minutes] = GOALS[skillId];
    return {
      id: `daily:${day}:${skillId}`,
      title,
      description: `${minutes} Minuten ${SKILLS.find((skill) => skill.id === skillId)!.name}`,
      skillId,
      targetMinutes: minutes,
      progressMinutes: 0,
      bonusXp,
      claimed: false,
    };
  });
}
