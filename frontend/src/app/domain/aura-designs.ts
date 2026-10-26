export interface AuraDesign {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly color: string;
}

/** Visual designs only: these entries grant no unlock, inventory item or progression. */
export const AURA_DESIGNS = [
  { id: 'void-orbit', label: 'Abgrundorbit', description: 'Türkise Runen kreisen um einen violetten Riss im Raum.', color: '#86e3d5' },
  { id: 'leviathan', label: 'Weltenverschlinger', description: 'Ein uralter Leviathan aus Schatten und Sternensplittern wacht hinter dir.', color: '#ac91ed' },
  { id: 'dragon-oath', label: 'Dracheneid', description: 'Platinblaue Drachensiegel umgeben dich mit kosmischer Energie.', color: '#96ceef' },
  { id: 'primordial-wings', label: 'Urdrachenflügel', description: 'Weite, sternendurchwirkte Drachenflügel entfalten sich hinter dir.', color: '#b9dff3' },
  { id: 'relic-arsenal', label: 'Reliktarsenal', description: 'Goldene Reliktwaffen schweben in geordneten Bahnen um deine Figur.', color: '#f0ca7d' },
  { id: 'imperial-gate', label: 'Imperiale Pforte', description: 'Eine monumentale Goldpforte und leuchtende Reliktsiegel krönen deine Reise.', color: '#f8dfa1' },
  { id:'bloodmoon', label:'Rubinumlauf', description:'Rubinrote Lichtbahnen umkreisen deine Figur.', color:'#ed86a5' },
  { id:'crimson-crown', label:'Karmincorona', description:'Eine rubinrote Strahlenkrone erhebt sich hinter dir.', color:'#f58caa' },
  { id:'twilight', label:'Dämmerungsmantel', description:'Violette Runen und kühles Licht begleiten dich.', color:'#b08ae3' },
  { id:'eclipse', label:'Eklipsenwächter', description:'Ein dunkler Schutzgeist erhebt sich hinter deinem Charakter.', color:'#9074df' },
  {
    id: 'sage',
    label: 'Waldlicht',
    description: 'Sanfte Lichtschweife und kleine Leuchtblätter begleiten deine Figur.',
    color: '#b6d791',
  },
  {
    id: 'rose',
    label: 'Rosenlicht',
    description: 'Zarte Kirschblüten ziehen in geschwungenen Bahnen vorbei.',
    color: '#edb4d0',
  },
  {
    id: 'void',
    label: 'Schattenflamme',
    description: 'Violette Flammen steigen als ruhige, mystische Silhouette auf.',
    color: '#b89cf2',
  },
  {
    id: 'aurora',
    label: 'Nordlicht',
    description: 'Grüne, petrolfarbene und violette Lichtbänder tanzen wie ein Nordlicht um dich.',
    color: '#8ee7cb',
  },
  {
    id: 'starlight',
    label: 'Sternenkranz',
    description:
      'Ein goldener Sternenkranz mit violetten Konstellationen zeichnet deine Reise nach.',
    color: '#e8c678',
  },
  {
    id: 'moss-spirit',
    label: 'Moosseele',
    description: 'Leuchtende Blattranken und ein sanfter Waldgeist schützen deine Figur.',
    color: '#a8d985',
  },
  {
    id: 'stars',
    label: 'Sternenspuren',
    description: 'Lange Sternspuren und funkelnde Lichtsplitter rahmen die Figur ein.',
    color: '#a78bfa',
  },
  {
    id: 'mystic',
    label: 'Mystischer Schleier',
    description: 'Feine magische Zeichen und schwebende Lichtbänder formen einen Schleier.',
    color: '#a78bfa',
  },
  {
    id: 'chakra',
    label: 'Innere Harmonie',
    description: 'Lichtblätter entfalten sich zu einer symmetrischen Lotus-Silhouette.',
    color: '#91d7ad',
  },
  {
    id: 'demonic',
    label: 'Dämonenschatten',
    description: 'Gezackte Schattenflügel und aufsteigende Energie verleihen dem Look Schärfe.',
    color: '#efaecb',
  },
  {
    id: 'light',
    label: 'Lichtkrone',
    description: 'Goldene Strahlen öffnen sich wie eine hohe Krone hinter deiner Figur.',
    color: '#f1d58e',
  },
  {
    id: 'energy',
    label: 'Energiefluss',
    description: 'Versetzte Energieströme und kantige Lichtfunken steigen seitlich empor.',
    color: '#85cde9',
  },
  {
    id: 'angel',
    label: 'Himmelsflügel',
    description: 'Weite, federartige Lichtflügel und sanfte Sternfunken begleiten dich.',
    color: '#85cde9',
  },
  {
    id: 'blossom',
    label: 'Blütenwind',
    description: 'Üppige Blütenzweige und schwebende Blätter wachsen zu einem zarten Rahmen.',
    color: '#efaecb',
  },
  {
    id: 'fire',
    label: 'Flammenherz',
    description: 'Breite, aufsteigende Flammen und warme Glutspuren umgeben deine Figur.',
    color: '#f0a66d',
  },
  {
    id: 'guardian',
    label: 'Geistwächter',
    description: 'Eine große, durchscheinende Schutzgestalt erhebt sich hinter deiner Figur.',
    color: '#85cde9',
  },
] as const satisfies readonly AuraDesign[];
