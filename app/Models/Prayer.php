<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'category',
        'is_anonymous',
        'amin_count',
        'comment_count',
        'is_featured',
        'featured_at'
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'is_featured' => 'boolean',
        'featured_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $appends = [
        'author_name',
        'time_ago',
        'user_has_amin'
    ];

    /**
     * Get the user who posted this prayer
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all amins for this prayer
     */
    public function amins(): HasMany
    {
        return $this->hasMany(PrayerAmin::class);
    }

    /**
     * Get all comments for this prayer
     */
    public function comments(): HasMany
    {
        return $this->hasMany(PrayerComment::class)->orderBy('created_at', 'asc');
    }

    /**
     * Check if user has given amin to this prayer
     */
    public function hasAminFromUser($userId): bool
    {
        return $this->amins()->where('user_id', $userId)->exists();
    }

    /**
     * Scope for featured prayers
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for prayers by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get display name for the prayer author
     */
    public function getAuthorNameAttribute(): string
    {
        return $this->is_anonymous ? 'Hamba Allah' : $this->user->name;
    }

    /**
     * Get formatted time ago
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Get user has amin status
     */
    public function getUserHasAminAttribute(): bool
    {
        // This will be set by the controller
        return $this->attributes['user_has_amin'] ?? false;
    }
}
