import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { createMockSnapshot } from '../data/mock-data';
import { buildProgressionHorizon } from '../domain/progression-horizon';
import { ProgressionHorizonPanel } from './progression-horizon';

describe('progression horizon panel', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('shows only the known encounter, a real reward and read-only links at the start', async () => {
    const snapshot = createMockSnapshot();
    snapshot.character.totalXp = 0;
    const before = structuredClone(snapshot);
    const fixture = TestBed.createComponent(ProgressionHorizonPanel);
    fixture.componentRef.setInput('goals', buildProgressionHorizon(snapshot));
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Der Mooswächter');
    expect(element.textContent).toContain('Waldkrone');
    expect(element.textContent).toContain('Beim ersten Sieg auf Normal');
    expect(element.textContent).toContain('Rosenlicht');
    expect(element.textContent).toContain('Level 5');
    expect(element.textContent).not.toContain('Glutwyrm');
    expect(element.textContent).not.toContain('jetzt antreten');
    expect([...element.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual([
      '/battle', '/character/create#aura-rewards',
    ]);
    expect(element.querySelector('button')).toBeNull();
    expect(snapshot).toEqual(before);
  });

  it('distinguishes access from victory and removes an owned reward when inputs change', async () => {
    const snapshot = createMockSnapshot();
    const fixture = TestBed.createComponent(ProgressionHorizonPanel);
    fixture.componentRef.setInput('goals', buildProgressionHorizon(snapshot));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Du kannst die Begegnung jetzt antreten.');
    expect(fixture.nativeElement.textContent).toContain('Das Level garantiert keinen Sieg.');
    const next = { ...snapshot, bossProgress: { clearedEncounterIds: [], unlockedCosmetics: ['moss-crown'] } };
    fixture.componentRef.setInput('goals', buildProgressionHorizon(next));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Waldkrone');
    expect(fixture.nativeElement.querySelector('app-boss-loot-art')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nordlicht');
  });
  it('renders the female reward name and image while keeping the preview read-only', async () => {
    const snapshot = createMockSnapshot();
    snapshot.character.appearance.presentation = 'female';
    const original = structuredClone(snapshot);
    const fixture = TestBed.createComponent(ProgressionHorizonPanel);
    fixture.componentRef.setInput('goals', buildProgressionHorizon(snapshot));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.reward strong')!.textContent).toBe('Waldkrone · Jade-Seitenzopf');
    expect(root.querySelector('app-boss-loot-art img')!.getAttribute('src')).toBe('/art/loot/moss-crown-female-v1.webp');
    expect(root.querySelector('button')).toBeNull();
    expect(snapshot).toEqual(original);
  });

  it('keeps the level-fifty chapter finale available without Plus even though level fifty-five is recommended', async () => {
    const snapshot = createMockSnapshot();
    snapshot.character.totalXp = 294000;
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal', 'emberwyrm:normal',
      'dusk-prowler:normal', 'frost-titan:normal'], unlockedCosmetics: [] };
    const fixture = TestBed.createComponent(ProgressionHorizonPanel);
    fixture.componentRef.setInput('goals', buildProgressionHorizon(snapshot));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Der Wolkenkönig');
    expect(root.textContent).toContain('empfohlen: 55');
    expect(root.textContent).toContain('jetzt antreten');
    expect(root.querySelector('a')!.getAttribute('href')).toBe('/battle');
    expect(root.textContent).not.toContain('benötigt Plus');
  });

  it('requires confirmed Plus or explicit preview access beyond level fifty without granting rewards or revealing later bosses', async () => {
    const snapshot = createMockSnapshot();
    snapshot.character.totalXp = 413000;
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal', 'emberwyrm:normal',
      'dusk-prowler:normal', 'frost-titan:normal', 'cloud-sovereign:normal'], unlockedCosmetics: [] };
    const before = structuredClone(snapshot);
    const fixture = TestBed.createComponent(ProgressionHorizonPanel);
    fixture.componentRef.setInput('goals', buildProgressionHorizon(snapshot));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Die Blutmondregentin');
    expect(root.textContent).toContain('benötigt Plus');
    expect(root.textContent).toContain('Das nötige Level hast du bereits erreicht.');
    expect(root.textContent).not.toContain('jetzt antreten');
    expect(root.querySelector('a')!.getAttribute('href')).toBe('/membership');
    expect(root.querySelector('app-boss-loot-art')).not.toBeNull();
    expect(root.textContent).not.toContain('Sternensouverän');
    expect(root.textContent).not.toContain('Aureon');

    fixture.componentRef.setInput('plusAccess', true);
    await fixture.whenStable();
    expect(root.textContent).toContain('Zugang freigegeben');
    expect(root.textContent).toContain('jetzt antreten');
    expect(root.querySelector('a')!.getAttribute('href')).toBe('/battle');

    fixture.componentRef.setInput('plusAccess', false);
    fixture.componentRef.setInput('goals', buildProgressionHorizon({ ...snapshot,
      bossProgress: { ...snapshot.bossProgress!, unlockedCosmetics: ['bloodmoon-crown'] } }));
    await fixture.whenStable();
    expect(root.textContent).not.toContain('jetzt antreten');
    expect(root.querySelector('a')!.getAttribute('href')).toBe('/membership');
    expect(root.querySelector('app-boss-loot-art')).toBeNull();
    expect(root.querySelector('button')).toBeNull();
    expect(snapshot).toEqual(before);
  });

  it('shows the remaining level progress for a Plus boss without claiming XP alone unlocks access', async () => {
    const snapshot = createMockSnapshot();
    snapshot.character.totalXp = 294000;
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal', 'emberwyrm:normal',
      'dusk-prowler:normal', 'frost-titan:normal', 'cloud-sovereign:normal'], unlockedCosmetics: [] };
    const fixture = TestBed.createComponent(ProgressionHorizonPanel);
    fixture.componentRef.setInput('goals', buildProgressionHorizon(snapshot));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('progress')!.getAttribute('max')).toBe('413000');
    expect(root.querySelector('progress')!.getAttribute('value')).toBe('294000');
    expect(root.textContent).toContain('bis Level 60');
    expect(root.textContent).toContain('benötigt Plus');
    expect(root.textContent).not.toContain('bis zum Zugang');
    expect(root.textContent).not.toContain('jetzt antreten');
    fixture.componentRef.setInput('plusAccess', true);
    await fixture.whenStable();
    expect(root.querySelector('a')!.getAttribute('href')).toBe('/battle');
    expect(root.textContent).not.toContain('jetzt antreten');
  });

});
