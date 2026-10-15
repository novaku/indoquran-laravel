<?php

namespace App\Services;

use App\Models\Surah;
use Illuminate\Support\Collection;

class SurahSearchService
{
    /**
     * Common aliases, alternative names, transliterations, and Indonesian names for the 114 surahs.
     */
    protected const SURAH_ALIASES = [
        1 => ['al fatihah', 'fatihah', 'alfatihah', 'fatehah', 'ummul quran', 'ummul kitab', 'sab\'ul matsani', 'pembukaan', 'alhamdu'],
        2 => ['al baqarah', 'baqarah', 'albaqarah', 'baqoro', 'baqoroh', 'sapi betina', 'sapi', 'ayat kursi'],
        3 => ['ali imran', 'ali \'imran', 'al imran', 'ali-imran', 'keluarga imran', 'imran', 'imron'],
        4 => ['an nisa', 'an nisa\'', 'annisa', 'nisa', 'wanita', 'perempuan'],
        5 => ['al maidah', 'al ma\'idah', 'almaidah', 'maidah', 'maydah', 'hidangan', 'jamuan', 'jamuan makanan', 'al uqud', 'al munqidz'],
        6 => ['al an\'am', 'al anam', 'alanam', 'an\'am', 'anam', 'binatang ternak', 'hewan ternak'],
        7 => ['al a\'raf', 'al araf', 'alaraf', 'a\'raf', 'araf', 'tempat tertinggi', 'tempat tempat tinggi'],
        8 => ['al anfal', 'anfal', 'alanfal', 'rampasan perang'],
        9 => ['at tawbah', 'at taubah', 'attaubah', 'taubah', 'tawbah', 'pengampunan', 'bara\'ah', 'baraah'],
        10 => ['yunus', 'nabi yunus'],
        11 => ['hud', 'nabi hud'],
        12 => ['yusuf', 'nabi yusuf'],
        13 => ['ar ra\'d', 'ar rad', 'arrad', 'ra\'d', 'rad', 'guruh', 'petir', 'halilintar'],
        14 => ['ibrahim', 'nabi ibrahim'],
        15 => ['al hijr', 'hijr', 'bukit', 'bukit hijr'],
        16 => ['an nahl', 'nahl', 'lebah', 'madu', 'lebah madu'],
        17 => ['al isra', 'al isra\'', 'isra', 'isra\'', 'bani israil', 'bani israel', 'subhan', 'perjalanan malam'],
        18 => ['al kahf', 'al kahfi', 'alkahf', 'alkahfi', 'kahf', 'kahfi', 'penghuni gua', 'para penghuni gua', 'ashabul kahfi'],
        19 => ['maryam', 'siti maryam', 'maria'],
        20 => ['taha', 'ta-ha', 'tha-ha', 'thaha', 'ta ha', 'tha ha'],
        21 => ['al anbya', 'al anbiya', 'anbiya', 'anbya', 'para nabi', 'nabi nabi'],
        22 => ['al hajj', 'al haji', 'hajj', 'haji'],
        23 => ['al mu\'minun', 'al muminun', 'mu\'minun', 'muminun', 'mukminun', 'orang mukmin', 'orang-orang mukmin'],
        24 => ['an nur', 'nur', 'cahaya'],
        25 => ['al furqan', 'furqan', 'pembeda'],
        26 => ['ash shu\'ara', 'ash shuara', 'asy syu\'ara', 'syuara', 'shuara', 'penyair', 'para penyair'],
        27 => ['an naml', 'naml', 'semut'],
        28 => ['al qasas', 'al qashash', 'qasas', 'qashash', 'kisah kisah', 'cerita'],
        29 => ['al \'ankabut', 'al ankabut', 'ankabut', 'laba-laba', 'laba laba'],
        30 => ['ar rum', 'rum', 'bangsa romawi', 'romawi'],
        31 => ['luqman', 'lukman'],
        32 => ['as sajdah', 'sajdah', 'sujud', 'al-madaji'],
        33 => ['al ahzab', 'ahzab', 'golongan bersekutu', 'golongan yang bersekutu'],
        34 => ['saba', 'saba\'', 'kaum saba'],
        35 => ['fatir', 'fathir', 'pencipta'],
        36 => ['ya-sin', 'yasin', 'yasiin', 'ya sin', 'jantung al quran', 'qolbul quran'],
        37 => ['as saffat', 'as shaffat', 'saffat', 'shaffat', 'barisan', 'barisan-barisan'],
        38 => ['sad', 'shad'],
        39 => ['az zumar', 'zumar', 'rombongan', 'para rombongan'],
        40 => ['ghafir', 'al mu\'min', 'mukmin', 'sang maha pengampun'],
        41 => ['fussilat', 'fushilat', 'ha mim as-sajdah', 'yang dijelaskan'],
        42 => ['ash shuraa', 'ash shura', 'asy syura', 'syura', 'shura', 'musyawarah'],
        43 => ['az zukhruf', 'zukhruf', 'perhiasan'],
        44 => ['ad dukhan', 'dukhan', 'kabut', 'asap'],
        45 => ['al jathiyah', 'al jatsiyah', 'jathiyah', 'jatsiyah', 'yang bertekuk lutut'],
        46 => ['al ahqaf', 'ahqaf', 'bukit pasir', 'bukit-bukit pasir'],
        47 => ['muhammad', 'al qital', 'nabi muhammad'],
        48 => ['al fath', 'fath', 'kemenangan'],
        49 => ['al hujurat', 'hujurat', 'kamar-kamar', 'kamar'],
        50 => ['qaf'],
        51 => ['adh dhariyat', 'az zariyat', 'dzariyat', 'zariyat', 'dhariyat', 'angin', 'angin yang menerbangkan'],
        52 => ['at tur', 'at thur', 'tur', 'thur', 'bukit tur', 'bukit'],
        53 => ['an najm', 'najm', 'bintang'],
        54 => ['al qamar', 'qamar', 'bulan'],
        55 => ['ar rahman', 'rahman', 'rohman', 'pengasih', 'pemurah', 'yang maha pemurah'],
        56 => ['al waqi\'ah', 'al waqiah', 'waqi\'ah', 'waqiah', 'waqia', 'hari kiamat'],
        57 => ['al hadid', 'hadid', 'besi'],
        58 => ['al mujadila', 'al mujadilah', 'mujadila', 'mujadilah', 'wanita yang menggugat'],
        59 => ['al hashr', 'al hasyr', 'hashr', 'hasyr', 'pengusiran'],
        60 => ['al mumtahanah', 'mumtahanah', 'wanita yang diuji'],
        61 => ['as saf', 'as shaff', 'saf', 'shaff', 'barisan'],
        62 => ['al jumu\'ah', 'al jumat', 'jumu\'ah', 'jumat', 'jum\'at', 'hari jumat'],
        63 => ['al munafiqun', 'munafiqun', 'munafik', 'kaum munafik'],
        64 => ['at taghabun', 'taghabun', 'hari dinampakkan kesalahan'],
        65 => ['at talaq', 'at thalaq', 'talaq', 'thalaq', 'talak', 'cerai', 'perceraian'],
        66 => ['at tahrim', 'tahrim', 'mengharamkan'],
        67 => ['al mulk', 'mulk', 'tabarak', 'tabarok', 'kerajaan'],
        68 => ['al qalam', 'qalam', 'nun', 'pena'],
        69 => ['al haqqah', 'haqqah', 'kenyataan'],
        70 => ['al ma\'arij', 'al maarij', 'ma\'arij', 'maarij', 'tempat yang naik', 'tempat naik'],
        71 => ['nuh', 'nabi nuh'],
        72 => ['al jinn', 'al jin', 'jinn', 'jin'],
        73 => ['al muzzammil', 'al muzammil', 'muzzammil', 'muzammil', 'orang yang berselimut'],
        74 => ['al muddaththir', 'al muddatsir', 'muddaththir', 'muddatsir', 'orang yang berkemul'],
        75 => ['al qiyamah', 'qiyamah', 'kiamat', 'hari berbangkit'],
        76 => ['al insan', 'insan', 'ad dahr', 'dahr', 'manusia'],
        77 => ['al mursalat', 'mursalat', 'malaikat yang diutus'],
        78 => ['an naba', 'an naba\'', 'naba', 'naba\'', 'amma', 'amma yatasaalun', 'berita besar'],
        79 => ['an nazi\'at', 'an naziat', 'nazi\'at', 'naziat', 'malaikat yang mencabut'],
        80 => ['abasa', '\'abasa', 'ia bermuka masam', 'bermuka masam'],
        81 => ['at takwir', 'takwir', 'menggulung'],
        82 => ['al infitar', 'al infithar', 'infitar', 'infithar', 'terbelah'],
        83 => ['al mutaffifin', 'al muthaffifin', 'mutaffifin', 'muthaffifin', 'orang curang', 'orang-orang curang'],
        84 => ['al inshiqaq', 'al insyiqaq', 'inshiqaq', 'insyiqaq', 'terbelah'],
        85 => ['al buruj', 'buruj', 'gugusan bintang'],
        86 => ['at tariq', 'at thariq', 'tariq', 'thariq', 'yang datang di malam hari'],
        87 => ['al a\'la', 'al ala', 'a\'la', 'ala', 'yang paling tinggi', 'yang maha tinggi'],
        88 => ['al ghashiyah', 'al ghasyiyah', 'ghashiyah', 'ghasyiyah', 'hari pembalasan'],
        89 => ['al fajr', 'fajr', 'fajar'],
        90 => ['al balad', 'balad', 'negeri'],
        91 => ['ash shams', 'asy syams', 'shams', 'syams', 'matahari'],
        92 => ['al layl', 'al lail', 'layl', 'lail', 'malam'],
        93 => ['ad duhaa', 'ad dhuha', 'duhaa', 'dhuha', 'duha', 'waktu dhuha'],
        94 => ['ash sharh', 'al insyirah', 'insyirah', 'alam nasyrah', 'sharh', 'syarh', 'melapangkan'],
        95 => ['at tin', 'tin', 'buah tin', 'wat tin'],
        96 => ['al \'alaq', 'al alaq', '\'alaq', 'alaq', 'iqra', 'iqro', 'segumpal darah'],
        97 => ['al qadr', 'al qadar', 'qadr', 'qadar', 'lailatul qadr', 'kemuliaan'],
        98 => ['al bayyinah', 'bayyinah', 'pembuktian', 'bukti nyata'],
        99 => ['az zalzalah', 'al zalzalah', 'zalzalah', 'zalzala', 'az zilzal', 'zilzal', 'kegoncangan'],
        100 => ['al \'adiyat', 'al adiyat', '\'adiyat', 'adiyat', 'berlari kencang'],
        101 => ['al qari\'ah', 'al qariah', 'qari\'ah', 'qariah', 'qori\'ah', 'hari kiamat'],
        102 => ['at takathur', 'at takasur', 'at takatsur', 'takathur', 'takasur', 'takatsur', 'bermegah-megahan'],
        103 => ['al \'asr', 'al asr', 'al ashr', '\'asr', 'asr', 'ashr', 'waktu sore', 'demi masa'],
        104 => ['al humazah', 'humazah', 'pengumpat'],
        105 => ['al fil', 'fil', 'gajah'],
        106 => ['quraysh', 'quraisy', 'kuraisy', 'suku quraisy'],
        107 => ['al ma\'un', 'al maun', 'ma\'un', 'maun', 'barang yang berguna'],
        108 => ['al kawthar', 'al kautsar', 'kawthar', 'kautsar', 'nikmat berlimpah'],
        109 => ['al kafirun', 'kafirun', 'orang-orang kafir'],
        110 => ['an nasr', 'an nashr', 'nasr', 'nashr', 'pertolongan'],
        111 => ['al masad', 'al lahab', 'masad', 'lahab', 'gejolak api', 'sabut', 'tabbat'],
        112 => ['al ikhlas', 'ikhlas', 'iklas', 'memurnikan keesaan allah', 'keesaan allah'],
        113 => ['al falaq', 'falaq', 'waktu subuh'],
        114 => ['an nas', 'an naas', 'nas', 'naas', 'manusia', 'umat manusia'],
    ];

