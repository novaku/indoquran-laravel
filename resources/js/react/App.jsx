import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SurahPage from './pages/SurahPage';
import SearchPage from './pages/SearchPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import Navbar from './components/Navbar';
import Breadcrumb from './components/Breadcrumb';
import Footer from './components/Footer';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    
    const handleBreadcrumbsChange = React.useCallback((newBreadcrumbs) => {
        setBreadcrumbs(newBreadcrumbs);
    }, []);
    
    useEffect(() => {
        // Check if user is logged in
        fetch('/api/user')
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Tidak memiliki akses');
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);
    
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-[#faf8f2]">
                <Navbar user={user} setUser={setUser} onBreadcrumbsChange={handleBreadcrumbsChange} />
                <Breadcrumb breadcrumbs={breadcrumbs} />
                
                <main className="flex-grow container mx-auto px-4 py-8 pb-32 relative z-10 max-w-6xl" style={{ marginTop: '112px' }}>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green shadow-parchment"></div>
                        </div>
                    ) : (
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/surah/:number" element={<SurahPage user={user} />} />
                            <Route path="/surah/:number/:ayahNumber" element={<SurahPage user={user} />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/bookmarks" element={<BookmarksPage user={user} />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/privacy" element={<PrivacyPage />} />
                            <Route path="/auth/:action" element={<AuthPage setUser={setUser} />} />
                            <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
                        </Routes>
                    )}
                </main>
                
                <Footer />
            </div>
        </Router>
    );
}

export default App;
