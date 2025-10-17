import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PopularSurahs Component - Internal Linking Strategy
 * Based on Google Search Console data analysis
 * Increases time on site and reduces bounce rate
 */
const PopularSurahs = () => {
  // Top surahs based on search volume and religious importance
  const popularSurahs = [
    { 
      id: 96, 
      name: 'Al Alaq', 
      nameArabic: 'العلق',
      description: 'Wahyu Pertama Turun', 
      icon: '📖',
      ayahs: 19,
      searchVolume: 'high' // Based on GSC: 46 impressions
    },
    { 
      id: 1, 
      name: 'Al Fatihah', 
      nameArabic: 'الفاتحة',
      description: 'Pembukaan Al-Quran', 
      icon: '🤲',
      ayahs: 7,
      searchVolume: 'high'
    },
    { 
      id: 2, 
      name: 'Al Baqarah', 
      nameArabic: 'البقرة',
      description: 'Surah Terpanjang', 
      icon: '📚',
      ayahs: 286,
      searchVolume: 'high' // Based on GSC: 35+ queries
    },
    { 
      id: 18, 
      name: 'Al Kahfi', 
      nameArabic: 'الكهف',
      description: 'Dibaca Setiap Jumat', 
      icon: '🕌',
      ayahs: 110,
      searchVolume: 'medium'
    },
    { 
      id: 36, 
      name: 'Yasin', 
      nameArabic: 'يس',
      description: 'Jantung Al-Quran', 
      icon: '❤️',
      ayahs: 83,
      searchVolume: 'high'
    },
    { 
      id: 55, 
      name: 'Ar Rahman', 
      nameArabic: 'الرحمن',
      description: 'Penuh Keajaiban', 
      icon: '✨',
      ayahs: 78,
      searchVolume: 'medium'
    },
    { 
      id: 56, 
      name: 'Al Waqiah', 
      nameArabic: 'الواقعة',
      description: 'Penolak Kemiskinan', 
      icon: '💎',
      ayahs: 96,
      searchVolume: 'medium'
    },
    { 
      id: 67, 
      name: 'Al Mulk', 
      nameArabic: 'الملك',
      description: 'Penyelamat dari Kubur', 
      icon: '🛡️',
      ayahs: 30,
      searchVolume: 'medium'
    }
  ];

  return (
    <section className="popular-surahs my-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            🌟 Surah Populer Al-Quran
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Mulai baca surah-surah yang paling banyak dicari dan diamalkan oleh umat Muslim
          </p>
        </div>
        
        {/* Surah Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {popularSurahs.map((surah) => (
            <Link
              key={surah.id}
              to={`/surah/${surah.id}`}
              className="popular-surah-card group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-5 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transform hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="text-5xl mb-3 text-center group-hover:scale-110 transition-transform duration-300">
                {surah.icon}
              </div>
              
              {/* Surah Name */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                Surah {surah.name}
              </h3>
              
              {/* Arabic Name */}
              <p className="text-2xl text-center mb-2 text-gray-700 dark:text-gray-300 font-arabic">
                {surah.nameArabic}
              </p>
              
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                {surah.description}
              </p>
              
              {/* Ayah Count */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
                  {surah.ayahs} Ayat
                </span>
              </div>
              
              {/* CTA */}
              <div className="mt-auto text-center">
                <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Baca Sekarang
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            to="/surah"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span>Lihat Semua 114 Surah</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* SEO Text (hidden but indexed) */}
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400 text-center max-w-4xl mx-auto">
          <p>
            Baca dan pelajari Al-Quran online dengan mudah. IndoQuran menyediakan akses gratis ke semua surah Al-Quran 
            lengkap dengan teks Arab, bacaan latin, terjemahan bahasa Indonesia, audio murottal berkualitas tinggi, dan tafsir. 
            Platform Al-Quran digital terpercaya untuk belajar Islam kapan saja, di mana saja.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PopularSurahs;
