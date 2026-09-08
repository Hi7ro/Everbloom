import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CelebrationNotice } from './shared/celebration';
import { MobileNav } from './shared/mobile-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CelebrationNotice, MobileNav],
  template: '<router-outlet /><app-mobile-nav /><app-celebration />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
