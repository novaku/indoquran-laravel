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
                'description_short' => 'Surah pembuka Al-Quran yang berisi <strong>doa dan pujian</strong> kepada Allah SWT.',
                'description_long' => '<p>Surah Al-Fatihah (Pembukaan) adalah surah pertama dalam Al-Quran. Terdiri dari <strong>7 ayat</strong>, surah ini juga dikenal dengan nama:</p><ul><li><em>Ummul Kitab</em> (Induk Kitab)</li><li><em>Sab\'ul Matsani</em> (Tujuh ayat yang diulang-ulang)</li></ul><p>Surah ini mengajarkan cara berdoa yang benar kepada Allah SWT, berisi pujian kepada Allah, pernyataan ketaatan, dan permohonan petunjuk jalan yang lurus.</p>'
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
                'description_short' => 'Surah <strong>terpanjang</strong> dalam Al-Quran yang berisi berbagai <em>hukum Islam</em>.',
                'description_long' => '<p>Surah Al-Baqarah (Sapi Betina) adalah surah terpanjang dalam Al-Quran dengan <strong>286 ayat</strong>. Surah ini dinamai "Al-Baqarah" karena menyebutkan kisah Bani Israil yang diperintahkan untuk menyembelih seekor sapi betina.</p><p>Surah ini mencakup berbagai aspek hukum Islam, termasuk:</p><ul><li>Ibadah dan ritual keagamaan</li><li>Muamalah dan transaksi bisnis</li><li>Kisah-kisah umat terdahulu</li><li>Hukum keluarga dan warisan</li></ul>'
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
                'description_short' => 'Surah tentang <strong>keluarga Imran</strong> dan kelahiran <em>Nabi Isa AS</em>.',
                'description_long' => '<p>Surah Ali \'Imran (Keluarga Imran) berisi <strong>200 ayat</strong> yang sebagian besar diturunkan setelah <em>Perang Uhud</em>.</p><p>Surah ini dinamai "Ali \'Imran" karena menyebutkan kisah keluarga Imran, termasuk:</p><ul><li>Kelahiran Maryam</li><li>Kelahiran Isa A.S.</li><li>Mukjizat-mukjizat Isa A.S.</li></ul><p>Surah ini juga berisi ajaran tentang <strong>tauhid</strong>, perintah jihad, dan hikmah dari kekalahan dalam Perang Uhud.</p>'
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
                'description_short' => 'Surah yang membahas <strong>hukum wanita</strong>, pernikahan, dan <em>keluarga</em>.',
                'description_long' => '<p>Surah An-Nisa (Wanita) membahas banyak hukum yang berkaitan dengan:</p><ul><li><strong>Wanita dan hak-haknya</strong></li><li>Pernikahan dan perceraian</li><li>Keluarga dan pengasuhan anak</li><li>Warisan dan pembagian harta</li></ul><p>Surah ini juga berbicara tentang perang, perdamaian, dan hubungan dengan <em>Ahli Kitab</em>.</p>'
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
                'description_short' => 'Surah tentang <strong>hukum syariat</strong> dan kisah <em>hidangan Nabi Isa AS</em>.',
                'description_long' => '<p>Surah Al-Ma\'idah (Hidangan) mengandung banyak hukum syariat seperti:</p><ul><li><strong>Makanan halal dan haram</strong></li><li>Wudhu dan bersuci</li><li>Tayammum</li><li>Qishash (hukum pembalasan)</li></ul><p>Surah ini juga berisi kisah tentang <em>hidangan yang diminta oleh pengikut Nabi Isa A.S.</em> sebagai mukjizat dan tanda kebesaran Allah.</p>'
            ]
        ];

        foreach ($surahs as $surah) {
            Surah::create($surah);
        }
    }
}
