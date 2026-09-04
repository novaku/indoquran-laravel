import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/apiUtils';

const PrayerForm = ({ onSubmit, loading, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        category: initialData?.category || 'umum',
        is_anonymous: initialData?.is_anonymous || false
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                content: initialData.content || '',
                category: initialData.category || 'umum',
                is_anonymous: initialData.is_anonymous || false
            });
        }
    }, [initialData]);

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
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Doa *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Contoh: Doa untuk kesehatan keluarga"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    required
                    maxLength={255}
                />
            </div>

            {/* Category */}
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                </label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Isi Doa *
                </label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Tuliskan doa Anda di sini..."
                    rows={5}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900"
                    required
                    maxLength={2000}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
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
                    className="h-4 w-4 text-green-600 focus:ring-green-500 rounded border-gray-300"
                />
                <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-700">
                    Kirim sebagai anonim (Hamba Allah)
                </label>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || !formData.title.trim() || !formData.content.trim()}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                >
                    {loading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? 'Mengirim...' : 'Kirim Doa'}
                </button>
            </div>
        </form>
    );
};

export default PrayerForm;
