<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SubmitSitemapToGoogle extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'sitemap:submit-to-google {--domain=my.indoquran.web.id}';

    /**
     * The console command description.
     */
    protected $description = 'Submit sitemap to Google Search Console for indexing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $domain = $this->option('domain');
        $baseUrl = "https://{$domain}";
        
        $this->info("Submitting sitemaps to Google for domain: {$domain}");
        
        // List of sitemaps to submit
        $sitemaps = [
            'sitemap.xml',
            'sitemap-index.xml',
            'sitemap-main.xml',
            'sitemap-juz.xml'
        ];
        
        // Add surah group sitemaps
        for ($i = 1; $i <= 6; $i++) {
            $sitemaps[] = "sitemap-surahs-{$i}.xml";
        }
        
        $this->info("Total sitemaps to submit: " . count($sitemaps));
        
        foreach ($sitemaps as $sitemap) {
            $this->submitSitemap($baseUrl, $sitemap);
        }
        
        $this->info('✅ All sitemaps submitted to Google Search Console!');
        $this->newLine();
        $this->info('📋 Next steps:');
        $this->info('1. Verify your domain in Google Search Console');
        $this->info('2. Check the indexing status in the Sitemaps section');
        $this->info('3. Monitor for any crawl errors');
        $this->info('4. Set up regular sitemap regeneration with: php artisan sitemap:generate-comprehensive --production');
        
        return 0;
    }
    
    /**
     * Submit individual sitemap to Google
     */
    protected function submitSitemap($baseUrl, $sitemapFile)
    {
        $sitemapUrl = $baseUrl . '/' . $sitemapFile;
        $pingUrl = 'http://www.google.com/ping?sitemap=' . urlencode($sitemapUrl);
        
        $this->info("Submitting: {$sitemapFile}");
        
        try {
            $response = Http::timeout(30)->get($pingUrl);
            
            if ($response->successful()) {
                $this->info("  ✅ Success: {$sitemapFile}");
            } else {
                $this->warn("  ⚠️  Warning: {$sitemapFile} - HTTP {$response->status()}");
            }
        } catch (\Exception $e) {
            $this->error("  ❌ Error: {$sitemapFile} - " . $e->getMessage());
        }
        
        // Be respectful to Google's servers
        sleep(1);
    }
}
