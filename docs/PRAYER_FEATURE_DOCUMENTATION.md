# Fitur Doa Bersama - IndoQuran

## Deskripsi
Fitur Doa Bersama memungkinkan pengguna yang sudah login untuk:
1. **Mengirim doa** untuk dibaca semua orang
2. **Memberikan amin** pada doa orang lain
3. **Memberikan komentar** atau dukungan pada doa orang lain

## Struktur Database

### Table: `prayers`
- `id` - Primary key
- `user_id` - Foreign key ke tabel users
- `title` - Judul doa (string, max 255 karakter)
- `content` - Isi doa (text, max 2000 karakter)
- `category` - Kategori doa (enum: umum, kesehatan, keluarga, pekerjaan, pendidikan, keuangan, perjalanan, lainnya)
- `is_anonymous` - Apakah doa dikirim secara anonim (boolean)
- `amin_count` - Jumlah amin yang diterima (integer)
- `comment_count` - Jumlah komentar (integer)
- `is_featured` - Apakah doa ditampilkan sebagai unggulan (boolean)
- `featured_at` - Waktu doa dijadikan unggulan (timestamp)
- `created_at` & `updated_at` - Timestamps

### Table: `prayer_amins`
- `id` - Primary key
- `user_id` - Foreign key ke tabel users
- `prayer_id` - Foreign key ke tabel prayers
- `created_at` & `updated_at` - Timestamps
- **Unique constraint**: (user_id, prayer_id) - Satu user hanya bisa amin sekali per doa

### Table: `prayer_comments`
- `id` - Primary key
- `user_id` - Foreign key ke tabel users
- `prayer_id` - Foreign key ke tabel prayers
- `content` - Isi komentar (text, max 1000 karakter)
- `is_anonymous` - Apakah komentar dikirim secara anonim (boolean)
- `created_at` & `updated_at` - Timestamps

## API Endpoints

### Public Endpoints (Tidak perlu login)
- `GET /api/prayers` - Mengambil daftar doa dengan pagination
- `GET /api/prayers/{id}` - Mengambil detail doa
- `GET /api/prayers/{id}/comments` - Mengambil komentar doa
- `GET /api/prayer-categories` - Mengambil daftar kategori doa

### Protected Endpoints (Perlu login)
- `POST /api/prayers` - Mengirim doa baru
- `PUT /api/prayers/{id}` - Mengupdate doa (hanya pemilik)
- `DELETE /api/prayers/{id}` - Menghapus doa (hanya pemilik)
- `POST /api/prayers/{id}/amin` - Toggle amin pada doa
- `POST /api/prayers/{id}/comments` - Menambah komentar pada doa
- `DELETE /api/prayer-comments/{id}` - Menghapus komentar (hanya pemilik)

## Fitur Halaman Doa Bersama

### Filters dan Pencarian
- **Kategori**: Filter berdasarkan kategori doa
- **Sorting**: 
  - Terbaru (default)
  - Terlama
  - Populer (berdasarkan jumlah amin)
  - Unggulan
- **Pencarian**: Cari berdasarkan judul atau isi doa

### Form Doa Baru
- Judul doa (wajib, max 255 karakter)
- Kategori (wajib, pilihan dropdown)
- Isi doa (wajib, max 2000 karakter)
- Opsi anonim (opsional)

### Kartu Doa
Setiap doa ditampilkan dalam kartu yang berisi:
- Nama penulis (atau "Hamba Allah" jika anonim)
- Waktu posting (relative time)
- Kategori dan badge unggulan (jika ada)
- Judul dan isi doa
- Tombol amin dengan counter
- Tombol komentar dengan counter
- Section komentar (expandable)

### Form Komentar
- Textarea untuk komentar (max 1000 karakter)
- Opsi anonim
- Counter karakter
- Tombol kirim

## Komponen React

### PrayerPage.jsx
- Komponen utama halaman doa bersama
- Mengelola state untuk doa, filters, pagination
- Handles API calls untuk CRUD operations

### PrayerForm.jsx
- Form untuk mengirim doa baru
- Validasi client-side
- Dropdown kategori dinamis

### PrayerFilters.jsx
- Komponen filter dan pencarian
- Dropdown kategori dan sorting
- Search input dengan debouncing

### PrayerCard.jsx
- Komponen kartu individual doa
- Toggle amin functionality
- Expandable comments section
- Form komentar inline

## Validasi

### Server-side (Laravel)
- Title: required, string, max 255
- Content: required, string, max 2000
- Category: required, string, enum values
- Comment content: required, string, max 1000

### Client-side (React)
- Form validation sebelum submit
- Character counters
- Required field indicators

## Notifikasi
Menggunakan `react-hot-toast` untuk notifikasi:
- Success: Doa berhasil dikirim, amin berhasil, komentar berhasil
- Error: Validasi gagal, server error
- Info: Login required messages

## Keamanan
- Semua endpoint protected menggunakan Laravel Sanctum
- CSRF protection
- SQL injection protection via Eloquent ORM
- XSS protection via input sanitization

## SEO
- Meta tags untuk halaman doa bersama
- Structured data untuk prayer content
- Proper breadcrumbs

## Performance
- Lazy loading untuk komponen
- Pagination untuk menghindari loading data berlebihan
- API caching (optional)
- Image optimization untuk avatars

## Testing Data
Untuk testing, telah dibuat seeder `PrayerSeeder` yang membuat:
- 3 test users
- 6 sample prayers dengan berbagai kategori
- Random amins dan comments
- Realistic timestamps

### Menjalankan Seeder
```bash
php artisan db:seed --class=PrayerSeeder
```

## Penggunaan

### Untuk User yang Belum Login
- Dapat melihat semua doa
- Dapat membaca komentar
- Dapat menggunakan filter dan pencarian
- Tidak dapat mengirim doa, amin, atau komentar

### Untuk User yang Sudah Login
- Semua fitur di atas
- Dapat mengirim doa baru
- Dapat memberikan amin pada doa
- Dapat mengomentari doa
- Dapat mengedit/hapus doa sendiri
- Dapat menghapus komentar sendiri

## Future Enhancements
- Push notifications untuk amin dan komentar
- Prayer analytics dan insights
- Featured prayers moderation
- Prayer sharing functionality
- Bookmark prayers
- Prayer reminders
- Multi-language support
