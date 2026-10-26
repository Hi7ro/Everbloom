// Pixi's CSP adapter replaces dynamic shader generation; no unsafe-eval permission is needed.
import 'pixi.js/unsafe-eval';
import { Application, Container } from 'pixi.js';
import { BossDifficulty, BossId } from '../domain/boss-catalog';
import { Appearance } from '../domain/models';
import type { CombatVisualProfile } from '../domain/combat-visual-profile';
import { BOSS_VISUALS, bossVisual } from './boss-visuals';
import { createCombatEffects } from './combat-effects';
import { ActorAdapter, ActorId, ActorPose } from './actor-adapter';
import { createHeroActor, createBossActor } from './portrait-textures';
import { ARENA_HEIGHT, ARENA_WIDTH, createForestArena } from './forest-arena';
import { AuraLayer, createAuraLayer } from './aura-layer';
import { BattleStageTurn, createBattleTurnController } from './battle-stage-turns';

export interface BattleStageOptions {
  appearance: Appearance;
  visualProfile?: CombatVisualProfile;
  bossId?: BossId;
  difficulty?: BossDifficulty;
  motion: boolean;
  signal?: AbortSignal;
}

export interface BattleStage {
  setTurn(turn: BattleStageTurn | null): void;
  setPose(actor: ActorId, pose: ActorPose): void;
  setMotion(enabled: boolean): void;
  setVisualProfile(profile: CombatVisualProfile): void;
  setBossAbility(abilityId?: string): void;
  destroy(): void;
}

/**
 * Lazy-load this module from the battle route, never from the application shell.
 * It owns display resources only. Accessible labels, controls, HP and rewards stay
 * in Angular; rendering cannot award XP or alter a weekly boss's persisted HP.
 */
