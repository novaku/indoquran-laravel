import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    IoShieldCheckmarkOutline,
    IoLockClosedOutline,
    IoKeyOutline,
    IoMailOutline,
    IoTimeOutline,
    IoLocationOutline,
    IoDocumentTextOutline,
    IoCheckmarkCircleOutline,
    IoInformationCircleOutline,
    IoEyeOutline,
    IoServerOutline,
    IoChatbubbleEllipsesOutline,
    IoBookmarkOutline
} from 'react-icons/io5';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseHorizontal from '../components/AdSenseHorizontal';
import { scrollToTop } from '../utils/scrollUtils';

function PrivacyPage() {
    const navigate = useNavigate();

    useEffect(() => {
        scrollToTop();
    }, []);


    // 3 Highlight cards matching ContactSupportPage style
    const privacyHighlights = [
        {
            icon: IoShieldCheckmarkOutline,
            title: "Keamanan Terjamin",
            description: "Enkripsi data dan standar perlindungan keamanan modern untuk melindungi akun Anda",
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            icon: IoLockClosedOutline,
            title: "Tanpa Penjualan Data",
            description: "Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda ke pihak ketiga",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            icon: IoKeyOutline,
            title: "Kendali Penuh",
            description: "Anda memiliki hak penuh untuk mengakses, memperbarui, atau meminta penghapusan data Anda",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        }
    ];

    const contactInfo = [
        {
            icon: IoMailOutline,
            title: "Email Privasi & Dukungan",
            content: "kontak@indoquran.web.id",
            description: "Hubungi tim data & privasi kami"
        },
        {
            icon: IoTimeOutline,
            title: "Waktu Respon",
            content: "1-2 Hari Kerja",
            description: "Komitmen respon cepat dan solutif"
        },
        {
            icon: IoLocationOutline,
            title: "Wilayah Hukum",
            content: "Indonesia",
            description: "Sesuai regulasi perlindungan data di Indonesia"
        }
    ];

    const collectedData = [
        {
            title: "Informasi Akun",
            desc: "Nama lengkap, alamat email, dan kredensial terenkripsi saat Anda mendaftar atau login."
        },
        {
            title: "Data Aktivitas Tilawah",
            desc: "Riwayat bacaan, ayat yang Anda tandai (bookmark), ayat favorit, dan catatan pribadi."
        },
        {
            title: "Informasi Teknis & Perangkat",
            desc: "Tipe perangkat, browser, alamat IP terenkripsi, preferensi tampilan (tema, ukuran font), dan log sistem untuk performa."
        },
        {
            title: "Cookie & Penyimpanan Lokal",
            desc: "Penyimpanan preferensi sesi pengguna, cache bacaan offline (PWA), dan status login secara aman di browser Anda."
        }
    ];

    const userRights = [
        "Hak untuk mengakses dan meminta salinan data pribadi Anda yang tersimpan.",
        "Hak untuk memperbarui atau mengoreksi data profil yang tidak akurat.",
        "Hak untuk meminta penghapusan akun serta riwayat data pribadi Anda secara permanen.",
        "Hak untuk membatasi atau menolak pemrosesan data tertentu.",
        "Hak untuk mengunduh atau memindahkan data penanda dan riwayat tilawah Anda."
    ];

    return (
        <>
            <SEOHead 
                title="Kebijakan Privasi - IndoQuran Platform Al-Quran Digital"
                description="Pelajari Kebijakan Privasi IndoQuran: bagaimana kami mengumpulkan, melindungi, dan mengelola data pribadi pengguna dengan aman dan transparan."
            />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white pt-16">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                            <IoShieldCheckmarkOutline className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Kebijakan Privasi
                        </h1>
                        <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
                            Komitmen IndoQuran dalam menjaga keamanan, kerahasiaan, dan menghormati privasi seluruh umat dan pengguna kami.
                        </p>
                        
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform -rotate-12"></div>
                        </div>
                    </div>
                </div>

                {/* Highlight Cards (Negative Top Margin) */}
                <div className="relative -mt-8">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            {privacyHighlights.map((item, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                                    <div className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Billboard Ad (Detik.com Pattern) */}
                <AdSenseLeaderboard maxWidth="max-w-6xl" labelText="IKLAN" className="my-6" />

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Policy Content (2 cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Card: Introduction */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <IoInformationCircleOutline className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Pengantar</h2>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                                        Terakhir diperbarui: 29 Agustus 2026
                                    </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Selamat datang di <strong>IndoQuran</strong>. Kami menghargai dan melindungi privasi setiap pengunjung serta pengguna platform kami. Kebijakan Privasi ini menguraikan bagaimana data pribadi Anda dikumpulkan, digunakan, diproses, dan dilindungi saat mengakses situs web maupun aplikasi web (PWA) IndoQuran.
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                    Dengan menggunakan layanan IndoQuran, Anda menyetujui praktik pengumpulan dan penggunaan data sesuai dengan ketentuan yang tercantum dalam dokumen ini.
                                </p>
                            </div>

                            {/* Card: Data Collection */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <IoDocumentTextOutline className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">1. Informasi yang Kami Kumpulkan</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    Untuk memberikan pengalaman tilawah dan pembelajaran Al-Quran yang optimal, kami dapat mengumpulkan beberapa kategori data berikut:
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {collectedData.map((data, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center space-x-2 text-green-600 font-semibold mb-2">
                                                <IoCheckmarkCircleOutline className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-gray-900">{data.title}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {data.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card: Use of Information */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <IoServerOutline className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">2. Penggunaan Informasi</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Informasi yang kami peroleh digunakan semata-mata untuk tujuan fungsional dan peningkatan layanan, antara lain:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm leading-relaxed">Menyediakan, memelihara, dan mengoptimalkan performa platform Al-Quran digital.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm leading-relaxed">Menyinkronkan penanda (bookmark), progress membaca, dan riwayat tilawah antar perangkat Anda.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm leading-relaxed">Mendukung fitur komunitas seperti Doa Bersama dan interaksi keagamaan yang positif.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm leading-relaxed">Mendeteksi, mencegah, dan mengatasi kendala teknis, serangan siber, atau penyalahgunaan akun.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm leading-relaxed">Mengirimkan pemberitahuan penting terkait perubahan sistem atau pembaruan fitur (bila Anda mengizinkan).</span>
                                    </li>
                                </ul>
                            </div>

                            {/* In-Article Break Banner Ad (Detik.com Pattern) */}
                            <div className="w-full my-6">
                                <AdSenseHorizontal 
                                    adSlot="1519827772"
                                    showLabel={true}
                                    labelText="IKLAN REKOMENDASI"
                                    minHeight="90px"
                                />
                            </div>

                            {/* Card: Data Security */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">3. Keamanan & Perlindungan Data</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang ketat untuk menjaga integritas dan kerahasiaan data Anda:
                                </p>
                                <div className="space-y-4 text-sm text-gray-700">
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                        <h4 className="font-semibold text-green-900 mb-1">Enkripsi Data (SSL/TLS & Hash)</h4>
                                        <p className="text-gray-600">Semua transmisi data dilindungi dengan enkripsi SSL/TLS modern, dan kata sandi di-hash menggunakan algoritma kriptografi yang aman.</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <h4 className="font-semibold text-blue-900 mb-1">Akses Terbatas & Terisolasi</h4>
                                        <p className="text-gray-600">Akses basis data dibatasi hanya untuk staf berwenang dengan otentikasi ganda guna mencegah akses tanpa izin.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Data Sharing & Third Parties */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <IoLockClosedOutline className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">4. Pembagian Informasi & Pihak Ketiga</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    <strong>IndoQuran berkomitmen untuk tidak pernah menjual atau menyewakan data pribadi pengguna kepada pihak manapun.</strong>
                                </p>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Data hanya dapat dibagikan dalam kondisi terbatas berikut:
                                </p>
                                <ul className="list-disc pl-5 text-gray-700 space-y-2 text-sm leading-relaxed">
                                    <li><strong>Penyedia Layanan Terpercaya:</strong> Mitra hosting, CDN audio murottal, dan penyedia analitik anonim yang terikat kewajiban kerahasiaan ketat.</li>
                                    <li><strong>Kepatuhan Hukum:</strong> Apabila diwajibkan oleh proses hukum, pengadilan, atau peraturan perundang-undangan yang berlaku di Republik Indonesia.</li>
                                </ul>
                            </div>

                            {/* Card: User Rights */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <IoKeyOutline className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">5. Hak Privasi Anda</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Sebagai pengguna, Anda memiliki kendali penuh atas data pribadi Anda:
                                </p>
                                <div className="space-y-3 mb-6">
                                    {userRights.map((right, idx) => (
                                        <div key={idx} className="flex items-start">
                                            <IoCheckmarkCircleOutline className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 text-sm leading-relaxed">{right}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Untuk menggunakan hak-hak di atas, Anda dapat mengakses halaman profil Anda atau menghubungi tim privasi kami melalui form kontak.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Column (1 col) */}
                        <div className="space-y-6">
                            {/* Contact Info Cards */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontak Privasi</h2>
                                <div className="space-y-6">
                                    {contactInfo.map((info, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                <info.icon className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                                                <p className="text-green-600 font-medium mb-1">{info.content}</p>
                                                <p className="text-gray-600 text-sm">{info.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact CTA Card */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                    <IoChatbubbleEllipsesOutline className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Punya Pertanyaan?</h2>
                                <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                                    Jika Anda membutuhkan klarifikasi lebih lanjut mengenai kebijakan privasi atau perlindungan data Anda, tim kami siap membantu.
                                </p>
                                <button 
                                    onClick={() => navigate('/kontak')}
                                    className="w-full bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-center shadow-md hover:shadow-lg"
                                >
                                    Hubungi Tim Kami
                                </button>
                            </div>

                            {/* Community & Reading CTA Card */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                    <IoBookmarkOutline className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Jelajahi IndoQuran</h2>
                                <p className="text-green-100 mb-6 text-sm leading-relaxed">
                                    Nikmati kemudahan membaca Al-Quran, tandai ayat favorit, dan bergabung dalam ruang doa bersama.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Link 
                                        to="/surah"
                                        className="w-full bg-white text-green-600 px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-medium text-center shadow"
                                    >
                                        Daftar Surah
                                    </Link>
                                    <Link 
                                        to="/member"
                                        className="w-full bg-green-800 text-white px-6 py-2.5 rounded-xl hover:bg-green-900 transition-colors font-medium text-center"
                                    >
                                        Keuntungan Member
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Break Ad (Detik.com Pattern) */}
                    <div className="w-full my-8">
                        <AdSenseHorizontal 
                            adSlot="1519827772"
                            showLabel={true}
                            labelText="IKLAN"
                            minHeight="90px"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default PrivacyPage;
