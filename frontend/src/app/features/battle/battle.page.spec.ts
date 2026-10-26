import { computed, signal } from '@angular/core';
import { createMockSnapshot } from '../../data/mock-data';
import { createBossBattle } from '../../domain/auto-battle';
import { bossFirstClearReward } from '../../domain/boss-loot';
import { GameSnapshot } from '../../domain/models';
import { levelProgress } from '../../domain/progression';
import { GameStore } from '../../state/game.store';
import { MembershipStore } from '../../state/membership.store';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { GAME_DAY_CLOCK } from '../../data/game-clock';
import { GAME_REPOSITORY } from '../../data/game.repository';
import { MockGameRepository } from '../../data/mock-game.repository';
import { BattleArena, BATTLE_STAGE_FACTORY } from './battle-arena';
import { BattlePage } from './battle.page';
import { RewardNotifications } from '../../state/reward-notifications';

describe('battle page', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BattlePage],
      providers: [
        provideRouter([]),
        { provide: BROWSER_STORAGE, useValue: null },
        { provide: GAME_DAY_CLOCK, useValue: () => '2026-10-04' },
        { provide: GAME_REPOSITORY, useClass: MockGameRepository },
        { provide: MembershipStore, useValue: { load: vi.fn().mockResolvedValue(true), advancedBosses: () => true, active: () => false, state: () => ({ mode: 'preview' }), loading: () => false, error: () => '' } },
        { provide: BATTLE_STAGE_FACTORY, useValue: async () => ({ setPose: vi.fn(), setTurn: vi.fn(), setMotion: vi.fn(), setVisualProfile: vi.fn(), setBossAbility: vi.fn(), destroy: vi.fn() }) },
      ],
    });
  });

  it('renders current character stats, plays a single turn, and reports a reward-free result', async () => {
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const before = structuredClone(page.game.snapshot());
    const repository = TestBed.inject(GAME_REPOSITORY);
    const record = vi.spyOn(repository, 'record');
    const profile = vi.spyOn(repository, 'updateCharacter');
    const root = fixture.nativeElement as HTMLElement;
    const button = (label: string) => Array.from(root.querySelectorAll('button')).find(b => b.textContent?.trim() === label)!;
    expect(root.textContent).toContain('Probekampf ohne Belohnungen');
    expect(root.textContent).toContain('396 / 396 HP');
    expect(root.textContent).toContain('240 / 240 HP');
    expect(root.querySelectorAll('.boss-choice')).toHaveLength(1);
    expect(root.textContent).not.toContain('Der Wolkenkönig');
    page.chooseBoss('cloud-sovereign');
    expect(page.selectedBoss()).toBe('mosswarden');
    expect(page.tour?.steps().find(step => step.id === 'battle')?.done).toBe(false);
    button('Einzelner Zug →').click();
    await fixture.whenStable();
    expect(page.battle.cursor()).toBe(1);
    const arena = fixture.debugElement.query(By.directive(BattleArena)).componentInstance as BattleArena;
    expect(arena.heroPose()).toBe('attack');
    expect(arena.bossPose()).toBe('hit');
    expect(arena.motion()).toBe(false);
    button('Zum Ergebnis').click();
    await fixture.whenStable();
    expect(root.textContent).toContain('Der Mooswächter ist besiegt.');
    expect(page.tour?.steps().find(step => step.id === 'battle')?.done).toBe(true);
    expect(root.querySelector('.result-card a')?.getAttribute('href')).toBe('/demo#demo-steps');
    expect(button('Zum Ergebnis').disabled).toBe(true);
    expect(page.game.snapshot()).toEqual(before);
    expect(record).not.toHaveBeenCalled();
    expect(profile).not.toHaveBeenCalled();
    expect(TestBed.inject(RewardNotifications).current()).toBeNull();
    expect(root.querySelectorAll('.log-card li').length).toBe(5);
    button('Mit aktuellen Werten vorbereiten').click();
    await fixture.whenStable();
    expect(page.battle.cursor()).toBe(0);
    expect(root.textContent).toContain('396 / 396 HP');
    expect(root.querySelector('.result-card')).toBeNull();
  });


  it('keeps the boss attacking and the hero reacting when a damaging boss turn also heals itself', async () => {
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const original = page.battle.replay()!;
    const replay = { ...original, turns: [{ ...original.turns[0], actor: 'boss' as const, abilityId: 'lunar-eclipse' as const,
      label: 'Mondfinsternis', damage: 176, healing: 28 }, ...original.turns.slice(1)] };
    page.battle.replay.set(replay);
    page.battle.cursor.set(1);
    await fixture.whenStable();
    expect(page.heroPose()).toBe('hit');
    expect(page.bossPose()).toBe('attack');
    const announcement = fixture.nativeElement.querySelector('[aria-live="polite"]').textContent;
    expect(announcement).toContain('176 Schaden');
    expect(announcement).toContain('+28 eigene HP');
  });

  it('offers all seven discovered bosses and level-gated modes as reward-free previews', async () => {
    const discovered = createMockSnapshot();
    discovered.bossProgress = { clearedEncounterIds: ['mosswarden:normal', 'emberwyrm:normal', 'dusk-prowler:normal', 'frost-titan:normal', 'cloud-sovereign:normal', 'bloodmoon-regent:normal'], unlockedCosmetics: [] };
    vi.spyOn(TestBed.inject(GAME_REPOSITORY), 'load').mockResolvedValue(discovered);
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const before = structuredClone(page.game.snapshot());
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.boss-choice')).toHaveLength(7);
    page.chooseBoss('emberwyrm');
    await fixture.whenStable();
    expect(page.battle.replay()!.boss.name).toBe('Der Glutwyrm');
    expect(root.querySelector('.boss progress')!.getAttribute('aria-label')).toBe('Der Glutwyrm: Lebenspunkte');
    expect(root.querySelector('.lock-note')!.textContent).toContain('ab Level 20');
    expect(root.querySelector('.loot-card')!.textContent).toContain('Glutkrone');
    page.chooseBoss('astral-sovereign');
    page.chooseDifficulty('ultimate');
    await fixture.whenStable();
    expect(page.encounter().minimumLevel).toBe(100);
    expect(page.battle.replay()!.difficulty).toBe('ultimate');
    expect(page.battle.replay()!.boss.name).toBe('Der Sternensouverän');
    expect(root.querySelector('.loot-card')!.textContent).toContain('Himmelsschwingen');
    page.chooseBoss('frost-titan');
    await fixture.whenStable();
    expect(page.encounter().minimumLevel).toBe(70);
    expect(root.querySelector('.loot-card')!.textContent).toContain('Ewiger Eisstrom');
    page.chooseBoss('cloud-sovereign');
    await fixture.whenStable();
    expect(page.encounter().minimumLevel).toBe(80);
    expect(root.querySelector('.loot-card')!.textContent).toContain('Sonnenkrone');
    expect(root.querySelector('.challenge-button')).toBeNull();
    page.battle.skip();
    await fixture.whenStable();
    expect(root.querySelector('.result-card')!.textContent).toContain('Nur Vorschau: keine XP und keine Beute');
    expect(page.game.snapshot()).toEqual(before);
  });

  it('shows a retryable loading error instead of starting a fabricated battle', async () => {
    const repository = TestBed.inject(GAME_REPOSITORY);
    vi.spyOn(repository, 'load').mockRejectedValueOnce(new Error('Spielstand nicht erreichbar.'));
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('nicht erreichbar');
    expect(fixture.componentInstance.battle.replay()).toBeNull();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.battle.replay()).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-battle-arena')).not.toBeNull();
  });

  it('lets the player set a tactic before combat and freezes it for the replay', async () => {
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    root.querySelectorAll<HTMLButtonElement>('.tactic-options button')[1].click();
    await fixture.whenStable();
    expect(page.battle.replay()!.tactic).toBe('power');
    expect(page.battle.replay()!.hero.stats.attack).toBe(124);
    page.battle.step();
    await fixture.whenStable();
    expect(root.querySelector<HTMLFieldSetElement>('.tactics')!.disabled).toBe(true);
    page.chooseTactic('guard');
    expect(page.battle.replay()!.tactic).toBe('power');
    page.newBattle();
    page.chooseTactic('guard');
    expect(page.battle.replay()!.tactic).toBe('guard');
  });

  it('keeps the mobile boss guide collapsed, explains real mechanics and hides future encounter tips', async () => {
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const guide = root.querySelector<HTMLDetailsElement>('.boss-guide')!;
    expect(guide.open).toBe(false);
    expect(guide.querySelector('summary')!.textContent).toContain('Fähigkeiten & Kampftipps');
    expect(guide.querySelectorAll('.mechanics-list li')).toHaveLength(3);
    expect(guide.textContent).toContain('Lebende Rinde');
    expect(guide.textContent).toContain('30 %');
    expect(guide.textContent).toContain('Alle Züge laufen automatisch');
    expect(guide.textContent).toContain('Ausdauer');
    expect(guide.textContent).not.toContain('Feueratem');
    expect(guide.textContent).not.toContain('Sternensiegel');
    expect(guide.querySelector('button')).toBeNull();
    expect(root.querySelector('.round-meta')!.textContent).toContain('Erwachende Wurzeln');
    guide.open = true; guide.dispatchEvent(new Event('toggle'));
    await fixture.whenStable(); expect(page.guideOpen()).toBe(true);
    page.chooseBoss('emberwyrm');
    expect(page.selectedBoss()).toBe('mosswarden');
    expect(page.guideOpen()).toBe(true);
  });

  it('shows each discovered boss phase and holds its telegraph through the hero turn without adding combat controls', async () => {
    const snapshot = createMockSnapshot();
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal', 'emberwyrm:normal', 'dusk-prowler:normal', 'frost-titan:normal', 'cloud-sovereign:normal', 'bloodmoon-regent:normal'], unlockedCosmetics: [] };
    // A durable, low-offense preview lets every authored telegraph play out.
    snapshot.character.totalXp = 0; snapshot.skills = [];
    snapshot.character.attributes = { strength: 0, endurance: 1000, mindfulness: 0, recovery: 0, knowledge: 0, focus: 0 };
    vi.spyOn(TestBed.inject(GAME_REPOSITORY), 'load').mockResolvedValue(snapshot);
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const original = structuredClone(page.game.snapshot());
    const root = fixture.nativeElement as HTMLElement;
    const guardIndex = page.battle.replay()!.turns.findIndex(turn => turn.abilityId === 'bark-guard');
    expect(guardIndex).toBeGreaterThanOrEqual(0);
    page.battle.cursor.set(guardIndex + 1); await fixture.whenStable();
    expect(root.querySelector('[aria-live="polite"]')!.textContent).toContain('Lebende Rinde');
    expect(root.querySelector('.charge-cue')).toBeNull();
    page.battle.step(); await fixture.whenStable();
    expect(page.battle.current()?.abilityId).toBe('guarded-strike');
    expect(root.querySelector('.charge-cue')).toBeNull();
    const examples = [
      ['emberwyrm', 'ember-charge', 'Feueratem folgt', 'Glühende Schuppen'],
      ['dusk-prowler', 'dusk-guard', 'Schattenraserei folgt', 'Lauernde Schatten'],
      ['bloodmoon-regent', 'bloodmoon-seal', 'Mondfinsternis folgt', 'Rubinroter Hof'],
      ['astral-sovereign', 'star-seal', 'Sternenbruch folgt', 'Sternenwacht'],
      ['frost-titan', 'frost-charge', 'Eisbrecher folgt', 'Uraltes Eis'],
      ['cloud-sovereign', 'solar-charge', 'Sonnenschlag folgt', 'Goldener Himmelsweg'],
    ] as const;
    for (const [bossId, charge, label, phase] of examples) {
      page.guideOpen.set(true);
      page.chooseBoss(bossId); await fixture.whenStable();
      expect(root.querySelector<HTMLDetailsElement>('.boss-guide')!.open).toBe(false);
      expect(root.querySelectorAll('.boss-guide .mechanics-list li')).toHaveLength(3);
      expect(root.querySelector('.round-meta')!.textContent).toContain(phase);
      const replay = page.battle.replay()!;
      const index = replay.turns.findIndex(turn => turn.abilityId === charge);
      expect(index).toBeGreaterThanOrEqual(0);
      page.battle.cursor.set(index + 1); await fixture.whenStable();
      expect(root.querySelector('.round-strip')!.classList.contains('charging')).toBe(true);
      expect(root.querySelector('.charge-cue')!.textContent).toContain(label);
      expect(root.querySelector('[aria-live="polite"]')!.textContent).toContain('Kein direkter Schaden');
      expect(root.querySelector('.log-card li small')!.textContent).toBe('Effekt');
      page.battle.step(); await fixture.whenStable();
      expect(page.battle.current()!.actor).toBe('hero');
      expect(root.querySelector('.charge-cue')!.textContent).toContain(label);
      page.battle.step(); await fixture.whenStable();
      expect(page.battle.current()!.actor).toBe('boss');
      expect(page.battle.current()!.damage).toBeGreaterThan(0);
      expect(root.querySelector('.charge-cue')).toBeNull();
      page.battle.skip(); await fixture.whenStable();
      expect(root.querySelector('.charge-cue')).toBeNull();
    }
    expect(page.game.snapshot()).toEqual(original);
    expect(TestBed.inject(RewardNotifications).current()).toBeNull();
  });
});


