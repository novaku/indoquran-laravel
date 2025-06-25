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
- **Audio Berkualitas** - 5 qari pilihan (Husary, Sudais, Alafasy, dll)
- **Pencarian Canggih** - Cari berdasarkan terjemahan dan nomor ayat
- **Bookmark & Favorit** - Simpan ayat favorit dengan catatan pribadi
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

## 🛠 Development

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
- `./dev-env.sh` - Interactive development environment

## 📡 API Endpoints

- `GET /api/surahs` - List all surahs
- `GET /api/surahs/{number}` - Surah with ayahs
- `GET /api/search?q={query}` - Search ayahs
- `POST /api/bookmark/surah/ayah/{id}/toggle` - Toggle bookmark

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


