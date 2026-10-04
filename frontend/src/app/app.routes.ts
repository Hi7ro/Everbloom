import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'membership',
    title: 'Mehr Abenteuer · Everbloom Membership',
    loadComponent: () => import('./features/membership/membership.page').then((m) => m.MembershipPage),
  },
  {
    path: 'battle',
    title: 'Die Mooslichtung · Everbloom',
    loadComponent: () => import('./features/battle/battle.page').then((m) => m.BattlePage),
  },
  {
    path: 'auth',
    title: 'Anmelden · Everbloom',
    loadComponent: () => import('./features/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'dashboard',
    title: 'Dein Charakter · Everbloom',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'character/create',
    title: 'Dein Charakter entsteht · Everbloom',
    loadComponent: () =>
      import('./features/character-creator/character-creator').then((m) => m.CharacterCreator),
  },
  {
    path: 'onboarding',
    title: 'Deine Reise beginnt · Everbloom',
    loadComponent: () => import('./features/onboarding/onboarding').then((m) => m.Onboarding),
  },
  { path: '**', redirectTo: 'dashboard' },
];
