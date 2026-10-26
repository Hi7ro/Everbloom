import { Container, Sprite, Texture } from 'pixi.js';
import { AURA_VISUALS } from './aura-visuals';

export interface AuraLayer {
  readonly view: Container;
  readonly loaded: boolean;
  update(deltaSeconds: number, motion: boolean): void;
  destroy(): void;
}

/** A single painted aura, shared with the DOM portrait; it never owns a ticker or combat state. */
export async function createAuraLayer(auraId: string, signal?: AbortSignal): Promise<AuraLayer> {
  const view = new Container();
  view.label = 'equipped-aura';
  view.eventMode = 'none';
  const visual = Object.hasOwn(AURA_VISUALS, auraId) ? AURA_VISUALS[auraId] : undefined;
  let bitmap: ImageBitmap | undefined;
  let texture: Texture | undefined;
  let sprite: Sprite | undefined;
  let destroyed = false;
  let elapsed = 0;
  const release = () => {
    if (texture && !texture.destroyed) texture.destroy(true);
    bitmap?.close();
    texture = undefined;
    bitmap = undefined;
  };
  const checkAbort = () => {
    if (signal?.aborted) throw new DOMException('Aura loading was cancelled', 'AbortError');
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    if (!view.destroyed) view.destroy({ children: true });
    release();
  };
  if (visual) {
    try {
      checkAbort();
      const response = await fetch(visual.artwork, { signal });
      if (!response.ok) throw new Error('Aura artwork unavailable');
      bitmap = await createImageBitmap(await response.blob());
      checkAbort();
      if (bitmap.width * bitmap.height > 4_194_304) throw new Error('Aura artwork exceeds its texture budget');
      texture = Texture.from(bitmap);
      sprite = new Sprite(texture);
      sprite.label = 'painted-aura';
      sprite.anchor.set(.5, 1);
      sprite.width = visual.width;
      sprite.height = visual.height;
      if (visual.tint !== undefined) sprite.tint = visual.tint;
      view.addChild(sprite);
    } catch (error) {
      sprite?.destroy();
      sprite = undefined;
      release();
      // Missing decorative art must not prevent a fight; cancelled scenes still abort normally.
      if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        destroy();
        throw error;
      }
    }
  }
  const update = (deltaSeconds: number, motion: boolean) => {
    if (destroyed || !sprite || !visual) return;
    elapsed = (elapsed + (motion && Number.isFinite(deltaSeconds) ? Math.max(0, Math.min(deltaSeconds, .1)) : 0)) % 9;
    const wave = motion ? Math.sin(elapsed * Math.PI * 2 / 9) : 0;
    const breath = motion ? (1 - Math.cos(elapsed * Math.PI * 2 / 9)) / 2 : 0;
    // Portrait coordinates use top-left (0,0); the actor uses center-foot (120,280).
    sprite.position.set(visual.x + visual.width / 2 - 120,
      visual.y + visual.height - 280);
    sprite.rotation = 0;
    sprite.width = visual.width;
    sprite.height = visual.height;
    sprite.alpha = visual.opacity;
    if (motion) {
      if (visual.motion === 'drift') { sprite.x += wave * .7; sprite.y += wave * 1.5; }
      if (visual.motion === 'rise') sprite.y -= breath * 2.5;
      if (visual.motion === 'pulse') sprite.alpha *= 1 - breath * .06;
      if (visual.motion === 'wings') {
        sprite.width *= 1 + breath * .012;
        sprite.height *= 1 + breath * .004;
      }
    }
  };
  update(0, false);
  return { view, loaded: !!sprite, update, destroy };
}
