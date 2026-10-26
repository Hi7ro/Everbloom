import { computed, Injectable, signal } from '@angular/core';
import { AURA_REWARDS, AuraReward } from '../domain/aura-rewards';
import { BossFightResult } from '../domain/boss-fight';
import { BOSS_CATALOG, BOSS_DIFFICULTIES, bossEncounterId } from '../domain/boss-catalog';
import { ResolvedBossCosmetic, resolveBossCosmetic } from '../domain/boss-loot';
import { GameSnapshot } from '../domain/models';

export interface RewardNotification {
  readonly key: string;
  readonly name: string;
  readonly source: string;
  readonly fragment: 'boss-loot' | 'aura-rewards';
  readonly boss?: ResolvedBossCosmetic;
  readonly aura?: AuraReward;
}

/** Presentation only. Accepted repository results grant rewards; this queue never does. */
@Injectable({ providedIn: 'root' })
export class RewardNotifications {
  private readonly queue = signal<readonly RewardNotification[]>([]);
  private readonly seen = new Set<string>();
  readonly current = computed(() => this.queue()[0] ?? null);
  readonly remaining = computed(() => Math.max(0, this.queue().length - 1));

  earnedActivity(before: GameSnapshot, after: GameSnapshot, duplicate: boolean): void {
    if (duplicate || before.character.id !== after.character.id) return;
    for (const aura of AURA_REWARDS) {
      if (before.unlockedAuras.includes(aura.id) || !after.unlockedAuras.includes(aura.id)) continue;
      this.enqueue({
        key: `${after.character.id}:aura:${aura.id}`, name: aura.label, aura,
        fragment: 'aura-rewards',
        source: aura.unlock.kind === 'level' ? `Level ${aura.unlock.level} erreicht` : `${aura.unlock.bossName} besiegt`,
      });
    }
  }

  /** Called by the battle screen only after the accepted victory replay has ended. */
  earnedBoss(result: BossFightResult): void {
    if (result.duplicate || !result.firstClear || result.replay.mode !== 'boss' || result.replay.outcome !== 'victory') return;
    const boss = result.reward ? resolveBossCosmetic(result.reward.id, result.snapshot.character.appearance.presentation) : undefined;
    if (!boss || boss.bossId !== result.replay.boss.id || boss.difficulty !== result.replay.difficulty
      || !result.snapshot.bossProgress?.unlockedCosmetics.includes(boss.id)
      || !result.snapshot.bossProgress.clearedEncounterIds.includes(bossEncounterId(boss.bossId, boss.difficulty))) return;
    const bossName = BOSS_CATALOG.find(item => item.id === boss.bossId)!.name;
    const difficulty = BOSS_DIFFICULTIES.find(item => item.id === boss.difficulty)!.name;
    this.enqueue({ key: `${result.snapshot.character.id}:boss:${boss.id}`, name: boss.name, boss,
      source: `${bossName} · ${difficulty}`, fragment: boss.slot === 'aura' ? 'aura-rewards' : 'boss-loot' });
  }

  dismiss(): void { this.queue.update(items => items.slice(1)); }

  /** Owner/session changes and explicit local-demo reset must remove old rewards. */
  clear(): void { this.queue.set([]); this.seen.clear(); }

  private enqueue(reward: RewardNotification): void {
    if (this.seen.has(reward.key)) return;
    this.seen.add(reward.key);
    this.queue.update(items => [...items, reward]);
  }
}
