<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public static function getDailyTraffic($days = 7)
    {
        try {
            $data = [];
            
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i)->format('Y-m-d');
                $visitors = self::whereDate('visited_at', $date)
                               ->distinct('ip_address')
                               ->count('ip_address');
                
                $data[] = [
                    'date' => $date,
                    'visitors' => $visitors
                ];
            }
            
            return $data;
        } catch (\Exception $e) {
            \Log::error('Error getting daily traffic: ' . $e->getMessage());
            return [];
        }
    }

    public static function getHourlyTraffic()
    {
        try {
            $data = [];
            
            for ($hour = 0; $hour < 24; $hour++) {
                $nextHour = $hour + 1;
                if ($nextHour >= 24) {
                    // For hour 23, check until end of day
                    $visitors = self::whereDate('visited_at', today())
                                   ->whereTime('visited_at', '>=', sprintf('%02d:00:00', $hour))
                                   ->whereTime('visited_at', '<=', '23:59:59')
                                   ->distinct('ip_address')
                                   ->count('ip_address');
                } else {
                    $visitors = self::whereDate('visited_at', today())
                                   ->whereTime('visited_at', '>=', sprintf('%02d:00:00', $hour))
                                   ->whereTime('visited_at', '<', sprintf('%02d:00:00', $nextHour))
                                   ->distinct('ip_address')
                                   ->count('ip_address');
                }
                
                $data[] = [
                    'hour' => $hour,
                    'visitors' => $visitors
                ];
            }
            
            return $data;
        } catch (\Exception $e) {
            \Log::error('Error getting hourly traffic: ' . $e->getMessage());
            return [];
        }
    }

    public static function getTodayVisitors()
    {
        try {
            return self::whereDate('visited_at', today())
                       ->distinct('ip_address')
                       ->count('ip_address');
        } catch (\Exception $e) {
            \Log::error('Error getting today visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getWeeklyVisitors()
    {
        try {
            return self::whereBetween('visited_at', [now()->startOfWeek(), now()->endOfWeek()])
                       ->distinct('ip_address')
                       ->count('ip_address');
        } catch (\Exception $e) {
            \Log::error('Error getting weekly visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getMonthlyVisitors()
    {
        try {
            return self::whereMonth('visited_at', now()->month)
                       ->whereYear('visited_at', now()->year)
                       ->distinct('ip_address')
                       ->count('ip_address');
        } catch (\Exception $e) {
            \Log::error('Error getting monthly visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getTotalVisitors()
    {
        try {
            return self::distinct('ip_address')->count('ip_address');
        } catch (\Exception $e) {
            \Log::error('Error getting total visitors: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getPopularPages($limit = 10)
    {
        try {
            return self::select('page_url')
                       ->selectRaw('COUNT(*) as visit_count')
                       ->whereNotNull('page_url')
                       ->groupBy('page_url')
                       ->orderByDesc('visit_count')
                       ->take($limit)
                       ->get()
                       ->map(function ($item) {
                           // Extract meaningful page info
                           $url = parse_url($item->page_url, PHP_URL_PATH);
                           $query = parse_url($item->page_url, PHP_URL_QUERY);
                           
                           // Determine page type
                           $pageInfo = self::categorizeUrl($url, $query);
                           
                           return [
                               'url' => $item->page_url,
                               'path' => $url,
                               'visit_count' => $item->visit_count,
                               'page_type' => $pageInfo['type'],
                               'page_title' => $pageInfo['title'],
                               'surah_number' => $pageInfo['surah_number'] ?? null
                           ];
                       });
        } catch (\Exception $e) {
            \Log::error('Error getting popular pages: ' . $e->getMessage());
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
                           $surahNumber = $matches[2] ?? null;
                           
                           return [
                               'surah_number' => $surahNumber,
                               'visit_count' => $item->visit_count,
                               'url' => $item->page_url
                           ];
                       })
                       ->filter(function ($item) {
                           return !is_null($item['surah_number']) && $item['surah_number'] >= 1 && $item['surah_number'] <= 114;
                       });
        } catch (\Exception $e) {
            \Log::error('Error getting popular surahs: ' . $e->getMessage());
            return collect([]);
        }
    }

    private static function categorizeUrl($path, $query = null)
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
}
