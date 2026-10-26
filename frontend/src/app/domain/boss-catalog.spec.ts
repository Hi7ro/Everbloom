import { BOSS_CATALOG, BOSS_DIFFICULTIES, FREE_BOSS_MAX_LEVEL, bossEncounter, bossEncounterId, bossRequiresPlus, discoveredBosses, isBossDiscovered } from './boss-catalog';

describe('beta boss catalog', () => {
  it('offers the five-boss opening chapter and a complete fixed progression through level one hundred', () => {
    expect(BOSS_CATALOG.map(boss => [boss.id, boss.baseLevel])).toEqual([
      ['mosswarden', 10], ['emberwyrm', 20], ['dusk-prowler', 30], ['frost-titan', 40], ['cloud-sovereign', 50], ['bloodmoon-regent', 60], ['astral-sovereign', 70], ['void-devourer', 80], ['primordial-dragon', 90], ['relic-sovereign', 100],
    ]);
  });

  it('keeps hard, epic and ultimate thresholds explicit and labels Plus encounters', () => {
    expect(BOSS_DIFFICULTIES.map(mode => {
      const encounter = bossEncounter('mosswarden', mode.id);
      return [mode.id, encounter.minimumLevel, encounter.recommendedLevel, encounter.futurePlus];
    })).toEqual([
      ['normal', 10, 10, false], ['hard', 15, 20, true], ['epic', 25, 30, true], ['ultimate', 40, 40, true],
    ]);
    expect(bossEncounter('emberwyrm', 'ultimate').minimumLevel).toBe(50);
    expect(BOSS_DIFFICULTIES.map(mode => bossEncounter('bloodmoon-regent', mode.id).minimumLevel)).toEqual([60, 65, 75, 90]);
    expect(BOSS_DIFFICULTIES.map(mode => bossEncounter('astral-sovereign', mode.id).minimumLevel)).toEqual([70, 75, 85, 100]);
    expect(BOSS_DIFFICULTIES.map(mode => bossEncounter('void-devourer', mode.id).minimumLevel)).toEqual([80, 85, 95, 110]);
    expect(BOSS_DIFFICULTIES.map(mode => bossEncounter('primordial-dragon', mode.id).minimumLevel)).toEqual([90, 95, 105, 120]);
    expect(BOSS_DIFFICULTIES.map(mode => bossEncounter('relic-sovereign', mode.id).minimumLevel)).toEqual([100, 105, 115, 130]);
    expect(bossEncounter('dusk-prowler', 'ultimate').minimumLevel).toBe(60);
    expect(bossEncounter('frost-titan', 'ultimate').minimumLevel).toBe(70);
    expect(bossEncounter('cloud-sovereign', 'ultimate').minimumLevel).toBe(80);
  });

  it('keeps exactly the first five normal encounters free and requires Plus for all other encounters', () => {
    expect(FREE_BOSS_MAX_LEVEL).toBe(50);
    const freeBosses = ['mosswarden', 'emberwyrm', 'dusk-prowler', 'frost-titan', 'cloud-sovereign'];
    expect(BOSS_CATALOG.filter(boss => !bossRequiresPlus(boss.id)).map(boss => boss.id)).toEqual(freeBosses);
    for (const boss of BOSS_CATALOG) {
      for (const mode of BOSS_DIFFICULTIES) {
        const paid = mode.id !== 'normal' || !freeBosses.includes(boss.id);
        expect(bossRequiresPlus(boss.id, mode.id)).toBe(paid);
        expect(bossEncounter(boss.id, mode.id).futurePlus).toBe(paid);
      }
    }
    // The Cloud King's combat recommendation is 55; access uses its base level of 50.
    expect(bossEncounter('cloud-sovereign').recommendedLevel).toBe(55);
    expect(bossRequiresPlus('cloud-sovereign')).toBe(false);
    expect(bossRequiresPlus('bloodmoon-regent')).toBe(true);
  });

  it('assigns real fixed combat values rather than following the hero level', () => {
    expect(bossEncounter('mosswarden').stats).toEqual({ level: 10, maxHp: 240, attack: 30, defense: 7 });
    expect(bossEncounter('emberwyrm').stats).toEqual({ level: 20, maxHp: 360, attack: 46, defense: 12 });
    expect(bossEncounter('dusk-prowler').stats).toEqual({ level: 30, maxHp: 480, attack: 62, defense: 17 });
    expect(bossEncounter('bloodmoon-regent').stats).toEqual({ level: 60, maxHp: 1400, attack: 130, defense: 35 });
    expect(bossEncounter('astral-sovereign').stats).toEqual({ level: 70, maxHp: 1420, attack: 151, defense: 39 });
    expect(bossEncounter('frost-titan').stats).toEqual({ level: 40, maxHp: 600, attack: 78, defense: 22 });
    expect(bossEncounter('cloud-sovereign').stats).toEqual({ level: 55, maxHp: 1390, attack: 135, defense: 35 });
    expect(['normal', 'hard', 'epic', 'ultimate'].map(mode => bossEncounter('cloud-sovereign', mode as 'normal').recommendedLevel)).toEqual([55, 65, 75, 85]);
    expect(bossEncounter('void-devourer').stats).toEqual({ level: 80, maxHp: 2180, attack: 210, defense: 54 });
    expect(bossEncounter('primordial-dragon').stats).toEqual({ level: 90, maxHp: 2640, attack: 255, defense: 66 });
    expect(bossEncounter('relic-sovereign').stats).toEqual({ level: 100, maxHp: 3200, attack: 304, defense: 80 });
    expect(bossEncounter('relic-sovereign', 'ultimate').stats.level).toBe(130);
    expect(bossEncounter('mosswarden', 'ultimate').stats).toEqual({ level: 40, maxHp: 600, attack: 78, defense: 22 });
  });

  it('reveals only the first boss for a fresh account and advances on a clear in any mode', () => {
    expect(discoveredBosses(null).map(boss => boss.id)).toEqual(['mosswarden']);
    const snapshot = { bossProgress: { clearedEncounterIds: ['mosswarden:hard'], unlockedCosmetics: [] } };
    expect(discoveredBosses(snapshot).map(boss => boss.id)).toEqual(['mosswarden', 'emberwyrm']);
    expect(isBossDiscovered(snapshot, 'cloud-sovereign')).toBe(false);
  });

  it('does not reveal future bosses from malformed or isolated clears, and preserves historical progress', () => {
    const snapshot = { bossProgress: { clearedEncounterIds: ['astral-sovereign:ultimate', 'mosswarden:invented', 'cloud-sovereign:normal'], unlockedCosmetics: [] } };
    const before = structuredClone(snapshot);
    expect(discoveredBosses(snapshot).map(boss => boss.id)).toEqual(['mosswarden']);
    expect(snapshot).toEqual(before);
    snapshot.bossProgress.clearedEncounterIds.push('mosswarden:epic');
    expect(discoveredBosses(snapshot).map(boss => boss.id)).toEqual(['mosswarden', 'emberwyrm']);
    snapshot.bossProgress.clearedEncounterIds.push('emberwyrm:hard');
    expect(discoveredBosses(snapshot).map(boss => boss.id)).toEqual(['mosswarden', 'emberwyrm', 'dusk-prowler']);
    snapshot.bossProgress.clearedEncounterIds.push('frost-titan:normal');
    expect(discoveredBosses(snapshot)).toHaveLength(3);
    snapshot.bossProgress.clearedEncounterIds.push('dusk-prowler:normal');
    expect(discoveredBosses(snapshot)).toHaveLength(6);
    expect(isBossDiscovered(snapshot, 'astral-sovereign')).toBe(false);
    snapshot.bossProgress.clearedEncounterIds.push('bloodmoon-regent:normal');
    expect(discoveredBosses(snapshot)).toHaveLength(8);
    expect(snapshot.bossProgress.clearedEncounterIds).toContain('astral-sovereign:ultimate');
  });

  it('rejects invented modes/bosses and uses stable ownership keys', () => {
    expect(() => bossEncounter('invented' as never)).toThrow();
    expect(() => bossEncounter('mosswarden', 'nightmare' as never)).toThrow();
    expect(() => bossRequiresPlus('invented' as never)).toThrow();
    expect(() => bossRequiresPlus('mosswarden', 'nightmare' as never)).toThrow();
    expect(bossEncounterId('mosswarden', 'ultimate')).toBe('mosswarden:ultimate');
  });
});
