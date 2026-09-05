/**
 * 100 Pencarian Populer Al-Qur'an Paling Dicari di Dunia
 * Berisi topik emosional, spiritual, ayat fenomenal, doa para nabi,
 * sains Qur'ani, hukum, dan tema kehidupan nyata.
 */

export const ALL_POPULAR_SEARCHES = [
    // 1-10: Ayat & Surah Paling Fenomenal di Dunia
    { id: 1, label: 'Ayat Kursi', path: '/surah/2/255', query: 'kursi', category: 'ayat_populer', description: 'Ayat paling agung (Al-Baqarah: 255)' },
    { id: 2, label: 'Al-Kahfi', path: '/surah/18', query: 'Al-Kahfi', category: 'surah', description: 'Sunnah Jumat & pelindung fitnah' },
    { id: 3, label: 'Al-Mulk', path: '/surah/67', query: 'Al-Mulk', category: 'surah', description: 'Pelindung siksa kubur (Tabarak)' },
    { id: 4, label: 'Yasin', path: '/surah/36', query: 'Yasin', category: 'surah', description: 'Jantung Al-Qur\'an' },
    { id: 5, label: 'Ar-Rahman', path: '/surah/55', query: 'Ar-Rahman', category: 'surah', description: 'Nikmat Tuhan mana yang didustakan' },
    { id: 6, label: 'Al-Waqi’ah', path: '/surah/56', query: 'Al-Waqiah', category: 'surah', description: 'Pembuka pintu keberkahan rezeki' },
    { id: 7, label: 'Ayat Seribu Dinar', path: '/surah/65/3', query: 'rezeki', category: 'ayat_populer', description: 'Rezeki tak terduga (At-Talaq: 2-3)' },
    { id: 8, label: 'Akhir Al-Baqarah', path: '/surah/2/285', query: 'amanar rasul', category: 'ayat_populer', description: '2 ayat pelindung malam hari' },
    { id: 9, label: 'Al-Ikhlas', path: '/surah/112', query: 'Al-Ikhlas', category: 'surah', description: 'Setara sepertiga Al-Qur\'an' },
    { id: 10, label: 'Al-Falaq & An-Nas', path: '/surah/113', query: 'Al-Falaq', category: 'surah', description: 'Al-Mu\'awwidzatain (Doa Perlindungan)' },

    // 11-20: Ketenangan Batin & Kesehatan Jiwa
    { id: 11, label: 'Ketenangan Hati', path: '/cari?q=ketenangan%20hati', query: 'ketenangan hati', category: 'emosi', description: 'Penawar kegelisahan batin' },
    { id: 12, label: 'Obat Sedih & Gundah', path: '/cari?q=tenteram', query: 'tenteram', category: 'emosi', description: 'Hanya dengan mengingat Allah hati tenteram' },
    { id: 13, label: 'Sabar & Ujian', path: '/cari?q=sabar', query: 'sabar', category: 'emosi', description: 'Bersama orang yang sabar' },
    { id: 14, label: 'Jangan Berputus Asa', path: '/cari?q=putus%20asa', query: 'putus asa', category: 'emosi', description: 'Rahmat Allah teramat luas' },
    { id: 15, label: 'Harapan & Kemudahan', path: '/cari?q=kemudahan', query: 'kemudahan', category: 'emosi', description: 'Bersama kesulitan ada kemudahan' },
    { id: 16, label: 'Mengatasi Rasa Takut', path: '/cari?q=takut', query: 'takut', category: 'emosi', description: 'Jangan takut, Allah bersama kita' },
    { id: 17, label: 'Tawakal', path: '/cari?q=tawakal', query: 'tawakal', category: 'emosi', description: 'Menyerahkan segala urusan kepada Allah' },
    { id: 18, label: 'Ikhlas', path: '/cari?q=ikhlas', query: 'ikhlas', category: 'emosi', description: 'Memurnikan ketaatan hanya untuk-Nya' },
    { id: 19, label: 'Syukur', path: '/cari?q=syukur', query: 'syukur', category: 'emosi', description: 'Jika bersyukur pasti ditambah nikmat' },
    { id: 20, label: 'Penawar Jiwa (Syifa)', path: '/cari?q=penawar', query: 'penawar', category: 'emosi', description: 'Al-Qur\'an sebagai obat penawar' },

    // 21-30: Rezeki, Finansial & Harta
    { id: 21, label: 'Rezeki', path: '/cari?q=rezeki', query: 'rezeki', category: 'rezeki', description: 'Kelapangan rezeki & jaminan Allah' },
    { id: 22, label: 'Keberkahan', path: '/cari?q=berkah', query: 'berkah', category: 'rezeki', description: 'Mencari berkah dari langit dan bumi' },
    { id: 23, label: 'Sedekah & Infaq', path: '/cari?q=sedekah', query: 'sedekah', category: 'rezeki', description: 'Pahala berlipat ganda pemberi sedekah' },
    { id: 24, label: 'Larangan Riba', path: '/cari?q=riba', query: 'riba', category: 'rezeki', description: 'Allah menghalalkan jual beli mengharamkan riba' },
    { id: 25, label: 'Zakat', path: '/cari?q=zakat', query: 'zakat', category: 'rezeki', description: 'Membersihkan dan mensucikan harta' },
    { id: 26, label: 'Harta & Anak', path: '/cari?q=harta', query: 'harta', category: 'rezeki', description: 'Harta dan anak adalah ujian titipan' },
    { id: 27, label: 'Kejujuran Berniaga', path: '/cari?q=timbangan', query: 'timbangan', category: 'rezeki', description: 'Sempurnakanlah takaran dan timbangan' },
    { id: 28, label: 'Larangan Boros', path: '/cari?q=mubazir', query: 'mubazir', category: 'rezeki', description: 'Pemboros adalah saudara setan' },
    { id: 29, label: 'Makanan Halal', path: '/cari?q=halal', query: 'halal', category: 'rezeki', description: 'Makanlah yang halal lagi baik' },
    { id: 30, label: 'Hutang Piutang', path: '/surah/2/282', query: 'hutang', category: 'rezeki', description: 'Ayat terpanjang Al-Qur\'an (Al-Baqarah: 282)' },

    // 31-40: Jodoh, Keluarga & Hubungan Sosial
    { id: 31, label: 'Jodoh & Pasangan', path: '/cari?q=pasangan', query: 'pasangan', category: 'keluarga', description: 'Diciptakan berpasang-pasangan' },
    { id: 32, label: 'Keluarga Sakinah', path: '/cari?q=kasih%20sayang', query: 'kasih sayang', category: 'keluarga', description: 'Mawaddah warahmah dalam rumah tangga' },
    { id: 33, label: 'Berbakti Orang Tua', path: '/cari?q=orang%20tua', query: 'orang tua', category: 'keluarga', description: 'Birrul walidain & larangan berkata ah' },
    { id: 34, label: 'Keturunan Sholeh', path: '/cari?q=keturunan', query: 'keturunan', category: 'keluarga', description: 'Doa penyejuk hati (Qurrata A\'yun)' },
    { id: 35, label: 'Mendidik Anak', path: '/surah/31/13', query: 'luqman', category: 'keluarga', description: 'Wasiat agung Luqman kepada putranya' },
    { id: 36, label: 'Silaturahmi', path: '/cari?q=kerabat', query: 'kerabat', category: 'keluarga', description: 'Memuliakan kerabat & fakir miskin' },
    { id: 37, label: 'Keadilan', path: '/cari?q=adil', query: 'adil', category: 'sosial', description: 'Berlaku adil mendekatkan pada taqwa' },
    { id: 38, label: 'Menjaga Lisan & Adab', path: '/cari?q=perkataan%20yang%20baik', query: 'perkataan yang baik', category: 'akhlak', description: 'Katakanlah perkataan yang baik dan sopan' },
    { id: 39, label: 'Larangan Ghibah', path: '/surah/49/12', query: 'prasangka', category: 'akhlak', description: 'Larangan menggunjing dan berburuk sangka' },
    { id: 40, label: 'Memaafkan Sesama', path: '/cari?q=memaafkan', query: 'memaafkan', category: 'akhlak', description: 'Memaafkan adalah ciri orang bertaqwa' },

    // 41-50: Doa-Doa Pilihan Para Nabi
    { id: 41, label: 'Doa Sapujagat', path: '/surah/2/201', query: 'kebaikan di dunia', category: 'doa', description: 'Rabbana atina fid-dunya hasanah' },
    { id: 42, label: 'Doa Nabi Yunus', path: '/surah/21/87', query: 'la ilaha illa anta', category: 'doa', description: 'Doa saat terimpit kesulitan berat' },
    { id: 43, label: 'Doa Nabi Musa', path: '/surah/20/25', query: 'lapangkanlah dadaku', category: 'doa', description: 'Robbisrohli sodri (kemudahan urusan)' },
    { id: 44, label: 'Doa Nabi Ibrahim', path: '/surah/14/40', query: 'melaksanakan salat', category: 'doa', description: 'Doa istiqomah menjaga salat' },
    { id: 45, label: 'Doa Nabi Ayyub', path: '/surah/21/83', query: 'penyakit', category: 'doa', description: 'Doa kesembuhan dari segala penyakit' },
    { id: 46, label: 'Doa Nabi Zakaria', path: '/surah/3/38', query: 'keturunan yang baik', category: 'doa', description: 'Doa memohon anak keturunan baik' },
    { id: 47, label: 'Doa Kedua Orang Tua', path: '/surah/17/24', query: 'orang tua', category: 'doa', description: 'Kasihanilah mereka sebagaimana mendidikku' },
    { id: 48, label: 'Doa Keteguhan Hati', path: '/surah/3/8', query: 'condongkan hati', category: 'doa', description: 'Rabbana la tuzigh qulubana' },
    { id: 49, label: 'Doa Husnul Khatimah', path: '/surah/12/101', query: 'wafat', category: 'doa', description: 'Wafatkanlah aku dalam keadaan muslim' },
    { id: 50, label: 'Doa Ampunan (Sayyidul)', path: '/surah/7/23', query: 'menganiaya diri', category: 'doa', description: 'Rabbana dholamna anfusana' },

    // 51-60: Ibadah, Sholat & Kedekatan Spiritual
    { id: 51, label: 'Salat', path: '/cari?q=salat', query: 'salat', category: 'ibadah', description: 'Salat mencegah perbuatan keji dan munkar' },
    { id: 52, label: 'Sholat Tahajud', path: '/surah/17/79', query: 'tahajud', category: 'ibadah', description: 'Salat malam mengangkat derajat terpuji' },
    { id: 53, label: 'Zikir & Mengingat Allah', path: '/cari?q=mengingat', query: 'mengingat', category: 'ibadah', description: 'Fadzkuruni adzkurkum' },
    { id: 54, label: 'Kedekatan Doa', path: '/surah/2/186', query: 'dekat', category: 'ibadah', description: 'Aku dekat, Aku kabulkan doa pemohon' },
    { id: 55, label: 'Puasa Ramadhan', path: '/surah/2/183', query: 'puasa', category: 'ibadah', description: 'Kewajiban puasa agar bertaqwa' },
    { id: 56, label: 'Malam Lailatul Qadar', path: '/surah/97', query: 'Al-Qadr', category: 'ibadah', description: 'Malam kemuliaan lebih baik dari 1000 bulan' },
    { id: 57, label: 'Haji & Umrah', path: '/cari?q=haji', query: 'haji', category: 'ibadah', description: 'Menyempurnakan ibadah haji karena Allah' },
    { id: 58, label: 'Taubat & Ampunan', path: '/cari?q=ampunan', query: 'ampunan', category: 'ibadah', description: 'Allah mengampuni dosa semuanya' },
    { id: 59, label: 'Istighfar Penarik Rezeki', path: '/surah/71/10', query: 'istighfar', category: 'ibadah', description: 'Mohon ampun niscaya hujan lebat & anak harta' },
    { id: 60, label: 'Hidayah & Petunjuk', path: '/cari?q=petunjuk', query: 'petunjuk', category: 'ibadah', description: 'Al-Qur\'an sebagai petunjuk bagi orang bertaqwa' },

    // 61-70: Kematian, Hari Kiamat & Akhirat
    { id: 61, label: 'Kematian & Ajal', path: '/cari?q=kematian', query: 'kematian', category: 'akhirat', description: 'Setiap yang bernyawa pasti merasakan mati' },
    { id: 62, label: 'Hari Kiamat', path: '/cari?q=kiamat', query: 'kiamat', category: 'akhirat', description: 'Prahara kedahsyatan hari pembalasan' },
    { id: 63, label: 'Keindahan Surga', path: '/cari?q=surga', query: 'surga', category: 'akhirat', description: 'Taman surga mengalir di bawahnya sungai-sungai' },
    { id: 64, label: 'Peringatan Api Neraka', path: '/cari?q=neraka', query: 'neraka', category: 'akhirat', description: 'Jagalah dirimu dan keluargamu dari api neraka' },
    { id: 65, label: 'Yaumul Hisab', path: '/cari?q=hisab', query: 'hisab', category: 'akhirat', description: 'Hari perhitungan setiap amal sekecil zarrah' },
    { id: 66, label: 'Sangkakala', path: '/cari?q=sangkakala', query: 'sangkakala', category: 'akhirat', description: 'Tiupan sangkakala pertama dan kedua' },
    { id: 67, label: 'Catatan Amal', path: '/cari?q=buku', query: 'buku', category: 'akhirat', description: 'Kitab catatan amal di tangan kanan/kiri' },
    { id: 68, label: 'Telaga Al-Kautsar', path: '/surah/108', query: 'Al-Kautsar', category: 'akhirat', description: 'Nikmat sungai dan telaga yang banyak' },
    { id: 69, label: 'Jalan yang Lurus (Sirath)', path: '/cari?q=jalan%20yang%20lurus', query: 'jalan yang lurus', category: 'akhirat', description: 'Ihdinas-sirotol mustaqim' },
    { id: 70, label: 'Pertemuan dengan Allah', path: '/surah/18/110', query: 'menjumpai Tuhannya', category: 'akhirat', description: 'Barangsiapa berharap berjumpa Tuhannya' },

    // 71-80: Kisah Para Nabi & Teladan Sejarah
    { id: 71, label: 'Nabi Muhammad SAW', path: '/cari?q=muhammad', query: 'muhammad', category: 'kisah', description: 'Rahmatan lil \'alamin bagi semesta' },
    { id: 72, label: 'Nabi Ibrahim & Ka\'bah', path: '/cari?q=ibrahim', query: 'ibrahim', category: 'kisah', description: 'Bapak para nabi dan pembangun Ka\'bah' },
    { id: 73, label: 'Nabi Yusuf & Ketampanan', path: '/surah/12', query: 'Yusuf', category: 'kisah', description: 'Kisah terindah (Ahsanul Qashash)' },
    { id: 74, label: 'Nabi Musa & Fir\'aun', path: '/cari?q=firaun', query: 'firaun', category: 'kisah', description: 'Mukjizat tongkat membelah lautan' },
    { id: 75, label: 'Nabi Isa & Maryam', path: '/surah/19', query: 'Maryam', category: 'kisah', description: 'Kelahiran mukjizat tanpa ayah' },
    { id: 76, label: 'Nabi Nuh & Bahtera', path: '/cari?q=nuh', query: 'nuh', category: 'kisah', description: 'Bahtera penyelamat saat banjir besar' },
    { id: 77, label: 'Nabi Sulaiman & Semut', path: '/cari?q=sulaiman', query: 'sulaiman', category: 'kisah', description: 'Raja agung yang memahami bahasa hewan' },
    { id: 78, label: 'Ashabul Kahfi', path: '/surah/18/9', query: 'pemuda', category: 'kisah', description: 'Keteguhan iman 7 pemuda dalam gua' },
    { id: 79, label: 'Zulkarnain & Ya\'juj', path: '/cari?q=zulkarnain', query: 'zulkarnain', category: 'kisah', description: 'Pemimpin adil pembangun dinding besi' },
    { id: 80, label: 'Nabi Adam & Taubat', path: '/cari?q=adam', query: 'adam', category: 'kisah', description: 'Penciptaan manusia pertama di bumi' },

    // 81-90: Sains, Alam Semesta & Keajaiban Qur'ani
    { id: 81, label: 'Penciptaan Alam Semesta', path: '/cari?q=langit%20dan%20bumi', query: 'langit dan bumi', category: 'sains', description: 'Penciptaan langit dan bumi dalam 6 masa' },
    { id: 82, label: 'Embriologi Manusia', path: '/surah/23/12', query: 'mani', category: 'sains', description: 'Fase setetes nutfah menjadi segumpal darah' },
    { id: 83, label: 'Pertemuan Dua Lautan', path: '/surah/55/19', query: 'dua laut', category: 'sains', description: 'Dua laut mengalir berdampingan ada batasnya' },
    { id: 84, label: 'Gunung Sebagai Pasak', path: '/surah/78/7', query: 'gunung', category: 'sains', description: 'Gunung-gunung sebagai pasak bumi' },
    { id: 85, label: 'Besi Diturunkan', path: '/surah/57/25', query: 'besi', category: 'sains', description: 'Kami turunkan besi yang memiliki kekuatan' },
    { id: 86, label: 'Lebah & Madu', path: '/surah/16/68', query: 'lebah', category: 'sains', description: 'Madu sebagai obat penawar bagi manusia' },
    { id: 87, label: 'Peredaran Matahari & Bulan', path: '/surah/36/40', query: 'matahari', category: 'sains', description: 'Semasing beredar pada garis edarnya' },
    { id: 88, label: 'Siklus Hujan & Air', path: '/cari?q=hujan', query: 'hujan', category: 'sains', description: 'Awan pembawa angin dan air kehidupan' },
    { id: 89, label: 'Ruang Hampa Udara', path: '/surah/6/125', query: 'sesak', category: 'sains', description: 'Dada sesak seolah mendaki ke langit' },
    { id: 90, label: 'Alam Tumbuhan Berpasangan', path: '/surah/36/36', query: 'berpasangan', category: 'sains', description: 'Maha suci Allah menciptakan semua berpasangan' },

    // 91-100: Akhlak Mulia, Pedoman Hidup & Kemenangan
    { id: 91, label: 'Menepati Janji', path: '/cari?q=janji', query: 'janji', category: 'akhlak', description: 'Penuhilah janji sesungguhnya janji ditanya' },
    { id: 92, label: 'Tolong Menolong', path: '/surah/5/2', query: 'tolong menolong', category: 'akhlak', description: 'Tolong menolonglah dalam kebajikan' },
    { id: 93, label: 'Rendah Hati (Tawadhu)', path: '/cari?q=sombong', query: 'sombong', category: 'akhlak', description: 'Jangan berjalan di muka bumi dengan sombong' },
    { id: 94, label: 'Menahan Marah', path: '/surah/3/134', query: 'menahan amarah', category: 'akhlak', description: 'Orang yang menahan amarah dan memaafkan' },
    { id: 95, label: 'Menjaga Amanah', path: '/cari?q=amanah', query: 'amanah', category: 'akhlak', description: 'Sampaikanlah amanah kepada yang berhak' },
    { id: 96, label: 'Toleransi Beragama', path: '/surah/109/6', query: 'agamamu', category: 'akhlak', description: 'Lakum dinukum waliyadin' },
    { id: 97, label: 'Jilbab & Menutup Aurat', path: '/surah/24/31', query: 'jilbab', category: 'akhlak', description: 'Menjaga pandangan dan mengulurkan kerudung' },
    { id: 98, label: 'Cinta Karena Allah', path: '/cari?q=cinta', query: 'cinta', category: 'akhlak', description: 'Orang beriman sangat besar cintanya pada Allah' },
    { id: 99, label: 'Kemenangan Orang Mukmin', path: '/cari?q=beruntung', query: 'beruntung', category: 'akhlak', description: 'Sesungguhnya beruntunglah orang yang beriman' },
    { id: 100, label: 'Asmaul Husna', path: '/surah/59/22', query: 'nama-nama yang baik', category: 'ayat_populer', description: 'Nama-nama Allah Yang Maha Indah' }
];

/**
 * Mengambil N item pencarian populer secara acak
 * @param {number} count Jumlah item yang ingin diambil (default 10)
 * @returns {Array} Array hasil acak
 */
export const getRandomPopularSearches = (count = 10) => {
    const pool = [...ALL_POPULAR_SEARCHES];
    // Fisher-Yates Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
};

export default ALL_POPULAR_SEARCHES;
