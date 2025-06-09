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
});



// Surah routes
Route::get('/surahs', [App\Http\Controllers\QuranController::class, 'getAllSurahs']);
Route::get('/surahs/{number}', [App\Http\Controllers\QuranController::class, 'getSurah'])->where('number', '[0-9]+');
Route::get('/surahs/{number}/metadata', [App\Http\Controllers\QuranController::class, 'getSurahMetadata'])->where('number', '[0-9]+');

// Ayah routes
Route::get('/ayahs/{surahNumber}/{ayahNumber}', [App\Http\Controllers\QuranController::class, 'getAyah'])
    ->where(['surahNumber' => '[0-9]+', 'ayahNumber' => '[0-9]+']);

// Search routes
Route::get('/search', [App\Http\Controllers\QuranController::class, 'searchAyahs']);

// Contact route - restricted to internal access only
Route::middleware(['internal.only'])->group(function() {
    Route::post('/contact', [ContactController::class, 'store']);
});

// Prayer Times API Endpoint
Route::get('/prayer-times', [App\Http\Controllers\PrayerTimesController::class, 'getPrayerTimes']);
