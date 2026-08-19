/**
 * BookmarkService.js
 * Service to handle bookmark and favorite functionality for ayahs
 * Supports both authenticated API calls and localStorage fallback for guests
 */
import { postWithAuth, getWithAuth, putWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';

const LOCAL_STORAGE_KEY = 'indoquran_local_bookmarks';
const LAST_READ_KEY = 'indoquran_last_read';

/**
 * Get local bookmarks from localStorage
 */
export const getLocalBookmarks = () => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading local bookmarks:', e);
        return [];
    }
};

/**
 * Save local bookmarks to localStorage
 */
export const saveLocalBookmarks = (bookmarks) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookmarks));
        // Dispatch storage event for cross-tab or component sync
        window.dispatchEvent(new Event('indoquran_bookmarks_updated'));
    } catch (e) {
        console.error('Error saving local bookmarks:', e);
    }
};

/**
 * Toggle bookmark in localStorage
 */
export const toggleLocalBookmark = (ayahData) => {
    const bookmarks = getLocalBookmarks();
    const existingIndex = bookmarks.findIndex(
        b => b.surah_number === ayahData.surah_number && b.ayah_number === ayahData.ayah_number
    );

    let isBookmarked = false;
    let updatedBookmarks;

    if (existingIndex > -1) {
        // Remove
        updatedBookmarks = bookmarks.filter((_, i) => i !== existingIndex);
        isBookmarked = false;
    } else {
        // Add
        const newBookmark = {
            id: ayahData.id || `local_${ayahData.surah_number}_${ayahData.ayah_number}`,
            surah_number: ayahData.surah_number,
            ayah_number: ayahData.ayah_number,
            text_arabic: ayahData.text_arabic || ayahData.arabic || '',
            text_indonesian: ayahData.text_indonesian || ayahData.translation || ayahData.text || '',
            surah: ayahData.surah || {
                number: ayahData.surah_number,
                name_indonesian: ayahData.surah_name || `Surah ${ayahData.surah_number}`,
                name_arabic: ayahData.surah_arabic || '',
                name_latin: ayahData.surah_latin || ayahData.surah_name || `Surah ${ayahData.surah_number}`,
                total_ayahs: ayahData.total_ayahs || 0,
                revelation_place: ayahData.revelation_place || ''
            },
            pivot: {
                is_favorite: false,
                notes: '',
                created_at: new Date().toISOString()
            }
        };
        updatedBookmarks = [newBookmark, ...bookmarks];
        isBookmarked = true;
    }

    saveLocalBookmarks(updatedBookmarks);
    return { is_bookmarked: isBookmarked, bookmarks: updatedBookmarks };
};

/**
 * Toggle local favorite status
 */
export const toggleLocalFavorite = (surahNumber, ayahNumber) => {
    const bookmarks = getLocalBookmarks();
    let isFavorite = false;
    const updated = bookmarks.map(b => {
        if (b.surah_number === surahNumber && b.ayah_number === ayahNumber) {
            const currentFav = b.pivot?.is_favorite || false;
            isFavorite = !currentFav;
            return {
                ...b,
                pivot: {
                    ...(b.pivot || {}),
                    is_favorite: isFavorite
                }
            };
        }
        return b;
    });
    saveLocalBookmarks(updated);
    return isFavorite;
};

/**
 * Update local bookmark notes
 */
export const updateLocalBookmarkNotes = (surahNumber, ayahNumber, notes) => {
    const bookmarks = getLocalBookmarks();
    const updated = bookmarks.map(b => {
        if (b.surah_number === surahNumber && b.ayah_number === ayahNumber) {
            return {
                ...b,
                pivot: {
                    ...(b.pivot || {}),
                    notes: notes
                }
            };
        }
        return b;
    });
    saveLocalBookmarks(updated);
    return updated;
};

/**
 * Remove bookmark locally
 */
export const removeLocalBookmark = (surahNumber, ayahNumber) => {
    const bookmarks = getLocalBookmarks();
    const updated = bookmarks.filter(
        b => !(b.surah_number === surahNumber && b.ayah_number === ayahNumber)
    );
    saveLocalBookmarks(updated);
    return updated;
};

/**
 * Toggle bookmark status for an ayah ID (API)
 */
