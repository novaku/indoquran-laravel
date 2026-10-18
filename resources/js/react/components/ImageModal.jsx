import React, { useEffect } from 'react';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

export default function ImageModal({ isOpen, src, alt, caption, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={caption || alt || 'Pratinjau gambar'}
    >
      {/* Floating close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition-all shadow-xl hover:scale-110 border border-white/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Tutup pratinjau gambar"
        title="Tutup (Esc)"
      >
        <FaTimes className="text-lg sm:text-xl" />
      </button>

      {/* Main modal container */}
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image wrapper */}
        <div className="relative max-h-[75vh] sm:max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black/40 flex items-center justify-center">
          <img
            src={src}
            alt={alt || ''}
            className="max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full object-contain select-none transition-transform duration-300"
          />
        </div>

        {/* Caption & Quick Actions bar */}
        {(caption || src) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm max-w-full shadow-lg">
            {caption ? (
              <p className="text-gray-200 font-medium truncate max-w-md sm:max-w-lg md:max-w-xl text-center sm:text-left">
                {caption}
              </p>
            ) : <div />}

            <div className="flex items-center gap-2">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition-colors border border-white/10"
                title="Buka gambar di tab baru"
              >
                <FaExternalLinkAlt className="text-[10px]" />
                <span>Ukuran Asli</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                <FaTimes className="text-[11px]" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
