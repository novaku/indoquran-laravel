import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    IoHeartOutline, 
    IoCopyOutline, 
    IoCheckmarkOutline, 
    IoWalletOutline,
    IoPhonePortraitOutline,
    IoSendOutline,
    IoGiftOutline,
    IoStarOutline,
    IoTrendingUpOutline,
    IoPeopleOutline,
    IoShieldCheckmarkOutline,
    IoBookOutline,
    IoCloudDownloadOutline,
    IoInfiniteOutline
} from 'react-icons/io5';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import { scrollToTop } from '../utils/scrollUtils';

function DonationSupportPage() {
    const navigate = useNavigate();
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedName, setCopiedName] = useState(false);
    const [copiedEMoney, setCopiedEMoney] = useState(false);

    useEffect(() => {
        scrollToTop();
    }, []);


    // Donation impact areas
    const donationImpacts = [
        {
            icon: IoShieldCheckmarkOutline,
            title: "Server & Hosting Premium",
            description: "Menjaga platform tetap cepat dan stabil 24/7",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            amount: "Rp 500K/bulan"
        },
        {
            icon: IoBookOutline,
            title: "Konten & Fitur Baru",
            description: "Pengembangan terjemahan dan audio berkualitas",
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
            amount: "Rp 300K/bulan"
        },
        {
            icon: IoTrendingUpOutline,
            title: "Performa & Optimisasi",
            description: "Peningkatan kecepatan dan user experience",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
            amount: "Rp 200K/bulan"
        },
        {
            icon: IoInfiniteOutline,
            title: "Gratis Selamanya",
            description: "Memastikan akses Al-Quran tetap gratis untuk semua",
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
            amount: "Target Utama"
        }
    ];

    const bankDetails = {
        bank: 'Bank Permata',
        logo: '/images/donasi/permata.svg',
        code: '013',
        accountNumber: '9906-4392-60',
        accountName: 'Nova Herdi Kusumah'
    };

    const eMoneyDetails = {
        number: '0811-110-1024',
        name: 'Nova Herdi Kusumah',
        providers: [
            { name: 'DANA', logo: '/images/donasi/dana.svg' },
            { name: 'OVO', logo: '/images/donasi/ovo.svg' },
            { name: 'GOPAY', logo: '/images/donasi/gopay.svg' },
            { name: 'SHOPEE PAY', logo: '/images/donasi/shopeepay.svg' },
            { name: 'ASTRA PAY', logo: '/images/donasi/astrapay.svg' }
        ]
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'account') {
                setCopiedAccount(true);
                setTimeout(() => setCopiedAccount(false), 2000);
            } else if (type === 'name') {
                setCopiedName(true);
                setTimeout(() => setCopiedName(false), 2000);
            } else if (type === 'emoney') {
                setCopiedEMoney(true);
                setTimeout(() => setCopiedEMoney(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleContactForDonation = () => {
        const preFilledData = {
            subject: 'Konfirmasi Donasi - IndoQuran',
            message: `Assalamu'alaikum,

Saya telah melakukan transfer donasi untuk mendukung IndoQuran dengan detail sebagai berikut:

--- DETAIL TRANSFER ---
Nama Pengirim: [Isi nama lengkap Anda]
Tanggal Transfer: [Isi tanggal transfer]
Nominal: Rp. [Isi jumlah donasi]
Metode Transfer: [Pilih salah satu]
- Bank Permata ke rekening 9906-4392-60 a.n Nova Herdi Kusumah
- E-Money (DANA/OVO/GOPAY/SHOPEE PAY/ASTRA PAY) ke 08111101024 a.n Nova Herdi Kusumah

--- PESAN TAMBAHAN ---
[Silakan tulis pesan atau doa khusus jika ada]

Mohon konfirmasi penerimaan donasi ini. Semoga donasi ini dapat bermanfaat untuk pengembangan platform IndoQuran yang lebih baik.

Barakallahu fiikum,
Wassalamu'alaikum.`
        };

        navigate('/kontak', { state: preFilledData });
    };

    return (
        <>
            <SEOHead 
                title="Donasi - Dukung IndoQuran"
                description="Dukung pengembangan IndoQuran dengan berdonasi melalui Bank Permata atau E-Money. Setiap kontribusi Anda membantu kami menyediakan akses Al-Quran digital yang lebih baik."
                keywords="donasi islam, sedekah jariyah, dukung al-quran digital, infaq online, donasi muslim indonesia"
            />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white pt-16">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-green-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                            <IoGiftOutline className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Dukung IndoQuran
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
                            Bersama membangun platform Al-Quran digital terbaik untuk umat Islam Indonesia. 
                            Setiap donasi Anda adalah sedekah jariyah yang mengalir terus menerus.
                        </p>
                        
                        {/* CTA Button */}
                        <button
                            onClick={handleContactForDonation}
                            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-gray-100"
                        >
                            <IoHeartOutline className="w-6 h-6" />
                            Mulai Berdonasi
                        </button>
                        
                        {/* Decorative Elements */}
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
                    {/* Donation Impact Areas */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Dampak Donasi Anda</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Setiap rupiah donasi Anda digunakan untuk meningkatkan kualitas dan aksesibilitas platform IndoQuran
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {donationImpacts.map((impact, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-all duration-300">
                                <div className={`w-16 h-16 ${impact.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                    <impact.icon className={`w-8 h-8 ${impact.iconColor}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{impact.title}</h3>
                                <p className="text-gray-600 text-sm mb-3">{impact.description}</p>
                                <div className="text-lg font-bold text-blue-600">{impact.amount}</div>
                            </div>
                        ))}
                    </div>
                    {/* Dalil Syar'i Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dalil Syar'i tentang Infaq & Donasi</h2>
                            <p className="text-xl text-gray-600">
                                Landasan syariat yang mendorong kita untuk berinfaq di jalan Allah
                            </p>
                        </div>
                        
                        {/* Ayat Al-Quran */}
                        <div className="mb-10">
                            <h3 className="text-xl font-semibold text-blue-800 mb-6 flex items-center justify-center gap-2">
                                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                                Firman Allah SWT
                            </h3>
                            
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* QS. Al-Baqarah: 261 */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                                    <div className="text-right mb-4">
                                        <p className="text-xl leading-relaxed font-arabic text-blue-900">
                                            مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنْبُلَةٍ مِائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَنْ يَشَاءُ ۗ وَاللَّهُ وَاسِعٌ عَلِيمٌ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="font-semibold mb-2 text-blue-800">QS. Al-Baqarah: 261</p>
                                        <p className="italic text-sm leading-relaxed">
                                            "Perumpamaan orang yang menafkahkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji. Allah melipat gandakan bagi siapa yang Dia kehendaki."
                                        </p>
                                    </div>
                                </div>

                                {/* QS. Al-Baqarah: 274 */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                                    <div className="text-right mb-4">
                                        <p className="text-xl leading-relaxed font-arabic text-blue-900">
                                            الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ بِاللَّيْلِ وَالنَّهَارِ سِرًّا وَعَلَانِيَةً فَلَهُمْ أَجْرُهُمْ عِنْدَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="font-semibold mb-2 text-blue-800">QS. Al-Baqarah: 274</p>
                                        <p className="italic text-sm leading-relaxed">
                                            "Orang-orang yang menginfakkan hartanya di malam dan siang hari, secara sembunyi dan terang-terangan, mereka mendapat pahala di sisi Tuhannya."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hadits */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-green-800 mb-6 flex items-center justify-center gap-2">
                                <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                                Sabda Rasulullah ﷺ
                            </h3>
                            
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Hadits tentang sedekah */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                                    <div className="text-right mb-4">
                                        <p className="text-lg leading-relaxed font-arabic text-green-900">
                                            مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="italic text-sm leading-relaxed mb-2">
                                            "Sedekah tidak akan mengurangi harta, dan Allah tidak menambah kepada seorang hamba yang pemaaf kecuali kemuliaan."
                                        </p>
                                        <p className="text-xs text-gray-600">(HR. Muslim)</p>
                                    </div>
                                </div>

                                {/* Hadits tentang jariyah */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                                    <div className="text-right mb-4">
                                        <p className="text-lg leading-relaxed font-arabic text-green-900">
                                            إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="italic text-sm leading-relaxed mb-2">
                                            "Jika manusia meninggal dunia, maka terputuslah amalnya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, atau anak saleh yang mendoakannya."
                                        </p>
                                        <p className="text-xs text-gray-600">(HR. Muslim)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pesan Khusus untuk Donasi Website Al-Quran */}
                        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                                <IoInfiniteOutline className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">💝 Donasi untuk Website Al-Quran sebagai Sedekah Jariyah</h4>
                            <p className="text-blue-100 leading-relaxed">
                                Dengan berdonasi untuk pengembangan website Al-Quran digital ini, Anda ikut serta dalam menyebarkan ilmu agama yang bermanfaat. 
                                Setiap orang yang membaca Al-Quran, belajar tajwid, atau mendapat manfaat dari platform ini, 
                                insyaAllah menjadi pahala yang mengalir untuk Anda sebagai <strong className="text-white">sedekah jariyah</strong> yang tidak terputus.
                            </p>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {/* Bank Transfer */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <IoWalletOutline className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Transfer Bank</h3>
                                    <p className="text-gray-600 text-sm">Metode transfer tradisional</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Nama Bank
                                    </label>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                                        <div>
                                            <span className="font-bold text-gray-900 text-xl block leading-tight">{bankDetails.bank}</span>
                                            <span className="text-xs text-gray-500 font-medium mt-1 block">Kode Bank: {bankDetails.code} (Permata)</span>
                                        </div>
                                        <div className="bg-white py-2 px-3 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center shrink-0">
                                            <img 
                                                src={bankDetails.logo} 
                                                alt={bankDetails.bank} 
                                                className="h-8 w-auto max-w-[130px] sm:max-w-[150px] object-contain" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Nomor Rekening
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-1">
                                            <span className="font-mono text-xl text-gray-900">{bankDetails.accountNumber}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                                            className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            {copiedAccount ? <IoCheckmarkOutline className="w-5 h-5" /> : <IoCopyOutline className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {copiedAccount && (
                                        <p className="text-blue-600 text-sm mt-2 font-medium">✓ Nomor rekening berhasil disalin!</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Atas Nama
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-1">
                                            <span className="font-semibold text-gray-900 text-lg">{bankDetails.accountName}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
                                            className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            {copiedName ? <IoCheckmarkOutline className="w-5 h-5" /> : <IoCopyOutline className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {copiedName && (
                                        <p className="text-blue-600 text-sm mt-2 font-medium">✓ Nama penerima berhasil disalin!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* E-Money */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <IoPhonePortraitOutline className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">E-Money Digital</h3>
                                    <p className="text-gray-600 text-sm">Transfer digital instan</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Platform Tersedia
                                    </label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {eMoneyDetails.providers.map((provider) => (
                                            <div 
                                                key={provider.name}
                                                className="flex items-center gap-2.5 p-2 px-3 bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all duration-200 group flex-1 min-w-[135px]"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 p-1 border border-gray-100">
                                                    <img 
                                                        src={provider.logo} 
                                                        alt={provider.name} 
                                                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110" 
                                                    />
                                                </div>
                                                <span className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-purple-700 transition-colors whitespace-nowrap">
                                                    {provider.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Nomor E-Money
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-1">
                                            <span className="font-mono text-xl text-gray-900">{eMoneyDetails.number}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(eMoneyDetails.number, 'emoney')}
                                            className="p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            {copiedEMoney ? <IoCheckmarkOutline className="w-5 h-5" /> : <IoCopyOutline className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {copiedEMoney && (
                                        <p className="text-purple-600 text-sm mt-2 font-medium">✓ Nomor e-money berhasil disalin!</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Atas Nama
                                    </label>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <span className="font-semibold text-gray-900 text-lg">{eMoneyDetails.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cara Berdonasi</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-green-600">1</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Transfer Donasi</h4>
                                <p className="text-gray-600 text-sm">Transfer ke salah satu rekening atau e-money di atas dengan nominal sesuai keinginan Anda</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-blue-600">2</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Simpan Bukti</h4>
                                <p className="text-gray-600 text-sm">Simpan screenshot atau bukti transfer untuk keperluan konfirmasi donasi</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-purple-600">3</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Konfirmasi</h4>
                                <p className="text-gray-600 text-sm">Klik tombol konfirmasi di bawah untuk mengirim bukti transfer melalui kontak</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="text-center mb-12">
                        <button
                            onClick={handleContactForDonation}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-12 py-4 rounded-full hover:from-green-700 hover:to-blue-700 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <IoSendOutline className="w-6 h-6" />
                            <span>Konfirmasi Donasi</span>
                        </button>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            Tombol ini akan membuka halaman kontak dengan template pesan konfirmasi donasi yang sudah dipersiapkan untuk kemudahan Anda
                        </p>
                    </div>

                    {/* Thank You Message */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
                            <IoStarOutline className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Jazakallahu Khairan Katsiran</h3>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-3xl mx-auto">
                            Setiap donasi Anda, sekecil apapun, sangat berarti bagi pengembangan IndoQuran. 
                            Semoga Allah SWT membalas kebaikan Anda dengan berlipat ganda dan menjadikan donasi ini 
                            sebagai <strong className="text-white">sedekah jariyah</strong> yang mengalir terus hingga akhir zaman.
                        </p>
                        <div className="mt-6 text-yellow-200 text-lg font-arabic">
                            بَارَكَ اللَّهُ فِيكُمْ
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DonationSupportPage;
