import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { BossCosmetic, ResolvedBossCosmetic } from '../domain/boss-loot';
import { BOSS_LOOT_ART } from '../rendering/boss-loot-art';

/** An illustrated collection item, never a replacement for the equipped portrait. */
@Component({
  selector: 'app-boss-loot-art',
  template: `
    @if (source() && !failed()) {
      @for (artwork of [source()!]; track 'loot:' + artwork) {
        <img [src]="artwork" [alt]="reward().name + ' · Sammlungsillustration'" width="480" height="480"
          loading="lazy" decoding="async" (error)="artworkFailed(artwork)" />
      }
    } @else {
      <span class="fallback" role="img" [attr.aria-label]="reward().name">{{ reward().slot === 'aura' ? '✧' : reward().slot === 'outfit' ? '♜' : '♛' }}</span>
    }
  `,
  styles: [`
    :host { display:grid; place-items:center; width:100%; aspect-ratio:1; overflow:hidden; }
    img { display:block; width:100%; height:100%; object-fit:contain; }
    .fallback { display:grid; place-items:center; width:100%; height:100%; font-size:40px; color:#d9c599; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BossLootArt {
  readonly reward = input.required<BossCosmetic | ResolvedBossCosmetic>();
  readonly source = computed(() => {
    const reward = this.reward();
    return 'variant' in reward && reward.variant === 'female' && reward.slot !== 'aura'
      ? `/art/loot/${reward.id}-female-v1.webp` : BOSS_LOOT_ART[reward.id] ?? null;
  });
  readonly failed = signal(false);
  constructor() { effect(() => { this.source(); this.failed.set(false); }); }
  artworkFailed(artwork: string): void {
    if (this.source() === artwork) this.failed.set(true);
  }
}
