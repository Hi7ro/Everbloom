// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from 'vitest';
import { createCombatEffects, MAX_COMBAT_SPARKS } from './combat-effects';
import type { HeroAttackStyle } from '../domain/combat-visual-profile';
import type { BossAttackStyle } from './boss-visuals';
const canvasProbe = vi.hoisted(() => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null));
afterAll(() => canvasProbe.mockRestore());

function advance(effects: ReturnType<typeof createCombatEffects>, seconds: number) {
  const frames = Math.ceil(seconds / .01);
  for (let frame = 0; frame < frames; frame++) effects.update(.01, true);
}

describe('bounded combat effects', () => {
  it('telegraphs before travelling and resolves the impact within the faster turn interval', () => {
    const effects = createCombatEffects({ bossStyle: 'roots' });
    effects.play('hero');
    const cue = effects.view.getChildByLabel('attack-telegraph')!;
    const projectile = effects.view.getChildByLabel('attack-projectile')!;
    const impact = effects.view.getChildByLabel('attack-impact')!;
    expect(cue.visible).toBe(true); expect(projectile.visible).toBe(false); expect(impact.visible).toBe(false);
    advance(effects, .2);
    expect(projectile.visible).toBe(true); expect(projectile.x).toBeGreaterThan(0); expect(projectile.x).toBeLessThan(310);
    advance(effects, .15);
    expect(projectile.visible).toBe(false); expect(impact.visible).toBe(true);
    advance(effects, .25);
    expect(effects.view.visible).toBe(false);
    effects.destroy();
  });
  it('gives four hero skills and ten bosses distinct authored silhouettes', () => {
    const heroShapes: string[] = [], bossShapes: string[] = [];
    for (const style of ['martial', 'strength', 'endurance', 'arcane'] as HeroAttackStyle[]) {
      const effects = createCombatEffects({ heroProfile: { style, tier: 2 }, bossStyle: 'roots' });
      effects.play('hero');
      heroShapes.push(JSON.stringify(effects.view.getChildByLabel('attack-projectile')!.getLocalBounds().rectangle));
      effects.destroy();
    }
    for (const bossStyle of ['roots', 'fire', 'shadow', 'bloodmoon', 'stars', 'ice', 'cloud', 'void', 'dragon', 'relic'] as BossAttackStyle[]) {
      const effects = createCombatEffects({ bossStyle }); effects.play('boss');
      bossShapes.push(JSON.stringify(effects.view.getChildByLabel('attack-projectile')!.getLocalBounds().rectangle));
      expect(effects.view.scale.x).toBe(-1);
      effects.destroy();
    }
    expect(new Set(heroShapes).size).toBe(4); expect(new Set(bossShapes).size).toBe(10);
  });
  it('uses stable cues for reduced motion with no travelling particles or opacity pulses', () => {
    const effects = createCombatEffects({ bossStyle: 'fire' }); effects.play('boss', false);
    const impact = effects.view.getChildByLabel('attack-impact')!;
    const before = { x: impact.x, y: impact.y, scale: impact.scale.x, alpha: impact.alpha };
    for (let index = 0; index < 30; index++) effects.update(.1, false);
    expect({ x: impact.x, y: impact.y, scale: impact.scale.x, alpha: impact.alpha }).toEqual(before);
    expect(effects.view.getChildByLabel('attack-projectile')!.visible).toBe(false);
    expect(effects.view.getChildByLabel('attack-sparks')!.visible).toBe(false);
    expect(effects.view.visible).toBe(true);
    effects.endActor('hero'); expect(effects.view.visible).toBe(true);
    effects.endActor('boss'); expect(effects.view.visible).toBe(false);
    effects.destroy();
  });
  it('increases visual potency without increasing the resource pool', () => {
    const effects = createCombatEffects({ bossStyle: 'stars', heroProfile: { style: 'arcane', tier: 1 } });
    effects.play('hero');
    const impact = effects.view.getChildByLabel('attack-impact')!;
    const smallWidth = impact.getLocalBounds().width;
    const children = [...effects.view.children];
    const sparks = effects.view.getChildByLabel('attack-sparks')!;
    expect(sparks.children.length).toBe(MAX_COMBAT_SPARKS);
    effects.setHeroProfile({ style: 'arcane', tier: 3 }); effects.play('hero');
    expect(impact.getLocalBounds().width).toBeGreaterThan(smallWidth);
    for (let i = 0; i < 200; i++) {
      effects.play(i % 2 ? 'hero' : 'boss'); effects.update(.05, true); effects.clear();
    }
    expect(effects.view.children).toEqual(children); expect(sparks.children.length).toBe(MAX_COMBAT_SPARKS);
    effects.destroy();
    expect(effects.view.destroyed).toBe(true); expect(sparks.destroyed).toBe(true);
    effects.destroy(); effects.play('hero'); effects.update(.1, true);
    expect(effects.view.destroyed).toBe(true);
  });
  it('distinguishes the endboss combo, self-guard, charge and solar strike without adding resources', () => {
    const effects = createCombatEffects({ bossStyle: 'cloud', bossTier: 3 });
    const children = [...effects.view.children];
    const shapes: string[] = [];
    for (const ability of ['staff-combo', 'cloud-step', 'solar-charge', 'solar-strike']) {
      effects.setBossAbility(ability); effects.play('boss');
      shapes.push(JSON.stringify(effects.view.getChildByLabel('attack-projectile')!.getLocalBounds().rectangle));
      advance(effects, .36);
      const impact = effects.view.getChildByLabel('attack-impact')!;
      if (ability === 'cloud-step') { expect(impact.x).toBe(0); expect(impact.visible).toBe(false); }
      if (ability === 'solar-charge') expect(impact.visible).toBe(false);
      if (ability === 'solar-strike') { expect(impact.x).toBe(310); expect(impact.visible).toBe(true); }
    }
    expect(new Set(shapes).size).toBe(4);
    effects.setBossAbility('solar-charge'); effects.play('boss', false);
    expect(effects.view.getChildByLabel('attack-impact')!.visible).toBe(false);
    expect(effects.view.getChildByLabel('attack-telegraph')!.visible).toBe(true);
    expect(effects.view.children).toEqual(children);
    effects.destroy();
  });

  it('keeps every guard and charge on its boss with no target impact in either motion setting', () => {
    const preparations = [
      ['roots', 'bark-guard'], ['fire', 'ember-charge'], ['shadow', 'dusk-guard'], ['stars', 'star-seal'],
      ['bloodmoon', 'bloodmoon-seal'], ['void', 'gravity-well'], ['dragon', 'prism-charge'],
      ['relic', 'royal-aegis'], ['relic', 'imperial-charge'],
      ['ice', 'frost-guard'], ['ice', 'frost-charge'], ['cloud', 'cloud-step'], ['cloud', 'solar-charge'],
    ] as const;
    const shapes = new Set<string>();
    for (const [bossStyle, ability] of preparations) {
      const effects = createCombatEffects({ bossStyle, bossTier: 3 });
      const children = [...effects.view.children];
      const projectile = effects.view.getChildByLabel('attack-projectile')!;
      const impact = effects.view.getChildByLabel('attack-impact')!;
      const particles = effects.view.getChildByLabel('attack-sparks')!;
      effects.setBossAbility(ability);
      for (const motion of [true, false]) {
        effects.play('boss', motion);
        for (let index = 0; index < 50; index++) {
          effects.update(.01, motion);
          expect(impact.visible).toBe(false);
          expect(particles.visible).toBe(false);
          expect(effects.view.getChildByLabel('attack-trail')!.visible).toBe(false);
          expect(projectile.x).toBe(0); expect(projectile.y).toBe(0);
        }
        expect(projectile.visible).toBe(true);
        expect(effects.view.children).toEqual(children);
      }
      shapes.add(JSON.stringify(projectile.getLocalBounds().rectangle));
      effects.destroy();
    }
    expect(shapes.size).toBe(preparations.length);
  });

  it('makes charged attacks distinct from their basic strikes and keeps the final solar strike largest', () => {
    const attacks = [
      ['fire', 'ember-claw', 'ember-breath'], ['stars', 'astral-strike', 'starburst'],
      ['ice', 'frost-strike', 'frost-crush'], ['cloud', 'staff-combo', 'solar-strike'],
    ] as const;
    const heavyWidths: number[] = [];
    for (const [bossStyle, basic, heavy] of attacks) {
      const effects = createCombatEffects({ bossStyle, bossTier: 3 });
      const projectile = effects.view.getChildByLabel('attack-projectile')!;
      const impact = effects.view.getChildByLabel('attack-impact')!;
      effects.setBossAbility(basic); effects.play('boss');
      const basicBounds = JSON.stringify(projectile.getLocalBounds().rectangle);
      const basicWidth = impact.getLocalBounds().width;
      effects.setBossAbility(heavy); effects.play('boss');
      expect(JSON.stringify(projectile.getLocalBounds().rectangle)).not.toBe(basicBounds);
      expect(impact.getLocalBounds().width).toBeGreaterThan(basicWidth);
      heavyWidths.push(impact.getLocalBounds().width);
      advance(effects, .36);
      expect(impact.x).toBe(310); expect(impact.visible).toBe(true);
      effects.destroy();
    }
    expect(heavyWidths[3]).toBeGreaterThan(Math.max(...heavyWidths.slice(0, 3)));
  });

  it('clears a boss preparation before the next hero or damaging boss action', () => {
    const effects = createCombatEffects({ bossStyle: 'stars' });
    effects.setBossAbility('star-seal'); effects.play('boss', false);
    effects.play('hero'); advance(effects, .36);
    expect(effects.view.getChildByLabel('attack-impact')!.visible).toBe(true);
    expect(effects.view.getChildByLabel('attack-impact')!.x).toBe(310);
    effects.setBossAbility('starburst'); effects.play('boss'); advance(effects, .36);
    expect(effects.view.getChildByLabel('attack-impact')!.visible).toBe(true);
    expect(effects.view.getChildByLabel('attack-impact')!.x).toBe(310);
    effects.destroy();
  });

  it('replaces an interrupted effect cleanly instead of stacking hits', () => {
    const effects = createCombatEffects({ bossStyle: 'ice' });
    effects.play('hero'); advance(effects, .22);
    effects.play('boss');
    expect(effects.view.x).toBe(555); expect(effects.view.scale.x).toBe(-1);
    expect(effects.view.getChildByLabel('attack-impact')!.visible).toBe(false);
    expect(effects.view.getChildByLabel('attack-projectile')!.x).toBe(0);
    effects.destroy();
  });
});
