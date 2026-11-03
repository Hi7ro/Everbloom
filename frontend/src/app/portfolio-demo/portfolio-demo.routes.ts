import { Routes } from '@angular/router';

/** Deliberate allowlist: no account, recovery, purchase or backend-backed routes. */
export const portfolioDemoRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Herovera · Interaktive Portfolio-Demo',
    loadComponent: () =>
      import('../features/dashboard/dashboard').then((module) => module.Dashboard),
  },
  {
    path: 'demo',
    title: 'So funktioniert die Demo · Herovera',
    loadComponent: () =>
      import('./portfolio-demo.guide').then((module) => module.PortfolioDemoGuide),
  },
  {
    path: 'character/create',
    title: 'Charakter gestalten · Herovera Demo',
    loadComponent: () =>
      import('../features/character-creator/character-creator').then(
        (module) => module.CharacterCreator,
      ),
  },
  {
    path: 'onboarding',
    title: 'Interessen wählen · Herovera Demo',
    loadComponent: () =>
      import('../features/onboarding/onboarding').then((module) => module.Onboarding),
  },
  {
    path: 'battle',
    title: 'Bossbegegnungen · Herovera',
    loadComponent: () =>
      import('../features/battle/battle.page').then((module) => module.BattlePage),
  },
  {
    path: 'membership',
    title: 'Plus-Vorschau · Herovera',
    loadComponent: () =>
      import('../features/membership/membership.page').then((module) => module.MembershipPage),
  },
  {
    path: 'terms',
    title: 'Nutzung & Plus · Herovera',
    loadComponent: () =>
      import('../features/account/terms.page').then((module) => module.TermsPage),
  },
  {
    path: 'privacy',
    title: 'Deine Daten · Herovera',
    loadComponent: () =>
      import('../features/account/privacy.page').then((module) => module.PrivacyPage),
  },
  {
    path: 'support',
    title: 'Hilfe · Herovera',
    loadComponent: () =>
      import('../features/account/support.page').then((module) => module.SupportPage),
  },
  { path: '**', redirectTo: 'demo' },
];
