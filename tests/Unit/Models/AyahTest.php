<?php

namespace Tests\Unit\Models;

use App\Models\Ayah;
use App\Models\Surah;
use App\Models\User;
use App\Models\UserAyahBookmark;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AyahTest extends TestCase
{
    use RefreshDatabase;

    public function test_matches_exact_search_text_consecutive_phrase(): void
    {
        $text = 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang';

        $this->assertTrue(Ayah::matchesExactSearchText($text, 'Maha Pengasih'));
        $this->assertTrue(Ayah::matchesExactSearchText($text, 'nama Allah'));
        $this->assertTrue(Ayah::matchesExactSearchText($text, 'lagi Maha'));
        $this->assertFalse(Ayah::matchesExactSearchText($text, 'Pengasih Maha'));
        $this->assertFalse(Ayah::matchesExactSearchText($text, 'Pengasihan'));
        $this->assertFalse(Ayah::matchesExactSearchText('', 'Allah'));
        $this->assertFalse(Ayah::matchesExactSearchText($text, ''));
    }

    public function test_scope_search_indonesian_text(): void
    {
        $surah = Surah::create([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_indonesian' => 'Pembukaan',
            'total_ayahs' => 7,
            'revelation_place' => 'Mekah',
            'description_long' => 'Deskripsi surah',
        ]);

        $ayah1 = Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 1,
            'text_arabic' => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'text_latin' => 'Bismillaahir Rahmaanir Rahiim',
            'text_indonesian' => 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang',
            'juz' => 1,
            'page' => 1,
        ]);

        $ayah2 = Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 2,
            'text_arabic' => 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            'text_latin' => 'Al-hamdu lillaahi Rabbil \'aalamiin',
            'text_indonesian' => 'Segala puji bagi Allah Tuhan semesta alam',
            'juz' => 1,
            'page' => 1,
        ]);

        $resultsBoth = Ayah::searchIndonesianText('Allah')->get();
        $this->assertCount(2, $resultsBoth);

        $resultsPenyayang = Ayah::searchIndonesianText('Maha Penyayang')->get();
        $this->assertCount(1, $resultsPenyayang);
        $this->assertEquals($ayah1->id, $resultsPenyayang->first()->id);

        $emptyQuery = Ayah::searchIndonesianText('   ')->get();
        $this->assertCount(2, $emptyQuery);
    }

    public function test_relationships(): void
    {
        $surah = Surah::create([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_indonesian' => 'Pembukaan',
            'total_ayahs' => 7,
            'revelation_place' => 'Mekah',
            'description_long' => 'Deskripsi surah',
        ]);

        $ayah = Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 1,
            'text_arabic' => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'text_latin' => 'Bismillaahir Rahmaanir Rahiim',
            'text_indonesian' => 'Dengan nama Allah',
            'juz' => 1,
            'page' => 1,
            'audio_urls' => ['01' => 'https://audio.url/1.mp3'],
        ]);

        $user = User::factory()->create();

        UserAyahBookmark::create([
            'user_id' => $user->id,
            'ayah_id' => $ayah->id,
            'is_favorite' => true,
            'notes' => 'Catatan ayat',
        ]);

        $this->assertInstanceOf(Surah::class, $ayah->surah);
        $this->assertEquals(1, $ayah->surah->number);

        $this->assertCount(1, $ayah->bookmarks);
        $this->assertCount(1, $ayah->bookmarkedByUsers);
        $this->assertEquals($user->id, $ayah->bookmarkedByUsers->first()->id);
        $this->assertIsArray($ayah->audio_urls);
    }
}
