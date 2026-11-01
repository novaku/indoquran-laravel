<?php

namespace App\Services;

use App\Models\Article;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ArticleSitemapService
{
    /**
     * Get the base URL for the sitemap
     */
    public function getBaseUrl(?string $baseUrl = null): string
    {
        if ($baseUrl) {
            return rtrim($baseUrl, '/');
        }

        if (app()->environment('testing')) {
            return rtrim(config('app.url', 'http://localhost'), '/');
        }

        if (app()->environment('production')) {
            return 'https://indoquran.web.id';
        }

        $appUrl = config('app.url');
        if ($appUrl && ! str_contains($appUrl, 'localhost') && ! str_contains($appUrl, '127.0.0.1')) {
            return rtrim($appUrl, '/');
        }

        return 'https://indoquran.web.id';
    }

    /**
     * Generate the complete XML content for sitemap-artikel.xml
     */
    public function generateXml(?string $baseUrl = null): string
    {
        $base = $this->getBaseUrl($baseUrl);
        $currentDate = Carbon::now()->format('Y-m-d');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'.PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'.PHP_EOL;

        // Article hub page (/artikel)
        $xml .= $this->createUrlEntry(
            $base.'/artikel',
            $currentDate,
            'daily',
            '0.9'
        );

        try {
            $articles = Article::published()
                ->select('slug', 'updated_at', 'published_at')
                ->orderBy('published_at', 'desc')
                ->get();

            foreach ($articles as $article) {
                $lastmodDate = $article->updated_at
                    ?? $article->published_at
                    ?? Carbon::now();

                $xml .= $this->createUrlEntry(
                    $base.'/artikel/'.$article->slug,
                    $lastmodDate->format('Y-m-d'),
                    'weekly',
                    '0.85'
                );
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to fetch articles for sitemap: '.$e->getMessage());
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Create a formatted URL entry XML node
     */
    public function createUrlEntry(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        $escapedLoc = htmlspecialchars($loc, ENT_XML1, 'UTF-8');

        return "  <url>\n".
            "    <loc>{$escapedLoc}</loc>\n".
            "    <lastmod>{$lastmod}</lastmod>\n".
            "    <changefreq>{$changefreq}</changefreq>\n".
            "    <priority>{$priority}</priority>\n".
            "  </url>\n";
    }

    /**
     * Write sitemap-artikel.xml to the public folder and refresh sitemap-index.xml
     */
    public function updateSitemapFile(?string $baseUrl = null): bool
    {
        try {
            $xml = $this->generateXml($baseUrl);
            $filePath = public_path('sitemap-artikel.xml');

            File::ensureDirectoryExists(dirname($filePath));
            File::put($filePath, $xml);

            $this->updateSitemapIndexEntry($baseUrl);

            Log::info("Article sitemap updated successfully at {$filePath}");

            return true;
        } catch (\Throwable $e) {
            Log::error('Failed to update sitemap-artikel.xml: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Update lastmod for sitemap-artikel.xml inside public/sitemap-index.xml if it exists
     */
    public function updateSitemapIndexEntry(?string $baseUrl = null): void
    {
        $indexPath = public_path('sitemap-index.xml');
        if (! File::exists($indexPath)) {
            return;
        }

        try {
            $content = File::get($indexPath);
            $currentIsoDate = Carbon::now()->toIso8601String();

            // Match sitemap block for sitemap-artikel.xml and update its lastmod
            $pattern = '/(<sitemap>\s*<loc>[^<]*sitemap-artikel\.xml<\/loc>\s*<lastmod>)[^<]*(<\/lastmod>\s*<\/sitemap>)/is';
            if (preg_match($pattern, $content)) {
                $updatedContent = preg_replace($pattern, '${1}'.$currentIsoDate.'${2}', $content);
                File::put($indexPath, $updatedContent);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to update sitemap-index.xml lastmod for article sitemap: '.$e->getMessage());
        }
    }
}
