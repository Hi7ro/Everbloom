import { CharacterPresentation, CharacterProfile } from './models';
import { ILLUSTRATED_CHARACTERS, resolveCharacterIllustration } from './character-illustrations';
import {
  AURA_PROGRESSION_PLAN,
  CHARACTER_HAIRSTYLES,
  CHARACTER_OPTIONS,
  CHARACTER_PRESENTATIONS,
  defaultHairstyle,
  migrateLegacyCharacterProfile,
  normalizeCharacterProfile,
  resolveCharacterArtwork,
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

  it('normalizes a current profile without mutating it', () => {
    const result = normalizeCharacterProfile(profile);
    expect(result.name).toBe('Élia Moon');
    expect(result.appearance.skinColor).toBe('#e8c3a2');
    expect(result.appearance.outfit).toBe('wanderer');
    expect(result.appearance.presentation).toBe('male');
    expect(profile.name).toBe('  Élia  Moon  ');
    expect(result.appearance).not.toBe(profile.appearance);
    expect(result.appearance).not.toHaveProperty('artwork');
  });

  it('resolves old profiles without storing a synthetic artwork default', () => {
    const male = normalizeCharacterProfile(profile);
    const female = normalizeCharacterProfile({ ...profile, appearance: {
      ...profile.appearance, presentation: 'female', hair: 'f-bob',
    } });
    expect(resolveCharacterArtwork(male.appearance)).toBe('original');
    expect(resolveCharacterArtwork(female.appearance)).toBe('custom');
    expect(male.appearance).not.toHaveProperty('artwork');
    expect(female.appearance).not.toHaveProperty('artwork');
    expect(resolveCharacterArtwork({ ...male.appearance, artwork: 'custom' })).toBe('custom');
  });

  it.each(['original', 'custom'] as const)('preserves the explicit %s look', (artwork) => {
    const result = normalizeCharacterProfile({ ...profile, appearance: { ...profile.appearance, artwork } });
    expect(result.appearance.artwork).toBe(artwork);
  });

  it.each([null, '', 'unknown', 0, {}, []])('rejects unavailable artwork %j', (artwork) => {
    expect(() => normalizeCharacterProfile({ ...profile, appearance: { ...profile.appearance, artwork } })).toThrow('Look');
  });

  it('keeps the exact original default and accepts all four matching illustrated presets', () => {
    const original = normalizeCharacterProfile(profile);
    expect(resolveCharacterIllustration(original.appearance).id).toBe('emerald-knight');
    expect(original.appearance).not.toHaveProperty('illustration');
    expect(new Set(ILLUSTRATED_CHARACTERS.map((entry) => entry.id)).size).toBe(4);
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const result = normalizeCharacterProfile({ ...profile, appearance: {
        ...profile.appearance, artwork: 'original', presentation: preset.presentation,
        hair: defaultHairstyle(preset.presentation), illustration: preset.id,
      } });
      expect(result.appearance.illustration).toBe(preset.id);
      expect(resolveCharacterIllustration(result.appearance)).toBe(preset);
      expect(preset.imagePath).toBe(`/art/characters/${preset.id}-original.png`);
      expect(preset.maskPath).toBe(`/art/characters/${preset.id}-mask.png`);
    }
    const female = normalizeCharacterProfile({ ...profile, appearance: {
      ...profile.appearance, presentation: 'female', hair: 'f-bob', artwork: 'original',
    } });
    expect(resolveCharacterIllustration(female.appearance).id).toBe('moonblade');
    expect(female.appearance).not.toHaveProperty('illustration');
  });

  it.each([null, '', 'unreleased', 0, {}, []])('rejects an unavailable illustration %j', (illustration) => {
    expect(() => normalizeCharacterProfile({ ...profile, appearance: {
      ...profile.appearance, illustration,
    } })).toThrow('Illustration');
  });

  it('rejects mismatched active illustrations but safely renders the presentation default', () => {
    for (const preset of ILLUSTRATED_CHARACTERS) {
      const presentation: CharacterPresentation = preset.presentation === 'male' ? 'female' : 'male';
      const appearance = {
        ...profile.appearance, presentation, hair: defaultHairstyle(presentation),
        artwork: 'original' as const, illustration: preset.id,
      };
      expect(() => normalizeCharacterProfile({ ...profile, appearance })).toThrow('Illustration');
      expect(resolveCharacterIllustration(appearance).presentation).toBe(presentation);
      expect(normalizeCharacterProfile({ ...profile, appearance: {
        ...appearance, artwork: 'custom',
      } }).appearance.illustration).toBe(preset.id);
    }
    expect(resolveCharacterIllustration({ ...profile.appearance, illustration: 'missing' }).id).toBe('emerald-knight');
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

  it('keeps planned aura rewards unavailable to the current creator and profile boundary', () => {
    expect(AURA_PROGRESSION_PLAN.map((aura) => aura.unlock)).toEqual([
      { kind: 'level', level: 20 },
      { kind: 'level', level: 40 },
      { kind: 'boss-drop', bossId: 'mosswarden', bossName: 'Der Mooswächter' },
    ]);
    for (const aura of AURA_PROGRESSION_PLAN) {
      expect(CHARACTER_OPTIONS.aura.some((available) => String(available.id) === aura.id)).toBe(
        false,
      );
      expect(() =>
        normalizeCharacterProfile({
          ...profile,
          appearance: { ...profile.appearance, aura: aura.id },
        }),
      ).toThrow('nicht verfügbar');
    }
  });
});
