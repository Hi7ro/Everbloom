import { Appearance, CharacterPresentation } from './models';

export interface CharacterIllustration {
  readonly id: string;
  readonly name: string;
  readonly presentation: CharacterPresentation;
  readonly outfitLabel: string;
  readonly hairLabel: string;
  readonly description: string;
  readonly style: string;
  readonly accent: string;
}

/** Authored artwork only. Hair and outfit modules share the preset IDs. */
export const ILLUSTRATED_CHARACTERS = [
  {
    id: 'emerald-knight',
    style: 'High Fantasy',
    accent: '#72c2a6',
    name: 'Smaragdwächter',
    presentation: 'male',
    outfitLabel: 'Schwarzgold-Rüstung',
    hairLabel: 'Silberne Spikes',
    description: 'Markante Rüstung, goldene Kanten und ein smaragdgrüner Kristall.',
  },
  {
    id: 'urban-ranger',
    style: 'Urban & Cozy',
    accent: '#74b7c2',
    name: 'Urbaner Abenteurer',
    presentation: 'male',
    outfitLabel: 'Jacke & Hoodie',
    hairLabel: 'Dunkler Messy Cut',
    description: 'Ein entspannter Abenteuer-Look mit Jacke, Hoodie und praktischen Details.',
  },
  {
    id: 'frost-scholar',
    style: 'Elegant',
    accent: '#94b5dc',
    name: 'Frostgelehrter',
    presentation: 'male',
    outfitLabel: 'Gelehrtenmantel',
    hairLabel: 'Aschblaue Curtains',
    description: 'Ein kühler Gelehrtenmantel und aschblaues Haar für neugierige Entdecker.',
  },
  {
    id: 'ember-striker',
    style: 'Kampfkunst',
    accent: '#d99464',
    name: 'Glutkämpfer',
    presentation: 'male',
    outfitLabel: 'Trainingsgewand',
    hairLabel: 'Kupferkurzhaar',
    description: 'Kupferfarbenes Haar und ein bewegliches Gewand in warmen Gluttönen.',
  },
  {
    id: 'forest-scout',
    style: 'Abenteuer',
    accent: '#a5b77e',
    name: 'Waldläufer',
    presentation: 'male',
    outfitLabel: 'Waldläufer-Poncho',
    hairLabel: 'Dunkler Topknot',
    description: 'Ein leichter Poncho, robustes Leder und hochgebundenes Haar für Wege durchs Grüne.',
  },
  {
    id: 'abyss-walker',
    style: 'Gothic',
    accent: '#b09ed6',
    name: 'Abgrundwanderer',
    presentation: 'male',
    outfitLabel: 'Obsidianrüstung',
    hairLabel: 'Schwarzer Undercut',
    description: 'Dunkle Obsidianrüstung und ein markanter Undercut mit scharfer Silhouette.',
  },
  {
    id: 'moonblade',
    style: 'High Fantasy',
    accent: '#be9acf',
    name: 'Nachtklinge',
    presentation: 'female',
    outfitLabel: 'Dunkle Plattenrüstung',
    hairLabel: 'Violetter Bob',
    description: 'Dunkler Stahl und violette Akzente für eine entschlossene Nachtklinge.',
  },
  {
    id: 'starweaver',
    style: 'Cozy',
    accent: '#9faed2',
    name: 'Sternenweberin',
    presentation: 'female',
    outfitLabel: 'Sternen-Reisemantel',
    hairLabel: 'Brauner Zopf',
    description: 'Ein eleganter Reisemantel mit feinen Details und einem langen Zopf.',
  },
  {
    id: 'dawn-priestess',
    style: 'Elegant',
    accent: '#e3cc99',
    name: 'Morgenhüterin',
    presentation: 'female',
    outfitLabel: 'Lichtrobe',
    hairLabel: 'Goldene Wellen',
    description: 'Goldene Wellen und eine helle Robe mit sanften Akzenten des Morgenlichts.',
  },
  {
    id: 'rose-runner',
    style: 'Sportlich',
    accent: '#d799b1',
    name: 'Rosenläuferin',
    presentation: 'female',
    outfitLabel: 'Rosé-Sportset',
    hairLabel: 'Rotbrauner Pferdeschwanz',
    description: 'Ein hoher Pferdeschwanz, ein Rosé-Hoodie und Sneaker für einen bewegten Alltag.',
  },
  {
    id: 'void-sorceress',
    style: 'Gothic',
    accent: '#ac8ccd',
    name: 'Leerenweberin',
    presentation: 'female',
    outfitLabel: 'Leerenrobe',
    hairLabel: 'Dunkle Twin Tails',
    description: 'Eine dunkle Robe und lange Twin Tails für geheimnisvolle Abenteuer.',
  },
  {
    id: 'sky-ranger',
    style: 'Abenteuer',
    accent: '#8fc8bf',
    name: 'Himmelsjägerin',
    presentation: 'female',
    outfitLabel: 'Jägerinnenmantel',
    hairLabel: 'Silberner Pixie mit Teal',
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
