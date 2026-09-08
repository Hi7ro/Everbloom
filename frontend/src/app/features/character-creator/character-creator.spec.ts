import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { createMockSnapshot } from '../../data/mock-data';
import { GameSnapshot } from '../../domain/models';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { CharacterCreator } from './character-creator';

describe('character creator flow', () => {
  const snapshot = signal<GameSnapshot | null>(null);
  const error = signal('');
  const busy = signal(false);
  const configured = signal(true);
  const profileIsSaved = signal(false);
  const routeSnapshot = { queryParamMap: convertToParamMap({}) };
  const updateCharacter = vi.fn().mockResolvedValue(true);
  const load = vi.fn(async () => snapshot.set(createMockSnapshot()));

  beforeEach(async () => {
    snapshot.set(createMockSnapshot());
    error.set('');
    busy.set(false);
    configured.set(true);
    profileIsSaved.set(false);
    routeSnapshot.queryParamMap = convertToParamMap({});
    updateCharacter.mockReset().mockResolvedValue(true);
    load.mockClear();
    await TestBed.configureTestingModule({
      imports: [CharacterCreator],
      providers: [
        provideRouter([]),
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
            level: signal({ level: 12 }),
            avatarInterest: signal('adventurer'),
          },
        },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('previews a form edit immediately, saves a normalized profile, and returns to the dashboard', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    fixture.componentInstance.setArtwork('custom');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const original = structuredClone(snapshot());
    const name = root.querySelector<HTMLInputElement>('#character-name')!;
    name.value = '  Noé Moon  ';
    name.dispatchEvent(new Event('input'));
    // RadioControlValueAccessor owns the bound value; select by the visible option label.
    const outfit = Array.from(root.querySelectorAll('label.style-choice')).find(
      (label) => label.querySelector('strong')?.textContent === 'Abyssal',
    )!;
    const aura = Array.from(root.querySelectorAll('.aura-choices label')).find(
      (label) => label.textContent?.trim() === 'Blütenzauber',
    )!;
    outfit.querySelector<HTMLInputElement>('input')!.click();
    aura.querySelector<HTMLInputElement>('input')!.click();
    await fixture.whenStable();
    expect(root.querySelector('app-chibi [data-slot="outfit"]')!.getAttribute('data-variant')).toBe(
      'abyssal',
    );
    expect(root.querySelector('app-chibi [data-slot="aura"]')!.getAttribute('data-variant')).toBe(
      'rose',
    );
    expect(snapshot()).toEqual(original);
    expect(load).not.toHaveBeenCalled();
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(updateCharacter).toHaveBeenCalledExactlyOnceWith({
      name: 'Noé Moon',
      appearance: { ...original!.character.appearance, artwork: 'custom', outfit: 'abyssal', aura: 'rose' },
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
    fixture.componentInstance.choose('hair', 'm-topknot');
    await fixture.componentInstance.save();
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.appearance.hair).toBe('m-topknot');
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
    fixture.componentInstance.choose('body', 'compact');
    fixture.componentInstance.cancel();
    expect(updateCharacter).not.toHaveBeenCalled();
    expect(snapshot()).toEqual(original);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
  it('previews level and interest without changing or saving the actual profile and XP', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    fixture.componentInstance.setArtwork('custom');
    await fixture.whenStable();
    const before = structuredClone(snapshot());
    const root = fixture.nativeElement as HTMLElement;
    const interest = root.querySelector<HTMLSelectElement>('#preview-interest')!;
    interest.value = 'meditation';
    interest.dispatchEvent(new Event('change'));
    const level = root.querySelector<HTMLSelectElement>('#preview-level')!;
    level.selectedIndex = 2;
    level.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.previewInterest()).toBe('meditation');
    expect(fixture.componentInstance.previewLevel()).toBe(30);
    expect(snapshot()).toEqual(before);
    expect(updateCharacter).not.toHaveBeenCalled();
  });
  it('offers six own hairstyles per presentation and remembers each draft choice without changing progress', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    fixture.componentInstance.setArtwork('custom');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const before = structuredClone(snapshot());
    const inputs = () => root.querySelectorAll<HTMLInputElement>('input[name="hair"]');
    expect(inputs()).toHaveLength(6);
    fixture.componentInstance.choose('hair', 'm-undercut');
    const female = Array.from(root.querySelectorAll('.presentation-choices label')).find((label) =>
      label.textContent?.includes('Weiblich'),
    )!;
    female.querySelector<HTMLInputElement>('input')!.click();
    await fixture.whenStable();
    expect(inputs()).toHaveLength(6);
    expect(fixture.componentInstance.draft()?.appearance).toMatchObject({
      presentation: 'female',
      hair: 'f-bob',
    });
    expect(fixture.componentInstance.hairstyles().every((hair) => hair.id.startsWith('f-'))).toBe(
      true,
    );
    fixture.componentInstance.choose('hair', 'f-ponytail');
    fixture.componentInstance.setPresentation('male');
    expect(fixture.componentInstance.draft()?.appearance.hair).toBe('m-undercut');
    fixture.componentInstance.setPresentation('female');
    expect(fixture.componentInstance.draft()?.appearance.hair).toBe('f-ponytail');
    expect(snapshot()).toEqual(before);
    await fixture.componentInstance.save();
    expect(updateCharacter).toHaveBeenCalledWith(
      expect.objectContaining({
        appearance: expect.objectContaining({ presentation: 'female', hair: 'f-ponytail' }),
      }),
    );
  });

  it('starts an older male profile in the original look with only supported controls', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.artwork()).toBe('original');
    expect(root.querySelector('.preview.original-preview')).not.toBeNull();
    expect(root.querySelector('app-character-portrait')).not.toBeNull();
    expect(root.querySelector('input[name="hair"]')).toBeNull();
    expect(root.querySelector('input[name="body"]')).toBeNull();
    expect(root.querySelector('input[name="outfit"]')).toBeNull();
    expect(root.querySelector('input[type="color"]')).toBeNull();
    expect(root.querySelector('#preview-interest')).toBeNull();
    expect(root.querySelector('.motion-toggle')).not.toBeNull();
    expect(root.querySelector('input[name="aura"]')).not.toBeNull();
    fixture.componentInstance.chooseAura('rose');
    expect(fixture.componentInstance.artwork()).toBe('original');
    expect(fixture.componentInstance.draft()?.appearance.artwork).toBeUndefined();
  });

  it('switches the actual look radios and female selection without losing the previous custom look', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const before = structuredClone(snapshot());
    const clickLook = async (labelText: string) => {
      const label = Array.from(root.querySelectorAll('.artwork-choice')).find(
        (label) => label.querySelector('strong')?.textContent === labelText,
      )!;
      label.querySelector<HTMLInputElement>('input')!.click();
      await fixture.whenStable();
    };
    await clickLook('Selbst gestalten');
    expect(root.querySelectorAll('input[name="hair"]')).toHaveLength(6);
    const female = Array.from(root.querySelectorAll('.presentation-choices label')).find(
      (label) => label.textContent?.includes('Weiblich'),
    )!;
    female.querySelector<HTMLInputElement>('input')!.click();
    await fixture.whenStable();
    fixture.componentInstance.choose('hair', 'f-ponytail');
    fixture.componentInstance.choose('outfitColor', '#dfbfc3');
    await clickLook('Illustrierter Look');
    expect(fixture.componentInstance.draft()?.appearance).toMatchObject({ presentation: 'female', artwork: 'original', illustration: 'moonblade' });
    expect(root.querySelector('input[name="hair"]')).toBeNull();
    await clickLook('Selbst gestalten');
    expect(fixture.componentInstance.draft()?.appearance).toMatchObject({
      presentation: 'female', artwork: 'custom', hair: 'f-ponytail', outfitColor: '#dfbfc3',
    });
    expect(snapshot()).toEqual(before);
    await fixture.componentInstance.save();
    expect(updateCharacter).toHaveBeenCalledWith(expect.objectContaining({
      appearance: expect.objectContaining({ presentation: 'female', artwork: 'custom', hair: 'f-ponytail' }),
    }));
  });

  it('chooses real illustrated presets, remembers both presentations, and saves without changing progression', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const before = structuredClone(snapshot());
    const clickPreset = async (name: string) => {
      const label = Array.from(root.querySelectorAll('.illustration-choice')).find(
        (entry) => entry.querySelector('strong')?.textContent === name,
      )!;
      label.querySelector<HTMLInputElement>('input')!.click();
      await fixture.whenStable();
    };
    expect(root.querySelectorAll('.illustration-choice')).toHaveLength(2);
    await clickPreset('Urbaner Abenteurer');
    expect(fixture.componentInstance.selectedIllustration()?.id).toBe('urban-ranger');
    fixture.componentInstance.setPresentation('female');
    await fixture.whenStable();
    expect(fixture.componentInstance.artwork()).toBe('original');
    expect(root.querySelectorAll('.illustration-choice')).toHaveLength(2);
    expect(root.querySelector('input[name="hair"]')).toBeNull();
    await clickPreset('Sternenweberin');
    fixture.componentInstance.setPresentation('male');
    expect(fixture.componentInstance.selectedIllustration()?.id).toBe('urban-ranger');
    fixture.componentInstance.setPresentation('female');
    expect(fixture.componentInstance.selectedIllustration()?.id).toBe('starweaver');
    fixture.componentInstance.chooseAura('void');
    expect(snapshot()).toEqual(before);
    await fixture.componentInstance.save();
    expect(updateCharacter).toHaveBeenCalledWith(expect.objectContaining({
      appearance: expect.objectContaining({
        presentation: 'female', artwork: 'original', illustration: 'starweaver', aura: 'void',
      }),
    }));
  });

  it('keeps an older female profile in its existing custom mode', async () => {
    snapshot.update((current) => current ? {
      ...current, character: { ...current.character, appearance: {
        ...current.character.appearance, presentation: 'female', hair: 'f-braid',
      } },
    } : current);
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    expect(fixture.componentInstance.artwork()).toBe('custom');
    expect(fixture.nativeElement.querySelectorAll('input[name="hair"]')).toHaveLength(6);
    fixture.componentInstance.setPresentation('male');
    expect(fixture.componentInstance.artwork()).toBe('custom');
  });

  it('returns a first successful profile to onboarding before preferences are configured', async () => {
    configured.set(false);
    updateCharacter.mockImplementationOnce(async () => { profileIsSaved.set(true); return true; });
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
