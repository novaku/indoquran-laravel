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
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PrayerController;
use App\Http\Controllers\SelectedPrayerController;
use App\Http\Controllers\TafsirMaudhuiController;
use App\Http\Controllers\Api\SecurityController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\Api\OnlineUsersController;
use App\Http\Controllers\Api\GuestTokenController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// PUBLIC ROUTES (No JWT required)
// ==========================================

Route::post('/guest-token', [GuestTokenController::class, 'getToken']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/auth/google/one-tap', [GoogleAuthController::class, 'handleOneTap']);

Route::post('/password/reset', [\App\Http\Controllers\Auth\PasswordResetController::class, 'sendResetLink']);
Route::post('/password/validate-token', [\App\Http\Controllers\Auth\PasswordResetController::class, 'validateToken']);
Route::post('/password/reset/confirm', [\App\Http\Controllers\Auth\PasswordResetController::class, 'resetPassword']);

// External API route with static key authentication
Route::middleware(['static.key'])->group(function() {
    Route::post('/articles', [ArticleController::class, 'storeApi']);
    Route::post('/articles/create', [ArticleController::class, 'storeApi']);
});

// ==========================================
// PROTECTED ROUTES (JWT required)
// ==========================================

Route::middleware(['auth:api'])->group(function () {

    // Return authenticated user or null
    Route::get('/user', function (Request $request) {
        try {
            $user = auth('api')->user();
            // Do not return the guest user as an authenticated user
            if ($user && $user->email !== 'guest@indoquran.web.id') {
                return response()->json($user);
            }
        } catch (\Exception $e) {
            // Token invalid or expired
        }
        return response(json_encode(null), 200)->header('Content-Type', 'application/json');
    });

    Route::post('/logout', [LoginController::class, 'logout']);

    // Geocoding proxy
    Route::get('/geocode/reverse', [\App\Http\Controllers\Api\GeocodingController::class, 'reverseGeocode']);

    // Security endpoints
    Route::post('/csp-violation-report', [SecurityController::class, 'cspViolationReport']);
    Route::get('/security/stats', [SecurityController::class, 'getSecurityStats']);

    // Core Web Vitals endpoints
    Route::post('/web-vitals', [\App\Http\Controllers\Api\CoreWebVitalsController::class, 'store']);
    Route::get('/web-vitals/stats', [\App\Http\Controllers\Api\CoreWebVitalsController::class, 'getStats']);
    Route::get('/web-vitals/url', [\App\Http\Controllers\Api\CoreWebVitalsController::class, 'getUrlStats']);

    // Online users tracking
    Route::post('/online-users/track', [OnlineUsersController::class, 'track']);
    Route::get('/online-users/count', [OnlineUsersController::class, 'count']);

    // Contact route
    Route::post('/contact', [ContactController::class, 'store']);

    // Profile & Bookmarks (previously simple.auth)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    Route::prefix('penanda')->group(function() {
        Route::get('/', [BookmarkController::class, 'index']);
        Route::get('/status', [BookmarkController::class, 'getStatus']);
        Route::post('/surah/ayah/{ayahId}/toggle', [BookmarkController::class, 'toggle']);
        Route::post('/surah/{surahNumber}/ayah/{ayahNumber}/toggle', [BookmarkController::class, 'toggleByNumbers']);
        Route::post('/surah/ayah/{ayahId}/favorite', [BookmarkController::class, 'toggleFavorite']);
        Route::put('/surah/ayah/{ayahId}/notes', [BookmarkController::class, 'updateNotes']);
        Route::put('/surah/{surahNumber}/ayah/{ayahNumber}/notes', [BookmarkController::class, 'updateNotesByNumbers']);
    });
    
    Route::prefix('bookmark')->group(function() {
        Route::get('/', [BookmarkController::class, 'index']);
        Route::get('/status', [BookmarkController::class, 'getStatus']);
        Route::post('/surah/ayah/{ayahId}/toggle', [BookmarkController::class, 'toggle']);
        Route::post('/surah/{surahNumber}/ayah/{ayahNumber}/toggle', [BookmarkController::class, 'toggleByNumbers']);
        Route::post('/surah/ayah/{ayahId}/favorite', [BookmarkController::class, 'toggleFavorite']);
        Route::put('/surah/ayah/{ayahId}/notes', [BookmarkController::class, 'updateNotes']);
    });

    Route::put('/doa-bersama/{prayer}', [PrayerController::class, 'update']);
    Route::delete('/doa-bersama/{prayer}', [PrayerController::class, 'destroy']);
    Route::delete('/doa-bersama-comments/{comment}', [PrayerController::class, 'deleteComment']);

    // Quran Data (with cache)
    Route::middleware(['api.cache:30d'])->group(function() {
        Route::get('/surahs', [App\Http\Controllers\QuranController::class, 'getAllSurahs']);
        Route::get('/surahs/{number}', [App\Http\Controllers\QuranController::class, 'getSurah'])->where('number', '[0-9]+');
        Route::get('/surahs/{number}/metadata', [App\Http\Controllers\QuranController::class, 'getSurahMetadata'])->where('number', '[0-9]+');
        Route::get('/juz', [App\Http\Controllers\QuranController::class, 'getAllJuz']);
        Route::get('/juz/{number}', [App\Http\Controllers\QuranController::class, 'getJuz'])->where('number', '[0-9]+');
        Route::get('/ayahs/{surahNumber}/{ayahNumber}', [App\Http\Controllers\QuranController::class, 'getAyah'])->where(['surahNumber' => '[0-9]+', 'ayahNumber' => '[0-9]+']);
        Route::get('/halaman', [App\Http\Controllers\QuranController::class, 'getAllPages']);
        Route::get('/halaman/{number}', [App\Http\Controllers\QuranController::class, 'getPage'])->where('number', '[0-9]+');
        
        Route::get('/reciters', [App\Http\Controllers\QuranController::class, 'getAllReciters']);
        Route::get('/reciters/recommended', [App\Http\Controllers\QuranController::class, 'getRecommendedReciters']);
        Route::get('/reciters/by-style', [App\Http\Controllers\QuranController::class, 'getRecitersByStyle']);
        Route::get('/reciters/search', [App\Http\Controllers\QuranController::class, 'searchReciters']);
        
        Route::get('/audio/ayah/{surahNumber}/{ayahNumber}', [App\Http\Controllers\QuranController::class, 'getAyahAudioUrl'])->where(['surahNumber' => '[0-9]+', 'ayahNumber' => '[0-9]+']);
        Route::get('/audio/ayah/{surahNumber}/{ayahNumber}/all-reciters', [App\Http\Controllers\QuranController::class, 'getAyahAudioUrlsAllReciters'])->where(['surahNumber' => '[0-9]+', 'ayahNumber' => '[0-9]+']);
        Route::get('/audio/surah/{surahNumber}', [App\Http\Controllers\QuranController::class, 'getSurahAudioUrls'])->where('surahNumber', '[0-9]+');
    });

    Route::get('/surahs/random', [App\Http\Controllers\QuranController::class, 'getRandomSurahs']);

    Route::middleware(['api.cache:7d'])->group(function() {
        Route::get('/cari', [App\Http\Controllers\QuranController::class, 'searchAyahs']);
        Route::get('/cari/ayahs', [SearchController::class, 'apiSearch']);
    });

    Route::post('/search/log', [App\Http\Controllers\SearchLogController::class, 'logSearch']);
    Route::get('/search/popular', [App\Http\Controllers\SearchLogController::class, 'getPopularSearches']);
    Route::get('/search/history', [App\Http\Controllers\SearchLogController::class, 'getSearchHistoryByIp']);

    // Reading Progress
    Route::get('/reading-progress', [App\Http\Controllers\ReadingProgressController::class, 'getProgress']);
    Route::post('/reading-progress', [App\Http\Controllers\ReadingProgressController::class, 'updateProgress']);
    Route::get('/reading-progress/stats', [App\Http\Controllers\ReadingProgressController::class, 'getStats']);

    // Prayers
    Route::get('/doa-bersama', [PrayerController::class, 'index']);
    Route::post('/doa-bersama', [PrayerController::class, 'store']);
    Route::post('/doa-bersama/{prayer}/amin', [PrayerController::class, 'toggleAmin']);
    Route::post('/doa-bersama/{prayer}/comments', [PrayerController::class, 'addComment']);
    Route::get('/doa-bersama/random', [PrayerController::class, 'getRandomPrayer']);
    Route::get('/doa-bersama/{prayer}', [PrayerController::class, 'show']);
    Route::get('/doa-bersama/{prayer}/comments', [PrayerController::class, 'getComments']);
    Route::get('/kategori-doa', [PrayerController::class, 'getCategories']);
    Route::get('/prayer-images', [PrayerController::class, 'getPrayerImages']);
    Route::get('/dua-bersama/count', [PrayerController::class, 'count']);

    Route::get('/doa-pilihan', [SelectedPrayerController::class, 'index']);
    Route::get('/doa-pilihan/categories', [SelectedPrayerController::class, 'categories']);
    Route::get('/doa-pilihan/{selectedPrayer}', [SelectedPrayerController::class, 'show']);
    Route::get('/prayer-times', [PrayerController::class, 'getPrayerTimes']);

    Route::get('/bookmarks/count', [BookmarkController::class, 'count']);
    Route::get('/stats/public', [\App\Http\Controllers\Api\StatsController::class, 'getPublicStats']);

    // Tafsir Maudhui
    Route::get('/tafsir-maudhui', [TafsirMaudhuiController::class, 'api']);
    Route::get('/tafsir-maudhui/popular', [TafsirMaudhuiController::class, 'popular']);
    Route::get('/tafsir-maudhui/count', [TafsirMaudhuiController::class, 'count']);
    Route::get('/tafsir-maudhui/random', [TafsirMaudhuiController::class, 'random']);

    // SEO
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
        Route::post('/logout', [\App\Http\Controllers\Auth\AdminController::class, 'logout']);
        Route::get('/dashboard', [\App\Http\Controllers\Auth\AdminController::class, 'dashboard']);
        Route::post('/contacts/{contact}/mark-read', [\App\Http\Controllers\Auth\AdminController::class, 'markContactAsRead']);
        Route::post('/contacts/{contact}/reply', [\App\Http\Controllers\Auth\AdminController::class, 'replyToContact']);
        Route::get('/stats/detailed', [\App\Http\Controllers\Api\StatsController::class, 'getDetailedStats']);
    });

    // Articles
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/random', [ArticleController::class, 'random']);
    Route::get('/articles/{slug}', [ArticleController::class, 'show']);
    Route::get('/articles/{slug}/related', [ArticleController::class, 'related']);

    // NOTE: Admin article routes dipindah ke web.php (session-based auth)
    // Route::middleware(['admin'])->prefix('admin/articles') dihapus dari sini

    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/tags/popular', [TagController::class, 'popular']);
    Route::get('/tags/{slug}', [TagController::class, 'show']);
    Route::get('/tags/{slug}/articles', [TagController::class, 'articles']);

    // NOTE: Admin tag routes dipindah ke web.php (session-based auth)
    // Route::middleware(['admin'])->prefix('admin/tags') dihapus dari sini

});
