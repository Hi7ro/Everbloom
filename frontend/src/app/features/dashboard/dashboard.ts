import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SKILLS } from '../../domain/catalog';
import { GameStore } from '../../state/game.store';
import { Chibi } from '../../shared/chibi';
import { ProgressFeedback } from '../../state/progress-feedback';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, FormsModule, Chibi, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  readonly store = inject(GameStore);
  readonly feedback = inject(ProgressFeedback);
  readonly catalog = SKILLS;
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('activityDialog');
  readonly selectedSkill = signal('calisthenics');
  readonly minutes = signal<number | null>(20);
  readonly formError = signal('');
  private trigger: HTMLElement | null = null;

  ngOnInit() {
    if (!this.store.snapshot()) void this.store.load();
  }

  openActivity(skillId = 'calisthenics', minutes = 20) {
    this.selectedSkill.set(skillId);
    this.minutes.set(minutes);
    this.formError.set('');
    this.trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.dialog().nativeElement.showModal();
  }
  closeActivity() {
    this.dialog().nativeElement.close();
  }
  restoreFocus() {
    this.trigger?.focus();
  }
  skillName(id: string) {
    return this.catalog.find((s) => s.id === id)?.name ?? id;
  }
  selectedDefinition() {
    return this.catalog.find((s) => s.id === this.selectedSkill())!;
  }

  async submit() {
    const minutes = this.minutes();
    if (minutes === null || !Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
      this.formError.set('Bitte ganze Minuten zwischen 1 und 180 eintragen.');
      return;
    }
    this.formError.set('');
    if (await this.store.record(this.selectedSkill(), minutes)) this.closeActivity();
  }
}
