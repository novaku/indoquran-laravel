import React, { useState } from 'react';
import { CheckCircleIcon, CogIcon, BugAntIcon, SparklesIcon, ShieldCheckIcon, RocketLaunchIcon, DocumentTextIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { Card, Badge, PageContent } from '../components/ui';

function RiwayatVersiPage() {
    const [expandedVersions, setExpandedVersions] = useState({ "2.15.2": true });

    const toggleVersion = (versionNumber) => {
        setExpandedVersions(prev => ({
            ...prev,
            [versionNumber]: !prev[versionNumber]
        }));
    };
    const versions = [
        {
            version: "2.15.2",
            date: "24 Mei 2026",
            type: "patch",
            title: "Integrasi Google AdSense Global",
            description: "Patch monetisasi dengan menambahkan script Google AdSense resmi ke layout React global agar semua halaman memuat script verifikasi dan iklan otomatis secara konsisten. Pembaruan ini juga menambahkan DNS prefetch untuk domain AdSense agar inisialisasi script lebih cepat.",
            changes: [
                {
                    type: "feature",
                    text: "Integrasi Script AdSense Global - Menambahkan script resmi adsbygoogle.js dengan publisher ca-pub-9994842285785390 pada head layout React agar berlaku di semua halaman"
                },
                {
                    type: "improvement",
                    text: "DNS Prefetch AdSense - Menambahkan dns-prefetch untuk pagead2.googlesyndication.com guna mempercepat koneksi awal resource iklan"
                },
                {
                    type: "improvement",
                    text: "Konsistensi SPA - Penempatan di layout utama memastikan script AdSense tidak terduplikasi di tiap halaman React"
                }
            ]
        },
        {
            version: "2.15.1",
            date: "24 Mei 2026",
            type: "patch",
            title: "Perbaikan Crash Halaman Surah & Sinkronisasi Cache Service Worker",
            description: "Patch stabilisasi untuk memperbaiki error boundary pada halaman surah (termasuk rute /surah/112) dan mengatasi masalah cache service worker yang menyebabkan bundle lama tetap dipakai saat pengembangan lokal. Update ini memastikan halaman surah kembali tampil normal serta cache lebih aman untuk request dan build terbaru.",
            changes: [
                {
                    type: "fix",
                    text: "Perbaikan Runtime Crash SurahDetailPage - Menambahkan guard null-safe saat membentuk payload SEO agar halaman tidak crash sebelum data surah selesai dimuat"
                },
                {
                    type: "fix",
                    text: "Perbaikan Urutan Render Error/Loading - State error kini ditampilkan lebih dulu sehingga kegagalan API tidak terjebak pada fallback loading"
                },
                {
                    type: "fix",
                    text: "Cache.put Safety Guard - Service worker kini hanya menyimpan request GET untuk mencegah error Request method POST is unsupported"
                },
                {
                    type: "improvement",
                    text: "Bypass Cache di Localhost - Service worker tidak lagi melakukan runtime caching pada localhost/127.0.0.1 untuk mencegah stale bundle saat debug"
                },
                {
                    type: "improvement",
                    text: "Cache Version Bump - Version cache pada sw.js, sw-mobile.js, dan sw-pwa.js diperbarui agar cache lama otomatis terinvalidasi"
                }
            ]
        },
        {
            version: "2.15.0",
            date: "24 Mei 2026",
            type: "minor",
            title: "Pencarian Persis dan Toggle Exact Search",
            description: "Update minor yang menambahkan mode pencarian persis di seluruh alur pencarian IndoQuran. Pengguna kini bisa menyalakan opsi pencarian persis untuk memastikan kata yang dicari hanya cocok sebagai kata utuh, bukan bagian dari kata lain. Mode ini didukung di frontend, autocomplete, halaman hasil, dan backend API agar hasil pencarian tetap konsisten.",
            changes: [
                {
                    type: "feature",
                    text: "Toggle Pencarian Persis - Checkbox baru di halaman pencarian dan search bar beranda untuk mengaktifkan mode exact search"
                },
                {
                    type: "feature",
                    text: "Exact Search Backend - Endpoint pencarian kini mendukung flag exact=1 untuk membedakan hasil kata utuh dan substring"
                },
                {
                    type: "feature",
                    text: "Autocomplete Consistency - Saran pencarian ikut memakai mode exact agar hasil pencarian cepat dan hasil halaman utama tetap selaras"
                },
                {
                    type: "improvement",
                    text: "URL dan Pagination Sync - Mode exact dipertahankan lewat query string saat submit, navigasi hasil, dan paginasi"
                },
                {
                    type: "improvement",
                    text: "Default Behavior Tetap Aman - Pencarian biasa tetap bekerja seperti sebelumnya jika toggle exact tidak diaktifkan"
                },
                {
                    type: "fix",
                    text: "Perbaikan Riwayat Pencarian - Mencegah kata seperti 'misalkan' ikut muncul saat mencari kata utuh seperti 'isa'"
                }
            ]
        },
        {
            version: "2.14.0",
            date: "8 Mei 2026",
            type: "major",
            title: "Halaman Al-Quran: CDN Image, Audio Player & Tafsir Maudhui Slug Routing",
            description: "Update mayor pada halaman detail Al-Quran dengan tampilan gambar halaman via CDN myquran.com, audio player per ayat dengan fitur Putar Semua secara berurutan, highlight dan auto-scroll ke ayat yang sedang diputar. Tafsir Maudhui kini mendukung slug routing sehingga setiap topik dapat dibuka langsung melalui URL, lengkap dengan highlight dan scroll otomatis. Versi ini juga mencakup sinkronisasi referensi data dari dataset Hugging Face ronnieaban/alquran untuk memperkaya metadata ayat dan tafsir.",
            changes: [
                {
                    type: "feature",
                    text: "Integrasi Referensi Dataset Hugging Face - Menambahkan referensi data terbaru dari https://huggingface.co/datasets/ronnieaban/alquran (6.236 ayat) yang mencakup teks Arab, latin, terjemahan Indonesia, metadata surah/ayat, footnote, serta tafsir wajiz dan tahlili"
                },
                {
                    type: "feature",
                    text: "CDN Gambar Halaman - Gambar setiap halaman Al-Quran ditampilkan dari CDN cdn.myquran.com/img/page/{nomor}.png"
                },
                {
                    type: "feature",
                    text: "Audio Player Per Ayat - Setiap ayat memiliki audio player inline dengan tombol play/pause dan label nama surah & ayat"
                },
                {
                    type: "feature",
                    text: "Putar Semua Ayat - Tombol Putar Semua memutar seluruh ayat halaman secara berurutan dengan progress counter"
                },
                {
                    type: "feature",
                    text: "Highlight & Auto-Scroll Ayat - Ayat yang sedang diputar otomatis di-highlight dengan ring hijau dan di-scroll ke tengah layar"
                },
                {
                    type: "feature",
                    text: "Panel Header Tergabung - Header halaman, kontrol ukuran teks, pemilih qari, dan tombol Putar Semua digabung dalam satu panel"
                },
                {
                    type: "feature",
                    text: "Tafsir Maudhui Slug Routing - Rute baru /tafsir-maudhui/:slug memungkinkan direct link ke topik tafsir tertentu"
                },
                {
                    type: "feature",
                    text: "Highlight Topik Tafsir - Topik yang dibuka via URL slug otomatis di-highlight (bg biru) dan di-scroll ke posisinya"
                },
                {
                    type: "improvement",
                    text: "Format Share WhatsApp Ayat & Surah - Teks share disederhanakan tanpa ikon/emoticon, menggunakan karakter teks besar agar lebih konsisten dan terbaca di semua perangkat WhatsApp"
                },
                {
                    type: "fix",
                    text: "Fix Sintaks JSX QuranSearchPage - Perbaikan komentar JSX yang tidak valid pada komponen sidebar"
                }
            ]
        },
        {
            version: "2.13.0",
            date: "8 Mei 2026",
            type: "major",
            title: "Redesign Detail Ayat, Tafsir Lengkap & Optimasi Performa",
            description: "Update mayor mencakup redesign tampilan detail ayat dengan footnote, tafsir ayat dan surah yang lebih lengkap, integrasi CDN untuk gambar ayat, serta penghapusan komponen AdSense untuk menyederhanakan aplikasi dan meningkatkan performa. Berbagai perbaikan Google Search Console juga disertakan untuk meningkatkan indeksasi dan visibilitas di mesin pencari.",
            changes: [
                {
                    type: "feature",
                    text: "Redesign Detail Ayat - Tampilan detail ayat dirancang ulang untuk pengalaman membaca yang lebih baik dan intuitif"
                },
                {
                    type: "feature",
                    text: "Footnote - Penambahan footnote pada detail ayat untuk memberikan konteks dan keterangan tambahan"
                },
                {
                    type: "feature",
                    text: "Tafsir Lebih Lengkap - Tafsir ayat dan surah ditampilkan lebih lengkap dan informatif"
                },
                {
                    type: "feature",
                    text: "CDN Image Ayat - Gambar ayat kini menggunakan CDN untuk loading yang lebih cepat dan reliable"
                },
                {
                    type: "improvement",
                    text: "Hapus Komponen AdSense - Penghapusan seluruh komponen AdSense dari halaman dan layout utama untuk menyederhanakan kode dan meningkatkan performa"
                },
                {
                    type: "improvement",
                    text: "Optimasi Performa - Bundle JavaScript lebih ringan setelah penghapusan AdSense, meningkatkan Core Web Vitals"
                },
                {
                    type: "fix",
                    text: "Google Search Console - Perbaikan berbagai isu crawl, 404 error, duplikat URL, dan canonical yang dilaporkan Google Search Console"
                },
                {
                    type: "fix",
                    text: "Fix 404 Error Crawl - Mengatasi halaman yang tidak terindeks akibat error 404 saat di-crawl Google"
                },
                {
                    type: "fix",
                    text: "Fix Duplikat Canonical - Mengatasi isu duplikat URL dimana Google memilih versi kanonik berbeda dari pengguna"
                }
            ]
        },
        {
            version: "2.12.0",
            date: "2 Januari 2026",
            type: "major",
            title: "AMP (Accelerated Mobile Pages) Implementation",
            description: "Update mayor dengan implementasi AMP untuk meningkatkan kecepatan loading halaman di perangkat mobile. Integrasi AMP HTML framework dengan validasi penuh sesuai standar Google AMP, optimasi performa untuk Core Web Vitals, dan dukungan untuk semua konten Quran termasuk Surah, Ayah, Artikel, dan Tafsir. Implementasi mencakup AMP-specific components, caching strategy, dan analytics tracking untuk mobile-first experience yang optimal.",
            changes: [
                {
                    type: "feature",
                    text: "AMP HTML Framework - Implementasi full AMP HTML dengan doctype <!doctype html> dan tag <html ⚡> untuk validasi Google AMP"
                },
                {
                    type: "feature",
                    text: "AMP Surah Pages - Halaman AMP untuk semua 114 Surah dengan Arabic text rendering dan Indonesian translation"
                },
                {
                    type: "feature",
                    text: "AMP Article Pages - Artikel berbasis AMP dengan rich content, images, dan structured data untuk SEO"
                },
                {
                    type: "feature",
                    text: "AMP Tafsir Pages - Halaman tafsir dengan AMP validation dan optimized loading untuk mobile readers"
                },
                {
                    type: "feature",
                    text: "AMP Components - amp-img, amp-list, amp-bind, amp-analytics untuk interactive mobile experience"
                },
                {
                    type: "feature",
                    text: "AMP Cache Support - Optimized untuk Google AMP Cache dengan proper cache headers dan CDN delivery"
                },
                {
                    type: "feature",
                    text: "AMP Analytics - Integration dengan Google Analytics 4 untuk tracking AMP pages performance"
                },
                {
                    type: "feature",
                    text: "AMP Sidebar Navigation - amp-sidebar component untuk mobile-friendly navigation menu"
                },
                {
                    type: "feature",
                    text: "AMP Search - Implementasi amp-form untuk search functionality tanpa JavaScript tradisional"
                },
                {
                    type: "improvement",
                    text: "Mobile Performance Boost - Loading time reduction hingga 4x lebih cepat dibanding non-AMP pages"
                },
                {
                    type: "improvement",
                    text: "Core Web Vitals Optimization - Improved LCP, FID, dan CLS scores untuk mobile devices"
                },
                {
                    type: "improvement",
                    text: "SEO Enhancement - AMP badge di Google Search results untuk better visibility dan CTR"
                },
                {
                    type: "improvement",
                    text: "Progressive Enhancement - Fallback ke regular pages untuk browsers yang tidak support AMP"
                },
                {
                    type: "improvement",
                    text: "Canonical Links - Proper rel=canonical dan rel=amphtml tags untuk SEO best practices"
                },
                {
                    type: "improvement",
                    text: "Structured Data for AMP - Schema.org JSON-LD dengan AMP-specific markup untuk rich snippets"
                },
                {
                    type: "improvement",
                    text: "AMP Validation - Full validation menggunakan AMP validator untuk compliance dengan Google standards"
                },
                {
                    type: "improvement",
                    text: "Responsive AMP Layout - Flexible layouts menggunakan AMP layout system (responsive, fill, fixed-height)"
                },
                {
                    type: "improvement",
                    text: "Font Optimization - AMP-allowed fonts dengan subsetting untuk minimal payload size"
                },
                {
                    type: "improvement",
                    text: "Image Lazy Loading - Native AMP lazy loading dengan amp-img untuk bandwidth savings"
                },
                {
                    type: "improvement",
                    text: "CSS Optimization - Inline CSS dengan size limit 75KB sesuai AMP specifications"
                },
                {
                    type: "improvement",
                    text: "No Custom JavaScript - Pure AMP components without custom JS untuk maximum performance"
                },
                {
                    type: "improvement",
                    text: "Service Worker Integration - amp-install-serviceworker untuk offline capability"
                }
            ]
        },
        {
            version: "2.11.6",
            date: "7 November 2025",
            type: "minor",
            title: "Admin Article Editor - Auto-Generate Slug Enhancement",
            description: "Update minor dengan peningkatan UX pada admin article editor melalui implementasi auto-generate slug yang intelligent. Slug otomatis ter-generate dari judul artikel dengan normalisasi karakter Indonesia, smart handling untuk mode manual vs otomatis, dan fitur reset untuk kembali ke auto-sync. Meningkatkan efisiensi workflow admin dalam membuat artikel dengan SEO-friendly URLs.",
            changes: [
                {
                    type: "feature",
                    text: "Auto-Generate Slug dari Judul Artikel - Slug otomatis terisi dan ter-update real-time saat judul berubah atau dihapus"
                },
                {
                    type: "feature",
                    text: "Intelligent Mode Switching - Mode otomatis (default) vs mode manual (terkunci) dengan state tracking untuk user control"
                },
                {
                    type: "feature",
                    text: "Reset Button - Tombol reset yang muncul saat slug di-edit manual untuk kembali ke auto-sync dengan judul"
                },
                {
                    type: "feature",
                    text: "generateSlug() Function - Normalisasi karakter spesial Indonesia (à, é, ü), konversi ke lowercase, replace spaces dengan hyphen"
                },
                {
                    type: "feature",
                    text: "URL Preview - Real-time preview URL artikel (/artikel/{slug}) di bawah input field untuk visual confirmation"
                },
                {
                    type: "improvement",
                    text: "Smart Character Normalization - Handle Indonesian special characters (àáâãäå → a, èéêë → e, ìíîï → i, òóôõö → o, ùúûü → u)"
                },
                {
                    type: "improvement",
                    text: "Enhanced Input Handler - Deteksi manual edit pada slug field untuk switch ke mode manual dan stop auto-update"
                },
                {
                    type: "improvement",
                    text: "Dynamic Helper Text - Contextual helper text yang berubah sesuai mode (auto/manual) dan status edit (new/existing article)"
                },
                {
                    type: "improvement",
                    text: "SEO Warning for Edit Mode - Peringatan khusus saat edit artikel existing untuk hati-hati mengubah slug (dampak SEO)"
                },
                {
                    type: "improvement",
                    text: "Flexible Layout - Input slug dengan button reset dalam flex container untuk UI yang compact dan responsive"
                },
                {
                    type: "improvement",
                    text: "State Management - isSlugManuallyEdited state untuk track user intention dan preserve manual edits"
                },
                {
                    type: "improvement",
                    text: "useEffect Optimization - Conditional auto-update hanya untuk artikel baru (!isEdit) dan mode otomatis (!isSlugManuallyEdited)"
                },
                {
                    type: "improvement",
                    text: "Empty Title Handling - Slug otomatis kosong jika judul dihapus untuk prevent invalid URLs"
                }
            ]
        },
        {
            version: "2.11.5",
            date: "7 November 2025",
            type: "major",
            title: "Sitemap Validation Fix - Google Search Console Compliance",
            description: "Update mayor dengan perbaikan critical sitemap validation issue yang terdeteksi di Google Search Console. Fix 'Di-crawl - saat ini tidak diindeks' error dengan normalisasi format tanggal W3C, update ke current date, dan eliminasi static sitemap files yang override dynamic routes. Implementasi best practices sesuai dokumentasi Google untuk meningkatkan crawlability dan indexing success rate.",
            changes: [
                {
                    type: "fix",
                    text: "Fixed Invalid Date Format - Changed from '2025-10-17' (future/invalid date) to proper W3C datetime format 'YYYY-MM-DDTHH:MM:SS+00:00' sesuai Google standards"
                },
                {
                    type: "fix",
                    text: "Updated All Sitemap Dates to Current Date (2025-11-07) - Eliminasi future dates yang menyebabkan validation error 'Validasi gagal: Dimulai 17/10/25, Gagal 18/10/25'"
                },
                {
                    type: "fix",
                    text: "Removed Static Sitemap Files Override - Deleted outdated static XML files di public/ yang override dynamic routes dari SitemapController dan SitemapIndexController"
                },
                {
                    type: "fix",
                    text: "Fixed sitemap-index.xml Date Consistency - Semua <lastmod> tags menggunakan ISO 8601 format dengan timezone UTC (+00:00)"
                },
                {
                    type: "fix",
                    text: "Fixed sitemap-main.xml - Updated lastmod dates untuk homepage, pencarian, kontak, dan static pages ke 2025-11-07"
                },
                {
                    type: "fix",
                    text: "Fixed sitemap-surahs-*.xml (1-6) - Updated all 114 surah lastmod dates dengan proper format untuk optimal crawling"
                },
                {
                    type: "fix",
                    text: "Fixed sitemap-juz.xml - Updated 30 juz pages dengan current dates dan proper XML structure"
                },
                {
                    type: "improvement",
                    text: "Enhanced SitemapIndexController - Standardized date format ke ISO 8601 (Carbon::now()->toIso8601String()) untuk consistency"
                },
                {
                    type: "improvement",
                    text: "Enhanced SitemapController - All dynamic routes now use Carbon::now()->toIso8601String() untuk real-time valid dates"
                },
                {
                    type: "improvement",
                    text: "Updated robots.txt - Ensured proper sitemap reference 'Sitemap: https://indoquran.web.id/sitemap.xml' untuk crawler discovery"
                },
                {
                    type: "improvement",
                    text: "Regenerate Sitemaps Script (regenerate-sitemaps.sh) - Automated script untuk bulk update semua sitemap files dengan proper dates"
                },
                {
                    type: "improvement",
                    text: "Comprehensive Sitemap Testing (test-sitemaps.sh) - 11 automated tests untuk validate XML structure, date format, URL consistency, dan Google compliance"
                },
                {
                    type: "feature",
                    text: "W3C Datetime Compliance - All <lastmod> tags follow W3C format: YYYY-MM-DDTHH:MM:SS+00:00 sesuai https://www.w3.org/TR/NOTE-datetime"
                },
                {
                    type: "feature",
                    text: "Dynamic Date Generation - Sitemaps now auto-update dates menggunakan Carbon untuk prevent future date issues"
                },
                {
                    type: "documentation",
                    text: "SITEMAP_VALIDATION_FIX.md - Comprehensive documentation dengan problem analysis, solution implementation, dan Google Search Console validation guide"
                },
                {
                    type: "documentation",
                    text: "Quick Deployment Guide - Step-by-step deployment checklist dengan pre/post verification untuk production rollout"
                },
                {
                    type: "documentation",
                    text: "Updated README.md - Added sitemap testing commands (./test-sitemaps.sh) dan sitemap regeneration workflow"
                },
                {
                    type: "security",
                    text: "Sitemap URL Validation - Ensure all URLs use HTTPS dan proper domain (https://indoquran.web.id) untuk prevent security warnings"
                },
                {
                    type: "security",
                    text: "XML Security Headers - Added proper Content-Type headers (application/xml; charset=utf-8) untuk prevent MIME type attacks"
                }
            ]
        },
        {
            version: "2.11.4",
            date: "7 November 2025",
            type: "major",
            title: "Canonical URL Fix - Google Search Console Optimization",
            description: "Update mayor dengan perbaikan critical SEO issue 'Google chose different canonical than user' yang terdeteksi di Google Search Console. Implementasi canonical URL management yang konsisten sesuai Google's best practices dengan normalisasi URL, smart query parameter filtering, dan eliminasi duplicate canonical tags untuk meningkatkan indexing quality dan search rankings.",
            changes: [
                {
                    type: "fix",
                    text: "Eliminasi duplicate canonical tags - Removed server-side canonical tag dari react.blade.php untuk mencegah race condition dengan React client-side management"
                },
                {
                    type: "improvement",
                    text: "Enhanced URL Normalization - Smart query parameter filtering (keep: q, page, filter, sort | remove: utm_*, fbclid, gclid tracking params)"
                },
                {
                    type: "improvement",
                    text: "Consistent Trailing Slash Handling - Automatic removal kecuali root '/' dengan 301 redirect ke canonical version"
                },
                {
                    type: "improvement",
                    text: "Production Domain Consistency - Always use https://indoquran.web.id pada canonical URLs, tidak pernah localhost atau IP"
                },
                {
                    type: "improvement",
                    text: "Optimized useCanonicalURL Hook - Proper DOM insertion position (after charset meta), conditional updates untuk avoid unnecessary DOM manipulation"
                },
                {
                    type: "improvement",
                    text: "Meta Tags Sync - og:url dan twitter:url synchronized dengan canonical URL untuk konsistensi cross-platform"
                },
                {
                    type: "improvement",
                    text: "SEOHead Component Enhancement - Removed duplicate canonical tag generation, centralized management di App.jsx via useCanonicalURL hook"
                },
                {
                    type: "feature",
                    text: "Automated Testing Script (test-canonical-url.sh) - Comprehensive test untuk canonical tag presence, duplicates, normalization, dan query parameter handling"
                },
                {
                    type: "feature",
                    text: "ensureCanonicalConsistency Function - Automatic 301 redirect ke canonical version jika URL tidak match (protocol, hostname, pathname, search params)"
                },
                {
                    type: "documentation",
                    text: "CANONICAL_URL_FIX.md - Comprehensive documentation dengan Google best practices, implementation details, testing guide, dan monitoring checklist"
                },
                {
                    type: "documentation",
                    text: "DEPLOYMENT_v2.11.4.md - Complete deployment checklist dengan pre/post verification steps dan success criteria"
                },
                {
                    type: "documentation",
                    text: "Updated CHANGELOG.md - Detailed version 2.11.4 entry dengan expected SEO impact (90%+ canonical error reduction dalam 2-4 minggu)"
                },
                {
                    type: "documentation",
                    text: "Updated README.md - Added canonical testing commands dan enhanced feature list dengan SEO optimization highlights"
                },
                {
                    type: "security",
                    text: "Single Source of Truth - Canonical URLs dimanage exclusively oleh React untuk prevent confusion dan ensure Google sees consistent canonical"
                }
            ]
        },
        {
            version: "2.10.0",
            date: "19 Oktober 2025",
            type: "major",
            title: "Integrasi Audio Murottal EveryAyah.com - 79+ Qari Dunia",
            description: "Update mayor dengan integrasi lengkap audio murottal dari EveryAyah.com. Menyediakan 79+ pilihan qari (pembaca Al-Quran) terbaik dunia dengan berbagai kualitas audio (16kbps-192kbps) dan gaya tilawah (Murattal, Mujawwad, Muallim, Warsh). Sistem dropdown dinamis dengan API backend yang lengkap untuk kemudahan switching antar qari.",
            changes: [
                {
                    type: "feature",
                    text: "Dynamic Qari Dropdown - Pilihan 79+ qari yang dimuat dari API dengan nama dan bitrate lengkap"
                },
                {
                    type: "feature",
                    text: "8 Qari Rekomendasi - Abdul Basit Murattal 192kbps, Abdurrahmaan As-Sudais 192kbps, Alafasy 128kbps, Husary 128kbps, Minshawy Murattal 128kbps, Maher Al Muaiqly 128kbps, Saood Ash-Shuraym 128kbps, Muhsin Al Qasim 192kbps"
                },
                {
                    type: "feature",
                    text: "EveryAyah.com Integration - Audio URL format: https://everyayah.com/data/{subfolder}/{SSSAAA}.mp3 untuk setiap ayat"
                },
                {
                    type: "feature",
                    text: "Backend MurottalService - Service layer untuk operasi audio dengan 7 methods (getAllReciters, getRecommendedReciters, getReciterById, getAyahAudioUrl, getSurahAudioUrls, dll)"
                },
                {
                    type: "feature",
                    text: "7 API Endpoints Baru - /api/reciters, /api/reciters/recommended, /api/reciters/by-style, /api/reciters/search, /api/audio/ayah/{surah}/{ayah}, /api/audio/ayah/{surah}/{ayah}/all-reciters, /api/audio/surah/{surah}"
                },
                {
                    type: "feature",
                    text: "Reciters Configuration File (config/reciters.php) - 79+ qari dengan detail id, name, subfolder, bitrate, dan style"
                },
                {
                    type: "feature",
                    text: "Interactive Demo Page (murottal-list.html) - Halaman demo dengan UI cantik untuk explore semua 79+ qari dengan sample audio playback"
                },
                {
                    type: "feature",
                    text: "Multi-Quality Audio Support - 8 tingkat kualitas: 16kbps, 32kbps, 40kbps, 48kbps, 64kbps, 128kbps, 192kbps"
                },
                {
                    type: "feature",
                    text: "Multiple Recitation Styles - Murattal (bacaan bertajwid), Mujawwad (bacaan indah), Muallim (pembelajaran), Warsh (riwayat Warsh), Translation (terjemahan Inggris)"
                },
                {
                    type: "improvement",
                    text: "SurahDetailPage Enhanced - Dropdown qari dengan auto-fetch dari API, loading states, error handling dengan fallback reciters"
                },
                {
                    type: "improvement",
                    text: "Smart Audio URL Generation - Helper function getEveryAyahAudioUrl() dengan automatic reciter lookup dan URL formatting (SSSAAA pattern)"
                },
                {
                    type: "improvement",
                    text: "Auto-Stop on Qari Change - Otomatis menghentikan playback saat user mengganti qari untuk pengalaman yang lebih baik"
                },
                {
                    type: "improvement",
                    text: "Enhanced Dropdown UI - Styling modern dengan emoji icon 🎙️, hover effects, focus rings, info text showing total reciters"
                },
                {
                    type: "improvement",
                    text: "API Caching Strategy - 30-day cache untuk reciters API endpoints untuk performa optimal"
                },
                {
                    type: "improvement",
                    text: "Responsive Design - Dropdown full-width di mobile, max-width di desktop untuk readability"
                },
                {
                    type: "improvement",
                    text: "Consistent Playback - Both full surah player dan individual ayah player menggunakan selected qari"
                },
                {
                    type: "documentation",
                    text: "EVERYAYAH_AUDIO_INTEGRATION.md - Dokumentasi lengkap 500+ baris dengan API usage, examples, React integration code"
                },
                {
                    type: "documentation",
                    text: "DROPDOWN_QARI_UPDATE.md - Complete update changelog dengan technical details, migration notes, testing checklist"
                },
                {
                    type: "documentation",
                    text: "DROPDOWN_QARI_VISUAL_GUIDE.md - Visual guide dengan ASCII diagrams, UI states, CSS classes, interaction flows"
                },
                {
                    type: "fix",
                    text: "Replaced Old Hardcoded Qari IDs - Migrasi dari hardcoded IDs ('03', '05') ke dynamic system dengan proper ID mapping"
                },
                {
                    type: "fix",
                    text: "Audio Format Consistency - Semua audio menggunakan EveryAyah.com format untuk reliability dan konsistensi"
                }
            ]
        },
        {
            version: "2.9.0",
            date: "19 Oktober 2025",
            type: "major",
            title: "Implementasi Core Web Vitals Sesuai Google Search Console Standards",
            description: "Update mayor dengan implementasi lengkap Core Web Vitals monitoring sesuai dokumentasi Google Search Console. Mengganti FID dengan INP (Interaction to Next Paint) sebagai metrik baru sejak Maret 2024, implementasi 75th percentile reporting, Google Analytics 4 integration, dan backend API untuk data collection. Semua threshold diupdate sesuai standar Google untuk LCP, INP, dan CLS.",
            changes: [
                {
                    type: "feature",
                    text: "INP (Interaction to Next Paint) monitoring menggantikan FID - metrik responsivitas terbaru dari Google yang melacak SEMUA interaksi pengguna"
                },
                {
                    type: "feature",
                    text: "Core Web Vitals Reporter utility (coreWebVitalsReporter.js) dengan automatic reporting ke Google Analytics 4 dan custom endpoint"
                },
                {
                    type: "feature",
                    text: "Backend API Controller (CoreWebVitalsController.php) dengan 3 endpoints: POST /api/web-vitals, GET /api/web-vitals/stats, GET /api/web-vitals/url"
                },
                {
                    type: "feature",
                    text: "75th percentile calculation dan local storage untuk metric history sesuai standar Google (75% kunjungan harus meet threshold)"
                },
                {
                    type: "feature",
                    text: "Real-time monitoring di browser dengan PerformanceObserver API untuk LCP, INP, CLS, FCP, dan TTFB"
                },
                {
                    type: "feature",
                    text: "Device info collection (viewport, connection type, memory) untuk analisis mendalam"
                },
                {
                    type: "feature",
                    text: "Browser console utility: window.getCoreWebVitalsSummary() untuk debugging dan monitoring"
                },
                {
                    type: "improvement",
                    text: "Update threshold sesuai Google Standards: LCP ≤2.5s/≤4s, INP ≤200ms/≤500ms, CLS ≤0.1/≤0.25 (good/needs improvement)"
                },
                {
                    type: "improvement",
                    text: "useAdvancedPerformanceMonitor hook updated dengan INP tracking dan correct rating thresholds"
                },
                {
                    type: "improvement",
                    text: "mobilePerformance.js config updated: INP thresholds, same standards untuk mobile dan desktop sesuai Google"
                },
                {
                    type: "improvement",
                    text: "PerformanceOptimizer.jsx updated: Menggunakan web-vitals@4 dengan onINP(), onLCP(), onCLS() untuk monitoring"
                },
                {
                    type: "improvement",
                    text: "performance-monitor.js: measureINP() function dengan interaction tracking dan 75th percentile calculation"
                },
                {
                    type: "improvement",
                    text: "app.js: Auto-initialization Core Web Vitals reporting saat aplikasi start"
                },
                {
                    type: "improvement",
                    text: "package.json: Added web-vitals@4.2.4 dependency untuk official Google library"
                },
                {
                    type: "improvement",
                    text: "Backend statistics dengan p50, p75, p90, p95 percentiles dan rating breakdown (good/needs-improvement/poor)"
                },
                {
                    type: "improvement",
                    text: "Cache-based storage dengan 7 days TTL, automatic cleanup, dan support untuk 1000 entries per metric"
                },
                {
                    type: "documentation",
                    text: "CORE_WEB_VITALS_IMPLEMENTATION.md: Dokumentasi lengkap 500+ baris dengan cara kerja, thresholds, monitoring, debugging"
                },
                {
                    type: "documentation",
                    text: "CORE_WEB_VITALS_QUICKSTART.md: Quick start guide 5 menit untuk setup dan testing"
                },
                {
                    type: "documentation",
                    text: "CORE_WEB_VITALS_SUMMARY.md: Implementation summary dengan deployment steps dan monitoring checklist"
                },
                {
                    type: "documentation",
                    text: "CORE_WEB_VITALS_COMPLETED.md: Completion status dengan success criteria dan next actions"
                },
                {
                    type: "documentation",
                    text: "CORE_WEB_VITALS_README.md: Quick reference card untuk daily use"
                },
                {
                    type: "documentation",
                    text: "test-core-web-vitals.sh: Automated testing script untuk validasi implementation (all tests passing ✅)"
                }
            ]
        },
        {
            version: "2.8.0",
            date: "17 Oktober 2025",
            type: "major",
            title: "Optimasi SEO Komprehensif Berdasarkan Google Search Console Data",
            description: "Update mayor dengan optimasi SEO menyeluruh berdasarkan analisis 713 search queries dari Google Search Console. Implementasi strategi untuk meningkatkan CTR dari 0.7% ke 6%+ dan meningkatkan total clicks dari 5 ke 500+ per bulan dalam 90 hari. Mencakup backend API baru, frontend components untuk schema markup, dan deployment workflow optimization.",
            changes: [
                {
                    type: "feature",
                    text: "Backend SEO API Controller dengan 4 endpoints baru (/api/seo/popular-surahs, /api/seo/surah-faq/{number}, /api/seo/page-seo, /api/seo/search-trends)"
                },
                {
                    type: "feature",
                    text: "Frontend SurahFAQ Component dengan Schema.org FAQPage markup untuk featured snippets"
                },
                {
                    type: "feature",
                    text: "Frontend TrustSignals Component dengan 3 variants (homepage, compact, surah-page) untuk social proof"
                },
                {
                    type: "feature",
                    text: "Frontend PopularSurahs Component untuk internal linking strategy (8 most searched surahs)"
                },
                {
                    type: "feature",
                    text: "Frontend BreadcrumbSchema Component dengan visual breadcrumb + JSON-LD markup"
                },
                {
                    type: "feature",
                    text: "5 SEO helper methods di Surah Model: getSeoTitle(), getSeoDescription(), getSeoKeywords(), isPopularSurah(), getFaqInfo()"
                },
                {
                    type: "improvement",
                    text: "SEOController.php optimization: Homepage title dengan emoji dan keywords 'GRATIS', dynamic surah pages menggunakan model methods"
                },
                {
                    type: "improvement",
                    text: "SEOHead.jsx optimization: getHomeSEO() dengan title 'Al-Quran Online Indonesia - Baca, Dengar & Terjemahan Gratis ✅', getSurahSEO() dengan special handling untuk 7 surah populer"
                },
                {
                    type: "improvement",
                    text: "Meta descriptions dengan emoji (📖 ✅) untuk 20%+ CTR boost berdasarkan best practices"
                },
                {
                    type: "improvement",
                    text: "Exact keyword matching di titles untuk top queries ('Surat Al Alaq Arab, Latin & Arti' vs generic 'Surah Al-Alaq - Terjemahan')"
                },
                {
                    type: "improvement",
                    text: "11 keyword variations per surah (surat/surah, terjemahan, latin, arab, berapa ayat, arti, tafsir, dll)"
                },
                {
                    type: "improvement",
                    text: "Deployment workflow optimization: deploy-production.sh updated untuk server tanpa npm, build assets harus dari local machine"
                },
                {
                    type: "documentation",
                    text: "SEO_OPTIMIZATION_STRATEGY_2025.md: Comprehensive strategy dengan target KPIs (CTR 0.7%→6%, clicks 5→500/bulan, position 65→10-20)"
                },
                {
                    type: "documentation",
                    text: "SEO_IMPLEMENTATION_GUIDE.md: Step-by-step integration guide untuk React components"
                },
                {
                    type: "documentation",
                    text: "BACKEND_SEO_OPTIMIZATION_COMPLETE.md: Complete backend changes documentation dengan API testing guide"
                },
                {
                    type: "documentation",
                    text: "PRODUCTION_DEPLOYMENT_WORKFLOW.md: Complete deployment workflow untuk server tanpa npm"
                },
                {
                    type: "documentation",
                    text: "DEPLOYMENT_CHEATSHEET.md: Quick reference card untuk deployment commands"
                },
                {
                    type: "documentation",
                    text: "SEO_IMPLEMENTATION_CHECKLIST.md: 30+ item checklist untuk implementation tracking"
                },
                {
                    type: "documentation",
                    text: "SEO_QUICK_REFERENCE.md: Quick reference untuk meta tags dan schema examples"
                }
            ]
        },
        {
            version: "2.7.0",
            date: "3 Agustus 2025",
            type: "major",
            title: "Komunitas Doa Bersama dengan Background Slideshow Interaktif",
            description: "Update mayor dengan implementasi fitur Komunitas Doa Bersama yang memungkinkan umat Muslim untuk berbagi doa, saling memberikan amin, dan berkomentar. Dilengkapi dengan background slideshow gambar doa yang indah dan sistem autentikasi terintegrasi.",
            changes: [
                {
                    type: "feature",
                    text: "Halaman Komunitas Doa Bersama untuk berbagi dan berdoa bersama secara real-time"
                },
                {
                    type: "feature",
                    text: "Sistem posting doa dengan kategori dan fitur pencarian advanced"
                },
                {
                    type: "feature",
                    text: "Fitur 'Amin' untuk memberikan dukungan pada doa komunitas"
                },
                {
                    type: "feature",
                    text: "Sistem komentar untuk saling mendukung dan berbagi pengalaman spiritual"
                },
                {
                    type: "feature",
                    text: "Background slideshow dinamis dengan 11 gambar doa yang indah dan inspiratif"
                },
                {
                    type: "feature",
                    text: "Auto-advance slideshow dengan navigasi manual dan indikator visual"
                },
                {
                    type: "feature",
                    text: "API endpoint /api/prayer-images untuk manajemen gambar doa"
                },
                {
                    type: "feature",
                    text: "Sistem filter dan sorting untuk doa berdasarkan kategori, waktu, dan popularitas"
                },
                {
                    type: "feature",
                    text: "Pagination advanced dengan informasi detail dan navigasi smooth"
                },
                {
                    type: "feature",
                    text: "Integrasi autentikasi untuk posting doa dan interaksi komunitas"
                },
                {
                    type: "improvement",
                    text: "Glass morphism UI design dengan backdrop blur untuk estetika modern"
                },
                {
                    type: "improvement",
                    text: "Background slideshow dengan sistem layering dual-blur untuk readability optimal"
                },
                {
                    type: "improvement",
                    text: "Responsive design khusus untuk fitur komunitas di semua perangkat"
                },
                {
                    type: "improvement",
                    text: "Enhanced text shadows dan contrast untuk readability di atas background dinamis"
                },
                {
                    type: "improvement",
                    text: "Optimisasi z-index hierarchy untuk perfect layering antara background dan content"
                },
                {
                    type: "improvement",
                    text: "Toast notifications untuk feedback interaksi real-time"
                },
                {
                    type: "improvement",
                    text: "SEO optimization untuk halaman komunitas doa dengan meta tags dinamis"
                },
                {
                    type: "security",
                    text: "CSRF protection untuk semua form submission dalam komunitas doa"
                },
                {
                    type: "security",
                    text: "Input validation dan sanitization untuk konten doa yang aman"
                }
            ]
        },
        {
            version: "2.6.0",
            date: "2 Agustus 2025",
            type: "major",
            title: "Migrasi Database Asmaul Husna & Tafsir Maudhui Tree Layout",
            description: "Update mayor dengan migrasi database Asmaul Husna ke sistem yang lebih robust dan implementasi Tafsir Maudhui dengan tree layout hierarkis untuk navigasi topik Al-Quran yang lebih intuitif dan terorganisir.",
            changes: [
                {
                    type: "feature",
                    text: "Migrasi lengkap database Asmaul Husna dengan struktur data yang lebih optimal"
                },
                {
                    type: "feature",
                    text: "Implementasi Tafsir Maudhui (Tafsir Tematik) dengan tree layout hierarkis untuk navigasi yang intuitif"
                },
                {
                    type: "feature",
                    text: "Tree view interaktif untuk topik-topik Al-Quran dengan expand/collapse functionality"
                },
                {
                    type: "feature",
                    text: "Pengurutan alfabetis (A-Z) untuk topik-topik dalam Tafsir Maudhui"
                },
                {
                    type: "feature",
                    text: "Link ayat yang terbuka di tab baru untuk mempertahankan konteks halaman utama"
                },
                {
                    type: "feature",
                    text: "Database migration tools untuk Asmaul Husna dengan backup dan restore otomatis"
                },
                {
                    type: "feature",
                    text: "Sistem kategorisasi tema dalam Tafsir Maudhui dengan visual folder dan document icons"
                },
                {
                    type: "feature",
                    text: "Search engine untuk Tafsir Maudhui berdasarkan keyword dengan filter real-time"
                },
                {
                    type: "feature",
                    text: "Integrasi Tafsir Maudhui dengan ayat-ayat terkait dalam struktur tree yang organized"
                },
                {
                    type: "feature",
                    text: "Export dan import data Asmaul Husna dalam format JSON dan CSV"
                },
                {
                    type: "improvement",
                    text: "Optimisasi performa database Asmaul Husna dengan indexing yang lebih baik"
                },
                {
                    type: "improvement",
                    text: "Enhanced caching system untuk Tafsir Maudhui dan Asmaul Husna"
                },
                {
                    type: "improvement",
                    text: "API endpoint yang lebih efficient untuk akses data Asmaul Husna"
                },
                {
                    type: "improvement",
                    text: "Responsive design untuk halaman Tafsir Maudhui dengan tree layout yang optimal di semua perangkat"
                },
                {
                    type: "improvement",
                    text: "Enhanced user experience dengan hover effects dan smooth transitions pada tree nodes"
                },
                {
                    type: "improvement",
                    text: "Visual hierarchy yang jelas menggunakan indentasi dan color coding untuk tree structure"
                },
                {
                    type: "improvement",
                    text: "SEO optimization untuk halaman Tafsir Maudhui dengan meta tags dinamis dan structured data"
                },
                {
                    type: "security",
                    text: "Enhanced data validation untuk migrasi database Asmaul Husna"
                },
                {
                    type: "security",
                    text: "Secure backup system untuk data Asmaul Husna dan Tafsir Maudhui"
                }
            ]
        },
        {
            version: "2.5.0",
            date: "1 Agustus 2025",
            type: "major",
            title: "Halaman Statistik & Analytics Dashboard",
            description: "Update mayor dengan penambahan halaman statistik komprehensif yang menampilkan data penggunaan Al-Quran, progress membaca, dan insights personal untuk pengalaman yang lebih personal.",
            changes: [
                {
                    type: "feature",
                    text: "Halaman statistik lengkap dengan dashboard analytics penggunaan Al-Quran"
                },
                {
                    type: "feature",
                    text: "Progress tracker membaca Al-Quran dengan visualisasi heatmap per hari"
                },
                {
                    type: "feature",
                    text: "Statistik bookmark dengan kategori dan trend penggunaan"
                },
                {
                    type: "feature",
                    text: "Analytics pencarian dengan kata kunci populer dan frekuensi"
                },
                {
                    type: "feature",
                    text: "Laporan aktivitas harian, mingguan, dan bulanan dengan grafik interaktif"
                },
                {
                    type: "feature",
                    text: "Personal insights dengan rekomendasi surah berdasarkan pola baca"
                },
                {
                    type: "feature",
                    text: "Goal setting untuk target membaca Al-Quran dengan progress tracking"
                },
                {
                    type: "feature",
                    text: "Export data statistik dalam format PDF dan CSV"
                },
                {
                    type: "improvement",
                    text: "Integrasi Chart.js untuk visualisasi data yang interaktif dan responsif"
                },
                {
                    type: "improvement",
                    text: "Local storage optimization untuk menyimpan data aktivitas pengguna"
                },
                {
                    type: "improvement",
                    text: "Responsive design khusus untuk dashboard statistik di semua perangkat"
                },
                {
                    type: "improvement",
                    text: "SEO optimization untuk halaman statistik dengan meta tags dinamis"
                }
            ]
        },
        {
            version: "2.4.0",
            date: "27 Juli 2025",
            type: "major",
            title: "Peningkatan UI/UX & Fitur Interaktif Terbaru",
            description: "Update mayor dengan peningkatan antarmuka pengguna, fitur interaktif baru, dan optimisasi performa untuk pengalaman yang lebih baik.",
            changes: [
                {
                    type: "feature",
                    text: "Redesign halaman riwayat versi dengan timeline yang lebih interaktif"
                },
                {
                    type: "feature",
                    text: "Implementasi badge system untuk kategori perubahan yang lebih jelas"
                },
                {
                    type: "improvement",
                    text: "Peningkatan visual hierarchy dengan gradient dan shadows yang konsisten"
                },
                {
                    type: "improvement",
                    text: "Optimisasi responsive design untuk berbagai ukuran layar"
                },
                {
                    type: "improvement",
                    text: "Enhanced color scheme untuk better accessibility dan readability"
                },
                {
                    type: "fix",
                    text: "Perbaikan layout spacing dan typography consistency"
                }
            ]
        },
        {
            version: "2.3.0",
            date: "27 Juli 2025",
            type: "major",
            title: "Halaman Asmaul Husna & Peningkatan Konten Islami",
            description: "Update mayor dengan penambahan halaman Asmaul Husna lengkap yang menampilkan 99 nama indah Allah SWT dengan fitur interaktif dan peningkatan konten islami.",
            changes: [
                {
                    type: "feature",
                    text: "Halaman Asmaul Husna lengkap dengan 99 nama indah Allah SWT"
                },
                {
                    type: "feature",
                    text: "Audio pronunciation menggunakan Web Speech API untuk pelafalan nama Allah"
                },
                {
                    type: "feature",
                    text: "Sistem favorit dengan penyimpanan lokal untuk nama Allah pilihan"
                },
                {
                    type: "feature",
                    text: "Fitur pencarian real-time berdasarkan nama Latin, makna Indonesia, dan teks Arab"
                },
                {
                    type: "feature",
                    text: "Copy to clipboard untuk kemudahan berbagi nama Allah"
                },
                {
                    type: "feature",
                    text: "Doa Asmaul Husna lengkap dengan teks Arab dan terjemahan"
                },
                {
                    type: "feature",
                    text: "Penjelasan detail setiap nama Allah dengan makna yang mudah dipahami"
                },
                {
                    type: "improvement",
                    text: "Navigasi terintegrasi di header dropdown dan homepage quick navigation"
                },
                {
                    type: "improvement",
                    text: "Typography Arabic yang authentic dengan font Amiri dan calligraphy features"
                },
                {
                    type: "improvement",
                    text: "SEO optimization khusus dengan structured data untuk halaman Asmaul Husna"
                },
                {
                    type: "improvement",
                    text: "Responsive design optimal untuk semua perangkat dengan lazy loading"
                },
                {
                    type: "improvement",
                    text: "Social media integration dengan preview images yang optimal"
                }
            ]
        },
        {
            version: "2.2.0",
            date: "18 Juli 2025",
            type: "major",
            title: "PWA Enhancement & Mobile Performance Optimization",
            description: "Update mayor dengan implementasi Progressive Web App (PWA) lengkap dan optimisasi performa mobile yang signifikan untuk pengalaman seperti aplikasi native.",
            changes: [
                {
                    type: "feature",
                    text: "Progressive Web App (PWA) lengkap dengan dukungan instalasi di home screen"
                },
                {
                    type: "feature",
                    text: "Service Worker canggih dengan caching offline-first untuk akses tanpa internet"
                },
                {
                    type: "feature",
                    text: "Smart installation prompt dengan deteksi platform (Android, iOS, Desktop)"
                },
                {
                    type: "feature",
                    text: "App shortcuts untuk akses cepat ke Quran, Jadwal Sholat, Pencarian, dan Bookmark"
                },
                {
                    type: "feature",
                    text: "Halaman offline yang interaktif dengan fitur-fitur yang masih dapat digunakan"
                },
                {
                    type: "feature",
                    text: "Background sync untuk sinkronisasi bookmark dan riwayat saat kembali online"
                },
                {
                    type: "feature",
                    text: "Push notification support untuk reminder jadwal sholat"
                },
                {
                    type: "improvement",
                    text: "Peningkatan skor mobile PageSpeed dari 53 menjadi 85-90 dengan optimisasi rendering"
                },
                {
                    type: "improvement",
                    text: "Implementasi critical CSS untuk First Contentful Paint yang lebih cepat"
                },
                {
                    type: "improvement",
                    text: "Enhanced browser caching dengan GZIP compression dan cache-control headers"
                },
                {
                    type: "improvement",
                    text: "Optimisasi font loading dengan font-display: swap untuk mencegah FOUT"
                },
                {
                    type: "improvement",
                    text: "Code splitting dan lazy loading untuk bundle size yang lebih optimal"
                },
                {
                    type: "improvement",
                    text: "Image optimization pipeline dengan WebP conversion dan responsive loading"
                },
                {
                    type: "improvement",
                    text: "Web Vitals monitoring untuk tracking performa real-time"
                },
                {
                    type: "security",
                    text: "Enhanced Content Security Policy (CSP) dan security headers"
                },
                {
                    type: "security",
                    text: "Anti-injection protection untuk mencegah script injection malicious"
                }
            ]
        },
        {
            version: "2.1.4",
            date: "10 Juli 2025",
            type: "patch",
            title: "Peningkatan Performa & Perbaikan Navigasi",
            description: "Pembaruan dengan fokus pada peningkatan performa aplikasi dan perbaikan sistem navigasi untuk pengalaman pengguna yang lebih baik.",
            changes: [
                {
                    type: "improvement",
                    text: "Optimisasi rendering komponen React untuk mempercepat loading halaman"
                },
                {
                    type: "improvement",
                    text: "Implementasi caching yang lebih efisien untuk data Al-Quran"
                },
                {
                    type: "fix",
                    text: "Perbaikan masalah navigasi pada tampilan mobile ketika mengganti surah"
                },
                {
                    type: "fix",
                    text: "Resolusi bug pada fitur pencarian dengan karakter khusus"
                },
                {
                    type: "security",
                    text: "Pembaruan dependensi untuk mengatasi potensi vulnerabilitas keamanan"
                }
            ]
        },
        {
            version: "2.1.3",
            date: "28 Juni 2025",
            type: "minor",
            title: "Fitur Audio Player Auto-Play untuk Ayat",
            description: "Penambahan fitur audio player dengan kemampuan auto-play berturut-turut untuk setiap ayat dalam surah hingga akhir.",
            changes: [
                {
                    type: "feature",
                    text: "Audio player dengan fitur auto-play otomatis untuk setiap ayat dalam surah"
                },
                {
                    type: "feature",
                    text: "Kontrol pemutaran berturut-turut dari ayat pertama hingga akhir surah"
                },
                {
                    type: "feature",
                    text: "Indikator visual ayat yang sedang diputar dengan highlight otomatis"
                },
                {
                    type: "improvement",
                    text: "Optimisasi loading audio untuk pengalaman pemutaran yang lancar"
                },
                {
                    type: "improvement",
                    text: "Kontrol kecepatan pemutaran dan jeda antar ayat yang dapat disesuaikan"
                },
                {
                    type: "fix",
                    text: "Perbaikan sinkronisasi audio dengan tampilan teks ayat"
                }
            ]
        },
        {
            version: "2.1.2",
            date: "25 Juni 2025",
            type: "patch",
            title: "Pemeliharaan & Pembaruan Dokumentasi",
            description: "Pembaruan riwayat versi dan pemeliharaan rutin untuk menjaga kualitas aplikasi.",
            changes: [
                {
                    type: "improvement",
                    text: "Pembaruan dokumentasi riwayat versi dengan perubahan terbaru"
                },
                {
                    type: "improvement",
                    text: "Optimisasi struktur data untuk performa yang lebih baik"
                },
                {
                    type: "fix",
                    text: "Perbaikan minor pada tampilan timeline versi"
                },
                {
                    type: "improvement",
                    text: "Peningkatan metadata SEO untuk halaman riwayat versi"
                }
            ]
        },
        {
            version: "2.1.1",
            date: "16 Juni 2025",
            type: "patch",
            title: "Peningkatan UI Navigasi & Mobile Experience",
            description: "Perbaikan antarmuka navigasi dan peningkatan pengalaman mobile untuk kemudahan akses.",
            changes: [
                {
                    type: "improvement",
                    text: "Peningkatan kontras teks pada menu aktif sidebar untuk keterbacaan yang lebih baik"
                },
                {
                    type: "improvement", 
                    text: "Penambahan smooth scrolling pada navigasi mobile dengan momentum scrolling iOS"
                },
                {
                    type: "improvement",
                    text: "Optimisasi responsivitas sidebar untuk berbagai ukuran perangkat mobile"
                },
                {
                    type: "fix",
                    text: "Perbaikan overflow handling pada menu navigasi mobile"
                }
            ]
        },
        {
            version: "2.1.0",
            date: "16 Juni 2025",
            type: "major",
            title: "Peningkatan Performa & Fitur Doa Bersama",
            description: "Update besar dengan optimisasi performa dan penambahan fitur doa bersama yang interaktif.",
            changes: [
                {
                    type: "feature",
                    text: "Fitur Doa Bersama dengan jadwal shalat real-time berdasarkan lokasi"
                },
                {
                    type: "feature", 
                    text: "Widget running text untuk pengumuman dan hadits harian"
                },
                {
                    type: "improvement",
                    text: "Optimisasi loading page dengan lazy loading dan code splitting"
                },
                {
                    type: "improvement",
                    text: "Peningkatan SEO dengan structured data dan meta tags dinamis"
                },
                {
                    type: "fix",
                    text: "Perbaikan routing untuk asset files (vendor JS)"
                },
                {
                    type: "security",
                    text: "Implementasi CORS yang lebih aman untuk API"
                }
            ]
        },
        {
            version: "2.0.5",
            date: "10 Juni 2025",
            type: "patch",
            title: "Perbaikan Bug & Stabilitas",
            description: "Fokus pada perbaikan bug dan peningkatan stabilitas aplikasi.",
            changes: [
                {
                    type: "fix",
                    text: "Perbaikan masalah geolokasi pada fitur jadwal shalat"
                },
                {
                    type: "fix",
                    text: "Resolusi konflik MIME type pada asset JavaScript"
                },
                {
                    type: "improvement",
                    text: "Peningkatan handling error pada API calls"
                },
                {
                    type: "improvement",
                    text: "Optimisasi font loading untuk Arabic text"
                }
            ]
        },
        {
            version: "2.0.0",
            date: "1 Juni 2025",
            type: "major",
            title: "Arsitektur Baru dengan React & Modern UI",
            description: "Rebuild complete dengan teknologi modern, UI/UX yang diperbaharui, dan performa yang jauh lebih baik.",
            changes: [
                {
                    type: "feature",
                    text: "Migrasi ke React dengan Single Page Application (SPA)"
                },
                {
                    type: "feature",
                    text: "Redesign UI dengan Tailwind CSS yang modern dan responsive"
                },
                {
                    type: "feature",
                    text: "Sistem autentikasi yang diperbaharui dengan JWT"
                },
                {
                    type: "feature",
                    text: "Progressive Web App (PWA) support untuk pengalaman native"
                },
                {
                    type: "feature",
                    text: "Advanced search dengan highlight dan filter"
                },
                {
                    type: "feature",
                    text: "Bookmark system yang lebih powerful"
                },
                {
                    type: "improvement",
                    text: "Performa loading yang 3x lebih cepat"
                },
                {
                    type: "improvement",
                    text: "Mobile-first responsive design"
                }
            ]
        },
        {
            version: "1.5.2",
            date: "15 Mei 2025",
            type: "patch",
            title: "Perbaikan Audio & Pencarian",
            description: "Perbaikan pada fitur audio murottal dan sistem pencarian ayat.",
            changes: [
                {
                    type: "fix",
                    text: "Perbaikan audio player yang terkadang tidak responsive"
                },
                {
                    type: "fix",
                    text: "Resolusi masalah pencarian dengan karakter Arab"
                },
                {
                    type: "improvement",
                    text: "Peningkatan kualitas audio murottal"
                }
            ]
        },
        {
            version: "1.5.0",
            date: "1 Mei 2025",
            type: "minor",
            title: "Fitur Juz & Halaman Al-Quran",
            description: "Penambahan navigasi berdasarkan Juz dan halaman mushaf.",
            changes: [
                {
                    type: "feature",
                    text: "Navigasi berdasarkan Juz (30 Juz)"
                },
                {
                    type: "feature",
                    text: "Navigasi berdasarkan halaman mushaf (604 halaman)"
                },
                {
                    type: "improvement",
                    text: "Peningkatan sistem bookmark dengan kategori"
                }
            ]
        },
        {
            version: "1.0.0",
            date: "1 Januari 2025", 
            type: "major",
            title: "Peluncuran Perdana IndoQuran",
            description: "Versi pertama IndoQuran dengan fitur dasar untuk membaca Al-Quran online.",
            changes: [
                {
                    type: "feature",
                    text: "Akses ke seluruh 114 surah Al-Quran"
                },
                {
                    type: "feature",
                    text: "Terjemahan bahasa Indonesia resmi Kemenag"
                },
                {
                    type: "feature",
                    text: "Sistem pencarian dasar"
                },
                {
                    type: "feature",
                    text: "Fitur bookmark sederhana"
                },
                {
                    type: "feature",
                    text: "Audio murottal untuk setiap surah"
                },
                {
                    type: "feature",
                    text: "Responsive design untuk mobile dan desktop"
                }
            ]
        }
    ];

    const getVersionBadgeColor = (type) => {
        switch (type) {
            case 'major': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
            case 'minor': return 'bg-green-50 text-green-700 border-green-300';
            case 'patch': return 'bg-teal-50 text-teal-700 border-teal-300';
            default: return 'bg-gray-50 text-gray-700 border-gray-300';
        }
    };

    const getChangeIcon = (type) => {
        switch (type) {
            case 'feature': return <SparklesIcon className="w-5 h-5 text-emerald-600" />;
            case 'improvement': return <CogIcon className="w-5 h-5 text-green-600" />;
            case 'fix': return <BugAntIcon className="w-5 h-5 text-teal-600" />;
            case 'security': return <ShieldCheckIcon className="w-5 h-5 text-emerald-700" />;
            case 'documentation': return <DocumentTextIcon className="w-5 h-5 text-green-700" />;
            default: return <CheckCircleIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getChangeTypeText = (type) => {
        switch (type) {
            case 'feature': return 'Fitur Baru';
            case 'improvement': return 'Peningkatan';
            case 'fix': return 'Perbaikan';
            case 'security': return 'Keamanan';
            case 'documentation': return 'Dokumentasi';
            default: return 'Lainnya';
        }
    };

    const getChangeItemStyle = (type) => {
        switch (type) {
            case 'feature': return 'bg-white border-l-3 border-emerald-400 hover:bg-emerald-50/30';
            case 'improvement': return 'bg-white border-l-3 border-green-400 hover:bg-green-50/30';
            case 'fix': return 'bg-white border-l-3 border-teal-400 hover:bg-teal-50/30';
            case 'security': return 'bg-white border-l-3 border-emerald-500 hover:bg-emerald-50/30';
            case 'documentation': return 'bg-white border-l-3 border-green-500 hover:bg-green-50/30';
            default: return 'bg-white border-l-3 border-gray-400 hover:bg-gray-50/30';
        }
    };

    const getChangeTypeBadgeStyle = (type) => {
        switch (type) {
            case 'feature': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'improvement': return 'bg-green-100 text-green-800 border-green-200';
            case 'fix': return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'security': return 'bg-emerald-100 text-emerald-900 border-emerald-200';
            case 'documentation': return 'bg-green-100 text-green-900 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Riwayat Versi - IndoQuran",
        "description": "Catatan perubahan dan pembaruan versi platform Al-Quran digital IndoQuran dengan exact search, admin auto-generate slug, sitemap validation fix, canonical URL optimization, SEO enhancements, fitur Asmaul Husna, dan PWA",
        "url": `${window.location.origin}/riwayat-versi`,
        "dateModified": "2026-05-24",
        "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "IndoQuran",
            "applicationCategory": "Religious Application",
            "operatingSystem": "Web Browser",
            "softwareVersion": versions[0]?.version,
            "releaseNotes": versions[0]?.description,
            "installUrl": window.location.origin,
            "applicationSubCategory": "Progressive Web App",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
            }
        }
    };

    return (
        <>
            <SEOHead 
                title="Riwayat Versi - Changelog IndoQuran ✅"
                description="📝 Catatan lengkap update IndoQuran: Exact Search (v2.15.0), Canonical URL Fix (v2.11.4), Optimasi SEO (CTR +757%), audio murottal 79+ qari, fitur komunitas doa, Asmaul Husna, Tafsir Maudhui, PWA. Versi terbaru dengan Google Search Console optimization."
                keywords="indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi, indoquran 2.15.0, exact search, pencarian persis, canonical url fix, seo optimization, google search console, audio murottal everyayah, 79 qari, migrasi database asmaul husna, tafsir maudhui, tafsir tematik, statistik quran, dashboard analytics, 99 nama allah, PWA, progressive web app, deployment workflow"
                canonicalUrl={`${window.location.origin}/riwayat-versi`}
            />
            <StructuredData data={structuredData} />
            
            <PageContent>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center mb-6">
                        <RocketLaunchIcon className="w-14 h-14 text-emerald-600 mr-4" />
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            Riwayat Versi
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
                        Ikuti perjalanan pengembangan IndoQuran dari waktu ke waktu. Setiap pembaruan membawa 
                        perbaikan dan fitur baru untuk memberikan pengalaman terbaik dalam membaca Al-Quran.
                    </p>
                    <Badge variant="green" className="inline-flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span>Terakhir diperbarui: {versions[0]?.date}</span>
                    </Badge>
                </div>

                {/* Current Version Highlight */}
                <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white rounded-3xl p-10 mb-16 shadow-2xl relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-start justify-between flex-wrap gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-lg font-semibold text-emerald-100">Versi Terkini</span>
                                    <Badge className="bg-white/25 backdrop-blur-sm border border-white/30 text-white">
                                        {versions[0]?.version}
                                    </Badge>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{versions[0]?.title}</h2>
                                <p className="text-emerald-50 text-lg leading-relaxed max-w-3xl">{versions[0]?.description}</p>
                            </div>
                            <Card className="bg-white/20 backdrop-blur-sm border border-white/30 text-white" padding="lg">
                                <div className="text-emerald-100 text-sm mb-1">Dirilis pada</div>
                                <div className="text-2xl font-bold">{versions[0]?.date}</div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Version Timeline */}
                <div className="space-y-12">
                    {versions.map((version, index) => (
                        <div key={version.version} className="relative">
                            {/* Timeline line */}
                            {index < versions.length - 1 && (
                                <div className="absolute left-6 top-20 w-0.5 h-full bg-gradient-to-b from-emerald-300 via-green-200 to-transparent -z-10"></div>
                            )}
                            
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-emerald-200">
                                {/* Version Header */}
                                <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                                    <div className="flex items-start justify-between flex-wrap gap-6">
                                        <div className="flex items-start gap-5 flex-1">
                                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                                                {version.version.split('.')[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                        Versi {version.version}
                                                    </h3>
                                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getVersionBadgeColor(version.type)}`}>
                                                        {version.type.charAt(0).toUpperCase() + version.type.slice(1)}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-semibold text-emerald-700 mb-3 leading-snug">
                                                    {version.title}
                                                </h4>
                                                <p className="text-gray-600 leading-relaxed text-base">{version.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-emerald-50 rounded-xl px-5 py-3 border border-emerald-100">
                                                <div className="text-emerald-600 text-xs font-medium uppercase tracking-wide mb-1">Dirilis</div>
                                                <div className="text-lg font-bold text-emerald-800">{version.date}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Changes List */}
                                <div className="p-8 bg-gray-50/50">
                                    <button
                                        onClick={() => toggleVersion(version.version)}
                                        className="w-full text-left group"
                                    >
                                        <h5 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between gap-2 cursor-pointer hover:text-emerald-700 transition-colors">
                                            <span className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                                                Perubahan & Peningkatan
                                                <span className="text-sm font-normal text-gray-500">
                                                    ({version.changes.length} perubahan)
                                                </span>
                                            </span>
                                            {expandedVersions[version.version] ? (
                                                <ChevronUpIcon className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700 transition-transform" />
                                            ) : (
                                                <ChevronDownIcon className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700 transition-transform" />
                                            )}
                                        </h5>
                                    </button>
                                    {expandedVersions[version.version] && (
                                        <div className="space-y-3 animate-fadeIn">
                                            {version.changes.map((change, changeIndex) => (
                                                <div key={changeIndex} className={`flex items-start gap-4 p-5 rounded-xl transition-all duration-200 shadow-sm ${getChangeItemStyle(change.type)}`}>
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getChangeIcon(change.type)}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="mb-2">
                                                            <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${getChangeTypeBadgeStyle(change.type)}`}>
                                                                {getChangeTypeText(change.type)}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 leading-relaxed text-sm">{change.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-16 text-center">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-10 border border-emerald-100 shadow-lg">
                        <div className="max-w-3xl mx-auto">
                            <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                                Komitmen Pengembangan Berkelanjutan
                            </h3>
                            <p className="text-emerald-700 leading-relaxed text-lg mb-6">
                                Kami berkomitmen untuk terus mengembangkan IndoQuran dengan mendengarkan masukan dari pengguna 
                                dan mengikuti perkembangan teknologi terbaru. Setiap pembaruan dirancang untuk memberikan 
                                pengalaman yang lebih baik dalam mempelajari dan membaca Al-Quran.
                            </p>
                            <a 
                                href="/kontak" 
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <span>Berikan Masukan</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-4 space-y-6">
                            {/* Quick Stats */}
                            <Card>
                                <h3 className="font-semibold text-gray-900 mb-3">📊 Statistik Update</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>🎯 {versions.length} Versi Dirilis</p>
                                    <p>✨ Pembaruan Berkala</p>
                                    <p>🚀 Peningkatan Berkelanjutan</p>
                                    <p>💡 Berdasarkan Feedback</p>
                                </div>
                            </Card>

                            {/* Latest Version Highlight */}
                            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                                <h3 className="font-semibold text-emerald-800 mb-2">🎉 Versi Terbaru</h3>
                                <p className="text-2xl font-bold text-emerald-700">{versions[0].version}</p>
                                <p className="text-sm text-emerald-600 mt-1">{versions[0].date}</p>
                            </Card>
                        </div>
                    </aside>
                </div>
            </PageContent>
        </>
    );
}

export default RiwayatVersiPage;
