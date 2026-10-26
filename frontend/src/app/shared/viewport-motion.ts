import { DOCUMENT } from '@angular/common';
import { Directive, effect, ElementRef, inject, input, signal } from '@angular/core';

/** Pause decorative CSS motion without resetting its progress or changing the artwork. */
@Directive({
  selector: '[appViewportMotion]',
  host: { '[style.--motion-play-state]': 'playState()' },
})
export class ViewportMotion {
  readonly enabled = input(true, { alias: 'appViewportMotion' });
  readonly playState = signal<'running' | 'paused'>('paused');
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<Element>>(ElementRef);

  constructor() {
    effect(onCleanup => {
      if (!this.enabled()) {
        this.playState.set('paused');
        return;
      }
      const window = this.document.defaultView;
      if (!window) return;
      let active = true;
      let inView = true;
      const sync = () => {
        if (active) this.playState.set(!this.document.hidden && inView ? 'running' : 'paused');
      };
      // Older webviews still pause in the background when IntersectionObserver is unavailable.
      const observer = typeof window.IntersectionObserver === 'function'
        ? new window.IntersectionObserver(entries => {
          const entry = entries.find(item => item.target === this.element.nativeElement);
          if (entry) inView = entry.isIntersecting;
          sync();
        })
        : undefined;
      observer?.observe(this.element.nativeElement);
      this.document.addEventListener('visibilitychange', sync);
      sync();
      onCleanup(() => {
        active = false;
        observer?.disconnect();
        this.document.removeEventListener('visibilitychange', sync);
      });
    });
  }
}
