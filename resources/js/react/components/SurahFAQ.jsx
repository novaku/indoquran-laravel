import React from 'react';

/**
 * SurahFAQ Component - Optimized for Google Featured Snippets
 * Implements FAQ Schema markup to increase chances of appearing in search results
 * Based on Google Search Console query analysis
 */
const SurahFAQ = ({ surah }) => {
  if (!surah) return null;

  // Generate FAQs based on common search queries
  const faqs = generateSurahFAQs(surah);

  return (
    <div className="surah-faq bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ❓ Pertanyaan Umum tentang Surat {surah.name_latin}
      </h2>
      
      <div 
        itemScope 
        itemType="https://schema.org/FAQPage"
        className="space-y-4"
      >
        {faqs.map((faq, index) => (
          <div
            key={index}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
            className="faq-item border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
          >
            <h3 
              itemProp="name"
              className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2"
            >
              {faq.question}
            </h3>
            <div
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div 
                itemProp="text"
                className="text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          ✅ Informasi terverifikasi dari sumber terpercaya | 📖 Al-Quran Digital Indonesia
        </p>
      </div>
    </div>
  );
};

/**
 * Generate FAQs based on surah data
 * Optimized for common search queries from Google Search Console
 */
const generateSurahFAQs = (surah) => {
  const faqs = [];
  
  // FAQ 1: Jumlah Ayat (most searched query)
  faqs.push({
    question: `Surat ${surah.name_latin} berapa ayat?`,
    answer: `Surat ${surah.name_latin} terdiri dari <strong>${surah.total_ayahs} ayat</strong>. Merupakan surah ke-${surah.number} dalam Al-Quran dan termasuk golongan surah <strong>${surah.revelation_place === 'Mekah' ? 'Makkiyah (diturunkan di Mekah)' : 'Madaniyah (diturunkan di Madinah)'}</strong>.`
  });
  
  // FAQ 2: Arti/Makna nama surah
  if (surah.meaning || surah.translation) {
    faqs.push({
      question: `Apa arti ${surah.name_latin}?`,
      answer: `${surah.name_latin} artinya <strong>${surah.meaning || surah.translation || 'yang ' + surah.name_latin}</strong>. Nama ini diambil dari ${getNameOriginInfo(surah)}.`
    });
  }
  
  // FAQ 3: Urutan surah
  faqs.push({
    question: `Surat ${surah.name_latin} urutan ke berapa?`,
    answer: `Surat ${surah.name_latin} adalah surah <strong>ke-${surah.number}</strong> dalam urutan mushaf Al-Quran, dari total 114 surah. ${getOrderingInfo(surah)}`
  });
  
  // FAQ 4: Tempat turun
  faqs.push({
    question: `Surat ${surah.name_latin} diturunkan di mana?`,
    answer: `Surat ${surah.name_latin} diturunkan di <strong>${surah.revelation_place || 'Mekah'}</strong>. ${getRevelationPlaceInfo(surah)}`
  });
  
  // FAQ 5: Kandungan/tema surah
  if (surah.description || surah.theme) {
    faqs.push({
      question: `Apa isi kandungan Surat ${surah.name_latin}?`,
      answer: `Surat ${surah.name_latin} ${surah.description || getThemeInfo(surah)}`
    });
  }
  
  // Special FAQs for popular surahs
  if (surah.number === 96) { // Al-Alaq
    faqs.push({
      question: `Mengapa Surat Al Alaq penting?`,
      answer: `Surat Al Alaq sangat penting karena merupakan <strong>wahyu pertama</strong> yang diturunkan kepada Nabi Muhammad SAW. Lima ayat pertama dari surah ini adalah ayat pertama yang diterima Rasulullah di Gua Hira. Surah ini menekankan pentingnya <strong>membaca dan menuntut ilmu</strong> dalam Islam.`
    });
  }
  
  if (surah.number === 36) { // Yasin
    faqs.push({
      question: `Mengapa Surat Yasin disebut jantung Al-Quran?`,
      answer: `Surat Yasin disebut <strong>"Qalbul Quran" (Jantung Al-Quran)</strong> berdasarkan hadits Nabi Muhammad SAW. Surat ini memiliki keutamaan luar biasa dan sering dibaca untuk berbagai keperluan spiritual, termasuk untuk orang yang meninggal dunia.`
    });
  }
  
  if (surah.number === 2) { // Al-Baqarah
    faqs.push({
      question: `Mengapa Surat Al Baqarah paling panjang?`,
      answer: `Surat Al Baqarah adalah <strong>surah terpanjang</strong> dalam Al-Quran dengan ${surah.total_ayahs} ayat. Panjangnya karena memuat berbagai tema penting: hukum Islam, kisah para nabi, akidah, ibadah, dan muamalah. Surat ini juga mengandung <strong>Ayat Kursi</strong> yang sangat mulia.`
    });
  }
  
  if (surah.number === 18) { // Al-Kahfi
    faqs.push({
      question: `Kapan waktu terbaik membaca Surat Al Kahfi?`,
      answer: `Waktu terbaik membaca Surat Al Kahfi adalah pada <strong>hari Jumat</strong>. Dalam hadits disebutkan bahwa barangsiapa membaca Surat Al Kahfi pada hari Jumat, akan diberi cahaya antara dua Jumat dan akan dilindungi dari fitnah Dajjal.`
    });
  }
  
  return faqs;
};

/**
 * Helper functions to generate contextual information
 */
const getNameOriginInfo = (surah) => {
  const specialCases = {
    96: 'kata "Alaq" (segumpal darah) yang terdapat pada ayat ke-2',
    2: 'kisah lembu betina (Al-Baqarah) yang disebutkan dalam surah ini',
    18: 'kisah penghuni gua (Ashhabul Kahfi) yang disebutkan di dalamnya',
    36: 'huruf Yasin yang merupakan pembuka surah ini',
    1: 'kata "Al-Fatihah" yang berarti pembukaan, karena surah ini membuka Al-Quran',
    112: 'tema tentang keikhlasan (Ikhlas) dalam beribadah kepada Allah'
  };
  
  return specialCases[surah.number] || `salah satu kata penting dalam surah ke-${surah.number} ini`;
};

const getOrderingInfo = (surah) => {
  if (surah.number === 1) return 'Surah ini juga disebut Ummul Quran (Induk Al-Quran).';
  if (surah.number === 114) return 'Ini adalah surah terakhir dalam mushaf Al-Quran.';
  if (surah.number <= 7) return 'Termasuk dalam kelompok As-Sab\'ul Mathani (tujuh surah panjang).';
  return '';
};

const getRevelationPlaceInfo = (surah) => {
  if (surah.revelation_place === 'Mekah' || !surah.revelation_place) {
    return 'Surah Makkiyah umumnya berisi tentang tauhid, hari akhir, dan kisah para nabi.';
  } else {
    return 'Surah Madaniyah umumnya berisi tentang hukum-hukum Islam, ibadah, dan muamalah.';
  }
};

const getThemeInfo = (surah) => {
  const themes = {
    96: 'mengajarkan tentang pentingnya membaca dan menuntut ilmu pengetahuan. Ayat pertamanya adalah "Iqra" yang berarti "Bacalah".',
    2: 'membahas berbagai tema: hukum waris, puasa, haji, jihad, riba, dan masih banyak lagi.',
    36: 'berisi tentang keimanan, kebangkitan, dan pembalasan di hari akhir.',
    18: 'memuat empat kisah penting: Ashhabul Kahfi, pemilik dua kebun, Nabi Musa dan Khidir, serta Dzulqarnain.',
    1: 'adalah doa terbaik yang diajarkan Allah kepada hamba-Nya.',
    112: 'menjelaskan tentang keesaan Allah dan menafikan segala bentuk syirik.'
  };
  
  return themes[surah.number] || 'membahas berbagai aspek kehidupan dan keimanan dalam Islam.';
};

export default SurahFAQ;
