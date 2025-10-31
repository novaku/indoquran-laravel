import React, { useState, useCallback, useEffect, Suspense, lazy, memo, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import useAdvancedPerformanceMonitor from './hooks/useAdvancedPerformanceMonitor.js';
import { useIntelligentPreload } from './hooks/usePerformanceOptimization.js';
import useScrollToTop from './hooks/useScrollToTop.js';
import useCanonicalURL from './hooks/useCanonicalURL.js';

// Import performance utilities
import { initializeCSSOptimizations } from './utils/criticalCSS.js';
import { initializeImageOptimizations } from './utils/imageOptimization.jsx';
import { initializeResourcePreloading } from './utils/resourcePreloading.js';

import '../../css/app.css';

// Import critical components (loaded immediately)
import QuranLayout from './components/QuranLayout';
import LoadingSpinner from './components/LoadingSpinner';
import { OptimizedLoadingSpinner } from './components/OptimizedLoadingSpinner';
import OptimizedErrorBoundary from './components/OptimizedErrorBoundary';
import PageTransition from './components/PageTransition';
import PerformanceDebugPanel from './components/PerformanceDebugPanel';
import SEOHead from './components/SEOHead';
import PWAInstallPromotion from './components/PWAInstallPromotion';
import PerformanceOptimizer from './components/PerformanceOptimizer';
import { preloadCriticalResources, getPageSEOData, generateHomeSEOKeywords } from './utils/seoUtils';

// Enhanced lazy loading with aggressive code splitting for minimal initial bundle
const HomePage = lazy(() => 
  import(/* webpackChunkName: "home", webpackPreload: true */ './pages/QuranHomePage')
);

// Core pages (high priority) - preload after main bundle
const AuthPage = lazy(() => 
  import(/* webpackChunkName: "auth" */ './pages/UserAuthPage')
);
const PasswordResetPage = lazy(() => 
  import(/* webpackChunkName: "auth" */ './pages/PasswordResetPage')
);
const NewPasswordPage = lazy(() => 
  import(/* webpackChunkName: "auth" */ './pages/NewPasswordPage')
);
const SurahListPage = lazy(() => 
  import(/* webpackChunkName: "surah-list", webpackPrefetch: true */ './pages/SurahListPage')
);
const SurahPage = lazy(() => 
  import(/* webpackChunkName: "surah" */ './pages/SurahDetailPage')
);
const SearchPage = lazy(() => 
  import(/* webpackChunkName: "search" */ './pages/QuranSearchPage')
);

// User pages (lower priority) - load on demand only
const BookmarksPage = lazy(() => 
  import(/* webpackChunkName: "user-features" */ './pages/UserBookmarksPage')
);
const ProfilePage = lazy(() => 
  import(/* webpackChunkName: "user-features" */ './pages/UserProfilePage')
);
const MemberBenefitsPage = lazy(() => 
  import(/* webpackChunkName: "content-pages" */ './pages/MemberBenefitsPage')
);

// Content pages (lowest priority) - highly deferred
const AboutPage = lazy(() => 
  import(/* webpackChunkName: "content-pages" */ './pages/AboutProjectPage')
);
const ContactPage = lazy(() => 
  import(/* webpackChunkName: "content-pages" */ './pages/ContactSupportPage')
);
const DonationPage = lazy(() => 
  import(/* webpackChunkName: "content-pages" */ './pages/DonationSupportPage')
);
const PrivacyPage = lazy(() => 
  import(/* webpackChunkName: "content-pages" */ './pages/PrivacyPage')
);

// Juz and Page features (grouped for better caching)
const JuzListPage = lazy(() => 
  import(/* webpackChunkName: "juz-pages" */ './pages/JuzIndexPage')
);
const JuzPage = lazy(() => 
  import(/* webpackChunkName: "juz-pages" */ './pages/JuzPage')
);
const PageListPage = lazy(() => 
  import(/* webpackChunkName: "page-features" */ './pages/PageListPage')
);
const PageDetailPage = lazy(() => 
  import(/* webpackChunkName: "page-features" */ './pages/PageDetailPage')
);

// Special features (deferred loading only when needed)
const PrayerPage = lazy(() => 
  import(/* webpackChunkName: "prayer" */ './pages/PrayerPage')
);
const AsmaulHusnaPage = lazy(() => 
  import(/* webpackChunkName: "asmaul-husna" */ './pages/AsmaulHusnaPage')
);
const RiwayatVersiPage = lazy(() => 
  import(/* webpackChunkName: "version-history" */ './pages/RiwayatVersiPage')
);
const TafsirMaudhuiPage = lazy(() => 
  import(/* webpackChunkName: "tafsir" */ './pages/TafsirMaudhuiPage')
);
const SEOLandingPage = lazy(() => 
  import(/* webpackChunkName: "seo-landing" */ './pages/SEOLandingPage')
);

// Article pages
const ArticlesPage = lazy(() => 
  import(/* webpackChunkName: "articles" */ './pages/ArticlesPage')
);
const ArticleDetailPage = lazy(() => 
  import(/* webpackChunkName: "articles" */ './pages/ArticleDetailPage')
);

// Admin pages (separate bundle)
const AdminLoginPage = lazy(() => 
  import(/* webpackChunkName: "admin" */ './pages/AdminLoginPage')
);
const AdminDashboard = lazy(() => 
  import(/* webpackChunkName: "admin" */ './pages/AdminDashboard')
);
const AdminArticlesPage = lazy(() => 
  import(/* webpackChunkName: "admin-articles" */ './pages/AdminArticlesPage')
);
const AdminArticleEditorPage = lazy(() => 
  import(/* webpackChunkName: "admin-articles" */ './pages/AdminArticleEditorPage')
);
const StatistikPage = lazy(() => 
  import(/* webpackChunkName: "stats" */ './pages/StatistikPage')
);

// Enhanced redirect components with performance optimizations
const PagesRedirect = memo(() => {
    const { number } = useParams();
    return <Navigate to={`/halaman/${number}`} replace />;
});

const SearchRedirect = memo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q');
    const redirectPath = query ? `/cari?q=${encodeURIComponent(query)}` : '/cari';
    return <Navigate to={redirectPath} replace />;
});

