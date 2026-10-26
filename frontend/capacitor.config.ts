import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.everbloom.app',
  appName: 'Herovera',
  webDir: 'dist/everbloom/browser',
  backgroundColor: '#101915',
  // Native bridge debugging can include request bodies; never log account requests.
  loggingBehavior: 'none',
  server: {
    hostname: 'localhost',
    androidScheme: 'https',
    iosScheme: 'capacitor',
    cleartext: false,
  },
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'native',
      initialViewportFitValueHint: 'cover',
      style: 'DARK',
      hidden: false,
      animation: 'NONE',
    },
    // Only ApiClient uses native HTTP. Art loading and local assets keep browser semantics.
    CapacitorHttp: { enabled: false },
    // HttpOnly session cookies are managed by the native transport, never document.cookie.
    CapacitorCookies: { enabled: false },
  },
};

export default config;
