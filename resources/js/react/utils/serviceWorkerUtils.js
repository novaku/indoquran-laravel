/**
 * Service Worker Utilities
 * Helper functions for service worker registration, monitoring, and debugging
 */

/**
 * Register and monitor service worker with advanced error handling
 * @param {string} swPath - Path to the service worker file
 * @param {Object} options - Configuration options
 * @param {boolean} options.debug - Whether to log debug messages
 * @param {boolean} options.autoReload - Whether to automatically reload on updates
 * @param {Function} options.onSuccess - Callback for successful registration
 * @param {Function} options.onError - Callback for registration errors
 * @param {Function} options.onUpdate - Callback when an update is available
 */
export const registerServiceWorker = (swPath = '/sw.js', options = {}) => {
    const {
        debug = false,
        autoReload = true,
        onSuccess = null,
        onError = null,
        onUpdate = null
    } = options;

    if (!('serviceWorker' in navigator)) {
        if (debug) console.log('Service workers are not supported in this browser');
        return;
    }

    // Register the service worker
    navigator.serviceWorker.register(swPath)
        .then(registration => {
            if (debug) console.log('Service Worker registered successfully:', registration);

            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000); // Check for updates every hour

            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker is available, but waiting
                        if (debug) console.log('New service worker available');
                        
                        if (onUpdate) {
                            onUpdate(registration);
                        } else if (autoReload) {
                            // Automatically reload to activate the new service worker
                            window.location.reload();
                        }
                    }
                });
            });

            if (onSuccess) onSuccess(registration);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
            
            // If registration fails, try to clean up and retry
            navigator.serviceWorker.getRegistrations()
                .then(registrations => {
                    registrations.forEach(reg => {
                        if (debug) console.log('Unregistering problematic service worker');
                        reg.unregister();
                    });
                    
                    // After unregistering, try to register again after a delay
                    setTimeout(() => {
                        navigator.serviceWorker.register(swPath)
                            .then(reg => {
                                if (debug) console.log('Service Worker re-registered successfully');
                                if (onSuccess) onSuccess(reg);
                            })
                            .catch(err => {
                                console.error('Service Worker re-registration also failed:', err);
                                if (onError) onError(err);
                            });
                    }, 3000);
                });
            
            if (onError) onError(error);
        });

    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (debug) console.log('Service Worker updated, controller changed');
        if (autoReload) {
            if (debug) console.log('Reloading page to activate new service worker');
            window.location.reload();
        }
    });
};

/**
 * Update an existing service worker immediately
 * @returns {Promise} - Resolves when update is complete
 */
export const updateServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('Service workers are not supported in this browser');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        return { success: true, message: 'Service worker update check initiated' };
    } catch (error) {
        console.error('Failed to update service worker:', error);
        return { success: false, error };
    }
};

/**
 * Unregister all service workers and clear caches
 * @returns {Promise} - Resolves when cleanup is complete
 */
export const unregisterServiceWorkers = async () => {
    if (!('serviceWorker' in navigator)) {
        return { success: false, message: 'Service workers not supported' };
    }

    try {
        // Unregister all service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
        }

        // Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        }

        return { success: true, message: 'Service workers unregistered and caches cleared' };
    } catch (error) {
        console.error('Failed to clean up service workers:', error);
        return { success: false, error };
    }
};

/**
 * Check service worker status and health
 * @returns {Promise<Object>} - Service worker status information
 */
export const checkServiceWorkerStatus = async () => {
    if (!('serviceWorker' in navigator)) {
        return { supported: false };
    }

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const result = {
            supported: true,
            registered: registrations.length > 0,
            count: registrations.length,
            registrations: registrations.map(reg => ({
                scope: reg.scope,
                active: !!reg.active,
                installing: !!reg.installing,
                waiting: !!reg.waiting,
                updateViaCache: reg.updateViaCache
            }))
        };

        // Check if we have a controller
        result.hasController = !!navigator.serviceWorker.controller;
        
        return result;
    } catch (error) {
        console.error('Failed to check service worker status:', error);
        return { supported: true, error: error.message };
    }
};
