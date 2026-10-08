import { useState, useEffect, useCallback } from 'react';
import { getLocalBookmarks, getUserBookmarks } from '../services/BookmarkService';
import { getLocalHaditsBookmarks, getUserHaditsBookmarks } from '../services/HaditsBookmarkService';
import { getWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';
import { useAuth } from './useAuth.jsx';

/**
 * Custom hook to track the number of bookmarked items (Quran Ayahs and Hadits)
 * Reloads the count directly from the server API (/api/penanda/count) when authenticated.
 */
export const useBookmarkCount = () => {
    const { user, isInitialized } = useAuth();

    // Helper to calculate counts directly from local storage for initial instant render
    const getLocalCounts = useCallback(() => {
        const quran = getLocalBookmarks();
        const hadits = getLocalHaditsBookmarks();
        const qCount = Array.isArray(quran) ? quran.length : 0;
        const hCount = Array.isArray(hadits) ? hadits.length : 0;
        return {
            quranCount: qCount,
            haditsCount: hCount,
            totalCount: qCount + hCount
        };
    }, []);

    // Initial state initialized synchronously from local storage for 0ms delay
    const [counts, setCounts] = useState(() => {
        const local = getLocalCounts();
        return {
            quranCount: local.quranCount,
            haditsCount: local.haditsCount,
            totalCount: local.totalCount,
            loading: false
        };
    });

    const refreshCount = useCallback(async () => {
        const token = authUtils.getAuthToken();
        const hasAuth = Boolean(user || (token && localStorage.getItem('is_guest') !== 'true'));

        // If auth is initialized and user is confirmed not logged in, reset badge counts to 0
        if (isInitialized && !user && !token) {
            setCounts({
                quranCount: 0,
                haditsCount: 0,
                totalCount: 0,
                loading: false
            });
            return;
        }

        // If authenticated user is present, call dedicated API endpoint /api/penanda/count
        if (hasAuth) {
            try {
                const response = await getWithAuth('/api/penanda/count');
                if (response.ok) {
                    const result = await response.json();
                    if (result && result.status === 'success' && result.data) {
                        const qCount = Number(result.data.quran_count) || 0;
                        const hCount = Number(result.data.hadits_count) || 0;
                        setCounts({
                            quranCount: qCount,
                            haditsCount: hCount,
                            totalCount: Number(result.data.total) || (qCount + hCount),
                            loading: false
                        });
                        return;
                    }
                }
            } catch (err) {
                console.warn('API /api/penanda/count error, falling back to service:', err);
            }
        }

        // Fallback: fetch using BookmarkService & HaditsBookmarkService
        try {
            const [quranData, haditsData] = await Promise.all([
                getUserBookmarks(),
                getUserHaditsBookmarks()
            ]);

            const qCount = Array.isArray(quranData) ? quranData.length : 0;
            const hCount = Array.isArray(haditsData) ? haditsData.length : 0;

            setCounts({
                quranCount: qCount,
                haditsCount: hCount,
                totalCount: qCount + hCount,
                loading: false
            });
        } catch (error) {
            console.warn('Failed to refresh bookmark count:', error);
            const local = getLocalCounts();
            setCounts({
                quranCount: local.quranCount,
                haditsCount: local.haditsCount,
                totalCount: local.totalCount,
                loading: false
            });
        }
    }, [user, isInitialized, getLocalCounts]);

    useEffect(() => {
        refreshCount();

        // Listen for updates dispatched anywhere across the application
        const handleUpdate = () => {
            refreshCount();
        };

        window.addEventListener('indoquran_bookmarks_updated', handleUpdate);
        window.addEventListener('indoquran_hadits_bookmarks_updated', handleUpdate);
        window.addEventListener('indoquran_auth_changed', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('indoquran_bookmarks_updated', handleUpdate);
            window.removeEventListener('indoquran_hadits_bookmarks_updated', handleUpdate);
            window.removeEventListener('indoquran_auth_changed', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [refreshCount]);

    return {
        quranCount: counts.quranCount,
        haditsCount: counts.haditsCount,
        totalCount: counts.totalCount,
        loading: counts.loading,
        refreshCount
    };
};

export default useBookmarkCount;
