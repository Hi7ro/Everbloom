import { inject, Injectable } from '@angular/core';
import { ApiClient } from './api-client';
import { GameRepository } from './game.repository';
import { ActivityCommand, ActivityResult, CharacterProfile, GameSnapshot } from '../domain/models';
import { AuthStore } from '../state/auth.store';
import { BossFightCommand, BossFightResult } from '../domain/boss-fight';

@Injectable({ providedIn: 'root' })
export class HttpGameRepository implements GameRepository {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(AuthStore);
  progressPersistence() {
    return {
      state: 'server' as const,
      message:
        'Spielstand in deinem Konto gespeichert. Zum Spielen brauchst du eine Internetverbindung.',
    };
  }
  load() {
    return this.auth.owned(headers => this.api.get<GameSnapshot>('/api/game', headers));
  }
  record(command: ActivityCommand) {
    return this.auth.owned(headers => this.api.post<ActivityResult>('/api/game/activities', command, headers));
  }
  updateCharacter(profile: CharacterProfile) {
    return this.auth.owned(headers =>
      this.api.put<{ snapshot: GameSnapshot; persisted: boolean }>('/api/game/character', profile, headers),
    );
  }
  fightBoss(command: BossFightCommand): Promise<BossFightResult> {
    const { bossId, ...body } = command;
    return this.auth.owned(headers => this.api.post<BossFightResult>(
      '/api/game/bosses/' + encodeURIComponent(bossId) + '/fight', body, headers,
    ));
  }
  resetDemo(): Promise<GameSnapshot> {
    return Promise.reject(new Error('Kontospielstände können hier nicht zurückgesetzt werden.'));
  }
}
