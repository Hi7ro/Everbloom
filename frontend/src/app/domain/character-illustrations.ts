import { Appearance, CharacterPresentation } from './models';

export interface CharacterIllustration {
  readonly id: string;
  readonly name: string;
  readonly presentation: CharacterPresentation;
  readonly outfitLabel: string;
  readonly hairLabel: string;
  readonly imagePath: string;
  readonly maskPath: string;
  readonly description: string;
}

/** Fixed illustrated combinations. Selecting one does not generate or recolor its artwork. */
export const ILLUSTRATED_CHARACTERS = [
  {
    id: 'emerald-knight', name: 'Smaragdwächter', presentation: 'male',
    outfitLabel: 'Schwarzgold-Rüstung', hairLabel: 'Silberne Spikes',
    imagePath: '/art/characters/emerald-knight-original.png',
    maskPath: '/art/characters/emerald-knight-mask.png',
    description: 'Markante Rüstung, goldene Kanten und ein smaragdgrüner Kristall.',
  },
  {
    id: 'urban-ranger', name: 'Urbaner Abenteurer', presentation: 'male',
    outfitLabel: 'Jacke & Hoodie', hairLabel: 'Dunkler Messy Cut',
    imagePath: '/art/characters/urban-ranger-original.png',
    maskPath: '/art/characters/urban-ranger-mask.png',
    description: 'Ein entspannter Abenteuer-Look mit Jacke, Hoodie und praktischen Details.',
  },
  {
    id: 'moonblade', name: 'Nachtklinge', presentation: 'female',
    outfitLabel: 'Dunkle Plattenrüstung', hairLabel: 'Violetter Bob',
    imagePath: '/art/characters/moonblade-original.png',
    maskPath: '/art/characters/moonblade-mask.png',
    description: 'Dunkler Stahl und violette Akzente für eine entschlossene Nachtklinge.',
  },
  {
    id: 'starweaver', name: 'Sternenweberin', presentation: 'female',
    outfitLabel: 'Eleganter Reisemantel', hairLabel: 'Langer brauner Zopf',
    imagePath: '/art/characters/starweaver-original.png',
    maskPath: '/art/characters/starweaver-mask.png',
    description: 'Ein eleganter Reisemantel mit feinen Details und einem langen Zopf.',
  },
] as const satisfies readonly CharacterIllustration[];

/** Rendering is forgiving; profile validation rejects invalid persisted selections. */
export function resolveCharacterIllustration(appearance: Appearance): CharacterIllustration {
  const matching = ILLUSTRATED_CHARACTERS.find(
    (entry) => entry.id === appearance.illustration && entry.presentation === appearance.presentation,
  );
  return matching ?? (appearance.presentation === 'female'
    ? ILLUSTRATED_CHARACTERS[2]
    : ILLUSTRATED_CHARACTERS[0]);
}
