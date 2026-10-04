<?php

namespace Tests\Unit\Services;

use App\Services\HaditsCacheService;
use App\Http\Controllers\HaditsController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HaditsCacheServiceTest extends TestCase
{
    use RefreshDatabase;

    protected HaditsCacheService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new HaditsCacheService();
        Cache::flush();
    }

    public function test_get_ttl_returns_configured_values_and_fallbacks(): void
    {
        $this->assertEquals(2592000, $this->service->getTtl('catalog'));
        $this->assertEquals(2592000, $this->service->getTtl('detail'));
        $this->assertEquals(2592000, $this->service->getTtl('kitab_page'));
        $this->assertEquals(604800, $this->service->getTtl('search'));
        $this->assertEquals(86400, $this->service->getTtl('featured'));
        $this->assertEquals(3600, $this->service->getTtl('random'));

        // Unknown type falls back to default 86400
        $this->assertEquals(86400, $this->service->getTtl('unknown_type'));
    }

    public function test_get_prefix_returns_expected_prefixes(): void
    {
        $this->assertEquals('hadits:catalog:', $this->service->getPrefix('catalog'));
        $this->assertEquals('hadits:detail:', $this->service->getPrefix('detail'));
        $this->assertEquals('hadits:kitab:', $this->service->getPrefix('kitab'));
        $this->assertEquals('hadits:search:', $this->service->getPrefix('search'));
        $this->assertEquals('hadits:featured:', $this->service->getPrefix('featured'));
        $this->assertEquals('hadits:random:', $this->service->getPrefix('random'));
    }

    public function test_get_catalog_returns_7_kitabs_and_is_cached(): void
    {
        $catalog = $this->service->getCatalog();

        $this->assertEquals('success', $catalog['status']);
        $this->assertEquals(7, $catalog['total_kitab']);
        $this->assertEquals(31363, $catalog['total_hadits']);
        $this->assertCount(7, $catalog['kitabs']);

        // Verify cache hit
        $cacheKey = $this->service->getPrefix('catalog') . 'summary';
        $this->assertTrue(Cache::has($cacheKey));

        // Calling again returns cached copy
        $cachedCatalog = $this->service->getCatalog();
        $this->assertEquals($catalog, $cachedCatalog);
    }

    public function test_get_dropdown_options_returns_only_existing_tables(): void
    {
        $dropdown = $this->service->getDropdownOptions();

        $this->assertEquals('success', $dropdown['status']);
        $this->assertEquals(7, $dropdown['total_kitab']);
        $this->assertCount(7, $dropdown['kitabs']);
        $this->assertEquals('Seluruh Hadits', $dropdown['all_option']['name']);
        $this->assertEquals('7 Kitab', $dropdown['all_option']['badge']);
    }

    public function test_get_kitab_hadits_returns_null_for_invalid_kitab(): void
    {
        $result = $this->service->getKitabHadits('kitab_palsu', 1, 10);
        $this->assertNull($result);
    }

    public function test_get_kitab_hadits_with_valid_table(): void
    {
        DB::table('hadits_shahih_al_bukhari')->insert([
            ['id' => 1, 'no' => 1, 'kitab' => 'Shahih Al-Bukhari', 'kategori' => 'Kitab Niat', 'arab' => 'إنما الأعمال بالنيات', 'indonesia' => 'Sesungguhnya amal itu tergantung niatnya.', 'penjelasan' => '<p>Penjelasan niat</p>'],
            ['id' => 2, 'no' => 2, 'kitab' => 'Shahih Al-Bukhari', 'kategori' => 'Kitab Iman', 'arab' => 'بني الإسلام على خمس', 'indonesia' => 'Islam dibangun di atas lima perkara.', 'penjelasan' => null],
        ]);

        $result = $this->service->getKitabHadits('shahih_bukhari', 1, 2);

        $this->assertNotNull($result);
        $this->assertEquals('success', $result['status']);
        $this->assertEquals('Shahih Bukhari', $result['kitab']['name']);
        $this->assertCount(2, $result['data']);
        $this->assertEquals(1, $result['data'][0]->id);
        $this->assertEquals(1, $result['data'][0]->no);
        $this->assertEquals('إنما الأعمال بالنيات', $result['data'][0]->arab);
        $this->assertEquals('<p>Penjelasan niat</p>', $result['data'][0]->penjelasan);
    }

    public function test_get_hadits_detail_returns_null_for_invalid_kitab_or_missing_row(): void
    {
        $this->assertNull($this->service->getHaditsDetail('kitab_tidak_ada', 1));
        $this->assertNull($this->service->getHaditsDetail('shahih_bukhari', 99999));
    }

    public function test_get_hadits_detail_returns_correct_hadith_when_found(): void
    {
        DB::table('hadits_shahih_al_bukhari')->insertOrIgnore([
            'id' => 10,
            'no' => 10,
            'kitab' => 'Shahih Al-Bukhari',
            'kategori' => 'Kitab Iman',
            'arab' => 'المسلم من سلم المسلمون من لسانه ويده',
            'indonesia' => 'Muslim sejati adalah orang yang muslim lainnya selamat dari lidah dan tangannya.',
            'penjelasan' => '<p>Penjelasan muslim sejati</p>'
        ]);

        $result = $this->service->getHaditsDetail('shahih_bukhari', 10);

        $this->assertNotNull($result);
        $this->assertEquals('success', $result['status']);
        $this->assertEquals(10, $result['hadits']->id);
        $this->assertEquals(10, $result['hadits']->no);
        $this->assertEquals('Shahih Bukhari', $result['kitab']['name']);
        $this->assertStringContainsString('Muslim sejati', $result['hadits']->indonesia);
        $this->assertEquals('<p>Penjelasan muslim sejati</p>', $result['hadits']->penjelasan);
    }

    public function test_search_hadits_returns_results_for_single_kitab(): void
    {
        DB::table('hadits_shahih_al_bukhari')->insert([
            ['id' => 100, 'no' => 100, 'kitab' => 'Shahih Al-Bukhari', 'kategori' => 'Kitab Ilmu', 'arab' => 'طلب العلم فريضة', 'indonesia' => 'Menuntut ilmu adalah kewajiban.', 'penjelasan' => null],
            ['id' => 101, 'no' => 101, 'kitab' => 'Shahih Al-Bukhari', 'kategori' => 'Kitab Shalat', 'arab' => 'الصلاة عماد الدين', 'indonesia' => 'Shalat adalah tiang agama.', 'penjelasan' => null],
        ]);

        $result = $this->service->searchHadits('menuntut ilmu', 'shahih_bukhari', 1, 10);

        $this->assertEquals('success', $result['status']);
        $this->assertEquals('menuntut ilmu', $result['query']);
        $this->assertGreaterThanOrEqual(1, $result['pagination']['total']);
        $this->assertEquals(100, $result['data'][0]['id']);
    }

    public function test_get_featured_hadits_and_random_hadits(): void
    {
        DB::table('hadits_shahih_al_bukhari')->insertOrIgnore([
            'id' => 1,
            'no' => 1,
            'kitab' => 'Shahih Al-Bukhari',
            'kategori' => 'Kitab Niat',
            'arab' => 'إنما الأعمال بالنيات',
            'indonesia' => 'Semua amal tergantung niat.',
            'penjelasan' => '<p>Penjelasan featured</p>'
        ]);

        $featured = $this->service->getFeaturedHadits();

        if ($featured !== null) {
            $this->assertArrayHasKey('id', $featured);
            $this->assertArrayHasKey('kitab', $featured);
            $this->assertArrayHasKey('theme', $featured);
            $this->assertArrayHasKey('arab', $featured);
            $this->assertArrayHasKey('indonesia', $featured);
        } else {
            $this->assertNull($featured);
        }

        $random = $this->service->getRandomHadits();
        $this->assertEquals($featured, $random);
    }

    public function test_clear_all_cache(): void
    {
        Cache::put('hadits:catalog:summary', ['catalog'], 3600);
        $this->assertTrue(Cache::has('hadits:catalog:summary'));

        $cleared = $this->service->clearAllCache();
        $this->assertTrue($cleared);
        $this->assertFalse(Cache::has('hadits:catalog:summary'));
    }
}
