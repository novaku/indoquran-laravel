import React from 'react';
import { CheckCircleIcon, CogIcon, BugAntIcon, SparklesIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';

function VersionHistoryPage() {
    const versions = [
        {
            version: "2.1.1",
            date: "16 Juni 2025",
            type: "patch",
            title: "Peningkatan UI Navigasi & Mobile Experience",
            description: "Perbaikan antarmuka navigasi dan peningkatan pengalaman mobile untuk kemudahan akses.",
            changes: [
                {
                    type: "improvement",
                    text: "Peningkatan kontras teks pada menu aktif sidebar untuk keterbacaan yang lebih baik"
                },
                {
                    type: "improvement", 
                    text: "Penambahan smooth scrolling pada navigasi mobile dengan momentum scrolling iOS"
                },
                {
                    type: "improvement",
                    text: "Optimisasi responsivitas sidebar untuk berbagai ukuran perangkat mobile"
                },
                {
                    type: "fix",
                    text: "Perbaikan overflow handling pada menu navigasi mobile"
                }
            ]
        },
        {
            version: "2.1.0",
            date: "16 Juni 2025",
            type: "major",
            title: "Peningkatan Performa & Fitur Doa Bersama",
            description: "Update besar dengan optimisasi performa dan penambahan fitur doa bersama yang interaktif.",
            changes: [
                {
                    type: "feature",
                    text: "Fitur Doa Bersama dengan jadwal shalat real-time berdasarkan lokasi"
                },
                {
                    type: "feature", 
                    text: "Widget running text untuk pengumuman dan hadits harian"
                },
                {
                    type: "improvement",
                    text: "Optimisasi loading page dengan lazy loading dan code splitting"
                },
                {
                    type: "improvement",
                    text: "Peningkatan SEO dengan structured data dan meta tags dinamis"
                },
                {
                    type: "fix",
                    text: "Perbaikan routing untuk asset files (vendor JS)"
                },
                {
                    type: "security",
                    text: "Implementasi CORS yang lebih aman untuk API"
                }
            ]
        },
        {
            version: "2.0.5",
            date: "10 Juni 2025",
            type: "patch",
            title: "Perbaikan Bug & Stabilitas",
            description: "Fokus pada perbaikan bug dan peningkatan stabilitas aplikasi.",
            changes: [
                {
                    type: "fix",
                    text: "Perbaikan masalah geolokasi pada fitur jadwal shalat"
                },
                {
                    type: "fix",
                    text: "Resolusi konflik MIME type pada asset JavaScript"
                },
                {
                    type: "improvement",
                    text: "Peningkatan handling error pada API calls"
                },
                {
                    type: "improvement",
                    text: "Optimisasi font loading untuk Arabic text"
                }
            ]
        },
        {
            version: "2.0.0",
            date: "1 Juni 2025",
            type: "major",
            title: "Arsitektur Baru dengan React & Modern UI",
            description: "Rebuild complete dengan teknologi modern, UI/UX yang diperbaharui, dan performa yang jauh lebih baik.",
            changes: [
                {
                    type: "feature",
                    text: "Migrasi ke React dengan Single Page Application (SPA)"
                },
                {
                    type: "feature",
                    text: "Redesign UI dengan Tailwind CSS yang modern dan responsive"
                },
                {
                    type: "feature",
                    text: "Sistem autentikasi yang diperbaharui dengan JWT"
                },
                {
                    type: "feature",
                    text: "Progressive Web App (PWA) support untuk pengalaman native"
                },
                {
                    type: "feature",
                    text: "Advanced search dengan highlight dan filter"
                },
                {
                    type: "feature",
                    text: "Bookmark system yang lebih powerful"
                },
                {
                    type: "improvement",
                    text: "Performa loading yang 3x lebih cepat"
                },
                {
                    type: "improvement",
                    text: "Mobile-first responsive design"
                }
            ]
        },
        {
            version: "1.5.2",
            date: "15 Mei 2025",
            type: "patch",
            title: "Perbaikan Audio & Pencarian",
            description: "Perbaikan pada fitur audio murottal dan sistem pencarian ayat.",
            changes: [
                {
                    type: "fix",
                    text: "Perbaikan audio player yang terkadang tidak responsive"
                },
                {
                    type: "fix",
                    text: "Resolusi masalah pencarian dengan karakter Arab"
                },
                {
                    type: "improvement",
                    text: "Peningkatan kualitas audio murottal"
                }
            ]
        },
        {
            version: "1.5.0",
            date: "1 Mei 2025",
            type: "minor",
            title: "Fitur Juz & Halaman Al-Quran",
            description: "Penambahan navigasi berdasarkan Juz dan halaman mushaf.",
            changes: [
                {
                    type: "feature",
                    text: "Navigasi berdasarkan Juz (30 Juz)"
                },
                {
                    type: "feature",
                    text: "Navigasi berdasarkan halaman mushaf (604 halaman)"
                },
                {
                    type: "improvement",
                    text: "Peningkatan sistem bookmark dengan kategori"
                }
            ]
        },
        {
            version: "1.0.0",
            date: "1 Januari 2025", 
            type: "major",
            title: "Peluncuran Perdana IndoQuran",
            description: "Versi pertama IndoQuran dengan fitur dasar untuk membaca Al-Quran online.",
            changes: [
                {
                    type: "feature",
                    text: "Akses ke seluruh 114 surah Al-Quran"
                },
                {
                    type: "feature",
                    text: "Terjemahan bahasa Indonesia resmi Kemenag"
                },
                {
                    type: "feature",
                    text: "Sistem pencarian dasar"
                },
                {
                    type: "feature",
                    text: "Fitur bookmark sederhana"
                },
                {
                    type: "feature",
                    text: "Audio murottal untuk setiap surah"
                },
                {
                    type: "feature",
                    text: "Responsive design untuk mobile dan desktop"
                }
            ]
        }
    ];

    const getVersionBadgeColor = (type) => {
        switch (type) {
            case 'major': return 'bg-red-100 text-red-800 border-red-200';
            case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'patch': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getChangeIcon = (type) => {
        switch (type) {
            case 'feature': return <SparklesIcon className="w-4 h-4 text-blue-600" />;
            case 'improvement': return <CogIcon className="w-4 h-4 text-green-600" />;
            case 'fix': return <BugAntIcon className="w-4 h-4 text-yellow-600" />;
            case 'security': return <ShieldCheckIcon className="w-4 h-4 text-red-600" />;
            default: return <CheckCircleIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getChangeTypeText = (type) => {
        switch (type) {
            case 'feature': return 'Fitur Baru';
            case 'improvement': return 'Peningkatan';
            case 'fix': return 'Perbaikan Bug';
            case 'security': return 'Keamanan';
            default: return 'Perubahan';
        }
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Riwayat Versi - IndoQuran",
        "description": "Catatan perubahan dan pembaruan versi platform Al-Quran digital IndoQuran",
        "url": `${window.location.origin}/version-history`,
        "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "IndoQuran",
            "applicationCategory": "Religious Application",
            "operatingSystem": "Web Browser",
            "softwareVersion": versions[0]?.version,
            "releaseNotes": versions[0]?.description
        }
    };

    return (
        <>
            <SEOHead 
                title="Riwayat Versi - IndoQuran"
                description="Catatan lengkap perubahan dan pembaruan versi platform Al-Quran digital IndoQuran. Lihat perkembangan fitur, perbaikan, dan peningkatan dari waktu ke waktu."
                keywords="indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi"
                canonicalUrl={`${window.location.origin}/version-history`}
            />
            <StructuredData data={structuredData} />
            
            <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <RocketLaunchIcon className="w-12 h-12 text-islamic-green mr-3" />
                        <h1 className="text-4xl md:text-5xl font-bold text-islamic-green">
                            Riwayat Versi
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Ikuti perjalanan pengembangan IndoQuran dari waktu ke waktu. Setiap pembaruan membawa 
                        perbaikan dan fitur baru untuk memberikan pengalaman terbaik dalam membaca Al-Quran.
                    </p>
                </div>

                {/* Current Version Highlight */}
                <div className="bg-gradient-to-r from-islamic-green to-emerald-600 text-white rounded-2xl p-8 mb-12 shadow-xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl font-bold">Versi Terkini</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                                    {versions[0]?.version}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold mb-2">{versions[0]?.title}</h2>
                            <p className="text-white/90 text-lg">{versions[0]?.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-white/80 text-sm">Dirilis pada</div>
                            <div className="text-xl font-semibold">{versions[0]?.date}</div>
                        </div>
                    </div>
                </div>

                {/* Version Timeline */}
                <div className="space-y-8">
                    {versions.map((version, index) => (
                        <div key={version.version} className="relative">
                            {/* Timeline line */}
                            {index < versions.length - 1 && (
                                <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
                            )}
                            
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                {/* Version Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-islamic-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {version.version.split('.')[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                        Versi {version.version}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getVersionBadgeColor(version.type)}`}>
                                                        {version.type.charAt(0).toUpperCase() + version.type.slice(1)}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-semibold text-islamic-green mb-2">
                                                    {version.title}
                                                </h4>
                                                <p className="text-gray-600">{version.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-gray-500 text-sm">Dirilis</div>
                                            <div className="text-lg font-semibold text-gray-900">{version.date}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Changes List */}
                                <div className="p-6">
                                    <h5 className="text-lg font-semibold text-gray-900 mb-4">Perubahan & Peningkatan:</h5>
                                    <div className="space-y-3">
                                        {version.changes.map((change, changeIndex) => (
                                            <div key={changeIndex} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getChangeIcon(change.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            {getChangeTypeText(change.type)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">{change.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center">
                    <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
                        <h3 className="text-xl font-semibold text-blue-900 mb-3">
                            Komitmen Pengembangan Berkelanjutan
                        </h3>
                        <p className="text-blue-700 leading-relaxed max-w-3xl mx-auto">
                            Kami berkomitmen untuk terus mengembangkan IndoQuran dengan mendengarkan masukan dari pengguna 
                            dan mengikuti perkembangan teknologi terbaru. Setiap pembaruan dirancang untuk memberikan 
                            pengalaman yang lebih baik dalam mempelajari dan membaca Al-Quran.
                        </p>
                        <div className="mt-4">
                            <a 
                                href="/kontak" 
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                            >
                                <span>Berikan Masukan</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VersionHistoryPage;
