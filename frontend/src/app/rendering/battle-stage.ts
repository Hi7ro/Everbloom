import { Application, Container, Graphics } from 'pixi.js';
import { Appearance } from '../domain/models';
import { ActorAdapter, ActorId, ActorPose } from './actor-adapter';
import { createHeroActor, createMosswardenActor } from './portrait-textures';
import { ARENA_HEIGHT, ARENA_WIDTH, createForestArena } from './forest-arena';

export type { ActorId, ActorPose } from './actor-adapter';

export interface BattleStageOptions {
  appearance: Appearance;
  motion: boolean;
  signal?: AbortSignal;
}

export interface BattleStage {
  setPose(actor: ActorId, pose: ActorPose): void;
  setMotion(enabled: boolean): void;
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
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const canMove = () => motion && !motionQuery.matches;
  const isVisible = () => !document.hidden && inView;
  const paint = (seconds = 0) => {
    if (destroyed || !initialized) return;
    arena?.update(seconds, canMove());
    actors?.hero.update(seconds, canMove());
    actors?.boss.update(seconds, canMove());
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
      actors?.hero.destroy();
      actors?.boss.destroy();
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
      createMosswardenActor(controller.signal),
    ]);
    if (destroyed || controller.signal.aborted || loaded.some(item => item.status === 'rejected')) {
      loaded.forEach(item => { if (item.status === 'fulfilled') item.value.destroy(); });
      const failed = loaded.find(item => item.status === 'rejected');
      throw failed?.status === 'rejected' ? failed.reason : new DOMException('Battle stage cancelled', 'AbortError');
    }
    const [hero, boss] = loaded as [PromiseFulfilledResult<ActorAdapter>, PromiseFulfilledResult<ActorAdapter>];
    actors = { hero: hero.value, boss: boss.value };
    arena = createForestArena();
    world = new Container();
    world.addChild(arena.view);
    const auraColors: Record<string, number> = {
      sage: 0x9bcdb1, rose: 0xe9a2bd, void: 0xa38ee0, aurora: 0x8de0d4,
      starlight: 0xf2d7a1, 'moss-spirit': 0xaaca77,
    };
    if (options.appearance.aura !== 'none') {
      const auraColor = auraColors[options.appearance.aura] ?? 0xb6c6b9;
      const aura = new Graphics()
        .ellipse(233, 386, 86, 15).fill({ color: auraColor, alpha: .1 })
        .ellipse(233, 386, 76, 12).stroke({ color: auraColor, alpha: .28, width: 1.5 });
      world.addChild(aura);
    }
    const heroAnchor = new Container();
    heroAnchor.position.set(230, 386);
    heroAnchor.scale.set(1.15);
    heroAnchor.addChild(actors.hero.view);
    const bossAnchor = new Container();
    bossAnchor.position.set(553, 386);
    bossAnchor.addChild(actors.boss.view);
    world.addChild(heroAnchor, bossAnchor);
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
      const delta = Math.min(ticker.deltaMS / 1000, .1);
      arena?.update(delta, canMove());
      actors?.hero.update(delta, canMove());
      actors?.boss.update(delta, canMove());
    });
    resize();
    syncRunning();
    return {
      setPose(actor, pose) {
        if (destroyed) return;
        actors?.[actor].setPose(pose);
        if (isVisible()) paint();
      },
      setMotion(enabled) {
        motion = enabled;
        syncRunning();
      },
      destroy,
    };
  } catch (error) {
    destroy();
    throw error;
  }
}
