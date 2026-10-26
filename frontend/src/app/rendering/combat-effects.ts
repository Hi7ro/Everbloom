import { Container, Graphics } from 'pixi.js';
import type { BossAttackStyle } from './boss-visuals';
import type { CombatVisualProfile, HeroAttackStyle } from '../domain/combat-visual-profile';

export type CombatEffectStyle = HeroAttackStyle | BossAttackStyle;
export type CombatEffectActor = 'hero' | 'boss';
export type CombatEffectTier = 1 | 2 | 3;
export const COMBAT_EFFECT_TIMING = Object.freeze({ telegraph: .15, impact: .33, duration: .60 });
export const MAX_COMBAT_SPARKS = 14;
const PALETTES: Readonly<Record<CombatEffectStyle, readonly [number, number]>> = {
  martial: [0xe7be76, 0xffefd2], strength: [0x91c79e, 0xf0d49b],
  endurance: [0x78c5b0, 0xdff6df], arcane: [0xaf9eea, 0xefe0ff],
  roots: [0x9cbc76, 0xd9e8aa], fire: [0xef9a66, 0xffddb0], stars: [0xb29ae5, 0xf0dfff],
  shadow: [0x9d72df, 0x9ee9e2], ice: [0x89c8e4, 0xe4f5ff], cloud: [0xe4c180, 0xffedcb],
  bloodmoon: [0xd66a94, 0xffddbb], void: [0x9875db, 0x96eedc],
  dragon: [0x80b6e1, 0xe5f4ff], relic: [0xecc579, 0xfff0bd],
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;

function diamond(graphics: Graphics, x: number, y: number, radius: number, color: number, alpha = .85) {
  graphics.poly([x, y - radius, x + radius * .38, y, x, y + radius, x - radius * .38, y]).fill({ color, alpha });
}

const SELF_CAST_ABILITIES = new Set(['bark-guard', 'ember-charge', 'star-seal', 'frost-guard',
  'frost-charge', 'cloud-step', 'solar-charge', 'dusk-guard', 'bloodmoon-seal', 'gravity-well', 'prism-charge', 'royal-aegis', 'imperial-charge']);
/** Guard/charge turns act on the boss, so they must never imply an impact on the hero. */
export const isSelfCastAbility = (ability?: string) => !!ability && SELF_CAST_ABILITIES.has(ability);

/** Same stationary motif is used by the actor cue and the stage effect, with no extra objects. */
export function drawBossPreparation(graphic: Graphics, style: CombatEffectStyle, ability: string) {
  const [color, light] = PALETTES[style];
  if (ability === 'bark-guard') {
    graphic.poly([0, -43, 31, -24, 34, 16, 0, 47, -34, 16, -31, -24])
      .fill({ color, alpha: .16 }).stroke({ color, width: 3, alpha: .8 });
    for (const offset of [-17, 0, 17]) {
      graphic.moveTo(offset, 29).bezierCurveTo(offset - 13, 6, offset + 12, -11, offset, -30)
        .stroke({ color: light, width: 2, alpha: .8 });
    }
    for (const [x, y] of [[-33, -13], [31, 4], [-24, 25]])
      graphic.poly([x, y - 9, x + 12, y - 3, x + 3, y + 7, x, y - 9]).fill({ color, alpha: .7 });
  } else if (ability === 'ember-charge') {
    graphic.circle(0, 0, 14).fill({ color, alpha: .2 })
      .circle(0, 0, 21).stroke({ color: light, width: 2, alpha: .6 });
    for (let index = 0; index < 5; index++) {
      const angle = index * Math.PI * 2 / 5;
      const x = Math.cos(angle), y = Math.sin(angle);
      graphic.moveTo(x * 40, y * 34).quadraticCurveTo(x * 25 - y * 10, y * 20 + x * 10, x * 12, y * 12)
        .stroke({ color, width: 2.5, alpha: .75 });
      diamond(graphic, x * 35, y * 31, 4, light);
    }
  } else if (ability === 'dusk-guard') {
    graphic.poly([0,-43,35,-18,25,29,0,43,-25,29,-35,-18])
      .fill({ color, alpha:.15 }).stroke({ color:light, width:2, alpha:.85 });
    for (const x of [-18,0,18]) diamond(graphic,x,0,x === 0 ? 22 : 12,color);
  } else if (ability === 'bloodmoon-seal') {
    graphic.circle(0, 0, 37).stroke({ color, width: 3, alpha: .75 })
      .ellipse(0, 0, 46, 17).stroke({ color: light, width: 1.5, alpha: .85 });
    graphic.moveTo(-9, -30).quadraticCurveTo(37, 0, -9, 30)
      .quadraticCurveTo(11, 0, -9, -30).fill({ color, alpha: .6 });
    for (const x of [-48, 48]) diamond(graphic, x, 0, 8, light);
  } else if (ability === 'gravity-well') {
    graphic.circle(0, 0, 22).fill({ color: 0x100f24, alpha: .8 })
      .ellipse(0, 0, 57, 23).stroke({ color, width: 4, alpha: .8 })
      .ellipse(0, 0, 37, 49).stroke({ color: light, width: 1.5, alpha: .8 });
    for (const x of [-56, 56]) diamond(graphic, x, 0, 7, light);
  } else if (ability === 'prism-charge') {
    for (const [x, y, r] of [[0, -9, 45], [-39, 18, 18], [39, 18, 18]])
      diamond(graphic, x, y, r, color, .6);
    graphic.ellipse(0, 4, 60, 20).stroke({ color: light, width: 2, alpha: .8 });
  } else if (ability === 'royal-aegis') {
    graphic.poly([0,-53,39,-29,36,22,0,51,-36,22,-39,-29])
      .fill({ color, alpha: .17 }).stroke({ color: light, width: 3, alpha: .85 });
    graphic.poly([-24,-22,-19,7,19,7,24,-22,9,-11,0,-30,-9,-11])
      .fill({ color, alpha: .8 });
  } else if (ability === 'imperial-charge') {
    for (let index = 0; index < 7; index++) {
      const angle = Math.PI + index * Math.PI / 6;
      const x = Math.cos(angle) * 64, y = Math.sin(angle) * 57;
      graphic.ellipse(x, y, 8, 16).stroke({ color: light, width: 2, alpha: .75 });
      diamond(graphic, x, y, 11, color);
    }
    graphic.moveTo(-60, 20).lineTo(60, 20).stroke({ color, width: 2, alpha: .6 });
  } else if (ability === 'star-seal') {
    graphic.circle(0, 0, 40).stroke({ color, width: 2, alpha: .65 })
      .circle(0, 0, 29).stroke({ color: light, width: 1, alpha: .8 });
    graphic.poly([0, -35, 30, 18, -30, 18]).stroke({ color: light, width: 1.5, alpha: .85 })
      .poly([0, 35, 30, -18, -30, -18]).stroke({ color, width: 1.5, alpha: .7 });
    for (let index = 0; index < 6; index++) {
      const angle = index * Math.PI / 3;
      diamond(graphic, Math.cos(angle) * 43, Math.sin(angle) * 43, 5, light);
    }
  } else if (ability === 'frost-guard') {
    graphic.poly([0, -46, 31, -23, 37, 17, 0, 45, -37, 17, -31, -23])
      .fill({ color, alpha: .17 }).stroke({ color: light, width: 2, alpha: .85 });
    graphic.moveTo(0, -46).lineTo(0, 45).moveTo(-31, -23).lineTo(37, 17)
      .moveTo(31, -23).lineTo(-37, 17).stroke({ color, width: 1.5, alpha: .8 });
    for (const [x, y] of [[-42, -6], [42, -6], [0, -52]]) diamond(graphic, x, y, 8, light, .65);
  } else if (ability === 'frost-charge') {
    graphic.ellipse(0, 8, 47, 20).stroke({ color, width: 2, alpha: .7 })
      .ellipse(0, 8, 34, 13).stroke({ color: light, width: 1, alpha: .6 });
    graphic.moveTo(-43, 8).lineTo(43, 8).moveTo(-23, -9).lineTo(23, 25)
      .moveTo(23, -9).lineTo(-23, 25).stroke({ color: light, width: 1.5, alpha: .7 });
    for (const [x, y, size] of [[-22, -6, 14], [0, -16, 24], [23, -5, 15]])
      diamond(graphic, x, y, size, color, .6);
  } else {
    // The endboss keeps the widest, most elaborate preparation silhouettes.
    const size = ability === 'cloud-step' ? 55 : 58;
    graphic.circle(0, 0, size).stroke({ color, width: 3, alpha: .6 })
      .circle(0, 0, size - 11).stroke({ color: light, width: 1.5, alpha: .8 });
    for (let index = 0; index < 6; index++) {
      const angle = index * Math.PI / 3;
      diamond(graphic, Math.cos(angle) * size, Math.sin(angle) * size, 7, light);
    }
    if (ability === 'cloud-step') {
      for (let index = 0; index < 4; index++) {
        const y = (index - 1.5) * 23;
        graphic.moveTo(-53, y).bezierCurveTo(-8, y - 18, 35, y + 15, 56, y - 4)
          .stroke({ color: light, width: 2.5, alpha: .6 });
      }
    } else diamond(graphic, 0, 0, 40, color, .45);
  }
}

/** A fixed display-object pool. No textures, filters, timers or per-frame Graphics allocations. */
export function createCombatEffects(options: {
  heroProfile?: Pick<CombatVisualProfile, 'style' | 'tier'>;
  bossStyle: BossAttackStyle;
  bossTier?: CombatEffectTier;
}) {
  const view = new Container();
  view.label = 'combat-effects';
  view.eventMode = 'none';
  const telegraph = new Graphics(); telegraph.label = 'attack-telegraph';
  const trail = new Graphics(); trail.label = 'attack-trail';
  const projectile = new Graphics(); projectile.label = 'attack-projectile';
  const impact = new Graphics(); impact.label = 'attack-impact';
  const particles = new Container(); particles.label = 'attack-sparks';
  const sparks = Array.from({ length: MAX_COMBAT_SPARKS }, (_, index) => {
    const graphic = new Graphics(); graphic.label = 'spark-' + index;
    particles.addChild(graphic); return graphic;
  });
  view.addChild(telegraph, trail, projectile, impact, particles);
  view.visible = false;
  let heroProfile = options.heroProfile ?? { style: 'strength' as const, tier: 1 as const };
  let activeActor: CombatEffectActor | null = null;
  let elapsed = 0;
  let style: CombatEffectStyle = heroProfile.style;
  let tier: CombatEffectTier = heroProfile.tier;
  let distance = 310;
  let bossAbility: string | undefined;
  let ability: string | undefined;
  let destroyed = false;

  function draw() {
    const [color, light] = PALETTES[style];
    const boss = activeActor === 'boss';
    const radius = ability === 'solar-charge' ? 58 : ability === 'cloud-step' ? 44 : 17 + tier * 4 + (boss ? 7 : 0);
    telegraph.clear().circle(0, 0, radius).stroke({ color, width: 2, alpha: .5 })
      .circle(0, 0, radius + 7).stroke({ color: light, width: 1, alpha: .25 });
    for (let index = 0; index < tier + 2; index++) {
      const angle = index * Math.PI * 2 / (tier + 2);
      diamond(telegraph, Math.cos(angle) * (radius + 7), Math.sin(angle) * (radius + 7), 3, light, .7);
    }
    trail.clear(); projectile.clear(); impact.clear();
    const width = 2 + tier * .65 + (boss ? 1 : 0);
    if (isSelfCastAbility(ability)) {
      drawBossPreparation(projectile, style, ability!);
    } else if (style === 'void') {
      const size = ability === 'event-horizon' ? 45 : 25;
      projectile.circle(0, 0, size).fill({ color: 0x100d23, alpha: .85 })
        .ellipse(0, 0, size + 20, size * .44).stroke({ color: light, width: 3, alpha: .9 })
        .circle(0, 0, size + 4).stroke({ color, width: 5, alpha: .7 });
      for (const y of [-20, 20]) trail.moveTo(0,y).bezierCurveTo(distance*.4,-y*2,distance*.7,y*2,distance,0)
        .stroke({ color, width: 3, alpha: .6 });
    } else if (style === 'dragon') {
      if (ability === 'cosmic-breath') {
        trail.poly([0,-5,distance,-36,distance,36,0,5]).fill({ color, alpha: .3 })
          .moveTo(0,0).lineTo(distance,0).stroke({ color: light, width: 9, alpha: .8 });
        projectile.poly([-38,-27,0,-39,31,0,0,39,-38,27,-13,0]).fill({ color, alpha: .8 });
      } else {
        const count = ability === 'wing-tempest' ? 3 : 2;
        for (let index=0; index<count; index++) {
          const y = (index-(count-1)/2)*24;
          projectile.poly([-39,y-15,26,y,-39,y+15,-18,y]).fill({ color: index%2 ? light : color, alpha: .9 });
          trail.moveTo(0,y).quadraticCurveTo(distance*.55,y-18,distance,y).stroke({ color, width: 3, alpha: .6 });
        }
      }
    } else if (style === 'relic') {
      const count = ability === 'sovereign-blade' ? 1 : ability === 'imperial-rain' ? 5 : 3;
      for (let index=0; index<count; index++) {
        const y = (index-(count-1)/2)*19, offset = index%2*12;
        projectile.poly([-31-offset,y-3,15-offset,y-4,37-offset,y,15-offset,y+4,-31-offset,y+3])
          .fill({ color: light, alpha: .95 });
        projectile.moveTo(-16-offset,y-10).lineTo(-16-offset,y+10).stroke({ color, width: 4, alpha: .9 });
        trail.moveTo(0,y).lineTo(distance,y).stroke({ color, width: 2, alpha: .6 });
      }
    } else if (style === 'bloodmoon') {
      const eclipse = ability === 'lunar-eclipse';
      const size = eclipse ? 47 : 32;
      projectile.moveTo(-12, -size).quadraticCurveTo(size + 9, 0, -12, size)
        .quadraticCurveTo(14, 0, -12, -size).fill({ color, alpha: .8 })
        .stroke({ color: light, width: 1.5, alpha: .9 });
      trail.moveTo(0, -10).quadraticCurveTo(distance * .55, -31, distance, 0)
        .stroke({ color, width: eclipse ? 9 : 4, alpha: .5 });
      if (eclipse) {
        projectile.ellipse(0, 0, 51, 18).stroke({ color: light, width: 2, alpha: .8 });
        trail.moveTo(0, 14).quadraticCurveTo(distance * .55, 34, distance, 0)
          .stroke({ color: light, width: 2, alpha: .65 });
      }
    } else if (style === 'shadow') {
      const count = ability === 'dusk-frenzy' ? 4 : 2;
      for (let index = 0; index < count; index++) {
        const y = (index - (count-1)/2) * 14;
        trail.moveTo(0,y).bezierCurveTo(distance*.3,y-30,distance*.7,y+22,distance,y)
          .stroke({color:index%2 ? light : color,width:3,alpha:.5});
        projectile.moveTo(-24-index*5,-27).quadraticCurveTo(25,0,-16-index*5,29)
          .stroke({color:index%2 ? light : color,width:4,alpha:.9});
      }
    } else if (style === 'fire' && ability === 'ember-claw') {
      for (let index = 0; index < 3; index++) {
        const y = (index - 1) * 15;
        trail.moveTo(0, y).quadraticCurveTo(distance * .6, y - 16, distance, y)
          .stroke({ color, width: 2, alpha: .6 });
        projectile.moveTo(-19 - index * 7, -28 + index * 3).quadraticCurveTo(24, 0, -19 - index * 7, 28 - index * 3)
          .stroke({ color: index === 1 ? light : color, width: 3.5, alpha: .85 });
      }
    } else if (style === 'fire' && ability === 'ember-breath') {
      trail.poly([0, -6, distance * .45, -20, distance, -42, distance + 10, 0,
        distance, 42, distance * .45, 20, 0, 6]).fill({ color, alpha: .23 });
      for (const offset of [-1, 0, 1]) {
        trail.moveTo(0, offset * 3).bezierCurveTo(distance * .45, offset * 30 - 9,
          distance * .7, offset * 19 + 9, distance, offset * 29)
          .stroke({ color: offset ? color : light, width: offset ? 5 : 7, alpha: .65 });
      }
      projectile.poly([-34, -16, -9, -30, -14, -13, 28, -5, 8, 9, 23, 24, -14, 15, -25, 27, -19, 0])
        .fill({ color, alpha: .8 }).stroke({ color: light, width: 1.5, alpha: .8 });
    } else if (style === 'fire') {
      trail.poly([0, -7, distance * .4, -16, distance * .68, -26, distance, -20,
        distance * .89, 0, distance, 20, distance * .66, 26, distance * .4, 16, 0, 7])
        .fill({ color, alpha: .25 });
      trail.moveTo(0, 0).bezierCurveTo(distance * .4, -14, distance * .64, 14, distance, 0)
        .stroke({ color: light, width: width + 4, alpha: .7 });
      projectile.poly([-25, -9, -8, -23, 1, -15, 23, 0, 1, 15, -8, 23, -25, 9, -15, 0])
        .fill({ color, alpha: .9 });
      diamond(projectile, 2, 0, 15, light);
    } else if (style === 'ice' && ability === 'frost-crush') {
      trail.moveTo(0, 0).lineTo(distance * .4, -7).lineTo(distance * .58, 7).lineTo(distance, 0)
        .stroke({ color, width: 11, alpha: .28 });
      for (let index = 0; index < 4; index++) {
        const x = distance * (index + 1) / 5;
        trail.poly([x - 9, 9, x + 2, -18 - index * 3, x + 10, 10]).fill({ color: light, alpha: .4 });
      }
      for (const [x, y, size] of [[0, 0, 39], [-25, 15, 21], [24, 18, 19]]) {
        projectile.poly([x, y - size, x + size * .36, y - 8, x + size * .25, y + size * .55,
          x - size * .35, y + size * .4, x - size * .4, y - 8])
          .fill({ color, alpha: .75 }).stroke({ color: light, width: 1.5, alpha: .85 });
      }
    } else if (style === 'ice') {
      trail.moveTo(0, 0).lineTo(distance * .24, -13).lineTo(distance * .44, 8)
        .lineTo(distance * .72, -11).lineTo(distance, 0).stroke({ color, width: 7, alpha: .4 });
      trail.moveTo(0, 0).lineTo(distance, 0).stroke({ color: light, width: 2, alpha: .8 });
      for (const [x, y, size] of [[0, 0, 34], [-25, -20, 18], [-27, 22, 16]]) {
        projectile.poly([x + size, y, x - size * .5, y - size * .4, x - size * .3, y, x - size * .5, y + size * .4])
          .fill({ color, alpha: .9 }).stroke({ color: light, width: 1.5, alpha: .8 });
      }
    } else if (style === 'cloud' && ability === 'solar-strike') {
      trail.poly([0, -8, distance, -32, distance + 8, 0, distance, 32, 0, 8])
        .fill({ color, alpha: .22 });
      trail.moveTo(0, 0).lineTo(distance, 0).stroke({ color, width: 20, alpha: .45 })
        .moveTo(0, 0).lineTo(distance, 0).stroke({ color: light, width: 6, alpha: .85 });
      projectile.circle(0, 0, 33).stroke({ color, width: 3, alpha: .8 });
      diamond(projectile, 0, 0, 40, light);
    } else if (style === 'cloud' && ability === 'staff-combo') {
      for (let index = 0; index < 2; index++) {
        const y = (index - .5) * 33;
        trail.moveTo(0, y).quadraticCurveTo(distance * .6, y - 20, distance, y)
          .stroke({ color: index === 1 ? light : color, width: 3 + index, alpha: .6 });
        projectile.moveTo(-26 - index * 10, -49 + index * 4)
          .quadraticCurveTo(37, 0, -26 - index * 10, 49 - index * 4)
          .stroke({ color: index === 1 ? light : color, width: 4 - index * .4, alpha: .9 });
      }
    } else if (style === 'cloud') {
      trail.moveTo(0, 0).bezierCurveTo(distance * .2, -40, distance * .7, 38, distance, 0)
        .stroke({ color, width: 7, alpha: .3 });
      for (let index = 0; index < 6; index++) {
        const x = distance * index / 6;
        trail.ellipse(x, Math.sin(index * 1.3) * 13, 19, 8).fill({ color: light, alpha: .12 });
      }
      projectile.moveTo(-31, -22).lineTo(31, 22).stroke({ color, width: 9, alpha: .85 })
        .moveTo(-31, -22).lineTo(31, 22).stroke({ color: light, width: 2, alpha: .9 })
        .ellipse(0, 0, 33, 22).stroke({ color, width: 1.5, alpha: .7 });
    } else if (style === 'roots') {
      for (let index = 0; index < 3; index++) {
        const y = (index - 1) * 15;
        trail.moveTo(0, y).bezierCurveTo(distance * .25, y - 35, distance * .68, y + 28, distance, y)
          .stroke({ color, width: width + (index === 1 ? 2 : 0), alpha: .65 });
        projectile.moveTo(-20, 24 + y).bezierCurveTo(-4, y + 6, -18, y - 15, 3, y - 35)
          .stroke({ color: index === 1 ? light : color, width: width + 1, alpha: .85 });
      }
      diamond(projectile, -5, -20, 8, light);
    } else if (style === 'stars' && ability === 'starburst') {
      for (const offset of [-1, 0, 1]) {
        trail.moveTo(0, 0).lineTo(distance, offset * 24)
          .stroke({ color: offset ? color : light, width: offset ? 2 : 5, alpha: .65 });
        diamond(projectile, offset * 23, offset === 0 ? 0 : -13, offset ? 16 : 34, offset ? color : light);
      }
      projectile.circle(0, 0, 38).stroke({ color, width: 1.5, alpha: .7 });
    } else if (style === 'stars' || style === 'arcane') {
      trail.moveTo(0, 0).lineTo(distance, 0).stroke({ color, width: width + 8, alpha: .12 })
        .moveTo(0, 0).lineTo(distance, 0).stroke({ color: light, width, alpha: .7 });
      for (let index = 0; index < tier + 2; index++) {
        const x = distance * (index + 1) / (tier + 3);
        diamond(trail, x, (index % 2 ? 1 : -1) * 11, 4 + tier, color, .65);
      }
      projectile.circle(0, 0, 17 + tier * 3).stroke({ color, width: 2, alpha: .8 })
        .circle(0, 0, 10 + tier).stroke({ color: light, width: 1, alpha: .8 });
      diamond(projectile, 0, 0, 22 + tier * 3, light);
      if (style === 'stars') for (const offset of [-1, 1]) diamond(projectile, -20, offset * 28, 10, color);
    } else if (style === 'martial') {
      for (let index = 0; index < 3; index++) {
        const y = (index - 1) * 16;
        trail.moveTo(12 + index * 16, y).quadraticCurveTo(distance * .55, y - 22, distance, y)
          .stroke({ color: index === 1 ? light : color, width: index === 1 ? width : 1.6, alpha: .65 });
        projectile.moveTo(-12 - index * 9, -33 + index * 5).quadraticCurveTo(17, 0, -12 - index * 9, 33 - index * 5)
          .stroke({ color: index === 1 ? light : color, width: width + 1 - index * .4, alpha: .9 });
      }
    } else if (style === 'endurance') {
      for (let index = 0; index < 3; index++) {
        const y = (index - 1) * 17;
        trail.moveTo(0, y).bezierCurveTo(distance * .35, y + 24, distance * .6, y - 24, distance, y)
          .stroke({ color: index === 1 ? light : color, width: index === 1 ? width : 1.5, alpha: .65 });
      }
      projectile.ellipse(-5, 0, 29, 18).stroke({ color, alpha: .75, width: 2 })
        .moveTo(-28, 13).quadraticCurveTo(30, 17, 25, -12).stroke({ color: light, alpha: .85, width });
    } else {
      trail.poly([0, -2, distance * .6, -6, distance, -13, distance, 13, distance * .6, 6, 0, 2])
        .fill({ color, alpha: .28 });
      trail.moveTo(0, 0).lineTo(distance, 0).stroke({ color: light, width, alpha: .65 });
      projectile.moveTo(-10, -42).quadraticCurveTo(36, 0, -10, 42)
        .stroke({ color, width: 11 + tier * 2, alpha: .5 })
        .moveTo(-5, -37).quadraticCurveTo(30, 0, -5, 37).stroke({ color: light, width: 3, alpha: .9 });
    }
    const burst = 26 + tier * 8 + (boss ? 12 : 0) + (ability === 'solar-strike' ? 16
      : ['ember-breath', 'starburst', 'frost-crush', 'lunar-eclipse'].includes(ability ?? '') ? 8 : 0);
    impact.circle(0, 0, burst).stroke({ color, width: 2.5, alpha: .6 })
      .circle(0, 0, burst * .55).stroke({ color: light, width: 1.2, alpha: .8 });
    const rays = style === 'strength' ? 6 : 8;
    for (let index = 0; index < rays; index++) {
      const angle = index * Math.PI * 2 / rays + .2;
      impact.moveTo(Math.cos(angle) * burst * .7, Math.sin(angle) * burst * .7)
        .lineTo(Math.cos(angle) * burst * 1.35, Math.sin(angle) * burst * 1.35)
        .stroke({ color: index % 2 ? color : light, width: index % 2 ? 2 : 3, alpha: .8 });
    }
    for (const [index, spark] of sparks.entries()) {
      spark.clear();
      diamond(spark, 0, 0, index % 3 === 0 ? 5 : 3, index % 2 ? color : light, .85);
    }
    impact.position.set(distance, 0);
    particles.position.set(distance, 0);
  }
  function hide() {
    view.visible = false;
    activeActor = null;
  }
  return {
    view,
    play(actor: CombatEffectActor, motion = true) {
      if (destroyed) return;
      activeActor = actor;
      elapsed = 0;
      style = actor === 'hero' ? heroProfile.style : options.bossStyle;
      tier = actor === 'hero' ? heroProfile.tier : (options.bossTier ?? 2);
      ability = actor === 'boss' ? bossAbility : undefined;
      distance = isSelfCastAbility(ability) ? 0 : 310;
      view.position.set(actor === 'hero' ? 245 : 555,
        ability === 'frost-charge' || (style === 'roots' && !isSelfCastAbility(ability)) ? 326 : 249);
      view.scale.set(actor === 'hero' ? 1 : -1, 1);
      view.visible = true;
      draw();
      this.update(0, motion);
    },
    setHeroProfile(profile: Pick<CombatVisualProfile, 'style' | 'tier'>) { heroProfile = profile; },
    setBossAbility(abilityId?: string) { bossAbility = abilityId; },
    endActor(actor: CombatEffectActor) { if (activeActor === actor) hide(); },
    update(deltaSeconds: number, motion: boolean) {
      if (destroyed || !activeActor) return;
      const selfCast = isSelfCastAbility(ability);
      if (!motion) {
        // One stable visual cue, without projectiles, pulsing opacity or a running ticker.
        telegraph.visible = true; telegraph.alpha = .65; telegraph.scale.set(1);
        trail.visible = false; particles.visible = false;
        projectile.visible = selfCast; projectile.position.set(0, 0); projectile.scale.set(1);
        projectile.alpha = .8; projectile.rotation = 0;
        impact.visible = !selfCast; impact.alpha = .65; impact.scale.set(.75);
        return;
      }
      elapsed += Math.max(0, Math.min(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, .1));
      if (elapsed >= COMBAT_EFFECT_TIMING.duration) { hide(); return; }
      const charge = clamp(elapsed / COMBAT_EFFECT_TIMING.telegraph);
      const travel = clamp((elapsed - COMBAT_EFFECT_TIMING.telegraph) / (COMBAT_EFFECT_TIMING.impact - COMBAT_EFFECT_TIMING.telegraph));
      const release = clamp((elapsed - COMBAT_EFFECT_TIMING.impact) / (COMBAT_EFFECT_TIMING.duration - COMBAT_EFFECT_TIMING.impact));
      telegraph.visible = elapsed < COMBAT_EFFECT_TIMING.impact;
      telegraph.alpha = (1 - travel) * (.3 + charge * .6);
      telegraph.scale.set(.7 + charge * .3);
      trail.visible = !selfCast && elapsed >= COMBAT_EFFECT_TIMING.telegraph;
      trail.scale.set(Math.max(.001, easeOut(travel)), 1);
      trail.alpha = (1 - release) * .8;
      projectile.visible = elapsed >= COMBAT_EFFECT_TIMING.telegraph && elapsed < COMBAT_EFFECT_TIMING.impact;
      projectile.position.set(easeOut(travel) * distance,
        !selfCast && (style === 'stars' || style === 'arcane') ? Math.sin(travel * Math.PI) * -26 : 0);
      projectile.scale.set(.7 + travel * .3);
      if (selfCast) {
        projectile.visible = elapsed >= COMBAT_EFFECT_TIMING.telegraph;
        projectile.alpha = 1 - release * .65;
        projectile.rotation = ability === 'cloud-step' ? elapsed * .7 : 0;
      } else { projectile.alpha = 1; projectile.rotation = 0; }
      impact.visible = elapsed >= COMBAT_EFFECT_TIMING.impact && !selfCast;
      impact.alpha = (1 - release) * .8;
      impact.scale.set(.65 + easeOut(release) * .65);
      particles.visible = impact.visible;
      const visibleSparks = Math.min(MAX_COMBAT_SPARKS, 5 + tier * 3 + (activeActor === 'boss' ? 1 : 0));
      for (const [index, spark] of sparks.entries()) {
        spark.visible = index < visibleSparks;
        const angle = index * Math.PI * 2 / visibleSparks + .15;
        const radius = 16 + easeOut(release) * (28 + tier * 11 + index % 3 * 9);
        spark.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius + release * release * 25);
        spark.rotation = angle + release * .35;
        spark.alpha = (1 - release) * .8;
      }
    },
    clear() { if (!destroyed) hide(); },
    destroy() {
      if (destroyed) return;
      destroyed = true; activeActor = null;
      view.destroy({ children: true });
    },
  };
}
