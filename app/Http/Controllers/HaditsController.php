<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

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

    /**
     * API: Get all books metadata + featured hadith
     */
    public function index()
    {
        try {
            $kitabs = self::getKitabCatalog();
            
            // Get random featured hadith cached for 1 hour
            $featured = Cache::remember('hadits_featured_daily', 3600, function () {
                return $this->getFeaturedHadits();
            });

            $totalHadits = array_sum(array_column($kitabs, 'total'));

            return response()->json([
                'status' => 'success',
                'total_hadits' => $totalHadits,
                'total_kitab' => count($kitabs),
                'kitabs' => array_values($kitabs),
                'featured' => $featured
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat katalog hadits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Get hadiths from a specific book with pagination, search, and jump
     */
    public function showKitab(string $kitab, Request $request)
    {
        $resolved = self::resolveKitabSlug($kitab);
        $catalog = self::getKitabCatalog();

        if (!$resolved || !isset($catalog[$resolved])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak ditemukan'
            ], 404);
        }

        $kitabInfo = $catalog[$resolved];
        $table = $kitabInfo['table'];

        $perPage = min(max((int) $request->input('per_page', 20), 5), 50);
        $search = trim((string) $request->input('q', ''));
        $nomor = $request->has('nomor') && is_numeric($request->input('nomor')) ? (int) $request->input('nomor') : null;

        try {
            $query = DB::table($table);

            // If jumping directly to a number without search
            if ($nomor !== null && empty($search)) {
                // Determine page containing this hadith ID (since IDs are 1..N)
                $targetPage = (int) ceil(max($nomor, 1) / $perPage);
                $request->merge(['page' => $targetPage]);
            }

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('terjemah', 'like', '%' . $search . '%')
                      ->orWhere('arab', 'like', '%' . $search . '%');
                });
            }

            $paginator = $query->orderBy('id', 'asc')->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'kitab' => $kitabInfo,
                'search' => $search,
                'jump_nomor' => $nomor,
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
                'data' => $paginator->items()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat hadits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Get single hadith detail with prev/next navigation
     */
    public function showHadits(string $kitab, int $nomor)
    {
        $resolved = self::resolveKitabSlug($kitab);
        $catalog = self::getKitabCatalog();

        if (!$resolved || !isset($catalog[$resolved])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak ditemukan'
            ], 404);
        }

        $kitabInfo = $catalog[$resolved];
        $table = $kitabInfo['table'];

        try {
            $hadits = DB::table($table)->where('id', $nomor)->first();

            if (!$hadits) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Hadits nomor {$nomor} tidak ditemukan dalam {$kitabInfo['name']}"
                ], 404);
            }

            // Find previous and next IDs
            $prev = DB::table($table)->where('id', '<', $nomor)->orderBy('id', 'desc')->select('id')->first();
            $next = DB::table($table)->where('id', '>', $nomor)->orderBy('id', 'asc')->select('id')->first();

            return response()->json([
                'status' => 'success',
                'kitab' => $kitabInfo,
                'hadits' => $hadits,
                'navigation' => [
                    'prev_nomor' => $prev?->id,
                    'next_nomor' => $next?->id,
                    'total' => $kitabInfo['total']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat hadits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Global search Indonesian translation across all or specific hadith book
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

        $catalog = self::getKitabCatalog();

        // Build search callback for flexibility
        $isExact = (str_starts_with($q, '"') && str_ends_with($q, '"')) || count(explode(' ', $q)) <= 1;
        $searchPhrase = trim($q, '"');
        $words = array_slice(preg_split('/\s+/', $searchPhrase, -1, PREG_SPLIT_NO_EMPTY), 0, 5);

        $applySearchFilter = function ($builder) use ($isExact, $searchPhrase, $words) {
            if ($isExact || count($words) <= 1) {
                $builder->where('terjemah', 'like', '%' . $searchPhrase . '%');
            } else {
                $builder->where(function ($sub) use ($searchPhrase, $words) {
                    $sub->where('terjemah', 'like', '%' . $searchPhrase . '%')
                        ->orWhere(function ($allWords) use ($words) {
                            foreach ($words as $w) {
                                $allWords->where('terjemah', 'like', '%' . $w . '%');
                            }
                        });
                });
            }
        };

        try {
            // Case 1: Search in a specific book
            if ($kitabParam !== 'all' && !empty($kitabParam)) {
                $resolved = self::resolveKitabSlug($kitabParam);
                if (!$resolved || !isset($catalog[$resolved])) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Kitab hadits yang dipilih tidak valid'
                    ], 400);
                }

                $kitabInfo = $catalog[$resolved];
                $table = $kitabInfo['table'];

                $query = DB::table($table);
                $applySearchFilter($query);

                $total = $query->count();
                $lastPage = (int) max(ceil($total / $perPage), 1);

                $rawItems = $query->orderBy('id', 'asc')
                    ->offset(($page - 1) * $perPage)
                    ->limit($perPage)
                    ->get();

                $items = $rawItems->map(function ($row) use ($resolved, $kitabInfo) {
                    return [
                        'id' => $row->id,
                        'kitab_slug' => $resolved,
                        'kitab_name' => $kitabInfo['name'],
                        'kitab_arab' => $kitabInfo['arab'],
                        'category' => $kitabInfo['category'],
                        'arab' => $row->arab,
                        'terjemah' => $row->terjemah,
                    ];
                });

                return response()->json([
                    'status' => 'success',
                    'query' => $q,
                    'kitab_filter' => $resolved,
                    'kitab_name' => $kitabInfo['name'],
                    'groups' => [
                        [
                            'kitab_slug' => $resolved,
                            'kitab_name' => $kitabInfo['name'],
                            'kitab_arab' => $kitabInfo['arab'],
                            'category' => $kitabInfo['category'],
                            'total_in_book' => $kitabInfo['total'],
                            'match_count' => $total,
                        ]
                    ],
                    'pagination' => [
                        'current_page' => $page,
                        'last_page' => $lastPage,
                        'per_page' => $perPage,
                        'total' => $total,
                        'from' => $total > 0 ? (($page - 1) * $perPage) + 1 : 0,
                        'to' => min($page * $perPage, $total),
                    ],
                    'data' => $items
                ]);
            }

            // Case 2: Search across all 11 books
            $subqueries = [];
            foreach ($catalog as $slug => $info) {
                $sub = DB::table($info['table'])
                    ->selectRaw('? as kitab_slug, id, arab, terjemah', [$slug]);
                $applySearchFilter($sub);
                $subqueries[] = $sub;
            }

            $first = array_shift($subqueries);
            foreach ($subqueries as $sub) {
                $first->unionAll($sub);
            }

            // Cache grouping breakdown by kitab for 1 hour to keep pagination snappy
            $cacheKeyGroups = 'hadits_search_groups_' . md5($searchPhrase);
            $groupsData = Cache::remember($cacheKeyGroups, 3600, function () use ($first, $catalog) {
                $rawGroups = DB::query()->fromSub($first, 'u')
                    ->select('kitab_slug', DB::raw('count(*) as total'))
                    ->groupBy('kitab_slug')
                    ->get();
                $groupMap = $rawGroups->pluck('total', 'kitab_slug')->all();
                $groups = [];
                $grandTotal = 0;
                foreach ($catalog as $slug => $info) {
                    $c = (int) ($groupMap[$slug] ?? 0);
                    if ($c > 0) {
                        $groups[] = [
                            'kitab_slug' => $slug,
                            'kitab_name' => $info['name'],
                            'kitab_arab' => $info['arab'],
                            'category' => $info['category'],
                            'total_in_book' => $info['total'],
                            'match_count' => $c,
                        ];
                        $grandTotal += $c;
                    }
                }
                return [
                    'groups' => $groups,
                    'total' => $grandTotal
                ];
            });

            $groups = $groupsData['groups'];
            $total = $groupsData['total'];

            $lastPage = (int) max(ceil($total / $perPage), 1);
            $wrapper = DB::query()->fromSub($first, 'u');
            $rawItems = $wrapper->offset(($page - 1) * $perPage)->limit($perPage)->get();

            $items = $rawItems->map(function ($row) use ($catalog) {
                $info = $catalog[$row->kitab_slug] ?? null;
                return [
                    'id' => $row->id,
                    'kitab_slug' => $row->kitab_slug,
                    'kitab_name' => $info ? $info['name'] : $row->kitab_slug,
                    'kitab_arab' => $info ? $info['arab'] : '',
                    'category' => $info ? $info['category'] : '',
                    'arab' => $row->arab,
                    'terjemah' => $row->terjemah,
                ];
            });

            return response()->json([
                'status' => 'success',
                'query' => $q,
                'kitab_filter' => 'all',
                'kitab_name' => 'Seluruh Kitab (11 Kitab)',
                'groups' => $groups,
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $total,
                    'from' => $total > 0 ? (($page - 1) * $perPage) + 1 : 0,
                    'to' => min($page * $perPage, $total),
                ],
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pencarian hadits gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: Get a random inspirational hadith
     */
    public function random()
    {
        try {
            $hadits = $this->getFeaturedHadits();

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
     * Internal helper to pick a high-relevance inspirational hadith
     */
    protected function getFeaturedHadits(): ?array
    {
        // Curated inspirational hadiths or random from Bukhari/Muslim
        $curatedList = [
            ['kitab' => 'shahih_bukhari', 'id' => 1, 'theme' => 'Niat & Keikhlasan'],
            ['kitab' => 'shahih_bukhari', 'id' => 13, 'theme' => 'Mencintai Sesama Saudara'],
            ['kitab' => 'shahih_bukhari', 'id' => 47, 'theme' => 'Tanda-tanda Orang Munafik'],
            ['kitab' => 'shahih_muslim', 'id' => 45, 'theme' => 'Agama adalah Nasihat'],
            ['kitab' => 'shahih_muslim', 'id' => 223, 'theme' => 'Kesucian Sebagian dari Iman'],
            ['kitab' => 'sunan_tirmidzi', 'id' => 1956, 'theme' => 'Senyum adalah Sedekah'],
            ['kitab' => 'riyadhus_shalihin', 'id' => 2, 'theme' => 'Kewajiban Taubat'],
        ];

        $catalog = self::getKitabCatalog();
        $pick = $curatedList[array_rand($curatedList)];

        if (isset($catalog[$pick['kitab']])) {
            $kitabInfo = $catalog[$pick['kitab']];
            $row = DB::table($kitabInfo['table'])->where('id', $pick['id'])->first();
            if ($row) {
                return [
                    'id' => $row->id,
                    'kitab' => $pick['kitab'],
                    'kitab_name' => $kitabInfo['name'],
                    'kitab_arab' => $kitabInfo['arab'],
                    'theme' => $pick['theme'],
                    'arab' => $row->arab,
                    'terjemah' => $row->terjemah
                ];
            }
        }

        // Fallback to first hadith of Bukhari
        $bukhariRow = DB::table('hadits_shahih_bukhari')->first();
        if ($bukhariRow) {
            return [
                'id' => $bukhariRow->id,
                'kitab' => 'shahih_bukhari',
                'kitab_name' => 'Shahih Bukhari',
                'kitab_arab' => 'صحيح البخاري',
                'theme' => 'Semua Amal Tergantung Niat',
                'arab' => $bukhariRow->arab,
                'terjemah' => $bukhariRow->terjemah
            ];
        }

        return null;
    }
}
