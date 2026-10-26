import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { safeReturnPath } from '../../state/auth.guard';
@Component({
  selector: 'app-connection-page',
  imports: [RouterLink],
  styleUrl: './account-page.scss',
  template: ` <main class="auth-shell">
    <a class="brand" routerLink="/auth">✳ herovera.</a>
    <section class="auth-card">
      <p class="eyebrow">KURZE PAUSE</p>
      <h1>Die Verbindung fehlt gerade.</h1>
      <p>
        Dein gespeicherter Fortschritt bleibt erhalten. Prüfe deine Verbindung und versuche es
        erneut.
      </p>
      <p class="error" role="alert">{{ game.error() || journey.error() }}</p>
      <a class="primary" [routerLink]="returnTo">Erneut verbinden</a
      ><a class="switch" routerLink="/account">Zum Konto</a>
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionPage {
  readonly game = inject(GameStore);
  readonly journey = inject(JourneyStore);
  readonly returnTo = safeReturnPath(inject(ActivatedRoute).snapshot.queryParamMap.get('returnTo'));
}
