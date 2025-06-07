import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { getApiUrl } from './utils/api';
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
import Footer from './components/Footer';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Check if user is logged in
        fetch(getApiUrl('/api/user'))
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
                <Navbar user={user} setUser={setUser} />
                
                <main className="flex-grow container mx-auto px-4 py-8 pt-24 pb-32 relative max-w-6xl">
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
