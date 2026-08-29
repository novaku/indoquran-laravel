<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\SurahController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\QuranController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PrayerController;
use App\Http\Controllers\TafsirMaudhuiController;
use App\Http\Controllers\Api\SecurityController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\Api\OnlineUsersController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Geocoding proxy
Route::get('/geocode/reverse', [\App\Http\Controllers\Api\GeocodingController::class, 'reverseGeocode']);

// Security endpoints
Route::post('/csp-violation-report', [SecurityController::class, 'cspViolationReport']);
Route::get('/security/stats', [SecurityController::class, 'getSecurityStats']);

// Core Web Vitals endpoints (for Google Search Console monitoring)
Route::post('/web-vitals', [\App\Http\Controllers\Api\CoreWebVitalsController::class, 'store']);
Route::get('/web-vitals/stats', [\App\Http\Controllers\Api\CoreWebVitalsController::class, 'getStats']);
Route::get('/web-vitals/url', [\App\Http\Controllers\Api\CoreWebVitalsController::class, 'getUrlStats']);

// Online users tracking (realtime visitor count)
Route::post('/online-users/track', [OnlineUsersController::class, 'track']);
Route::get('/online-users/count', [OnlineUsersController::class, 'count']);
// Return authenticated user or null - simplified without session checks
Route::get('/user', function (Request $request) {
    // First attempt with regular auth check
    $user = Auth::user();
    
    // If not found, try with token-based auth (fallback)
    if (!$user && $request->bearerToken()) {
        $token = $request->bearerToken();
        $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        
        if ($tokenModel) {
            $user = $tokenModel->tokenable;
        }
    }
    
    if ($user) {
        return response()->json($user);
    }
    
    // Use direct json_encode to ensure proper null response
    // Laravel's response()->json(null) converts null to {}
    return response(json_encode(null), 200)
        ->header('Content-Type', 'application/json');
});

// Auth routes
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

// Password reset routes (public, no auth required)
Route::post('/password/reset', [\App\Http\Controllers\Auth\PasswordResetController::class, 'sendResetLink']);
Route::post('/password/validate-token', [\App\Http\Controllers\Auth\PasswordResetController::class, 'validateToken']);
Route::post('/password/reset/confirm', [\App\Http\Controllers\Auth\PasswordResetController::class, 'resetPassword']);

// Contact route (public, no auth required)
Route::post('/contact', [ContactController::class, 'store']);

// Protected routes - using simple auth middleware
Route::middleware(['simple.auth'])->group(function() {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // Bookmark routes
    Route::prefix('penanda')->group(function() {
        Route::get('/', [BookmarkController::class, 'index']);
        Route::get('/status', [BookmarkController::class, 'getStatus']);
        Route::post('/surah/ayah/{ayahId}/toggle', [BookmarkController::class, 'toggle']);
        Route::post('/surah/{surahNumber}/ayah/{ayahNumber}/toggle', [BookmarkController::class, 'toggleByNumbers']);
        Route::post('/surah/ayah/{ayahId}/favorite', [BookmarkController::class, 'toggleFavorite']);
        Route::put('/surah/ayah/{ayahId}/notes', [BookmarkController::class, 'updateNotes']);
        Route::put('/surah/{surahNumber}/ayah/{ayahNumber}/notes', [BookmarkController::class, 'updateNotesByNumbers']);
    });
    
    // Backward compatibility for old bookmark API routes
    Route::prefix('bookmark')->group(function() {
        Route::get('/', [BookmarkController::class, 'index']);
        Route::get('/status', [BookmarkController::class, 'getStatus']);
        Route::post('/surah/ayah/{ayahId}/toggle', [BookmarkController::class, 'toggle']);
        Route::post('/surah/{surahNumber}/ayah/{ayahNumber}/toggle', [BookmarkController::class, 'toggleByNumbers']);
        Route::post('/surah/ayah/{ayahId}/favorite', [BookmarkController::class, 'toggleFavorite']);
        Route::put('/surah/ayah/{ayahId}/notes', [BookmarkController::class, 'updateNotes']);
    });

    // Prayer protected routes (Indonesian URLs)
    Route::post('/doa-bersama', [PrayerController::class, 'store']);
    Route::put('/doa-bersama/{prayer}', [PrayerController::class, 'update']);
    Route::delete('/doa-bersama/{prayer}', [PrayerController::class, 'destroy']);
    Route::post('/doa-bersama/{prayer}/amin', [PrayerController::class, 'toggleAmin']);
    Route::post('/doa-bersama/{prayer}/comments', [PrayerController::class, 'addComment']);
    Route::delete('/doa-bersama-comments/{comment}', [PrayerController::class, 'deleteComment']);
});

