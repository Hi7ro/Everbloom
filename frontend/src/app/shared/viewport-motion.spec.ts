import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ViewportMotion } from './viewport-motion';

@Component({
  imports: [ViewportMotion],
  template: '<svg [appViewportMotion]="enabled()"><g /></svg>',
})
class MotionFixture {
  readonly enabled = signal(true);
}

describe('decorative motion visibility', () => {
  const observers: TestObserver[] = [];
  let hidden = false;
  class TestObserver {
    readonly observe = vi.fn();
    readonly disconnect = vi.fn();
    constructor(private readonly callback: IntersectionObserverCallback) {
      observers.push(this);
    }
    intersect(target: Element, isIntersecting: boolean) {
      this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
  }

  beforeEach(() => {
    observers.length = 0;
    hidden = false;
    vi.stubGlobal('IntersectionObserver', TestObserver);
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    TestBed.configureTestingModule({ imports: [MotionFixture] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function create(enabled = true) {
    const fixture = TestBed.createComponent(MotionFixture);
    fixture.componentInstance.enabled.set(enabled);
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    const state = () => svg.style.getPropertyValue('--motion-play-state');
    return { fixture, svg, state };
  }

  it('pauses an offscreen figure and resumes the same graphic when visible again', () => {
    const { fixture, svg, state } = create();
    const body = svg.querySelector('g');
    expect(observers).toHaveLength(1);
    expect(observers[0].observe).toHaveBeenCalledWith(svg);
    expect(state()).toBe('running');
    observers[0].intersect(svg, false);
    fixture.detectChanges();
    expect(state()).toBe('paused');
    observers[0].intersect(svg, true);
    fixture.detectChanges();
    expect(state()).toBe('running');
    expect(svg.querySelector('g')).toBe(body);
  });

  it('does not resume an offscreen animation just because its browser tab becomes visible', () => {
    const { fixture, svg, state } = create();
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();
    expect(state()).toBe('paused');
    observers[0].intersect(svg, false);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();
    expect(state()).toBe('paused');
    observers[0].intersect(svg, true);
    fixture.detectChanges();
    expect(state()).toBe('running');
  });

  it('creates no observer for a static thumbnail and disconnects when motion is switched off', () => {
    const { fixture, svg, state } = create(false);
    expect(observers).toHaveLength(0);
    expect(state()).toBe('paused');
    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    expect(observers).toHaveLength(1);
    expect(state()).toBe('running');
    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    observers[0].intersect(svg, true);
    document.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();
    expect(state()).toBe('paused');
  });

  it('cleans up observation and the visibility listener when the graphic is destroyed', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { fixture } = create();
    fixture.destroy();
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  it('still pauses hidden tabs in webviews without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    hidden = true;
    const { fixture, state } = create();
    expect(state()).toBe('paused');
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();
    expect(state()).toBe('running');
  });
});
