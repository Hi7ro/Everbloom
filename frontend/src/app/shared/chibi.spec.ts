import { TestBed } from '@angular/core/testing';
import { createMockSnapshot } from '../data/mock-data';
import { Chibi } from './chibi';

describe('modular Chibi preview', () => {
  it('renders geometry changes for every editable appearance slot', async () => {
    const fixture = TestBed.createComponent(Chibi);
    const appearance = createMockSnapshot().character.appearance;
    fixture.componentRef.setInput('appearance', appearance);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const bodyBefore = root.querySelector('[data-slot="body"]')!.getAttribute('transform');
    const hairBefore = root.querySelector('[data-slot="hair"]')!.innerHTML;
    const outfitBefore = root.querySelector('[data-slot="outfit"]')!.innerHTML;
    const auraBefore = root.querySelector('[data-slot="aura"]')!.innerHTML;

    fixture.componentRef.setInput('appearance', {
      ...appearance,
      body: 'broad',
      hair: 'bob',
      outfit: 'abyssal',
      aura: 'rose',
      skinColor: '#68442f',
      hairColor: '#dfbfc3',
      outfitColor: '#4f5065',
    });
    await fixture.whenStable();
    expect(root.querySelector('[data-slot="body"]')!.getAttribute('transform')).not.toBe(
      bodyBefore,
    );
    expect(root.querySelector('[data-slot="hair"]')!.innerHTML).not.toBe(hairBefore);
    expect(root.querySelector('[data-slot="outfit"]')!.innerHTML).not.toBe(outfitBefore);
    expect(root.querySelector('[data-slot="aura"]')!.innerHTML).not.toBe(auraBefore);
    expect(root.querySelector('[data-slot="face"] ellipse')!.getAttribute('fill')).toBe('#68442f');
    expect(root.querySelector('[data-slot="hair"]')!.getAttribute('fill')).toBe('#dfbfc3');
    expect(root.querySelector('[data-slot="outfit"] path')!.getAttribute('fill')).toBe('#4f5065');
    expect(root.querySelector('svg')!.getAttribute('aria-label')).toContain('Abyssal, Frisur Bob');

    fixture.componentRef.setInput('appearance', { ...appearance, aura: 'none', hair: 'braid' });
    await fixture.whenStable();
    expect(
      root.querySelector('[data-slot="aura"]')!.querySelectorAll('path, ellipse'),
    ).toHaveLength(0);
    expect(
      root.querySelector('[data-slot="hair-back"]')!.querySelectorAll('path').length,
    ).toBeGreaterThan(0);
  });
});
