import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NativeLifecycle } from './data/native-lifecycle';
import { ACCOUNT_MODE } from './data/account-mode';
import { AuthStore } from './state/auth.store';
import { CelebrationNotice } from './shared/celebration';
import { MembershipStore } from './state/membership.store';
import { GameStore } from './state/game.store';
import { MobileNav } from './shared/mobile-nav';
import { RewardDialog } from './shared/reward-dialog';

@Component({
  selector: 'app-root',
  host: { '(window:focus)': 'resume()', '(document:visibilitychange)': 'resume()' },
  imports: [RouterOutlet, CelebrationNotice, MobileNav, RewardDialog],
  template:
    '<router-outlet />@if (!accountMode || auth?.authenticated()) { <app-mobile-nav /> }<app-celebration /><app-reward-dialog />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly accountMode = inject(ACCOUNT_MODE);
  readonly auth = this.accountMode ? inject(AuthStore) : null;
  private readonly router = inject(Router);
  constructor() {
    void inject(NativeLifecycle)
      .initialize(() => this.resume())
      .catch(() => undefined);
    if (this.auth)
      effect(() => {
        if (
          this.auth!.status() === 'anonymous' &&
          /^\/(dashboard|character|onboarding|battle|account|connection|membership)(\/|$|\?)/.test(
            this.router.url,
          )
        ) {
          void this.router.navigate(['/auth'], {
            queryParams: { returnTo: this.router.url.split('?')[0] },
          });
        }
      });
  }
  private readonly game = inject(GameStore);
  private readonly membership = this.accountMode ? inject(MembershipStore) : null;
  async resume(): Promise<void> {
    if (document.visibilityState !== 'visible') return;
    if (this.accountMode && (!this.auth?.authenticated() || !(await this.auth.ensureSession(true)))) return;
    await Promise.allSettled([this.game.refresh(), this.membership?.load()]);
  }
}
