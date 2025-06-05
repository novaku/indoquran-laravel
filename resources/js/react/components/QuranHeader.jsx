import React from 'react';

const QuranHeader = ({ className = "" }) => {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-4xl md:text-5xl font-arabic font-bold mb-2" style={{ color: '#2d603d' }}>
        القرآن الكريم
      </h1>
      <p className="text-md md:text-lg" style={{ color: '#4d7c5f' }}>
        Al-Quran Mulia - Mushaf Digital
      </p>
    </div>
  );
};

export default QuranHeader;
