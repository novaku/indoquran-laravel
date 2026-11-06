<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Cache\RedisStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ArticleCacheService
{
    public function __construct(
        protected AdminDashboardCacheService $dashboardCacheService
    ) {}

    /**
     * Clear all article-related caches so newly created, updated, or deleted articles
     * appear immediately on the main articles page (/artikel) and across the website.
     *
     * @param Article|null $article
     * @param string|null $oldSlug
     * @return bool
     */
    public function clearArticleCache(?Article $article = null, ?string $oldSlug = null): bool
    {
        try {
            // 1. Clear SSR list cache used by SEOController for /artikel
            Cache::forget('seo_articles_list_home');

            // 2. Clear single article & related caches if article provided
            if ($article) {
                if (!empty($article->slug)) {
                    Cache::forget("seo_article_model_{$article->slug}");
                    Cache::forget("article_api_related_{$article->slug}");
                }
                if ($oldSlug && $oldSlug !== $article->slug) {
                    Cache::forget("seo_article_model_{$oldSlug}");
                    Cache::forget("article_api_related_{$oldSlug}");
                }
                if (!empty($article->id)) {
                    Cache::forget("seo_article_related_{$article->id}");
                }
            }

            // 3. Clear random single article cache
            Cache::forget('article_api_random_single');

            // 4. Clear popular tags cache (articles change tag counts)
            foreach ([10, 15, 20, 25, 50] as $limit) {
                Cache::forget("popular_tags_count_{$limit}");
            }

            // 5. Clear dashboard article stats
            $this->dashboardCacheService->clearArticles();

            // 6. Clear Redis pattern keys (ApiCacheMiddleware & related)
            $this->clearRedisPatternKeys();

            Log::info('ArticleCacheService: successfully cleared article caches', [
                'article_id' => $article?->id,
                'slug' => $article?->slug,
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::warning('ArticleCacheService: clearArticleCache failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Clear ApiCacheMiddleware and pattern keys from Redis if Redis store is used.
     */
    protected function clearRedisPatternKeys(): void
    {
        try {
            $store = Cache::getStore();
            if ($store instanceof RedisStore) {
                $redis = $store->connection();
                $cachePrefix = $store->getPrefix();
                $connPrefix = $this->getRedisConnectionPrefix($redis);

                $patterns = [
                    $cachePrefix . 'seo_articles_*',
                    $cachePrefix . 'article_api_*',
                    $cachePrefix . 'popular_tags_*',
                    $cachePrefix . 'api_http_resp:articles:*',
                    $cachePrefix . 'api_http_resp:tags:*',
                    $cachePrefix . 'api_http_resp:*',
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

                        if (!empty($keysToDelete)) {
                            $redis->del($keysToDelete);
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('ArticleCacheService: clearRedisPatternKeys failed: ' . $e->getMessage());
        }
    }

    /**
     * Helper to detect Redis connection prefix
     */
    protected function getRedisConnectionPrefix($redis): string
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

