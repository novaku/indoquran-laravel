<?php

namespace Tests\Unit\Services;

use App\Models\Ayah;
use App\Models\Surah;
use App\Services\QuranCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class QuranCacheServiceTest extends TestCase
{
    use RefreshDatabase;

    protected QuranCacheService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(QuranCacheService::class);
        Cache::flush();
    }

    private function createSampleSurahAndAyahs(): Surah
    {
        $surah = Surah::create([
            'number' => 1,
            'total_ayahs' => 2,
            'name_indonesian' => 'Pembukaan',
            'name_arabic' => 'الفاتحة',
            'name_latin' => 'Al-Fatihah',
            'revelation_place' => 'makkah',
            'description_short' => 'Surah pembukaan Al-Quran',
            'description_long' => 'Surah ini memiliki 7 ayat dan diturunkan di Mekah'
        ]);

        Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 1,
            'text_arabic' => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'text_latin' => 'bismillāhir-raḥmānir-raḥīm',
            'text_indonesian' => 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
            'juz' => 1,
            'page' => 1,
            'tafsir' => 'Tafsir bismillah'
        ]);

        Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 2,
            'text_arabic' => 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            'text_latin' => 'al-ḥamdu lillāhi rabbil-ʿālamīn',
            'text_indonesian' => 'Segala puji bagi Allah, Tuhan seluruh alam.',
            'juz' => 1,
            'page' => 1,
            'tafsir' => 'Tafsir alhamdulillah'
        ]);

        return $surah;
    }

    public function test_get_all_surahs_returns_cached_collection(): void
    {
        $this->createSampleSurahAndAyahs();

        $surahs = $this->service->getAllSurahs();

        $this->assertNotEmpty($surahs);
        $this->assertEquals(1, $surahs->first()->number);

        // Second call should return cached data
        $cachedSurahs = $this->service->getAllSurahs();
        $this->assertEquals($surahs->count(), $cachedSurahs->count());
    }

    public function test_get_surah_returns_single_surah(): void
    {
        $this->createSampleSurahAndAyahs();

        $surah = $this->service->getSurah(1);

        $this->assertNotNull($surah);
        $this->assertEquals('Al-Fatihah', $surah->name_latin);

        $nonExistent = $this->service->getSurah(999);
        $this->assertNull($nonExistent);
    }

    public function test_get_surah_ayahs_returns_ayah_collection(): void
    {
        $this->createSampleSurahAndAyahs();

        $ayahs = $this->service->getSurahAyahs(1);

        $this->assertCount(2, $ayahs);
        $this->assertEquals(1, $ayahs[0]->ayah_number);
        $this->assertEquals(2, $ayahs[1]->ayah_number);
    }

    public function test_get_ayah_returns_single_ayah(): void
    {
        $this->createSampleSurahAndAyahs();

        $ayah = $this->service->getAyah(1, 1);

        $this->assertNotNull($ayah);
        $this->assertEquals(1, $ayah->ayah_number);
        $this->assertStringContainsString('bismillāh', $ayah->text_latin);
    }

    public function test_clear_surah_cache_and_warm_up(): void
    {
        $this->createSampleSurahAndAyahs();
        $this->service->getAllSurahs();
        $this->service->getSurah(1);

        $this->service->clearSurahCache(1);
        $this->service->warmUpCache();

        $this->assertTrue(true);
    }
}
