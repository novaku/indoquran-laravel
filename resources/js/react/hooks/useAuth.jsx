// Custom hook for simple authentication management
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { fetchWithAuth, postWithAuth, getWithAuth } from '../utils/apiUtils';

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
            }

            // Check authentication with server
            await checkAuthWithServer();
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

            // If we don't have a token, user is not authenticated
            if (!currentToken) {
                setUser(null);
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
                } else {
                    setUser(null);
                    localStorage.removeItem('auth_token');
                    setToken(null);
                }
            } else {
                setUser(null);
                localStorage.removeItem('auth_token');
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
                }
                
                setUser(data.user);
                
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

    // Logout function
    const logout = useCallback(async () => {
        setLoading(true);

        try {
            // Logout API call with Bearer token
            const response = await postWithAuth('/api/logout');

        } catch (error) {
            // Continue with logout process even if request fails
        } finally {
            // Always clear local data regardless of server response
            localStorage.removeItem('auth_token');
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
        login,
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
