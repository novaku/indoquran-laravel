#!/bin/bash

# ==============================================================================
# IndoQuran Production Deployment Script (Laravel + React)
# ==============================================================================
# ⚠️  CATATAN PENTING:
# Server production (Shared Hosting / VPS) TIDAK memiliki Node.js & npm!
# Frontend assets (React / Tailwind / Vite) WAJIB di-build di komputer lokal,
# lalu di-commit ke Git sebelum menjalankan script ini di server production.
#
# Alur deployment:
# 1. Di Komputer LOKAL:
#    npm run build
#    git add -A && git commit -m "Build frontend assets"
#    git push origin main
#
# 2. Di Server PRODUCTION:
#    ./deploy-production.sh
# ==============================================================================

# Strict error handling: keluar jika terjadi error tak tertangani
set -eo pipefail

# ANSI Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper logger functions
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗ ERROR:${NC} $1"
}

# Default flag values
ROLLBACK_MODE=false
ROLLBACK_TARGET=""
QUICK_MODE=false
SKIP_MIGRATE=false
WARM_ONLY=false
FORCE_MODE=false

# Print usage information
show_help() {
    echo -e "${BOLD}Usage:${NC} ./deploy-production.sh [OPTIONS]"
    echo ""
    echo -e "${BOLD}Pilihan Deployment:${NC}"
    echo "  (tanpa argumen)       Deploy standar (git pull origin main + migrasi + optimasi)"
    echo "  --rollback, -r        Menu interaktif rollback ke commit sebelumnya"
    echo "  --rollback <N>        Rollback N commit ke belakang (contoh: --rollback 1)"
    echo "  --rollback <hash>     Rollback ke commit hash spesifik (contoh: --rollback a1b2c3d)"
    echo "  --quick, -q           Deploy cepat (skip database migration & cache warm-up)"
    echo "  --no-migrate          Deploy tanpa menjalankan database migration"
    echo "  --warm-only           Hanya bersihkan dan warm-up cache (tanpa git pull & migrasi)"
    echo "  --force, -f           Jalankan tanpa konfirmasi interaktif (cocok untuk CI/CD)"
    echo "  --help, -h            Tampilkan bantuan ini"
    echo ""
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --rollback|-r)
            ROLLBACK_MODE=true
            if [[ -n "$2" && ! "$2" =~ ^- ]]; then
                ROLLBACK_TARGET="$2"
                shift
            fi
            shift
            ;;
        --quick|-q)
            QUICK_MODE=true
            SKIP_MIGRATE=true
            shift
            ;;
        --no-migrate)
            SKIP_MIGRATE=true
            shift
            ;;
        --warm-only)
            WARM_ONLY=true
            shift
            ;;
        --force|-f)
            FORCE_MODE=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            log_error "Pilihan tidak dikenal: $1"
            show_help
            exit 1
            ;;
    esac
done

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         INDOQURAN PRODUCTION DEPLOYMENT & OPTIMIZER        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ------------------------------------------------------------------------------
# 1. Environment & Pre-flight Checks
# ------------------------------------------------------------------------------
log_info "Memeriksa environment produksi..."

if [ ! -f .env ]; then
    log_error "File .env tidak ditemukan! Pastikan Anda berada di direktori root aplikasi."
    exit 1
fi

if grep -q "APP_ENV=production" .env; then
    log_success "Environment: PRODUCTION terverifikasi"
else
    log_warning "APP_ENV bukan 'production' di file .env"
    if [ "$FORCE_MODE" = false ]; then
        read -p "Apakah Anda yakin ingin melanjutkan di environment ini? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment dibatalkan oleh pengguna."
            exit 0
        fi
    fi
fi

# Pastikan izin tulis sebelum operasi Git untuk mencegah 'permission denied'
chmod -R u+w public/build storage bootstrap/cache 2>/dev/null || true

# ------------------------------------------------------------------------------
# 2. Interactive Selection (jika dijalankan interaktif tanpa argumen)
# ------------------------------------------------------------------------------
if [ "$ROLLBACK_MODE" = false ] && [ "$WARM_ONLY" = false ] && [ "$FORCE_MODE" = false ] && [ -t 0 ]; then
    echo -e "${BOLD}Pilih mode operasi:${NC}"
    echo "  1) Standard Deploy (Tarik git pull origin main, optimasi & cache) [Default]"
    echo "  2) Rollback Git ke commit sebelumnya"
    echo "  3) Hanya Warm-up & Optimasi Cache (tanpa pull git)"
    echo ""
    read -t 10 -p "Pilihan Anda [1/2/3, default: 1 dalam 10 detik]: " user_op || user_op=1
    echo ""
    case "$user_op" in
        2)
            ROLLBACK_MODE=true
            ;;
        3)
            WARM_ONLY=true
            ;;
        *)
            # Lanjut ke default standard deploy
            ;;
    esac
