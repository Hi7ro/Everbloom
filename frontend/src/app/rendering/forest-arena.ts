import { BossId } from '../domain/boss-catalog';
import { BOSS_VISUALS } from './boss-visuals';
import { Container, Graphics, Sprite, Texture } from 'pixi.js';

export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 440;

/** Bounded, code-native scenery; the character and boss remain authored artwork. */
export function createForestArena(bossId: BossId = 'mosswarden') {
  const visual = BOSS_VISUALS[bossId];
  const forest = bossId === 'mosswarden';
  const fire = bossId === 'emberwyrm';
  const ice = bossId === 'frost-titan';
  const cloud = bossId === 'cloud-sovereign';
  const view = new Container();
  const surface = document.createElement('canvas');
  surface.width = ARENA_WIDTH;
  surface.height = ARENA_HEIGHT;
  const ctx = surface.getContext('2d');
  if (!ctx) throw new Error('Arena background is unavailable');
  const sky = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
  sky.addColorStop(0, visual.backdrop[0]);
  sky.addColorStop(.55, visual.backdrop[1]);
  sky.addColorStop(1, visual.backdrop[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  const glow = ctx.createRadialGradient(430, 130, 8, 430, 130, 300);
  glow.addColorStop(0, '#' + visual.glow.toString(16).padStart(6, '0') + '50');
  glow.addColorStop(.4, '#536e5733');
  glow.addColorStop(1, '#203e3600');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  const background = Texture.from(surface);
  view.addChild(new Sprite(background));

  if (forest) {
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
  } else if (fire) {
    const rocks = new Graphics();
    for (let i = 0; i < 9; i++) {
      const x = i * 110 - 20;
      rocks.poly([x, 0, x+84, 0, x+64, 116+i%3*21, x+28, 73, x+17, 174])
        .fill({ color: i%2 ? 0x251b29 : 0x34212e, alpha: .9 });
      rocks.poly([x, 363, x+20, 292-i%3*34, x+61, 317, x+98, 379])
        .fill({ color: 0x161522, alpha: .9 });
      rocks.moveTo(x+20, 299-i%3*34).lineTo(x+38, 337).lineTo(x+30, 360)
        .stroke({ color: 0xc96d43, alpha: .3, width: 2 });
    }
    view.addChild(rocks);
  } else if (bossId === 'dusk-prowler') {
    const ruins = new Graphics();
    for (let i=0;i<7;i++) {
      const x=40+i*124, top=110+(i%3)*38;
      ruins.poly([x-20,360,x-14,top,x,top-17,x+16,top+8,x+22,360])
        .fill({color:0x243447,alpha:.85});
      ruins.poly([x,top+24,x+6,top+42,x,top+60,x-6,top+42])
        .stroke({color:0x9ecdcf,width:2,alpha:.4});
    }
    ruins.circle(530,92,45).stroke({color:0x987cb8,width:3,alpha:.22})
      .circle(541,85,36).fill({color:0x171c32,alpha:.75});
    view.addChild(ruins);
  } else if (bossId === 'bloodmoon-regent') {
    const court = new Graphics();
    court.circle(475, 80, 47).fill({ color: 0xc96984, alpha: .28 })
      .circle(484, 70, 37).fill({ color: 0x391f34, alpha: .8 })
      .circle(475, 80, 56).stroke({ color: 0xecc394, alpha: .19, width: 1.5 });
    for (const x of [75, 175, 625, 725]) {
      court.poly([x - 13, 350, x - 10, 100, x, 72, x + 10, 100, x + 13, 350])
        .fill({ color: 0x53314a, alpha: .8 });
      court.moveTo(x, 92).lineTo(x, 314).stroke({ color: 0xceab87, alpha: .3, width: 2 });
    }
    for (const x of [125, 675]) court.moveTo(x - 50, 119).quadraticCurveTo(x, 30, x + 50, 119)
      .stroke({ color: 0xd8ad80, alpha: .26, width: 3 });
    view.addChild(court);
  } else if (ice) {
    const glaciers = new Graphics();
    for (let index = 0; index < 7; index++) {
      const x = index * 137 - 25, peak = 85 + index % 3 * 45;
      glaciers.poly([x - 60, 351, x + 12, peak, x + 36, peak + 43, x + 99, 352])
        .fill({ color: index % 2 ? 0x254959 : 0x345767, alpha: .8 });
      glaciers.poly([x + 12, peak, x + 36, peak + 43, x + 51, 318, x + 6, 287])
        .fill({ color: 0x8dc7d5, alpha: .13 });
      glaciers.moveTo(x + 12, peak).lineTo(x + 5, 286).stroke({ color: 0xc6f1fb, width: 1.5, alpha: .22 });
    }
    for (let index = 0; index < 8; index++) {
      const x = 57 + index * 96, y = 60 + index % 3 * 53;
      glaciers.poly([x, y - 11, x + 5, y, x, y + 11, x - 5, y]).fill({ color: 0xc4e7f3, alpha: .35 });
    }
    view.addChild(glaciers);
  } else if (cloud) {
    const garden = new Graphics();
    for (let index = 0; index < 9; index++) {
      const x = index * 117 - 25, y = 250 + index % 3 * 31;
      garden.ellipse(x, y, 86, 27).fill({ color: 0xc6d6d5, alpha: .08 })
        .ellipse(x + 28, y - 13, 47, 30).fill({ color: 0xd8e4df, alpha: .06 });
    }
    for (const x of [92, 689]) {
      garden.poly([x - 12, 335, x - 10, 117, x, 103, x + 10, 117, x + 12, 335])
        .fill({ color: 0x627c7d, alpha: .5 })
        .moveTo(x - 12, 121).lineTo(x + 12, 121).stroke({ color: 0xe9cf8c, alpha: .45, width: 3 });
    }
    garden.moveTo(82, 114).quadraticCurveTo(393, -15, 699, 114)
      .stroke({ color: 0xd9bc78, alpha: .3, width: 3 })
      .moveTo(91, 127).quadraticCurveTo(393, 7, 691, 127).stroke({ color: 0xe3d2a1, alpha: .13, width: 1 });
    view.addChild(garden);
  } else if (bossId === 'void-devourer') {
    const rift = new Graphics();
    rift.ellipse(530,155,65,125).fill({color:0x090c1a,alpha:.85})
      .ellipse(530,155,73,134).stroke({color:0x9470cb,width:5,alpha:.36})
      .ellipse(530,155,143,45).stroke({color:0x89dacc,width:2,alpha:.25});
    for (let i=0;i<9;i++) {
      const x=40+i*91,y=90+(i%3)*62;
      rift.poly([x-18,y,x+7,y-19,x+23,y+10,x-3,y+36]).fill({color:0x324358,alpha:.65});
      rift.moveTo(x-13,y+2).lineTo(x+14,y+5).stroke({color:0x8be0cd,width:1.5,alpha:.35});
    }
    view.addChild(rift);
  } else if (bossId === 'primordial-dragon') {
    const citadel = new Graphics();
    citadel.circle(465,92,62).stroke({color:0xb6d8f3,width:2,alpha:.25})
      .ellipse(465,92,140,22).stroke({color:0x6fa0d0,width:3,alpha:.28});
    for (const x of [60,180,660,755]) {
      citadel.poly([x-25,354,x-12,151,x,101,x+12,151,x+25,354]).fill({color:0x2e4c67,alpha:.75});
      citadel.moveTo(x,119).lineTo(x,309).stroke({color:0xb5d3ee,width:2,alpha:.25});
    }
    for(let i=0;i<13;i++) citadel.circle(26+i*61,40+(i*47)%154,1.5).fill({color:0xe1efff,alpha:.5});
    view.addChild(citadel);
  } else if (bossId === 'relic-sovereign') {
    const throne = new Graphics();
    for (const x of [65,165,635,735]) {
      throne.poly([x-14,350,x-14,82,x,57,x+14,82,x+14,350]).fill({color:0x695340,alpha:.65});
      throne.moveTo(x-9,333).lineTo(x-9,91).lineTo(x,72).lineTo(x+9,91).lineTo(x+9,333)
        .stroke({color:0xddbc78,width:2,alpha:.35});
    }
    for (let i=0;i<7;i++) {
      const x=280+i*54,y=82+Math.abs(i-3)*17;
      throne.ellipse(x,y,15,30).stroke({color:0xf1d190,width:2,alpha:.3});
      throne.moveTo(x,y-19).lineTo(x,y+18).moveTo(x-7,y+9).lineTo(x+7,y+9)
        .stroke({color:0xeccf96,width:2,alpha:.5});
    }
    view.addChild(throne);
  } else {
    const portal = new Graphics();
    for (const radius of [115, 129, 158]) portal.circle(535, 190, radius)
      .stroke({ color: 0xb3a1ef, alpha: radius===129 ? .22 : .1, width: radius===129 ? 3 : 1 });
    for (let i = 0; i < 12; i++) {
      const angle = i*Math.PI/6;
      const x = 535+Math.cos(angle)*158, y = 190+Math.sin(angle)*158;
      portal.poly([x,y-5,x+3,y,x,y+5,x-3,y]).fill({ color: 0xd5c6ff, alpha: .55 });
    }
    for (const x of [46, 745]) portal.poly([x-18,320,x-14,119,x,80,x+14,119,x+18,320])
      .fill({ color: 0x3e355f, alpha: .6 }).stroke({ color: 0x9583c4, alpha: .2, width: 1 });
    portal.moveTo(58,89).lineTo(133,119).lineTo(203,63).lineTo(310,81)
      .stroke({ color: 0xb8a7ed, alpha: .2, width: 1 });
    view.addChild(portal);
  }

  const floor = new Graphics()
    .ellipse(405, 408, 500, 114).fill({ color: 0x07191c, alpha: .96 })
    .ellipse(402, 383, 360, 67).fill({ color: forest ? 0x254239 : fire ? 0x593037 : ice ? 0x315568 : cloud ? 0x566b6b : 0x39345b, alpha: .48 })
    .ellipse(400, 384, 296, 49).stroke({ color: visual.glow, alpha: .13, width: 1.2 })
    .ellipse(400, 384, 270, 42).stroke({ color: visual.glow, alpha: .08, width: 1 })
    .ellipse(235, 385, 74, 12).fill({ color: 0x020e12, alpha: .65 })
    .ellipse(550, 397, 129, 25).fill({ color: 0x020e12, alpha: .72 });
  for (let i = 0; i < 14; i++) {
    const x = (i * 131 + 35) % 790;
    const y = 372 + (i * 23) % 58;
    floor.ellipse(x, y, 9 + i % 6, 2).fill({ color: visual.glow, alpha: .06 });
  }
  if (fire) {
    for (let i=0;i<6;i++) {
      const x=28+i*150;
      floor.moveTo(x,421).lineTo(x+42,398).lineTo(x+22,382).lineTo(x+60,366)
        .stroke({color:0xe48451,alpha:.3,width:2});
    }
  }
  view.addChild(floor);

  const fireflies = Array.from({ length: 18 }, (_, i) => {
    const dot = new Graphics().circle(0, 0, i % 3 ? 1 : 1.6)
      .fill({ color: i % 3 ? visual.glow : 0xf0dca0, alpha: .75 });
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
