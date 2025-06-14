<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SitemapIndexController;
use App\Http\Controllers\SEOController;
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

// Authentication routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);

// React SPA routes with SEO optimization - serve the React app for any other routes, but don't catch /api routes
Route::get('/{path?}', [SEOController::class, 'handleReactRoute'])->where('path', '^(?!api).*');

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
});
