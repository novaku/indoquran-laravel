<?php

namespace App\Http\Controllers;

use App\Models\SelectedPrayer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
            $prayers = $query->get();
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
     * Get list of categories with item counts
     */
    public function categories(): JsonResponse
    {
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

        $categories = [
            [
                'slug' => 'all',
                'name' => 'Semua Doa',
                'icon' => '✨',
                'count' => $totalCount
            ]
        ];

        foreach ($categoryGroups as $cat) {
            $categories[] = [
                'slug' => $cat->category,
                'name' => $cat->category_name,
                'icon' => $categoryIcons[$cat->category] ?? '🤲',
                'count' => (int) $cat->count
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $categories,
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
