import { SURAH_FALLBACK_DATA } from '../data/surahsFallbackData';
import { saveLocalLastRead, getLocalLastRead } from './BookmarkService';
import { updateReadingProgress } from './ReadingProgressService';
import authUtils from '../utils/auth';

const KHATAM_STORAGE_KEY = 'indoquran_khatam_tracker_v2';
export const TOTAL_QURAN_AYAHS = 6236;
export const TOTAL_QURAN_JUZ = 30;

// Exact starting surah and ayah for each Juz (1-30)
export const JUZ_STARTS = [
    { juz: 1, surah: 1, ayah: 1 },
    { juz: 2, surah: 2, ayah: 142 },
    { juz: 3, surah: 2, ayah: 253 },
    { juz: 4, surah: 3, ayah: 93 },
    { juz: 5, surah: 4, ayah: 24 },
    { juz: 6, surah: 4, ayah: 148 },
    { juz: 7, surah: 5, ayah: 82 },
    { juz: 8, surah: 6, ayah: 111 },
    { juz: 9, surah: 7, ayah: 88 },
    { juz: 10, surah: 8, ayah: 41 },
    { juz: 11, surah: 9, ayah: 93 },
    { juz: 12, surah: 11, ayah: 6 },
    { juz: 13, surah: 12, ayah: 53 },
    { juz: 14, surah: 15, ayah: 1 },
    { juz: 15, surah: 17, ayah: 1 },
    { juz: 16, surah: 18, ayah: 75 },
    { juz: 17, surah: 21, ayah: 1 },
    { juz: 18, surah: 23, ayah: 1 },
    { juz: 19, surah: 25, ayah: 21 },
    { juz: 20, surah: 27, ayah: 56 },
    { juz: 21, surah: 29, ayah: 46 },
    { juz: 22, surah: 33, ayah: 31 },
    { juz: 23, surah: 36, ayah: 28 },
    { juz: 24, surah: 39, ayah: 32 },
    { juz: 25, surah: 41, ayah: 47 },
    { juz: 26, surah: 46, ayah: 1 },
    { juz: 27, surah: 51, ayah: 31 },
    { juz: 28, surah: 58, ayah: 1 },
    { juz: 29, surah: 67, ayah: 1 },
    { juz: 30, surah: 78, ayah: 1 }
];

// Pre-calculate cumulative ayah offsets for all 114 surahs for O(1) lookups
const CUMULATIVE_AYAH_OFFSETS = [];
let _runningSum = 0;
for (let i = 0; i < SURAH_FALLBACK_DATA.length; i++) {
    CUMULATIVE_AYAH_OFFSETS[SURAH_FALLBACK_DATA[i].number] = _runningSum;
    _runningSum += SURAH_FALLBACK_DATA[i].total_ayahs;
}

/**
 * Get 1-based absolute ayah index in Quran (1 to 6236)
 */
export const getAbsoluteAyahIndex = (surahNumber, ayahNumber) => {
    const sNum = parseInt(surahNumber, 10) || 1;
    const aNum = parseInt(ayahNumber, 10) || 1;
    const offset = CUMULATIVE_AYAH_OFFSETS[sNum] ?? 0;
    return Math.min(TOTAL_QURAN_AYAHS, Math.max(1, offset + aNum));
};

/**
 * Reverse mapping from absolute index (1 to 6236) back to { surah, ayah }
 */
export const getSurahAyahFromAbsoluteIndex = (absoluteIndex) => {
    const target = Math.min(TOTAL_QURAN_AYAHS, Math.max(1, parseInt(absoluteIndex, 10) || 1));
    let currentOffset = 0;
    for (const surah of SURAH_FALLBACK_DATA) {
        if (target <= currentOffset + surah.total_ayahs) {
            return {
                surahNumber: surah.number,
                ayahNumber: target - currentOffset,
                surah
            };
        }
        currentOffset += surah.total_ayahs;
    }
    const last = SURAH_FALLBACK_DATA[SURAH_FALLBACK_DATA.length - 1];
    return { surahNumber: last.number, ayahNumber: last.total_ayahs, surah: last };
};

