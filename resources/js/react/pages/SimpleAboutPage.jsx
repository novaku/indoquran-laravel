import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoInformationCircleOutline } from 'react-icons/io5';
import SEOHead from '../components/SEOHead';

function AboutPage() {
    const navigate = useNavigate();

    return (
        <>
            <SEOHead 
                title="Tentang IndoQuran - Platform Al-Quran Digital Indonesia"
                description="Pelajari lebih lanjut tentang IndoQuran, platform digital untuk membaca dan mempelajari Al-Quran dengan terjemahan bahasa Indonesia"
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
                            <IoInformationCircleOutline className="w-6 h-6 text-green-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Tentang IndoQuran</h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Visi Kami</h2>
                            <p className="text-gray-700 leading-relaxed">
                                IndoQuran bertujuan untuk memudahkan akses terhadap Al-Quran dan terjemahannya dalam bahasa Indonesia
                                bagi seluruh umat Islam di Indonesia. Kami berkomitmen untuk menyediakan platform yang intuitif,
                                akurat, dan bermanfaat untuk pembelajaran dan pendalaman Al-Quran.
                            </p>
                        </section>
                        
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fitur Utama</h2>
                            <ul className="list-disc pl-5 text-gray-700 space-y-2">
                                <li>Akses ke seluruh 114 surah Al-Quran</li>
                                <li>Terjemahan bahasa Indonesia</li>
                                <li>Pencarian ayat dan kata kunci</li>
                                <li>Penanda ayat favorit dengan fitur bookmark</li>
                                <li>Tampilan yang responsif untuk berbagai perangkat</li>
                                <li>Mode audio untuk mendengarkan bacaan Al-Quran</li>
                            </ul>
                        </section>
                        
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sumber Data</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Teks Al-Quran dan terjemahan yang digunakan dalam aplikasi ini bersumber dari Kementerian Agama 
                                Republik Indonesia. Kami berkomitmen untuk menjaga ketepatan dan integritas dari setiap ayat 
                                dan terjemahan yang disajikan.
                            </p>
                        </section>
                        
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengembangan</h2>
                            <p className="text-gray-700 leading-relaxed">
                                IndoQuran dikembangkan menggunakan teknologi modern seperti Laravel, React, dan Tailwind CSS.
                                Kami terus melakukan pembaruan dan peningkatan berdasarkan masukan dari pengguna untuk
                                menyempurnakan pengalaman membaca dan mempelajari Al-Quran.
                            </p>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kontak</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Jika Anda memiliki pertanyaan, saran, atau masukan, silahkan hubungi kami melalui
                                halaman <button 
                                    onClick={() => navigate('/kontak')}
                                    className="text-green-600 hover:text-green-800 hover:underline font-medium"
                                >
                                    Kontak
                                </button> atau kirim email ke{' '}
                                <a href="mailto:kontak@indoquran.web.id" className="text-green-600 hover:text-green-800 hover:underline">
                                    kontak@indoquran.web.id
                                </a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AboutPage;
