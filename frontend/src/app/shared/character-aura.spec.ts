import { TestBed } from '@angular/core/testing';
import { AURA_DESIGNS } from '../domain/aura-designs';
import { AURA_REWARDS, hasAuraAccess } from '../domain/aura-rewards';
import { normalizeCharacterProfile, CHARACTER_OPTIONS } from '../domain/character';
import { createMockSnapshot } from '../data/mock-data';
import { AURA_VISUALS } from '../rendering/aura-visuals';
import { CharacterAura } from './character-aura';

describe('painted equipped character auras', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CharacterAura] }).compileComponents();
  });
  function render(aura: string, animated = true) {
    const fixture = TestBed.createComponent(CharacterAura);
    fixture.componentRef.setInput('aura', aura);
    fixture.componentRef.setInput('animated', animated);
    fixture.detectChanges();
    return fixture;
  }

  it('renders nothing for none or unknown identifiers', () => {
    for (const id of ['none', '', 'unreleased', 'url(https://example.org)']) {
      const fixture = render(id);
      expect(fixture.nativeElement.querySelector('svg')).toBeNull();
      expect(fixture.nativeElement.querySelector('image')).toBeNull();
    }
  });

  it('uses a full painted sprite for every selectable design with the same coordinates as Pixi', () => {
    expect(AURA_DESIGNS).toHaveLength(26);
    expect(Object.keys(AURA_VISUALS).sort()).toEqual(AURA_DESIGNS.map(design => design.id).sort());
    for (const design of AURA_DESIGNS) {
      const fixture = render(design.id);
      const root = fixture.nativeElement as HTMLElement;
      const svg = root.querySelector('svg')!;
      const image = root.querySelector('image')!;
      const visual = AURA_VISUALS[design.id];
      expect(svg.getAttribute('viewBox')).toBe('0 0 240 300');
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
      expect(svg.getAttribute('data-aura')).toBe(design.id);
      expect(image.getAttribute('href')).toBe(visual.artwork);
      expect(image.getAttribute('href')).toMatch(/^\/art\/(auras|loot)\/[a-z-]+-v\d+\.webp$/);
      expect(image.getAttribute('preserveAspectRatio')).toBe('none');
      for (const key of ['x', 'y', 'width', 'height'] as const) expect(image.getAttribute(key)).toBe(String(visual[key]));
      expect(root.querySelector('.painted-aura')!.getAttribute('opacity')).toBe(String(visual.opacity));
      expect(image.style.filter).toBe('');
      expect(root.querySelectorAll('image')).toHaveLength(1);
      expect(root.querySelectorAll('.particle')).toHaveLength(6);
      expect(root.querySelectorAll('.aura-form, .fine-details, .trail, mask, feGaussianBlur, animate')).toHaveLength(0);
      expect(root.querySelectorAll('filter')).toHaveLength(visual.tint === undefined ? 0 : 1);
    }
  });

  it('uses dedicated painted assets for the new boss auras in both renderers', () => {
    for (const [id, item] of [
      ['twilight', 'twilight-mantle'], ['eclipse', 'eclipse-guardian'],
      ['bloodmoon', 'ruby-orbit'], ['crimson-crown', 'crimson-corona'],
      ['void-orbit', 'abyss-orbit'], ['leviathan', 'world-devourer'],
      ['dragon-oath', 'dragon-oath'], ['primordial-wings', 'primordial-wings'],
      ['relic-arsenal', 'relic-arsenal'], ['imperial-gate', 'imperial-gate'],
    ]) {
      const root = render(id).nativeElement as HTMLElement;
      expect(root.querySelector('image')!.getAttribute('href')).toBe(`/art/loot/${item}-v1.webp`);
      expect(root.querySelector('filter')).toBeNull();
    }
  });

  it('makes Waldlicht and earned level auras painted equipment without changing unlock rules', () => {
    const forest = render('sage', false);
    expect(forest.nativeElement.querySelector('image').getAttribute('href')).toBe(AURA_VISUALS['sage'].artwork);
    expect(forest.nativeElement.querySelector('.painted-aura').getAttribute('opacity')).toBe(String(AURA_VISUALS['sage'].opacity));
    for (const reward of AURA_REWARDS) {
      expect(AURA_DESIGNS.find(design => design.id === reward.id)).toMatchObject({ label: reward.label });
      const fixture = render(reward.id, false);
      expect(fixture.nativeElement.querySelector('image')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('svg').classList.contains('animated')).toBe(false);
    }
    const character = createMockSnapshot().character;
    for (const design of AURA_DESIGNS.filter(design => design.id !== 'sage')) {
      expect(CHARACTER_OPTIONS.aura.some(aura => String(aura.id) === design.id)).toBe(false);
      expect(normalizeCharacterProfile({ name: character.name, appearance: { ...character.appearance, aura: design.id } }).appearance.aura).toBe(design.id);
      expect(hasAuraAccess({ unlockedAuras: [] }, design.id)).toBe(false);
      expect(hasAuraAccess({ unlockedAuras: [design.id] }, design.id)).toBe(true);
    }
  });

  it('falls back to a quiet glow after an image error and retries only a newly selected asset', () => {
    const fixture = render('sage');
    const root = fixture.nativeElement as HTMLElement;
    const firstAsset = AURA_VISUALS['sage'].artwork;
    root.querySelector('image')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(root.querySelector('image')).toBeNull();
    expect(root.querySelector('[data-aura-fallback]')).not.toBeNull();
    expect(root.querySelector('.particles')).toBeNull();
    fixture.componentRef.setInput('animated', false); fixture.detectChanges();
    expect(root.querySelector('image')).toBeNull();
    fixture.componentRef.setInput('aura', 'fire'); fixture.detectChanges();
    expect(root.querySelector('image')!.getAttribute('href')).toBe(AURA_VISUALS['fire'].artwork);
    expect(root.querySelector('[data-aura-fallback]')).toBeNull();
    fixture.componentInstance.artworkFailed(firstAsset); fixture.detectChanges();
    expect(root.querySelector('image')).not.toBeNull();
    fixture.componentRef.setInput('aura', 'sage'); fixture.detectChanges();
    expect(root.querySelector('image')!.getAttribute('href')).toBe(firstAsset);
  });

  it('keeps fallback gradients private to each instance', () => {
    const ids = new Set<string>();
    for (const fixture of [render('sage'), render('rose')]) {
      fixture.nativeElement.querySelector('image').dispatchEvent(new Event('error'));
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const gradient = root.querySelector('radialGradient')!;
      expect(ids.has(gradient.id)).toBe(false); ids.add(gradient.id);
      expect(root.querySelector('.aura-fallback')!.getAttribute('fill')).toBe(`url(#${gradient.id})`);
    }
  });

  it('always uses the canonical reward color without a color override control', () => {
    for (const design of AURA_DESIGNS) {
      const fixture = render(design.id);
      expect(fixture.componentInstance.resolvedColor()).toBe(design.color);
      expect(fixture.nativeElement.querySelector('image').style.filter).toBe('');
    }
  });

  it('keeps the painted image when motion is off and respects reduced motion and viewport pausing', () => {
    const fixture = render('angel');
    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('svg')!;
    const image = root.querySelector('image');
    expect(svg.classList.contains('animated')).toBe(true);
    expect(svg.getAttribute('data-motion')).toBe(AURA_VISUALS['angel'].motion);
    fixture.componentRef.setInput('animated', false); fixture.detectChanges();
    expect(root.querySelector('image')).toBe(image);
    expect(svg.classList.contains('animated')).toBe(false);
    expect(svg.style.getPropertyValue('--motion-play-state')).toBe('paused');
    const styles = Array.from(document.querySelectorAll('style'), style => style.textContent ?? '').filter(style => style.includes('aura-wings')).join('\n');
    expect(styles).toMatch(/var\(--motion-play-state,\s*running\)/);
    expect(styles).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none/);
    fixture.componentRef.setInput('animated', true); fixture.detectChanges();
    expect(root.querySelector('image')).toBe(image);
  });

});
