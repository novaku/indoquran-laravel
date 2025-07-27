import React from 'react';
import { CheckCircleIcon, CogIcon, BugAntIcon, SparklesIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';

function RiwayatVersiPage() {
    const versions = [
        {
            version: "2.3.0",
            date: "27 Juli 2025",
            type: "major",
            title: "Halaman Asmaul Husna & Peningkatan Konten Islami",
            description: "Update mayor dengan penambahan halaman Asmaul Husna lengkap yang menampilkan 99 nama indah Allah SWT dengan fitur interaktif dan peningkatan konten islami.",
            changes: [
                {
                    type: "feature",
                    text: "Halaman Asmaul Husna lengkap dengan 99 nama indah Allah SWT"
                },
                {
                    type: "feature",
                    text: "Audio pronunciation menggunakan Web Speech API untuk pelafalan nama Allah"
                },
                {
                    type: "feature",
                    text: "Sistem favorit dengan penyimpanan lokal untuk nama Allah pilihan"
                },
                {
                    type: "feature",
                    text: "Fitur pencarian real-time berdasarkan nama Latin, makna Indonesia, dan teks Arab"
                },
                {
                    type: "feature",
                    text: "Copy to clipboard untuk kemudahan berbagi nama Allah"
                },
                {
                    type: "feature",
                    text: "Doa Asmaul Husna lengkap dengan teks Arab dan terjemahan"
                },
                {
                    type: "feature",
                    text: "Penjelasan detail setiap nama Allah dengan makna yang mudah dipahami"
                },
                {
                    type: "improvement",
                    text: "Navigasi terintegrasi di header dropdown dan homepage quick navigation"
                },
                {
                    type: "improvement",
                    text: "Typography Arabic yang authentic dengan font Amiri dan calligraphy features"
                },
                {
                    type: "improvement",
                    text: "SEO optimization khusus dengan structured data untuk halaman Asmaul Husna"
                },
                {
                    type: "improvement",
                    text: "Responsive design optimal untuk semua perangkat dengan lazy loading"
                },
                {
                    type: "improvement",
                    text: "Social media integration dengan preview images yang optimal"
                }
            ]
        },
        {
            version: "2.2.0",
            date: "18 Juli 2025",
            type: "major",
            title: "PWA Enhancement & Mobile Performance Optimization",
            description: "Update mayor dengan implementasi Progressive Web App (PWA) lengkap dan optimisasi performa mobile yang signifikan untuk pengalaman seperti aplikasi native.",
            changes: [
                {
                    type: "feature",
                    text: "Progressive Web App (PWA) lengkap dengan dukungan instalasi di home screen"
                },
                {
                    type: "feature",
                    text: "Service Worker canggih dengan caching offline-first untuk akses tanpa internet"
                },
                {
                    type: "feature",
                    text: "Smart installation prompt dengan deteksi platform (Android, iOS, Desktop)"
                },
                {
                    type: "feature",
                    text: "App shortcuts untuk akses cepat ke Quran, Jadwal Sholat, Pencarian, dan Bookmark"
                },
                {
                    type: "feature",
                    text: "Halaman offline yang interaktif dengan fitur-fitur yang masih dapat digunakan"
                },
                {
                    type: "feature",
                    text: "Background sync untuk sinkronisasi bookmark dan riwayat saat kembali online"
                },
                {
                    type: "feature",
                    text: "Push notification support untuk reminder jadwal sholat"
                },
                {
                    type: "improvement",
                    text: "Peningkatan skor mobile PageSpeed dari 53 menjadi 85-90 dengan optimisasi rendering"
                },
                {
                    type: "improvement",
                    text: "Implementasi critical CSS untuk First Contentful Paint yang lebih cepat"
                },
                {
                    type: "improvement",
                    text: "Enhanced browser caching dengan GZIP compression dan cache-control headers"
                },
                {
                    type: "improvement",
                    text: "Optimisasi font loading dengan font-display: swap untuk mencegah FOUT"
                },
                {
                    type: "improvement",
                    text: "Code splitting dan lazy loading untuk bundle size yang lebih optimal"
                },
                {
                    type: "improvement",
                    text: "Image optimization pipeline dengan WebP conversion dan responsive loading"
                },
                {
                    type: "improvement",
                    text: "Web Vitals monitoring untuk tracking performa real-time"
                },
                {
                    type: "security",
                    text: "Enhanced Content Security Policy (CSP) dan security headers"
                },
                {
                    type: "security",
                    text: "Anti-injection protection untuk mencegah script injection malicious"
                }
            ]
        },
        {
            version: "2.1.4",
            date: "10 Juli 2025",
            type: "patch",
            title: "Peningkatan Performa & Perbaikan Navigasi",
            description: "Pembaruan dengan fokus pada peningkatan performa aplikasi dan perbaikan sistem navigasi untuk pengalaman pengguna yang lebih baik.",
            changes: [
                {
                    type: "improvement",
                    text: "Optimisasi rendering komponen React untuk mempercepat loading halaman"
                },
                {
                    type: "improvement",
                    text: "Implementasi caching yang lebih efisien untuk data Al-Quran"
                },
                {
                    type: "fix",
                    text: "Perbaikan masalah navigasi pada tampilan mobile ketika mengganti surah"
                },
                {
                    type: "fix",
                    text: "Resolusi bug pada fitur pencarian dengan karakter khusus"
                },
                {
                    type: "security",
                    text: "Pembaruan dependensi untuk mengatasi potensi vulnerabilitas keamanan"
                }
            ]
        },
        {
            version: "2.1.3",
            date: "28 Juni 2025",
            type: "minor",
            title: "Fitur Audio Player Auto-Play untuk Ayat",
            description: "Penambahan fitur audio player dengan kemampuan auto-play berturut-turut untuk setiap ayat dalam surah hingga akhir.",
            changes: [
                {
                    type: "feature",
                    text: "Audio player dengan fitur auto-play otomatis untuk setiap ayat dalam surah"
                },
                {
                    type: "feature",
                    text: "Kontrol pemutaran berturut-turut dari ayat pertama hingga akhir surah"
                },
                {
                    type: "feature",
                    text: "Indikator visual ayat yang sedang diputar dengan highlight otomatis"
                },
                {
                    type: "improvement",
                    text: "Optimisasi loading audio untuk pengalaman pemutaran yang lancar"
                },
                {
                    type: "improvement",
                    text: "Kontrol kecepatan pemutaran dan jeda antar ayat yang dapat disesuaikan"
                },
                {
                    type: "fix",
                    text: "Perbaikan sinkronisasi audio dengan tampilan teks ayat"
                }
            ]
        },
        {
            version: "2.1.2",
            date: "25 Juni 2025",
            type: "patch",
            title: "Pemeliharaan & Pembaruan Dokumentasi",
            description: "Pembaruan riwayat versi dan pemeliharaan rutin untuk menjaga kualitas aplikasi.",
            changes: [
                {
                    type: "improvement",
                    text: "Pembaruan dokumentasi riwayat versi dengan perubahan terbaru"
                },
                {
                    type: "improvement",
                    text: "Optimisasi struktur data untuk performa yang lebih baik"
                },
                {
                    type: "fix",
                    text: "Perbaikan minor pada tampilan timeline versi"
                },
                {
                    type: "improvement",
                    text: "Peningkatan metadata SEO untuk halaman riwayat versi"
                }
            ]
        },
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
            case 'major': return 'bg-purple-100 text-purple-900 border-purple-300 font-semibold shadow-sm';
            case 'minor': return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold shadow-sm';
            case 'patch': return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold shadow-sm';
            default: return 'bg-slate-100 text-slate-900 border-slate-300 font-semibold shadow-sm';
        }
    };

    const getChangeIcon = (type) => {
        switch (type) {
            case 'feature': return <SparklesIcon className="w-4 h-4 text-purple-700" />;
            case 'improvement': return <CogIcon className="w-4 h-4 text-indigo-700" />;
            case 'fix': return <BugAntIcon className="w-4 h-4 text-amber-700" />;
            case 'security': return <ShieldCheckIcon className="w-4 h-4 text-orange-700" />;
            default: return <CheckCircleIcon className="w-4 h-4 text-slate-700" />;
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

    const getChangeItemStyle = (type) => {
        switch (type) {
            case 'feature': return 'bg-purple-50 border-l-4 border-purple-400 hover:bg-purple-100';
            case 'improvement': return 'bg-indigo-50 border-l-4 border-indigo-400 hover:bg-indigo-100';
            case 'fix': return 'bg-amber-50 border-l-4 border-amber-400 hover:bg-amber-100';
            case 'security': return 'bg-orange-50 border-l-4 border-orange-400 hover:bg-orange-100';
            default: return 'bg-slate-50 border-l-4 border-slate-400 hover:bg-slate-100';
        }
    };

    const getChangeTypeBadgeStyle = (type) => {
        switch (type) {
            case 'feature': return 'bg-purple-200 text-purple-900 border-purple-300';
            case 'improvement': return 'bg-indigo-200 text-indigo-900 border-indigo-300';
            case 'fix': return 'bg-amber-200 text-amber-900 border-amber-300';
            case 'security': return 'bg-orange-200 text-orange-900 border-orange-300';
            default: return 'bg-slate-200 text-slate-900 border-slate-300';
        }
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Riwayat Versi - IndoQuran",
        "description": "Catatan perubahan dan pembaruan versi platform Al-Quran digital IndoQuran dengan fitur Asmaul Husna dan PWA terbaru",
        "url": `${window.location.origin}/riwayat-versi`,
        "dateModified": "2025-07-27",
        "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "IndoQuran",
            "applicationCategory": "Religious Application",
            "operatingSystem": "Web Browser",
            "softwareVersion": versions[0]?.version,
            "releaseNotes": versions[0]?.description,
            "installUrl": window.location.origin,
            "applicationSubCategory": "Progressive Web App",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
            }
        }
    };

    return (
        <>
            <SEOHead 
                title="Riwayat Versi - IndoQuran"
                description="Catatan lengkap perubahan dan pembaruan versi platform Al-Quran digital IndoQuran. Lihat perkembangan fitur Asmaul Husna, PWA, optimisasi mobile, dan peningkatan dari waktu ke waktu."
                keywords="indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi, indoquran 2.3.0, asmaul husna, 99 nama allah, PWA, progressive web app"
                canonicalUrl={`${window.location.origin}/riwayat-versi`}
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
                    <div className="mt-4 text-sm text-gray-500">
                        Terakhir diperbarui: 27 Juli 2025
                    </div>
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
                                <div className="absolute left-6 top-16 w-1 h-full bg-gradient-to-b from-slate-300 to-slate-200 -z-10 rounded-full"></div>
                            )}
                            
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-slate-300">
                                {/* Version Header */}
                                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-islamic-green to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {version.version.split('.')[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl font-bold text-slate-900">
                                                        Versi {version.version}
                                                    </h3>
                                                    <span className={`px-4 py-2 rounded-full text-sm border-2 ${getVersionBadgeColor(version.type)}`}>
                                                        {version.type.charAt(0).toUpperCase() + version.type.slice(1)}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-semibold text-islamic-green mb-2">
                                                    {version.title}
                                                </h4>
                                                <p className="text-slate-700 leading-relaxed">{version.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-slate-500 text-sm font-medium">Dirilis</div>
                                            <div className="text-lg font-semibold text-slate-900">{version.date}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Changes List */}
                                <div className="p-6">
                                    <h5 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-islamic-green" />
                                        Perubahan & Peningkatan:
                                    </h5>
                                    <div className="space-y-4">
                                        {version.changes.map((change, changeIndex) => (
                                            <div key={changeIndex} className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 ${getChangeItemStyle(change.type)}`}>
                                                <div className="flex-shrink-0 mt-1">
                                                    {getChangeIcon(change.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${getChangeTypeBadgeStyle(change.type)}`}>
                                                            {getChangeTypeText(change.type)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-800 leading-relaxed font-medium">{change.text}</p>
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

export default RiwayatVersiPage;
