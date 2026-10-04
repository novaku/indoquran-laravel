<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Http\Controllers\HaditsController;
use Illuminate\Support\Facades\DB;

class UserHaditsBookmark extends Model
{
    protected $fillable = [
        'user_id',
        'kitab_slug',
        'hadits_number',
        'is_favorite',
        'notes'
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
        'hadits_number' => 'integer',
    ];

    /**
     * Get the user that owns the bookmark.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Enrich bookmark with kitab metadata and hadith content (arab & indonesia)
     */
    public function getEnrichedData(): array
    {
        $catalog = HaditsController::getKitabCatalog();
        $kitabInfo = $catalog[$this->kitab_slug] ?? null;

        $arab = '';
        $indonesia = '';
        $penjelasan = null;
        $kategori = '';

        if ($kitabInfo && isset($kitabInfo['table']) && \Illuminate\Support\Facades\Schema::hasTable($kitabInfo['table'])) {
            $table = $kitabInfo['table'];
            $hadits = DB::table($table)->where('no', $this->hadits_number)->first();

            if (!$hadits) {
                $hadits = DB::table($table)->where('id', $this->hadits_number)->first();
            }

            if ($hadits) {
                $arab = $hadits->arab ?? '';
                $indonesia = $hadits->indonesia ?? '';
                $penjelasan = $hadits->penjelasan ?? null;
                $kategori = $hadits->kategori ?? '';
            }
        }

        return [
            'id' => 'hadits_' . $this->kitab_slug . '_' . $this->hadits_number,
            'db_id' => $this->id,
            'kitab_slug' => $this->kitab_slug,
            'kitab_name' => $kitabInfo['name'] ?? $this->kitab_slug,
            'kitab_arab' => $kitabInfo['arab'] ?? '',
            'number' => (int) $this->hadits_number,
            'kategori' => $kategori,
            'arab' => $arab,
            'indonesia' => $indonesia,
            'penjelasan' => $penjelasan,
            'is_favorite' => (bool) $this->is_favorite,
            'notes' => $this->notes ?? '',
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