// Intelligent prefetching with strict conditions to minimize unused JS
const usePrefetchOptimization = () => {
    const { canPreload } = useIntelligentPreload({
        enableRoutePreload: true,
        enableHoverPreloadOption: false // Disable hover preload to reduce unused JS
    });
    
    useEffect(() => {
        if (!canPreload) return;
        
        // Only prefetch critical components with strict conditions
        const prefetchCritical = () => {
            // Check connection quality and data saver preference
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const isSlowConnection = connection && (
                connection.effectiveType === 'slow-2g' || 
                connection.effectiveType === '2g' || 
                connection.saveData ||
                connection.downlink < 1.5
            );
            
            // Skip prefetching on slow connections or low memory devices
            if (isSlowConnection || (navigator.deviceMemory && navigator.deviceMemory < 4)) {
                return;
            }
            
            // Only prefetch most critical pages with intelligent delays
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    // Prefetch only SurahListPage as it's most likely to be visited
                    import(/* webpackChunkName: "surah-list" */ './pages/SurahListPage');
                }, { timeout: 10000 });
            }
        };

        // Aggressive delay to ensure main content is fully loaded first
        if (document.readyState === 'complete') {
            setTimeout(prefetchCritical, 5000);
        } else {
            window.addEventListener('load', () => {
                setTimeout(prefetchCritical, 5000);
            });
        }
    }, [canPreload]);
};

