import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.jsx';

export default function GoogleSignInButton({ 
    text = 'continue_with', // 'signin_with' | 'signup_with' | 'continue_with'
    theme = 'outline',      // 'outline' | 'filled_blue' | 'filled_black'
    size = 'large',         // 'small' | 'medium' | 'large'
    width,
    onSuccess,
    onError
}) {
    const { loginWithGoogle, isAuthenticated } = useAuth();
    const buttonContainerRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) return;

        const clientId = window.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId || clientId.includes('xxxxxxxxx')) return;

        let isMounted = true;
        let retryInterval = null;

        const renderGoogleButton = () => {
            if (!window.google?.accounts?.id || !buttonContainerRef.current) {
                return false;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response) => {
                        if (!isMounted) return;

                        if (response?.credential) {
                            const loadingToast = toast.loading('Memproses login Google...');
                            const result = await loginWithGoogle(response.credential);
                            toast.dismiss(loadingToast);

                            if (result.success) {
                                toast.success(`Selamat datang, ${result.user.name || 'Pengguna'}!`);
                                if (typeof onSuccess === 'function') {
                                    onSuccess(result.user);
                                }
                            } else {
                                toast.error(result.error || 'Login Google gagal');
                                if (typeof onError === 'function') {
                                    onError(result.error);
                                }
                            }
                        }
                    },
                    auto_select: false,
                    itp_support: true,
                });

                // Clear previous button content before re-rendering
                if (buttonContainerRef.current) {
                    buttonContainerRef.current.innerHTML = '';
                    window.google.accounts.id.renderButton(buttonContainerRef.current, {
                        type: 'standard',
                        theme,
                        size,
                        text,
                        shape: 'rectangular',
                        logo_alignment: 'left',
                        width: width || (buttonContainerRef.current.parentElement?.offsetWidth ? Math.min(buttonContainerRef.current.parentElement.offsetWidth, 400) : 340),
                    });
                }

                return true;
            } catch (err) {
                console.error('Error rendering Google button:', err);
                return false;
            }
        };

        if (!renderGoogleButton()) {
            let attempts = 0;
            retryInterval = setInterval(() => {
                attempts++;
                if (renderGoogleButton() || attempts > 20) {
                    clearInterval(retryInterval);
                }
            }, 400);
        }

        return () => {
            isMounted = false;
            if (retryInterval) clearInterval(retryInterval);
        };
    }, [isAuthenticated, text, theme, size, width, loginWithGoogle, onSuccess, onError]);

    if (isAuthenticated) return null;

    return (
        <div className="w-full flex justify-center my-3">
            <div ref={buttonContainerRef} className="google-btn-wrapper w-full flex justify-center" />
        </div>
    );
}
