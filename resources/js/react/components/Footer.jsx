import React from 'react';

function Footer() {
    return (
        <footer className="bg-white py-4 mt-auto border-t border-gray-100 w-full z-10 fixed bottom-0 left-0 shadow-sm">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex space-x-6">
                        <a href="/about" className="text-islamic-green hover:text-islamic-gold transition-colors">Tentang</a>
                        <a href="/privacy" className="text-islamic-green hover:text-islamic-gold transition-colors">Privasi</a>
                        <a href="/contact" className="text-islamic-green hover:text-islamic-gold transition-colors">Kontak</a>
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
