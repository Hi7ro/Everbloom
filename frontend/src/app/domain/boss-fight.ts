import { BattleReplay, BattleTactic } from './auto-battle';
import { BossDifficulty, BossId } from './boss-catalog';
import { BossCosmetic } from './boss-loot';
import { GameSnapshot } from './models';

export interface BossFightCommand {
  readonly requestId: string;
  readonly bossId: BossId;
  readonly difficulty: BossDifficulty;
  readonly tactic: BattleTactic;
}

export interface BossFightResult {
  readonly snapshot: GameSnapshot;
  readonly replay: BattleReplay;
  readonly firstClear: boolean;
  readonly reward: BossCosmetic | null;
  readonly duplicate: boolean;
}