export async function createBattleStage(host: HTMLElement, options: BattleStageOptions): Promise<BattleStage> {
  const controller = new AbortController();
  const app = new Application();
  let initialized = false;
  let destroyed = false;
  let motion = options.motion;
  let inView = true;
  let resizeObserver: ResizeObserver | undefined;
  let intersectionObserver: IntersectionObserver | undefined;
  let arena: ReturnType<typeof createForestArena> | undefined;
  let actors: Record<ActorId, ActorAdapter> | undefined;
  let world: Container | undefined;
  let effects: ReturnType<typeof createCombatEffects> | undefined;
  let aura: AuraLayer | undefined;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const canMove = () => motion && !motionQuery.matches;
  const isVisible = () => !document.hidden && inView;
  const advance = (seconds: number) => {
    const moving = canMove();
    arena?.update(seconds, moving);
    actors?.hero.update(seconds, moving);
    actors?.boss.update(seconds, moving);
    aura?.update(seconds, moving);
    effects?.update(seconds, moving);
  };
  const paint = (seconds = 0) => {
    if (destroyed || !initialized) return;
    advance(seconds);
    app.render();
  };
  const syncRunning = () => {
    if (destroyed || !initialized) return;
    if (canMove() && isVisible()) app.start();
    else app.stop();
    if (isVisible()) paint();
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    options.signal?.removeEventListener('abort', onAbort);
    document.removeEventListener('visibilitychange', syncRunning);
    motionQuery.removeEventListener('change', syncRunning);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (initialized) {
      app.stop();
      aura?.destroy();
      actors?.hero.destroy();
      actors?.boss.destroy();
      effects?.destroy();
      app.destroy({ removeView: true }, { children: true });
      arena?.dispose();
    }
  };
  const onAbort = () => {
    controller.abort();
    // Initialization must finish before destroying Pixi's renderer.
    if (initialized) destroy();
  };
  options.signal?.addEventListener('abort', onAbort, { once: true });
  if (options.signal?.aborted) controller.abort();

  try {
    if (controller.signal.aborted) throw new DOMException('Battle stage cancelled', 'AbortError');
    await app.init({
      width: Math.max(1, host.clientWidth),
      height: Math.max(1, host.clientHeight),
      background: '#091b20',
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      autoStart: false,
      sharedTicker: false,
      preference: 'webgl',
      powerPreference: 'low-power',
    });
    initialized = true;
    if (controller.signal.aborted) throw new DOMException('Battle stage cancelled', 'AbortError');
    app.ticker.maxFPS = 30;
    app.canvas.setAttribute('aria-hidden', 'true');
    app.canvas.style.display = 'block';
    app.canvas.style.width = '100%';
    app.canvas.style.height = '100%';
    app.canvas.style.pointerEvents = 'none';
    app.stage.eventMode = 'none';

    const loaded = await Promise.allSettled([
      createHeroActor(options.appearance, controller.signal),
      createBossActor(options.bossId ?? 'mosswarden', controller.signal, options.difficulty),
      createAuraLayer(options.appearance.aura, controller.signal),
    ]);
    if (destroyed || controller.signal.aborted || loaded.some(item => item.status === 'rejected')) {
      loaded.forEach(item => { if (item.status === 'fulfilled') item.value.destroy(); });
      const failed = loaded.find(item => item.status === 'rejected');
      throw failed?.status === 'rejected' ? failed.reason : new DOMException('Battle stage cancelled', 'AbortError');
    }
    const [hero, boss, equippedAura] = loaded as [PromiseFulfilledResult<ActorAdapter>, PromiseFulfilledResult<ActorAdapter>, PromiseFulfilledResult<AuraLayer>];
    actors = { hero: hero.value, boss: boss.value };
    aura = equippedAura.value;
    // The selected painted aura follows the hero, behind all character/collar layers.
    actors.hero.view.addChildAt(aura.view, 0);
    if (options.visualProfile) actors.hero.setAttackVisual?.(options.visualProfile.style, options.visualProfile.tier);
    arena = createForestArena(options.bossId ?? 'mosswarden');
    world = new Container();
    world.addChild(arena.view);
    const heroAnchor = new Container();
    heroAnchor.position.set(230, 386);
    heroAnchor.scale.set(1);
    heroAnchor.addChild(actors.hero.view);
    const bossAnchor = new Container();
    // Roughly 1.5 times the hero's visible height, with room for antlers and recoil.
    const framed = bossVisual(options.bossId ?? 'mosswarden', options.difficulty).framed;
    // New sprites retain a transparent safety border for weapons and wide forms.
    bossAnchor.position.set(550, framed ? 424 : 398);
    bossAnchor.scale.set(framed ? 1.5 : 1.3);
    bossAnchor.addChild(actors.boss.view);
    const selectedBoss = options.bossId ?? 'mosswarden';
    effects = createCombatEffects({ heroProfile: options.visualProfile,
      bossStyle: BOSS_VISUALS[selectedBoss].attack,
      bossTier: selectedBoss === 'mosswarden' ? 1 : selectedBoss === 'emberwyrm' ? 2 : 3 });
    const turns = createBattleTurnController(actors, effects, canMove);
    world.addChild(heroAnchor, bossAnchor, effects.view);
    app.stage.addChild(world);
    host.appendChild(app.canvas);

    const resize = () => {
      if (destroyed || !world) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      app.renderer.resize(width, height);
      const scale = Math.min(width / ARENA_WIDTH, height / ARENA_HEIGHT);
      world.scale.set(scale);
      world.position.set((width - ARENA_WIDTH * scale) / 2, (height - ARENA_HEIGHT * scale) / 2);
      paint();
    };
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        syncRunning();
      });
      intersectionObserver.observe(host);
    }
    document.addEventListener('visibilitychange', syncRunning);
    motionQuery.addEventListener('change', syncRunning);
    // The application ticker already renders; this listener only advances the scene.
    app.ticker.add(ticker => {
      advance(Math.min(ticker.deltaMS / 1000, .1));
    });
    resize();
    syncRunning();
    return {
      setPose(actor, pose) {
        if (destroyed) return;
        turns.setPose(actor, pose);
        if (isVisible()) paint();
      },
      setTurn(turn) {
        if (destroyed) return;
        turns.setTurn(turn);
        // Clearing the turn must paint too: a paused/reduced-motion canvas has no next frame.
        if (isVisible()) paint();
      },
      setMotion(enabled) {
        motion = enabled;
        syncRunning();
      },
      setBossAbility(abilityId) {
        if (destroyed) return;
        actors?.boss.setAbility?.(abilityId);
        effects?.setBossAbility(abilityId);
      },
      setVisualProfile(profile) {
        if (destroyed) return;
        actors?.hero.setAttackVisual?.(profile.style, profile.tier);
        effects?.setHeroProfile(profile);
        if (isVisible()) paint();
      },
      destroy,
    };
  } catch (error) {
    destroy();
    throw error;
  }
}
