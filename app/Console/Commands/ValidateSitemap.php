<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Surah;

class ValidateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'sitemap:validate {--production}';

    /**
     * The console command description.
     */
    protected $description = 'Validate sitemap files for SEO compliance and errors';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Validating sitemap files...');
        $this->newLine();
        
        $isProduction = $this->option('production');
        $baseUrl = $isProduction ? 'https://my.indoquran.web.id' : config('app.url');
        
        $errors = [];
        $warnings = [];
        $success = [];
        
        // Check if sitemap files exist
        $requiredFiles = [
            'sitemap.xml',
            'sitemap-index.xml',
            'sitemap-main.xml',
            'sitemap-juz.xml'
        ];
        
        // Add surah group files
        for ($i = 1; $i <= 6; $i++) {
            $requiredFiles[] = "sitemap-surahs-{$i}.xml";
        }
        
        foreach ($requiredFiles as $file) {
            $path = public_path($file);
            if (!File::exists($path)) {
                $errors[] = "Missing file: {$file}";
            } else {
                $success[] = "Found: {$file}";
                $this->validateSitemapFile($path, $file, $baseUrl, $errors, $warnings);
            }
        }
        
        // Validate robots.txt
        $this->validateRobotsTxt($baseUrl, $errors, $warnings);
        
        // Check database consistency
        $this->validateDatabaseConsistency($errors, $warnings);
        
        // Display results
        $this->displayResults($success, $warnings, $errors);
        
        return count($errors) === 0 ? 0 : 1;
    }
    
    /**
     * Validate individual sitemap file
     */
    protected function validateSitemapFile($path, $filename, $baseUrl, &$errors, &$warnings)
    {
        $content = File::get($path);
        
        // Check XML validity
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($content);
        
        if ($xml === false) {
            $errors[] = "{$filename}: Invalid XML format";
            return;
        }
        
        // Check XML namespace
        $namespaces = $xml->getNamespaces();
        if (!isset($namespaces['']) || $namespaces[''] !== 'http://www.sitemaps.org/schemas/sitemap/0.9') {
            $warnings[] = "{$filename}: Missing or incorrect sitemap namespace";
        }
        
        // Count URLs
        if ($xml->getName() === 'urlset') {
            $urlCount = count($xml->url);
            
            if ($urlCount > 50000) {
                $errors[] = "{$filename}: Too many URLs ({$urlCount}). Maximum is 50,000";
            } elseif ($urlCount > 45000) {
                $warnings[] = "{$filename}: High URL count ({$urlCount}). Consider splitting";
            }
            
            // Validate some URLs
            $this->validateUrls($xml, $filename, $baseUrl, $errors, $warnings);
        }
        
        // Check file size
        $fileSize = File::size($path);
        $fileSizeMB = round($fileSize / 1024 / 1024, 2);
        
        if ($fileSize > 50 * 1024 * 1024) { // 50MB
            $errors[] = "{$filename}: File too large ({$fileSizeMB}MB). Maximum is 50MB";
        } elseif ($fileSize > 45 * 1024 * 1024) { // 45MB
            $warnings[] = "{$filename}: Large file size ({$fileSizeMB}MB)";
        }
    }
    
    /**
     * Validate URLs in sitemap
     */
    protected function validateUrls($xml, $filename, $baseUrl, &$errors, &$warnings)
    {
        $urlsToCheck = min(10, count($xml->url)); // Check first 10 URLs
        
        for ($i = 0; $i < $urlsToCheck; $i++) {
            $url = (string) $xml->url[$i]->loc;
            
            // Check URL format
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                $errors[] = "{$filename}: Invalid URL format: {$url}";
                continue;
            }
            
            // Check if URL belongs to the correct domain
            if (!str_starts_with($url, $baseUrl)) {
                $warnings[] = "{$filename}: URL doesn't match base domain: {$url}";
            }
            
            // Check lastmod format
            if (isset($xml->url[$i]->lastmod)) {
                $lastmod = (string) $xml->url[$i]->lastmod;
                if (!$this->isValidDate($lastmod)) {
                    $warnings[] = "{$filename}: Invalid lastmod format: {$lastmod}";
                }
            }
            
            // Check priority range
            if (isset($xml->url[$i]->priority)) {
                $priority = (float) $xml->url[$i]->priority;
                if ($priority < 0.0 || $priority > 1.0) {
                    $warnings[] = "{$filename}: Priority out of range (0.0-1.0): {$priority}";
                }
            }
        }
    }
    
    /**
     * Validate robots.txt file
     */
    protected function validateRobotsTxt($baseUrl, &$errors, &$warnings)
    {
        $robotsPath = public_path('robots.txt');
        
        if (!File::exists($robotsPath)) {
            $errors[] = "Missing robots.txt file";
            return;
        }
        
        $content = File::get($robotsPath);
        
        // Check for sitemap references
        if (!str_contains($content, 'Sitemap:')) {
            $warnings[] = "robots.txt: No sitemap references found";
        }
        
        // Check for correct domain in sitemap URLs
        if (!str_contains($content, $baseUrl)) {
            $warnings[] = "robots.txt: Sitemap URLs don't match base domain";
        }
        
        // Check for common directives
        $requiredDirectives = ['User-agent:', 'Allow:', 'Disallow:'];
        foreach ($requiredDirectives as $directive) {
            if (!str_contains($content, $directive)) {
                $warnings[] = "robots.txt: Missing {$directive} directive";
            }
        }
    }
    
    /**
     * Validate database consistency
     */
    protected function validateDatabaseConsistency(&$errors, &$warnings)
    {
        try {
            $surahCount = Surah::count();
            
            if ($surahCount !== 114) {
                $warnings[] = "Database: Expected 114 surahs, found {$surahCount}";
            }
            
            // Check for surahs with missing ayahs count
            $surahsWithoutAyahs = Surah::whereNull('total_ayahs')->count();
            if ($surahsWithoutAyahs > 0) {
                $warnings[] = "Database: {$surahsWithoutAyahs} surahs missing total_ayahs count";
            }
            
        } catch (\Exception $e) {
            $errors[] = "Database: Connection error - " . $e->getMessage();
        }
    }
    
    /**
     * Check if date string is valid
     */
    protected function isValidDate($date)
    {
        $formats = ['Y-m-d', 'Y-m-d\TH:i:s\Z', 'Y-m-d\TH:i:s+P'];
        
        foreach ($formats as $format) {
            $parsed = \DateTime::createFromFormat($format, $date);
            if ($parsed && $parsed->format($format) === $date) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Display validation results
     */
    protected function displayResults($success, $warnings, $errors)
    {
        $this->newLine();
        
        if (!empty($success)) {
            $this->info('✅ Success (' . count($success) . ' items):');
            foreach ($success as $item) {
                $this->line("  • {$item}");
            }
            $this->newLine();
        }
        
        if (!empty($warnings)) {
            $this->warn('⚠️  Warnings (' . count($warnings) . ' items):');
            foreach ($warnings as $warning) {
                $this->line("  • {$warning}");
            }
            $this->newLine();
        }
        
        if (!empty($errors)) {
            $this->error('❌ Errors (' . count($errors) . ' items):');
            foreach ($errors as $error) {
                $this->line("  • {$error}");
            }
            $this->newLine();
            $this->error('Please fix the errors above before submitting to search engines.');
        } else {
            $this->info('🎉 All validations passed! Your sitemap is ready for search engines.');
        }
        
        $this->newLine();
        $this->info('📊 Validation Summary:');
        $this->table(
            ['Status', 'Count'],
            [
                ['✅ Success', count($success)],
                ['⚠️  Warnings', count($warnings)],
                ['❌ Errors', count($errors)]
            ]
        );
    }
}
