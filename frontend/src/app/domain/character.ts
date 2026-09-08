import { Appearance, CharacterProfile } from './models';

export type CharacterSlot = 'body' | 'hair' | 'outfit' | 'aura';
export type CharacterColor = 'skinColor' | 'hairColor' | 'outfitColor';

export const CHARACTER_OPTIONS = {
  body: [
    { id: 'base', label: 'Ausgewogen' },
    { id: 'compact', label: 'Kompakt' },
    { id: 'broad', label: 'Kräftig' },
  ],
  hair: [
    { id: 'tousled', label: 'Strubbelig' },
    { id: 'bob', label: 'Bob' },
    { id: 'braid', label: 'Zopf' },
  ],
  outfit: [
    { id: 'cozy', label: 'Cozy', description: 'Weich & verspielt' },
    { id: 'adventurer', label: 'Adventurer', description: 'Bereit für die Reise' },
    { id: 'elegant', label: 'Elegant', description: 'Licht & feine Linien' },
    { id: 'dark', label: 'Dark', description: 'Gothic & dunkler Stahl' },
    { id: 'abyssal', label: 'Abyssal', description: 'Hörner & Schattenflügel' },
  ],
  aura: [
    { id: 'none', label: 'Ohne Aura' },
    { id: 'sage', label: 'Waldlicht' },
    { id: 'rose', label: 'Blütenzauber' },
    { id: 'void', label: 'Leere' },
  ],
} as const;

export const CHARACTER_COLOR_PALETTES: Record<CharacterColor, readonly string[]> = {
  skinColor: ['#f6dec8', '#e8c3a2', '#c48e69', '#996442', '#68442f', '#422b23'],
  hairColor: ['#2d2627', '#5c4934', '#b99a67', '#b9a9cc', '#dfbfc3', '#d4dfd5'],
  outfitColor: ['#718967', '#e0b7c5', '#aab7cd', '#9279b0', '#4f5065', '#292f35'],
};

const slots: readonly CharacterSlot[] = ['body', 'hair', 'outfit', 'aura'];
const colors: readonly CharacterColor[] = ['skinColor', 'hairColor', 'outfitColor'];

/** Pure shared validation for the form and repository boundary; never changes progression. */
export function normalizeCharacterProfile(profile: CharacterProfile): CharacterProfile {
  if (!profile || typeof profile.name !== 'string' || !profile.appearance) {
    throw new Error('Bitte Name und Aussehen vollständig angeben.');
  }
  const name = profile.name.normalize('NFC').trim().replace(/ +/g, ' ');
  const length = Array.from(name).length;
  if (length < 2 || length > 24 || !/^[\p{L}\p{N}][\p{L}\p{M}\p{N} '\u2019-]*$/u.test(name)) {
    throw new Error(
      'Dein Name braucht 2–24 Zeichen: Buchstaben, Zahlen, Leerzeichen, Bindestrich oder Apostroph.',
    );
  }

  const appearance = {} as Appearance;
  for (const slot of slots) {
    const id = profile.appearance[slot];
    const known = CHARACTER_OPTIONS[slot].some((option) => option.id === id);
    // Existing demo profiles used this id before the creator exposed the style families.
    if (!known && !(slot === 'outfit' && id === 'wanderer')) {
      throw new Error('Diese Charakteroption ist nicht verfügbar. Bitte wähle erneut.');
    }
    appearance[slot] = id;
  }
  for (const color of colors) {
    const value = profile.appearance[color];
    if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) {
      throw new Error('Bitte eine gültige Farbe wählen.');
    }
    appearance[color] = value.toLowerCase();
  }
  return { name, appearance };
}
