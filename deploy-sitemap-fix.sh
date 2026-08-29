#!/usr/bin/env bash

# ==============================================================================
# IndoQuran - Production Sitemap Generator (cPanel Cron Job Script)
# ==============================================================================
#
# Petunjuk Penggunaan di cPanel Cron Jobs:
# ------------------------------------------------------------------------------
# 1. Pastikan script ini memiliki permission executable:
#    chmod +x /path/to/indoquran-laravel/deploy-sitemap-fix.sh
#
# 2. Buka cPanel -> Masuk ke menu "Cron Jobs" (Tugas Cron)
#
# 3. Pengaturan Waktu (Disarankan: Setiap hari jam 02:00 pagi atau mingguan):
#    - Menit  : 0
#    - Jam    : 2
#    - Hari   : *
#    - Bulan  : *
#    - Hari dlm seminggu : *
#    (Ekspresi Cron: 0 2 * * *)
#
# 4. Perintah Cron (path project Anda: /home/indoqura/repositories/indoquran-laravel):
#    /bin/bash /home/indoqura/repositories/indoquran-laravel/deploy-sitemap-fix.sh >> /home/indoqura/repositories/indoquran-laravel/storage/logs/sitemap-cron.log 2>&1
#
#    Atau jika ingin tanpa log file:
#    /bin/bash /home/indoqura/repositories/indoquran-laravel/deploy-sitemap-fix.sh >/dev/null 2>&1
# ==============================================================================

set -e

# Tentukan direktori project (otomatis mendeteksi lokasi script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERROR: Tidak dapat berpindah ke direktori: $SCRIPT_DIR"
    exit 1
}

# Fungsi logging dengan timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "========================================================"
log "🚀 Memulai Pembuatan Sitemap Lengkap Production (IndoQuran)"
log "📁 Direktori Kerja: $SCRIPT_DIR"

# 1. Verifikasi keberadaan file artisan
if [ ! -f "artisan" ]; then
    log "❌ ERROR: File 'artisan' tidak ditemukan di $SCRIPT_DIR"
    exit 1
fi

# 2. Deteksi Binary PHP yang tersedia di server / cPanel
PHP_BIN=""
if [ -n "$PHP_CLI_PATH" ] && [ -x "$PHP_CLI_PATH" ]; then
    PHP_BIN="$PHP_CLI_PATH"
elif command -v php &> /dev/null; then
    PHP_BIN=$(command -v php)
elif [ -x "/usr/local/bin/php" ]; then
    PHP_BIN="/usr/local/bin/php"
elif [ -x "/usr/bin/php" ]; then
    PHP_BIN="/usr/bin/php"
else
    # Cek lokasi umum PHP di cPanel (ea-php81, ea-php82, ea-php83, alt-php)
    for cpanel_php in \
        /opt/cpanel/ea-php83/root/usr/bin/php \
        /opt/cpanel/ea-php82/root/usr/bin/php \
        /opt/cpanel/ea-php81/root/usr/bin/php \
        /opt/alt/php82/usr/bin/php \
        /opt/alt/php81/usr/bin/php; do
        if [ -x "$cpanel_php" ]; then
            PHP_BIN="$cpanel_php"
            break
        fi
    done
fi

if [ -z "$PHP_BIN" ]; then
    log "❌ ERROR: Binary PHP CLI tidak ditemukan di server!"
    exit 1
fi

PHP_VER=$("$PHP_BIN" -v 2>/dev/null | head -n 1)
log "🐘 Menggunakan PHP: $PHP_BIN ($PHP_VER)"

# 3. Jalankan artisan command untuk membuat sitemap komprehensif production
log "🔄 Menjalankan: $PHP_BIN artisan sitemap:generate-comprehensive --production"

"$PHP_BIN" artisan sitemap:generate-comprehensive --production

# 4. Set permission agar file sitemap & robots.txt dapat diakses web server
if [ -d "public" ]; then
    chmod 644 public/sitemap*.xml 2>/dev/null || true
    chmod 644 public/robots.txt 2>/dev/null || true
    log "🔒 Permission file sitemap diperbarui (644)"
fi

# 5. Ringkasan file sitemap yang dihasilkan
log "📊 Hasil Pembuatan Sitemap:"
if ls public/sitemap*.xml 1> /dev/null 2>&1; then
    for file in public/sitemap*.xml; do
        file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || wc -c < "$file")
        url_count=$(grep -c '<loc>' "$file" 2>/dev/null || echo "0")
        log "  → $(basename "$file"): $file_size bytes | $url_count URL"
    done
else
    log "⚠️  Peringatan: File sitemap tidak ditemukan di public/"
fi

# 6. Selesai
log "✅ Selesai! Sitemap berhasil diperbarui untuk Google Search Console & Mesin Pencari."
log "========================================================"
exit 0

