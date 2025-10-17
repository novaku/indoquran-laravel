import React from 'react';
import { CheckCircleIcon, UsersIcon, BookOpenIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';

/**
 * TrustSignals Component - Increases CTR from Google Search
 * Displays credibility indicators to encourage clicks from search results
 */
const TrustSignals = ({ variant = 'homepage', stats = {} }) => {
  const defaultStats = {
    users: '100,000+',
    surahs: '114',
    ayahs: '6,236',
    audio: 'HD Quality',
    ...stats
  };

  if (variant === 'homepage') {
    return (
      <div className="trust-signals bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 md:p-8 my-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Platform Al-Quran Digital Terpercaya
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Trust Signal 1: Users */}
          <div className="trust-item flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <UsersIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {defaultStats.users}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Muslim Indonesia Pengguna Aktif
            </div>
            <div className="mt-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500 inline" />
              <span className="text-xs text-green-600 dark:text-green-400 ml-1">Terpercaya</span>
            </div>
          </div>

          {/* Trust Signal 2: Complete Content */}
          <div className="trust-item flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <BookOpenIcon className="w-12 h-12 text-green-600 dark:text-green-400 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {defaultStats.surahs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Surah Al-Quran Lengkap
            </div>
            <div className="mt-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500 inline" />
              <span className="text-xs text-green-600 dark:text-green-400 ml-1">Lengkap</span>
            </div>
          </div>

          {/* Trust Signal 3: Audio Quality */}
          <div className="trust-item flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <SpeakerWaveIcon className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              HD
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Audio Murottal Berkualitas Tinggi
            </div>
            <div className="mt-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500 inline" />
              <span className="text-xs text-green-600 dark:text-green-400 ml-1">Jernih</span>
            </div>
          </div>

          {/* Trust Signal 4: Free */}
          <div className="trust-item flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <CheckCircleIcon className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              100%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              GRATIS Tanpa Biaya
            </div>
            <div className="mt-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500 inline" />
              <span className="text-xs text-green-600 dark:text-green-400 ml-1">Selamanya</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="feature-badge">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Teks Arab Asli
              </p>
            </div>
            <div className="feature-badge">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Terjemahan Bahasa Indonesia
              </p>
            </div>
            <div className="feature-badge">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tafsir Lengkap
              </p>
            </div>
            <div className="feature-badge">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bookmark Ayat
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            ✨ Mulai Baca Al-Quran Online Sekarang - 100% GRATIS! ✨
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="trust-signals-compact bg-blue-50 dark:bg-gray-800 rounded-lg p-4 my-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {defaultStats.users} Pengguna
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {defaultStats.surahs} Surah Lengkap
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Audio HD
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              100% GRATIS
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'surah-page') {
    return (
      <div className="trust-signals-surah bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 my-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              📖 Baca Al-Quran Online dengan Fitur Lengkap
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
              <span className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-700 dark:text-gray-300">Teks Arab & Latin</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-700 dark:text-gray-300">Terjemahan Indonesia</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-700 dark:text-gray-300">Audio Murottal</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-700 dark:text-gray-300">Tafsir</span>
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full font-bold shadow-lg">
              <CheckCircleIcon className="w-6 h-6 mr-2" />
              GRATIS
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrustSignals;
