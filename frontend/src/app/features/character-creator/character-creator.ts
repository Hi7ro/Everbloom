import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  CHARACTER_COLOR_PALETTES,
  CHARACTER_OPTIONS,
  CharacterColor,
  CharacterSlot,
  normalizeCharacterProfile,
} from '../../domain/character';
import { CharacterProfile } from '../../domain/models';
import { Chibi } from '../../shared/chibi';
import { GameStore } from '../../state/game.store';

@Component({
  selector: 'app-character-creator',
  imports: [FormsModule, RouterLink, Chibi],
  templateUrl: './character-creator.html',
  styleUrl: './character-creator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCreator implements OnInit {
  readonly store = inject(GameStore);
  private readonly router = inject(Router);
  readonly draft = signal<CharacterProfile | null>(null);
  readonly formError = signal('');
  readonly options = CHARACTER_OPTIONS;
  readonly palettes = CHARACTER_COLOR_PALETTES;
  readonly shapeGroups = [
    { slot: 'body' as const, label: 'Körperform', choices: CHARACTER_OPTIONS.body },
    { slot: 'hair' as const, label: 'Frisur', choices: CHARACTER_OPTIONS.hair },
  ];
  readonly colorGroups: readonly { slot: CharacterColor; label: string }[] = [
    { slot: 'skinColor', label: 'Hautfarbe' },
    { slot: 'hairColor', label: 'Haarfarbe' },
    { slot: 'outfitColor', label: 'Outfitfarbe' },
  ];

  ngOnInit() {
    void this.loadProfile();
  }

  async loadProfile() {
    if (!this.store.snapshot()) await this.store.load();
    const character = this.store.snapshot()?.character;
    if (character) {
      this.draft.set({
        name: character.name,
        appearance: {
          ...character.appearance,
          outfit:
            character.appearance.outfit === 'wanderer' ? 'adventurer' : character.appearance.outfit,
        },
      });
    }
  }

  setName(name: string) {
    this.draft.update((current) => (current ? { ...current, name } : current));
    this.formError.set('');
  }

  choose(slot: CharacterSlot | CharacterColor, value: string) {
    this.draft.update((current) =>
      current
        ? {
            ...current,
            appearance: { ...current.appearance, [slot]: value },
          }
        : current,
    );
    this.formError.set('');
  }

  async save() {
    const draft = this.draft();
    if (!draft || this.store.busy()) return;
    let profile: CharacterProfile;
    try {
      profile = normalizeCharacterProfile(draft);
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'Bitte prüfe deine Angaben.');
      return;
    }
    this.formError.set('');
    if (await this.store.updateCharacter(profile)) await this.router.navigateByUrl('/dashboard');
  }

  cancel() {
    if (!this.store.busy()) void this.router.navigateByUrl('/dashboard');
  }
}
