import { InjectionToken } from '@angular/core';
import { ProgressPersistenceStatus } from './game-progress.storage';
import { ActivityCommand, ActivityResult, CharacterProfile, GameSnapshot } from '../domain/models';
export interface GameRepository {
  /** Optional for remote adapters; local adapters expose recoverable persistence warnings. */
  progressPersistence?(): ProgressPersistenceStatus;
  load(): Promise<GameSnapshot>;
  record(command: ActivityCommand): Promise<ActivityResult>;
  updateCharacter(
    profile: CharacterProfile,
  ): Promise<{ snapshot: GameSnapshot; persisted: boolean }>;
  resetDemo(): Promise<GameSnapshot>;
}
export const GAME_REPOSITORY = new InjectionToken<GameRepository>('GAME_REPOSITORY');
