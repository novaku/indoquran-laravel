<?php

namespace Tests\Unit\Models;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurahTest extends TestCase
{
    use RefreshDatabase;

    public function test_seo_title_special_and_default(): void
    {
        $surahFatihah = new Surah([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'total_ayahs' => 7,
        ]);
        $this->assertEquals('Surat Al Fatihah - 7 Ayat Pembukaan Al-Quran | IndoQuran', $surahFatihah->getSeoTitle());

        $surahYasin = new Surah([
            'number' => 36,
            'name_latin' => 'Yasin',
            'total_ayahs' => 83,
        ]);
        $this->assertEquals('Surat Yasin Arab Latin & Artinya - 83 Ayat Lengkap | IndoQuran', $surahYasin->getSeoTitle());

        $surahCustom = new Surah([
            'number' => 114,
            'name_latin' => 'An-Nas',
            'total_ayahs' => 6,
        ]);
        $this->assertEquals('Surat An-Nas Arab Latin & Arti - 6 Ayat | IndoQuran', $surahCustom->getSeoTitle());
    }

    public function test_seo_description_special_and_default(): void
    {
        $surahBaqarah = new Surah([
            'number' => 2,
            'name_latin' => 'Al-Baqarah',
            'total_ayahs' => 286,
        ]);
        $this->assertStringContainsString('Surat Al Baqarah Lengkap 286 Ayat (Surah Terpanjang)', $surahBaqarah->getSeoDescription());

        $surahIkhlas = new Surah([
            'number' => 112,
            'name_latin' => 'Al-Ikhlas',
            'name_arabic' => 'الإخلاص',
            'total_ayahs' => 4,
        ]);
        $this->assertStringContainsString('Surat Al-Ikhlas (الإخلاص) Lengkap 4 Ayat', $surahIkhlas->getSeoDescription());
    }

    public function test_seo_keywords(): void
    {
        $surah = new Surah([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
        ]);

        $keywords = $surah->getSeoKeywords();
        $this->assertStringContainsString('surat al-fatihah', $keywords);
        $this->assertStringContainsString('الفاتحة', $keywords);
        $this->assertStringContainsString('al quran surah 1', $keywords);
    }

    public function test_is_popular_surah(): void
    {
        $popular = new Surah(['number' => 36]);
        $this->assertTrue($popular->isPopularSurah());

        $notPopular = new Surah(['number' => 77]);
        $this->assertFalse($notPopular->isPopularSurah());
    }

    public function test_get_faq_info(): void
    {
        $surahYasin = new Surah([
            'number' => 36,
            'name_latin' => 'Yasin',
            'total_ayahs' => 83,
            'revelation_place' => 'Mekah',
        ]);

        $faq = $surahYasin->getFaqInfo();
        $this->assertEquals(36, $faq['number']);
        $this->assertEquals('Yasin', $faq['name']);
        $this->assertEquals('Jantung Al-Quran (Qalbul Quran)', $faq['significance']);
        $this->assertEquals('Keimanan dan kebangkitan', $faq['theme']);
    }

    public function test_ayahs_relationship(): void
    {
        $surah = Surah::create([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_indonesian' => 'Pembukaan',
            'total_ayahs' => 7,
            'revelation_place' => 'Mekah',
            'description_long' => 'Deskripsi panjang Al-Fatihah',
        ]);

        Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 1,
            'text_arabic' => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'text_latin' => 'Bismillaahir Rahmaanir Rahiim',
            'text_indonesian' => 'Dengan nama Allah',
            'juz' => 1,
            'page' => 1,
        ]);

        $this->assertCount(1, $surah->ayahs);
        $this->assertEquals(1, $surah->ayahs->first()->ayah_number);
    }
}
