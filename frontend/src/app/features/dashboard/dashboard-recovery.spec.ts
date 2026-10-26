import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ACCOUNT_MODE } from '../../data/account-mode';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { GAME_REPOSITORY } from '../../data/game.repository';
import { createMockSnapshot } from '../../data/mock-data';
import { ACTIVITY_RECOVERY_LOCKS, PENDING_ACTIVITY_PREFIX } from '../../data/pending-activity.storage';
import { MembershipStore } from '../../state/membership.store';
import { AuthStore } from '../../state/auth.store';
import { JourneyStore } from '../../state/journey.store';
import { Dashboard } from './dashboard';

describe('dashboard pending activity recovery', () => {
  const command = { requestId: '97a4265c-5d99-482c-bb2b-723bb1b7e158', skillId: 'swimming', minutes: 47 };
  let entries: Map<string, string>;
  let record: ReturnType<typeof vi.fn>;
  beforeEach(async () => {
    entries = new Map();
    const snapshot = createMockSnapshot();
    record = vi.fn().mockResolvedValue({ snapshot, reward: { activityXp: 0, questXp: 0, damage: 0, rewardedMinutes: 0, duplicate: true } });
    await TestBed.configureTestingModule({ imports: [Dashboard], providers: [
      provideRouter([]),
      { provide: MembershipStore, useValue: { load: vi.fn().mockResolvedValue(true), bonusPercent: () => 0, active: () => false, advancedBosses: () => false } },
      { provide: ACCOUNT_MODE, useValue: true },
      { provide: AuthStore, useValue: { epoch: signal(1), user: signal({ id: 'dashboard-owner' }) } },
      { provide: BROWSER_STORAGE, useValue: {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => entries.set(key, value),
        removeItem: (key: string) => entries.delete(key),
      } },
      { provide: ACTIVITY_RECOVERY_LOCKS, useValue: null },
      { provide: GAME_REPOSITORY, useValue: { load: vi.fn().mockResolvedValue(snapshot), record } },
      { provide: JourneyStore, useValue: { activeSkillIds: () => ['running'], configured: () => false } },
    ] }).compileComponents();
  });
  function persistPending() {
    entries.set(PENDING_ACTIVITY_PREFIX + 'dashboard-owner', JSON.stringify({ version: 1, ownerId: 'dashboard-owner', ...command }));
  }
  it('shows a recovered entry without submitting it and restores its exact locked form', async () => {
    persistPending();
    const fixture = TestBed.createComponent(Dashboard); await fixture.whenStable();
    const component = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const dialog = root.querySelector<HTMLDialogElement>('dialog[aria-labelledby="activity-title"]')!;
    dialog.showModal = vi.fn(); dialog.close = vi.fn();
    expect(root.querySelector('.pending-activity')?.textContent).toContain('Swimming · 47 Minuten');
    expect(record).not.toHaveBeenCalled();
    component.openActivity('running', 10); await fixture.whenStable();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.querySelector('select')!.value).toBe('swimming');
    expect(dialog.querySelector('input')!.value).toBe('47');
    expect(dialog.querySelector('select')!.disabled).toBe(true);
    expect(dialog.querySelector('input')!.disabled).toBe(true);
    expect(dialog.textContent).toContain('Eintrag erneut prüfen');
    await component.submit(); await fixture.whenStable();
    expect(record).toHaveBeenCalledExactlyOnceWith(command);
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(root.querySelector('.pending-activity')).toBeNull();
  });
  it('updates an already open draft when another window or resume reveals a pending entry', async () => {
    const fixture = TestBed.createComponent(Dashboard); await fixture.whenStable();
    const component = fixture.componentInstance;
    const dialog = fixture.nativeElement.querySelector('dialog[aria-labelledby="activity-title"]') as HTMLDialogElement;
    dialog.showModal = vi.fn(); dialog.close = vi.fn();
    component.openActivity('running', 12); await fixture.whenStable();
    expect(dialog.querySelector('input')!.value).toBe('12');
    persistPending(); component.store.checkActivityRecovery(); await fixture.whenStable();
    expect(dialog.querySelector('select')!.value).toBe('swimming');
    expect(dialog.querySelector('input')!.value).toBe('47');
    expect(dialog.querySelector('input')!.disabled).toBe(true);
    expect(record).not.toHaveBeenCalled();
    await component.submit();
    expect(record).toHaveBeenCalledExactlyOnceWith(command);
  });
  it('closes an open recovery form after another window confirms it and a refresh observes the cleared reservation', async () => {
    persistPending();
    const fixture = TestBed.createComponent(Dashboard); await fixture.whenStable();
    const component = fixture.componentInstance;
    const dialog = fixture.nativeElement.querySelector('dialog[aria-labelledby="activity-title"]') as HTMLDialogElement;
    dialog.showModal = vi.fn(); dialog.close = vi.fn();
    component.openActivity(); await fixture.whenStable();
    entries.delete(PENDING_ACTIVITY_PREFIX + 'dashboard-owner');
    await component.store.load(); await fixture.whenStable();
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(record).not.toHaveBeenCalled();
    expect(component.store.message()).toBe('Eintrag wurde in einem anderen Fenster bestätigt. Prüfe deinen Verlauf.');
  });
  it('resolves a stale retry click by refreshing and closing, without submitting the old values', async () => {
    persistPending();
    const fixture = TestBed.createComponent(Dashboard); await fixture.whenStable();
    const component = fixture.componentInstance;
    const dialog = fixture.nativeElement.querySelector('dialog[aria-labelledby="activity-title"]') as HTMLDialogElement;
    dialog.showModal = vi.fn(); dialog.close = vi.fn();
    component.openActivity(); await fixture.whenStable();
    entries.delete(PENDING_ACTIVITY_PREFIX + 'dashboard-owner');
    await component.submit(); await fixture.whenStable();
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(record).not.toHaveBeenCalled();
    expect(component.store.message()).toContain('in einem anderen Fenster bestätigt');
  });
  it('keeps an ordinary new-activity draft open through a refresh', async () => {
    const fixture = TestBed.createComponent(Dashboard); await fixture.whenStable();
    const component = fixture.componentInstance;
    const dialog = fixture.nativeElement.querySelector('dialog[aria-labelledby="activity-title"]') as HTMLDialogElement;
    dialog.showModal = vi.fn(); dialog.close = vi.fn();
    component.openActivity('running', 12); await fixture.whenStable();
    await component.store.load(); await fixture.whenStable();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(component.selectedSkill()).toBe('running'); expect(component.minutes()).toBe(12);
    expect(record).not.toHaveBeenCalled();
  });
  it('does not open a new form from a stale recovery card after another window confirms', async () => {
    persistPending();
    const fixture = TestBed.createComponent(Dashboard); await fixture.whenStable();
    const component = fixture.componentInstance;
    const dialog = fixture.nativeElement.querySelector('dialog[aria-labelledby="activity-title"]') as HTMLDialogElement;
    dialog.showModal = vi.fn(); dialog.close = vi.fn();
    entries.delete(PENDING_ACTIVITY_PREFIX + 'dashboard-owner');
    component.openActivity(); await fixture.whenStable();
    expect(dialog.showModal).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
    expect(component.store.message()).toContain('in einem anderen Fenster bestätigt');
  });
});
