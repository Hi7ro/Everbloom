import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CelebrationNotice } from './shared/celebration';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CelebrationNotice],
  template: '<router-outlet /><app-celebration />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
