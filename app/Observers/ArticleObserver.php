<?php

namespace App\Observers;

use App\Models\Article;
use App\Services\ArticleCacheService;
use App\Services\ArticleSitemapService;
use App\Services\IndexNowService;
use Illuminate\Support\Facades\Log;

class ArticleObserver
{
    public function __construct(
        protected ArticleSitemapService $sitemapService,
        protected IndexNowService $indexNowService,
        protected ArticleCacheService $cacheService
    ) {}

    /**
     * Handle the Article "saved" event.
     */
    public function saved(Article $article): void
    {
        $isPublished = $article->status === 'published';
        $wasPublished = $article->getOriginal('status') === 'published';

        // Clear cache and update sitemap if article is currently published, was just published, or was unpublished
        if ($isPublished || $wasPublished) {
            $this->cacheService->clearArticleCache($article, $article->getOriginal('slug'));
            $this->sitemapService->updateSitemapFile();

            // Notify search engines via IndexNow if currently published in production
            if ($isPublished && app()->environment('production')) {
                $this->submitToIndexNow($article);
            }
        }
    }

    /**
     * Handle the Article "deleted" event.
     */
    public function deleted(Article $article): void
    {
        if ($article->status === 'published' || $article->getOriginal('status') === 'published') {
            $this->cacheService->clearArticleCache($article, $article->slug);
            $this->sitemapService->updateSitemapFile();
        }
    }

    /**
     * Submit newly published or updated published article to IndexNow
     */
    protected function submitToIndexNow(Article $article): void
    {
        try {
            $baseUrl = $this->sitemapService->getBaseUrl();
            $urls = [
                $baseUrl.'/artikel',
                $baseUrl.'/artikel/'.$article->slug,
            ];
            $this->indexNowService->submitUrls($urls);
        } catch (\Throwable $e) {
            Log::warning('IndexNow auto-submit failed for article: '.$e->getMessage());
        }
    }
}
