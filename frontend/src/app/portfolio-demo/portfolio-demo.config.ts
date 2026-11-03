import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { ACCOUNT_MODE } from '../data/account-mode';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { GAME_REPOSITORY } from '../data/game.repository';
import { DEFAULT_JOURNEY } from '../domain/journey';
import { GameStore } from '../state/game.store';
import { JourneyStore } from '../state/journey.store';
import { PortfolioDemoRepository } from './portfolio-demo.repository';
import { MembershipStore } from '../state/membership.store';
import { PortfolioDemoMembership } from './portfolio-demo.membership';
import { portfolioDemoRoutes } from './portfolio-demo.routes';

registerLocaleData(localeDe);

export const portfolioDemoConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: ACCOUNT_MODE, useValue: false },
    { provide: BROWSER_STORAGE, useValue: null },
    { provide: MembershipStore, useClass: PortfolioDemoMembership },
    { provide: GAME_REPOSITORY, useClass: PortfolioDemoRepository },
    provideRouter(
      portfolioDemoRoutes,
      withHashLocation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideAppInitializer(() => {
      const journey = inject(JourneyStore);
      const game = inject(GameStore);
      journey.save(structuredClone(DEFAULT_JOURNEY));
      return game.load();
    }),
  ],
};
