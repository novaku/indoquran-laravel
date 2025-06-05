<?php

namespace Database\Seeders;

use App\Models\Surah;
use Illuminate\Database\Seeder;

class SurahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample data for some common surahs
        $surahs = [
            [
                'number' => 1,
                'total_ayahs' => 7,
                'name_indonesian' => 'Pembukaan',
                'name_arabic' => 'الفاتحة',
                'name_latin' => 'Al-Fatihah',
                'revelation_place' => 'Makkah',
                'audio_urls' => json_encode([
                    'husary' => 'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/001.mp3',
                    'sudais' => 'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/001.mp3',
                    'alafasy' => 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3',
                    'minshawi' => 'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/001.mp3',
                    'abdulbasit' => 'https://download.quranicaudio.com/quran/abdulbaset_abdulsamad/001.mp3'
                ]),
                'description' => 'Surah Al-Fatihah (Pembukaan) adalah surah pertama dalam Al-Quran. Terdiri dari 7 ayat, surah ini juga dikenal dengan nama Ummul Kitab (Induk Kitab) atau Sab\'ul Matsani (Tujuh ayat yang diulang-ulang). Surah ini mengajarkan cara berdoa yang benar kepada Allah SWT, berisi pujian kepada Allah, pernyataan ketaatan, dan permohonan petunjuk jalan yang lurus.'
            ],
            [
                'number' => 2,
                'total_ayahs' => 286,
                'name_indonesian' => 'Sapi Betina',
                'name_arabic' => 'البقرة',
                'name_latin' => 'Al-Baqarah',
                'revelation_place' => 'Madinah',
                'audio_urls' => json_encode([
                    'husary' => 'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/002.mp3',
                    'sudais' => 'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/002.mp3',
                    'alafasy' => 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/002.mp3',
                    'minshawi' => 'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/002.mp3',
                    'abdulbasit' => 'https://download.quranicaudio.com/quran/abdulbaset_abdulsamad/002.mp3'
                ]),
                'description' => 'Surah Al-Baqarah (Sapi Betina) adalah surah terpanjang dalam Al-Quran dengan 286 ayat. Surah ini dinamai "Al-Baqarah" karena menyebutkan kisah Bani Israil yang diperintahkan untuk menyembelih seekor sapi betina. Surah ini mencakup berbagai aspek hukum Islam, termasuk ibadah, muamalah, dan kisah-kisah umat terdahulu.'
            ],
            [
                'number' => 3,
                'total_ayahs' => 200,
                'name_indonesian' => 'Keluarga Imran',
                'name_arabic' => 'آل عمران',
                'name_latin' => 'Ali \'Imran',
                'revelation_place' => 'Madinah',
                'audio_urls' => json_encode([
                    'husary' => 'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/003.mp3',
                    'sudais' => 'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/003.mp3',
                    'alafasy' => 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/003.mp3',
                    'minshawi' => 'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/003.mp3',
                    'abdulbasit' => 'https://download.quranicaudio.com/quran/abdulbaset_abdulsamad/003.mp3'
                ]),
                'description' => 'Surah Ali \'Imran (Keluarga Imran) berisi 200 ayat yang sebagian besar diturunkan setelah Perang Uhud. Surah ini dinamai "Ali \'Imran" karena menyebutkan kisah keluarga Imran, termasuk kelahiran Maryam dan Isa A.S. Surah ini juga berisi ajaran tentang tauhid, perintah jihad, dan hikmah dari kekalahan dalam Perang Uhud.'
            ],
            [
                'number' => 4,
                'total_ayahs' => 176,
                'name_indonesian' => 'Wanita',
                'name_arabic' => 'النساء',
                'name_latin' => 'An-Nisa',
                'revelation_place' => 'Madinah',
                'audio_urls' => json_encode([
                    'husary' => 'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/004.mp3',
                    'sudais' => 'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/004.mp3',
                    'alafasy' => 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/004.mp3',
                    'minshawi' => 'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/004.mp3',
                    'abdulbasit' => 'https://download.quranicaudio.com/quran/abdulbaset_abdulsamad/004.mp3'
                ]),
                'description' => 'Surah An-Nisa (Wanita) membahas banyak hukum yang berkaitan dengan wanita, pernikahan, keluarga, dan warisan. Surah ini juga berbicara tentang perang, perdamaian, dan hubungan dengan Ahli Kitab.'
            ],
            [
                'number' => 5,
                'total_ayahs' => 120,
                'name_indonesian' => 'Hidangan',
                'name_arabic' => 'المائدة',
                'name_latin' => 'Al-Ma\'idah',
                'revelation_place' => 'Madinah',
                'audio_urls' => json_encode([
                    'husary' => 'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/005.mp3',
                    'sudais' => 'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/005.mp3',
                    'alafasy' => 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/005.mp3',
                    'minshawi' => 'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/005.mp3',
                    'abdulbasit' => 'https://download.quranicaudio.com/quran/abdulbaset_abdulsamad/005.mp3'
                ]),
                'description' => 'Surah Al-Ma\'idah (Hidangan) mengandung banyak hukum syariat seperti makanan yang halal dan haram, wudhu, tayammum, dan qishash. Surah ini juga berisi kisah tentang hidangan yang diminta oleh pengikut Nabi Isa A.S.'
            ]
        ];

        foreach ($surahs as $surah) {
            Surah::create($surah);
        }
    }
}
