/**
 * TinyMCE Configuration
 * 
 * Untuk mendapatkan API key gratis:
 * 1. Daftar di: https://www.tiny.cloud/auth/signup/
 * 2. Ambil API key dari dashboard: https://www.tiny.cloud/my-account/dashboard/
 * 3. Masukkan API key di bawah ini
 */

export const TINYMCE_CONFIG = {
  // Ganti dengan API key Anda dari tiny.cloud
  // Format: 'xxxxx-xxxxx-xxxxx-xxxxx-xxxxx'
  // Atau gunakan 'no-api-key' untuk self-hosted mode
  apiKey: 'x0f851mmzistj4au9egox5t5zqbwtxeuftlpfwseltrr7t0x',
  
  // Konfigurasi lainnya
  language: 'id_ID', // Bahasa interface
  height: 500, // Tinggi editor dalam pixels
  
  // Image upload settings
  maxImageSize: 2 * 1024 * 1024, // 2MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  // Auto-save settings
  autosaveInterval: '30s',
  autosaveRetention: '30m',
};

export default TINYMCE_CONFIG;
