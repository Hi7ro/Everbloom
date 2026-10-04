import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { GAME_DAY_CLOCK } from '../../data/game-clock';
import { GAME_REPOSITORY } from '../../data/game.repository';
import { MockGameRepository } from '../../data/mock-game.repository';
import { BattleArena, BATTLE_STAGE_FACTORY } from './battle-arena';
import { BattlePage } from './battle.page';

describe('battle page', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BattlePage],
      providers: [
        provideRouter([]),
        { provide: BROWSER_STORAGE, useValue: null },
        { provide: GAME_DAY_CLOCK, useValue: () => '2026-10-04' },
        { provide: GAME_REPOSITORY, useClass: MockGameRepository },
        { provide: BATTLE_STAGE_FACTORY, useValue: async () => ({ setPose: vi.fn(), setMotion: vi.fn(), destroy: vi.fn() }) },
      ],
    });
  });

  it('renders current character stats, plays a single turn, and reports a reward-free result', async () => {
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const before = structuredClone(page.game.snapshot());
    const repository = TestBed.inject(GAME_REPOSITORY);
    const record = vi.spyOn(repository, 'record');
    const profile = vi.spyOn(repository, 'updateCharacter');
    const root = fixture.nativeElement as HTMLElement;
    const button = (label: string) => Array.from(root.querySelectorAll('button')).find(b => b.textContent?.trim() === label)!;
    expect(root.textContent).toContain('Probekampf ohne Belohnungen');
    expect(root.textContent).toContain('396 / 396 HP');
    expect(root.textContent).toContain('560 / 560 HP');
    button('Einzelner Zug →').click();
    await fixture.whenStable();
    expect(page.battle.cursor()).toBe(1);
    const arena = fixture.debugElement.query(By.directive(BattleArena)).componentInstance as BattleArena;
    expect(arena.heroPose()).toBe('attack');
    expect(arena.bossPose()).toBe('hit');
    expect(arena.motion()).toBe(false);
    button('Zum Ergebnis').click();
    await fixture.whenStable();
    expect(root.textContent).toContain('Die Lichtung gehört dir.');
    expect(button('Zum Ergebnis').disabled).toBe(true);
    expect(page.game.snapshot()).toEqual(before);
    expect(record).not.toHaveBeenCalled();
    expect(profile).not.toHaveBeenCalled();
    expect(root.querySelectorAll('.log-card li').length).toBe(6);
    button('Mit aktuellen Werten vorbereiten').click();
    await fixture.whenStable();
    expect(page.battle.cursor()).toBe(0);
    expect(root.textContent).toContain('396 / 396 HP');
    expect(root.querySelector('.result-card')).toBeNull();
  });

  it('shows a retryable loading error instead of starting a fabricated battle', async () => {
    const repository = TestBed.inject(GAME_REPOSITORY);
    vi.spyOn(repository, 'load').mockRejectedValueOnce(new Error('Spielstand nicht erreichbar.'));
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('nicht erreichbar');
    expect(fixture.componentInstance.battle.replay()).toBeNull();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.battle.replay()).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-battle-arena')).not.toBeNull();
  });

  it('lets the player set a tactic before combat and freezes it for the replay', async () => {
    const fixture = TestBed.createComponent(BattlePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    root.querySelectorAll<HTMLButtonElement>('.tactic-options button')[1].click();
    await fixture.whenStable();
    expect(page.battle.replay()!.tactic).toBe('power');
    expect(page.battle.replay()!.hero.stats.attack).toBe(124);
    page.battle.step();
    await fixture.whenStable();
    expect(root.querySelector<HTMLFieldSetElement>('.tactics')!.disabled).toBe(true);
    page.chooseTactic('guard');
    expect(page.battle.replay()!.tactic).toBe('power');
    page.newBattle();
    page.chooseTactic('guard');
    expect(page.battle.replay()!.tactic).toBe('guard');
  });
});
