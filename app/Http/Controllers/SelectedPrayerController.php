<?php

namespace App\Http\Controllers;

use App\Models\SelectedPrayer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
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

    /**
     * Stream or generate MP3 audio for selected prayer Arabic text
     */
    public function audio(SelectedPrayer $selectedPrayer)
    {
        $dir = storage_path('app/public/audio/doa');
        $filePath = "{$dir}/doa_{$selectedPrayer->id}.mp3";

        if (!file_exists($filePath)) {
            File::ensureDirectoryExists($dir);
            $mp3 = $this->generateArabicAudio($selectedPrayer->arabic);
            if (!empty($mp3)) {
                file_put_contents($filePath, $mp3);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Audio tidak tersedia untuk doa ini'
                ], 404);
            }
        }

        return response()->file($filePath, [
            'Content-Type' => 'audio/mpeg',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }

    /**
     * Helper to generate Arabic audio via chunked Google Translate TTS
     */
    private function generateArabicAudio(string $arabicText): ?string
    {
        $words = preg_split('/([،,.؟?!\s]+)/u', $arabicText, -1, PREG_SPLIT_DELIM_CAPTURE);
        $chunks = [];
        $current = '';
        foreach ($words as $part) {
            if (mb_strlen($current . $part) > 80 && trim($current) !== '') {
                $chunks[] = trim($current);
                $current = $part;
            } else {
                $current .= $part;
            }
        }
        if (trim($current) !== '') {
            $chunks[] = trim($current);
        }

        $mp3 = '';
        foreach ($chunks as $chunk) {
            $url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=' . urlencode($chunk);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $data = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if ($code == 200 && $data) {
                $mp3 .= $data;
            }
        }

        return !empty($mp3) ? $mp3 : null;
    }
}
