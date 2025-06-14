<?php

namespace App\Http\Controllers;

use App\Models\Prayer;
use App\Models\PrayerAmin;
use App\Models\PrayerComment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PrayerController extends Controller
{
    /**
     * Get authenticated user ID from session or Bearer token
     * This allows public routes to optionally check authentication
     */
    private function getAuthenticatedUserId(Request $request): ?int
    {
        // First check if authenticated via session
        $userId = Auth::id();
        if ($userId) {
            return $userId;
        }
        
        // If no session auth, check for Bearer token
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            
            if ($tokenModel) {
                return $tokenModel->tokenable->id;
            }
        }
        
        return null;
    }

    /**
     * Display a listing of prayers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Prayer::with(['user', 'amins', 'comments.user'])
            ->withCount(['amins', 'comments']);

        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('content', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Sort prayers
        $sortBy = $request->get('sort', 'latest');
        switch ($sortBy) {
            case 'popular':
                $query->orderBy('amin_count', 'desc')
                      ->orderBy('created_at', 'desc');
                break;
            case 'featured':
                $query->orderBy('is_featured', 'desc')
                      ->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default: // latest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $prayers = $query->paginate(10);

        // Add user's amin status for each prayer
        $userId = $this->getAuthenticatedUserId($request);
        foreach ($prayers as $prayer) {
            $prayer->user_has_amin = $userId ? $prayer->hasAminFromUser($userId) : false;
        }

        return response()->json([
            'success' => true,
            'data' => $prayers,
            'message' => 'Doa berhasil dimuat'
        ]);
    }

    /**
     * Store a new prayer
     */
    public function store(Request $request): JsonResponse
    {
        // Explicit authentication check
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda harus login terlebih dahulu untuk mengirim doa'
            ], 401);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:2000',
            'category' => 'required|string|in:umum,kesehatan,keluarga,pekerjaan,pendidikan,keuangan,perjalanan,lainnya',
            'is_anonymous' => 'boolean'
        ]);

        $prayer = Prayer::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category,
            'is_anonymous' => $request->get('is_anonymous', false)
        ]);

        $prayer->load(['user', 'amins', 'comments']);

        // Set user_has_amin (will be false for newly created prayer)
        $prayer->user_has_amin = false;

        return response()->json([
            'success' => true,
            'data' => $prayer,
            'message' => 'Doa berhasil dikirim'
        ], 201);
    }

    /**
     * Display the specified prayer
     */
    public function show(Request $request, Prayer $prayer): JsonResponse
    {
        $prayer->load(['user', 'amins.user', 'comments.user']);
        $prayer->loadCount(['amins', 'comments']);

        // Add user's amin status
        $userId = $this->getAuthenticatedUserId($request);
        $prayer->user_has_amin = $userId ? $prayer->hasAminFromUser($userId) : false;

        return response()->json([
            'success' => true,
            'data' => $prayer,
            'message' => 'Doa berhasil dimuat'
        ]);
    }

    /**
     * Update the specified prayer
     */
    public function update(Request $request, Prayer $prayer): JsonResponse
    {
        // Only allow the author to update their prayer
        if ($prayer->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan mengubah doa ini'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string|max:2000',
            'category' => 'sometimes|required|string|in:umum,kesehatan,keluarga,pekerjaan,pendidikan,keuangan,perjalanan,lainnya',
            'is_anonymous' => 'sometimes|boolean'
        ]);

        $prayer->update($request->only(['title', 'content', 'category', 'is_anonymous']));
        $prayer->load(['user', 'amins', 'comments']);

        // Add user's amin status
        $userId = Auth::id();
        $prayer->user_has_amin = $userId ? $prayer->hasAminFromUser($userId) : false;

        return response()->json([
            'success' => true,
            'data' => $prayer,
            'message' => 'Doa berhasil diperbarui'
        ]);
    }

    /**
     * Remove the specified prayer
     */
    public function destroy(Prayer $prayer): JsonResponse
    {
        // Only allow the author to delete their prayer
        if ($prayer->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menghapus doa ini'
            ], 403);
        }

        $prayer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Doa berhasil dihapus'
        ]);
    }

    /**
     * Toggle amin for a prayer
     */
    public function toggleAmin(Prayer $prayer): JsonResponse
    {
        $userId = Auth::id();
        
        DB::beginTransaction();
        try {
            $existingAmin = PrayerAmin::where('user_id', $userId)
                ->where('prayer_id', $prayer->id)
                ->first();

            if ($existingAmin) {
                // Remove amin
                $existingAmin->delete();
                $prayer->decrement('amin_count');
                $hasAmin = false;
                $message = 'Amin berhasil dibatalkan';
            } else {
                // Add amin
                PrayerAmin::create([
                    'user_id' => $userId,
                    'prayer_id' => $prayer->id
                ]);
                $prayer->increment('amin_count');
                $hasAmin = true;
                $message = 'Amin berhasil ditambahkan';
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'user_has_amin' => $hasAmin,
                    'amin_count' => $prayer->fresh()->amin_count
                ],
                'message' => $message
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status amin'
            ], 500);
        }
    }

    /**
     * Add a comment to a prayer
     */
    public function addComment(Request $request, Prayer $prayer): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'is_anonymous' => 'boolean'
        ]);

        DB::beginTransaction();
        try {
            $comment = PrayerComment::create([
                'user_id' => Auth::id(),
                'prayer_id' => $prayer->id,
                'content' => $request->content,
                'is_anonymous' => $request->get('is_anonymous', false)
            ]);

            $prayer->increment('comment_count');
            $comment->load('user');

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $comment,
                'message' => 'Komentar berhasil ditambahkan'
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan komentar'
            ], 500);
        }
    }

    /**
     * Get comments for a prayer
     */
    public function getComments(Prayer $prayer): JsonResponse
    {
        $comments = $prayer->comments()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $comments,
            'message' => 'Komentar berhasil dimuat'
        ]);
    }

    /**
     * Delete a comment
     */
    public function deleteComment(PrayerComment $comment): JsonResponse
    {
        // Only allow the author to delete their comment
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menghapus komentar ini'
            ], 403);
        }

        DB::beginTransaction();
        try {
            $prayer = $comment->prayer;
            $comment->delete();
            $prayer->decrement('comment_count');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Komentar berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus komentar'
            ], 500);
        }
    }

    /**
     * Get prayer categories
     */
    public function getCategories(): JsonResponse
    {
        $categories = [
            ['value' => 'umum', 'label' => 'Umum'],
            ['value' => 'kesehatan', 'label' => 'Kesehatan'],
            ['value' => 'keluarga', 'label' => 'Keluarga'],
            ['value' => 'pekerjaan', 'label' => 'Pekerjaan'],
            ['value' => 'pendidikan', 'label' => 'Pendidikan'],
            ['value' => 'keuangan', 'label' => 'Keuangan'],
            ['value' => 'perjalanan', 'label' => 'Perjalanan'],
            ['value' => 'lainnya', 'label' => 'Lainnya']
        ];

        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Kategori berhasil dimuat'
        ]);
    }

    /**
     * Get a random prayer for running text display
     */
    public function getRandomPrayer(Request $request): JsonResponse
    {
        try {
            // Get a random prayer
            $prayer = Prayer::with(['user'])
                ->withCount(['amins', 'comments'])
                ->inRandomOrder()
                ->first();

            if (!$prayer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada doa yang tersedia'
                ], 404);
            }

            // Add user's amin status if authenticated
            $userId = $this->getAuthenticatedUserId($request);
            $prayer->user_has_amin = $userId ? $prayer->hasAminFromUser($userId) : false;

            return response()->json([
                'success' => true,
                'data' => $prayer,
                'message' => 'Doa acak berhasil dimuat'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat doa acak'
            ], 500);
        }
    }

    /**
     * Get Islamic prayer times for a specific location and date
     */
    public function getPrayerTimes(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date' => 'required|string',
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'method' => 'sometimes|integer|between:0,15'
            ]);

            $date = $request->input('date');
            $latitude = $request->input('latitude');
            $longitude = $request->input('longitude');
            $method = $request->input('method', 11); // Default to Indonesian method

            // Try to call external prayer times API
            $apiUrl = "http://api.aladhan.com/v1/timings/{$date}";
            $queryParams = http_build_query([
                'latitude' => $latitude,
                'longitude' => $longitude,
                'method' => $method,
                'adjustment' => 0
            ]);

            $fullUrl = $apiUrl . '?' . $queryParams;
            
            // Use cURL for the API call
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error || $httpCode !== 200) {
                throw new \Exception("API call failed: $error");
            }

            $data = json_decode($response, true);
            
            if (!$data || !isset($data['data'])) {
                throw new \Exception("Invalid API response");
            }

            return response()->json([
                'code' => 200,
                'status' => 'OK',
                'data' => $data['data']
            ]);

        } catch (\Exception $e) {
            // Return fallback prayer times if API fails
            return response()->json([
                'code' => 200,
                'status' => 'OK',
                'data' => [
                    'timings' => [
                        'Fajr' => '05:00',
                        'Sunrise' => '06:00',
                        'Dhuhr' => '12:00',
                        'Asr' => '15:30',
                        'Maghrib' => '18:00',
                        'Isha' => '19:30'
                    ],
                    'date' => [
                        'readable' => date('d M Y'),
                        'gregorian' => [
                            'date' => date('d-m-Y')
                        ]
                    ],
                    'meta' => [
                        'method' => [
                            'name' => 'Fallback Times'
                        ]
                    ]
                ]
            ]);
        }
    }
}
