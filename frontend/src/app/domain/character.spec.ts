import { CharacterProfile } from './models';
import { CHARACTER_OPTIONS, normalizeCharacterProfile } from './character';

describe('character profile validation', () => {
  const profile: CharacterProfile = {
    name: '  Élia  Moon  ',
    appearance: {
      body: 'base',
      hair: 'tousled',
      outfit: 'wanderer',
      aura: 'sage',
      skinColor: '#E8C3A2',
      hairColor: '#5c4934',
      outfitColor: '#718967',
    },
  };

  it('normalizes a legacy profile without mutating it', () => {
    const result = normalizeCharacterProfile(profile);
    expect(result.name).toBe('Élia Moon');
    expect(result.appearance.skinColor).toBe('#e8c3a2');
    expect(result.appearance.outfit).toBe('wanderer');
    expect(profile.name).toBe('  Élia  Moon  ');
    expect(result.appearance).not.toBe(profile.appearance);
  });

  it('accepts every creator choice and names beyond ASCII', () => {
    for (const [slot, options] of Object.entries(CHARACTER_OPTIONS)) {
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
});
