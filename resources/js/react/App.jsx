import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { usePerformanceMonitor } from './hooks/usePerformance.js';
import useAdvancedPerformanceMonitor from './hooks/useAdvancedPerformanceMonitor.js';
import useResourcePreloader from './hooks/useResourcePreloader.js';
import { registerServiceWorker } from './utils/serviceWorkerUtils.js';

// Import critical components (loaded immediately)
import SidebarNavigation from './components/SidebarNavigation';
import Footer from './components/Footer';
import ScrollIndicator from './components/ScrollIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import PageTransition from './components/PageTransition';
import PerformanceDebugPanel from './components/PerformanceDebugPanel';
import SEOHead from './components/SEOHead';
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
const DonationPage = lazy(() => import('./pages/DonationPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const JuzListPage = lazy(() => import('./pages/JuzListPage'));
const JuzPage = lazy(() => import('./pages/JuzPage'));
const PageListPage = lazy(() => import('./pages/PageListPage'));
const PageDetailPage = lazy(() => import('./pages/PageDetailPage'));
const PrayerPage = lazy(() => import('./pages/PrayerPage'));
const VersionHistoryPage = lazy(() => import('./pages/VersionHistoryPage'));

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
    
    // Performance hooks
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
            <div className="min-h-screen flex items-center justify-center bg-[#faf8f2]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green shadow-parchment mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat aplikasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#faf8f2]">
            <SEOHead />
            <ScrollIndicator />
            
            {/* Sidebar Navigation */}
            <SidebarNavigation />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
                <main className="flex-grow container mx-auto px-4 py-8 pb-20 relative z-10 max-w-6xl">
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
                            <Route path="/doa-bersama" element={<PrayerPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/donation" element={<DonationPage />} />
                            <Route path="/privacy" element={<PrivacyPage />} />
                            <Route path="/version-history" element={<VersionHistoryPage />} />
                            
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
            </div>
            
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
