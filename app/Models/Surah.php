<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Surah extends Model
{
    protected $fillable = [
        'number',
        'total_ayahs',
        'name_indonesian',
        'name_arabic',
        'name_latin',
        'revelation_place',
        'audio_urls',
        'description_short',
        'description_long'
    ];

    protected $casts = [
        'audio_urls' => 'array'
    ];

    /**
     * Get the ayahs for the surah.
     */
    public function ayahs(): HasMany
    {
        return $this->hasMany(Ayah::class, 'surah_number', 'number');
    }
}
