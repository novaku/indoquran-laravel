<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Http\Controllers\HaditsController;

class Hadits extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'no',
        'kitab',
        'kategori',
        'arab',
        'indonesia',
        'penjelasan',
    ];

    protected $casts = [
        'id' => 'integer',
        'no' => 'integer',
    ];

    /**
     * Set dynamic table name for specific hadits book
     */
    public static function forTable(string $table): self
    {
        $instance = new static();
        $instance->setTable($table);
        return $instance;
    }

    /**
     * Set table by kitab slug
     */
    public static function forKitab(string $slug): ?self
    {
        $resolved = HaditsController::resolveKitabSlug($slug);
        if (!$resolved) {
            return null;
        }

        $catalog = HaditsController::getKitabCatalog();
        $table = $catalog[$resolved]['table'] ?? null;
        if (!$table) {
            return null;
        }

        return static::forTable($table);
    }
}
