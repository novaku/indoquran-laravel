import { SURAH_FALLBACK_DATA } from '../data/surahsFallbackData';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';

const SURAH_CACHE_KEY = 'indoquran_surahs_cache_v1';
const SURAH_CACHE_TIMESTAMP_KEY = 'indoquran_surahs_cache_ts_v1';

/**
 * Get surahs from localStorage cache, or fallback to bundled canonical data
 * @returns {{ data: Array, from: 'cache' | 'bundled' }}
 */
export const getCachedSurahs = () => {
    try {
        const raw = localStorage.getItem(SURAH_CACHE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return { data: parsed, from: 'cache' };
            }
        }
    } catch (e) {
        console.warn('Failed to read surahs from localStorage:', e);
    }

    return { data: SURAH_FALLBACK_DATA, from: 'bundled' };
};

/**
 * Save freshly fetched surahs into localStorage
 * @param {Array} surahs
 */
export const saveSurahsToCache = (surahs) => {
    if (!Array.isArray(surahs) || surahs.length === 0) return;
    try {
        localStorage.setItem(SURAH_CACHE_KEY, JSON.stringify(surahs));
        localStorage.setItem(SURAH_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
        console.warn('Failed to save surahs to localStorage cache:', e);
    }
};

/**
 * Fetch surahs from API with automatic fallback and caching
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ data: Array, isFallback: boolean, fallbackType: 'cache' | 'bundled' | null, error: string | null }>}
 */
export const fetchSurahsWithFallback = async (signal) => {
    try {
        const token = authUtils.getAuthToken();
        const response = await fetchWithAuth('/api/surahs', {
            signal,
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            saveSurahsToCache(result.data);
            return {
                data: result.data,
                isFallback: false,
                fallbackType: null,
                error: null
            };
        } else {
            throw new Error(result.message || 'Data surah tidak valid dari server');
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            throw err;
        }
        console.warn('API /api/surahs failed, using graceful fallback:', err);
        const fallback = getCachedSurahs();
        return {
            data: fallback.data,
            isFallback: true,
            fallbackType: fallback.from,
            error: err.message || 'Gagal memuat data dari server'
        };
    }
};

export default {
    getCachedSurahs,
    saveSurahsToCache,
    fetchSurahsWithFallback,
    SURAH_FALLBACK_DATA
};
