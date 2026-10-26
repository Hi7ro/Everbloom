import { signal } from '@angular/core';
import { TestBed, DeferBlockBehavior, DeferBlockState } from '@angular/core/testing';
import { createMockSnapshot } from '../data/mock-data';
import { BOSS_COSMETICS, bossFirstClearReward, resolveBossCosmetic } from '../domain/boss-loot';
import { GameStore } from '../state/game.store';
import { BossLootCollection } from './boss-loot-collection';

describe('boss loot collection', () => {
  async function create() {
    const snapshot = createMockSnapshot();
    snapshot.bossProgress = { clearedEncounterIds: ['mosswarden:normal'], unlockedCosmetics: ['moss-crown'] };
    const state = signal(snapshot);
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual, imports: [BossLootCollection], providers: [{ provide: GameStore, useValue: { snapshot: state, busy: signal(false) } }] });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(BossLootCollection);
    fixture.componentRef.setInput('appearance', snapshot.character.appearance);
    return { fixture, snapshot, state };
  }
  it('distinguishes collection illustrations from actual chibi previews and preserves earned-item gating', async () => {
    const { fixture } = await create();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('app-boss-loot-art')).toHaveLength(4);
    expect(root.querySelectorAll('details summary')).toHaveLength(4);
    expect(root.querySelector('summary')!.textContent).toContain('An deinem Chibi');
    expect(root.querySelector('.art-label')!.textContent).toBe('Männliche Ausführung');
    const picked = vi.fn(); fixture.componentInstance.picked.subscribe(picked);
    const buttons = root.querySelectorAll<HTMLButtonElement>('article button');
    expect(buttons[0].disabled).toBe(false); expect(buttons[1].disabled).toBe(true);
    buttons[0].click(); expect(picked).toHaveBeenCalledExactlyOnceWith('moss-crown');
  });
  it('hides future bosses and their artwork until the preceding boss is actually cleared', async () => {
    const { fixture, snapshot, state } = await create();
    snapshot.bossProgress = { clearedEncounterIds: [], unlockedCosmetics: [] };
    await fixture.whenStable();
    expect(fixture.componentInstance.rewards().map(item => item.id)).toEqual(['moss-crown', 'verdant-warden']);
    expect(fixture.nativeElement.textContent).not.toContain('Glutkrone');
    expect(fixture.nativeElement.textContent).not.toContain('Frostkrone');
    expect(fixture.nativeElement.querySelector('img[src*="cloud-crown"]')).toBeNull();
    const next = structuredClone(snapshot);
    next.bossProgress = { clearedEncounterIds: ['mosswarden:hard'], unlockedCosmetics: [] };
    state.set(next);
    await fixture.whenStable();
    expect(fixture.componentInstance.rewards().map(item => item.id)).toEqual(['moss-crown', 'verdant-warden', 'ember-crown', 'cinder-forged']);
    expect(fixture.nativeElement.textContent).toContain('Glutkrone');
    expect(fixture.nativeElement.textContent).not.toContain('Sternenkrone');
  });
  it('keeps historically owned styles and auras usable without revealing unearned future rewards', async () => {
    const { fixture, snapshot, state } = await create();
    const old = structuredClone(snapshot);
    old.bossProgress = {
      clearedEncounterIds: ['mosswarden:normal', 'emberwyrm:normal', 'astral-sovereign:ultimate'],
      unlockedCosmetics: ['astral-crown', 'astral-regalia', 'celestial-wings'],
    };
    old.unlockedAuras = ['angel'];
    state.set(old);
    const picked = vi.fn(); fixture.componentInstance.picked.subscribe(picked);
    await fixture.whenStable();
    const collection = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    expect(collection.rewards().filter(item => item.bossId === 'astral-sovereign').map(item => item.id))
      .toEqual(['astral-crown', 'astral-regalia']);
    expect(collection.rewards().some(item => item.bossId === 'cloud-sovereign')).toBe(false);
    for (const name of ['Sternenkrone · Curtains', 'Mantel des Sternengelehrten']) {
      const card = [...root.querySelectorAll('article')].find(item => item.querySelector('h4')?.textContent === name)!;
      const button = card.querySelector('button')!;
      expect(button.disabled).toBe(false); button.click();
    }
    expect(picked.mock.calls).toEqual([['astral-crown'], ['astral-regalia']]);
    fixture.componentRef.setInput('kind', 'aura');
    await fixture.whenStable();
    expect(collection.rewards().filter(item => item.bossId === 'astral-sovereign').map(item => item.id))
      .toEqual(['celestial-wings']);
    expect(root.textContent).not.toContain('Unendliche Sternenspuren');
    const wing = [...root.querySelectorAll('article')].find(item => item.querySelector('h4')?.textContent === 'Himmelsschwingen')!;
    expect(wing.querySelector('button')!.disabled).toBe(false);
    wing.querySelector('button')!.click();
    expect(picked).toHaveBeenLastCalledWith('celestial-wings');
    expect(old.bossProgress.clearedEncounterIds).toEqual(['mosswarden:normal', 'emberwyrm:normal', 'astral-sovereign:ultimate']);
  });
  it('uses real cosmetic slots and aura effects for previews without changing the current character', async () => {
    const { fixture, snapshot } = await create();
    await fixture.whenStable();
    const original = structuredClone(snapshot.character.appearance);
    const collection = fixture.componentInstance;
    expect(collection.preview(bossFirstClearReward('mosswarden', 'normal')).cosmeticHair).toBe('moss-crown');
    expect(collection.preview(bossFirstClearReward('emberwyrm', 'hard')).cosmeticOutfit).toBe('cinder-forged');
    const aura = collection.preview(bossFirstClearReward('astral-sovereign', 'ultimate'));
    expect(aura.aura).toBe('angel'); expect(aura.cosmeticOutfit).toBe(original.cosmeticOutfit);
    expect(snapshot.character.appearance).toEqual(original);
  });
  it('explains all ten outfit editions and equips their reward IDs without changing the previewed profile', async () => {
    const { fixture, snapshot, state } = await create();
    const sets = BOSS_COSMETICS.filter(item => item.slot === 'outfit');
    const allSets = structuredClone(snapshot);
    allSets.bossProgress = { clearedEncounterIds: sets.map(item => `${item.bossId}:hard`), unlockedCosmetics: sets.map(item => item.id) };
    state.set(allSets);
    const original = structuredClone(snapshot.character.appearance);
    const picked = vi.fn(); fixture.componentInstance.picked.subscribe(picked);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(Array.from(root.querySelectorAll('.style-description')).map(item => item.textContent)).toEqual(sets.map(item => item.description));
    expect(root.textContent).toContain('Nordlicht-Abenteurerjacke');
    expect(root.textContent).not.toContain('Gletscherrüstung');
    const articles = Array.from(root.querySelectorAll('article'));
    for (const reward of sets) {
      const card = articles.find(item => item.querySelector('h4')?.textContent === resolveBossCosmetic(reward.id, 'male')!.name)!;
      const button = card.querySelector('button')!;
      expect(button.disabled).toBe(false);
      button.click();
      expect(picked).toHaveBeenLastCalledWith(reward.id);
      expect(fixture.componentInstance.preview(reward).cosmeticOutfit).toBe(reward.id);
    }
    expect(picked).toHaveBeenCalledTimes(10);
    expect(snapshot.character.appearance).toEqual(original);
  });
  it('switches an earned family to the matching female form without unlocking its locked counterpart or changing saved ownership', async () => {
    const { fixture, snapshot } = await create();
    const original = structuredClone(snapshot);
    const picked = vi.fn(); fixture.componentInstance.picked.subscribe(picked);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const maleImage = root.querySelector('article img') as HTMLImageElement;
    expect(maleImage.getAttribute('src')).toBe('/art/loot/moss-crown-v1.webp');
    fixture.componentRef.setInput('appearance', { ...snapshot.character.appearance, presentation: 'female',
      illustration: 'moonblade', hair: 'f-waves', cosmeticHair: 'moss-crown' });
    await fixture.whenStable();
    const cards = root.querySelectorAll('article');
    expect(cards[0].querySelector('h4')!.textContent).toBe('Waldkrone · Jade-Seitenzopf');
    expect(cards[0].querySelector('.art-label')!.textContent).toBe('Weibliche Ausführung');
    expect(cards[0].querySelector('img')!.getAttribute('src')).toBe('/art/loot/moss-crown-female-v1.webp');
    expect(cards[0].querySelector('button')!.getAttribute('aria-pressed')).toBe('true');
    expect(cards[0].querySelector('button')!.disabled).toBe(false);
    expect(cards[1].querySelector('button')!.disabled).toBe(true);
    cards[1].querySelector('button')!.click(); expect(picked).not.toHaveBeenCalled();
    cards[0].querySelector('button')!.click(); expect(picked).toHaveBeenCalledExactlyOnceWith('moss-crown');
    const previews = await fixture.getDeferBlocks();
    await previews[0].render(DeferBlockState.Complete);
    await fixture.whenStable();
    expect(cards[0].querySelector('app-character-portrait')).not.toBeNull();
    expect(fixture.componentInstance.preview(fixture.componentInstance.rewards()[0])).toMatchObject({
      presentation: 'female', cosmeticHair: 'moss-crown', illustration: 'moonblade',
    });
    expect(snapshot).toEqual(original);
  });

});
