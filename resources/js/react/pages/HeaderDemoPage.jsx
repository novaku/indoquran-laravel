import React from 'react';
import QuranHeader from '../components/QuranHeader';

function HeaderDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header Demo Section */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Header Showcase */}
        <QuranHeader className="mb-16" />
        
        {/* Description Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-emerald-100/50">
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">
              Beautiful Quran Header Design
            </h2>
            <p className="text-lg text-emerald-700 leading-relaxed">
              This enhanced header features a beautiful Islamic design with the Quran logo, 
              elegant Arabic typography, animated elements, and inspirational verses. 
              The design includes glass morphism effects, gradient backgrounds, 
              floating animations, and Islamic geometric patterns.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-emerald-100/30">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🕌</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Islamic Design</h3>
              <p className="text-emerald-600">Beautiful Islamic patterns and geometric elements</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-emerald-100/30">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Animations</h3>
              <p className="text-emerald-600">Smooth floating and glow animations</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-emerald-100/30">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Glass Effect</h3>
              <p className="text-emerald-600">Modern glass morphism with backdrop blur</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-emerald-100/30">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Arabic Typography</h3>
              <p className="text-emerald-600">Beautiful Arabic fonts with gradient text</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-emerald-100/30">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Logo Integration</h3>
              <p className="text-emerald-600">Quran logo with glowing effects</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-emerald-100/30">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Responsive</h3>
              <p className="text-emerald-600">Fully responsive design for all devices</p>
            </div>
          </div>

          {/* Navigation Back */}
          <div className="mt-12">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-2">←</span>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderDemoPage;