// Main app content component with auth-protected routes
const AppContent = memo(() => {
    const { 
        user, 
        loading, 
        isInitialized,
        login, 
        logout, 
        updateUser, 
        refreshUser, 
        checkAuth 
    } = useAuth();
    
    // Enable intelligent prefetching
    usePrefetchOptimization();
    
    // Auto scroll to top on route changes (except surah detail pages)
    useScrollToTop();
    
    // Ensure canonical URL consistency for SEO
    const { canonicalUrl } = useCanonicalURL();
    
    // Derived states for cleaner component logic - memoized for performance
    const isAuthenticated = useMemo(() => Boolean(user), [user]);
    const isLoading = useMemo(() => loading || !isInitialized, [loading, isInitialized]);
    
    // Advanced performance monitoring (disable console logging to reduce noise)
    const { getMetrics, getOptimizationSuggestions } = useAdvancedPerformanceMonitor({
        trackLCP: true,
        trackFID: true,
        trackCLS: true,
        trackTTFB: true,
        logToConsole: false // Disable console logging to reduce noise
    });
    
    // Optimized initialization for faster FCP/LCP
    useEffect(() => {
        // Prioritize critical CSS and defer everything else
        const initializeCriticalPath = () => {
            // Initialize only critical CSS immediately
            initializeCSSOptimizations();
        };
        
        // Defer all non-critical initialization
        const initializeNonCritical = () => {
            // Check connection quality before loading heavy features
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const isSlowConnection = connection && (
                connection.effectiveType === 'slow-2g' || 
                connection.effectiveType === '2g' || 
                connection.saveData
            );
            
            if (!isSlowConnection) {
                // Initialize resource preloading only on fast connections
                initializeResourcePreloading();
                
                // Initialize image optimizations with delay
                setTimeout(() => {
                    initializeImageOptimizations({
                        enableLazyLoading: true,
                        enableResponsive: true,
                        optimizeFormat: true
                    });
                }, 1000);
                
                // Preload critical SEO resources only if performance budget allows
                setTimeout(() => {
                    preloadCriticalResources();
                }, 2000);
            }
            
            // Performance monitoring only in development
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Performance monitoring available via PerformanceDebugPanel');
            }
        };

        // Execute critical path immediately
        initializeCriticalPath();
        
        // Defer non-critical initialization with longer delays
        if ('requestIdleCallback' in window) {
            requestIdleCallback(initializeNonCritical, { timeout: 5000 });
        } else {
            setTimeout(initializeNonCritical, 1000);
        }
    }, []); // Keep empty dependency array to prevent re-initialization

    // Legacy setUser function for backward compatibility - memoized
    const setUser = useCallback((userData) => {
        if (userData) {
            updateUser(userData);
        } else {
            logout();
        }
    }, [updateUser, logout]);

    // Ultra-optimized loading component for fastest FCP
    const LoadingComponent = useMemo(() => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
        }}>
            <div className="text-center">
                <div 
                    className="rounded-full border-t-2 border-b-2 border-green-600 mx-auto mb-4"
                    style={{
                        width: '3rem',
                        height: '3rem',
                        animation: 'spin 1s linear infinite'
                    }}
                ></div>
                <p className="text-gray-600 text-sm">Loading...</p>
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `
                }} />
            </div>
        </div>
    ), []);

    // Enhanced fallback component with better UX
    const SuspenseFallback = useMemo(() => (
        <PageTransition isLoading={true}>
            <div className="flex justify-center items-center h-64">
                <OptimizedLoadingSpinner size="lg" message="Loading page..." />
            </div>
        </PageTransition>
    ), []);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return LoadingComponent;
    }

    return (
        <OptimizedErrorBoundary maxRetries={3}>
            <QuranLayout>
                <SEOHead 
                    {...getPageSEOData('home')}
                    additionalMeta={[
                        { name: 'application-name', content: 'IndoQuran' },
                        { name: 'apple-mobile-web-app-title', content: 'IndoQuran' },
                        { name: 'apple-mobile-web-app-capable', content: 'yes' },
                        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
                        { name: 'mobile-web-app-capable', content: 'yes' },
                        { name: 'format-detection', content: 'telephone=no' },
                        { name: 'msapplication-TileColor', content: '#2563eb' },
                        { name: 'msapplication-config', content: '/browserconfig.xml' },
                        { name: 'google-site-verification', content: 'your-google-verification-code' },
                        { name: 'google', content: 'notranslate' },
                        { name: 'rating', content: 'General' },
                        { name: 'audience', content: 'all' },
                        { name: 'subject', content: 'Religion, Islam, Al-Quran, Indonesia' },
                        { name: 'language', content: 'Indonesian' },
                        { name: 'revisit-after', content: '1 days' },
                        { name: 'distribution', content: 'global' },
                        { name: 'geo.region', content: 'ID' },
                        { name: 'geo.country', content: 'Indonesia' }
                    ]}
                    structuredData={[
                        {
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "IndoQuran",
                            "alternateName": ["IndoQuran.web.id", "Al-Quran Digital Indonesia"],
                            "url": "https://indoquran.web.id",
                            "description": "Platform Al-Quran Digital terlengkap di Indonesia dengan terjemahan, audio murottal, dan fitur pembelajaran interaktif",
                            "inLanguage": ["id", "ar"],
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": {
                                    "@type": "EntryPoint",
                                    "urlTemplate": "https://indoquran.web.id/cari?q={search_term_string}"
                                },
                                "query-input": "required name=search_term_string"
                            },
                            "publisher": {
                                "@type": "Organization",
                                "name": "IndoQuran",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://indoquran.web.id/android-chrome-512x512.png"
                                }
                            },
                            "mainEntity": {
                                "@type": "Book",
                                "name": "Al-Quran",
                                "alternateName": ["القرآن", "Quran", "Koran"],
                                "author": {
                                    "@type": "Person",
                                    "name": "Allah SWT"
                                },
                                "inLanguage": ["ar"],
                                "numberOfPages": 604,
                                "bookFormat": "EBook",
                                "genre": "Religious Text",
                                "description": "Kitab suci umat Islam yang berisi wahyu Allah SWT"
                            }
                        }
                    ]}
                />
                
                <Suspense fallback={SuspenseFallback}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/surah" element={<SurahListPage />} />
                        <Route path="/surah/:number" element={<SurahPage user={user} />} />
                        <Route path="/surah/:number/:ayahNumber" element={<SurahPage user={user} />} />
                        <Route path="/cari" element={<SearchPage />} />
                        <Route path="/juz" element={<JuzListPage />} />
                        <Route path="/juz/:number" element={<JuzPage />} />
                        <Route path="/halaman" element={<PageListPage />} />
                        <Route path="/halaman/:number" element={<PageDetailPage />} />
                        <Route path="/tafsir-maudhui" element={<TafsirMaudhuiPage />} />
                        <Route path="/asmaul-husna" element={<AsmaulHusnaPage />} />
                        <Route path="/doa-bersama" element={<PrayerPage />} />
                        <Route path="/tentang" element={<AboutPage />} />
                        <Route path="/kontak" element={<ContactPage />} />
                        <Route path="/donasi" element={<DonationPage />} />
                        <Route path="/member" element={<MemberBenefitsPage />} />
                        <Route path="/keuntungan-member" element={<MemberBenefitsPage />} />
                        <Route path="/kebijakan" element={<PrivacyPage />} />
                        <Route path="/riwayat-versi" element={<RiwayatVersiPage />} />
                        <Route path="/surah" element={<SEOLandingPage />} />
                        <Route path="/daftar-lengkap" element={<SEOLandingPage />} />
                        <Route path="/statistik" element={<StatistikPage />} />
                        
                        {/* Article Routes */}
                        <Route path="/artikel" element={<ArticlesPage />} />
                        <Route path="/artikel/:slug" element={<ArticleDetailPage />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/artikel" element={<AdminArticlesPage />} />
                        <Route path="/admin/artikel/baru" element={<AdminArticleEditorPage />} />
                        <Route path="/admin/artikel/edit/:id" element={<AdminArticleEditorPage />} />
                        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                        
                        {/* Backward compatibility redirects */}
                        <Route path="/version-history" element={<Navigate to="/riwayat-versi" replace />} />
                        <Route path="/search" element={<SearchRedirect />} />
                        <Route path="/pages" element={<Navigate to="/halaman" replace />} />
                        <Route path="/pages/:number" element={<PagesRedirect />} />
                        <Route path="/about" element={<Navigate to="/tentang" replace />} />
                        <Route path="/contact" element={<Navigate to="/kontak" replace />} />
                        <Route path="/donation" element={<Navigate to="/donasi" replace />} />
                        <Route path="/privacy" element={<Navigate to="/kebijakan" replace />} />
                        <Route path="/bookmark" element={<Navigate to="/penanda" replace />} />
                        <Route path="/profile" element={<Navigate to="/profil" replace />} />
                        <Route path="/auth/login" element={<Navigate to="/masuk" replace />} />
                        <Route path="/auth/register" element={<Navigate to="/daftar" replace />} />
                        <Route path="/auth/:action" element={<Navigate to="/masuk" replace />} />
                        
                        {/* Protected Routes */}
                        <Route 
                            path="/penanda" 
                            element={
                                isAuthenticated ? <BookmarksPage user={user} /> : <Navigate to="/masuk" replace />
                            } 
                        />
                        <Route 
                            path="/profil" 
                            element={
                                isAuthenticated ? <ProfilePage user={user} setUser={setUser} /> : <Navigate to="/masuk" replace />
                            } 
                        />
                        
                        {/* Auth Routes */}
                        <Route 
                            path="/masuk" 
                            element={
                                isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
                            } 
                        />
                        <Route 
                            path="/daftar" 
                            element={
                                isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
                            } 
                        />
                        <Route 
                            path="/reset-password" 
                            element={
                                isAuthenticated ? <Navigate to="/" replace /> : <PasswordResetPage />
                            } 
                        />
                        <Route 
                            path="/password/reset" 
                            element={
                                isAuthenticated ? <Navigate to="/" replace /> : <NewPasswordPage />
                            } 
                        />
                        
                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
                
                {/* Toast Notifications */}
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#059669',
                                secondary: '#ffffff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#dc2626',
                                secondary: '#ffffff',
                            },
                        },
                    }}
                />
                
                {/* Performance Debug Panel (Development Only) */}
                <PerformanceDebugPanel />
                
                {/* Performance Optimizer - Critical for Core Web Vitals */}
                <PerformanceOptimizer />
                
                {/* PWA Install Promotion - memoized to prevent re-renders */}
                <PWAInstallPromotion strategy="auto" key="pwa-promotion" />
            </QuranLayout>
        </OptimizedErrorBoundary>
    );
});

// Main App component with AuthProvider
function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
