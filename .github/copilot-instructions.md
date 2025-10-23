# IndoQuran Laravel - AI Coding Agent Instructions

## Project Overview
**IndoQuran** is a modern digital Al-Quran platform built with Laravel 12 + React 19, featuring 114 Surahs with Indonesian translations, 79+ audio reciters, bookmarks, prayer times, and PWA capabilities. Optimized for mobile-first performance with aggressive caching strategies.

## Technology Stack
- **Backend**: Laravel 12 (PHP 8.2+), Redis caching via Predis
- **Frontend**: React 19 (JSX), Vite 6, TailwindCSS 4, React Router
- **Database**: MySQL 8.0+ with extensive migrations
- **Build**: Vite with aggressive code splitting, Terser minification
- **Auth**: Laravel Sanctum (Bearer tokens) + custom `SimpleAuthMiddleware`

## Architecture Patterns

### Backend: API-First Laravel
- **SPA Architecture**: All routes in `routes/web.php` return the same React app container; actual routing handled client-side by React Router
- **API Routes**: Core logic in `routes/api.php` with RESTful endpoints (`/api/surahs`, `/api/search`, `/api/penanda/*`, etc.)
- **Service Layer Pattern**: Business logic isolated in `app/Services/` (e.g., `QuranCacheService`, `MurottalService`, `SEOService`)
  - Services handle caching, external API integration, and complex operations
  - Controllers stay thin, delegating to services
- **Redis Caching**: Aggressive caching via `QuranCacheService` with configurable TTL in `config/quran_cache.php`
  - Cache keys prefixed: `quran:surahs`, `quran:ayahs:{number}`, etc.
  - Popular surahs preloaded (Al-Fatiha, Yasin, Al-Kahf, etc.)
- **Authentication**: Dual auth system (session-based + Sanctum tokens) handled by `SimpleAuthMiddleware` in `app/Http/Middleware/`

### Frontend: Performance-First React
- **Entry Point**: `resources/js/react/index.jsx` → mounts `App.jsx` to `#app` container
- **Lazy Loading**: All pages lazy-loaded with Suspense boundaries, strategic code splitting in `vite.config.js`
  - Critical chunks: `vendor-react-core`, `vendor-react-dom` (separate for optimal caching)
  - Route-based chunks: `home`, `surah`, `auth`, `user-features`, `content-pages`, etc.
- **API Communication**: Use `resources/js/react/utils/apiUtils.js` helpers:
  - `getWithAuth()`, `postWithAuth()`, `putWithAuth()` - Auto-handle Bearer tokens
  - Token stored in `localStorage.auth_token`
- **Custom Hooks**: `useAuth()`, `useAdvancedPerformanceMonitor()`, `useIntelligentPreload()`, `useScrollToTop()`, `useCanonicalURL()`
- **PWA Support**: Service workers in `public/sw*.js`, managed by `pwa-manager.js`

### Data Models (Core)
- **Surah**: `app/Models/Surah.php` - 114 surahs, fields: `number`, `name`, `name_latin`, `ayah_count`, `revelation_type`
- **Ayah**: `app/Models/Ayah.php` - ~6,236 verses, fields: `surah_number`, `ayah_number`, `text_arabic`, `text_latin`, `translation_id`
- **UserAyahBookmark**: `app/Models/UserAyahBookmark.php` - User bookmarks with `notes`, `is_favorite`
- **User**: Standard Laravel auth model with `is_admin` flag

## Development Workflow

### Starting Development
```bash
./dev-env.sh  # Interactive menu - option 1 starts Laravel (8000) + Vite (5173)
```
**DO NOT** run `php artisan serve` and `npm run dev` separately unless debugging specific issues.

### Building for Production
```bash
./build-production.sh  # Optimizes Laravel cache, builds with Vite, runs image optimization
```
**Critical**: Production builds use `NODE_ENV=production`, remove console logs, enable Terser minification.

