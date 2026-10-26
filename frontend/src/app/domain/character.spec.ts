import { AURA_REWARDS } from './aura-rewards';
import { CharacterPresentation, CharacterProfile } from './models';
import {
  ILLUSTRATED_CHARACTERS,
  ILLUSTRATED_COLOR_PALETTES,
  resolveCharacterIllustration,
} from './character-illustrations';
import {
  CHARACTER_HAIRSTYLES,
  CHARACTER_OPTIONS,
  CHARACTER_PRESENTATIONS,
  defaultHairstyle,
  migrateLegacyCharacterProfile,
  normalizeCharacterProfile,
} from './character';

describe('character profile validation', () => {
  const profile: CharacterProfile = {
    name: '  Élia  Moon  ',
    appearance: {
      presentation: 'male',
      body: 'base',
      hair: 'm-spiky',
      outfit: 'wanderer',
      aura: 'sage',
      skinColor: '#E8C3A2',
      hairColor: '#5c4934',
      outfitColor: '#718967',
    },
  };

  it('normalizes a current profile without changing its name, legacy options or source object', () => {
    const before = structuredClone(profile);
    const result = normalizeCharacterProfile(profile);
    expect(result.name).toBe('Élia Moon');
    expect(result.appearance).toMatchObject({
      skinColor: '#e8c3a2',
      outfit: 'wanderer',
      presentation: 'male',
      artwork: 'original',
    });
    expect(profile).toEqual(before);
    expect(result.appearance).not.toBe(profile.appearance);
  });

  it('preserves known boss editions but rejects unknown or wrong-slot reward IDs', () => {
    const appearance = { ...profile.appearance, cosmeticHair: 'moss-crown', cosmeticOutfit: 'cinder-forged' };
    expect(normalizeCharacterProfile({ ...profile, appearance }).appearance).toMatchObject({ cosmeticHair: 'moss-crown', cosmeticOutfit: 'cinder-forged' });
    for (const patch of [{ cosmeticHair: 'cinder-forged' }, { cosmeticOutfit: 'moss-crown' }, { cosmeticHair: 'invented' }]) {
      expect(() => normalizeCharacterProfile({ ...profile, appearance: { ...appearance, ...patch } })).toThrow('Bossbelohnung');
    }
  });

  it.each(['male', 'female'] as const)(
    'migrates %s custom profiles to illustrated artwork without manufacturing colors or modules',
    (presentation) => {
      const input = {
        ...profile,
        appearance: {
          ...profile.appearance,
          presentation,
          hair: defaultHairstyle(presentation),
          artwork: 'custom',
        },
      };
      const before = structuredClone(input);
      const result = normalizeCharacterProfile(input);
      expect(result.name).toBe('Élia Moon');
      expect(result.appearance.artwork).toBe('original');
      for (const slot of ['illustratedHair', 'outfitSet', 'eyeColor', 'skinTone', 'hairTint']) {
        expect(result.appearance).not.toHaveProperty(slot);
      }
      expect(input).toEqual(before);
    },
  );

  it.each([null, '', 'unknown', 0, {}, []])('rejects unavailable artwork %j', (artwork) => {
    expect(() =>
      normalizeCharacterProfile({ ...profile, appearance: { ...profile.appearance, artwork } }),
    ).toThrow('Look');
  });

  it('offers six illustrated presets per presentation and retains the approved original defaults', () => {
    expect(new Set(ILLUSTRATED_CHARACTERS.map((entry) => entry.id)).size).toBe(12);
    for (const presentation of ['male', 'female'] as const) {
      expect(
        ILLUSTRATED_CHARACTERS.filter((entry) => entry.presentation === presentation),
      ).toHaveLength(6);
      const original = normalizeCharacterProfile({
        ...profile,
        appearance: {
          ...profile.appearance,
          presentation,
          hair: defaultHairstyle(presentation),
        },
      });
      expect(resolveCharacterIllustration(original.appearance).id).toBe(
        presentation === 'male' ? 'emerald-knight' : 'moonblade',
      );
      expect(original.appearance).not.toHaveProperty('illustration');
    }
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const result = normalizeCharacterProfile({
        ...profile,
        appearance: {
          ...profile.appearance,
          presentation: preset.presentation,
          hair: defaultHairstyle(preset.presentation),
          illustration: preset.id,
        },
      });
      expect(resolveCharacterIllustration(result.appearance)).toBe(preset);
    }
  });

  it('allows independent hair and outfit modules without changing the selected preset or input', () => {
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const same = ILLUSTRATED_CHARACTERS.filter(
        (entry) => entry.presentation === preset.presentation,
      );
      for (const hair of same) {
        for (const outfit of same) {
          const input = {
            ...profile,
            totalXp: 9999,
            appearance: {
              ...profile.appearance,
              presentation: preset.presentation,
              hair: defaultHairstyle(preset.presentation),
              illustration: preset.id,
              illustratedHair: hair.id,
              outfitSet: outfit.id,
            },
          };
          const before = structuredClone(input);
          const result = normalizeCharacterProfile(input);
          expect(result.appearance).toMatchObject({
            illustration: preset.id,
            illustratedHair: hair.id,
            outfitSet: outfit.id,
          });
          expect(result).not.toHaveProperty('totalXp');
          expect(input).toEqual(before);
        }
      }
    }
  });

  it('rejects unknown and cross-presentation presets or modules, including old custom inputs', () => {
    for (const slot of ['illustration', 'illustratedHair', 'outfitSet']) {
      for (const value of [
        null,
        '',
        'unreleased',
        [],
        {},
        'https://example.org/hair.png',
        'moonblade',
      ]) {
        expect(() =>
          normalizeCharacterProfile({
            ...profile,
            appearance: {
              ...profile.appearance,
              artwork: 'custom',
              [slot]: value,
            },
          }),
        ).toThrow('Charakterdarstellung');
      }
      expect(() =>
        normalizeCharacterProfile({
          ...profile,
          appearance: {
            ...profile.appearance,
            presentation: 'female',
            hair: 'f-bob',
            [slot]: 'emerald-knight',
          },
        }),
      ).toThrow('Charakterdarstellung');
    }
    expect(
      resolveCharacterIllustration({ ...profile.appearance, illustration: 'moonblade' }).id,
    ).toBe('emerald-knight');
  });

  it('accepts only palette colors and preserves absent values as original artwork colors', () => {
    for (const [slot, palette] of Object.entries(ILLUSTRATED_COLOR_PALETTES)) {
      expect(palette).toHaveLength(6);
      expect(new Set(palette.map((color) => color.hex)).size).toBe(6);
      for (const color of palette) {
        const result = normalizeCharacterProfile({
          ...profile,
          appearance: { ...profile.appearance, [slot]: color.hex.toUpperCase() },
        });
        expect(result.appearance).toHaveProperty(slot, color.hex);
      }
      const original = normalizeCharacterProfile({
        ...profile,
        appearance: { ...profile.appearance, [slot]: undefined },
      });
      expect(original.appearance).not.toHaveProperty(slot);
      for (const value of [
        null,
        [],
        {},
        0,
        '',
        '#ffffff',
        'red',
        'url(https://example.org)',
        palette[0].hex + ';',
      ]) {
        expect(() =>
          normalizeCharacterProfile({
            ...profile,
            appearance: { ...profile.appearance, [slot]: value },
          }),
        ).toThrow('Palette');
      }
    }
  });

  it('accepts each of the twelve hairstyles for its presentation', () => {
    expect(CHARACTER_PRESENTATIONS.map((option) => option.id)).toEqual(['male', 'female']);
    expect(CHARACTER_OPTIONS.hair).toHaveLength(12);
    expect(new Set(CHARACTER_OPTIONS.hair.map((option) => option.id)).size).toBe(12);
    for (const { id: presentation } of CHARACTER_PRESENTATIONS) {
      const styles = CHARACTER_HAIRSTYLES[presentation];
      expect(styles).toHaveLength(6);
      expect(defaultHairstyle(presentation)).toBe(styles[0].id);
      for (const hairstyle of styles) {
        expect(
          normalizeCharacterProfile({
            ...profile,
            appearance: { ...profile.appearance, presentation, hair: hairstyle.id },
          }).appearance,
        ).toMatchObject({ presentation, hair: hairstyle.id });
      }
    }
  });

  it('rejects every hairstyle paired with the other presentation', () => {
    for (const { id: presentation } of CHARACTER_PRESENTATIONS) {
      const other: CharacterPresentation = presentation === 'male' ? 'female' : 'male';
      for (const hairstyle of CHARACTER_HAIRSTYLES[other]) {
        expect(() =>
          normalizeCharacterProfile({
            ...profile,
            appearance: { ...profile.appearance, presentation, hair: hairstyle.id },
          }),
        ).toThrow('nicht verfügbar');
      }
    }
  });

  it('accepts every other creator choice and names beyond ASCII', () => {
    for (const [slot, options] of Object.entries(CHARACTER_OPTIONS)) {
      if (slot === 'hair') continue;
      for (const option of options) {
        expect(() =>
          normalizeCharacterProfile({
            name: '李明',
            appearance: { ...profile.appearance, [slot]: option.id },
          }),
        ).not.toThrow();
      }
    }
    expect(normalizeCharacterProfile({ ...profile, name: 'Noé O’Neill-2' }).name).toBe(
      'Noé O’Neill-2',
    );
  });

  it('migrates old hair explicitly and uses a technical default without name inference', () => {
    const appearance: Record<string, unknown> = { ...profile.appearance };
    delete appearance['presentation'];
    for (const [hair, expected] of [
      ['tousled', 'm-spiky'],
      ['bob', 'm-curtains'],
      ['braid', 'm-topknot'],
    ]) {
      const legacy = { name: 'Liora', appearance: { ...appearance, hair } };
      expect(() => normalizeCharacterProfile(legacy)).toThrow('Charakterdarstellung');
      expect(migrateLegacyCharacterProfile(legacy).appearance).toMatchObject({
        presentation: 'male',
        hair: expected,
      });
      expect(legacy.appearance).not.toHaveProperty('presentation');
    }
    for (const [hair, expected] of [
      ['tousled', 'f-pixie'],
      ['bob', 'f-bob'],
      ['braid', 'f-braid'],
    ]) {
      expect(
        migrateLegacyCharacterProfile({
          ...profile,
          appearance: { ...profile.appearance, presentation: 'female', hair },
        }).appearance,
      ).toMatchObject({ presentation: 'female', hair: expected });
    }
  });

  it.each([undefined, null, '', 'unknown', 0])(
    'rejects invalid current and explicit legacy presentation %j',
    (presentation) => {
      const invalid = { ...profile, appearance: { ...profile.appearance, presentation } };
      expect(() => normalizeCharacterProfile(invalid)).toThrow('Charakterdarstellung');
      expect(() => migrateLegacyCharacterProfile(invalid)).toThrow('Charakterdarstellung');
    },
  );

  it.each([null, [], { name: 'Ari', appearance: [] }, { name: 'Ari', appearance: null }])(
    'rejects malformed input %j at both boundaries',
    (input) => {
      expect(() => normalizeCharacterProfile(input)).toThrow();
      expect(() => migrateLegacyCharacterProfile(input)).toThrow();
    },
  );

  it.each(['', ' A ', 'a'.repeat(25), '<script>', 'Ada\nMoon', 'Ada⭐'])(
    'rejects invalid name %j',
    (name) => {
      expect(() => normalizeCharacterProfile({ ...profile, name })).toThrow('2–24');
    },
  );

  it('rejects unknown slot ids and non-hex SVG fill values', () => {
    expect(() =>
      normalizeCharacterProfile({
        ...profile,
        appearance: { ...profile.appearance, outfit: 'unreleased' },
      }),
    ).toThrow('nicht verfügbar');
    expect(() =>
      normalizeCharacterProfile({
        ...profile,
        appearance: { ...profile.appearance, hairColor: 'url(https://example.org)' },
      }),
    ).toThrow('gültige Farbe');
  });

  it('accepts earned aura IDs at the profile boundary while keeping only the two starter options', () => {
    expect(CHARACTER_OPTIONS.aura.map(aura => aura.id)).toEqual(['none', 'sage']);
    expect(AURA_REWARDS.map((aura) => aura.unlock)).toEqual([
      { kind: 'level', level: 5 },
      { kind: 'level', level: 10 },
      { kind: 'level', level: 20 },
      { kind: 'level', level: 40 },
      { kind: 'boss-drop', bossId: 'mosswarden', bossName: 'Der Mooswächter' },
    ]);
    for (const aura of AURA_REWARDS) {
      expect(CHARACTER_OPTIONS.aura.some((available) => String(available.id) === aura.id)).toBe(
        false,
      );
      expect(
        normalizeCharacterProfile({
          ...profile,
          appearance: { ...profile.appearance, aura: aura.id },
        }).appearance.aura,
      ).toBe(aura.id);
    }
  });
});
