import { BOSS_CATALOG, BOSS_DIFFICULTIES } from './boss-catalog';
import { BOSS_COSMETICS, bossCosmeticForAppearance, bossFirstClearReward, hasBossCosmetic, resolveBossCosmetic } from './boss-loot';
import { AURA_DESIGNS } from './aura-designs';
import { ILLUSTRATED_CHARACTERS } from './character-illustrations';
import { hasAuraAccess, isKnownAura, AURA_REWARDS } from './aura-rewards';
import { createMockSnapshot } from '../data/mock-data';
import { portraitLayers } from './character-rig';

describe('first-clear boss cosmetics', () => {
  it('grants one distinct reward for each of the forty encounters, with increasing rarity', () => {
    expect(BOSS_COSMETICS).toHaveLength(40);
    expect(new Set(BOSS_COSMETICS.map(item => item.id)).size).toBe(40);
    for (const boss of BOSS_CATALOG) {
      expect(BOSS_DIFFICULTIES.map(mode => bossFirstClearReward(boss.id, mode.id).rarity))
        .toEqual(['rare', 'epic', 'legendary', 'mythic']);
      expect(BOSS_DIFFICULTIES.map(mode => bossFirstClearReward(boss.id, mode.id).slot))
        .toEqual(['hair', 'outfit', 'aura', 'aura']);
    }
  });

  it('uses painted modules for both presentations, exclusive tint variants, and implemented auras', () => {
    for (const item of BOSS_COSMETICS) {
      if (item.slot === 'aura') {
        expect(AURA_DESIGNS.some(design => design.id === item.auraId)).toBe(true);
        expect(isKnownAura(item.auraId!)).toBe(true);
        expect(AURA_REWARDS.some(reward => reward.id === item.auraId)).toBe(false);
      } else {
        expect(item.tint).toMatch(/^#[a-f0-9]{6}$/);
        for (const presentation of ['male', 'female'] as const) {
          expect(ILLUSTRATED_CHARACTERS.some(module => module.id === item.modules![presentation] && module.presentation === presentation)).toBe(true);
        }
      }
    }
    expect(new Set(BOSS_COSMETICS.filter(item => item.tint).map(item => item.tint)).size).toBe(20);
  });

  it('requires persisted ownership and never treats a high level as a reward', () => {
    const snapshot = createMockSnapshot();
    snapshot.character.totalXp = 1_000_000;
    expect(hasBossCosmetic(snapshot, 'moss-crown')).toBe(false);
    expect(hasAuraAccess(snapshot, 'guardian')).toBe(false);
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] };
    snapshot.unlockedAuras.push('guardian');
    expect(hasBossCosmetic(snapshot, 'moss-crown')).toBe(true);
    expect(hasBossCosmetic(snapshot, 'astral-crown')).toBe(false);
    expect(hasBossCosmetic({ bossProgress: { clearedEncounterIds: [], unlockedCosmetics: ['invented'] } }, 'invented')).toBe(false);
    expect(hasAuraAccess(snapshot, 'guardian')).toBe(true);
  });

  it('resolves earned variants only in their correct slot', () => {
    const appearance = { ...createMockSnapshot().character.appearance, cosmeticHair: 'moss-crown', cosmeticOutfit: 'astral-regalia' };
    expect(bossCosmeticForAppearance(appearance, 'hair')?.modules?.male).toBe('forest-scout');
    expect(bossCosmeticForAppearance(appearance, 'outfit')?.modules?.female).toBe('starweaver');
    expect(bossCosmeticForAppearance({ ...appearance, cosmeticHair: 'astral-regalia' }, 'hair')).toBeUndefined();
    expect(() => bossFirstClearReward('invented' as never, 'normal')).toThrow();
  });

  it('resolves every earned family into separate matching hair or equipment forms without changing ownership', () => {
    const originalCatalog = structuredClone(BOSS_COSMETICS);
    const snapshot = createMockSnapshot();
    snapshot.bossProgress = { clearedEncounterIds: [], unlockedCosmetics: BOSS_COSMETICS.map(item => item.id) };
    const originalProgress = structuredClone(snapshot.bossProgress);
    const distinctNames = new Set<string>();
    for (const family of BOSS_COSMETICS) {
      const male = resolveBossCosmetic(family.id, 'male')!;
      const female = resolveBossCosmetic(family.id, 'female')!;
      expect(male.id).toBe(family.id); expect(female.id).toBe(family.id);
      expect(male.familyName).toBe(family.name); expect(female.familyName).toBe(family.name);
      if (family.slot === 'aura') {
        expect(male).toEqual(female);
        expect(male.variant).toBe('unisex'); expect(male.moduleId).toBeUndefined();
      } else {
        expect(male.name).not.toBe(female.name);
        expect(male.moduleId).not.toBe(female.moduleId);
        for (const variant of [male, female]) {
          expect(ILLUSTRATED_CHARACTERS.find(item => item.id === variant.moduleId)?.presentation).toBe(variant.variant);
          const appearance = { ...snapshot.character.appearance, presentation: variant.variant as 'male' | 'female',
            illustration: variant.variant === 'male' ? 'emerald-knight' : 'moonblade',
            [family.slot === 'hair' ? 'cosmeticHair' : 'cosmeticOutfit']: family.id };
          const worn = portraitLayers(appearance).find(layer => layer.key === (family.slot === 'hair' ? 'hair-color' : 'outfit'))!;
          expect(worn.image).toBe(`/art/characters/${variant.moduleId}${family.slot === 'hair' ? '-sheet.png' : '-body-v2.webp'}`);
          expect(worn.tint).toBe(family.tint);
          expect(hasBossCosmetic(snapshot, variant.id)).toBe(true);
          distinctNames.add(variant.name);
        }
      }
    }
    expect(distinctNames.size).toBe(40);
    expect(snapshot.bossProgress).toEqual(originalProgress);
    expect(BOSS_COSMETICS).toEqual(originalCatalog);
    expect(resolveBossCosmetic('unknown', 'female')).toBeUndefined();
    expect(resolveBossCosmetic('moss-crown', 'unknown' as never)).toBeUndefined();
  });

  it('equips ten epic variants using six painted silhouettes for both character presentations', () => {
    const sets = BOSS_COSMETICS.filter(item => item.slot === 'outfit');
    expect(sets.map(item => [item.id, item.modules?.male, item.modules?.female])).toEqual([
      ['verdant-warden', 'forest-scout', 'sky-ranger'],
      ['cinder-forged', 'abyss-walker', 'moonblade'],
      ['twilight-stalker', 'emerald-knight', 'void-sorceress'],
      ['glacier-guard', 'urban-ranger', 'rose-runner'],
      ['cloud-regalia', 'ember-striker', 'dawn-priestess'],
      ['regent-regalia', 'frost-scholar', 'dawn-priestess'],
      ['astral-regalia', 'frost-scholar', 'starweaver'],
      ['voidbound-regalia', 'abyss-walker', 'void-sorceress'],
      ['prismatic-scale', 'emerald-knight', 'moonblade'],
      ['sovereign-regalia', 'frost-scholar', 'dawn-priestess'],
    ]);
    expect(new Set(sets.map(item => item.tint)).size).toBe(10);
    for (const presentation of ['male', 'female'] as const) {
      expect(new Set(sets.map(item => item.modules![presentation])).size).toBe(6);
      expect(new Set(sets.map(item => `${item.modules![presentation]}:${item.tint}`)).size).toBe(10);
      for (const reward of sets) {
        const illustration = presentation === 'male' ? 'emerald-knight' : 'moonblade';
        const appearance = { ...createMockSnapshot().character.appearance, presentation, illustration,
          cosmeticOutfit: reward.id, skinTone: '#68442f' };
        const before = structuredClone(appearance);
        const layers = portraitLayers(appearance);
        const outfitImage = `/art/characters/${reward.modules![presentation]}-body-v2.webp`;
        expect(layers.find(layer => layer.key === 'outfit')).toMatchObject({ image: outfitImage, tint: reward.tint });
        expect(layers.some(layer => layer.key.startsWith('hands'))).toBe(false);
        expect(layers.find(layer => layer.key === 'skin')?.tint).toBe('#68442f');
        // The knight's exposed neck needs a foreground collar; Moonblade's neckless face does not.
        if (presentation === 'male') expect(layers.find(layer => layer.key === 'collar')).toMatchObject({ image: outfitImage, tint: reward.tint });
        else expect(layers.find(layer => layer.key === 'collar')).toBeUndefined();
        expect(layers.find(layer => layer.key === 'head')?.image).toBe(`/art/characters/${illustration}-sheet.png`);
        expect(appearance).toEqual(before);
      }
    }
  });
});