### Database Operations
```bash
php artisan migrate           # Run pending migrations
php artisan db:seed           # Seed core data (QuranDataSeeder, AsmaulHusnaSeeder, TafsirMaudhuiSeeder)
php artisan migrate:fresh --seed  # Destructive: fresh DB with all data
```
**Seeders**: Check `database/seeders/DatabaseSeeder.php` for order. QuranDataSeeder imports 114 surahs + 6,236 ayahs.

### Cache Management
```bash
php artisan cache:clear       # Clear all caches (Redis, config, routes, views)
./clear-all.sh                # Nuclear option: clears everything including logs
```
**When to Clear**: After changing `config/quran_cache.php`, updating Quran data, or auth issues.

### Testing
- **Frontend Tests**: Located in `tests/` (e.g., `test-audio-implementation.js`, `test-share-ayah.js`)
- **Backend Tests**: `tests/Feature/` directory (Laravel PHPUnit tests)
- **Manual Testing**: Use `./test-pwa.sh` for PWA audit, `npm run performance:mobile` for Lighthouse checks

## Key Conventions

### API Endpoint Patterns
- **Public**: `/api/surahs`, `/api/surahs/{number}`, `/api/search?q={query}`
- **Protected** (requires auth): `/api/penanda/*`, `/api/profile`
- **Bilingual Routes**: Web routes support both English (`/login`) and Indonesian (`/masuk`) - POST only, GET handled by React
- **CORS**: Local dev has CORS proxy middleware at `/proxy-assets/{path}` (see `routes/web.php`)

### React Component Organization
```
resources/js/react/
├── components/       # Reusable UI (QuranLayout, LoadingSpinner, SEOHead)
├── pages/           # Route components (QuranHomePage, SurahDetailPage, etc.)
├── hooks/           # Custom hooks (useAuth, useScrollToTop)
├── utils/           # Helpers (apiUtils, seoUtils, criticalCSS)
├── services/        # API services (BookmarkService, ReadingProgressService)
└── config/          # Frontend config (mobilePerformance.js)
```

### Styling Patterns
- **TailwindCSS**: Use utility classes, config in `tailwind.config.js`
- **Custom Fonts**: Arabic text uses `font-arabic` (Amiri, Scheherazade), defined in Tailwind config
- **Color Scheme**: Primary (earthy browns), secondary (warm tones), accent (golds) - see `tailwind.config.js` extended colors
- **Responsive**: Mobile-first, custom `xs:480px` breakpoint for small phones

### Audio System (EveryAyah Integration)
- **79+ Reciters**: Configured in `config/reciters.php` (Abdul Basit, Husary, Sudais, etc.)
- **API Endpoints**: `/api/reciters`, `/api/reciters/recommended`, `/api/audio/ayah/{surah}/{ayah}?reciter={id}`
- **Frontend Helper**: `getEveryAyahAudioUrl(surahNumber, ayahNumber, reciterId)` generates URLs like `https://everyayah.com/data/{subfolder}/{SSSAAA}.mp3`
- **Default Reciter**: ID `2` (Abdul Basit Murattal 192kbps)

### Authentication Flow
1. User logs in via `/api/login` → receives Bearer token
2. Frontend stores token in `localStorage.auth_token`
3. All protected API calls include `Authorization: Bearer {token}` header (via `apiUtils.js` helpers)
4. Backend `SimpleAuthMiddleware` validates session OR Sanctum token

## Performance Optimization

### Vite Build Configuration
- **Minification**: Terser with `drop_console: true`, no source maps in production
- **Code Splitting**: Manual chunks in `vite.config.js` - vendor libs separated (React, React-DOM, icons, router)
- **Asset Naming**: Hashed filenames for cache busting (`assets/[name]-[hash].js`)
- **Chunk Size Limit**: Warning at 250KB (mobile-optimized)

### Redis Caching Strategy
- **TTL**: 24h for Quran data, 1h for search results (see `config/quran_cache.php`)
- **Warm Cache**: Set `QURAN_WARM_CACHE_ON_BOOT=true` to preload popular surahs on app start
- **Cache Keys**: Prefixed and versioned (`quran:surahs`, `quran:ayah:1:1`)

