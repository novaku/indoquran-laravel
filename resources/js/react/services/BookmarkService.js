/**
 * BookmarkService.js
 * Service to handle bookmark and favorite functionality for ayahs
 */
import { getApiUrl } from '../utils/api';

/**
 * Toggle bookmark status for an ayah
 * @param {number} ayahId - The ID of the ayah to bookmark/unbookmark
 * @returns {Promise<Object>} - The bookmark status response
 */
export const toggleBookmark = async (ayahId) => {
    try {
        const response = await fetch(getApiUrl(`/api/bookmarks/ayah/${ayahId}/toggle`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

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
 * Toggle favorite status for an ayah
 * @param {number} ayahId - The ID of the ayah to favorite/unfavorite
 * @returns {Promise<Object>} - The favorite status response
 */
export const toggleFavorite = async (ayahId) => {
    try {
        const response = await fetch(getApiUrl(`/api/bookmarks/ayah/${ayahId}/favorite`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

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
 * Get bookmark status for multiple ayahs
 * @param {Array<number>} ayahIds - Array of ayah IDs to check
 * @returns {Promise<Object>} - Object with ayah IDs as keys and status as values
 */
export const getBookmarkStatus = async (ayahIds) => {
    try {
        const response = await fetch(getApiUrl(`/api/bookmarks/status?ayah_ids=${ayahIds.join(',')}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

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
 * Get user's bookmarks
 * @param {boolean} favoritesOnly - If true, only return favorites
 * @returns {Promise<Array>} - Array of bookmarked ayahs
 */
export const getUserBookmarks = async (favoritesOnly = false) => {
    try {
        const url = favoritesOnly ? '/api/bookmarks?favorites_only=true' : '/api/bookmarks';
        const response = await fetch(getApiUrl(url), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get bookmarks');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

/**
 * Update notes for a bookmark
 * @param {number} ayahId - The ID of the ayah
 * @param {string} notes - The notes to save
 * @returns {Promise<Object>} - The updated bookmark data
 */
export const updateBookmarkNotes = async (ayahId, notes) => {
    try {
        const response = await fetch(getApiUrl(`/api/bookmarks/ayah/${ayahId}/notes`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ notes })
        });

        if (!response.ok) {
            throw new Error('Failed to update notes');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating notes:', error);
        throw error;
    }
};
