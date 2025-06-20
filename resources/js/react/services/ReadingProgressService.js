/**
 * ReadingProgressService.js
 * Service to handle user reading progress tracking
 */
import { getWithAuth, postWithAuth } from '../utils/apiUtils';

/**
 * Get user's current reading progress
 * @returns {Promise<Object>} - The reading progress data
 */
export const getReadingProgress = async () => {
    try {
        const response = await getWithAuth('/api/reading-progress');

        if (!response.ok) {
            throw new Error('Failed to get reading progress');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting reading progress:', error);
        throw error;
    }
};

/**
 * Update user's reading progress
 * @param {number} surahNumber - The surah number
 * @param {number} ayahNumber - The ayah number within the surah
 * @returns {Promise<Object>} - The update response
 */
export const updateReadingProgress = async (surahNumber, ayahNumber) => {
    try {
        const response = await postWithAuth('/api/reading-progress', {
            surah_number: surahNumber,
            ayah_number: ayahNumber
        });

        if (!response.ok) {
            throw new Error('Failed to update reading progress');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating reading progress:', error);
        throw error;
    }
};

/**
 * Get user's reading statistics
 * @returns {Promise<Object>} - The reading statistics
 */
export const getReadingStats = async () => {
    try {
        const response = await getWithAuth('/api/reading-progress/stats');

        if (!response.ok) {
            throw new Error('Failed to get reading stats');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting reading stats:', error);
        throw error;
    }
};
