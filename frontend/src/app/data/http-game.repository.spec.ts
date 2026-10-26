import { TestBed } from '@angular/core/testing';
import { ApiClient, ApiError } from './api-client';
import { AuthStore } from '../state/auth.store';
import { HttpGameRepository } from './http-game.repository';
import { createMockSnapshot } from './mock-data';

describe('account-bound game requests', () => {
  const owner = { id: 'account-A', email: 'a@example.test', verified: true };
  const api = {
    refreshCsrf: vi.fn(), clearCsrf: vi.fn(), get: vi.fn(), post: vi.fn(), put: vi.fn(),
  };
  beforeEach(async () => {
    vi.resetAllMocks();
    api.refreshCsrf.mockResolvedValue({});
    api.post.mockResolvedValue(owner);
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api }] });
    await TestBed.inject(AuthStore).login(owner.email, 'synthetic test passphrase');
    api.post.mockReset();
  });

  it('binds loads, activities, character changes and boss fights to the displayed account', async () => {
    const repository = TestBed.inject(HttpGameRepository);
    const headers = { 'X-Everbloom-Account': owner.id };
    const activity = { requestId: 'retry-1', skillId: 'running', minutes: 20 };
    const profile = { name: 'Ari', appearance: createMockSnapshot().character.appearance };
    await repository.load();
    await repository.record(activity);
    await repository.updateCharacter(profile);
    await repository.fightBoss({ requestId: 'fight-1', bossId: 'mosswarden', difficulty: 'normal', tactic: 'balanced' });
    expect(api.get).toHaveBeenCalledWith('/api/game', headers);
    expect(api.post).toHaveBeenCalledWith('/api/game/activities', activity, headers);
    expect(api.put).toHaveBeenCalledWith('/api/game/character', profile, headers);
    expect(api.post).toHaveBeenCalledWith('/api/game/bosses/mosswarden/fight',
      { requestId: 'fight-1', difficulty: 'normal', tactic: 'balanced' }, headers);
  });

  it('rejects another cookie owner without retrying the mutation or adopting their game', async () => {
    const repository = TestBed.inject(HttpGameRepository);
    api.post.mockRejectedValueOnce(new ApiError(409, 'ACCOUNT_CHANGED', 'Konto gewechselt.'));
    await expect(repository.record({ requestId: 'one-attempt', skillId: 'running', minutes: 20 }))
      .rejects.toMatchObject({ code: 'ACCOUNT_CHANGED' });
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(AuthStore).user()).toBeNull();
    await expect(repository.load()).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(api.get).not.toHaveBeenCalled();
  });
});
