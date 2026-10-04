import { BALANCE, SKILLS } from './catalog';
import { grantActivityAuras } from './aura-rewards';
import { ActivityCommand, ActivityResult, GameSnapshot, SkillDefinition } from './models';

/** Total XP is canonical; this also handles rewards spanning several levels. */
export function levelProgress(
  totalXp: number,
  base: number = BALANCE.characterBase,
  step: number = BALANCE.characterStep,
) {
  let level = 1;
  let xp = totalXp;
  let required = base;
  while (xp >= required) {
    xp -= required;
    level++;
    required = base + (level - 1) * step;
  }
  return { level, xp, required, percent: Math.round((xp / required) * 100) };
}
export function bossPhase(hp: number, maxHp: number): string {
  if (hp <= 0) return 'Besiegt';
  if (hp / maxHp > 0.6) return 'Erwachen';
  if (hp / maxHp > 0.25) return 'Widerstand';
  return 'Letzter Widerstand';
}
/** One immutable transaction. The caller owns storage and transport. */
export function recordActivity(
  state: GameSnapshot,
  command: ActivityCommand,
  catalog: readonly SkillDefinition[] = SKILLS,
): ActivityResult {
  if (!command.requestId.trim()) throw new Error('Eine Eintrags-ID fehlt. Bitte erneut versuchen.');
  const existing = state.activities.find((a) => a.requestId === command.requestId);
  if (existing) {
    if (existing.skillId !== command.skillId || existing.minutes !== command.minutes) {
      throw new Error('Diese Eintrags-ID wurde bereits für eine andere Aktivität verwendet.');
    }
    return {
      snapshot: state,
      reward: { activityXp: 0, questXp: 0, damage: 0, rewardedMinutes: 0, duplicate: true },
    };
  }
  const skill = catalog.find((s) => s.id === command.skillId);
  if (!skill || !state.skills.some((s) => s.skillId === command.skillId))
    throw new Error('Bitte einen aktiven Skill auswählen.');
  if (
    !Number.isInteger(command.minutes) ||
    command.minutes < 1 ||
    command.minutes > BALANCE.maxMinutesPerEntry
  ) {
    throw new Error('Bitte ganze Minuten zwischen 1 und 180 eintragen.');
  }
  const used = state.activities
    .filter((a) => a.dayKey === state.dayKey && a.skillId === skill.id)
    .reduce((sum, a) => sum + a.rewardedMinutes, 0);
  const rewardedMinutes = Math.min(command.minutes, Math.max(0, skill.dailyMinuteLimit - used));
  const activityXp = rewardedMinutes * skill.xpPerMinute;
  let questXp = 0;
  const quests = state.quests.map((quest) => {
    if (quest.skillId !== skill.id || quest.claimed) return quest;
    const progressMinutes = Math.min(quest.targetMinutes, quest.progressMinutes + rewardedMinutes);
    const claimed = progressMinutes >= quest.targetMinutes;
    if (claimed) questXp += quest.bonusXp;
    return { ...quest, progressMinutes, claimed };
  });
  const damage = Math.min(state.boss.hp, activityXp * BALANCE.damagePerXp);
  const earnsMomentum = activityXp > 0 && state.momentum.lastRewardDay !== state.dayKey;
  const snapshot: GameSnapshot = {
    ...state,
    character: { ...state.character, totalXp: state.character.totalXp + activityXp + questXp },
    skills: state.skills.map((s) =>
      s.skillId === skill.id ? { ...s, totalXp: s.totalXp + activityXp } : s,
    ),
    quests,
    boss: { ...state.boss, hp: state.boss.hp - damage },
    activities: [
      { ...command, dayKey: state.dayKey, rewardedMinutes, xp: activityXp },
      ...state.activities,
    ],
    momentum: {
      ...state.momentum,
      value: Math.min(100, state.momentum.value + (earnsMomentum ? BALANCE.dailyMomentum : 0)),
      lastRewardDay: activityXp > 0 ? state.dayKey : state.momentum.lastRewardDay,
    },
  };
  snapshot.unlockedAuras = grantActivityAuras(state, snapshot, activityXp);
  return {
    snapshot,
    reward: { activityXp, questXp, damage, rewardedMinutes, duplicate: false },
  };
}
