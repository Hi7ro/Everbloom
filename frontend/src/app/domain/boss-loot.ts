import { Appearance, CharacterPresentation, GameSnapshot } from './models';
import { BossDifficulty, BossId } from './boss-catalog';

export type BossLootRarity = 'rare' | 'epic' | 'legendary' | 'mythic';
export interface BossCosmetic {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly bossId: BossId;
  readonly difficulty: BossDifficulty;
  readonly slot: 'aura' | 'hair' | 'outfit';
  readonly rarity: BossLootRarity;
  readonly auraId?: string;
  /** Existing painted artwork plus an exclusive reward tint, not an unimplemented asset. */
  readonly modules?: Readonly<Record<CharacterPresentation, string>>;
  readonly tint?: string;
}

export const BOSS_COSMETICS: readonly BossCosmetic[] = [
  { id: 'moss-crown', name: 'Waldkrone', description: 'Jadegrüner Waldschnitt, als Andenken an deinen ersten Sieg.',
    bossId: 'mosswarden', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'forest-scout', female: 'starweaver' }, tint: '#6fae96' },
  { id: 'verdant-warden', name: 'Rüstung des Waldhüters', description: 'Waldläufermantel und leichte Reisekleidung im Jadegrün des Mooswächters.',
    bossId: 'mosswarden', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'forest-scout', female: 'sky-ranger' }, tint: '#4c9c83' },
  { id: 'eternal-blossom', name: 'Ewige Blüte', description: 'Blütenzweige und schwebende Kirschblätter umgeben dich.',
    bossId: 'mosswarden', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'blossom' },
  { id: 'ancient-guardian', name: 'Uralter Geistwächter', description: 'Ein großer, leuchtender Schutzgeist erhebt sich hinter dir.',
    bossId: 'mosswarden', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'guardian' },
  { id: 'ember-crown', name: 'Glutkrone', description: 'Flammenroter Schnitt mit der Farbe des erwachten Glutwyrms.',
    bossId: 'emberwyrm', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'ember-striker', female: 'rose-runner' }, tint: '#ee8058' },
  { id: 'cinder-forged', name: 'Glutgeschmiedetes Set', description: 'Dunkle Ritterrüstung mit kantigen Platten in der Kupferglut des Glutwyrms.',
    bossId: 'emberwyrm', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'abyss-walker', female: 'moonblade' }, tint: '#cd7158' },
  { id: 'wyrmfire', name: 'Wyrmfeuer', description: 'Aufsteigende Flammen und warme Glutfunken rahmen deine Figur ein.',
    bossId: 'emberwyrm', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'fire' },
  { id: 'infernal-wings', name: 'Höllenschwingen', description: 'Gezackte Schattenflügel umgeben dich mit dämonischer Energie.',
    bossId: 'emberwyrm', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'demonic' },
  { id: 'dusk-crown', name: 'Dämmerungskrone', description: 'Ein wilder Schnitt im tiefen Runenviolett der Dämmerungsbestie.',
    bossId: 'dusk-prowler', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'abyss-walker', female: 'void-sorceress' }, tint: '#8d78c7' },
  { id: 'twilight-stalker', name: 'Rüstung der Dämmerungsjagd', description: 'Eine markante Schattenrüstung mit türkis schimmernden Platten und dunklen Stofflagen.',
    bossId: 'dusk-prowler', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'emerald-knight', female: 'void-sorceress' }, tint: '#538e98' },
  { id: 'twilight-mantle', name: 'Mantel der Dämmerung', description: 'Violette Schleier und türkise Runen umkreisen deinen Charakter.',
    bossId: 'dusk-prowler', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'twilight' },
  { id: 'eclipse-guardian', name: 'Schattenwächter der Eklipse', description: 'Ein dunkler Schutzgeist mit leuchtenden Runen wacht hinter deiner Figur.',
    bossId: 'dusk-prowler', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'eclipse' },
  { id: 'frost-crown', name: 'Frostkrone', description: 'Ein eisblauer Schnitt mit dem Glanz uralter Gletscherkristalle.',
    bossId: 'frost-titan', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'frost-scholar', female: 'sky-ranger' }, tint: '#79cce4' },
  { id: 'glacier-guard', name: 'Nordlicht-Expeditionsset', description: 'Gemütliche Jacke, Hoodie und Reiseaccessoires im Gletscherblau des Frosttitans.',
    bossId: 'frost-titan', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'urban-ranger', female: 'rose-runner' }, tint: '#6fa9c7' },
  { id: 'frozen-runes', name: 'Frostrunen', description: 'Schwebende magische Zeichen erinnern an die Runen des Frosttitans.',
    bossId: 'frost-titan', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'mystic' },
  { id: 'glacial-current', name: 'Ewiger Eisstrom', description: 'Eisblaue Energieströme und scharfe Lichtfunken steigen um dich auf.',
    bossId: 'frost-titan', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'energy' },
  { id: 'cloud-crown', name: 'Wolkenkrone', description: 'Ein goldener Schnitt im Licht der hohen Himmelswege.',
    bossId: 'cloud-sovereign', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'forest-scout', female: 'dawn-priestess' }, tint: '#e7bd71' },
  { id: 'cloud-regalia', name: 'Gewand des Wolkenkönigs', description: 'Himmlisches Kampfgewand mit beweglichen Stoffbahnen im Himmelsgold des Wolkenkönigs.',
    bossId: 'cloud-sovereign', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'ember-striker', female: 'dawn-priestess' }, tint: '#bd9551' },
  { id: 'celestial-lotus', name: 'Himmelslotus', description: 'Leuchtende Blätter entfalten eine ruhige himmlische Lotus-Silhouette.',
    bossId: 'cloud-sovereign', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'chakra' },
  { id: 'solar-corona', name: 'Sonnenkrone', description: 'Goldene Strahlen formen eine hohe Lichtkrone hinter deiner Figur.',
    bossId: 'cloud-sovereign', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'light' },
  { id: 'bloodmoon-crown', name: 'Rubinmondkrone', description: 'Ein eleganter Schnitt im tiefen Rubinrot des Elfenhofes.',
    bossId: 'bloodmoon-regent', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'urban-ranger', female: 'starweaver' }, tint: '#bd335b' },
  { id: 'regent-regalia', name: 'Ornat der Blutmondregentin', description: 'Lange höfische Stofflagen und goldene Zierformen in leuchtendem Rubinrot.',
    bossId: 'bloodmoon-regent', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'frost-scholar', female: 'dawn-priestess' }, tint: '#b94262' },
  { id: 'ruby-orbit', name: 'Rubinmond-Orbit', description: 'Ein rubinroter Mond und goldene Siegel kreisen um deinen Charakter.',
    bossId: 'bloodmoon-regent', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'bloodmoon' },
  { id: 'crimson-corona', name: 'Krone des Blutmondes', description: 'Eine majestätische Krone aus rubinrotem Licht und goldenen Strahlen erhebt sich hinter dir.',
    bossId: 'bloodmoon-regent', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'crimson-crown' },
  { id: 'astral-crown', name: 'Sternenkrone', description: 'Ein kühler Sternenschnitt in exklusivem Nebelblau.',
    bossId: 'astral-sovereign', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'frost-scholar', female: 'sky-ranger' }, tint: '#8d9be8' },
  { id: 'astral-regalia', name: 'Gewand der Sternenwacht', description: 'Langes Magiergewand mit fließenden Stofflagen im Sternenviolett des Sternensouveräns.',
    bossId: 'astral-sovereign', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'frost-scholar', female: 'starweaver' }, tint: '#8176c7' },
  { id: 'star-trail', name: 'Unendliche Sternenspuren', description: 'Sternspuren und funkelnde Splitter schweben um deinen Charakter.',
    bossId: 'astral-sovereign', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'stars' },
  { id: 'celestial-wings', name: 'Himmelsschwingen', description: 'Weite Lichtflügel und sanfte Sternfunken krönen deine Reise.',
    bossId: 'astral-sovereign', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'angel' },
  { id: 'void-crown', name: 'Krone der Leere', description: 'Ein kantiger Schnitt im kühlen Violett der Singularität.',
    bossId: 'void-devourer', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'abyss-walker', female: 'void-sorceress' }, tint: '#6d63ad' },
  { id: 'voidbound-regalia', name: 'Ornat der Leerenbindung', description: 'Dunkle Panzerplatten und lange Schattenlagen im Silberschein der Leere.',
    bossId: 'void-devourer', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'abyss-walker', female: 'void-sorceress' }, tint: '#686194' },
  { id: 'abyss-orbit', name: 'Orbit des Abgrunds', description: 'Verdichtete Leerenringe und kalte Sternensplitter kreisen um dich.',
    bossId: 'void-devourer', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'void-orbit' },
  { id: 'world-devourer', name: 'Geist des Weltenverschlingers', description: 'Eine mächtige Leviathan-Silhouette erhebt sich aus der Sternennacht.',
    bossId: 'void-devourer', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'leviathan' },
  { id: 'wyrm-crown', name: 'Urwyrmkrone', description: 'Ein dynamischer Schnitt im Platinblau der Prismenflügel.',
    bossId: 'primordial-dragon', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'frost-scholar', female: 'sky-ranger' }, tint: '#79b5d1' },
  { id: 'prismatic-scale', name: 'Prismenschuppen-Ornat', description: 'Helle Plattenrüstung mit platinblauen Schuppenformen und klarer Silhouette.',
    bossId: 'primordial-dragon', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'emerald-knight', female: 'moonblade' }, tint: '#98bdd2' },
  { id: 'dragon-oath', name: 'Eid des Urdrachen', description: 'Prismatische Runen und Drachenlicht umkreisen deinen Charakter.',
    bossId: 'primordial-dragon', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'dragon-oath' },
  { id: 'primordial-wings', name: 'Schwingen des Urdrachen', description: 'Kosmische Drachenschwingen aus Platinlicht rahmen deine Figur ein.',
    bossId: 'primordial-dragon', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'primordial-wings' },
  { id: 'relic-crown', name: 'Reliktkrone', description: 'Ein königlicher Schnitt im warmen Gold des Sonnenreichs.',
    bossId: 'relic-sovereign', difficulty: 'normal', slot: 'hair', rarity: 'rare',
    modules: { male: 'forest-scout', female: 'dawn-priestess' }, tint: '#e1b657' },
  { id: 'sovereign-regalia', name: 'Ornat des Reliktkönigs', description: 'Ein goldener Herrscherornat mit fließenden Stofflagen und höfischen Zierformen.',
    bossId: 'relic-sovereign', difficulty: 'hard', slot: 'outfit', rarity: 'epic',
    modules: { male: 'frost-scholar', female: 'dawn-priestess' }, tint: '#d5ad64' },
  { id: 'relic-arsenal', name: 'Arsenal der Relikte', description: 'Schwebende Lichtwaffen ordnen sich hinter dir zu einem königlichen Arsenal.',
    bossId: 'relic-sovereign', difficulty: 'epic', slot: 'aura', rarity: 'legendary', auraId: 'relic-arsenal' },
  { id: 'imperial-gate', name: 'Tor des Sonnenreichs', description: 'Ein goldenes Siegelportal und strahlende Reliktbahnen krönen deinen Weg.',
    bossId: 'relic-sovereign', difficulty: 'ultimate', slot: 'aura', rarity: 'mythic', auraId: 'imperial-gate' },
];