/**
 * Find which Juz (1-30) contains the given surah & ayah
 */
export const getJuzFromSurahAyah = (surahNumber, ayahNumber) => {
    const sNum = parseInt(surahNumber, 10);
    const aNum = parseInt(ayahNumber, 10);
    const currentAbs = getAbsoluteAyahIndex(sNum, aNum);

    for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
        const start = JUZ_STARTS[i];
        const startAbs = getAbsoluteAyahIndex(start.surah, start.ayah);
        if (currentAbs >= startAbs) {
            return start.juz;
        }
    }
    return 1;
};

/**
 * Format date string YYYY-MM-DD
 */
export const getTodayKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Calculate difference in calendar days between two dates
 */
const diffDays = (dateStr1, dateStr2) => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

/**
 * Get raw saved state from localStorage
 */
const getRawStorageState = () => {
    try {
        const raw = localStorage.getItem(KHATAM_STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (e) {
        console.warn('Error parsing khatam tracker state:', e);
    }
    return null;
};

/**
 * Save raw state to localStorage and notify listeners
 */
const saveRawStorageState = (state) => {
    try {
        localStorage.setItem(KHATAM_STORAGE_KEY, JSON.stringify(state));
        window.dispatchEvent(new CustomEvent('indoquran_khatam_updated', { detail: state }));
    } catch (e) {
        console.error('Error saving khatam tracker state:', e);
    }
};

/**
 * Initialize or get current comprehensive Khatam Tracker State
 */
export const getKhatamTrackerState = () => {
    const today = getTodayKey();
    let state = getRawStorageState();
    const lastRead = getLocalLastRead();

    if (!state) {
        // First-time default state
        const initialSurah = lastRead?.surah?.number || 1;
        const initialAyah = lastRead?.lastVerse || lastRead?.ayah_number || 1;
        const initialAbs = getAbsoluteAyahIndex(initialSurah, initialAyah);

        state = {
            targetDays: 30, // Default 30-day khatam goal (One Day One Juz)
            startDate: new Date().toISOString(),
            currentSurah: initialSurah,
            currentAyah: initialAyah,
            currentAbsoluteIndex: initialAbs,
            streak: 1,
            lastActiveDate: today,
            dailyHistory: {
                [today]: 0
            }
        };
        saveRawStorageState(state);
    } else {
        // Sync with lastRead if lastRead is newer or exists
        if (lastRead?.surah?.number && lastRead?.lastVerse) {
            const lrAbs = getAbsoluteAyahIndex(lastRead.surah.number, lastRead.lastVerse);
            if (lrAbs !== state.currentAbsoluteIndex && (!state.lastUpdatedFromWeb || lrAbs > state.currentAbsoluteIndex)) {
                state.currentSurah = lastRead.surah.number;
                state.currentAyah = lastRead.lastVerse;
                state.currentAbsoluteIndex = lrAbs;
            }
        }

        // Streak check: verify if user missed more than 1 day
        if (state.lastActiveDate && state.lastActiveDate !== today) {
            const gap = diffDays(state.lastActiveDate, today);
            if (gap === 1) {
                // Read yesterday, streak is maintained
            } else if (gap > 1) {
                // Broken streak, reset to 0 until reading today
                state.streak = 0;
            }
        }

        if (!state.dailyHistory) {
            state.dailyHistory = {};
        }
        if (typeof state.dailyHistory[today] !== 'number') {
            state.dailyHistory[today] = 0;
        }
    }

    return state;
};

/**
 * Calculate statistical calculations for UI rendering
 */
export const getKhatamStats = () => {
    const state = getKhatamTrackerState();
    const today = getTodayKey();

    const currentAbsolute = state.currentAbsoluteIndex || 1;
    const currentSurah = state.currentSurah || 1;
    const currentAyah = state.currentAyah || 1;
    const surahObj = SURAH_FALLBACK_DATA.find(s => s.number === currentSurah) || SURAH_FALLBACK_DATA[0];

    // Khatam percentage
    const percentTotal = Math.min(100, Math.max(0, (currentAbsolute / TOTAL_QURAN_AYAHS) * 100));
    const ayahsRemaining = Math.max(0, TOTAL_QURAN_AYAHS - currentAbsolute);
    const currentJuz = getJuzFromSurahAyah(currentSurah, currentAyah);

    // Target calculation
    const targetDays = state.targetDays || 30;
    const startDate = new Date(state.startDate || Date.now());
    const daysElapsed = Math.max(0, diffDays(state.startDate, today));
    const daysRemaining = Math.max(1, targetDays - daysElapsed);

    // Dynamic daily target: remaining ayahs divided by remaining days
    const dailyTargetAyahs = Math.min(
        TOTAL_QURAN_AYAHS,
        Math.max(5, Math.ceil(ayahsRemaining > 0 ? ayahsRemaining / daysRemaining : TOTAL_QURAN_AYAHS / targetDays))
    );

    const todayReadCount = state.dailyHistory?.[today] || 0;
    const todayPercent = Math.min(100, Math.round((todayReadCount / dailyTargetAyahs) * 100));
    const isTodayGoalMet = todayReadCount >= dailyTargetAyahs;

    // Projected completion date
    const targetFinishDate = new Date(startDate);
    targetFinishDate.setDate(targetFinishDate.getDate() + targetDays);

    const formattedFinishDate = targetFinishDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return {
        state,
        currentSurah,
        currentAyah,
        surahName: surahObj.name_latin,
        surahArabic: surahObj.name_arabic,
        surahTotalAyahs: surahObj.total_ayahs,
        currentAbsolute,
        totalAyahs: TOTAL_QURAN_AYAHS,
        ayahsRemaining,
        currentJuz,
        percentTotal: Number(percentTotal.toFixed(1)),
        targetDays,
        daysRemaining,
        daysElapsed,
        dailyTargetAyahs,
        todayReadCount,
        todayPercent,
        isTodayGoalMet,
        streak: state.streak || 0,
        formattedFinishDate
    };
};

/**
 * Record user reading progression (called when reading an ayah or changing surah)
 */
export const recordAyahProgress = async (surahNumber, ayahNumber) => {
    const sNum = parseInt(surahNumber, 10);
    const aNum = parseInt(ayahNumber, 10);
    if (!sNum || !aNum) return;

    const today = getTodayKey();
    const state = getKhatamTrackerState();
    const prevAbs = state.currentAbsoluteIndex || 1;
    const newAbs = getAbsoluteAyahIndex(sNum, aNum);

    // Calculate how many new ayahs were progressed forward
    const progressed = newAbs > prevAbs ? newAbs - prevAbs : 1;

    // Update daily history
    if (!state.dailyHistory) state.dailyHistory = {};
    state.dailyHistory[today] = (state.dailyHistory[today] || 0) + progressed;

    // Update streak
    if (state.lastActiveDate !== today) {
        const gap = diffDays(state.lastActiveDate, today);
        if (gap === 1) {
            state.streak = (state.streak || 0) + 1;
        } else if (gap > 1) {
            state.streak = 1;
        } else if (!state.streak) {
            state.streak = 1;
        }
        state.lastActiveDate = today;
    }

    state.currentSurah = sNum;
    state.currentAyah = aNum;
    state.currentAbsoluteIndex = newAbs;
    state.lastUpdatedFromWeb = true;

    saveRawStorageState(state);

    // Sync with local last read
    const surahObj = SURAH_FALLBACK_DATA.find(s => s.number === sNum);
    saveLocalLastRead({
        surah: surahObj || { number: sNum },
        lastVerse: aNum,
        ayah_number: aNum,
        surah_number: sNum
    });

    // If authenticated, sync with server
    const token = authUtils.getAuthToken();
    if (token) {
        try {
            await updateReadingProgress(sNum, aNum);
        } catch (e) {
            console.warn('Could not sync reading progress to server:', e);
        }
    }
};

/**
 * Update target plan (e.g. 30, 60, 90 days or custom)
 */
export const updateKhatamTarget = (targetDays) => {
    const state = getKhatamTrackerState();
    state.targetDays = Math.max(1, parseInt(targetDays, 10) || 30);
    state.startDate = new Date().toISOString();
    saveRawStorageState(state);
};

/**
 * Manually update reading position (for users who read printed mushaf)
 */
export const updateManualPosition = (surahNumber, ayahNumber) => {
    const sNum = parseInt(surahNumber, 10);
    const aNum = parseInt(ayahNumber, 10);
    if (!sNum || !aNum) return;

    const today = getTodayKey();
    const state = getKhatamTrackerState();
    const newAbs = getAbsoluteAyahIndex(sNum, aNum);

    // Keep active today
    if (state.lastActiveDate !== today) {
        state.streak = (state.streak || 0) + 1;
        state.lastActiveDate = today;
    }

    state.currentSurah = sNum;
    state.currentAyah = aNum;
    state.currentAbsoluteIndex = newAbs;
    state.lastUpdatedFromWeb = true;

    saveRawStorageState(state);

    const surahObj = SURAH_FALLBACK_DATA.find(s => s.number === sNum);
    saveLocalLastRead({
        surah: surahObj || { number: sNum },
        lastVerse: aNum,
        ayah_number: aNum,
        surah_number: sNum
    });
};

/**
 * Quick action to mark today's target as finished
 */
export const markTodayGoalComplete = () => {
    const stats = getKhatamStats();
    const today = getTodayKey();
    const state = getKhatamTrackerState();

    if (!state.dailyHistory) state.dailyHistory = {};
    state.dailyHistory[today] = Math.max(stats.dailyTargetAyahs, (state.dailyHistory[today] || 0) + stats.dailyTargetAyahs);

    if (state.lastActiveDate !== today) {
        state.streak = (state.streak || 0) + 1;
        state.lastActiveDate = today;
    }

    // Advance position by today's target
    const nextAbs = Math.min(TOTAL_QURAN_AYAHS, (state.currentAbsoluteIndex || 1) + stats.dailyTargetAyahs);
    const nextPos = getSurahAyahFromAbsoluteIndex(nextAbs);
    state.currentSurah = nextPos.surahNumber;
    state.currentAyah = nextPos.ayahNumber;
    state.currentAbsoluteIndex = nextAbs;

    saveRawStorageState(state);

    saveLocalLastRead({
        surah: nextPos.surah,
        lastVerse: nextPos.ayahNumber,
        ayah_number: nextPos.ayahNumber,
        surah_number: nextPos.surahNumber
    });
};

/**
 * Reset khatam plan to beginning
 */
export const resetKhatamPlan = () => {
    const today = getTodayKey();
    const state = {
        targetDays: 30,
        startDate: new Date().toISOString(),
        currentSurah: 1,
        currentAyah: 1,
        currentAbsoluteIndex: 1,
        streak: 1,
        lastActiveDate: today,
        dailyHistory: {
            [today]: 0
        }
    };
    saveRawStorageState(state);
    saveLocalLastRead({
        surah: SURAH_FALLBACK_DATA[0],
        lastVerse: 1,
        ayah_number: 1,
        surah_number: 1
    });
};

export default {
    TOTAL_QURAN_AYAHS,
    TOTAL_QURAN_JUZ,
    JUZ_STARTS,
    getAbsoluteAyahIndex,
    getSurahAyahFromAbsoluteIndex,
    getJuzFromSurahAyah,
    getKhatamTrackerState,
    getKhatamStats,
    recordAyahProgress,
    updateKhatamTarget,
    updateManualPosition,
    markTodayGoalComplete,
    resetKhatamPlan
};
