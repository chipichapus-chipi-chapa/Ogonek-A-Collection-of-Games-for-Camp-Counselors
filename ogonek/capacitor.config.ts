import type { CapacitorConfig } from '@capacitor/cli';

// Android-сборка: та же Angular-версия, все файлы внутри APK — интернет не нужен
const config: CapacitorConfig = {
  appId: 'ru.maestro.ogonek',
  appName: 'Огонёк',
  webDir: 'dist/ogonek/browser',
  android: {
    backgroundColor: '#7D8653'
  }
};

export default config;
