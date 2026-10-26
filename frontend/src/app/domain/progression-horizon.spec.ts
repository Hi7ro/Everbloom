import { createMockSnapshot } from '../data/mock-data';
import { GameSnapshot } from './models';
import { buildProgressionHorizon } from './progression-horizon';

function snapshot(totalXp = 0, clearedEncounterIds: string[] = []): GameSnapshot {
  const state = createMockSnapshot();
  state.character.totalXp = totalXp;
  state.bossProgress = { clearedEncounterIds, unlockedCosmetics: [] };
  state.unlockedAuras = [];
  return state;
}

describe('read-only progression horizon', () => {
  it('shows the first encounter and next level aura using exact existing XP thresholds', () => {
    const horizon = buildProgressionHorizon(snapshot());
    expect(horizon.boss).toMatchObject({
      id: 'mosswarden', name: 'Der Mooswächter', difficulty: 'normal',
      minimumLevel: 10, recommendedLevel: 10, readyToEnter: false, requiresPlus: false,
      requiredXp: 18000, remainingXp: 18000, progressXp: 0,
      reward: { id: 'moss-crown', name: 'Waldkrone · Jade-Topknot', slot: 'hair', difficulty: 'normal' },
    });
    expect(horizon.aura).toEqual({
      id: 'rose', label: 'Rosenlicht', targetLevel: 5,
      requiredXp: 6000, remainingXp: 6000, progressXp: 0,
    });
  });

  it('opens only the level gate at its boundary and caps the displayed progress', () => {
    expect(buildProgressionHorizon(snapshot(17999)).boss).toMatchObject({ readyToEnter: false, remainingXp: 1, progressXp: 17999 });
    expect(buildProgressionHorizon(snapshot(18000)).boss).toMatchObject({ readyToEnter: true, remainingXp: 0, progressXp: 18000 });
    const horizon = buildProgressionHorizon(snapshot(25926));
    expect(horizon.boss).toMatchObject({ id: 'mosswarden', readyToEnter: true, remainingXp: 0, progressXp: 18000 });
    expect(horizon.aura).toMatchObject({ remainingXp: 31074, progressXp: 25926 });
  });

  it('advances after a legitimate clear in any mode without listing later boss identities', () => {
    const horizon = buildProgressionHorizon(snapshot(25926, ['mosswarden:hard']));
    expect(horizon.boss).toMatchObject({
      id: 'emberwyrm', minimumLevel: 20, recommendedLevel: 20,
      requiredXp: 57000, remainingXp: 31074, reward: { id: 'ember-crown' },
    });
    const serialized = JSON.stringify(horizon);
    expect(serialized).not.toContain('dusk-prowler');
    expect(serialized).not.toContain('bloodmoon-regent');
    expect(serialized).not.toContain('astral-sovereign');
    expect(serialized).not.toContain('frost-titan');
    expect(serialized).not.toContain('cloud-sovereign');
  });

  it('does not reveal later bosses from high levels, invented modes or disconnected clear IDs', () => {
    const horizon = buildProgressionHorizon(snapshot(600000, [
      'mosswarden:invented', 'astral-sovereign:ultimate', 'cloud-sovereign:normal',
    ]));
    expect(horizon.boss?.id).toBe('mosswarden');
    expect(JSON.stringify(horizon)).not.toContain('cloud-sovereign');
  });

  it('preserves the opening-chapter finale distinction between entry and recommended levels', () => {
    const horizon = buildProgressionHorizon(snapshot(294000, [
      'mosswarden:normal', 'emberwyrm:normal', 'dusk-prowler:epic', 'frost-titan:normal',
    ]));
    expect(horizon.boss).toMatchObject({
      id: 'cloud-sovereign', minimumLevel: 50, recommendedLevel: 55, requiresPlus: false,
      requiredXp: 294000, remainingXp: 0, progressXp: 294000, readyToEnter: true,
      reward: { id: 'cloud-crown' },
    });
  });

  it('places the bloodmoon regent at level sixty immediately beyond the opening chapter', () => {
    const clears = ['mosswarden:normal', 'emberwyrm:normal', 'dusk-prowler:normal', 'frost-titan:normal', 'cloud-sovereign:normal'];
    expect(buildProgressionHorizon(snapshot(294000, clears)).boss).toMatchObject({
      id: 'bloodmoon-regent', minimumLevel: 60, recommendedLevel: 60, requiresPlus: true,
      requiredXp: 413000, remainingXp: 119000, readyToEnter: false,
      reward: { id: 'bloodmoon-crown' },
    });
    expect(buildProgressionHorizon(snapshot(413000, clears)).boss).toMatchObject({ readyToEnter: true, remainingXp: 0 });
  });

  it('reveals the level-seventy astral horizon only after the regent beyond the opening chapter is cleared', () => {
    const clears = ['mosswarden:normal', 'emberwyrm:normal', 'dusk-prowler:normal', 'frost-titan:normal', 'cloud-sovereign:normal', 'bloodmoon-regent:normal'];
    expect(buildProgressionHorizon(snapshot(294000, clears)).boss).toMatchObject({
      id: 'astral-sovereign', minimumLevel: 70, recommendedLevel: 70, requiresPlus: true,
      requiredXp: 552000, remainingXp: 258000, progressXp: 294000, readyToEnter: false,
      reward: { id: 'astral-crown' },
    });
    expect(buildProgressionHorizon(snapshot(551999, clears)).boss).toMatchObject({ readyToEnter: false, remainingXp: 1 });
    expect(buildProgressionHorizon(snapshot(552000, clears)).boss).toMatchObject({ readyToEnter: true, remainingXp: 0 });
  });

  it('keeps a missing panther clear as the next goal without changing historical astral ownership', () => {
    const state = snapshot(600000, [
      'mosswarden:normal', 'emberwyrm:normal', 'astral-sovereign:normal', 'frost-titan:normal', 'cloud-sovereign:normal',
    ]);
    state.bossProgress!.unlockedCosmetics.push('astral-crown');
    const before = structuredClone(state);
    expect(buildProgressionHorizon(state).boss).toMatchObject({
      id: 'dusk-prowler', minimumLevel: 30, readyToEnter: true, reward: { id: 'dusk-crown' },
    });
    expect(state).toEqual(before);
  });

  it('reveals the three late encounters sequentially after historical chapter completions', () => {
    const state = snapshot(1089000, ['mosswarden:normal', 'emberwyrm:normal', 'dusk-prowler:normal', 'frost-titan:normal',
      'cloud-sovereign:normal', 'bloodmoon-regent:normal', 'astral-sovereign:normal']);
    expect(buildProgressionHorizon(state).boss).toMatchObject({ id: 'void-devourer', minimumLevel: 80, requiredXp: 711000, requiresPlus: true });
    state.bossProgress!.clearedEncounterIds.push('void-devourer:normal');
    expect(buildProgressionHorizon(state).boss).toMatchObject({ id: 'primordial-dragon', minimumLevel: 90, requiredXp: 890000, requiresPlus: true });
    state.bossProgress!.clearedEncounterIds.push('primordial-dragon:normal');
    expect(buildProgressionHorizon(state).boss).toMatchObject({ id: 'relic-sovereign', minimumLevel: 100, requiredXp: 1089000, requiresPlus: true });
  });

  it('does not advertise another first-clear reward once the campaign is completed', () => {
    const state = snapshot(600000, [
      'mosswarden:normal', 'emberwyrm:hard', 'dusk-prowler:epic', 'frost-titan:normal', 'cloud-sovereign:ultimate', 'bloodmoon-regent:normal', 'astral-sovereign:epic', 'void-devourer:normal', 'primordial-dragon:normal', 'relic-sovereign:normal',
    ]);
    state.unlockedAuras = ['aurora', 'starlight'];
    expect(buildProgressionHorizon(state)).toEqual({ boss: null, aura: null });
  });

  it('keeps an uncompleted encounter visible without promising already owned cosmetics twice', () => {
    const state = snapshot();
    state.bossProgress!.unlockedCosmetics.push('moss-crown');
    expect(buildProgressionHorizon(state).boss).toMatchObject({ id: 'mosswarden', reward: null });
  });

  it('skips owned level auras and boss-drop auras rather than treating them as future level rewards', () => {
    const state = snapshot(50000);
    state.unlockedAuras = ['aurora', 'moss-spirit'];
    expect(buildProgressionHorizon(state).aura).toEqual({
      id: 'starlight', label: 'Sternenkranz', targetLevel: 40,
      requiredXp: 195000, remainingXp: 145000, progressXp: 50000,
    });
  });

  it('never promises a retroactive aura grant if its threshold was already crossed', () => {
    expect(buildProgressionHorizon(snapshot(56999)).aura).toMatchObject({ id: 'aurora', remainingXp: 1 });
    expect(buildProgressionHorizon(snapshot(57000)).aura).toMatchObject({ id: 'starlight', remainingXp: 138000 });
    expect(buildProgressionHorizon(snapshot(195000)).aura).toBeNull();
  });

  it('handles legacy snapshots without encounter progress and never changes any earned state', () => {
    const state = snapshot(10000);
    delete state.bossProgress;
    const original = structuredClone(state);
    const first = buildProgressionHorizon(state);
    expect(first.boss?.id).toBe('mosswarden');
    expect(buildProgressionHorizon(state)).toEqual(first);
    expect(state).toEqual(original);
    expect(state.unlockedAuras).toEqual([]);
  });

  it('omits goals while the account snapshot or its XP is unavailable', () => {
    expect(buildProgressionHorizon(null)).toEqual({ boss: null, aura: null });
    expect(buildProgressionHorizon(undefined)).toEqual({ boss: null, aura: null });
    for (const invalid of [-1, NaN, Infinity]) {
      expect(buildProgressionHorizon(snapshot(invalid))).toEqual({ boss: null, aura: null });
    }
  });
  it('presents the next reward in the chosen form without granting it or revealing later bosses', () => {
    const state = snapshot();
    state.character.appearance.presentation = 'female';
    const before = structuredClone(state);
    const goal = buildProgressionHorizon(state);
    expect(goal.boss?.reward).toMatchObject({ id: 'moss-crown', name: 'Waldkrone · Jade-Seitenzopf',
      variant: 'female', moduleId: 'starweaver' });
    expect(state).toEqual(before);
    expect(JSON.stringify(goal)).not.toContain('emberwyrm');
    state.bossProgress!.unlockedCosmetics.push('moss-crown');
    expect(buildProgressionHorizon(state).boss?.reward).toBeNull();
  });

});
