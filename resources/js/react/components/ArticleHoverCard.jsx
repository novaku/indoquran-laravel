import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ClockIcon,
    EyeIcon,
    BookOpenIcon,
    ArrowRightIcon,
    SparklesIcon,
    TagIcon,
    UserIcon,
    NewspaperIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

function ArticleHoverCard({ article, index = 0, articleTab = 'terbaru' }) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [popoverPlacement, setPopoverPlacement] = useState('left'); // 'left' | 'right'
    const cardRef = useRef(null);
    const enterTimeoutRef = useRef(null);
    const leaveTimeoutRef = useRef(null);

    // Calculate whether popover should align left or right based on viewport
    const updatePlacement = () => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // If card is on the right half of the screen, anchor popover to right
        if (rect.left + 380 > viewportWidth) {
            setPopoverPlacement('right');
        } else {
            setPopoverPlacement('left');
        }
    };

    const handleMouseEnter = () => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }
        updatePlacement();
        enterTimeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 120);
    };

    const handleMouseLeave = () => {
        if (enterTimeoutRef.current) {
            clearTimeout(enterTimeoutRef.current);
            enterTimeoutRef.current = null;
        }
        leaveTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 180);
    };

    useEffect(() => {
        return () => {
            if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    const imageUrl = article.featured_image_url || (article.featured_image ? `/storage/${article.featured_image}` : null);
    const authorName = article.author?.name || 'Redaksi IndoQuran';

    return (
        <div
            ref={cardRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* BASE CARD */}
            <Link
                to={`/artikel/${article.slug}`}
                className={`group relative flex gap-3.5 p-3.5 rounded-xl border bg-white transition-all duration-200 cursor-pointer ${
                    isHovered
                        ? 'border-emerald-400 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-xs'
                }`}
            >
                {/* Thumbnail */}
                {imageUrl ? (
                    <div className="article-thumb-wrapper w-24 sm:w-28 h-24 sm:h-28 rounded-xl shadow-xs border border-gray-100 ring-1 ring-black/5 bg-gray-50">
                        <img
                            src={imageUrl}
                            alt={article.title}
                            className="article-thumb-img group-hover:scale-105 transition-transform duration-300"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                            loading="lazy"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) {
                                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-emerald-50', 'text-emerald-600');
                                    e.target.parentElement.innerHTML = '<span class="text-xs font-semibold">IndoQuran</span>';
                                }
                            }}
                        />
                        {articleTab === 'populer' && index === 0 && (
                            <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-xs text-[10px] font-bold text-white shadow-xs">
                                #1 Populer
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-500 shadow-2xs">
                        <NewspaperIcon className="w-8 h-8 opacity-75 group-hover:scale-110 transition-transform" />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        {/* Tags */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            {article.tags && article.tags.length > 0 ? (
                                article.tags.slice(0, 2).map((t) => (
                                    <span
                                        key={t.id}
                                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100/80"
                                    >
                                        #{t.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                    Kajian
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                            {article.title}
                        </h3>

                        {/* Excerpt */}
                        {article.excerpt && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1 leading-relaxed">
                                {article.excerpt}
                            </p>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-2 flex-wrap">
                        {article.formatted_date && (
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3 text-gray-400" />
                                <span>{article.formatted_date}</span>
                            </div>
                        )}
                        {article.reading_time && (
                            <span>• {article.reading_time} mnt</span>
                        )}
                        {typeof article.views_count === 'number' && article.views_count > 0 && (
                            <div className="flex items-center gap-1 text-emerald-600/90 font-medium ml-auto">
                                <EyeIcon className="w-3 h-3" />
                                <span>{article.views_count.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* FLOATING HOVER PREVIEW CARD (Visible on hover on desktop / md+) */}
            {isHovered && (
                <div
                    className={`hidden md:block absolute z-50 w-[380px] lg:w-[420px] bg-white rounded-2xl border border-emerald-200/90 shadow-2xl overflow-hidden animate-fadeIn transition-all duration-200 ${
                        popoverPlacement === 'right'
                            ? 'right-0 top-0 origin-top-right'
                            : 'left-0 top-0 origin-top-left'
                    }`}
                    style={{
                        boxShadow: '0 20px 40px -15px rgba(5, 150, 105, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.15)'
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Header Banner Preview */}
                    <div className="article-thumb-wrapper h-44 w-full bg-gradient-to-br from-emerald-800 to-teal-900">
                        {imageUrl ? (
                            <>
                                <img
                                    src={imageUrl}
                                    alt={article.title}
                                    className="article-thumb-img"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-emerald-200 p-4 text-center">
                                <BookOpenIcon className="w-12 h-12 opacity-50 mb-2" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                    Artikel & Wawasan Islami
                                </span>
                            </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-semibold shadow-sm">
                                <SparklesIcon className="w-3 h-3 text-amber-300" />
                                Pratinjau Artikel
                            </span>
                            {article.reading_time && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                                    <ClockIcon className="w-3 h-3 text-emerald-400" />
                                    {article.reading_time} mnt baca
                                </span>
                            )}
                        </div>

                        {/* Bottom image overlay metadata */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
                            <div className="flex items-center gap-1.5 font-medium">
                                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{authorName}</span>
                            </div>
                            {typeof article.views_count === 'number' && (
                                <div className="flex items-center gap-1 text-emerald-300 font-semibold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                    <EyeIcon className="w-3.5 h-3.5" />
                                    <span>{article.views_count.toLocaleString('id-ID')} views</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Content Body */}
                    <div className="p-4 sm:p-5 space-y-3.5">
                        {/* Tags list */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {article.tags.map((tag) => (
                                    <Link
                                        key={tag.id}
                                        to={`/artikel?tag=${tag.slug}`}
                                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors border border-emerald-200/60"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h4 className="text-base font-bold text-gray-900 leading-snug hover:text-emerald-700 transition-colors">
                            <Link to={`/artikel/${article.slug}`}>
                                {article.title}
                            </Link>
                        </h4>

                        {/* Excerpt / Summary */}
                        {article.excerpt && (
                            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 text-xs sm:text-[13px] text-gray-600 leading-relaxed max-h-28 overflow-y-auto">
                                <p className="italic text-gray-700 mb-1 font-medium text-[11px] text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                    <BookOpenIcon className="w-3 h-3" /> Ringkasan Artikel:
                                </p>
                                {article.excerpt}
                            </div>
                        )}

                        {/* Bottom Actions Bar */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                            <div className="text-[11px] text-gray-400">
                                <span>{article.formatted_date || 'Dipublikasikan'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/artikel/${article.slug}`}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                                >
                                    <span>Baca Lengkap</span>
                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                </Link>
                                <a
                                    href={`/artikel/${article.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-gray-100 transition-colors"
                                    title="Buka di tab baru"
                                >
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ArticleHoverCard;
