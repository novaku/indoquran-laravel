<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\AdminController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SitemapIndexController;
use App\Http\Controllers\SEOController;
use App\Http\Controllers\TafsirMaudhuiController;
use Illuminate\Support\Facades\Route;

// SEO Routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

// Advanced sitemap routes for better organization
Route::get('/sitemap-index.xml', [SitemapIndexController::class, 'index'])->name('sitemap.index');
Route::get('/sitemap-main.xml', [SitemapIndexController::class, 'mainSitemap'])->name('sitemap.main');
Route::get('/sitemap-surahs-{group}.xml', [SitemapIndexController::class, 'surahGroupSitemap'])
    ->where('group', '[0-9]+')
    ->name('sitemap.surahs');
Route::get('/sitemap-juz.xml', [SitemapIndexController::class, 'juzSitemap'])->name('sitemap.juz');

// CORS Proxy route for development environment only
if (app()->environment('local', 'development')) {
    // CORS Debug tool
    Route::get('/cors-debug', [App\Http\Controllers\CorsDebugController::class, 'index']);
    Route::post('/cors-debug/test', [App\Http\Controllers\CorsDebugController::class, 'testRequest']);
    
    // Form Enctype Debug Tool
    Route::get('/enctype-debug', [App\Http\Controllers\EnctypeDebugController::class, 'index']);
    Route::post('/api/enctype-test', [App\Http\Controllers\EnctypeDebugController::class, 'testSubmit']);
    
    Route::get('proxy-assets/{path}', function ($path) {
        // This route is handled by CorsProxyMiddleware
        // The middleware will intercept and proxy the request
        return response('Proxy endpoint', 200);
    })->where('path', '.*')->middleware('cors.proxy');

    // CORS Options route to handle preflight requests
    Route::options('proxy-assets/{path}', function () {
        return response('', 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    })->where('path', '.*');
}

// Indonesian language routes
Route::get('/masuk', [LoginController::class, 'showLoginForm'])->name('masuk');
Route::post('/masuk', [LoginController::class, 'login']);
Route::get('/daftar', [RegisterController::class, 'showRegistrationForm'])->name('daftar');
Route::post('/daftar', [RegisterController::class, 'register']);

// Authentication routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);

// Admin routes
Route::get('/admin/session-check', function() {
    return response()->json([
        'session_id' => session()->getId(),
        'session_started' => session()->isStarted(),
        'csrf_token' => csrf_token(),
        'cookies' => request()->cookies->all()
    ]);
})->name('admin.session-check');
Route::get('/admin/csrf-token', [AdminController::class, 'getCsrfToken'])->name('admin.csrf-token');
Route::post('/admin/send-otp', [AdminController::class, 'sendOtp'])->name('admin.send-otp');
Route::post('/admin/login', [AdminController::class, 'login']);

// API routes for Tafsir Maudhui (to be consumed by React)
Route::get('/api/tafsir-maudhui', [TafsirMaudhuiController::class, 'api'])->name('tafsir-maudhui.api');
Route::get('/api/tafsir-maudhui/search', [TafsirMaudhuiController::class, 'search'])->name('tafsir-maudhui.search');

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    
    // Admin API routes (protected) - moved to /api/admin/* to avoid conflicts with SPA routes
    Route::prefix('api/admin')->middleware(['auth', 'admin'])->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.api.dashboard');
        Route::get('/users', [AdminController::class, 'getUsers'])->name('admin.api.users');
        Route::get('/contacts', [AdminController::class, 'getContacts'])->name('admin.api.contacts');
        Route::get('/prayers', [AdminController::class, 'getPrayers'])->name('admin.api.prayers');
        
        // Contact management routes
        Route::post('/contacts/{contactId}/mark-read', [AdminController::class, 'markContactAsRead'])->name('admin.api.contacts.mark-read');
        Route::post('/contacts/{contactId}/reply', [AdminController::class, 'replyToContact'])->name('admin.api.contacts.reply');
    });
});

// React SPA routes with SEO optimization - serve the React app for any other routes, but don't catch /api or build routes
// This MUST be after all other specific routes to avoid conflicts
// Now /admin/* paths will be served by the React SPA
Route::get('/{path?}', [SEOController::class, 'handleReactRoute'])->where('path', '^(?!api|build|assets|fonts|images|storage).*');
