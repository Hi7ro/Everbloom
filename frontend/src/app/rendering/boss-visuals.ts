import { BossDifficulty, BossId } from '../domain/boss-catalog';

export type BossAttackStyle = 'roots' | 'fire' | 'shadow' | 'bloodmoon' | 'stars' | 'ice' | 'cloud' | 'void' | 'dragon' | 'relic';

export interface BossVisual {
  readonly image: string;
  readonly arenaName: string;
  readonly sceneDescription: string;
  readonly glow: number;
  readonly backdrop: readonly [string, string, string];
  readonly attack: BossAttackStyle;
}
export const BOSS_VISUALS: Readonly<Record<BossId, BossVisual>> = {
  mosswarden: { image: '/art/bosses/mosswarden-v2.webp', arenaName: 'Die Mooslichtung',
    sceneDescription: 'auf einer uralten Waldlichtung', glow: 0x9bbd88,
    backdrop: ['#08151e', '#17372f', '#091c1d'], attack: 'roots' },
  emberwyrm: { image: '/art/bosses/emberwyrm-v2.webp', arenaName: 'Das Glutherz',
    sceneDescription: 'über den leuchtenden Rissen einer Vulkanhöhle', glow: 0xf0a16c,
    backdrop: ['#221427', '#4b242a', '#241520'], attack: 'fire' },
  'dusk-prowler': { image: '/art/bosses/dusk-prowler-normal-v1.webp', arenaName: 'Die Dämmerungsruinen',
    sceneDescription: 'zwischen schwebenden Runen in einer versunkenen Mondruine', glow: 0x9b8adf,
    backdrop: ['#111529', '#293549', '#18172d'], attack: 'shadow' },
  'frost-titan': { image: '/art/bosses/frost-titan-v1.webp', arenaName: 'Der Eisthron',
    sceneDescription: 'zwischen uralten Gletschern und schwebenden Eiskristallen', glow: 0x95cfe6,
    backdrop: ['#0b1c2a', '#224657', '#142c3e'], attack: 'ice' },
  'cloud-sovereign': { image: '/art/bosses/cloud-sovereign-v1.webp', arenaName: 'Der Himmelsgarten',
    sceneDescription: 'auf einer Wolkeninsel mit goldenen Himmelsbögen', glow: 0xe7c887,
    backdrop: ['#182639', '#3e5061', '#263d48'], attack: 'cloud' },
  'bloodmoon-regent': { image: '/art/bosses/bloodmoon-regent-normal-v1.webp', arenaName: 'Der Rubinhof',
    sceneDescription: 'im goldenen Elfenhof unter einem rubinroten Mond', glow: 0xeaa1ad,
    backdrop: ['#231626', '#512c42', '#211b30'], attack: 'bloodmoon' },
  'void-devourer': { image: '/art/bosses/void-devourer-normal-v1.webp', arenaName: 'Der Weltenriss',
    sceneDescription: 'vor einem schwebenden Riss zwischen zerbrochenen Welten', glow: 0x8cdbcc,
    backdrop: ['#0c1020', '#29223d', '#102f38'], attack: 'void' },
  'primordial-dragon': { image: '/art/bosses/primordial-dragon-normal-v1.webp', arenaName: 'Die Wiege der Sterne',
    sceneDescription: 'über einer kosmischen Zitadelle im Licht ferner Sterne', glow: 0x9bcced,
    backdrop: ['#101b31', '#234460', '#142940'], attack: 'dragon' },
  'relic-sovereign': { image: '/art/bosses/relic-sovereign-normal-v1.webp', arenaName: 'Der Thron der Relikte',
    sceneDescription: 'im goldenen Thronsaal zwischen schwebenden Reliktpforten', glow: 0xeed09b,
    backdrop: ['#221c28', '#4d3943', '#24233c'], attack: 'relic' },
  'astral-sovereign': { image: '/art/bosses/astral-sovereign-v2.webp', arenaName: 'Die Sternenpforte',
    sceneDescription: 'vor einer schwebenden Pforte aus Sternenlicht', glow: 0xb2a0eb,
    backdrop: ['#101329', '#292349', '#15172f'], attack: 'stars' },
};

/** Each difficulty has authored artwork, shared by the live stage and its static fallback. */
export const BOSS_FORM_NAMES: Readonly<Record<BossId, readonly [string, string, string]>> = {
  mosswarden: ['Dornwächter', 'Krone des Urhains', 'Weltenwurzel'],
  emberwyrm: ['Glutpanzer', 'Infernodrache', 'Weltenbrand'],
  'dusk-prowler': ['Nachtjäger', 'Bestie der Finsternis', 'Verschlinger der Dämmerung'],
  'frost-titan': ['Frostbollwerk', 'Gletscherkrone', 'Herz des ewigen Winters'],
  'cloud-sovereign': ['Sturmmarschall', 'Himmlischer Kriegsherr', 'Himmelsbrecher'],
  'bloodmoon-regent': ['Blutritterkönigin', 'Blutmondorakel', 'Herrin der Finsternis'],
  'void-devourer': ['Rissbrecher', 'Sternenmaul', 'Ende der Welten'],
  'primordial-dragon': ['Prismenschwinge', 'Kosmischer Urdrachenfürst', 'Weltenatem'],
  'relic-sovereign': ['Reliktmarschall', 'Kaiser der tausend Klingen', 'Herrscher der Ewigkeit'],
  'astral-sovereign': ['Sternenarchon', 'Nebulakaiser', 'Urstern'],
};

export function bossVisual(bossId: BossId, difficulty: BossDifficulty = 'normal'): BossVisual & { formName: string; framed: boolean } {
  const base = BOSS_VISUALS[bossId];
  if (difficulty === 'normal') return { ...base, formName: 'Grundform', framed: base.image.endsWith('-normal-v1.webp') };
  const index = difficulty === 'hard' ? 0 : difficulty === 'epic' ? 1 : 2;
  return { ...base, image: `/art/bosses/${bossId}-${difficulty}-v1.webp`, formName: BOSS_FORM_NAMES[bossId][index], framed: true };
}
