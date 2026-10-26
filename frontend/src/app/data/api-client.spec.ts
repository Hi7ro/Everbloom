import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient, ApiError } from './api-client';
import { NATIVE_PLATFORM } from './runtime-api-config';
import { API_REQUEST_TIMEOUT_MS, NATIVE_HTTP_REQUEST } from './native-transport';

describe('API client transport and CSRF boundary', () => {
  let http: HttpTestingController;
  let api: ApiClient;
  const nativeRequest = vi.fn();
  function setup(native = false) {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: NATIVE_PLATFORM, useValue: native }, { provide: NATIVE_HTTP_REQUEST, useValue: nativeRequest }] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(ApiClient);
  }
  async function request(path: string): Promise<TestRequest> {
    let found!: TestRequest;
    await vi.waitFor(() => { found = http.expectOne(path); });
    return found;
  }
  afterEach(() => { http?.verify(); vi.useRealTimers(); vi.resetAllMocks(); });

  it('keeps web requests same-origin and sends browser-managed credentials', async () => {
    setup();
    const result = api.get('/api/auth/me');
    const call = await request('/api/auth/me');
    expect(call.request.withCredentials).toBe(true);
    expect(call.request.headers.get('Accept')).toBe('application/json');
    call.flush({ id: 'player' });
    expect(await result).toEqual({ id: 'player' });
    expect(nativeRequest).not.toHaveBeenCalled();
  });

  it('shares a pending CSRF fetch and applies the token to POST, PUT and DELETE', async () => {
    setup();
    const first = api.post('/api/game/activities', { minutes: 20 });
    const second = api.put('/api/game/character', { name: 'Ari' });
    (await request('/api/auth/csrf')).flush({ headerName: 'X-CSRF-TOKEN', token: 'first-token' });
    const post = await request('/api/game/activities');
    const put = await request('/api/game/character');
    for (const call of [post, put]) {
      expect(call.request.headers.get('X-CSRF-TOKEN')).toBe('first-token');
      call.flush({ saved: true });
    }
    await Promise.all([first, second]);
    const deletion = api.delete('/api/account/delete', { password: 'test-only' });
    const remove = await request('/api/account/delete');
    expect(remove.request.method).toBe('DELETE');
    expect(remove.request.headers.get('X-CSRF-TOKEN')).toBe('first-token');
    remove.flush(null, { status: 204, statusText: 'No Content' });
    await deletion;
  });

  it('maps CSRF network failures to ApiError before sending any mutation', async () => {
    setup();
    const result = api.post('/api/auth/login', {}).catch(error => error);
    (await request('/api/auth/csrf')).error(new ProgressEvent('error'));
    expect(await result).toBeInstanceOf(ApiError);
    expect(await result).toMatchObject({ code: 'NETWORK_ERROR' });
    http.expectNone('/api/auth/login');
  });

  it('rejects malformed security responses without sending a password', async () => {
    setup();
    const result = api.post('/api/auth/login', { password: 'test-only' }).catch(error => error);
    (await request('/api/auth/csrf')).flush({ headerName: 'Cookie', token: 'wrong' });
    expect(await result).toMatchObject({ code: 'INVALID_SERVER_RESPONSE' });
    http.expectNone('/api/auth/login');
  });

  it('discards an old pending token when the account session changes', async () => {
    setup();
    const old = api.refreshCsrf().catch(error => error);
    const oldRequest = await request('/api/auth/csrf');
    api.clearCsrf();
    oldRequest.flush({ headerName: 'X-CSRF-TOKEN', token: 'old' });
    expect((await old).code).toBe('SESSION_CHANGED');
    const fresh = api.refreshCsrf();
    (await request('/api/auth/csrf')).flush({ headerName: 'X-CSRF-TOKEN', token: 'fresh' });
    expect((await fresh).token).toBe('fresh');
  });

  it('does not automatically retry a rejected mutation and forgets its stale token', async () => {
    setup();
    const result = api.post('/api/game/activities', {}).catch(error => error);
    (await request('/api/auth/csrf')).flush({ headerName: 'X-CSRF-TOKEN', token: 'expired' });
    (await request('/api/game/activities')).flush({ code: 'CSRF_INVALID' }, { status: 403, statusText: 'Forbidden' });
    expect(await result).toMatchObject({ status: 403 });
    http.expectNone('/api/game/activities');
    const next = api.post('/api/game/activities', {});
    (await request('/api/auth/csrf')).flush({ headerName: 'X-CSRF-TOKEN', token: 'fresh' });
    const retriedByCaller = await request('/api/game/activities');
    expect(retriedByCaller.request.headers.get('X-CSRF-TOKEN')).toBe('fresh');
    retriedByCaller.flush({});
    await next;
  });

  it('ends a hung browser request with a timeout and cancels its subscription', async () => {
    setup();
    vi.useFakeTimers();
    const result = api.get('/api/auth/me').catch(error => error);
    await Promise.resolve();
    const call = http.expectOne('/api/auth/me');
    await vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS);
    expect(await result).toMatchObject({ code: 'REQUEST_TIMEOUT' });
    expect(call.cancelled).toBe(true);
  });

  it('fails closed for unconfigured native builds instead of sending credentials to localhost', async () => {
    setup(true);
    const result = api.post('/api/auth/login', { password: 'test-only' }).catch(error => error);
    (await request('/runtime-config.json')).flush({ schemaVersion: 1, nativeApiOrigin: null });
    expect(await result).toMatchObject({ code: 'API_NOT_CONFIGURED' });
    expect(nativeRequest).not.toHaveBeenCalled();
    http.expectNone('/api/auth/csrf');
  });

  it('uses configured native HTTPS for CSRF and login without reading or copying cookies', async () => {
    setup(true);
    nativeRequest.mockResolvedValueOnce({ status: 200, data: { headerName: 'X-CSRF-TOKEN', token: 'native-token' }, headers: {}, url: 'https://api.example.test/api/auth/csrf' })
      .mockResolvedValueOnce({ status: 200, data: { id: 'player' }, headers: {}, url: 'https://api.example.test/api/auth/login' });
    const result = api.post('/api/auth/login', { email: 'test@example.test', password: 'test-only' });
    (await request('/runtime-config.json')).flush({ schemaVersion: 1, nativeApiOrigin: 'https://api.example.test' });
    expect(await result).toEqual({ id: 'player' });
    expect(nativeRequest).toHaveBeenCalledTimes(2);
    expect(nativeRequest.mock.calls[0][0].url).toBe('https://api.example.test/api/auth/csrf');
    const login = nativeRequest.mock.calls[1][0];
    expect(login.url).toBe('https://api.example.test/api/auth/login');
    expect(login.headers['X-CSRF-TOKEN']).toBe('native-token');
    expect(login.headers.Cookie).toBeUndefined();
    expect(login.headers.Authorization).toBeUndefined();
    expect(login.disableRedirects).toBe(true);
    expect(login.connectTimeout).toBe(API_REQUEST_TIMEOUT_MS);
  });

  it('preserves the expected account assertion on native requests', async () => {
    setup(true);
    nativeRequest.mockResolvedValueOnce({ status: 200, data: { character: { id: 'owner-A' } }, headers: {}, url: 'https://api.example.test/api/game' });
    const result = api.get('/api/game', { 'X-Everbloom-Account': 'owner-A' });
    (await request('/runtime-config.json')).flush({ schemaVersion: 1, nativeApiOrigin: 'https://api.example.test' });
    await result;
    expect(nativeRequest.mock.calls[0][0].headers['X-Everbloom-Account']).toBe('owner-A');
  });
});
