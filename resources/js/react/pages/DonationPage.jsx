import React, { useState } from 'react';
import { IoHeartOutline, IoCopyOutline, IoCheckmarkOutline, IoShieldCheckmarkOutline, IoGiftOutline, IoWalletOutline, IoSparklesOutline, IoTrophyOutline, IoStarOutline, IoFlashOutline, IoMailOutline, IoSendOutline, IoNotificationsOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';

function DonationPage() {
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedName, setCopiedName] = useState(false);
    const [copiedEMoney, setCopiedEMoney] = useState(false);

    const bankDetails = {
        bank: 'Bank Permata',
        accountNumber: '9906-4392-60',
        accountName: 'Nova Herdi Kusumah'
    };

    const eMoneyDetails = {
        number: '08111101024',
        name: 'Nova Herdi Kusumah',
        providers: ['DANA', 'OVO', 'GOPAY', 'SHOPEE PAY', 'ASTRA PAY']
    };

    // Bank Permata Icon Component
    const BankPermataIcon = () => (
        <div className="relative">
            <div className="w-16 h-10 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-lg shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <div className="text-white font-bold text-xs tracking-wider">
                    PERMATA
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
            </div>
        </div>
    );

    const donationSEO = {
        title: 'Donasi - Dukung IndoQuran',
        description: 'Dukung pengembangan IndoQuran dengan berdonasi melalui Bank Permata atau E-Money (DANA, OVO, GOPAY, SHOPEE PAY, ASTRA PAY). Setelah transfer, hubungi kami untuk konfirmasi donasi. Setiap kontribusi Anda membantu kami menyediakan akses Al-Quran digital yang lebih baik untuk umat Islam Indonesia.',
        keywords: 'donasi, IndoQuran, Al-Quran digital, dukungan, Bank Permata, DANA, OVO, GOPAY, SHOPEE PAY, ASTRA PAY, e-money, sedekah, infaq, kontak, konfirmasi',
        ogType: 'website',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Donasi - IndoQuran',
            description: 'Halaman donasi untuk mendukung pengembangan platform Al-Quran digital IndoQuran melalui transfer bank dan e-money dengan fitur konfirmasi kontak',
            url: `${window.location.origin}/donation`
        }
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
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
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
        }
    };

    return (
        <PageTransition>
            <SEOHead {...donationSEO} />
            <StructuredData data={donationSEO.structuredData} />
            
            {/* Animated Background */}
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pb-20 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-islamic-green/20 to-islamic-gold/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 rounded-full blur-3xl animate-pulse"></div>
                </div>
                
                <div className="max-w-4xl mx-auto px-4 py-8 pt-24 relative z-10">
                    {/* Enhanced Header Section */}
                    <div className="text-center mb-12">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full blur-xl opacity-70 animate-pulse"></div>
                            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-islamic-green via-emerald-500 to-teal-500 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300">
                                <IoHeartOutline className="text-5xl text-white animate-pulse" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                                    <IoSparklesOutline className="text-white text-xs" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-islamic-green via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                            Dukung IndoQuran ✨
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto font-medium">
                            🌟 Bantu kami terus mengembangkan platform Al-Quran digital terbaik untuk umat Islam Indonesia 🌟
                            <br />
                            <span className="text-lg text-gray-600 mt-2 block">💳 Transfer Bank • 📱 E-Money Digital • 🎯 Mudah & Praktis</span>
                        </p>
                    </div>

                    {/* Enhanced Why Donate Section */}
                    <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 mb-8 border border-purple-200/50 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent mb-6 flex items-center">
                            <div className="relative mr-4">
                                <IoGiftOutline className="text-4xl text-purple-600" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-ping"></div>
                            </div>
                            Mengapa Donasi Penting? 🎁
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start transform hover:scale-105 transition-all duration-300">
                                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-lg animate-bounce"></div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/50">
                                        <h3 className="font-bold text-green-800 mb-2 flex items-center">
                                            💻 Server & Hosting
                                        </h3>
                                        <p className="text-green-700 text-sm">Biaya server untuk menjaga IndoQuran tetap online 24/7</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start transform hover:scale-105 transition-all duration-300">
                                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-lg animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50">
                                        <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                                            🚀 Pengembangan Fitur
                                        </h3>
                                        <p className="text-blue-700 text-sm">Mengembangkan fitur baru untuk pengalaman yang lebih baik</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start transform hover:scale-105 transition-all duration-300">
                                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-lg animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200/50">
                                        <h3 className="font-bold text-purple-800 mb-2 flex items-center">
                                            🔧 Pemeliharaan
                                        </h3>
                                        <p className="text-purple-700 text-sm">Menjaga kualitas dan performa aplikasi</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-start transform hover:scale-105 transition-all duration-300">
                                    <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-lg animate-bounce" style={{animationDelay: '0.6s'}}></div>
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200/50">
                                        <h3 className="font-bold text-orange-800 mb-2 flex items-center">
                                            🎵 Audio Berkualitas
                                        </h3>
                                        <p className="text-orange-700 text-sm">Menyediakan audio murottal dari qari terbaik</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start transform hover:scale-105 transition-all duration-300">
                                    <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-lg animate-bounce" style={{animationDelay: '0.8s'}}></div>
                                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200/50">
                                        <h3 className="font-bold text-teal-800 mb-2 flex items-center">
                                            🆓 Akses Gratis
                                        </h3>
                                        <p className="text-teal-700 text-sm">Mempertahankan akses gratis untuk semua pengguna</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start transform hover:scale-105 transition-all duration-300">
                                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-lg animate-bounce" style={{animationDelay: '1s'}}></div>
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200/50">
                                        <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
                                            👥 Tim Pengembang
                                        </h3>
                                        <p className="text-yellow-700 text-sm">Mendukung tim yang bekerja mengembangkan platform</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Donation Details */}
                    <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-8 mb-8 border border-indigo-200/50 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                            <div className="relative mr-4">
                                <IoWalletOutline className="text-4xl text-indigo-600" />
                                <IoStarOutline className="absolute -top-1 -right-1 text-yellow-400 text-lg animate-spin" />
                            </div>
                            Informasi Donasi 💳
                        </h2>
                        
                        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-red-200/50 shadow-inner relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-red-400 to-orange-400 rounded-full blur-xl"></div>
                                <div className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-tl from-yellow-400 to-red-400 rounded-full blur-xl"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-4">
                                        <BankPermataIcon />
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                                {bankDetails.bank} 🏦
                                            </h3>
                                            <p className="text-red-700/80 text-sm font-medium">Bank Terpercaya Indonesia</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <IoTrophyOutline className="text-yellow-500 text-2xl animate-bounce" />
                                        <span className="text-yellow-600 font-bold text-sm">Premium</span>
                                    </div>
                                </div>
                                
                                {/* Enhanced Account Number */}
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-red-800 mb-3 flex items-center">
                                        💳 Nomor Rekening
                                        <IoFlashOutline className="ml-2 text-yellow-500 animate-pulse" />
                                    </label>
                                    <div className="bg-gradient-to-r from-white via-red-50 to-orange-50 rounded-xl border-2 border-red-300/50 p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-mono font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent tracking-wider">
                                                {bankDetails.accountNumber}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                                                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg ${
                                                    copiedAccount 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                                        : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600'
                                                }`}
                                            >
                                                {copiedAccount ? (
                                                    <>
                                                        <IoCheckmarkOutline className="mr-2 text-xl animate-bounce" />
                                                        Tersalin! ✅
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoCopyOutline className="mr-2 text-xl" />
                                                        📋 Salin
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Enhanced Account Name */}
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-red-800 mb-3 flex items-center">
                                        👤 Atas Nama
                                        <IoSparklesOutline className="ml-2 text-purple-500 animate-pulse" />
                                    </label>
                                    <div className="bg-gradient-to-r from-white via-purple-50 to-pink-50 rounded-xl border-2 border-purple-300/50 p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                {bankDetails.accountName}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
                                                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg ${
                                                    copiedName 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                                }`}
                                            >
                                                {copiedName ? (
                                                    <>
                                                        <IoCheckmarkOutline className="mr-2 text-xl animate-bounce" />
                                                        Tersalin! ✅
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoCopyOutline className="mr-2 text-xl" />
                                                        📋 Salin
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Enhanced Instructions */}
                                <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-2xl p-6 border-2 border-blue-300/50 shadow-lg">
                                    <h4 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
                                        <IoShieldCheckmarkOutline className="mr-3 text-2xl text-green-600" />
                                        🚀 Cara Transfer Bank (Super Mudah!)
                                    </h4>
                                    <ol className="text-blue-800 space-y-3 font-medium">
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">1</span>
                                            💰 Transfer ke rekening Bank Permata di atas
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">2</span>
                                            💝 Gunakan nominal sesuai kemampuan Anda
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">3</span>
                                            📸 Simpan bukti transfer sebagai dokumentasi
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">4</span>
                                            📸 Simpan bukti transfer sebagai dokumentasi
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">5</span>
                                            📧 Hubungi kami via halaman kontak untuk konfirmasi donasi
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced E-Money Section */}
                    <div className="bg-gradient-to-br from-white via-cyan-50 to-blue-50 rounded-3xl shadow-2xl p-8 mb-8 border border-cyan-200/50 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center">
                            <div className="relative mr-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">💳</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                            E-Money Digital 📱
                        </h2>
                        
                        <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-cyan-200/50 shadow-inner relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-xl"></div>
                                <div className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-tl from-indigo-400 to-cyan-400 rounded-full blur-xl"></div>
                            </div>
                            
                            <div className="relative z-10">
                                {/* E-Money Providers */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent mb-4 flex items-center">
                                        🚀 Platform Digital yang Tersedia
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {eMoneyDetails.providers.map((provider, index) => (
                                            <div key={provider} className="bg-gradient-to-br from-white to-cyan-50 rounded-xl p-4 border border-cyan-200/50 shadow-lg transform hover:scale-105 transition-all duration-300">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center shadow-md">
                                                        <span className="text-white font-bold text-xs">{provider.charAt(0)}</span>
                                                    </div>
                                                    <div className="text-sm font-bold text-cyan-700">{provider}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* E-Money Number */}
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-cyan-800 mb-3 flex items-center">
                                        📱 Nomor E-Money
                                        <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                    </label>
                                    <div className="bg-gradient-to-r from-white via-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-300/50 p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-mono font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-wider">
                                                {eMoneyDetails.number}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(eMoneyDetails.number, 'emoney')}
                                                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg ${
                                                    copiedEMoney 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                                                }`}
                                            >
                                                {copiedEMoney ? (
                                                    <>
                                                        <IoCheckmarkOutline className="mr-2 text-xl animate-bounce" />
                                                        Tersalin! ✅
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoCopyOutline className="mr-2 text-xl" />
                                                        📋 Salin
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* E-Money Name */}
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-cyan-800 mb-3 flex items-center">
                                        👤 Atas Nama E-Money
                                        <IoSparklesOutline className="ml-2 text-blue-500 animate-pulse" />
                                    </label>
                                    <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300/50 p-6 shadow-lg">
                                        <div className="flex items-center justify-center">
                                            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                {eMoneyDetails.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* E-Money Instructions */}
                                <div className="bg-gradient-to-r from-emerald-100 via-cyan-100 to-blue-100 rounded-2xl p-6 border-2 border-emerald-300/50 shadow-lg">
                                    <h4 className="font-bold text-emerald-800 mb-4 flex items-center text-lg">
                                        <IoShieldCheckmarkOutline className="mr-3 text-2xl text-green-600" />
                                        📲 Cara Transfer E-Money (Praktis!)
                                    </h4>
                                    <ol className="text-emerald-800 space-y-3 font-medium">
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">1</span>
                                            📱 Buka aplikasi e-money pilihan Anda (DANA/OVO/GOPAY/SHOPEE PAY/ASTRA PAY)
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">2</span>
                                            💸 Pilih "Transfer" atau "Kirim Uang"
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">3</span>
                                            🔢 Masukkan nomor: {eMoneyDetails.number}
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">4</span>
                                            ✨ Transfer sesuai kemampuan & ikhlaskan untuk IndoQuran
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">5</span>
                                            📧 Hubungi kami via halaman kontak untuk konfirmasi donasi
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* After Transfer - Contact Section */}
                    <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl shadow-2xl p-8 mb-8 border border-green-200/50 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center">
                            <div className="relative mr-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <IoMailOutline className="text-white text-2xl" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce"></div>
                            </div>
                            Setelah Transfer 📧
                        </h2>
                        
                        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-green-200/50 shadow-inner relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-xl"></div>
                                <div className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-tl from-teal-400 to-green-400 rounded-full blur-xl"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-xl animate-pulse">
                                        <IoNotificationsOutline className="text-white text-3xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-3">
                                        Beri Tahu Kami! 🎉
                                    </h3>
                                    <p className="text-green-700 font-medium text-lg leading-relaxed">
                                        Setelah Anda melakukan transfer, silakan hubungi kami melalui halaman kontak 
                                        untuk mengonfirmasi donasi Anda dan berbagi detail transfer.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-6 border border-green-200/50 shadow-lg">
                                        <h4 className="font-bold text-green-800 mb-4 flex items-center text-lg">
                                            <IoSendOutline className="mr-3 text-2xl text-emerald-600" />
                                            📝 Apa yang Perlu Dilaporkan?
                                        </h4>
                                        <ul className="text-green-700 space-y-3 font-medium">
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">✓</span>
                                                💰 Jumlah yang ditransfer
                                            </li>
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">✓</span>
                                                📅 Tanggal dan waktu transfer
                                            </li>
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">✓</span>
                                                🏦 Metode transfer (Bank/E-Money)
                                            </li>
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">✓</span>
                                                👤 Nama pengirim (opsional)
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 border border-emerald-200/50 shadow-lg">
                                        <h4 className="font-bold text-emerald-800 mb-4 flex items-center text-lg">
                                            <IoMailOutline className="mr-3 text-2xl text-green-600" />
                                            💝 Mengapa Menghubungi Kami?
                                        </h4>
                                        <ul className="text-emerald-700 space-y-3 font-medium">
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">🎯</span>
                                                Konfirmasi donasi diterima
                                            </li>
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">🙏</span>
                                                Terima kasih personal dari tim
                                            </li>
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">📊</span>
                                                Update penggunaan donasi
                                            </li>
                                            <li className="flex items-start">
                                                <span className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-xs mt-1">🤝</span>
                                                Membangun komunitas donatur
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Contact Button */}
                                <div className="text-center mt-8">
                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
                                    >
                                        <IoMailOutline className="mr-3 text-2xl animate-bounce" />
                                        📧 Hubungi Kami Sekarang
                                        <IoSendOutline className="ml-3 text-xl" />
                                    </Link>
                                    <p className="text-green-600 text-sm mt-3 font-medium">
                                        Klik untuk mengisi formulir kontak dan laporkan donasi Anda
                                    </p>
                                </div>

                                {/* Quick Tips */}
                                <div className="bg-gradient-to-r from-yellow-100 via-green-100 to-emerald-100 rounded-2xl p-6 mt-6 border-2 border-yellow-300/50 shadow-lg">
                                    <h4 className="font-bold text-yellow-800 mb-3 flex items-center text-lg">
                                        <span className="text-2xl mr-3">💡</span>
                                        Tips Cepat
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm font-medium">
                                        <div className="flex items-center text-yellow-700">
                                            <span className="text-green-600 mr-2">📸</span>
                                            Screenshot bukti transfer untuk dilampirkan
                                        </div>
                                        <div className="flex items-center text-yellow-700">
                                            <span className="text-blue-600 mr-2">⚡</span>
                                            Semakin cepat lapor, semakin cepat konfirmasi
                                        </div>
                                        <div className="flex items-center text-yellow-700">
                                            <span className="text-purple-600 mr-2">📝</span>
                                            Tulis "Donasi IndoQuran" di subjek pesan
                                        </div>
                                        <div className="flex items-center text-yellow-700">
                                            <span className="text-red-600 mr-2">❤️</span>
                                            Ceritakan motivasi donasi Anda (opsional)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Section */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-islamic-green/10">
                        <h2 className="text-2xl font-bold text-islamic-green mb-6">
                            Dampak Donasi Anda
                        </h2>
                        
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                                <div className="text-sm font-medium text-green-700">Gratis untuk Semua</div>
                                <div className="text-xs text-gray-600 mt-1">Platform tetap gratis selamanya</div>
                            </div>
                            
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-100">
                                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                                <div className="text-sm font-medium text-blue-700">Server Online</div>
                                <div className="text-xs text-gray-600 mt-1">Akses Al-Quran kapan saja</div>
                            </div>
                            
                            <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                                <div className="text-sm font-medium text-purple-700">Pahala Berkelanjutan</div>
                                <div className="text-xs text-gray-600 mt-1">Setiap orang yang membaca</div>
                            </div>
                        </div>
                    </div>

                    {/* Islamic Quote */}
                    <div className="bg-gradient-to-r from-islamic-green to-islamic-gold text-black rounded-3xl p-8 text-center shadow-xl">
                        <div className="mb-4">
                            <span className="text-4xl font-arabic leading-relaxed">
                                مَنْ دَلَّ عَلَىٰ خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ
                            </span>
                        </div>
                        <p className="text-lg italic mb-2">
                            "Barang siapa yang menunjukkan kepada kebaikan, maka baginya pahala seperti pahala orang yang melakukannya"
                        </p>
                        <p className="text-sm opacity-90">
                            - HR. Muslim
                        </p>
                    </div>

                    {/* Thank You Section */}
                    <div className="text-center mt-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-islamic-green to-islamic-gold rounded-full mb-4 shadow-lg">
                            <IoHeartOutline className="text-2xl text-black" />
                        </div>
                        <h3 className="text-2xl font-bold text-islamic-green mb-4">
                            Jazākallāhu Khairan
                        </h3>
                        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Terima kasih atas dukungan dan kepercayaan Anda kepada IndoQuran. 
                            Setiap kontribusi, besar atau kecil, sangat berarti bagi kami dalam 
                            menyediakan akses Al-Quran digital yang berkualitas untuk seluruh umat Islam Indonesia.
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default DonationPage;
