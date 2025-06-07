// filepath: /Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/SurahPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoArrowBackOutline, IoArrowForwardOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoChevronDownOutline, IoChevronUpOutline, IoInformationCircleOutline, IoBookmarkOutline, IoBookmark, IoChevronDownSharp, IoLinkOutline, IoCloseOutline } from 'react-icons/io5';
import QuranHeader from '../components/QuranHeader';
import { fetchFootnote } from '../services/FootnoteService';
import { toggleBookmark, getBookmarkStatus } from '../services/BookmarkService';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';

// Debug flag - set to true to enable enhanced logging
const DEBUG = true;

// Debug utility
const debug = (...args) => {
    if (DEBUG) {
        console.log(`[SurahPage]`, ...args);
    }
};

// Render counter to track component render cycles
let renderCount = 0;

// Initialize global cache to prevent refetching between component mounts
if (!window.indoquranCache) {
    window.indoquranCache = {
        surahs: {},
        ayahs: {}
    };
    debug('🏗️ Created global cache for IndoQuran');
}

function SurahPage({ user }) {
    renderCount++;
    debug(`🔄 Component rendering #${renderCount}`);
    
    // Add component lifecycle debugging
    useEffect(() => {
        const instanceId = Math.random().toString(36).substring(2, 9);
        debug(`🟢 [${instanceId}] Component mounted`);
        
        return () => {
            debug(`🔴 [${instanceId}] Component unmounting`);
            renderCount = 0; // Reset render count on unmount
        };
    }, []);

    const { number, ayahNumber } = useParams();
    const navigate = useNavigate();
    const [surah, setSurah] = useState(null);
    const [ayah, setAyah] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ayahLoading, setAyahLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAyahNumber, setSelectedAyahNumber] = useState(1);
    const [totalAyahs, setTotalAyahs] = useState(0);

    // Initialize a cache for surah metadata
    const surahCacheRef = useRef({});
    
    // On mount or when surah number changes, fetch surah metadata and first ayah
    useEffect(() => {
        if (!number) return;
        
        // Initialize necessary states
        setLoading(true);
        setError(null);
        
        // Set initial ayah number from URL parameter or default to 1
        const initialAyahNumber = ayahNumber ? parseInt(ayahNumber) : 1;
        setSelectedAyahNumber(initialAyahNumber);
        
        // Check if we already have the surah data in the cache
        if (surahCacheRef.current[number]) {
            debug(`Using cached data for surah ${number}`);
            setSurah(surahCacheRef.current[number]);
            setTotalAyahs(surahCacheRef.current[number].total_ayahs);
            setLoading(false);
            return;
        }
        
        // Otherwise fetch from API
        debug(`Fetching metadata for surah ${number}`);
        fetch(`/api/surahs/${number}/metadata`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Store in cache for future use
                    surahCacheRef.current[number] = data.data;
                    
                    // Update state
                    setSurah(data.data);
                    setTotalAyahs(data.data.total_ayahs);
                } else {
                    throw new Error(data.message || 'Gagal memuat metadata surah');
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [number]); // Remove ayahNumber from dependencies to prevent excess refetching

    // Cache for loaded ayahs
    const ayahCacheRef = useRef({});
    
    // Fetch ayah when selectedAyahNumber changes
    useEffect(() => {
        if (!number || !selectedAyahNumber) return;
        
        const ayahKey = `${number}-${selectedAyahNumber}`;
        
        // Check if we have this ayah cached
        if (window.indoquranCache.ayahs && window.indoquranCache.ayahs[ayahKey]) {
            debug(`Using cached ayah data for ${ayahKey}`);
            setAyah(window.indoquranCache.ayahs[ayahKey]);
            return;
        }
        
        setAyahLoading(true);
        setError(null);
        
        debug(`Fetching ayah ${ayahKey}`);
        fetch(`/api/ayahs/${number}/${selectedAyahNumber}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Cache the ayah data
                    if (!window.indoquranCache.ayahs) window.indoquranCache.ayahs = {};
                    window.indoquranCache.ayahs[ayahKey] = data.data;
                    
                    setAyah(data.data);
                } else {
                    throw new Error(data.message || 'Gagal memuat ayat');
                }
            })
            .catch(err => {
                debug(`Error loading ayah ${ayahKey}: ${err.message}`);
                setError(err.message);
            })
            .finally(() => setAyahLoading(false));
    }, [number, selectedAyahNumber]);

    // Update URL when selectedAyahNumber changes
    useEffect(() => {
        if (!number || !surah) return;
        // Only update URL if the ayahNumber in URL is different from selectedAyahNumber
        const currentAyahNum = parseInt(ayahNumber);
        if (!isNaN(currentAyahNum) && currentAyahNum !== selectedAyahNumber) {
            navigate(`/surah/${number}/${selectedAyahNumber}`, { replace: true });
        }
    }, [selectedAyahNumber, number, surah, ayahNumber, navigate]);

    // Handler for ayah button click
    const handleAyahClick = (ayahNum) => {
        if (ayahNum !== selectedAyahNumber) {
            setSelectedAyahNumber(ayahNum);
        }
    };

    // Handler for prev/next buttons
    const handlePrevAyah = () => {
        if (selectedAyahNumber > 1) {
            setSelectedAyahNumber(selectedAyahNumber - 1);
        }
    };
    const handleNextAyah = () => {
        if (selectedAyahNumber < totalAyahs) {
            setSelectedAyahNumber(selectedAyahNumber + 1);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
    }
    if (error || !surah) {
        return <div className="bg-accent-50 text-accent-700 p-4 rounded-lg shadow-lg" role="alert"><strong className="font-bold">Kesalahan! </strong><span className="block sm:inline">{error || 'Surah tidak ditemukan'}</span></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-green-800 mb-2">{surah.name_latin} <span className="text-gray-500 font-normal">({surah.name_arabic})</span></h2>
                        <div className="text-gray-600 text-sm mb-1">{surah.name_indonesian} • {surah.revelation_place} • {surah.total_ayahs} ayat</div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center mb-8">
                    {ayahLoading ? (
                        <div className="flex justify-center items-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            <span className="ml-2 text-gray-600">Memuat ayat...</span>
                        </div>
                    ) : ayah ? (
                        <div>
                            <div id="arabic-text" className="text-3xl md:text-4xl font-arabic text-right leading-loose mb-4">{ayah.text_arabic}</div>
                            <div className="text-lg text-gray-800 mb-2">{ayah.translation_id}</div>
                            <div className="text-sm text-gray-500 mb-2">{ayah.translation_en}</div>
                            <div className="flex justify-center gap-2 mt-4">
                                <button onClick={handlePrevAyah} disabled={selectedAyahNumber <= 1} className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium disabled:opacity-50">Sebelumnya</button>
                                <button onClick={handleNextAyah} disabled={selectedAyahNumber >= totalAyahs} className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium disabled:opacity-50">Selanjutnya</button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500">Pilih ayat untuk ditampilkan</div>
                    )}
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daftar Ayat</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Array.from({ length: totalAyahs }, (_, idx) => (
                            <button
                                key={idx+1}
                                onClick={() => handleAyahClick(idx+1)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium border ${selectedAyahNumber === idx+1 ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
                            >
                                {idx+1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SurahPage;
