import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INTERESTS } from '../domain/journey';
import { JourneyStore } from '../state/journey.store';

@Component({
  selector: 'app-journey-summary',
  imports: [RouterLink],
  template: `
    <section aria-label="Deine Interessen und Skills">
      <div>
        @if (journey.configured()) {
          <strong>Dein Fokus: {{ primaryLabel() }}</strong>
          <p>{{ journey.activeSkillIds().length }} Skills im Blick. Deine Auswahl wächst mit dir.</p>
        } @else {
          <strong>Mach es zu deinem Abenteuer.</strong>
          <p>Wähle deine Interessen und die Skills, die dir gerade wichtig sind.</p>
        }
        @if (journey.configured() && !journey.persisted()) {
          <p class="storage-note" role="status">Die Auswahl gilt für diese Sitzung. Dein Browser konnte sie nicht speichern.</p>
        }
      </div>
      <a class="secondary" routerLink="/onboarding">{{ journey.configured() ? 'Auswahl anpassen' : 'Meine Reise einrichten' }} <span aria-hidden="true">↗</span></a>
    </section>
  `,
  styles: [`
    :host { display: block; margin: 0 0 24px; }
    section { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; border: 1px solid var(--line-bright); border-radius: 12px; background: #24382b60; }
    strong { font-size: 15px; font-weight: 600; }
    p { margin: 5px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
    a { flex-shrink: 0; font-size: 14px; min-height: 48px; }
    .storage-note { color: #efd1a5; }
    @media (max-width: 600px) { section { align-items: stretch; flex-direction: column; padding: 17px; gap: 12px; } a { align-self: flex-start; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneySummary {
  readonly journey = inject(JourneyStore);
  readonly primaryLabel = computed(() => INTERESTS.find(x => x.id === this.journey.preferences().primaryInterestId)?.label ?? 'Deine Entwicklung');
}
