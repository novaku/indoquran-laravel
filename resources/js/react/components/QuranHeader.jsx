import React from 'react';

function QuranHeader({ className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      {/* Header Container with Enhanced Design */}
      <div className="quran-header-container islamic-pattern relative py-16 px-6 mb-8 rounded-3xl shadow-2xl border border-emerald-200/30">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 rounded-3xl"></div>
        
        {/* Logo and Title Container */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Logo with Enhanced Animation */}
          <div className="transform transition-all duration-700 hover:scale-110 float-animation">
            <div className="relative">
              {/* Multiple Glow Layers */}
              <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-2xl logo-glow"></div>
              <div className="absolute inset-0 bg-green-300/20 rounded-full blur-xl animate-pulse"></div>
              
              {/* Logo Container with Glass Effect */}
              <div className="relative glass-effect p-6 rounded-full shadow-2xl border-4 border-white/50 logo-glow">
                <img 
                  src="/images/quran-logo.png" 
                  alt="Al-Quran Logo" 
                  className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain filter drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Arabic Title with Enhanced Styling */}
          <div className="space-y-4">
            <h1 className="arabic-title font-arabic-header text-5xl md:text-7xl lg:text-8xl leading-tight transform transition-all duration-500 hover:scale-105" 
                style={{ 
                  fontFamily: 'Scheherazade New, Amiri, serif',
                  textShadow: '0 4px 8px rgba(6, 95, 70, 0.2), 0 2px 4px rgba(6, 95, 70, 0.3)',
                }}>
              القرآن الكريم
            </h1>
            
            {/* Enhanced Decorative Line */}
            <div className="flex items-center justify-center space-x-6">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-emerald-300 w-20 rounded-full"></div>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full pulse-dot"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full pulse-dot" style={{ animationDelay: '0.6s' }}></div>
              </div>
              <div className="h-0.5 bg-gradient-to-l from-transparent via-emerald-500 to-emerald-300 w-20 rounded-full"></div>
            </div>
          </div>

          {/* Enhanced Subtitle */}
          <div className="space-y-3 transform transition-all duration-500 hover:scale-105">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide" 
               style={{ 
                 background: 'linear-gradient(135deg, #047857, #059669, #10b981)',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 backgroundClip: 'text',
                 textShadow: '0 2px 4px rgba(4, 120, 87, 0.1)'
               }}>
              Al-Quran Mulia
            </p>
            <p className="text-base md:text-lg text-emerald-700/90 font-medium tracking-wider">
              ✨ Mushaf Digital Indonesia ✨
            </p>
            <p className="text-sm md:text-base text-emerald-600/70 font-light italic">
              "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ"
            </p>
          </div>

          {/* Islamic Geometric Pattern */}
          <div className="flex items-center justify-center space-x-3 mt-6">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className={`rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 pulse-dot ${
                  i === 3 ? 'w-4 h-4' : i === 1 || i === 5 ? 'w-3 h-3' : 'w-2 h-2'
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Inspirational Quote */}
          <div className="mt-4 max-w-md">
            <p className="text-xs md:text-sm text-emerald-600/60 font-light text-center leading-relaxed">
              "Dan Kami turunkan dari Al-Quran suatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman"
            </p>
            <p className="text-xs text-emerald-500/50 font-light text-center mt-1">
              — Al-Isra: 82 —
            </p>
          </div>
        </div>

        {/* Enhanced Corner Decorations */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l-3 border-t-3 border-emerald-400/60 rounded-tl-2xl corner-decoration"></div>
        <div className="absolute top-6 right-6 w-12 h-12 border-r-3 border-t-3 border-emerald-400/60 rounded-tr-2xl corner-decoration"></div>
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l-3 border-b-3 border-emerald-400/60 rounded-bl-2xl corner-decoration"></div>
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-3 border-b-3 border-emerald-400/60 rounded-br-2xl corner-decoration"></div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-300/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-green-300/40 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-teal-300/40 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 right-1/6 w-1 h-1 bg-emerald-400/40 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
}

export default QuranHeader;
