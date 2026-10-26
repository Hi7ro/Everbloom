import { TestBed } from '@angular/core/testing';
import { BOSS_COSMETICS, bossFirstClearReward, resolveBossCosmetic } from '../domain/boss-loot';
import { BOSS_LOOT_ART } from '../rendering/boss-loot-art';
import { BossLootArt } from './boss-loot-art';

describe('boss collection illustrations', () => {
  it('maps every real cosmetic to a versioned mobile image without borrowing another reward image', () => {
    expect(Object.keys(BOSS_LOOT_ART).sort()).toEqual(BOSS_COSMETICS.map(item => item.id).sort());
    expect(new Set(Object.values(BOSS_LOOT_ART)).size).toBe(40);
    for (const path of Object.values(BOSS_LOOT_ART)) expect(path).toMatch(/^\/art\/loot\/[a-z-]+-v[1-9]\d*\.webp$/);
  });

  it('labels collection art and lazily decodes it without altering the reward', async () => {
    const fixture = TestBed.createComponent(BossLootArt);
    const reward = bossFirstClearReward('mosswarden', 'normal');
    const before = structuredClone(reward);
    fixture.componentRef.setInput('reward', reward);
    await fixture.whenStable();
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('/art/loot/moss-crown-v1.webp');
    expect(image.alt).toBe('Waldkrone · Sammlungsillustration');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('decoding')).toBe('async');
    expect(reward).toEqual(before);
  });

  it('keeps an accessible fallback on a failed image and retries when choosing another item', async () => {
    const fixture = TestBed.createComponent(BossLootArt);
    fixture.componentRef.setInput('reward', bossFirstClearReward('mosswarden', 'normal'));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe('Waldkrone');
    fixture.componentRef.setInput('reward', bossFirstClearReward('emberwyrm', 'normal'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/art/loot/ember-crown-v1.webp');
  });

  it('does not let a delayed error from a previous reward hide the next reward', async () => {
    const fixture = TestBed.createComponent(BossLootArt);
    fixture.componentRef.setInput('reward', bossFirstClearReward('mosswarden', 'normal'));
    await fixture.whenStable();
    const previous = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    fixture.componentRef.setInput('reward', bossFirstClearReward('emberwyrm', 'normal'));
    await fixture.whenStable();
    previous.dispatchEvent(new Event('error'));
    fixture.componentInstance.artworkFailed('/art/loot/moss-crown-v1.webp');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/art/loot/ember-crown-v1.webp');
    expect(fixture.nativeElement.querySelector('.fallback')).toBeNull();
  });
  it('uses distinct female equipment art, preserves male version exceptions and leaves aura art shared', async () => {
    const fixture = TestBed.createComponent(BossLootArt);
    for (const family of BOSS_COSMETICS) {
      for (const presentation of ['male', 'female'] as const) {
        const reward = resolveBossCosmetic(family.id, presentation)!;
        fixture.componentRef.setInput('reward', reward);
        await fixture.whenStable();
        const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
        expect(image.getAttribute('src')).toBe(presentation === 'female' && family.slot !== 'aura'
          ? `/art/loot/${family.id}-female-v1.webp` : BOSS_LOOT_ART[family.id]);
        expect(image.alt).toBe(`${reward.name} · Sammlungsillustration`);
      }
    }
    fixture.componentRef.setInput('reward', resolveBossCosmetic('astral-regalia', 'male'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/art/loot/astral-regalia-v2.webp');
    fixture.componentRef.setInput('reward', resolveBossCosmetic('glacier-guard', 'male'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/art/loot/glacier-guard-v2.webp');
  });

  it('retries the same family after a presentation change and ignores a late failure of its former form', async () => {
    const fixture = TestBed.createComponent(BossLootArt);
    fixture.componentRef.setInput('reward', resolveBossCosmetic('moss-crown', 'male'));
    await fixture.whenStable();
    const previous = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    previous.dispatchEvent(new Event('error')); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.fallback').getAttribute('aria-label')).toBe('Waldkrone · Jade-Topknot');
    fixture.componentRef.setInput('reward', resolveBossCosmetic('moss-crown', 'female'));
    await fixture.whenStable();
    previous.dispatchEvent(new Event('error'));
    fixture.componentInstance.artworkFailed('/art/loot/moss-crown-v1.webp');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/art/loot/moss-crown-female-v1.webp');
    expect(fixture.nativeElement.querySelector('.fallback')).toBeNull();
  });

});
