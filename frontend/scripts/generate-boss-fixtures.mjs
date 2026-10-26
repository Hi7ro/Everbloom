/** Regenerate shared Java combat fixtures from the TypeScript reference, never from live accounts. */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const project = resolve(frontend, '..');
const target = mkdtempSync(resolve(tmpdir(), 'everbloom-boss-fixtures-'));
try {
  const compilation = spawnSync(process.execPath, [resolve(frontend, 'node_modules/typescript/bin/tsc'),
    'src/app/domain/auto-battle.ts', 'src/app/domain/boss-catalog.ts', 'src/app/domain/boss-loot.ts', 'src/app/data/mock-data.ts',
    '--module', 'commonjs', '--target', 'ES2022', '--outDir', target, '--skipLibCheck', '--strict'], { cwd: frontend, encoding: 'utf8' });
  if (compilation.status !== 0) throw new Error(compilation.stdout + compilation.stderr);
  const require = createRequire(import.meta.url);
  const { createBossBattle } = require(resolve(target, 'domain/auto-battle.js'));
  const { BOSS_CATALOG, BOSS_DIFFICULTIES, bossEncounter } = require(resolve(target, 'domain/boss-catalog.js'));
  const { BOSS_COSMETICS } = require(resolve(target, 'domain/boss-loot.js'));
  const { createMockSnapshot } = require(resolve(target, 'data/mock-data.js'));
  const fixtures = [];
  const balance = ['level,mode,skillXpShare,tactic,outcome,rounds,remainingHp,maxHp'];
  const bloodmoonBalance = ['level,mode,skillXpShare,tactic,outcome,rounds,remainingHp,maxHp'];
  const astralBalance = ['level,mode,skillXpShare,tactic,outcome,rounds,remainingHp,maxHp'];
  const campaignBalance = ['boss,level,mode,skillXpShare,tactic,outcome,rounds,remainingHp,maxHp'];
  function build(level, share = 0) {
    const snapshot = createMockSnapshot();
    snapshot.character.totalXp = (level - 1) * 1200 + (level - 1) * (level - 2) * 100;
    snapshot.character.attributes = { strength: 1, endurance: 1, focus: 1, knowledge: 1, mindfulness: 1, recovery: 1 };
    snapshot.skills = share ? ['calisthenics', 'running', 'bjj', 'programming', 'meditation', 'recovery']
      .map(skillId => ({ skillId, totalXp: Math.floor(snapshot.character.totalXp * share / 6) })) : [];
    return snapshot;
  }
  function add(name, snapshot, options) {
    const replay = createBossBattle(snapshot, options);
    fixtures.push({ name, snapshot, options, expected: replay });
    return replay;
  }
  for (const boss of BOSS_CATALOG) for (const mode of BOSS_DIFFICULTIES) for (const tactic of ['balanced', 'power', 'guard']) {
    const encounter = bossEncounter(boss.id, mode.id);
    add(`${boss.id}:${mode.id}:${tactic}`, build(encounter.recommendedLevel), { bossId: boss.id, difficulty: mode.id, tactic });
  }
  for (const boss of BOSS_CATALOG) for (const difficulty of ['hard', 'epic']) for (const tactic of ['balanced', 'power', 'guard']) {
    add(`${boss.id}:${difficulty}:${tactic}:minimum`, build(bossEncounter(boss.id, difficulty).minimumLevel), { bossId: boss.id, difficulty, tactic });
  }
  for (const tactic of ['balanced', 'power', 'guard']) {
    add(`mosswarden:normal:${tactic}:earned-skills`, createMockSnapshot(), { bossId: 'mosswarden', difficulty: 'normal', tactic });
  }
  for (const [level, difficulty] of [[50, 'normal'], [55, 'normal'], [65, 'hard'], [75, 'epic'], [85, 'ultimate']]) {
    for (const share of [0, .35, .7]) for (const tactic of ['balanced', 'power', 'guard']) {
      const replay = add(`cloud:${difficulty}:level${level}:skills${share}:${tactic}`, build(level, share), { bossId: 'cloud-sovereign', difficulty, tactic });
      balance.push([level, difficulty, share, tactic, replay.outcome, replay.roundCount, replay.turns.at(-1)?.heroHp, replay.hero.stats.maxHp].join(','));
    }
  }
  for (const boss of BOSS_CATALOG.filter(boss => boss.id !== 'cloud-sovereign')) {
    for (const offset of [0, 10, 30]) for (const share of [0, .35, .7]) for (const tactic of ['balanced', 'power', 'guard']) {
      const level = boss.baseLevel + offset;
      const options = { bossId: boss.id, difficulty: 'normal', tactic };
      const snapshot = build(level, share);
      const replay = offset === 0 && share > 0
        ? add(`${boss.id}:normal:level${level}:skills${share}:${tactic}`, snapshot, options)
        : createBossBattle(snapshot, options);
      campaignBalance.push([boss.id, level, 'normal', share, tactic, replay.outcome, replay.roundCount, replay.turns.at(-1)?.heroHp, replay.hero.stats.maxHp].join(','));
    }
  }
  // Later-horizon difficulty gates and realistic earned-skill builds remain explicit observations.
  for (const [level, difficulty] of [[70, 'normal'], [75, 'hard'], [80, 'hard'], [85, 'epic'], [90, 'epic'], [100, 'ultimate']]) {
    for (const share of [0, .35, .7]) for (const tactic of ['balanced', 'power', 'guard']) {
      const snapshot = build(level, share);
      const options = { bossId: 'astral-sovereign', difficulty, tactic };
      const replay = difficulty !== 'normal' && level === bossEncounter('astral-sovereign', difficulty).minimumLevel && share > 0
        ? add(`astral:${difficulty}:level${level}:skills${share}:${tactic}`, snapshot, options)
        : createBossBattle(snapshot, options);
      astralBalance.push([level, difficulty, share, tactic, replay.outcome, replay.roundCount, replay.turns.at(-1)?.heroHp, replay.hero.stats.maxHp].join(','));
    }
  }
  for (const [level, difficulty] of [[60, 'normal'], [65, 'hard'], [70, 'hard'], [75, 'epic'], [80, 'epic'], [90, 'ultimate']]) {
    for (const share of [0, .35, .7]) for (const tactic of ['balanced', 'power', 'guard']) {
      const snapshot = build(level, share);
      const options = { bossId: 'bloodmoon-regent', difficulty, tactic };
      const replay = difficulty !== 'normal' && level === bossEncounter('bloodmoon-regent', difficulty).minimumLevel && share > 0
        ? add(`bloodmoon:${difficulty}:level${level}:skills${share}:${tactic}`, snapshot, options)
        : createBossBattle(snapshot, options);
      bloodmoonBalance.push([level, difficulty, share, tactic, replay.outcome, replay.roundCount, replay.turns.at(-1)?.heroHp, replay.hero.stats.maxHp].join(','));
    }
  }
  for (const bossId of ['void-devourer', 'primordial-dragon', 'relic-sovereign']) {
    const rows = ['level,mode,skillXpShare,tactic,outcome,rounds,remainingHp,maxHp'];
    for (const mode of BOSS_DIFFICULTIES) {
      const encounter = bossEncounter(bossId, mode.id);
      for (const level of new Set([encounter.minimumLevel, encounter.recommendedLevel])) {
        for (const share of [0, .35, .7]) for (const tactic of ['balanced', 'power', 'guard']) {
          const snapshot = build(level, share);
          const options = { bossId, difficulty: mode.id, tactic };
          const replay = mode.id !== 'normal' && level === encounter.minimumLevel && share > 0
            ? add(`${bossId}:${mode.id}:level${level}:skills${share}:${tactic}`, snapshot, options)
            : createBossBattle(snapshot, options);
          rows.push([level, mode.id, share, tactic, replay.outcome, replay.roundCount, replay.turns.at(-1)?.heroHp, replay.hero.stats.maxHp].join(','));
        }
      }
    }
    writeFileSync(resolve(project, `docs/balance/${bossId}-v1.csv`), rows.join('\n') + '\n');
  }
  writeFileSync(resolve(project, 'backend/src/test/resources/boss-parity-fixtures.json'), JSON.stringify(fixtures, null, 2) + '\n');
  writeFileSync(resolve(project, 'backend/src/test/resources/boss-cosmetic-fixtures.json'), JSON.stringify(BOSS_COSMETICS, null, 2) + '\n');
  writeFileSync(resolve(project, 'docs/balance/cloud-sovereign-v1.csv'), balance.join('\n') + '\n');
  writeFileSync(resolve(project, 'docs/balance/campaign-bosses-v1.csv'), campaignBalance.join('\n') + '\n');
  writeFileSync(resolve(project, 'docs/balance/astral-sovereign-v1.csv'), astralBalance.join('\n') + '\n');
  writeFileSync(resolve(project, 'docs/balance/bloodmoon-regent-v1.csv'), bloodmoonBalance.join('\n') + '\n');
  console.log(`Generated ${fixtures.length} combat fixtures, ${BOSS_COSMETICS.length} cosmetic contracts and ${balance.length - 1} final-boss + ${campaignBalance.length - 1} campaign + ${astralBalance.length - 1} astral + ${bloodmoonBalance.length - 1} bloodmoon balance observations.`);
} finally {
  rmSync(target, { recursive: true, force: true });
}
