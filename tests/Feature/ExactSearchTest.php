<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

class ExactSearchTest extends BaseTestCase
{
    use RefreshDatabase;

    public function createApplication()
    {
        return require __DIR__ . '/../../bootstrap/app.php';
    }

    public function test_exact_search_only_returns_whole_word_matches(): void
    {
        $this->createSearchFixtures();

        $response = $this->getJson('/api/cari?q=isa&exact=1');

        $response->assertOk();
        $response->assertJsonPath('query.search_mode', 'EXACT');
        $response->assertJsonPath('pagination.total', 1);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.text_indonesian', 'isa');
    }

    public function test_default_search_still_matches_substrings(): void
    {
        $this->createSearchFixtures();

        $response = $this->getJson('/api/cari?q=isa');

        $response->assertOk();
        $response->assertJsonPath('query.search_mode', 'AND');
        $response->assertJsonPath('pagination.total', 2);
        $response->assertJsonCount(2, 'data');
    }

    private function createSearchFixtures(): void
    {
        Surah::create([
            'number' => 1,
            'total_ayahs' => 2,
            'name_indonesian' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_latin' => 'Al-Fatihah',
            'revelation_place' => 'makkah',
            'description' => 'Fixture surah'
        ]);

        Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 1,
            'text_indonesian' => 'misalkan',
            'text_arabic' => 'مثلا',
            'text_latin' => 'misalkan',
            'juz' => 1,
            'page' => 1,
            'tafsir' => 'Fixture ayah'
        ]);

        Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 2,
            'text_indonesian' => 'isa',
            'text_arabic' => 'عيسى',
            'text_latin' => 'isa',
            'juz' => 1,
            'page' => 1,
            'tafsir' => 'Fixture ayah'
        ]);
    }
}