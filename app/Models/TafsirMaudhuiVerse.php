<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TafsirMaudhuiVerse extends Model
{
    protected $fillable = [
        'topic_id',
        'surah_number',
        'ayah_number',
        'sort_order'
    ];

    protected $casts = [
        'topic_id' => 'integer',
        'surah_number' => 'integer',
        'ayah_number' => 'integer',
        'sort_order' => 'integer'
    ];

    /**
     * Get the topic that owns this verse
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(TafsirMaudhuiTopic::class, 'topic_id');
    }

    /**
     * Scope ordered verses
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')
                    ->orderBy('surah_number')
                    ->orderBy('ayah_number');
    }

    /**
     * Get verse reference as string (e.g., "2:255")
     */
    public function getVerseReferenceAttribute(): string
    {
        return "{$this->surah_number}:{$this->ayah_number}";
    }
}
