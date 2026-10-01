<?php

namespace App\Http\Controllers;

use App\Models\UserHaditsBookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HaditsBookmarkController extends Controller
{
    /**
     * Check if authenticated user is a real user (not the shared guest user)
     */
    protected function getRealUser()
    {
        $user = Auth::user();
        if (!$user || $user->email === 'guest@indoquran.web.id') {
            return null;
        }
        return $user;
    }

    /**
     * Get user's hadits bookmarks with optional filtering
     */
    public function index(Request $request)
    {
        $user = $this->getRealUser();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan masuk untuk mengakses penanda tersimpan di database'
            ], 401);
        }
        $favoritesOnly = filter_var($request->query('favorites_only', false), FILTER_VALIDATE_BOOLEAN);
        $kitabSlug = $request->query('kitab_slug');

        $query = UserHaditsBookmark::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($favoritesOnly) {
            $query->where('is_favorite', true);
        }

        if ($kitabSlug) {
            $resolved = HaditsController::resolveKitabSlug($kitabSlug);
            if ($resolved) {
                $query->where('kitab_slug', $resolved);
            }
        }

        $bookmarks = $query->get();

        $enriched = $bookmarks->map(function ($item) {
            return $item->getEnrichedData();
        });

        return response()->json([
            'status' => 'success',
            'data' => $enriched
        ]);
    }

    /**
     * Toggle bookmark for a hadith
     */
    public function toggle(Request $request, string $kitab, int $number)
    {
        $user = $this->getRealUser();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan masuk untuk menyimpan penanda di database'
            ], 401);
        }

        $kitabSlug = HaditsController::resolveKitabSlug($kitab);

        if (!$kitabSlug) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak valid'
            ], 400);
        }

        $bookmark = UserHaditsBookmark::where('user_id', $user->id)
            ->where('kitab_slug', $kitabSlug)
            ->where('hadits_number', $number)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $isBookmarked = false;
            $isFavorite = false;
        } else {
            $bookmark = UserHaditsBookmark::create([
                'user_id' => $user->id,
                'kitab_slug' => $kitabSlug,
                'hadits_number' => $number,
                'is_favorite' => false,
                'notes' => $request->input('notes', null)
            ]);
            $isBookmarked = true;
            $isFavorite = false;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'is_bookmarked' => $isBookmarked,
                'is_favorite' => $isFavorite,
                'kitab_slug' => $kitabSlug,
                'number' => $number,
                'bookmark' => $isBookmarked ? $bookmark->getEnrichedData() : null
            ]
        ]);
    }

    /**
     * Toggle favorite status for a hadith
     */
    public function toggleFavorite(Request $request, string $kitab, int $number)
    {
        $user = $this->getRealUser();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan masuk untuk menyimpan favorit di database'
            ], 401);
        }

        $kitabSlug = HaditsController::resolveKitabSlug($kitab);

        if (!$kitabSlug) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak valid'
            ], 400);
        }

        $bookmark = UserHaditsBookmark::where('user_id', $user->id)
            ->where('kitab_slug', $kitabSlug)
            ->where('hadits_number', $number)
            ->first();

        if (!$bookmark) {
            $bookmark = UserHaditsBookmark::create([
                'user_id' => $user->id,
                'kitab_slug' => $kitabSlug,
                'hadits_number' => $number,
                'is_favorite' => true
            ]);
            $isFavorite = true;
            $isBookmarked = true;
        } else {
            $bookmark->is_favorite = !$bookmark->is_favorite;
            $bookmark->save();
            $isFavorite = $bookmark->is_favorite;
            $isBookmarked = true;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'is_bookmarked' => $isBookmarked,
                'is_favorite' => $isFavorite,
                'kitab_slug' => $kitabSlug,
                'number' => $number,
                'bookmark' => $bookmark->getEnrichedData()
            ]
        ]);
    }

    /**
     * Update personal notes for a hadith bookmark
     */
    public function updateNotes(Request $request, string $kitab, int $number)
    {
        $user = $this->getRealUser();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan masuk untuk menyimpan catatan di database'
            ], 401);
        }

        $kitabSlug = HaditsController::resolveKitabSlug($kitab);

        if (!$kitabSlug) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak valid'
            ], 400);
        }

        $request->validate([
            'notes' => 'nullable|string|max:2000'
        ]);

        $bookmark = UserHaditsBookmark::firstOrCreate(
            [
                'user_id' => $user->id,
                'kitab_slug' => $kitabSlug,
                'hadits_number' => $number
            ],
            [
                'is_favorite' => false,
                'notes' => $request->notes
            ]
        );

        $bookmark->notes = $request->notes;
        $bookmark->save();

        return response()->json([
            'status' => 'success',
            'data' => $bookmark->getEnrichedData()
        ]);
    }

    /**
     * Delete a bookmark
     */
    public function destroy(Request $request, string $kitab, int $number)
    {
        $user = $this->getRealUser();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan masuk untuk mengelola penanda di database'
            ], 401);
        }

        $kitabSlug = HaditsController::resolveKitabSlug($kitab);

        if (!$kitabSlug) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak valid'
            ], 400);
        }

        UserHaditsBookmark::where('user_id', $user->id)
            ->where('kitab_slug', $kitabSlug)
            ->where('hadits_number', $number)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Penanda hadits berhasil dihapus'
        ]);
    }

    /**
     * Check status for hadiths in a specific book
     */
    public function getStatus(Request $request, string $kitab)
    {
        $user = $this->getRealUser();
        if (!$user) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }

        $kitabSlug = HaditsController::resolveKitabSlug($kitab);

        if (!$kitabSlug) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kitab hadits tidak valid'
            ], 400);
        }

        $numbers = $request->query('numbers', []);
        if (!is_array($numbers)) {
            $numbers = array_filter(array_map('intval', explode(',', $numbers)));
        }

        $bookmarks = UserHaditsBookmark::where('user_id', $user->id)
            ->where('kitab_slug', $kitabSlug)
            ->when(!empty($numbers), function ($q) use ($numbers) {
                return $q->whereIn('hadits_number', $numbers);
            })
            ->get()
            ->keyBy('hadits_number');

        $statuses = [];
        foreach ($numbers as $num) {
            $bm = $bookmarks->get($num);
            $statuses[$num] = [
                'is_bookmarked' => $bm !== null,
                'is_favorite' => $bm ? (bool) $bm->is_favorite : false,
                'notes' => $bm ? $bm->notes : null
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $statuses
        ]);
    }

    /**
     * Sync local bookmarks from client storage into the user's database
     */
    public function sync(Request $request)
    {
        $user = $this->getRealUser();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan masuk untuk menyinkronkan penanda ke database'
            ], 401);
        }
        $items = $request->input('bookmarks', []);

        if (!is_array($items)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Format data bookmarks tidak valid'
            ], 400);
        }

        foreach ($items as $item) {
            $kitab = $item['kitab_slug'] ?? null;
            $number = isset($item['number']) ? (int) $item['number'] : null;

            if (!$kitab || !$number) {
                continue;
            }

            $kitabSlug = HaditsController::resolveKitabSlug($kitab);
            if (!$kitabSlug) {
                continue;
            }

            $isFavorite = !empty($item['is_favorite']);
            $notes = $item['notes'] ?? null;

            $existing = UserHaditsBookmark::where('user_id', $user->id)
                ->where('kitab_slug', $kitabSlug)
                ->where('hadits_number', $number)
                ->first();

            if ($existing) {
                // If local has favorite or notes and remote doesn't, update
                $needsSave = false;
                if ($isFavorite && !$existing->is_favorite) {
                    $existing->is_favorite = true;
                    $needsSave = true;
                }
                if (!empty($notes) && empty($existing->notes)) {
                    $existing->notes = $notes;
                    $needsSave = true;
                }
                if ($needsSave) {
                    $existing->save();
                }
            } else {
                UserHaditsBookmark::create([
                    'user_id' => $user->id,
                    'kitab_slug' => $kitabSlug,
                    'hadits_number' => $number,
                    'is_favorite' => $isFavorite,
                    'notes' => $notes
                ]);
            }
        }

        // Return all user's bookmarks after sync
        $all = UserHaditsBookmark::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($b) => $b->getEnrichedData());

        return response()->json([
            'status' => 'success',
            'message' => 'Penanda hadits berhasil disinkronkan',
            'data' => $all
        ]);
    }
}
