<?php

namespace App\Http\Controllers;

use App\Models\SelectedPrayer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class SelectedPrayerController extends Controller
{
    /**
     * Display a listing of selected prayers
     */
    public function index(Request $request): JsonResponse
    {
        $query = SelectedPrayer::query();

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        // Search functionality
        if ($request->filled('search')) {
            $query->search(trim($request->search));
        }

        // Ordering: default by order column ascending
        $query->orderBy('order', 'asc');

        $perPage = (int) $request->get('per_page', 12);
        // Limit max per_page
        $perPage = min(max($perPage, 1), 500);

        if ($request->boolean('all')) {
            $categoryKey = $request->get('category', 'all');
            $searchKey = $request->get('search', '');
            
            // Only cache 'all' query when no specific search is requested
            if (empty($searchKey)) {
                $cacheKey = "selected_prayers_all_cat_{$categoryKey}";
                $prayers = Cache::remember($cacheKey, 86400, function () use ($query) {
                    return $query->get();
                });
            } else {
                $prayers = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $prayers,
                'total' => $prayers->count(),
                'message' => 'Doa-doa pilihan berhasil dimuat'
            ]);
        }

        $paginated = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $paginated,
            'message' => 'Doa-doa pilihan berhasil dimuat'
        ]);
    }

    /**
     * Get cached prayer categories list
     */
    public static function getCachedCategories(): array
    {
        return Cache::remember('selected_prayers_categories_grouped', 86400, function () {
            $totalCount = SelectedPrayer::count();

            $categoryGroups = SelectedPrayer::select('category', 'category_name')
                ->selectRaw('count(*) as count')
                ->groupBy('category', 'category_name')
                ->orderBy('category')
                ->get();

            $categoryIcons = [
                'al-quran' => '📖',
                'para-nabi' => '🤲',
                'sehari-hari' => '☀️',
                'perlindungan' => '🛡️',
                'rezeki' => '💼',
                'kesehatan' => '🌿',
                'taubat' => '🕊️',
                'keluarga' => '👨‍👩‍👧‍👦',
                'ilmu' => '📚',
                'dzikir-waktu' => '🌅',
            ];

            $cats = [
                [
                    'slug' => 'all',
                    'name' => 'Semua Doa',
                    'icon' => '✨',
                    'count' => $totalCount
                ]
            ];

            foreach ($categoryGroups as $cat) {
                $cats[] = [
                    'slug' => $cat->category,
                    'name' => $cat->category_name,
                    'icon' => $categoryIcons[$cat->category] ?? '🤲',
                    'count' => (int) $cat->count
                ];
            }

            return $cats;
        });
    }

    /**
     * Get list of categories with item counts
     */
    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => self::getCachedCategories(),
            'message' => 'Kategori doa pilihan berhasil dimuat'
        ]);
    }

    /**
     * Display a specific selected prayer
     */
    public function show(SelectedPrayer $selectedPrayer): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $selectedPrayer,
            'message' => 'Detail doa pilihan berhasil dimuat'
        ]);
    }
}
