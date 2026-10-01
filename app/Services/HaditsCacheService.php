<?php

namespace App\Services;

use App\Http\Controllers\HaditsController;
use Illuminate\Cache\RedisStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                ['kitab' => 'riyadhus_shalihin', 'id' => 2, 'theme' => 'Kewajiban Taubat'],
            ];

            $catalog = HaditsController::getKitabCatalog();
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
            $hadits = DB::table($table)->where('id', $nomor)->first();

            if (!$hadits) {
                return null;
            }

            // Find previous and next IDs
            $prev = DB::table($table)->where('id', '<', $nomor)->orderBy('id', 'desc')->select('id')->first();
            $next = DB::table($table)->where('id', '>', $nomor)->orderBy('id', 'asc')->select('id')->first();

            return [
                'status' => 'success',
                'kitab' => $kitabInfo,
                'hadits' => $hadits,
                'navigation' => [
                    'prev_nomor' => $prev?->id,
                    'next_nomor' => $next?->id,
                    'total' => $kitabInfo['total']
                ]
            ];
        });
    }

    /**
     * Get hadiths from a specific book with pagination & search, cached
     */
    public function getKitabHadits(string $kitabSlug, int $page = 1, int $perPage = 20, string $search = '', ?int $nomor = null): ?array
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

        // If jumping directly to a number without search
        $targetPage = $page;
        if ($nomor !== null && empty($cleanSearch)) {
            $targetPage = (int) ceil(max($nomor, 1) / $perPage);
        }

        // Build granular cache key
        $searchHash = !empty($cleanSearch) ? md5(mb_strtolower($cleanSearch)) : 'none';
        $nomorKey = $nomor !== null ? (string) $nomor : 'none';
        $cacheKey = $this->getPrefix('kitab') . "{$resolved}:p{$targetPage}:pp{$perPage}:s{$searchHash}:n{$nomorKey}";
        $ttl = empty($cleanSearch) ? $this->getTtl('kitab_page') : $this->getTtl('search');

        return Cache::remember($cacheKey, $ttl, function () use ($kitabInfo, $perPage, $cleanSearch, $nomor, $targetPage) {
            $table = $kitabInfo['table'];
            $query = DB::table($table);

            if (!empty($cleanSearch)) {
                $query->where(function ($q) use ($cleanSearch) {
                    $q->where('terjemah', 'like', '%' . $cleanSearch . '%')
                      ->orWhere('arab', 'like', '%' . $cleanSearch . '%');
                });
            }

            $total = (clone $query)->count();
            $lastPage = (int) max(ceil($total / $perPage), 1);
            $offset = ($targetPage - 1) * $perPage;

            $items = $query->orderBy('id', 'asc')
                ->offset($offset)
                ->limit($perPage)
                ->get();

            return [
                'status' => 'success',
                'kitab' => $kitabInfo,
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

            // Case 1: Search in a specific book
            if ($kitabScope !== 'all' && !empty($kitabScope)) {
                $resolved = HaditsController::resolveKitabSlug($kitabScope);
                if (!$resolved || !isset($catalog[$resolved])) {
                    throw new \InvalidArgumentException('Kitab hadits yang dipilih tidak valid');
                }

                $kitabInfo = $catalog[$resolved];
                $table = $kitabInfo['table'];

                $query = DB::table($table);
                $applySearchFilter($query);

                $total = (clone $query)->count();
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
                    'id' => $row->id,
                    'kitab_slug' => $row->kitab_slug,
                    'kitab_name' => $info ? $info['name'] : $row->kitab_slug,
                    'kitab_arab' => $info ? $info['arab'] : '',
                    'category' => $info ? $info['category'] : '',
                    'arab' => $row->arab,
                    'terjemah' => $row->terjemah,
                ];
            });

            return [
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
            Cache::forget($this->getPrefix('featured') . 'daily:' . date('Y-m-d'));
            Cache::forget('hadits_featured_daily');

            // If Redis store is used, flush pattern matching keys
            $store = Cache::getStore();
            if ($store instanceof RedisStore) {
                $prefix = config('database.redis.options.prefix', '') . config('cache.prefix', '') . 'hadits:';
                $redis = $store->connection();
                $keys = $redis->keys($prefix . '*');
                if (!empty($keys)) {
                    $redis->del($keys);
                }
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('HaditsCacheService: clearAllCache failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
