import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth.jsx';

/**
 * Hook to initialize and display Google One Tap prompt
 * @param {Object} options - Custom options
 * @param {Function} options.onSuccess - Optional callback on successful login
 */
export function useGoogleOneTap(options = {}) {
    const { isAuthenticated, loading, isInitialized, loginWithGoogle } = useAuth();
    const initializedRef = useRef(false);

    useEffect(() => {
        // Only run when auth is initialized and user is not authenticated
        if (!isInitialized || loading || isAuthenticated) {
            return;
        }

        const clientId = window.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId || clientId.includes('xxxxxxxxx')) {
            return;
        }

        let isMounted = true;
        let retryInterval = null;

        const initOneTap = () => {
            if (!window.google?.accounts?.id) {
                return false;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response) => {
                        if (!isMounted) return;

                        if (response && response.credential) {
                            const loadingToast = toast.loading('Memproses login Google...');
                            const result = await loginWithGoogle(response.credential);
                            toast.dismiss(loadingToast);

                            if (result.success) {
                                toast.success(`Selamat datang, ${result.user.name || 'Pengguna'}!`);
                                if (typeof options.onSuccess === 'function') {
                                    options.onSuccess(result.user);
                                }
                            } else {
                                toast.error(result.error || 'Login Google gagal');
                            }
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    itp_support: true,
                });

                // Display the One Tap prompt
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed()) {
                        // Suppressed by Google (e.g. dismissed recently or unsupported browser)
                        console.debug('Google One Tap not displayed:', notification.getNotDisplayedReason());
                    } else if (notification.isSkippedMoment()) {
                        console.debug('Google One Tap skipped:', notification.getSkippedReason());
                    } else if (notification.isDismissedMoment()) {
                        console.debug('Google One Tap dismissed:', notification.getDismissedReason());
                    }
                });

                initializedRef.current = true;
                return true;
            } catch (err) {
                console.error('Error initializing Google One Tap:', err);
                return false;
            }
        };

        // Try immediately if Google script is already loaded
        if (!initOneTap()) {
            // Otherwise wait for the Google script to load
            let attempts = 0;
            retryInterval = setInterval(() => {
                attempts++;
                if (initOneTap() || attempts > 20) {
                    clearInterval(retryInterval);
                }
            }, 500);
        }

        return () => {
            isMounted = false;
            if (retryInterval) {
                clearInterval(retryInterval);
            }
            if (window.google?.accounts?.id && window.google.accounts.id.cancel) {
                window.google.accounts.id.cancel();
            }
        };
    }, [isAuthenticated, loading, isInitialized, loginWithGoogle, options.onSuccess]);
}

export default useGoogleOneTap;
