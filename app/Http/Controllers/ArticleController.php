<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * Ensure public/storage link exists before handling upload.
     */
    private function ensureStorageLinkForUploads(): void
    {
        $linkPath = public_path('storage');
        $targetPath = storage_path('app/public');

        if (is_link($linkPath)) {
            return;
        }

        // If a regular folder/file exists at public/storage, do not modify it automatically.
        if (file_exists($linkPath)) {
            return;
        }

        if (!is_dir($targetPath)) {
            @mkdir($targetPath, 0755, true);
        }

        @symlink($targetPath, $linkPath);
    }

    /**
     * Display a listing of published articles (public)
     */
    public function index(Request $request)
    {
        $query = Article::with(['author:id,name', 'tags'])
            ->published();

        // Sort filter
        $sort = $request->get('sort', 'latest');
        if ($sort === 'popular' || $sort === 'views' || $sort === 'paling-banyak-dibaca') {
            $query->orderBy('views_count', 'desc')->latest('published_at');
        } elseif ($sort === 'random' || $sort === 'acak' || $sort === 'rekomendasi') {
            $query->inRandomOrder();
        } else {
            $query->latest('published_at');
        }

        // Filter by tag
        if ($request->has('tag') && !empty($request->tag)) {
            $query->whereHas('tags', function($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('excerpt', 'LIKE', "%{$search}%")
                  ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        $perPage = min(max((int)$request->get('per_page', 12), 1), 50);
        $articles = $query->paginate($perPage);

        return response()->json($articles);
    }

    /**
     * Display the specified article by slug (public)
     */
    public function show($slug)
    {
        $article = Article::with(['author:id,name', 'tags'])
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        // Increment views
        $article->incrementViews();

        return response()->json($article);
    }

    /**
     * Get all articles for admin (includes drafts)
     */
    public function adminIndex(Request $request)
    {
        $query = Article::with(['author:id,name', 'tags'])
            ->latest('created_at');

        // Filter by status
        if ($request->has('status') && in_array($request->status, ['draft', 'published'])) {
            $query->where('status', $request->status);
        }

        // Filter by tag
        if ($request->has('tag') && !empty($request->tag)) {
            $query->whereHas('tags', function($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('excerpt', 'LIKE', "%{$search}%");
            });
        }

        $articles = $query->paginate(20);

        return response()->json($articles);
    }

    /**
     * Get single article for editing (admin)
     */
    public function edit($id)
    {
        $article = Article::with(['author:id,name', 'tags'])->findOrFail($id);
        return response()->json($article);
    }

    /**
     * Store a newly created article
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'featured_image' => 'nullable|string',
            'status' => 'required|in:draft,published',
            'published_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'nullable|string|max:50'
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Set published_at if status is published and date not set
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Set author as current user
        $validated['author_id'] = Auth::id();

        // Extract tags before creating article
        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $article = Article::create($validated);

        // Attach tags
        if (!empty($tags)) {
            $tagIds = $this->getOrCreateTags($tags);
            $article->tags()->sync($tagIds);
        }

        return response()->json([
            'message' => 'Artikel berhasil dibuat',
            'article' => $article->load(['author:id,name', 'tags'])
        ], 201);
    }

    /**
     * Update the specified article
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug,' . $id,
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'featured_image' => 'nullable|string',
            'status' => 'required|in:draft,published',
            'published_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'nullable|string|max:50'
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Set published_at when changing to published
        if ($validated['status'] === 'published' && $article->status === 'draft' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Extract tags before updating article
        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $article->update($validated);

        // Sync tags
        if (!empty($tags)) {
            $tagIds = $this->getOrCreateTags($tags);
            $article->tags()->sync($tagIds);
        } else {
            $article->tags()->detach();
        }

        return response()->json([
            'message' => 'Artikel berhasil diperbarui',
            'article' => $article->load(['author:id,name', 'tags'])
        ]);
    }

    /**
     * Remove the specified article
     */
    public function destroy($id)
    {
        $article = Article::findOrFail($id);

        // Delete featured image if exists
        if ($article->featured_image) {
            Storage::disk('public')->delete($article->featured_image);
        }

        $article->delete();

        return response()->json([
            'message' => 'Artikel berhasil dihapus'
        ]);
    }

    /**
     * Upload image for article
     */
    public function uploadImage(Request $request)
    {
        $this->ensureStorageLinkForUploads();

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $image->getClientOriginalExtension();
            
            $path = $image->storeAs('articles', $filename, 'public');

            return response()->json([
                'message' => 'Gambar berhasil diupload',
                'path' => $path,
                'url' => Storage::url($path)
            ]);
        }

        return response()->json([
            'message' => 'Tidak ada gambar yang diupload'
        ], 400);
    }

    /**
     * Get related articles
     */
    public function related($slug)
    {
        $article = Article::where('slug', $slug)->firstOrFail();
        
        $related = Article::with(['author:id,name', 'tags'])
            ->published()
            ->where('id', '!=', $article->id)
            ->latest('published_at')
            ->limit(3)
            ->get();

        return response()->json($related);
    }

    /**
     * Get a random published article
     */
    public function random()
    {
        $article = Article::with(['author:id,name', 'tags'])
            ->published()
            ->inRandomOrder()
            ->first();

        if (!$article) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada artikel tersedia'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $article
        ]);
    }

    /**
     * Helper method to get or create tags
     */
    private function getOrCreateTags(array $tagNames): array
    {
        $tagIds = [];
        
        foreach ($tagNames as $tagName) {
            if (empty($tagName)) {
                continue;
            }
            
            $tag = Tag::firstOrCreate(
                ['name' => trim($tagName)],
                ['slug' => Str::slug(trim($tagName))]
            );
            
            $tagIds[] = $tag->id;
        }
        
        return $tagIds;
    }
}
