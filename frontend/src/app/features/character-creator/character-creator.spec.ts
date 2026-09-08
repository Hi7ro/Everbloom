import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { createMockSnapshot } from '../../data/mock-data';
import { GameSnapshot } from '../../domain/models';
import { GameStore } from '../../state/game.store';
import { CharacterCreator } from './character-creator';

describe('character creator flow', () => {
  const snapshot = signal<GameSnapshot | null>(null);
  const error = signal('');
  const busy = signal(false);
  const updateCharacter = vi.fn().mockResolvedValue(true);
  const load = vi.fn(async () => snapshot.set(createMockSnapshot()));

  beforeEach(async () => {
    snapshot.set(createMockSnapshot());
    error.set('');
    busy.set(false);
    updateCharacter.mockReset().mockResolvedValue(true);
    load.mockClear();
    await TestBed.configureTestingModule({
      imports: [CharacterCreator],
      providers: [
        provideRouter([]),
        {
          provide: GameStore,
          useValue: {
            snapshot,
            error,
            busy,
            updateCharacter,
            load,
            profileIsSaved: signal(false),
          },
        },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('previews a form edit immediately, saves a normalized profile, and returns to the dashboard', async () => {
    const fixture = TestBed.createComponent(CharacterCreator);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const original = structuredClone(snapshot());
    const name = root.querySelector<HTMLInputElement>('#character-name')!;
    name.value = '  Noé Moon  ';
    name.dispatchEvent(new Event('input'));
    // RadioControlValueAccessor owns the bound value; select by the visible option label.
    const outfit = Array.from(root.querySelectorAll('label.style-choice'))
      .find((label) => label.querySelector('strong')?.textContent === 'Abyssal')!;
    const aura = Array.from(root.querySelectorAll('.aura-choices label'))
      .find((label) => label.textContent?.trim() === 'Blütenzauber')!;
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
      appearance: { ...original!.character.appearance, outfit: 'abyssal', aura: 'rose' },
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
    fixture.componentInstance.choose('hair', 'braid');
    await fixture.componentInstance.save();
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.appearance.hair).toBe('braid');
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
});
