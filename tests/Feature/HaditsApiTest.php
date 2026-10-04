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
        DB::table('hadits_shahih_al_bukhari')->insert([
            [
                'id' => 1,
                'no' => 1,
                'kitab' => 'Shahih Al-Bukhari',
                'kategori' => 'Kitab Permulaan Wahyu',
                'arab' => 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
                'indonesia' => 'Sesungguhnya amal perbuatan itu tergantung niatnya.',
                'penjelasan' => '<p>Penjelasan hadits niat dan keikhlasan dalam beramal.</p>',
            ],
            [
                'id' => 2,
                'no' => 2,
                'kitab' => 'Shahih Al-Bukhari',
                'kategori' => 'Kitab Iman',
                'arab' => 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ',
                'indonesia' => 'Islam dibangun di atas lima perkara.',
                'penjelasan' => '<p>Penjelasan lima rukun Islam.</p>',
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

        $this->assertEquals(7, $response->json('total_kitab'));
        $this->assertNotEmpty($response->json('kitabs'));
    }

    public function test_get_hadits_dropdown_returns_valid_options(): void
    {
        $response = $this->getJson('/api/hadits/dropdown');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'total_kitab',
                'total_hadits',
                'all_option' => [
                    'slug',
                    'name',
                    'badge',
                    'description',
                ],
                'kitabs',
            ]);

        $this->assertEquals(7, $response->json('total_kitab'));
        $this->assertEquals('Seluruh Hadits', $response->json('all_option.name'));
        $this->assertEquals('7 Kitab', $response->json('all_option.badge'));
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
        $this->assertStringContainsString('niatnya', $response->json('hadits.indonesia'));
        $this->assertStringContainsString('keikhlasan', $response->json('hadits.penjelasan'));
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

    public function test_search_hadits_targets_indonesia_field(): void
    {
        $response = $this->getJson('/api/hadits/search?q=amal&kitab=shahih_bukhari&page=1&per_page=15');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('kitab_filter', 'shahih_bukhari');

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $item) {
            $this->assertStringContainsStringIgnoringCase('amal', $item['indonesia']);
        }
    }

    public function test_clear_cache_hadits(): void
    {
        $response = $this->postJson('/api/hadits/clear-cache');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }
}
