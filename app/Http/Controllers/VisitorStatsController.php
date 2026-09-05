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
        $today = Visitor::getTodayVisitors();
        $weekly = Visitor::getWeeklyVisitors();
        $monthly = Visitor::getMonthlyVisitors();
        $total = Visitor::getTotalVisitors();

        $yesterday = Visitor::where('visited_at', '>=', now()->subDay()->startOfDay())
                            ->where('visited_at', '<=', now()->subDay()->endOfDay())
                            ->distinct()
                            ->count('ip_address');

        $lastWeek = Visitor::where('visited_at', '>=', now()->subWeek()->startOfWeek())
                           ->where('visited_at', '<=', now()->subWeek()->endOfWeek())
                           ->distinct()
                           ->count('ip_address');

        $lastMonth = Visitor::where('visited_at', '>=', now()->subMonth()->startOfMonth())
                            ->where('visited_at', '<=', now()->subMonth()->endOfMonth())
                            ->distinct()
                            ->count('ip_address');

        $weekDiff = $weekly - $lastWeek;
        $weekPct = $lastWeek > 0 ? ($weekDiff / $lastWeek) * 100 : 0;

        $monthDiff = $monthly - $lastMonth;
        $monthPct = $lastMonth > 0 ? ($monthDiff / $lastMonth) * 100 : 0;

        return [
            'today' => $today,
            'weekly' => $weekly,
            'monthly' => $monthly,
            'total' => $total,
            'yesterday' => $yesterday,
            'this_week_vs_last_week' => [
                'this_week' => $weekly,
                'last_week' => $lastWeek,
                'difference' => $weekDiff,
                'percentage' => round($weekPct, 2)
            ],
            'this_month_vs_last_month' => [
                'this_month' => $monthly,
                'last_month' => $lastMonth,
                'difference' => $monthDiff,
                'percentage' => round($monthPct, 2)
            ]
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
        $startOfRange = now()->subWeeks(11)->startOfWeek();
        $endOfRange = now()->endOfWeek();

        $grouped = Visitor::where('visited_at', '>=', $startOfRange)
                          ->where('visited_at', '<=', $endOfRange)
                          ->selectRaw('YEARWEEK(visited_at, 1) as yw, COUNT(DISTINCT ip_address) as visitors')
                          ->groupBy('yw')
                          ->pluck('visitors', 'yw')
                          ->toArray();

        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $startOfWeek = now()->subWeeks($i)->startOfWeek();
            $endOfWeek = now()->subWeeks($i)->endOfWeek();
            $yw = (int) $startOfWeek->format('oW');

            $data[] = [
                'week' => $startOfWeek->format('Y-m-d') . ' - ' . $endOfWeek->format('Y-m-d'),
                'week_number' => $startOfWeek->week,
                'year' => $startOfWeek->year,
                'visitors' => (int) ($grouped[$yw] ?? 0),
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
        $startOfRange = now()->subMonths(11)->startOfMonth();

        $grouped = Visitor::where('visited_at', '>=', $startOfRange)
                          ->selectRaw("DATE_FORMAT(visited_at, '%Y-%m') as ym, COUNT(DISTINCT ip_address) as visitors")
                          ->groupBy('ym')
                          ->pluck('visitors', 'ym')
                          ->toArray();

        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            $ym = $date->format('Y-m');

            $data[] = [
                'month' => $ym,
                'month_name' => $date->format('F Y'),
                'month_name_id' => $this->getIndonesianMonthName($month) . ' ' . $year,
                'visitors' => (int) ($grouped[$ym] ?? 0),
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
        $startOfRange = now()->subYears(4)->startOfYear();

        $grouped = Visitor::where('visited_at', '>=', $startOfRange)
                          ->selectRaw('YEAR(visited_at) as yr, COUNT(DISTINCT ip_address) as visitors')
                          ->groupBy('yr')
                          ->pluck('visitors', 'yr')
                          ->toArray();

        $data = [];
        for ($i = 4; $i >= 0; $i--) {
            $year = $currentYear - $i;
            $data[] = [
                'year' => $year,
                'visitors' => (int) ($grouped[$year] ?? 0)
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
     * @return \Illuminate\Support\Collection
     */
    private function getPopularPages()
    {
        return Visitor::getPopularPages(15);
    }

    /**
     * Get popular surahs.
     *
     * @return \Illuminate\Support\Collection
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
     * @return \Illuminate\Support\Collection
     */
    private function getReferrerStats()
    {
        return Visitor::getTopReferrers(10);
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
            $now = now();
            $subHour = $now->copy()->subHour();
            $sub5Min = $now->copy()->subMinutes(5);

            // Get visitors in the last hour
            $lastHour = Visitor::where('visited_at', '>=', $subHour)
                              ->distinct()
                              ->count('ip_address');

            // Get visitors in the last 5 minutes
            $lastFiveMinutes = Visitor::where('visited_at', '>=', $sub5Min)
                                     ->distinct()
                                     ->count('ip_address');

            // Get top pages in the last hour
            $topPagesLastHour = Visitor::where('visited_at', '>=', $subHour)
                                      ->select('page_url')
                                      ->selectRaw('COUNT(*) as visit_count')
                                      ->whereNotNull('page_url')
                                      ->where('page_url', '!=', '')
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
                    'timestamp' => $now->toISOString()
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
