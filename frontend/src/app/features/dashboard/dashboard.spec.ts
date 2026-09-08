import { TestBed } from '@angular/core/testing';
import { GAME_REPOSITORY } from '../../data/game.repository';
import { MockGameRepository } from '../../data/mock-game.repository';
import { Dashboard } from './dashboard';
import { DailyCareStore } from '../../state/daily-care.store';
import { JourneyStore } from '../../state/journey.store';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { provideRouter } from '@angular/router';

describe('Dashboard activity flow', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
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
    expect(root.querySelector('app-character-portrait svg')?.getAttribute('data-gesture')).toBe(
      'idle',
    );
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
  it('lets a rest-day check-in change the custom chibi without granting or removing game progress', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const store = fixture.componentInstance.store;
    const character = store.snapshot()!.character;
    await store.updateCharacter({
      name: character.name,
      appearance: { ...character.appearance, artwork: 'custom' },
    });
    await fixture.whenStable();
    const before = structuredClone(store.snapshot());
    const care = TestBed.inject(DailyCareStore);
    care.save('rest', 'low');
    await fixture.whenStable();
    expect(
      fixture.nativeElement
        .querySelector('app-character-portrait app-chibi svg')
        .getAttribute('data-gesture'),
    ).toBe('breathe');
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
});
