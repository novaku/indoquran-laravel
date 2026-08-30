import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    IoInformationCircleOutline, 
    IoBookOutline, 
    IoVolumeHighOutline, 
    IoSearchOutline,
    IoBookmarkOutline,
    IoPhonePortraitOutline,
    IoHeartOutline,
    IoShieldCheckmarkOutline,
    IoSpeedometerOutline,
    IoGlobeOutline,
    IoPeopleOutline,
    IoCodeSlashOutline
} from 'react-icons/io5';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseHorizontal from '../components/AdSenseHorizontal';

function AboutProjectPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: IoBookOutline,
            title: "114 Surah Lengkap",
            description: "Teks Arab, transliterasi, dan terjemahan Indonesia yang akurat"
        },
        {
            icon: IoVolumeHighOutline,
            title: "Audio Berkualitas Tinggi",
            description: "5 qari pilihan terbaik dunia seperti Husary, Sudais, Alafasy"
        },
        {
            icon: IoSearchOutline,
            title: "Pencarian Canggih",
            description: "Cari berdasarkan terjemahan, nomor ayat, dan kata kunci"
        },
        {
            icon: IoBookmarkOutline,
            title: "Bookmark & Favorit",
            description: "Simpan ayat favorit dengan catatan pribadi"
        },
        {
            icon: IoPhonePortraitOutline,
            title: "Desain Responsif",
            description: "Optimized untuk desktop, tablet, dan mobile"
        },
        {
            icon: IoHeartOutline,
            title: "Doa Bersama",
            description: "Komunitas doa real-time dengan sesama muslim"
        }
    ];

    const techStack = [
        { name: "Laravel 12.x", color: "bg-red-100 text-red-800" },
        { name: "React 19.x", color: "bg-blue-100 text-blue-800" },
        { name: "TailwindCSS 4.x", color: "bg-teal-100 text-teal-800" },
        { name: "PHP 8.2+", color: "bg-purple-100 text-purple-800" }
    ];

    return (
        <>
            <SEOHead 
                title="Tentang IndoQuran - Platform Al-Quran Digital Indonesia"
                description="Pelajari lebih lanjut tentang IndoQuran, platform digital untuk membaca dan mempelajari Al-Quran dengan terjemahan bahasa Indonesia"
            />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white pt-16">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                            <IoInformationCircleOutline className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Tentang IndoQuran
                        </h1>
                        <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
                            Platform Al-Quran Digital Modern untuk Umat Islam Indonesia
                        </p>
                        
                        {/* Decorative Islamic Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform -rotate-12"></div>
                        </div>
                    </div>
                </div>

                {/* Top Billboard Ad (Detik.com Pattern) */}
                <AdSenseLeaderboard maxWidth="max-w-6xl" labelText="IKLAN" />

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    {/* Vision & Mission */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                    <IoHeartOutline className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Visi Kami</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                Menjadi platform Al-Quran digital terdepan di Indonesia yang memudahkan akses 
                                dan pembelajaran Al-Quran dengan teknologi modern, terjemahan akurat, dan 
                                pengalaman pengguna yang luar biasa.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <IoPeopleOutline className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Misi Kami</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                Menyediakan platform yang intuitif, akurat, dan bermanfaat untuk pembelajaran 
                                Al-Quran bagi seluruh umat Islam Indonesia dengan fitur-fitur modern dan 
                                komunitas yang supportif.
                            </p>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Utama</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Platform lengkap dengan berbagai fitur modern untuk meningkatkan pengalaman 
                                membaca dan mempelajari Al-Quran
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* In-Between Break Banner Ad (Detik.com Pattern) */}
                    <div className="w-full my-10">
                        <AdSenseHorizontal 
                            adSlot="1519827772"
                            showLabel={true}
                            labelText="IKLAN REKOMENDASI"
                            minHeight="90px"
                        />
                    </div>

                    {/* Technology Stack */}
                    <div className="mb-16">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                    <IoCodeSlashOutline className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Teknologi Modern</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg mb-6">
                                IndoQuran dikembangkan menggunakan teknologi web terdepan untuk memastikan 
                                performa optimal, keamanan tinggi, dan pengalaman pengguna yang responsif 
                                di semua perangkat.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {techStack.map((tech, index) => (
                                    <span key={index} className={`px-4 py-2 rounded-full text-sm font-medium ${tech.color}`}>
                                        {tech.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Source */}
                    <div className="mb-16">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Sumber Data Terpercaya</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                Teks Al-Quran dan terjemahan yang digunakan dalam aplikasi ini bersumber dari 
                                <span className="font-semibold text-green-600"> Kementerian Agama Republik Indonesia</span>. 
                                Kami berkomitmen untuk menjaga ketepatan dan integritas dari setiap ayat 
                                dan terjemahan yang disajikan dengan standar kualitas tertinggi.
                            </p>
                        </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="mb-16">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 text-center">Mengapa Memilih IndoQuran?</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IoSpeedometerOutline className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Performa Cepat</h3>
                                    <p className="text-green-100">Loading cepat dengan optimasi SEO dan Core Web Vitals</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IoShieldCheckmarkOutline className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Keamanan Tinggi</h3>
                                    <p className="text-green-100">Data pengguna dilindungi dengan enkripsi dan security headers</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IoGlobeOutline className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Akses Global</h3>
                                    <p className="text-green-100">Dapat diakses kapan saja, dimana saja dengan koneksi internet</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="text-center">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
                            <p className="text-gray-700 leading-relaxed text-lg mb-6">
                                Jika Anda memiliki pertanyaan, saran, atau masukan untuk pengembangan IndoQuran, 
                                jangan ragu untuk menghubungi tim kami. Kami selalu terbuka untuk feedback 
                                dan saran perbaikan.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => navigate('/kontak')}
                                    className="bg-green-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                                >
                                    Halaman Kontak
                                </button>
                                <a 
                                    href="mailto:kontak@indoquran.web.id" 
                                    className="bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors duration-300 border border-gray-200"
                                >
                                    kontak@indoquran.web.id
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AboutProjectPage;
