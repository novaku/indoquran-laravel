<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AsmaulHusnaVerse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_id',
        'surah_number',
        'ayah_number',
        'text',
        'sort_order'
    ];

    protected $casts = [
        'name_id' => 'integer',
        'surah_number' => 'integer',
        'ayah_number' => 'integer',
        'sort_order' => 'integer'
    ];

    /**
     * Get the name that owns this verse
     */
    public function name()
    {
        return $this->belongsTo(AsmaulHusnaName::class, 'name_id');
    }

    /**
     * Scope to get verses in order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Get verse reference (e.g., "2:255")
     */
    public function getVerseReferenceAttribute()
    {
        return $this->surah_number . ':' . $this->ayah_number;
    }
}
