# IndoQuran 📖

<p align="center">
  <strong>Platform Al-Quran & Hadits Digital Modern</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Versi-2.32.0-10B981?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/PHP-8.4+-777BB4?style=flat-square&logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

IndoQuran adalah platform digital modern dan komprehensif untuk membaca, mentadaburi Al-Qur'an (114 Surah), mempelajari Ensiklopedia Hadits Nabawi (7 Kitab Mu'tamad, 33.137 hadits), Tafsir Maudhui, Doa & Dzikir, Asmaul Husna, serta artikel Islami dengan dukungan audio multi-qari, audio pelafalan Arab berbasis Web Speech API, sistem bookmark hadits, sistem komentar interaktif, dan Progressive Web App (PWA) berkinerja tinggi.

---

## ✨ Fitur Utama

### 📖 Al-Qur'an Digital
- **114 Surah Lengkap** - Teks Arab (Utsmani), transliterasi Latin standar Kemenag, dan terjemahan resmi bahasa Indonesia.
- **Tab Interaktif Pokok Kandungan & Tema Surah** - Visualisasi tab horizontal untuk membaca kandungan surah dan tema utama dengan tipografi Scheherazade yang nyaman serta tombol navigasi tema.
- **79+ Pilihan Qari Murottal** - Audio ayat berkualitas tinggi dari qari terkemuka dunia (Misyari Rasyid Al-Afasy, As-Sudais, Al-Husary, Abdul Basit, dll.) via EveryAyah.
- **Pencarian Cerdas & Cepat** - Cari ayat berdasarkan kata kunci terjemahan, nama surah, atau nomor ayat.
- **Juz & Halaman Mushaf** - Navigasi per 30 Juz dan 604 Halaman Mushaf standar Madinah/Indonesia.

### 📚 Ensiklopedia 7 Kitab Hadits Nabawi (33.137 Hadits)
- **Koleksi 7 Kitab Mu'tamad (Kutubus Sittah + Musnad Ahmad)**:
  - Shahih Bukhari (7.008 hadits)
  - Shahih Muslim (5.362 hadits)
  - Sunan Abu Daud (5.274 hadits)
  - Jami' At-Tirmidzi (3.956 hadits)
  - Sunan An-Nasa'i (5.758 hadits)
  - Sunan Ibnu Majah (4.341 hadits)
  - Musnad Ahmad (1.438 hadits)
- **Hadits Reader & Quick Jump** - Antarmuka pembaca hadits yang responsif dengan pagination cepat, lompat langsung ke nomor hadits tertentu, dan pencarian teks riwayat.
- **Audio Pelafalan Arab (Web Speech API)** - Pemutar suara Arab instan langsung di browser pengguna dengan kontrol kecepatan (0.75x, 0.85x, 1.0x) tanpa menghabiskan kuota server.
- **Sistem Penanda (Bookmark) & Catatan Hadits** - Simpan riwayat hadits pilihan ke akun pengguna (cloud database) atau penyimpanan lokal (offline fallback) dilengkapi catatan tadabbur dan faidah hadits di `/penanda`.
- **Database UTF8mb4 & Kolom Syarah** - Standardisasi skema tabel database ke `utf8mb4_unicode_ci` dan integrasi kolom penjelasan/syarah hadits.

### 🤲 Doa, Dzikir & Ibadah
- **Doa Pilihan & Audio Pelafalan Arab** - Kumpulan doa harian shahih dilengkapi teks Arab, transliterasi Latin, terjemahan, serta pemutar suara pelafalan Arab instan berbasis Web Speech API (dengan kontrol kecepatan dan visualisasi suara).
- **Doa Bersama Komunitas** - Platform interaktif untuk berbagi doa, saling mengaminkan ('Amin'), dan memberikan dukungan doa antar sesama pengguna.
- **Jadwal Sholat Otomatis** - Perhitungan waktu sholat akurat berdasarkan deteksi lokasi pengguna (geolokasi).
- **Asmaul Husna** - 99 nama Allah Subhanahu wa Ta'ala lengkap dengan tulisan Arab, arti, dan dalil Al-Qur'an.

