// @vitest-environment jsdom
import { Container } from 'pixi.js';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { createLayeredActor } from './actor-adapter';
import { createCombatEffects } from './combat-effects';
import { createBattleTurnController } from './battle-stage-turns';

const canvasProbe = vi.hoisted(() => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null));
afterAll(() => canvasProbe.mockRestore());

function scene() {
  const hero = createLayeredActor({ view: new Container(), facing: 1 });
  const boss = createLayeredActor({ view: new Container(), facing: -1 });
  const effects = createCombatEffects({ bossStyle: 'roots' });
  const play = vi.spyOn(effects, 'play');
  let motion = true;
  const turns = createBattleTurnController({ hero, boss }, effects, () => motion);
  const advance = (seconds: number) => {
    for (let left = seconds; left > 0; left -= .025) {
      const delta = Math.min(left, .025);
      hero.update(delta, motion); boss.update(delta, motion); effects.update(delta, motion);
    }
  };
  return { hero, boss, effects, turns, play, advance, motion: (value: boolean) => { motion = value; },
    destroy: () => { hero.destroy(); boss.destroy(); effects.destroy(); } };
}

describe('battle turn presentation', () => {
  it.each(['hero', 'boss'] as const)('replays a second %s attack and target recoil even when both poses stay identical', actor => {
    const s = scene();
    const target = actor === 'hero' ? 'boss' : 'hero';
    s.turns.setPose(actor, 'attack'); s.turns.setPose(target, 'hit');
    s.turns.setTurn({ index: 1, actor, damage: 25, healing: 0 });
    s.advance(.375);
    const first = { attack: s[actor].view.x, recoil: s[target].view.x };
    expect(Math.abs(first.attack)).toBeGreaterThan(20); expect(Math.abs(first.recoil)).toBeGreaterThan(0);
    s.advance(1); expect(s[actor].view.x).toBeCloseTo(0); expect(s[target].view.x).toBeCloseTo(0);
    s.turns.setPose(actor, 'attack'); s.turns.setPose(target, 'hit');
    s.turns.setTurn({ index: 2, actor, damage: 30, healing: 0 });
    expect(s.effects.view.getChildByLabel('attack-telegraph')!.visible).toBe(true);
    s.advance(.375);
    expect(s[actor].view.x).toBeCloseTo(first.attack); expect(s[target].view.x).toBeCloseTo(first.recoil);
    expect(s.play).toHaveBeenCalledTimes(2);
    s.destroy();
  });

  it('does not restart the same turn after pause, preference/profile changes or repeated bindings', () => {
    const s = scene(), turn = { index: 1, actor: 'hero' as const, damage: 25, healing: 0 };
    s.turns.setPose('hero', 'attack'); s.turns.setPose('boss', 'hit'); s.turns.setTurn(turn);
    s.advance(1);
    s.motion(false); s.hero.update(0, false); s.effects.update(0, false);
    s.turns.setPose('hero', 'attack'); s.turns.setPose('boss', 'hit'); s.turns.setTurn({ ...turn });
    s.hero.setAttackVisual!('arcane', 3); s.effects.setHeroProfile({ style: 'arcane', tier: 3 });
    s.motion(true); s.turns.setTurn({ ...turn }); s.advance(.1);
    expect(s.hero.view.x).toBeCloseTo(0); expect(s.boss.view.x).toBeCloseTo(0);
    expect(s.play).toHaveBeenCalledOnce();
    s.destroy();
  });

  it('clears reduced-motion effects on null, preserves result poses, and permits a replay starting at the same index', () => {
    const s = scene(); s.motion(false);
    const turn = { index: 0, actor: 'hero' as const, damage: 10, healing: 0 };
    s.turns.setPose('hero', 'attack'); s.turns.setPose('boss', 'hit'); s.turns.setTurn(turn);
    expect(s.effects.view.visible).toBe(true);
    s.turns.setPose('hero', 'victory'); s.turns.setPose('boss', 'defeat'); s.turns.setTurn(null);
    s.hero.update(0, false);
    expect(s.effects.view.visible).toBe(false);
    expect(s.hero.view.getChildByLabel('victory-halo')!.visible).toBe(true);
    s.turns.setPose('hero', 'attack'); s.turns.setPose('boss', 'hit'); s.turns.setTurn(turn);
    expect(s.effects.view.visible).toBe(true); expect(s.play).toHaveBeenCalledTimes(2);
    expect(s.play).toHaveBeenLastCalledWith('hero', false);
    s.destroy();
  });

  it('a healing turn clears the preceding impact without creating an attack', () => {
    const s = scene(); s.motion(false);
    s.turns.setPose('boss', 'attack'); s.turns.setPose('hero', 'hit');
    s.turns.setTurn({ index: 1, actor: 'boss', damage: 20, healing: 0 });
    expect(s.effects.view.visible).toBe(true);
    s.turns.setPose('boss', 'idle'); s.turns.setPose('hero', 'idle');
    s.turns.setTurn({ index: 2, actor: 'boss', damage: 0, healing: 20 });
    expect(s.effects.view.visible).toBe(false); expect(s.play).toHaveBeenCalledOnce();
    s.destroy();
  });
});
