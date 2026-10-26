import { inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from './browser-storage';

/** A recovery flag only: never a receipt, credential, price, or entitlement. */
@Injectable({ providedIn: 'root' })
export class PendingMembershipStorage {
  private readonly storage = inject(BROWSER_STORAGE);
  private key(owner: string) { return `everbloom.pending-membership.v1:${owner}`; }
  has(owner: string): boolean {
    try { return this.storage?.getItem(this.key(owner)) === '1'; } catch { return false; }
  }
  set(owner: string, pending: boolean): void {
    try {
      if (pending) this.storage?.setItem(this.key(owner), '1');
      else this.storage?.removeItem(this.key(owner));
    } catch { /* In-memory protection still applies if device storage is blocked. */ }
  }
}