### 📝 Artikel Islami, Tag & Komentar
- **Artikel Terstruktur & Tag** - Konten artikel Islami tematik dengan tag, hashtag populer, serta cuplikan (excerpt) ringkas.
- **Sistem Komentar & Opsi Anonim** - Pembaca dan pengguna terdaftar dapat mengirim komentar atau berdiskusi dengan opsi anonimitas ("Hamba Allah").
- **Panel Moderasi Admin** - Administrator dapat memoderasi, memfilter, dan menghapus komentar serta mengelola artikel langsung melalui editor TipTap Rich Text di `/admin`.

### ⚡ Performa, PWA & Pengalaman Pengguna
- **Progressive Web App (PWA v2.32.0)** - Dapat diinstall di perangkat Android, iOS, maupun Desktop; dilengkapi Service Worker cerdas untuk akses offline dan pembersihan cache otomatis.
- **Sistem Notifikasi Website (Facebook Style & Database-Driven)** - Popover notifikasi kabar terbaru dan pengumuman bersumber dinamis dari tabel database tanpa perlu re-build frontend maupun backend, dilengkapi indikator badge belum dibaca dan tampilan responsif mobile bottom-sheet.
- **Autentikasi Modern** - Login dan registrasi cepat menggunakan Google One Tap / Google OAuth, email & kata sandi (JWT Auth), serta login administrator berbasis sesi aman dengan verifikasi OTP.
- **High-Speed Redis & Multi-tier Caching** - Layanan khusus `HaditsCacheService` dan `QuranCacheService` dengan CLI management `hadits:cache` dan warm-up otomatis.
- **SEO & Google Search Console Ready** - Dilengkapi Open Graph, Twitter Cards, Schema.org JSON-LD structured data, canonical URL, dan arsitektur sitemap modular berindeks (`sitemap-index.xml`, `sitemap-hadits-main.xml`) mencakup seluruh koleksi Al-Qur'an dan Hadits.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Backend Framework** | Laravel 12.x | PHP 8.4+ dengan arsitektur RESTful API & Service Layer |
| **Frontend Framework** | React 18.x + Vite 6 | Single Page Application (SPA) dengan lazy-loading modular |
| **Styling & UI** | TailwindCSS 4.x | PostCSS, modern typography, Heroicons, dan React Icons |
| **State & Data Fetching** | TanStack Query v5 & Axios | Data fetching dengan cache dan sinkronisasi otomatis |
| **Audio Engine** | Web Speech API & EveryAyah | Audio murottal Al-Quran dan TTS bahasa Arab lokal di browser |
| **Caching & In-Memory** | Redis (Predis) | Multi-tier cache Al-Qur'an, Hadits, API responses, dan rate limiting |
| **Rich Text Editor** | TipTap Editor | Editor WYSIWYG untuk pembuatan dan pembaruan artikel di panel admin |
| **Database** | MySQL 8.0+ / MariaDB | Indeks teroptimasi untuk pencarian ayat dan puluhan ribu hadits |
| **PWA & Offline** | Service Worker v2.32.0 | Offline fallback, asset caching, dan background synchronization |

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### Prasyarat Sistem
- **PHP**: `^8.4` (disarankan PHP 8.4.15+)
- **Composer**: `2.x`
- **Node.js**: `18.x` atau `20.x+` & **NPM**
- **Database**: MySQL 8.0+, MariaDB 10.5+, atau SQLite
- **Redis Server**: Sangat disarankan untuk performa cache optimal (bisa via UNIX socket atau TCP port 6379)

### Langkah Instalasi

1. **Clone repository:**
   ```bash
   git clone https://github.com/username/indoquran-laravel.git
   cd indoquran-laravel
   ```

