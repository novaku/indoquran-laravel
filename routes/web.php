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