/** A reward family is owned once; its worn form follows the current character. */
export interface ResolvedBossCosmetic extends BossCosmetic {
  readonly familyName: string;
  readonly variant: CharacterPresentation | 'unisex';
  readonly variantLabel: string;
  readonly moduleId?: string;
}

const VARIANT_NAMES: Readonly<Record<string, Readonly<Record<CharacterPresentation, string>>>> = {
  'moss-crown': { male: 'Waldkrone · Jade-Topknot', female: 'Waldkrone · Jade-Seitenzopf' },
  'verdant-warden': { male: 'Rüstzeug des Waldhüters', female: 'Rüstzeug der Waldhüterin' },
  'ember-crown': { male: 'Glutkrone · Glut-Spikes', female: 'Glutkrone · Glut-Pferdeschwanz' },
  'cinder-forged': { male: 'Rüstung des Glutritters', female: 'Rüstung der Glutritterin' },
  'dusk-crown': { male: 'Dämmerungskrone · Undercut', female: 'Dämmerungskrone · Twin Tails' },
  'twilight-stalker': { male: 'Platten der Dämmerungsjagd', female: 'Robe der Dämmerungsweberin' },
  'frost-crown': { male: 'Frostkrone · Curtains', female: 'Frostkrone · Pixie' },
  'glacier-guard': { male: 'Nordlicht-Abenteurerjacke', female: 'Nordlicht-Läuferinnenjacke' },
  'cloud-crown': { male: 'Wolkenkrone · Sonnentopknot', female: 'Wolkenkrone · Sonnenwellen' },
  'cloud-regalia': { male: 'Himmlisches Kampfgewand', female: 'Himmlische Hüterinnenrobe' },
  'bloodmoon-crown': { male: 'Rubinmondkrone · Messy Cut', female: 'Rubinmondkrone · Seitenzopf' },
  'regent-regalia': { male: 'Rubinmond-Hofmantel', female: 'Robe der Blutmondregentin' },
  'astral-crown': { male: 'Sternenkrone · Curtains', female: 'Sternenkrone · Pixie' },
  'astral-regalia': { male: 'Mantel des Sternengelehrten', female: 'Mantel der Sternenweberin' },
  'void-crown': { male: 'Leerenkrone · Undercut', female: 'Leerenkrone · Twin Tails' },
  'voidbound-regalia': { male: 'Platten des Leerenritters', female: 'Robe der Leerenweberin' },
  'wyrm-crown': { male: 'Urwyrmkrone · Prismen-Curtains', female: 'Urwyrmkrone · Prismen-Pixie' },
  'prismatic-scale': { male: 'Ritterrüstung des Urdrachen', female: 'Klingenrüstung des Urdrachen' },
  'relic-crown': { male: 'Reliktkrone · Goldtopknot', female: 'Reliktkrone · Königliche Goldwellen' },
  'sovereign-regalia': { male: 'Ornat des Reliktkönigs', female: 'Ornat der Reliktkönigin' },
};