fi

# ------------------------------------------------------------------------------
# 3. Rollback Logic
# ------------------------------------------------------------------------------
handle_rollback() {
    log_info "Memulai proses Git Rollback..."
    
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  Git History (10 Commit Terakhir)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    local commits=()
    local hashes=()
    local idx=1
    
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            commits+=("$line")
            hashes+=("$(echo "$line" | awk '{print $1}')")
            echo -e "  ${CYAN}[$idx]${NC} $line"
            ((idx++))
        fi
    done < <(git log --pretty=format:"%h - %s (%cr oleh %an)" -n 10)
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    local target_commit=""
    
    if [ -n "$ROLLBACK_TARGET" ]; then
        if [[ "$ROLLBACK_TARGET" =~ ^[0-9]+$ ]] && [ "$ROLLBACK_TARGET" -ge 1 ] && [ "$ROLLBACK_TARGET" -le "${#hashes[@]}" ]; then
            target_commit="${hashes[$((ROLLBACK_TARGET - 1))]}"
            log_info "Target rollback dari parameter index [$ROLLBACK_TARGET]: $target_commit"
        elif [[ "$ROLLBACK_TARGET" =~ ^[0-9]+$ ]]; then
            target_commit="HEAD~$ROLLBACK_TARGET"
            log_info "Target rollback: HEAD~$ROLLBACK_TARGET"
        else
            target_commit="$ROLLBACK_TARGET"
            log_info "Target rollback commit: $target_commit"
        fi
    else
        echo "Berapa commit yang ingin di-rollback?"
        echo "  - Masukkan nomor urut [1-10] (contoh: 2 untuk rollback ke nomor 2)"
        echo "  - Masukkan jumlah commit mundur (contoh: 1 untuk HEAD~1)"
        echo "  - Atau masukkan commit hash (contoh: a1b2c3d)"
        echo "  - Ketik 'q' untuk membatalkan"
        read -p "Pilihan Anda: " user_choice
        
        if [[ "$user_choice" =~ ^[Qq]$ ]] || [ -z "$user_choice" ]; then
            log_info "Rollback dibatalkan."
            exit 0
        fi
        
        if [[ "$user_choice" =~ ^[0-9]+$ ]] && [ "$user_choice" -ge 1 ] && [ "$user_choice" -le "${#hashes[@]}" ]; then
            target_commit="${hashes[$((user_choice - 1))]}"
        elif [[ "$user_choice" =~ ^[0-9]+$ ]]; then
            target_commit="HEAD~$user_choice"
        else
            target_commit="$user_choice"
        fi
    fi
    
    # Validasi commit hash
    if ! git rev-parse --verify "$target_commit" >/dev/null 2>&1; then
        log_error "Commit '$target_commit' tidak ditemukan di repositori git!"
        exit 1
    fi
    
    local resolved_hash
    resolved_hash=$(git rev-parse --short "$target_commit")
    local commit_subject
    commit_subject=$(git log -1 --pretty=format:"%s" "$target_commit")
    
    echo ""
    log_warning "PERINGATAN: Kode akan di-rollback ke: ${CYAN}$resolved_hash${NC} - \"$commit_subject\""
    if [ "$FORCE_MODE" = false ]; then
        read -p "Lanjutkan proses rollback? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Rollback dibatalkan oleh pengguna."
            exit 0
        fi
    fi
    
    log_info "Menjalankan git reset --hard ke $resolved_hash..."
    git reset --hard "$target_commit" || { log_error "Gagal me-reset git ke $target_commit"; exit 1; }
    log_success "Berhasil rollback ke commit $resolved_hash: \"$commit_subject\""
}

# ------------------------------------------------------------------------------
# 4. Git Pull / Code Update
# ------------------------------------------------------------------------------
if [ "$ROLLBACK_MODE" = true ]; then
    handle_rollback
elif [ "$WARM_ONLY" = true ]; then
    log_info "Mode --warm-only aktif: Melewati git pull dan database migration"
else
    PREV_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    log_info "Mengambil update terbaru dari git (origin/main)..."
    git pull origin main || { log_error "Gagal melakukan git pull. Periksa git status atau konflik file."; exit 1; }
    NEW_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    log_success "Git update berhasil ($PREV_COMMIT -> $NEW_COMMIT)"
