import { createMockSnapshot } from '../data/mock-data';
import { BattleAbilityId, createBossBattle, createPracticeBattle } from './auto-battle';
import { BOSS_CATALOG, BOSS_DIFFICULTIES, BossId, bossEncounter } from './boss-catalog';

function build(level: number, trained = false) {
  const snapshot = createMockSnapshot();
  snapshot.character.totalXp = (level - 1) * 1200 + (level - 1) * (level - 2) * 100;
  snapshot.character.attributes = { strength: 1, endurance: 1, focus: 1, knowledge: 1, mindfulness: 1, recovery: 1 };
  snapshot.skills = trained ? ['calisthenics', 'running', 'bjj', 'programming', 'meditation', 'recovery']
    .map(skillId => ({ skillId, totalXp: Math.floor(snapshot.character.totalXp * .35 / 6) })) : [];
  return snapshot;
}

const patterns: { bossId: BossId; abilities: BattleAbilityId[] }[] = [
  { bossId: 'mosswarden', abilities: ['root-strike', 'bark-guard'] },
  { bossId: 'emberwyrm', abilities: ['ember-claw', 'ember-charge', 'ember-breath'] },
  { bossId: 'dusk-prowler', abilities: ['dusk-bite', 'dusk-leap', 'dusk-guard', 'dusk-frenzy'] },
  { bossId: 'bloodmoon-regent', abilities: ['ruby-blade', 'bloodmoon-seal', 'lunar-eclipse'] },
  { bossId: 'astral-sovereign', abilities: ['astral-strike', 'star-seal', 'starburst'] },
  { bossId: 'frost-titan', abilities: ['frost-strike', 'frost-guard', 'frost-charge', 'frost-crush'] },
  { bossId: 'void-devourer', abilities: ['void-rend', 'gravity-well', 'event-horizon'] },
  { bossId: 'primordial-dragon', abilities: ['primal-claw', 'prism-charge', 'cosmic-breath', 'wing-tempest'] },
  { bossId: 'relic-sovereign', abilities: ['relic-volley', 'royal-aegis', 'sovereign-blade', 'imperial-charge', 'imperial-rain'] },

];

