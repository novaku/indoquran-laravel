<?php

namespace Database\Seeders;

use App\Models\Surah;
use App\Models\Ayah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuranDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Downloading Quran data... This might take a while.');
        
        // Get list of all surahs
        $response = Http::get('https://api.quran.com/api/v4/chapters?language=id');
        
        if (!$response->successful()) {
            $this->command->error('Failed to download surah data.');
            return;
        }
        
        $surahs = $response->json()['chapters'];
        $this->command->info('Downloaded ' . count($surahs) . ' surahs information.');
        
        // Process each surah
        foreach ($surahs as $surahData) {
            $this->command->info("Processing Surah {$surahData['id']}: {$surahData['name_simple']}");
            
            // Create surah record
            $surah = Surah::updateOrCreate(
                ['number' => $surahData['id']],
                [
                    'total_ayahs' => $surahData['verses_count'],
                    'name_indonesian' => $surahData['translated_name']['name'] ?? $surahData['name_simple'],
                    'name_arabic' => $surahData['name_arabic'],
                    'name_latin' => $surahData['name_simple'],
                    'revelation_place' => strtolower($surahData['revelation_place']),
                    'audio_urls' => json_encode([
                        'alafasy' => "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/{$this->formatSurahNumber($surahData['id'])}.mp3",
                        'sudais' => "https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/{$this->formatSurahNumber($surahData['id'])}.mp3",
                        'husary' => "https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/{$this->formatSurahNumber($surahData['id'])}.mp3"
                    ]),
                    'description' => $surahData['translated_name']['name'] . ' adalah surah ke-' . $surahData['id'] . ' dalam Al-Quran.'
                ]
            );
            
            // Get ayahs for this surah
            $ayahsResponse = Http::get("https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number={$surahData['id']}");
            $translationResponse = Http::get("https://api.quran.com/api/v4/quran/translations/33?chapter_number={$surahData['id']}");
            
            // Fix: Updated transliteration endpoint to fetch valid data
            $transliterationResponse = Http::get("https://api.quran.com/api/v4/quran/translations/84?chapter_number={$surahData['id']}");
            
            if (!$ayahsResponse->successful() || !$translationResponse->successful()) {
                $this->command->error("Failed to download ayahs for surah {$surahData['id']}");
                continue;
            }
            
            $arabicVerses = $ayahsResponse->json()['verses'];
            $translationVerses = $translationResponse->json()['translations'];
            
            // Fix: Check if transliteration is successful and log result
            $transliterationVerses = [];
            if ($transliterationResponse->successful()) {
                $transliterationVerses = $transliterationResponse->json()['translations'] ?? [];
                $this->command->info("Retrieved " . count($transliterationVerses) . " transliterations for surah {$surahData['id']}");
            } else {
                $this->command->warn("Failed to get transliterations for surah {$surahData['id']}");
            }
            
            for ($i = 0; $i < count($arabicVerses); $i++) {
                // API might have different structures, so we check for verse_key first
                if (isset($arabicVerses[$i]['verse_key'])) {
                    // verse_key is usually in format "1:1" (surah:ayah)
                    $parts = explode(':', $arabicVerses[$i]['verse_key']);
                    $ayahNumber = $parts[1] ?? ($i + 1);
                } elseif (isset($arabicVerses[$i]['verse_number'])) {
                    $ayahNumber = $arabicVerses[$i]['verse_number'];
                } else {
                    // Fallback to using the array index + 1 as the ayah number
                    $ayahNumber = $i + 1;
                }
                
                // Fix: Explicitly use correct transliteration data or provide fallback
                if (isset($transliterationVerses[$i]) && !empty($transliterationVerses[$i]['text'])) {
                    $transliteration = $transliterationVerses[$i]['text'];
                    $this->command->info("Adding transliteration for ayah {$ayahNumber}");
                } else {
                    // Generate a basic transliteration as fallback
                    $transliteration = "Ayah {$ayahNumber} transliteration";
                }

                Ayah::updateOrCreate(
                    [
                        'surah_number' => $surahData['id'],
                        'ayah_number' => $ayahNumber
                    ],
                    [
                        'text_arabic' => $arabicVerses[$i]['text_uthmani'] ?? ($arabicVerses[$i]['text'] ?? ''),
                        'text_indonesian' => $translationVerses[$i]['text'] ?? 'Terjemahan tidak tersedia',
                        'text_latin' => $transliteration,
                        'audio_urls' => json_encode([
                            'alafasy' => "https://verses.quran.com/Alafasy/{$this->formatSurahNumber($surahData['id'])}{$this->formatAyahNumber($ayahNumber)}.mp3"
                        ]),
                        'juz' => $this->getJuzNumber($surahData['id'], $ayahNumber),
                        'page' => $this->getPageNumber($surahData['id'], $ayahNumber)
                    ]
                );
            }
            
            $this->command->info("Completed processing {$surah->total_ayahs} ayahs for Surah {$surahData['id']}");
        }
        
        $this->command->info("Quran data import complete!");
    }
    
    /**
     * Format surah number to 3 digits (e.g. 1 -> 001)
     */
    private function formatSurahNumber($number)
    {
        return str_pad($number, 3, '0', STR_PAD_LEFT);
    }
    
    /**
     * Format ayah number to 3 digits (e.g. 1 -> 001)
     */
    private function formatAyahNumber($number)
    {
        return str_pad($number, 3, '0', STR_PAD_LEFT);
    }
    
    /**
     * Get Juz number for a given surah and ayah
     * This is a simplified implementation
     */
    private function getJuzNumber($surahNumber, $ayahNumber)
    {
        // Very simplified juz calculation - in reality, this would need a mapping table
        return ceil(($surahNumber * $ayahNumber) / 600);
    }
    
    /**
     * Get Page number for a given surah and ayah
     * This is a simplified implementation
     */
    private function getPageNumber($surahNumber, $ayahNumber)
    {
        // Very simplified page calculation - in reality, this would need a mapping table
        return ceil(($surahNumber * $ayahNumber) / 30);
    }
}
