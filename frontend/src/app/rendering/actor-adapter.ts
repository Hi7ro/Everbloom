import { Container, Graphics } from 'pixi.js';

export type ActorId = 'hero' | 'boss';
export type ActorPose = 'idle' | 'attack' | 'hit' | 'victory' | 'defeat';

/** Presentation only: damage, rewards and turn order belong to the battle domain. */
export interface ActorAdapter {
  readonly view: Container;
  setPose(pose: ActorPose): void;
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
  const attackCue = new Graphics()
    .moveTo(art.facing * 130, -185)
    .quadraticCurveTo(art.facing * 167, -145, art.facing * 126, -104)
    .stroke({ color: 0xefdba5, alpha: .8, width: 3 });
  attackCue.label = 'attack-cue';
  attackCue.visible = false;
  art.view.addChild(victoryStars, attackCue);

  const update = (deltaSeconds: number, motion: boolean) => {
    if (destroyed) return;
    lifetime += deltaSeconds;
    poseTime += deltaSeconds;
    const breath = motion ? (Math.sin(lifetime * Math.PI / 2.8) + 1) / 2 : 0;
    const attack = motion && pose === 'attack' && poseTime < .65
      ? Math.sin(poseTime / .65 * Math.PI) : 0;
    const hit = motion && pose === 'hit' && poseTime < .4
      ? Math.sin(poseTime / .4 * Math.PI) : 0;
    const victory = motion && pose === 'victory' ? Math.abs(Math.sin(poseTime * 3.5)) : 0;
    art.view.x = art.facing * (attack * 30 - hit * 12);
    art.view.y = -victory * 4;
    art.view.rotation = pose === 'defeat' ? -art.facing * .12
      : art.facing * (attack * .065 - hit * .04);
    art.view.alpha = pose === 'defeat' ? .55 : pose === 'hit' ? .78 : 1;
    victoryHalo.visible = pose === 'victory';
    victoryStars.visible = pose === 'victory';
    attackCue.visible = pose === 'attack' && (!motion || poseTime < .65);
    if (art.body) {
      art.body.scale.set(1 + breath * .011, 1 + breath * .02);
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
    update,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      art.view.destroy({ children: true });
      art.dispose?.();
    },
  };
}
