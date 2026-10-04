import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { createMockSnapshot } from '../data/mock-data';
import { AURA_REWARDS, hasAuraAccess } from '../domain/aura-rewards';
import { GameStore } from '../state/game.store';
import { AuraCollection } from './aura-collection';

describe('AuraCollection', () => {
  const snapshot = signal(createMockSnapshot());
  const busy = signal(false);

  beforeEach(async () => {
    snapshot.set(createMockSnapshot());
    busy.set(false);
    await TestBed.configureTestingModule({
      imports: [AuraCollection],
      providers: [
        provideRouter([]),
        {
          provide: GameStore,
          useValue: {
            busy,
            ownedAuras: computed(() =>
              AURA_REWARDS.filter((aura) => snapshot().unlockedAuras.includes(aura.id)),
            ),
            canEquipAura: (id: string) => hasAuraAccess(snapshot(), id),
          },
        },
      ],
    }).compileComponents();
  });

  it('shows accurate unlock conditions and a link from the read-only collection', async () => {
    const fixture = TestBed.createComponent(AuraCollection);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.count')?.textContent).toContain('0 / 3');
    expect(root.textContent).toContain('Erreiche Level 20');
    expect(root.textContent).toContain('Erreiche Level 40');
    expect(root.textContent).toContain('Bossbelohnung: Der Mooswächter');
    expect(root.querySelectorAll('.reward')).toHaveLength(3);
    expect(root.querySelectorAll('.status')).toHaveLength(3);
    expect(
      Array.from(root.querySelectorAll('.status')).every((status) =>
        status.textContent?.includes('Noch gesperrt'),
      ),
    ).toBe(true);
    expect(root.querySelector('button')).toBeNull();
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/character/create#aura-rewards');
  });

  it('never emits a locked reward through either UI or a direct selection request', async () => {
    const fixture = TestBed.createComponent(AuraCollection);
    fixture.componentRef.setInput('editable', true);
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const before = structuredClone(snapshot());
    for (const button of root.querySelectorAll<HTMLButtonElement>('button')) {
      expect(button.disabled).toBe(true);
      button.click();
    }
    for (const id of ['aurora', 'starlight', 'moss-spirit', 'guardian', 'unknown']) {
      fixture.componentInstance.choose(id);
    }
    expect(picked).not.toHaveBeenCalled();
    expect(snapshot()).toEqual(before);
  });

  it('emits only the owned selection, reflects equipped state and blocks edits during a save', async () => {
    snapshot.update((current) => ({ ...current, unlockedAuras: ['moss-spirit'] }));
    const fixture = TestBed.createComponent(AuraCollection);
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('selected', 'moss-spirit');
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const before = structuredClone(snapshot());
    const button = root.querySelector<HTMLButtonElement>('[aria-label="Moosseele auswählen"]')!;
    expect(root.querySelector('.count')?.textContent).toContain('1 / 3');
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.closest('.reward')?.classList.contains('owned')).toBe(true);
    expect(button.closest('.reward')?.classList.contains('equipped')).toBe(true);
    button.click();
    expect(picked).toHaveBeenCalledExactlyOnceWith('moss-spirit');
    busy.set(true);
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    button.click();
    fixture.componentInstance.choose('moss-spirit');
    expect(picked).toHaveBeenCalledOnce();
    expect(snapshot()).toEqual(before);
  });
});
