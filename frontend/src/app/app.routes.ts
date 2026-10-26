import { Routes } from '@angular/router';
import { accountGuard, gameGuard } from './state/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  {
    path: 'auth',
    title: 'Deine Reise beginnt · Herovera',
    loadComponent: () => import('./features/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'auth/verify',
    title: 'E-Mail bestätigen · Herovera',
    loadComponent: () => import('./features/auth/recovery.page').then((m) => m.RecoveryPage),
  },
  {
    path: 'auth/reset',
    title: 'Passwort erneuern · Herovera',
    loadComponent: () => import('./features/auth/recovery.page').then((m) => m.RecoveryPage),
  },
  { path: 'dev/auth', redirectTo: 'auth' },
  {
    path: 'demo',
    title: 'Herovera entdecken',
    loadComponent: () => import('./features/demo/preview.page').then((m) => m.PreviewPage),
  },
  {
    path: 'connection',
    title: 'Verbindung · Herovera',
    canActivate: [accountGuard],
    loadComponent: () => import('./features/auth/connection.page').then((m) => m.ConnectionPage),
  },
  {
    path: 'account',
    title: 'Dein Konto · Herovera',
    canActivate: [accountGuard],
    loadComponent: () => import('./features/account/account.page').then((m) => m.AccountPage),
  },
  {
    path: 'delete-account',
    title: 'Konto löschen · Herovera',
    loadComponent: () =>
      import('./features/account/delete-account.page').then((m) => m.DeleteAccountPage),
  },
  {
    path: 'privacy',
    title: 'Deine Daten · Herovera',
    loadComponent: () => import('./features/account/privacy.page').then((m) => m.PrivacyPage),
  },
  {
    path: 'terms',
    title: 'Nutzung & Plus · Herovera',
    loadComponent: () => import('./features/account/terms.page').then((m) => m.TermsPage),
  },
  {
    path: 'support',
    title: 'Hilfe · Herovera',
    loadComponent: () => import('./features/account/support.page').then((m) => m.SupportPage),
  },
  {
    path: 'membership',
    canActivate: [accountGuard],
    title: 'Mehr Abenteuer · Herovera',
    loadComponent: () =>
      import('./features/membership/membership.page').then((m) => m.MembershipPage),
  },
  {
    path: 'battle',
    title: 'Bossbegegnungen · Herovera',
    canActivate: [gameGuard],
    data: { needsCharacter: true, needsJourney: true },
    loadComponent: () => import('./features/battle/battle.page').then((m) => m.BattlePage),
  },
  {
    path: 'dashboard',
    title: 'Dein Charakter · Herovera',
    canActivate: [gameGuard],
    data: { needsCharacter: true, needsJourney: true },
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'character/create',
    title: 'Dein Charakter entsteht · Herovera',
    canActivate: [gameGuard],
    loadComponent: () =>
      import('./features/character-creator/character-creator').then((m) => m.CharacterCreator),
  },
  {
    path: 'onboarding',
    title: 'Deine Reise beginnt · Herovera',
    canActivate: [gameGuard],
    data: { needsCharacter: true },
    loadComponent: () => import('./features/onboarding/onboarding').then((m) => m.Onboarding),
  },
  { path: '**', redirectTo: 'dashboard' },
];
