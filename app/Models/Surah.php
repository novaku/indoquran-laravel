<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Surah extends Model
{
    protected $fillable = [
        'number',
        'total_ayahs',
        'name_indonesian',
        'name_arabic',
        'name_latin',
        'revelation_place',
        'audio_urls',
        'description_short',
        'description_long'
    ];

    protected $casts = [
        'audio_urls' => 'array'
    ];

    /**
     * Get the ayahs for the surah.
     */
    public function ayahs(): HasMany
    {
        return $this->hasMany(Ayah::class, 'surah_number', 'number');
    }

    /**
     * Get SEO-optimized title for this surah
     * Based on Google Search Console query patterns
     */
    public function getSeoTitle(): string
    {
        $specialTitles = [
            96 => "Surat Al Alaq Arab, Latin & Arti - Lengkap {$this->total_ayahs} Ayat | IndoQuran",
            2 => "Surat Al Baqarah - {$this->total_ayahs} Ayat Teks Arab & Terjemahan | IndoQuran",
            36 => "Surat Yasin Arab Latin & Artinya - {$this->total_ayahs} Ayat Lengkap | IndoQuran",
            18 => "Surat Al Kahfi - {$this->total_ayahs} Ayat Arab Latin & Terjemahan | IndoQuran",
            1 => "Surat Al Fatihah - {$this->total_ayahs} Ayat Pembukaan Al-Quran | IndoQuran",
            55 => "Surat Ar Rahman - {$this->total_ayahs} Ayat Penuh Keajaiban | IndoQuran",
            67 => "Surat Al Mulk - {$this->total_ayahs} Ayat Penyelamat Kubur | IndoQuran",
        ];

        return $specialTitles[$this->number] ?? "Surat {$this->name_latin} Arab Latin & Arti - {$this->total_ayahs} Ayat | IndoQuran";
    }

    /**
     * Get SEO-optimized description for this surah
     * Includes emojis and key benefits
     */
    public function getSeoDescription(): string
    {
        $specialDescriptions = [
            96 => "📖 Surat Al Alaq Lengkap {$this->total_ayahs} Ayat ✅ Teks Arab & Latin ✅ Arti Per Ayat ✅ Audio MP3 ✅ Tafsir. Surah ke-{$this->number}, diturunkan di Mekah. Surah pertama turun (wahyu pertama). Baca online GRATIS!",
            2 => "📖 Surat Al Baqarah Lengkap {$this->total_ayahs} Ayat (Surah Terpanjang) ✅ Teks Arab ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir. Surah ke-{$this->number} Al-Quran. Baca & dengar online GRATIS!",
            36 => "📖 Surat Yasin Lengkap {$this->total_ayahs} Ayat ✅ Arab & Latin ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir. Jantung Al-Quran, dibaca untuk orang yang meninggal. Baca online GRATIS!",
            18 => "📖 Surat Al Kahfi Lengkap {$this->total_ayahs} Ayat ✅ Arab & Latin ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir. Dibaca setiap Jumat untuk keberkahan. Baca online GRATIS!",
        ];

        return $specialDescriptions[$this->number] ?? "📖 Surat {$this->name_latin} ({$this->name_arabic}) Lengkap {$this->total_ayahs} Ayat ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir. Surah ke-{$this->number}. Baca online GRATIS!";
    }

    /**
     * Get SEO keywords for this surah
     * Based on popular search patterns
     */
    public function getSeoKeywords(): string
    {
        $name = strtolower($this->name_latin);
        
        return implode(', ', [
            "surat {$name}",
            "surah {$name}",
            "{$name} arab latin",
            "{$name} artinya",
            "{$name} terjemahan",
            "{$name} audio",
            $this->name_arabic,
            "al quran surah {$this->number}",
            "quran surat {$name}",
            "tafsir {$name}",
            "qs {$name}"
        ]);
    }

    /**
     * Check if this is a popular surah based on search data
     */
    public function isPopularSurah(): bool
    {
        // Based on Google Search Console data and religious importance
        $popularSurahs = [96, 1, 2, 18, 36, 55, 56, 67, 112, 113, 114];
        return in_array($this->number, $popularSurahs);
    }

    /**
     * Get surah-specific information for FAQ
     */
    public function getFaqInfo(): array
    {
        $info = [
            'total_ayahs' => $this->total_ayahs,
            'number' => $this->number,
            'revelation_place' => $this->revelation_place ?? 'Mekah',
            'name' => $this->name_latin,
        ];

        // Add special info for specific surahs
        $specialInfo = [
            96 => ['significance' => 'Surah pertama yang diturunkan (wahyu pertama)', 'theme' => 'Pentingnya ilmu pengetahuan dan membaca'],
            1 => ['significance' => 'Pembukaan Al-Quran (Ummul Quran)', 'theme' => 'Doa terbaik yang diajarkan Allah'],
            2 => ['significance' => 'Surah terpanjang dalam Al-Quran', 'theme' => 'Hukum Islam lengkap, mengandung Ayat Kursi'],
            36 => ['significance' => 'Jantung Al-Quran (Qalbul Quran)', 'theme' => 'Keimanan dan kebangkitan'],
            18 => ['significance' => 'Dibaca setiap hari Jumat', 'theme' => 'Perlindungan dari fitnah Dajjal'],
            67 => ['significance' => 'Penyelamat dari azab kubur', 'theme' => 'Kerajaan Allah dan kekuasaan-Nya'],
            112 => ['significance' => 'Setara 1/3 Al-Quran', 'theme' => 'Keesaan Allah (Tauhid)'],
        ];

        if (isset($specialInfo[$this->number])) {
            $info = array_merge($info, $specialInfo[$this->number]);
        }

        return $info;
    }
}
