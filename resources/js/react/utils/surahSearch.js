/**
 * Complete Surah search & matching utility
 * Supports exact, prefix, substring, alias, transliteration variants, and fuzzy Levenshtein matching.
 */

export const SURAH_ALIASES = {
    1: ['al fatihah', 'fatihah', 'alfatihah', 'fatehah', 'ummul quran', 'ummul kitab', 'sab\'ul matsani', 'pembukaan', 'alhamdu'],
    2: ['al baqarah', 'baqarah', 'albaqarah', 'baqoro', 'baqoroh', 'sapi betina', 'sapi', 'ayat kursi'],
    3: ['ali imran', 'ali \'imran', 'al imran', 'ali-imran', 'keluarga imran', 'imran', 'imron'],
    4: ['an nisa', 'an nisa\'', 'annisa', 'nisa', 'wanita', 'perempuan'],
    5: ['al maidah', 'al ma\'idah', 'almaidah', 'maidah', 'maydah', 'hidangan', 'jamuan', 'jamuan makanan', 'al uqud', 'al munqidz'],
    6: ['al an\'am', 'al anam', 'alanam', 'an\'am', 'anam', 'binatang ternak', 'hewan ternak'],
    7: ['al a\'raf', 'al araf', 'alaraf', 'a\'raf', 'araf', 'tempat tertinggi', 'tempat tempat tinggi'],
    8: ['al anfal', 'anfal', 'alanfal', 'rampasan perang'],
    9: ['at tawbah', 'at taubah', 'attaubah', 'taubah', 'tawbah', 'pengampunan', 'bara\'ah', 'baraah'],
    10: ['yunus', 'nabi yunus'],
    11: ['hud', 'nabi hud'],
    12: ['yusuf', 'nabi yusuf'],
    13: ['ar ra\'d', 'ar rad', 'arrad', 'ra\'d', 'rad', 'guruh', 'petir', 'halilintar'],
    14: ['ibrahim', 'nabi ibrahim'],
    15: ['al hijr', 'hijr', 'bukit', 'bukit hijr'],
    16: ['an nahl', 'nahl', 'lebah', 'madu', 'lebah madu'],
    17: ['al isra', 'al isra\'', 'isra', 'isra\'', 'bani israil', 'bani israel', 'subhan', 'perjalanan malam'],
    18: ['al kahf', 'al kahfi', 'alkahf', 'alkahfi', 'kahf', 'kahfi', 'penghuni gua', 'para penghuni gua', 'ashabul kahfi'],
    19: ['maryam', 'siti maryam', 'maria'],
    20: ['taha', 'ta-ha', 'tha-ha', 'thaha', 'ta ha', 'tha ha'],
    21: ['al anbya', 'al anbiya', 'anbiya', 'anbya', 'para nabi', 'nabi nabi'],
    22: ['al hajj', 'al haji', 'hajj', 'haji'],
    23: ['al mu\'minun', 'al muminun', 'mu\'minun', 'muminun', 'mukminun', 'orang mukmin', 'orang-orang mukmin'],
    24: ['an nur', 'nur', 'cahaya'],
    25: ['al furqan', 'furqan', 'pembeda'],
    26: ['ash shu\'ara', 'ash shuara', 'asy syu\'ara', 'syuara', 'shuara', 'penyair', 'para penyair'],
    27: ['an naml', 'naml', 'semut'],
    28: ['al qasas', 'al qashash', 'qasas', 'qashash', 'kisah kisah', 'cerita'],
    29: ['al \'ankabut', 'al ankabut', 'ankabut', 'laba-laba', 'laba laba'],
    30: ['ar rum', 'rum', 'bangsa romawi', 'romawi'],
    31: ['luqman', 'lukman'],
    32: ['as sajdah', 'sajdah', 'sujud', 'al-madaji'],
    33: ['al ahzab', 'ahzab', 'golongan bersekutu', 'golongan yang bersekutu'],
    34: ['saba', 'saba\'', 'kaum saba'],
    35: ['fatir', 'fathir', 'pencipta'],
    36: ['ya-sin', 'yasin', 'yasiin', 'ya sin', 'jantung al quran', 'qolbul quran'],
    37: ['as saffat', 'as shaffat', 'saffat', 'shaffat', 'barisan', 'barisan-barisan'],
    38: ['sad', 'shad'],
    39: ['az zumar', 'zumar', 'rombongan', 'para rombongan'],
    40: ['ghafir', 'al mu\'min', 'mukmin', 'sang maha pengampun'],
    41: ['fussilat', 'fushilat', 'ha mim as-sajdah', 'yang dijelaskan'],
    42: ['ash shuraa', 'ash shura', 'asy syura', 'syura', 'shura', 'musyawarah'],
    43: ['az zukhruf', 'zukhruf', 'perhiasan'],
    44: ['ad dukhan', 'dukhan', 'kabut', 'asap'],
    45: ['al jathiyah', 'al jatsiyah', 'jathiyah', 'jatsiyah', 'yang bertekuk lutut'],
    46: ['al ahqaf', 'ahqaf', 'bukit pasir', 'bukit-bukit pasir'],
    47: ['muhammad', 'al qital', 'nabi muhammad'],
    48: ['al fath', 'fath', 'kemenangan'],
    49: ['al hujurat', 'hujurat', 'kamar-kamar', 'kamar'],
    50: ['qaf'],
    51: ['adh dhariyat', 'az zariyat', 'dzariyat', 'zariyat', 'dhariyat', 'angin', 'angin yang menerbangkan'],
    52: ['at tur', 'at thur', 'tur', 'thur', 'bukit tur', 'bukit'],
    53: ['an najm', 'najm', 'bintang'],
    54: ['al qamar', 'qamar', 'bulan'],
    55: ['ar rahman', 'rahman', 'rohman', 'pengasih', 'pemurah', 'yang maha pemurah'],
    56: ['al waqi\'ah', 'al waqiah', 'waqi\'ah', 'waqiah', 'waqia', 'hari kiamat'],
    57: ['al hadid', 'hadid', 'besi'],
    58: ['al mujadila', 'al mujadilah', 'mujadila', 'mujadilah', 'wanita yang menggugat'],
    59: ['al hashr', 'al hasyr', 'hashr', 'hasyr', 'pengusiran'],
    60: ['al mumtahanah', 'mumtahanah', 'wanita yang diuji'],
    61: ['as saf', 'as shaff', 'saf', 'shaff', 'barisan'],
    62: ['al jumu\'ah', 'al jumat', 'jumu\'ah', 'jumat', 'jum\'at', 'hari jumat'],
    63: ['al munafiqun', 'munafiqun', 'munafik', 'kaum munafik'],
    64: ['at taghabun', 'taghabun', 'hari dinampakkan kesalahan'],
    65: ['at talaq', 'at thalaq', 'talaq', 'thalaq', 'talak', 'cerai', 'perceraian'],
    66: ['at tahrim', 'tahrim', 'mengharamkan'],
    67: ['al mulk', 'mulk', 'tabarak', 'tabarok', 'kerajaan'],
    68: ['al qalam', 'qalam', 'nun', 'pena'],
    69: ['al haqqah', 'haqqah', 'kenyataan'],
    70: ['al ma\'arij', 'al maarij', 'ma\'arij', 'maarij', 'tempat yang naik', 'tempat naik'],
    71: ['nuh', 'nabi nuh'],
    72: ['al jinn', 'al jin', 'jinn', 'jin'],
    73: ['al muzzammil', 'al muzammil', 'muzzammil', 'muzammil', 'orang yang berselimut'],
    74: ['al muddaththir', 'al muddatsir', 'muddaththir', 'muddatsir', 'orang yang berkemul'],
    75: ['al qiyamah', 'qiyamah', 'kiamat', 'hari berbangkit'],
    76: ['al insan', 'insan', 'ad dahr', 'dahr', 'manusia'],
    77: ['al mursalat', 'mursalat', 'malaikat yang diutus'],
    78: ['an naba', 'an naba\'', 'naba', 'naba\'', 'amma', 'amma yatasaalun', 'berita besar'],
    79: ['an nazi\'at', 'an naziat', 'nazi\'at', 'naziat', 'malaikat yang mencabut'],
    80: ['abasa', '\'abasa', 'ia bermuka masam', 'bermuka masam'],
    81: ['at takwir', 'takwir', 'menggulung'],
    82: ['al infitar', 'al infithar', 'infitar', 'infithar', 'terbelah'],
    83: ['al mutaffifin', 'al muthaffifin', 'mutaffifin', 'muthaffifin', 'orang curang', 'orang-orang curang'],
    84: ['al inshiqaq', 'al insyiqaq', 'inshiqaq', 'insyiqaq', 'terbelah'],
    85: ['al buruj', 'buruj', 'gugusan bintang'],
    86: ['at tariq', 'at thariq', 'tariq', 'thariq', 'yang datang di malam hari'],
    87: ['al a\'la', 'al ala', 'a\'la', 'ala', 'yang paling tinggi', 'yang maha tinggi'],
    88: ['al ghashiyah', 'al ghasyiyah', 'ghashiyah', 'ghasyiyah', 'hari pembalasan'],
    89: ['al fajr', 'fajr', 'fajar'],
    90: ['al balad', 'balad', 'negeri'],
    91: ['ash shams', 'asy syams', 'shams', 'syams', 'matahari'],
    92: ['al layl', 'al lail', 'layl', 'lail', 'malam'],
    93: ['ad duhaa', 'ad dhuha', 'duhaa', 'dhuha', 'duha', 'waktu dhuha'],
    94: ['ash sharh', 'al insyirah', 'insyirah', 'alam nasyrah', 'sharh', 'syarh', 'melapangkan'],
    95: ['at tin', 'tin', 'buah tin', 'wat tin'],
    96: ['al \'alaq', 'al alaq', '\'alaq', 'alaq', 'iqra', 'iqro', 'segumpal darah'],
    97: ['al qadr', 'al qadar', 'qadr', 'qadar', 'lailatul qadr', 'kemuliaan'],
    98: ['al bayyinah', 'bayyinah', 'pembuktian', 'bukti nyata'],
    99: ['az zalzalah', 'al zalzalah', 'zalzalah', 'zalzala', 'az zilzal', 'zilzal', 'kegoncangan'],
    100: ['al \'adiyat', 'al adiyat', '\'adiyat', 'adiyat', 'berlari kencang'],
    101: ['al qari\'ah', 'al qariah', 'qari\'ah', 'qariah', 'qori\'ah', 'hari kiamat'],
    102: ['at takathur', 'at takasur', 'at takatsur', 'takathur', 'takasur', 'takatsur', 'bermegah-megahan'],
    103: ['al \'asr', 'al asr', 'al ashr', '\'asr', 'asr', 'ashr', 'waktu sore', 'demi masa'],
    104: ['al humazah', 'humazah', 'pengumpat'],
    105: ['al fil', 'fil', 'gajah'],
    106: ['quraysh', 'quraisy', 'kuraisy', 'suku quraisy'],
    107: ['al ma\'un', 'al maun', 'ma\'un', 'maun', 'barang yang berguna'],
    108: ['al kawthar', 'al kautsar', 'kawthar', 'kautsar', 'nikmat berlimpah'],
    109: ['al kafirun', 'kafirun', 'orang-orang kafir'],
    110: ['an nasr', 'an nashr', 'nasr', 'nashr', 'pertolongan'],
    111: ['al masad', 'al lahab', 'masad', 'lahab', 'gejolak api', 'sabut', 'tabbat'],
    112: ['al ikhlas', 'ikhlas', 'iklas', 'memurnikan keesaan allah', 'keesaan allah'],
    113: ['al falaq', 'falaq', 'waktu subuh'],
    114: ['an nas', 'an naas', 'nas', 'naas', 'manusia', 'umat manusia']
};

