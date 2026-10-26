import { GameSnapshot } from './models';

/** Fixed encounter levels. Bosses never scale upward with the player's level. */
export type BossId = 'mosswarden' | 'emberwyrm' | 'dusk-prowler' | 'astral-sovereign' | 'frost-titan' | 'cloud-sovereign' | 'bloodmoon-regent' | 'void-devourer' | 'primordial-dragon' | 'relic-sovereign';
export type BossDifficulty = 'normal' | 'hard' | 'epic' | 'ultimate';

/** Free access covers the opening chapter, independently of the character's own level. */
export const FREE_BOSS_MAX_LEVEL = 50;

export interface BossDefinition {
  readonly id: BossId;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly baseLevel: number;
  readonly color: string;
  readonly symbol: string;
  readonly mechanics: readonly string[];
  readonly phaseNames: Readonly<Record<'awakening' | 'resistance' | 'last-stand', string>>;
}

export const BOSS_CATALOG: readonly BossDefinition[] = [
  { id: 'mosswarden', name: 'Der Mooswächter', subtitle: 'Hüter des erwachten Waldes',
    description: 'Alte Wurzeln, lebender Stein und ein leuchtender Kern. Dein erster großer Gegner.',
    baseLevel: 10, color: '#93bf79', symbol: '❧',
    mechanics: ['Wurzelhiebe greifen direkt an.', 'Lebende Rinde reduziert deinen nächsten Angriff um 30 %. Beim Aufbau verursacht sie keinen Schaden.', 'Mit sinkenden Boss-HP wächst der Zorn des Waldes: Wurzelhiebe werden stärker.'],
    phaseNames: { awakening: 'Erwachende Wurzeln', resistance: 'Lebende Rinde', 'last-stand': 'Zorn des Waldes' } },
  { id: 'emberwyrm', name: 'Der Glutwyrm', subtitle: 'Herz der glühenden Tiefen',
    description: 'Ein mächtiger Feuerdrache, dessen Schuppen unter jedem Schlag aufglühen.',
    baseLevel: 20, color: '#ed9764', symbol: '✦',
    mechanics: ['Zwischen seinen Klauenhieben sammelt der Drache Glut.', 'Nach der schadensfreien Aufladung folgt Feueratem.', 'Spätere Phasen verkürzen die Pausen zwischen seinen Aufladungen.'],
    phaseNames: { awakening: 'Glühende Schuppen', resistance: 'Erwachender Brand', 'last-stand': 'Entfesseltes Inferno' } },
  { id: 'dusk-prowler', name: 'Die Dämmerungsbestie', subtitle: 'Jägerin der versiegelten Schatten',
    description: 'Ein gepanzerter Schattenpanther mit Säbelzähnen. Violette und türkise Runen glühen unter seiner Rüstung.',
    baseLevel: 30, color: '#9380c9', symbol: '☾',
    mechanics: ['Säbelbiss und Schattensprung wechseln sich mit Runenschutz ab.', 'Das Runenschild verursacht keinen Schaden und reduziert deinen nächsten Angriff um 40 %. Es kündigt die Schattenraserei an.', 'Die folgende Raserei trifft zweimal. Deine Verteidigung schützt gegen jeden Treffer.'],
    phaseNames: { awakening: 'Lauernde Schatten', resistance: 'Erwachende Runen', 'last-stand': 'Entfesselte Raserei' } },
  { id: 'frost-titan', name: 'Der Frosttitan', subtitle: 'Uralter Herr der Gletscher',
    description: 'Ein gewaltiger Eiskoloss mit leuchtenden Frostrunen und einer Rüstung aus Gletscherkristallen.',
    baseLevel: 40, color: '#8ad6eb', symbol: '❄',
    mechanics: ['Gletscherpanzer reduziert deine nächsten zwei Angriffe um 35 %.', 'Auf schadensfreies Sammeln von Gletscherkraft folgt der schwere Eisbrecher.', 'Der Titan behält seinen langsamen Rhythmus. Mit sinkenden HP werden Eishiebe und neu angekündigte Eisbrecher stärker.'],
    phaseNames: { awakening: 'Uraltes Eis', resistance: 'Gletscherpanzer', 'last-stand': 'Berstender Gletscher' } },
  { id: 'cloud-sovereign', name: 'Der Wolkenkönig', subtitle: 'Meister der goldenen Himmelswege',
    description: 'Ein stolzer Affenkönig mit langem Stab, goldener Rüstung und wirbelnder Wolkenmagie.',
    baseLevel: 50, color: '#e8bf76', symbol: '☁',
    mechanics: ['Die Stabkombo trifft zweimal; Verteidigung schützt gegen beide Treffer.', 'Wolkenschritt reduziert deinen nächsten Angriff um 35 %.', 'Auf schadensfreies Sammeln von Sonnenkraft folgt garantiert der Sonnenschlag. Die Phasen verkürzen seine Zyklen.'],
    phaseNames: { awakening: 'Goldener Himmelsweg', resistance: 'Tanz der Wolken', 'last-stand': 'Sonnenkrone' } },
  { id: 'bloodmoon-regent', name: 'Die Blutmondregentin', subtitle: 'Elfenherrscherin des rubinroten Hofes',
    description: 'Eine stolze Elfenregentin in rubinroter und goldener Rüstung. Über ihrer Klinge schwebt ein versiegelter Blutmond.',
    baseLevel: 60, color: '#cb526f', symbol: '◐',
    mechanics: ['Die Rubinklinge setzt dich zwischen den Mondzaubern unter Druck.', 'Das schadensfreie Blutmondsiegel reduziert deinen nächsten Angriff um 35 % und kündigt die Mondfinsternis an.', 'Die folgende Mondfinsternis heilt die Regentin um 20 % des tatsächlich verursachten Schadens, höchstens 2 % ihrer maximalen HP und nur bis zur vollen Gesundheit.'],
    phaseNames: { awakening: 'Rubinroter Hof', resistance: 'Versiegelter Blutmond', 'last-stand': 'Krone der Finsternis' } },
  { id: 'astral-sovereign', name: 'Der Sternensouverän', subtitle: 'Wächter jenseits des Himmels',
    description: 'Eine schwebende Sternenrüstung, umgeben von Ringen aus kosmischem Licht.',
    baseLevel: 70, color: '#b4a1ed', symbol: '✧',
    mechanics: ['Astralklingen setzen dich zwischen den Siegeln unter Druck.', 'Das Sternensiegel reduziert deinen nächsten Angriff um 45 % und kündigt den Sternenbruch an.', 'Die folgende Bossaktion entfesselt die Konstellation. Das Siegel selbst verursacht keinen Schaden.'],
    phaseNames: { awakening: 'Sternenwacht', resistance: 'Versiegelter Himmel', 'last-stand': 'Brechende Konstellation' } },
  { id: 'void-devourer', name: 'Nharok, der Weltenverschlinger', subtitle: 'Leviathan am Rand der Wirklichkeit',
    description: 'Ein uralter Leerenleviathan mit zerklüfteten Panzerplatten und einem Kern aus verdichteter Sternennacht.',
    baseLevel: 80, color: '#8b83cc', symbol: '◉',
    mechanics: ['Leerenrisse setzen dich zwischen den Gravitationsfeldern unter Druck.', 'Der schadensfreie Gravitationssog reduziert deine nächsten zwei Treffer um 25 % und kündigt den Ereignishorizont an.', 'Der folgende Kollaps nutzt die angekündigte Kraft. In der letzten Phase sammelt Nharok häufiger neue Gravitationsfelder.'],
    phaseNames: { awakening: 'Schlafende Singularität', resistance: 'Zerreißender Horizont', 'last-stand': 'Hunger der Welten' } },
  { id: 'primordial-dragon', name: 'Vaelthar, der Urdrache', subtitle: 'Ursprung der Sternenschwingen',
    description: 'Ein kosmischer Urdrache mit nachtblauen Schuppen, platinfarbenen Hörnern und leuchtenden Prismenflügeln.',
    baseLevel: 90, color: '#99c3df', symbol: '✶',
    mechanics: ['Urklauen treffen zweimal; sein Flügelsturm trifft dreimal. Verteidigung schützt gegen jeden Treffer.', 'Die schadensfreie Prismenaufladung kündigt den kosmischen Atem an.', 'Mit sinkenden HP wird sein Rhythmus kürzer. Jeder kosmische Atem bleibt einen Bosszug vorher angekündigt.'],
    phaseNames: { awakening: 'Erste Sternenschwinge', resistance: 'Prismatische Entfaltung', 'last-stand': 'Ursprung des Kosmos' } },
  { id: 'relic-sovereign', name: 'Aureon, König der Relikte', subtitle: 'Herr des goldenen Arsenals',
    description: 'Ein goldgerüsteter Herrscher, umgeben von schwebenden Reliktwaffen und den Siegeln eines vergessenen Sonnenreichs.',
    baseLevel: 100, color: '#e4be6f', symbol: '♛',
    mechanics: ['Reliktsalven treffen dreimal. Die schadensfreie Königsaegis dämpft deinen nächsten Treffer um 45 %.', 'Die schadensfreie Arsenalaufladung kündigt einen gewaltigen Reliktregen mit drei einzeln abgewehrten Treffern an.', 'Ab Runde 6 wächst Aureons Angriffsdruck um 4 % je Runde, höchstens 28 %. Der Reliktregen behält die bei der Aufladung angekündigte Stärke.'],
    phaseNames: { awakening: 'Goldener Thronsaal', resistance: 'Geöffnetes Arsenal', 'last-stand': 'Letztes Sonnenreich' } },

];

