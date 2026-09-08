import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { GAME_REPOSITORY } from './data/game.repository';
import { MockGameRepository } from './data/mock-game.repository';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: GAME_REPOSITORY, useClass: MockGameRepository },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('redirects the root and unknown routes to the dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/dashboard');
    expect(compiled.querySelector('h1')?.textContent).toContain('Wachse über dich hinaus');
    await router.navigateByUrl('/unknown');
    expect(router.url).toBe('/dashboard');
  });
});