### PWA Features
- **Service Workers**: `public/sw.js` (main), `sw-pwa.js` (installable), `sw-mobile.js` (mobile-optimized)
- **Manifest**: `public/manifest.json` with IndoQuran branding
- **Offline Support**: Fallback pages (`offline.html`, `fallback.html`)

## Common Tasks

### Adding a New API Endpoint
1. Add route in `routes/api.php` (use `Route::middleware(['simple.auth'])` if protected)
2. Create/update controller in `app/Http/Controllers/`
3. Add service method in `app/Services/` if business logic needed
4. Use `QuranCacheService` for Quran data, Redis `Cache::remember()` for custom caching

### Adding a New React Page
1. Create component in `resources/js/react/pages/` (e.g., `NewFeaturePage.jsx`)
2. Lazy import in `App.jsx`: `const NewFeaturePage = lazy(() => import('./pages/NewFeaturePage'))`
3. Add route: `<Route path="/fitur-baru" element={<NewFeaturePage />} />`
4. Add SEO metadata using `<SEOHead />` component within the page

### Modifying Quran Data
1. Update `database/seeders/QuranDataSeeder.php` or create migration
2. Run `php artisan migrate:fresh --seed` (destructive) OR add new migration + seeder
3. Clear Redis cache: `php artisan cache:clear`
4. Verify via `/api/surahs` endpoint

### Debugging Issues
- **Auth Problems**: Check `storage/logs/laravel.log`, verify `SimpleAuthMiddleware` logs
- **Cache Staleness**: Run `php artisan cache:clear` and `php artisan config:clear`
- **Build Errors**: Delete `public/build/*`, `node_modules`, run `npm ci` and `npm run build`
- **Service Worker Conflicts**: Unregister in DevTools → Application → Service Workers

## Scripts & Automation
- `./dev-env.sh` - Interactive dev environment manager (20+ options)
- `./build-production.sh` - Production build with optimizations
- `./clear-all.sh` - Clear all caches, logs, compiled views
- `./optimize-images.sh` - Compress images in `public/images`
- `./deploy-production.sh` - Deploy to production server
- `npm run bundle:analyze` - Analyze bundle size with `vite-bundle-analyzer`

## External Dependencies
- **Quran API**: EveryAyah.com for audio files (`https://everyayah.com/data/`)
- **Geocoding**: Reverse geocoding proxy for prayer times (`/api/geocode/reverse`)
- **Performance Monitoring**: Custom Core Web Vitals reporting (`/api/web-vitals`)

## Important Files to Reference
- **Architecture**: `vite.config.js` (build config), `routes/api.php` (API structure)
- **Caching**: `config/quran_cache.php`, `app/Services/QuranCacheService.php`
- **Auth**: `app/Http/Middleware/SimpleAuthMiddleware.php`
- **Frontend Entry**: `resources/js/react/App.jsx` (routing), `index.jsx` (bootstrap)
- **Reciters**: `config/reciters.php` (79+ audio sources)
- **Database Schema**: `database/migrations/` directory
- **Changelog**: `CHANGELOG.md` (detailed feature history)

## Gotchas
- **Don't use Axios directly**: Use `apiUtils.js` helpers (`getWithAuth`, `postWithAuth`) to ensure auth headers
- **SPA Routes**: ALL web routes return the same HTML container - real routing is client-side in React
- **Bilingual Support**: API routes are singular, web routes have `/login` + `/masuk` variants (POST only)
- **Cache Invalidation**: Changing `config/quran_cache.php` requires `php artisan config:clear`
- **Audio URLs**: Must be generated per ayah, not batch-fetched (EveryAyah has no bulk API)
- **Development vs Production**: Service workers only active in production builds (`NODE_ENV=production`)
- **Laravel Facades**: Always import facades explicitly (e.g., `use Illuminate\Support\Facades\Log;`) - don't use `\Log::` without import
- **Config Keys**: When using dynamic config keys in `config/quran_cache.php`, ensure all TTL types (`quran_data`, `search_results`, `user_preferences`) and prefix types are defined
