<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class PerformanceAnalyticsController extends Controller
{
    /**
     * Store performance analytics data
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event' => 'required|string|max:100',
            'data' => 'required|array',
            'timestamp' => 'required|integer',
            'page' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid data'], 400);
        }

        try {
            $analyticsData = [
                'event' => $request->event,
                'data' => $request->data,
                'timestamp' => $request->timestamp,
                'page' => $request->page,
                'user_agent' => $request->header('User-Agent'),
                'ip' => $request->ip(),
                'session_id' => session()->getId(),
            ];

            // Store in cache with daily rotation
            $cacheKey = 'performance_analytics_' . date('Y-m-d');
            $existingData = Cache::get($cacheKey, []);
            $existingData[] = $analyticsData;

            // Keep only last 1000 entries per day to prevent memory issues
            if (count($existingData) > 1000) {
                $existingData = array_slice($existingData, -1000);
            }

            Cache::put($cacheKey, $existingData, now()->addDays(7));

            // Log critical performance issues
            if ($this->isCriticalPerformanceIssue($request->event, $request->data)) {
                Log::warning('Critical mobile performance issue detected', $analyticsData);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Failed to store performance analytics', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * Get performance analytics dashboard data (admin only)
     */
    public function dashboard(Request $request)
    {
        // Add authentication check here
        // if (!auth()->user()?->isAdmin()) {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        try {
            $days = $request->input('days', 7);
            $dashboardData = [];

            for ($i = 0; $i < $days; $i++) {
                $date = now()->subDays($i)->format('Y-m-d');
                $cacheKey = 'performance_analytics_' . $date;
                $dayData = Cache::get($cacheKey, []);
                
                if (!empty($dayData)) {
                    $dashboardData[$date] = $this->processAnalyticsData($dayData);
                }
            }

            return response()->json([
                'status' => 'success',
                'data' => $dashboardData,
                'summary' => $this->generateSummary($dashboardData)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to generate performance dashboard', [
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * Check if performance issue is critical
     */
    private function isCriticalPerformanceIssue(string $event, array $data): bool
    {
        switch ($event) {
            case 'core_web_vitals':
                return ($data['lcp'] ?? 0) > 4000 || // LCP > 4s
                       ($data['fid'] ?? 0) > 300 ||  // FID > 300ms
                       ($data['cls'] ?? 0) > 0.25;   // CLS > 0.25

            case 'page_load':
                return ($data['page_load'] ?? 0) > 10000; // Page load > 10s

            case 'javascript_error':
                return true; // All JS errors are logged

            case 'slow_resources':
                return ($data['count'] ?? 0) > 5; // More than 5 slow resources

            default:
                return false;
        }
    }

    /**
     * Process raw analytics data into useful metrics
     */
    private function processAnalyticsData(array $rawData): array
    {
        $processed = [
            'total_events' => count($rawData),
            'unique_sessions' => count(array_unique(array_column($rawData, 'session_id'))),
            'events_by_type' => [],
            'performance_metrics' => [],
            'device_breakdown' => [
                'mobile' => 0,
                'desktop' => 0,
                'slow_connection' => 0,
                'low_end_device' => 0
            ]
        ];

        foreach ($rawData as $entry) {
            $event = $entry['event'];
            $data = $entry['data'];

            // Count events by type
            $processed['events_by_type'][$event] = ($processed['events_by_type'][$event] ?? 0) + 1;

            // Process specific event types
            switch ($event) {
                case 'core_web_vitals':
                    $processed['performance_metrics']['lcp'][] = $data['lcp'] ?? 0;
                    $processed['performance_metrics']['fid'][] = $data['fid'] ?? 0;
                    $processed['performance_metrics']['cls'][] = $data['cls'] ?? 0;
                    break;

                case 'page_load':
                    $processed['performance_metrics']['page_load'][] = $data['page_load'] ?? 0;
                    
                    // Device categorization
                    if ($data['is_slow_connection'] ?? false) {
                        $processed['device_breakdown']['slow_connection']++;
                    }
                    if ($data['is_low_end_device'] ?? false) {
                        $processed['device_breakdown']['low_end_device']++;
                    }
                    break;
            }

            // Mobile vs desktop detection
            $userAgent = $entry['user_agent'] ?? '';
            if (preg_match('/Mobile|Android|iPhone|iPad/i', $userAgent)) {
                $processed['device_breakdown']['mobile']++;
            } else {
                $processed['device_breakdown']['desktop']++;
            }
        }

        // Calculate averages for performance metrics
        foreach ($processed['performance_metrics'] as $metric => $values) {
            if (!empty($values)) {
                $processed['performance_metrics'][$metric] = [
                    'average' => array_sum($values) / count($values),
                    'median' => $this->calculateMedian($values),
                    'p95' => $this->calculatePercentile($values, 95),
                    'count' => count($values)
                ];
            }
        }

        return $processed;
    }

    /**
     * Generate summary across all days
     */
    private function generateSummary(array $dashboardData): array
    {
        $totalEvents = 0;
        $totalSessions = 0;
        $allLCP = [];
        $allFID = [];
        $allCLS = [];

        foreach ($dashboardData as $dayData) {
            $totalEvents += $dayData['total_events'];
            $totalSessions += $dayData['unique_sessions'];

            if (isset($dayData['performance_metrics']['lcp']['average'])) {
                $allLCP[] = $dayData['performance_metrics']['lcp']['average'];
            }
            if (isset($dayData['performance_metrics']['fid']['average'])) {
                $allFID[] = $dayData['performance_metrics']['fid']['average'];
            }
            if (isset($dayData['performance_metrics']['cls']['average'])) {
                $allCLS[] = $dayData['performance_metrics']['cls']['average'];
            }
        }

        return [
            'total_events' => $totalEvents,
            'total_sessions' => $totalSessions,
            'average_lcp' => !empty($allLCP) ? array_sum($allLCP) / count($allLCP) : 0,
            'average_fid' => !empty($allFID) ? array_sum($allFID) / count($allFID) : 0,
            'average_cls' => !empty($allCLS) ? array_sum($allCLS) / count($allCLS) : 0,
            'performance_grade' => $this->calculatePerformanceGrade($allLCP, $allFID, $allCLS)
        ];
    }

    /**
     * Calculate median value
     */
    private function calculateMedian(array $values): float
    {
        sort($values);
        $count = count($values);
        $middle = floor($count / 2);

        if ($count % 2) {
            return $values[$middle];
        } else {
            return ($values[$middle - 1] + $values[$middle]) / 2;
        }
    }

    /**
     * Calculate percentile
     */
    private function calculatePercentile(array $values, int $percentile): float
    {
        sort($values);
        $index = ($percentile / 100) * (count($values) - 1);
        
        if (is_int($index)) {
            return $values[$index];
        } else {
            $lower = floor($index);
            $upper = ceil($index);
            $weight = $index - $lower;
            
            return $values[$lower] * (1 - $weight) + $values[$upper] * $weight;
        }
    }

    /**
     * Calculate overall performance grade
     */
    private function calculatePerformanceGrade(array $lcp, array $fid, array $cls): string
    {
        if (empty($lcp) && empty($fid) && empty($cls)) {
            return 'No Data';
        }

        $avgLcp = !empty($lcp) ? array_sum($lcp) / count($lcp) : 0;
        $avgFid = !empty($fid) ? array_sum($fid) / count($fid) : 0;
        $avgCls = !empty($cls) ? array_sum($cls) / count($cls) : 0;

        $score = 0;
        $metrics = 0;

        if ($avgLcp > 0) {
            $score += $avgLcp <= 2500 ? 100 : ($avgLcp <= 4000 ? 50 : 0);
            $metrics++;
        }
        if ($avgFid > 0) {
            $score += $avgFid <= 100 ? 100 : ($avgFid <= 300 ? 50 : 0);
            $metrics++;
        }
        if ($avgCls > 0) {
            $score += $avgCls <= 0.1 ? 100 : ($avgCls <= 0.25 ? 50 : 0);
            $metrics++;
        }

        if ($metrics === 0) return 'No Data';

        $averageScore = $score / $metrics;

        if ($averageScore >= 90) return 'Excellent';
        if ($averageScore >= 70) return 'Good';
        if ($averageScore >= 50) return 'Needs Improvement';
        return 'Poor';
    }
}