export const BOSS_DIFFICULTIES = [
  { id: 'normal', name: 'Normal', minimumLevelOffset: 0, recommendedLevelOffset: 0, futurePlus: false },
  { id: 'hard', name: 'Hard', minimumLevelOffset: 5, recommendedLevelOffset: 10, futurePlus: true },
  { id: 'epic', name: 'Episch', minimumLevelOffset: 15, recommendedLevelOffset: 20, futurePlus: true },
  { id: 'ultimate', name: 'Ultimate', minimumLevelOffset: 30, recommendedLevelOffset: 30, futurePlus: true },
] as const;

export interface BossEncounter extends BossDefinition {
  readonly difficulty: BossDifficulty;
  readonly minimumLevel: number;
  readonly recommendedLevel: number;
  readonly futurePlus: boolean;
  readonly stats: { readonly level: number; readonly maxHp: number; readonly attack: number; readonly defense: number };
}

export function isBossId(value: string): value is BossId {
  return BOSS_CATALOG.some(boss => boss.id === value);
}

export function isBossDifficulty(value: string): value is BossDifficulty {
  return BOSS_DIFFICULTIES.some(difficulty => difficulty.id === value);
}

export function bossRequiresPlus(bossId: BossId, difficulty: BossDifficulty = 'normal'): boolean {
  const boss = BOSS_CATALOG.find(item => item.id === bossId);
  if (!boss || !isBossDifficulty(difficulty)) throw new Error('Dieser Boss oder Kampfmodus ist nicht verfügbar.');
  return boss.baseLevel > FREE_BOSS_MAX_LEVEL || difficulty !== 'normal';
}

