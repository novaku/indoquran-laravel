<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Services\HaditsCacheService;

class HaditsController extends Controller
{
    /**
     * Complete metadata catalog for all 11 Hadits books
     */
    public static function getKitabCatalog(): array
    {
        return [
            'shahih_bukhari' => [
                'slug' => 'shahih_bukhari',
                'name' => 'Shahih Bukhari',
                'arab' => 'صحيح البخاري',
                'author' => 'Imam Al-Bukhari (194 - 256 H)',
                'table' => 'hadits_shahih_bukhari',
                'total' => 7008,
                'category' => 'Shahihain',
                'category_label' => 'Kutubus Sittah & Shahihain',
                'color' => 'emerald',
                'description' => 'Kitab hadits paling otentik dan memiliki derajat keshahihan tertinggi setelah Al-Qur\'an Al-Karim.',
                'featured_range' => [1, 100]
            ],
            'shahih_muslim' => [
                'slug' => 'shahih_muslim',
                'name' => 'Shahih Muslim',
                'arab' => 'صحيح مسلم',
                'author' => 'Imam Muslim bin Al-Hajjaj (204 - 261 H)',
                'table' => 'hadits_shahih_muslim',
                'total' => 5362,
                'category' => 'Shahihain',
                'category_label' => 'Kutubus Sittah & Shahihain',
                'color' => 'teal',
                'description' => 'Disusun dengan ketelitian sanad luar biasa dan sistematika bab yang memudahkan perbandingan riwayat hadits.',
                'featured_range' => [1, 100]
            ],
            'sunan_abu_daud' => [
                'slug' => 'sunan_abu_daud',
                'name' => 'Sunan Abu Daud',
                'arab' => 'سنن أبي داود',
                'author' => 'Imam Abu Daud As-Sijistani (202 - 275 H)',
                'table' => 'hadits_sunan_abu_daud',
                'total' => 4590,
                'category' => 'Sunan',
                'category_label' => 'Kutubus Sittah',
                'color' => 'blue',
                'description' => 'Fokus menghimpun hadits-hadits hukum (ahkam) yang menjadi rujukan utama para fuqaha dan mazhab fikih.',
                'featured_range' => [1, 80]
            ],
            'sunan_tirmidzi' => [
                'slug' => 'sunan_tirmidzi',
                'name' => 'Sunan At-Tirmidzi',
                'arab' => 'جامع الترمذي',
                'author' => 'Imam At-Tirmidzi (209 - 279 H)',
                'table' => 'hadits_sunan_tirmidzi',
                'total' => 3891,
                'category' => 'Sunan',
                'category_label' => 'Kutubus Sittah',
                'color' => 'amber',
                'description' => 'Keistimewaannya memuat takhrij derajat hadits (shahih, hasan, gharib) serta ikhtilaf pandangan para sahabat.',
                'featured_range' => [1, 80]
            ],
            'sunan_nasai' => [
                'slug' => 'sunan_nasai',
                'name' => 'Sunan An-Nasa\'i',
                'arab' => 'سنن النسائي',
                'author' => 'Imam An-Nasa\'i (215 - 303 H)',
                'table' => 'hadits_sunan_nasai',
                'total' => 5662,
                'category' => 'Sunan',
                'category_label' => 'Kutubus Sittah',
                'color' => 'cyan',
                'description' => 'Dikenal dengan kritik sanad yang sangat ketat dan pembagian tema hukum ibadah yang sangat mendalam.',
                'featured_range' => [1, 80]
            ],
            'sunan_ibnu_majah' => [
                'slug' => 'sunan_ibnu_majah',
                'name' => 'Sunan Ibnu Majah',
                'arab' => 'سنن ابن ماجه',
                'author' => 'Imam Ibnu Majah (209 - 273 H)',
                'table' => 'hadits_sunan_ibnu_majah',
                'total' => 4332,
                'category' => 'Sunan',
                'category_label' => 'Kutubus Sittah',
                'color' => 'indigo',
                'description' => 'Menyempurnakan enam kitab induk hadits dengan sistematika bab yang rapi dan memuat riwayat-riwayat langka.',
                'featured_range' => [1, 80]
            ],
            'musnad_ahmad' => [
                'slug' => 'musnad_ahmad',
                'name' => 'Musnad Ahmad',
                'arab' => 'مسند أحمد',
                'author' => 'Imam Ahmad bin Hanbal (164 - 241 H)',
                'table' => 'hadits_musnad_ahmad',
                'total' => 26363,
                'category' => 'Musnad',
                'category_label' => 'Kutubut Tis\'ah & Musnad',
                'color' => 'emerald',
                'description' => 'Koleksi hadits terbesar dan terlengkap dalam sejarah Islam, dihimpun berdasar nama-nama sahabat Rasulullah SAW.',
                'featured_range' => [1, 100]
            ],
            'muwatho_malik' => [
                'slug' => 'muwatho_malik',
                'name' => 'Muwatha\' Malik',
                'arab' => 'موطأ مالك',
                'author' => 'Imam Malik bin Anas (93 - 179 H)',
                'table' => 'hadits_muwatho_malik',
                'total' => 1594,
                'category' => 'Tisah',
                'category_label' => 'Kutubut Tis\'ah & Fikih',
                'color' => 'violet',
                'description' => 'Karya tertua perpaduan hadits dan atsar sahabat serta amalan penduduk Madinah Munawwarah oleh pendiri Mazhab Maliki.',
                'featured_range' => [1, 50]
            ],
            'musnad_darimi' => [
                'slug' => 'musnad_darimi',
                'name' => 'Musnad Ad-Darimi',
                'arab' => 'مسند الدارمي',
                'author' => 'Imam Ad-Darimi (181 - 255 H)',
                'table' => 'hadits_musnad_darimi',
                'total' => 3367,
                'category' => 'Tisah',
                'category_label' => 'Kutubut Tis\'ah',
                'color' => 'sky',
                'description' => 'Memuat muqaddimah bernilai tinggi mengenai keutamaan ilmu, sunnah, serta adab periwayatan hadits.',
                'featured_range' => [1, 50]
            ],
            'musnad_syafii' => [
                'slug' => 'musnad_syafii',
                'name' => 'Musnad Asy-Syafi\'i',
                'arab' => 'مسند الشافعي',
                'author' => 'Imam Muhammad bin Idris Asy-Syafi\'i (150 - 204 H)',
                'table' => 'hadits_musnad_syafii',
                'total' => 1800,
                'category' => 'Musnad',
                'category_label' => 'Musnad Ulama Mazhab',
                'color' => 'rose',
                'description' => 'Himpunan riwayat hadits yang menjadi dalil istinbath hukum fiqih sang peletak dasar Ushul Fikih Mazhab Syafi\'i.',
                'featured_range' => [1, 50]
            ],
            'riyadhus_shalihin' => [
                'slug' => 'riyadhus_shalihin',
                'name' => 'Riyadhus Shalihin',
                'arab' => 'رياض الصالحين',
                'author' => 'Imam An-Nawawi (631 - 676 H)',
                'table' => 'hadits_riyadhus_shalihin',
                'total' => 372,
                'category' => 'Kompilasi',
                'category_label' => 'Adab & Tazkiyatun Nafs',
                'color' => 'green',
                'description' => 'Taman orang-orang saleh; memuat 372 bab panduan akhlak, adab, zuhud, dan amalan harian seorang muslim.',
                'featured_range' => [1, 30]
            ]
        ];
    }

