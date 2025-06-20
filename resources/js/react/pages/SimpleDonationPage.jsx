import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    IoHeartOutline, 
    IoCopyOutline, 
    IoCheckmarkOutline, 
    IoArrowBackOutline,
    IoWalletOutline,
    IoPhonePortraitOutline,
    IoSendOutline
} from 'react-icons/io5';
import SEOHead from '../components/SEOHead';

function SimpleDonationPage() {
    const navigate = useNavigate();
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedName, setCopiedName] = useState(false);
    const [copiedEMoney, setCopiedEMoney] = useState(false);

    const bankDetails = {
        bank: 'Bank Permata',
        accountNumber: '9906-4392-60',
        accountName: 'Nova Herdi Kusumah'
    };

    const eMoneyDetails = {
        number: '0811-110-1024',
        name: 'Nova Herdi Kusumah',
        providers: ['DANA', 'OVO', 'GOPAY', 'SHOPEE PAY', 'ASTRA PAY']
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
            />
            
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <IoArrowBackOutline className="w-5 h-5" />
                                <span>Kembali</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <IoHeartOutline className="w-6 h-6 text-green-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Dukung IndoQuran</h1>
                        </div>
                        <p className="text-gray-600 mt-2">
                            Bantu kami terus mengembangkan platform Al-Quran digital terbaik untuk umat Islam Indonesia
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Introduction */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold text-green-800 mb-3">Mengapa Donasi Penting?</h2>
                        <ul className="text-green-700 space-y-2">
                            <li>• Membantu server dan hosting platform tetap stabil</li>
                            <li>• Mengembangkan fitur-fitur baru untuk kemudahan pengguna</li>
                            <li>• Meningkatkan kualitas terjemahan dan audio</li>
                            <li>• Menjaga platform tetap gratis untuk semua</li>
                        </ul>
                    </div>

                    {/* Dalil Syar'i tentang Donasi */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Dalil Syar'i tentang Infaq & Donasi</h2>
                        
                        {/* Ayat Al-Quran */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                Firman Allah SWT
                            </h3>
                            
                            <div className="space-y-6">
                                {/* QS. Al-Baqarah: 261 */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                                    <div className="text-right mb-4">
                                        <p className="text-xl leading-relaxed font-arabic text-blue-900">
                                            مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنْبُلَةٍ مِائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَنْ يَشَاءُ ۗ وَاللَّهُ وَاسِعٌ عَلِيمٌ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="font-medium mb-2">QS. Al-Baqarah: 261</p>
                                        <p className="italic mb-3">
                                            "Perumpamaan orang yang menafkahkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji. Allah melipat gandakan bagi siapa yang Dia kehendaki, dan Allah Maha Luas, Maha Mengetahui."
                                        </p>
                                    </div>
                                </div>

                                {/* QS. Al-Baqarah: 274 */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                                    <div className="text-right mb-4">
                                        <p className="text-xl leading-relaxed font-arabic text-blue-900">
                                            الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ بِاللَّيْلِ وَالنَّهَارِ سِرًّا وَعَلَانِيَةً فَلَهُمْ أَجْرُهُمْ عِنْدَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="font-medium mb-2">QS. Al-Baqarah: 274</p>
                                        <p className="italic mb-3">
                                            "Orang-orang yang menginfakkan hartanya di malam dan siang hari, secara sembunyi dan terang-terangan, mereka mendapat pahala di sisi Tuhannya. Tidak ada rasa takut pada mereka dan mereka tidak bersedih hati."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hadits */}
                        <div>
                            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Sabda Rasulullah ﷺ
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Hadits tentang sedekah */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                                    <div className="text-right mb-4">
                                        <p className="text-lg leading-relaxed font-arabic text-green-900">
                                            مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="italic mb-3">
                                            "Sedekah tidak akan mengurangi harta, dan Allah tidak menambah kepada seorang hamba yang pemaaf kecuali kemuliaan, dan tidaklah seseorang yang merendahkan diri karena Allah kecuali Allah akan meninggikan derajatnya."
                                        </p>
                                        <p className="text-sm text-gray-600">(HR. Muslim)</p>
                                    </div>
                                </div>

                                {/* Hadits tentang jariyah */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                                    <div className="text-right mb-4">
                                        <p className="text-lg leading-relaxed font-arabic text-green-900">
                                            إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ
                                        </p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="italic mb-3">
                                            "Jika manusia meninggal dunia, maka terputuslah amalnya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, atau anak saleh yang mendoakannya."
                                        </p>
                                        <p className="text-sm text-gray-600">(HR. Muslim)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pesan Khusus untuk Donasi Website Al-Quran */}
                        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">💝 Donasi untuk Website Al-Quran sebagai Sedekah Jariyah</h4>
                            <p className="text-gray-700 leading-relaxed">
                                Dengan berdonasi untuk pengembangan website Al-Quran digital ini, Anda ikut serta dalam menyebarkan ilmu agama yang bermanfaat. 
                                Setiap orang yang membaca Al-Quran, belajar tajwid, atau mendapat manfaat dari platform ini, 
                                insyaAllah menjadi pahala yang mengalir untuk Anda sebagai <strong>sedekah jariyah</strong> yang tidak terputus.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Bank Transfer */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <IoWalletOutline className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Transfer Bank</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Bank
                                    </label>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-medium text-gray-900">{bankDetails.bank}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Rekening
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-50 p-3 rounded-lg flex-1">
                                            <span className="font-mono text-lg text-gray-900">{bankDetails.accountNumber}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {copiedAccount ? <IoCheckmarkOutline className="w-5 h-5" /> : <IoCopyOutline className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Atas Nama
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-50 p-3 rounded-lg flex-1">
                                            <span className="font-medium text-gray-900">{bankDetails.accountName}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
                                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {copiedName ? <IoCheckmarkOutline className="w-5 h-5" /> : <IoCopyOutline className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* E-Money */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <IoPhonePortraitOutline className="w-6 h-6 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900">E-Money Digital</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Platform Tersedia
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {eMoneyDetails.providers.map((provider) => (
                                            <span 
                                                key={provider}
                                                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                                            >
                                                {provider}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor E-Money
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-50 p-3 rounded-lg flex-1">
                                            <span className="font-mono text-lg text-gray-900">{eMoneyDetails.number}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(eMoneyDetails.number, 'emoney')}
                                            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            {copiedEMoney ? <IoCheckmarkOutline className="w-5 h-5" /> : <IoCopyOutline className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Atas Nama
                                    </label>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-medium text-gray-900">{eMoneyDetails.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cara Berdonasi</h3>
                        <div className="space-y-3 text-gray-700">
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                <p>Transfer ke salah satu rekening atau e-money di atas dengan nominal sesuai keinginan Anda</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                <p>Simpan bukti transfer untuk konfirmasi</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                <p>Klik tombol "Konfirmasi Donasi" di bawah untuk mengirim bukti transfer</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="text-center mt-8">
                        <button
                            onClick={handleContactForDonation}
                            className="inline-flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                        >
                            <IoSendOutline className="w-6 h-6" />
                            <span>Konfirmasi Donasi</span>
                        </button>
                        <p className="text-sm text-gray-600 mt-3">
                            Tombol ini akan membuka halaman kontak dengan pesan yang sudah dipersiapkan
                        </p>
                    </div>

                    {/* Thank You Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8 text-center">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Jazakallahu Khairan</h3>
                        <p className="text-blue-700">
                            Setiap donasi Anda, sekecil apapun, sangat berarti bagi pengembangan IndoQuran. 
                            Semoga Allah SWT membalas kebaikan Anda dengan berlipat ganda.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SimpleDonationPage;
