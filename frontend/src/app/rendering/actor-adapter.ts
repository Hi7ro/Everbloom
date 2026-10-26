import { Container, Graphics } from 'pixi.js';
import type { HeroAttackStyle } from '../domain/combat-visual-profile';
import { COMBAT_EFFECT_TIMING, CombatEffectStyle, CombatEffectTier, drawBossPreparation, isSelfCastAbility } from './combat-effects';

export type ActorId = 'hero' | 'boss';
export type ActorPose = 'idle' | 'attack' | 'hit' | 'victory' | 'defeat';

/** Presentation only: damage, rewards and turn order belong to the battle domain. */
export interface ActorAdapter {
  readonly view: Container;
  setPose(pose: ActorPose): void;
  setAttackVisual?(style: HeroAttackStyle, tier: CombatEffectTier): void;
  setAbility?(abilityId?: string): void;
  update(deltaSeconds: number, motion: boolean): void;
  destroy(): void;
}

export interface LayeredActorArt {
  view: Container;
  body?: Container;
  head?: Container;
  arms?: readonly Container[];
  /** Direction towards the opponent; artwork itself does not have to be mirrored. */
  facing: 1 | -1;
  attackStyle?: CombatEffectStyle;
  attackTier?: CombatEffectTier;
  attackColor?: number;
  dispose?: () => void;
}

/**
 * Interim illustration adapter. Authored skeletal actors can implement ActorAdapter
 * later without changing battle rules or the Angular screen. This is not a skeleton.
 */
