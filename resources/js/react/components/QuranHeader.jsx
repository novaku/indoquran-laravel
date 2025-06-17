import React from 'react';
import PWAStatus from './PWAStatus';

function QuranHeader({ className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      {/* Header Container with Enhanced Modern Design */}
      <div className="quran-header-container relative py-10 px-6 mb-0 rounded-3xl overflow-hidden">
        {/* Sophisticated Background with Multiple Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/95 via-green-50/90 to-emerald-100/85 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(6, 95, 70, 0.08) 0%, transparent 50%)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Logo and Title Container */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Enhanced Logo with Modern Glass Effect */}
          <div className="transform transition-all duration-700 hover:scale-105 group">
            <div className="relative">
              {/* Elegant Glow Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-green-400/25 to-emerald-500/20 rounded-full blur-3xl scale-150 group-hover:scale-175 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-emerald-300/15 rounded-full blur-xl animate-pulse"></div>
              
              {/* Modern Logo Container with Refined Glass Effect */}
              <div className="relative backdrop-blur-sm bg-white/40 p-4 rounded-2xl shadow-2xl border border-white/50 group-hover:bg-white/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                <img 
                  src="/images/quran-logo.png" 
                  alt="Al-Quran Logo" 
                  className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain filter drop-shadow-2xl group-hover:drop-shadow-3xl transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* Modern Arabic Title */}
          <div className="space-y-3">
            <h1 className="font-arabic-header text-3xl md:text-5xl lg:text-6xl leading-tight transform transition-all duration-500 hover:scale-102 cursor-default my-2 text-emerald-700" 
                style={{ 
                  textShadow: '0 4px 12px rgba(6, 95, 70, 0.15)',
                }}>
              القرآن الكريم
            </h1>
            
            {/* Refined Decorative Separator */}
            <div className="flex items-center justify-center space-x-3 group">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400 to-emerald-300 w-12 rounded-full group-hover:w-16 transition-all duration-500"></div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-md" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="h-px bg-gradient-to-l from-transparent via-emerald-400 to-emerald-300 w-12 rounded-full group-hover:w-16 transition-all duration-500"></div>
            </div>
          </div>

          {/* Modern Subtitle Section */}
          <div className="space-y-3 transform transition-all duration-500 group hover:scale-102">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide" 
               style={{ 
                 background: 'linear-gradient(135deg, #065f46, #047857, #059669)',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 backgroundClip: 'text',
               }}>
              Al-Quran Mulia
            </p>
            <p className="text-base md:text-lg text-emerald-700/90 font-semibold tracking-wider">
              <span className="inline-block animate-pulse">✨</span> Mushaf Digital Indonesia <span className="inline-block animate-pulse">✨</span>
            </p>
            <p className="text-sm md:text-base text-emerald-600/80 font-light italic leading-relaxed max-w-lg mx-auto" 
               style={{ fontFamily: 'Scheherazade New, serif' }}>
              "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ"
            </p>
          </div>

          {/* Modern Geometric Pattern */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse shadow-lg ${
                  i === 2 ? 'w-3 h-3' : i === 1 || i === 3 ? 'w-2.5 h-2.5' : 'w-2 h-2'
                }`}
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              ></div>
            ))}
          </div>

          {/* Refined Inspirational Quote */}
          <div className="mt-4 max-w-md mx-auto space-y-2">
            <p className="text-sm text-emerald-700/70 font-medium text-center leading-relaxed px-4">
              "Dan Kami turunkan dari Al-Quran suatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman"
            </p>
            <p className="text-xs text-emerald-600/60 font-light text-center tracking-wide">
              — Al-Isra: 82 —
            </p>
          </div>

          {/* PWA Status */}
          <PWAStatus className="mt-4" />
        </div>

        {/* Modern Corner Accents */}
        <div className="absolute top-5 left-5 w-6 h-6 border-l-2 border-t-2 border-emerald-400/50 rounded-tl-2xl"></div>
        <div className="absolute top-5 right-5 w-6 h-6 border-r-2 border-t-2 border-emerald-400/50 rounded-tr-2xl"></div>
        <div className="absolute bottom-5 left-5 w-6 h-6 border-l-2 border-b-2 border-emerald-400/50 rounded-bl-2xl"></div>
        <div className="absolute bottom-5 right-5 w-6 h-6 border-r-2 border-b-2 border-emerald-400/50 rounded-br-2xl"></div>

        {/* Subtle Floating Elements */}
        <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 bg-emerald-300/30 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 right-1/5 w-1 h-1 bg-green-300/30 rounded-full animate-ping" style={{ animationDelay: '4s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-emerald-400/25 rounded-full animate-ping" style={{ animationDelay: '6s', animationDuration: '3s' }}></div>
      </div>
    </div>
  );
}

export default QuranHeader;
