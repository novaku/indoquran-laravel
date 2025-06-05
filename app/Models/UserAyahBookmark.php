<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAyahBookmark extends Model
{
    protected $fillable = [
        'user_id',
        'ayah_id',
        'is_favorite',
        'notes'
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
    ];

    /**
     * Get the user that owns the bookmark.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the ayah that is bookmarked.
     */
    public function ayah(): BelongsTo
    {
        return $this->belongsTo(Ayah::class);
    }
}
