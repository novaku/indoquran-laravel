<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchTerm extends Model
{
    protected $fillable = [
        'term',
        'search_count',
        'user_ip'
    ];

    protected $casts = [
        'search_count' => 'integer',
    ];

    /**
     * Relationship dengan User - DIHAPUS karena tidak menyimpan user_id lagi
     */
    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }

    /**
     * Scope untuk mendapatkan popular searches
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->groupBy('term')
                    ->selectRaw('term, SUM(search_count) as total_count')
                    ->orderByDesc('total_count')
                    ->limit($limit);
    }

    /**
     * Scope untuk pencarian berdasarkan IP (mengganti user scope)
     */
    public function scopeForIp($query, $userIp)
    {
        return $query->where('user_ip', $userIp);
    }

    /**
     * Static method untuk mencatat pencarian (tanpa user_id)
     */
    public static function recordSearch($term, $userIp = null)
    {
        $term = trim(strtolower($term));
        
        if (empty($term)) {
            return null;
        }

        // Cari existing search term berdasarkan term dan IP
        $searchTerm = static::where('term', $term)
                           ->where('user_ip', $userIp)
                           ->first();

        if ($searchTerm) {
            // Update counter jika sudah ada
            $searchTerm->increment('search_count');
            $searchTerm->touch(); // Update timestamp
        } else {
            // Buat record baru
            $searchTerm = static::create([
                'term' => $term,
                'search_count' => 1,
                'user_ip' => $userIp
            ]);
        }

        return $searchTerm;
    }

    /**
     * Static method untuk mendapatkan popular searches
     */
    public static function getPopularSearches($limit = 6)
    {
        return static::groupBy('term')
                    ->selectRaw('term, SUM(search_count) as total_count')
                    ->orderByDesc('total_count')
                    ->limit($limit)
                    ->get()
                    ->pluck('term')
                    ->toArray();
    }
}
