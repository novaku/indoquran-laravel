/**
 * HaditsBookmarkService.js
 * Service to manage Hadits bookmarks, favorites, and tadabbur notes.
 * Supports both authenticated API calls with MySQL database persistence
 * and localStorage fallback for guest users, with automatic sync upon login.
 */

import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from '../utils/apiUtils';

const STORAGE_KEY = 'indoquran_hadits_bookmarks';
const UPDATE_EVENT = 'indoquran_hadits_bookmarks_updated';

/**
 * Check if the current user is properly authenticated (not guest)
 */
export const isUserLoggedIn = () => {
    try {
        const token = localStorage.getItem('auth_token');
        const isGuest = localStorage.getItem('is_guest') === 'true';
        return Boolean(token && token.trim().length > 0 && !isGuest);
    } catch (e) {
        return false;
    }
};

/**
 * Get all saved Hadits bookmarks from localStorage
 */
export const getLocalHaditsBookmarks = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading local hadits bookmarks:', e);
        return [];
    }
};

/**
 * Save Hadits bookmarks to localStorage and notify listeners
 */
export const saveLocalHaditsBookmarks = (bookmarks) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        window.dispatchEvent(new Event(UPDATE_EVENT));
    } catch (e) {
        console.error('Error saving local hadits bookmarks:', e);
    }
};

/**
 * Check if a specific hadith is bookmarked in local cache
 */
export const isHaditsBookmarked = (kitabSlug, number) => {
    if (!kitabSlug || number === undefined || number === null) return false;
    const bookmarks = getLocalHaditsBookmarks();
    const num = Number(number);
    return bookmarks.some(b => b.kitab_slug === kitabSlug && Number(b.number) === num);
};

/**
 * Toggle bookmark state locally (for guests or offline fallback)
 * @param {Object} haditsData - { kitab_slug, kitab_name, kitab_arab, number, arab, terjemah, notes, is_favorite }
 */
export const toggleLocalHaditsBookmark = (haditsData) => {
    if (!haditsData || !haditsData.kitab_slug || haditsData.number === undefined) {
        return { is_bookmarked: false, bookmarks: getLocalHaditsBookmarks() };
    }

    const bookmarks = getLocalHaditsBookmarks();
    const num = Number(haditsData.number);
    const existingIndex = bookmarks.findIndex(
        b => b.kitab_slug === haditsData.kitab_slug && Number(b.number) === num
    );

    let isBookmarked = false;
    let updatedBookmarks;

    if (existingIndex > -1) {
        // Remove bookmark
        updatedBookmarks = bookmarks.filter((_, i) => i !== existingIndex);
        isBookmarked = false;
    } else {
        // Add new bookmark
        const newBookmark = {
            id: `hadits_${haditsData.kitab_slug}_${num}`,
            kitab_slug: haditsData.kitab_slug,
            kitab_name: haditsData.kitab_name || haditsData.kitab_slug,
            kitab_arab: haditsData.kitab_arab || '',
            number: num,
            arab: haditsData.arab || '',
            indonesia: haditsData.indonesia || haditsData.terjemah || haditsData.terjemahan || '',
            penjelasan: haditsData.penjelasan || null,
            kategori: haditsData.kategori || '',
            is_favorite: Boolean(haditsData.is_favorite),
            notes: haditsData.notes || '',
            created_at: new Date().toISOString()
        };
        updatedBookmarks = [newBookmark, ...bookmarks];
        isBookmarked = true;
    }

    saveLocalHaditsBookmarks(updatedBookmarks);
    return { is_bookmarked: isBookmarked, bookmarks: updatedBookmarks };
};

/**
 * Get user's hadits bookmarks
 * Uses MySQL database API if user is authenticated, falls back to localStorage for guests
 * @param {boolean} favoritesOnly
 * @param {string|null} kitabSlug
 * @returns {Promise<Array>}
 */
