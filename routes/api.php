<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SurahController;
use App\Http\Controllers\AyahController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PrayerController;

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

// Return authenticated user or null - simplified without session checks
Route::get('/user', function (Request $request) {
    // First attempt with regular auth check
    $user = auth()->user();
    
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

// Protected routes - using simple auth middleware
Route::middleware(['simple.auth'])->group(function() {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // Bookmark routes
    Route::prefix('bookmarks')->group(function() {
        Route::get('/', [BookmarkController::class, 'index']);
        Route::get('/status', [BookmarkController::class, 'getStatus']);
        Route::post('/surah/ayah/{ayahId}/toggle', [BookmarkController::class, 'toggle']);
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

// Page routes with caching
Route::middleware(['api.cache:30d'])->group(function() {
    Route::get('/pages', [App\Http\Controllers\QuranController::class, 'getAllPages']);
    Route::get('/pages/{number}', [App\Http\Controllers\QuranController::class, 'getPage'])->where('number', '[0-9]+');
});

// Search routes with caching
Route::middleware(['api.cache:7d'])->group(function() {
    Route::get('/search', [App\Http\Controllers\QuranController::class, 'searchAyahs']);
    Route::get('/search/ayahs', [SearchController::class, 'apiSearch']);
});

// Public prayer routes (for viewing without auth) - Indonesian URLs
Route::get('/doa-bersama', [PrayerController::class, 'index']);
Route::get('/doa-bersama/random', [PrayerController::class, 'getRandomPrayer']);
Route::get('/doa-bersama/{prayer}', [PrayerController::class, 'show']);
Route::get('/doa-bersama/{prayer}/comments', [PrayerController::class, 'getComments']);
Route::get('/kategori-doa', [PrayerController::class, 'getCategories']);

// Prayer times API endpoint
Route::get('/prayer-times', [PrayerController::class, 'getPrayerTimes']);