    /**
     * Normalize text by removing diacritics, punctuation, extra spaces, and common search prefixes.
     */
    public static function normalize(string $str): string
    {
        $str = mb_strtolower($str, 'UTF-8');
        // Remove apostrophes, quotes, diacritics
        $str = preg_replace('/[\'’‘ʻʼ\`\"]/u', '', $str);
        // Replace hyphens and underscores with space
        $str = str_replace(['-', '_'], ' ', $str);
        // Remove common Indonesian search prefixes like 'surah ke-', 'surat', 'qs'
        $str = preg_replace('/^(surah|surat|qs|q\.s\.?)\s*(ke[- ]?)?/i', '', $str);
        // Strip non-alphanumeric except spaces
        $str = preg_replace('/[^a-z0-9\s]/', '', $str);
        return trim(preg_replace('/\s+/', ' ', $str));
    }

    /**
     * Strip Arabic article prefixes (al-, an-, ar-, as-, etc.) whether separated by space/hyphen or merged.
     */
    public static function stripArticle(string $str): string
    {
        $s = self::normalize($str);
        // Strip article followed by space or hyphen
        $s = preg_replace('/^(al|an|ar|as|ash|at|az|ad|adh)\s+/i', '', $s);
        // Strip concatenated article without space
        $s = preg_replace('/^al([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^an([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^ar([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^as([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^ash([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^at([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^az([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^ad([a-z]{3,})/i', '$1', $s);
        $s = preg_replace('/^adh([a-z]{3,})/i', '$1', $s);
        return trim($s);
    }