    /**
     * Resolve a kitab slug or alias to standard key
     */
    public static function resolveKitabSlug(string $slug): ?string
    {
        $normalized = strtolower(str_replace('-', '_', trim($slug)));
        $aliases = [
            'bukhari' => 'shahih_bukhari',
            'shahih_bukhari' => 'shahih_bukhari',
            'muslim' => 'shahih_muslim',
            'shahih_muslim' => 'shahih_muslim',
            'abu_daud' => 'sunan_abu_daud',
            'abudaud' => 'sunan_abu_daud',
            'sunan_abu_daud' => 'sunan_abu_daud',
            'tirmidzi' => 'sunan_tirmidzi',
            'at_tirmidzi' => 'sunan_tirmidzi',
            'sunan_tirmidzi' => 'sunan_tirmidzi',
            'nasai' => 'sunan_nasai',
            'an_nasai' => 'sunan_nasai',
            'sunan_nasai' => 'sunan_nasai',
            'ibnu_majah' => 'sunan_ibnu_majah',
            'ibnumajah' => 'sunan_ibnu_majah',
            'sunan_ibnu_majah' => 'sunan_ibnu_majah',
            'ahmad' => 'musnad_ahmad',
            'musnad_ahmad' => 'musnad_ahmad',
            'malik' => 'muwatho_malik',
            'muwatha' => 'muwatho_malik',
            'muwatho_malik' => 'muwatho_malik',
            'darimi' => 'musnad_darimi',
            'musnad_darimi' => 'musnad_darimi',
            'syafii' => 'musnad_syafii',
            'asy_syafii' => 'musnad_syafii',
            'musnad_syafii' => 'musnad_syafii',
            'riyadhus_shalihin' => 'riyadhus_shalihin',
            'riyadhus' => 'riyadhus_shalihin',
        ];

        return $aliases[$normalized] ?? (isset(self::getKitabCatalog()[$normalized]) ? $normalized : null);
    }

