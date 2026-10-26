import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createMockSnapshot } from '../data/mock-data';
import { defaultHairstyle } from '../domain/character';
import { ILLUSTRATED_CHARACTERS } from '../domain/character-illustrations';
import { CHARACTER_RIGS } from '../domain/character-rigs.generated';
import { CHARACTER_OUTFITS } from '../domain/character-outfits';
import { Appearance } from '../domain/models';
import { CharacterPortrait } from './character-portrait';
import { CharacterAura } from './character-aura';

function appearanceFor(id: string): Appearance {
  const preset = ILLUSTRATED_CHARACTERS.find(item => item.id === id)!;
  return { ...createMockSnapshot().character.appearance, presentation: preset.presentation,
    artwork: 'original', hair: defaultHairstyle(preset.presentation), illustration: id };
}

describe('illustrated character renderer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CharacterPortrait] }).compileComponents();
  });
  function render(appearance = appearanceFor('emerald-knight')) {
    const fixture = TestBed.createComponent(CharacterPortrait);
    fixture.componentRef.setInput('appearance', appearance);
    fixture.detectChanges();
    return fixture;
  }

  it.each(ILLUSTRATED_CHARACTERS)('renders one complete $id head over its alpha body', ({ id }) => {
    const fixture = render(appearanceFor(id));
    const root = fixture.nativeElement as HTMLElement;
    const outfit = root.querySelector('[data-layer="outfit"] image')!;
    const head = root.querySelector('[data-layer="head"] image')!;
    expect(outfit.getAttribute('href')).toBe(`/art/characters/${id}-body-v2.webp`);
    expect(outfit.hasAttribute('mask')).toBe(false);
    expect(head.getAttribute('href')).toBe(`/art/characters/${id}-sheet.png`);
    expect(head.hasAttribute('mask')).toBe(true);
    expect(root.querySelectorAll('[data-layer="head"]')).toHaveLength(1);
    expect(root.querySelector('[data-layer="scalp"], [data-layer="face"], [data-layer="hair"]')).toBeNull();
    expect(root.querySelector('.illustrated-portrait')?.getAttribute('aria-label')?.length).toBeGreaterThan(20);
  });

  it('replaces the entire hairstyle silhouette and its matching face without retaining the old head', () => {
    const fixture = render({ ...appearanceFor('emerald-knight'), outfitSet: 'abyss-walker' });
    const root = fixture.nativeElement as HTMLElement;
    const outfit = root.querySelector('[data-layer="outfit"] image');
    for (const selected of ['ember-striker', 'forest-scout', 'urban-ranger', 'emerald-knight']) {
      fixture.componentRef.setInput('appearance', {
        ...appearanceFor('emerald-knight'), illustratedHair: selected, outfitSet: 'abyss-walker',
      });
      fixture.detectChanges();
      expect(root.querySelector('[data-layer="outfit"] image')).toBe(outfit);
      expect(root.querySelectorAll('[data-layer="head"]')).toHaveLength(1);
      expect(root.querySelector('[data-layer="head"] image')?.getAttribute('href')).toBe(`/art/characters/${selected}-sheet.png`);
      const headSources = Array.from(root.querySelectorAll('image')).map(image => image.getAttribute('href'))
        .filter(href => href?.endsWith('-sheet.png'));
      expect(new Set(headSources)).toEqual(new Set([`/art/characters/${selected}-sheet.png`]));
      expect(root.querySelector('image[href*="face-male"], image[href*="face-female"]')).toBeNull();
    }
  });

  it('keeps selected skin, eye and hair colors on the new head and aligns irises to that head', () => {
    const appearance = { ...appearanceFor('emerald-knight'), illustratedHair: 'ember-striker',
      outfitSet: 'abyss-walker', skinTone: '#68442f', eyeColor: '#5e92c7', hairTint: '#d5dbe0' };
    const fixture = render(appearance);
    const root = fixture.nativeElement as HTMLElement;
    for (const selected of ['ember-striker', 'forest-scout'] as const) {
      fixture.componentRef.setInput('appearance', { ...appearance, illustratedHair: selected });
      fixture.detectChanges();
      for (const key of ['head', 'skin', 'eyes', 'hair-color'])
        expect(root.querySelector(`[data-layer="${key}"] image`)?.getAttribute('href')).toBe(`/art/characters/${selected}-sheet.png`);
      const eyeImage = root.querySelector('[data-layer="eyes"] image')!;
      const mask = root.querySelector(eyeImage.getAttribute('mask')!.slice(4, -1))!;
      const ellipses = [...mask.querySelectorAll('ellipse')];
      expect(ellipses).toHaveLength(2);
      const rig = CHARACTER_RIGS[selected];
      for (const [index, side] of (['left', 'right'] as const).entries()) {
        expect(ellipses[index].getAttribute('cx')).toBe(String(rig.eyes[side].x));
        expect(ellipses[index].getAttribute('cy')).toBe(String(rig.eyes[side].y));
        expect(ellipses[index].getAttribute('rx')).toBe(String(rig.iris[side].rx));
      }
      expect(root.querySelector('[data-layer="outfit"] image')?.getAttribute('href')).toBe('/art/characters/abyss-walker-body-v2.webp');
    }
    fixture.componentRef.setInput('appearance', { ...appearanceFor('emerald-knight'), illustratedHair: 'forest-scout' });
    fixture.detectChanges();
    expect(root.querySelector('[data-layer="skin"], [data-layer="eyes"], [data-layer="hair-color"]')).toBeNull();
  });

  it('places the outfit collar over a painted neck and keeps the whole figure in a single breathing group', () => {
    const fixture = render({ ...appearanceFor('emerald-knight'), illustratedHair: 'ember-striker', outfitSet: 'abyss-walker' });
    const root = fixture.nativeElement as HTMLElement;
    const group = root.querySelector('.rig-breath')!;
    const layers = [...group.querySelectorAll('[data-layer]')].map(el => el.getAttribute('data-layer'));
    expect(layers).toEqual(['outfit', 'head', 'collar']);
    const collar = root.querySelector('[data-layer="collar"]')!;
    expect(collar.getAttribute('transform')).toBe(root.querySelector('[data-layer="outfit"]')?.getAttribute('transform'));
    const sourceClip = collar.querySelector('image')!.parentElement!;
    const polygon = root.querySelector(sourceClip.getAttribute('clip-path')!.slice(4, -1))?.querySelector('polygon');
    expect(polygon?.getAttribute('points')).toBe(CHARACTER_OUTFITS['abyss-walker'].collarFront!.map(point => `${point.x},${point.y}`).join(' '));
    expect(collar.querySelector('image')?.getAttribute('href')).toBe('/art/characters/abyss-walker-body-v2.webp');
  });

  it('uses local unique filter and mask references for every portrait', () => {
    const allIds: string[] = [];
    for (const appearance of [appearanceFor('emerald-knight'), { ...appearanceFor('moonblade'), illustratedHair: 'rose-runner', eyeColor: '#5e92c7' }]) {
      const svg = render(appearance).nativeElement.querySelector('.illustrated-portrait') as SVGElement;
      const ids = [...svg.querySelectorAll('[id]')].map(el => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      allIds.push(...ids);
      for (const element of svg.querySelectorAll('[mask], [filter], [clip-path]'))
        for (const attribute of ['mask', 'filter', 'clip-path']) {
          const value = element.getAttribute(attribute);
          if (value) expect(ids).toContain(value.slice(5, -1));
        }
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('keeps interest gestures and motion preferences on the complete figure and aura', () => {
    const fixture = render();
    const svg = fixture.nativeElement.querySelector('.illustrated-portrait') as SVGElement;
    const aura = fixture.debugElement.query(By.directive(CharacterAura)).componentInstance as CharacterAura;
    for (const [interest, gesture] of [['meditation', 'breathe'], ['calisthenics', 'stretch'], ['programming', 'focus'], ['adventurer', 'greet']]) {
      fixture.componentRef.setInput('interest', interest);
      fixture.detectChanges();
      expect(svg.getAttribute('data-gesture')).toBe(gesture);
    }
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();
    expect(svg.classList.contains('animated')).toBe(false);
    expect(aura.animated()).toBe(false);
    const styles = [...document.querySelectorAll('style')].map(el => el.textContent).join('\n');
    expect(styles).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none/);
  });

  it('changes a separately equipped aura without replacing the character images', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;
    const head = root.querySelector('[data-layer="head"] image');
    for (const aura of ['rose', 'none'] as const) {
      fixture.componentRef.setInput('appearance', { ...appearanceFor('emerald-knight'), aura });
      fixture.detectChanges();
      expect(root.querySelector('[data-layer="head"] image')).toBe(head);
      expect(root.querySelector('app-character-aura svg')?.getAttribute('data-aura') ?? null).toBe(aura === 'none' ? null : aura);
    }
  });
});
