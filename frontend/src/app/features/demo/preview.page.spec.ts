import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BROWSER_STORAGE } from '../../data/browser-storage';
import { ProgressFeedback } from '../../state/progress-feedback';
import { PreviewPage } from './preview.page';

describe('public preview', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [PreviewPage],
    providers: [provideRouter([]), { provide: BROWSER_STORAGE, useValue: null }],
  }));

  it('shows an isolated, repeat-safe example without requiring an account or game repository', async () => {
    const fixture = TestBed.createComponent(PreviewPage);
    const feedback = vi.spyOn(TestBed.inject(ProgressFeedback), 'preview').mockImplementation(() => {});
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.example.level()).toMatchObject({ level: 1, xp: 1100 });
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.example-copy button');
    button.click();
    await fixture.whenStable();
    expect(page.example.level()).toMatchObject({ level: 2, xp: 30 });
    expect(fixture.nativeElement.textContent).toContain('+80 XP');
    expect(fixture.nativeElement.textContent).toContain('160 Schaden');
    expect(page.example.result.before.character.totalXp).toBe(1100);
    expect(button.disabled).toBe(true);
    page.tryExample();
    expect(feedback).toHaveBeenCalledOnce();
    const links = [...fixture.nativeElement.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.every(link => link.getAttribute('href') === '/auth')).toBe(true);
  });
});
