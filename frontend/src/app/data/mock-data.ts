import { GameSnapshot } from '../domain/models';

/** A fixed day deliberately avoids client-clock-based reward resets in the demo. */
export function createMockSnapshot(): GameSnapshot {
  return {
    dayKey: '2026-09-08',
    character: {
      id: 'demo-player',
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
        body: 'base',
        hair: 'tousled',
        outfit: 'wanderer',
        aura: 'sage',
        skinColor: '#e6b995',
        hairColor: '#d9cbb4',
        outfitColor: '#729e8e',
      },
    },
    skills: [
      // Same levels (9/7/5/10) and approximate bar positions as the original mock.
      { skillId: 'calisthenics', totalXp: 13813 },
      { skillId: 'running', totalXp: 8804 },
      { skillId: 'meditation', totalXp: 5433 },
      { skillId: 'programming', totalXp: 14400 },
    ],
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
