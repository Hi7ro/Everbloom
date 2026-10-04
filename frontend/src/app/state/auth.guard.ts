import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (await auth.ensureSession()) return true;
  const returnTo = state.url.startsWith('/') && !state.url.startsWith('//') ? state.url : '/dashboard';
  return router.createUrlTree(['/auth'], { queryParams: { returnTo } });
};
