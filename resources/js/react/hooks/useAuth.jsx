// Custom hook for simple authentication management
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { fetchWithAuth, postWithAuth, getWithAuth } from '../utils/apiUtils';
import { clearLocalBookmarks } from '../services/BookmarkService';
import { clearLocalHaditsBookmarks } from '../services/HaditsBookmarkService';

// Create context for auth state
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize authentication
    const initializeAuth = useCallback(async () => {
        setLoading(true);

        try {
            // Check if we have a token in localStorage
            const savedToken = localStorage.getItem('auth_token');
            if (savedToken) {
                setToken(savedToken);
                // Check authentication with server
                await checkAuthWithServer();
            } else {
                // If not logged in, ensure any leftover authenticated user bookmarks from previous sessions are wiped
                const rawBookmarks = localStorage.getItem('indoquran_local_bookmarks');
                const rawHadits = localStorage.getItem('indoquran_hadits_bookmarks');
                let shouldClear = false;
                if (rawBookmarks) {
                    try {
                        const parsed = JSON.parse(rawBookmarks);
                        if (Array.isArray(parsed) && parsed.some(b => b.pivot || b.user_id || (typeof b.id === 'number'))) {
                            shouldClear = true;
                        }
                    } catch (e) {}
                }
                if (rawHadits) {
                    try {
                        const parsedH = JSON.parse(rawHadits);
                        if (Array.isArray(parsedH) && parsedH.some(b => b.user_id || (typeof b.id === 'number' && !b.id.toString().startsWith('local_')))) {
                            shouldClear = true;
                        }
                    } catch (e) {}
                }
                if (shouldClear) {
                    clearLocalBookmarks();
                    clearLocalHaditsBookmarks();
                }
                setUser(null);
                setLoading(false);
                setIsInitialized(true);
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            setUser(null);
            setLoading(false);
            setIsInitialized(true);
        }
    }, []);

    // Check authentication with server
    const checkAuthWithServer = useCallback(async () => {
        try {
            // Get the current token or the one from localStorage
            const currentToken = token || localStorage.getItem('auth_token');

            // If we don't have a token, check if admin session exists in localStorage
            if (!currentToken) {
                const adminUser = localStorage.getItem('admin_user');
                if (adminUser) {
                    try {
                        const parsed = JSON.parse(adminUser);
                        if (parsed && (parsed.is_admin || parsed.id)) {
                            setUser({ ...parsed, is_admin: true });
                            setLoading(false);
                            setIsInitialized(true);
                            return;
                        }
                    } catch (e) {
                        console.error('Error parsing admin_user in useAuth:', e);
                    }
                }
                setUser(null);
                setLoading(false);
                setIsInitialized(true);
                return;
            }

            // API call with Bearer token with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await getWithAuth('/api/user', {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const userData = await response.json();
                
                // Check if we have valid user data
                if (userData && typeof userData === 'object' && userData.id) {
                    setUser(userData);
                    localStorage.removeItem('is_guest');
                    if (userData.is_admin) {
                        localStorage.setItem('admin_user', JSON.stringify(userData));
                    }
                    window.dispatchEvent(new Event('indoquran_auth_changed'));
                    window.dispatchEvent(new Event('indoquran_bookmarks_updated'));
                    window.dispatchEvent(new Event('indoquran_hadits_bookmarks_updated'));
                } else {
                    setUser(null);
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('is_guest');
                    clearLocalBookmarks();
                    clearLocalHaditsBookmarks();
                    setToken(null);
                }
            } else {
                // If API token check fails, check if admin_user exists before clearing
                const adminUser = localStorage.getItem('admin_user');
                if (adminUser) {
                    try {
                        const parsed = JSON.parse(adminUser);
                        if (parsed && (parsed.is_admin || parsed.id)) {
                            setUser({ ...parsed, is_admin: true });
                            setLoading(false);
                            setIsInitialized(true);
                            return;
                        }
                    } catch (e) {}
                }
                setUser(null);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('is_guest');
                clearLocalBookmarks();
                clearLocalHaditsBookmarks();
                setToken(null);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Auth check timed out');
            } else {
                console.error('Auth check failed:', error);
            }
            setUser(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('is_guest');
            clearLocalBookmarks();
            clearLocalHaditsBookmarks();
            setToken(null);
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    }, [token]);

    // Login function
    const login = useCallback(async (credentials, isRegister = false) => {
        setLoading(true);

        try {
            // Attempt login/register with simple API call
            const url = isRegister ? '/api/register' : '/api/login';
            const response = await postWithAuth(url, credentials);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `${isRegister ? 'Registration' : 'Login'} failed`);
            }

            if (data.user && data.user.id) {
                // Store token in state and localStorage if it's provided
                if (data.token) {
                    setToken(data.token);
                    localStorage.setItem('auth_token', data.token);
                    localStorage.removeItem('is_guest');
                }
                
                // If user has admin privilege, sync to admin_user in localStorage
                if (data.user.is_admin) {
                    localStorage.setItem('admin_user', JSON.stringify(data.user));
                }
                
                setUser(data.user);

                // Notify all components that user session & bookmarks are updated
                window.dispatchEvent(new Event('indoquran_auth_changed'));
                window.dispatchEvent(new Event('indoquran_bookmarks_updated'));
                window.dispatchEvent(new Event('indoquran_hadits_bookmarks_updated'));
                
                return { success: true, user: data.user, message: data.message };
            } else {
                throw new Error('Login successful but user data not returned');
            }

        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                errors: error.errors || {}
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Login with Google (credential ID token)
    const loginWithGoogle = useCallback(async (credential) => {
        setLoading(true);

        try {
            const response = await postWithAuth('/api/auth/google/one-tap', { credential });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login dengan Google gagal');
            }

            if (data.user && data.user.id) {
                if (data.token) {
                    setToken(data.token);
                    localStorage.setItem('auth_token', data.token);
                    localStorage.removeItem('is_guest');
                }
                
                if (data.user.is_admin) {
                    localStorage.setItem('admin_user', JSON.stringify(data.user));
                }

                setUser(data.user);

                // Notify all components that user session & bookmarks are updated
                window.dispatchEvent(new Event('indoquran_auth_changed'));
                window.dispatchEvent(new Event('indoquran_bookmarks_updated'));
                window.dispatchEvent(new Event('indoquran_hadits_bookmarks_updated'));

                return { success: true, user: data.user, message: data.message };
            } else {
                throw new Error('Login berhasil tetapi data pengguna tidak diterima');
            }
        } catch (error) {
            console.error('Google login error:', error);
            return {
                success: false,
                error: error.message || 'Autentikasi Google gagal',
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        setLoading(true);

        try {
            // Logout API call with Bearer token
            await postWithAuth('/api/logout');
        } catch (error) {
            // Continue with logout process even if request fails
        } finally {
            // Always clear all user data upon logout
            localStorage.removeItem('auth_token');
            localStorage.removeItem('admin_user');
            localStorage.removeItem('is_guest');
            localStorage.removeItem('indoquran_khatam_tracker_v2');
            localStorage.removeItem('asmaul-husna-favorites');
            
            // Clear local cached bookmarks and reading history
            clearLocalBookmarks();
            clearLocalHaditsBookmarks();

            // Dispatch update events to immediately reset counters and UI
            window.dispatchEvent(new CustomEvent('indoquran_khatam_updated', { detail: null }));
            window.dispatchEvent(new Event('indoquran_auth_changed'));

            setToken(null);
            setUser(null);
            setLoading(false);
        }
        
        return true; // Always return true since we clear local data regardless
    }, [token]);

    // Update user data
    const updateUser = useCallback(async (updatedUserData) => {
        try {
            setUser(updatedUserData);
        } catch (error) {
            // Handle error silently
        }
    }, []);

    // Refresh user data from server
    const refreshUser = useCallback(async () => {
        await checkAuthWithServer();
    }, [checkAuthWithServer]);

    // Initialize on mount
    useEffect(() => {
        if (!isInitialized) {
            initializeAuth();
            
            // Safety fallback - force initialization after 15 seconds
            const fallbackTimeout = setTimeout(() => {
                if (!isInitialized) {
                    console.warn('Auth initialization timed out, forcing completion');
                    setLoading(false);
                    setIsInitialized(true);
                }
            }, 15000);

            return () => clearTimeout(fallbackTimeout);
        }
    }, [initializeAuth, isInitialized]);

    // Values to be provided by the context
    const value = {
        user,
        token,
        loading,
        isInitialized,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user && user.is_admin),
        login,
        loginWithGoogle,
        logout,
        updateUser,
        refreshUser,
        checkAuth: checkAuthWithServer
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
