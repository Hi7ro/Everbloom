import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { DAY_CLOCK, DailyCareStore } from '../state/daily-care.store';
import { DailyCarePanel } from './daily-care-panel';

describe('daily care panel', () => {
  let fixture: ComponentFixture<DailyCarePanel>;
  let today: string;

  beforeEach(async () => {
    today = '2026-09-08';
    await TestBed.configureTestingModule({
      imports: [DailyCarePanel],
      providers: [
        { provide: BROWSER_STORAGE, useValue: null },
        { provide: DAY_CLOCK, useValue: () => today },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DailyCarePanel);
    fixture.detectChanges();
  });

  function button(text: string): HTMLButtonElement {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((element) => element.textContent?.trim() === text)!;
  }

  function choose(id: string): void {
    const input = fixture.nativeElement.querySelector('#' + id) as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
  }

  it('offers labeled native controls, saves the selection and lets the user edit it', () => {
    const controls = fixture.nativeElement.querySelectorAll(
      'input[type=radio]',
    ) as NodeListOf<HTMLInputElement>;
    expect(controls).toHaveLength(7);
    expect(new Set(Array.from(controls, (control) => control.id)).size).toBe(7);
    expect(Array.from(controls).every((control) => control.labels?.length === 1)).toBe(true);
    choose('daily-care-mode-rest');
    choose('daily-care-energy-low');
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(TestBed.inject(DailyCareStore).checkIn()).toEqual({
      dayKey: today,
      mode: 'rest',
      energy: 'low',
    });
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Ruhetag');
    expect(fixture.nativeElement.textContent).toContain('Energie: Ruhig');
    expect(fixture.nativeElement.textContent).toContain('Nur für diese Sitzung');
    button('Ändern').click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('#daily-care-mode-rest') as HTMLInputElement).checked,
    ).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('#daily-care-energy-low') as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('allows skipping and choosing later without treating a skipped day as a check-in', () => {
    button('Auslassen').click();
    fixture.detectChanges();
    const care = TestBed.inject(DailyCareStore);
    expect(care.skipped()).toBe(true);
    expect(care.checkIn()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Heute ohne Check-in');
    button('Doch auswählen').click();
    fixture.detectChanges();
    expect(care.skipped()).toBe(false);
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });

  it('asks afresh after a local date change and resets yesterday’s draft choices', () => {
    choose('daily-care-mode-focus');
    choose('daily-care-energy-high');
    button('Für heute übernehmen').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Fokus');
    today = '2026-09-09';
    window.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(TestBed.inject(DailyCareStore).checkIn()).toBeNull();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(
      (fixture.nativeElement.querySelector('#daily-care-mode-balanced') as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('#daily-care-energy-steady') as HTMLInputElement)
        .checked,
    ).toBe(true);
  });
});
