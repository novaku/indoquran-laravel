<?php

namespace Tests\Unit\Models;

use App\Models\SelectedPrayer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectedPrayerTest extends TestCase
{
    use RefreshDatabase;

    public function test_scope_by_category(): void
    {
        SelectedPrayer::create([
            'title' => 'Doa Bangun Tidur',
            'category' => 'daily',
            'category_name' => 'Doa Harian',
            'arabic' => 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا',
            'latin' => 'Alhamdulillahilladzi ahyana',
            'translation' => 'Segala puji bagi Allah yang telah menghidupkan kami',
            'order' => 1,
        ]);

        SelectedPrayer::create([
            'title' => 'Doa Sapu Jagad',
            'category' => 'quran',
            'category_name' => 'Doa Quran',
            'arabic' => 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
            'latin' => 'Rabbana atina fid-dunya hasanah',
            'translation' => 'Wahai Tuhan kami berikan kebaikan di dunia',
            'order' => 2,
        ]);

        $this->assertCount(1, SelectedPrayer::byCategory('daily')->get());
        $this->assertCount(1, SelectedPrayer::byCategory('quran')->get());
        $this->assertCount(2, SelectedPrayer::byCategory('all')->get());
        $this->assertCount(2, SelectedPrayer::byCategory(null)->get());
    }

    public function test_scope_search(): void
    {
        SelectedPrayer::create([
            'title' => 'Doa Masuk Masjid',
            'category' => 'daily',
            'category_name' => 'Doa Harian',
            'arabic' => 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
            'latin' => 'Allahummaf-tah lii abwaaba rahmatik',
            'translation' => 'Ya Allah bukakanlah pintu rahmat-Mu',
            'source' => 'HR. Muslim',
            'order' => 1,
        ]);

        $searchTitle = SelectedPrayer::search('Masjid')->get();
        $this->assertCount(1, $searchTitle);

        $searchLatin = SelectedPrayer::search('abwaaba')->get();
        $this->assertCount(1, $searchLatin);

        $searchSource = SelectedPrayer::search('Muslim')->get();
        $this->assertCount(1, $searchSource);

        $searchNoMatch = SelectedPrayer::search('TidakAdaKataIni')->get();
        $this->assertCount(0, $searchNoMatch);
    }
}
