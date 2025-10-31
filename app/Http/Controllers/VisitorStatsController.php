<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Visitor;
use Carbon\Carbon;

class VisitorStatsController extends Controller
{
    /**
     * Display the visitor statistics page.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $stats = [
                'summary' => $this->getSummaryStats(),
                'daily' => $this->getDailyStats(),
                'weekly' => $this->getWeeklyStats(),
                'monthly' => $this->getMonthlyStats(),
                'yearly' => $this->getYearlyStats(),
                'hourly' => $this->getHourlyStats(),
                'popular_pages' => $this->getPopularPages(),
                'popular_surahs' => $this->getPopularSurahs(),
                'browser_stats' => $this->getBrowserStats(),
                'device_stats' => $this->getDeviceStats(),
                'referrer_stats' => $this->getReferrerStats()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'generated_at' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating visitor statistics: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik pengunjung',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get summary statistics.
     *
     * @return array
     */
    private function getSummaryStats()
    {
        return [
            'today' => Visitor::getTodayVisitors(),
            'weekly' => Visitor::getWeeklyVisitors(),
            'monthly' => Visitor::getMonthlyVisitors(),
            'total' => Visitor::getTotalVisitors(),
            'yesterday' => $this->getYesterdayVisitors(),
            'this_week_vs_last_week' => $this->getWeekComparison(),
            'this_month_vs_last_month' => $this->getMonthComparison()
        ];
    }

    /**
     * Get daily statistics for the last 30 days.
     *
     * @return array
     */
    private function getDailyStats()
    {
        return Visitor::getDailyTraffic(30);
    }

    /**
     * Get weekly statistics for the last 12 weeks.
     *
     * @return array
     */
    private function getWeeklyStats()
    {
        $data = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $startOfWeek = now()->subWeeks($i)->startOfWeek();
            $endOfWeek = now()->subWeeks($i)->endOfWeek();
            
            $visitors = Visitor::whereBetween('visited_at', [$startOfWeek, $endOfWeek])
                              ->distinct('ip_address')
                              ->count('ip_address');
            
            $data[] = [
                'week' => $startOfWeek->format('Y-m-d') . ' - ' . $endOfWeek->format('Y-m-d'),
                'week_number' => $startOfWeek->week,
                'year' => $startOfWeek->year,
                'visitors' => $visitors,
                'start_date' => $startOfWeek->format('Y-m-d'),
                'end_date' => $endOfWeek->format('Y-m-d')
            ];
        }
        
