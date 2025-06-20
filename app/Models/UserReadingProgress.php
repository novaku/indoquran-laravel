<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReadingProgress extends Model
{
    use HasFactory;

    protected $table = 'user_reading_progress';

    protected $fillable = [
        'user_id',
        'surah_number',
        'ayah_number',
        'last_read_at',
    ];

    protected $casts = [
        'last_read_at' => 'datetime',
    ];

    /**
     * Get the user that owns the reading progress.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the surah for this reading progress.
     */
    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class, 'surah_number', 'number');
    }

    /**
     * Get the ayah for this reading progress.
     */
    public function ayah(): BelongsTo
    {
        return $this->belongsTo(Ayah::class, 'ayah_number', 'ayah_number')
                    ->where('surah_number', $this->surah_number);
    }
}