    protected HaditsCacheService $haditsCache;

    public function __construct(HaditsCacheService $haditsCache)
    {
        $this->haditsCache = $haditsCache;
    }

    /**
     * API: Get all books metadata + featured hadith (Cached)
     */
    public function index()
    {
        try {
            $data = $this->haditsCache->getCatalog();
            $data['featured'] = $this->haditsCache->getFeaturedHadits();

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat katalog hadits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Get hadiths from a specific book with pagination, search, and jump (Cached)
     */
    public function showKitab(string $kitab, Request $request)
    {
        $resolved = self::resolveKitabSlug($kitab);

        if (!$resolved) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak ditemukan'
            ], 404);
        }

        $perPage = min(max((int) $request->input('per_page', 20), 5), 50);
        $search = trim((string) $request->input('q', ''));
        $nomor = $request->has('nomor') && is_numeric($request->input('nomor')) ? (int) $request->input('nomor') : null;
        $page = max((int) $request->input('page', 1), 1);

        try {
            $result = $this->haditsCache->getKitabHadits($resolved, $page, $perPage, $search, $nomor);

            if (!$result) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kitab hadits tidak ditemukan'
                ], 404);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat hadits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Get single hadith detail with prev/next navigation (Cached)
     */
    public function showHadits(string $kitab, int $nomor)
    {
        $resolved = self::resolveKitabSlug($kitab);

        if (!$resolved) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak ditemukan'
            ], 404);
        }

        try {
            $result = $this->haditsCache->getHaditsDetail($resolved, $nomor);

            if (!$result) {
                $catalog = self::getKitabCatalog();
                $name = $catalog[$resolved]['name'] ?? $resolved;
                return response()->json([
                    'status' => 'error',
                    'message' => "Hadits nomor {$nomor} tidak ditemukan dalam {$name}"
                ], 404);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat hadits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Global search Indonesian translation across all or specific hadith book (Cached)
     */
    public function search(Request $request)
    {
        $q = trim((string) $request->input('q', ''));
        if (mb_strlen($q) < 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kata kunci pencarian minimal 2 karakter'
            ], 400);
        }

        $kitabParam = trim((string) $request->input('kitab', 'all'));
        $page = max((int) $request->input('page', 1), 1);
        $perPage = min(max((int) $request->input('per_page', 20), 5), 50);

        try {
            $data = $this->haditsCache->searchHadits($q, $kitabParam, $page, $perPage);
            return response()->json($data);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pencarian hadits gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Get a random inspirational hadith (Cached hourly)
     */
    public function random()
    {
        try {
            $hadits = $this->haditsCache->getRandomHadits();

            return response()->json([
                'status' => 'success',
                'data' => $hadits
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil hadits acak'
            ], 500);
        }
    }

    /**
     * API: Clear Hadits Cache
     */
    public function clearCache(Request $request)
    {
        $cleared = $this->haditsCache->clearAllCache();

        return response()->json([
            'status' => $cleared ? 'success' : 'error',
            'message' => $cleared ? 'Cache hadits berhasil dibersihkan' : 'Gagal membersihkan cache hadits'
        ]);
    }

    /**
     * Internal helper to pick a high-relevance inspirational hadith
     */
    protected function getFeaturedHadits(): ?array
    {
        return $this->haditsCache->getFeaturedHadits();
    }
}
