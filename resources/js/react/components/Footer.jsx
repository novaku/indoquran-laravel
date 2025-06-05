import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-white py-4 mt-auto border-t border-gray-100 w-full z-10 fixed bottom-0 left-0 shadow-sm">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex space-x-6">
                        <Link to="/about" className="text-islamic-green hover:text-islamic-gold transition-colors">Tentang</Link>
                        <Link to="/privacy" className="text-islamic-green hover:text-islamic-gold transition-colors">Privasi</Link>
                        <Link to="/contact" className="text-islamic-green hover:text-islamic-gold transition-colors">Kontak</Link>
                    </div>
                    
                    <div className="mt-3 md:mt-0 text-islamic-brown text-sm">
                        &copy; {new Date().getFullYear()} Al-Quran Digital. Hak Cipta Dilindungi.
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
