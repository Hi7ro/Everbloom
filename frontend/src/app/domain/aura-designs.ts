export interface AuraDesign {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly color: string;
  readonly previewOnly: boolean;
}

/** Visual designs only: these entries grant no unlock, inventory item or progression. */
export const AURA_DESIGNS = [
  {
    id: 'sage',
    label: 'Waldlicht',
    description: 'Sanfte Lichtschweife und kleine Leuchtblätter begleiten deine Figur.',
    color: '#b6d791',
    previewOnly: false,
  },
  {
    id: 'rose',
    label: 'Blütenzauber',
    description: 'Zarte Kirschblüten ziehen in geschwungenen Bahnen vorbei.',
    color: '#edb4d0',
    previewOnly: false,
  },
  {
    id: 'void',
    label: 'Leere',
    description: 'Violette Flammen steigen als ruhige, mystische Silhouette auf.',
    color: '#b89cf2',
    previewOnly: false,
  },
  {
    id: 'aurora',
    label: 'Nordlicht',
    description: 'Grüne, petrolfarbene und violette Lichtbänder tanzen wie ein Nordlicht um dich.',
    color: '#8ee7cb',
    previewOnly: false,
  },
  {
    id: 'starlight',
    label: 'Sternenkranz',
    description:
      'Ein goldener Sternenkranz mit violetten Konstellationen zeichnet deine Reise nach.',
    color: '#e8c678',
    previewOnly: false,
  },
  {
    id: 'moss-spirit',
    label: 'Moosseele',
    description: 'Leuchtende Blattranken und ein sanfter Waldgeist schützen deine Figur.',
    color: '#a8d985',
    previewOnly: false,
  },
  {
    id: 'stars',
    label: 'Sternenspuren',
    description: 'Lange Sternspuren und funkelnde Lichtsplitter rahmen die Figur ein.',
    color: '#a78bfa',
    previewOnly: true,
  },
  {
    id: 'mystic',
    label: 'Mystischer Schleier',
    description: 'Feine magische Zeichen und schwebende Lichtbänder formen einen Schleier.',
    color: '#a78bfa',
    previewOnly: true,
  },
  {
    id: 'chakra',
    label: 'Innere Harmonie',
    description: 'Lichtblätter entfalten sich zu einer symmetrischen Lotus-Silhouette.',
    color: '#91d7ad',
    previewOnly: true,
  },
  {
    id: 'demonic',
    label: 'Dämonenschatten',
    description: 'Gezackte Schattenflügel und aufsteigende Energie verleihen dem Look Schärfe.',
    color: '#efaecb',
    previewOnly: true,
  },
  {
    id: 'light',
    label: 'Lichtkrone',
    description: 'Goldene Strahlen öffnen sich wie eine hohe Krone hinter deiner Figur.',
    color: '#f1d58e',
    previewOnly: true,
  },
  {
    id: 'energy',
    label: 'Energiefluss',
    description: 'Versetzte Energieströme und kantige Lichtfunken steigen seitlich empor.',
    color: '#85cde9',
    previewOnly: true,
  },
  {
    id: 'angel',
    label: 'Himmelsflügel',
    description: 'Weite, federartige Lichtflügel und sanfte Sternfunken begleiten dich.',
    color: '#85cde9',
    previewOnly: true,
  },
  {
    id: 'blossom',
    label: 'Blütenwind',
    description: 'Üppige Blütenzweige und schwebende Blätter wachsen zu einem zarten Rahmen.',
    color: '#efaecb',
    previewOnly: true,
  },
  {
    id: 'fire',
    label: 'Flammenherz',
    description: 'Breite, aufsteigende Flammen und warme Glutspuren umgeben deine Figur.',
    color: '#f0a66d',
    previewOnly: true,
  },
  {
    id: 'guardian',
    label: 'Geistwächter',
    description: 'Eine große, durchscheinende Schutzgestalt erhebt sich hinter deiner Figur.',
    color: '#85cde9',
    previewOnly: true,
  },
] as const satisfies readonly AuraDesign[];

export const ADVANCED_AURA_DESIGNS = AURA_DESIGNS.filter((design) => design.previewOnly);
export const AURA_PREVIEW_COLORS = [
  { label: 'Violett', hex: '#a78bfa' },
  { label: 'Smaragd', hex: '#91d7ad' },
  { label: 'Eisblau', hex: '#85cde9' },
  { label: 'Rosé', hex: '#efaecb' },
  { label: 'Gold', hex: '#f1d58e' },
  { label: 'Glut', hex: '#f0a66d' },
] as const;
