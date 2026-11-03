import { inject, Injectable } from '@angular/core';
import { GAME_DAY_CLOCK } from '../data/game-clock';
import { GameRepository } from '../data/game.repository';
import { ProgressPersistenceStatus } from '../data/game-progress.storage';
import { hasAuraAccess } from '../domain/aura-rewards';
import { normalizeCharacterProfile } from '../domain/character';
import { advanceGamePeriod, isValidDayKey } from '../domain/game-periods';
import { ActivityCommand, CharacterProfile, GameSnapshot } from '../domain/models';
import { recordActivity } from '../domain/progression';
import { createBossBattle } from '../domain/auto-battle';
import { BossFightCommand, BossFightResult } from '../domain/boss-fight';
import { bossEncounterId, isBossDiscovered } from '../domain/boss-catalog';
import { bossFirstClearReward, hasBossCosmetic } from '../domain/boss-loot';
import { JourneyStore } from '../state/journey.store';
import { localDailyQuests } from './portfolio-demo.quests';
import { createPortfolioExample, DEMO_PRESET } from './portfolio-demo.presets';

/** Portfolio-only adapter. No browser storage, accounts, transport or server rewards. */
@Injectable()
export class PortfolioDemoRepository implements GameRepository {
  private readonly clock = inject(GAME_DAY_CLOCK);
  private readonly preset = inject(DEMO_PRESET);
  readonly localBossChallenges = true;
  readonly localPersonalQuests = true;
  private readonly journey = inject(JourneyStore);
  private readonly fights = new Map<
    string,
    { command: BossFightCommand; result: BossFightResult }
  >();
  private snapshot = this.example();

  progressPersistence(): ProgressPersistenceStatus {
    return {
      state: 'session',
      quiet: true,
      message:
        'Portfolio-Demo: Dieser Beispielstand lebt nur in diesem Tab. Neuladen beginnt von vorn.',
    };
  }

  async load(): Promise<GameSnapshot> {
    this.snapshot = advanceGamePeriod(this.snapshot, this.today());
    if (
      !this.snapshot.activities.some((entry) => entry.dayKey === this.snapshot.dayKey) &&
      this.snapshot.quests.every((quest) => quest.progressMinutes === 0 && !quest.claimed)
    ) {
      this.snapshot.quests = localDailyQuests(
        this.snapshot.dayKey,
        this.journey.activeSkillIds(),
        this.snapshot.character.totalXp,
      );
    }
    return structuredClone(this.snapshot);
  }

  async record(command: ActivityCommand) {
    const before = await this.load();
    if (
      this.today() < before.dayKey &&
      !before.activities.some((entry) => entry.requestId === command.requestId)
    ) {
      throw new Error('Bitte prüfe das Gerätedatum, bevor du einen weiteren Demo-Eintrag erfasst.');
    }
    const result = recordActivity(before, command);
    this.snapshot = result.snapshot;
    return structuredClone(result);
  }

  async fightBoss(command: BossFightCommand): Promise<BossFightResult> {
    if (!command.requestId.trim()) throw new Error('Eine Kampf-ID fehlt.');
    const previous = this.fights.get(command.requestId);
    if (previous) {
      if (
        previous.command.bossId !== command.bossId ||
        previous.command.difficulty !== command.difficulty ||
        previous.command.tactic !== command.tactic
      )
        throw new Error('Diese Kampf-ID gehört zu einer anderen Begegnung.');
      return structuredClone({ ...previous.result, snapshot: this.snapshot, duplicate: true });
    }
    const before = await this.load();
    if (!isBossDiscovered(before, command.bossId))
      throw new Error('Besiege zuerst deinen aktuell entdeckten Boss.');
    const replay = createBossBattle(before, command);
    const encounter = bossEncounterId(command.bossId, command.difficulty);
    const firstClear =
      replay.outcome === 'victory' && !before.bossProgress?.clearedEncounterIds.includes(encounter);
    const reward = firstClear ? bossFirstClearReward(command.bossId, command.difficulty) : null;
    if (reward) {
      before.bossProgress = {
        clearedEncounterIds: [
          ...new Set([...(before.bossProgress?.clearedEncounterIds ?? []), encounter]),
        ],
        unlockedCosmetics: [
          ...new Set([...(before.bossProgress?.unlockedCosmetics ?? []), reward.id]),
        ],
      };
      if (reward.auraId)
        before.unlockedAuras = [...new Set([...before.unlockedAuras, reward.auraId])];
    }
    this.snapshot = before;
    const result: BossFightResult = {
      snapshot: structuredClone(before),
      replay,
      firstClear,
      reward,
      duplicate: false,
    };
    this.fights.set(command.requestId, {
      command: { ...command },
      result: structuredClone(result),
    });
    return result;
  }

  async updateCharacter(input: CharacterProfile) {
    const profile = normalizeCharacterProfile(input);
    for (const cosmetic of [profile.appearance.cosmeticHair, profile.appearance.cosmeticOutfit]) {
      if (cosmetic && !hasBossCosmetic(this.snapshot, cosmetic))
        throw new Error('Dieses Fundstück ist im Beispielstand noch nicht freigeschaltet.');
    }
    if (!hasAuraAccess(this.snapshot, profile.appearance.aura)) {
      throw new Error('Diese Aura ist im Beispielstand noch nicht freigeschaltet.');
    }
    this.snapshot = {
      ...this.snapshot,
      character: { ...this.snapshot.character, ...profile, createdByPlayer: true },
    };
    return {
      snapshot: structuredClone(this.snapshot),
      persisted: false,
      persistenceMessage:
        'Dein Charakter ist in dieser Demo nur im aktuellen Tab gespeichert. Beim Neuladen beginnt der Beispielstand neu.',
    };
  }

  async resetDemo(): Promise<GameSnapshot> {
    const profile = {
      name: this.snapshot.character.name,
      appearance: structuredClone(this.snapshot.character.appearance),
    };
    this.snapshot = this.example();
    this.fights.clear();
    for (const slot of ['cosmeticHair', 'cosmeticOutfit'] as const) {
      if (profile.appearance[slot] && !hasBossCosmetic(this.snapshot, profile.appearance[slot]!))
        delete profile.appearance[slot];
    }
    if (!hasAuraAccess(this.snapshot, profile.appearance.aura)) profile.appearance.aura = 'none';
    this.snapshot.character = { ...this.snapshot.character, ...profile };
    return this.load();
  }

  private example(): GameSnapshot {
    return createPortfolioExample(this.today(), this.preset);
  }

  private today(): string {
    const day = this.clock();
    if (!isValidDayKey(day)) throw new Error('Das Datum für die Demo ist nicht verfügbar.');
    return day;
  }
}