/** Display resolution only: this helper neither grants ownership nor changes a stored profile. */
export function resolveBossCosmetic(id: string, presentation: CharacterPresentation): ResolvedBossCosmetic | undefined {
  if (presentation !== 'male' && presentation !== 'female') return undefined;
  const family = BOSS_COSMETICS.find(item => item.id === id);
  if (!family) return undefined;
  if (family.slot === 'aura') return {
    ...family, familyName: family.name, variant: 'unisex', variantLabel: 'Für alle Charaktere',
  };
  const name = VARIANT_NAMES[family.id]?.[presentation];
  const moduleId = family.modules?.[presentation];
  if (!name || !moduleId) return undefined;
  return { ...family, name, familyName: family.name, moduleId, variant: presentation,
    variantLabel: presentation === 'male' ? 'Männliche Ausführung' : 'Weibliche Ausführung' };
}

export const BOSS_LOOT_RARITY_LABELS: Readonly<Record<BossLootRarity, string>> = {
  rare: 'Selten', epic: 'Episch', legendary: 'Legendär', mythic: 'Mythisch',
};

export function bossFirstClearReward(bossId: BossId, difficulty: BossDifficulty): BossCosmetic {
  const cosmetic = BOSS_COSMETICS.find(item => item.bossId === bossId && item.difficulty === difficulty);
  if (!cosmetic) throw new Error('Für diesen Kampf ist keine Belohnung verfügbar.');
  return cosmetic;
}

export function hasBossCosmetic(snapshot: Pick<GameSnapshot, 'bossProgress'>, cosmeticId: string): boolean {
  return BOSS_COSMETICS.some(item => item.id === cosmeticId) &&
    !!snapshot.bossProgress?.unlockedCosmetics.includes(cosmeticId);
}

export function bossCosmeticForAppearance(appearance: Appearance, slot: 'hair' | 'outfit'): BossCosmetic | undefined {
  const id = slot === 'hair' ? appearance.cosmeticHair : appearance.cosmeticOutfit;
  return BOSS_COSMETICS.find(item => item.id === id && item.slot === slot);
}
