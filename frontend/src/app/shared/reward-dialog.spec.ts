import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { createMockSnapshot } from '../data/mock-data';
import { createBossBattle } from '../domain/auto-battle';
import { bossFirstClearReward } from '../domain/boss-loot';
import { ProgressFeedback } from '../state/progress-feedback';
import { RewardNotifications } from '../state/reward-notifications';
import { SuccessAudio } from './success-audio';
import { RewardDialog } from './reward-dialog';

describe('earned reward dialog', () => {
  const audio = { prepare: vi.fn(), play: vi.fn(), stop: vi.fn() };
  let opener: HTMLButtonElement;
  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ imports: [RewardDialog], providers: [provideRouter([]),
      { provide: BROWSER_STORAGE, useValue: null }, { provide: SuccessAudio, useValue: audio }] });
    await TestBed.compileComponents();
    opener = document.createElement('button'); opener.textContent = 'Kämpfen';
    document.body.append(opener); opener.focus();
  });
  afterEach(() => { TestBed.resetTestingModule(); opener.remove(); document.body.style.overflow = ''; vi.restoreAllMocks(); });

  function earnBoss(presentation: 'male' | 'female' = 'male') {
    const snapshot = createMockSnapshot();
    snapshot.character.appearance.presentation = presentation;
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] };
    TestBed.inject(RewardNotifications).earnedBoss({ snapshot, replay: createBossBattle(snapshot, { bossId: 'mosswarden' }),
      firstClear: true, duplicate: false, reward: bossFirstClearReward('mosswarden', 'normal') });
  }

  function mockDialog(dialog: HTMLDialogElement): void {
    // jsdom has no modal/top-layer implementation; native browser checks are separate.
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
  }

  it('opens a named modal, keeps backdrop taps safe and restores focus and scrolling on Escape', async () => {
    document.body.style.overflow = 'auto';
    const fixture = TestBed.createComponent(RewardDialog);
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    mockDialog(dialog);
    expect(dialog.open).toBe(false); expect(audio.play).not.toHaveBeenCalled();
    earnBoss(); await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe('reward-title');
    expect(dialog.querySelector('#reward-title')!.textContent).toBe('Waldkrone · Jade-Topknot');
    expect(dialog.querySelector('app-boss-loot-art')).not.toBeNull();
    expect(dialog.querySelector('a')!.getAttribute('href')).toBe('/character/create#boss-loot');
    expect(document.activeElement).toBe(dialog.querySelector('.close'));
    expect(document.body.style.overflow).toBe('hidden');
    dialog.click(); await fixture.whenStable(); expect(dialog.open).toBe(true);
    const cancel = new Event('cancel', { cancelable: true }); dialog.dispatchEvent(cancel);
    await fixture.whenStable();
    expect(cancel.defaultPrevented).toBe(true); expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener); expect(document.body.style.overflow).toBe('auto');
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it('presents queued rewards with persistent text while sound and motion are disabled', async () => {
    const feedback = TestBed.inject(ProgressFeedback);
    feedback.toggleSound(); feedback.toggleMotion(); feedback.toggleEffects();
    const fixture = TestBed.createComponent(RewardDialog);
    await fixture.whenStable();
    const queue = TestBed.inject(RewardNotifications);
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    mockDialog(dialog);
    const before = createMockSnapshot(), after = structuredClone(before);
    after.unlockedAuras = ['aurora', 'moss-spirit'];
    queue.earnedActivity(before, after, false); await fixture.whenStable();
    expect(dialog.textContent).toContain('Nordlicht'); expect(dialog.textContent).toContain('Noch 1 weitere Belohnung');
    expect(dialog.classList.contains('motion')).toBe(false); expect(dialog.classList.contains('effects')).toBe(false);
    expect(dialog.querySelector('a')!.getAttribute('href')).toBe('/character/create#aura-rewards');
    dialog.querySelector<HTMLButtonElement>('.primary')!.click(); await fixture.whenStable();
    expect(dialog.textContent).toContain('Moosseele'); expect(dialog.open).toBe(true);
    expect(audio.play).not.toHaveBeenCalled();
    queue.clear(); await fixture.whenStable();
    expect(dialog.open).toBe(false); expect(dialog.textContent).not.toContain('Moosseele');
    expect(document.activeElement).toBe(opener);
  });

  it('releases the modal and body lock when destroyed while a reward is visible', async () => {
    const fixture = TestBed.createComponent(RewardDialog);
    await fixture.whenStable();
    mockDialog(fixture.nativeElement.querySelector('dialog'));
    earnBoss(); await fixture.whenStable();
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    expect(document.body.style.overflow).toBe(''); expect(document.activeElement).toBe(opener);
  });

  it('waits for an activity form to close and drops a pending popup on account reset', async () => {
    const form = document.createElement('dialog'); form.setAttribute('open', ''); document.body.append(form);
    try {
      const fixture = TestBed.createComponent(RewardDialog);
      await fixture.whenStable();
      const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
      mockDialog(dialog);
      earnBoss(); await fixture.whenStable();
      expect(dialog.open).toBe(false); expect(audio.play).not.toHaveBeenCalled();
      TestBed.inject(RewardNotifications).clear(); await fixture.whenStable();
      form.removeAttribute('open'); form.dispatchEvent(new Event('close')); await fixture.whenStable();
      expect(dialog.open).toBe(false);
      form.setAttribute('open', ''); earnBoss(); await fixture.whenStable();
      expect(dialog.open).toBe(false);
      form.removeAttribute('open'); opener.focus(); form.dispatchEvent(new Event('close')); await fixture.whenStable();
      expect(dialog.open).toBe(true); expect(document.activeElement).toBe(dialog.querySelector('.close'));
      TestBed.inject(RewardNotifications).dismiss(); await fixture.whenStable();
      expect(document.activeElement).toBe(opener);
    } finally { form.remove(); }
  });
  it('shows the female form and collection image captured by the accepted reward', async () => {
    const fixture = TestBed.createComponent(RewardDialog);
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    mockDialog(dialog); earnBoss('female'); await fixture.whenStable();
    expect(dialog.querySelector('#reward-title')!.textContent).toBe('Waldkrone · Jade-Seitenzopf');
    expect(dialog.querySelector('.rarity')!.textContent).toContain('Weibliche Ausführung');
    expect(dialog.querySelector('app-boss-loot-art img')!.getAttribute('src')).toBe('/art/loot/moss-crown-female-v1.webp');
    expect(dialog.querySelector('a')!.getAttribute('href')).toBe('/character/create#boss-loot');
    expect(TestBed.inject(RewardNotifications).current()?.boss?.id).toBe('moss-crown');
  });

});
