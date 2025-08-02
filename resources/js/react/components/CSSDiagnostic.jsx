import React, { useState, useEffect } from 'react';

/**
 * CSS Diagnostic Component
 * This component helps diagnose CSS loading issues in the IndoQuran application
 */
const CSSDiagnostic = () => {
    const [diagnostics, setDiagnostics] = useState({
        tailwindLoaded: false,
        customCSSLoaded: false,
        fontsLoaded: false,
        viteAssetsLoaded: false,
        criticalCSSLoaded: false
    });

    const [testResults, setTestResults] = useState([]);

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = () => {
        const results = [];
        
        // Test 1: Check if Tailwind CSS is working
        const testTailwind = () => {
            const testEl = document.createElement('div');
            testEl.className = 'bg-blue-500 text-white p-4 hidden';
            document.body.appendChild(testEl);
            
            const styles = window.getComputedStyle(testEl);
            const hasBlueBg = styles.backgroundColor === 'rgb(59, 130, 246)' || 
                              styles.backgroundColor === 'rgb(37, 99, 235)';
            const isHidden = styles.display === 'none';
            const hasPadding = parseFloat(styles.paddingTop) > 0;
            
            document.body.removeChild(testEl);
            
            const passed = hasBlueBg && isHidden && hasPadding;
            results.push({
                name: 'Tailwind CSS',
                passed,
                details: `Background: ${styles.backgroundColor}, Display: ${styles.display}, Padding: ${styles.paddingTop}`
            });
            
            return passed;
        };

        // Test 2: Check if custom CSS variables are available
        const testCustomCSS = () => {
            const rootStyles = window.getComputedStyle(document.documentElement);
            const islamicGreen = rootStyles.getPropertyValue('--islamic-green').trim();
            const primaryColor = rootStyles.getPropertyValue('--primary-500').trim();
            
            const passed = islamicGreen !== '' || primaryColor !== '';
            results.push({
                name: 'Custom CSS Variables',
                passed,
                details: `Islamic Green: ${islamicGreen || 'Not found'}, Primary 500: ${primaryColor || 'Not found'}`
            });
            
            return passed;
        };

        // Test 3: Check if Arabic fonts are loaded
        const testFonts = () => {
            const testEl = document.createElement('div');
            testEl.className = 'font-arabic';
            testEl.style.opacity = '0';
            testEl.style.position = 'absolute';
            testEl.textContent = 'Arabic Text Test';
            document.body.appendChild(testEl);
            
            const styles = window.getComputedStyle(testEl);
            const fontFamily = styles.fontFamily.toLowerCase();
            const hasArabicFont = fontFamily.includes('arabic-font') || 
                                  fontFamily.includes('scheherazade') || 
                                  fontFamily.includes('amiri') ||
                                  fontFamily.includes('alquran-indopak');
            
            document.body.removeChild(testEl);
            
            results.push({
                name: 'Arabic Fonts',
                passed: hasArabicFont,
                details: `Font Family: ${fontFamily}`
            });
            
            return hasArabicFont;
        };

        // Test 4: Check if Vite assets are loaded
        const testViteAssets = () => {
            const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            const viteCSSFound = stylesheets.some(link => 
                link.href.includes('/build/assets/') && link.href.includes('.css')
            );
            
            const manifestScript = document.querySelector('script[type="module"]');
            const viteManifest = manifestScript && manifestScript.src.includes('/build/');
            
            const passed = viteCSSFound || viteManifest;
            results.push({
                name: 'Vite Assets',
                passed,
                details: `CSS Links: ${stylesheets.length}, Vite CSS: ${viteCSSFound}, Manifest: ${!!viteManifest}`
            });
            
            return passed;
        };

        // Test 5: Check critical CSS utilities
        const testCriticalCSS = () => {
            const testEl = document.createElement('div');
            testEl.className = 'flex items-center justify-center min-h-screen';
            testEl.style.opacity = '0';
            testEl.style.position = 'absolute';
            document.body.appendChild(testEl);
            
            const styles = window.getComputedStyle(testEl);
            const hasFlex = styles.display === 'flex';
            const hasAlignItems = styles.alignItems === 'center';
            const hasJustifyContent = styles.justifyContent === 'center';
            const hasMinHeight = styles.minHeight === '100vh';
            
            document.body.removeChild(testEl);
            
            const passed = hasFlex && hasAlignItems && hasJustifyContent && hasMinHeight;
            results.push({
                name: 'Critical CSS Utilities',
                passed,
                details: `Flex: ${hasFlex}, Align: ${hasAlignItems}, Justify: ${hasJustifyContent}, MinHeight: ${hasMinHeight}`
            });
            
            return passed;
        };

        // Run all tests
        const tailwindLoaded = testTailwind();
        const customCSSLoaded = testCustomCSS();
        const fontsLoaded = testFonts();
        const viteAssetsLoaded = testViteAssets();
        const criticalCSSLoaded = testCriticalCSS();

        setDiagnostics({
            tailwindLoaded,
            customCSSLoaded,
            fontsLoaded,
            viteAssetsLoaded,
            criticalCSSLoaded
        });

        setTestResults(results);
    };

    const getStatusIcon = (passed) => {
        return passed ? '✅' : '❌';
    };

    const getStatusColor = (passed) => {
        return passed ? 'text-green-600' : 'text-red-600';
    };

    const allTestsPassed = Object.values(diagnostics).every(test => test);

    return (
        <div className="fixed bottom-4 right-4 max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                    CSS Diagnostics
                </h3>
                <button
                    onClick={runDiagnostics}
                    className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                    Rerun Tests
                </button>
            </div>
            
            <div className="space-y-2 text-sm">
                {testResults.map((test, index) => (
                    <div key={index} className="flex items-start space-x-2">
                        <span className="text-lg">{getStatusIcon(test.passed)}</span>
                        <div className="flex-1">
                            <div className={`font-medium ${getStatusColor(test.passed)}`}>
                                {test.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {test.details}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className={`text-sm font-medium ${allTestsPassed ? 'text-green-600' : 'text-orange-600'}`}>
                    {allTestsPassed ? 
                        '🎉 All CSS systems are working!' : 
                        '⚠️ Some CSS issues detected'
                    }
                </div>
                {!allTestsPassed && (
                    <div className="text-xs text-gray-500 mt-1">
                        Check the failing tests above for details.
                    </div>
                )}
            </div>

            {/* Test visual elements */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Visual Tests:</div>
                
                {/* Tailwind test */}
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs mb-1">
                    Tailwind Blue Background
                </div>
                
                {/* Arabic font test */}
                <div className="font-arabic text-right text-lg mb-1">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </div>
                
                {/* Custom CSS test */}
                <div className="surah-card text-xs p-2">
                    Custom Surah Card Style
                </div>
            </div>
        </div>
    );
};

export default CSSDiagnostic;