        return $data;
    }

    /**
     * Get monthly statistics for the last 12 months.
     *
     * @return array
     */
    private function getMonthlyStats()
    {
        $data = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            
            $visitors = Visitor::whereMonth('visited_at', $month)
                              ->whereYear('visited_at', $year)
                              ->distinct('ip_address')
                              ->count('ip_address');
            
            $data[] = [
                'month' => $date->format('Y-m'),
                'month_name' => $date->format('F Y'),
                'month_name_id' => $this->getIndonesianMonthName($month) . ' ' . $year,
                'visitors' => $visitors,
                'year' => $year,
                'month_number' => $month
            ];
        }
        
        return $data;
    }

    /**
     * Get yearly statistics.
     *
     * @return array
     */
    private function getYearlyStats()
    {
        $currentYear = now()->year;
        $data = [];
        
        // Get stats for last 5 years
        for ($i = 4; $i >= 0; $i--) {
            $year = $currentYear - $i;
            
            $visitors = Visitor::whereYear('visited_at', $year)
                              ->distinct('ip_address')
                              ->count('ip_address');
            
            $data[] = [
                'year' => $year,
                'visitors' => $visitors
            ];
        }
        
        return $data;
    }

    /**
     * Get hourly statistics for today.
     *
     * @return array
     */
    private function getHourlyStats()
    {
        return Visitor::getHourlyTraffic();
    }

    /**
     * Get popular pages.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getPopularPages()
    {
        return Visitor::getPopularPages(15);
    }

    /**
     * Get popular surahs.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getPopularSurahs()
    {
        return Visitor::getPopularSurahs(15);
    }

    /**
     * Get browser statistics.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getBrowserStats()
    {
        return Visitor::getBrowserStats();
    }

    /**
     * Get device statistics.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getDeviceStats()
    {
        return Visitor::getDeviceStats();
    }

    /**
     * Get referrer statistics.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getReferrerStats()
    {
        return Visitor::getTopReferrers(10);
    }

    /**
     * Get yesterday's visitor count.
     *
     * @return int
     */
    private function getYesterdayVisitors()
    {
        try {
            return Visitor::whereDate('visited_at', now()->subDay())
                          ->distinct('ip_address')
                          ->count('ip_address');
        } catch (\Exception $e) {
            Log::error('Error getting yesterday visitors: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Compare this week with last week.
     *
     * @return array
     */
    private function getWeekComparison()
    {
        try {
            $thisWeek = Visitor::whereBetween('visited_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->distinct('ip_address')->count('ip_address');

            $lastWeek = Visitor::whereBetween('visited_at', [
                now()->subWeek()->startOfWeek(),
                now()->subWeek()->endOfWeek()
            ])->distinct('ip_address')->count('ip_address');

            $percentage = $lastWeek > 0 ? (($thisWeek - $lastWeek) / $lastWeek) * 100 : 0;

            return [
                'this_week' => $thisWeek,
                'last_week' => $lastWeek,
                'difference' => $thisWeek - $lastWeek,
                'percentage' => round($percentage, 2)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting week comparison: ' . $e->getMessage());
            return [
                'this_week' => 0,
                'last_week' => 0,
                'difference' => 0,
                'percentage' => 0
            ];
        }
    }

    /**
     * Compare this month with last month.
     *
     * @return array
     */
    private function getMonthComparison()
    {
        try {
            $thisMonth = Visitor::whereMonth('visited_at', now()->month)
                               ->whereYear('visited_at', now()->year)
                               ->distinct('ip_address')
                               ->count('ip_address');

            $lastMonth = Visitor::whereMonth('visited_at', now()->subMonth()->month)
                               ->whereYear('visited_at', now()->subMonth()->year)
                               ->distinct('ip_address')
                               ->count('ip_address');

            $percentage = $lastMonth > 0 ? (($thisMonth - $lastMonth) / $lastMonth) * 100 : 0;

            return [
                'this_month' => $thisMonth,
                'last_month' => $lastMonth,
                'difference' => $thisMonth - $lastMonth,
                'percentage' => round($percentage, 2)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting month comparison: ' . $e->getMessage());
            return [
                'this_month' => 0,
                'last_month' => 0,
                'difference' => 0,
                'percentage' => 0
            ];
        }
    }

    /**
     * Get Indonesian month name.
     *
     * @param int $month
     * @return string
     */
    private function getIndonesianMonthName($month)
    {
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember'
        ];

        return $months[$month] ?? 'Unknown';
    }

    /**
     * Get real-time statistics (for dashboard widgets).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function realtime()
    {
        try {
            // Get visitors in the last hour
            $lastHour = Visitor::where('visited_at', '>=', now()->subHour())
                              ->distinct('ip_address')
                              ->count('ip_address');

            // Get visitors in the last 5 minutes
            $lastFiveMinutes = Visitor::where('visited_at', '>=', now()->subMinutes(5))
                                     ->distinct('ip_address')
                                     ->count('ip_address');

            // Get top pages in the last hour
            $topPagesLastHour = Visitor::where('visited_at', '>=', now()->subHour())
                                      ->select('page_url')
                                      ->selectRaw('COUNT(*) as visit_count')
                                      ->whereNotNull('page_url')
                                      ->groupBy('page_url')
                                      ->orderByDesc('visit_count')
                                      ->take(5)
                                      ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'last_hour' => $lastHour,
                    'last_five_minutes' => $lastFiveMinutes,
                    'today_total' => Visitor::getTodayVisitors(),
                    'top_pages_last_hour' => $topPagesLastHour,
                    'timestamp' => now()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting realtime statistics: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik real-time',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export statistics to CSV.
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function export(Request $request)
    {
        $type = $request->get('type', 'daily'); // daily, weekly, monthly, yearly
        $days = $request->get('days', 30);

        $filename = "visitor_stats_{$type}_" . now()->format('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($type, $days) {
            $file = fopen('php://output', 'w');

            switch ($type) {
                case 'daily':
                    fputcsv($file, ['Tanggal', 'Jumlah Pengunjung']);
                    $data = Visitor::getDailyTraffic($days);
                    foreach ($data as $row) {
                        fputcsv($file, [$row['date'], $row['visitors']]);
                    }
                    break;

                case 'weekly':
                    fputcsv($file, ['Minggu', 'Tanggal Mulai', 'Tanggal Selesai', 'Jumlah Pengunjung']);
                    $data = $this->getWeeklyStats();
                    foreach ($data as $row) {
                        fputcsv($file, [
                            "Minggu {$row['week_number']} {$row['year']}",
                            $row['start_date'],
                            $row['end_date'],
                            $row['visitors']
                        ]);
                    }
                    break;

                case 'monthly':
                    fputcsv($file, ['Bulan', 'Jumlah Pengunjung']);
                    $data = $this->getMonthlyStats();
                    foreach ($data as $row) {
                        fputcsv($file, [$row['month_name_id'], $row['visitors']]);
                    }
                    break;

                case 'yearly':
                    fputcsv($file, ['Tahun', 'Jumlah Pengunjung']);
                    $data = $this->getYearlyStats();
                    foreach ($data as $row) {
                        fputcsv($file, [$row['year'], $row['visitors']]);
                    }
                    break;
            }

            fclose($file);
        }, 200, $headers);
    }
}
