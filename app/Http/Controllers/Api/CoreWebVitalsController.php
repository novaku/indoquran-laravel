<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

/**
 * Core Web Vitals Analytics Controller
 * 
 * Menerima dan menyimpan data Core Web Vitals dari frontend
 * Sesuai dengan standar Google Search Console:
 * https://support.google.com/webmasters/answer/9205520
 */
class CoreWebVitalsController extends Controller
{
    /**
     * Store Core Web Vitals metric
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'metric_name' => 'required|in:LCP,INP,CLS,FCP,TTFB',
            'metric_value' => 'required|numeric',
            'metric_rating' => 'required|in:good,needs-improvement,poor',
            'metric_delta' => 'nullable|numeric',
            'metric_id' => 'required|string',
            'navigation_type' => 'nullable|string',
            'url' => 'required|url',
            'user_agent' => 'nullable|string',
            'device_info' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        try {
            // Store in cache for aggregation (TTL: 7 days)
            $cacheKey = 'cwv_' . strtolower($data['metric_name']);
            $existingData = Cache::get($cacheKey, []);
            
            // Add new metric
            $existingData[] = [
                'value' => $data['metric_value'],
                'rating' => $data['metric_rating'],
                'url' => $data['url'],
                'timestamp' => now()->timestamp,
                'device_info' => $data['device_info'] ?? null,
            ];
            
            // Keep only last 1000 entries per metric
            if (count($existingData) > 1000) {
                $existingData = array_slice($existingData, -1000);
            }
            
            Cache::put($cacheKey, $existingData, now()->addDays(7));
            
            // Log for monitoring (optional, can be disabled in production)
            if (config('app.debug')) {
                Log::channel('daily')->info('Core Web Vitals', [
                    'metric' => $data['metric_name'],
                    'value' => $data['metric_value'],
                    'rating' => $data['metric_rating'],
                    'url' => parse_url($data['url'], PHP_URL_PATH),
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Metric stored successfully'
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Failed to store Core Web Vitals', [
                'error' => $e->getMessage(),
                'metric' => $data['metric_name'] ?? 'unknown'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to store metric'
            ], 500);
        }
    }

    /**
     * Get Core Web Vitals statistics
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats(Request $request)
    {
        $metrics = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
        $stats = [];
        
        foreach ($metrics as $metric) {
            $cacheKey = 'cwv_' . strtolower($metric);
            $data = Cache::get($cacheKey, []);
            
            if (!empty($data)) {
                $values = array_column($data, 'value');
                $ratings = array_column($data, 'rating');
                
                // Calculate statistics
                $stats[$metric] = [
                    'count' => count($values),
                    'p50' => $this->calculatePercentile($values, 0.5),
                    'p75' => $this->calculatePercentile($values, 0.75), // Google uses 75th percentile
                    'p90' => $this->calculatePercentile($values, 0.9),
                    'p95' => $this->calculatePercentile($values, 0.95),
                    'min' => min($values),
                    'max' => max($values),
                    'avg' => array_sum($values) / count($values),
                    'ratings' => [
                        'good' => count(array_filter($ratings, fn($r) => $r === 'good')),
                        'needs_improvement' => count(array_filter($ratings, fn($r) => $r === 'needs-improvement')),
                        'poor' => count(array_filter($ratings, fn($r) => $r === 'poor')),
                    ],
                    'thresholds' => $this->getThresholds($metric),
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $stats,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get URL-specific Core Web Vitals
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUrlStats(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $targetUrl = parse_url($request->url, PHP_URL_PATH);
        $metrics = ['LCP', 'INP', 'CLS'];
        $stats = [];
        
        foreach ($metrics as $metric) {
            $cacheKey = 'cwv_' . strtolower($metric);
            $data = Cache::get($cacheKey, []);
            
            // Filter by URL
            $urlData = array_filter($data, function($item) use ($targetUrl) {
                return parse_url($item['url'], PHP_URL_PATH) === $targetUrl;
            });
            
            if (!empty($urlData)) {
                $values = array_column($urlData, 'value');
                $ratings = array_column($urlData, 'rating');
                
                $stats[$metric] = [
                    'count' => count($values),
                    'p75' => $this->calculatePercentile($values, 0.75),
                    'current_rating' => $this->getRating($metric, $this->calculatePercentile($values, 0.75)),
                    'ratings' => [
                        'good' => count(array_filter($ratings, fn($r) => $r === 'good')),
                        'needs_improvement' => count(array_filter($ratings, fn($r) => $r === 'needs-improvement')),
                        'poor' => count(array_filter($ratings, fn($r) => $r === 'poor')),
                    ],
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'url' => $targetUrl,
            'data' => $stats,
        ]);
    }

    /**
     * Calculate percentile
     * 
     * @param array $values
     * @param float $percentile (0.0 to 1.0)
     * @return float
     */
    private function calculatePercentile(array $values, float $percentile): float
    {
        if (empty($values)) {
            return 0;
        }
        
        sort($values);
        $index = ceil(count($values) * $percentile) - 1;
        $index = max(0, min($index, count($values) - 1));
        
        return round($values[$index], 2);
    }

    /**
     * Get rating based on Google's thresholds
     * 
     * @param string $metric
     * @param float $value
     * @return string
     */
    private function getRating(string $metric, float $value): string
    {
        $thresholds = $this->getThresholds($metric);
        
        if ($value <= $thresholds['good']) {
            return 'good';
        } elseif ($value <= $thresholds['needs_improvement']) {
            return 'needs-improvement';
        }
        
        return 'poor';
    }

    /**
     * Get Google's official thresholds
     * Reference: https://support.google.com/webmasters/answer/9205520
     * 
     * @param string $metric
     * @return array
     */
    private function getThresholds(string $metric): array
    {
        $thresholds = [
            'LCP' => ['good' => 2500, 'needs_improvement' => 4000],  // milliseconds
            'INP' => ['good' => 200, 'needs_improvement' => 500],    // milliseconds
            'CLS' => ['good' => 0.1, 'needs_improvement' => 0.25],   // score
            'FCP' => ['good' => 1800, 'needs_improvement' => 3000],  // milliseconds
            'TTFB' => ['good' => 800, 'needs_improvement' => 1800],  // milliseconds
        ];
        
        return $thresholds[$metric] ?? ['good' => 0, 'needs_improvement' => 0];
    }

    /**
     * Clear old metrics (can be called via scheduled job)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearOldMetrics()
    {
        $metrics = ['lcp', 'inp', 'cls', 'fcp', 'ttfb'];
        $cleared = 0;
        
        foreach ($metrics as $metric) {
            $cacheKey = 'cwv_' . $metric;
            if (Cache::forget($cacheKey)) {
                $cleared++;
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => "Cleared {$cleared} metric caches",
        ]);
    }
}
