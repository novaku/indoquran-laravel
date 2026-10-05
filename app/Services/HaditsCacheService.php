<?php

namespace App\Services;

use App\Http\Controllers\HaditsController;
use App\Models\Hadits;
use Illuminate\Cache\RedisStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class HaditsCacheService
{
    /**
     * Get TTL from config with safe fallback
     */
    public function getTtl(string $type): int
    {
        $defaultTtls = [
            'catalog' => 2592000,   // 30 days
            'detail' => 2592000,    // 30 days
            'kitab_page' => 2592000,// 30 days
            'search' => 604800,     // 7 days
            'featured' => 86400,    // 24 hours
            'random' => 3600,       // 1 hour
            'kategori' => 2592000,  // 30 days
        ];

        return (int) config("hadits_cache.ttl.{$type}", $defaultTtls[$type] ?? 86400);
    }

    /**
     * Get cache key prefix
     */
    public function getPrefix(string $type): string
    {
        return (string) config("hadits_cache.prefixes.{$type}", "hadits:{$type}:");
    }

    /**
     * Get all books metadata catalog with caching
     */
    public function getCatalog(): array
    {
        $cacheKey = $this->getPrefix('catalog') . 'summary';
        $ttl = $this->getTtl('catalog');

        return Cache::remember($cacheKey, $ttl, function () {
            if (config('hadits_cache.detailed_logging', false)) {
                Log::info('HaditsCacheService: Generating catalog cache');
            }

            $kitabs = HaditsController::getKitabCatalog();
            $totalHadits = array_sum(array_column($kitabs, 'total'));

            return [
                'status' => 'success',
                'total_hadits' => $totalHadits,
                'total_kitab' => count($kitabs),
                'kitabs' => array_values($kitabs),
            ];
        });
    }

    /**
     * Get dropdown options matching only existing database tables
     */
    public function getDropdownOptions(): array
    {
        $cacheKey = $this->getPrefix('catalog') . 'dropdown';
        $ttl = $this->getTtl('catalog');

        return Cache::remember($cacheKey, $ttl, function () {
            $rawKitabs = HaditsController::getKitabCatalog();
            $availableKitabs = [];
            $totalHadits = 0;

            foreach ($rawKitabs as $slug => $info) {
                $tableName = $info['table'];
                if (!Schema::hasTable($tableName)) {
                    continue;
                }

                $count = DB::table($tableName)->count();
                $actualTotal = $count > 0 ? $count : $info['total'];
                $totalHadits += $actualTotal;

                $availableKitabs[] = [
                    'slug' => $slug,
                    'name' => $info['name'],
                    'arab' => $info['arab'],
                    'table' => $tableName,
                    'total' => $actualTotal,
                    'total_formatted' => number_format($actualTotal, 0, ',', '.') . ' Hadits',
                    'category' => $info['category'],
                    'category_label' => $info['category_label'] ?? $info['category'],
                ];
            }

            $totalKitab = count($availableKitabs);
            $totalHaditsFormatted = number_format($totalHadits, 0, ',', '.') . ' hadits';

            return [
                'status' => 'success',
                'total_kitab' => $totalKitab,
                'total_hadits' => $totalHadits,
                'total_hadits_formatted' => $totalHaditsFormatted,
                'all_option' => [
                    'slug' => 'all',
                    'name' => 'Seluruh Hadits',
                    'badge' => "{$totalKitab} Kitab",
                    'description' => "{$totalKitab} Kitab Hadits ({$totalHaditsFormatted})",
                ],
                'kitabs' => $availableKitabs,
            ];
        });
    }

    /**
     * Get daily featured hadith with caching
     */
    public function getFeaturedHadits(): ?array
    {
        $cacheKey = $this->getPrefix('featured') . 'daily:' . date('Y-m-d');
        $ttl = $this->getTtl('featured');

        return Cache::remember($cacheKey, $ttl, function () {
            if (config('hadits_cache.detailed_logging', false)) {
                Log::info('HaditsCacheService: Selecting new daily featured hadith');
            }

            $curatedList = [
                ['kitab' => 'shahih_bukhari', 'id' => 1, 'theme' => 'Niat & Keikhlasan'],
                ['kitab' => 'shahih_bukhari', 'id' => 13, 'theme' => 'Mencintai Sesama Saudara'],
                ['kitab' => 'shahih_bukhari', 'id' => 47, 'theme' => 'Tanda-tanda Orang Munafik'],
                ['kitab' => 'shahih_muslim', 'id' => 45, 'theme' => 'Agama adalah Nasihat'],
                ['kitab' => 'shahih_muslim', 'id' => 223, 'theme' => 'Kesucian Sebagian dari Iman'],
                ['kitab' => 'sunan_tirmidzi', 'id' => 1956, 'theme' => 'Senyum adalah Sedekah'],
            ];

            $catalog = HaditsController::getKitabCatalog();
            $pick = $curatedList[array_rand($curatedList)];

            if (isset($catalog[$pick['kitab']])) {
                $kitabInfo = $catalog[$pick['kitab']];
                if (Schema::hasTable($kitabInfo['table'])) {
                    $hasNo = Schema::hasColumn($kitabInfo['table'], 'no');
                    $query = DB::table($kitabInfo['table']);
                    if ($hasNo) {
                        $row = $query->where('no', $pick['id'])->first();
                    } else {
                        $row = $query->where('id', $pick['id'])->first();
                    }
                    if (!$row && $hasNo) {
                        $row = DB::table($kitabInfo['table'])->where('id', $pick['id'])->first();
                    }

                    if ($row) {
                        return [
                            'id' => $row->no ?? $row->id,
                            'no' => $row->no ?? $row->id,
                            'db_id' => $row->id,
                            'kitab' => $pick['kitab'],
                            'kitab_name' => $kitabInfo['name'],
                            'kitab_arab' => $kitabInfo['arab'],
                            'kategori' => $row->kategori ?? null,
                            'theme' => $pick['theme'],
                            'arab' => $row->arab,
                            'indonesia' => $row->indonesia ?? '',
                            'penjelasan' => $row->penjelasan ?? null,
                        ];
                    }
                }
            }

            // Fallback to first hadith of Bukhari
            $bukhariTable = Schema::hasTable('hadits_shahih_al_bukhari') ? 'hadits_shahih_al_bukhari' : null;

            if ($bukhariTable) {
                $bukhariRow = DB::table($bukhariTable)->first();
                if ($bukhariRow) {
                    return [
                        'id' => $bukhariRow->no ?? $bukhariRow->id,
                        'no' => $bukhariRow->no ?? $bukhariRow->id,
                        'db_id' => $bukhariRow->id,
                        'kitab' => 'shahih_bukhari',
                        'kitab_name' => 'Shahih Bukhari',
                        'kitab_arab' => 'صحيح البخاري',
                        'kategori' => $bukhariRow->kategori ?? null,
                        'theme' => 'Semua Amal Tergantung Niat',
                        'arab' => $bukhariRow->arab,
                        'indonesia' => $bukhariRow->indonesia ?? '',
                        'penjelasan' => $bukhariRow->penjelasan ?? null,
                    ];
                }
            }

            return null;
        });
    }

    /**
     * Get single hadith detail with navigation, cached for 30 days
     */
    public function getHaditsDetail(string $kitabSlug, int $nomor): ?array
    {
        $resolved = HaditsController::resolveKitabSlug($kitabSlug);
        if (!$resolved) {
            return null;
        }

        $catalog = HaditsController::getKitabCatalog();
        $kitabInfo = $catalog[$resolved] ?? null;
        if (!$kitabInfo) {
            return null;
        }

        $cacheKey = $this->getPrefix('detail') . "{$resolved}:{$nomor}";
        $ttl = $this->getTtl('detail');

        return Cache::remember($cacheKey, $ttl, function () use ($kitabInfo, $nomor, $resolved) {
            $table = $kitabInfo['table'];
            if (!Schema::hasTable($table)) {
                return null;
            }

            $hasNo = Schema::hasColumn($table, 'no');
            $query = DB::table($table);

            if ($hasNo) {
                $hadits = $query->where('no', $nomor)->first();
            } else {
                $hadits = $query->where('id', $nomor)->first();
            }

            if (!$hadits && $hasNo) {
                $hadits = DB::table($table)->where('id', $nomor)->first();
            }

            if (!$hadits) {
                return null;
            }

            $targetNo = $hadits->no ?? $hadits->id;
            $orderCol = $hasNo ? 'no' : 'id';

            $prev = DB::table($table)->where($orderCol, '<', $targetNo)->orderBy($orderCol, 'desc')->first();
            $next = DB::table($table)->where($orderCol, '>', $targetNo)->orderBy($orderCol, 'asc')->first();

            $prevNomor = $prev ? ($prev->no ?? $prev->id) : null;
            $nextNomor = $next ? ($next->no ?? $next->id) : null;

            $haditsObj = (object) [
                'id' => $hadits->no ?? $hadits->id,
                'no' => $hadits->no ?? $hadits->id,
                'db_id' => $hadits->id,
                'kitab' => $hadits->kitab ?? $kitabInfo['name'],
                'kategori' => $hadits->kategori ?? null,
                'kategori_slug' => !empty($hadits->kategori) ? \Illuminate\Support\Str::slug($hadits->kategori) : null,
                'arab' => $hadits->arab,
                'indonesia' => $hadits->indonesia ?? '',
                'penjelasan' => $hadits->penjelasan ?? null,
            ];

            return [
                'status' => 'success',
                'kitab' => $kitabInfo,
                'hadits' => $haditsObj,
                'navigation' => [
                    'prev_nomor' => $prevNomor,
                    'next_nomor' => $nextNomor,
                    'total' => $kitabInfo['total']
                ]
            ];
        });
    }

    /**
     * Get all categories / chapters of a kitab with hadith count and range, cached
     */
    public function getKitabCategories(string $kitabSlug): ?array
    {
        $resolved = HaditsController::resolveKitabSlug($kitabSlug);
        if (!$resolved) {
            return null;
        }

        $catalog = HaditsController::getKitabCatalog();
        $kitabInfo = $catalog[$resolved] ?? null;
        if (!$kitabInfo) {
            return null;
        }

        $cacheKey = $this->getPrefix('kategori') . $resolved;
        $ttl = $this->getTtl('kategori');

        return Cache::remember($cacheKey, $ttl, function () use ($kitabInfo, $resolved) {
            $table = $kitabInfo['table'];
            if (!Schema::hasTable($table)) {
                return null;
            }

            $hasKategori = Schema::hasColumn($table, 'kategori');
            if (!$hasKategori) {
                return [
                    'status' => 'success',
                    'kitab' => $kitabInfo,
                    'total_categories' => 0,
                    'categories' => []
                ];
            }

            $hasNo = Schema::hasColumn($table, 'no');
            $noCol = $hasNo ? 'no' : 'id';

            $rows = DB::table($table)
                ->select(
                    'kategori',
                    DB::raw('COUNT(*) as total'),
                    DB::raw("MIN({$noCol}) as min_no"),
                    DB::raw("MAX({$noCol}) as max_no")
                )
                ->whereNotNull('kategori')
                ->where('kategori', '!=', '')
                ->groupBy('kategori')
                ->orderByRaw("MIN({$noCol}) ASC")
                ->get();

            $index = 1;
            $categories = $rows->map(function ($row) use (&$index) {
                $name = trim($row->kategori);
                $slug = \Illuminate\Support\Str::slug($name);
                $minNo = (int) $row->min_no;
                $maxNo = (int) $row->max_no;

                return [
                    'index' => $index++,
                    'name' => $name,
                    'slug' => $slug,
                    'total' => (int) $row->total,
                    'min_no' => $minNo,
                    'max_no' => $maxNo,
                    'range' => $minNo === $maxNo ? (string) $minNo : "{$minNo} - {$maxNo}",
                ];
            })->values()->all();

            return [
                'status' => 'success',
                'kitab' => $kitabInfo,
                'total_categories' => count($categories),
                'categories' => $categories
            ];
        });
    }

    /**
     * Get hadiths from a specific book with pagination, category filter & search, cached
     */
    public function getKitabHadits(string $kitabSlug, int $page = 1, int $perPage = 20, string $search = '', ?int $nomor = null, ?string $kategori = null): ?array
    {
        $resolved = HaditsController::resolveKitabSlug($kitabSlug);
        if (!$resolved) {
            return null;
        }

        $catalog = HaditsController::getKitabCatalog();
        $kitabInfo = $catalog[$resolved] ?? null;
        if (!$kitabInfo) {
            return null;
        }

        $perPage = min(max($perPage, 5), 50);
        $cleanSearch = trim($search);
        $cleanKategori = trim((string) $kategori);

        // Resolve category if provided
        $activeCategory = null;
        $categoryFilterName = null;
        if (!empty($cleanKategori)) {
            $categoriesResult = $this->getKitabCategories($resolved);
            $allCategories = $categoriesResult['categories'] ?? [];
            $kategoriSlugCandidate = \Illuminate\Support\Str::slug($cleanKategori);

            foreach ($allCategories as $catItem) {
                if ($catItem['slug'] === $kategoriSlugCandidate || strcasecmp($catItem['name'], $cleanKategori) === 0) {
                    $activeCategory = $catItem;
                    $categoryFilterName = $catItem['name'];
                    break;
                }
            }

            // Fallback if not matched strictly by slug/name
            if (!$categoryFilterName && !empty($cleanKategori)) {
                $categoryFilterName = $cleanKategori;
                $activeCategory = [
                    'index' => null,
                    'name' => $cleanKategori,
                    'slug' => \Illuminate\Support\Str::slug($cleanKategori),
                    'total' => 0,
                    'min_no' => null,
                    'max_no' => null,
                    'range' => '',
                ];
            }
        }

        // If jumping directly to a number without search
        $targetPage = $page;
        if ($nomor !== null && empty($cleanSearch)) {
            $targetPage = (int) ceil(max($nomor, 1) / $perPage);
        }

        // Build granular cache key
        $searchHash = !empty($cleanSearch) ? md5(mb_strtolower($cleanSearch)) : 'none';
        $nomorKey = $nomor !== null ? (string) $nomor : 'none';
        $catKey = !empty($categoryFilterName) ? md5(mb_strtolower($categoryFilterName)) : 'all';
        $cacheKey = $this->getPrefix('kitab') . "{$resolved}:c{$catKey}:p{$targetPage}:pp{$perPage}:s{$searchHash}:n{$nomorKey}";
        $ttl = empty($cleanSearch) ? $this->getTtl('kitab_page') : $this->getTtl('search');

        return Cache::remember($cacheKey, $ttl, function () use ($kitabInfo, $perPage, $cleanSearch, $nomor, $targetPage, $categoryFilterName, $activeCategory) {
            $table = $kitabInfo['table'];
            if (!Schema::hasTable($table)) {
                return null;
            }

            $hasNo = Schema::hasColumn($table, 'no');
            $hasPenjelasan = Schema::hasColumn($table, 'penjelasan');
            $hasKategori = Schema::hasColumn($table, 'kategori');

            $query = DB::table($table);

            if (!empty($categoryFilterName) && $hasKategori) {
                $query->where('kategori', $categoryFilterName);
            }

            if (!empty($cleanSearch)) {
                $query->where(function ($q) use ($cleanSearch) {
                    $q->where('indonesia', 'like', '%' . $cleanSearch . '%')
                      ->orWhere('arab', 'like', '%' . $cleanSearch . '%');
                });
            }

            $total = (clone $query)->count();
            $lastPage = (int) max(ceil($total / $perPage), 1);
            $offset = ($targetPage - 1) * $perPage;

            if ($activeCategory && ($activeCategory['total'] === 0 || empty($activeCategory['index']))) {
                $activeCategory['total'] = $total;
            }

            $orderCol = $hasNo ? 'no' : 'id';
            $rawItems = $query->orderBy($orderCol, 'asc')
                ->offset($offset)
                ->limit($perPage)
                ->get();

            $items = $rawItems->map(function ($row) {
                $catName = $row->kategori ?? null;
                return (object) [
                    'id' => $row->no ?? $row->id,
                    'no' => $row->no ?? $row->id,
                    'db_id' => $row->id,
                    'kitab' => $row->kitab ?? '',
                    'kategori' => $catName,
                    'kategori_slug' => !empty($catName) ? \Illuminate\Support\Str::slug($catName) : null,
                    'arab' => $row->arab,
                    'indonesia' => $row->indonesia ?? '',
                    'penjelasan' => $row->penjelasan ?? null,
                ];
            });

            return [
                'status' => 'success',
                'kitab' => $kitabInfo,
                'active_category' => $activeCategory,
                'search' => $cleanSearch,
                'jump_nomor' => $nomor,
                'pagination' => [
                    'current_page' => $targetPage,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $total,
                    'from' => $total > 0 ? $offset + 1 : 0,
                    'to' => min($offset + $perPage, $total),
                ],
                'data' => $items
            ];
        });
    }

    /**
     * Search Indonesian translation across all or specific hadith book with cached results & groups
     */
    public function searchHadits(string $query, string $kitabScope = 'all', int $page = 1, int $perPage = 20): array
    {
        $q = trim($query);
        $page = max($page, 1);
        $perPage = min(max($perPage, 5), 50);
        $catalog = HaditsController::getKitabCatalog();

        $searchKey = md5(mb_strtolower($q));
        $cacheKey = $this->getPrefix('search') . "{$kitabScope}:p{$page}:pp{$perPage}:{$searchKey}";
        $ttl = $this->getTtl('search');

        return Cache::remember($cacheKey, $ttl, function () use ($q, $kitabScope, $page, $perPage, $catalog) {
            $isExact = (str_starts_with($q, '"') && str_ends_with($q, '"')) || count(explode(' ', $q)) <= 1;
            $searchPhrase = trim($q, '"');
            $words = array_slice(preg_split('/\s+/', $searchPhrase, -1, PREG_SPLIT_NO_EMPTY), 0, 5);

            $applySearchFilter = function ($builder, $transCol = 'indonesia') use ($isExact, $searchPhrase, $words) {
                if ($isExact || count($words) <= 1) {
                    $builder->where($transCol, 'like', '%' . $searchPhrase . '%');
                } else {
                    $builder->where(function ($sub) use ($transCol, $searchPhrase, $words) {
                        $sub->where($transCol, 'like', '%' . $searchPhrase . '%')
                            ->orWhere(function ($allWords) use ($words, $transCol) {
                                foreach ($words as $w) {
                                    $allWords->where($transCol, 'like', '%' . $w . '%');
                                }
                            });
                    });
                }
            };

            // Case 1: Search in a specific book
            if ($kitabScope !== 'all' && !empty($kitabScope)) {
                $resolved = HaditsController::resolveKitabSlug($kitabScope);
                if (!$resolved || !isset($catalog[$resolved])) {
                    throw new \InvalidArgumentException('Kitab hadits yang dipilih tidak valid');
                }

                $kitabInfo = $catalog[$resolved];
                $table = $kitabInfo['table'];

                if (!Schema::hasTable($table)) {
                    return [
                        'status' => 'success',
                        'query' => $q,
                        'kitab_filter' => $resolved,
                        'kitab_name' => $kitabInfo['name'],
                        'groups' => [],
                        'pagination' => [
                            'current_page' => $page,
                            'last_page' => 1,
                            'per_page' => $perPage,
                            'total' => 0,
                            'from' => 0,
                            'to' => 0,
                        ],
                        'data' => []
                    ];
                }

                $hasNo = Schema::hasColumn($table, 'no');
                $hasPenjelasan = Schema::hasColumn($table, 'penjelasan');

                $query = DB::table($table);
                $applySearchFilter($query, 'indonesia');

                $total = (clone $query)->count();
                $lastPage = (int) max(ceil($total / $perPage), 1);

                $orderCol = $hasNo ? 'no' : 'id';
                $rawItems = $query->orderBy($orderCol, 'asc')
                    ->offset(($page - 1) * $perPage)
                    ->limit($perPage)
                    ->get();

                $items = $rawItems->map(function ($row) use ($resolved, $kitabInfo) {
                    return [
                        'id' => $row->no ?? $row->id,
                        'no' => $row->no ?? $row->id,
                        'db_id' => $row->id,
                        'kitab_slug' => $resolved,
                        'kitab_name' => $kitabInfo['name'],
                        'kitab_arab' => $kitabInfo['arab'],
                        'category' => $kitabInfo['category'],
                        'kategori' => $row->kategori ?? null,
                        'arab' => $row->arab,
                        'indonesia' => $row->indonesia ?? '',
                        'penjelasan' => $row->penjelasan ?? null,
                    ];
                });

                return [
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
                ];
            }

            // Case 2: Search across available books
            $subqueries = [];
            foreach ($catalog as $slug => $info) {
                if (!Schema::hasTable($info['table'])) {
                    continue;
                }
                $t = $info['table'];
                $hasPenjelasan = Schema::hasColumn($t, 'penjelasan');
                $hasKategori = Schema::hasColumn($t, 'kategori');
                $hasNo = Schema::hasColumn($t, 'no');

                $noSelect = $hasNo ? 'no' : 'id as no';
                $kategoriSelect = $hasKategori ? 'kategori' : 'NULL as kategori';
                $penjelasanSelect = $hasPenjelasan ? 'penjelasan' : 'NULL as penjelasan';

                $sub = DB::table($t)
                    ->selectRaw("? as kitab_slug, id, {$noSelect}, arab, indonesia, {$penjelasanSelect}, {$kategoriSelect}", [$slug]);

                $applySearchFilter($sub, 'indonesia');
                $subqueries[] = $sub;
            }

            if (empty($subqueries)) {
                return [
                    'status' => 'success',
                    'query' => $q,
                    'kitab_filter' => 'all',
                    'kitab_name' => 'Seluruh Kitab',
                    'groups' => [],
                    'pagination' => [
                        'current_page' => $page,
                        'last_page' => 1,
                        'per_page' => $perPage,
                        'total' => 0,
                        'from' => 0,
                        'to' => 0,
                    ],
                    'data' => []
                ];
            }

            $first = array_shift($subqueries);
            foreach ($subqueries as $sub) {
                $first->unionAll($sub);
            }

            // Cache grouping breakdown by kitab
            $cacheKeyGroups = $this->getPrefix('search') . 'groups:' . md5(mb_strtolower($searchPhrase));
            $groupsData = Cache::remember($cacheKeyGroups, $this->getTtl('search'), function () use ($first, $catalog) {
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
                    'id' => $row->no ?? $row->id,
                    'no' => $row->no ?? $row->id,
                    'db_id' => $row->id,
                    'kitab_slug' => $row->kitab_slug,
                    'kitab_name' => $info ? $info['name'] : $row->kitab_slug,
                    'kitab_arab' => $info ? $info['arab'] : '',
                    'category' => $info ? $info['category'] : '',
                    'kategori' => $row->kategori ?? null,
                    'arab' => $row->arab,
                    'indonesia' => $row->indonesia ?? '',
                    'penjelasan' => $row->penjelasan ?? null,
                ];
            });

            return [
                'status' => 'success',
                'query' => $q,
                'kitab_filter' => 'all',
                'kitab_name' => 'Seluruh Kitab Hadits',
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
            ];
        });
    }

    /**
     * Get random hadith, cached hourly to avoid repeated queries
     */
    public function getRandomHadits(): ?array
    {
        $cacheKey = $this->getPrefix('random') . 'hour:' . date('Y-m-d-H');
        $ttl = $this->getTtl('random');

        return Cache::remember($cacheKey, $ttl, function () {
            return $this->getFeaturedHadits();
        });
    }

    /**
     * Invalidate all or specific Hadits caches
     */
    public function clearAllCache(): bool
    {
        try {
            Cache::forget($this->getPrefix('catalog') . 'summary');
            Cache::forget($this->getPrefix('catalog') . 'dropdown');
            Cache::forget($this->getPrefix('featured') . 'daily:' . date('Y-m-d'));
            Cache::forget('hadits_featured_daily');

            // If Redis store is used, flush pattern matching keys
            $store = Cache::getStore();
            if ($store instanceof RedisStore) {
                $redis = $store->connection();
                $cachePrefix = $store->getPrefix();

                $connPrefix = $this->getRedisConnectionPrefix($redis);

                $keys = $redis->keys($cachePrefix . 'hadits:*');
                if (!empty($keys)) {
                    $keysToDelete = array_map(function ($k) use ($connPrefix) {
                        if ($connPrefix !== '' && str_starts_with($k, $connPrefix)) {
                            return substr($k, strlen($connPrefix));
                        }
                        return $k;
                    }, $keys);

                    $redis->del($keysToDelete);
                }
            } else {
                Cache::flush();
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('HaditsCacheService: clearAllCache failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Invalidate cache for a specific kitab
     */
    public function clearKitabCache(string $kitabSlug): bool
    {
        $resolved = HaditsController::resolveKitabSlug($kitabSlug);
        if (!$resolved) {
            return false;
        }

        try {
            $store = Cache::getStore();
            if ($store instanceof RedisStore) {
                $redis = $store->connection();
                $cachePrefix = $store->getPrefix();
                $connPrefix = $this->getRedisConnectionPrefix($redis);

                $patterns = [
                    $cachePrefix . "hadits:kitab:{$resolved}:*",
                    $cachePrefix . "hadits:detail:{$resolved}:*",
                    $cachePrefix . "hadits:kategori:{$resolved}",
                ];

                foreach ($patterns as $pattern) {
                    $keys = $redis->keys($pattern);
                    if (!empty($keys)) {
                        $keysToDelete = array_map(function ($k) use ($connPrefix) {
                            if ($connPrefix !== '' && str_starts_with($k, $connPrefix)) {
                                return substr($k, strlen($connPrefix));
                            }
                            return $k;
                        }, $keys);

                        $redis->del($keysToDelete);
                    }
                }
            } else {
                Cache::flush();
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning("HaditsCacheService: clearKitabCache failed for {$kitabSlug}", ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Determine Redis connection prefix (configured in predis or phpredis)
     *
     * @param mixed $redis
     * @return string
     */
    private function getRedisConnectionPrefix($redis): string
    {
        if (method_exists($redis, 'getOptions') && $redis->getOptions()->prefix) {
            return (string) $redis->getOptions()->prefix->getPrefix();
        }

        if (defined('Redis::OPT_PREFIX') && method_exists($redis, 'getOption')) {
            $optPrefix = constant('Redis::OPT_PREFIX');
            $val = $redis->getOption($optPrefix);
            if (!empty($val)) {
                return (string) $val;
            }
        }

        return (string) config('database.redis.options.prefix', '');
    }
}
