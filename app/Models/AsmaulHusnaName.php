<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AsmaulHusnaName extends Model
{
    use HasFactory;

    protected $fillable = [
        'original_id',
        'arabic',
        'latin',
        'meaning',
        'description',
        'slug',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'original_id' => 'integer'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $baseSlug = Str::slug($model->latin);
                $slug = $baseSlug;
                $counter = 1;
                
                // Ensure unique slug
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                
                $model->slug = $slug;
            }
            if ($model->sort_order === null) {
                $model->sort_order = $model->original_id ?? 0;
            }
        });
    }

    /**
     * Get verses associated with this name
     */
    public function verses()
    {
        return $this->hasMany(AsmaulHusnaVerse::class, 'name_id')->ordered();
    }

    /**
     * Scope to get only active names
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get names in order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('original_id');
    }

    /**
     * Scope to search names
     */
    public function scopeSearch($query, $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('latin', 'like', "%{$keyword}%")
              ->orWhere('meaning', 'like', "%{$keyword}%")
              ->orWhere('arabic', 'like', "%{$keyword}%")
              ->orWhere('description', 'like', "%{$keyword}%");
        });
    }

    /**
     * Get the route key for the model
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