describe('account boss encounters', () => {
  function setup(plusAllowed = true, mode: 'preview' | 'live' = 'preview') {
    const initial = createMockSnapshot();
    initial.character.createdByPlayer = true;
    initial.character.id = 'account-hero-a';
    const snapshot = signal<GameSnapshot | null>(initial);
    const busy = signal(false);
    const plus = signal(plusAllowed);
    const game = {
      accountMode: true, snapshot, busy, error: signal(''),
      level: computed(() => levelProgress(snapshot()?.character.totalXp ?? 0)),
      profileIsSaved: computed(() => snapshot()?.character.createdByPlayer ?? false),
      load: vi.fn(), refresh: vi.fn(), fightBoss: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [BattlePage],
      providers: [provideRouter([]), { provide: BROWSER_STORAGE, useValue: null },
        { provide: GameStore, useValue: game },
        { provide: MembershipStore, useValue: { load: vi.fn().mockResolvedValue(true), advancedBosses: plus, active: () => mode === 'live' && plus(), state: () => ({ mode }), loading: () => false, error: () => '' } },
        { provide: BATTLE_STAGE_FACTORY, useValue: async () => ({ setPose: vi.fn(), setTurn: vi.fn(), setMotion: vi.fn(), setVisualProfile: vi.fn(), setBossAbility: vi.fn(), destroy: vi.fn() }) }],
    });
    return { fixture: TestBed.createComponent(BattlePage), game, initial, plus };
  }

  it('ends live Free boss access at level 50 without hiding earned rewards or capping character progress', async () => {
    const { fixture, game, initial, plus } = setup(false, 'live');
    initial.character.totalXp = 10_000_000;
    initial.bossProgress = {
      clearedEncounterIds: ['mosswarden:normal', 'emberwyrm:normal', 'dusk-prowler:normal', 'frost-titan:normal', 'cloud-sovereign:normal'],
      unlockedCosmetics: ['moss-crown'],
    };
    const saved = structuredClone(initial);
    game.snapshot.set(saved);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.chooseBoss('cloud-sovereign');
    expect(page.canChallenge()).toBe(true);
    expect(page.playbackLocked()).toBe(false);
    page.chooseDifficulty('hard');
    expect(page.canChallenge()).toBe(false);
    page.chooseDifficulty('normal');
    page.chooseBoss('bloodmoon-regent');
    await fixture.whenStable();
    expect(page.canChallenge()).toBe(false);
    expect(page.playbackLocked()).toBe(true);
    await page.challenge();
    page.playPreview(); page.skipPreview(); page.stepPreview();
    expect(game.fightBoss).not.toHaveBeenCalled();
    expect(page.battle.cursor()).toBe(0);
    expect(page.battle.playing()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Dein kostenloses Bosskapitel endet beim Wolkenkönig auf Level 50');
    expect(game.snapshot()).toEqual(saved);
    expect(game.level().level).toBeGreaterThan(50);
    plus.set(true);
    await fixture.whenStable();
    expect(page.canChallenge()).toBe(true);
    expect(page.playbackLocked()).toBe(false);
    page.stepPreview();
    expect(page.battle.cursor()).toBe(1);
    expect(game.snapshot()).toEqual(saved);
  });

  it('pauses a Plus practice fight when live access expires and guards all playback controls', async () => {
    const { fixture, plus } = setup(true, 'live');
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.chooseDifficulty('hard');
    page.playPreview();
    expect(page.battle.playing()).toBe(true);
    plus.set(false);
    await fixture.whenStable();
    expect(page.battle.playing()).toBe(false);
    const cursor = page.battle.cursor();
    page.playPreview(); page.skipPreview(); page.stepPreview();
    expect(page.battle.cursor()).toBe(cursor);
    expect(page.battle.playing()).toBe(false);
  });

  it('finishes an already committed Plus result after expiry but locks the next fight', async () => {
    const { fixture, game, initial, plus } = setup(true, 'live');
    initial.character.totalXp = 10_000_000;
    game.snapshot.set(structuredClone(initial));
    game.fightBoss.mockResolvedValue({ snapshot: initial,
      replay: createBossBattle(initial, { bossId: 'mosswarden', difficulty: 'hard' }),
      firstClear: false, reward: null, duplicate: false });
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.chooseDifficulty('hard');
    await page.challenge();
    page.battle.pause();
    expect(page.fightResult()).not.toBeNull();
    plus.set(false);
    await fixture.whenStable();
    expect(page.canChallenge()).toBe(false);
    expect(page.playbackLocked()).toBe(false);
    page.skipPreview();
    expect(page.battle.complete()).toBe(true);
    page.newBattle();
    await fixture.whenStable();
    expect(page.playbackLocked()).toBe(true);
    page.skipPreview();
    expect(page.battle.cursor()).toBe(0);
    expect(game.fightBoss).toHaveBeenCalledTimes(1);
  });

  it('reveals the server-committed first-clear cosmetic after playback, with no claim or replay farming', async () => {
    const { fixture, game, initial } = setup();
    const earned = bossFirstClearReward('mosswarden', 'normal');
    const snapshot = structuredClone(initial);
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: [earned.id] };
    const result = { snapshot, replay: createBossBattle(initial, { bossId: 'mosswarden' }), firstClear: true, reward: earned, duplicate: false };
    game.fightBoss.mockImplementation(async () => { game.snapshot.set(snapshot); return result; });
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('.challenge-button')!.click();
    await fixture.whenStable();
    page.battle.pause();
    expect(game.fightBoss).toHaveBeenCalledExactlyOnceWith('mosswarden', 'normal', 'balanced');
    expect(page.battle.replay()!.mode).toBe('boss');
    expect(root.querySelector('.earned-reward')).toBeNull();
    expect(page.bosses().map(boss => boss.id)).toEqual(['mosswarden']);
    expect(page.rewardOwned()).toBe(false);
    const notifications = TestBed.inject(RewardNotifications);
    expect(notifications.current()).toBeNull();
    page.battle.skip();
    await fixture.whenStable();
    expect(root.querySelector('.earned-reward')!.textContent).toContain('Waldkrone');
    expect(notifications.current()?.name).toBe('Waldkrone · Jade-Topknot');
    expect(page.bosses().map(boss => boss.id)).toEqual(['mosswarden', 'emberwyrm']);
    notifications.dismiss();
    expect(root.querySelector('.earned-reward a')!.getAttribute('href')).toBe('/character/create');
    page.battle.play();
    expect(page.bosses().map(boss => boss.id)).toEqual(['mosswarden', 'emberwyrm']);
    page.battle.skip();
    await fixture.whenStable();
    expect(game.fightBoss).toHaveBeenCalledTimes(1);
    expect(notifications.current()).toBeNull();
    expect(game.snapshot()!.character.totalXp).toBe(initial.character.totalXp);
    expect(page.battle.replay()!.rewards).toEqual({ xp: 0, loot: [] });
    expect(page.tour).toBeNull();
  });

  it('never calls the server below the required level and clears the previous owner replay', async () => {
    const { fixture, game, initial } = setup();
    initial.character.totalXp = 0;
    game.snapshot.set(structuredClone(initial));
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.canChallenge()).toBe(false);
    await page.challenge();
    expect(game.fightBoss).not.toHaveBeenCalled();
    page.battle.play();
    game.snapshot.set(null);
    await fixture.whenStable();
    expect(page.battle.replay()).toBeNull();
    expect(page.battle.playing()).toBe(false);
    const next = structuredClone(initial);
    next.character.id = 'account-hero-b'; next.character.name = 'Neue Reise';
    game.snapshot.set(next);
    await fixture.whenStable();
    expect(page.battle.replay()!.hero.name).toBe('Neue Reise');
    expect(page.fightResult()).toBeNull();
  });

  it('keeps a failed server request reward-free and allows retrying the encounter', async () => {
    const { fixture, game } = setup();
    game.fightBoss.mockImplementation(async () => { game.error.set('Verbindung unterbrochen. Bitte erneut versuchen.'); return null; });
    await fixture.whenStable();
    await fixture.componentInstance.challenge();
    await fixture.whenStable();
    expect(fixture.componentInstance.fightResult()).toBeNull();
    expect(fixture.componentInstance.battle.replay()!.mode).toBe('practice');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Verbindung unterbrochen');
    expect(fixture.nativeElement.querySelector('.challenge-button')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.earned-reward')).toBeNull();
    expect(TestBed.inject(RewardNotifications).current()).toBeNull();
  });

  it('shows already-earned loot without inventing a new reward on repeated wins', async () => {
    const { fixture, game, initial } = setup();
    initial.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] };
    game.snapshot.set(structuredClone(initial));
    game.fightBoss.mockResolvedValue({ snapshot: initial, replay: createBossBattle(initial, { bossId: 'mosswarden' }), firstClear: false, reward: null, duplicate: false });
    await fixture.whenStable();
    await fixture.componentInstance.challenge();
    fixture.componentInstance.battle.skip();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.result-card').textContent).toContain('Bereits verdient: Waldkrone');
    expect(fixture.nativeElement.querySelector('.loot-state').textContent).toContain('Bereits verdient');
    expect(fixture.nativeElement.querySelector('.earned-reward')).toBeNull();
    expect(TestBed.inject(RewardNotifications).current()).toBeNull();
  });

  it('does not celebrate a recovered duplicate first-clear response or a previous owner result', async () => {
    const { fixture, game, initial } = setup();
    const snapshot = structuredClone(initial);
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] };
    const result = { snapshot, replay: createBossBattle(initial, { bossId: 'mosswarden' }), firstClear: true,
      reward: bossFirstClearReward('mosswarden', 'normal'), duplicate: true };
    game.fightBoss.mockResolvedValue(result);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    await page.challenge(); page.battle.skip(); await fixture.whenStable();
    const queue = TestBed.inject(RewardNotifications);
    expect(queue.current()).toBeNull();
    page.fightResult.set({ ...result, duplicate: false });
    const next = structuredClone(initial); next.character.id = 'next-owner';
    game.snapshot.set(next); await fixture.whenStable();
    expect(queue.current()).toBeNull(); expect(page.fightResult()).toBeNull();
  });
  it('keeps a first-clear female reward tied to the accepted result while a later profile change uses the male collection form', async () => {
    const { fixture, game, initial } = setup();
    initial.character.appearance = { ...initial.character.appearance, presentation: 'female', illustration: 'moonblade', hair: 'f-waves' };
    game.snapshot.set(structuredClone(initial));
    const accepted = structuredClone(initial);
    accepted.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] };
    const result = { snapshot: accepted, replay: createBossBattle(initial, { bossId: 'mosswarden' }),
      firstClear: true, reward: bossFirstClearReward('mosswarden', 'normal'), duplicate: false };
    game.fightBoss.mockImplementation(async () => { game.snapshot.set(accepted); return result; });
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.loot-card h2')!.textContent).toBe('Waldkrone · Jade-Seitenzopf');
    expect(root.querySelector('.loot-card img')!.getAttribute('src')).toBe('/art/loot/moss-crown-female-v1.webp');
    await page.challenge(); page.battle.pause(); await fixture.whenStable();
    const queue = TestBed.inject(RewardNotifications);
    expect(queue.current()).toBeNull();
    const updated = structuredClone(accepted);
    updated.character.appearance = { ...updated.character.appearance, presentation: 'male', illustration: 'emerald-knight', hair: 'm-spiky' };
    game.snapshot.set(updated);
    page.battle.skip(); await fixture.whenStable();
    expect(root.querySelector('.earned-reward strong')!.textContent).toBe('Waldkrone · Jade-Seitenzopf');
    expect(root.querySelector('.earned-reward img')!.getAttribute('src')).toBe('/art/loot/moss-crown-female-v1.webp');
    expect(root.querySelector('.loot-card h2')!.textContent).toBe('Waldkrone · Jade-Topknot');
    expect(queue.current()).toMatchObject({ name: 'Waldkrone · Jade-Seitenzopf', boss: { id: 'moss-crown', variant: 'female' } });
    expect(game.snapshot()!.bossProgress).toEqual(accepted.bossProgress);
    expect(accepted.character.appearance.presentation).toBe('female');
    expect(game.fightBoss).toHaveBeenCalledTimes(1);
  });

});
