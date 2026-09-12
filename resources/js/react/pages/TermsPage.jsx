import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    IoDocumentTextOutline,
    IoShieldCheckmarkOutline,
    IoCheckmarkCircleOutline,
    IoInformationCircleOutline,
    IoPersonOutline,
    IoBookOutline,
    IoAlertCircleOutline,
    IoLogoGoogle,
    IoTrashOutline,
    IoMailOutline,
    IoTimeOutline,
    IoLocationOutline,
    IoChatbubbleEllipsesOutline,
    IoLockClosedOutline,
    IoArrowForwardOutline
} from 'react-icons/io5';
import SEOHead from '../components/SEOHead';
import { scrollToTop } from '../utils/scrollUtils';

function TermsPage() {
    const navigate = useNavigate();

    useEffect(() => {
        scrollToTop();
    }, []);

    const termsHighlights = [
        {
            icon: IoBookOutline,
            title: "Kredibilitas & Kesucian",
            description: "Mushaf Al-Quran dan terjemahan bersumber dari rujukan tepercaya standar Kementerian Agama RI",
            bgColor: "bg-emerald-100",
            iconColor: "text-emerald-600"
        },
        {
            icon: IoLogoGoogle,
            title: "Akses Akun Aman",
            description: "Otentikasi aman termasuk Google Sign-In hanya untuk identifikasi profil dan sinkronisasi tilawah",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            icon: IoShieldCheckmarkOutline,
            title: "Layanan Kemaslahatan",
            description: "Disediakan untuk memudahkan tilawah, tadabbur, dan ibadah umat Islam secara mudah dan gratis",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        }
    ];

    const contactInfo = [
        {
            icon: IoMailOutline,
            title: "Email Bantuan & Legal",
            content: "kontak@indoquran.web.id",
            description: "Hubungi tim pengelola & administrasi kami"
        },
        {
            icon: IoTimeOutline,
            title: "Waktu Respon",
            content: "1-2 Hari Kerja",
            description: "Komitmen respon tanggap dan solutif"
        },
        {
            icon: IoLocationOutline,
            title: "Yurisdiksi Hukum",
            content: "Republik Indonesia",
            description: "Tunduk pada peraturan perundangan yang berlaku"
        }
    ];

    const userRules = [
        {
            title: "Pemanfaatan yang Sah & Beradab",
            desc: "Menggunakan layanan IndoQuran untuk tujuan ibadah, belajar, tadabbur, dan kegiatan yang tidak bertentangan dengan hukum maupun norma kesopanan."
        },
        {
            title: "Integritas Fitur Komunitas",
            desc: "Menjaga etika dalam fitur Doa Bersama dan interaksi lainnya. Dilarang memposting ujaran kebencian, penipuan, fitnah, atau materi SARA."
        },
        {
            title: "Perlindungan Sistem & Keamanan",
            desc: "Dilarang melakukan peretasan, injeksi kode berbahaya, scraping berlebihan yang melumpuhkan server (DDoS), atau manipulasi API."
        },
        {
            title: "Keaslian Akun",
            desc: "Tidak diperkenankan membuat akun menggunakan identitas palsu, menyamar sebagai pihak lain, atau memindahtangankan akses akun tanpa izin."
        }
    ];

    return (
        <>
            <SEOHead 
                title="Syarat dan Ketentuan Layanan - IndoQuran"
                description="Syarat dan Ketentuan Layanan IndoQuran: hak, kewajiban, ketentuan akun pengguna, otentikasi Google OAuth, dan aturan pemanfaatan platform Al-Quran digital."
            />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                            Syarat dan Ketentuan Layanan
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                            Panduan aturan, hak, serta kewajiban pengguna dalam mengakses dan memanfaatkan platform Al-Quran digital IndoQuran.
                        </p>
                    </div>
                </div>

                {/* Highlight Cards */}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-3 gap-4">
                        {termsHighlights.map((item, index) => (
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

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Terms Content (2 cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Card: Introduction */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <IoInformationCircleOutline className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">1. Penerimaan Ketentuan</h2>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                                        Terakhir diperbarui: 12 September 2026
                                    </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Selamat datang di <strong>IndoQuran</strong> (tersedia di web <a href="https://indoquran.web.id" className="text-emerald-600 hover:underline font-medium">indoquran.web.id</a> dan aplikasi PWA). Dengan mengakses, membaca, mendaftar, atau menggunakan fitur-fitur yang disediakan oleh IndoQuran, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh <strong>Syarat dan Ketentuan Layanan</strong> ini.
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                    Apabila Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda dipersilakan untuk tidak melanjutkan penggunaan layanan kami. Penggunaan berkelanjutan atas platform ini merupakan persetujuan eksplisit Anda terhadap ketentuan yang berlaku.
                                </p>
                            </div>

                            {/* Card: Google OAuth & Account */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <IoLogoGoogle className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">2. Akun Pengguna & Integrasi Google OAuth</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Untuk menikmati fitur personalisasi seperti penanda ayat (bookmarks), catatan tadabbur, dan riwayat tilawah, pengguna dapat mendaftar akun langsung atau menggunakan layanan otentikasi pihak ketiga yang kami sediakan:
                                </p>
                                
                                <div className="space-y-4 mb-4">
                                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                                        <h4 className="font-semibold text-blue-900 mb-1.5 flex items-center gap-2">
                                            <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600" />
                                            Google Sign-In & Cakupan Akses (OAuth Scope)
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Ketika Anda memilih masuk dengan akun Google (Google OAuth / Google One Tap), kami hanya meminta izin akses data profil publik terbatas, yaitu: <strong>nama lengkap</strong>, <strong>alamat email</strong>, dan <strong>foto profil</strong>. Data ini semata-mata digunakan untuk verifikasi identitas, pembuatan profil pengguna di IndoQuran, serta sinkronisasi penanda ayat Anda.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <h4 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                                            <IoLockClosedOutline className="w-5 h-5 text-emerald-600" />
                                            Keamanan Kata Sandi
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            IndoQuran <strong>tidak pernah meminta, menerima, maupun menyimpan kata sandi akun Google</strong> Anda. Otentikasi diproses secara terenkripsi langsung oleh server resmi Google Identity Service.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <h4 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                                            <IoTrashOutline className="w-5 h-5 text-rose-600" />
                                            Pencabutan Akses
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Anda memiliki kendali penuh untuk mencabut izin akses IndoQuran terhadap akun Google Anda kapan saja melalui menu pengaturan akun Google Anda di halaman <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Third-party Apps & Services</a>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Quran Content & Intellectual Property */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <IoBookOutline className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">3. Konten Al-Quran & Hak Cipta</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Al-Quran Al-Karim adalah wahyu suci firman Allah SWT yang menjadi pedoman utama umat Islam. Terkait hak cipta dan rujukan:
                                </p>
                                <ul className="space-y-3 text-sm text-gray-700 leading-relaxed">
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span><strong>Teks & Terjemahan:</strong> Teks Al-Quran Rasm Utsmani dan terjemahan Bahasa Indonesia disajikan berlandaskan rujukan terverifikasi standar Kementerian Agama Republik Indonesia (Kemenag RI) dan Lajnah Pentashihan Mushaf Al-Qur'an.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span><strong>Audio Murottal:</strong> Rekaman tilawah audio qari disediakan semata-mata untuk tujuan mendengarkan dan mempelajari bacaan Al-Quran non-komersial. Hak cipta rekaman tetap berada pada masing-masing qari dan penerbit terkait.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span><strong>Perangkat Lunak & Merk:</strong> Desain antarmuka, logo, kode program, dan basis data fitur platform IndoQuran dilindungi oleh undang-undang kekayaan intelektual Republik Indonesia.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Card: Prohibited Activities */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <IoAlertCircleOutline className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">4. Pedoman Penggunaan & Larangan</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    Demi kenyamanan dan ketenteraman bersama, setiap pengguna wajib mematuhi panduan pemanfaatan berikut:
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {userRules.map((rule, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center space-x-2 text-amber-700 font-semibold mb-2">
                                                <IoCheckmarkCircleOutline className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-gray-900">{rule.title}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {rule.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card: Disclaimer & Limitation of Liability */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                                        <IoShieldCheckmarkOutline className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">5. Penafian Tanggung Jawab (Disclaimer)</h2>
                                </div>
                                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                                    <p>
                                        Platform IndoQuran disediakan <strong>"sebagaimana adanya" (as-is)</strong> dan <strong>"sebagaimana tersedia" (as-available)</strong>. Tim pengembang terus berikhtiar dengan sungguh-sungguh untuk menyajikan teks ayat, harakat, terjemahan, dan jadwal salat seakurat mungkin.
                                    </p>
                                    <p>
                                        Kendati demikian, IndoQuran tidak menjamin bahwa operasional situs akan sepenuhnya bebas dari gangguan teknis berkala, pemeliharaan server, atau kendala konektivitas di luar kendali wajar kami. Jika Anda menemukan kesalahan ketik atau ketidaksesuaian harakat, kami sangat berterima kasih apabila Anda melaporkannya melalui saluran kontak kami untuk segera diverifikasi dan diperbaiki.
                                    </p>
                                </div>
                            </div>

                            {/* Card: Account Termination & Deletion */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <IoTrashOutline className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">6. Penghentian & Penghapusan Akun</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Kami menghormati otonomi penuh Anda terhadap akun dan data pribadi Anda:
                                </p>
                                <ul className="list-disc pl-5 text-gray-700 space-y-2 text-sm leading-relaxed mb-4">
                                    <li>Pengguna berhak meminta penutupan akun dan penghapusan seluruh data penanda serta riwayat bacaan mereka kapan saja melalui halaman profil atau dengan menghubungi kami.</li>
                                    <li>IndoQuran berhak menangguhkan atau membatasi akses akun pengguna yang terbukti melanggar ketentuan layanan atau terindikasi melakukan penyalahgunaan sistem secara berulang.</li>
                                </ul>
                            </div>

                            {/* Card: Changes to Terms */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <IoDocumentTextOutline className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">7. Pembaruan Ketentuan Layanan</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    IndoQuran dapat memperbarui atau memodifikasi Syarat dan Ketentuan Layanan ini dari waktu ke waktu demi menyesuaikan dengan perkembangan regulasi, penambahan fitur baru, atau integrasi pihak ketiga. Setiap perubahan substansial akan dicantumkan pada halaman ini beserta tanggal pembaruan terbarunya.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Column (1 col) */}
                        <div className="space-y-6">
                            {/* Legal Contact Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
                                <div className="space-y-6">
                                    {contactInfo.map((info, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                <info.icon className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                                                <p className="text-emerald-600 font-medium mb-1">{info.content}</p>
                                                <p className="text-gray-600 text-sm">{info.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Privacy Policy Cross-Link Card */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-sm">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                    <IoShieldCheckmarkOutline className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Kebijakan Privasi</h2>
                                <p className="text-emerald-100 mb-6 text-sm leading-relaxed">
                                    Ingin mengetahui bagaimana kami melindungi data pribadi dan hak-hak privasi Anda secara spesifik?
                                </p>
                                <Link 
                                    to="/kebijakan"
                                    onClick={scrollToTop}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-center shadow-md hover:shadow-lg"
                                >
                                    <span>Baca Kebijakan Privasi</span>
                                    <IoArrowForwardOutline className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Contact Support CTA Card */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-sm">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                    <IoChatbubbleEllipsesOutline className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Ada Pertanyaan?</h2>
                                <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                                    Jika Anda memiliki masukan atau memerlukan klarifikasi terkait ketentuan layanan, tim kami siap membantu.
                                </p>
                                <button 
                                    onClick={() => navigate('/kontak')}
                                    className="w-full bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-center shadow-md hover:shadow-lg"
                                >
                                    Hubungi Tim Kami
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TermsPage;
