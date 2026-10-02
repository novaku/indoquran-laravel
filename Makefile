.DEFAULT_GOAL := help

# Colors for terminal output
COLOR_RESET   = \033[0m
COLOR_INFO    = \033[36m
COLOR_SUCCESS = \033[1;32m
COLOR_WARNING = \033[1;33m

PORT ?= 8000

.PHONY: help dev dev-all dev-servers serve serve-8080 vite build watch restart stop \
        install setup update \
        migrate migrate-fresh migrate-rollback seed \
        test test-unit test-feature test-coverage pint pint-test \
        clear refresh optimize optimize-dev cache-all cache-quran cache-asmaul cache-tafsir \
        sitemap sitemap-all sitemap-validate \
        tinker pail logs logs-clear routes status info

help: ## Menampilkan daftar perintah yang tersedia
	@echo "$(COLOR_SUCCESS)IndoQuran - Makefile Commands:$(COLOR_RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_INFO)%-22s$(COLOR_RESET) %s\n", $$1, $$2}'
	@echo ""

## =========================================================================
## Development (dev-env.sh #1, #2, #3, #4, #5, #10, #11)
## =========================================================================

dev: ## Start Laravel server (port 8000), bersihkan cache & buka browser (dev-env.sh #2)
	@echo "$(COLOR_WARNING)🌐 Starting Laravel development server on port $(PORT)...$(COLOR_RESET)"
	@php artisan cache:clear > /dev/null 2>&1 || true
	@php artisan config:clear > /dev/null 2>&1 || true
	@php artisan route:clear > /dev/null 2>&1 || true
	@php artisan view:clear > /dev/null 2>&1 || true
	@echo "$(COLOR_WARNING)⏳ Waiting for Laravel to start...$(COLOR_RESET)"
	@(sleep 3 && echo "$(COLOR_SUCCESS)🌐 Opening browser at http://127.0.0.1:$(PORT)$(COLOR_RESET)" && open "http://127.0.0.1:$(PORT)") &
	@echo "$(COLOR_SUCCESS)✅ Laravel server started successfully on port $(PORT)!$(COLOR_RESET)"
	@echo "$(COLOR_WARNING)💡 Press Ctrl+C to stop server$(COLOR_RESET)"
	@php artisan serve --port=$(PORT)

dev-servers: stop ## Start Laravel + Vite server di background (dev-env.sh #1)
	@echo "$(COLOR_WARNING)🚀 Starting development environment...$(COLOR_RESET)"
	@php artisan cache:clear > /dev/null 2>&1 || true
	@php artisan config:clear > /dev/null 2>&1 || true
	@php artisan route:clear > /dev/null 2>&1 || true
	@php artisan view:clear > /dev/null 2>&1 || true
	@echo "$(COLOR_WARNING)🌐 Starting Laravel development server on port $(PORT)...$(COLOR_RESET)"
	@php artisan serve --port=$(PORT) > /dev/null 2>&1 &
	@sleep 2
	@echo "$(COLOR_WARNING)⚡ Starting Vite development server on port 5173...$(COLOR_RESET)"
	@npm run dev > /dev/null 2>&1 &
	@echo "$(COLOR_SUCCESS)✅ Development servers started successfully!$(COLOR_RESET)"
	@echo "   Laravel Backend: http://127.0.0.1:$(PORT)"
	@echo "   Vite Frontend:   http://127.0.0.1:5173"
	@echo "   Hentikan server dengan: make stop"

dev-all: ## Menjalankan server development lengkap foreground (Laravel, queue, logs, vite)
	composer run dev

serve: ## Menjalankan Laravel development server (http://127.0.0.1:8000)
	php artisan serve

serve-8080: ## Start Laravel server di port 8080 (dev-env.sh #3)
	@$(MAKE) dev PORT=8080

restart: stop dev-servers ## Restart development servers Laravel & Vite (dev-env.sh #4)

stop: ## Stop semua server development Laravel & Vite (dev-env.sh #5)
	@echo "$(COLOR_WARNING)🛑 Stopping development servers...$(COLOR_RESET)"
	@-pkill -f "php artisan serve" 2>/dev/null || true
	@-pkill -f "vite" 2>/dev/null || true
	@-pkill -f "npm run dev" 2>/dev/null || true
	@echo "$(COLOR_SUCCESS)✅ All development servers stopped$(COLOR_RESET)"

vite: ## Menjalankan Vite development server untuk frontend asset
	npm run dev

build: ## Build assets untuk production (dev-env.sh #10)
	@echo "$(COLOR_WARNING)🏗️  Building assets for production...$(COLOR_RESET)"
	npm run build
	@echo "$(COLOR_SUCCESS)✅ Assets built successfully!$(COLOR_RESET)"

watch: ## Build frontend assets secara realtime saat ada perubahan (dev-env.sh #11)
	@echo "$(COLOR_WARNING)👀 Starting asset watcher...$(COLOR_RESET)"
	npm run dev

## =========================================================================
## Setup & Dependencies (dev-env.sh #9)
## =========================================================================

install: ## Install dependensi Composer dan NPM (dev-env.sh #9)
	@echo "$(COLOR_WARNING)📦 Installing dependencies...$(COLOR_RESET)"
	@echo "$(COLOR_INFO)Installing PHP dependencies...$(COLOR_RESET)"
	composer install
	@echo "$(COLOR_INFO)Installing Node.js dependencies...$(COLOR_RESET)"
	npm install
	@echo "$(COLOR_SUCCESS)✅ Dependencies updated!$(COLOR_RESET)"

setup: ## Setup awal proyek (copy .env, install dependensi, key generate, migrate, build)
	@test -f .env || cp .env.example .env
	composer install
	npm install
	php artisan key:generate
	php artisan migrate
	npm run build

update: ## Update dependensi Composer dan NPM
	composer update
	npm update

## =========================================================================
## Database (dev-env.sh #12, #13, #14)
## =========================================================================

migrate: ## Menjalankan migrasi database (dev-env.sh #12)
	@echo "$(COLOR_WARNING)🗄️  Running migrations...$(COLOR_RESET)"
	php artisan migrate
	@echo "$(COLOR_SUCCESS)✅ Migrations completed!$(COLOR_RESET)"

migrate-fresh: ## Reset ulang database dan jalankan seeder (dev-env.sh #14)
	@echo "$(COLOR_WARNING)🔄 Running fresh migration with seeding...$(COLOR_RESET)"
	php artisan migrate:fresh --seed
	@echo "$(COLOR_SUCCESS)✅ Fresh migration and seeding completed!$(COLOR_RESET)"

migrate-rollback: ## Rollback batch migrasi terakhir
	php artisan migrate:rollback

seed: ## Menjalankan database seeders (dev-env.sh #13)
	@echo "$(COLOR_WARNING)🌱 Seeding database...$(COLOR_RESET)"
	php artisan db:seed
	@echo "$(COLOR_SUCCESS)✅ Database seeding completed!$(COLOR_RESET)"

## =========================================================================
## Testing & Code Quality (dev-env.sh #15)
## =========================================================================

test: ## Menjalankan seluruh test suite (Unit & Feature) (dev-env.sh #15)
	@echo "$(COLOR_WARNING)🧪 Running tests...$(COLOR_RESET)"
	php artisan test

test-unit: ## Menjalankan hanya Unit test
	php artisan test --testsuite=Unit

test-feature: ## Menjalankan hanya Feature test
	php artisan test --testsuite=Feature

test-coverage: ## Menjalankan test dengan laporan code coverage
	php artisan test --coverage

pint: ## Format kode PHP dengan Laravel Pint
	./vendor/bin/pint

pint-test: ## Periksa format kode PHP tanpa mengubah file
	./vendor/bin/pint --test

## =========================================================================
## Cache & Optimization (dev-env.sh #6, #7, #8)
## =========================================================================

refresh: ## Refresh total semua cache, views, autoload, dan frontend (dev-env.sh #6)
	@echo "$(COLOR_WARNING)🚀 Starting Laravel refresh process...$(COLOR_RESET)"
	@echo "$(COLOR_INFO)Clearing Laravel caches...$(COLOR_RESET)"
	@php artisan cache:clear
	@php artisan config:clear
	@php artisan view:clear
	@php artisan route:clear
	@php artisan event:clear
	@php artisan optimize:clear
	@echo "$(COLOR_INFO)Clearing bootstrap cache files...$(COLOR_RESET)"
	@php artisan clear-compiled
	@echo "$(COLOR_INFO)Removing cached files from storage...$(COLOR_RESET)"
	@if [ -d "storage/framework/cache/data" ]; then \
		find storage/framework/cache/data -type f -not -name '.gitignore' -delete 2>/dev/null || true; \
	fi
	@echo "$(COLOR_INFO)Regenerating autoload files...$(COLOR_RESET)"
	@composer dump-autoload
	@echo "$(COLOR_INFO)Rebuilding essential caches...$(COLOR_RESET)"
	@php artisan config:cache
	@php artisan route:cache
	@echo "$(COLOR_INFO)Clearing frontend caches...$(COLOR_RESET)"
	@rm -rf node_modules/.vite 2>/dev/null || true
	@rm -rf public/build/* 2>/dev/null || true
	@echo "$(COLOR_SUCCESS)✅ All caches have been refreshed successfully!$(COLOR_RESET)"

optimize-dev: ## Optimasi cache untuk environment development (dev-env.sh #8)
	@echo "$(COLOR_WARNING)⚡ Optimizing for development...$(COLOR_RESET)"
	@php artisan optimize:clear
	@php artisan config:clear
	@php artisan route:clear
	@php artisan view:clear
	@composer dump-autoload
	@echo "$(COLOR_SUCCESS)✅ Development optimization completed!$(COLOR_RESET)"

clear: ## Bersihkan semua cache (config, route, view, event, application)
	php artisan optimize:clear

optimize: ## Optimasi cache config, routes, dan views untuk production
	php artisan optimize

cache-all: ## Cache config, route, dan view
	php artisan config:cache
	php artisan route:cache
	php artisan view:cache

cache-quran: ## Warm up cache Al-Qur'an (Surah & Ayat)
	php artisan quran:cache

cache-asmaul: ## Refresh cache Asmaul Husna
	php artisan asmaul-husna:refresh

cache-tafsir: ## Refresh cache Tafsir Maudhui
	php artisan tafsir-maudhui:refresh

## =========================================================================
## Sitemap (dev-env.sh #18)
## =========================================================================

sitemap: ## Generate sitemap standar (dev-env.sh #18)
	@echo "$(COLOR_WARNING)🗺️  Generating sitemap.xml for IndoQuran website...$(COLOR_RESET)"
	php artisan sitemap:generate
	@echo "$(COLOR_SUCCESS)✅ Sitemap generated successfully!$(COLOR_RESET)"

sitemap-all: ## Generate sitemap komprehensif (termasuk Al-Qur'an, Hadits, Doa, dll.)
	php artisan sitemap:generate-comprehensive

sitemap-validate: ## Validasi integritas sitemap XML
	php artisan sitemap:validate

## =========================================================================
## Development Tools, Status & Info (dev-env.sh #7, #16, #17, #19, #20)
## =========================================================================

routes: ## Menampilkan seluruh daftar route Laravel (dev-env.sh #16)
	@echo "$(COLOR_WARNING)🛣️  Listing all routes...$(COLOR_RESET)"
	php artisan route:list

tinker: ## Membuka Laravel interactive shell (Tinker) (dev-env.sh #17)
	@echo "$(COLOR_WARNING)🔧 Starting Laravel Tinker...$(COLOR_RESET)"
	php artisan tinker

status: ## Cek status server Laravel & Vite serta proses aktif (dev-env.sh #19)
	@echo "$(COLOR_WARNING)📊 Checking server status...$(COLOR_RESET)"
	@echo ""
	@if curl -s http://127.0.0.1:$(PORT) > /dev/null 2>&1; then \
		echo "$(COLOR_SUCCESS)✅ Laravel server is running on port $(PORT)$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_WARNING)❌ Laravel server is not running on port $(PORT)$(COLOR_RESET)"; \
	fi
	@if curl -s http://127.0.0.1:5173 > /dev/null 2>&1; then \
		echo "$(COLOR_SUCCESS)✅ Vite server is running on port 5173$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_WARNING)❌ Vite server is not running on port 5173$(COLOR_RESET)"; \
	fi
	@echo ""
	@echo "$(COLOR_INFO)Active PHP processes:$(COLOR_RESET)"
	@ps aux | grep "php artisan serve" | grep -v grep || echo "No Laravel servers running"
	@echo ""
	@echo "$(COLOR_INFO)Active Node processes:$(COLOR_RESET)"
	@ps aux | grep -E "vite|npm run dev" | grep -v grep || echo "No Vite servers running"

info: ## Tampilkan informasi aplikasi Laravel (dev-env.sh #20)
	@echo "$(COLOR_WARNING)ℹ️  Laravel Application Information...$(COLOR_RESET)"
	@php artisan about

pail: ## Memantau log aplikasi secara realtime (Laravel Pail)
	php artisan pail

logs: ## Memantau file log storage/logs/laravel.log
	tail -f storage/logs/laravel.log

logs-clear: ## Kosongkan file storage/logs/laravel.log (dev-env.sh #7)
	@echo "$(COLOR_WARNING)🧹 Clearing log files...$(COLOR_RESET)"
	@> storage/logs/laravel.log
	@echo "$(COLOR_SUCCESS)✅ Log files cleared!$(COLOR_RESET)"
