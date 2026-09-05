import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    IoBookmarkOutline, 
    IoHeartOutline, 
    IoCloudUploadOutline,
    IoStatsChartOutline,
    IoPeopleOutline,
    IoShieldCheckmarkOutline,
    IoNotificationsOutline,
    IoCheckmarkCircle,
    IoStarOutline,
    IoDocumentTextOutline,
    IoTimeOutline,
    IoHandRightOutline
} from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth.jsx';
import SEOHead from '../components/SEOHead';
import { Card, Button, Badge, IconBadge, PageHeader, PageContent } from '../components/ui';
import { scrollToTop } from '../utils/scrollUtils';

function MemberBenefitsPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        scrollToTop();
    }, []);


    const memberBenefits = [
        {
            id: 1,
            icon: IoBookmarkOutline,
            title: "Bookmark & Favorit",
            description: "Simpan ayat-ayat favorit Anda dan akses kapan saja, di mana saja",
            features: [
                "Bookmark ayat tanpa batas",
                "Tandai ayat sebagai favorit",
                "Organisasi yang mudah",
                "Sinkronisasi antar perangkat"
            ],
            color: "from-blue-500 to-blue-600"
        },
        {
            id: 2,
            icon: IoDocumentTextOutline,
            title: "Catatan Pribadi",
            description: "Buat catatan personal untuk setiap ayat yang Anda bookmark",
            features: [
                "Catatan private untuk setiap ayat",
                "Refleksi dan pemahaman pribadi",
                "Mudah diedit dan dikelola",
                "Tersimpan aman di cloud"
            ],
            color: "from-green-500 to-green-600"
        },
        {
            id: 3,
            icon: IoStatsChartOutline,
            title: "Tracking Progress Baca",
            description: "Pantau progres membaca Al-Quran Anda secara real-time",
            features: [
                "Progress per surah dan juz",
                "Statistik harian dan bulanan",
                "Target bacaan personal",
                "Histori aktivitas membaca"
            ],
            color: "from-purple-500 to-purple-600"
        },
        {
            id: 4,
            icon: IoPeopleOutline,
            title: "Komunitas Doa Bersama",
            description: "Bergabung dengan komunitas muslim untuk berdoa bersama",
            features: [
                "Posting permintaan doa",
                "Berikan dukungan (Amin)",
                "Komentar dan motivasi",
                "Interaksi positif sesama muslim"
            ],
            color: "from-teal-500 to-teal-600"
        },
        {
            id: 5,
            icon: IoCloudUploadOutline,
            title: "Sinkronisasi Cloud",
            description: "Data Anda tersimpan aman dan tersinkronisasi di semua perangkat",
            features: [
                "Backup otomatis ke cloud",
                "Akses dari berbagai perangkat",
                "Data aman dan terenkripsi",
                "Tidak akan hilang"
            ],
            color: "from-indigo-500 to-indigo-600"
        },
        {
            id: 6,
            icon: IoShieldCheckmarkOutline,
            title: "Pengalaman Premium",
            description: "Nikmati fitur-fitur eksklusif untuk member terdaftar",
            features: [
                "Interface tanpa iklan",
                "Fitur pencarian advance",
                "Akses prioritas ke fitur baru",
                "Support customer priority"
            ],
            color: "from-orange-500 to-orange-600"
        }
    ];

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/profil');
        } else {
            navigate('/daftar');
        }
    };

    return (
        <>
            <SEOHead 
                title="Keuntungan Menjadi Member - IndoQuran"
                description="Dapatkan akses ke fitur-fitur eksklusif IndoQuran: bookmark ayat, catatan pribadi, tracking progress, komunitas doa, dan masih banyak lagi."
                keywords="member indoquran, fitur premium, bookmark quran, catatan ayat, progress baca quran, komunitas muslim"
            />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                            Keuntungan Menjadi Member IndoQuran
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-6">
                            Dapatkan pengalaman membaca Al-Quran yang lebih personal dan bermakna dengan fitur-fitur eksklusif untuk member terdaftar.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={handleGetStarted}
                                variant="primary"
                                size="md"
                                className="bg-green-600 hover:bg-green-700 text-white shadow-xs cursor-pointer"
                            >
                                {isAuthenticated ? 'Lihat Profil Saya' : 'Daftar Gratis Sekarang'}
                            </Button>
                            <Link to="/tentang">
                                <Button
                                    variant="outline"
                                    size="md"
                                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Pelajari Lebih Lanjut
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Benefits Grid */}
                <div className="py-8 md:py-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Keuntungan Menjadi Member
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Nikmati fitur-fitur eksklusif yang akan memperkaya pengalaman 
                            spiritual Anda dengan Al-Quran
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {memberBenefits.map((benefit) => {
                            const IconComponent = benefit.icon;
                            return (
                                <Card
                                    key={benefit.id}
                                    hoverable
                                    padding="lg"
                                    className="overflow-hidden"
                                    onMouseEnter={() => setHoveredCard(benefit.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className={`h-2 bg-gradient-to-r ${benefit.color} -mt-8 -mx-8 mb-6`}></div>
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${benefit.color} mb-6`}>
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {benefit.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {benefit.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-700">
                                                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="py-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Cara Memulai
                        </h2>
                        <p className="text-xl text-gray-600">
                            Hanya 3 langkah mudah untuk menikmati semua fitur
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center" padding="lg">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 text-2xl font-bold mb-6">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Daftar Gratis</h3>
                            <p className="text-gray-600">
                                Buat akun dengan email Anda. Proses pendaftaran hanya butuh 1 menit.
                            </p>
                        </Card>
                        <Card className="text-center" padding="lg">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold mb-6">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Verifikasi Email</h3>
                            <p className="text-gray-600">
                                Konfirmasi email Anda untuk mengaktifkan semua fitur member.
                            </p>
                        </Card>
                        <Card className="text-center" padding="lg">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 text-purple-600 text-2xl font-bold mb-6">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Mulai Menikmati</h3>
                            <p className="text-gray-600">
                                Langsung akses semua fitur premium dan mulai perjalanan spiritual Anda.
                            </p>
                        </Card>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-12 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">
                            Siap Memulai Perjalanan Spiritual Anda?
                        </h2>
                        <p className="text-xl mb-8 text-green-100">
                            Bergabunglah dengan ribuan muslim lainnya dan dapatkan akses ke semua fitur premium secara gratis
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={handleGetStarted}
                                variant="primary"
                                size="lg"
                                leftIcon={<IoHandRightOutline className="w-6 h-6" />}
                                className="bg-yellow-400 hover:bg-yellow-500 text-green-800 shadow-lg"
                            >
                                {isAuthenticated ? 'Dashboard Saya' : 'Daftar Sekarang - Gratis!'}
                            </Button>
                        </div>
                        <p className="text-sm mt-6 text-green-200">
                            * Tidak ada biaya tersembunyi. Daftar sekali, nikmati selamanya.
                        </p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="py-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Pertanyaan Umum
                        </h2>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <Card padding="lg">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Apakah benar-benar gratis?
                            </h3>
                            <p className="text-gray-700">
                                Ya, 100% gratis. Semua fitur member tersedia tanpa biaya. Kami berkomitmen 
                                menyediakan akses Al-Quran yang mudah untuk semua muslim.
                            </p>
                        </Card>

                        <Card padding="lg">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Bagaimana keamanan data saya?
                            </h3>
                            <p className="text-gray-700">
                                Data Anda aman dengan enkripsi tingkat enterprise. Kami tidak akan pernah 
                                membagikan informasi pribadi Anda kepada pihak ketiga.
                            </p>
                        </Card>

                        <Card padding="lg">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Bisakah saya mengakses dari berbagai perangkat?
                            </h3>
                            <p className="text-gray-700">
                                Tentu! Akun Anda akan tersinkronisasi di semua perangkat. Login sekali, 
                                akses di mana saja - handphone, tablet, atau komputer.
                            </p>
                        </Card>

                        <Card padding="lg">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Bagaimana jika saya lupa password?
                            </h3>
                            <p className="text-gray-700">
                                Jangan khawatir! Kami menyediakan fitur reset password melalui email. 
                                Anda bisa reset kapan saja dengan mudah.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default MemberBenefitsPage;
