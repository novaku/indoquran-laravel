<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NotificationController extends Controller
{
    /**
     * Get website news, feature updates, and community notifications
     */
    public function index()
    {
        $notifications = [
            [
                'id' => 'notif-hadits-11-kitab',
                'title' => 'Fitur Baru: Koleksi 11 Kitab Hadits Nabawi',
                'message' => 'Telah hadir lebih dari 64.000 hadits dari 11 kitab mu\'tamad (Shahih Bukhari, Muslim, Abu Daud, Tirmidzi, dll.) lengkap dengan teks Arab & terjemahan.',
                'link' => '/hadits',
                'time_ago' => 'Baru saja',
                'timestamp' => '2026-09-29T15:00:00Z',
                'category' => 'Fitur Baru',
                'type' => 'feature',
                'badge_icon' => 'book',
                'badge_color' => 'bg-emerald-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new',
                'is_featured' => true
            ],
            [
                'id' => 'notif-audio-arabic-speech',
                'title' => 'Audio Pelafalan Arab di Browser',
                'message' => 'Dengarkan suara pelafalan teks Arab seketika pada Hadits & Doa Bersama langsung di browser Anda menggunakan Web Speech API tanpa konsumsi kuota server.',
                'link' => '/hadits',
                'time_ago' => '1 jam lalu',
                'timestamp' => '2026-09-29T14:00:00Z',
                'category' => 'Audio Player',
                'type' => 'audio',
                'badge_icon' => 'speaker',
                'badge_color' => 'bg-blue-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new',
                'is_featured' => true
            ],
            [
                'id' => 'notif-doa-bersama-audio',
                'title' => 'Doa Bersama Dilengkapi Tombol Audio',
                'message' => 'Setiap doa harian dan dzikir kini dapat diputar audio pelafalannya dengan tombol play instan untuk mempermudah menghafal dan bertilawah.',
                'link' => '/doa-bersama',
                'time_ago' => '3 jam lalu',
                'timestamp' => '2026-09-29T12:00:00Z',
                'category' => 'Doa & Dzikir',
                'type' => 'prayer',
                'badge_icon' => 'prayer',
                'badge_color' => 'bg-rose-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new'
            ],
            [
                'id' => 'notif-khatam-tracker-30juz',
                'title' => 'Rencanakan Target Khatam 30 Juz',
                'message' => 'Gunakan fitur Khatam Tracker di halaman Penanda untuk mencatat progres membaca harian Anda menuju khatam Al-Quran.',
                'link' => '/penanda',
                'time_ago' => '1 hari lalu',
                'timestamp' => '2026-09-28T09:00:00Z',
                'category' => 'Tilawah',
                'type' => 'tracker',
                'badge_icon' => 'target',
                'badge_color' => 'bg-purple-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'earlier'
            ],
            [
                'id' => 'notif-tafsir-maudhui-update',
                'title' => 'Kajian Tematik Tafsir Maudhu\'i',
                'message' => 'Temukan himpunan ayat per topik kehidupan (Ketenangan Hati, Rezeki, Keluarga Sakinah, Birrul Walidain) dengan mudah.',
                'link' => '/tafsir-maudhui',
                'time_ago' => '2 hari lalu',
                'timestamp' => '2026-09-27T10:00:00Z',
                'category' => 'Tafsir Al-Quran',
                'type' => 'tafsir',
                'badge_icon' => 'sparkles',
                'badge_color' => 'bg-amber-500',
                'image' => '/images/logo-icon.webp',
                'section' => 'earlier'
            ],
            [
                'id' => 'notif-pwa-mobile-install',
                'title' => 'Install IndoQuran di Layar HP',
                'message' => 'Aplikasi IndoQuran mendukung Progressive Web App (PWA). Tambahkan ke layar utama smartphone untuk akses cepat dan bacaan offline.',
                'link' => '/riwayat-versi',
                'time_ago' => '4 hari lalu',
                'timestamp' => '2026-09-25T11:00:00Z',
                'category' => 'Aplikasi Web',
                'type' => 'system',
                'badge_icon' => 'mobile',
                'badge_color' => 'bg-emerald-500',
                'image' => '/images/logo-icon.webp',
                'section' => 'earlier'
            ],
            [
                'id' => 'notif-version-2-30-0',
                'title' => 'Pembaruan IndoQuran Versi 2.30.0',
                'message' => 'Koleksi 11 Kitab Hadits Nabawi (64rb+ hadits), audio Web Speech Arab instan, notifikasi website, dan pembaruan PWA v2.30.0.',
                'link' => '/riwayat-versi',
                'time_ago' => 'Baru saja',
                'timestamp' => '2026-09-29T15:30:00Z',
                'category' => 'Riwayat Versi',
                'type' => 'version',
                'badge_icon' => 'check',
                'badge_color' => 'bg-teal-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'earlier'
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
            'total' => count($notifications)
        ]);
    }
}
