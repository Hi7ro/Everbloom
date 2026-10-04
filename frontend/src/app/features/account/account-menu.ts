import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-account-menu',
  template: `@if (auth.user(); as user) { <div class="account-menu"><span>{{ user.email }}</span><button type="button" (click)="logout()" [disabled]="auth.busy()">Abmelden</button></div> }`,
  styles: [`:host { display:block; position:fixed; top:16px; right:16px; z-index:50; } .account-menu { display:flex; align-items:center; gap:10px; padding:6px 8px 6px 12px; border:1px solid #91ac7938; border-radius:999px; background:#122018e8; color:#c8d6bd; font-size:11px; } button { border:0; border-radius:999px; min-height:32px; padding:6px 10px; background:#c4d5a5; color:#263021; font-size:11px; font-weight:600; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMenu {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  async logout() { if (await this.auth.logout()) await this.router.navigateByUrl('/auth'); }
}
