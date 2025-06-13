import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PrayerFilters = ({ filters, onFiltersChange, totalPrayers }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/kategori-doa');
            if (response.data.success) {
                setCategories([
                    { value: 'all', label: 'Semua Kategori' },
                    ...response.data.data
                ]);
            }
        } catch (error) {
            console.error('Gagal memuat kategori:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const sortOptions = [
        { value: 'latest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'popular', label: 'Populer (Amin Terbanyak)' },
        { value: 'featured', label: 'Unggulan' }
    ];

    return (
        <div className="bg-gradient-to-r from-islamic-green/5 to-islamic-gold/5 rounded-lg shadow-islamic p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Cari doa..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-islamic-green focus:bg-white text-gray-900"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Category filter */}
                    <div>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-islamic-green focus:bg-white text-sm text-gray-900"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort filter */}
                    <div>
                        <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-islamic-green focus:bg-white text-sm text-gray-900"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results info */}
            <div className="mt-4 pt-4">
                <p className="text-sm text-gray-700">
                    {totalPrayers > 0 ? (
                        <>
                            Menampilkan {totalPrayers} doa
                            {filters.search && (
                                <> untuk "{filters.search}"</>
                            )}
                            {filters.category !== 'all' && (
                                <> dalam kategori {categories.find(c => c.value === filters.category)?.label}</>
                            )}
                        </>
                    ) : (
                        'Tidak ada doa ditemukan'
                    )}
                </p>
            </div>

            {/* Clear filters */}
            {(filters.search || filters.category !== 'all' || filters.sort !== 'latest') && (
                <div className="mt-3">
                    <button
                        onClick={() => onFiltersChange({ category: 'all', sort: 'latest', search: '' })}
                        className="text-sm text-islamic-green hover:text-islamic-green/80 transition-colors duration-200"
                    >
                        Hapus semua filter
                    </button>
                </div>
            )}
        </div>
    );
};

export default PrayerFilters;
