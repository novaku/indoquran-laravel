<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get website news, feature updates, and community notifications for visitors
     */
    public function index()
    {
        try {
            $notifications = Notification::active()
                ->ordered()
                ->get()
                ->map(fn(Notification $item) => $item->toResponseArray())
                ->values()
                ->all();

            if (!empty($notifications)) {
                return response()->json([
                    'status' => 'success',
                    'data' => $notifications,
                    'total' => count($notifications),
                    'source' => 'database'
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to fetch notifications from database, falling back to static list: ' . $e->getMessage());
        }

        // Fallback default notifications if table empty or during maintenance
        $fallback = $this->getDefaultNotifications();

        return response()->json([
            'status' => 'success',
            'data' => $fallback,
            'total' => count($fallback),
            'source' => 'fallback'
        ]);
    }

    /**
     * Admin: List all notifications with management details
     */
    public function adminIndex(Request $request)
    {
        $query = Notification::query()->orderBy('sort_order', 'asc')->orderByDesc('published_at')->orderByDesc('id');

        if ($request->filled('section')) {
            $query->where('section', $request->input('section'));
        }

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('identifier', 'like', "%{$search}%");
            });
        }

        $notifications = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ]
        ]);
    }

    /**
     * Admin: Store a newly created notification
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'identifier' => 'nullable|string|max:100|unique:notifications,identifier',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'link' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:50',
            'badge_icon' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:50',
            'image' => 'nullable|string|max:255',
            'section' => 'nullable|string|in:new,earlier',
            'time_ago' => 'nullable|string|max:50',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'published_at' => 'nullable|date',
        ]);

        if (empty($validated['identifier'])) {
            $validated['identifier'] = 'notif-' . uniqid();
        }

        if (empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $notification = Notification::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Notifikasi berhasil ditambahkan',
            'data' => $notification
        ], 201);
    }

    /**
     * Admin: Update an existing notification
     */
    public function update(Request $request, $id)
    {
        $notification = Notification::findOrFail($id);

        $validated = $request->validate([
            'identifier' => 'nullable|string|max:100|unique:notifications,identifier,' . $notification->id,
            'title' => 'sometimes|required|string|max:255',
            'message' => 'sometimes|required|string',
            'link' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:50',
            'badge_icon' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:50',
            'image' => 'nullable|string|max:255',
            'section' => 'nullable|string|in:new,earlier',
            'time_ago' => 'nullable|string|max:50',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'published_at' => 'nullable|date',
        ]);

        $notification->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Notifikasi berhasil diperbarui',
            'data' => $notification
        ]);
    }

    /**
     * Admin: Delete a notification
     */
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Notifikasi berhasil dihapus'
        ]);
    }

    /**
     * Admin: Toggle active status
     */
    public function toggleActive($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->is_active = !$notification->is_active;
        $notification->save();

        return response()->json([
            'status' => 'success',
            'message' => $notification->is_active ? 'Notifikasi diaktifkan' : 'Notifikasi dinonaktifkan',
            'data' => $notification
        ]);
    }

    /**
     * Fallback notifications list if database connection is unavailable
     */
    private function getDefaultNotifications(): array
    {
        return [
            [
                'id' => 'notif-hadits-kategori-filter',
                'title' => 'Fitur Baru: Filter Kategori & Bab Hadits',
                'message' => 'Pilih dan telusuri hadits berdasarkan tema/bab (Iman, Shalat, Zakat, Puasa, Nikah, dll.) dengan katalog topik cepat di Hadits Reader & Hadits Hub.',
                'link' => '/hadits',
                'time_ago' => 'Baru saja',
                'timestamp' => '2026-10-05T09:30:00Z',
                'category' => 'Fitur Baru',
                'type' => 'feature',
                'badge_icon' => 'book',
                'badge_color' => 'bg-emerald-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new',
                'is_featured' => true
            ],
            [
                'id' => 'notif-seo-rich-snippets',
                'title' => 'Optimasi SEO & Google Rich Snippets',
                'message' => 'Pencarian ayat & juz makin mudah di Google dengan skema FAQPage tanya-jawab, breadcrumb terstruktur, dan navigasi langsung per nomor ayat.',
                'link' => '/surah',
                'time_ago' => '30 menit lalu',
                'timestamp' => '2026-10-05T09:00:00Z',
                'category' => 'SEO & Schema',
                'type' => 'feature',
                'badge_icon' => 'sparkles',
                'badge_color' => 'bg-blue-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new',
                'is_featured' => true
            ],
            [
                'id' => 'notif-penanda-hadits-baru',
                'title' => 'Penanda Hadits Nabawi Kini Tersedia',
                'message' => 'Kini Anda dapat menandai hadits pilihan, menyimpan hadits favorit, dan menuliskan catatan tadabbur & faidah hadits di halaman Penanda.',
                'link' => '/penanda?type=hadits',
                'time_ago' => '1 jam lalu',
                'timestamp' => '2026-10-05T08:00:00Z',
                'category' => 'Fitur Baru',
                'type' => 'bookmark',
                'badge_icon' => 'bookmark',
                'badge_color' => 'bg-amber-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new',
                'is_featured' => false
            ],
            [
                'id' => 'notif-hadits-7-kitab',
                'title' => 'Koleksi 7 Kitab Hadits Mu\'tamad & Syarah',
                'message' => 'Telah hadir 33.137 hadits dari 7 kitab mu\'tamad (Shahih Bukhari, Muslim, Abu Daud, Tirmidzi, An-Nasa\'i, Ibnu Majah, Musnad Ahmad) dengan teks Arab terstandarisasi & penjelasan syarah.',
                'link' => '/hadits',
                'time_ago' => '2 jam lalu',
                'timestamp' => '2026-10-05T07:00:00Z',
                'category' => 'Hadits Nabawi',
                'type' => 'feature',
                'badge_icon' => 'book',
                'badge_color' => 'bg-teal-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new',
                'is_featured' => false
            ],
            [
                'id' => 'notif-version-2-32-0',
                'title' => 'Pembaruan IndoQuran Versi 2.32.0',
                'message' => 'Filter kategori hadits, Google Rich Snippets komprehensif, navigasi kanonikal per nomor ayat, dedicated sitemap topik hadits, dan ketahanan cache Redis.',
                'link' => '/riwayat-versi',
                'time_ago' => 'Hari ini',
                'timestamp' => '2026-10-05T06:00:00Z',
                'category' => 'Riwayat Versi',
                'type' => 'version',
                'badge_icon' => 'check',
                'badge_color' => 'bg-indigo-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'new',
                'is_featured' => true
            ],
            [
                'id' => 'notif-audio-arabic-speech',
                'title' => 'Audio Pelafalan Arab di Browser',
                'message' => 'Dengarkan suara pelafalan teks Arab seketika pada Hadits & Doa Bersama langsung di browser Anda menggunakan Web Speech API tanpa konsumsi kuota server.',
                'link' => '/hadits',
                'time_ago' => 'Kemarin',
                'timestamp' => '2026-10-04T14:00:00Z',
                'category' => 'Audio Player',
                'type' => 'audio',
                'badge_icon' => 'speaker',
                'badge_color' => 'bg-blue-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'earlier'
            ],
            [
                'id' => 'notif-doa-bersama-audio',
                'title' => 'Doa Bersama Dilengkapi Tombol Audio',
                'message' => 'Setiap doa harian dan dzikir kini dapat diputar audio pelafalannya dengan tombol play instan untuk mempermudah menghafal dan bertilawah.',
                'link' => '/doa-bersama',
                'time_ago' => '2 hari lalu',
                'timestamp' => '2026-10-03T12:00:00Z',
                'category' => 'Doa & Dzikir',
                'type' => 'prayer',
                'badge_icon' => 'prayer',
                'badge_color' => 'bg-rose-600',
                'image' => '/images/logo-icon.webp',
                'section' => 'earlier'
            ],
            [
                'id' => 'notif-khatam-tracker-30juz',
                'title' => 'Rencanakan Target Khatam 30 Juz',
                'message' => 'Gunakan fitur Khatam Tracker di halaman Penanda untuk mencatat progres membaca harian Anda menuju khatam Al-Quran.',
                'link' => '/penanda',
                'time_ago' => '3 hari lalu',
                'timestamp' => '2026-10-02T09:00:00Z',
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
                'time_ago' => '4 hari lalu',
                'timestamp' => '2026-10-01T10:00:00Z',
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
                'time_ago' => '5 hari lalu',
                'timestamp' => '2026-09-30T11:00:00Z',
                'category' => 'Aplikasi Web',
                'type' => 'system',
                'badge_icon' => 'mobile',
                'badge_color' => 'bg-emerald-500',
                'image' => '/images/logo-icon.webp',
                'section' => 'earlier'
            ]
        ];
    }
}
