import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressionHorizon } from '../domain/progression-horizon';
import { BossLootArt } from './boss-loot-art';
import { CharacterAura } from './character-aura';

/** A view of existing unlocks, without claims, rewards or its own progress state. */
@Component({
  selector: 'app-progression-horizon',
  imports: [DecimalPipe, RouterLink, BossLootArt, CharacterAura],
  template: `
    <section aria-labelledby="horizon-title">
      <header><div><p class="eyebrow">ES WÄCHST ETWAS MIT DIR</p><h2 id="horizon-title">Am Horizont</h2></div><span aria-hidden="true">✧</span></header>
      <p class="intro">Ein Ausblick auf das, was du dir erspielen kannst. In deinem Tempo.</p>
      <div class="goals">
        @if (goals().boss; as boss) {
          <article aria-labelledby="horizon-boss-title">
            <p class="kind">DEINE NÄCHSTE BEGEGNUNG</p>
            <h3 id="horizon-boss-title">{{ boss.name }}</h3>
            <p>Normal · ab Level {{ boss.minimumLevel }}@if (boss.recommendedLevel > boss.minimumLevel) { · empfohlen: {{ boss.recommendedLevel }}}</p>
            @if (boss.requiresPlus) {
              <p class="access-note">{{ plusAccess() ? 'Plus-Kapitel · Zugang freigegeben' : 'Plus-Kapitel · benötigt Plus' }}</p>
            }
            @if (boss.readyToEnter && (!boss.requiresPlus || plusAccess())) {
              <p class="ready">Du kannst die Begegnung jetzt antreten.</p>
            } @else if (!boss.readyToEnter) {
              <progress [value]="boss.progressXp" [max]="boss.requiredXp" [attr.aria-label]="'Fortschritt bis Level ' + boss.minimumLevel"></progress>
              <p class="remaining">Noch {{ boss.remainingXp | number }} Charakter-XP bis Level {{ boss.minimumLevel }}.</p>
            } @else {
              <p>Das nötige Level hast du bereits erreicht. Für diese Begegnung brauchst du Plus.</p>
            }
            @if (boss.reward; as reward) {
              <div class="reward"><app-boss-loot-art [reward]="reward" /><span><small>Beim ersten Sieg auf Normal</small><strong>{{ reward.name }}</strong><small>{{ reward.slot === 'hair' ? 'Frisur' : reward.slot === 'outfit' ? 'Outfitset' : 'Aura' }} · dauerhaft für deinen Look</small></span></div>
            }
            <p class="note">Deine Skills und Taktik entscheiden mit. Das Level garantiert keinen Sieg.</p>
            @if (boss.requiresPlus && !plusAccess()) {
              <a routerLink="/membership">Das nächste Kapitel mit Plus <span aria-hidden="true">↗</span></a>
            } @else {
              <a routerLink="/battle">Zu deinen Bossbegegnungen <span aria-hidden="true">↗</span></a>
            }
          </article>
        }
        @if (goals().aura; as aura) {
          <article aria-labelledby="horizon-aura-title">
            <p class="kind">DEINE NÄCHSTE LEVEL-AURA</p>
            <h3 id="horizon-aura-title">{{ aura.label }}</h3>
            <p>Beim Aufstieg auf Level {{ aura.targetLevel }}</p>
            <progress [value]="aura.progressXp" [max]="aura.requiredXp" [attr.aria-label]="'Fortschritt zur Aura ' + aura.label"></progress>
            <p class="remaining">Noch {{ aura.remainingXp | number }} Charakter-XP.</p>
            <div class="reward"><div class="aura-art" aria-hidden="true"><app-character-aura [aura]="aura.id" [animated]="false" /></div><span><small>Durch deinen Fortschritt im Alltag</small><strong>Deine Erfolge leuchten</strong><small>Kosmetisch · kein zusätzlicher Kampfbonus</small></span></div>
            <a routerLink="/character/create" fragment="aura-rewards">Auren entdecken <span aria-hidden="true">↗</span></a>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    :host{display:block;min-width:0}section{padding:23px 19px;border:1px solid #d5c28c30;border-radius:21px;background:linear-gradient(130deg,#26312c,#19282b)}
    header{display:flex;justify-content:space-between;gap:12px;align-items:center}header>span{font-size:30px;color:var(--gold)}
    .eyebrow,.kind{font-size:10px;letter-spacing:1.3px;color:#c4c6a8;margin:0 0 9px}h2{font-size:21px;margin:0}h3{font-size:17px;margin:0 0 7px}
    .intro,p{font-size:13px;color:#b5c3b9;line-height:1.6}.intro{margin:10px 0 18px}.goals{display:grid;gap:14px}article{min-width:0;padding:17px;border:1px solid #d3dfcb1c;border-radius:15px;background:#101d2345}article>p{margin:5px 0 12px}.kind{font-size:10px}article>.ready{color:#cbdcaa}
    progress{display:block;width:100%;height:5px;appearance:none;border:none;border-radius:8px;overflow:hidden;background:#cadbc01a}progress::-webkit-progress-bar{background:#cadbc01a}progress::-webkit-progress-value{background:#ceca94;border-radius:8px}progress::-moz-progress-bar{background:#ceca94}article>.remaining{margin-top:8px;font-size:12px}
    .reward{display:flex;align-items:center;gap:12px;margin:15px 0}.reward>span{min-width:0}.reward strong,.reward small{display:block}.reward strong{font-size:14px;color:#e1d5b0;margin:4px 0}.reward small{font-size:11px;color:#b5c3b9;line-height:1.5}app-boss-loot-art,.aura-art{flex:0 0 60px;width:60px;height:70px}.aura-art{position:relative}.note{font-size:11px}
    a{display:flex;align-items:center;justify-content:space-between;min-height:44px;font-size:13px;color:#e1d5b0;text-decoration:none;border-top:1px solid #d3dfcb1c;margin-top:12px;padding-top:6px}a:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:5px}
    @media(min-width:700px){.goals{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressionHorizonPanel {
  readonly goals = input.required<ProgressionHorizon>();
  /** Confirmed entitlement, including the explicitly open billing preview. */
  readonly plusAccess = input(false);
}
