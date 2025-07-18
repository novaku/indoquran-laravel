// PWA Registration and Installation Manager for IndoQuran

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.registration = null;
        
        this.init();
    }

    async init() {
        // Check if app is already installed
        this.checkInstallStatus();
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup install prompt listeners
        this.setupInstallPrompt();
        
        // Setup update detection
        this.setupUpdateDetection();
        
        // Setup offline detection
        this.setupOfflineDetection();
    }

    checkInstallStatus() {
        // Check if running in standalone mode
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches 
            || window.navigator.standalone 
            || document.referrer.includes('android-app://');
            
        if (this.isInstalled) {
            document.body.classList.add('pwa-installed');
            console.log('PWA: App is installed and running in standalone mode');
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw-pwa.js', {
                    scope: '/'
                });

                console.log('PWA: Service Worker registered successfully');

                // Listen for updates
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Update available - auto-apply without notification
                            console.log('PWA: Update available, will apply automatically');
                        }
                    });
                });

                // Check for updates periodically
                setInterval(() => {
                    this.registration.update();
                }, 60000); // Check every minute

            } catch (error) {
                console.error('PWA: Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA: Install prompt available');
            
            // Prevent the mini-infobar from appearing
            e.preventDefault();
            
            // Store the event for later use
            this.deferredPrompt = e;
            
            // Dispatch custom event for React components
            window.dispatchEvent(new CustomEvent('pwa-install-available', {
                detail: { prompt: e }
            }));
        });

        // Listen for app installation
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA: App was installed');
            this.isInstalled = true;
            this.deferredPrompt = null;
            
            // Track installation
            if (window.gtag) {
                window.gtag('event', 'pwa_installed', {
                    event_category: 'PWA',
                    event_label: 'App Installed Successfully'
                });
            }
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('pwa-installed'));
        });
    }

    setupUpdateDetection() {
        // Listen for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    setupOfflineDetection() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.showConnectionStatus('online');
            console.log('PWA: Back online');
        });

        window.addEventListener('offline', () => {
            this.showConnectionStatus('offline');
            console.log('PWA: Gone offline');
        });
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('PWA: No install prompt available');
            return false;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();

            // Wait for user response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`PWA: User response to install prompt: ${outcome}`);
            
            // Track user choice
            if (window.gtag) {
                window.gtag('event', 'pwa_install_prompt_response', {
                    event_category: 'PWA',
                    event_label: outcome,
                    value: outcome === 'accepted' ? 1 : 0
                });
            }

            // Clear the prompt
            this.deferredPrompt = null;
            
            return outcome === 'accepted';
            
        } catch (error) {
            console.error('PWA: Error showing install prompt:', error);
            return false;
        }
    }

    applyUpdate() {
        if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    showConnectionStatus(status) {
        // Remove existing status
        const existing = document.querySelector('.pwa-connection-status');
        if (existing) existing.remove();

        const statusBar = document.createElement('div');
        statusBar.className = 'pwa-connection-status';
        statusBar.innerHTML = status === 'online' 
            ? '🟢 Kembali online' 
            : '🔴 Anda sedang offline';
        
        statusBar.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${status === 'online' ? '#22c55e' : '#ef4444'};
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 9998;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation
        if (!document.querySelector('#pwa-connection-animations')) {
            const animationStyle = document.createElement('style');
            animationStyle.id = 'pwa-connection-animations';
            animationStyle.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(animationStyle);
        }

        document.body.appendChild(statusBar);

        // Auto remove after 3 seconds
        setTimeout(() => {
            statusBar.remove();
        }, 3000);
    }

    // Utility methods for React components
    getInstallStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            isOnline: navigator.onLine
        };
    }

    // Background sync registration
    async registerBackgroundSync(tag) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            try {
                await this.registration.sync.register(tag);
                console.log(`PWA: Background sync registered for ${tag}`);
            } catch (error) {
                console.error(`PWA: Background sync registration failed for ${tag}:`, error);
            }
        }
    }

    // Push notification subscription
    async subscribeToPushNotifications() {
        if (!('Notification' in window) || !('PushManager' in window)) {
            console.warn('PWA: Push notifications not supported');
            return null;
        }

        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                const subscription = await this.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(
                        'YOUR_VAPID_PUBLIC_KEY_HERE' // Replace with your VAPID public key
                    )
                });
                
                console.log('PWA: Push notification subscription successful');
                return subscription;
            }
        } catch (error) {
            console.error('PWA: Push notification subscription failed:', error);
        }
        
        return null;
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Initialize PWA Manager
window.pwaManager = new PWAManager();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}
