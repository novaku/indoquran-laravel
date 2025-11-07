# IndoQuran 📖

<p align="center">
  <strong>Platform Al-Quran Digital Modern</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php" alt="PHP">
</p>

Platform digital untuk membaca dan mempelajari Al-Quran dengan terjemahan Indonesia, audio berkualitas tinggi, dan fitur bookmark.

## ✨ Fitur Utama

- **114 Surah Lengkap** - Teks Arab, transliterasi, dan terjemahan Indonesia
- **79+ Audio Reciters** - Pilihan qari berkualitas tinggi (Husary, Sudais, Alafasy, Abdul Basit, dll)
- **Pencarian Canggih** - Cari berdasarkan terjemahan dan nomor ayat
- **Bookmark & Favorit** - Simpan ayat favorit dengan catatan pribadi
- **Tafsir Maudhui** - Artikel tafsir tematik dengan fitur random
- **Jadwal Sholat** - Waktu sholat otomatis berdasarkan lokasi
- **Asmaul Husna** - 99 nama Allah dengan terjemahan
- **PWA Support** - Install sebagai aplikasi mobile
- **SEO Optimized** - Canonical URL, structured data, sitemap
- **Desain Modern** - Responsif untuk desktop, tablet, dan mobile

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js & NPM
- MySQL 8.0+

### Installation
```bash
# Clone repository
git clone https://github.com/username/indoquran-laravel.git
cd indoquran-laravel

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate
php artisan db:seed

# Start development
./dev-env.sh
```

## � Production Deployment

### For cPanel/Shared Hosting

#### Common Issue: Storage Link Error
If you encounter this error on cPanel:
```
Call to undefined function Illuminate\Filesystem\exec()
```

**Quick Fix:**
```bash
# Run the automated fix script
./fix-storage-link.sh

# Or manually:
php create-storage-link.php --force
```

See detailed instructions in [docs/CPANEL_DEPLOYMENT.md](docs/CPANEL_DEPLOYMENT.md)

### Build and Deploy
```bash
# 1. Build assets locally (production server has no Node.js)
./build-production.sh

# 2. Commit build files
git add public/build
git commit -m "Build production assets"
git push origin main

# 3. On production server (cPanel/SSH)
git pull origin main
./deploy-production.sh
```

## �🛠 Development

### Start Development Server
```bash
# Interactive development menu
./dev-env.sh

# Or manually
php artisan serve    # Laravel server (port 8000)
npm run dev         # Vite dev server (port 5173)
```

### Available Scripts
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `./dev-env.sh` - Interactive development environment (recommended)
- `./build-production.sh` - Build optimized production bundle
- `./test-canonical-url.sh` - Test canonical URL implementation
- `./test-pwa.sh` - Test PWA functionality

## 🔧 Testing & Quality Assurance

### SEO Testing
```bash
# Test canonical URL consistency
./test-canonical-url.sh

# Verify sitemap
curl -s https://indoquran.web.id/sitemap.xml

# Check robots.txt
curl -s https://indoquran.web.id/robots.txt
```

### Performance Testing
```bash
# PWA audit
./test-pwa.sh

# Mobile performance
npm run performance:mobile

# Bundle analysis
npm run bundle:analyze
```

## 📡 API Endpoints

### Public Endpoints
- `GET /api/surahs` - List all surahs
- `GET /api/surahs/{number}` - Surah with ayahs
- `GET /api/search?q={query}` - Search ayahs
- `GET /api/reciters` - List all audio reciters
- `GET /api/audio/ayah/{surah}/{ayah}?reciter={id}` - Audio URL for ayah

### Protected Endpoints (Requires Auth)
- `POST /api/penanda/surah/ayah/{id}/toggle` - Toggle bookmark
- `GET /api/penanda` - Get user bookmarks
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 📚 Documentation

- **[CHANGELOG.md](docs/CHANGELOG.md)** - Detailed version history
- **[CANONICAL_URL_FIX.md](docs/CANONICAL_URL_FIX.md)** - SEO canonical URL implementation
- **[TAG_FEATURE_DOCUMENTATION.md](docs/TAG_FEATURE_DOCUMENTATION.md)** - Article tagging system
- **[TIPTAP_MIGRATION.md](docs/TIPTAP_MIGRATION.md)** - Rich text editor migration
- **[CPANEL_DEPLOYMENT.md](docs/CPANEL_DEPLOYMENT.md)** - cPanel deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

Licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  <strong>IndoQuran - Al-Quran dengan teknologi modern</strong><br>
  <em>"Dan sesungguhnya telah Kami mudahkan Al-Quran untuk pelajaran" - QS. Al-Qamar: 17</em>
</p>


