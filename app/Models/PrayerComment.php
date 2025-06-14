<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrayerComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'prayer_id',
        'content',
        'is_anonymous'
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user who made the comment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the prayer this comment belongs to
     */
    public function prayer(): BelongsTo
    {
        return $this->belongsTo(Prayer::class);
    }

    /**
     * Get display name for the comment author
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
}