export const getUserHaditsBookmarks = async (favoritesOnly = false, kitabSlug = null) => {
    if (isUserLoggedIn()) {
        try {
            const params = new URLSearchParams();
            if (favoritesOnly) params.set('favorites_only', 'true');
            if (kitabSlug) params.set('kitab_slug', kitabSlug);

            const url = `/api/penanda/hadits${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await getWithAuth(url);

            if (response.ok) {
                const resJson = await response.json();
                if (resJson.status === 'success' && Array.isArray(resJson.data)) {
                    // Update local cache with server data when fetching all
                    if (!favoritesOnly && !kitabSlug) {
                        saveLocalHaditsBookmarks(resJson.data);
                    }
                    return resJson.data;
                }
            }
        } catch (e) {
            console.warn('API getUserHaditsBookmarks error, falling back to local cache:', e);
        }
    }

    // Guest or offline fallback
    let bookmarks = getLocalHaditsBookmarks();
    if (favoritesOnly) {
        bookmarks = bookmarks.filter(b => b.is_favorite);
    }
    if (kitabSlug) {
        bookmarks = bookmarks.filter(b => b.kitab_slug === kitabSlug);
    }
    return bookmarks;
};

/**
 * Toggle bookmark state for a hadith
 * Automatically persists to MySQL database if logged in, or localStorage for guest
 * @param {Object} haditsData - { kitab_slug, kitab_name, kitab_arab, number, arab, terjemah, notes }
 */
export const toggleHaditsBookmark = async (haditsData) => {
    if (!haditsData || !haditsData.kitab_slug || haditsData.number === undefined) {
        return { is_bookmarked: false, bookmarks: getLocalHaditsBookmarks() };
    }

    const num = Number(haditsData.number);
    const slug = haditsData.kitab_slug;

    if (isUserLoggedIn()) {
        try {
            const url = `/api/penanda/hadits/${slug}/${num}/toggle`;
            const response = await postWithAuth(url, {
                notes: haditsData.notes || null
            });

            if (response.ok) {
                const resJson = await response.json();
                if (resJson.status === 'success') {
                    const isBookmarked = resJson.data.is_bookmarked;
                    const bookmarks = getLocalHaditsBookmarks();
                    let updatedBookmarks;

                    if (isBookmarked) {
                        const newEntry = resJson.data.bookmark || {
                            id: `hadits_${slug}_${num}`,
                            kitab_slug: slug,
                            kitab_name: haditsData.kitab_name || slug,
                            kitab_arab: haditsData.kitab_arab || '',
                            number: num,
                            arab: haditsData.arab || '',
                            indonesia: haditsData.indonesia || haditsData.terjemah || haditsData.terjemahan || '',
                            penjelasan: haditsData.penjelasan || null,
                            kategori: haditsData.kategori || '',
                            is_favorite: false,
                            notes: haditsData.notes || '',
                            created_at: new Date().toISOString()
                        };
                        // Upsert
                        const existingIdx = bookmarks.findIndex(b => b.kitab_slug === slug && Number(b.number) === num);
                        if (existingIdx > -1) {
                            bookmarks[existingIdx] = newEntry;
                            updatedBookmarks = [...bookmarks];
                        } else {
                            updatedBookmarks = [newEntry, ...bookmarks];
                        }
                    } else {
                        updatedBookmarks = bookmarks.filter(b => !(b.kitab_slug === slug && Number(b.number) === num));
                    }

                    saveLocalHaditsBookmarks(updatedBookmarks);
                    return { is_bookmarked: isBookmarked, bookmarks: updatedBookmarks };
                }
            }
        } catch (e) {
            console.warn('API toggleHaditsBookmark failed, falling back to local:', e);
        }
    }

    // Guest fallback
    return toggleLocalHaditsBookmark(haditsData);
};

/**
 * Toggle favorite status for a saved hadith
 * @param {string} kitabSlug
 * @param {number|string} number
 * @param {Object|null} haditsData - Optional details to create bookmark if not yet existing
 */
export const toggleHaditsFavorite = async (kitabSlug, number, haditsData = null) => {
    const num = Number(number);

    if (isUserLoggedIn()) {
        try {
            const url = `/api/penanda/hadits/${kitabSlug}/${num}/favorite`;
            const response = await postWithAuth(url);

            if (response.ok) {
                const resJson = await response.json();
                if (resJson.status === 'success') {
                    const isFavorite = resJson.data.is_favorite;
                    const bookmarks = getLocalHaditsBookmarks();
                    const existingIndex = bookmarks.findIndex(
                        b => b.kitab_slug === kitabSlug && Number(b.number) === num
                    );

                    let updated;
                    if (existingIndex > -1) {
                        updated = bookmarks.map(b => {
                            if (b.kitab_slug === kitabSlug && Number(b.number) === num) {
                                return { ...b, is_favorite: isFavorite };
                            }
                            return b;
                        });
                    } else if (resJson.data.bookmark) {
                        updated = [resJson.data.bookmark, ...bookmarks];
                    } else {
                        const newEntry = {
                            id: `hadits_${kitabSlug}_${num}`,
                            kitab_slug: kitabSlug,
                            kitab_name: haditsData?.kitab_name || kitabSlug,
                            kitab_arab: haditsData?.kitab_arab || '',
                            number: num,
                            arab: haditsData?.arab || '',
                            indonesia: haditsData?.indonesia || haditsData?.terjemah || haditsData?.terjemahan || '',
                            penjelasan: haditsData?.penjelasan || null,
                            kategori: haditsData?.kategori || '',
                            is_favorite: true,
                            notes: '',
                            created_at: new Date().toISOString()
                        };
                        updated = [newEntry, ...bookmarks];
                    }

                    saveLocalHaditsBookmarks(updated);
                    return { is_favorite: isFavorite, bookmarks: updated };
                }
            }
        } catch (e) {
            console.warn('API toggleHaditsFavorite failed, falling back to local:', e);
        }
    }

    // Guest fallback
    const bookmarks = getLocalHaditsBookmarks();
    const existingIndex = bookmarks.findIndex(
        b => b.kitab_slug === kitabSlug && Number(b.number) === num
    );

    let isFavorite = false;
    let updated;

    if (existingIndex > -1) {
        isFavorite = !bookmarks[existingIndex].is_favorite;
        updated = bookmarks.map(b => {
            if (b.kitab_slug === kitabSlug && Number(b.number) === num) {
                return { ...b, is_favorite: isFavorite };
            }
            return b;
        });
    } else {
        isFavorite = true;
        const newEntry = {
            id: `hadits_${kitabSlug}_${num}`,
            kitab_slug: kitabSlug,
            kitab_name: haditsData?.kitab_name || kitabSlug,
            kitab_arab: haditsData?.kitab_arab || '',
            number: num,
            arab: haditsData?.arab || '',
            indonesia: haditsData?.indonesia || haditsData?.terjemah || haditsData?.terjemahan || '',
            penjelasan: haditsData?.penjelasan || null,
            kategori: haditsData?.kategori || '',
            is_favorite: true,
            notes: '',
            created_at: new Date().toISOString()
        };
        updated = [newEntry, ...bookmarks];
    }

    saveLocalHaditsBookmarks(updated);
    return { is_favorite: isFavorite, bookmarks: updated };
};

/**
 * Update personal tadabbur notes on a bookmarked hadith
 */
export const updateHaditsNotes = async (kitabSlug, number, notes) => {
    const num = Number(number);

    if (isUserLoggedIn()) {
        try {
            const url = `/api/penanda/hadits/${kitabSlug}/${num}/notes`;
            const response = await putWithAuth(url, { notes });

            if (response.ok) {
                const resJson = await response.json();
                if (resJson.status === 'success') {
                    const bookmarks = getLocalHaditsBookmarks();
                    const updated = bookmarks.map(b => {
                        if (b.kitab_slug === kitabSlug && Number(b.number) === num) {
                            return { ...b, notes: notes || '' };
                        }
                        return b;
                    });
                    saveLocalHaditsBookmarks(updated);
                    return { success: true, bookmarks: updated };
                }
            }
        } catch (e) {
            console.warn('API updateHaditsNotes failed, falling back to local:', e);
        }
    }

    // Guest fallback
    const bookmarks = getLocalHaditsBookmarks();
    const updated = bookmarks.map(b => {
        if (b.kitab_slug === kitabSlug && Number(b.number) === num) {
            return {
                ...b,
                notes: notes || ''
            };
        }
        return b;
    });

    saveLocalHaditsBookmarks(updated);
    return { success: true, bookmarks: updated };
};

/**
 * Delete bookmark for a hadith
 */
export const removeHaditsBookmark = async (kitabSlug, number) => {
    const num = Number(number);

    if (isUserLoggedIn()) {
        try {
            const url = `/api/penanda/hadits/${kitabSlug}/${num}`;
            const response = await deleteWithAuth(url);

            if (response.ok) {
                const bookmarks = getLocalHaditsBookmarks();
                const updated = bookmarks.filter(
                    b => !(b.kitab_slug === kitabSlug && Number(b.number) === num)
                );
                saveLocalHaditsBookmarks(updated);
                return { success: true, bookmarks: updated };
            }
        } catch (e) {
            console.warn('API removeHaditsBookmark failed, falling back to local:', e);
        }
    }

    // Guest fallback
    const bookmarks = getLocalHaditsBookmarks();
    const updated = bookmarks.filter(
        b => !(b.kitab_slug === kitabSlug && Number(b.number) === num)
    );

    saveLocalHaditsBookmarks(updated);
    return { success: true, bookmarks: updated };
};

/**
 * Synchronize local bookmarks from client storage into the database
 * Should be called upon user login or opening bookmarks page
 */
export const syncLocalHaditsBookmarksToServer = async () => {
    if (!isUserLoggedIn()) return null;

    try {
        const local = getLocalHaditsBookmarks();
        if (!local || local.length === 0) {
            // Just fetch latest from server
            return await getUserHaditsBookmarks();
        }

        const payload = local.map(b => ({
            kitab_slug: b.kitab_slug,
            number: Number(b.number),
            is_favorite: Boolean(b.is_favorite),
            notes: b.notes || null
        }));

        const response = await postWithAuth('/api/penanda/hadits/sync', { bookmarks: payload });

        if (response.ok) {
            const resJson = await response.json();
            if (resJson.status === 'success' && Array.isArray(resJson.data)) {
                saveLocalHaditsBookmarks(resJson.data);
                return resJson.data;
            }
        }
    } catch (e) {
        console.warn('Failed to sync local hadits bookmarks to server:', e);
    }

    return getLocalHaditsBookmarks();
};
