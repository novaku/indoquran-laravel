import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { usePreloader, usePrefetchRoutes, usePerformanceMonitor } from './hooks/usePerformance.js';
import useAdvancedPerformanceMonitor from './hooks/useAdvancedPerformanceMonitor.js';
import useResourcePreloader from './hooks/useResourcePreloader.js';

// Import critical components (loaded immediately)
import Navbar from './components/Navbar';
import Breadcrumb from './components/Breadcrumb';
import Footer from './components/Footer';
import ScrollIndicator from './components/ScrollIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import PageTransition from './components/PageTransition';
import PerformanceDebugPanel from './components/PerformanceDebugPanel';
import SEOHead from './components/SEOHead';
import StructuredData, { generatePageStructuredData } from './components/StructuredData';
import { preloadCriticalResources } from './utils/seoUtils';

// Lazy load pages for better performance and code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const SurahPage = lazy(() => import('./pages/SurahPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const JuzListPage = lazy(() => import('./pages/JuzListPage'));
const JuzPage = lazy(() => import('./pages/JuzPage'));
const PageListPage = lazy(() => import('./pages/PageListPage'));
const PageDetailPage = lazy(() => import('./pages/PageDetailPage'));

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
    
    // Breadcrumbs state
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    
    // Performance hooks - Use only one comprehensive strategy to avoid duplicates
    // usePreloader(); // Disabled to prevent conflicts
    // usePrefetchRoutes(); // Disabled to prevent conflicts
    usePerformanceMonitor();
    
    // Advanced performance monitoring (disable console logging to reduce noise)
    const { getMetrics, getOptimizationSuggestions } = useAdvancedPerformanceMonitor({
        trackLCP: true,
        trackFID: true,
        trackCLS: true,
        trackTTFB: true,
        logToConsole: false // Disable console logging to reduce noise
    });
    
    // Comprehensive resource preloading (includes all functionality from disabled hooks)
    useResourcePreloader({
        enableRoutePreloading: true,
        enableImagePreloading: true,
        enableFontPreloading: true,
        enableApiPreloading: true,
        enableHoverPreloading: true,
        preloadDelay: 1000 // Reduced delay for better performance
    });
    
    // Service Worker registration and performance monitoring
    useEffect(() => {
        // Preload critical SEO resources
        preloadCriticalResources();
        
        // TEMPORARILY DISABLE SERVICE WORKER COMPLETELY IN DEVELOPMENT
        if ('serviceWorker' in navigator) {
            if (process.env.NODE_ENV === 'development') {
                // In development, unregister any existing service workers to prevent conflicts
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                        console.log('Unregistering service worker:', registration);
                        registration.unregister();
                    });
                });
                console.log('Service Worker disabled in development mode');
            } else if (process.env.NODE_ENV === 'production') {
                // Only register in production
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('Service Worker registered successfully:', registration);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            }
        }
        
        // Performance monitoring in development (disabled to reduce console noise)
        // Performance monitoring is now handled by the PerformanceDebugPanel component
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Performance monitoring available via PerformanceDebugPanel');
        }
    }, [getMetrics, getOptimizationSuggestions]);
    
    const handleBreadcrumbsChange = useCallback((newBreadcrumbs) => {
        setBreadcrumbs(newBreadcrumbs);
    }, []);

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
            <div className="min-h-screen flex items-center justify-center bg-[#faf8f2]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green shadow-parchment mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat aplikasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#faf8f2]">
            <SEOHead />
            <ScrollIndicator />
            <Navbar user={user} setUser={setUser} onBreadcrumbsChange={handleBreadcrumbsChange} />
            <Breadcrumb breadcrumbs={breadcrumbs} />
            
            <main className="flex-grow container mx-auto px-4 py-8 pb-20 relative z-10 max-w-6xl" style={{ marginTop: '80px' }}>
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
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/juz" element={<JuzListPage />} />
                        <Route path="/juz/:number" element={<JuzPage />} />
                        <Route path="/pages" element={<PageListPage />} />
                        <Route path="/pages/:number" element={<PageDetailPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        
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
                                isAuthenticated ? <Navigate to="/" replace /> : <AuthPage setUser={setUser} checkAuth={checkAuth} />
                            } 
                        />
                        
                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </main>
            
            
            <Footer />
            
            {/* Performance Debug Panel (Development Only) */}
            <PerformanceDebugPanel />
        </div>
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