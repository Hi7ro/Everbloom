import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
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
  { path: '**', redirectTo: 'dashboard' },
];
