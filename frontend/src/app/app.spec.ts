import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { GAME_REPOSITORY } from './data/game.repository';
import { MockGameRepository } from './data/mock-game.repository';
import { provideHttpClient } from '@angular/common/http';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: GAME_REPOSITORY, useClass: MockGameRepository },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('opens the account entry and recovers unknown routes to the dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/auth');
    expect(compiled.querySelector('h1')?.textContent).toContain('Dein kleines Ich');
    await router.navigateByUrl('/unknown');
    expect(router.url).toBe('/dashboard');
  });

  it('renders the real account login', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/auth');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Kostenlos registrieren');
    expect(fixture.nativeElement.querySelector('input[type=\"email\"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-account-menu')).toBeNull();
  });
});
