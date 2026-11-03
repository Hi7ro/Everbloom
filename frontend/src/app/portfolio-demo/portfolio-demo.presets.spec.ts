import { TestBed } from '@angular/core/testing';
import { ACCOUNT_MODE } from '../data/account-mode';
import { BROWSER_STORAGE } from '../data/browser-storage';
import { GAME_DAY_CLOCK } from '../data/game-clock';
import { discoveredBosses } from '../domain/boss-catalog';
import { PortfolioDemoRepository } from './portfolio-demo.repository';
import { createPortfolioExample, DEMO_PRESET } from './portfolio-demo.presets';
import { exampleUrl, PortfolioDemoApp } from './portfolio-demo.app';
import { portfolioDemoConfig } from './portfolio-demo.config';
import { GameStore } from '../state/game.store';
import { Router } from '@angular/router';

describe('full local application example states', () => {
  it('offers the campaign finale and all late-game encounters as explicitly prepared states', () => {
    expect(
      discoveredBosses(createPortfolioExample('2026-11-03', 'campaign')).map((boss) => boss.id),
    ).toEqual(['mosswarden', 'emberwyrm', 'dusk-prowler', 'frost-titan', 'cloud-sovereign']);
    expect(discoveredBosses(createPortfolioExample('2026-11-03', 'endgame'))).toHaveLength(10);
  });

  it('can play the final Ultimate encounter with the real combat resolver and session-only loot', async () => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioDemoRepository,
        { provide: ACCOUNT_MODE, useValue: false },
        { provide: BROWSER_STORAGE, useValue: null },
        { provide: DEMO_PRESET, useValue: 'endgame' },
        { provide: GAME_DAY_CLOCK, useValue: () => '2026-11-03' },
      ],
    });
    const repository = TestBed.inject(PortfolioDemoRepository);
    const result = await repository.fightBoss({
      requestId: 'final-ultimate',
      bossId: 'relic-sovereign',
      difficulty: 'ultimate',
      tactic: 'balanced',
    });
    expect(result.replay.outcome).toBe('victory');
    expect(result.firstClear).toBe(true);
    expect(result.reward?.id).toBe('imperial-gate');
    expect(result.snapshot.unlockedAuras).toContain('imperial-gate');
    expect(result.snapshot.bossProgress?.clearedEncounterIds).toContain('relic-sovereign:ultimate');
  });

  it.each([
    ['everyday', 'Alltag · Level 12', 12],
    ['campaign', 'Kampagne · Level 50', 50],
    ['endgame', 'Späte Reise · Level 130', 130],
  ])(
    'shows the active %s example in the select after the application renders',
    async (preset, label, level) => {
      TestBed.configureTestingModule({
        imports: [PortfolioDemoApp],
        providers: [...portfolioDemoConfig.providers, { provide: DEMO_PRESET, useValue: preset }],
      });
      const game = TestBed.inject(GameStore);
      await game.load();
      const fixture = TestBed.createComponent(PortfolioDemoApp);
      await fixture.whenStable();
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('.local-mode select');
      expect(game.level().level).toBe(level);
      expect(select.value).toBe(preset);
      expect(select.selectedOptions[0]?.textContent?.trim()).toBe(label);
    },
  );

  it('navigates from the Level-130 dashboard to the real membership page in the complete local shell', async () => {
    TestBed.configureTestingModule({ imports: [PortfolioDemoApp], providers: [...portfolioDemoConfig.providers, { provide: DEMO_PRESET, useValue: 'endgame' }] });
    const fixture = TestBed.createComponent(PortfolioDemoApp);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector('a.membership-teaser') as HTMLAnchorElement;
    expect(TestBed.inject(GameStore).level().level).toBe(130);
    link.click();
    await fixture.whenStable();
    expect(router.url).toBe('/membership');
    expect(fixture.nativeElement.querySelector('#membership-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.local-mode select').value).toBe('endgame');
  });

  it('changes only the local example selector and returns to the full dashboard', () => {
    expect(exampleUrl('https://portfolio.example/demos/herovera/#/battle', 'campaign')).toBe(
      'https://portfolio.example/demos/herovera/?example=campaign#/dashboard',
    );
  });
});
