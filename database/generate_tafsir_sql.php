<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TafsirMaudhuiTopic;
use App\Models\Surah;
use Illuminate\Support\Str;

$surahs = Surah::pluck('total_ayahs', 'number')->toArray();
$existingSlugs = TafsirMaudhuiTopic::pluck('slug')->toArray();
$existingTopics = TafsirMaudhuiTopic::pluck('topic')->toArray();
$currentMaxId = TafsirMaudhuiTopic::max('id') ?? 0;
$currentMaxOrder = TafsirMaudhuiTopic::max('sort_order') ?? 0;

$newTopicsData = [
    // 1. KISAH PARA NABI & TOKOH
    [
        'topic' => 'Kisah Nabi Adam AS dan Asal Mula Manusia',
        'description' => 'Penciptaan manusia pertama dari tanah, kemuliaan ilmu yang dianugerahkan Allah, godaan iblis karena kesombongan, hikmah ujian pohon terlarang, serta teladan istighfar dan taubat yang diterima Allah SWT.',
        'verses' => [
            ['surah' => 2, 'ayah' => 30],
            ['surah' => 2, 'ayah' => 31],
            ['surah' => 2, 'ayah' => 34],
            ['surah' => 2, 'ayah' => 35],
            ['surah' => 2, 'ayah' => 36],
            ['surah' => 2, 'ayah' => 37],
            ['surah' => 7, 'ayah' => 11],
            ['surah' => 7, 'ayah' => 19],
            ['surah' => 7, 'ayah' => 22],
            ['surah' => 7, 'ayah' => 23],
            ['surah' => 15, 'ayah' => 28],
            ['surah' => 15, 'ayah' => 29],
            ['surah' => 20, 'ayah' => 115],
            ['surah' => 20, 'ayah' => 121],
            ['surah' => 20, 'ayah' => 122],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Nuh AS dan Bahtera Penyelamat',
        'description' => 'Ketabahan dan keteguhan Nabi Nuh AS dalam berdakwah selama 950 tahun, perintah pembuatan bahtera di atas bukit, peristiwa banjir besar, serta kisah kepedihan seorang ayah atas anaknya yang ingkar.',
        'verses' => [
            ['surah' => 7, 'ayah' => 59],
            ['surah' => 11, 'ayah' => 25],
            ['surah' => 11, 'ayah' => 36],
            ['surah' => 11, 'ayah' => 37],
            ['surah' => 11, 'ayah' => 40],
            ['surah' => 11, 'ayah' => 42],
            ['surah' => 11, 'ayah' => 43],
            ['surah' => 11, 'ayah' => 44],
            ['surah' => 11, 'ayah' => 45],
            ['surah' => 11, 'ayah' => 47],
            ['surah' => 23, 'ayah' => 27],
            ['surah' => 26, 'ayah' => 105],
            ['surah' => 71, 'ayah' => 1],
            ['surah' => 71, 'ayah' => 10],
            ['surah' => 71, 'ayah' => 28],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Ibrahim AS dan Ketauhidan Sejati',
        'description' => 'Perjalanan pencarian kebenaran melalui perenungan akal, keberanian menghancurkan berhala, mukjizat selamat dari kobaran api, keikhlasan berkurban, serta pembangunan Ka\'bah bersama Nabi Ismail AS.',
        'verses' => [
            ['surah' => 2, 'ayah' => 124],
            ['surah' => 2, 'ayah' => 127],
            ['surah' => 2, 'ayah' => 128],
            ['surah' => 6, 'ayah' => 74],
            ['surah' => 6, 'ayah' => 76],
            ['surah' => 6, 'ayah' => 77],
            ['surah' => 6, 'ayah' => 78],
            ['surah' => 6, 'ayah' => 79],
            ['surah' => 14, 'ayah' => 35],
            ['surah' => 14, 'ayah' => 37],
            ['surah' => 16, 'ayah' => 120],
            ['surah' => 21, 'ayah' => 51],
            ['surah' => 21, 'ayah' => 69],
            ['surah' => 37, 'ayah' => 100],
            ['surah' => 37, 'ayah' => 102],
            ['surah' => 37, 'ayah' => 107],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Yusuf AS: Sabar, Integritas, dan Kejayaan',
        'description' => 'Kisah terbaik (Ahsanul Qashash) tentang kecemburuan saudara, keteguhan menjaga kesucian dari godaan syahwat, kesabaran dalam penjara, serta kemampuan manajemen ekonomi menghadapi krisis pangan.',
        'verses' => [
            ['surah' => 12, 'ayah' => 3],
            ['surah' => 12, 'ayah' => 4],
            ['surah' => 12, 'ayah' => 15],
            ['surah' => 12, 'ayah' => 23],
            ['surah' => 12, 'ayah' => 24],
            ['surah' => 12, 'ayah' => 33],
            ['surah' => 12, 'ayah' => 47],
            ['surah' => 12, 'ayah' => 48],
            ['surah' => 12, 'ayah' => 55],
            ['surah' => 12, 'ayah' => 56],
            ['surah' => 12, 'ayah' => 87],
            ['surah' => 12, 'ayah' => 90],
            ['surah' => 12, 'ayah' => 92],
            ['surah' => 12, 'ayah' => 100],
            ['surah' => 12, 'ayah' => 101],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Musa AS dan Perlawanan terhadap Tirani Fir\'aun',
        'description' => 'Perjuangan menegakkan keadilan melawan penguasa tiran yang menindas kaum lemah, mukjizat tongkat dan laut merah terbelah, serta dialog ketauhidan dan dialog hukum di Bukit Sinai.',
        'verses' => [
            ['surah' => 2, 'ayah' => 50],
            ['surah' => 7, 'ayah' => 104],
            ['surah' => 7, 'ayah' => 143],
            ['surah' => 20, 'ayah' => 9],
            ['surah' => 20, 'ayah' => 25],
            ['surah' => 20, 'ayah' => 43],
            ['surah' => 20, 'ayah' => 44],
            ['surah' => 20, 'ayah' => 77],
            ['surah' => 26, 'ayah' => 61],
            ['surah' => 26, 'ayah' => 62],
            ['surah' => 26, 'ayah' => 63],
            ['surah' => 28, 'ayah' => 4],
            ['surah' => 28, 'ayah' => 7],
            ['surah' => 28, 'ayah' => 26],
            ['surah' => 28, 'ayah' => 30],
        ]
    ],
    [
        'topic' => 'Kisah Maryam dan Kelahiran Mukjizat Nabi Isa AS',
        'description' => 'Kesucian dan ketaatan ibadah Sayyidah Maryam, kabar gembira dari Malaikat Jibril, mukjizat kelahiran Nabi Isa AS tanpa ayah, serta dakwah tauhid dan mukjizat menyembuhkan orang sakit atas izin Allah.',
        'verses' => [
            ['surah' => 3, 'ayah' => 42],
            ['surah' => 3, 'ayah' => 45],
            ['surah' => 3, 'ayah' => 49],
            ['surah' => 3, 'ayah' => 59],
            ['surah' => 4, 'ayah' => 157],
            ['surah' => 5, 'ayah' => 110],
            ['surah' => 5, 'ayah' => 116],
            ['surah' => 19, 'ayah' => 16],
            ['surah' => 19, 'ayah' => 19],
            ['surah' => 19, 'ayah' => 20],
            ['surah' => 19, 'ayah' => 29],
            ['surah' => 19, 'ayah' => 30],
            ['surah' => 19, 'ayah' => 31],
            ['surah' => 19, 'ayah' => 32],
            ['surah' => 19, 'ayah' => 33],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Sulaiman AS: Kekuasaan, Kebijaksanaan, dan Rasa Syukur',
        'description' => 'Karunia kerajaan agung yang tidak pernah dimiliki siapapun, mukjizat memahami bahasa hewan dan mengendalikan angin, ketundukan Ratu Balqis, serta keteladanan rasa syukur di puncak kekuasaan.',
        'verses' => [
            ['surah' => 21, 'ayah' => 78],
            ['surah' => 21, 'ayah' => 79],
            ['surah' => 21, 'ayah' => 81],
            ['surah' => 27, 'ayah' => 15],
            ['surah' => 27, 'ayah' => 16],
            ['surah' => 27, 'ayah' => 17],
            ['surah' => 27, 'ayah' => 18],
            ['surah' => 27, 'ayah' => 19],
            ['surah' => 27, 'ayah' => 20],
            ['surah' => 27, 'ayah' => 30],
            ['surah' => 27, 'ayah' => 40],
            ['surah' => 27, 'ayah' => 44],
            ['surah' => 34, 'ayah' => 12],
            ['surah' => 38, 'ayah' => 30],
            ['surah' => 38, 'ayah' => 35],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Daud AS: Keadilan Pemimpin dan Keberanian',
        'description' => 'Keberanian Daud muda mengalahkan Jalut, karunia kitab Zabur, kebijaksanaan dalam memutus perkara secara adil, serta mukjizat melunakkan besi dan bertasbihnya gunung dan burung bersamanya.',
        'verses' => [
            ['surah' => 2, 'ayah' => 251],
            ['surah' => 4, 'ayah' => 163],
            ['surah' => 17, 'ayah' => 55],
            ['surah' => 21, 'ayah' => 78],
            ['surah' => 21, 'ayah' => 80],
            ['surah' => 34, 'ayah' => 10],
            ['surah' => 34, 'ayah' => 11],
            ['surah' => 38, 'ayah' => 17],
            ['surah' => 38, 'ayah' => 18],
            ['surah' => 38, 'ayah' => 19],
            ['surah' => 38, 'ayah' => 24],
            ['surah' => 38, 'ayah' => 26],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Ayyub AS: Ketabahan Menghadapi Sakit dan Ujian',
        'description' => 'Teladan puncak kesabaran manusia menghadapi ujian hilangnya harta, wafatnya keturunan, dan derita penyakit bertahun-tahun tanpa sekalipun berburuk sangka kepada Allah hingga datang kesembuhan mukjizat.',
        'verses' => [
            ['surah' => 4, 'ayah' => 163],
            ['surah' => 6, 'ayah' => 84],
            ['surah' => 21, 'ayah' => 83],
            ['surah' => 21, 'ayah' => 84],
            ['surah' => 38, 'ayah' => 41],
            ['surah' => 38, 'ayah' => 42],
            ['surah' => 38, 'ayah' => 43],
            ['surah' => 38, 'ayah' => 44],
        ]
    ],
    [
        'topic' => 'Kisah Nabi Yunus AS: Doa di Dalam Tiga Kegelapan',
        'description' => 'Pelajaran pentingnya kesabaran dalam berdakwah, penyesalan dan pengakuan kelemahan diri di dalam perut ikan paus (Dzun Nun), serta dahsyatnya pertolongan Allah berkat doa tauhid dan tasbih.',
        'verses' => [
            ['surah' => 4, 'ayah' => 163],
            ['surah' => 6, 'ayah' => 86],
            ['surah' => 10, 'ayah' => 98],
            ['surah' => 21, 'ayah' => 87],
            ['surah' => 21, 'ayah' => 88],
            ['surah' => 37, 'ayah' => 139],
            ['surah' => 37, 'ayah' => 140],
            ['surah' => 37, 'ayah' => 141],
            ['surah' => 37, 'ayah' => 142],
            ['surah' => 37, 'ayah' => 143],
            ['surah' => 37, 'ayah' => 144],
            ['surah' => 37, 'ayah' => 145],
            ['surah' => 37, 'ayah' => 146],
            ['surah' => 68, 'ayah' => 48],
            ['surah' => 68, 'ayah' => 49],
            ['surah' => 68, 'ayah' => 50],
        ]
    ],
    [
        'topic' => 'Kisah Ashabul Kahfi: Pemuda Penjaga Aqidah',
        'description' => 'Keteladanan para pemuda beriman yang berani mengambil sikap tegas mempertahankan iman dari penguasa tiran, perlindungan mukjizat tidur 309 tahun di dalam gua, serta bukti kebangkitan setelah mati.',
        'verses' => [
            ['surah' => 18, 'ayah' => 9],
            ['surah' => 18, 'ayah' => 10],
            ['surah' => 18, 'ayah' => 13],
            ['surah' => 18, 'ayah' => 14],
            ['surah' => 18, 'ayah' => 16],
            ['surah' => 18, 'ayah' => 17],
            ['surah' => 18, 'ayah' => 18],
            ['surah' => 18, 'ayah' => 19],
            ['surah' => 18, 'ayah' => 21],
            ['surah' => 18, 'ayah' => 25],
        ]
    ],
    [
        'topic' => 'Kisah Luqman Al-Hakim: Fondasi Pendidikan Karakter Anak',
        'description' => 'Wasiat agung Luqman kepada putranya yang memuat kurikulum pendidikan anak lengkap: larangan syirik, berbakti kepada orang tua, kewajiban shalat, amar ma\'ruf nahi munkar, serta adab sopan santun dan rendah hati.',
        'verses' => [
            ['surah' => 31, 'ayah' => 12],
            ['surah' => 31, 'ayah' => 13],
            ['surah' => 31, 'ayah' => 14],
            ['surah' => 31, 'ayah' => 15],
            ['surah' => 31, 'ayah' => 16],
            ['surah' => 31, 'ayah' => 17],
            ['surah' => 31, 'ayah' => 18],
            ['surah' => 31, 'ayah' => 19],
        ]
    ],
    [
        'topic' => 'Kisah Dzulkarnain dan Tembok Pelindung Ya\'juj Ma\'juj',
        'description' => 'Keteladanan pemimpin berilmu yang memanfaatkan kekuasaan untuk melindungi rakyat tertindas, bepergian ke timur dan barat bumi, serta keahlian metalurgi mendirikan benteng besi kokoh.',
        'verses' => [
            ['surah' => 18, 'ayah' => 83],
            ['surah' => 18, 'ayah' => 84],
            ['surah' => 18, 'ayah' => 86],
            ['surah' => 18, 'ayah' => 87],
            ['surah' => 18, 'ayah' => 88],
            ['surah' => 18, 'ayah' => 90],
            ['surah' => 18, 'ayah' => 93],
            ['surah' => 18, 'ayah' => 94],
            ['surah' => 18, 'ayah' => 95],
            ['surah' => 18, 'ayah' => 96],
            ['surah' => 18, 'ayah' => 97],
            ['surah' => 18, 'ayah' => 98],
            ['surah' => 21, 'ayah' => 96],
        ]
    ],
    [
        'topic' => 'Kisah Qarun dan Bahaya Kesombongan Harta',
        'description' => 'Peringatan keras bagi orang yang mabuk kekayaan, menganggap hartanya adalah hasil kepintaran diri semata, enggan berbagi kepada kaum dhuafa, hingga akhirnya ditelan bumi beserta seluruh perbendaharaannya.',
        'verses' => [
            ['surah' => 28, 'ayah' => 76],
            ['surah' => 28, 'ayah' => 77],
            ['surah' => 28, 'ayah' => 78],
            ['surah' => 28, 'ayah' => 79],
            ['surah' => 28, 'ayah' => 80],
            ['surah' => 28, 'ayah' => 81],
            ['surah' => 28, 'ayah' => 82],
        ]
    ],

    // 2. SAINS & FENOMENA ALAM DALAM AL-QUR'AN
    [
        'topic' => 'Penciptaan Alam Semesta dan Teori Kosmologi',
        'description' => 'Ayat-ayat kauniyah tentang asal mula penciptaan langit dan bumi dari satu kesatuan yang padu (Big Bang), perluasan alam semesta yang terus berlangsung, serta rotasi dan orbit benda-benda antariksa.',
        'verses' => [
            ['surah' => 21, 'ayah' => 30],
            ['surah' => 21, 'ayah' => 33],
            ['surah' => 41, 'ayah' => 11],
            ['surah' => 51, 'ayah' => 47],
            ['surah' => 36, 'ayah' => 38],
            ['surah' => 36, 'ayah' => 39],
            ['surah' => 36, 'ayah' => 40],
            ['surah' => 39, 'ayah' => 5],
            ['surah' => 67, 'ayah' => 3],
            ['surah' => 67, 'ayah' => 4],
        ]
    ],
    [
        'topic' => 'Tahapan Embriologi dan Penciptaan Manusia',
        'description' => 'Deskripsi ilmiah akurat dalam Al-Qur\'an mengenai tahapan perkembangan janin dalam rahim ibu: dari setetes mani (nuthfah), segumpal darah (\'alaqah), segumpal daging (mudghah), pembentukan tulang belulang dan otot, hingga peniupan ruh.',
        'verses' => [
            ['surah' => 22, 'ayah' => 5],
            ['surah' => 23, 'ayah' => 12],
            ['surah' => 23, 'ayah' => 13],
            ['surah' => 23, 'ayah' => 14],
            ['surah' => 32, 'ayah' => 7],
            ['surah' => 32, 'ayah' => 8],
            ['surah' => 32, 'ayah' => 9],
            ['surah' => 39, 'ayah' => 6],
            ['surah' => 75, 'ayah' => 37],
            ['surah' => 75, 'ayah' => 38],
            ['surah' => 75, 'ayah' => 39],
            ['surah' => 96, 'ayah' => 1],
            ['surah' => 96, 'ayah' => 2],
        ]
    ],
    [
        'topic' => 'Siklus Air dan Proses Terjadinya Hujan',
        'description' => 'Penjelasan Al-Qur\'an tentang mekanisme penguapan, pergerakan angin pengangkut awan, pembentukan tetesan hujan dari awan bertingkat (kumulonimbus), serta peran vital air bagi kehidupan seluruh makhluk di bumi.',
        'verses' => [
            ['surah' => 15, 'ayah' => 22],
            ['surah' => 23, 'ayah' => 18],
            ['surah' => 24, 'ayah' => 43],
            ['surah' => 30, 'ayah' => 48],
            ['surah' => 35, 'ayah' => 9],
            ['surah' => 39, 'ayah' => 21],
            ['surah' => 50, 'ayah' => 9],
            ['surah' => 56, 'ayah' => 68],
            ['surah' => 56, 'ayah' => 69],
            ['surah' => 56, 'ayah' => 70],
        ]
    ],
    [
        'topic' => 'Gunung sebagai Pasak dan Penstabil Bumi',
        'description' => 'Fungsi geologis gunung-gunung tinggi yang memiliki akar menghujam ke dalam mantel bumi (isostasi) untuk meredam guncangan kerak bumi dan menjaga kestabilan permukaan planet.',
        'verses' => [
            ['surah' => 16, 'ayah' => 15],
            ['surah' => 21, 'ayah' => 31],
            ['surah' => 27, 'ayah' => 88],
            ['surah' => 31, 'ayah' => 10],
            ['surah' => 78, 'ayah' => 6],
            ['surah' => 78, 'ayah' => 7],
            ['surah' => 79, 'ayah' => 32],
            ['surah' => 88, 'ayah' => 19],
        ]
    ],
    [
        'topic' => 'Pertemuan Dua Lautan dan Dinding Pemisah Alami',
        'description' => 'Fenomena hidrologi bertemunya dua perairan (asin dan tawar) yang tidak saling mendominasi karena perbedaan massa jenis, suhu, dan salinitas, menjadi tanda keagungan kuasa Allah Sang Pencipta.',
        'verses' => [
            ['surah' => 25, 'ayah' => 53],
            ['surah' => 27, 'ayah' => 61],
            ['surah' => 35, 'ayah' => 12],
            ['surah' => 55, 'ayah' => 19],
            ['surah' => 55, 'ayah' => 20],
            ['surah' => 55, 'ayah' => 21],
            ['surah' => 55, 'ayah' => 22],
        ]
    ],
    [
        'topic' => 'Dunia Hewan dan Serangga sebagai Inspirasi Kehidupan',
        'description' => 'Keteraturan koloni dan manfaat madu lebah sebagai obat, kecerdasan dan sistem komunikasi semut, laba-laba dan kerapuhan sarangnya, serta burung yang terbang dengan sayap terkembang.',
        'verses' => [
            ['surah' => 6, 'ayah' => 38],
            ['surah' => 16, 'ayah' => 68],
            ['surah' => 16, 'ayah' => 69],
            ['surah' => 24, 'ayah' => 41],
            ['surah' => 27, 'ayah' => 18],
            ['surah' => 29, 'ayah' => 41],
            ['surah' => 67, 'ayah' => 19],
        ]
    ],
    [
        'topic' => 'Tumbuh-tumbuhan, Fotosintesis, dan Keragaman Hayati',
        'description' => 'Keajaiban butir klorofil yang memproses cahaya, tumbuhnya aneka ragam tanaman dan buah-buahan berpasang-pasangan yang disiram dengan air yang sama namun memiliki rasa yang berbeda.',
        'verses' => [
            ['surah' => 6, 'ayah' => 95],
            ['surah' => 6, 'ayah' => 99],
            ['surah' => 13, 'ayah' => 4],
            ['surah' => 20, 'ayah' => 53],
            ['surah' => 36, 'ayah' => 33],
            ['surah' => 36, 'ayah' => 34],
            ['surah' => 36, 'ayah' => 35],
            ['surah' => 36, 'ayah' => 36],
            ['surah' => 50, 'ayah' => 7],
            ['surah' => 50, 'ayah' => 8],
        ]
    ],
    [
        'topic' => 'Atmosfer Bumi dan Lapisan Langit Pelindung',
        'description' => 'Lapisan atmosfer bumi sebagai pelindung (saqfan mahfuzhan) dari benda-benda luar angkasa dan radiasi sinar berbahaya, serta fenomena berkurangnya oksigen dan sesaknya dada di ketinggian.',
        'verses' => [
            ['surah' => 2, 'ayah' => 22],
            ['surah' => 6, 'ayah' => 125],
            ['surah' => 21, 'ayah' => 32],
            ['surah' => 41, 'ayah' => 12],
            ['surah' => 67, 'ayah' => 3],
            ['surah' => 86, 'ayah' => 11],
        ]
    ],

    // 3. KESEHATAN MENTAL & KETENANGAN JIWA
    [
        'topic' => 'Mengatasi Stres, Kesedihan, dan Kecemasan',
        'description' => 'Terapi spiritual Al-Qur\'an saat menghadapi duka lara mendalam, rasa khawatir akan masa depan, kesedihan atas masa lalu, serta janji Allah bahwa bersama kesulitan selalu ada kemudahan ganda.',
        'verses' => [
            ['surah' => 2, 'ayah' => 155],
            ['surah' => 2, 'ayah' => 156],
            ['surah' => 2, 'ayah' => 157],
            ['surah' => 3, 'ayah' => 139],
            ['surah' => 9, 'ayah' => 40],
            ['surah' => 12, 'ayah' => 86],
            ['surah' => 16, 'ayah' => 127],
            ['surah' => 94, 'ayah' => 1],
            ['surah' => 94, 'ayah' => 5],
            ['surah' => 94, 'ayah' => 6],
            ['surah' => 94, 'ayah' => 7],
            ['surah' => 94, 'ayah' => 8],
        ]
    ],
    [
        'topic' => 'Konsep Jiwa Tenang dan Ketenangan Hati (Thuma\'ninah)',
        'description' => 'Hakikat ketenteraman batin yang diraih dengan mengingat Allah (Dzikrullah), membaca dan mentadabburi wahyu, hingga mencapai tingkatan jiwa yang tenang (An-Nafs Al-Muthma\'innah) yang diridhai Allah.',
        'verses' => [
            ['surah' => 3, 'ayah' => 126],
            ['surah' => 8, 'ayah' => 2],
            ['surah' => 13, 'ayah' => 28],
            ['surah' => 48, 'ayah' => 4],
            ['surah' => 48, 'ayah' => 18],
            ['surah' => 89, 'ayah' => 27],
            ['surah' => 89, 'ayah' => 28],
            ['surah' => 89, 'ayah' => 29],
            ['surah' => 89, 'ayah' => 30],
        ]
    ],
    [
        'topic' => 'Manajemen Amarah dan Pengendalian Emosi Diri',
        'description' => 'Ciri orang bertakwa yang mampu menahan amarah (Al-Kazhiminal Ghaizh), memaafkan kesalahan orang lain dengan lapang dada, serta menolak perlakuan buruk dengan kebaikan yang jauh lebih indah.',
        'verses' => [
            ['surah' => 3, 'ayah' => 133],
            ['surah' => 3, 'ayah' => 134],
            ['surah' => 7, 'ayah' => 199],
            ['surah' => 7, 'ayah' => 200],
            ['surah' => 23, 'ayah' => 96],
            ['surah' => 41, 'ayah' => 34],
            ['surah' => 41, 'ayah' => 35],
            ['surah' => 42, 'ayah' => 37],
        ]
    ],
    [
        'topic' => 'Bahaya Keputusasaan dan Menjaga Optimisme Hidup',
        'description' => 'Larangan keras berputus asa dari rahmat Allah betapapun besarnya dosa atau beratnya ujian, serta perintah untuk senantiasa memelihara harapan (raja\') dan berprasangka baik kepada ketetapan Allah.',
        'verses' => [
            ['surah' => 12, 'ayah' => 87],
            ['surah' => 15, 'ayah' => 56],
            ['surah' => 39, 'ayah' => 53],
            ['surah' => 40, 'ayah' => 55],
            ['surah' => 65, 'ayah' => 2],
            ['surah' => 65, 'ayah' => 3],
        ]
    ],
    [
        'topic' => 'Al-Qur\'an sebagai Syifa\' (Obat Penyembuh Hati dan Fisik)',
        'description' => 'Keutamaan ayat-ayat suci Al-Qur\'an sebagai penyembuh dari penyakit keraguan aqidah, iri dengki, kemunafikan, kegundahan jiwa, serta rahmat penyejuk bagi orang-orang yang beriman.',
        'verses' => [
            ['surah' => 10, 'ayah' => 57],
            ['surah' => 16, 'ayah' => 69],
            ['surah' => 17, 'ayah' => 82],
            ['surah' => 26, 'ayah' => 80],
            ['surah' => 41, 'ayah' => 44],
        ]
    ],

    // 4. ETIKA DIGITAL & KOMUNIKASI
    [
        'topic' => 'Prinsip Tabayyun: Verifikasi Informasi dan Melawan Hoaks',
        'description' => 'Kewajiban meneliti dan memverifikasi kebenaran setiap informasi dari sumber yang tidak jelas sebelum disebarluaskan, agar tidak menimpakan bahaya atau fitnah kepada orang lain tanpa disadari.',
        'verses' => [
            ['surah' => 4, 'ayah' => 83],
            ['surah' => 4, 'ayah' => 94],
            ['surah' => 17, 'ayah' => 36],
            ['surah' => 24, 'ayah' => 12],
            ['surah' => 24, 'ayah' => 15],
            ['surah' => 49, 'ayah' => 6],
        ]
    ],
    [
        'topic' => 'Etika Berkomunikasi: Kaidah Perkataan Mulia dalam Islam',
        'description' => 'Enam kaidah komunikasi Al-Qur\'an: perkataan yang benar (qawlan sadida), perkataan lemah lembut (qawlan layyina), perkataan yang pantas (qawlan ma\'rufa), perkataan yang mulia (qawlan karima), perkataan yang membekas (qawlan baligha), dan perkataan yang mudah dipahami (qawlan maysura).',
        'verses' => [
            ['surah' => 2, 'ayah' => 83],
            ['surah' => 4, 'ayah' => 9],
            ['surah' => 4, 'ayah' => 63],
            ['surah' => 17, 'ayah' => 23],
            ['surah' => 17, 'ayah' => 28],
            ['surah' => 17, 'ayah' => 53],
            ['surah' => 20, 'ayah' => 44],
            ['surah' => 33, 'ayah' => 70],
        ]
    ],
    [
        'topic' => 'Larangan Cyberbullying, Mencela, dan Panggilan Buruk',
        'description' => 'Larangan menghina, merendahkan, mengolok-olok fisik atau latar belakang orang lain, mencari-cari keburukan (tajassus), serta memanggil sesama manusia dengan julukan-julukan yang merendahkan martabat.',
        'verses' => [
            ['surah' => 49, 'ayah' => 11],
            ['surah' => 49, 'ayah' => 12],
            ['surah' => 104, 'ayah' => 1],
            ['surah' => 68, 'ayah' => 10],
            ['surah' => 68, 'ayah' => 11],
        ]
    ],
    [
        'topic' => 'Menjaga Pandangan, Privasi, dan Adab Meminta Izin (Isti\'dzan)',
        'description' => 'Kewajiban menundukkan pandangan (ghadhul bashar) bagi pria dan wanita beriman, menjaga kehormatan, serta adab menghormati privasi ruang pribadi dan rumah orang lain.',
        'verses' => [
            ['surah' => 24, 'ayah' => 27],
            ['surah' => 24, 'ayah' => 28],
            ['surah' => 24, 'ayah' => 29],
            ['surah' => 24, 'ayah' => 30],
            ['surah' => 24, 'ayah' => 31],
            ['surah' => 24, 'ayah' => 58],
            ['surah' => 33, 'ayah' => 53],
        ]
    ],

    // 5. EKONOMI SYARIAH & MUAMALAH KONTEMPORER
    [
        'topic' => 'Etika Transaksi Finansial dan Pencatatan Akad Hutang',
        'description' => 'Panduan terpanjang dalam Al-Qur\'an (Ayat Mudayanah) mengenai pencatatan transaksi kredit/hutang secara tertulis, kehadiran saksi yang adil, serta prinsip transparansi dalam berniaga.',
        'verses' => [
            ['surah' => 2, 'ayah' => 282],
            ['surah' => 2, 'ayah' => 283],
            ['surah' => 4, 'ayah' => 29],
            ['surah' => 5, 'ayah' => 1],
        ]
    ],
    [
        'topic' => 'Kelonggaran Finansial bagi yang Kesulitan Membayar Hutang',
        'description' => 'Anjuran kemanusiaan tingkat tinggi dalam Islam untuk memberikan penundaan waktu bagi debitur yang sungguh-sungguh kesulitan, atau menyedekahkan pokok hutang sebagai amal kebajikan utama.',
        'verses' => [
            ['surah' => 2, 'ayah' => 280],
            ['surah' => 2, 'ayah' => 281],
            ['surah' => 4, 'ayah' => 114],
        ]
    ],
    [
        'topic' => 'Larangan Kecurangan Timbangan, Monopoli, dan Manipulasi Pasar',
        'description' => 'Peringatan keras bagi para pelaku bisnis yang curang dalam takaran dan timbangan (Al-Muthaffifin), memanipulasi kualitas barang dagangan, atau menimbun barang untuk mempermainkan harga.',
        'verses' => [
            ['surah' => 6, 'ayah' => 152],
            ['surah' => 11, 'ayah' => 84],
            ['surah' => 11, 'ayah' => 85],
            ['surah' => 17, 'ayah' => 35],
            ['surah' => 26, 'ayah' => 181],
            ['surah' => 26, 'ayah' => 182],
            ['surah' => 26, 'ayah' => 183],
            ['surah' => 55, 'ayah' => 9],
            ['surah' => 83, 'ayah' => 1],
            ['surah' => 83, 'ayah' => 2],
            ['surah' => 83, 'ayah' => 3],
        ]
    ],
    [
        'topic' => 'Larangan Suap Meny menyuap dan Memakan Harta secara Batil',
        'description' => 'Haramnya praktik suap (risywah) kepada para penegak hukum atau pejabat berwenang, korupsi uang publik, penipuan investasi, dan memakan hak milik orang lain dengan jalan yang melanggar syariat.',
        'verses' => [
            ['surah' => 2, 'ayah' => 188],
            ['surah' => 4, 'ayah' => 29],
            ['surah' => 4, 'ayah' => 30],
            ['surah' => 4, 'ayah' => 161],
            ['surah' => 5, 'ayah' => 42],
            ['surah' => 9, 'ayah' => 34],
        ]
    ],
    [
        'topic' => 'Adab Berinfak: Menghindari Riya\' dan Menyakiti Penerima',
        'description' => 'Etika memberikan bantuan sosial dan sedekah tanpa mengungkit-ungkit budi (mannan) dan tanpa melukai martabat penerima, serta keharusan ikhlas semata-mata mengharapkan ridha Allah.',
        'verses' => [
            ['surah' => 2, 'ayah' => 261],
            ['surah' => 2, 'ayah' => 262],
            ['surah' => 2, 'ayah' => 263],
            ['surah' => 2, 'ayah' => 264],
            ['surah' => 2, 'ayah' => 265],
            ['surah' => 2, 'ayah' => 271],
            ['surah' => 76, 'ayah' => 8],
            ['surah' => 76, 'ayah' => 9],
        ]
    ],

    // 6. KEPEMIMPINAN, KEADILAN HUKUM & HAK ASASI MANUSIA
    [
        'topic' => 'Penegakan Hukum Adil Universal Tanpa Pandang Bulu',
        'description' => 'Kewajiban mutlak menegakkan keadilan sejati dalam setiap putusan hukum, tanpa terpengaruh oleh rasa benci terhadap suatu kaum, ikatan kekerabatan, ataupun status kekayaan dan kekuasaan.',
        'verses' => [
            ['surah' => 4, 'ayah' => 58],
            ['surah' => 4, 'ayah' => 105],
            ['surah' => 4, 'ayah' => 135],
            ['surah' => 5, 'ayah' => 8],
            ['surah' => 5, 'ayah' => 42],
            ['surah' => 6, 'ayah' => 152],
            ['surah' => 16, 'ayah' => 90],
        ]
    ],
    [
        'topic' => 'Prinsip Musyawarah (Syura) dalam Pengambilan Kebijakan',
        'description' => 'Sistem tata kelola pemerintahan dan organisasi Islam yang mengedepankan musyawarah terbuka, menghormati aspirasi bersama, serta bertekad bulat dan bertawakal setelah keputusan ditetapkan.',
        'verses' => [
            ['surah' => 2, 'ayah' => 233],
            ['surah' => 3, 'ayah' => 159],
            ['surah' => 42, 'ayah' => 38],
        ]
    ],
    [
        'topic' => 'Larangan Merusak Lingkungan dan Ekosistem Bumi (Fasad)',
        'description' => 'Tanggung jawab manusia sebagai pemakmur bumi (khalifah), larangan mencemari dan merusak alam daratan dan lautan akibat keserakahan, serta peringatan bencana akibat ulah tangan manusia.',
        'verses' => [
            ['surah' => 2, 'ayah' => 60],
            ['surah' => 2, 'ayah' => 205],
            ['surah' => 7, 'ayah' => 56],
            ['surah' => 7, 'ayah' => 85],
            ['surah' => 11, 'ayah' => 61],
            ['surah' => 28, 'ayah' => 77],
            ['surah' => 30, 'ayah' => 41],
        ]
    ],
    [
        'topic' => 'Menghargai Keberagaman Bangsa, Suku, dan Budaya',
        'description' => 'Hikmah penciptaan manusia dalam berbagai suku, bangsa, dan ras adalah untuk saling mengenal, berinteraksi, dan bersinergi, di mana tolok ukur kemuliaan di hadapan Allah hanyalah ketakwaan.',
        'verses' => [
            ['surah' => 10, 'ayah' => 19],
            ['surah' => 30, 'ayah' => 22],
            ['surah' => 49, 'ayah' => 13],
        ]
    ],
    [
        'topic' => 'Perlindungan Kaum Dhuafa, Yatim, dan Kelompok Rentan',
        'description' => 'Perintah memberi perhatian khusus kepada anak-anak yatim, janda, orang miskin, musafir yang kehabisan bekal, serta ancaman keras bagi mereka yang menghardik peminta-minta dan mendustakan agama.',
        'verses' => [
            ['surah' => 2, 'ayah' => 83],
            ['surah' => 2, 'ayah' => 220],
            ['surah' => 4, 'ayah' => 2],
            ['surah' => 4, 'ayah' => 6],
            ['surah' => 4, 'ayah' => 10],
            ['surah' => 70, 'ayah' => 24],
            ['surah' => 70, 'ayah' => 25],
            ['surah' => 93, 'ayah' => 9],
            ['surah' => 93, 'ayah' => 10],
            ['surah' => 107, 'ayah' => 1],
            ['surah' => 107, 'ayah' => 2],
            ['surah' => 107, 'ayah' => 3],
        ]
    ],

    // 7. KELUARGA & PARENTING ISLAMI
    [
        'topic' => 'Mewujudkan Keluarga Sakinah, Mawaddah, wa Rahmah',
        'description' => 'Pernikahan sebagai tanda kebesaran Allah untuk menciptakan ketenangan jiwa pasangan, membangun jalinan cinta mendalam (mawaddah) dan kasih sayang tulus (rahmah) sepanjang usia.',
        'verses' => [
            ['surah' => 4, 'ayah' => 1],
            ['surah' => 7, 'ayah' => 189],
            ['surah' => 16, 'ayah' => 72],
            ['surah' => 25, 'ayah' => 74],
            ['surah' => 30, 'ayah' => 21],
        ]
    ],
    [
        'topic' => 'Pergaulan Suami Istri yang Makruf (Mu\'asyarah bil Ma\'ruf)',
        'description' => 'Tuntunan Al-Qur\'an dalam memperlakukan pasangan hidup secara santun, memelihara hak-hak istri, saling memahami kelebihan dan kekurangan, serta menyelesaikan riak rumah tangga dengan hikmah.',
        'verses' => [
            ['surah' => 2, 'ayah' => 187],
            ['surah' => 2, 'ayah' => 228],
            ['surah' => 2, 'ayah' => 229],
            ['surah' => 4, 'ayah' => 19],
            ['surah' => 4, 'ayah' => 34],
            ['surah' => 4, 'ayah' => 128],
            ['surah' => 65, 'ayah' => 6],
        ]
    ],
    [
        'topic' => 'Mendidik Generasi Shalih dan Penyejuk Hati (Qurrota A\'yun)',
        'description' => 'Ikhtiar dan doa para orang tua untuk mendidik anak-anak agar mencintai Allah dan Rasul-Nya, mendirikan shalat tepat waktu, menjauhi perbuatan tercela, dan menjadi pionir bagi orang-orang bertakwa.',
        'verses' => [
            ['surah' => 14, 'ayah' => 40],
            ['surah' => 19, 'ayah' => 55],
            ['surah' => 20, 'ayah' => 132],
            ['surah' => 25, 'ayah' => 74],
            ['surah' => 46, 'ayah' => 15],
            ['surah' => 66, 'ayah' => 6],
        ]
    ],
    [
        'topic' => 'Tanggung Jawab Nafkah Keluarga dan Rezeki Halal',
        'description' => 'Kewajiban kepala rumah tangga dalam memberikan nafkah lahiriah dari rezeki yang halal dan thoyyib sesuai dengan kelapangan rezekinya, tanpa melalaikan hak asuh dan bimbingan batin.',
        'verses' => [
            ['surah' => 2, 'ayah' => 233],
            ['surah' => 4, 'ayah' => 34],
            ['surah' => 65, 'ayah' => 7],
        ]
    ],

    // 8. DOA-DOA PILIHAN & MUNAJAT PARA NABI
    [
        'topic' => 'Doa Memohon Keteguhan Hati di Atas Hidayah',
        'description' => 'Munajat agung para ahli ilmu agar hati tidak dicondongkan kepada kesesatan setelah Allah memberikan cahaya hidayah, serta permohonan karunia rahmat yang melimpah dari sisi Allah Al-Wahhab.',
        'verses' => [
            ['surah' => 3, 'ayah' => 8],
            ['surah' => 3, 'ayah' => 9],
            ['surah' => 3, 'ayah' => 193],
            ['surah' => 3, 'ayah' => 194],
            ['surah' => 7, 'ayah' => 126],
        ]
    ],
    [
        'topic' => 'Doa Sapu Jagat: Kebaikan Dunia dan Keselamatan Akhirat',
        'description' => 'Doa yang paling sering dipanjatkan Rasulullah SAW memohon kebaikan hidup di dunia, kebahagiaan sejati di akhirat, serta perlindungan dari siksaan dahsyat api neraka.',
        'verses' => [
            ['surah' => 2, 'ayah' => 201],
            ['surah' => 2, 'ayah' => 286],
            ['surah' => 7, 'ayah' => 156],
            ['surah' => 28, 'ayah' => 22],
        ]
    ],
    [
        'topic' => 'Doa Memohon Keturunan Shalih dan Pemimpin Kebaikan',
        'description' => 'Untaian doa para nabi mulia (Nabi Ibrahim, Nabi Zakariya) memohon dianugerahi keturunan yang berbakti, berakhlak mulia, dan istiqamah mendirikan shalat.',
        'verses' => [
            ['surah' => 3, 'ayah' => 38],
            ['surah' => 14, 'ayah' => 40],
            ['surah' => 19, 'ayah' => 4],
            ['surah' => 19, 'ayah' => 5],
            ['surah' => 19, 'ayah' => 6],
            ['surah' => 21, 'ayah' => 89],
            ['surah' => 25, 'ayah' => 74],
            ['surah' => 37, 'ayah' => 100],
        ]
    ],
    [
        'topic' => 'Doa Menghadapi Tugas Berat dan Kelapangan Dada',
        'description' => 'Doa Nabi Musa AS saat diutus menghadapi kekejaman Fir\'aun, memohon agar dilapangkan dadanya, dimudahkan segala urusannya, dan dilepaskan kekakuan lidahnya agar ucapannya dipahami dengan baik.',
        'verses' => [
            ['surah' => 20, 'ayah' => 25],
            ['surah' => 20, 'ayah' => 26],
            ['surah' => 20, 'ayah' => 27],
            ['surah' => 20, 'ayah' => 28],
            ['surah' => 20, 'ayah' => 29],
            ['surah' => 20, 'ayah' => 30],
            ['surah' => 20, 'ayah' => 31],
            ['surah' => 20, 'ayah' => 32],
        ]
    ],
    [
        'topic' => 'Doa Ampunan dan Curahan Rahmat bagi Orang Tua',
        'description' => 'Munajat bakti seorang anak kepada ayah dan ibunya, memohon agar Allah mengasihi dan mengampuni keduanya sebagaimana mereka telah merawat dan mendidik dengan penuh cinta di masa kecil.',
        'verses' => [
            ['surah' => 14, 'ayah' => 41],
            ['surah' => 17, 'ayah' => 24],
            ['surah' => 27, 'ayah' => 19],
            ['surah' => 46, 'ayah' => 15],
            ['surah' => 71, 'ayah' => 28],
        ]
    ],

    // 9. ESKATOLOGI & PERISTIWA HARI AKHIR
    [
        'topic' => 'Peristiwa Kedahsyatan Hari Kiamat (Al-Zalzalah dan Al-Qari\'ah)',
        'description' => 'Gambaran runtuhnya tatanan kosmik semesta saat sangkakala ditiup: bumi diguncangkan sehebat-hebatnya, langit terbelah, bintang berjatuhan, lautan meluap, dan manusia seperti anai-anai berhamburan.',
        'verses' => [
            ['surah' => 22, 'ayah' => 1],
            ['surah' => 22, 'ayah' => 2],
            ['surah' => 56, 'ayah' => 1],
            ['surah' => 56, 'ayah' => 2],
            ['surah' => 56, 'ayah' => 3],
            ['surah' => 56, 'ayah' => 4],
            ['surah' => 56, 'ayah' => 5],
            ['surah' => 56, 'ayah' => 6],
            ['surah' => 81, 'ayah' => 1],
            ['surah' => 81, 'ayah' => 2],
            ['surah' => 81, 'ayah' => 3],
            ['surah' => 82, 'ayah' => 1],
            ['surah' => 82, 'ayah' => 2],
            ['surah' => 82, 'ayah' => 3],
            ['surah' => 82, 'ayah' => 4],
            ['surah' => 82, 'ayah' => 5],
            ['surah' => 99, 'ayah' => 1],
            ['surah' => 99, 'ayah' => 2],
            ['surah' => 99, 'ayah' => 3],
            ['surah' => 101, 'ayah' => 1],
            ['surah' => 101, 'ayah' => 2],
            ['surah' => 101, 'ayah' => 3],
            ['surah' => 101, 'ayah' => 4],
            ['surah' => 101, 'ayah' => 5],
        ]
    ],
    [
        'topic' => 'Pengadilan Padang Mahsyar dan Timbangan Amal (Mizan)',
        'description' => 'Sidang hisab akbar di mana setiap lembaran catatan amal dibuka, saksi dari anggota tubuh berbicara, dan timbangan keadilan (Mizan) diletakkan tanpa ada kezaliman sedikit pun seberat biji zarrah.',
        'verses' => [
            ['surah' => 17, 'ayah' => 13],
            ['surah' => 17, 'ayah' => 14],
            ['surah' => 21, 'ayah' => 47],
            ['surah' => 23, 'ayah' => 102],
            ['surah' => 23, 'ayah' => 103],
            ['surah' => 36, 'ayah' => 65],
            ['surah' => 39, 'ayah' => 68],
            ['surah' => 39, 'ayah' => 69],
            ['surah' => 39, 'ayah' => 70],
            ['surah' => 69, 'ayah' => 19],
            ['surah' => 69, 'ayah' => 25],
            ['surah' => 99, 'ayah' => 7],
            ['surah' => 99, 'ayah' => 8],
        ]
    ],
    [
        'topic' => 'Kenikmatan Surga dan Tingkatannya (Jannatun Na\'im)',
        'description' => 'Balasan agung bagi orang-orang mukmin yang istiqamah: taman-taman indah yang dialiri sungai-sungai jernih, jamuan buah-buahan dan hidangan lezat, pakaian sutra halus, serta puncak kenikmatan memandang wajah Allah SWT.',
        'verses' => [
            ['surah' => 2, 'ayah' => 25],
            ['surah' => 3, 'ayah' => 15],
            ['surah' => 13, 'ayah' => 23],
            ['surah' => 13, 'ayah' => 24],
            ['surah' => 18, 'ayah' => 31],
            ['surah' => 47, 'ayah' => 15],
            ['surah' => 55, 'ayah' => 46],
            ['surah' => 55, 'ayah' => 48],
            ['surah' => 56, 'ayah' => 10],
            ['surah' => 56, 'ayah' => 11],
            ['surah' => 56, 'ayah' => 12],
            ['surah' => 76, 'ayah' => 12],
            ['surah' => 76, 'ayah' => 13],
            ['surah' => 76, 'ayah' => 14],
            ['surah' => 76, 'ayah' => 21],
            ['surah' => 88, 'ayah' => 10],
            ['surah' => 88, 'ayah' => 11],
            ['surah' => 88, 'ayah' => 12],
        ]
    ],
    [
        'topic' => 'Peringatan Dahsyatnya Azab Neraka Jahannam',
        'description' => 'Peringatan agar manusia menjauhi kekufuran, kesombongan, dan kemaksiatan: gambaran siksaan api neraka yang bergejolak, makanan pohon zaqqum yang berduri dan mendidih di perut, serta penyesalan mendalam para penghuninya.',
        'verses' => [
            ['surah' => 2, 'ayah' => 24],
            ['surah' => 4, 'ayah' => 56],
            ['surah' => 14, 'ayah' => 16],
            ['surah' => 14, 'ayah' => 17],
            ['surah' => 22, 'ayah' => 19],
            ['surah' => 22, 'ayah' => 20],
            ['surah' => 22, 'ayah' => 21],
            ['surah' => 22, 'ayah' => 22],
            ['surah' => 25, 'ayah' => 65],
            ['surah' => 25, 'ayah' => 66],
            ['surah' => 37, 'ayah' => 62],
            ['surah' => 37, 'ayah' => 63],
            ['surah' => 37, 'ayah' => 64],
            ['surah' => 37, 'ayah' => 65],
            ['surah' => 37, 'ayah' => 66],
            ['surah' => 44, 'ayah' => 43],
            ['surah' => 44, 'ayah' => 44],
            ['surah' => 44, 'ayah' => 45],
            ['surah' => 44, 'ayah' => 46],
            ['surah' => 67, 'ayah' => 6],
            ['surah' => 67, 'ayah' => 7],
            ['surah' => 67, 'ayah' => 8],
            ['surah' => 78, 'ayah' => 21],
            ['surah' => 78, 'ayah' => 22],
            ['surah' => 78, 'ayah' => 23],
            ['surah' => 78, 'ayah' => 24],
            ['surah' => 78, 'ayah' => 25],
        ]
    ]
];

// Validation
$errors = [];
$topicsToInsert = [];
$totalVerses = 0;

$order = $currentMaxOrder;

foreach ($newTopicsData as $index => $item) {
    $topicName = trim($item['topic']);
    $slug = Str::slug($topicName);
    $desc = trim($item['description']);
    $order++;

    if (in_array($slug, $existingSlugs)) {
        $errors[] = "Slug already exists: {$slug}";
    }

    $validVerses = [];
    $verseSeen = [];
    foreach ($item['verses'] as $vIndex => $v) {
        $sNum = (int)$v['surah'];
        $aNum = (int)$v['ayah'];

        if (!isset($surahs[$sNum])) {
            $errors[] = "Invalid surah number {$sNum} in topic '{$topicName}'";
            continue;
        }

        if ($aNum < 1 || $aNum > $surahs[$sNum]) {
            $errors[] = "Invalid ayah number {$sNum}:{$aNum} (max is {$surahs[$sNum]}) in topic '{$topicName}'";
            continue;
        }

        $vKey = "{$sNum}:{$aNum}";
        if (isset($verseSeen[$vKey])) {
            continue; // avoid duplicate in same topic
        }
        $verseSeen[$vKey] = true;

        $validVerses[] = [
            'surah' => $sNum,
            'ayah' => $aNum,
            'sort_order' => count($validVerses) + 1
        ];
    }

    $topicsToInsert[] = [
        'topic' => $topicName,
        'slug' => $slug,
        'description' => $desc,
        'sort_order' => $order,
        'verses' => $validVerses
    ];
    $totalVerses += count($validVerses);
}

if (!empty($errors)) {
    echo "VALIDATION FAILED WITH ERRORS:" . PHP_EOL;
    foreach ($errors as $err) {
        echo "- {$err}" . PHP_EOL;
    }
    exit(1);
}

echo "Validation successful!" . PHP_EOL;
echo "Topics to insert: " . count($topicsToInsert) . PHP_EOL;
echo "Total verses to insert: " . $totalVerses . PHP_EOL;

// Generate SQL file
$sqlLines = [];
$sqlLines[] = "-- ============================================================================";
$sqlLines[] = "-- IndoQuran - Additional Tafsir Maudhu'i Topics & Verses Data";
$sqlLines[] = "-- Total New Topics: " . count($topicsToInsert);
$sqlLines[] = "-- Total New Verses : " . $totalVerses;
$sqlLines[] = "-- Generated at     : " . date('Y-m-d H:i:s');
$sqlLines[] = "-- ============================================================================";
$sqlLines[] = "";
$sqlLines[] = "SET FOREIGN_KEY_CHECKS=0;";
$sqlLines[] = "";

$now = date('Y-m-d H:i:s');

foreach ($topicsToInsert as $t) {
    $topicEscaped = addslashes($t['topic']);
    $descEscaped = addslashes($t['description']);
    $slugEscaped = addslashes($t['slug']);
    $sortOrder = $t['sort_order'];

    $sqlLines[] = "-- ----------------------------------------------------------------------------";
    $sqlLines[] = "-- Topik: {$t['topic']} ({$t['slug']})";
    $sqlLines[] = "-- ----------------------------------------------------------------------------";
    $sqlLines[] = "INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)";
    $sqlLines[] = "VALUES ('{$topicEscaped}', '{$descEscaped}', '{$slugEscaped}', 1, {$sortOrder}, '{$now}', '{$now}')";
    $sqlLines[] = "ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);";
    $sqlLines[] = "";
    
    $sqlLines[] = "SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = '{$slugEscaped}' LIMIT 1);";
    $sqlLines[] = "";

    if (!empty($t['verses'])) {
        $verseValues = [];
        foreach ($t['verses'] as $v) {
            $s = $v['surah'];
            $a = $v['ayah'];
            $so = $v['sort_order'];
            $verseValues[] = "(@current_topic_id, {$s}, {$a}, {$so}, '{$now}', '{$now}')";
        }

        $sqlLines[] = "INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)";
        $sqlLines[] = "VALUES";
        $sqlLines[] = implode(",\n", $verseValues);
        $sqlLines[] = "ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);";
        $sqlLines[] = "";
    }
}

$sqlLines[] = "SET FOREIGN_KEY_CHECKS=1;";
$sqlLines[] = "";
$sqlLines[] = "-- Done inserting additional tafsir maudhui data.";

$sqlFilePath = __DIR__ . '/sql/insert_tafsir_maudhui_additional.sql';
if (!is_dir(__DIR__ . '/sql')) {
    mkdir(__DIR__ . '/sql', 0755, true);
}
file_put_contents($sqlFilePath, implode("\n", $sqlLines));
echo "SQL file successfully created at: {$sqlFilePath}" . PHP_EOL;

