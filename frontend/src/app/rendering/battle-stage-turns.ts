import type { ActorId, ActorPose } from './actor-adapter';

export interface BattleStageTurn { index: number; actor: ActorId; damage: number; healing: number; }

/** Coordinates presentation events, independently of the ticker and browser preferences. */
export function createBattleTurnController(
  actors: Record<ActorId, { setPose(pose: ActorPose): void }>,
  effects: { endActor(actor: ActorId): void; play(actor: ActorId, motion: boolean): void },
  canMove: () => boolean,
) {
  let lastTurnIndex: number | null = null;
  const poses: Record<ActorId, ActorPose> = { hero: 'idle', boss: 'idle' };
  return {
    setPose(actor: ActorId, pose: ActorPose): void {
      actors[actor].setPose(pose);
      if (pose !== poses[actor]) {
        poses[actor] = pose;
        if (pose !== 'attack') effects.endActor(actor);
      }
    },
    setTurn(turn: BattleStageTurn | null): void {
      if (!turn) {
        lastTurnIndex = null;
        effects.endActor('hero'); effects.endActor('boss');
        return;
      }
      if (turn.index === lastTurnIndex) return;
      lastTurnIndex = turn.index;
      // Consecutive turns may use identical poses. Their new index restarts the
      // attack and hit reaction once; pause, resize and preferences do not.
      for (const actor of ['hero', 'boss'] as const) {
        if (poses[actor] === 'attack' || poses[actor] === 'hit') {
          actors[actor].setPose('idle');
          actors[actor].setPose(poses[actor]);
        }
      }
      if (poses[turn.actor] === 'attack') effects.play(turn.actor, canMove());
    },
  };
}