// Surah routes with caching
Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/surahs', [App\Http\Controllers\QuranController::class, 'getAllSurahs']);
});

// Random surah route - no caching for randomness
Route::get('/surahs/random', [App\Http\Controllers\QuranController::class, 'getRandomSurahs']);

Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/surahs/{number}', [App\Http\Controllers\QuranController::class, 'getSurah'])->where('number', '[0-9]+');
    Route::get('/surahs/{number}/metadata', [App\Http\Controllers\QuranController::class, 'getSurahMetadata'])->where('number', '[0-9]+');
});

// Juz routes with caching
Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/juz', [App\Http\Controllers\QuranController::class, 'getAllJuz']);
});

Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/juz/{number}', [App\Http\Controllers\QuranController::class, 'getJuz'])->where('number', '[0-9]+');
});

// Ayah routes with caching
Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/ayahs/{surahNumber}/{ayahNumber}', [App\Http\Controllers\QuranController::class, 'getAyah'])
        ->where(['surahNumber' => '[0-9]+', 'ayahNumber' => '[0-9]+']);
});

// Page routes with caching - Indonesian URLs
Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/halaman', [App\Http\Controllers\QuranController::class, 'getAllPages']);
    Route::get('/halaman/{number}', [App\Http\Controllers\QuranController::class, 'getPage'])->where('number', '[0-9]+');
});

// Murottal/Reciter routes with caching
Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/reciters', [App\Http\Controllers\QuranController::class, 'getAllReciters']);
    Route::get('/reciters/recommended', [App\Http\Controllers\QuranController::class, 'getRecommendedReciters']);
    Route::get('/reciters/by-style', [App\Http\Controllers\QuranController::class, 'getRecitersByStyle']);
    Route::get('/reciters/search', [App\Http\Controllers\QuranController::class, 'searchReciters']);
    
    // Audio URL routes
    Route::get('/audio/ayah/{surahNumber}/{ayahNumber}', [App\Http\Controllers\QuranController::class, 'getAyahAudioUrl'])
        ->where(['surahNumber' => '[0-9]+', 'ayahNumber' => '[0-9]+']);
    Route::get('/audio/ayah/{surahNumber}/{ayahNumber}/all-reciters', [App\Http\Controllers\QuranController::class, 'getAyahAudioUrlsAllReciters'])
        ->where(['surahNumber' => '[0-9]+', 'ayahNumber' => '[0-9]+']);
    Route::get('/audio/surah/{surahNumber}', [App\Http\Controllers\QuranController::class, 'getSurahAudioUrls'])
        ->where('surahNumber', '[0-9]+');
});

// Search routes with caching - Indonesian URLs
Route::middleware(['api.cache:7d'])->group(function() {
    Route::get('/cari', [App\Http\Controllers\QuranController::class, 'searchAyahs']);
    Route::get('/cari/ayahs', [SearchController::class, 'apiSearch']);
});

// Search logging routes
Route::post('/search/log', [App\Http\Controllers\SearchLogController::class, 'logSearch']);
Route::get('/search/popular', [App\Http\Controllers\SearchLogController::class, 'getPopularSearches']);
Route::get('/search/history', [App\Http\Controllers\SearchLogController::class, 'getSearchHistoryByIp']);

// Protected reading progress routes
Route::middleware('auth:sanctum')->group(function() {
    Route::get('/reading-progress', [App\Http\Controllers\ReadingProgressController::class, 'getProgress']);
    Route::post('/reading-progress', [App\Http\Controllers\ReadingProgressController::class, 'updateProgress']);
    Route::get('/reading-progress/stats', [App\Http\Controllers\ReadingProgressController::class, 'getStats']);
});

