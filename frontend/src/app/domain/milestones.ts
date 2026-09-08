import { BALANCE, SKILLS } from './catalog';
import { GameSnapshot } from './models';
import { levelProgress } from './progression';

export interface Milestone {
  kind: 'character-level' | 'skill-level' | 'first-activity' | 'daily-quests' | 'boss-victory';
  title: string;
  detail: string;
}

/** Compare accepted snapshots only. Loading, profile edits and reset never call this. */
export function detectMilestones(before: GameSnapshot, after: GameSnapshot): Milestone[] {
  const milestones: Milestone[] = [];
  const previousLevel = levelProgress(before.character.totalXp).level;
  const nextLevel = levelProgress(after.character.totalXp).level;
  if (nextLevel > previousLevel)
    milestones.push({
      kind: 'character-level',
      title: 'Levelaufstieg!',
      detail: 'Charakter: Level ' + previousLevel + ' → ' + nextLevel,
    });
  for (const skill of after.skills) {
    const previous = before.skills.find((s) => s.skillId === skill.skillId);
    if (!previous) continue;
    const from = levelProgress(previous.totalXp, BALANCE.skillBase, BALANCE.skillStep).level;
    const to = levelProgress(skill.totalXp, BALANCE.skillBase, BALANCE.skillStep).level;
    if (to > from)
      milestones.push({
        kind: 'skill-level',
        title: 'Dein Können wächst!',
        detail:
          (SKILLS.find((s) => s.id === skill.skillId)?.name ?? skill.skillId) +
          ': Level ' +
          from +
          ' → ' +
          to,
      });
  }
  if (before.boss.hp > 0 && after.boss.hp === 0 && before.boss.id === after.boss.id)
    milestones.push({
      kind: 'boss-victory',
      title: 'Wochenboss besiegt!',
      detail: after.boss.name + ' ist bezwungen.',
    });
  if (
    before.quests.length > 0 &&
    before.quests.some((q) => !q.claimed) &&
    before.dayKey === after.dayKey &&
    before.quests.every((q) => after.quests.some((a) => a.id === q.id && a.claimed))
  ) {
    milestones.push({
      kind: 'daily-quests',
      title: 'Tagesziel erreicht!',
      detail: 'Alle Daily Quests abgeschlossen.',
    });
  }
  const hadActivity = before.activities.some((a) => a.dayKey === after.dayKey && a.xp > 0);
  const hasActivity = after.activities.some((a) => a.dayKey === after.dayKey && a.xp > 0);
  if (!hadActivity && hasActivity)
    milestones.push({
      kind: 'first-activity',
      title: 'Dein erster Schritt heute!',
      detail: 'Eine reale Aktivität. Ein Stück weiter.',
    });
  return milestones;
}