2. **Install dependensi PHP & Node.js:**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment (`.env`):**
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret
   ```

   *Sesuaikan kredensial database (`DB_*`), Redis (`REDIS_*`), Google OAuth (`GOOGLE_CLIENT_ID`), dan pengaturan lainnya di dalam file `.env`.*

4. **Jalankan Migrasi & Seeder Database:**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Warm-up Cache Performa (Opsional namun Disarankan):**
   ```bash
   php artisan quran:cache warm-up
   php artisan hadits:cache warm-up
   ```

6. **Jalankan Server Pengembangan:**

   *Menggunakan Makefile (Direkomendasikan):*
   ```bash
   make dev          # Start Laravel server (port 8000), bersihkan cache & buka browser
   make dev-servers  # Start Laravel (8000) & Vite (5173) di background
   make dev-all      # Start server lengkap foreground (Laravel + Queue + Logs + Vite)
   ```

   *Atau menggunakan script menu interaktif:*
   ```bash
   ./dev-env.sh
   ```

   *Atau menggunakan Composer / terminal terpisah:*
   ```bash
   composer dev        # Server terpadu via concurrently
   php artisan serve   # Server API Laravel (http://localhost:8000)
   npm run dev         # Vite dev server (http://localhost:5173)
   ```

---

## 🛠️ Perintah Makefile Terpadu

Proyek ini menyediakan `Makefile` yang mencakup seluruh alur kerja pengembangan, testing, database, dan pemeliharaan cache (setara dengan menu `dev-env.sh`):

```bash
make help    # Menampilkan seluruh daftar perintah yang tersedia
```

### 📋 Daftar Perintah Makefile

| Kategori | Perintah | Deskripsi |
|---|---|---|
| **Development** | `make dev` | Start Laravel server (port 8000), bersihkan cache & otomatis buka browser |
| | `make dev-servers` | Start Laravel & Vite development server di background |
| | `make dev-all` | Menjalankan server lengkap foreground (Laravel, Queue, Pail, Vite) |
| | `make serve` | Menjalankan `php artisan serve` |
| | `make serve-8080` | Menjalankan Laravel server di port 8080 |
| | `make vite` | Menjalankan Vite development server |
| | `make build` | Kompilasi aset Vite untuk production (`npm run build`) |
| | `make watch` | Watcher kompilasi aset Vite realtime |
| | `make restart` | Restart server development (Laravel & Vite) |
| | `make stop` | Stop seluruh proses development server |
| | `make status` | Periksa status port 8000/5173 dan proses aktif |
| **Setup & Dependencies** | `make setup` | Setup awal proyek (.env, install vendor, app key, migrate, build) |
| | `make install` | Install dependensi Composer & NPM |
| | `make update` | Update dependensi Composer & NPM |
| **Database** | `make migrate` | Menjalankan migrasi database |
| | `make migrate-fresh` | Reset ulang database dan jalankan seeder (`migrate:fresh --seed`) |
| | `make migrate-rollback` | Rollback batch migrasi terakhir |
| | `make seed` | Menjalankan database seeder (`php artisan db:seed`) |
| **Testing & Kualitas Kode** | `make test` | Menjalankan seluruh test suite (Unit & Feature) |
| | `make test-unit` | Menjalankan hanya Unit test |
| | `make test-feature` | Menjalankan hanya Feature test |
| | `make test-coverage` | Menjalankan test dengan laporan code coverage |
| | `make pint` | Format style kode PHP dengan Laravel Pint |
| | `make pint-test` | Periksa style kode PHP tanpa mengubah file |
| **Cache & Optimasi** | `make refresh` | Refresh total semua cache (Laravel, storage, autoload, Vite) |
| | `make optimize-dev` | Optimasi cache khusus environment development |
| | `make clear` | Bersihkan seluruh cache framework (`optimize:clear`) |
| | `make optimize` | Optimasi cache untuk production |
| | `make cache-all` | Cache config, route, dan view |
| | `make cache-quran` | Warm up cache Al-Qur'an (Surah & Ayat) |
| | `make cache-asmaul` | Refresh cache Asmaul Husna |
| | `make cache-tafsir` | Refresh cache Tafsir Maudhui |
| **Sitemap** | `make sitemap` | Generate sitemap standar website |
| | `make sitemap-all` | Generate sitemap komprehensif (Quran, Hadits, Doa) |
| | `make sitemap-validate` | Validasi integritas file sitemap XML |
| **Utilitas & Monitoring** | `make routes` | Menampilkan seluruh daftar route (`route:list`) |
| | `make tinker` | Buka Laravel REPL shell interaktif |
| | `make pail` | Pantau log aplikasi secara realtime (Laravel Pail) |
| | `make logs` | Live stream file log `storage/logs/laravel.log` |
| | `make logs-clear` | Kosongkan isi file log `storage/logs/laravel.log` |
| | `make info` | Tampilkan informasi aplikasi Laravel (`php artisan about`) |

---

## ⚙️ Perintah Artisan Khusus

Aplikasi dilengkapi berbagai perintah Artisan untuk pemeliharaan data, optimasi cache, dan SEO:

```bash
# Manajemen Cache Hadits Nabawi
php artisan hadits:cache warm-up    # Melakukan pre-warming katalog & hadits pilihan ke Redis
php artisan hadits:cache clear      # Membersihkan seluruh cache hadits

