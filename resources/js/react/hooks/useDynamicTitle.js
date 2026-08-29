import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Mapping of base route paths to standard titles based on URL
 */
export const getRouteDefaultTitle = (pathname, search = '') => {
    let path = pathname || '/';
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    if (path === '' || path === '/') {
        return 'AlQuran Online Indonesia - Baca, Dengar, Terjemahan | IndoQuran';
    }

    if (path === '/surah') {
        return 'Daftar Surah Al-Quran - 114 Surah Lengkap | IndoQuran';
    }

    const surahMatch = path.match(/^\/surah\/(\d+)(?:\/(\d+))?$/);
    if (surahMatch) {
        const surahNum = surahMatch[1];
        const ayahNum = surahMatch[2];
        if (ayahNum) {
            return `Surah ${surahNum} Ayat ${ayahNum} | IndoQuran`;
        }
        return `Surah ${surahNum} | IndoQuran`;
    }

    if (path === '/cari') {
        const params = new URLSearchParams(search);
        const q = params.get('q');
        return q ? `Hasil Pencarian "${q}" | IndoQuran` : 'Pencarian Al-Quran | IndoQuran';
    }

    if (path === '/juz') {
        return 'Daftar Juz Al-Quran - Teks Arab | IndoQuran';
    }

    const juzMatch = path.match(/^\/juz\/(\d+)$/);
    if (juzMatch) {
        return `Juz ${juzMatch[1]} - Teks Arab Al-Quran | IndoQuran`;
    }

    if (path === '/halaman') {
        return 'Daftar Halaman Al-Quran - Teks Arab | IndoQuran';
    }

    const halMatch = path.match(/^\/halaman\/(\d+)$/);
    if (halMatch) {
        return `Halaman ${halMatch[1]} - Al-Quran Digital | IndoQuran`;
    }

    if (path === '/tafsir-maudhui') {
        return 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran';
    }

    if (path.startsWith('/tafsir-maudhui/')) {
        return 'Tafsir Maudhui | IndoQuran';
    }

    if (path === '/asmaul-husna') {
        return '99 Asmaul Husna - Nama-nama Indah Allah SWT Lengkap dengan Makna | IndoQuran';
    }

    if (path.startsWith('/asmaul-husna/')) {
        return 'Asmaul Husna | IndoQuran';
    }

    if (path === '/doa-bersama') {
        return 'Doa Bersama - Komunitas Doa Muslim | IndoQuran';
    }

    if (path === '/tentang') {
        return 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia';
    }

    if (path === '/kontak') {
        return 'Kontak Kami | IndoQuran';
    }

    if (path === '/donasi') {
        return 'Donasi - Dukung IndoQuran | IndoQuran';
    }

    if (path === '/member' || path === '/keuntungan-member') {
        return 'Keuntungan Member - IndoQuran';
    }

    if (path === '/kebijakan') {
        return 'Kebijakan Privasi - IndoQuran';
    }

    if (path === '/riwayat-versi') {
        return 'Riwayat Versi - IndoQuran';
    }

    if (path === '/statistik') {
        return 'Statistik Pengunjung - IndoQuran';
    }

    if (path === '/artikel') {
        return 'Artikel & Wawasan Islami - IndoQuran';
    }

    if (path.startsWith('/artikel/')) {
        return 'Artikel Islami | IndoQuran';
    }

    if (path === '/penanda') {
        return 'Penanda Ayat Favorit - IndoQuran';
    }

    if (path === '/profil') {
        return 'Profil Pengguna - IndoQuran';
    }

    if (path === '/masuk' || path === '/auth' || path === '/login') {
        return 'Masuk / Daftar Aku - IndoQuran';
    }

    if (path === '/lupa-password') {
        return 'Lupa Password - IndoQuran';
    }

    if (path.startsWith('/reset-password')) {
        return 'Reset Password - IndoQuran';
    }

    if (path === '/admin/login') {
        return 'Admin Login - IndoQuran';
    }

    if (path === '/admin/dashboard') {
        return 'Admin Dashboard - IndoQuran';
    }

    if (path === '/admin/artikel') {
        return 'Kelola Artikel - IndoQuran';
    }

    if (path.startsWith('/admin/artikel/')) {
        return 'Editor Artikel - IndoQuran';
    }

    return 'IndoQuran - Al-Quran Digital Indonesia';
};

/**
 * Hook to automatically update the document title based on the active route
 */
export const useDynamicTitle = () => {
    const location = useLocation();

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const defaultTitle = getRouteDefaultTitle(location.pathname, location.search);
        document.title = defaultTitle;
    }, [location.pathname, location.search]);
};

export default useDynamicTitle;
