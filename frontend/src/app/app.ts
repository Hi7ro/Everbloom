import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CelebrationNotice } from './shared/celebration';
import { GameStore } from './state/game.store';
import { MobileNav } from './shared/mobile-nav';
import { AccountMenu } from './features/account/account-menu';

@Component({
  selector: 'app-root',
  host: { '(window:focus)': 'resume()', '(document:visibilitychange)': 'resume()' },
  imports: [RouterOutlet, CelebrationNotice, MobileNav, AccountMenu],
  template: '<router-outlet /><app-mobile-nav /><app-account-menu /><app-celebration />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly game = inject(GameStore);
  resume() {
    if (document.visibilityState === 'visible') void this.game.refresh();
  }
}
