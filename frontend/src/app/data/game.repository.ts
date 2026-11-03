import { InjectionToken } from '@angular/core';
import { BossFightCommand, BossFightResult } from '../domain/boss-fight';
import { ProgressPersistenceStatus } from './game-progress.storage';
import { ActivityCommand, ActivityResult, CharacterProfile, GameSnapshot } from '../domain/models';
export interface GameRepository {
  /** Optional for remote adapters; local adapters expose recoverable persistence warnings. */
  progressPersistence?(): ProgressPersistenceStatus;
  /** Explicit opt-in for the isolated, non-account portfolio adapter only. */
  readonly localBossChallenges?: boolean;
  readonly localPersonalQuests?: boolean;
  load(): Promise<GameSnapshot>;
  record(command: ActivityCommand): Promise<ActivityResult>;
  updateCharacter(
    profile: CharacterProfile,
  ): Promise<{ snapshot: GameSnapshot; persisted: boolean; persistenceMessage?: string }>;
  /** Accounts resolve on the server; an explicitly isolated local adapter may resolve session-only encounters. */
  fightBoss?(command: BossFightCommand): Promise<BossFightResult>;
  resetDemo(): Promise<GameSnapshot>;
}
export const GAME_REPOSITORY = new InjectionToken<GameRepository>('GAME_REPOSITORY');
