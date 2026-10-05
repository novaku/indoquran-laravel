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
            10 => "Surat Yunus Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 10) | IndoQuran",
            14 => "Surat Ibrahim Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 14) | IndoQuran",
            16 => "Surat An Nahl (Surah Lebah) Arab Latin & Terjemahan - {$this->total_ayahs} Ayat | IndoQuran",
            22 => "Surat Al Hajj Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 22) | IndoQuran",
            27 => "Surat An Naml (Surah Semut) Arab Latin & Terjemahan - {$this->total_ayahs} Ayat (QS 27) | IndoQuran",
            28 => "Surat Al Qasas Arab Latin & Terjemahan - {$this->total_ayahs} Ayat (Surat ke-28) | IndoQuran",
            30 => "Surat Ar Rum Arab Latin & Terjemahan - {$this->total_ayahs} Ayat (Surat ke-30) | IndoQuran",
            31 => "Surat Luqman Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 31) | IndoQuran",
            34 => "Surat Saba Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 34) | IndoQuran",
            37 => "Surat As Saffat Arab Latin & Terjemahan - {$this->total_ayahs} Ayat (Surat ke-37) | IndoQuran",
            38 => "Surat Shad Arab Latin & Terjemahan - {$this->total_ayahs} Ayat (Surat ke-38) | IndoQuran",
            39 => "Surat Az Zumar Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 39) | IndoQuran",
            40 => "Surat Ghafir (Al-Mu'min) Arab Latin & Arti - {$this->total_ayahs} Ayat (Surat ke-40) | IndoQuran",
            41 => "Surat Fussilat Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 41) | IndoQuran",
            47 => "Surat Muhammad Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 47) | IndoQuran",
            48 => "Surat Al Fath Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 48) | IndoQuran",
            52 => "Surat At Tur Arab Latin & Terjemahan - {$this->total_ayahs} Ayat (Surat ke-52) | IndoQuran",
            56 => "Surat Al Waqiah Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Pembuka Rezeki | IndoQuran",
            66 => "Surat At Tahrim Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 66) | IndoQuran",
            76 => "Surat Al Insan Arab Latin & Terjemahan - {$this->total_ayahs} Ayat (Surat ke-76) | IndoQuran",
            78 => "Surat An Naba Arab Latin & Terjemahan - {$this->total_ayahs} Ayat Lengkap (QS 78) | IndoQuran",
            104 => "Surat Al Humazah Arab Latin & Arti - {$this->total_ayahs} Ayat (Surat ke-104) | IndoQuran",
            105 => "Surat Al Fil (Alam Taro Kaifa) Arab Latin & Terjemahan - {$this->total_ayahs} Ayat | IndoQuran",
            112 => "Surat Al Ikhlas Arab Latin & Artinya - {$this->total_ayahs} Ayat (Setara 1/3 Quran) | IndoQuran",
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
            14 => "📖 Surat Ibrahim Lengkap {$this->total_ayahs} Ayat (QS 14) ✅ Teks Arab & Transliterasi Latin ✅ Terjemahan Indonesia Kemenag ✅ Audio Murottal ✅ Tafsir. Memuat kisah Nabi Ibrahim dan doa keteguhan iman. Baca online GRATIS!",
            39 => "📖 Surat Az Zumar Lengkap {$this->total_ayahs} Ayat (QS 39) ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir Ayat 9 (orang yang berilmu dan beribadah di waktu malam). Baca GRATIS!",
            22 => "📖 Surat Al Hajj Lengkap {$this->total_ayahs} Ayat (QS 22) ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Ayat 27 seruan ibadah haji ke Baitullah. Baca & dengar audio murottal GRATIS!",
            47 => "📖 Surat Muhammad Lengkap {$this->total_ayahs} Ayat (QS 47) ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Ayat 7 pertolongan Allah (Intansurullah yansurkum). Baca online GRATIS!",
            48 => "📖 Surat Al Fath Lengkap {$this->total_ayahs} Ayat (QS 48) ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Ayat 28 kemenangan agama Islam. Baca & dengar audio murottal GRATIS!",
            31 => "📖 Surat Luqman Lengkap {$this->total_ayahs} Ayat (QS 31) ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Nasihat bijak Luqman kepada anaknya (Ayat 14 berbakti kepada orang tua). Baca GRATIS!",
            78 => "📖 Surat An Naba Lengkap {$this->total_ayahs} Ayat (QS 78 / Berita Besar) ✅ Pembuka Juz 30 (Juz Amma) ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Audio Murottal. Baca online GRATIS!",
            105 => "📖 Surat Al Fil (Alam Taro Kaifa) Lengkap {$this->total_ayahs} Ayat ✅ Teks Arab, Latin & Arti ✅ Kisah pasukan gajah Abrahah dihancurkan burung Ababil. Surat ke-105 Al-Quran. Baca GRATIS!",
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
            "surat ke {$this->number}",
            "surah ke {$this->number}",
            "surat ke {$this->number} dalam al quran",
            "qs {$this->number}",
            "surat {$name} berapa ayat",
            "surat {$name} lengkap",
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
