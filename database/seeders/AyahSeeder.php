<?php

namespace Database\Seeders;

use App\Models\Ayah;
use Illuminate\Database\Seeder;

class AyahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample ayahs for Surah Al-Fatihah (1)
        $ayahs = [
            [
                'surah_number' => 1,
                'ayah_number' => 1,
                'text_arabic' => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                'text_latin' => 'Bismillāhir-raḥmānir-raḥīm',
                'juz' => 1,
                'page' => 1,
                'text_indonesian' => 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
                'tafsir' => 'Ayat ini adalah pembuka dari setiap surah (kecuali At-Taubah) dan menunjukkan bahwa segala perbuatan hendaknya dimulai dengan menyebut nama Allah.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/001001.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001001.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001001.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/001001.mp3'
                ])
            ],
            [
                'surah_number' => 1,
                'ayah_number' => 2,
                'text_arabic' => 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                'text_latin' => 'Al-ḥamdu lillāhi rabbil-\'ālamīn',
                'juz' => 1,
                'page' => 1,
                'text_indonesian' => 'Segala puji bagi Allah, Tuhan seluruh alam.',
                'tafsir' => 'Ayat ini mengajarkan bahwa segala puji hanya layak ditujukan kepada Allah SWT, Tuhan yang menciptakan, memelihara, dan mengatur seluruh alam.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/001002.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001002.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001002.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/001002.mp3'
                ])
            ],
            [
                'surah_number' => 1,
                'ayah_number' => 3,
                'text_arabic' => 'الرَّحْمَٰنِ الرَّحِيمِ',
                'text_latin' => 'Ar-raḥmānir-raḥīm',
                'juz' => 1,
                'page' => 1,
                'text_indonesian' => 'Yang Maha Pengasih, Maha Penyayang.',
                'tafsir' => 'Ayat ini menegaskan sifat Allah yang Maha Pengasih dan Penyayang. Ar-Rahman menunjukkan rahmat Allah yang luas kepada seluruh makhluk di dunia, sedangkan Ar-Rahim menunjukkan rahmat khusus bagi orang-orang beriman di akhirat.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/001003.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001003.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/001003.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001003.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/001003.mp3'
                ])
            ],
            [
                'surah_number' => 1,
                'ayah_number' => 4,
                'text_arabic' => 'مَالِكِ يَوْمِ الدِّينِ',
                'text_latin' => 'Māliki yawmid-dīn',
                'juz' => 1,
                'page' => 1,
                'text_indonesian' => 'Pemilik Hari Pembalasan.',
                'tafsir' => 'Ayat ini mengingatkan bahwa Allah adalah penguasa mutlak pada hari pembalasan (hari kiamat), di mana setiap orang akan mempertanggungjawabkan perbuatannya.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/001004.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001004.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/001004.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001004.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/001004.mp3'
                ])
            ],
            [
                'surah_number' => 1,
                'ayah_number' => 5,
                'text_arabic' => 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
                'text_latin' => 'Iyyāka na\'budu wa iyyāka nasta\'īn',
                'juz' => 1,
                'page' => 1,
                'text_indonesian' => 'Hanya kepada Engkau kami menyembah dan hanya kepada Engkau kami mohon pertolongan.',
                'tafsir' => 'Ayat ini adalah pernyataan penghambaan diri kepada Allah semata, tidak menyekutukan-Nya dengan apapun, dan hanya memohon pertolongan kepada-Nya saja.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/001005.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001005.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/001005.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001005.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/001005.mp3'
                ])
            ],
            [
                'surah_number' => 1,
                'ayah_number' => 6,
                'text_arabic' => 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
                'text_latin' => 'Ihdinaṣ-ṣirāṭal-mustaqīm',
                'juz' => 1,
                'page' => 1,
                'text_indonesian' => 'Tunjukilah kami jalan yang lurus.',
                'tafsir' => 'Ayat ini adalah doa memohon petunjuk kepada Allah untuk dibimbing ke jalan yang lurus, yaitu jalan kebenaran dan keselamatan.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/001006.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001006.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/001006.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001006.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/001006.mp3'
                ])
            ],
            [
                'surah_number' => 1,
                'ayah_number' => 7,
                'text_arabic' => 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
                'text_latin' => 'Ṣirāṭallażīna an\'amta \'alaihim gairil-magḍụbi \'alaihim wa laḍ-ḍāllīn',
                'juz' => 1,
                'page' => 1,
                'text_indonesian' => '(Yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
                'tafsir' => 'Ayat ini menjelaskan jalan lurus yang dimaksud adalah jalan yang ditempuh oleh orang-orang yang telah mendapat nikmat dari Allah yaitu para nabi, shiddiqin, syuhada, dan orang-orang saleh. Bukan jalan orang-orang yang dimurkai seperti orang-orang yang mengetahui kebenaran tetapi tidak mengamalkannya, dan bukan pula jalan orang-orang yang sesat yaitu yang tidak mengetahui kebenaran.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/001007.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001007.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001007.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/001007.mp3'
                ])
            ],
            // Example of first ayah from Surah Al-Baqarah
            [
                'surah_number' => 2,
                'ayah_number' => 1,
                'text_arabic' => 'الم',
                'text_latin' => 'Alif Lām Mīm',
                'juz' => 1,
                'page' => 2,
                'text_indonesian' => 'Alif Lam Mim.',
                'tafsir' => 'Alif Lam Mim termasuk huruf-huruf muqatta\'ah (huruf-huruf yang terpotong) di awal beberapa surah Al-Quran. Maknanya hanya Allah yang tahu pasti.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/002001.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/002001.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/002001.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/002001.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/002001.mp3'
                ])
            ],
            [
                'surah_number' => 2,
                'ayah_number' => 2,
                'text_arabic' => 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
                'text_latin' => 'Żālikal-kitābu lā raiba fīh, hudal lil-muttaqīn',
                'juz' => 1,
                'page' => 2,
                'text_indonesian' => 'Kitab (Al-Quran) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa.',
                'tafsir' => 'Ayat ini menegaskan bahwa Al-Quran adalah kitab yang tidak ada keraguan di dalamnya, dan menjadi petunjuk bagi orang-orang yang bertakwa, yaitu mereka yang menjaga diri dari azab Allah dengan mengikuti perintah-Nya dan menjauhi larangan-Nya.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/002002.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/002002.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/002002.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/002002.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/002002.mp3'
                ])
            ],
            [
                'surah_number' => 2,
                'ayah_number' => 3,
                'text_arabic' => 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ',
                'text_latin' => 'Allażīna yu\'minụna bil-gaibi wa yuqīmụnaṣ-ṣalāta wa mimmā razaqnāhum yunfiqụn',
                'juz' => 1,
                'page' => 2,
                'text_indonesian' => '(Yaitu) mereka yang beriman kepada yang gaib, melaksanakan salat, dan menginfakkan sebagian rezeki yang Kami berikan kepada mereka.',
                'tafsir' => 'Ayat ini menjelaskan sifat orang-orang bertakwa, yaitu: (1) beriman kepada hal-hal gaib seperti Allah, malaikat, hari kiamat, dll.; (2) mendirikan shalat dengan sempurna; dan (3) menginfakkan sebagian rezeki yang diberikan Allah.',
                'audio_urls' => json_encode([
                    'husary' => 'https://everyayah.com/data/Husary_128kbps/002003.mp3',
                    'sudais' => 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/002003.mp3',
                    'alafasy' => 'https://everyayah.com/data/Alafasy_128kbps/002003.mp3',
                    'minshawi' => 'https://everyayah.com/data/Minshawy_Murattal_128kbps/002003.mp3',
                    'abdulbasit' => 'https://everyayah.com/data/AbdulSamad_128kbps_ketaballah.com/002003.mp3'
                ])
            ]
        ];

        foreach ($ayahs as $ayah) {
            Ayah::create($ayah);
        }
    }
}
