import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { BOSS_CATALOG, BOSS_DIFFICULTIES, discoveredBosses } from '../domain/boss-catalog';
import { BOSS_COSMETICS, BOSS_LOOT_RARITY_LABELS, BossCosmetic, hasBossCosmetic, resolveBossCosmetic } from '../domain/boss-loot';
import { Appearance } from '../domain/models';
import { GameStore } from '../state/game.store';
import { CharacterPortrait } from './character-portrait';
import { BossLootArt } from './boss-loot-art';

@Component({
  selector: 'app-boss-loot-collection',
  imports: [CharacterPortrait, BossLootArt],
  template: `
    <section aria-label="Deine Bossbelohnungen">
      <p class="eyebrow">ANDENKEN AN DEINE SIEGE</p>
      <h3>{{ kind() === 'aura' ? 'Magie, die du dir verdient hast.' : 'Deine Boss-Editionen.' }}</h3>
      <p class="intro">Jeder erste Sieg pro Boss und Modus schenkt dir ein bleibendes Design. Frisuren und Sets erscheinen in der zu deiner Figur passenden Ausführung. Auren sind für alle gleich. Alle Belohnungen sind rein kosmetisch.</p>
      <div class="loot-grid">
        @for (reward of rewards(); track reward.id) {
          <article [class.owned]="owned(reward.id)" [class.selected]="selected(reward)" [attr.data-rarity]="reward.rarity">
            <app-boss-loot-art [reward]="reward" /><span class="art-label">{{ reward.variantLabel }}</span>
            <details class="equipped-preview">
              <summary>An deinem Chibi</summary>
              <div class="preview" aria-hidden="true">
              @defer (on viewport) {
                <app-character-portrait [appearance]="preview(reward)" [animated]="false" />
              } @placeholder { <span>✧</span> }
              </div>
            </details>
            <span class="rarity">{{ rarities[reward.rarity] }} · {{ slotLabels[reward.slot] }}</span>
            <h4>{{ reward.name }}</h4>
            @if (reward.slot === 'outfit') { <p class="style-description">{{ reward.description }}</p> }
            <p>{{ source(reward) }}</p>
            <button type="button" [disabled]="!owned(reward.id) || store.busy()"
              [attr.aria-pressed]="selected(reward)" [attr.aria-label]="reward.name + ' ausrüsten'"
              (click)="picked.emit(reward.id)">
              {{ selected(reward) ? 'Ausgerüstet ✓' : owned(reward.id) ? 'Ausrüsten' : 'Noch gesperrt' }}
            </button>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display:block; margin-top:24px; }
    h3 { margin:0; font:25px Georgia,serif; } .eyebrow { color:var(--muted); font-size:11px; letter-spacing:.12em; }
    .intro { color:var(--muted); line-height:1.6; font-size:14px; }
    .loot-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    article { padding:12px; border:1px solid var(--line-bright); border-radius:16px; background:#13221b; min-width:0; }
    article.selected { border-color:var(--accent); background:#263b2d; }
    app-boss-loot-art { max-width:200px; margin:auto; }
    .art-label { display:block; text-align:center; color:var(--muted); font-size:10px; }
    .equipped-preview { margin:6px 0 10px; border-top:1px solid var(--line-bright); }
    summary { min-height:44px; display:list-item; align-content:center; color:#c9d6bb; cursor:pointer; font-size:12px; }
    summary:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
    .preview { position:relative; height:145px; max-width:145px; margin:auto; display:grid; place-items:center; }
    app-character-portrait { height:100%; width:100%; }
    .rarity { display:block; margin-top:10px; font-size:10px; color:#9fcce6; }
    [data-rarity=epic] .rarity { color:#c6a6e8; } [data-rarity=legendary] .rarity { color:#ead098; }
    [data-rarity=mythic] .rarity { color:#f4acca; }
    h4 { font-size:14px; margin:6px 0; line-height:1.35; } article p { color:var(--muted); font-size:12px; line-height:1.5; min-height:36px; }
    article .style-description { color:#cbd7c2; min-height:0; }
    button { min-height:44px; width:100%; border:1px solid var(--line-bright); border-radius:10px; background:#2c4232; color:var(--text); font:inherit; font-size:13px; cursor:pointer; }
    button:disabled { opacity:.6; cursor:default; } .selected button { opacity:1; }
    button:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
    @media(min-width:1100px) { .loot-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BossLootCollection {
  readonly store = inject(GameStore);
  readonly appearance = input.required<Appearance>();
  readonly kind = input<'style' | 'aura'>('style');
  readonly picked = output<string>();
  readonly rewards = computed(() => {
    const snapshot = this.store.snapshot();
    const discovered = new Set(discoveredBosses(snapshot).map(boss => boss.id));
    // Old clears retain their wardrobe even when a newly inserted encounter hides later bosses.
    return BOSS_COSMETICS.filter(item => (discovered.has(item.bossId) || (!!snapshot && hasBossCosmetic(snapshot, item.id))) &&
      (this.kind() === 'aura' ? item.slot === 'aura' : item.slot !== 'aura'))
      .map(item => resolveBossCosmetic(item.id, this.appearance().presentation)!);
  });
  readonly rarities = BOSS_LOOT_RARITY_LABELS;
  readonly slotLabels = { hair: 'Frisur', outfit: 'Set', aura: 'Aura' };
  owned(id: string) { const snapshot = this.store.snapshot(); return !!snapshot && hasBossCosmetic(snapshot, id); }
  selected(reward: BossCosmetic) {
    const appearance = this.appearance();
    return reward.slot === 'aura' ? appearance.aura === reward.auraId
      : reward.slot === 'hair' ? appearance.cosmeticHair === reward.id : appearance.cosmeticOutfit === reward.id;
  }
  source(reward: BossCosmetic) {
    return `${BOSS_CATALOG.find(boss => boss.id === reward.bossId)!.name} · ${BOSS_DIFFICULTIES.find(mode => mode.id === reward.difficulty)!.name}`;
  }
  preview(reward: BossCosmetic): Appearance {
    return reward.slot === 'aura'
      ? { ...this.appearance(), aura: reward.auraId! }
      : { ...this.appearance(), aura: 'none', [reward.slot === 'hair' ? 'cosmeticHair' : 'cosmeticOutfit']: reward.id };
  }
}
