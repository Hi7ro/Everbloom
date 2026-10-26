import { DOCUMENT } from '@angular/common';
import { afterRenderEffect, ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, signal, untracked, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BOSS_LOOT_RARITY_LABELS } from '../domain/boss-loot';
import { ProgressFeedback } from '../state/progress-feedback';
import { RewardNotifications } from '../state/reward-notifications';
import { BossLootArt } from './boss-loot-art';
import { CharacterAura } from './character-aura';

@Component({
  selector: 'app-reward-dialog',
  imports: [RouterLink, BossLootArt, CharacterAura],
  template: `
    <dialog #dialog aria-labelledby="reward-title" aria-describedby="reward-description"
      [class.effects]="feedback.effectsEnabled()" [class.motion]="feedback.motionEnabled()"
      (cancel)="cancel($event)">
      @if (rewards.current(); as reward) {
        <div class="reward-content" [attr.data-reward]="reward.key">
          <button class="close" type="button" autofocus aria-label="Belohnung schließen" (click)="rewards.dismiss()">×</button>
          <p class="eyebrow">Neu in deiner Sammlung</p>
          <div class="art" aria-hidden="true">
            @if (reward.boss; as boss) { <app-boss-loot-art [reward]="boss" /> }
            @else if (reward.aura; as aura) {
              @defer (on immediate) {
                <app-character-aura [aura]="aura.id" [animated]="feedback.motionEnabled() && feedback.effectsEnabled()" />
              }
              <span class="aura-jewel">✧</span>
            }
          </div>
          <p class="rarity" [attr.data-rarity]="reward.boss?.rarity ?? 'special'">
            {{ reward.boss ? rarityLabels[reward.boss.rarity] : 'Besondere Aura' }}
            @if (reward.boss) { <span> · {{ slotLabels[reward.boss.slot] }} · {{ reward.boss.variantLabel }}</span> }
          </p>
          <h2 id="reward-title">{{ reward.name }}</h2>
          <p id="reward-description">{{ reward.boss?.description ?? 'Ein neues Leuchten für deinen Chibi. Dein Fortschritt wird sichtbar.' }}</p>
          <p class="source">{{ reward.source }}</p>
          @if (rewards.remaining()) { <p class="remaining">Noch {{ rewards.remaining() }} weitere {{ rewards.remaining() === 1 ? 'Belohnung' : 'Belohnungen' }}</p> }
          <button type="button" class="primary" (click)="rewards.dismiss()">{{ rewards.remaining() ? 'Nächste Belohnung' : 'Großartig!' }}</button>
          <a routerLink="/character/create" [fragment]="reward.fragment" (click)="rewards.dismiss()">In deiner Sammlung ansehen →</a>
        </div>
      }
    </dialog>
  `,
  styleUrl: './reward-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardDialog implements OnDestroy {
  readonly rewards = inject(RewardNotifications);
  readonly feedback = inject(ProgressFeedback);
  readonly rarityLabels = BOSS_LOOT_RARITY_LABELS;
  readonly slotLabels = { hair: 'Frisur', outfit: 'Rüstungsset', aura: 'Aura' };
  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private opener: HTMLElement | null = null;
  private previousOverflow = '';
  private visibleKey: string | null = null;
  private readonly dialogWake = signal(0);
  private stopWaiting: (() => void) | null = null;

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog()?.nativeElement;
      const reward = this.rewards.current();
      this.dialogWake();
      untracked(() => {
        if (!dialog) return;
        if (!reward) { this.cancelWaiting(); this.hide(dialog); return; }
        if (!dialog.open) {
          // An accepted activity may finish while its form is still closing.
          // Wait for native close/focus restoration instead of stacking modals.
          const other = Array.from(this.document.querySelectorAll<HTMLDialogElement>('dialog[open]')).find(item => item !== dialog);
          if (other) {
            if (!this.stopWaiting) {
              const resume = () => { this.cancelWaiting(); this.dialogWake.update(value => value + 1); };
              other.addEventListener('close', resume, { once: true });
              this.stopWaiting = () => other.removeEventListener('close', resume);
            }
            return;
          }
          this.cancelWaiting();
          this.opener = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
          this.previousOverflow = this.document.body.style.overflow;
          this.document.body.style.overflow = 'hidden';
          dialog.showModal();
        }
        if (this.visibleKey !== reward.key) {
          this.visibleKey = reward.key;
          dialog.querySelector<HTMLButtonElement>('.close')?.focus();
          this.feedback.rewardCue();
        }
      });
    });
  }

  cancel(event: Event): void { event.preventDefault(); this.rewards.dismiss(); }

  ngOnDestroy(): void { this.cancelWaiting(); this.hide(this.dialog()?.nativeElement); }

  private cancelWaiting(): void { this.stopWaiting?.(); this.stopWaiting = null; }

  private hide(dialog?: HTMLDialogElement): void {
    if (!this.visibleKey) return;
    this.visibleKey = null;
    dialog?.close();
    this.document.body.style.overflow = this.previousOverflow;
    if (this.opener?.isConnected && !this.opener.matches(':disabled') && !this.opener.closest('dialog:not([open])')) this.opener.focus();
    else this.document.querySelector<HTMLElement>('main button:not(:disabled), main a[href], app-mobile-nav a[href]')?.focus();
    this.opener = null;
  }
}
