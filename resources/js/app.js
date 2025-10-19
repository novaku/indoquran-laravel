import './bootstrap';
import Alpine from 'alpinejs';

window.Alpine = Alpine;
Alpine.start();

// Initialize Core Web Vitals reporting for Google Search Console
// Reference: https://support.google.com/webmasters/answer/9205520
if (typeof window !== 'undefined') {
    // Load Core Web Vitals reporter
    import('./react/utils/coreWebVitalsReporter').then(({ initCoreWebVitalsReporting }) => {
        // Initialize with Google Analytics reporting
        initCoreWebVitalsReporting({
            sendToGA: true,        // Send to Google Analytics 4
            sendToCustom: true,    // Send to custom endpoint for storage
            reportAllChanges: false // Only report final values (recommended)
        });
        
        console.log('[IndoQuran] Core Web Vitals monitoring initialized');
    }).catch(error => {
        console.warn('[IndoQuran] Failed to initialize Core Web Vitals:', error);
    });
}
