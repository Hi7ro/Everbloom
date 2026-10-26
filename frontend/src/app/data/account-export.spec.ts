import { TestBed } from '@angular/core/testing';
import { AccountExport } from './account-export';
import { NATIVE_PLATFORM } from './runtime-api-config';

const plugins = vi.hoisted(() => ({ writeFile: vi.fn(), deleteFile: vi.fn(), share: vi.fn() }));
vi.mock('@capacitor/filesystem', () => ({ Filesystem: plugins, Directory: { Cache: 'CACHE' }, Encoding: { UTF8: 'utf8' } }));
vi.mock('@capacitor/share', () => ({ Share: plugins }));

describe('account export delivery', () => {
  const data = { account: { email: 'test@example.test' }, activities: [{ minutes: 20 }] };
  function exporter(native: boolean) {
    TestBed.configureTestingModule({ providers: [{ provide: NATIVE_PLATFORM, useValue: native }] });
    return TestBed.inject(AccountExport);
  }
  beforeEach(() => {
    plugins.writeFile.mockResolvedValue({ uri: 'file:///private/cache/account-exports/test.json' });
    plugins.deleteFile.mockResolvedValue(undefined);
    plugins.share.mockResolvedValue({ activityType: 'test-share' });
  });
  afterEach(() => { vi.restoreAllMocks(); vi.resetAllMocks(); vi.useRealTimers(); });

  it('shares the complete original JSON from private cache, then removes the temporary file', async () => {
    await exporter(true).exportAccountData(data);
    const options = plugins.writeFile.mock.calls[0][0];
    expect(options.directory).toBe('CACHE');
    expect(options.path).toMatch(/^account-exports\/herovera-account-[\w-]+\.json$/);
    expect(JSON.parse(options.data)).toEqual(data);
    expect(options.encoding).toBe('utf8');
    expect(plugins.share).toHaveBeenCalledWith(expect.objectContaining({ files: ['file:///private/cache/account-exports/test.json'] }));
    expect(plugins.deleteFile).toHaveBeenCalledWith({ path: options.path, directory: 'CACHE' });
  });
  it('cleans up after cancelled sharing and preserves the original failure', async () => {
    plugins.share.mockRejectedValue(new Error('Share canceled'));
    plugins.deleteFile.mockRejectedValue(new Error('Cleanup unavailable'));
    await expect(exporter(true).exportAccountData(data)).rejects.toThrow('Share canceled');
    expect(plugins.deleteFile).toHaveBeenCalledOnce();
  });
  it('tries to remove a partial file after writing fails, without opening the share sheet', async () => {
    plugins.writeFile.mockRejectedValue(new Error('Cache full'));
    await expect(exporter(true).exportAccountData(data)).rejects.toThrow('Cache full');
    expect(plugins.share).not.toHaveBeenCalled();
    expect(plugins.deleteFile).toHaveBeenCalledOnce();
  });
  it('downloads a JSON Blob in the browser and releases its object URL', async () => {
    vi.useFakeTimers();
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:export-test');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('herovera-account.json');
      expect(this.href).toBe('blob:export-test');
    });
    await exporter(false).exportAccountData(data);
    expect(click).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(document.querySelector('a[download="herovera-account.json"]')).toBeNull();
    await vi.advanceTimersByTimeAsync(1000);
    expect(revoke).toHaveBeenCalledWith('blob:export-test');
    expect(plugins.writeFile).not.toHaveBeenCalled();
  });
});