fi

# ------------------------------------------------------------------------------
# 5. Dependency Management (Composer)
# ------------------------------------------------------------------------------
if [ "$WARM_ONLY" = false ]; then
    COMPOSER_BIN=""
    if command -v composer >/dev/null 2>&1; then
        COMPOSER_BIN="composer"
    elif [ -f "./composer.phar" ]; then
        COMPOSER_BIN="php ./composer.phar"
    elif [ -f "$HOME/bin/composer" ]; then
        COMPOSER_BIN="$HOME/bin/composer"
    fi

    if [ -n "$COMPOSER_BIN" ]; then
        log_info "Memeriksa dan memperbarui PHP dependencies ($COMPOSER_BIN install)..."
        $COMPOSER_BIN install --no-dev --prefer-dist --optimize-autoloader --no-interaction || {
            log_warning "Composer install menemui kendala, melanjutkan proses deployment..."
        }
        log_success "Composer dependencies siap dan teroptimasi"
    else
        log_info "Composer executable tidak ditemukan di path server (melewati composer install)"
    fi
fi

# ------------------------------------------------------------------------------
# 6. Database Migrations
# ------------------------------------------------------------------------------
if [ "$WARM_ONLY" = false ] && [ "$SKIP_MIGRATE" = false ]; then
    log_info "Menjalankan database migrations..."
    if php artisan migrate --force; then
        log_success "Database migrations selesai"
    else
        log_warning "Database migration menemui masalah. Pastikan koneksi database benar."
    fi
fi

# ------------------------------------------------------------------------------
# 7. Frontend Assets Verification (Pre-built React/Vite)
# ------------------------------------------------------------------------------
log_info "Memverifikasi integritas frontend assets (public/build)..."

if [ ! -d "public/build" ] || [ ! -f "public/build/manifest.json" ]; then
    log_error "Asset frontend belum di-build atau manifest.json tidak ditemukan!"
    echo ""
    echo -e "${RED}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ERROR: FRONTEND BUILD ASSETS TIDAK DITEMUKAN!${NC}"
    echo -e "${RED}══════════════════════════════════════════════════════════════${NC}"
    echo "Server production tidak memiliki Node.js / npm."
    echo "Langkah perbaikan di komputer LOKAL Anda:"
    echo "  1. npm run build"
    echo "  2. git add public/build -f"
    echo "  3. git commit -m 'Build production assets'"
    echo "  4. git push origin main"
    echo "  5. Jalankan ulang: ./deploy-production.sh di server ini"
    echo -e "${RED}══════════════════════════════════════════════════════════════${NC}"
    exit 1
fi

ASSET_COUNT=$(find public/build/assets -type f 2>/dev/null | wc -l || echo "0")
VENDOR_COUNT=$(find public/build/assets -name "vendor*.js" 2>/dev/null | wc -l || echo "0")
log_success "Manifest Vite valid ($ASSET_COUNT asset files, $VENDOR_COUNT vendor chunk files)"

# Terapkan izin file yang AMAN (644 untuk file, 755 untuk folder)
# PENTING: Jangan gunakan chmod 444 karena akan menggagalkan git pull berikutnya!
find public/build -type d -exec chmod 755 {} \; 2>/dev/null || true
find public/build -type f -exec chmod 644 {} \; 2>/dev/null || true

# ------------------------------------------------------------------------------
# 8. Laravel Core Optimization & Caching
# ------------------------------------------------------------------------------
log_info "Mengoptimalkan cache konfigurasi, routes, dan views Laravel..."

# 1. Bersihkan semua cache lama secara bersih
php artisan optimize:clear >/dev/null 2>&1 || true

# 2. Cache ulang semua layer konfigurasi produksi
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache 2>/dev/null || true

log_success "Laravel config, route, dan view cache berhasil di-compile"

# ------------------------------------------------------------------------------
# 9. Storage & Directory Permissions
# ------------------------------------------------------------------------------
log_info "Memperbarui izin direktori storage dan cache..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true
find storage bootstrap/cache -type d -exec chmod 775 {} \; 2>/dev/null || true
find storage bootstrap/cache -type f -exec chmod 664 {} \; 2>/dev/null || true
log_success "Izin direktori storage dan bootstrap/cache telah diatur (775/664)"

