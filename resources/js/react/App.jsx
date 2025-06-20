import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import useAdvancedPerformanceMonitor from './hooks/useAdvancedPerformanceMonitor.js';
import { registerServiceWorker } from './utils/serviceWorkerUtils.js';
import '../../css/app.css';

// Import critical components (loaded immediately)
import SimpleLayout from './components/SimpleLayout';
import LoadingSpinner from './components/LoadingSpinner';
import PageTransition from './components/PageTransition';
import PerformanceDebugPanel from './components/PerformanceDebugPanel';
import SEOHead from './components/SEOHead';
import { preloadCriticalResources } from './utils/seoUtils';

// Lazy load pages for better performance and code splitting
const HomePage = lazy(() => import('./pages/SimpleHomePage'));
const AuthPage = lazy(() => import('./pages/SimpleAuthPage'));
const SurahPage = lazy(() => import('./pages/SimpleSurahPage'));
const SearchPage = lazy(() => import('./pages/SimpleSearchPage'));
const BookmarksPage = lazy(() => import('./pages/SimpleBookmarksPage'));
const ProfilePage = lazy(() => import('./pages/SimpleProfilePage'));
const AboutPage = lazy(() => import('./pages/SimpleAboutPage'));
const ContactPage = lazy(() => import('./pages/SimpleContactPage'));
const DonationPage = lazy(() => import('./pages/SimpleDonationPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const JuzListPage = lazy(() => import('./pages/SimpleJuzListPage'));
const JuzPage = lazy(() => import('./pages/JuzPage'));
const PageListPage = lazy(() => import('./pages/PageListPage'));
const PageDetailPage = lazy(() => import('./pages/PageDetailPage'));
const PrayerPage = lazy(() => import('./pages/PrayerPage'));
const VersionHistoryPage = lazy(() => import('./pages/VersionHistoryPage'));

// Redirect component for pages with parameters
const PagesRedirect = () => {
    const { number } = useParams();
    return <Navigate to={`/halaman/${number}`} replace />;
};

// Redirect component for search with query parameters
const SearchRedirect = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q');
    const redirectPath = query ? `/cari?q=${encodeURIComponent(query)}` : '/cari';
    return <Navigate to={redirectPath} replace />;
};

// Main app content component with auth-protected routes
function AppContent() {
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
    
    // Derived states for cleaner component logic
    const isAuthenticated = Boolean(user);
    const isLoading = loading || !isInitialized;
    
    // Advanced performance monitoring (disable console logging to reduce noise)
    const { getMetrics, getOptimizationSuggestions } = useAdvancedPerformanceMonitor({
        trackLCP: true,
        trackFID: true,
        trackCLS: true,
        trackTTFB: true,
        logToConsole: false // Disable console logging to reduce noise
    });
    
    // Service Worker registration and performance monitoring
    useEffect(() => {
        // Preload critical SEO resources
        preloadCriticalResources();
        
        // Service Worker Registration with improved error handling
        if (process.env.NODE_ENV === 'development') {
            // In development, register a development-specific service worker
            console.log('Service Worker running in development mode');
            registerServiceWorker('/sw.js', {
                debug: true,
                autoReload: false, // Disabled auto-reload in development too
                onSuccess: (registration) => {
                    console.log('Service Worker registered in development mode:', registration);
                },
                onError: (error) => {
                    console.error('Service Worker registration failed in development:', error);
                }
            });
        } else if (process.env.NODE_ENV === 'production') {
            // Only register full features in production
            registerServiceWorker('/sw.js', {
                debug: true,
                autoReload: false, // Disabled auto-reload to prevent unwanted page refreshes
                onSuccess: (registration) => {
                    console.log('Service Worker registered successfully:', registration);
                },
                onError: (error) => {
                    console.error('Service Worker registration failed:', error);
                },
                onUpdate: (registration) => {
                    console.log('New service worker available');
                    // Removed auto-reload - user can manually refresh if needed
                }
            });
        }
        
        // Performance monitoring in development (disabled to reduce console noise)
        // Performance monitoring is now handled by the PerformanceDebugPanel component
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Performance monitoring available via PerformanceDebugPanel');
        }
    }, [getMetrics, getOptimizationSuggestions]);

    // Legacy setUser function for backward compatibility
    const setUser = useCallback((userData) => {
        if (userData) {
            updateUser(userData);
        } else {
            logout();
        }
    }, [updateUser, logout]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading application...</p>
                </div>
            </div>
        );
    }

    return (
        <SimpleLayout>
            <SEOHead />
            
            <Suspense 
                fallback={
                    <PageTransition isLoading={true}>
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner size="lg" />
                        </div>
                    </PageTransition>
                }
            >
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/surah/:number" element={<SurahPage user={user} />} />
                    <Route path="/surah/:number/:ayahNumber" element={<SurahPage user={user} />} />
                    <Route path="/cari" element={<SearchPage />} />
                    <Route path="/juz" element={<JuzListPage />} />
                    <Route path="/juz/:number" element={<JuzPage />} />
                    <Route path="/halaman" element={<PageListPage />} />
                    <Route path="/halaman/:number" element={<PageDetailPage />} />
                    <Route path="/doa-bersama" element={<PrayerPage />} />
                    <Route path="/tentang" element={<AboutPage />} />
                    <Route path="/kontak" element={<ContactPage />} />
                    <Route path="/donasi" element={<DonationPage />} />
                    <Route path="/kebijakan" element={<PrivacyPage />} />
                    <Route path="/version-history" element={<VersionHistoryPage />} />
                    
                    {/* Backward compatibility redirects */}
                    <Route path="/search" element={<SearchRedirect />} />
                    <Route path="/pages" element={<Navigate to="/halaman" replace />} />
                    <Route path="/pages/:number" element={<PagesRedirect />} />
                    <Route path="/about" element={<Navigate to="/tentang" replace />} />
                    <Route path="/contact" element={<Navigate to="/kontak" replace />} />
                    <Route path="/donation" element={<Navigate to="/donasi" replace />} />
                    <Route path="/privacy" element={<Navigate to="/kebijakan" replace />} />
                    
                    {/* Protected Routes */}
                    <Route 
                        path="/bookmarks" 
                        element={
                            isAuthenticated ? <BookmarksPage user={user} /> : <Navigate to="/auth/login" replace />
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            isAuthenticated ? <ProfilePage user={user} setUser={setUser} /> : <Navigate to="/auth/login" replace />
                        } 
                    />
                    
                    {/* Auth Routes */}
                    <Route 
                        path="/auth/:action" 
                        element={
                            isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
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
        </SimpleLayout>
    );
}

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