/** One shared balancing contract for the Java resolver and client preview. */
export function bossEncounter(bossId: BossId, difficulty: BossDifficulty = 'normal'): BossEncounter {
  const boss = BOSS_CATALOG.find(item => item.id === bossId);
  const mode = BOSS_DIFFICULTIES.find(item => item.id === difficulty);
  if (!boss || !mode) throw new Error('Dieser Boss oder Kampfmodus ist nicht verfügbar.');
  const level = boss.baseLevel + mode.recommendedLevelOffset + (bossId === 'cloud-sovereign' ? 5 : 0);
  return { ...boss, difficulty,
    minimumLevel: boss.baseLevel + mode.minimumLevelOffset,
    recommendedLevel: level,
    futurePlus: bossRequiresPlus(bossId, difficulty),
    stats: bossId === 'cloud-sovereign'
      ? { level, maxHp: 180 + 22 * level, attack: Math.floor(20 + 2.1 * level), defense: Math.floor(5 + .55 * level) }
      : bossId === 'relic-sovereign'
        ? { level, maxHp: 400 + 28 * level, attack: Math.floor(34 + 2.7 * level), defense: Math.floor(10 + .7 * level) }
      : bossId === 'primordial-dragon'
        ? { level, maxHp: 300 + 26 * level, attack: Math.floor(30 + 2.5 * level), defense: Math.floor(8 + .65 * level) }
      : bossId === 'void-devourer'
        ? { level, maxHp: 260 + 24 * level, attack: Math.floor(26 + 2.3 * level), defense: Math.floor(6 + .6 * level) }
      : bossId === 'bloodmoon-regent'
        ? { level, maxHp: 200 + 20 * level, attack: Math.floor(16 + 1.9 * level), defense: Math.floor(5 + .5 * level) }
      : bossId === 'astral-sovereign'
        ? { level, maxHp: 160 + 18 * level, attack: Math.floor(18 + 1.9 * level), defense: Math.floor(4 + .5 * level) }
        : { level, maxHp: 120 + 12 * level, attack: Math.floor(14 + 1.6 * level), defense: Math.floor(2 + .5 * level) },
  };
}

export function bossEncounterId(bossId: BossId, difficulty: BossDifficulty): string {
  return `${bossId}:${difficulty}`;
}

/** Reveal only the reached story prefix. Any legitimate mode clear advances one boss. */
export function discoveredBosses(snapshot: Pick<GameSnapshot, 'bossProgress'> | null | undefined): readonly BossDefinition[] {
  const clears = new Set(snapshot?.bossProgress?.clearedEncounterIds ?? []);
  const result: BossDefinition[] = [];
  for (const boss of BOSS_CATALOG) {
    result.push(boss);
    if (!BOSS_DIFFICULTIES.some(mode => clears.has(bossEncounterId(boss.id, mode.id)))) break;
  }
  return result;
}

export function isBossDiscovered(snapshot: Pick<GameSnapshot, 'bossProgress'> | null | undefined, bossId: BossId): boolean {
  return discoveredBosses(snapshot).some(boss => boss.id === bossId);
}
