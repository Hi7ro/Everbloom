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

/** Authored artwork only. Hair and outfit modules share the preset IDs. */
export const ILLUSTRATED_CHARACTERS = [
  {
    id: 'emerald-knight',
    name: 'Smaragdwächter',
    presentation: 'male',
    outfitLabel: 'Schwarzgold-Rüstung',
    hairLabel: 'Silberne Spikes',
    imagePath: '/art/characters/emerald-knight-original.png',
    maskPath: '/art/characters/emerald-knight-mask.png',
    description: 'Markante Rüstung, goldene Kanten und ein smaragdgrüner Kristall.',
  },
  {
    id: 'urban-ranger',
    name: 'Urbaner Abenteurer',
    presentation: 'male',
    outfitLabel: 'Jacke & Hoodie',
    hairLabel: 'Dunkler Messy Cut',
    imagePath: '/art/characters/urban-ranger-original.png',
    maskPath: '/art/characters/urban-ranger-mask.png',
    description: 'Ein entspannter Abenteuer-Look mit Jacke, Hoodie und praktischen Details.',
  },
  {
    id: 'frost-scholar',
    name: 'Frostgelehrter',
    presentation: 'male',
    outfitLabel: 'Gelehrtenmantel',
    hairLabel: 'Aschblaue Curtains',
    imagePath: '/art/characters/frost-scholar-sheet.png',
    maskPath: '/art/characters/frost-scholar-layers.png',
    description: 'Ein kühler Gelehrtenmantel und aschblaues Haar für neugierige Entdecker.',
  },
  {
    id: 'ember-striker',
    name: 'Glutkämpfer',
    presentation: 'male',
    outfitLabel: 'Trainingsgewand',
    hairLabel: 'Kupferkurzhaar',
    imagePath: '/art/characters/ember-striker-sheet.png',
    maskPath: '/art/characters/ember-striker-layers.png',
    description: 'Kupferfarbenes Haar und ein bewegliches Gewand in warmen Gluttönen.',
  },
  {
    id: 'forest-scout',
    name: 'Waldläufer',
    presentation: 'male',
    outfitLabel: 'Waldläufermantel',
    hairLabel: 'Dunkler Topknot',
    imagePath: '/art/characters/forest-scout-sheet.png',
    maskPath: '/art/characters/forest-scout-layers.png',
    description: 'Ein erdiger Reisemantel und hochgebundenes Haar für Wege durchs Grüne.',
  },
  {
    id: 'abyss-walker',
    name: 'Abgrundwanderer',
    presentation: 'male',
    outfitLabel: 'Obsidianrüstung',
    hairLabel: 'Schwarzer Undercut',
    imagePath: '/art/characters/abyss-walker-sheet.png',
    maskPath: '/art/characters/abyss-walker-layers.png',
    description: 'Dunkle Obsidianrüstung und ein markanter Undercut mit scharfer Silhouette.',
  },
  {
    id: 'moonblade',
    name: 'Nachtklinge',
    presentation: 'female',
    outfitLabel: 'Dunkle Plattenrüstung',
    hairLabel: 'Violetter Bob',
    imagePath: '/art/characters/moonblade-original.png',
    maskPath: '/art/characters/moonblade-mask.png',
    description: 'Dunkler Stahl und violette Akzente für eine entschlossene Nachtklinge.',
  },
  {
    id: 'starweaver',
    name: 'Sternenweberin',
    presentation: 'female',
    outfitLabel: 'Reisemantel',
    hairLabel: 'Brauner Zopf',
    imagePath: '/art/characters/starweaver-original.png',
    maskPath: '/art/characters/starweaver-mask.png',
    description: 'Ein eleganter Reisemantel mit feinen Details und einem langen Zopf.',
  },
  {
    id: 'dawn-priestess',
    name: 'Morgenhüterin',
    presentation: 'female',
    outfitLabel: 'Lichtrobe',
    hairLabel: 'Goldene Wellen',
    imagePath: '/art/characters/dawn-priestess-sheet.png',
    maskPath: '/art/characters/dawn-priestess-layers.png',
    description: 'Goldene Wellen und eine helle Robe mit sanften Akzenten des Morgenlichts.',
  },
  {
    id: 'rose-runner',
    name: 'Rosenläuferin',
    presentation: 'female',
    outfitLabel: 'Rosé-Sportjacke',
    hairLabel: 'Rotbrauner Pferdeschwanz',
    imagePath: '/art/characters/rose-runner-sheet.png',
    maskPath: '/art/characters/rose-runner-layers.png',
    description: 'Ein hoher Pferdeschwanz und eine sportliche Jacke in warmem Rosé.',
  },
  {
    id: 'void-sorceress',
    name: 'Leerenweberin',
    presentation: 'female',
    outfitLabel: 'Leerenrobe',
    hairLabel: 'Dunkle Twin Tails',
    imagePath: '/art/characters/void-sorceress-sheet.png',
    maskPath: '/art/characters/void-sorceress-layers.png',
    description: 'Eine dunkle Robe und lange Twin Tails für geheimnisvolle Abenteuer.',
  },
  {
    id: 'sky-ranger',
    name: 'Himmelsjägerin',
    presentation: 'female',
    outfitLabel: 'Jägerinnenmantel',
    hairLabel: 'Silberner Pixie mit Teal',
    imagePath: '/art/characters/sky-ranger-sheet.png',
    maskPath: '/art/characters/sky-ranger-layers.png',
    description: 'Ein silberner Pixie mit petrolfarbenen Akzenten und ein leichter Mantel.',
  },
] as const satisfies readonly CharacterIllustration[];

export type IllustratedColor = 'eyeColor' | 'skinTone' | 'hairTint';
export const ILLUSTRATED_COLOR_PALETTES = {
  eyeColor: [
    { label: 'Grün', hex: '#5f9e6e' },
    { label: 'Blau', hex: '#5e92c7' },
    { label: 'Violett', hex: '#9c78c2' },
    { label: 'Bernstein', hex: '#c6963e' },
    { label: 'Braun', hex: '#74533e' },
    { label: 'Grau', hex: '#87959b' },
  ],
  skinTone: [
    { label: 'Porzellan', hex: '#f6dec8' },
    { label: 'Sand', hex: '#e8c3a2' },
    { label: 'Honig', hex: '#c48e69' },
    { label: 'Bronze', hex: '#996442' },
    { label: 'Umbra', hex: '#68442f' },
    { label: 'Tiefbraun', hex: '#422b23' },
  ],
  hairTint: [
    { label: 'Schwarz', hex: '#2d2627' },
    { label: 'Braun', hex: '#5c4934' },
    { label: 'Kupfer', hex: '#b9653f' },
    { label: 'Blond', hex: '#d9b875' },
    { label: 'Silber', hex: '#d5dbe0' },
    { label: 'Violett', hex: '#9478bc' },
  ],
} as const satisfies Record<IllustratedColor, readonly { label: string; hex: string }[]>;

/** Rendering is forgiving; profile validation rejects invalid persisted selections. */
export function resolveCharacterIllustration(appearance: Appearance): CharacterIllustration {
  return (
    ILLUSTRATED_CHARACTERS.find(
      (entry) =>
        entry.id === appearance.illustration && entry.presentation === appearance.presentation,
    ) ??
    ILLUSTRATED_CHARACTERS.find((entry) => entry.presentation === appearance.presentation) ??
    ILLUSTRATED_CHARACTERS[0]
  );
}
