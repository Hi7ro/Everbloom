import { TestBed } from '@angular/core/testing';
import { GAME_REPOSITORY } from '../../data/game.repository';
import { MockGameRepository } from '../../data/mock-game.repository';
import { Dashboard } from './dashboard';
import { provideRouter } from '@angular/router';

describe('Dashboard activity flow', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: GAME_REPOSITORY, useClass: MockGameRepository }],
    }).compileComponents();
  });
  it('connects the actual form to XP, quests and boss state', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    // jsdom has no native dialog methods; only that browser boundary is stubbed.
    const dialog = root.querySelector('dialog')!;
    dialog.showModal = vi.fn();
    dialog.close = vi.fn();
    root.querySelector<HTMLButtonElement>('.page-heading .primary')!.click();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    const select = root.querySelector('select')!;
    select.value = 'meditation';
    select.dispatchEvent(new Event('change'));
    const input = root.querySelector('input')!;
    input.value = '10';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.store.snapshot()?.character.totalXp).toBe(25986);
    expect(root.querySelector('#quests')?.textContent).toContain('1 / 3');
    expect(root.querySelector('#boss progress')?.getAttribute('value')).toBe('1400');
    expect(root.querySelector('.feedback')?.textContent).toContain('+60 XP');
    expect(dialog.close).toHaveBeenCalledOnce();
  });
  it('keeps invalid input in the form and does not award XP', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    fixture.componentInstance.minutes.set(1.5);
    await fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(fixture.componentInstance.store.snapshot()?.character.totalXp).toBe(25926);
    expect(fixture.nativeElement.querySelector('#activity-error').textContent).toContain(
      'ganze Minuten',
    );
  });
});
