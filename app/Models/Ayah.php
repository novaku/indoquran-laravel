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
     * Check if Indonesian text contains the exact search phrase/consecutive words as whole words.
     */
    public static function matchesExactSearchText(?string $text, string $search): bool
    {
        $textValue = trim((string) $text);
        $searchTerms = array_values(array_filter(preg_split('/\s+/u', trim((string) $search)) ?: [], function ($term) {
            return !empty(trim($term));
        }));

        if ($textValue === '' || empty($searchTerms)) {
            return false;
        }

        $escapedTerms = array_map(function ($term) {
            return preg_quote(trim($term), '/');
        }, $searchTerms);

        // Match terms consecutively in order separated by whitespace, with word boundaries
        $phrasePattern = implode('\s+', $escapedTerms);
        $pattern = '/(^|[^a-z0-9])' . $phrasePattern . '([^a-z0-9]|$)/iu';

        return (bool) preg_match($pattern, $textValue);
    }
    
    /**
     * Scope a query to search ayahs by Indonesian text based on terms separated by space.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearchIndonesianText($query, $search)
    {
        $searchTerms = array_values(array_filter(preg_split('/\s+/u', trim((string) $search)) ?: [], function($term) {
            return !empty(trim($term));
        }));

        if (empty($searchTerms)) {
            return $query;
        }

        // Apply AND condition for each search term
        // This will work like: WHERE text_indonesian LIKE '%term1%' AND text_indonesian LIKE '%term2%'
        foreach ($searchTerms as $term) {
            $term = trim($term);

            $query->where('text_indonesian', 'like', '%' . $term . '%');
        }

        return $query;
    }
}
