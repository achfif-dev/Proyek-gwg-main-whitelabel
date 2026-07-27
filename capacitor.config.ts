import type { CapacitorConfig } from '@capacitor/cli';
import fs from 'fs';
import path from 'path';

// ✅ WHITE LABEL: appId (package name Android) & appName (nama app di HP)
// dibaca dari .env — variabel yang sama dipakai vite.config.js/index.html —
// supaya identitas APK ikut berubah kalau perusahaan lain mengisi .env
// sendiri, tanpa perlu edit file config ini. Parser manual dipakai (bukan
// paket "dotenv") supaya tidak menambah dependency baru hanya untuk membaca
// satu file .env yang formatnya sederhana (KEY=VALUE per baris).
function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  });
  return env;
}

const fileEnv = loadEnvFile(path.resolve(__dirname, '.env'));
const env = { ...fileEnv, ...process.env };

// appId HARUS format domain terbalik (com.perusahaan.app), tanpa spasi/simbol
// — ini yang menentukan package name Android & jadi kunci identitas APK di
// Play Store. Kalau VITE_APP_ID belum diisi di .env, jatuh balik ke appId
// GWG bawaan supaya instalasi yang sudah berjalan tidak berubah.
const appId = env.VITE_APP_ID || 'com.gwg.superapp';
const appName = env.VITE_APP_SHORT_NAME || 'GWG Super App';

const config: CapacitorConfig = {
  appId,
  appName,
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;
