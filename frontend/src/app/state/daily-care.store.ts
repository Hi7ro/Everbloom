import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, InjectionToken, OnDestroy, signal } from '@angular/core';
import { ACCOUNT_MODE } from '../data/account-mode';
import { AuthStore } from './auth.store';
import { BROWSER_STORAGE } from '../data/browser-storage';
import {
  DailyCareMode,
  DailyCareRecord,
  DailyCheckIn,
  DailyEnergy,
  isLocalDayKey,
  localDayKey,
  normalizeDailyCareRecord,
  normalizeDailyCheckIn,
} from '../domain/daily-care';

export const DAILY_CARE_KEY = 'everbloom.daily-care.v1';
export const DAY_CLOCK = new InjectionToken<() => string>('DAY_CLOCK', {
  providedIn: 'root',
  factory: () => () => localDayKey(),
});

/** Voluntary daily preference only. Never reads or writes game progression. */
@Injectable({ providedIn: 'root' })
export class DailyCareStore implements OnDestroy {
  readonly accountMode = inject(ACCOUNT_MODE);
  private readonly auth = this.accountMode ? inject(AuthStore) : null;
  private readonly storage = this.accountMode ? null : inject(BROWSER_STORAGE);
  private readonly clock = inject(DAY_CLOCK);
  private readonly document = inject(DOCUMENT);
  private readonly dayState = signal('');
  private readonly checkInState = signal<DailyCheckIn | null>(null);
  private readonly skippedState = signal(false);
  private readonly persistedState = signal(Boolean(this.storage));
  private readonly messageState = signal('');
  private memoryOverride = false;
  readonly dayKey = this.dayState.asReadonly();
  readonly checkIn = this.checkInState.asReadonly();
  readonly skipped = this.skippedState.asReadonly();
  readonly persisted = this.persistedState.asReadonly();
  readonly message = this.messageState.asReadonly();

  private readonly onFocus = () => this.refresh();
  private readonly onVisibility = () => {
    if (this.document.visibilityState !== 'hidden') this.refresh();
  };

  constructor() {
    if (this.auth)
      effect(() => {
        this.auth!.epoch();
        this.checkInState.set(null);
        this.skippedState.set(false);
        this.memoryOverride = false;
        this.messageState.set('Dein Tagesgefühl bleibt nur für diese Sitzung auf diesem Gerät.');
      });
    this.refresh();
    this.document.defaultView?.addEventListener('focus', this.onFocus);
    this.document.addEventListener('visibilitychange', this.onVisibility);
  }

  refresh(): void {
    const today = this.today();
    if (this.dayState() !== today) {
      this.dayState.set(today);
      this.checkInState.set(null);
      this.skippedState.set(false);
      this.messageState.set('');
      this.memoryOverride = false;
    }
    // A failed write must not restore an older choice over this session's latest decision.
    if (this.memoryOverride) return;
    if (!this.storage) {
      this.persistedState.set(false);
      return;
    }
    try {
      const raw = this.storage.getItem(DAILY_CARE_KEY);
      let stored: DailyCareRecord | null = null;
      if (raw) {
        try {
          stored = normalizeDailyCareRecord(JSON.parse(raw));
        } catch {
          // Invalid local data starts a fresh optional question.
        }
      }
      const current = stored?.dayKey === today ? stored : null;
      this.checkInState.set(current?.checkIn ?? null);
      this.skippedState.set(current?.skipped ?? false);
      this.persistedState.set(true);
    } catch {
      // Preserve an existing choice for this day if reading storage becomes unavailable.
      this.persistedState.set(false);
    }
  }

  save(mode: DailyCareMode, energy: DailyEnergy): boolean {
    this.refresh();
    const checkIn = normalizeDailyCheckIn({ dayKey: this.dayKey(), mode, energy });
    if (!checkIn) {
      this.messageState.set('Bitte wähle einen Tagesmodus und deine Energie aus.');
      return false;
    }
    this.checkInState.set(checkIn);
    this.skippedState.set(false);
    this.persist({ version: 1, dayKey: checkIn.dayKey, skipped: false, checkIn });
    this.messageState.set('Deine Auswahl gilt für heute.');
    return true;
  }

  skip(): void {
    this.refresh();
    this.checkInState.set(null);
    this.skippedState.set(true);
    this.persist({ version: 1, dayKey: this.dayKey(), skipped: true, checkIn: null });
    this.messageState.set('Für heute ausgelassen. Du kannst jederzeit neu wählen.');
  }

  reset(): void {
    this.refresh();
    this.checkInState.set(null);
    this.skippedState.set(false);
    this.messageState.set('Du kannst deinen Tag neu wählen.');
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.removeItem(DAILY_CARE_KEY);
      this.persistedState.set(true);
      this.memoryOverride = false;
    } catch {
      this.persistedState.set(false);
      this.memoryOverride = true;
    }
  }

  avatarInterest(fallback: string): string {
    const mode = this.checkIn()?.mode;
    if (mode === 'recovery' || mode === 'rest') return 'recovery';
    if (mode === 'focus') return 'programming';
    return fallback;
  }

  avatarMessage(fallback: string): string {
    const checkIn = this.checkIn();
    if (!checkIn) return fallback;
    if (checkIn.mode === 'rest') return 'Heute hat Ruhe Platz. Ich bleibe an deiner Seite.';
    if (checkIn.mode === 'recovery') return 'Heute nehmen wir uns Zeit zum Durchatmen.';
    if (checkIn.mode === 'focus') return 'Heute zählt eine Sache nach der anderen.';
    if (checkIn.energy === 'low') return 'Heute darf es langsam gehen. In deinem Tempo.';
    if (checkIn.energy === 'high') return 'Lust auf einen nächsten kleinen Schritt?';
    return 'Ein Schritt nach dem anderen. Wir finden deinen Rhythmus.';
  }

  ngOnDestroy(): void {
    this.document.defaultView?.removeEventListener('focus', this.onFocus);
    this.document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private persist(record: DailyCareRecord): void {
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.setItem(DAILY_CARE_KEY, JSON.stringify(record));
      this.persistedState.set(true);
      this.memoryOverride = false;
    } catch {
      this.persistedState.set(false);
      this.memoryOverride = true;
    }
  }

  private today(): string {
    try {
      const dayKey = this.clock();
      if (isLocalDayKey(dayKey)) return dayKey;
    } catch {
      // A faulty platform clock adapter must not break the dashboard.
    }
    return localDayKey();
  }
}