export function createLayeredActor(art: LayeredActorArt): ActorAdapter {
  let pose: ActorPose = 'idle';
  let poseTime = 0;
  let lifetime = 0;
  let destroyed = false;
  const headY = art.head?.y ?? 0;
  const headAngle = art.head?.rotation ?? 0;
  const armAngles = art.arms?.map(arm => arm.rotation) ?? [];
  // A static, non-flashing success cue stays readable when animation is disabled.
  const victoryHalo = new Graphics()
    .ellipse(0, -3, 90, 15).fill({ color: 0xf1cf83, alpha: .2 })
    .ellipse(0, -3, 82, 12).stroke({ color: 0xf7db9e, alpha: .8, width: 2 });
  victoryHalo.label = 'victory-halo';
  victoryHalo.visible = false;
  art.view.addChildAt(victoryHalo, 0);
  const victoryStars = new Graphics();
  for (const [x, y, size] of [[-111, -151, 8], [105, -199, 6], [-96, -249, 4]]) {
    victoryStars.poly([x, y - size, x + size * .4, y, x, y + size, x - size * .4, y])
      .fill({ color: 0xf7db9e, alpha: .9 });
  }
  victoryStars.label = 'victory-stars';
  victoryStars.visible = false;
  const attackCue = new Graphics();
  let attackStyle = art.attackStyle ?? 'strength';
  let attackTier = art.attackTier ?? 1;
  let ability: string | undefined;
  const drawAttackCue = () => {
  attackCue.clear();
  attackCue.position.set(0, 0);
  const color = art.attackColor ?? (attackStyle === 'arcane' ? 0xb5a0e7 : attackStyle === 'endurance' ? 0x91d5bb : 0xefdba5);
  if (isSelfCastAbility(ability)) {
    drawBossPreparation(attackCue, attackStyle, ability!);
    attackCue.position.y = ability === 'frost-charge' ? -20 : -151;
  } else if (attackStyle === 'fire') {
    // Broad dragon breath, aimed at the opponent without covering the HUD.
    attackCue.poly([-86, -180, -145, -190, -183, -218, -168, -181, -220, -193,
      -192, -160, -228, -142, -183, -140, -194, -110, -138, -140, -86, -157])
      .fill({ color, alpha: .7 });
    attackCue.poly([-98, -171, -164, -178, -147, -160, -186, -148, -132, -148])
      .fill({ color: 0xffedb7, alpha: .9 });
  } else if (attackStyle === 'stars') {
    attackCue.circle(-136, -167, 33).stroke({ color, alpha: .65, width: 2 })
      .circle(-136, -167, 23).stroke({ color: 0xeee5ff, alpha: .8, width: 1.5 });
    for (const [x, y, r] of [[-136, -167, 18], [-184, -152, 9], [-207, -129, 6]])
      attackCue.poly([x, y-r, x+r*.3, y-r*.3, x+r, y, x+r*.3, y+r*.3,
        x, y+r, x-r*.3, y+r*.3, x-r, y, x-r*.3, y-r*.3])
        .fill({ color: 0xe2d9ff, alpha: .9 });
  } else if (attackStyle === 'ice') {
    for (let index = 0; index < 3; index++) {
      const x = -106 - index * 23, y = -161 + (index % 2) * 27;
      attackCue.poly([x - 30, y, x, y - 12, x + 11, y, x, y + 12])
        .fill({ color, alpha: .7 }).stroke({ color: 0xe8f7ff, alpha: .75, width: 1.5 });
    }
  } else if (attackStyle === 'cloud') {
    attackCue.moveTo(-112, -199).lineTo(-196, -114).stroke({ color, alpha: .85, width: 8 })
      .moveTo(-112, -199).lineTo(-196, -114).stroke({ color: 0xffefd4, alpha: .75, width: 2 })
      .ellipse(-153, -153, 49, 30).stroke({ color, alpha: .45, width: 2 });
  } else if (attackStyle === 'roots') {
    for (let i = 0; i < 3; i++) {
      const x = -95 - i * 35;
      attackCue.moveTo(x + 24, -10).bezierCurveTo(x-10, -36, x+22, -63-i*8, x-16, -88-i*9)
        .stroke({ color, alpha: .85, width: 6-i });
      attackCue.poly([x+2, -49, x-20, -59, x-11, -40]).fill({ color, alpha: .85 });
    }
  } else if (attackStyle === 'arcane') {
    attackCue.circle(art.facing * 100, -145, 23 + attackTier * 3).stroke({ color, alpha: .65, width: 2 })
      .circle(art.facing * 100, -145, 14).stroke({ color: 0xf3e5ff, alpha: .8, width: 1.5 });
    attackCue.poly([art.facing * 100, -169, art.facing * 110, -145, art.facing * 100, -121, art.facing * 90, -145])
      .fill({ color, alpha: .5 });
  } else {
    const lines = attackStyle === 'martial' ? 3 : attackStyle === 'endurance' ? 2 : 1;
    for (let index = 0; index < lines; index++) {
      const x = art.facing * (108 + index * 12);
      attackCue.moveTo(x, -181 + index * 6)
        .quadraticCurveTo(x + art.facing * 32, -145, x, -109 - index * 6)
        .stroke({ color, alpha: .65, width: attackStyle === 'strength' ? 4 + attackTier : 2.5 });
    }
  }
  };
  drawAttackCue();
  attackCue.label = 'attack-cue';
  attackCue.visible = false;
  art.view.addChild(victoryStars, attackCue);

  const update = (deltaSeconds: number, motion: boolean) => {
    if (destroyed) return;
    const delta = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0;
    lifetime += delta;
    poseTime += delta;
    const breath = motion ? (Math.sin(lifetime * Math.PI / 2.8) + 1) / 2 : 0;
    const timing = COMBAT_EFFECT_TIMING;
    const winding = motion && pose === 'attack' && poseTime < timing.telegraph
      ? Math.sin(poseTime / timing.telegraph * Math.PI / 2) : 0;
    const attack = motion && pose === 'attack' && poseTime >= timing.telegraph && poseTime < timing.duration
      ? Math.sin((poseTime - timing.telegraph) / (timing.duration - timing.telegraph) * Math.PI) : 0;
    const hit = motion && pose === 'hit' && poseTime >= timing.impact && poseTime < timing.duration
      ? Math.sin((poseTime - timing.impact) / (timing.duration - timing.impact) * Math.PI) : 0;
    const victory = motion && pose === 'victory' ? Math.abs(Math.sin(poseTime * 3.5)) : 0;
    const distance = attackStyle === 'arcane' || attackStyle === 'stars' ? 12 : attackStyle === 'endurance' ? 45
      : attackStyle === 'martial' ? 39 : attackStyle === 'roots' || attackStyle === 'fire' ? 23 : 34;
    const selfCast = isSelfCastAbility(ability);
    art.view.x = art.facing * (attack * (selfCast ? 0 : distance + attackTier * 2) - winding * (selfCast ? 0 : 5) - hit * 13);
    art.view.y = -victory * 4;
    art.view.rotation = pose === 'defeat' ? -art.facing * .12
      : art.facing * ((selfCast ? 0 : attack * .055 - winding * .018) - hit * .045);
    art.view.alpha = pose === 'defeat' ? .55 : pose === 'hit' ? (motion ? 1 - hit * .14 : .9) : 1;
    victoryHalo.visible = pose === 'victory';
    victoryStars.visible = pose === 'victory';
    attackCue.visible = pose === 'attack' && (!motion || poseTime < timing.telegraph);
    attackCue.alpha = motion ? .65 : 1;
    if (art.body) {
      art.body.scale.set(1 + breath * .011 + winding * .014 - attack * .009, 1 + breath * .02 - winding * .017 + attack * .011);
    }
    if (art.head) {
      art.head.y = headY - breath * 3.5;
      art.head.rotation = headAngle - art.facing * breath * .006;
    }
    art.arms?.forEach((arm, index) => {
      arm.rotation = armAngles[index] + art.facing * (attack * .2 + breath * .015);
    });
  };

  return {
    view: art.view,
    setPose(next) {
      if (next !== pose) poseTime = 0;
      pose = next;
    },
    setAbility(abilityId) {
      if (destroyed || ability === abilityId) return;
      ability = abilityId; drawAttackCue();
    },
    setAttackVisual(style, tier) {
      if (destroyed || (style === attackStyle && tier === attackTier)) return;
      attackStyle = style; attackTier = tier;
      drawAttackCue();
    },
    update,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      art.view.destroy({ children: true });
      art.dispose?.();
    },
  };
}
