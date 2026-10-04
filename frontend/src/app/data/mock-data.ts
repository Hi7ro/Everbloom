import { GameSnapshot } from '../domain/models';
import { SKILLS } from '../domain/catalog';

// Preserve the four existing demo levels. Newly available skills begin at zero XP.
const DEMO_SKILL_XP: Readonly<Record<string, number>> = {
  calisthenics: 13813,
  running: 8804,
  meditation: 5433,
  programming: 14400,
};

/** A fixed day deliberately avoids client-clock-based reward resets in the demo. */
export function createMockSnapshot(): GameSnapshot {
  return {
    dayKey: '2026-09-08',
    character: {
      id: 'demo-player',
      createdByPlayer: false,
      name: 'Ari',
      title: 'Wanderer des Morgenlichts',
      // Rebased demo fixture: keep level 12 and ~51% progress under balance V0.2.
      totalXp: 25926,
      attributes: {
        strength: 23,
        endurance: 16,
        focus: 22,
        knowledge: 21,
        mindfulness: 12,
        recovery: 18,
      },
      appearance: {
        presentation: 'male',
        body: 'base',
        hair: 'm-spiky',
        outfit: 'wanderer',
        aura: 'sage',
        skinColor: '#e6b995',
        hairColor: '#d9cbb4',
        outfitColor: '#729e8e',
      },
    },
    skills: SKILLS.map((skill) => ({ skillId: skill.id, totalXp: DEMO_SKILL_XP[skill.id] ?? 0 })),
    quests: [
      {
        id: 'q-move',
        title: 'Werde ein Stück stärker',
        description: '20 Minuten Calisthenics',
        skillId: 'calisthenics',
        targetMinutes: 20,
        progressMinutes: 0,
        bonusXp: 50,
        claimed: false,
      },
      {
        id: 'q-mind',
        title: 'Finde deine innere Ruhe',
        description: '10 Minuten Meditation',
        skillId: 'meditation',
        targetMinutes: 10,
        progressMinutes: 0,
        bonusXp: 30,
        claimed: false,
      },
      {
        id: 'q-learn',
        title: 'Baue an deiner Zukunft',
        description: '30 Minuten Programming',
        skillId: 'programming',
        targetMinutes: 30,
        progressMinutes: 0,
        bonusXp: 40,
        claimed: false,
      },
    ],
    boss: {
      id: 'mosswarden',
      name: 'Der Mooswächter',
      weekLabel: '07. – 13. September',
      maxHp: 2400,
      hp: 1460,
    },
    activities: [],
    unlockedAuras: [],
    momentum: {
      value: 76,
      lastRewardDay: '2026-09-07',
      rhythm: [
        { label: 'Mi', status: 'done' },
        { label: 'Do', status: 'done' },
        { label: 'Fr', status: 'rest' },
        { label: 'Sa', status: 'done' },
        { label: 'So', status: 'rest' },
        { label: 'Mo', status: 'done' },
        { label: 'Di', status: 'today' },
      ],
    },
  };
}
