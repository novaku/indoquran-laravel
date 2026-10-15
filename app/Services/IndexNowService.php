<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Surah;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IndexNowService
{
    /**
     * IndexNow API endpoints
     * IndexNow automatically synchronizes across all participating engines (Bing, Yahoo, Yandex, Seznam, Naver)
     */
    public const ENDPOINTS = [
        'https://api.indexnow.org/indexnow',
        'https://www.bing.com/indexnow',
    ];

    /**
     * Submit a list of URLs to IndexNow
     *
     * @param array $urls
     * @param string|null $endpoint
     * @return array
     */
    public function submitUrls(array $urls, ?string $endpoint = null): array
    {
        $host = config('services.indexnow.host', 'indoquran.web.id');
        $key = config('services.indexnow.key', 'e7c8b419bdf242a3818e38d45129ecf6');
        $keyLocation = config('services.indexnow.key_location', "https://{$host}/{$key}.txt");
        $apiEndpoint = $endpoint ?: self::ENDPOINTS[0];

        // Filter and normalize URLs to only include URLs from this host
        $cleanUrls = array_values(array_unique(array_filter($urls, function ($url) use ($host) {
            $parsed = parse_url($url);
            return isset($parsed['host']) && strcasecmp($parsed['host'], $host) === 0;
        })));

        if (empty($cleanUrls)) {
            return [
                'success' => false,
                'message' => 'No valid URLs matching host: ' . $host,
                'count' => 0,
            ];
        }

        $results = [];
        // IndexNow accepts up to 10,000 URLs per batch; we chunk by 1,000 for stability
        $chunks = array_chunk($cleanUrls, 1000);

        foreach ($chunks as $chunkIndex => $batch) {
            $payload = [
                'host' => $host,
                'key' => $key,
                'keyLocation' => $keyLocation,
                'urlList' => $batch,
            ];

            try {
                $response = Http::timeout(30)
                    ->withHeaders([
                        'Content-Type' => 'application/json; charset=utf-8',
                    ])
                    ->post($apiEndpoint, $payload);

                $status = $response->status();
                $isSuccess = in_array($status, [200, 202], true);

                $batchResult = [
                    'batch' => $chunkIndex + 1,
                    'count' => count($batch),
                    'status' => $status,
                    'success' => $isSuccess,
                    'response' => $response->body() ?: ($isSuccess ? 'Accepted by IndexNow (Bing/Yahoo)' : 'Unexpected response'),
                ];

                $results[] = $batchResult;

                if ($isSuccess) {
                    Log::info("IndexNow submitted batch " . ($chunkIndex + 1) . " (" . count($batch) . " URLs) successfully with HTTP {$status}");
                } else {
                    Log::warning("IndexNow warning for batch " . ($chunkIndex + 1) . ": HTTP {$status} - " . $response->body());
                }
            } catch (\Throwable $e) {
                Log::error("IndexNow submission failed: " . $e->getMessage());
                $results[] = [
                    'batch' => $chunkIndex + 1,
                    'count' => count($batch),
                    'status' => 0,
                    'success' => false,
                    'response' => $e->getMessage(),
                ];
            }
        }

        $totalSubmitted = array_sum(array_column($results, 'count'));
        $allSuccessful = !empty($results) && count(array_filter($results, fn($r) => $r['success'])) === count($results);

        return [
            'success' => $allSuccessful,
            'total_urls' => $totalSubmitted,
            'batches' => $results,
        ];
    }

    /**
     * Submit a single URL to IndexNow
     *
     * @param string $url
     * @return array
     */
    public function submitUrl(string $url): array
    {
        return $this->submitUrls([$url]);
    }

    /**
     * Get primary high-priority URLs for IndexNow submission
     *
     * @param string $scope 'core' | 'surahs' | 'juz' | 'halaman' | 'hadits' | 'articles' | 'all'
     * @return array
     */
    public function getPriorityUrls(string $scope = 'all'): array
    {
        $host = config('services.indexnow.host', 'indoquran.web.id');
        $baseUrl = "https://{$host}";
        $urls = [];

        // 1. Core pages (Always high priority)
        $coreUrls = [
            $baseUrl,
            "{$baseUrl}/surah",
            "{$baseUrl}/cari",
            "{$baseUrl}/juz",
            "{$baseUrl}/halaman",
            "{$baseUrl}/hadits",
            "{$baseUrl}/tafsir-maudhui",
            "{$baseUrl}/asmaul-husna",
            "{$baseUrl}/doa-bersama",
            "{$baseUrl}/artikel",
            "{$baseUrl}/tentang",
            "{$baseUrl}/kebijakan",
            "{$baseUrl}/syarat-ketentuan",
        ];

        if ($scope === 'core' || $scope === 'all') {
            $urls = array_merge($urls, $coreUrls);
        }

        // 2. All 114 Surahs
        if ($scope === 'surahs' || $scope === 'all') {
            try {
                $surahNumbers = Surah::query()->pluck('number')->toArray();
                if (empty($surahNumbers)) {
                    $surahNumbers = range(1, 114);
                }
                foreach ($surahNumbers as $num) {
                    $urls[] = "{$baseUrl}/surah/{$num}";
                }
            } catch (\Throwable $e) {
                for ($i = 1; $i <= 114; $i++) {
                    $urls[] = "{$baseUrl}/surah/{$i}";
                }
            }
        }

        // 3. All 30 Juz
        if ($scope === 'juz' || $scope === 'all') {
            for ($j = 1; $j <= 30; $j++) {
                $urls[] = "{$baseUrl}/juz/{$j}";
            }
        }

        // 4. Halaman (604 pages of Mushaf)
        if ($scope === 'halaman' || $scope === 'all') {
            // High priority pages (first 50 and last 20 by default, or all 604)
            for ($h = 1; $h <= 604; $h++) {
                $urls[] = "{$baseUrl}/halaman/{$h}";
            }
        }

        // 5. Hadits main kitab pages & popular topics
        if ($scope === 'hadits' || $scope === 'all') {
            $kitabList = [
                'shahih_bukhari',
                'shahih_muslim',
                'sunan_abu_daud',
                'sunan_tirmidzi',
                'sunan_nasai',
                'sunan_ibnu_majah',
                'musnad_ahmad',
            ];

            foreach ($kitabList as $kitab) {
                $urls[] = "{$baseUrl}/hadits/{$kitab}";
            }
        }

        // 6. Published Articles
        if ($scope === 'articles' || $scope === 'all') {
            try {
                $articleSlugs = Article::query()->published()->pluck('slug')->toArray();
                foreach ($articleSlugs as $slug) {
                    $urls[] = "{$baseUrl}/artikel/{$slug}";
                }
            } catch (\Throwable $e) {
                // Ignore if table not ready
            }
        }

        return array_values(array_unique($urls));
    }
}
