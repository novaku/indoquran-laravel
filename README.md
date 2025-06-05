# IndoQuran 📖

<p align="center">
  <strong>Al-Quran Digital - Platform Modern untuk Membaca dan Mempelajari Al-Quran</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
</p>

## Tentang IndoQuran

IndoQuran adalah platform digital modern yang memudahkan akses terhadap Al-Quran dan terjemahannya dalam bahasa Indonesia. Dibangun dengan teknologi terkini, aplikasi ini menyediakan pengalaman membaca Al-Quran yang intuitif, interaktif, dan komprehensif.

## ✨ Fitur Utama

### 📚 Al-Quran Lengkap
- **114 Surah**: Akses lengkap ke seluruh surah dalam Al-Quran
- **Teks Arab Original**: Menggunakan font Uthmani yang autentik
- **Transliterasi Latin**: Membantu dalam pembacaan teks Arab
- **Terjemahan Indonesia**: Terjemahan resmi Kementerian Agama RI
- **Tafsir**: Penjelasan dan konteks untuk setiap ayat

### 🎵 Audio Berkualitas Tinggi
- **5 Qari Pilihan**: Husary, Sudais, Alafasy, Minshawi, Abdul Basit
- **Kontrol Audio**: Play, pause, dan navigasi yang mudah
- **Audio Per Ayat**: Dengarkan ayat individu atau surah lengkap
- **Kualitas Premium**: Audio berkualitas tinggi dari sumber terpercaya

### 🔍 Pencarian Canggih
- **Pencarian Teks**: Cari berdasarkan terjemahan bahasa Indonesia
- **Pencarian Ayat**: Temukan ayat berdasarkan nomor surah dan ayat
- **Hasil Berhalaman**: Navigasi hasil pencarian yang efisien
- **Highlighting**: Highlight kata kunci dalam hasil pencarian

### 📝 Sistem Bookmark & Favorit
- **Bookmark Ayat**: Simpan ayat favorit untuk dibaca kemudian
- **Catatan Pribadi**: Tambahkan catatan personal untuk setiap bookmark
- **Organisasi**: Kelompokkan bookmark dan favorit secara terpisah
- **Sinkronisasi**: Data tersimpan dan tersinkron antar sesi

### 🎨 Antarmuka Modern
- **Desain Responsif**: Optimal di desktop, tablet, dan mobile
- **Tipografi Arab**: Font khusus untuk teks Arab yang indah
- **Tema Islami**: Warna dan desain yang menenangkan
- **Navigasi Intuitif**: Antarmuka yang mudah dipahami

## 🛠 Teknologi yang Digunakan

### Backend
- **Laravel 12.x**: Framework PHP modern dengan fitur terlengkap
- **PHP 8.2+**: Performa tinggi dan fitur bahasa terbaru
- **SQLite Database**: Database ringan dan cepat
- **Laravel Sanctum**: Autentikasi API yang aman
- **Caching System**: Optimasi performa dengan cache pintar

### Frontend
- **React 19.x**: Library JavaScript modern untuk UI
- **React Router**: Single Page Application (SPA) routing
- **Tailwind CSS 4.x**: Framework CSS utility-first
- **React Icons**: Koleksi ikon yang lengkap
- **Vite**: Build tool yang cepat dan modern

### Development Tools
- **Composer**: Dependency management untuk PHP
- **NPM**: Package manager untuk JavaScript
- **Laravel Vite Plugin**: Integrasi seamless Laravel dan Vite
- **Concurrently**: Menjalankan multiple server secara bersamaan

## 🚀 Instalasi & Setup

### Prasyarat
- PHP 8.2 atau lebih tinggi
- Composer
- Node.js & NPM
- Git

### Langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/indoquran-laravel.git
   cd indoquran-laravel
   ```

2. **Install Dependencies Backend**
   ```bash
   composer install
   ```

3. **Install Dependencies Frontend**
   ```bash
   npm install
   ```

4. **Setup Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Setup Database**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   php artisan db:seed
   ```

6. **Build Assets**
   ```bash
   npm run build
   ```

7. **Jalankan Aplikasi**
   ```bash
   # Development dengan auto-reload
   npm run react:dev
   
   # Atau jalankan secara terpisah
   php artisan serve
   npm run dev
   ```

## 📡 API Endpoints

### Surah & Ayat
- `GET /api/surahs` - Daftar semua surah
- `GET /api/surahs/{number}` - Detail surah dengan ayat-ayatnya
- `GET /api/ayahs/{surahNumber}/{ayahNumber}` - Ayat spesifik

### Pencarian
- `GET /api/search?q={query}&page={page}&per_page={limit}` - Pencarian ayat

### Bookmark (Autentikasi Required)
- `GET /api/bookmarks` - Daftar bookmark pengguna
- `POST /api/bookmarks/ayah/{id}/toggle` - Toggle bookmark
- `POST /api/bookmarks/ayah/{id}/favorite` - Toggle favorit
- `PUT /api/bookmarks/ayah/{id}/notes` - Update catatan

## 📁 Struktur Project

```
indoquran-laravel/
├── app/
│   ├── Http/Controllers/     # API Controllers
│   ├── Models/              # Eloquent Models
│   └── Services/            # Business Logic Services
├── database/
│   ├── migrations/          # Database Schema
│   └── seeders/            # Data Seeders
├── resources/
│   ├── js/react/           # React Components
│   ├── css/                # Stylesheets
│   └── views/              # Blade Templates
├── routes/
│   ├── api.php             # API Routes
│   └── web.php             # Web Routes
└── public/                 # Public Assets
```

## 🎯 Fitur Mendatang

- [ ] Mode Gelap (Dark Mode)
- [ ] Export bookmark ke PDF
- [ ] Sharing ayat ke media sosial
- [ ] Notifikasi pengingat membaca
- [ ] Aplikasi mobile (React Native)
- [ ] Offline reading mode
- [ ] Multiple language support

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Untuk berkontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -am 'Menambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).

## 🙏 Ucapan Terima Kasih

- **Kementerian Agama RI** untuk terjemahan Al-Quran
- **Quran.com API** untuk data Al-Quran
- **EveryAyah.com** untuk audio berkualitas tinggi
- **Laravel & React Community** untuk framework yang luar biasa

## 📞 Kontak

Untuk pertanyaan, saran, atau dukungan teknis, silakan hubungi:
- Email: info@indoquran.com
- Website: https://indoquran.com

---

<p align="center">
  <strong>IndoQuran - Membawa Al-Quran lebih dekat dengan teknologi modern</strong><br>
  <em>"Dan sesungguhnya telah Kami mudahkan Al-Quran untuk pelajaran, maka adakah orang yang mengambil pelajaran?" - QS. Al-Qamar: 17</em>
</p>
