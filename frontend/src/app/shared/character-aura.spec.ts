import { TestBed } from '@angular/core/testing';
import { AURA_DESIGNS, ADVANCED_AURA_DESIGNS } from '../domain/aura-designs';
import { normalizeCharacterProfile, CHARACTER_OPTIONS } from '../domain/character';
import { createMockSnapshot } from '../data/mock-data';
import { CharacterAura } from './character-aura';

describe('decorative character auras', () => {
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
    }
  });

  it('provides distinct authored silhouettes and a bounded particle count for every design', () => {
    const outlines = new Set<string>();
    expect(AURA_DESIGNS).toHaveLength(13);
    for (const design of AURA_DESIGNS) {
      const fixture = render(design.id);
      const root = fixture.nativeElement as HTMLElement;
      const svg = root.querySelector('svg')!;
      expect(svg.getAttribute('viewBox')).toBe('0 0 240 300');
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
      expect(root.querySelector('[data-shape]')?.getAttribute('data-shape')).toBe(design.id);
      const paths = Array.from(root.querySelectorAll('.aura-form path'), (path) =>
        path.getAttribute('d'),
      ).join('|');
      expect(paths.length).toBeGreaterThan(60);
      outlines.add(paths);
      expect(root.querySelectorAll('.particle').length).toBeGreaterThan(0);
      expect(root.querySelectorAll('.particle').length).toBeLessThanOrEqual(24);
      expect(root.querySelectorAll('filter, image, animate, animateTransform')).toHaveLength(0);
    }
    expect(outlines.size).toBe(13);
  });

  it('uses natural starter colors and accepts only safe hex color overrides', () => {
    const fixture = render('sage');
    expect(fixture.componentInstance.resolvedColor()).toBe('#b6d791');
    fixture.componentRef.setInput('color', '#AABBCC');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg').style.getPropertyValue('--aura-color')).toBe(
      '#aabbcc',
    );
    for (const color of [
      'red',
      'url(https://example.org)',
      '#123',
      '#ffffff; opacity:0',
      undefined,
    ]) {
      fixture.componentRef.setInput('color', color);
      fixture.detectChanges();
      expect(fixture.componentInstance.resolvedColor()).toBe('#b6d791');
    }
  });

  it('disables animation without removing the selected aura and supplies a reduced-motion override', () => {
    const fixture = render('angel');
    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('svg')!;
    const wing = root.querySelector('.wings path');
    expect(svg.classList.contains('animated')).toBe(true);
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();
    expect(svg.classList.contains('animated')).toBe(false);
    expect(root.querySelector('.wings path')).toBe(wing);
    const styles = Array.from(
      document.querySelectorAll('style'),
      (style) => style.textContent ?? '',
    )
      .filter((style) => style.includes('aura-drift'))
      .join('\n');
    expect(styles).toContain('prefers-reduced-motion: reduce');
    expect(styles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none/,
    );
  });

  it('adds optional shadow eyes only to the demonic aura and never changes a character image', () => {
    const fixture = render('demonic');
    expect(fixture.nativeElement.querySelector('.fierce-eyes')).toBeNull();
    fixture.componentRef.setInput('fierce', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fierce-eyes [d]')).not.toBeNull();
    for (const id of ['guardian', 'angel', 'sage']) {
      fixture.componentRef.setInput('aura', id);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fierce-eyes')).toBeNull();
    }
    expect(fixture.nativeElement.querySelector('image')).toBeNull();
  });

  it('keeps advanced designs out of the current selectable and persisted aura contract', () => {
    expect(ADVANCED_AURA_DESIGNS).toHaveLength(10);
    const character = createMockSnapshot().character;
    for (const design of ADVANCED_AURA_DESIGNS) {
      expect(CHARACTER_OPTIONS.aura.some((aura) => String(aura.id) === design.id)).toBe(false);
      expect(() =>
        normalizeCharacterProfile({
          name: character.name,
          appearance: { ...character.appearance, aura: design.id },
        }),
      ).toThrow('nicht verfügbar');
    }
  });
});
