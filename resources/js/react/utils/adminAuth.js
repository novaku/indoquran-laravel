import { clearLocalBookmarks } from '../services/BookmarkService';
import { clearLocalHaditsBookmarks } from '../services/HaditsBookmarkService';

export const logoutAdmin = async () => {
    try {
        // 1. Get CSRF token
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const csrfRes = await fetch('/admin/csrf-token', {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json', 
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                credentials: 'same-origin'
            });
            if (csrfRes.ok) {
                const data = await csrfRes.json();
                csrfToken = data.csrf_token || csrfToken;
            }
        } catch (e) {
            console.warn('Could not refresh CSRF token before logout:', e);
        }

        // 2. Call backend logout endpoints to properly invalidate Laravel web session
        await Promise.allSettled([
            fetch('/admin/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'same-origin'
            }),
            fetch('/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'same-origin'
            })
        ]);
    } catch (error) {
        console.warn('Server logout error:', error);
    } finally {
        // 3. Always clear client storage regardless of server response
        localStorage.removeItem('admin_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_guest');
        localStorage.removeItem('indoquran_khatam_tracker_v2');
        localStorage.removeItem('asmaul-husna-favorites');
        clearLocalBookmarks();
        clearLocalHaditsBookmarks();
        window.dispatchEvent(new CustomEvent('indoquran_khatam_updated', { detail: null }));
        window.dispatchEvent(new Event('indoquran_auth_changed'));
        sessionStorage.clear();
    }
};