/**
 * Normalize search text: lowercase, remove apostrophes, replace hyphens, strip prefixes
 */
export const normalizeSearchText = (str) => {
    if (!str) return '';
    let s = String(str).toLowerCase();
    // Remove apostrophes, quotes, backticks
    s = s.replace(/['’‘ʻʼ`"]/g, '');
    // Replace hyphens and underscores with space
    s = s.replace(/[-_]/g, ' ');
    // Remove common Indonesian search prefixes
    s = s.replace(/^(surah|surat|qs|q\.s\.?)\s*(ke[- ]?)?/i, '');
    // Strip non-alphanumeric except spaces
    s = s.replace(/[^a-z0-9\s]/g, '');
    return s.replace(/\s+/g, ' ').trim();
};

/**
 * Strip article prefixes (al-, an-, ar-, etc.)
 */
export const stripArticlePrefix = (str) => {
    let s = normalizeSearchText(str);
    // Strip article followed by space
    s = s.replace(/^(al|an|ar|as|ash|at|az|ad|adh)\s+/i, '');
    // Strip concatenated article without space
    s = s.replace(/^al([a-z]{3,})/i, '$1');
    s = s.replace(/^an([a-z]{3,})/i, '$1');
    s = s.replace(/^ar([a-z]{3,})/i, '$1');
    s = s.replace(/^as([a-z]{3,})/i, '$1');
    s = s.replace(/^ash([a-z]{3,})/i, '$1');
    s = s.replace(/^at([a-z]{3,})/i, '$1');
    s = s.replace(/^az([a-z]{3,})/i, '$1');
    s = s.replace(/^ad([a-z]{3,})/i, '$1');
    s = s.replace(/^adh([a-z]{3,})/i, '$1');
    return s.trim();
};

/**
 * Calculate Levenshtein distance between two strings
 */
export const levenshteinDistance = (a, b) => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

/**
 * String similarity ratio (0.0 to 1.0)
 */
export const stringSimilarity = (a, b) => {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    const dist = levenshteinDistance(a, b);
    return Math.max(0, (maxLen - dist) / maxLen);
};

/**
 * Score a single surah against a query. Returns a number (0 = no match, 1000 = exact number match).
 */
export const scoreSurah = (surah, query) => {
    if (!surah || !query) return 0;

    const qRaw = String(query).trim();
    if (!qRaw) return 0;

    const qNorm = normalizeSearchText(qRaw);
    if (!qNorm) return 0;

    const qStrip = stripArticlePrefix(qNorm);
    const qCompact = qStrip.replace(/\s+/g, '');

    let score = 0;

    // 1. Number match
    const numMatch = qNorm.match(/^(\d{1,3})$/);
    if (numMatch) {
        const numVal = parseInt(numMatch[1], 10);
        if (Number(surah.number) === numVal) {
            return 1000;
        }
    }

    const nameLatinNorm = normalizeSearchText(surah.name_latin);
    const nameLatinStrip = stripArticlePrefix(surah.name_latin);
    const nameLatinCompact = nameLatinStrip.replace(/\s+/g, '');

    const nameIndoNorm = normalizeSearchText(surah.name_indonesian);
    const nameIndoStrip = stripArticlePrefix(surah.name_indonesian);

    const surahAliases = SURAH_ALIASES[surah.number] || [];

    // 2. Exact match on raw/norm/compact latin
    if (qNorm === nameLatinNorm || qStrip === nameLatinStrip || qCompact === nameLatinCompact) {
        score = Math.max(score, 500);
    }

    // 3. Exact match on aliases
    for (const alias of surahAliases) {
        const aNorm = normalizeSearchText(alias);
        const aStrip = stripArticlePrefix(aNorm);
        const aCompact = aStrip.replace(/\s+/g, '');
        if (qNorm === aNorm || qStrip === aStrip || qCompact === aCompact) {
            score = Math.max(score, 480);
            break;
        }
    }

    // 4. Exact match on Indonesian name
    if (qNorm === nameIndoNorm || qStrip === nameIndoStrip) {
        score = Math.max(score, 450);
    }

    // 5. Starts-with prefix match
    if (qStrip.length >= 2) {
        if (nameLatinStrip.startsWith(qStrip) || nameLatinCompact.startsWith(qCompact)) {
            const bonus = Math.min(50, Math.floor((qStrip.length / Math.max(1, nameLatinStrip.length)) * 50));
            score = Math.max(score, 380 + bonus);
        }
        for (const alias of surahAliases) {
            const aStrip = stripArticlePrefix(alias);
            if (aStrip.startsWith(qStrip)) {
                score = Math.max(score, 360);
                break;
            }
        }
    }

    // 6. Substring match
    if (qStrip.length >= 3) {
        if (nameLatinStrip.includes(qStrip) || nameLatinNorm.includes(qNorm)) {
            score = Math.max(score, 320);
        }
        if (nameIndoNorm.includes(qNorm) || nameIndoStrip.includes(qStrip)) {
            score = Math.max(score, 300);
        }
        for (const alias of surahAliases) {
            const aStrip = stripArticlePrefix(alias);
            if (aStrip.includes(qStrip)) {
                score = Math.max(score, 290);
                break;
            }
        }
    }

    // 7. Fuzzy similarity
    if (qStrip.length >= 3) {
        let bestSim = stringSimilarity(qStrip, nameLatinStrip);
        let bestDist = levenshteinDistance(qStrip, nameLatinStrip);

        const simCompact = stringSimilarity(qCompact, nameLatinCompact);
        if (simCompact > bestSim) bestSim = simCompact;
        const distCompact = levenshteinDistance(qCompact, nameLatinCompact);
        if (distCompact < bestDist) bestDist = distCompact;

        for (const alias of surahAliases) {
            const aStrip = stripArticlePrefix(alias);
            const simA = stringSimilarity(qStrip, aStrip);
            if (simA > bestSim) bestSim = simA;
            const distA = levenshteinDistance(qStrip, aStrip);
            if (distA < bestDist) bestDist = distA;
        }

        const maxLen = Math.max(qStrip.length, nameLatinStrip.length);
        const qualifies = (bestSim >= 0.65) || (maxLen >= 5 && bestDist <= 2) || (maxLen >= 4 && bestDist <= 1);
        if (qualifies) {
            score = Math.max(score, Math.round(150 + bestSim * 120));
        }
    }

    // 8. Arabic name match
    if (surah.name_arabic && surah.name_arabic.includes(qRaw)) {
        score = Math.max(score, 450);
    }

    return score;
};

/**
 * Check if a surah is an approximate match for a query (returns boolean).
 */
export const isApproximateSurahMatch = (surah, query, minScore = 200) => {
    return scoreSurah(surah, query) >= minScore;
};

/**
 * Search and rank surahs by query.
 *
 * @param {string} query
 * @param {Array} surahsList
 * @param {Object} [options]
 * @param {number} [options.limit=5]
 * @param {string} [options.revelationPlace]
 * @param {number} [options.minScore=150]
 * @returns {Array} ranked list of surah objects
 */
export const searchSurahs = (query, surahsList = [], options = {}) => {
    if (!query || !Array.isArray(surahsList) || surahsList.length === 0) {
        return [];
    }

    const {
        limit = 5,
        revelationPlace = null,
        minScore = 150
    } = options;

    const scored = [];

    for (const surah of surahsList) {
        if (!surah || !surah.number) continue;

        // Apply revelation place filter if provided
        if (revelationPlace && revelationPlace !== 'all') {
            const targetPlace = (revelationPlace === 'meccan' || revelationPlace === 'makkah') ? 'makkah' : 'madinah';
            if (String(surah.revelation_place || '').toLowerCase() !== targetPlace) {
                continue;
            }
        }

        const score = scoreSurah(surah, query);
        if (score >= minScore) {
            scored.push({
                surah,
                score
            });
        }
    }

    // Sort by score descending, then by number ascending
    scored.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.surah.number - b.surah.number;
    });

    if (scored.length === 0) {
        return [];
    }

    // Smart noise reduction: if we have a very strong match (>= 400), prune weak matches (< 350)
    const maxScore = scored[0].score;
    let filtered = scored;
    if (maxScore >= 400) {
        filtered = scored.filter(item => item.score >= 350);
    } else if (maxScore >= 200) {
        const threshold = maxScore * 0.7;
        filtered = scored.filter(item => item.score >= threshold);
    }

    return filtered.slice(0, limit).map(item => item.surah);
};

export default searchSurahs;
