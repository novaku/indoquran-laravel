<?php

namespace App\Console\Commands;

use App\Services\IndexNowService;
use Illuminate\Console\Command;

class SubmitIndexNow extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'indexnow:submit 
                            {--scope=core : Scope of URLs: core, surahs, juz, halaman, hadits, articles, or all}
                            {--url= : Single URL to submit}
                            {--endpoint= : Override endpoint (default: https://api.indexnow.org/indexnow)}
                            {--dry-run : Preview URLs without submitting}';

    /**
     * The console command description.
     */
    protected $description = 'Submit URLs to IndexNow for instant indexing across Bing and Yahoo Search';

    /**
     * Execute the console command.
     */
    public function handle(IndexNowService $indexNowService): int
    {
        $host = config('services.indexnow.host', 'indoquran.web.id');
        $key = config('services.indexnow.key', 'e7c8b419bdf242a3818e38d45129ecf6');
        $singleUrl = $this->option('url');
        $scope = $this->option('scope') ?: 'core';
        $dryRun = $this->option('dry-run');
        $endpoint = $this->option('endpoint');

        $this->info("=======================================================");
        $this->info("  IndoQuran - IndexNow Submitter (Yahoo & Bing SEO)   ");
        $this->info("=======================================================");
        $this->line("Host: <comment>{$host}</comment>");
        $this->line("Key: <comment>{$key}</comment>");
        $this->line("Key Verification: <comment>https://{$host}/{$key}.txt</comment>");

        if ($singleUrl) {
            $urls = [$singleUrl];
            $this->info("Mode: Single URL submission");
        } else {
            $this->info("Mode: Batch submission (scope: {$scope})");
            $urls = $indexNowService->getPriorityUrls($scope);
        }

        $totalUrls = count($urls);
        $this->line("Total URLs found: <comment>{$totalUrls}</comment>");

        if ($totalUrls === 0) {
            $this->warn("No URLs to submit.");
            return 0;
        }

        if ($dryRun) {
            $this->warn("DRY RUN MODE: Listing first 10 URLs (no requests sent):");
            foreach (array_slice($urls, 0, 10) as $preview) {
                $this->line(" - {$preview}");
            }
            if ($totalUrls > 10) {
                $this->line(" ... and " . ($totalUrls - 10) . " more URLs");
            }
            return 0;
        }

        $this->info("Submitting {$totalUrls} URLs to IndexNow API...");
        $startTime = microtime(true);

        $result = $indexNowService->submitUrls($urls, $endpoint);
        $duration = round(microtime(true) - $startTime, 2);

        $this->newLine();
        if ($result['success']) {
            $this->info("✅ SUCCESS: {$result['total_urls']} URLs submitted in {$duration}s!");
            $this->line("Bingbot and Yahoo Search crawlers will prioritize indexing these pages.");
        } else {
            $this->warn("⚠️  Completed with warnings. Checked batches:");
        }

        if (isset($result['batches'])) {
            $tableData = [];
            foreach ($result['batches'] as $batch) {
                $tableData[] = [
                    'Batch' => $batch['batch'],
                    'URLs' => $batch['count'],
                    'HTTP Code' => $batch['status'],
                    'Status' => $batch['success'] ? 'OK (200/202)' : 'Failed',
                ];
            }
            $this->table(['Batch #', 'Total URLs', 'Status Code', 'Result'], $tableData);
        }

        return $result['success'] ? 0 : 1;
    }
}
