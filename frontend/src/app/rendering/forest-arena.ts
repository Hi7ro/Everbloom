import { Container, Graphics, Sprite, Texture } from 'pixi.js';

export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 440;

/** Bounded, code-native scenery; the character and boss remain authored artwork. */
export function createForestArena() {
  const view = new Container();
  const surface = document.createElement('canvas');
  surface.width = ARENA_WIDTH;
  surface.height = ARENA_HEIGHT;
  const ctx = surface.getContext('2d');
  if (!ctx) throw new Error('Arena background is unavailable');
  const sky = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
  sky.addColorStop(0, '#08151e');
  sky.addColorStop(.55, '#17372f');
  sky.addColorStop(1, '#091c1d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  const glow = ctx.createRadialGradient(430, 130, 8, 430, 130, 300);
  glow.addColorStop(0, '#72886f66');
  glow.addColorStop(.4, '#536e5733');
  glow.addColorStop(1, '#203e3600');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  const background = Texture.from(surface);
  view.addChild(new Sprite(background));

  const trees = new Graphics();
  for (let i = 0; i < 15; i++) {
    const x = i * 63 - 35;
    const width = 13 + (i % 4) * 9;
    trees.poly([x, 0, x + width, 0, x + width * .6 + 14, 318,
      x - 14, 348, x + 2, 160]).fill({ color: i % 2 ? 0x092422 : 0x16332c, alpha: .82 });
    trees.poly([x + width * .5, 126, x - 40, 59, x - 36, 41,
      x + width, 102]).fill({ color: 0x0e2825, alpha: .8 });
  }
  view.addChild(trees);
  const moon = new Graphics()
    .circle(417, 80, 35).fill({ color: 0xd6e3bd, alpha: .035 })
    .circle(417, 80, 22).fill({ color: 0xd6e3bd, alpha: .06 })
    .circle(417, 80, 12).fill({ color: 0xd6e3bd, alpha: .25 });
  view.addChild(moon);

  const floor = new Graphics()
    .ellipse(405, 408, 500, 114).fill({ color: 0x07191c, alpha: .96 })
    .ellipse(402, 383, 360, 67).fill({ color: 0x254239, alpha: .48 })
    .ellipse(400, 384, 296, 49).stroke({ color: 0x81bfa1, alpha: .13, width: 1.2 })
    .ellipse(400, 384, 270, 42).stroke({ color: 0x81bfa1, alpha: .08, width: 1 })
    .ellipse(235, 385, 84, 14).fill({ color: 0x020e12, alpha: .65 })
    .ellipse(554, 385, 99, 19).fill({ color: 0x020e12, alpha: .72 });
  for (let i = 0; i < 14; i++) {
    const x = (i * 131 + 35) % 790;
    const y = 372 + (i * 23) % 58;
    floor.ellipse(x, y, 9 + i % 6, 2).fill({ color: 0x81bfa1, alpha: .06 });
  }
  view.addChild(floor);

  const fireflies = Array.from({ length: 18 }, (_, i) => {
    const dot = new Graphics().circle(0, 0, i % 3 ? 1 : 1.6)
      .fill({ color: i % 3 ? 0xb6d29e : 0xf0dca0, alpha: .75 });
    const x = 30 + (i * 127) % 742;
    const y = 35 + (i * 53) % 320;
    dot.position.set(x, y);
    view.addChild(dot);
    return { dot, x, y, offset: i * 1.7 };
  });
  let time = 0;
  return {
    view,
    update(delta: number, motion: boolean) {
      time += delta;
      for (const point of fireflies) {
        point.dot.y = point.y + (motion ? Math.sin(time * .35 + point.offset) * 8 : 0);
        point.dot.x = point.x + (motion ? Math.sin(time * .21 + point.offset) * 5 : 0);
        point.dot.alpha = motion ? .25 + (Math.sin(time + point.offset) + 1) * .2 : .45;
      }
    },
    dispose() {
      background.destroy(true);
      surface.width = surface.height = 1;
    },
  };
}