    /**
     * Compute string similarity between 0.0 and 1.0 using Levenshtein distance.
     */
    public static function similarity(string $a, string $b): float
    {
        $len = max(strlen($a), strlen($b));
        if ($len === 0) {
            return 1.0;
        }
        $dist = levenshtein($a, $b);
        return max(0.0, ($len - $dist) / $len);
    }

    /**
     * Search surahs with approximate, fuzzy, and alias matching.
     *
     * @param string $query
     * @param string|null $revelationPlace
     * @param int $limit
     * @return array
     */
    public function search(string $query, ?string $revelationPlace = null, int $limit = 5): array
    {
        $qRaw = trim($query);
        if ($qRaw === '') {
            return [];
        }

        $qNorm = self::normalize($qRaw);
        $qStrip = self::stripArticle($qNorm);
        $qCompact = str_replace(' ', '', $qStrip);

        // Detect if query is a surah number (e.g. "5", "05", "surah 5")
        $numVal = null;
        if (preg_match('/^(\d{1,3})$/', $qNorm, $m)) {
            $numVal = (int)$m[1];
        }

        // Load all 114 surahs (or from cache if available)
        $surahs = Surah::select('number', 'name_latin', 'name_indonesian', 'name_arabic', 'total_ayahs', 'revelation_place')->get();

        $results = [];

        foreach ($surahs as $surah) {
            // Apply revelation place filter if specified
            if ($revelationPlace && in_array($revelationPlace, ['makkah', 'madinah'])) {
                if (strtolower($surah->revelation_place) !== strtolower($revelationPlace)) {
                    continue;
                }
            }

            $score = 0;
            $nameLatinNorm = self::normalize($surah->name_latin);
            $nameLatinStrip = self::stripArticle($surah->name_latin);
            $nameLatinCompact = str_replace(' ', '', $nameLatinStrip);

            $nameIndoNorm = self::normalize($surah->name_indonesian);
            $nameIndoStrip = self::stripArticle($surah->name_indonesian);

            $surahAliases = self::SURAH_ALIASES[$surah->number] ?? [];

            // 1. Number match (Highest priority)
            if ($numVal !== null && $surah->number === $numVal) {
                $score = max($score, 1000);
            }

            // 2. Exact match on normalized or stripped latin name
            if ($qNorm === $nameLatinNorm || $qStrip === $nameLatinStrip || $qCompact === $nameLatinCompact) {
                $score = max($score, 500);
            }

            // 3. Exact match on aliases
            foreach ($surahAliases as $alias) {
                $aNorm = self::normalize($alias);
                $aStrip = self::stripArticle($aNorm);
                $aCompact = str_replace(' ', '', $aStrip);
                if ($qNorm === $aNorm || $qStrip === $aStrip || $qCompact === $aCompact) {
                    $score = max($score, 480);
                    break;
                }
            }

            // 4. Exact match on Indonesian name
            if ($qNorm === $nameIndoNorm || $qStrip === $nameIndoStrip) {
                $score = max($score, 450);
            }

            // 5. Starts-with prefix match
            if (strlen($qStrip) >= 2) {
                if (str_starts_with($nameLatinStrip, $qStrip) || str_starts_with($nameLatinCompact, $qCompact)) {
                    $score = max($score, 380 + min(50, (int)(strlen($qStrip) / max(1, strlen($nameLatinStrip)) * 50)));
                }
                foreach ($surahAliases as $alias) {
                    $aStrip = self::stripArticle($alias);
                    if (str_starts_with($aStrip, $qStrip)) {
                        $score = max($score, 360);
                        break;
                    }
                }
            }

            // 6. Substring match
            if (strlen($qStrip) >= 3) {
                if (str_contains($nameLatinStrip, $qStrip) || str_contains($nameLatinNorm, $qNorm)) {
                    $score = max($score, 320);
                }
                if (str_contains($nameIndoNorm, $qNorm) || str_contains($nameIndoStrip, $qStrip)) {
                    $score = max($score, 300);
                }
                foreach ($surahAliases as $alias) {
                    $aStrip = self::stripArticle($alias);
                    if (str_contains($aStrip, $qStrip)) {
                        $score = max($score, 290);
                        break;
                    }
                }
            }

            // 7. Fuzzy similarity (Levenshtein & edit distance)
            if (strlen($qStrip) >= 3) {
                $bestSim = self::similarity($qStrip, $nameLatinStrip);
                $bestDist = levenshtein($qStrip, $nameLatinStrip);

                $simCompact = self::similarity($qCompact, $nameLatinCompact);
                if ($simCompact > $bestSim) {
                    $bestSim = $simCompact;
                }
                $distCompact = levenshtein($qCompact, $nameLatinCompact);
                if ($distCompact < $bestDist) {
                    $bestDist = $distCompact;
                }

                foreach ($surahAliases as $alias) {
                    $aStrip = self::stripArticle($alias);
                    $simA = self::similarity($qStrip, $aStrip);
                    if ($simA > $bestSim) {
                        $bestSim = $simA;
                    }
                    $distA = levenshtein($qStrip, $aStrip);
                    if ($distA < $bestDist) {
                        $bestDist = $distA;
                    }
                }

                $maxLen = max(strlen($qStrip), strlen($nameLatinStrip));
                $qualifies = ($bestSim >= 0.65) || ($maxLen >= 5 && $bestDist <= 2) || ($maxLen >= 4 && $bestDist <= 1);
                if ($qualifies) {
                    $score = max($score, (int)(150 + $bestSim * 120));
                }
            }

            // 8. Arabic name match
            if (!empty($surah->name_arabic) && str_contains($surah->name_arabic, $qRaw)) {
                $score = max($score, 450);
            }

            if ($score > 0) {
                $results[] = [
                    'number'           => $surah->number,
                    'name_latin'       => $surah->name_latin,
                    'name_indonesian'  => $surah->name_indonesian,
                    'name_arabic'      => $surah->name_arabic,
                    'total_ayahs'      => $surah->total_ayahs,
                    'revelation_place' => $surah->revelation_place,
                    'url'              => '/surah/' . $surah->number,
                    'relevance_score'  => $score,
                ];
            }
        }

        // Sort results: highest relevance score first, then by surah number ascending
        usort($results, function ($a, $b) {
            if ($b['relevance_score'] !== $a['relevance_score']) {
                return $b['relevance_score'] <=> $a['relevance_score'];
            }
            return $a['number'] <=> $b['number'];
        });

        // Filter out noisy weak matches if we have strong matches
        $maxScore = !empty($results) ? $results[0]['relevance_score'] : 0;
        if ($maxScore >= 400) {
            $results = array_values(array_filter($results, function ($item) {
                return $item['relevance_score'] >= 350;
            }));
        } elseif ($maxScore >= 200) {
            $threshold = $maxScore * 0.7;
            $results = array_values(array_filter($results, function ($item) use ($threshold) {
                return $item['relevance_score'] >= $threshold;
            }));
        }

        return array_slice($results, 0, $limit);
    }
}
