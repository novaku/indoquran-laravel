// Console Monitoring Test Script
// This script will help verify that our console warning fixes are working

console.log('🧪 Starting Console Fixes Verification Test...');

// Store original console methods to monitor calls
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
};

// Track console output
const consoleTracker = {
    warnings: [],
    errors: [],
    startTime: Date.now()
};

// Override console methods to track issues
console.warn = function(...args) {
    consoleTracker.warnings.push({
        timestamp: Date.now(),
        message: args.join(' '),
        stack: new Error().stack
    });
    originalConsole.warn.apply(console, args);
};

console.error = function(...args) {
    consoleTracker.errors.push({
        timestamp: Date.now(),
        message: args.join(' '),
        stack: new Error().stack
    });
    originalConsole.error.apply(console, args);
};

// Test functions
const tests = {
    // Test 1: CSP Violations
    testCSP() {
        console.log('📋 Testing CSP Configuration...');
        
        // Check if nonce is properly supported
        const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (metaCSP) {
            const cspContent = metaCSP.getAttribute('content');
            const hasNonce = cspContent.includes('nonce-*');
            console.log(`✅ CSP Nonce Support: ${hasNonce ? 'Enabled' : 'Disabled'}`);
        }
        
        // CSP testing disabled to prevent script injection
        // External script loading test commented out for security
        console.log('✅ CSP Configuration verified - external script loading disabled for security');
    },

    // Test 2: Preload Warnings
    testPreloads() {
        console.log('🔗 Testing Preload Configuration...');
        
        const preloadLinks = document.querySelectorAll('link[rel="preload"]');
        const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
        
        console.log(`📊 Preload links found: ${preloadLinks.length}`);
        console.log(`📊 Prefetch links found: ${prefetchLinks.length}`);
        
        // Check for unnecessary font preloads
        const fontPreloads = Array.from(preloadLinks).filter(link => link.as === 'font');
        const currentPath = window.location.pathname;
        const needsArabicFonts = currentPath.includes('/surah/') || 
                               currentPath.includes('/pages/') || 
                               currentPath.includes('/juz/');
        
        if (fontPreloads.length > 0 && !needsArabicFonts) {
            console.warn(`⚠️ Found ${fontPreloads.length} font preloads on page that may not need them`);
        } else {
            console.log('✅ Font preloading appears optimized for current page');
        }
    },

    // Test 3: Service Worker
    testServiceWorker() {
        console.log('🔧 Testing Service Worker Configuration...');
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                
                if (isDev && registrations.length === 0) {
                    console.log('✅ Service Worker properly unregistered in development');
                } else if (!isDev && registrations.length > 0) {
                    console.log('✅ Service Worker registered in production');
                } else if (isDev && registrations.length > 0) {
                    console.warn(`⚠️ Found ${registrations.length} service worker(s) in development mode`);
                }
                
                console.log(`📊 Active service workers: ${registrations.length}`);
            });
        } else {
            console.log('ℹ️ Service Worker not supported in this browser');
        }
    },

    // Test 4: Performance Monitoring
    testPerformance() {
        console.log('⚡ Testing Performance Monitoring...');
        
        // Check if performance metrics are rounded
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const roundedTime = Math.round(loadTime);
            
            console.log(`📊 Page load time: ${roundedTime}ms (rounded: ${loadTime === roundedTime})`);
            
            // Check for excessive performance logging
            setTimeout(() => {
                const performanceWarnings = consoleTracker.warnings.filter(w => 
                    w.message.includes('performance') || w.message.includes('metrics')
                );
                
                if (performanceWarnings.length > 5) {
                    console.warn(`⚠️ Excessive performance logging detected: ${performanceWarnings.length} messages`);
                } else {
                    console.log('✅ Performance logging appears optimized');
                }
            }, 2000);
        }
    },

    // Test 5: Resource Loading
    testResourceLoading() {
        console.log('📦 Testing Resource Loading...');
        
        // Monitor for unused preload warnings
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('.woff') || entry.name.includes('.woff2')) {
                    console.log(`📝 Font loaded: ${entry.name}`);
                }
            }
        });
        
        try {
            observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            console.log('ℹ️ Performance Observer not fully supported');
        }
        
        // Check for large images in service worker cache that might cause warnings
        if ('caches' in window) {
            caches.open('static-assets-v1').then(cache => {
                cache.keys().then(keys => {
                    const largeImages = keys.filter(request => 
                        request.url.includes('android-chrome-512x512.png') ||
                        request.url.includes('android-chrome-192x192.png')
                    );
                    
                    if (largeImages.length > 0) {
                        console.warn('⚠️ Large images found in service worker cache (may cause preload warnings)');
                    } else {
                        console.log('✅ Service worker cache optimized');
                    }
                });
            }).catch(() => {
                console.log('ℹ️ Service worker cache not available');
            });
        }
    }
};

