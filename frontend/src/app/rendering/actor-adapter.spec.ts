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
      current.adapter.update(.325, true);
    }
    expect(hero.view.x).toBe(30);
    expect(boss.view.x).toBe(-30);
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
