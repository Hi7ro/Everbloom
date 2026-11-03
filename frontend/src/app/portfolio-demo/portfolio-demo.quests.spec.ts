import { localDailyQuests } from './portfolio-demo.quests';

describe('local parity with the existing server daily quest plan', () => {
  it('uses the correct minimum and level-scaled captured bonus', () => {
    expect(localDailyQuests('2026-11-03', ['reading'], 0)[0].bonusXp).toBe(40);
    expect(localDailyQuests('2026-11-03', ['reading'], 25926)[0].bonusXp).toBe(70);
    expect(localDailyQuests('2026-11-03', ['reading'], 295000)[0].bonusXp).toBe(220);
  });
  it('rotates a stable three-goal subset across UTC epoch days', () => {
    const focus = ['calisthenics', 'running', 'meditation', 'programming'];
    expect(localDailyQuests('2026-11-03', focus, 25926).map((quest) => quest.skillId)).toEqual([
      'calisthenics',
      'running',
      'meditation',
    ]);
    expect(localDailyQuests('2026-11-04', focus, 25926).map((quest) => quest.skillId)).toEqual([
      'running',
      'meditation',
      'programming',
    ]);
  });
});
