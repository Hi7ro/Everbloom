import { InjectionToken } from '@angular/core';
/** The application opts into server accounts. Isolated demo/test components keep their own data. */
export const ACCOUNT_MODE = new InjectionToken<boolean>('ACCOUNT_MODE', {
  providedIn: 'root',
  factory: () => false,
});
