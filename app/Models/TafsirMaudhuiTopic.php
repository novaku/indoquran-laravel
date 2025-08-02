<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TafsirMaudhuiTopic extends Model
{
    protected $fillable = [
        'topic',
        'description',
        'slug',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->topic);
            }
        });
        
        static::updating(function ($model) {
            if ($model->isDirty('topic') && empty($model->slug)) {
                $model->slug = Str::slug($model->topic);
            }
        });
    }

    /**
     * Get the verses for this topic
     */
    public function verses(): HasMany
    {
        return $this->hasMany(TafsirMaudhuiVerse::class, 'topic_id')
                    ->orderBy('sort_order')
                    ->orderBy('surah_number')
                    ->orderBy('ayah_number');
    }

    /**
     * Scope active topics
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered topics
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('topic');
    }

    /**
     * Search topics by keyword
     */
    public function scopeSearch($query, $keyword)
    {
        if ($keyword) {
            return $query->where(function($q) use ($keyword) {
                $q->where('topic', 'LIKE', "%{$keyword}%")
                  ->orWhere('description', 'LIKE', "%{$keyword}%");
            });
        }
        return $query;
    }
}