# Manajemen Cache Al-Qur'an
php artisan quran:cache warm-up     # Pre-warming surah dan ayat populer
php artisan quran:cache clear       # Membersihkan cache Al-Qur'an

# Pengujian & Debug Redis
php artisan redis:quick-test        # Menguji koneksi Redis via socket/TCP
php artisan redis:debug             # Menampilkan konfigurasi & status Redis
php artisan redis:safe-clear        # Membersihkan cache Redis dengan aman

# Manajemen Notifikasi Website (Tanpa Re-build)
php artisan notification:manage list       # Menampilkan seluruh daftar notifikasi di database
php artisan notification:manage add        # Menambah notifikasi baru secara interaktif / via opsi
php artisan notification:manage toggle     # Mengaktifkan atau menonaktifkan notifikasi
php artisan notification:manage delete     # Menghapus notifikasi dari database

# SEO & Sitemap
php artisan sitemap:generate-comprehensive --production  # Regenerasi sitemap lengkap untuk produksi
php artisan sitemap:submit-to-google                    # Ping sitemap ke Google Search Console
php artisan sitemap:validate                            # Validasi format sitemap
```

### ⏰ Tugas Terjadwal (Cron Jobs)
Daftar cron job otomatis yang dikonfigurasi di `routes/console.php`:
- **02:00 Pagi**: Regenerasi seluruh sitemap komprehensif (`sitemap:generate-comprehensive --production`).
- **03:00 Pagi**: Pre-warming cache data Al-Qur'an (`quran:cache warm-up`).
- **03:15 Pagi**: Pre-warming cache katalog dan data Hadits Nabawi (`hadits:cache warm-up`).
- **04:00 Pagi**: Pembersihan token reset password kadaluwarsa (`auth:clear-resets`).
- **04:15 Pagi**: Pembersihan kode OTP Admin yang telah kadaluwarsa (> 2 hari).
- **Senin 06:00 Pagi**: Submit berkala seluruh sitemap index ke Google Search Console.

---

## 🔔 Cara Mengelola Notifikasi (Tanpa Perlu Re-build)

Sistem notifikasi IndoQuran kini tersimpan secara terpusat di tabel database `notifications`. Dengan arsitektur ini, setiap pengumuman atau rilis fitur baru **dapat langsung ditambahkan, disunting, atau dinonaktifkan secara instan** tanpa perlu melakukan re-build kode frontend (Vite/React) ataupun re-deploy kode backend.

Setiap kali pengguna membuka aplikasi, dropdown notifikasi akan langsung memuat data terbaru dari database melalui endpoint `GET /api/notifications`.

### Opsi 1: Menggunakan Artisan CLI (Paling Cepat & Praktis)

Aplikasi menyediakan perintah konsol interaktif `php artisan notification:manage`:

- **Melihat seluruh daftar notifikasi aktif:**
  ```bash
  php artisan notification:manage list
  ```
- **Menambah notifikasi baru secara interaktif (dituntun prompt):**
  ```bash
  php artisan notification:manage add
  ```
- **Menambah notifikasi secara langsung via argumen CLI:**
  ```bash
  php artisan notification:manage add \
    --title="Fitur Baru: Pengingat Waktu Sholat" \
    --message="Kini tersedia jadwal sholat otomatis berdasarkan deteksi geolokasi Anda." \
    --link="/jadwal-sholat" \
    --category="Fitur Baru" \
    --section="new" \
    --badge-icon="sparkles" \
    --badge-color="bg-emerald-600"
  ```
- **Mengaktifkan / Menonaktifkan status notifikasi:**
  ```bash
  php artisan notification:manage toggle --id=notif-seo-rich-snippets
  ```
- **Menghapus notifikasi dari database:**
  ```bash
  php artisan notification:manage delete --id=1
  ```

### Opsi 2: Menggunakan API Admin Panel

Notifikasi dapat dikelola melalui endpoint REST API admin terproteksi sesi (`auth` & `admin`):
- `GET /api/admin/notifications` — Daftar seluruh notifikasi dengan paginasi dan filter
- `POST /api/admin/notifications` — Menambah notifikasi baru
- `PUT /api/admin/notifications/{id}` — Memperbarui data notifikasi
- `DELETE /api/admin/notifications/{id}` — Menghapus notifikasi
- `POST /api/admin/notifications/{id}/toggle-active` — Mengubah status aktif / nonaktif

### Opsi 3: Menggunakan Query SQL / Database Langsung

Anda dapat langsung melakukan query `INSERT` pada tabel `notifications` (misal via phpMyAdmin atau MySQL CLI):

```sql
INSERT INTO notifications (
    identifier, title, message, link, category, type, 
    badge_icon, badge_color, image, section, time_ago, 
    is_featured, is_active, sort_order, published_at, created_at, updated_at
) VALUES (
    'notif-fitur-baru',
    'Fitur Baru: Mode Malam Khusus Mushaf',
    'Baca Al-Qur\'an lebih nyaman di malam hari dengan tema kontras tinggi ramah mata.',
    '/surah',
    'Fitur Baru',
    'feature',
    'sparkles',
    'bg-blue-600',
    '/images/logo-icon.webp',
    'new',
    'Baru saja',
    1, 1, 1, NOW(), NOW(), NOW()
);
```

> [!TIP]
> **Panduan Pilihan Ikon & Warna Badge**:
> - **Ikon (`badge_icon`)**: `book` (📖), `bookmark` (🔖), `sparkles` (✨), `check` (✓), `speaker` (🔊), `prayer` (🤲), `target` (🎯), `mobile` (📱).
> - **Warna (`badge_color`)**: `bg-emerald-600`, `bg-blue-600`, `bg-amber-600`, `bg-teal-600`, `bg-indigo-600`, `bg-rose-600`, `bg-purple-600`.
> - **Section (`section`)**: `new` (Tampil di kelompok *Terbaru/Hari ini*) atau `earlier` (Tampil di kelompok *Sebelumnya/Minggu ini*).

---

## 🚢 Panduan Deployment Produksi

### Skema Deployment (cPanel / VPS / Dedicated Server)

Server hosting/produksi umumnya tidak memerlukan Node.js karena aset frontend dibangun (build) secara lokal sebelum diunggah ke server:

1. **Build Aset Frontend Secara Lokal:**
   ```bash
   npm run build
   git add public/build
   git commit -m "feat: build production assets for deployment"
   git push origin main
   ```

2. **Di Server Produksi (via SSH):**
   ```bash
   git pull origin main
   ./deploy-production.sh
   ```

   Skrip `deploy-production.sh` secara otomatis akan:
   - Menjalankan migrasi database (`php artisan migrate --force`)
   - Membersihkan dan mengompilasi ulang cache Laravel (`config`, `route`, `view`)
   - Memastikan perizinan folder storage (`chmod`/`chown`)
   - Menjalankan warm-up cache untuk performa seketika
   - Menyediakan opsi rollback jika dibutuhkan: `./deploy-production.sh --rollback`

3. **Pastikan Tautan Storage Terpasang:**
   ```bash
   php artisan storage:link
   ```

---

## 📡 Dokumentasi Endpoint API

### 1. Al-Qur'an & Murottal
- `GET /api/surahs` - Daftar seluruh 114 surah (dengan metadata)
- `GET /api/surahs/{number}` - Detail surah beserta ayat, teks Arab, transliterasi, dan terjemahan
- `GET /api/surahs/{number}/metadata` - Metadata dan pokok kandungan surah
- `GET /api/juz` & `GET /api/juz/{number}` - Data Al-Qur'an per Juz (1 - 30)
- `GET /api/halaman` & `GET /api/halaman/{number}` - Data mushaf per Halaman (1 - 604)
- `GET /api/cari?q={query}` - Pencarian ayat berdasarkan terjemahan
- `GET /api/reciters` - Daftar 79+ qari murottal
- `GET /api/audio/ayah/{surah}/{ayah}?reciter={id}` - URL file audio ayat spesifik

### 2. Ensiklopedia Hadits Nabawi
- `GET /api/hadits` - Katalog metadata 11 kitab hadits mu'tamad
- `GET /api/hadits/{kitab}` - Daftar hadits per kitab dengan dukungan pagination (`?page=1&per_page=20`)
- `GET /api/hadits/{kitab}/{nomor}` - Detail hadits (teks Arab lengkap, sanad, dan terjemahan)
- `GET /api/hadits/search?q={query}&kitab={slug}` - Pencarian riwayat hadits berdasarkan kata kunci
- `GET /api/hadits/random` - Hadits acak harian

### 3. Tafsir Maudhui & Asmaul Husna
- `GET /api/tafsir-maudhui` - Daftar artikel tafsir tematik Al-Qur'an
- `GET /api/tafsir-maudhui/{slug}` - Detail konten tafsir tematik
- `GET /api/asmaul-husna` - Daftar 99 Asmaul Husna
- `GET /api/asmaul-husna/{slug}` - Penjelasan detail nama Allah beserta dalil

### 4. Doa, Dzikir & Sholat
- `GET /api/doa-pilihan` - Kumpulan doa shahih harian
- `GET /api/doa-pilihan/{id}` - Detail doa beserta audio pelafalan
- `GET /api/doa-bersama` - Daftar doa komunitas interaktif
- `POST /api/doa-bersama` - Kirim permohonan doa baru
- `POST /api/doa-bersama/{id}/amin` - Mengaminkan permohonan doa
- `GET /api/prayer-times?latitude={lat}&longitude={lng}` - Jadwal sholat harian berdasarkan koordinat

### 5. Artikel & Komentar
- `GET /api/articles` - Daftar artikel Islami terbaru
- `GET /api/articles/{slug}` - Detail artikel lengkap
- `GET /api/articles/{slug}/comments` - Daftar komentar pada artikel
- `POST /api/articles/{slug}/comments` - Kirim tanggapan/komentar (opsi anonim atau profil akun)
- `GET /api/tags` - Daftar tag dan kategori artikel

### 6. Autentikasi & Akun Member
- `POST /api/masuk` / `/api/login` - Login pengguna via email & kata sandi
- `POST /api/daftar` / `/api/register` - Registrasi pengguna baru
- `POST /api/auth/google/one-tap` - Autentikasi otomatis via Google One Tap / Google Credential
- `GET /api/user` - Data profil pengguna yang sedang login
- `GET /api/penanda` - Daftar bookmark ayat Al-Qur'an
- `POST /api/penanda/surah/ayah/{id}/toggle` - Simpan / lepas penanda baca ayat
- `GET /api/penanda/hadits` - Daftar bookmark hadits pengguna
- `POST /api/penanda/hadits/{kitab}/{number}/toggle` - Simpan / lepas penanda baca hadits

### 7. Notifikasi Website
- `GET /api/notifications` - Daftar kabar terbaru website untuk publik (live dari database)
- `GET /api/admin/notifications` - Daftar seluruh notifikasi dengan paginasi dan filter (Admin)
- `POST /api/admin/notifications` - Tambah notifikasi baru (Admin)
- `PUT /api/admin/notifications/{id}` - Perbarui data notifikasi (Admin)
- `DELETE /api/admin/notifications/{id}` - Hapus notifikasi dari database (Admin)
- `POST /api/admin/notifications/{id}/toggle-active` - Toggle aktif/nonaktif notifikasi (Admin)

---

## 📜 Riwayat Versi & Pembaruan

Riwayat rilis lengkap dapat diakses secara interaktif langsung melalui halaman web aplikasi di rute **`/riwayat-versi`** yang dilengkapi fitur pencarian versi dan filter tipe perubahan.

Ringkasan rilis terbaru:
- **v2.32.0**: Fitur filter kategori/bab Hadits Nabawi interaktif & cache instan, optimasi SEO Google Rich Snippets (skema FAQPage Surah & Juz, BreadcrumbList berjenjang, WebSite Sitelinks SearchBox), dukungan rute kanonikal per nomor ayat (`/{surahSlug}/{nomorAyat}`), dedicated sitemap topik hadits (`sitemap-hadits-topik.xml`), ketahanan Redis cache, dan pembaruan PWA v2.32.0.
- **v2.31.0**: Restrukturisasi Ensiklopedia 7 Kitab Hadits Mu'tamad (33.137 hadits), sistem penanda (bookmark) hadits untuk member dan tamu, standarisasi database UTF8mb4 dengan kolom penjelasan/syarah, manajemen cache hadits granular via CLI (`php artisan hadits:cache`), arsitektur sitemap modular per kitab hadits, dan pembaruan PWA v2.31.0.
- **v2.30.0**: Peluncuran Ensiklopedia Hadits Nabawi, pemutar audio pelafalan Arab Web Speech API (Hadits & Doa Bersama), sistem notifikasi kabar terbaru website (Facebook style), layanan `HaditsCacheService`, dan pembaruan PWA v2.30.0.
- **v2.29.0**: Tampilan tab interaktif horizontal pokok kandungan dan tema utama surah dengan tipografi kaligrafi Scheherazade, tombol navigasi antar-tema, dan pembaruan PWA cache v2.29.0.
- **v2.28.0**: Sistem komentar artikel untuk publik dan member, dukungan identitas anonim ("Hamba Allah"), serta dashboard moderasi komentar admin (`/admin`).
- **v2.27.0**: Validasi judul unik artikel secara real-time dan tampilan cuplikan (excerpt) artikel.

---

## 🤝 Berkontribusi

Kontribusi pengembangan, koreksi terjemahan, maupun perbaikan bug selalu disambut baik:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/fitur-keren`)
3. Commit perubahan Anda (`git commit -m 'feat: menambahkan fitur keren'`)
4. Push branch ke repository Anda (`git push origin feature/fitur-keren`)
5. Ajukan Pull Request

---

## 📄 Lisensi

Proyek IndoQuran dirilis di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  <strong>IndoQuran - Al-Quran & Hadits dengan Teknologi Modern</strong><br>
  <em>"Dan sesungguhnya telah Kami mudahkan Al-Quran untuk pelajaran, maka adakah orang yang mengambil pelajaran?" (QS. Al-Qamar: 17)</em>
</p>
