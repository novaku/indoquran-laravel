<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TagController extends Controller
{
    /**
     * Display a listing of all tags (public)
     */
    public function index(Request $request)
    {
        $query = Tag::withCount(['articles' => function($q) {
            $q->where('status', 'published');
        }])->orderBy('name');

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%");
        }

        // Option to get all or paginated
        if ($request->has('all') && $request->all === 'true') {
            $tags = $query->get();
        } else {
            $tags = $query->paginate(20);
        }

        return response()->json($tags);
    }

    /**
     * Display the specified tag by slug (public)
     */
    public function show($slug)
    {
        $tag = Tag::where('slug', $slug)
            ->withCount(['articles' => function($q) {
                $q->where('status', 'published');
            }])
            ->firstOrFail();

        return response()->json($tag);
    }

    /**
     * Get all tags for admin (includes count)
     */
    public function adminIndex(Request $request)
    {
        $query = Tag::withCount('articles')->orderBy('name');

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%");
        }

        $tags = $query->paginate(50);

        return response()->json($tags);
    }

    /**
     * Store a newly created tag
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:tags,name',
            'slug' => 'nullable|string|max:50|unique:tags,slug',
            'description' => 'nullable|string|max:500'
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $tag = Tag::create($validated);

        return response()->json([
            'message' => 'Tag berhasil dibuat',
            'tag' => $tag
        ], 201);
    }

    /**
     * Update the specified tag
     */
    public function update(Request $request, $id)
    {
        $tag = Tag::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:tags,name,' . $id,
            'slug' => 'nullable|string|max:50|unique:tags,slug,' . $id,
            'description' => 'nullable|string|max:500'
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $tag->update($validated);

        return response()->json([
            'message' => 'Tag berhasil diperbarui',
            'tag' => $tag
        ]);
    }

    /**
     * Remove the specified tag
     */
    public function destroy($id)
    {
        $tag = Tag::findOrFail($id);
        
        // Detach from all articles before deleting
        $tag->articles()->detach();
        
        $tag->delete();

        return response()->json([
            'message' => 'Tag berhasil dihapus'
        ]);
    }

    /**
     * Get popular tags (most used)
     */
    public function popular(Request $request)
    {
        $limit = $request->get('limit', 10);
        
        $tags = Tag::withCount(['articles' => function($q) {
            $q->where('status', 'published');
        }])
        ->having('articles_count', '>', 0)
        ->orderBy('articles_count', 'desc')
        ->limit($limit)
        ->get();

        return response()->json($tags);
    }

    /**
     * Get articles by tag slug
     */
    public function articles($slug, Request $request)
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();
        
        $articles = $tag->articles()
            ->with(['author:id,name', 'tags'])
            ->where('status', 'published')
            ->latest('published_at')
            ->paginate(12);

        return response()->json([
            'tag' => $tag,
            'articles' => $articles
        ]);
    }
}
