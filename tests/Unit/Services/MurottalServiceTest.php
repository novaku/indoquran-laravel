<?php

namespace Tests\Unit\Services;

use App\Services\MurottalService;
use Tests\TestCase;

class MurottalServiceTest extends TestCase
{
    protected MurottalService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new MurottalService();
    }

    public function test_get_all_reciters_returns_array(): void
    {
        $reciters = $this->service->getAllReciters();

        $this->assertIsArray($reciters);
        $this->assertNotEmpty($reciters);
    }

    public function test_get_recommended_reciters_returns_only_recommended(): void
    {
        $recommended = $this->service->getRecommendedReciters();
        $configRecommended = config('reciters.recommended');

        $this->assertIsArray($recommended);
        $this->assertNotEmpty($recommended);

        foreach ($recommended as $reciter) {
            $this->assertTrue(in_array($reciter['id'], $configRecommended));
        }
    }

    public function test_get_reciter_by_id_returns_reciter_or_null(): void
    {
        $reciter = $this->service->getReciterById('2');

        $this->assertNotNull($reciter);
        $this->assertEquals('2', (string) $reciter['id']);

        $nonExistent = $this->service->getReciterById('non_existent_reciter_99999');
        $this->assertNull($nonExistent);
    }

    public function test_get_ayah_audio_url_formats_correct_url(): void
    {
        $url = $this->service->getAyahAudioUrl(1, 1, '2');

        $this->assertStringStartsWith('https://everyayah.com/data/', $url);
        $this->assertStringEndsWith('001001.mp3', $url);

        // Tests padding for double-digit and triple-digit surahs
        $url114 = $this->service->getAyahAudioUrl(114, 6, '2');
        $this->assertStringEndsWith('114006.mp3', $url114);
    }

    public function test_get_surah_audio_urls_generates_all_verses(): void
    {
        $urls = $this->service->getSurahAudioUrls(1, 7, '2');

        $this->assertCount(7, $urls);
        $this->assertStringEndsWith('001001.mp3', $urls[1]);
        $this->assertStringEndsWith('001007.mp3', $urls[7]);
    }

    public function test_search_reciters_matches_name_or_style(): void
    {
        $results = $this->service->searchReciters('Sudais');

        $this->assertIsArray($results);
        if (!empty($results)) {
            $first = reset($results);
            $this->assertStringContainsStringIgnoringCase('Sudais', $first['name']);
        }
    }
}