// Public prayer routes (for viewing without auth) - Indonesian URLs
Route::get('/doa-bersama', [PrayerController::class, 'index']);
Route::get('/doa-bersama/random', [PrayerController::class, 'getRandomPrayer']);
Route::get('/doa-bersama/{prayer}', [PrayerController::class, 'show']);
Route::get('/doa-bersama/{prayer}/comments', [PrayerController::class, 'getComments']);
Route::get('/kategori-doa', [PrayerController::class, 'getCategories']);
Route::get('/prayer-images', [PrayerController::class, 'getPrayerImages']);
Route::get('/dua-bersama/count', [PrayerController::class, 'count']);

// Prayer times API endpoint
Route::get('/prayer-times', [PrayerController::class, 'getPrayerTimes']);

// Bookmark count endpoint (public)
Route::get('/bookmarks/count', [BookmarkController::class, 'count']);

// Statistics routes
Route::get('/stats/public', [\App\Http\Controllers\Api\StatsController::class, 'getPublicStats']);

// Tafsir Maudhui routes
Route::get('/tafsir-maudhui', [TafsirMaudhuiController::class, 'api']);
Route::get('/tafsir-maudhui/popular', [TafsirMaudhuiController::class, 'popular']);
Route::get('/tafsir-maudhui/count', [TafsirMaudhuiController::class, 'count']);
Route::get('/tafsir-maudhui/random', [TafsirMaudhuiController::class, 'random']);

// SEO API routes
Route::prefix('seo')->group(function() {
    Route::get('/popular-surahs', [\App\Http\Controllers\Api\SeoApiController::class, 'getPopularSurahs']);
    Route::get('/surah-faq/{number}', [\App\Http\Controllers\Api\SeoApiController::class, 'getSurahFaq']);
    Route::get('/page-seo', [\App\Http\Controllers\Api\SeoApiController::class, 'getPageSeo']);
    Route::get('/search-trends', [\App\Http\Controllers\Api\SeoApiController::class, 'getSearchTrends']);
});

// Admin routes
Route::prefix('admin')->group(function() {
    Route::post('/send-otp', [\App\Http\Controllers\Auth\AdminController::class, 'sendOtp']);
    Route::post('/verify-otp', [\App\Http\Controllers\Auth\AdminController::class, 'verifyOtp']);
    Route::get('/dashboard', [\App\Http\Controllers\Auth\AdminController::class, 'dashboard']);
    Route::post('/contacts/{contact}/mark-read', [\App\Http\Controllers\Auth\AdminController::class, 'markContactAsRead']);
    Route::post('/contacts/{contact}/reply', [\App\Http\Controllers\Auth\AdminController::class, 'replyToContact']);
    
    // Detailed stats for admin
    Route::get('/stats/detailed', [\App\Http\Controllers\Api\StatsController::class, 'getDetailedStats']);
});

// Article routes
// Public routes (anyone can view published articles)
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/random', [ArticleController::class, 'random']); // Must be before {slug} route
Route::get('/articles/{slug}', [ArticleController::class, 'show']);
Route::get('/articles/{slug}/related', [ArticleController::class, 'related']);

// Admin article routes (requires auth and admin role)
Route::middleware(['auth', 'admin'])->prefix('admin/articles')->group(function() {
    Route::get('/', [ArticleController::class, 'adminIndex']);
    Route::get('/{id}/edit', [ArticleController::class, 'edit']);
    Route::post('/', [ArticleController::class, 'store']);
    Route::put('/{id}', [ArticleController::class, 'update']);
    Route::delete('/{id}', [ArticleController::class, 'destroy']);
    Route::post('/upload-image', [ArticleController::class, 'uploadImage']);
});

// Tag routes
// Public routes (anyone can view tags)
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/popular', [TagController::class, 'popular']);
Route::get('/tags/{slug}', [TagController::class, 'show']);
Route::get('/tags/{slug}/articles', [TagController::class, 'articles']);

// Admin tag routes (requires auth and admin role)
Route::middleware(['auth', 'admin'])->prefix('admin/tags')->group(function() {
    Route::get('/', [TagController::class, 'adminIndex']);
    Route::post('/', [TagController::class, 'store']);
    Route::put('/{id}', [TagController::class, 'update']);
    Route::delete('/{id}', [TagController::class, 'destroy']);
});
