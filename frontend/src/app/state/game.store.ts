import { computed, inject, Injectable, signal } from '@angular/core';
import { GAME_REPOSITORY } from '../data/game.repository';
import { ATTRIBUTES, BALANCE, SKILLS } from '../domain/catalog';
import { GameSnapshot } from '../domain/models';
import { bossPhase, levelProgress } from '../domain/progression';

@Injectable({ providedIn: 'root' })
export class GameStore {
  private readonly repository = inject(GAME_REPOSITORY);
  private readonly snapshotState = signal<GameSnapshot | null>(null);
  private readonly busyState = signal(false);
  private readonly errorState = signal('');
  private readonly messageState = signal('');
  readonly snapshot = this.snapshotState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly message = this.messageState.asReadonly();
  readonly level = computed(() => levelProgress(this.snapshot()?.character.totalXp ?? 0));
  readonly skills = computed(() =>
    (this.snapshot()?.skills ?? []).map((progress) => {
      const definition = SKILLS.find((s) => s.id === progress.skillId)!;
      return {
        ...definition,
        ...progress,
        ...levelProgress(progress.totalXp, BALANCE.skillBase, BALANCE.skillStep),
      };
    }),
  );
  readonly attributes = computed(() =>
    ATTRIBUTES.map((attribute) => {
      const earned = this.skills()
        .filter((s) => s.attribute === attribute.id)
        .reduce((sum, s) => sum + s.totalXp, 0);
      return {
        ...attribute,
        value:
          (this.snapshot()?.character.attributes[attribute.id] ?? 0) +
          Math.floor(earned / BALANCE.attributeXpPerPoint),
      };
    }),
  );
  readonly questsDone = computed(
    () => this.snapshot()?.quests.filter((q) => q.claimed).length ?? 0,
  );
  readonly phase = computed(() => {
    const boss = this.snapshot()?.boss;
    return boss ? bossPhase(boss.hp, boss.maxHp) : '';
  });
  readonly totalMinutes = computed(
    () => this.snapshot()?.activities.reduce((sum, a) => sum + a.minutes, 0) ?? 0,
  );
  async load() {
    await this.execute(async () => {
      this.snapshotState.set(await this.repository.load());
    });
  }
  async record(skillId: string, minutes: number): Promise<boolean> {
    return this.execute(async () => {
      const result = await this.repository.record({
        requestId: crypto.randomUUID(),
        skillId,
        minutes,
      });
      this.snapshotState.set(result.snapshot);
      const r = result.reward;
      this.messageState.set(
        r.activityXp > 0
          ? 'Aktivität gespeichert. +' +
              (r.activityXp + r.questXp) +
              ' XP' +
              (r.questXp ? ', davon ' + r.questXp + ' Quest-XP' : '') +
              '. ' +
              r.damage +
              ' Boss-Schaden.' +
              (r.rewardedMinutes < minutes
                ? ' Tageslimit erreicht; zusätzliche Minuten wurden ohne XP erfasst.'
                : '')
          : 'Aktivität gespeichert. Dein XP-Tageslimit für diesen Skill ist erreicht.',
      );
    });
  }
  async reset() {
    await this.execute(async () => {
      this.snapshotState.set(await this.repository.resetDemo());
      this.messageState.set('Die Demo startet wieder beim ursprünglichen Beispieltagesstand.');
    });
  }
  private async execute(action: () => Promise<void>): Promise<boolean> {
    if (this.busyState()) return false;
    this.busyState.set(true);
    this.errorState.set('');
    this.messageState.set('');
    try {
      await action();
      return true;
    } catch (error) {
      this.errorState.set(
        error instanceof Error ? error.message : 'Das hat nicht geklappt. Bitte erneut versuchen.',
      );
      return false;
    } finally {
      this.busyState.set(false);
    }
  }
}
