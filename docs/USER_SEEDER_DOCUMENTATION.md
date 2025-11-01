# User Seeder - IndoQuran Laravel

## Deskripsi
Seeder untuk membuat user reguler (non-admin) untuk keperluan testing dan development.

## File
- **Seeder**: `database/seeders/UserSeeder.php`
- **Model**: `app/Models/User.php`

## User Credentials
Seeder ini membuat 5 user reguler dengan kredensial berikut:

| Nama | Email | Phone | Password | Role |
|------|-------|-------|----------|------|
| Ahmad Abdullah | ahmad@example.com | 081234567890 | password123 | User |
| Fatimah Zahra | fatimah@example.com | 081234567891 | password123 | User |
| Muhammad Yusuf | yusuf@example.com | 081234567892 | password123 | User |
| Khadijah Siti | khadijah@example.com | 081234567893 | password123 | User |
| Ibrahim Hassan | ibrahim@example.com | 081234567894 | password123 | User |

## Cara Menggunakan

### Menjalankan Seeder Ini Saja
```bash
php artisan db:seed --class=UserSeeder
```

### Menjalankan Semua Seeder
```bash
php artisan db:seed
```

### Reset Database dan Jalankan Semua Seeder
```bash
php artisan migrate:fresh --seed
```

## Catatan
- Semua user memiliki `is_admin = false` (user reguler)
- Password semua user adalah `password123` untuk memudahkan testing
- Seeder menggunakan `updateOrCreate()` sehingga aman dijalankan berulang kali
- Email akan tetap unique (tidak akan membuat duplikat)

## Integrasi dengan DatabaseSeeder
Seeder ini sudah terintegrasi dalam `DatabaseSeeder.php` dan akan dijalankan setelah `AdminUserSeeder` saat menjalankan `php artisan db:seed`.

## Testing Login
Untuk testing fitur autentikasi, gunakan salah satu kredensial di atas:
- Email: `ahmad@example.com`
- Password: `password123`

## Admin User
Untuk admin user, gunakan seeder terpisah:
```bash
php artisan db:seed --class=AdminUserSeeder
```

Admin credentials:
- Email: `kontak@indoquran.web.id`
- Password: `Admin@IndoQuran2024!`
