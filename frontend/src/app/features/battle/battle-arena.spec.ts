import { TestBed } from '@angular/core/testing';
import { createMockSnapshot } from '../../data/mock-data';
import { BattleArena, BATTLE_STAGE_FACTORY } from './battle-arena';

describe('battle renderer boundary', () => {
  const stage = () => ({ setPose: vi.fn(), setMotion: vi.fn(), destroy: vi.fn() });
  function create(factory: unknown) {
    TestBed.configureTestingModule({ imports: [BattleArena], providers: [{ provide: BATTLE_STAGE_FACTORY, useValue: factory }] });
    const fixture = TestBed.createComponent(BattleArena);
    fixture.componentRef.setInput('appearance', createMockSnapshot().character.appearance);
    fixture.detectChanges();
    return fixture;
  }

  it('updates motion and action without decoding a second copy of the art', async () => {
    const actorStage = stage();
    const factory = vi.fn().mockResolvedValue(actorStage);
    const fixture = create(factory);
    await fixture.whenStable();
    fixture.componentRef.setInput('motion', false);
    fixture.componentRef.setInput('heroPose', 'attack');
    fixture.componentRef.setInput('bossPose', 'hit');
    await fixture.whenStable();
    expect(factory).toHaveBeenCalledOnce();
    expect(actorStage.setMotion).toHaveBeenLastCalledWith(false);
    expect(actorStage.setPose).toHaveBeenCalledWith('hero', 'attack');
    expect(actorStage.setPose).toHaveBeenCalledWith('boss', 'hit');
    fixture.destroy();
    expect(actorStage.destroy).toHaveBeenCalledOnce();
  });

  it('keeps an accessible static scene if the GPU renderer fails', async () => {
    const fixture = create(vi.fn().mockRejectedValue(new Error('WebGL unavailable')));
    await vi.waitFor(() => expect(fixture.componentInstance.failed()).toBe(true));
    await fixture.whenStable();
    expect(fixture.componentInstance.ready()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Statische Ansicht');
    expect(fixture.nativeElement.querySelector('app-character-portrait')).not.toBeNull();
  });

  it('destroys a renderer that finishes loading after its page was left', async () => {
    const actorStage = stage();
    let finish!: (value: ReturnType<typeof stage>) => void;
    const factory = vi.fn().mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const fixture = create(factory);
    fixture.detectChanges();
    fixture.destroy();
    expect(factory.mock.calls[0][1].signal.aborted).toBe(true);
    finish(actorStage);
    await Promise.resolve();
    expect(actorStage.destroy).toHaveBeenCalledOnce();
  });
});
