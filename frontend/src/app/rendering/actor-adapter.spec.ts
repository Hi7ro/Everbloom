// @vitest-environment jsdom
import { Container } from 'pixi.js';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { createLayeredActor } from './actor-adapter';

// Pixi probes canvas support on import; these pose tests deliberately do not create a GPU renderer.
const canvasProbe = vi.hoisted(() => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null));
afterAll(() => canvasProbe.mockRestore());

function actor(facing: 1 | -1 = 1) {
  const view = new Container();
  const body = new Container();
  const head = new Container();
  head.y = -10;
  view.addChild(body, head);
  const dispose = vi.fn();
  return { view, body, head, dispose, adapter: createLayeredActor({ view, body, head, facing, dispose }) };
}

describe('layered battle actors', () => {
  it('moves body and head together while keeping the feet anchored', () => {
    const { adapter, view, body, head } = actor();
    adapter.update(1.4, true);
    expect(body.scale.y).toBeGreaterThan(1);
    expect(head.y).toBeLessThan(-10);
    expect(view.y).toBe(0);
    adapter.destroy();
  });

  it('lunges towards the opponent and settles after the strike', () => {
    const hero = actor(1);
    const boss = actor(-1);
    for (const current of [hero, boss]) {
      current.adapter.setPose('attack');
      current.adapter.update(.375, true);
    }
    expect(hero.view.x).toBe(36);
    expect(boss.view.x).toBe(-36);
    hero.adapter.update(1, true);
    expect(hero.view.x).toBe(0);
    hero.adapter.destroy();
    boss.adapter.destroy();
  });

  it('removes breathing, lunges and victory bouncing with motion disabled', () => {
    const { adapter, view, body, head } = actor();
    adapter.update(1.4, true);
    for (const pose of ['attack', 'victory'] as const) {
      adapter.setPose(pose);
      adapter.update(.3, false);
      expect(view.x).toBe(0);
      expect(view.y).toBe(0);
      expect(view.rotation).toBe(0);
      expect(body.scale.x).toBe(1);
      expect(body.scale.y).toBe(1);
      expect(head.y).toBe(-10);
    }
    adapter.destroy();
  });

  it('shows distinct, stationary boss attack silhouettes with reduced motion and clears them on idle', () => {
    const bounds: string[] = [];
    for (const attackStyle of ['roots', 'fire', 'stars', 'ice', 'cloud'] as const) {
      const view = new Container();
      const adapter = createLayeredActor({ view, facing: -1, attackStyle });
      adapter.setPose('attack'); adapter.update(0, false);
      const cue = view.getChildByLabel('attack-cue')!;
      expect(cue.visible).toBe(true);
      bounds.push(JSON.stringify(cue.getLocalBounds().rectangle));
      expect(view.x).toBe(0);
      adapter.setPose('idle'); adapter.update(0, false);
      expect(cue.visible).toBe(false);
      adapter.destroy();
    }
    expect(new Set(bounds).size).toBe(5);
  });


  it('winds up first and delays hit reaction until the visible impact', () => {
    const attacker = actor(), defender = actor(-1);
    attacker.adapter.setPose('attack'); defender.adapter.setPose('hit');
    attacker.adapter.update(.1, true); defender.adapter.update(.1, true);
    expect(attacker.view.x).toBeLessThan(0); expect(defender.view.x).toBe(0);
    attacker.adapter.update(.3, true); defender.adapter.update(.3, true);
    expect(attacker.view.x).toBeGreaterThan(20); expect(defender.view.x).toBeGreaterThan(0);
    attacker.adapter.destroy(); defender.adapter.destroy();
  });

  it('changes skill style without replacing or decoding the actor artwork', () => {
    const { adapter, view, dispose } = actor();
    const originalParts = [...view.children];
    adapter.setAttackVisual?.('arcane', 3);
    adapter.setPose('attack'); adapter.update(.375, true);
    expect(view.x).toBe(18);
    expect(view.children).toEqual(originalParts); expect(dispose).not.toHaveBeenCalled();
    adapter.destroy();
  });

  it('keeps the cloud boss anchored while charging a solar strike or raising its guard', () => {
    const view = new Container();
    const adapter = createLayeredActor({ view, facing: -1, attackStyle: 'cloud', attackTier: 3 });
    for (const ability of ['solar-charge', 'cloud-step']) {
      adapter.setAbility?.(ability); adapter.setPose('idle'); adapter.setPose('attack'); adapter.update(.375, true);
      expect(view.x).toBe(0);
    }
    adapter.destroy();
  });

  it('keeps all four other bosses stationary while preparing without replacing their art', () => {
    const preparations = [
      ['roots', 'bark-guard'], ['fire', 'ember-charge'], ['stars', 'star-seal'],
      ['ice', 'frost-guard'], ['ice', 'frost-charge'],
    ] as const;
    const shapes = new Set<string>();
    for (const [attackStyle, ability] of preparations) {
      const view = new Container();
      const dispose = vi.fn();
      const adapter = createLayeredActor({ view, facing: -1, attackStyle, dispose });
      const children = [...view.children];
      adapter.setAbility?.(ability); adapter.setPose('attack');
      adapter.update(.375, true);
      expect(view.x).toBe(0); expect(view.rotation).toBe(0);
      adapter.update(0, false);
      const cue = view.getChildByLabel('attack-cue')!;
      expect(cue.visible).toBe(true); expect(view.x).toBe(0);
      shapes.add(JSON.stringify(cue.getLocalBounds().rectangle));
      expect(view.children).toEqual(children); expect(dispose).not.toHaveBeenCalled();
      adapter.setAbility?.(undefined); adapter.setPose('idle'); adapter.setPose('attack');
      adapter.update(.375, true);
      expect(view.x).toBeLessThan(0);
      expect(cue.y).toBe(0);
      adapter.destroy(); expect(dispose).toHaveBeenCalledOnce();
    }
    expect(shapes.size).toBe(preparations.length);
  });

  it('releases owned artwork once even when teardown races cancellation', () => {
    const { adapter, view, dispose } = actor();
    adapter.destroy();
    adapter.destroy();
    adapter.update(1, true);
    expect(view.destroyed).toBe(true);
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('keeps victory visible without animation, then clears cues and defeat styling on idle', () => {
    const { adapter, view } = actor();
    adapter.setPose('victory');
    adapter.update(0, false);
    expect(view.getChildByLabel('victory-halo')?.visible).toBe(true);
    expect(view.getChildByLabel('victory-stars')?.visible).toBe(true);
    expect(view.y).toBe(0);
    adapter.setPose('defeat');
    adapter.update(0, false);
    expect(view.alpha).toBe(.55);
    expect(view.getChildByLabel('victory-halo')?.visible).toBe(false);
    adapter.setPose('attack');
    adapter.update(0, false);
    expect(view.getChildByLabel('attack-cue')?.visible).toBe(true);
    adapter.setPose('idle');
    adapter.update(0, false);
    expect(view.getChildByLabel('attack-cue')?.visible).toBe(false);
    expect(view.alpha).toBe(1);
    expect(view.rotation).toBe(0);
    adapter.destroy();
  });
});
