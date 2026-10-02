<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HaditsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed sample hadiths in SQLite test database
        DB::table('hadits_shahih_bukhari')->insert([
            [
                'id' => 1,
                'kitab' => 'Shahih Bukhari',
                'arab' => 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
                'terjemah' => 'Sesungguhnya amal perbuatan itu tergantung niatnya.',
            ],
            [
                'id' => 2,
                'kitab' => 'Shahih Bukhari',
                'arab' => 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ',
                'terjemah' => 'Islam dibangun di atas lima perkara.',
            ],
        ]);
    }

    public function test_get_hadits_catalog_returns_all_kitabs(): void
    {
        $response = $this->getJson('/api/hadits');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'total_hadits',
                'total_kitab',
                'kitabs',
            ]);

        $this->assertEquals(11, $response->json('total_kitab'));
        $this->assertNotEmpty($response->json('kitabs'));
    }

    public function test_get_kitab_hadits_list(): void
    {
        $response = $this->getJson('/api/hadits/shahih_bukhari');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('kitab.slug', 'shahih_bukhari')
            ->assertJsonPath('kitab.name', 'Shahih Bukhari');

        $hadiths = $response->json('data');
        $this->assertNotEmpty($hadiths);
        $this->assertEquals(1, $hadiths[0]['id']);
    }

    public function test_get_kitab_hadits_list_with_alias(): void
    {
        $response = $this->getJson('/api/hadits/bukhari');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('kitab.slug', 'shahih_bukhari');
    }

    public function test_get_hadits_detail_success(): void
    {
        $response = $this->getJson('/api/hadits/shahih_bukhari/1');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('hadits.id', 1)
            ->assertJsonPath('kitab.slug', 'shahih_bukhari');

        $this->assertStringContainsString('الأَعْمَالُ', $response->json('hadits.arab'));
        $this->assertStringContainsString('niatnya', $response->json('hadits.terjemah'));
    }

    public function test_get_hadits_detail_not_found(): void
    {
        $response = $this->getJson('/api/hadits/shahih_bukhari/9999');

        $response->assertStatus(404)
            ->assertJsonPath('status', 'error');
    }

    public function test_get_invalid_kitab_returns_404(): void
    {
        $response = $this->getJson('/api/hadits/kitab_tidak_ada');

        $response->assertStatus(404)
            ->assertJsonPath('status', 'error');
    }

    public function test_search_hadits(): void
    {
        $response = $this->getJson('/api/hadits/search?q=amal');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'query',
                'kitab_filter',
                'groups',
                'pagination',
                'data',
            ]);

        $results = $response->json('data');
        $this->assertNotEmpty($results);
        $this->assertEquals(1, $results[0]['id']);
    }

    public function test_clear_cache_hadits(): void
    {
        $response = $this->postJson('/api/hadits/clear-cache');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }
}
