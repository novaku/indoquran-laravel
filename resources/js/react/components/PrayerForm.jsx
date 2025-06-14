import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/apiUtils';

const PrayerForm = ({ onSubmit, loading, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'umum',
        is_anonymous: false
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetchWithAuth('/api/kategori-doa');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Gagal memuat kategori:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-islamic-green to-islamic-gold rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                    🤲 Kirim Doa Bersama
                </h3>
            </div>
            
            <form onSubmit={handleSubmit} encType="application/x-www-form-urlencoded" className="space-y-4">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-2">
                        Judul Doa *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Contoh: Doa untuk kesehatan keluarga"
                        className="w-full px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green focus:bg-white text-gray-900"
                        required
                        maxLength={255}
                    />
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-800 mb-2">
                        Kategori *
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green focus:bg-white text-gray-900"
                        required
                    >
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-800 mb-2">
                        Isi Doa *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Tuliskan doa Anda di sini..."
                        rows={4}
                        className="w-full px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green focus:bg-white resize-none text-gray-900"
                        required
                        maxLength={2000}
                    />
                    <div className="text-right text-xs text-gray-600 mt-1">
                        {formData.content.length}/2000 karakter
                    </div>
                </div>

                {/* Anonymous option */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_anonymous"
                        name="is_anonymous"
                        checked={formData.is_anonymous}
                        onChange={handleChange}
                        className="h-4 w-4 text-islamic-green focus:ring-islamic-green rounded"
                    />
                    <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-800">
                        Kirim sebagai anonim (Hamba Allah)
                    </label>
                </div>

                {/* Guidelines */}
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-md p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Panduan Mengirim Doa:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Gunakan bahasa yang sopan dan menghormati</li>
                        <li>• Fokus pada doa dan harapan positif</li>
                        <li>• Hindari konten yang menyinggung atau kontroversial</li>
                        <li>• Doa yang tidak sesuai akan dihapus moderator</li>
                    </ul>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-3 text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.title.trim() || !formData.content.trim()}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {loading ? 'Mengirim Doa...' : 'Kirim Doa Bersama'}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PrayerForm;
