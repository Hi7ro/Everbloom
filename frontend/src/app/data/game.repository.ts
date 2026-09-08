import { InjectionToken } from '@angular/core';
import { ActivityCommand, ActivityResult, GameSnapshot } from '../domain/models';
export interface GameRepository {
  load(): Promise<GameSnapshot>;
  record(command: ActivityCommand): Promise<ActivityResult>;
  resetDemo(): Promise<GameSnapshot>;
}
export const GAME_REPOSITORY = new InjectionToken<GameRepository>('GAME_REPOSITORY');
