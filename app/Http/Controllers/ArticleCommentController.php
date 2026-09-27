<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleComment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ArticleCommentController extends Controller
{
    /**
     * Helper to get currently authenticated user (JWT or Session)
     * Ignores synthetic guest user (guest@indoquran.web.id)
     */
    private function getAuthenticatedUser(Request $request)
    {
        $user = null;

        try {
            if ($request->bearerToken()) {
                $user = auth('api')->user();
            }
        } catch (\Throwable $e) {
            // Token error or expired
        }

        if (!$user) {
            $user = Auth::user();
        }

        // Filter out guest user token
        if ($user && $user->email === 'guest@indoquran.web.id') {
            return null;
        }

        return $user;
    }

    /**
     * Check if request is from an admin
     */
    private function isAdmin(Request $request): bool
    {
        $user = $this->getAuthenticatedUser($request);
        if ($user && method_exists($user, 'isAdmin') && $user->isAdmin()) {
            return true;
        }
        if ($user && !empty($user->is_admin)) {
            return true;
        }
        return false;
    }

    /**
     * Find an article by slug or numeric ID
     */
    private function findArticle($slugOrId): Article
    {
        if (is_numeric($slugOrId)) {
            return Article::where('id', $slugOrId)->firstOrFail();
        }
        return Article::where('slug', $slugOrId)->firstOrFail();
    }

    /**
     * Get comments for an article (Public)
     */
    public function getComments(Request $request, $slugOrId): JsonResponse
    {
        $article = $this->findArticle($slugOrId);

        $comments = $article->comments()
            ->with(['user:id,name'])
            ->latest('created_at')
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'article_id' => $comment->article_id,
                    'author_name' => $comment->author_name,
                    'content' => $comment->content,
                    'is_anonymous' => (bool)$comment->is_anonymous,
                    'user_id' => $comment->is_anonymous ? null : $comment->user_id,
                    'created_at' => $comment->created_at,
                    'time_ago' => $comment->time_ago,
                ];
            });

        return response()->json([
            'success' => true,
            'article_id' => $article->id,
            'count' => $comments->count(),
            'data' => $comments
        ]);
    }

    /**
     * Store a comment for an article (Public - guest or logged-in user)
     */
    public function store(Request $request, $slugOrId): JsonResponse
    {
        $article = $this->findArticle($slugOrId);

        $request->validate([
            'content' => 'required|string|min:2|max:2000',
            'name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:150',
            'is_anonymous' => 'nullable|boolean'
        ]);

        $user = $this->getAuthenticatedUser($request);

        if ($user) {
            // Logged in user: option to be anonymous (Hamba Allah)
            $isAnonymous = $request->boolean('is_anonymous', false);
            $userId = $user->id;
            $name = $user->name;
            $email = $user->email;
        } else {
            // Guest visitor: can provide name and email, or choose to be anonymous
            $rawName = $request->input('name');
            $rawEmail = $request->input('email');
            
            $trimmedName = $rawName ? trim($rawName) : null;
            $trimmedEmail = $rawEmail ? trim($rawEmail) : null;

            // If guest selected anonymous or left name empty, consider anonymous
            $wantsAnonymous = $request->boolean('is_anonymous', false);
            $isAnonymous = $wantsAnonymous || empty($trimmedName);

            $userId = null;
            $name = $trimmedName;
            $email = $trimmedEmail;
        }

        try {
            $comment = ArticleComment::create([
                'article_id' => $article->id,
                'user_id' => $userId,
                'name' => $name,
                'email' => $email,
                'content' => trim($request->input('content')),
                'is_anonymous' => $isAnonymous,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'message' => $isAnonymous ? 'Komentar berhasil dikirim sebagai Hamba Allah' : 'Komentar berhasil dikirim',
                'data' => [
                    'id' => $comment->id,
                    'article_id' => $comment->article_id,
                    'author_name' => $comment->author_name,
                    'content' => $comment->content,
                    'is_anonymous' => (bool)$comment->is_anonymous,
                    'user_id' => $comment->is_anonymous ? null : $comment->user_id,
                    'created_at' => $comment->created_at,
                    'time_ago' => $comment->time_ago,
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Gagal menambahkan komentar artikel: ' . $e->getMessage(), [
                'article_id' => $article->id,
                'user_id' => $userId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan komentar'
            ], 500);
        }
    }

    /**
     * Admin: List all article comments with filters & pagination (supports group by article)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $groupBy = $request->get('group_by', 'article');

        // Group comments by Article
        if ($groupBy === 'article') {
            $articlesQuery = Article::select(['id', 'title', 'slug', 'published_at', 'created_at'])
                ->has('comments')
                ->withCount('comments');

            if ($request->has('article_id') && !empty($request->article_id)) {
                $articlesQuery->where('id', $request->article_id);
            }

            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = trim($request->search);
                $articlesQuery->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('comments', function ($cq) use ($searchTerm) {
                          $cq->where('content', 'LIKE', "%{$searchTerm}%")
                             ->orWhere('name', 'LIKE', "%{$searchTerm}%")
                             ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                             ->orWhereHas('user', function ($uq) use ($searchTerm) {
                                 $uq->where('name', 'LIKE', "%{$searchTerm}%")
                                    ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                             });
                      });
                });
            }

            $perPage = min(max((int)$request->get('per_page', 10), 1), 50);

            $sortBy = $request->get('sort_by', 'comments_count');
            if ($sortBy === 'title_asc') {
                $articlesQuery->orderBy('title', 'asc');
            } elseif ($sortBy === 'title_desc') {
                $articlesQuery->orderBy('title', 'desc');
            } elseif ($sortBy === 'latest_article') {
                $articlesQuery->orderByDesc('created_at');
            } elseif ($sortBy === 'latest_comment') {
                $articlesQuery->withMax('comments', 'created_at')
                              ->orderByDesc('comments_max_created_at');
            } else {
                $articlesQuery->orderByDesc('comments_count');
            }

            $articles = $articlesQuery->paginate($perPage);

            $articles->getCollection()->transform(function ($article) use ($request) {
                $commentsQuery = $article->comments()
                    ->with(['user:id,name,email'])
                    ->latest('created_at');

                if ($request->has('search') && !empty($request->search)) {
                    $searchTerm = trim($request->search);
                    $commentsQuery->where(function ($cq) use ($searchTerm) {
                        $cq->where('content', 'LIKE', "%{$searchTerm}%")
                           ->orWhere('name', 'LIKE', "%{$searchTerm}%")
                           ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                           ->orWhereHas('user', function ($uq) use ($searchTerm) {
                               $uq->where('name', 'LIKE', "%{$searchTerm}%")
                                  ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                           });
                    });
                }

                $article->comments_list = $commentsQuery->get();
                return $article;
            });

            return response()->json([
                'success' => true,
                'grouped' => true,
                'total_comments' => ArticleComment::count(),
                'data' => $articles->items(),
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
                'per_page' => $articles->perPage(),
                'from' => $articles->firstItem() ?? 0,
                'to' => $articles->lastItem() ?? 0,
            ]);
        }

        // Flat listing of comments
        $query = ArticleComment::with(['article:id,title,slug', 'user:id,name,email'])
            ->latest('created_at');

        if ($request->has('article_id') && !empty($request->article_id)) {
            $query->where('article_id', $request->article_id);
        }

        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = trim($request->search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('content', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('user', function ($uq) use ($searchTerm) {
                      $uq->where('name', 'LIKE', "%{$searchTerm}%")
                         ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                  })
                  ->orWhereHas('article', function ($aq) use ($searchTerm) {
                      $aq->where('title', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        $perPage = min(max((int)$request->get('per_page', 15), 1), 50);
        $comments = $query->paginate($perPage);

        return response()->json($comments);
    }

    /**
     * Admin: Delete unwanted article comment
     */
    public function adminDestroy(Request $request, $id): JsonResponse
    {
        $comment = ArticleComment::findOrFail($id);
        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Komentar artikel berhasil dihapus'
        ]);
    }

    /**
     * Admin: Delete all comments for a specific article
     */
    public function adminDestroyByArticle(Request $request, $articleId): JsonResponse
    {
        $count = ArticleComment::where('article_id', $articleId)->delete();

        return response()->json([
            'success' => true,
            'message' => "Sebanyak {$count} komentar artikel berhasil dihapus",
            'deleted_count' => $count
        ]);
    }
}
