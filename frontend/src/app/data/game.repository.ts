import { InjectionToken } from '@angular/core';
import { ActivityCommand, ActivityResult, CharacterProfile, GameSnapshot } from '../domain/models';
export interface GameRepository {
  load(): Promise<GameSnapshot>;
  record(command: ActivityCommand): Promise<ActivityResult>;
  updateCharacter(
    profile: CharacterProfile,
  ): Promise<{ snapshot: GameSnapshot; persisted: boolean }>;
  resetDemo(): Promise<GameSnapshot>;
}
export const GAME_REPOSITORY = new InjectionToken<GameRepository>('GAME_REPOSITORY');
