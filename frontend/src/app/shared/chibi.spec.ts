import { TestBed } from '@angular/core/testing';
import { createMockSnapshot } from '../data/mock-data';
import { Chibi } from './chibi';
import { CHARACTER_OPTIONS } from '../domain/character';

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
      presentation: 'female',
      hair: 'f-bob',
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
    expect(root.querySelector('svg')!.getAttribute('aria-label')).toContain('Abyssal, Frisur Anime-Bob');

    fixture.componentRef.setInput('appearance', { ...appearance, presentation: 'female', aura: 'none', hair: 'f-braid' });
    await fixture.whenStable();
    expect(
      root.querySelector('[data-slot="aura"]')!.querySelectorAll('path, ellipse'),
    ).toHaveLength(0);
    expect(
      root.querySelector('[data-slot="hair-back"]')!.querySelectorAll('path').length,
    ).toBeGreaterThan(0);
  });

  it('uses unique paint ids and keeps every local fill reference inside its own instance', async () => {
    const fixtures = [TestBed.createComponent(Chibi), TestBed.createComponent(Chibi)];
    for (const fixture of fixtures) {
      fixture.componentRef.setInput('appearance', createMockSnapshot().character.appearance);
    }
    await Promise.all(fixtures.map((fixture) => fixture.whenStable()));
    const allIds: string[] = [];
    for (const fixture of fixtures) {
      const root = fixture.nativeElement as HTMLElement;
      const ids = Array.from(root.querySelectorAll('defs [id]')).map((node) => node.id);
      expect(ids).toHaveLength(4);
      allIds.push(...ids);
      for (const node of root.querySelectorAll('[fill]')) {
        const ref = node.getAttribute('fill')!.match(/^url\(#(.+)\)$/)?.[1];
        if (ref) expect(ids).toContain(ref);
      }
    }
    expect(new Set(allIds).size).toBe(8);
  });

  it('changes presentation by level and interest and disables animation without changing appearance', async () => {
    const fixture = TestBed.createComponent(Chibi);
    const appearance = createMockSnapshot().character.appearance;
    fixture.componentRef.setInput('appearance', appearance);
    fixture.componentRef.setInput('level', 25);
    fixture.componentRef.setInput('interest', 'programming');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('svg')!;
    expect(svg.getAttribute('data-stage')).toBe('seasoned');
    expect(svg.getAttribute('data-gesture')).toBe('focus');
    expect(svg.classList.contains('animated')).toBe(true);
    expect(root.querySelector('[data-slot="interest-gesture"]')).not.toBeNull();
    const eyes = root.querySelectorAll('[data-slot="eyes"] ellipse');
    expect(Number(eyes[1].getAttribute('rx'))).toBeLessThan(Number(eyes[0].getAttribute('rx')));
    fixture.componentRef.setInput('animated', false);
    await fixture.whenStable();
    expect(svg.classList.contains('animated')).toBe(false);
    expect(fixture.componentInstance.appearance()).toEqual(appearance);
  });

  it('renders distinct face and body geometry for male and female without changing body-size choice', async () => {
    const fixture = TestBed.createComponent(Chibi);
    const appearance = { ...createMockSnapshot().character.appearance, presentation: 'male', hair: 'm-spiky', body: 'broad' };
    fixture.componentRef.setInput('appearance', appearance);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const face = root.querySelector('[data-layer="face-contour"]')!.getAttribute('d');
    const torso = root.querySelector('[data-slot="outfit"] path')!.getAttribute('d');
    const irisHeight = root.querySelector('[data-slot="eyes"] ellipse')!.getAttribute('ry');
    const bodyScale = root.querySelector('[data-slot="body"]')!.getAttribute('transform');
    const shoulders = root.querySelector('.presentation-body')!.getAttribute('transform');

    fixture.componentRef.setInput('appearance', { ...appearance, presentation: 'female', hair: 'f-pixie' });
    await fixture.whenStable();
    expect(root.querySelector('svg')!.getAttribute('data-presentation')).toBe('female');
    expect(root.querySelector('[data-layer="face-contour"]')!.getAttribute('d')).not.toBe(face);
    expect(root.querySelector('[data-slot="outfit"] path')!.getAttribute('d')).not.toBe(torso);
    expect(Number(root.querySelector('[data-slot="eyes"] ellipse')!.getAttribute('ry'))).toBeGreaterThan(Number(irisHeight));
    expect(root.querySelector('.presentation-body')!.getAttribute('transform')).not.toBe(shoulders);
    expect(root.querySelector('[data-slot="body"]')!.getAttribute('transform')).toBe(bodyScale);
  });

  it('gives all twelve starter hairstyles their own rendered silhouette and keeps long-hair layers', async () => {
    const fixture = TestBed.createComponent(Chibi);
    const appearance = createMockSnapshot().character.appearance;
    const silhouettes = new Set<string>();
    expect(CHARACTER_OPTIONS.hair).toHaveLength(12);
    for (const option of CHARACTER_OPTIONS.hair) {
      fixture.componentRef.setInput('appearance', {
        ...appearance, presentation: option.id.startsWith('f-') ? 'female' : 'male', hair: option.id,
      });
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const silhouette = root.querySelector('[data-layer="hair-silhouette"]')!.getAttribute('d')!;
      expect(silhouette.length).toBeGreaterThan(40);
      expect(root.querySelector('[data-slot="hair"]')!.getAttribute('data-variant')).toBe(option.id);
      silhouettes.add(silhouette);
      if (['f-long', 'f-ponytail', 'f-twin-tails', 'f-braid', 'm-topknot'].includes(option.id)) {
        expect(root.querySelector('[data-slot="hair-back"] path')).not.toBeNull();
      }
      expect(root.querySelector('[data-slot="accessory"]')).not.toBeNull();
    }
    expect(silhouettes.size).toBe(12);
  });

  it('keeps all outfit and body choices available for both presentations', async () => {
    const fixture = TestBed.createComponent(Chibi);
    const appearance = createMockSnapshot().character.appearance;
    for (const presentation of ['male', 'female'] as const) {
      for (const outfit of CHARACTER_OPTIONS.outfit) {
        for (const body of CHARACTER_OPTIONS.body) {
          fixture.componentRef.setInput('appearance', {
            ...appearance, presentation, hair: presentation === 'male' ? 'm-topknot' : 'f-long',
            outfit: outfit.id, body: body.id,
          });
          await fixture.whenStable();
          const root = fixture.nativeElement as HTMLElement;
          expect(root.querySelector('[data-slot="outfit"]')!.getAttribute('data-variant')).toBe(outfit.id);
          expect(root.querySelector('[data-slot="body"]')!.getAttribute('data-variant')).toBe(body.id);
          expect(root.querySelector('.near-arm')).not.toBeNull();
          expect(root.querySelector('.gesture-head')).not.toBeNull();
        }
      }
    }
  });

  it('renders a complete distinct set of clothing, sleeves and footwear for every outfit', async () => {
    const fixture = TestBed.createComponent(Chibi);
    const appearance = createMockSnapshot().character.appearance;
    const footwear = new Set<string>();
    const sleeves = new Set<string>();
    for (const outfit of CHARACTER_OPTIONS.outfit) {
      fixture.componentRef.setInput('appearance', { ...appearance, outfit: outfit.id });
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const legs = root.querySelector('[data-slot="legs"]')!;
      const arm = root.querySelector('[data-slot="near-arm"]')!;
      footwear.add(legs.innerHTML);
      sleeves.add(arm.innerHTML);
      expect(legs.querySelectorAll('path').length).toBeGreaterThan(3);
      expect(arm.querySelectorAll('path').length).toBeGreaterThan(2);
      expect(root.querySelector('[data-layer="torso-base"]')!.getAttribute('fill')).toBe(appearance.outfitColor);
    }
    expect(footwear.size).toBe(5);
    expect(sleeves.size).toBe(5);
  });

  it('gives the male face strong brows and a neck without feminine blush or an oversized head', async () => {
    const fixture = TestBed.createComponent(Chibi);
    const appearance = { ...createMockSnapshot().character.appearance, presentation: 'male', hair: 'm-topknot' };
    fixture.componentRef.setInput('appearance', appearance);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const neck = root.querySelector('[data-slot="neck"] path')!.getAttribute('d');
    const brows = Number(root.querySelector('[data-layer="brows"]')!.getAttribute('stroke-width'));
    expect(root.querySelector('[data-layer="blush"]')).toBeNull();
    expect(root.querySelector('.head-proportions')!.getAttribute('transform')).toContain('scale(.78)');
    expect(root.querySelector('.presence-pose')!.getAttribute('transform')).toBe('');
    fixture.componentRef.setInput('appearance', { ...appearance, presentation: 'female', hair: 'f-pixie' });
    await fixture.whenStable();
    expect(root.querySelector('[data-slot="neck"] path')!.getAttribute('d')).not.toBe(neck);
    expect(Number(root.querySelector('[data-layer="brows"]')!.getAttribute('stroke-width'))).toBeLessThan(brows);
  });
});
