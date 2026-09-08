import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createMockSnapshot } from '../data/mock-data';
import { defaultHairstyle } from '../domain/character';
import { ILLUSTRATED_CHARACTERS } from '../domain/character-illustrations';
import { CHARACTER_RIGS } from '../domain/character-rigs.generated';
import { Appearance } from '../domain/models';
import { CharacterPortrait } from './character-portrait';
import { CharacterAura } from './character-aura';

const original: Appearance = {
  ...createMockSnapshot().character.appearance,
  presentation: 'male',
  artwork: 'original',
};
const exactIds = ['emerald-knight', 'urban-ranger', 'moonblade', 'starweaver'];
const modular: Appearance = {
  ...original,
  illustration: 'emerald-knight',
  illustratedHair: 'frost-scholar',
  outfitSet: 'abyss-walker',
  skinTone: '#68442f',
  eyeColor: '#5e92c7',
  hairTint: '#d5dbe0',
};

function presetAppearance(id: string): Appearance {
  const preset = ILLUSTRATED_CHARACTERS.find((item) => item.id === id)!;
  return {
    ...original,
    presentation: preset.presentation,
    hair: defaultHairstyle(preset.presentation),
    illustration: id,
  };
}

describe('illustrated raster character renderer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CharacterPortrait] }).compileComponents();
  });

  function render(appearance: Appearance = original) {
    const fixture = TestBed.createComponent(CharacterPortrait);
    fixture.componentRef.setInput('appearance', appearance);
    fixture.detectChanges();
    return fixture;
  }

  it.each(exactIds)(
    'preserves the exact %s PNG and separate original matte without recoloring',
    (id) => {
      const fixture = render(presetAppearance(id));
      const root = fixture.nativeElement as HTMLElement;
      const svg = root.querySelector('.illustrated-portrait')!;
      const image = svg.querySelector('.original-figure image')!;
      const mask = svg.querySelector('mask')!;
      expect(svg.getAttribute('data-renderer')).toBe('exact-illustration');
      expect(image.getAttribute('href')).toBe(`/art/characters/${id}-original.png`);
      expect(mask.querySelector('image')?.getAttribute('href')).toBe(
        `/art/characters/${id}-mask.png`,
      );
      expect(image.getAttribute('mask')).toBe(`url(#${mask.id})`);
      expect(image.hasAttribute('filter')).toBe(false);
      expect(svg.querySelectorAll('image')).toHaveLength(2);
      expect(root.querySelector('app-chibi')).toBeNull();
      expect(svg.getAttribute('aria-label')?.length).toBeGreaterThan(20);
    },
  );

  it('renders every new design through painted outfit and head layers', () => {
    for (const preset of ILLUSTRATED_CHARACTERS.filter((item) => !exactIds.includes(item.id))) {
      const fixture = render(presetAppearance(preset.id));
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('.illustrated-portrait')?.getAttribute('data-renderer')).toBe(
        'layered',
      );
      expect(root.querySelectorAll('[data-layer]')).toHaveLength(2);
      expect(root.querySelector('[data-layer="outfit"] image')?.getAttribute('href')).toBe(
        `/art/characters/${preset.id}-sheet.png`,
      );
      expect(root.querySelector('[data-layer="head"] image')?.getAttribute('href')).toBe(
        `/art/characters/${preset.id}-sheet.png`,
      );
      expect(root.querySelector('app-chibi')).toBeNull();
    }
  });

  it('updates hairstyle and outfit sources independently while keeping the selected face and color filters', () => {
    const fixture = render(modular);
    const root = fixture.nativeElement as HTMLElement;
    const image = (layer: string) => root.querySelector(`[data-layer="${layer}"] image`)!;
    expect(root.querySelector('.original-figure')).toBeNull();
    expect(image('face').getAttribute('href')).toBe('/art/characters/emerald-knight-sheet.png');
    expect(image('hair').getAttribute('href')).toBe('/art/characters/frost-scholar-sheet.png');
    expect(image('outfit').getAttribute('href')).toBe('/art/characters/abyss-walker-sheet.png');
    const originalFace = image('face');
    const originalOutfit = image('outfit');
    fixture.componentRef.setInput('appearance', { ...modular, illustratedHair: 'urban-ranger' });
    fixture.detectChanges();
    expect(image('face')).toBe(originalFace);
    expect(image('outfit')).toBe(originalOutfit);
    expect(image('hair').getAttribute('href')).toBe('/art/characters/urban-ranger-sheet.png');
    expect(image('hair-color').getAttribute('href')).toBe('/art/characters/urban-ranger-sheet.png');
    fixture.componentRef.setInput('appearance', {
      ...modular,
      illustratedHair: 'urban-ranger',
      outfitSet: 'forest-scout',
    });
    fixture.detectChanges();
    expect(image('outfit').getAttribute('href')).toBe('/art/characters/forest-scout-sheet.png');
    expect(image('hands').getAttribute('href')).toBe('/art/characters/forest-scout-sheet.png');
    expect(image('hair').getAttribute('href')).toBe('/art/characters/urban-ranger-sheet.png');
    expect(image('face')).toBe(originalFace);
    for (const layer of ['hands', 'scalp-tone', 'skin', 'eyes', 'hair-color']) {
      const reference = image(layer).getAttribute('filter')!;
      const filter = root.querySelector(reference.slice(4, -1))!;
      expect(filter.querySelector('feColorMatrix')?.getAttribute('type')).toBe('saturate');
      const channels = Array.from(filter.querySelectorAll('feFuncR, feFuncG, feFuncB'));
      expect(channels).toHaveLength(3);
      for (const channel of channels) {
        const values = channel.getAttribute('tableValues')!.split(' ').map(Number);
        expect(values.length).toBeGreaterThanOrEqual(3);
        expect(values.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)).toBe(
          true,
        );
      }
    }
  });

  it('changes only the requested color overlay and removes it when original color is selected', () => {
    const fixture = render(modular);
    const root = fixture.nativeElement as HTMLElement;
    const image = root.querySelector('[data-layer="eyes"] image')!;
    const filterId = image.getAttribute('filter')!.slice(4, -1);
    const channels = () =>
      Array.from(
        root.querySelectorAll(`${filterId} feFuncR, ${filterId} feFuncG, ${filterId} feFuncB`),
        (channel) => channel.getAttribute('tableValues'),
      );
    const before = channels();
    const outfit = root.querySelector('[data-layer="outfit"] image');
    const hair = root.querySelector('[data-layer="hair"] image');
    fixture.componentRef.setInput('appearance', { ...modular, eyeColor: '#c6963e' });
    fixture.detectChanges();
    expect(channels()).not.toEqual(before);
    expect(root.querySelector('[data-layer="eyes"] image')).toBe(image);
    expect(root.querySelector('[data-layer="outfit"] image')).toBe(outfit);
    expect(root.querySelector('[data-layer="hair"] image')).toBe(hair);
    const { eyeColor: _eyeColor, ...withoutEyeTint } = modular;
    fixture.componentRef.setInput('appearance', withoutEyeTint);
    fixture.detectChanges();
    expect(root.querySelector('[data-layer="eyes"]')).toBeNull();
    expect(root.querySelector('[data-layer="skin"]')).not.toBeNull();
    expect(root.querySelector('[data-layer="hair-color"]')).not.toBeNull();
  });

  it('tints the full authored iris ellipses over the unchanged painted sheet instead of relying on white mask pixels', () => {
    const appearance = { ...presetAppearance('emerald-knight'), eyeColor: '#5e92c7' };
    const fixture = render(appearance);
    const root = fixture.nativeElement as HTMLElement;
    const eyeImage = root.querySelector('[data-layer="eyes"] image')!;
    const headImage = root.querySelector('[data-layer="head"] image')!;
    const sourcePath = '/art/characters/emerald-knight-sheet.png';
    expect(eyeImage.getAttribute('href')).toBe(sourcePath);
    expect(headImage.getAttribute('href')).toBe(sourcePath);
    expect(headImage.hasAttribute('filter')).toBe(false);
    const mask = root.querySelector(eyeImage.getAttribute('mask')!.slice(4, -1))!;
    expect(mask.querySelector('image')).toBeNull();
    const ellipses = Array.from(mask.querySelectorAll('ellipse'));
    expect(ellipses).toHaveLength(2);
    const rig = CHARACTER_RIGS['emerald-knight'];
    for (const [index, side] of (['left', 'right'] as const).entries()) {
      const ellipse = ellipses[index];
      expect(ellipse.getAttribute('cx')).toBe(String(rig.eyes[side].x));
      expect(ellipse.getAttribute('cy')).toBe(String(rig.eyes[side].y));
      expect(ellipse.getAttribute('rx')).toBe(String(rig.iris[side].rx));
      expect(ellipse.getAttribute('ry')).toBe(String(rig.iris[side].ry));
      expect(ellipse.getAttribute('fill')).toBe('white');
    }
    fixture.componentRef.setInput('appearance', { ...appearance, eyeColor: '#c6963e' });
    fixture.detectChanges();
    expect(root.querySelector('[data-layer="eyes"] image')).toBe(eyeImage);
    expect(root.querySelector('[data-layer="head"] image')).toBe(headImage);
    expect(eyeImage.getAttribute('href')).toBe(sourcePath);
    expect(Array.from(mask.querySelectorAll('ellipse'))).toEqual(ellipses);
    fixture.componentRef.setInput('appearance', presetAppearance('emerald-knight'));
    fixture.detectChanges();
    expect(root.querySelector('.original-figure image')?.getAttribute('href')).toBe(
      '/art/characters/emerald-knight-original.png',
    );
    expect(root.querySelector('[data-layer="eyes"]')).toBeNull();
  });

  it('assigns unique masks, clips and filters and resolves every reference inside its own portrait', () => {
    const fixtures = [render(original), render(modular), render({ ...modular, aura: 'rose' })];
    const allIds: string[] = [];
    for (const fixture of fixtures) {
      const svg = fixture.nativeElement.querySelector('.illustrated-portrait') as SVGElement;
      const ids = Array.from(svg.querySelectorAll('[id]'), (element) => element.id);
      expect(new Set(ids).size).toBe(ids.length);
      allIds.push(...ids);
      for (const element of svg.querySelectorAll('[mask], [filter], [clip-path]')) {
        for (const attribute of ['mask', 'filter', 'clip-path']) {
          const value = element.getAttribute(attribute);
          if (value) {
            expect(value).toMatch(/^url\(#[\w-]+\)$/);
            expect(ids).toContain(value.slice(5, -1));
          }
        }
      }
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it.each([original, modular])(
    'propagates motion to aura and figure without inventing specific poses',
    (appearance) => {
      const fixture = render(appearance);
      const root = fixture.nativeElement as HTMLElement;
      const svg = root.querySelector('.illustrated-portrait')!;
      const figure = root.querySelector('.original-figure, .whole-figure');
      const aura = fixture.debugElement.query(By.directive(CharacterAura))
        .componentInstance as CharacterAura;
      for (const interest of ['meditation', 'calisthenics', 'programming', 'recovery']) {
        fixture.componentRef.setInput('interest', interest);
        fixture.componentRef.setInput('level', 42);
        fixture.detectChanges();
        expect(svg.getAttribute('data-gesture')).toBe('idle');
        expect(svg.getAttribute('data-stage')).toBe('seasoned');
        expect(root.querySelector('.original-figure, .whole-figure')).toBe(figure);
      }
      fixture.componentRef.setInput('animated', false);
      fixture.detectChanges();
      expect(svg.classList.contains('animated')).toBe(false);
      expect(aura.animated()).toBe(false);
      fixture.componentRef.setInput('animated', true);
      fixture.detectChanges();
      expect(svg.classList.contains('animated')).toBe(true);
      expect(aura.animated()).toBe(true);
      const styles = Array.from(
        document.querySelectorAll('style'),
        (style) => style.textContent ?? '',
      )
        .filter((style) => style.includes('portrait-sway'))
        .join('\n');
      expect(styles).toMatch(
        /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none/,
      );
    },
  );

  it('changes the separate aura while preserving approved artwork', () => {
    const fixture = render(original);
    const root = fixture.nativeElement as HTMLElement;
    const image = root.querySelector('.original-figure image');
    fixture.componentRef.setInput('appearance', { ...original, aura: 'rose' });
    fixture.detectChanges();
    expect(root.querySelector('app-character-aura svg')?.getAttribute('data-aura')).toBe('rose');
    expect(root.querySelector('.original-figure image')).toBe(image);
    fixture.componentRef.setInput('appearance', { ...original, aura: 'none' });
    fixture.detectChanges();
    expect(root.querySelector('app-character-aura svg')).toBeNull();
    expect(root.querySelector('.original-figure image')).toBe(image);
  });

  it('renders older custom or unspecified profiles as illustrated figures for both presentations', () => {
    for (const presentation of ['male', 'female'] as const)
      for (const artwork of ['custom', undefined] as const) {
        const fixture = render({
          ...original,
          presentation,
          hair: defaultHairstyle(presentation),
          artwork,
        });
        const root = fixture.nativeElement as HTMLElement;
        expect(root.querySelector('app-chibi')).toBeNull();
        expect(root.querySelector('.illustrated-portrait')?.getAttribute('data-artwork')).toBe(
          'original',
        );
        expect(root.querySelector('.original-figure image')?.getAttribute('href')).toBe(
          `/art/characters/${presentation === 'male' ? 'emerald-knight' : 'moonblade'}-original.png`,
        );
      }
  });
});
