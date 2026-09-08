import { resolveAvatarPresence } from './avatar-presence';

describe('illustrative avatar presence', () => {
  it.each([
    [1, 'beginner'],
    [9, 'beginner'],
    [9.9, 'beginner'],
    [10, 'practiced'],
    [24, 'practiced'],
    [25, 'seasoned'],
    [80, 'seasoned'],
    [0, 'beginner'],
    [-2, 'beginner'],
    [Number.NaN, 'beginner'],
    [Infinity, 'beginner'],
  ])('resolves level %s into %s without affecting progression', (level, expected) => {
    expect(resolveAvatarPresence(level, 'adventurer').stage).toBe(expected);
  });

  it.each([
    ['physical', 'stretch'],
    [' Running ', 'stretch'],
    ['calisthenics', 'stretch'],
    ['mind', 'breathe'],
    ['meditation', 'breathe'],
    ['knowledge', 'focus'],
    ['programming', 'focus'],
    ['unknown', 'greet'],
  ])('maps interest %s to a visual %s gesture', (interest, expected) => {
    expect(resolveAvatarPresence(12, interest).gesture).toBe(expected);
  });

  it('makes later stage gestures calmer and less frequent', () => {
    const beginner = resolveAvatarPresence(1, 'meditation');
    const seasoned = resolveAvatarPresence(25, 'meditation');
    expect(seasoned.breathSeconds).toBeGreaterThan(beginner.breathSeconds);
    expect(seasoned.gestureSeconds).toBeGreaterThan(beginner.gestureSeconds);
    expect(seasoned.tiltDegrees).toBeLessThan(beginner.tiltDegrees);
  });
});
