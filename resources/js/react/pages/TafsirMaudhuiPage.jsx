import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpenIcon, 
    MagnifyingGlassIcon,
    AcademicCapIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronRightIcon,
    FolderIcon,
    FolderOpenIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';

// Tree Node Component
function TreeNode({ topic, index, isExpanded, onToggle, level = 0 }) {
    const indentStyle = {
        paddingLeft: `${level * 20 + 12}px`
    };

    return (
        <div className="select-none">
            {/* Topic Header */}
            <div 
                className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                style={indentStyle}
                onClick={onToggle}
            >
                <div className="flex items-center min-w-0 flex-1">
                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0 mr-2">
                        {topic.verses?.length > 0 ? (
                            isExpanded ? (
                                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                            )
                        ) : (
                            <div className="w-4 h-4" />
                        )}
                    </div>
                    
                    {/* Folder/Document Icon */}
                    <div className="flex-shrink-0 mr-2">
                        {topic.verses?.length > 0 ? (
                            isExpanded ? (
                                <FolderOpenIcon className="w-4 h-4 text-blue-600" />
                            ) : (
                                <FolderIcon className="w-4 h-4 text-blue-600" />
                            )
                        ) : (
                            <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    
                    {/* Topic Name */}
                    <span className="font-medium text-gray-900 truncate mr-2">
                        {topic.topic}
                    </span>
                    
                    {/* Verse Count Badge */}
                    {topic.verses?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 flex-shrink-0">
                            {topic.verses.length} ayat
                        </span>
                    )}
                </div>
            </div>
            
            {/* Topic Description */}
            {isExpanded && (
                <div className="ml-8 mb-2" style={{ paddingLeft: `${level * 20}px` }}>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {topic.description}
                        </p>
                    </div>
                    
                    {/* Verses List */}
                    {topic.verses?.length > 0 && (
                        <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Ayat-ayat ({topic.verses.length})
                            </div>
                            <div className="pl-4 border-l-2 border-gray-200 space-y-1">
                                {topic.verses.map((verse, verseIndex) => (
                                    <VerseNode 
                                        key={verseIndex}
                                        verse={verse}
                                        level={level + 1}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Letter Group Component
function LetterGroup({ letter, topics, expandedTopics, toggleExpanded, expandedGroups, toggleGroupExpanded }) {
    const isGroupExpanded = expandedGroups.has(letter);
    
    return (
        <div className="mb-4">
            {/* Letter Group Header */}
            <div 
                className="flex items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg cursor-pointer group hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                onClick={() => toggleGroupExpanded(letter)}
            >
                <div className="flex items-center flex-1">
                    {/* Group Expand/Collapse Icon */}
                    <div className="flex-shrink-0 mr-3">
                        {isGroupExpanded ? (
                            <ChevronDownIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                            <ChevronRightIcon className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                    
                    {/* Letter Icon */}
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 shadow-sm">
                        {letter}
                    </div>
                    
                    {/* Group Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                            Huruf {letter}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {topics.length} topik
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Group Content */}
            {isGroupExpanded && (
                <div className="mt-3 ml-4 space-y-1 border-l-2 border-blue-100 pl-4">
                    {topics.map((topic, topicIndex) => {
                        // Calculate the real index for this topic in the filteredTopics array
                        const globalIndex = `${letter}-${topicIndex}`;
                        
                        return (
                            <TreeNode
                                key={globalIndex}
                                topic={topic}
                                index={globalIndex}
                                isExpanded={expandedTopics.has(globalIndex)}
                                onToggle={() => toggleExpanded(globalIndex)}
                                level={1}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Verse Node Component
function VerseNode({ verse, level = 0 }) {
    const indentStyle = {
        paddingLeft: `${level * 12}px`
    };

    return (
        <Link 
            to={`/surah/${verse.surah}/${verse.ayah}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center py-1.5 px-3 rounded-md hover:bg-blue-50 group transition-colors"
            style={indentStyle}
        >
            <DocumentTextIcon className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                Surah {verse.surah}, Ayat {verse.ayah}
            </span>
            <ChevronRightIcon className="w-3 h-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

function TafsirMaudhuiPage() {
    const [tafsirData, setTafsirData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [expandedTopics, setExpandedTopics] = useState(new Set());
    const [expandedGroups, setExpandedGroups] = useState(new Set());

    // Fetch tafsir data
    useEffect(() => {
        const fetchTafsirData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/tafsir-maudhui');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch tafsir data');
                }
                
                const data = await response.json();
                setTafsirData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching tafsir data:', err);
                setError('Gagal memuat data tafsir maudhui');
            } finally {
                setLoading(false);
            }
        };

        fetchTafsirData();
    }, []);

    // Filter and group topics based on search keyword
    const { filteredTopics, groupedTopics } = useMemo(() => {
        if (!tafsirData?.topics) return { filteredTopics: [], groupedTopics: {} };
        
        let topics = tafsirData.topics;
        
        if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase();
            topics = topics.filter(topic => 
                topic.topic.toLowerCase().includes(keyword) || 
                topic.description.toLowerCase().includes(keyword)
            );
        }
        
        // Sort topics alphabetically by topic name (ascending A-Z)
        const sortedTopics = topics.sort((a, b) => a.topic.localeCompare(b.topic, 'id', { sensitivity: 'base' }));
        
        // Group topics by first letter
        const grouped = {};
        sortedTopics.forEach(topic => {
            const firstLetter = topic.topic.charAt(0).toUpperCase();
            if (!grouped[firstLetter]) {
                grouped[firstLetter] = [];
            }
            grouped[firstLetter].push(topic);
        });
        
        return { 
            filteredTopics: sortedTopics, 
            groupedTopics: grouped 
        };
    }, [tafsirData, searchKeyword]);

    // Toggle expanded state for a topic
    const toggleExpanded = (index) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTopics(newExpanded);
    };

    // Toggle expanded state for a letter group
    const toggleGroupExpanded = (letter) => {
        const newExpandedGroups = new Set(expandedGroups);
        if (newExpandedGroups.has(letter)) {
            newExpandedGroups.delete(letter);
        } else {
            newExpandedGroups.add(letter);
        }
        setExpandedGroups(newExpandedGroups);
    };

    // Toggle all groups
    const toggleAllGroups = () => {
        const allLetters = Object.keys(groupedTopics);
        const allGroupsExpanded = allLetters.every(letter => expandedGroups.has(letter));
        
        if (allGroupsExpanded) {
            // If all groups are expanded, collapse them and all topics
            setExpandedGroups(new Set());
            setExpandedTopics(new Set());
        } else {
            // If not all groups are expanded, expand them all
            setExpandedGroups(new Set(allLetters));
        }
    };

    // Toggle all topics
    const toggleAllTopics = () => {
        const allLetters = Object.keys(groupedTopics);
        const allTopicIndices = [];
        Object.entries(groupedTopics).forEach(([letter, topics]) => {
            topics.forEach((_, topicIndex) => {
                allTopicIndices.push(`${letter}-${topicIndex}`);
            });
        });
        
        const allTopicsExpanded = allTopicIndices.every(index => expandedTopics.has(index));
        
        if (allTopicsExpanded) {
            // If all topics are expanded, collapse only topics (keep groups open)
            setExpandedTopics(new Set());
        } else {
            // If not all topics are expanded, expand groups and all topics
            setExpandedGroups(new Set(allLetters));
            setExpandedTopics(new Set(allTopicIndices));
        }
    };

    // Check if all groups are expanded
    const allGroupsExpanded = Object.keys(groupedTopics).every(letter => expandedGroups.has(letter));
    
    // Check if all topics are expanded
    const allTopicsExpanded = useMemo(() => {
        const allTopicIndices = [];
        Object.entries(groupedTopics).forEach(([letter, topics]) => {
            topics.forEach((_, topicIndex) => {
                allTopicIndices.push(`${letter}-${topicIndex}`);
            });
        });
        return allTopicIndices.length > 0 && allTopicIndices.every(index => expandedTopics.has(index));
    }, [groupedTopics, expandedTopics]);

    // SEO Data
    const seoData = {
        title: 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
        description: 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
        keywords: 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
        canonical: '/tafsir-maudhui'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <SEOHead {...seoData} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <LoadingSpinner message="Memuat data tafsir maudhui..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <SEOHead {...seoData} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">❌ {error}</div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SEOHead {...seoData} />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                <AcademicCapIcon className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Tafsir Maudhui
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Jelajahi topik-topik penting dalam Al-Quran melalui struktur hierarkis yang terorganisir. 
                            Temukan ayat-ayat berdasarkan tema dan pelajari pesan-pesan Al-Quran secara tematik.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Stats */}
                <div className="mb-8 space-y-6">
                    {/* Search Box */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Cari topik..." 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {filteredTopics.length}
                            </div>
                            <div className="text-gray-600">
                                {searchKeyword ? 'Topik Ditemukan' : 'Total Topik'}
                            </div>
                            {searchKeyword && (
                                <div className="text-sm text-gray-500 mt-2">
                                    dari {tafsirData?.topics?.length || 0} total topik
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Topics Tree */}
                {filteredTopics.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FolderOpenIcon className="w-5 h-5 mr-2 text-blue-600" />
                                    Topik-topik Al-Quran
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({Object.keys(groupedTopics).length} grup huruf)
                                    </span>
                                </h2>
                                
                                {/* Expand/Collapse Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleAllGroups}
                                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                                            allGroupsExpanded 
                                                ? 'text-blue-700 bg-blue-100 border-blue-300 hover:bg-blue-200' 
                                                : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                                        }`}
                                    >
                                        {allGroupsExpanded ? (
                                            <>
                                                <ChevronUpIcon className="w-3 h-3 mr-1" />
                                                Tutup Semua Grup
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDownIcon className="w-3 h-3 mr-1" />
                                                Buka Semua Grup
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={toggleAllTopics}
                                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                                            allTopicsExpanded 
                                                ? 'text-green-700 bg-green-100 border-green-300 hover:bg-green-200' 
                                                : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                                        }`}
                                    >
                                        {allTopicsExpanded ? (
                                            <>
                                                <ChevronUpIcon className="w-3 h-3 mr-1" />
                                                Tutup Semua Topik
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDownIcon className="w-3 h-3 mr-1" />
                                                Buka Semua Topik
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(groupedTopics)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([letter, topics]) => (
                                        <LetterGroup
                                            key={letter}
                                            letter={letter}
                                            topics={topics}
                                            expandedTopics={expandedTopics}
                                            toggleExpanded={toggleExpanded}
                                            expandedGroups={expandedGroups}
                                            toggleGroupExpanded={toggleGroupExpanded}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-500">
                            <div className="text-6xl mb-4">🔍</div>
                            <div className="text-xl font-medium mb-2">Tidak ada topik yang ditemukan</div>
                            <div className="text-gray-400">
                                Coba kata kunci lain untuk mencari topik
                            </div>
                            {searchKeyword && (
                                <button 
                                    onClick={() => setSearchKeyword('')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Tampilkan Semua Topik
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Back to top button */}
                {filteredTopics.length > 10 && (
                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Kembali ke Atas
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default TafsirMaudhuiPage;