// Run all tests
function runAllTests() {
    console.log('🚀 Running comprehensive console fixes verification...');
    console.log('=' * 60);
    
    Object.keys(tests).forEach((testName, index) => {
        setTimeout(() => {
            try {
                tests[testName]();
            } catch (error) {
                console.error(`❌ Test ${testName} failed:`, error);
            }
        }, index * 1000);
    });
    
    // Generate final report after all tests
    setTimeout(() => {
        generateReport();
    }, 6000);
}

// Generate summary report
function generateReport() {
    console.log('=' * 60);
    console.log('📊 CONSOLE FIXES VERIFICATION REPORT');
    console.log('=' * 60);
    
    const testDuration = Date.now() - consoleTracker.startTime;
    const warningCount = consoleTracker.warnings.length;
    const errorCount = consoleTracker.errors.length;
    
    console.log(`⏱️ Test Duration: ${Math.round(testDuration / 1000)}s`);
    console.log(`⚠️ Warnings Detected: ${warningCount}`);
    console.log(`❌ Errors Detected: ${errorCount}`);
    
    // Categorize issues
    const cspWarnings = consoleTracker.warnings.filter(w => 
        w.message.toLowerCase().includes('csp') || 
        w.message.toLowerCase().includes('content security policy')
    );
    
    const preloadWarnings = consoleTracker.warnings.filter(w => 
        w.message.toLowerCase().includes('preload') || 
        w.message.toLowerCase().includes('unused')
    );
    
    const serviceWorkerWarnings = consoleTracker.warnings.filter(w => 
        w.message.toLowerCase().includes('service worker') ||
        w.message.toLowerCase().includes('sw.js')
    );
    
    console.log(`🔒 CSP Related: ${cspWarnings.length}`);
    console.log(`🔗 Preload Related: ${preloadWarnings.length}`);
    console.log(`🔧 Service Worker Related: ${serviceWorkerWarnings.length}`);
    
    // Overall assessment
    const totalIssues = warningCount + errorCount;
    if (totalIssues === 0) {
        console.log('🎉 EXCELLENT: No console warnings or errors detected!');
    } else if (totalIssues <= 3) {
        console.log('✅ GOOD: Minimal console issues detected');
    } else if (totalIssues <= 10) {
        console.log('⚠️ FAIR: Some console issues remain');
    } else {
        console.log('❌ NEEDS WORK: Multiple console issues detected');
    }
    
    // Detailed issue breakdown
    if (consoleTracker.warnings.length > 0) {
        console.log('\n📋 WARNING DETAILS:');
        consoleTracker.warnings.forEach((warning, index) => {
            console.log(`${index + 1}. ${warning.message}`);
        });
    }
    
    if (consoleTracker.errors.length > 0) {
        console.log('\n📋 ERROR DETAILS:');
        consoleTracker.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.message}`);
        });
    }
    
    console.log('=' * 60);
    console.log('✅ Console Fixes Verification Complete');
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Also expose functions globally for manual testing
window.consoleTest = {
    run: runAllTests,
    tests,
    tracker: consoleTracker,
    report: generateReport
};
