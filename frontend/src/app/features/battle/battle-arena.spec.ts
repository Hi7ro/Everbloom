import { TestBed } from '@angular/core/testing';
import { createMockSnapshot } from '../../data/mock-data';
import { BattleArena, BATTLE_STAGE_FACTORY } from './battle-arena';

describe('battle renderer boundary', () => {
  const stage = () => ({ setPose: vi.fn(), setTurn: vi.fn(), setMotion: vi.fn(), setVisualProfile: vi.fn(), setBossAbility: vi.fn(), destroy: vi.fn() });
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

  it('releases the static portrait and its SVG masks after the canvas is ready', async () => {
    let finish!: (value: ReturnType<typeof stage>) => void;
    const fixture = create(() => new Promise(resolve => { finish = resolve; }));
    expect(fixture.nativeElement.querySelector('.fallback app-character-portrait')).not.toBeNull();
    finish(stage());
    await vi.waitFor(() => expect(fixture.componentInstance.ready()).toBe(true));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.fallback')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-character-portrait')).toBeNull();
    expect(fixture.nativeElement.querySelector('.canvas-host')).not.toBeNull();
  });

  it('delivers consecutive same-attacker turns after their poses and replaces each damage cue', async () => {
    const actorStage = stage(), factory = vi.fn().mockResolvedValue(actorStage);
    const fixture = create(factory); await fixture.whenStable();
    fixture.componentRef.setInput('heroPose', 'attack'); fixture.componentRef.setInput('bossPose', 'hit');
    const first = { index: 1, actor: 'hero', damage: 25, healing: 0, critical: false, label: 'Erster Schlag' };
    fixture.componentRef.setInput('turn', first); await fixture.whenStable();
    const firstDamage = fixture.nativeElement.querySelector('.damage-pop');
    const second = { ...first, index: 2, damage: 31, label: 'Zweiter Schlag' };
    fixture.componentRef.setInput('turn', second); await fixture.whenStable();
    expect(actorStage.setTurn).toHaveBeenLastCalledWith(second);
    const eventOrder = actorStage.setTurn.mock.invocationCallOrder.at(-1)!;
    expect(actorStage.setPose.mock.invocationCallOrder.at(-1)).toBeLessThan(eventOrder);
    expect(actorStage.setBossAbility.mock.invocationCallOrder.at(-1)).toBeLessThan(eventOrder);
    expect(fixture.nativeElement.querySelector('.damage-pop')).not.toBe(firstDamage);
    expect(fixture.nativeElement.querySelector('.damage-pop').textContent).toContain('−31');
    expect(fixture.nativeElement.querySelector('.combat-cue').textContent).toContain('Zweiter Schlag');
    expect(factory).toHaveBeenCalledOnce();
  });

  it('keeps turn identity when motion is paused or resumed and sends null when the replay resets', async () => {
    const actorStage = stage(), factory = vi.fn().mockResolvedValue(actorStage);
    const fixture = create(factory); await fixture.whenStable();
    const turn = { index: 7, actor: 'boss', damage: 19, healing: 0, critical: false, label: 'Wurzelschlag' };
    fixture.componentRef.setInput('heroPose', 'hit'); fixture.componentRef.setInput('bossPose', 'attack');
    fixture.componentRef.setInput('turn', turn); await fixture.whenStable();
    const hit = fixture.nativeElement.querySelector('.damage-pop');
    actorStage.setTurn.mockClear();
    for (const motion of [false, true]) {
      fixture.componentRef.setInput('motion', motion); await fixture.whenStable();
      expect(actorStage.setTurn).toHaveBeenLastCalledWith(turn);
      expect(fixture.nativeElement.querySelector('.damage-pop')).toBe(hit);
    }
    expect(actorStage.setTurn.mock.calls.every(([value]) => value.index === 7)).toBe(true);
    fixture.componentRef.setInput('turn', null); await fixture.whenStable();
    expect(actorStage.setTurn).toHaveBeenLastCalledWith(null);
    expect(fixture.nativeElement.querySelector('.damage-pop')).toBeNull();
    expect(fixture.nativeElement.querySelector('.combat-cue')).toBeNull();
    expect(factory).toHaveBeenCalledOnce();
  });

  it('updates the skill effect without reloading art and shows damage at its actual target', async () => {
    const actorStage = stage();
    const factory = vi.fn().mockResolvedValue(actorStage);
    const fixture = create(factory);
    await fixture.whenStable();
    const profile = { style: 'martial', tier: 2, abilityName: 'Wirbelkombo', skillId: 'boxing', skillName: 'Boxing' };
    fixture.componentRef.setInput('visualProfile', profile);
    fixture.componentRef.setInput('turn', { index: 1, actor: 'hero', damage: 42, healing: 0, critical: true });
    fixture.componentRef.setInput('motion', false);
    await fixture.whenStable();
    expect(factory).toHaveBeenCalledOnce();
    expect(actorStage.setVisualProfile).toHaveBeenLastCalledWith(profile);
    expect(fixture.nativeElement.querySelector('.ability-label').textContent).toContain('Wirbelkombo');
    expect(fixture.nativeElement.querySelector('.damage-pop').textContent).toContain('−42');
    expect(fixture.nativeElement.querySelector('.damage-pop.at-hero')).toBeNull();
    expect(fixture.nativeElement.querySelector('.damage-pop.animated')).toBeNull();
    fixture.componentRef.setInput('turn', { index: 2, actor: 'boss', damage: 19, healing: 0, critical: false });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.damage-pop.at-hero').textContent).toContain('−19');
    fixture.componentRef.setInput('turn', null);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.damage-pop')).toBeNull();
  });

  it('keeps an accessible static scene if the GPU renderer fails', async () => {
    const fixture = create(vi.fn().mockRejectedValue(new Error('WebGL unavailable')));
    await vi.waitFor(() => expect(fixture.componentInstance.failed()).toBe(true));
    await fixture.whenStable();
    expect(fixture.componentInstance.ready()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Statische Ansicht');
    expect(fixture.nativeElement.querySelector('app-character-portrait')).not.toBeNull();
  });

  it('shows a draining attack as damage on the hero and healing on the boss', async () => {
    const fixture = create(vi.fn().mockResolvedValue(stage()));
    fixture.componentRef.setInput('turn', { index: 8, actor: 'boss', damage: 176, healing: 28, critical: false, label: 'Mondfinsternis' });
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.damage-pop')).toHaveLength(2);
    expect(root.querySelector('.damage-pop.at-hero')!.textContent).toContain('−176');
    expect(root.querySelector('.damage-pop.healing')!.textContent).toContain('+28');
    expect(root.querySelector('.damage-pop.healing')!.classList.contains('at-hero')).toBe(false);
  });

  it('rebuilds only when the boss changes and gives each fallback its own art and accessible name', async () => {
    const first = stage();
    const factory = vi.fn().mockResolvedValueOnce(first).mockRejectedValueOnce(new Error('GPU unavailable'));
    const fixture = create(factory);
    await fixture.whenStable();
    fixture.componentRef.setInput('bossId', 'emberwyrm');
    await fixture.whenStable();
    expect(first.destroy).toHaveBeenCalledOnce();
    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory.mock.calls[1][1].bossId).toBe('emberwyrm');
    expect(fixture.nativeElement.querySelector('.scene').getAttribute('aria-label')).toContain('Der Glutwyrm');
    expect(fixture.nativeElement.querySelector('.fallback img').getAttribute('src')).toBe('/art/bosses/emberwyrm-v2.webp');
    expect(fixture.nativeElement.textContent).toContain('Das Glutherz');
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

  it('switches the authored form in both renderers and discards a late previous-mode load', async () => {
    let finishNormal!: (value: ReturnType<typeof stage>) => void;
    const factory = vi.fn().mockImplementationOnce(() => new Promise(resolve => { finishNormal = resolve; }))
      .mockRejectedValueOnce(new Error('GPU unavailable'));
    const fixture = create(factory);
    fixture.componentRef.setInput('difficulty', 'ultimate');
    await fixture.whenStable();
    expect(factory.mock.calls[0][1].signal.aborted).toBe(true);
    expect(factory.mock.calls[1][1].difficulty).toBe('ultimate');
    expect(fixture.nativeElement.querySelector('.fallback img').getAttribute('src'))
      .toBe('/art/bosses/mosswarden-ultimate-v1.webp');
    expect(fixture.nativeElement.querySelector('.scene').getAttribute('aria-label')).toContain('Weltenwurzel');
    const staleStage = stage();
    finishNormal(staleStage);
    await vi.waitFor(() => expect(fixture.componentInstance.failed()).toBe(true));
    await fixture.whenStable();
    expect(staleStage.destroy).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.ready()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Statische Ansicht');
  });
});
