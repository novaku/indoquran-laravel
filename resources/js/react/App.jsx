import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

// Import components
import Navbar from './components/Navbar';
import Breadcrumb from './components/Breadcrumb';
import Footer from './components/Footer';
import ScrollIndicator from './components/ScrollIndicator';

// Import pages
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SurahPage from './pages/SurahPage';
import SearchPage from './pages/SearchPage';
import BookmarksPage from './pages/BookmarksPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import HeaderDemoPage from './pages/HeaderDemoPage';

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
            <ScrollIndicator />
            <Navbar user={user} setUser={setUser} onBreadcrumbsChange={handleBreadcrumbsChange} />
            <Breadcrumb breadcrumbs={breadcrumbs} />
            
            <main className="flex-grow container mx-auto px-4 py-8 pb-20 relative z-10 max-w-6xl" style={{ marginTop: '80px' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/surah/:number" element={<SurahPage user={user} />} />
                    <Route path="/surah/:number/:ayahNumber" element={<SurahPage user={user} />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/header-demo" element={<HeaderDemoPage />} />
                    
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
            </main>
            
            
            <Footer />
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