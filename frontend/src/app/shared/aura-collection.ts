import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AURA_REWARDS } from '../domain/aura-rewards';
import { GameStore } from '../state/game.store';
import { CharacterAura } from './character-aura';

@Component({
  selector: 'app-aura-collection',
  imports: [CharacterAura, RouterLink],
  template: `
    <section aria-labelledby="aura-collection-title">
      <div class="heading">
        <div><p class="eyebrow">DEINE ERFOLGE LEUCHTEN</p><h3 id="aura-collection-title">Auren deiner Alltagsreise</h3></div>
        <span class="count">{{ store.ownedAuras().length }} / {{ rewards.length }}</span>
      </div>
      <p class="intro">Diese Auren mit ihren festen Farben verdienst du durch Levelaufstiege und den Wochenboss. Weitere Auren warten in den Bossbegegnungen. Einmal erhalten, bleiben sie in deiner Sammlung.</p>
      <div class="rewards">
        @for (aura of rewards; track aura.id) {
          <div class="reward" [class.owned]="store.canEquipAura(aura.id)" [class.equipped]="selected() === aura.id">
            <div class="art" aria-hidden="true"><app-character-aura [aura]="aura.id" [animated]="false" /></div>
            <div class="copy">
              <h4>{{ aura.label }}</h4>
              <p>
                @if (aura.unlock.kind === 'level') { Erreiche Level {{ aura.unlock.level }} }
                @else { Bossbelohnung: {{ aura.unlock.bossName }} }
              </p>
              <span class="status">{{ store.canEquipAura(aura.id) ? '✓ Freigeschaltet' : 'Noch gesperrt' }}</span>
              @if (editable()) {
                <button type="button" [disabled]="!store.canEquipAura(aura.id) || store.busy()"
                  [attr.aria-pressed]="selected() === aura.id" [attr.aria-label]="aura.label + ' auswählen'"
                  (click)="choose(aura.id)">{{ selected() === aura.id ? 'Ausgewählt ✓' : 'Auswählen' }}</button>
              }
            </div>
          </div>
        }
      </div>
      @if (!editable()) { <a class="collection-link" routerLink="/character/create" fragment="aura-rewards">Auren im Charakter-Editor auswählen ↗</a> }
    </section>
  `,
  styles: [`
    :host { display:block; min-width:0; }
    section { padding:22px; border:1px solid var(--line); border-radius:18px; background:var(--surface); }
    .heading { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .eyebrow { margin:0 0 7px; font-size:12px; letter-spacing:1px; color:var(--muted); }
    h3 { margin:0; font:25px Georgia,serif; } .count { padding:7px 10px; border-radius:20px; background:#abc68816; white-space:nowrap; color:var(--accent); }
    .intro { color:var(--muted); font-size:14px; line-height:1.65; margin:12px 0 18px; }
    .rewards { display:grid; gap:10px; }
    .reward { display:flex; align-items:center; gap:14px; padding:14px; border:1px solid var(--line); border-radius:12px; background:#111d1780; min-width:0; }
    .reward.owned { border-color:#a8ca7d70; } .reward.equipped { background:#a8ca7d18; }
    .art { position:relative; flex:0 0 76px; height:94px; opacity:.5; } .owned .art { opacity:1; }
    .copy { flex:1; min-width:0; } h4 { margin:0 0 5px; font-size:16px; } .copy p { margin:0 0 7px; color:var(--muted); font-size:13px; line-height:1.5; }
    .status { display:block; font-size:12px; color:var(--muted); } .owned .status { color:var(--accent); }
    button, .collection-link { display:inline-flex; min-height:44px; align-items:center; justify-content:center; border:1px solid var(--line-bright); border-radius:9px; color:var(--text); background:#20362b; font:inherit; font-size:14px; padding:9px 14px; margin-top:10px; text-decoration:none; }
    button { cursor:pointer; } button:disabled { opacity:.45; cursor:default; } button[aria-pressed=true] { border-color:var(--accent); }
    button:focus-visible, a:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
    .collection-link { margin-top:18px; width:100%; }
    @media(max-width:480px) { section { padding:18px 14px; } .art { flex-basis:60px; height:80px; } .reward { padding:12px; gap:12px; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuraCollection {
  readonly store = inject(GameStore);
  readonly rewards = AURA_REWARDS;
  readonly selected = input<string | null>(null);
  readonly editable = input(false);
  readonly picked = output<string>();
  choose(id: string) { if (!this.store.busy() && this.store.canEquipAura(id)) this.picked.emit(id); }
}
