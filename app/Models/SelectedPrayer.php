<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SelectedPrayer extends Model
{
    use HasFactory;

    protected $table = 'selected_prayers';

    protected $fillable = [
        'title',
        'category',
        'category_name',
        'arabic',
        'latin',
        'translation',
        'source',
        'fadhilah',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope for category filter
     */
    public function scopeByCategory($query, ?string $category)
    {
        if (!empty($category) && $category !== 'all') {
            return $query->where('category', $category);
        }

        return $query;
    }

    /**
     * Scope for search
     */
    public function scopeSearch($query, ?string $search)
    {
        if (!empty($search)) {
            return $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('latin', 'LIKE', "%{$search}%")
                  ->orWhere('translation', 'LIKE', "%{$search}%")
                  ->orWhere('arabic', 'LIKE', "%{$search}%")
                  ->orWhere('source', 'LIKE', "%{$search}%");
            });
        }

        return $query;
    }
}
