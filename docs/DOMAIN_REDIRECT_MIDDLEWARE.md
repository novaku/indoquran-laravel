# Domain Redirect Middleware Documentation

## Gambaran Umum

`DomainRedirectMiddleware` adalah middleware Laravel yang berfungsi untuk mengarahkan (redirect) semua request yang masuk melalui domain `my.indoquran.web.id` ke domain utama `indoquran.web.id`.

## Fitur

- **Automatic Domain Redirect**: Secara otomatis redirect dari `my.indoquran.web.id` ke `indoquran.web.id`
- **Preserve URL Structure**: Mempertahankan path, query parameters, dan fragment URL
- **SEO Friendly**: Menggunakan HTTP 301 (Permanent Redirect) untuk SEO yang optimal
- **Protocol Agnostic**: Bekerja dengan HTTP dan HTTPS

## Implementasi

### 1. Middleware Class

File: `app/Http/Middleware/DomainRedirectMiddleware.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DomainRedirectMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $currentUrl = $request->fullUrl();
        $host = $request->getHost();
        
        if ($host === 'my.indoquran.web.id') {
            $newUrl = str_replace('://my.indoquran.web.id', '://indoquran.web.id', $currentUrl);
            return redirect($newUrl, 301);
        }
        
        return $next($request);
    }
}
```

### 2. Registration

Middleware ini didaftarkan di `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    // Add domain redirect middleware globally (first priority)
    $middleware->web(prepend: [
        \App\Http\Middleware\DomainRedirectMiddleware::class,
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
    
    // Alias untuk penggunaan spesifik
    $middleware->alias([
        'domain.redirect' => \App\Http\Middleware\DomainRedirectMiddleware::class,
        // ... middleware lainnya
    ]);
})
```

## Cara Kerja

1. **Request Masuk**: Setiap request yang masuk akan melewati middleware ini terlebih dahulu
2. **Domain Check**: Middleware mengecek apakah domain yang digunakan adalah `my.indoquran.web.id`
3. **URL Reconstruction**: Jika ya, middleware akan membangun ulang URL dengan mengganti domain ke `indoquran.web.id`
4. **Redirect**: Melakukan redirect 301 ke URL baru
5. **Pass Through**: Jika bukan domain yang perlu di-redirect, request dilanjutkan normal

## Contoh Penggunaan

### Redirect Examples

- `https://my.indoquran.web.id/` → `https://indoquran.web.id/`
- `https://my.indoquran.web.id/surat/al-fatihah` → `https://indoquran.web.id/surat/al-fatihah`
- `https://my.indoquran.web.id/search?q=rahman` → `https://indoquran.web.id/search?q=rahman`
- `http://my.indoquran.web.id/admin` → `http://indoquran.web.id/admin`

### Normal Traffic (No Redirect)

- `https://indoquran.web.id/` → Tidak ada redirect (normal flow)
- `https://api.indoquran.web.id/` → Tidak ada redirect (domain berbeda)
- `https://other-domain.com/` → Tidak ada redirect (domain berbeda)

## Konfigurasi

### Global Application

Middleware ini dikonfigurasi secara global untuk semua web routes dengan prioritas tertinggi (prepend), sehingga akan dijalankan sebelum middleware lainnya.

### Manual Usage

Jika diperlukan untuk route tertentu, bisa menggunakan alias:

```php
Route::get('/special-route', function () {
    // controller logic
})->middleware('domain.redirect');
```

## Benefits

1. **SEO Optimization**: Redirect 301 memberitahu search engine bahwa ini adalah perpindahan permanen
2. **User Experience**: User tidak akan melihat URL lama, selalu diarahkan ke domain utama
3. **Branding Consistency**: Memastikan semua traffic menggunakan domain utama
4. **Analytics Accuracy**: Semua traffic terpusat di satu domain untuk analisis yang akurat

## Maintenance

- Middleware ini tidak memerlukan maintenance khusus
- Logging bisa ditambahkan jika diperlukan untuk monitoring traffic redirect
- Bisa dimodifikasi untuk menambah domain lain yang perlu di-redirect

## Testing

Untuk testing, pastikan:

1. Request ke `my.indoquran.web.id` mengembalikan response 301
2. URL redirect sesuai dengan yang diharapkan
3. Query parameters dan path tetap terjaga
4. Request ke domain lain tidak terpengaruh
