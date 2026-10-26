import { computed, Injectable, signal } from '@angular/core';
import { createMockSnapshot } from '../data/mock-data';
import { startGamePeriod } from '../domain/game-periods';
import { levelProgress, recordActivity } from '../domain/progression';

/** Component-scoped example state; deliberately has no repository or persistence. */
@Injectable()
export class DemoExample {
  readonly result = createExample();
  private readonly triedState = signal(false);
  readonly tried = this.triedState.asReadonly();
  readonly level = computed(() =>
    levelProgress(
      this.tried() ? this.result.snapshot.character.totalXp : this.result.before.character.totalXp,
    ),
  );

  tryActivity(): boolean {
    if (this.tried()) return false;
    this.triedState.set(true);
    return true;
  }
}

function createExample() {
  const before = startGamePeriod(createMockSnapshot(), '2026-10-04');
  before.character.totalXp = 1100;
  before.skills = before.skills.map((skill) => ({ ...skill, totalXp: 0 }));
  before.boss.hp = before.boss.maxHp;
  return {
    before,
    ...recordActivity(before, {
      requestId: 'tutorial-example',
      skillId: 'calisthenics',
      minutes: 20,
    }),
  };
}
