import { Appearance, CharacterArtwork, CharacterPresentation, CharacterProfile } from './models';
import { ILLUSTRATED_CHARACTERS } from './character-illustrations';

export type CharacterSlot = 'body' | 'hair' | 'outfit' | 'aura';
export type CharacterColor = 'skinColor' | 'hairColor' | 'outfitColor';

/** Presentation default only; old v2 profiles keep their stored shape unchanged. */
export function resolveCharacterArtwork(appearance: Appearance): CharacterArtwork {
  return appearance.artwork ?? (appearance.presentation === 'female' ? 'custom' : 'original');
}

export const CHARACTER_PRESENTATIONS = [
  { id: 'male', label: 'Männlich' },
  { id: 'female', label: 'Weiblich' },
] as const satisfies readonly { id: CharacterPresentation; label: string }[];

export const CHARACTER_HAIRSTYLES = {
  male: [
    { id: 'm-spiky', label: 'Shonen-Spikes' },
    { id: 'm-undercut', label: 'Undercut' },
    { id: 'm-curtains', label: 'Geteilter Pony' },
    { id: 'm-messy', label: 'Messy Crop' },
    { id: 'm-swept', label: 'Seitentolle' },
    { id: 'm-topknot', label: 'Top Knot' },
  ],
  female: [
    { id: 'f-bob', label: 'Anime-Bob' },
    { id: 'f-long', label: 'Lange Wellen' },
    { id: 'f-ponytail', label: 'Hoher Pferdeschwanz' },
    { id: 'f-twin-tails', label: 'Twin Tails' },
    { id: 'f-braid', label: 'Seitenzopf' },
    { id: 'f-pixie', label: 'Pixie Cut' },
  ],
} as const satisfies Record<CharacterPresentation, readonly { id: string; label: string }[]>;

export function defaultHairstyle(presentation: CharacterPresentation): string {
  return CHARACTER_HAIRSTYLES[presentation][0].id;
}

export const CHARACTER_OPTIONS = {
  body: [
    { id: 'base', label: 'Ausgewogen' },
    { id: 'compact', label: 'Kompakt' },
    { id: 'broad', label: 'Kräftig' },
  ],
  hair: [...CHARACTER_HAIRSTYLES.male, ...CHARACTER_HAIRSTYLES.female],
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

export interface AuraProgressionPlanEntry {
  readonly id: string;
  readonly label: string;
  readonly unlock:
    | { readonly kind: 'level'; readonly level: number }
    | { readonly kind: 'boss-drop'; readonly bossId: string; readonly bossName: string };
}

/** Future content only. These are not selectable auras or implemented rewards. */
export const AURA_PROGRESSION_PLAN = [
  { id: 'aurora', label: 'Nordlicht', unlock: { kind: 'level', level: 20 } },
  { id: 'starlight', label: 'Sternenkranz', unlock: { kind: 'level', level: 40 } },
  {
    id: 'moss-spirit',
    label: 'Moosseele',
    unlock: { kind: 'boss-drop', bossId: 'mosswarden', bossName: 'Der Mooswächter' },
  },
] as const satisfies readonly AuraProgressionPlanEntry[];

export const CHARACTER_COLOR_PALETTES: Record<CharacterColor, readonly string[]> = {
  skinColor: ['#f6dec8', '#e8c3a2', '#c48e69', '#996442', '#68442f', '#422b23'],
  hairColor: ['#2d2627', '#5c4934', '#b99a67', '#b9a9cc', '#dfbfc3', '#d4dfd5'],
  outfitColor: ['#718967', '#e0b7c5', '#aab7cd', '#9279b0', '#4f5065', '#292f35'],
};

const slots: readonly CharacterSlot[] = ['body', 'hair', 'outfit', 'aura'];
const colors: readonly CharacterColor[] = ['skinColor', 'hairColor', 'outfitColor'];
const legacyHairstyles = {
  male: { tousled: 'm-spiky', bob: 'm-curtains', braid: 'm-topknot' },
  female: { tousled: 'f-pixie', bob: 'f-bob', braid: 'f-braid' },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Explicit v1 migration. The default presentation is technical, never inferred from a name. */
export function migrateLegacyCharacterProfile(profile: unknown): CharacterProfile {
  if (!isRecord(profile) || !isRecord(profile['appearance'])) {
    throw new Error('Bitte Name und Aussehen vollständig angeben.');
  }
  const original = profile['appearance'];
  const presentation = 'presentation' in original ? original['presentation'] : 'male';
  if (presentation !== 'male' && presentation !== 'female') {
    throw new Error('Bitte eine verfügbare Charakterdarstellung wählen.');
  }
  const hair = original['hair'];
  const migratedHair =
    hair === 'tousled' || hair === 'bob' || hair === 'braid'
      ? legacyHairstyles[presentation][hair]
      : hair;
  return normalizeCharacterProfile({
    name: profile['name'],
    appearance: { ...original, presentation, hair: migratedHair },
  });
}

/** Pure validation at form/storage/repository boundaries; accepts current profiles only. */
export function normalizeCharacterProfile(profile: unknown): CharacterProfile {
  if (
    !isRecord(profile) ||
    typeof profile['name'] !== 'string' ||
    !isRecord(profile['appearance'])
  ) {
    throw new Error('Bitte Name und Aussehen vollständig angeben.');
  }
  const name = profile['name'].normalize('NFC').trim().replace(/ +/g, ' ');
  const length = Array.from(name).length;
  if (length < 2 || length > 24 || !/^[\p{L}\p{N}][\p{L}\p{M}\p{N} '\u2019-]*$/u.test(name)) {
    throw new Error(
      'Dein Name braucht 2–24 Zeichen: Buchstaben, Zahlen, Leerzeichen, Bindestrich oder Apostroph.',
    );
  }

  const source = profile['appearance'];
  const presentation = source['presentation'];
  if (presentation !== 'male' && presentation !== 'female') {
    throw new Error('Bitte eine verfügbare Charakterdarstellung wählen.');
  }
  const appearance = { presentation } as Appearance;
  const artwork = source['artwork'];
  if (artwork !== undefined) {
    if (artwork !== 'original' && artwork !== 'custom') {
      throw new Error('Bitte einen verfügbaren Look wählen.');
    }
    appearance.artwork = artwork;
  }
  const illustration = source['illustration'];
  if (illustration !== undefined) {
    const selected = ILLUSTRATED_CHARACTERS.find((entry) => entry.id === illustration);
    if (!selected || (resolveCharacterArtwork(appearance) === 'original' && selected.presentation !== presentation)) {
      throw new Error('Bitte eine verfügbare Illustration für deine Charakterdarstellung wählen.');
    }
    appearance.illustration = selected.id;
  }
  for (const slot of slots) {
    const id = source[slot];
    const options = slot === 'hair' ? CHARACTER_HAIRSTYLES[presentation] : CHARACTER_OPTIONS[slot];
    const known = options.some((option) => option.id === id);
    // Existing demo profiles used this outfit before the creator exposed the style families.
    if (typeof id !== 'string' || (!known && !(slot === 'outfit' && id === 'wanderer'))) {
      throw new Error('Diese Charakteroption ist nicht verfügbar. Bitte wähle erneut.');
    }
    appearance[slot] = id;
  }
  for (const color of colors) {
    const value = source[color];
    if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) {
      throw new Error('Bitte eine gültige Farbe wählen.');
    }
    appearance[color] = value.toLowerCase();
  }
  return { name, appearance };
}
