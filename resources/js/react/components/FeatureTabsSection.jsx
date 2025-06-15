import React from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpenIcon,
    MagnifyingGlassIcon,
    BookmarkIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    HeartIcon,
    DocumentTextIcon,
    AdjustmentsHorizontalIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import TabGroup from './TabGroup';

const FeatureTabsSection = ({ className = '' }) => {
    // Define tabs for the homepage
    const featureTabs = [
        { 
            label: 'Al-Quran', 
            icon: <BookOpenIcon className="h-5 w-5" />
        },
        { 
            label: 'Pencarian', 
            icon: <MagnifyingGlassIcon className="h-5 w-5" />
        },
        { 
            label: 'Penanda', 
            icon: <BookmarkIcon className="h-5 w-5" />
        },
        { 
            label: 'Doa', 
            icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />
        },
        { 
            label: 'Akun', 
            icon: <UserIcon className="h-5 w-5" />
        },
        { 
            label: 'Dukungan', 
            icon: <HeartIcon className="h-5 w-5" />
        }
    ];
    
    // Feature contents for each tab
    const featureContents = [
        // Quran Features
        <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
                title="Penelusuran Surah" 
                description="Jelajahi dan baca seluruh 114 surah Al-Quran dengan teks Arab, terjemahan, dan audio bacaan."
                icon={<BookOpenIcon className="h-6 w-6" />}
                link="/surah/1"
                features={['Teks Arab lengkap', 'Beberapa terjemahan', 'Audio bacaan']}
            />
            <FeatureCard 
                title="Tampilan Juz" 
                description="Akses Al-Quran berdasarkan 30 juz, sempurna untuk membaca dan menghafal secara terstruktur."
                icon={<DocumentTextIcon className="h-6 w-6" />}
                link="/juz"
                features={['Seluruh 30 juz', 'Tampilan terstruktur', 'Mempermudah menghafal']}
            />
            <FeatureCard 
                title="Tampilan Halaman" 
                description="Baca Al-Quran dalam format halaman tradisional, mirip dengan Mushaf cetak."
                icon={<BookOpenIcon className="h-6 w-6" />}
                link="/pages"
                features={['Halaman Mushaf standar', 'Navigasi mudah', 'Penanda halaman']}
            />
        </div>,
        
        // Search Features
        <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
                title="Pencarian Lanjutan" 
                description="Cari seluruh Al-Quran untuk kata, frasa, atau topik dalam bahasa Arab atau terjemahan."
                icon={<MagnifyingGlassIcon className="h-6 w-6" />}
                link="/search"
                features={['Pencarian teks Arab', 'Pencarian terjemahan', 'Hasil cepat']}
                className="md:col-span-2"
            />
            <div className="bg-islamic-green/5 rounded-xl p-6 md:col-span-2">
                <h3 className="font-bold text-islamic-green mb-2">Tips Pencarian</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Gunakan tanda kutip untuk frasa tepat: "bismillah"</li>
                    <li>Cari berdasarkan nomor surah dan ayat: "2:255"</li>
                    <li>Filter dengan kata kunci + surah: "rahmat surah rahman"</li>
                </ul>
            </div>
        </div>,
        
        // Bookmarks Features
        <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
                title="Penanda Tersimpan" 
                description="Simpan ayat-ayat favorit Anda untuk akses cepat dan referensi di masa mendatang."
                icon={<BookmarkIcon className="h-6 w-6" />}
                link="/bookmarks"
                features={['Simpan penanda tanpa batas', 'Organisir berdasarkan surah', 'Akses cepat']}
            />
            <FeatureCard 
                title="Catatan & Refleksi" 
                description="Tambahkan catatan pribadi pada ayat untuk merekam refleksi dan pemahaman Anda."
                icon={<AdjustmentsHorizontalIcon className="h-6 w-6" />}
                link="/bookmarks"
                features={['Catatan pribadi', 'Jurnal refleksi', 'Penyimpanan pribadi']}
            />
        </div>,
        
        // Prayer Features
        <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
                title="Waktu Shalat" 
                description="Dapatkan waktu shalat akurat berdasarkan lokasi dan metode perhitungan yang Anda pilih."
                icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
                link="/doa-bersama"
                features={['Waktu berbasis lokasi', 'Beberapa metode perhitungan', 'Notifikasi']}
            />
            <FeatureCard 
                title="Doa Bersama" 
                description="Bergabunglah dengan dinding doa komunitas untuk berbagi dan membaca doa dari pengguna lain."
                icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
                link="/doa-bersama"
                features={['Kirim doa', 'Berbagi dengan komunitas', 'Dukungan spiritual']}
            />
        </div>,
        
        // Account Features
        <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
                title="Manajemen Profil" 
                description="Kelola profil pribadi, pengaturan, dan preferensi Anda."
                icon={<UserIcon className="h-6 w-6" />}
                link="/profile"
                features={['Perbarui info pribadi', 'Kelola pengaturan', 'Preferensi membaca']}
            />
            <FeatureCard 
                title="Autentikasi" 
                description="Login dan autentikasi yang aman untuk melindungi data dan preferensi Anda."
                icon={<DevicePhoneMobileIcon className="h-6 w-6" />}
                link="/auth/login"
                features={['Login aman', 'Sinkronisasi data', 'Cadangan cloud']}
            />
        </div>,
        
        // Support Features
        <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
                title="Donasi" 
                description="Dukung pengembangan dan pemeliharaan IndoQuran dengan kontribusi Anda yang murah hati."
                icon={<HeartIcon className="h-6 w-6" />}
                link="/donation"
                features={['Dukung pengembangan', 'Bantu pemeliharaan server', 'Aktifkan fitur baru']}
            />
            <FeatureCard 
                title="Hubungi Kami" 
                description="Hubungi tim kami untuk pertanyaan, umpan balik, atau saran."
                icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
                link="/contact"
                features={['Dukungan teknis', 'Pengiriman umpan balik', 'Permintaan fitur']}
            />
        </div>
    ];
    
    return (
        <div className={`bg-white rounded-2xl shadow-md p-8 mb-8 pt-10 ${className}`}>
            <h2 className="text-2xl font-bold text-islamic-green mb-8">Fitur &amp; Sumber Daya</h2>
            <TabGroup tabs={featureTabs} className="mb-4">
                {featureContents.map((content, index) => (
                    <div key={index} className="py-4">
                        {content}
                    </div>
                ))}
            </TabGroup>
        </div>
    );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon, link, features, className = '' }) => {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}>
            <div className="p-6">
                <div className="flex items-start mb-4">
                    <div className="bg-islamic-green/10 rounded-full p-3 mr-4">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{description}</p>
                    </div>
                </div>
                
                {features && features.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fitur</h4>
                        <ul className="space-y-1">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-700">
                                    <svg className="h-3.5 w-3.5 text-islamic-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="mt-5">
                    <Link 
                        to={link} 
                        className="inline-flex items-center text-islamic-green hover:text-islamic-gold font-medium text-sm transition-colors"
                    >
                        Jelajahi Fitur
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FeatureTabsSection;
