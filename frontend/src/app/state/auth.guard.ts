import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ACCOUNT_MODE } from '../data/account-mode';
import { AuthStore } from './auth.store';
import { GameStore } from './game.store';
import { JourneyStore } from './journey.store';

export const accountGuard: CanActivateFn = async (_route, state) => {
  if (!inject(ACCOUNT_MODE)) return true;
  const auth = inject(AuthStore);
  const router = inject(Router);
  return (
    (await auth.ensureSession()) ||
    router.createUrlTree(['/auth'], { queryParams: { returnTo: state.url.split('?')[0] } })
  );
};
export const gameGuard: CanActivateFn = async (route, state) => {
  if (!inject(ACCOUNT_MODE)) return true;
  const auth = inject(AuthStore);
  const game = inject(GameStore);
  const journey = inject(JourneyStore);
  const router = inject(Router);
  if (!(await auth.ensureSession()))
    return router.createUrlTree(['/auth'], { queryParams: { returnTo: state.url.split('?')[0] } });
  if (!(await game.load()))
    return router.createUrlTree(['/connection'], {
      queryParams: { returnTo: state.url.split('?')[0] },
    });
  if (!(await journey.load()))
    return router.createUrlTree(['/connection'], {
      queryParams: { returnTo: state.url.split('?')[0] },
    });
  if (route.data['needsCharacter'] && !game.profileIsSaved())
    return router.createUrlTree(['/character/create']);
  if (route.data['needsJourney'] && !journey.configured())
    return router.createUrlTree(['/onboarding']);
  return true;
};
export const SAFE_RETURN_PATHS = [
  '/membership',
  '/dashboard',
  '/character/create',
  '/onboarding',
  '/battle',
  '/account',
];
export function safeReturnPath(value: string | null): string {
  return value && SAFE_RETURN_PATHS.includes(value) ? value : '/dashboard';
}
