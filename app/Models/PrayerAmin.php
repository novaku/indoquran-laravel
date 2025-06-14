<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrayerAmin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'prayer_id'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user who gave the amin
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the prayer this amin belongs to
     */
    public function prayer(): BelongsTo
    {
        return $this->belongsTo(Prayer::class);
    }
}
