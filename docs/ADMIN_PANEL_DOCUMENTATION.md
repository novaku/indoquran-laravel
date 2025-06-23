# Admin Panel Documentation - OTP Authentication

## Overview
Panel administrasi khusus untuk IndoQuran yang menggunakan sistem autentikasi OTP (One-Time Password) melalui email. Hanya email `kontak@indoquran.web.id` yang dapat mengakses panel ini dengan kode OTP yang dikirim via email.

## Features yang Telah Diimplementasikan

### 1. Sistem Autentikasi OTP Admin
- **Email Admin**: `kontak@indoquran.web.id`
- **Autentikasi**: Menggunakan kode OTP 6 digit yang dikirim via email
- **Keamanan**: Kode OTP berlaku selama 1 jam dan hanya dapat digunakan sekali
- **Middleware Proteksi**: Route admin dilindungi dengan middleware khusus yang memverifikasi status admin

### 2. Dashboard Admin
- **URL**: `/admin/dashboard`
- **Statistik Real-time**:
  - Total pengguna terdaftar
  - Total pesan kontak
  - Total doa bersama
  - Total pencarian
  - Total surah dan ayat

### 3. Data Management
Panel admin menampilkan:
- **Pengguna Terbaru**: 5 user terbaru yang mendaftar
- **Pesan Kontak Terbaru**: 5 pesan kontak terbaru
- **Doa Bersama Terbaru**: 5 doa bersama terbaru
- **Pencarian Populer**: Top 10 kata kunci pencarian

## File yang Dibuat/Dimodifikasi

### Backend (Laravel)
1. **Migration**: `database/migrations/2024_12_23_000000_add_is_admin_to_users_table.php`
   - Menambah kolom `is_admin` ke tabel users

2. **Migration**: `database/migrations/2024_12_23_000001_create_admin_otp_codes_table.php`
   - Membuat tabel untuk menyimpan kode OTP admin

3. **Model**: `app/Models/AdminOtpCode.php`
   - Model untuk mengelola kode OTP
   - Generate OTP 6 digit
   - Validasi OTP (expiry, usage)
   - Mark OTP sebagai used

4. **Seeder**: `database/seeders/AdminUserSeeder.php`
   - Membuat user admin (tanpa password)

5. **Mail**: `app/Mail/AdminOtpMail.php`
   - Email class untuk mengirim OTP

6. **Email Template**: `resources/views/emails/admin-otp.blade.php`
   - Template email OTP yang profesional dan aman

7. **Controller**: `app/Http/Controllers/Auth/AdminController.php`
   - Login OTP workflow
   - Dashboard data API
   - Management endpoints untuk users, contacts, prayers

8. **Middleware**: `app/Http/Middleware/AdminMiddleware.php`
   - Proteksi route admin
   - Verifikasi status admin user

9. **Model Update**: `app/Models/User.php`
   - Menambah field `is_admin` ke fillable
   - Menambah cast boolean untuk `is_admin`
   - Method `isAdmin()` untuk verifikasi

10. **Routes**: `routes/web.php`
    - Route admin login: `/admin/login`
    - Route send OTP: `/admin/send-otp`
    - Route admin dashboard: `/admin/dashboard`
    - API endpoints untuk data management

### Frontend (React)
1. **AdminLoginPage**: `resources/js/react/pages/AdminLoginPage.jsx`
   - Two-step authentication form (email → OTP)
   - Real-time countdown timer untuk expiry OTP
   - Validasi email kontak@indoquran.web.id
   - UI yang aman dan user-friendly

2. **AdminDashboard**: `resources/js/react/pages/AdminDashboard.jsx`
   - Dashboard dengan statistik real-time
   - Tab-based navigation
   - Data visualization untuk recent activities

3. **App.jsx**: Update routes untuk admin

## Keamanan
- **Email Restriction**: Hanya email `kontak@indoquran.web.id` yang dapat request OTP
- **OTP Security**: Kode OTP 6 digit dengan expiry 1 jam
- **Single Use**: Setiap OTP hanya dapat digunakan sekali
- **Database Verification**: Double-check status admin di database
- **Middleware Protection**: Semua route admin dilindungi middleware
- **Session/Token Based**: Mendukung web session dan API token
- **CSRF Protection**: Protected dari CSRF attacks
- **Email Logging**: Semua aktivitas OTP dicatat untuk audit

## Cara Menggunakan

### 1. Setup (One-time)
```bash
# Jalankan migration
php artisan migrate

# Jalankan seeder untuk membuat admin user
php artisan db:seed --class=AdminUserSeeder

# Build frontend
npm run build
```

### 2. Akses Admin Panel
1. Buka browser ke `/admin` atau `/admin/login`
2. Masukkan email: `kontak@indoquran.web.id`
3. Klik "Kirim Kode OTP"
4. Periksa email untuk mendapatkan kode OTP 6 digit
5. Masukkan kode OTP pada form
6. Klik "Masuk ke Admin Panel"
7. Setelah login, akan diarahkan ke `/admin/dashboard`

### 3. Menggunakan Dashboard
- **Overview**: Ringkasan sistem
- **Pengguna Terbaru**: Melihat user baru
- **Kontak Terbaru**: Melihat pesan kontak terbaru
- **Doa Terbaru**: Monitoring doa bersama
- **Pencarian Populer**: Analytics pencarian

## API Endpoints

### Authentication
- `POST /admin/send-otp` - Send OTP to admin email
- `POST /admin/login` - Admin login with OTP
- `GET /admin/login` - Admin login form

### Dashboard (Protected)
- `GET /admin/dashboard` - Dashboard data
- `GET /admin/users` - Users list with pagination
- `GET /admin/contacts` - Contacts list with pagination  
- `GET /admin/prayers` - Prayers list with pagination

## Security Notes
- Admin authentication sekarang menggunakan OTP melalui email untuk keamanan ekstra
- Kode OTP berlaku 1 jam dan hanya dapat digunakan sekali
- All admin routes require authentication + admin verification
- Frontend menyimpan admin status di localStorage untuk UX
- CSRF token protection pada semua requests
- Session regeneration setelah login untuk security
- Email audit trail untuk semua aktivitas OTP

## Technical Stack
- **Backend**: Laravel dengan Sanctum untuk API auth
- **Frontend**: React dengan React Router
- **Email**: Laravel Mail dengan template Blade
- **OTP Storage**: Database dengan expiry management
- **Styling**: Tailwind CSS dengan Heroicons
- **State Management**: useState + localStorage untuk admin session
- **HTTP Client**: Fetch API dengan CSRF token support
