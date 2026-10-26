import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NATIVE_PLATFORM } from './runtime-api-config';

@Injectable({ providedIn: 'root' })
export class AccountExport {
  private readonly native = inject(NATIVE_PLATFORM);
  private readonly document = inject(DOCUMENT);

  async exportAccountData(data: unknown): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    if (json === undefined) throw new Error('Der Kontoexport enthält keine Daten.');
    if (this.native) {
      const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
        import('@capacitor/filesystem'), import('@capacitor/share'),
      ]);
      const path = `account-exports/herovera-account-${crypto.randomUUID()}.json`;
      try {
        const file = await Filesystem.writeFile({ path, data: json, directory: Directory.Cache,
          encoding: Encoding.UTF8, recursive: true });
        await Share.share({ title: 'Herovera Kontoexport', dialogTitle: 'Kontoexport speichern oder teilen', files: [file.uri] });
      } finally {
        // Cache files are private and temporary, including failed/cancelled share attempts.
        await Filesystem.deleteFile({ path, directory: Directory.Cache }).catch(() => undefined);
      }
      return;
    }
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = 'herovera-account.json';
    link.hidden = true;
    this.document.body.appendChild(link);
    try { link.click(); }
    finally {
      link.remove();
      // Let the browser consume the download before releasing its temporary object URL.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
}