export const toggleBookmark = async (ayahId) => {
    try {
        const response = await postWithAuth(`/api/penanda/surah/ayah/${ayahId}/toggle`);

        if (!response.ok) {
            throw new Error('Failed to toggle bookmark');
        }

        return await response.json();
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        throw error;
    }
};

/**
 * Toggle favorite status for an ayah ID (API)
 */
export const toggleFavorite = async (ayahId) => {
    try {
        const response = await postWithAuth(`/api/penanda/surah/ayah/${ayahId}/favorite`);

        if (!response.ok) {
            throw new Error('Failed to toggle favorite');
        }

        return await response.json();
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
};

/**
 * Get bookmark status for multiple ayahs (API)
 */
export const getBookmarkStatus = async (ayahIds) => {
    try {
        const response = await getWithAuth(`/api/penanda/status?ayah_ids=${ayahIds.join(',')}`);

        if (!response.ok) {
            throw new Error('Failed to get bookmark status');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error getting bookmark status:', error);
        throw error;
    }
};

/**
 * Get user's bookmarks (handles both authenticated API and guest fallback)
 * @param {boolean} favoritesOnly - If true, only return favorites
 * @returns {Promise<Array>} - Array of bookmarked ayahs
 */
export const getUserBookmarks = async (favoritesOnly = false) => {
    const token = authUtils.getAuthToken();
    
    if (token) {
        try {
            const url = favoritesOnly ? '/api/penanda?favorites_only=true' : '/api/penanda';
            const response = await getWithAuth(url);

            if (response.ok) {
                const result = await response.json();
                return result.data || [];
            }
        } catch (error) {
            console.warn('API get bookmarks failed, falling back to local:', error);
        }
    }

    // Guest or API fallback: get from localStorage
    const local = getLocalBookmarks();
    if (favoritesOnly) {
        return local.filter(b => b.pivot?.is_favorite);
    }
    return local;
};

/**
 * Update notes for a bookmark by ayahId
 */
export const updateBookmarkNotes = async (ayahId, notes) => {
    try {
        const response = await putWithAuth(`/api/penanda/surah/ayah/${ayahId}/notes`, { notes });

        if (!response.ok) {
            throw new Error('Failed to update notes');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating notes:', error);
        throw error;
    }
};

/**
 * Toggle bookmark status using surah and ayah numbers
 */
export const toggleBookmarkByNumbers = async (surahNumber, ayahNumber, ayahData = null) => {
    const token = authUtils.getAuthToken();
    
    if (token) {
        try {
            const response = await postWithAuth(`/api/penanda/surah/${surahNumber}/ayah/${ayahNumber}/toggle`);

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('API toggle bookmark failed, updating locally:', error);
        }
    }

    // Guest fallback
    if (ayahData) {
        const res = toggleLocalBookmark(ayahData);
        return {
            status: 'success',
            data: {
                is_bookmarked: res.is_bookmarked,
                surah_number: surahNumber,
                ayah_number: ayahNumber
            }
        };
    }

    return {
        status: 'error',
        message: 'Tidak dapat mengubah penanda'
    };
};

/**
 * Update notes for a bookmark using surah and ayah numbers
 */
export const updateBookmarkNotesByNumbers = async (surahNumber, ayahNumber, notes) => {
    const token = authUtils.getAuthToken();
    
    if (token) {
        try {
            const response = await putWithAuth(`/api/penanda/surah/${surahNumber}/ayah/${ayahNumber}/notes`, { notes });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('API update notes failed, updating locally:', error);
        }
    }

    // Local fallback
    updateLocalBookmarkNotes(surahNumber, ayahNumber, notes);
    return {
        status: 'success',
        data: {
            notes,
            surah_number: surahNumber,
            ayah_number: ayahNumber
        }
    };
};

/**
 * Get Last Read from localStorage or cache
 */
export const getLocalLastRead = () => {
    try {
        const stored = localStorage.getItem(LAST_READ_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Save Last Read to localStorage
 */
export const saveLocalLastRead = (data) => {
    try {
        localStorage.setItem(LAST_READ_KEY, JSON.stringify({
            ...data,
            timestamp: new Date().toISOString()
        }));
    } catch (e) {
        console.error('Error saving local last read:', e);
    }
};