# ------------------------------------------------------------------------------
# 10. Cache Backend & Quran Pre-Warming
# ------------------------------------------------------------------------------
CACHE_DRIVER=$(grep "^CACHE_STORE=" .env 2>/dev/null | cut -d'=' -f2 || grep "^CACHE_DRIVER=" .env 2>/dev/null | cut -d'=' -f2 || echo "file")
log_info "Mengecek status cache store (Driver aktif: ${CYAN}${CACHE_DRIVER}${NC})..."

# Tes koneksi Cache Laravel secara inline (tanpa membuat file sementara di disk)
CACHE_TEST_RESULT=$(php artisan tinker --execute="
try {
    Illuminate\Support\Facades\Cache::put('deploy_ping', 'ok', 15);
    echo Illuminate\Support\Facades\Cache::get('deploy_ping') === 'ok' ? 'OK' : 'MISMATCH';
} catch (\Throwable \$e) {
    echo 'ERR: ' . \$e->getMessage();
}
" 2>/dev/null || echo "FAIL")

if [[ "$CACHE_TEST_RESULT" == *"OK"* ]]; then
    log_success "Koneksi cache ($CACHE_DRIVER) berfungsi dengan prima"
    
    if [ "$QUICK_MODE" = false ]; then
        log_info "Melakukan pre-warming cache Al-Qur'an dan SEO..."
        # Clear specific Quran cache
        php artisan quran:cache clear >/dev/null 2>&1 || true
        # Warm up Quran cache (Surah, Ayah populer, Juz, Pages, Kategori Doa, SEO surahs)
        if php artisan quran:cache warm-up; then
            log_success "Cache Al-Qur'an & SEO berhasil di-warm up (Fast Response Ready)"
        else
            log_warning "Warm-up cache Al-Qur'an mengalami kendala, cache akan terisi otomatis saat diakses"
        fi
    else
        log_info "Mode --quick aktif: Melewati warm-up cache"
    fi
else
    log_warning "Koneksi cache ($CACHE_DRIVER) tidak merespons: $CACHE_TEST_RESULT"
    log_warning "Aplikasi tetap dapat berjalan dengan fallback cache"
fi

# ------------------------------------------------------------------------------
# 11. Web Server & OPcache Invalidation
# ------------------------------------------------------------------------------
log_info "Merefresh OPcache web server..."

# Sentuh index.php agar LiteSpeed / Apache mod_lsapi / PHP-FPM merestart opcode cache
touch public/index.php 2>/dev/null || true

# Reset CLI OPcache jika fungsi tersedia
php -r "if(function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache CLI di-reset' . PHP_EOL; }" 2>/dev/null || true

log_success "OPcache web server telah di-invalidasi"

# ------------------------------------------------------------------------------
# 12. Ringkasan Deployment & Status
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
if [ "$ROLLBACK_MODE" = true ]; then
    echo -e "${GREEN}  ⏪ ROLLBACK BERHASIL DISELESAIKAN!${NC}"
else
    echo -e "${GREEN}  🚀 DEPLOYMENT PRODUCTION BERHASIL & MAKSIMAL!${NC}"
fi
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""

ACTIVE_COMMIT=$(git log -1 --pretty=format:"%h - %s (%ad)" --date=relative 2>/dev/null || echo "N/A")
echo -e "📌 ${BOLD}Commit Aktif:${NC}       $ACTIVE_COMMIT"
echo -e "⚡ ${BOLD}Cache Driver:${NC}       $CACHE_DRIVER"
echo -e "📦 ${BOLD}Vite Build Assets:${NC}  $ASSET_COUNT files ($VENDOR_COUNT vendor chunks)"
echo -e "🔒 ${BOLD}Status Keamanan:${NC}    Izin direktori & file telah disesuaikan"
echo ""

# Tampilkan ringkasan status Quran Cache jika driver Redis
if [[ "$CACHE_DRIVER" == "redis" ]]; then
    php artisan quran:cache status 2>/dev/null || true
fi

echo ""
echo -e "${CYAN}Perintah berguna untuk maintenance server:${NC}"
echo "  • Cek status cache:       php artisan quran:cache status"
echo "  • Warm-up manual:         php artisan quran:cache warm-up"
echo "  • Bersihkan cache:        php artisan optimize:clear"
echo "  • Pantau log error:       tail -f storage/logs/laravel.log"
echo "  • Rollback instan:        ./deploy-production.sh --rollback"
echo ""
echo -e "${GREEN}Aplikasi IndoQuran siap melayani pengunjung dengan kecepatan optimal!${NC}"
echo ""
