import { nativeApiOrigin, validateApiPath } from './runtime-api-config';

describe('native API configuration', () => {
  it('accepts only an explicit HTTPS origin and normalizes its trailing slash', () => {
    expect(nativeApiOrigin({ schemaVersion: 1, nativeApiOrigin: 'https://api.example.test/' })).toBe('https://api.example.test');
  });
  it.each([null, {}, { schemaVersion: 2, nativeApiOrigin: 'https://api.example.test' },
    ...['http://localhost:8080', 'https://user:secret@api.example.test', 'https://api.example.test/api', 'https://api.example.test/?token=a', 'https://api.example.test/#secret', ''].map(nativeApiOrigin => ({ schemaVersion: 1, nativeApiOrigin }))])(
    'rejects missing, insecure or credential-bearing configuration %j', config => {
      expect(() => nativeApiOrigin(config)).toThrow('sichere Serververbindung');
    },
  );
  it.each(['/api/auth/me', '/api/game/snapshot', '/api/account/export', '/api/game?date=2026-10-04'])(
    'accepts API-only paths %s', path => expect(() => validateApiPath(path)).not.toThrow(),
  );
  it.each(['https://other.test/api', '//other.test/api', '/api/../outside', '/api/%2e%2e/outside', '/api/user#fragment', '/api/\\other', '/other', '/api/%']) (
    'rejects unsafe API paths %s', path => expect(() => validateApiPath(path)).toThrow('ungültig'),
  );
});
