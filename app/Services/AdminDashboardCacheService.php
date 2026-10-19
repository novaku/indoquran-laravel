<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleComment;
use App\Models\Ayah;
use App\Models\Contact;
use App\Models\Prayer;
use App\Models\SearchTerm;
use App\Models\Surah;
use App\Models\User;
use App\Models\Visitor;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdminDashboardCacheService
{
    /**
     * Cache key constants for dashboard data
     */
    public const PREFIX = 'admin:dashboard:';
    public const KEY_FULL_PAYLOAD = 'admin:dashboard:full_payload';

    // Stats keys
    public const KEY_STAT_USERS = 'admin:dashboard:stat:users';
    public const KEY_STAT_ARTICLES = 'admin:dashboard:stat:articles';
    public const KEY_STAT_PUBLISHED_ARTICLES = 'admin:dashboard:stat:published_articles';
    public const KEY_STAT_COMMENTS = 'admin:dashboard:stat:comments';
    public const KEY_STAT_CONTACTS = 'admin:dashboard:stat:contacts';
    public const KEY_STAT_PRAYERS = 'admin:dashboard:stat:prayers';
    public const KEY_STAT_SEARCH_TERMS = 'admin:dashboard:stat:search_terms';
    public const KEY_STAT_SURAHS = 'admin:dashboard:stat:surahs';
    public const KEY_STAT_AYAHS = 'admin:dashboard:stat:ayahs';
    public const KEY_STAT_VISITORS_TODAY = 'admin:dashboard:stat:visitors_today';
    public const KEY_STAT_VISITORS_WEEKLY = 'admin:dashboard:stat:visitors_weekly';
    public const KEY_STAT_VISITORS_MONTHLY = 'admin:dashboard:stat:visitors_monthly';
    public const KEY_STAT_VISITORS_TOTAL = 'admin:dashboard:stat:visitors_total';

    // Recent activities keys
    public const KEY_RECENT_CONTACTS = 'admin:dashboard:recent:contacts';
    public const KEY_RECENT_PRAYERS = 'admin:dashboard:recent:prayers';
    public const KEY_RECENT_USERS = 'admin:dashboard:recent:users';
    public const KEY_RECENT_SEARCHES = 'admin:dashboard:recent:searches';

    // Traffic data keys
    public const KEY_TRAFFIC_DAILY = 'admin:dashboard:traffic:daily';
    public const KEY_TRAFFIC_HOURLY = 'admin:dashboard:traffic:hourly';
    public const KEY_TRAFFIC_POPULAR_PAGES = 'admin:dashboard:traffic:popular_pages';
    public const KEY_TRAFFIC_POPULAR_SURAHS = 'admin:dashboard:traffic:popular_surahs';

    /**
     * Default TTL configurations in seconds
     */
    protected const TTL_FULL_PAYLOAD = 180;        // 3 minutes
    protected const TTL_QUICK_STATS = 180;          // 3 minutes (daily visitors, comments, contacts, prayers)
    protected const TTL_MEDIUM_STATS = 300;         // 5 minutes (users, weekly visitors, hourly traffic, articles)
    protected const TTL_HEAVY_STATS = 600;          // 10 minutes (monthly visitors, total visitors, daily traffic, popular pages, searches)
    protected const TTL_STATIC = 86400;             // 24 hours (surahs, ayahs)

    /**
     * Get complete dashboard payload, using master cache or aggregating individual caches.
     *
     * @param bool $forceRefresh
     * @return array
     */
    public function getDashboardData(bool $forceRefresh = false): array
    {
        if (!$forceRefresh && Cache::has(self::KEY_FULL_PAYLOAD)) {
            $data = Cache::get(self::KEY_FULL_PAYLOAD);
            if (is_array($data) && !empty($data['stats'])) {
                $data['from_cache'] = true;
                return $data;
            }
        }

        $data = [
            'stats' => $this->getStats($forceRefresh),
            'recent_activities' => $this->getRecentActivities($forceRefresh),
            'traffic_data' => $this->getTrafficData($forceRefresh),
            'cached_at' => now()->toIso8601String(),
            'from_cache' => false,
        ];

        Cache::put(self::KEY_FULL_PAYLOAD, $data, self::TTL_FULL_PAYLOAD);

        return $data;
    }

    /**
     * Get all statistics array with per-stat caching.
     *
     * @param bool $forceRefresh
     * @return array
     */
    public function getStats(bool $forceRefresh = false): array
    {
        return [
            'total_users' => $this->getTotalUsers($forceRefresh),
            'total_articles' => $this->getTotalArticles($forceRefresh),
            'published_articles' => $this->getPublishedArticles($forceRefresh),
            'total_article_comments' => $this->getTotalArticleComments($forceRefresh),
            'total_contacts' => $this->getTotalContacts($forceRefresh),
            'total_prayers' => $this->getTotalPrayers($forceRefresh),
            'total_search_terms' => $this->getTotalSearchTerms($forceRefresh),
            'total_surahs' => $this->getTotalSurahs($forceRefresh),
            'total_ayahs' => $this->getTotalAyahs($forceRefresh),
            'daily_visitors' => $this->getDailyVisitors($forceRefresh),
            'weekly_visitors' => $this->getWeeklyVisitors($forceRefresh),
            'monthly_visitors' => $this->getMonthlyVisitors($forceRefresh),
            'total_visitors' => $this->getTotalVisitors($forceRefresh),
        ];
    }

    /**
     * Get recent activities with individual caching.
     *
     * @param bool $forceRefresh
     * @return array
     */
    public function getRecentActivities(bool $forceRefresh = false): array
    {
        return [
            'contacts' => $this->getRecentContacts($forceRefresh),
            'prayers' => $this->getRecentPrayers($forceRefresh),
            'users' => $this->getRecentUsers($forceRefresh),
            'popular_searches' => $this->getPopularSearches($forceRefresh),
        ];
    }

    /**
     * Get traffic data with individual caching.
     *
     * @param bool $forceRefresh
     * @return array
     */
    public function getTrafficData(bool $forceRefresh = false): array
    {
        return [
            'daily_traffic' => $this->getDailyTraffic($forceRefresh),
            'hourly_traffic' => $this->getHourlyTraffic($forceRefresh),
            'popular_pages' => $this->getPopularPages($forceRefresh),
            'popular_surahs' => $this->getPopularSurahs($forceRefresh),
        ];
    }

    // --- Stats Individual Methods ---

    public function getTotalUsers(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_USERS);
        return (int) Cache::remember(self::KEY_STAT_USERS, self::TTL_MEDIUM_STATS, function () {
            try { return User::count(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getTotalArticles(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_ARTICLES);
        return (int) Cache::remember(self::KEY_STAT_ARTICLES, self::TTL_MEDIUM_STATS, function () {
            try { return Article::count(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getPublishedArticles(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_PUBLISHED_ARTICLES);
        return (int) Cache::remember(self::KEY_STAT_PUBLISHED_ARTICLES, self::TTL_MEDIUM_STATS, function () {
            try { return Article::where('status', 'published')->count(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getTotalArticleComments(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_COMMENTS);
        return (int) Cache::remember(self::KEY_STAT_COMMENTS, self::TTL_QUICK_STATS, function () {
            try { return ArticleComment::count(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getTotalContacts(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_CONTACTS);
        return (int) Cache::remember(self::KEY_STAT_CONTACTS, self::TTL_QUICK_STATS, function () {
            try { return Contact::count(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getTotalPrayers(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_PRAYERS);
        return (int) Cache::remember(self::KEY_STAT_PRAYERS, self::TTL_QUICK_STATS, function () {
            try { return Prayer::count(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getTotalSearchTerms(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_SEARCH_TERMS);
        return (int) Cache::remember(self::KEY_STAT_SEARCH_TERMS, self::TTL_MEDIUM_STATS, function () {
            try { return SearchTerm::count(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getTotalSurahs(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_SURAHS);
        return (int) Cache::remember(self::KEY_STAT_SURAHS, self::TTL_STATIC, function () {
            try { return Surah::count() ?: 114; } catch (\Throwable $e) { return 114; }
        });
    }

    public function getTotalAyahs(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_AYAHS);
        return (int) Cache::remember(self::KEY_STAT_AYAHS, self::TTL_STATIC, function () {
            try { return Ayah::count() ?: 6236; } catch (\Throwable $e) { return 6236; }
        });
    }

    public function getDailyVisitors(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_VISITORS_TODAY);
        return (int) Cache::remember(self::KEY_STAT_VISITORS_TODAY, self::TTL_QUICK_STATS, function () {
            try { return Visitor::getTodayVisitors(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getWeeklyVisitors(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_VISITORS_WEEKLY);
        return (int) Cache::remember(self::KEY_STAT_VISITORS_WEEKLY, self::TTL_MEDIUM_STATS, function () {
            try { return Visitor::getWeeklyVisitors(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getMonthlyVisitors(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_VISITORS_MONTHLY);
        return (int) Cache::remember(self::KEY_STAT_VISITORS_MONTHLY, self::TTL_HEAVY_STATS, function () {
            try { return Visitor::getMonthlyVisitors(); } catch (\Throwable $e) { return 0; }
        });
    }

    public function getTotalVisitors(bool $forceRefresh = false): int
    {
        if ($forceRefresh) Cache::forget(self::KEY_STAT_VISITORS_TOTAL);
        return (int) Cache::remember(self::KEY_STAT_VISITORS_TOTAL, self::TTL_HEAVY_STATS, function () {
            try { return Visitor::getTotalVisitors(); } catch (\Throwable $e) { return 0; }
        });
    }

    // --- Recent Activities Methods ---

    public function getRecentContacts(bool $forceRefresh = false): array
    {
        if ($forceRefresh) Cache::forget(self::KEY_RECENT_CONTACTS);
        return Cache::remember(self::KEY_RECENT_CONTACTS, self::TTL_QUICK_STATS, function () {
            try {
                return Contact::latest()->take(5)->get()->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'name' => $c->name,
                        'email' => $c->email,
                        'subject' => $c->subject,
                        'message' => $c->message,
                        'is_read' => (bool) $c->is_read,
                        'created_at' => $c->created_at?->toIso8601String(),
                    ];
                })->all();
            } catch (\Throwable $e) {
                Log::error('Error fetching recent contacts for dashboard: ' . $e->getMessage());
                return [];
            }
        });
    }

    public function getRecentPrayers(bool $forceRefresh = false): array
    {
        if ($forceRefresh) Cache::forget(self::KEY_RECENT_PRAYERS);
        return Cache::remember(self::KEY_RECENT_PRAYERS, self::TTL_QUICK_STATS, function () {
            try {
                return Prayer::with('user:id,name')->latest()->take(5)->get()->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'title' => $p->title,
                        'content' => $p->content,
                        'created_at' => $p->created_at?->toIso8601String(),
                        'user' => $p->user ? [
                            'id' => $p->user->id,
                            'name' => $p->user->name,
                        ] : null,
                    ];
                })->all();
            } catch (\Throwable $e) {
                Log::error('Error fetching recent prayers for dashboard: ' . $e->getMessage());
                return [];
            }
        });
    }

    public function getRecentUsers(bool $forceRefresh = false): array
    {
        if ($forceRefresh) Cache::forget(self::KEY_RECENT_USERS);
        return Cache::remember(self::KEY_RECENT_USERS, self::TTL_MEDIUM_STATS, function () {
            try {
                return User::select('id', 'name', 'email', 'created_at')->latest()->take(5)->get()->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'created_at' => $u->created_at?->toIso8601String(),
                    ];
                })->all();
            } catch (\Throwable $e) {
                Log::error('Error fetching recent users for dashboard: ' . $e->getMessage());
                return [];
            }
        });
    }

    public function getPopularSearches(bool $forceRefresh = false): array
    {
        if ($forceRefresh) Cache::forget(self::KEY_RECENT_SEARCHES);
        return Cache::remember(self::KEY_RECENT_SEARCHES, self::TTL_HEAVY_STATS, function () {
            try {
                return SearchTerm::select('term')
                    ->selectRaw('COUNT(*) as search_count')
                    ->groupBy('term')
                    ->orderByDesc('search_count')
                    ->take(10)
                    ->get()
                    ->toArray();
            } catch (\Throwable $e) {
                Log::error('Error fetching popular searches for dashboard: ' . $e->getMessage());
                return [];
            }
        });
    }

    // --- Traffic Data Methods ---

    public function getDailyTraffic(bool $forceRefresh = false)
    {
        if ($forceRefresh) Cache::forget(self::KEY_TRAFFIC_DAILY);
        return Cache::remember(self::KEY_TRAFFIC_DAILY, self::TTL_HEAVY_STATS, function () {
            try {
                return Visitor::getDailyTraffic(7);
            } catch (\Throwable $e) {
                Log::error('Error fetching daily traffic for dashboard: ' . $e->getMessage());
                return [];
            }
        });
    }

    public function getHourlyTraffic(bool $forceRefresh = false)
    {
        if ($forceRefresh) Cache::forget(self::KEY_TRAFFIC_HOURLY);
        return Cache::remember(self::KEY_TRAFFIC_HOURLY, self::TTL_MEDIUM_STATS, function () {
            try {
                return Visitor::getHourlyTraffic();
            } catch (\Throwable $e) {
                Log::error('Error fetching hourly traffic for dashboard: ' . $e->getMessage());
                return [];
            }
        });
    }

    public function getPopularPages(bool $forceRefresh = false)
    {
        if ($forceRefresh) Cache::forget(self::KEY_TRAFFIC_POPULAR_PAGES);
        return Cache::remember(self::KEY_TRAFFIC_POPULAR_PAGES, self::TTL_HEAVY_STATS, function () {
            try {
                return Visitor::getPopularPages(10);
            } catch (\Throwable $e) {
                Log::error('Error fetching popular pages for dashboard: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    public function getPopularSurahs(bool $forceRefresh = false)
    {
        if ($forceRefresh) Cache::forget(self::KEY_TRAFFIC_POPULAR_SURAHS);
        return Cache::remember(self::KEY_TRAFFIC_POPULAR_SURAHS, self::TTL_HEAVY_STATS, function () {
            try {
                $popularSurahs = Visitor::getPopularSurahs(10);
                if ($popularSurahs->isEmpty()) {
                    return collect([]);
                }

                $surahNumbers = $popularSurahs->pluck('surah_number')->filter()->unique()->all();
                $surahs = Surah::whereIn('number', $surahNumbers)->get()->keyBy('number');

                return $popularSurahs->map(function ($item) use ($surahs) {
                    $num = $item['surah_number'];
                    $surah = $surahs->get($num);

                    return [
                        'surah_number' => $num,
                        'surah_name' => $surah ? $surah->name : "Surah #{$num}",
                        'surah_name_arabic' => $surah ? $surah->name_arabic : '',
                        'visit_count' => $item['visit_count'],
                        'url' => $item['url']
                    ];
                })->values();
            } catch (\Throwable $e) {
                Log::error('Error getting popular surahs for dashboard: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    // --- Cache Invalidation Methods ---

    /**
     * Clear all admin dashboard caches.
     */
    public function clearAll(): void
    {
        Cache::forget(self::KEY_FULL_PAYLOAD);

        Cache::forget(self::KEY_STAT_USERS);
        Cache::forget(self::KEY_STAT_ARTICLES);
        Cache::forget(self::KEY_STAT_PUBLISHED_ARTICLES);
        Cache::forget(self::KEY_STAT_COMMENTS);
        Cache::forget(self::KEY_STAT_CONTACTS);
        Cache::forget(self::KEY_STAT_PRAYERS);
        Cache::forget(self::KEY_STAT_SEARCH_TERMS);
        Cache::forget(self::KEY_STAT_SURAHS);
        Cache::forget(self::KEY_STAT_AYAHS);
        Cache::forget(self::KEY_STAT_VISITORS_TODAY);
        Cache::forget(self::KEY_STAT_VISITORS_WEEKLY);
        Cache::forget(self::KEY_STAT_VISITORS_MONTHLY);
        Cache::forget(self::KEY_STAT_VISITORS_TOTAL);

        Cache::forget(self::KEY_RECENT_CONTACTS);
        Cache::forget(self::KEY_RECENT_PRAYERS);
        Cache::forget(self::KEY_RECENT_USERS);
        Cache::forget(self::KEY_RECENT_SEARCHES);

        Cache::forget(self::KEY_TRAFFIC_DAILY);
        Cache::forget(self::KEY_TRAFFIC_HOURLY);
        Cache::forget(self::KEY_TRAFFIC_POPULAR_PAGES);
        Cache::forget(self::KEY_TRAFFIC_POPULAR_SURAHS);

        Log::info('AdminDashboardCacheService: Cleared all dashboard caches');
    }

    /**
     * Clear contact-related dashboard caches.
     */
    public function clearContacts(): void
    {
        Cache::forget(self::KEY_FULL_PAYLOAD);
        Cache::forget(self::KEY_STAT_CONTACTS);
        Cache::forget(self::KEY_RECENT_CONTACTS);
    }

    /**
     * Clear article-related dashboard caches.
     */
    public function clearArticles(): void
    {
        Cache::forget(self::KEY_FULL_PAYLOAD);
        Cache::forget(self::KEY_STAT_ARTICLES);
        Cache::forget(self::KEY_STAT_PUBLISHED_ARTICLES);
    }

    /**
     * Clear comment-related dashboard caches.
     */
    public function clearComments(): void
    {
        Cache::forget(self::KEY_FULL_PAYLOAD);
        Cache::forget(self::KEY_STAT_COMMENTS);
    }

    /**
     * Clear prayer-related dashboard caches.
     */
    public function clearPrayers(): void
    {
        Cache::forget(self::KEY_FULL_PAYLOAD);
        Cache::forget(self::KEY_STAT_PRAYERS);
        Cache::forget(self::KEY_RECENT_PRAYERS);
    }

    /**
     * Clear user-related dashboard caches.
     */
    public function clearUsers(): void
    {
        Cache::forget(self::KEY_FULL_PAYLOAD);
        Cache::forget(self::KEY_STAT_USERS);
        Cache::forget(self::KEY_RECENT_USERS);
    }
}