describe('the campaign boss identities', () => {
  it.each(patterns.flatMap(pattern => BOSS_DIFFICULTIES.map(mode => ({ ...pattern, difficulty: mode.id }))))(
    '$bossId / $difficulty uses its real mechanics and keeps charged damage announced', ({ bossId, abilities, difficulty }) => {
      const replay = createBossBattle(build(bossEncounter(bossId, difficulty).recommendedLevel, bossEncounter(bossId).baseLevel >= 80), { bossId, difficulty });
      expect(replay.outcome).toBe('victory');
      const turns = replay.turns.filter(turn => turn.actor === 'boss');
      expect(new Set(turns.map(turn => turn.abilityId))).toEqual(new Set(abilities));
      const prerequisite: Partial<Record<BattleAbilityId, BattleAbilityId>> = {
        'event-horizon': 'gravity-well', 'cosmic-breath': 'prism-charge', 'imperial-rain': 'imperial-charge',
        'lunar-eclipse': 'bloodmoon-seal', 'dusk-frenzy': 'dusk-guard', 'ember-breath': 'ember-charge', starburst: 'star-seal', 'frost-crush': 'frost-charge',
      };
      for (let i = 0; i < turns.length; i++) {
        const tell = prerequisite[turns[i].abilityId!];
        if (tell) {
          expect(turns[i - 1]).toMatchObject({ abilityId: tell, damage: 0, critical: false });
          expect(turns[i].damage).toBeGreaterThan(0);
        }
        if (['gravity-well', 'prism-charge', 'royal-aegis', 'imperial-charge', 'bloodmoon-seal', 'dusk-guard', 'bark-guard', 'ember-charge', 'star-seal', 'frost-guard', 'frost-charge'].includes(turns[i].abilityId!)) {
          expect(turns[i].damage).toBe(0);
        }
      }
      expect(replay.rewards).toEqual({ xp: 0, loot: [] });
    },
  );

  it('makes bark protect one strike, then restores ordinary damage without a miss', () => {
    const turns = createBossBattle(build(10), { bossId: 'mosswarden' }).turns;
    expect(turns[4].damage).toBe(36);
    expect(turns[5]).toMatchObject({ abilityId: 'bark-guard', damage: 0 });
    expect(turns[6]).toMatchObject({ abilityId: 'guarded-strike', damage: 25 });
    expect(turns[8]).toMatchObject({ critical: true, damage: 57 });
    expect(turns[8].abilityId).toBeUndefined();
  });

  it('locks firebreath to the announced power even if a hero strike crosses a phase', () => {
    const turns = createBossBattle(build(20), { bossId: 'emberwyrm' }).turns;
    expect(turns[3]).toMatchObject({ abilityId: 'ember-charge', bossPhase: 'awakening', damage: 0 });
    expect(turns[5]).toMatchObject({ abilityId: 'ember-breath', bossPhase: 'resistance', damage: 66 });
    expect(turns[1].damage).toBe(27);
  });

  it('combines the astral seal with one protected hit and a charged starburst', () => {
    const turns = createBossBattle(build(70), { bossId: 'astral-sovereign' }).turns;
    expect(turns[0].damage).toBe(184);
    expect(turns[3]).toMatchObject({ abilityId: 'star-seal', damage: 0 });
    expect(turns[4]).toMatchObject({ abilityId: 'guarded-strike', damage: 101 });
    expect(turns[5]).toMatchObject({ abilityId: 'starburst', damage: 243 });
    expect(turns[6].damage).toBe(184);
    expect(turns[6].abilityId).toBeUndefined();
  });

  it('gives the panther a harmless rune tell, one shielded hit, then two armor-mitigated frenzy hits', () => {
    const snapshot = build(30);
    const turns = createBossBattle(snapshot, { bossId: 'dusk-prowler' }).turns;
    expect(turns[1]).toMatchObject({ abilityId: 'dusk-bite', damage: 35 });
    expect(turns[3]).toMatchObject({ abilityId: 'dusk-leap', damage: 41 });
    expect(turns[5]).toMatchObject({ abilityId: 'dusk-guard', damage: 0, critical: false });
    expect(turns[5].heroHp).toBe(turns[4].heroHp);
    expect(turns[6]).toMatchObject({ abilityId: 'guarded-strike', damage: 51 });
    expect(turns[7]).toMatchObject({ abilityId: 'dusk-frenzy', damage: 48, critical: true });
    expect(turns[8]).toMatchObject({ damage: 137 });
    expect(turns[8].abilityId).toBeUndefined();
    const guarded = createBossBattle(snapshot, { bossId: 'dusk-prowler', tactic: 'guard' });
    expect(guarded.turns.find(turn => turn.abilityId === 'dusk-frenzy')?.damage).toBe(36);
  });

  it('makes the later astral encounter stronger in absolute terms, with skill training helping at seventy', () => {
    const options = { bossId: 'astral-sovereign' as const };
    const baseline = build(70);
    const untrained = createBossBattle(baseline, options);
    expect(untrained.outcome).toBe('victory');
    expect(untrained.turns.at(-1)?.heroHp).toBe(27);
    const trained = build(70);
    trained.skills = ['calisthenics', 'running', 'bjj', 'programming', 'meditation', 'recovery']
      .map(skillId => ({ skillId, totalXp: 32200 }));
    const result = createBossBattle(trained, options);
    expect(result.outcome).toBe('victory');
    expect(result.turns.at(-1)!.heroHp / result.hero.stats.maxHp).toBeGreaterThan(.5);
    expect(result.roundCount).toBeLessThan(untrained.roundCount);
    const chapterFinale = bossEncounter('cloud-sovereign');
    expect(result.boss.stats.maxHp).toBeGreaterThan(chapterFinale.stats.maxHp);
    expect(result.boss.stats.attack).toBeGreaterThan(chapterFinale.stats.attack);
    expect(result.boss.stats.defense).toBeGreaterThan(chapterFinale.stats.defense);
    expect(result.rewards).toEqual({ xp: 0, loot: [] });
  });

  it('announces the regent’s eclipse, shields one strike and restores only her own capped HP', () => {
    const replay = createBossBattle(build(60), { bossId: 'bloodmoon-regent' });
    expect(replay.outcome).toBe('victory');
    expect(replay.turns[3]).toMatchObject({ abilityId: 'bloodmoon-seal', damage: 0, healing: 0, heroHp: 886 });
    expect(replay.turns[4]).toMatchObject({ abilityId: 'guarded-strike', damage: 102, bossHp: 982 });
    expect(replay.turns[5]).toMatchObject({ abilityId: 'lunar-eclipse', damage: 176, healing: 28, bossHp: 1010, heroHp: 710 });
    expect(replay.turns[6].abilityId).toBeUndefined();
    // The announced resistance power stays fixed despite crossing into last stand before impact.
    expect(replay.turns[11].bossPhase).toBe('resistance');
    expect(replay.turns[12].bossPhase).toBe('last-stand');
    expect(replay.turns[13]).toMatchObject({ damage: 210, healing: 28, bossHp: 366, bossPhase: 'resistance' });
    expect(replay.turns.at(-1)?.heroHp).toBe(61);
    for (let i = 1; i < replay.turns.length; i++) {
      const turn = replay.turns[i];
      const previous = replay.turns[i - 1];
      if (turn.actor === 'boss') {
        expect(turn.heroHp).toBe(previous.heroHp - turn.damage);
        expect(turn.bossHp).toBe(previous.bossHp + turn.healing);
        expect(turn.bossHp).toBeLessThanOrEqual(1400);
        expect(turn.healing).toBeLessThanOrEqual(28);
        if (turn.healing) expect(turn.abilityId).toBe('lunar-eclipse');
      }
    }
  });

  it('caps regent healing to actual damage and missing health, with none from fully mitigated life drain', () => {
    const fatal = createPracticeBattle(build(60), { bossId: 'bloodmoon-regent', heroHp: 90 });
    expect(fatal.turns.find(turn => turn.abilityId === 'lunar-eclipse'))
      .toMatchObject({ damage: 11, healing: 2, heroHp: 0, bossHp: 984 });
    const durable = build(1);
    durable.character.attributes.endurance = 200;
    const overheal = createPracticeBattle(durable, { bossId: 'bloodmoon-regent' });
    expect(overheal.turns.find(turn => turn.abilityId === 'lunar-eclipse'))
      .toMatchObject({ healing: 3, bossHp: 1400 });
    durable.character.attributes.endurance = 1000;
    durable.character.attributes.mindfulness = 1000;
    const mitigated = createPracticeBattle(durable, { bossId: 'bloodmoon-regent' });
    const eclipses = mitigated.turns.filter(turn => turn.abilityId === 'lunar-eclipse');
    expect(eclipses.length).toBeGreaterThan(0);
    expect(eclipses.every(turn => turn.damage === 1 && turn.healing === 0)).toBe(true);
  });

  it('keeps the ice armor for exactly two attacks and does not spend it on healing', () => {
    const turns = createBossBattle(build(40), { bossId: 'frost-titan' }).turns;
    expect(turns[3]).toMatchObject({ abilityId: 'frost-guard', damage: 0 });
    expect(turns[4]).toMatchObject({ abilityId: 'guarded-strike', damage: 72 });
    expect(turns[6]).toMatchObject({ abilityId: 'guarded-strike', damage: 72 });
    expect(turns[8]).toMatchObject({ damage: 177 });
    expect(turns[8].abilityId).toBeUndefined();
    const wounded = createPracticeBattle(build(40), { bossId: 'frost-titan', tactic: 'guard', heroHp: 100 });
    expect(wounded.turns[4]).toMatchObject({ action: 'renewal', damage: 0 });
    expect(wounded.turns[4].abilityId).toBeUndefined();
    expect(wounded.turns[6].abilityId).toBe('guarded-strike');
    expect(wounded.turns[8].abilityId).toBe('guarded-strike');
  });

  it.each([['void-devourer', 80], ['primordial-dragon', 90], ['relic-sovereign', 100]] as const)(
    '%s rewards balanced real-life training at its base level and retains every prior ownership field', (bossId, level) => {
      const plain = build(level), trained = build(level, true), before = structuredClone(trained);
      expect(createBossBattle(plain, { bossId }).outcome).toBe('defeat');
      const replay = createBossBattle(trained, { bossId });
      expect(replay.outcome).toBe('victory');
      expect(replay.rewards).toEqual({ xp: 0, loot: [] });
      expect(trained).toEqual(before);
    },
  );

  it('caps Aureon’s late pressure and preserves the attack power announced before a stronger round', () => {
    const durable = build(1);
    durable.character.attributes = { strength: 1, endurance: 300, focus: 1, knowledge: 1, mindfulness: 0, recovery: 500 };
    const replay = createPracticeBattle(durable, { bossId: 'relic-sovereign' });
    const turns = replay.turns.filter(turn => turn.actor === 'boss');
    expect(turns.find(turn => turn.round === 4)).toMatchObject({ abilityId: 'imperial-charge', damage: 0 });
    expect(turns.find(turn => turn.round === 5)).toMatchObject({ abilityId: 'imperial-rain', damage: 120 });
    expect(turns.find(turn => turn.round === 10)).toMatchObject({ abilityId: 'imperial-charge', damage: 0 });
    expect(turns.find(turn => turn.round === 11)).toMatchObject({ abilityId: 'imperial-rain', damage: 264 });
    for (const round of [12, 13, 18, 19]) expect(turns.find(turn => turn.round === round))
      .toMatchObject({ abilityId: 'relic-volley', damage: 33 });
    expect(replay.roundCount).toBe(20);
  });

  it.each(BOSS_DIFFICULTIES)('$id retains the cloud king as the hardest opening-chapter encounter', mode => {
    const finale = bossEncounter('cloud-sovereign', mode.id);
    const finaleReplay = createBossBattle(build(finale.recommendedLevel), { bossId: finale.id, difficulty: mode.id });
    const finaleHpRatio = finaleReplay.turns.at(-1)!.heroHp / finaleReplay.hero.stats.maxHp;
    for (const boss of BOSS_CATALOG.slice(0, 4)) {
      const encounter = bossEncounter(boss.id, mode.id);
      expect(finale.stats.maxHp).toBeGreaterThan(encounter.stats.maxHp);
      expect(finale.stats.attack).toBeGreaterThan(encounter.stats.attack);
      const replay = createBossBattle(build(encounter.recommendedLevel), { bossId: boss.id, difficulty: mode.id });
      expect(replay.turns.at(-1)!.heroHp / replay.hero.stats.maxHp).toBeGreaterThan(finaleHpRatio);
    }
  });
});
