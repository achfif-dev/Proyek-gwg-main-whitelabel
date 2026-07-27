const fs = require('fs');
const path = require('path');

// ✅ FIX: sebelumnya file ini bernama capacitor.config.js dengan sintaks
// ESM (import/export default). Karena package.json project ini punya
// "type": "module", Node MEMANG membacanya sebagai ESM dengan benar —
// tapi Capacitor CLI memuat config lewat require() gaya CommonJS lama,
// yang GAGAL untuk file ESM (Error: require() of ES Module ... not
// supported) — dan kegagalan itu ditelan diam-diam oleh Capacitor,
// sehingga CLI berjalan seolah TIDAK ADA config sama sekali dan otomatis
// balik ke default bawaan (webDir: "www"), padahal project build ke
// folder "dist". Ekstensi .cjs memaksa Node & Capacitor CLI SELALU
// membaca file ini sebagai CommonJS, apa pun isi "type" di package.json —
// jadi tidak ambigu lagi.
//
// ⚠️ Sengaja BUKAN .ts: Capacitor CLI memuat capacitor.config.ts lewat
// compiler package "typescript", yang tidak terpasang di project ini
// (project ini murni JS) — kalau dipaksa pakai .ts, build APK gagal
// dengan error "loadExtConfigTS".
//
// ✅ WHITE LABEL: appId (package name Android) & appName (nama app di HP)
// dibaca dari .env — variabel yang sama dipakai vite.config.js/index.html —
// supaya identitas APK ikut berubah kalau perusahaan lain mengisi .env
// sendiri, tanpa perlu edit file config ini.
function loadEnvFile(filePath) {
  const env = {};
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

const fileEnv = loadEnvFile(path.resolve(process.cwd(), '.env'));
const env = Object.assign({}, fileEnv, process.env);

// appId HARUS format domain terbalik (com.perusahaan.app), tanpa spasi/simbol
// — ini yang menentukan package name Android & jadi kunci identitas APK di
// Play Store. Kalau VITE_APP_ID belum diisi di .env, jatuh balik ke appId
// GWG bawaan supaya instalasi yang sudah berjalan tidak berubah.
const appId = env.VITE_APP_ID || 'com.gwg.superapp';
const appName = env.VITE_APP_SHORT_NAME || 'GWG Super App';

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
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

module.exports = config;
