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

// Return authenticated user or null
Route::get('/user', function (Request $request) {
    $user = auth()->user();
    
    if ($user) {
        return response()->json($user);
    }
    
    // Explicitly return null as JSON
    return response('null', 200)->header('Content-Type', 'application/json');
});

// Auth routes
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

// Protected routes
Route::middleware(['auth'])->group(function() {
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
Route::get('/surahs/{number}', [App\Http\Controllers\QuranController::class, 'getSurah']);
Route::get('/surahs/{number}/metadata', [App\Http\Controllers\QuranController::class, 'getSurahMetadata']);

// Ayah routes
Route::get('/ayahs/{surahNumber}/{ayahNumber}', [App\Http\Controllers\QuranController::class, 'getAyah']);

// Search routes
Route::get('/search', [App\Http\Controllers\QuranController::class, 'searchAyahs']);

// Contact route - restricted to internal access only
Route::middleware(['internal.only'])->group(function() {
    Route::post('/contact', [ContactController::class, 'store']);
});

// Debug route to test session
Route::get('/debug-user', function (Request $request) {
    \Log::info('Debug user route called');
    \Log::info('Session ID: ' . $request->session()->getId());
    \Log::info('Auth check: ' . (auth()->check() ? 'true' : 'false'));
    \Log::info('Auth user: ', [auth()->user()]);
    \Log::info('Request user: ', [$request->user()]);
    
    return response()->json([
        'session_id' => $request->session()->getId(),
        'auth_check' => auth()->check(),
        'auth_user' => auth()->user(),
        'request_user' => $request->user(),
    ]);
});

// Prayer Times API Endpoint
Route::get('/prayer-times', [App\Http\Controllers\PrayerTimesController::class, 'getPrayerTimes']);
