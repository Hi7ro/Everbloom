import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CharacterPortrait } from '../../shared/character-portrait';
import { GAME_REPOSITORY } from '../../data/game.repository';
import { MockGameRepository } from '../../data/mock-game.repository';
import { Dashboard } from './dashboard';
import { DailyCareStore } from '../../state/daily-care.store';
import { JourneyStore } from '../../state/journey.store';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { provideRouter } from '@angular/router';
import { GAME_DAY_CLOCK } from '../../data/game-clock';

describe('Dashboard activity flow', () => {
  let day = '2026-09-08';
  beforeEach(async () => {
    day = '2026-09-08';
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: GAME_DAY_CLOCK, useValue: () => day },
        { provide: GAME_REPOSITORY, useClass: MockGameRepository },
        { provide: BROWSER_STORAGE, useValue: null },
      ],
    }).compileComponents();
  });
  it('connects the actual form to XP, quests and boss state', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    // jsdom has no native dialog methods; only that browser boundary is stubbed.
    const dialog = root.querySelector('dialog')!;
    dialog.showModal = vi.fn();
    dialog.close = vi.fn();
    root.querySelector<HTMLButtonElement>('.page-heading .primary')!.click();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    const select = dialog.querySelector('select')!;
    select.value = 'meditation';
    select.dispatchEvent(new Event('change'));
    const input = dialog.querySelector('input')!;
    input.value = '10';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    dialog
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.store.snapshot()?.character.totalXp).toBe(25986);
    expect(root.querySelector('#quests')?.textContent).toContain('1 / 3');
    expect(root.querySelector('#boss progress')?.getAttribute('value')).toBe('1400');
    expect(root.querySelector('.feedback')?.textContent).toContain('+60 XP');
    expect(root.querySelector('.avatar-message')?.textContent).toContain('Ein ruhiger Moment');
    expect(
      root
        .querySelector('app-character-portrait .illustrated-portrait')
        ?.getAttribute('data-gesture'),
    ).toBe('idle');
    expect(
      root.querySelector('app-character-portrait .original-figure image')?.getAttribute('href'),
    ).toBe('/art/characters/emerald-knight-original.png');
    expect(dialog.close).toHaveBeenCalledOnce();
  });
  it('keeps invalid input in the form and does not award XP', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    fixture.componentInstance.minutes.set(1.5);
    await fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(fixture.componentInstance.store.snapshot()?.character.totalXp).toBe(25926);
    expect(fixture.nativeElement.querySelector('#activity-error').textContent).toContain(
      'ganze Minuten',
    );
  });
  it('prefills a recommended real activity without recording it and adapts to a rest day', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const dialog = root.querySelector<HTMLDialogElement>('dialog[aria-labelledby="activity-title"]')!;
    dialog.showModal = vi.fn();
    const before = structuredClone(component.store.snapshot());
    const recommendation = component.adventure()!.recommendations[0];
    root.querySelector<HTMLButtonElement>('.recommendation')!.click();
    await fixture.whenStable();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(component.selectedSkill()).toBe(recommendation.skillId);
    expect(component.minutes()).toBe(recommendation.minutes);
    expect(component.store.snapshot()).toEqual(before);
    component.care.save('rest', 'low');
    await fixture.whenStable();
    expect(root.querySelector('.next-step')?.textContent).toContain('Heute darf es sanft sein');
    expect(component.adventure()!.recommendations.every(step => ['recovery', 'meditation', 'breathwork'].includes(step.skillId))).toBe(true);
    expect(component.store.snapshot()).toEqual(before);
  });
  it('updates rest-day presence while preserving the illustrated character layers and all game progress', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const store = fixture.componentInstance.store;
    const character = store.snapshot()!.character;
    await store.updateCharacter({
      name: character.name,
      appearance: {
        ...character.appearance,
        artwork: 'original',
        illustratedHair: 'frost-scholar',
        outfitSet: 'urban-ranger',
        skinTone: '#68442f',
      },
    });
    await fixture.whenStable();
    const before = structuredClone(store.snapshot());
    const root = fixture.nativeElement as HTMLElement;
    const portrait = fixture.debugElement.query(By.directive(CharacterPortrait))
      .componentInstance as CharacterPortrait;
    const outfit = root.querySelector('[data-layer="outfit"] image');
    const hair = root.querySelector('[data-layer="hair"] image');
    const care = TestBed.inject(DailyCareStore);
    care.save('rest', 'low');
    await fixture.whenStable();
    expect(portrait.interest()).toBe('recovery');
    expect(root.querySelector('.illustrated-portrait')?.getAttribute('data-gesture')).toBe('idle');
    expect(root.querySelector('.illustrated-portrait')?.getAttribute('data-renderer')).toBe(
      'layered',
    );
    expect(root.querySelector('[data-layer="outfit"] image')).toBe(outfit);
    expect(root.querySelector('[data-layer="hair"] image')).toBe(hair);
    expect(outfit?.getAttribute('href')).toBe('/art/characters/urban-ranger-sheet.png');
    expect(hair?.getAttribute('href')).toBe('/art/characters/frost-scholar-sheet.png');
    expect(root.querySelector('app-chibi')).toBeNull();
    expect(fixture.nativeElement.querySelector('.avatar-message').textContent).toContain(
      'Heute hat Ruhe Platz',
    );
    expect(fixture.componentInstance.store.snapshot()).toEqual(before);
    care.skip();
    await fixture.whenStable();
    expect(fixture.componentInstance.store.snapshot()).toEqual(before);
    expect(fixture.componentInstance.avatarInterest()).toBe('adventurer');
  });

  it('shows the four familiar focus skills by default and toggles all fourteen without changing progress', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const before = structuredClone(fixture.componentInstance.store.snapshot());
    const cards = () => root.querySelectorAll('#skill-list .skill-card');
    const toggle = root.querySelector<HTMLButtonElement>(
      '#skills button[aria-controls="skill-list"]',
    )!;
    expect(TestBed.inject(JourneyStore).configured()).toBe(false);
    expect(fixture.componentInstance.avatarInterest()).toBe('adventurer');
    expect(cards()).toHaveLength(4);
    expect(
      Array.from(root.querySelectorAll('#skill-list h3'), (heading) => heading.textContent?.trim()),
    ).toEqual(['Calisthenics', 'Running', 'Meditation', 'Programming']);
    expect(toggle.textContent).toContain('Alle 14 ansehen');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(cards()).toHaveLength(14);
    expect(root.querySelector('#skill-list')?.textContent).toContain('Boxing');
    expect(root.querySelector('#skill-list')?.textContent).toContain('Reading');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await fixture.whenStable();
    expect(cards()).toHaveLength(4);
    expect(fixture.componentInstance.store.snapshot()).toEqual(before);
  });

  it('uses selected focus order on the dashboard and defaults the activity dialog to its first skill', async () => {
    const journey = TestBed.inject(JourneyStore);
    journey.save({
      interestIds: ['knowledge', 'mind'],
      activeSkillIds: ['reading', 'meditation'],
      primaryInterestId: 'knowledge',
    });
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(
      Array.from(root.querySelectorAll('#skill-list h3'), (heading) => heading.textContent?.trim()),
    ).toEqual(['Reading', 'Meditation']);
    expect(fixture.componentInstance.avatarInterest()).toBe('reading');
    const dialog = root.querySelector('dialog')!;
    dialog.showModal = vi.fn();
    root.querySelector<HTMLButtonElement>('.page-heading .primary')!.click();
    await fixture.whenStable();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.selectedSkill()).toBe('reading');
    expect(dialog.querySelector('select')?.value).toBe('reading');
    expect(dialog.querySelectorAll('select option')).toHaveLength(14);
    fixture.componentInstance.openActivity('boxing', 15);
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedSkill()).toBe('boxing');
    expect(dialog.querySelector('select')?.value).toBe('boxing');
    expect(fixture.componentInstance.visibleSkills().map((skill) => skill.id)).toEqual([
      'reading',
      'meditation',
    ]);
  });

  it('requires explicit reset confirmation and retains progress when the dialog is cancelled', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    await component.store.record('meditation', 10);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const dialog = root.querySelector<HTMLDialogElement>('dialog[aria-labelledby="reset-title"]')!;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    const before = structuredClone(component.store.snapshot());
    const reset = vi.spyOn(TestBed.inject(GAME_REPOSITORY), 'resetDemo');
    const trigger = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('Spielstand zurücksetzen'),
    )!;
    trigger.click();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(reset).not.toHaveBeenCalled();
    expect(component.store.snapshot()).toEqual(before);
    expect(dialog.textContent).toContain('Aktivitäten, Fortschritte und verdienten Auren');
    const cancel = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === 'Abbrechen',
    )!;
    cancel.click();
    await fixture.whenStable();
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(reset).not.toHaveBeenCalled();
    expect(component.store.snapshot()).toEqual(before);
  });

  it('resets progress and earned auras after confirmation while retaining the chosen identity', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    await component.store.record('calisthenics', 90);
    await component.store.record('programming', 90);
    await component.store.record('running', 60);
    await component.store.record('meditation', 4);
    await component.store.updateCharacter({
      name: 'Ari Moon',
      appearance: {
        ...component.store.snapshot()!.character.appearance,
        aura: 'moss-spirit',
        outfitSet: 'forest-scout',
      },
    });
    expect(component.store.snapshot()!.unlockedAuras).toEqual(['moss-spirit']);
    const root = fixture.nativeElement as HTMLElement;
    const dialog = root.querySelector<HTMLDialogElement>('dialog[aria-labelledby="reset-title"]')!;
    dialog.showModal = vi.fn();
    dialog.close = vi.fn();
    component.openReset();
    dialog.querySelector<HTMLButtonElement>('.primary')!.click();
    await fixture.whenStable();
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(component.store.snapshot()!.character).toMatchObject({
      name: 'Ari Moon',
      totalXp: 25926,
      appearance: { aura: 'none', outfitSet: 'forest-scout' },
    });
    expect(component.store.snapshot()!.activities).toEqual([]);
    expect(component.store.snapshot()!.unlockedAuras).toEqual([]);
    expect(component.store.snapshot()!.boss.hp).toBe(1460);
    expect(root.querySelector('app-aura-collection .count')?.textContent).toContain('0 / 3');
    expect(root.querySelector('.feedback')?.textContent).toContain('zurückgesetzt');
  });

  it('keeps the reset dialog and previous progress when resetting fails', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    await component.store.record('running', 10);
    const before = structuredClone(component.store.snapshot());
    vi.spyOn(TestBed.inject(GAME_REPOSITORY), 'resetDemo').mockRejectedValueOnce(
      new Error('Der Spielstand konnte nicht zurückgesetzt werden.'),
    );
    const root = fixture.nativeElement as HTMLElement;
    const dialog = root.querySelector<HTMLDialogElement>('dialog[aria-labelledby="reset-title"]')!;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    component.openReset();
    await component.confirmReset();
    await fixture.whenStable();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('[role="alert"]')?.textContent).toContain('nicht zurückgesetzt');
    expect(component.store.snapshot()).toEqual(before);
    expect(dialog.querySelector<HTMLButtonElement>('.primary')!.disabled).toBe(false);
  });

  it('shows storage warnings and keeps a failed activity visible and retryable without awarding XP', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const dialog = root.querySelector<HTMLDialogElement>(
      'dialog[aria-labelledby="activity-title"]',
    )!;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    const before = structuredClone(component.store.snapshot());
    vi.spyOn(TestBed.inject(GAME_REPOSITORY), 'record').mockRejectedValueOnce(
      new Error('Speichern fehlgeschlagen. Bitte erneut versuchen.'),
    );
    component.openActivity('running', 10);
    dialog
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(root.querySelector('app-progress-storage-note .warning')?.textContent).toContain(
      'Sitzung',
    );
    expect(dialog.querySelector('#activity-error')?.textContent).toContain(
      'Speichern fehlgeschlagen',
    );
    expect(dialog.open).toBe(true);
    expect(dialog.close).not.toHaveBeenCalled();
    expect(component.store.snapshot()).toEqual(before);
    expect(component.minutes()).toBe(10);
    component.showAllSkills.set(true);
    await fixture.whenStable();
    expect(dialog.querySelector('#activity-error')?.textContent).toContain(
      'Speichern fehlgeschlagen',
    );
    dialog
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(component.store.error()).toBe('');
    expect(component.store.snapshot()!.character.totalXp).toBe(before!.character.totalXp + 30);
  });
});
