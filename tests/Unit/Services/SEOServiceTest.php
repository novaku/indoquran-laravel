<?php

namespace Tests\Unit\Services;

use App\Models\Surah;
use App\Services\SEOService;
use Tests\TestCase;

class SEOServiceTest extends TestCase
{
    private function makeSampleSurah(): Surah
    {
        $surah = new Surah();
        $surah->number = 1;
        $surah->name_latin = 'Al-Fatihah';
        $surah->name_arabic = 'الفاتحة';
        $surah->name_indonesian = 'Pembukaan';
        $surah->total_ayahs = 7;
        $surah->revelation_place = 'makkah';
        $surah->description_short = 'Surah pembukaan Al-Quran';
        return $surah;
    }

    public function test_generate_surah_keywords_contains_essential_phrases(): void
    {
        $surah = $this->makeSampleSurah();
        $keywords = SEOService::generateSurahKeywords($surah);

        $this->assertStringContainsString('surah al-fatihah', $keywords);
        $this->assertStringContainsString('surat al-fatihah', $keywords);
        $this->assertStringContainsString('الفاتحة', $keywords);
        $this->assertStringContainsString('al-fatihah', $keywords);
    }

    public function test_generate_home_keywords(): void
    {
        $keywords = SEOService::generateHomeKeywords();

        $this->assertNotEmpty($keywords);
        $this->assertStringContainsString('al quran', $keywords);
    }

    public function test_generate_search_keywords(): void
    {
        $keywordsWithoutQuery = SEOService::generateSearchKeywords();
        $this->assertStringContainsString('pencarian', $keywordsWithoutQuery);

        $keywordsWithQuery = SEOService::generateSearchKeywords('ramadhan');
        $this->assertStringContainsString('ramadhan', $keywordsWithQuery);
    }

    public function test_generate_surah_structured_data(): void
    {
        $surah = $this->makeSampleSurah();
        $data = SEOService::generateSurahStructuredData($surah);

        $this->assertIsArray($data);
        $this->assertCount(2, $data);

        // First item is Article schema
        $this->assertEquals('Article', $data[0]['@type']);
        $this->assertStringContainsString('Al-Fatihah', $data[0]['headline']);

        // Second item is Book schema
        $this->assertEquals('Book', $data[1]['@type']);
        $this->assertEquals('Surah Al-Fatihah', $data[1]['name']);
    }

    public function test_generate_optimized_title(): void
    {
        $title = SEOService::generateOptimizedTitle('Surah Al-Baqarah Lengkap');

        $this->assertStringEndsWith('| IndoQuran', $title);
        $this->assertLessThanOrEqual(60, strlen($title));

        // Long title test
        $longInput = str_repeat('A', 100);
        $truncated = SEOService::generateOptimizedTitle($longInput, 50);
        $this->assertLessThanOrEqual(50, strlen($truncated));
        $this->assertStringContainsString('...', $truncated);
    }

    public function test_generate_optimized_description(): void
    {
        $desc = 'Teks terjemahan Al-Quran lengkap bahasa Indonesia.';
        $optimized = SEOService::generateOptimizedDescription($desc);
        $this->assertEquals($desc, $optimized);

        $longDesc = str_repeat('Baca ayat Al-Quran. ', 20);
        $truncated = SEOService::generateOptimizedDescription($longDesc, 100);
        $this->assertLessThanOrEqual(100, strlen($truncated));
    }
}
