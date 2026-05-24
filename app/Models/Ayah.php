<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ayah extends Model
{
    protected $fillable = [
        'surah_number',
        'ayah_number',
        'text_arabic',
        'text_latin',
        'no_footnote',
        'footnotes',
        'juz',
        'page',
        'text_indonesian',
        'text_english',
        'tafsir',
        'audio_urls'
    ];

    protected $casts = [
        'audio_urls' => 'array'
    ];

    /**
     * Get the surah that owns the ayah.
     */
    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class, 'surah_number', 'number');
    }

    /**
     * Get the bookmarks for this ayah.
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(UserAyahBookmark::class);
    }

    /**
     * Get the users who bookmarked this ayah.
     */
    public function bookmarkedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_ayah_bookmarks')
                    ->withPivot(['is_favorite', 'notes', 'created_at'])
                    ->withTimestamps();
    }

    /**
     * Build a regex pattern that matches a term as a whole word.
     */
    protected static function buildExactWordPattern(string $term): string
    {
        return '[[:<:]]' . preg_quote(trim($term), '/') . '[[:>:]]';
    }

    /**
     * Check if Indonesian text contains all search terms as whole words.
     */
    public static function matchesExactSearchText(?string $text, string $search): bool
    {
        $textValue = trim((string) $text);
        $searchTerms = array_filter(preg_split('/\s+/u', trim((string) $search)) ?: [], function ($term) {
            return !empty(trim($term));
        });

        if ($textValue === '' || empty($searchTerms)) {
            return false;
        }

        foreach ($searchTerms as $term) {
            $pattern = '/(^|[^a-z0-9])' . preg_quote(trim($term), '/') . '([^a-z0-9]|$)/i';

            if (!preg_match($pattern, $textValue)) {
                return false;
            }
        }

        return true;
    }
    
    /**
     * Scope a query to search ayahs by Indonesian text.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @param bool $exact
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearchIndonesianText($query, $search, bool $exact = false)
    {
        $searchTerms = array_filter(preg_split('/\s+/u', trim((string) $search)) ?: [], function($term) {
            return !empty(trim($term));
        });
        
        // Apply AND condition for each search term
        // This will work like: WHERE text_indonesian LIKE '%term1%' AND text_indonesian LIKE '%term2%'
        foreach ($searchTerms as $term) {
            $term = trim($term);

            $query->where('text_indonesian', 'like', '%' . $term . '%');
        }

        return $query;
    }
}
