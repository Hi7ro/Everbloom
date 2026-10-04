import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CharacterAura } from '../../shared/character-aura';
import { CharacterPortrait } from '../../shared/character-portrait';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { createMockSnapshot } from '../../data/mock-data';
import { GameSnapshot } from '../../domain/models';
import { AURA_REWARDS, hasAuraAccess } from '../../domain/aura-rewards';
import { ProgressPersistenceStatus } from '../../data/game-progress.storage';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { CharacterCreator } from './character-creator';

describe('character creator flow', () => {
  const snapshot = signal<GameSnapshot | null>(null);
  const error = signal('');
  const busy = signal(false);
  const persistence = signal<ProgressPersistenceStatus>({ state: 'saved', message: null });
  const configured = signal(true);
  const profileIsSaved = signal(false);
  const routeSnapshot = { queryParamMap: convertToParamMap({}), fragment: null as string | null };
  const updateCharacter = vi.fn().mockResolvedValue(true);
  const load = vi.fn(async () => snapshot.set(createMockSnapshot()));

  beforeEach(async () => {
    snapshot.set(createMockSnapshot());
    error.set('');
    busy.set(false);
    persistence.set({ state: 'saved', message: null });
    configured.set(true);
    profileIsSaved.set(false);
    routeSnapshot.queryParamMap = convertToParamMap({});
    routeSnapshot.fragment = null;
    updateCharacter.mockReset().mockResolvedValue(true);
    load.mockClear();
    await TestBed.configureTestingModule({
      imports: [CharacterCreator],
      providers: [
        provideRouter([]),
        { provide: BROWSER_STORAGE, useValue: null },
        { provide: ActivatedRoute, useValue: { snapshot: routeSnapshot } },
        { provide: JourneyStore, useValue: { configured } },
        {
          provide: GameStore,
          useValue: {
            snapshot,
            error,
            busy,
            updateCharacter,
            load,
            profileIsSaved,
            persistence,
            ownedAuras: computed(() =>
              AURA_REWARDS.filter((aura) => snapshot()?.unlockedAuras.includes(aura.id)),
            ),
            canEquipAura: (id: string) => !!snapshot() && hasAuraAccess(snapshot()!, id),
            level: signal({ level: 12 }),
            avatarInterest: signal('adventurer'),
          },
        },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('groups editing without losing unsaved choices and reveals invalid identity before saving', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance;
    expect(root.querySelector<HTMLElement>('#creator-stage-1')!.hidden).toBe(false);
    root.querySelector<HTMLButtonElement>('[aria-controls="creator-stage-2"]')!.click();
    await fixture.whenStable();
    expect(root.querySelector<HTMLElement>('#creator-stage-1')!.hidden).toBe(true);
    expect(root.querySelector<HTMLElement>('#creator-stage-2')!.hidden).toBe(false);
    component.chooseModule('outfitSet', 'urban-ranger');
    root.querySelector<HTMLButtonElement>('[aria-controls="creator-stage-3"]')!.click();
    await fixture.whenStable();
    expect(component.draft()!.appearance.outfitSet).toBe('urban-ranger');
    component.setName('A');
    await component.save();
    await fixture.whenStable();
    expect(root.querySelector<HTMLElement>('#creator-stage-1')!.hidden).toBe(false);
    expect(updateCharacter).not.toHaveBeenCalled();
    expect(root.querySelector('#profile-form-error')!.textContent).toContain('2–24');
  });

  it('opens the aura group for the existing collection deep link', async () => {
    routeSnapshot.fragment = 'aura-rewards';
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector<HTMLElement>('#creator-stage-3')!.hidden).toBe(false);
    expect(root.querySelector<HTMLElement>('#creator-stage-1')!.hidden).toBe(true);
    expect(updateCharacter).not.toHaveBeenCalled();
  });

  it('previews independent module and color edits, saves a normalized profile and returns to the dashboard', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const original = structuredClone(snapshot());
    const name = root.querySelector<HTMLInputElement>('#character-name')!;
    name.value = '  Noé Moon  ';
    name.dispatchEvent(new Event('input'));
    const outfit = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.outfit-field button'),
    ).find((button) => button.textContent?.includes('Obsidianrüstung'))!;
    outfit.click();
    const hair = Array.from(root.querySelectorAll<HTMLButtonElement>('.hair-field button')).find(
      (button) => button.textContent?.includes('Aschblaue Curtains'),
    )!;
    hair.click();
    root.querySelector<HTMLButtonElement>('button[aria-label="Augenfarbe: Blau"]')!.click();
    const aura = Array.from(root.querySelectorAll('.aura-choices label')).find((label) =>
      label.textContent?.includes('Blütenzauber'),
    )!;
    aura.querySelector<HTMLInputElement>('input')!.click();
    await fixture.whenStable();
    const preview = fixture.debugElement.query(By.css('.preview app-character-portrait'))
      .componentInstance as CharacterPortrait;
    expect(preview.appearance()).toBe(fixture.componentInstance.draft()!.appearance);
    expect(preview.appearance()).toMatchObject({
      artwork: 'original',
      illustratedHair: 'frost-scholar',
      outfitSet: 'abyss-walker',
      eyeColor: '#5e92c7',
      aura: 'rose',
    });
    expect(root.querySelector('app-chibi')).toBeNull();
    expect(snapshot()).toEqual(original);
    expect(load).not.toHaveBeenCalled();
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(updateCharacter).toHaveBeenCalledExactlyOnceWith({
      name: 'Noé Moon',
      appearance: {
        ...original!.character.appearance,
        artwork: 'original',
        illustratedHair: 'frost-scholar',
        outfitSet: 'abyss-walker',
        eyeColor: '#5e92c7',
        aura: 'rose',
      },
    });
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('keeps invalid input in the creator without saving or navigating', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    fixture.componentInstance.setName('A');
    await fixture.componentInstance.save();
    await fixture.whenStable();
    expect(updateCharacter).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#profile-form-error').textContent).toContain(
      '2–24',
    );
  });

  it('retains the draft after a failed save and permits a retry', async () => {
    updateCharacter.mockImplementationOnce(async () => {
      error.set('Speichern fehlgeschlagen.');
      return false;
    });
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    fixture.componentInstance.chooseModule('illustratedHair', 'forest-scout');
    await fixture.componentInstance.save();
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.appearance.illustratedHair).toBe('forest-scout');
    expect(fixture.nativeElement.textContent).toContain('Deine Auswahl bleibt erhalten');
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    await fixture.componentInstance.save();
    expect(updateCharacter).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('loads a missing profile and cancels without saving draft changes', async () => {
    snapshot.set(null);
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    expect(load).toHaveBeenCalledOnce();
    const original = structuredClone(snapshot());
    fixture.componentInstance.chooseModule('outfitSet', 'forest-scout');
    fixture.componentInstance.cancel();
    expect(updateCharacter).not.toHaveBeenCalled();
    expect(snapshot()).toEqual(original);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('offers only six illustrated presets, hair variants and outfit sets per presentation', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    for (const presentation of ['male', 'female'] as const) {
      fixture.componentInstance.setPresentation(presentation);
      await fixture.whenStable();
      expect(root.querySelectorAll('.illustration-choice')).toHaveLength(6);
      expect(root.querySelectorAll('.hair-field button')).toHaveLength(6);
      expect(root.querySelectorAll('.outfit-field button')).toHaveLength(6);
      for (const child of fixture.debugElement.queryAll(
        By.css('.illustration-thumbnail app-character-portrait'),
      )) {
        const portrait = child.componentInstance as CharacterPortrait;
        expect(portrait.animated()).toBe(false);
        expect(portrait.appearance().presentation).toBe(presentation);
        expect(portrait.appearance().artwork).toBe('original');
      }
    }
    expect(root.textContent).not.toContain('Selbst gestalten');
    expect(root.querySelector('input[name="body"]')).toBeNull();
    expect(root.querySelector('input[name="hair"]')).toBeNull();
    expect(root.querySelector('input[name="outfit"]')).toBeNull();
    expect(root.querySelector('input[type="color"]')).toBeNull();
    expect(root.querySelector('#preview-interest')).toBeNull();
    expect(root.querySelector('app-chibi')).toBeNull();
    expect(root.querySelector('#outfit-note')?.textContent).toContain('vollständiges Set');
  });

  it('remembers both presentations with independent hair, outfits and colors', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const before = structuredClone(snapshot());
    component.chooseModule('illustratedHair', 'frost-scholar');
    component.chooseModule('outfitSet', 'abyss-walker');
    component.chooseColor('hairTint', '#d5dbe0');
    const male = structuredClone(component.draft()!.appearance);
    component.setPresentation('female');
    component.chooseModule('illustratedHair', 'rose-runner');
    component.chooseModule('outfitSet', 'starweaver');
    component.chooseColor('skinTone', '#68442f');
    const female = structuredClone(component.draft()!.appearance);
    expect(female).toMatchObject({
      presentation: 'female',
      hair: 'f-bob',
      illustration: 'moonblade',
      illustratedHair: 'rose-runner',
      outfitSet: 'starweaver',
    });
    expect(female).not.toHaveProperty('hairTint');
    component.setPresentation('male');
    expect(component.draft()!.appearance).toEqual(male);
    component.setPresentation('female');
    expect(component.draft()!.appearance).toEqual(female);
    expect(snapshot()).toEqual(before);
    await component.save();
    expect(updateCharacter).toHaveBeenCalledWith(expect.objectContaining({ appearance: female }));
  });

  it('choosing a preset resets only illustrated modules and colors, including a repeated selection', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.setName('Ari Moon');
    component.chooseAura('void');
    const root = fixture.nativeElement as HTMLElement;
    const selectUrban = () =>
      root
        .querySelector<HTMLButtonElement>('[aria-label="Urbaner Abenteurer als Vorlage wählen"]')!
        .click();
    for (let selection = 0; selection < 2; selection++) {
      component.chooseModule('illustratedHair', 'forest-scout');
      component.chooseModule('outfitSet', 'abyss-walker');
      component.chooseColor('hairTint', '#9478bc');
      component.chooseColor('eyeColor', '#5f9e6e');
      component.chooseColor('skinTone', '#68442f');
      selectUrban();
      await fixture.whenStable();
      const profile = component.draft()!;
      expect(profile).toMatchObject({
        name: 'Ari Moon',
        appearance: { artwork: 'original', illustration: 'urban-ranger', aura: 'void' },
      });
      for (const slot of ['illustratedHair', 'outfitSet', 'eyeColor', 'skinTone', 'hairTint'])
        expect(profile.appearance).not.toHaveProperty(slot);
      expect(component.selectedHair()).toBe('urban-ranger');
      expect(component.selectedOutfit()).toBe('urban-ranger');
    }
  });

  it('offers original plus six palette colors and clears only the chosen color on reset', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.color-field')).toHaveLength(3);
    for (const field of root.querySelectorAll('.color-field'))
      expect(field.querySelectorAll('button')).toHaveLength(7);
    root.querySelector<HTMLButtonElement>('[aria-label="Augenfarbe: Blau"]')!.click();
    root.querySelector<HTMLButtonElement>('[aria-label="Hautton: Tiefbraun"]')!.click();
    root.querySelector<HTMLButtonElement>('[aria-label="Haarfarbe: Silber"]')!.click();
    root.querySelector<HTMLButtonElement>('[aria-label="Augenfarbe: Original"]')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.appearance).toMatchObject({
      skinTone: '#422b23',
      hairTint: '#d5dbe0',
    });
    expect(fixture.componentInstance.draft()!.appearance).not.toHaveProperty('eyeColor');
    expect(
      root.querySelector('[aria-label="Augenfarbe: Original"]')?.getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('migrates an older female custom profile in the draft without changing its name or XP', async () => {
    snapshot.update((current) =>
      current
        ? {
            ...current,
            character: {
              ...current.character,
              name: 'Liora',
              appearance: {
                ...current.character.appearance,
                presentation: 'female',
                hair: 'f-braid',
                artwork: 'custom',
              },
            },
          }
        : current,
    );
    const before = structuredClone(snapshot());
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()).toMatchObject({
      name: 'Liora',
      appearance: { presentation: 'female', artwork: 'original', hair: 'f-braid' },
    });
    expect(fixture.componentInstance.selectedIllustration()?.id).toBe('moonblade');
    expect(snapshot()).toEqual(before);
    expect(fixture.nativeElement.querySelector('app-chibi')).toBeNull();
  });

  it('keeps all draft changes blocked during save and changes motion without changing progression', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const profile = structuredClone(component.draft());
    const before = structuredClone(snapshot());
    busy.set(true);
    component.setName('Changed');
    component.setPresentation('female');
    component.chooseModule('outfitSet', 'abyss-walker');
    component.chooseIllustration('urban-ranger');
    component.chooseColor('eyeColor', '#5f9e6e');
    component.chooseAura('void');
    await component.save();
    component.cancel();
    expect(component.draft()).toEqual(profile);
    expect(updateCharacter).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    const motion = component.feedback.motionEnabled();
    fixture.nativeElement.querySelector('.motion-toggle').click();
    await fixture.whenStable();
    expect(component.feedback.motionEnabled()).toBe(!motion);
    expect(snapshot()).toEqual(before);
  });

  it('previews future aura effects and colors without saving them or changing progression', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.chooseAura('rose');
    const before = structuredClone(snapshot());
    const profile = structuredClone(component.draft());
    const root = fixture.nativeElement as HTMLElement;
    const details = root.querySelector<HTMLDetailsElement>('.aura-lab details')!;
    details.open = true;
    await fixture.whenStable();
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.advanced-aura-choices button'),
    );
    expect(buttons).toHaveLength(10);
    buttons.find((button) => button.textContent?.includes('Geistwächter'))!.click();
    await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('[aria-label="Aurafarbe: Gold"]')!.click();
    await fixture.whenStable();
    const aura = fixture.debugElement.query(By.css('.aura-tryout'))
      .componentInstance as CharacterAura;
    const portrait = fixture.debugElement.query(By.css('.preview app-character-portrait'))
      .componentInstance as CharacterPortrait;
    expect(aura.aura()).toBe('guardian');
    expect(aura.color()).toBe('#f1d58e');
    expect(portrait.appearance()).toEqual({ ...profile!.appearance, aura: 'none' });
    expect(component.draft()).toEqual(profile);
    expect(snapshot()).toEqual(before);
    expect(root.querySelector('#aura-preview-note')?.textContent).toContain(
      'Wird nicht gespeichert',
    );
    await component.save();
    expect(updateCharacter).toHaveBeenCalledExactlyOnceWith(profile);
    expect(snapshot()).toEqual(before);
  });

  it('ends the tryout when choosing a real aura, preset, presentation or closing its controls', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const details = fixture.nativeElement.querySelector('.aura-lab details') as HTMLDetailsElement;
    details.open = true;
    await fixture.whenStable();
    const endActions = [
      () => component.chooseAura('sage'),
      () => component.chooseIllustration('urban-ranger'),
      () => component.setPresentation('female'),
      () => component.endAuraPreview(),
      () => {
        details.open = false;
        details.dispatchEvent(new Event('toggle'));
      },
    ];
    for (const end of endActions) {
      component.choosePreviewAura('demonic');
      component.previewFierce.set(true);
      expect(component.previewAppearance()?.aura).toBe('none');
      end();
      expect(component.previewAura()).toBeNull();
      expect(component.previewFierce()).toBe(false);
      expect(component.previewAppearance()).toBe(component.draft()!.appearance);
    }
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.aura-tryout')).toBeNull();
  });

  it('limits preview inputs and passes the motion setting and optional shadow eyes to the effect', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.choosePreviewAura('unreleased');
    expect(component.previewAura()).toBeNull();
    const details = fixture.nativeElement.querySelector('.aura-lab details') as HTMLDetailsElement;
    details.open = true;
    await fixture.whenStable();
    component.choosePreviewAura('demonic');
    const defaultColor = component.previewColor();
    component.choosePreviewColor('url(https://example.org)');
    expect(component.previewColor()).toBe(defaultColor);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('input[name="previewFierce"]').click();
    if (component.feedback.motionEnabled()) component.feedback.toggleMotion();
    await fixture.whenStable();
    const aura = fixture.debugElement.query(By.css('.aura-tryout'))
      .componentInstance as CharacterAura;
    expect(aura.fierce()).toBe(true);
    expect(aura.animated()).toBe(false);
    const profile = structuredClone(component.draft());
    busy.set(true);
    component.choosePreviewAura('angel');
    component.choosePreviewColor('#f1d58e');
    expect(component.previewAura()).toBe('demonic');
    expect(component.previewColor()).toBe(defaultColor);
    expect(component.draft()).toEqual(profile);
  });

  it('returns a first successful profile to onboarding before preferences are configured', async () => {
    configured.set(false);
    updateCharacter.mockImplementationOnce(async () => {
      profileIsSaved.set(true);
      return true;
    });
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    await fixture.componentInstance.save();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/onboarding');
  });

  it('does not reroute an existing profile into onboarding just because preferences are absent', async () => {
    configured.set(false);
    profileIsSaved.set(true);
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    await fixture.componentInstance.save();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('returns save and cancel to the explicitly allowed onboarding destination', async () => {
    routeSnapshot.queryParamMap = convertToParamMap({ returnTo: 'onboarding' });
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    fixture.componentInstance.cancel();
    expect(updateCharacter).not.toHaveBeenCalled();
    await fixture.componentInstance.save();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenLastCalledWith('/onboarding');
  });

  it('keeps locked collection rewards and design previews out of the saved aura selection', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const before = structuredClone(component.draft());
    const game = structuredClone(snapshot());
    const root = fixture.nativeElement as HTMLElement;
    for (const id of ['aurora', 'starlight', 'moss-spirit', 'demonic', 'guardian', 'unknown']) {
      component.chooseAura(id);
      expect(component.draft()).toEqual(before);
    }
    for (const button of root.querySelectorAll<HTMLButtonElement>('app-aura-collection button')) {
      expect(button.disabled).toBe(true);
      button.click();
    }
    expect(component.draft()).toEqual(before);
    expect(snapshot()).toEqual(game);
    expect(updateCharacter).not.toHaveBeenCalled();
  });

  it('selects an owned aura only in the draft and saves it without awarding XP', async () => {
    snapshot.update((current) => ({ ...current!, unlockedAuras: ['moss-spirit'] }));
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const before = structuredClone(snapshot());
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector<HTMLButtonElement>('[aria-label="Moosseele auswählen"]')!;
    expect(button.disabled).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(component.draft()!.appearance.aura).toBe('moss-spirit');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(snapshot()).toEqual(before);
    component.chooseModule('outfitSet', 'urban-ranger');
    expect(component.draft()!.appearance.aura).toBe('moss-spirit');
    await component.save();
    expect(updateCharacter).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        appearance: expect.objectContaining({ aura: 'moss-spirit', outfitSet: 'urban-ranger' }),
      }),
    );
    expect(snapshot()!.character.totalXp).toBe(before!.character.totalXp);
    expect(snapshot()!.unlockedAuras).toEqual(['moss-spirit']);
  });

  it('shows a persistence warning alongside a failed save and retains the editable draft', async () => {
    persistence.set({
      state: 'session',
      message: 'Neue Fortschritte bleiben nur in dieser Sitzung.',
    });
    updateCharacter.mockImplementationOnce(async () => {
      error.set('Diese Aura ist nicht verfügbar.');
      return false;
    });
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.setName('Ari Moon');
    const draft = structuredClone(component.draft());
    await component.save();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-progress-storage-note [role="status"]')?.textContent).toContain(
      'nur in dieser Sitzung',
    );
    expect(root.querySelector('app-progress-storage-note .warning')).not.toBeNull();
    expect(root.textContent).toContain('Diese Aura ist nicht verfügbar.');
    expect(root.textContent).toContain('Deine Auswahl bleibt erhalten');
    expect(component.draft()).toEqual(draft);
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
  });

  it('ignores any other return destination', async () => {
    routeSnapshot.queryParamMap = convertToParamMap({ returnTo: 'https://example.com/redirect' });
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    fixture.componentInstance.cancel();
    await fixture.componentInstance.save();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenLastCalledWith('/dashboard');
  });
});
