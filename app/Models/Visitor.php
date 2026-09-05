<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * @method static \Illuminate\Database\Eloquent\Builder selectRaw(string $expression, array $bindings = [])
 * @method static \Illuminate\Database\Eloquent\Builder where($column, $operator = null, $value = null, $boolean = 'and')
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class Visitor extends Model
{
    protected $fillable = [
        'ip_address',
        'user_agent',
        'visited_at',
        'page_url',
        'referrer',
        'session_id'
    ];

    protected $casts = [
        'visited_at' => 'datetime'
    ];

    /**
     * Get daily traffic for the given number of days in a single grouped query.
     */
    public static function getDailyTraffic($days = 7)
    {
        try {
            $startDate = now()->subDays($days - 1)->startOfDay();
            $endDate = now()->endOfDay();

            $grouped = self::query()->where('visited_at', '>=', $startDate)
                           ->where('visited_at', '<=', $endDate)
                           ->selectRaw('DATE(visited_at) as visit_date, COUNT(DISTINCT ip_address) as visitors')
                           ->groupBy('visit_date')
                           ->pluck('visitors', 'visit_date')
                           ->toArray();

            $data = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i)->format('Y-m-d');
                $data[] = [
                    'date' => $date,
                    'visitors' => (int) ($grouped[$date] ?? 0)
                ];
            }

            return $data;
        } catch (\Exception $e) {
            Log::error('Error getting daily traffic: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get hourly traffic for today in a single grouped query.
     */
    public static function getHourlyTraffic()
    {
        try {
            $startToday = today()->startOfDay();
            $endToday = today()->endOfDay();

            $grouped = self::query()->where('visited_at', '>=', $startToday)
                           ->where('visited_at', '<=', $endToday)
                           ->selectRaw('HOUR(visited_at) as visit_hour, COUNT(DISTINCT ip_address) as visitors')
                           ->groupBy('visit_hour')
                           ->pluck('visitors', 'visit_hour')
                           ->toArray();

            $data = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $data[] = [
                    'hour' => $hour,
                    'visitors' => (int) ($grouped[$hour] ?? 0)
                ];
            }

            return $data;
        } catch (\Exception $e) {
            Log::error('Error getting hourly traffic: ' . $e->getMessage());
            return [];
        }
    }

    public static function getTodayVisitors()
    {
        try {
            return self::query()->where('visited_at', '>=', today()->startOfDay())
                       ->where('visited_at', '<=', today()->endOfDay())
                       ->distinct()
                       ->count('ip_address');
        } catch (\Exception $e) {
            Log::error('Error getting today visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getWeeklyVisitors()
    {
        try {
            return self::query()->where('visited_at', '>=', now()->startOfWeek())
                       ->where('visited_at', '<=', now()->endOfWeek())
                       ->distinct()
                       ->count('ip_address');
        } catch (\Exception $e) {
            Log::error('Error getting weekly visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getMonthlyVisitors()
    {
        try {
            return self::query()->where('visited_at', '>=', now()->startOfMonth())
                       ->where('visited_at', '<=', now()->endOfMonth())
                       ->distinct()
                       ->count('ip_address');
        } catch (\Exception $e) {
            Log::error('Error getting monthly visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getTotalVisitors()
    {
        try {
            return self::distinct()->count('ip_address');
        } catch (\Exception $e) {
            Log::error('Error getting total visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getPopularPages($limit = 10)
    {
        try {
            return self::select('page_url')
                       ->selectRaw('COUNT(*) as visit_count')
                       ->whereNotNull('page_url')
                       ->where('page_url', '!=', '')
                       ->groupBy('page_url')
                       ->orderByDesc('visit_count')
                       ->take($limit)
                       ->get()
                       ->map(function ($item) {
                           $url = parse_url($item->page_url, PHP_URL_PATH);
                           $query = parse_url($item->page_url, PHP_URL_QUERY);
                           
                           $pageInfo = self::categorizeUrl(is_string($url) ? $url : null, is_string($query) ? $query : null);
                           
                           return [
                               'url' => $item->page_url,
                               'path' => $url,
                               'visit_count' => (int) $item->visit_count,
                               'page_type' => $pageInfo['type'],
                               'page_title' => $pageInfo['title'],
                               'surah_number' => $pageInfo['surah_number'] ?? null
                           ];
                       });
        } catch (\Exception $e) {
            Log::error('Error getting popular pages: ' . $e->getMessage());
            return collect([]);
        }
    }

    public static function getPopularSurahs($limit = 10)
    {
        try {
            return self::select('page_url')
                       ->selectRaw('COUNT(*) as visit_count')
                       ->whereNotNull('page_url')
                       ->where(function($query) {
                           $query->where('page_url', 'LIKE', '%/surah/%')
                                 ->orWhere('page_url', 'LIKE', '%/surat/%');
                       })
                       ->groupBy('page_url')
                       ->orderByDesc('visit_count')
                       ->take($limit)
                       ->get()
                       ->map(function ($item) {
                           $path = parse_url($item->page_url, PHP_URL_PATH);
                           preg_match('/\/(surah|surat)\/(\d+)/', $path, $matches);
                           $surahNumber = isset($matches[2]) ? (int) $matches[2] : null;
                           
                           return [
                               'surah_number' => $surahNumber,
                               'visit_count' => (int) $item->visit_count,
                               'url' => $item->page_url
                           ];
                       })
                       ->filter(function ($item) {
                           return !is_null($item['surah_number']) && $item['surah_number'] >= 1 && $item['surah_number'] <= 114;
                       })
                       ->values();
        } catch (\Exception $e) {
            Log::error('Error getting popular surahs: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Categorize URL path into page types.
     *
     * @param string|null $path
     * @param string|null $query
     * @return array<string, mixed>
     */
    private static function categorizeUrl(?string $path, ?string $query = null): array
    {
        if (empty($path) || $path === '/') {
            return ['type' => 'homepage', 'title' => 'Beranda'];
        }

        // Surah pages
        if (preg_match('/\/surah\/(\d+)/', $path, $matches)) {
            $surahNumber = $matches[1];
            return [
                'type' => 'surah',
                'title' => "Surah #{$surahNumber}",
                'surah_number' => $surahNumber
            ];
        }

        // Prayer pages
        if (str_contains($path, '/doa-bersama')) {
            return ['type' => 'prayer', 'title' => 'Doa Bersama'];
        }

        // Search pages
        if (str_contains($path, '/search') || str_contains($path, '/cari')) {
            return ['type' => 'search', 'title' => 'Pencarian'];
        }

        // Contact page
        if (str_contains($path, '/contact') || str_contains($path, '/kontak')) {
            return ['type' => 'contact', 'title' => 'Kontak'];
        }

        // Juz pages
        if (str_contains($path, '/juz')) {
            return ['type' => 'juz', 'title' => 'Juz'];
        }

        // Page reading
        if (str_contains($path, '/halaman')) {
            return ['type' => 'page', 'title' => 'Halaman'];
        }

        return ['type' => 'other', 'title' => ucfirst(trim($path, '/'))];
    }

    public static function getYearlyVisitors($year = null)
    {
        try {
            $target = $year ? Carbon::createFromDate($year, 1, 1) : now();
            return self::query()->where('visited_at', '>=', $target->copy()->startOfYear())
                       ->where('visited_at', '<=', $target->copy()->endOfYear())
                       ->distinct()
                       ->count('ip_address');
        } catch (\Exception $e) {
            Log::error('Error getting yearly visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getTopReferrers($limit = 10)
    {
        try {
            return self::select('referrer')
                       ->selectRaw('COUNT(*) as visit_count')
                       ->whereNotNull('referrer')
                       ->where('referrer', '!=', '')
                       ->groupBy('referrer')
                       ->orderByDesc('visit_count')
                       ->take($limit)
                       ->get()
                       ->map(function ($item) {
                           $domain = parse_url($item->referrer, PHP_URL_HOST);
                           return [
                               'referrer' => $item->referrer,
                               'domain' => $domain,
                               'visit_count' => (int) $item->visit_count
                           ];
                       });
        } catch (\Exception $e) {
            Log::error('Error getting top referrers: ' . $e->getMessage());
            return collect([]);
        }
    }

    public static function getBrowserStats()
    {
        try {
            return self::query()->selectRaw('
                    CASE 
                        WHEN user_agent LIKE "%Chrome%" AND user_agent NOT LIKE "%Edge%" THEN "Chrome"
                        WHEN user_agent LIKE "%Firefox%" THEN "Firefox"
                        WHEN user_agent LIKE "%Safari%" AND user_agent NOT LIKE "%Chrome%" THEN "Safari"
                        WHEN user_agent LIKE "%Edge%" THEN "Edge"
                        WHEN user_agent LIKE "%Opera%" THEN "Opera"
                        ELSE "Other"
                    END as browser,
                    COUNT(*) as count
                ', [])
                ->groupBy('browser')
                ->orderByDesc('count')
                ->get();
        } catch (\Exception $e) {
            Log::error('Error getting browser stats: ' . $e->getMessage());
            return collect([]);
        }
    }

    public static function getDeviceStats()
    {
        try {
            return self::query()->selectRaw('
                    CASE 
                        WHEN user_agent LIKE "%Mobile%" OR user_agent LIKE "%Android%" OR user_agent LIKE "%iPhone%" THEN "Mobile"
                        WHEN user_agent LIKE "%Tablet%" OR user_agent LIKE "%iPad%" THEN "Tablet"
                        ELSE "Desktop"
                    END as device_type,
                    COUNT(*) as count
                ', [])
                ->groupBy('device_type')
                ->orderByDesc('count')
                ->get();
        } catch (\Exception $e) {
            Log::error('Error getting device stats: ' . $e->getMessage());
            return collect([]);
        }
    }

    public static function getUniqueVisitorsLast($days = 7)
    {
        try {
            $startDate = now()->subDays($days - 1)->startOfDay();
            $endDate = now()->endOfDay();

            $grouped = self::query()->where('visited_at', '>=', $startDate)
                           ->where('visited_at', '<=', $endDate)
                           ->selectRaw('DATE(visited_at) as visit_date, COUNT(DISTINCT ip_address) as visitors, COUNT(*) as page_views')
                           ->groupBy('visit_date')
                           ->get()
                           ->keyBy('visit_date');

            $data = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $dateObj = now()->subDays($i);
                $dateStr = $dateObj->format('Y-m-d');
                $record = $grouped->get($dateStr);
                $visitors = (int) ($record->visitors ?? 0);
                $pageViews = (int) ($record->page_views ?? 0);

                $data[] = [
                    'date' => $dateStr,
                    'date_formatted' => $dateObj->format('d M Y'),
                    'visitors' => $visitors,
                    'page_views' => $pageViews,
                    'avg_pages_per_visitor' => $visitors > 0 ? round($pageViews / $visitors, 2) : 0
                ];
            }

            return $data;
        } catch (\Exception $e) {
            Log::error('Error getting unique visitors data: ' . $e->getMessage());
            return [];
        }
    }
}
