import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { GAME_DAY_CLOCK } from '../../data/game-clock';
import { GAME_PROGRESS_KEY } from '../../data/game-progress.storage';
import { GAME_REPOSITORY } from '../../data/game.repository';
import { JOURNEY_PREFERENCES_KEY } from '../../data/journey-preferences.storage';
import { MockGameRepository } from '../../data/mock-game.repository';
import { SKILLS } from '../../domain/catalog';
import { DEFAULT_JOURNEY, INTERESTS, MAX_ACTIVE_SKILLS } from '../../domain/journey';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { ProgressFeedback } from '../../state/progress-feedback';
import { Onboarding } from './onboarding';
import { Component, inject, signal } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';
import { ACCOUNT_MODE } from '../../data/account-mode';
import { ApiClient } from '../../data/api-client';
import { createMockSnapshot } from '../../data/mock-data';
import { AuthStore } from '../../state/auth.store';
import { gameGuard } from '../../state/auth.guard';

describe('mobile journey onboarding', () => {
  let entries: Map<string, string>;
  let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    entries = new Map([
      [GAME_PROGRESS_KEY, JSON.stringify({ version: 1, startDay: '2026-09-08', entries: [] })],
    ]);
    storage = {
      getItem: vi.fn((key: string) => entries.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => entries.set(key, value)),
    };
    await TestBed.configureTestingModule({
      imports: [Onboarding],
      providers: [
        provideRouter([]),
        { provide: GAME_DAY_CLOCK, useValue: () => '2026-09-08' },
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: GAME_REPOSITORY, useClass: MockGameRepository },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  function submit(fixture: ComponentFixture<Onboarding>) {
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return fixture.whenStable();
  }

  function input(
    fixture: ComponentFixture<Onboarding>,
    name: string,
    value: string,
  ): HTMLInputElement {
    return fixture.nativeElement.querySelector(`input[name="${name}"][value="${value}"]`)!;
  }

  function button(fixture: ComponentFixture<Onboarding>, text: string): HTMLButtonElement {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.replace(/\s+/g, ' ').trim() === text)!;
  }

  it('uses native controls through all steps and saves only preferences without granting XP or changing the character', async () => {
    const fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    const store = TestBed.inject(GameStore);
    const journey = TestBed.inject(JourneyStore);
    const before = structuredClone(store.snapshot());
    const reward = vi.spyOn(TestBed.inject(ProgressFeedback), 'celebrate');
    const updateCharacter = vi.spyOn(store, 'updateCharacter');
    expect(fixture.nativeElement.querySelectorAll('input[name="interests"]')).toHaveLength(
      INTERESTS.length,
    );
    input(fixture, 'interests', 'creative').click();
    await fixture.whenStable();
    input(fixture, 'primaryInterest', 'creative').click();
    await fixture.whenStable();
    expect(journey.preferences()).toEqual(DEFAULT_JOURNEY);
    expect(storage.setItem).not.toHaveBeenCalled();
    await submit(fixture);
    expect(fixture.componentInstance.step()).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('input[name="skills"]')).toHaveLength(
      SKILLS.length,
    );
    expect(fixture.nativeElement.querySelector('.quiet-note').textContent).toContain(
      'Die Beispielquests der Demo bleiben unverändert',
    );
    input(fixture, 'skills', 'running').click();
    await fixture.whenStable();
    await submit(fixture);
    expect(fixture.componentInstance.step()).toBe(3);
    expect(fixture.nativeElement.querySelector('#review-name').textContent).toBe(
      before!.character.name,
    );
    expect(fixture.nativeElement.querySelector('app-character-portrait')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Aktivitäten und verdiente Auren bleiben ebenfalls in diesem Browser gespeichert');
    expect(storage.setItem).not.toHaveBeenCalled();
    button(fixture, 'Meine Reise starten ↗').click();
    await fixture.whenStable();
    expect(journey.preferences()).toEqual({
      interestIds: [...DEFAULT_JOURNEY.interestIds, 'creative'],
      primaryInterestId: 'creative',
      activeSkillIds: DEFAULT_JOURNEY.activeSkillIds.filter((id) => id !== 'running'),
    });
    expect(journey.configured()).toBe(true);
    expect(journey.persisted()).toBe(true);
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
      JOURNEY_PREFERENCES_KEY,
      expect.any(String),
    );
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(store.snapshot()).toEqual(before);
    expect(updateCharacter).not.toHaveBeenCalled();
    expect(reward).not.toHaveBeenCalled();
  });

  it('requires an interest and a skill, recovers the primary selection, and retains selections when moving back', async () => {
    const fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    for (const id of DEFAULT_JOURNEY.interestIds) input(fixture, 'interests', id).click();
    await fixture.whenStable();
    await submit(fixture);
    expect(fixture.componentInstance.step()).toBe(1);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Interessenbereich',
    );
    input(fixture, 'interests', 'mind').click();
    await fixture.whenStable();
    expect(input(fixture, 'primaryInterest', 'mind').checked).toBe(true);
    await submit(fixture);
    for (const id of DEFAULT_JOURNEY.activeSkillIds) input(fixture, 'skills', id).click();
    await fixture.whenStable();
    await submit(fixture);
    expect(fixture.componentInstance.step()).toBe(2);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'mindestens einen Skill',
    );
    input(fixture, 'skills', 'meditation').click();
    await fixture.whenStable();
    button(fixture, 'Zurück').click();
    await fixture.whenStable();
    expect(input(fixture, 'interests', 'mind').checked).toBe(true);
    expect(fixture.componentInstance.draft().activeSkillIds).toEqual(['meditation']);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
  });

  it('limits native skill choices to six and makes room again when a chosen skill is removed', async () => {
    const fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    await submit(fixture);
    const unselected = SKILLS.filter((skill) => !DEFAULT_JOURNEY.activeSkillIds.includes(skill.id));
    for (const skill of unselected.slice(
      0,
      MAX_ACTIVE_SKILLS - DEFAULT_JOURNEY.activeSkillIds.length,
    )) {
      input(fixture, 'skills', skill.id).click();
      await fixture.whenStable();
    }
    expect(fixture.componentInstance.draft().activeSkillIds).toHaveLength(MAX_ACTIVE_SKILLS);
    const remaining = SKILLS.find(
      (skill) => !fixture.componentInstance.draft().activeSkillIds.includes(skill.id),
    )!;
    expect(input(fixture, 'skills', remaining.id).disabled).toBe(true);
    input(fixture, 'skills', remaining.id).click();
    expect(fixture.componentInstance.draft().activeSkillIds).not.toContain(remaining.id);
    input(fixture, 'skills', 'calisthenics').click();
    await fixture.whenStable();
    expect(input(fixture, 'skills', remaining.id).disabled).toBe(false);
    input(fixture, 'skills', remaining.id).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.draft().activeSkillIds).toHaveLength(MAX_ACTIVE_SKILLS);
    expect(fixture.componentInstance.draft().activeSkillIds).toContain(remaining.id);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('continues with an explicit session fallback if device storage rejects the final write', async () => {
    storage.setItem.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    const fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    await submit(fixture);
    await submit(fixture);
    await submit(fixture);
    const journey = TestBed.inject(JourneyStore);
    expect(journey.configured()).toBe(true);
    expect(journey.persisted()).toBe(false);
    expect(journey.message()).toContain('für diese Sitzung');
    expect(journey.message()).toContain('beim Neuladen verloren');
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('keeps a failed final selection on the review step, displays the error and permits retry', async () => {
    const fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    await submit(fixture);
    await submit(fixture);
    const save = vi.spyOn(TestBed.inject(JourneyStore), 'save').mockReturnValueOnce(false);
    await submit(fixture);
    expect(fixture.componentInstance.step()).toBe(3);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'nicht übernommen',
    );
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    await submit(fixture);
    expect(save).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('abandons an unfinished setup without persisting changes', async () => {
    const fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    input(fixture, 'interests', 'life').click();
    await fixture.whenStable();
    button(fixture, 'Überspringen').click();
    await fixture.whenStable();
    expect(TestBed.inject(JourneyStore).configured()).toBe(false);
    expect(TestBed.inject(JourneyStore).preferences()).toEqual(DEFAULT_JOURNEY);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('returns from the creator to the same unpersisted review draft and clears it after cancellation', async () => {
    let fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    input(fixture, 'interests', 'life').click();
    await fixture.whenStable();
    await submit(fixture);
    await submit(fixture);
    const draft = structuredClone(fixture.componentInstance.draft());
    const creator = fixture.nativeElement.querySelector(
      'a[href*="/character/create"]',
    ) as HTMLAnchorElement;
    expect(creator.getAttribute('href')).toContain('returnTo=onboarding');
    creator.click();
    await fixture.whenStable();
    fixture.destroy();
    fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    expect(fixture.componentInstance.step()).toBe(3);
    expect(fixture.componentInstance.draft()).toEqual(draft);
    expect(storage.setItem).not.toHaveBeenCalled();
    fixture.componentInstance.cancel();
    fixture.destroy();
    const fresh = TestBed.createComponent(Onboarding);
    await fresh.whenStable();
    expect(fresh.componentInstance.step()).toBe(1);
    expect(fresh.componentInstance.draft()).toEqual(DEFAULT_JOURNEY);
  });

  it('reopens saved preferences as editable settings and preserves them when cancelling', async () => {
    const preferences = {
      interestIds: ['mind'],
      activeSkillIds: ['meditation'],
      primaryInterestId: 'mind',
    };
    entries.set(JOURNEY_PREFERENCES_KEY, JSON.stringify({ version: 1, preferences }));
    const fixture = TestBed.createComponent(Onboarding);
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()).toEqual(preferences);
    input(fixture, 'interests', 'career').click();
    await fixture.whenStable();
    await submit(fixture);
    await submit(fixture);
    expect(button(fixture, 'Auswahl speichern ↗')).toBeDefined();
    button(fixture, 'Abbrechen').click();
    await fixture.whenStable();
    expect(TestBed.inject(JourneyStore).preferences()).toEqual(preferences);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});

@Component({
  template: '@for (quest of store.snapshot()?.quests ?? []; track quest.id) { <p>{{ quest.title }}</p> }',
})
class QuestDestination {
  readonly store = inject(GameStore);
}

@Component({ template: 'Bitte erneut verbinden.' })
class ConnectionDestination {}

describe('account focus changes and the next dashboard board', () => {
  const preferences = {
    interestIds: ['knowledge'],
    primaryInterestId: 'knowledge',
    activeSkillIds: ['reading'],
  };
  let snapshot: ReturnType<typeof createMockSnapshot>;
  let load: ReturnType<typeof vi.fn>;
  let put: ReturnType<typeof vi.fn>;
  let ensureSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    snapshot = createMockSnapshot();
    snapshot.character.createdByPlayer = true;
    load = vi.fn(async () => structuredClone(snapshot));
    put = vi.fn(async () => {
      snapshot.quests = [{
        id: 'daily:2026-09-08:reading',
        title: 'Eine neue Seite entdecken',
        description: '15 Minuten Reading',
        skillId: 'reading',
        targetMinutes: 15,
        progressMinutes: 0,
        bonusXp: 40,
        claimed: false,
      }];
      return preferences;
    });
    ensureSession = vi.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [Onboarding],
      providers: [
        provideRouter([
          { path: 'onboarding', component: Onboarding },
          { path: 'dashboard', component: QuestDestination, canActivate: [gameGuard], data: { needsCharacter: true, needsJourney: true } },
          { path: 'connection', component: ConnectionDestination },
          { path: 'auth', component: ConnectionDestination },
        ]),
        { provide: ACCOUNT_MODE, useValue: true },
        { provide: BROWSER_STORAGE, useValue: null },
        { provide: GAME_DAY_CLOCK, useValue: () => '2026-09-08' },
        { provide: GAME_REPOSITORY, useValue: { load } },
        { provide: ApiClient, useValue: { put, get: vi.fn().mockResolvedValue(preferences) } },
        { provide: AuthStore, useValue: {
          epoch: signal(1),
          user: signal({ id: 'focus-owner' }),
          ensureSession,
          owned: <T>(request: (headers: Record<string, string>) => Promise<T>) => request({}),
        } },
      ],
    }).compileComponents();
  });

  async function review() {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/onboarding', Onboarding);
    await harness.fixture.whenStable();
    page.draft.set(preferences);
    page.step.set(3);
    harness.detectChanges();
    return { harness, page };
  }

  it('finishes saving the focus before the dashboard guard loads and displays the new server quests', async () => {
    const { harness, page } = await review();
    expect(TestBed.inject(GameStore).snapshot()?.quests[0].skillId).toBe('calisthenics');
    await page.finish();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(put).toHaveBeenCalledWith('/api/game/journey', preferences, {});
    expect(load).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(harness.routeNativeElement?.textContent).toContain('Eine neue Seite entdecken');
    expect(harness.routeNativeElement?.textContent).not.toContain('Werde ein Stück stärker');
    expect(TestBed.inject(GameStore).snapshot()?.character.totalXp).toBe(25926);
  });

  it('explains daily rotation and next-day changes in the account skill choice', async () => {
    const { harness, page } = await review();
    page.step.set(2);
    harness.detectChanges();
    const text = harness.routeNativeElement?.querySelector('.quiet-note')?.textContent;
    expect(text).toContain('kostenlosen Tagesquests');
    expect(text).toContain('wechseln sie täglich');
    expect(text).toContain('ab morgen');
    expect(text).not.toContain('Beispielquests');
  });

  it('keeps failed preference writes on the review screen without loading a replacement board', async () => {
    const { harness, page } = await review();
    put.mockRejectedValueOnce(new Error('Deine Auswahl konnte nicht gespeichert werden.'));
    await page.finish();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/onboarding');
    expect(load).toHaveBeenCalledOnce();
    expect(page.saving()).toBe(false);
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain('nicht gespeichert');
  });

  it('uses connection recovery if the saved focus cannot yet be followed by a fresh board', async () => {
    const { page } = await review();
    load.mockRejectedValueOnce(new Error('Verbindung unterbrochen.'));
    await page.finish();
    expect(TestBed.inject(JourneyStore).preferences()).toEqual(preferences);
    expect(TestBed.inject(Router).url).toBe('/connection?returnTo=%2Fdashboard');
    expect(TestBed.inject(GameStore).snapshot()?.quests[0].skillId).toBe('calisthenics');
  });

  it('honors an expired session before requesting the next dashboard board', async () => {
    const { page } = await review();
    ensureSession.mockResolvedValueOnce(false);
    await page.finish();
    expect(TestBed.inject(Router).url).toBe('/auth?returnTo=%2Fdashboard');
    expect(load).toHaveBeenCalledOnce();
  });
});
