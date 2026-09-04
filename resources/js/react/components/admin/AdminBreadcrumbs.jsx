import React from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { 
    ChevronRightIcon, 
    HomeIcon, 
    ArrowLeftIcon,
    PencilSquareIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const TAB_LABELS = {
    overview: 'Ringkasan',
    traffic: 'Traffic Pengunjung',
    users: 'Pengguna',
    contacts: 'Pesan Masuk',
    prayers: 'Doa Bersama',
    searches: 'Pencarian Populer'
};

const AdminBreadcrumbs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab');

    // Generate breadcrumbs items based on path
    const getBreadcrumbs = () => {
        const path = location.pathname;
        const items = [
            { label: 'Admin', to: '/admin/dashboard', isCurrent: false }
        ];

        if (path === '/admin/dashboard') {
            if (tab && TAB_LABELS[tab]) {
                items.push({ label: 'Dashboard', to: '/admin/dashboard', isCurrent: false });
                items.push({ label: TAB_LABELS[tab], to: null, isCurrent: true });
            } else {
                items.push({ label: 'Dashboard', to: null, isCurrent: true });
            }
        } else if (path === '/admin/artikel') {
            items.push({ label: 'Artikel', to: null, isCurrent: true });
        } else if (path === '/admin/artikel/baru') {
            items.push({ label: 'Artikel', to: '/admin/artikel', isCurrent: false });
            items.push({ label: 'Tulis Artikel Baru', to: null, isCurrent: true });
        } else if (path.startsWith('/admin/artikel/edit/')) {
            items.push({ label: 'Artikel', to: '/admin/artikel', isCurrent: false });
            items.push({ label: 'Edit Artikel', to: null, isCurrent: true });
        } else {
            // General admin path fallback
            const segments = path.replace('/admin/', '').split('/');
            segments.forEach((seg, index) => {
                const label = seg.charAt(0).toUpperCase() + seg.slice(1);
                items.push({
                    label,
                    to: index === segments.length - 1 ? null : `/admin/${seg}`,
                    isCurrent: index === segments.length - 1
                });
            });
        }

        return items;
    };

    const breadcrumbs = getBreadcrumbs();
    const isEditorPage = location.pathname.startsWith('/admin/artikel/baru') || location.pathname.startsWith('/admin/artikel/edit/');
    const isArticlesListPage = location.pathname === '/admin/artikel';

    return (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 py-2.5 shadow-xs transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                
                {/* Left: Breadcrumbs Trail */}
                <nav className="flex items-center space-x-1 text-xs text-gray-500 overflow-x-auto py-0.5" aria-label="Breadcrumb">
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Kembali ke Dashboard"
                    >
                        <HomeIcon className="w-3.5 h-3.5" />
                    </Link>

                    {breadcrumbs.map((item, idx) => (
                        <React.Fragment key={idx}>
                            <ChevronRightIcon className="w-3 h-3 text-gray-300 shrink-0" />
                            {item.isCurrent || !item.to ? (
                                <span className="font-semibold text-emerald-700 truncate">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.to}
                                    className="hover:text-emerald-600 transition-colors truncate"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </React.Fragment>
                    ))}
                </nav>

                {/* Right: Quick Action Contextual Controls */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {isEditorPage && (
                        <button
                            onClick={() => navigate('/admin/artikel')}
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 transition-colors cursor-pointer"
                        >
                            <ArrowLeftIcon className="w-3 h-3" />
                            <span>Kembali ke Daftar Artikel</span>
                        </button>
                    )}

                    {isArticlesListPage && (
                        <Link
                            to="/admin/artikel/baru"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-md shadow-xs transition-colors"
                        >
                            <PencilSquareIcon className="w-3 h-3" />
                            <span>Tulis Artikel Baru</span>
                        </Link>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminBreadcrumbs;
