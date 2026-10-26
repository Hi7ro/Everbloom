import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharacterPortrait } from '../../shared/character-portrait';
import { DemoExample } from '../../state/demo-example';
import { ProgressFeedback } from '../../state/progress-feedback';
@Component({
  selector: 'app-preview-page',
  imports: [RouterLink, CharacterPortrait],
  providers: [DemoExample],
  styleUrl: './preview.page.scss',
  template: ` <main class="demo-page">
    <header>
      <a class="brand" routerLink="/auth">✳ herovera.</a
      ><a class="text-button" routerLink="/auth">Anmelden →</a>
    </header>
    <section class="welcome">
      <div class="welcome-copy">
        <span class="demo-badge">EIN BLICK IN DEIN ABENTEUER</span>
        <h1>Dein Leben.<br />Dein kleines <em>Abenteuer.</em></h1>
        <p>
          Bewegen, lernen, gestalten und durchatmen. Ein Chibi, der mit dir wächst. Quests, die zu
          deinem Alltag passen.
        </p>
        <a class="primary" routerLink="/auth">Meine Reise beginnen →</a>
        <p class="local-note">
          Kostenlose Beta · Für deinen eigenen Charakter brauchst du ein bestätigtes Konto.
        </p>
      </div>
      <div class="hero-art">
        <div class="orbit orbit-one" aria-hidden="true"></div>
        <app-character-portrait
          [appearance]="example.result.before.character.appearance"
          [level]="1"
          [animated]="feedback.motionEnabled()"
        /><span class="hero-caption">✦ Dein kleines Ich. Dein eigener Stil.</span>
      </div>
    </section>
    <section class="example-card">
      <div class="example-copy">
        <p class="eyebrow">UNVERBINDLICHE VORSCHAU</p>
        <h2>Ein kleiner Einsatz.<br />Ein sichtbarer Fortschritt.</h2>
        <p>
          Dieses isolierte Beispiel startet kurz vor Level 2. Probiere aus, wie eine reale Aktivität
          deinen Skill, deine Quest und den Wochenboss voranbringt.
        </p>
        <span class="sample-activity">↟ Calisthenics · 20 Minuten</span
        ><button class="primary" (click)="tryExample()" [disabled]="example.tried()">
          {{ example.tried() ? 'Erfolg erlebt ✓' : 'Erfolgsmoment ausprobieren' }}
        </button>
        <p class="local-note">
          Im echten Spiel startest du mit 0 XP. Fortschritt wächst über mehrere Aktivitäten.
        </p>
      </div>
      <div class="example-result" aria-live="polite">
        <div class="example-level">
          <span>BEISPIELCHARAKTER</span><strong>Level {{ example.level().level }}</strong>
          <p>{{ example.level().xp }} / {{ example.level().required }} XP</p>
        </div>
        <progress
          [value]="example.level().xp"
          [max]="example.level().required"
          aria-label="Beispiel-Fortschritt"
        ></progress>
        @if (example.tried()) {
          <dl class="reward-breakdown">
            <div>
              <dt>Aktivität</dt>
              <dd>+80 XP</dd>
            </div>
            <div>
              <dt>Tagesquest</dt>
              <dd>+50 XP</dd>
            </div>
            <div>
              <dt>Wochenboss</dt>
              <dd>160 Schaden</dd>
            </div>
          </dl>
        }
      </div>
    </section>
    <footer>
      <p>
        12 Chibi-Looks · 14 Skills · Tagesquests · Wochenboss · Aura-Freischaltungen · Automatische
        Probekämpfe
      </p>
      <p>Die Beta ist kostenlos. Membership für geplant 3,99 € pro Monat ist noch nicht buchbar.</p>
      <a routerLink="/auth">Konto erstellen & Charakter gestalten →</a>
    </footer>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewPage {
  readonly example = inject(DemoExample);
  readonly feedback = inject(ProgressFeedback);
  tryExample() {
    if (this.example.tryActivity()) this.feedback.preview();
  }
}
