import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Hauptnavigation">
      <div class="nav-items">
        @for (item of items; track item.label) {
          <a [routerLink]="item.route" [fragment]="item.fragment" routerLinkActive="active"
            [routerLinkActiveOptions]="activeOptions" ariaCurrentWhenActive="page">
            <span class="icon-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
                stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="item.icon" />
              </svg>
            </span>
            <span>{{ item.label }}</span>
          </a>
        }
      </div>
    </nav>
  `,
  styles: [`
    :host { display: none; }
    @media (max-width: 1199px) {
      :host { display: block; position: fixed; inset: auto 0 0; z-index: 40; }
      nav {
        background: #14211df5;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border-top: 1px solid #8da47835;
        padding: 0 env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
      }
      .nav-items {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        width: min(100%, 720px);
        min-height: var(--mobile-nav-height, 68px);
        margin: auto;
        padding: 5px 8px 6px;
        gap: 4px;
      }
      a {
        min-width: 0;
        min-height: 54px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        border-radius: 12px;
        color: #acb8a9;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.15;
        -webkit-tap-highlight-color: transparent;
      }
      .icon-wrap { display: grid; place-items: center; width: 42px; height: 27px; border-radius: 12px 5px 12px 5px; }
      svg { display: block; width: 23px; height: 23px; }
      a.active { color: #d2e6b6; }
      a.active .icon-wrap { background: #bad48f22; }
      a:hover { background: #c3d6b00c; color: #d2e6b6; }
      a:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNav {
  readonly activeOptions: IsActiveMatchOptions = {
    paths: 'exact', fragment: 'exact', queryParams: 'ignored', matrixParams: 'ignored',
  };
  readonly items = [
    { label: 'Heute', route: '/dashboard', fragment: undefined, icon: 'M3 10.5 12 3l9 7.5M5.5 9v11h5v-6h3v6h5V9' },
    { label: 'Quests', route: '/dashboard', fragment: 'quests', icon: 'M8 4H5.5v17h13V4H16M9 3h6v4H9zM8.5 12l2 2 5-5M9 18h6' },
    { label: 'Skills', route: '/dashboard', fragment: 'skills', icon: 'M12 21v-9M12 16C5 16 3 10 4 6c5 0 8 3 8 8M12 12c0-5 3-8 8-9 1 6-2 10-8 11' },
    { label: 'Abenteuer', route: '/battle', fragment: undefined, icon: 'm4 3 16 17M20 3 4 20M4 3l1 5 3-3-4-2ZM20 3l-1 5-3-3 4-2ZM3 17l4 4M17 21l4-4' },
    { label: 'Charakter', route: '/character/create', fragment: undefined, icon: 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4.5 21v-2a7.5 7.5 0 0 1 15 0v2M5 21h14' },
  ];
}
