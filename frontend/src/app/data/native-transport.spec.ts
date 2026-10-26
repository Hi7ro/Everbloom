import { TestBed } from '@angular/core/testing';
import { API_REQUEST_TIMEOUT_MS, NativeTransport, NATIVE_HTTP_REQUEST } from './native-transport';

describe('native HTTP failure handling', () => {
  const request = vi.fn();
  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: NATIVE_HTTP_REQUEST, useValue: request }] }));
  afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });

  it('maps HTTP failures and never follows a login redirect or retries a write', async () => {
    request.mockResolvedValue({ status: 401, data: { code: 'UNAUTHENTICATED', message: 'Bitte anmelden.' } });
    const result = TestBed.inject(NativeTransport).send('POST', 'https://api.example.test/api/game/activities', {}, {}).catch(error => error);
    expect(await result).toMatchObject({ status: 401 });
    expect(request).toHaveBeenCalledOnce();
    expect(request.mock.calls[0][0].disableRedirects).toBe(true);
  });
  it('normalizes native timeout errors', async () => {
    request.mockRejectedValue({ code: 'ETIMEDOUT', message: 'Timed out' });
    await expect(TestBed.inject(NativeTransport).send('GET', 'https://api.example.test/api/game', undefined, {}))
      .rejects.toMatchObject({ code: 'REQUEST_TIMEOUT' });
  });
  it('bounds a stalled bridge call without automatically resending its mutation', async () => {
    vi.useFakeTimers();
    request.mockImplementation(() => new Promise(() => undefined));
    const result = TestBed.inject(NativeTransport).send('POST', 'https://api.example.test/api/game/activities', {}, {}).catch(error => error);
    await vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS);
    expect(await result).toMatchObject({ code: 'REQUEST_TIMEOUT' });
    expect(request).toHaveBeenCalledOnce();
  });
  it('returns null for a successful no-content response', async () => {
    request.mockResolvedValue({ status: 204, data: '' });
    expect(await TestBed.inject(NativeTransport).send('DELETE', 'https://api.example.test/api/account/delete', {}, {})).toBeNull();
  });
});
