import React from 'react';

function AboutPage() {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-islamic-green mb-6 border-b pb-3">Tentang IndoQuran</h1>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-islamic-brown mb-3">Visi Kami</h2>
                <p className="text-gray-700 leading-relaxed">
                    IndoQuran bertujuan untuk memudahkan akses terhadap Al-Quran dan terjemahannya dalam bahasa Indonesia
                    bagi seluruh umat Islam di Indonesia. Kami berkomitmen untuk menyediakan platform yang intuitif,
                    akurat, dan bermanfaat untuk pembelajaran dan pendalaman Al-Quran.
                </p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-islamic-brown mb-3">Fitur Utama</h2>
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
                <h2 className="text-xl font-semibold text-islamic-brown mb-3">Sumber Data</h2>
                <p className="text-gray-700 leading-relaxed">
                    Teks Al-Quran dan terjemahan yang digunakan dalam aplikasi ini bersumber dari Kementerian Agama 
                    Republik Indonesia. Kami berkomitmen untuk menjaga ketepatan dan integritas dari setiap ayat 
                    dan terjemahan yang disajikan.
                </p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-islamic-brown mb-3">Pengembangan</h2>
                <p className="text-gray-700 leading-relaxed">
                    IndoQuran dikembangkan menggunakan teknologi modern seperti Laravel, React, dan Tailwind CSS.
                    Kami terus melakukan pembaruan dan peningkatan berdasarkan masukan dari pengguna untuk
                    menyempurnakan pengalaman membaca dan mempelajari Al-Quran.
                </p>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold text-islamic-brown mb-3">Kontak</h2>
                <p className="text-gray-700 leading-relaxed">
                    Jika Anda memiliki pertanyaan, saran, atau masukan, silahkan hubungi kami melalui
                    halaman Kontak atau kirim email ke <a href="mailto:info@indoquran.id" className="text-islamic-green hover:underline">info@indoquran.id</a>.
                </p>
            </section>
        </div>
    );
}

export default AboutPage;
