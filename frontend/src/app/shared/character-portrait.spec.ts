import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createMockSnapshot } from '../data/mock-data';
import { Appearance } from '../domain/models';
import { CharacterPortrait } from './character-portrait';
import { Chibi } from './chibi';

describe('approved character artwork wrapper', () => {
  const original: Appearance = {
    ...createMockSnapshot().character.appearance,
    presentation: 'male',
    artwork: 'original',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CharacterPortrait] }).compileComponents();
  });

  function render(appearance: Appearance = original) {
    const fixture = TestBed.createComponent(CharacterPortrait);
    fixture.componentRef.setInput('appearance', appearance);
    fixture.detectChanges();
    return fixture;
  }

  it('uses the original PNG and its separate matte instead of recreating the illustration', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;
    const image = root.querySelector('.original-figure image')!;
    const mask = root.querySelector('mask')!;
    expect(root.querySelector('svg')?.getAttribute('data-artwork')).toBe('original');
    expect(image.getAttribute('href')).toBe('/art/characters/emerald-knight-original.png');
    expect(mask.querySelector('image')?.getAttribute('href')).toBe(
      '/art/characters/emerald-knight-mask.png',
    );
    expect(image.getAttribute('mask')).toBe('url(#' + mask.id + ')');
    expect(root.querySelectorAll('image')).toHaveLength(2);
    expect(root.querySelector('app-chibi')).toBeNull();
    expect(root.querySelector('svg')?.getAttribute('aria-label')).toContain(
      'smaragdgrüner Kristall',
    );
  });

  it('keeps the mask reference unique for each simultaneously rendered portrait', () => {
    const first = render();
    const second = render();
    const firstMask = first.nativeElement.querySelector('mask') as SVGMaskElement;
    const secondMask = second.nativeElement.querySelector('mask') as SVGMaskElement;
    expect(firstMask.id).not.toBe(secondMask.id);
    for (const fixture of [first, second]) {
      const mask = fixture.nativeElement.querySelector('mask') as SVGMaskElement;
      const image = fixture.nativeElement.querySelector(
        '.original-figure image',
      ) as SVGImageElement;
      expect(image.getAttribute('mask')).toBe('url(#' + mask.id + ')');
    }
  });

  it('toggles animation without replacing the image and never claims an interest-specific pose', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;
    const image = root.querySelector('.original-figure image');
    const svg = root.querySelector('svg')!;
    expect(svg.classList.contains('animated')).toBe(true);
    for (const interest of ['meditation', 'calisthenics', 'programming', 'recovery']) {
      fixture.componentRef.setInput('interest', interest);
      fixture.detectChanges();
      expect(svg.getAttribute('data-gesture')).toBe('idle');
      expect(root.querySelector('.original-figure image')).toBe(image);
    }
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();
    expect(svg.classList.contains('animated')).toBe(false);
    expect(root.querySelector('.original-figure image')).toBe(image);
    fixture.componentRef.setInput('animated', true);
    fixture.detectChanges();
    expect(svg.classList.contains('animated')).toBe(true);
  });

  it('changes only the optional surrounding aura while preserving the approved artwork', () => {
    const fixture = render({ ...original, aura: 'sage' });
    const root = fixture.nativeElement as HTMLElement;
    const image = root.querySelector('.original-figure image');
    const originalStroke = root.querySelector('.portrait-aura ellipse')?.getAttribute('stroke');
    fixture.componentRef.setInput('appearance', { ...original, aura: 'rose' });
    fixture.detectChanges();
    expect(root.querySelector('.portrait-aura')?.getAttribute('data-variant')).toBe('rose');
    expect(root.querySelector('.portrait-aura ellipse')?.getAttribute('stroke')).not.toBe(
      originalStroke,
    );
    expect(root.querySelector('.original-figure image')).toBe(image);
    fixture.componentRef.setInput('appearance', { ...original, aura: 'none' });
    fixture.detectChanges();
    expect(root.querySelector('.portrait-aura')?.children).toHaveLength(0);
    expect(root.querySelector('.original-figure image')).toBe(image);
  });

  it('delegates the exact custom appearance and presence inputs to the existing Chibi renderer', () => {
    const appearance: Appearance = {
      ...original,
      artwork: 'custom',
      presentation: 'female',
      hair: 'f-braid',
      outfit: 'abyssal',
      aura: 'void',
    };
    const fixture = render(appearance);
    fixture.componentRef.setInput('level', 42);
    fixture.componentRef.setInput('interest', 'programming');
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();
    const chibi = fixture.debugElement.query(By.directive(Chibi)).componentInstance as Chibi;
    expect(chibi.appearance()).toBe(appearance);
    expect(chibi.level()).toBe(42);
    expect(chibi.interest()).toBe('programming');
    expect(chibi.animated()).toBe(false);
    expect(
      fixture.nativeElement
        .querySelector('app-chibi [data-slot="aura"]')
        .getAttribute('data-variant'),
    ).toBe('void');
    expect(fixture.nativeElement.querySelector('app-chibi svg').getAttribute('data-gesture')).toBe(
      'focus',
    );
    expect(fixture.nativeElement.querySelector('.original-figure')).toBeNull();
    expect(fixture.nativeElement.querySelector('image')).toBeNull();
  });

  it('resolves unspecified older male profiles to the original and female profiles to custom', () => {
    const male: Appearance = { ...original };
    delete male.artwork;
    const fixture = render(male);
    expect(fixture.nativeElement.querySelector('svg[data-artwork="original"]')).not.toBeNull();
    const female: Appearance = { ...male, presentation: 'female', hair: 'f-bob' };
    fixture.componentRef.setInput('appearance', female);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-chibi')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.original-figure')).toBeNull();
  });
});
