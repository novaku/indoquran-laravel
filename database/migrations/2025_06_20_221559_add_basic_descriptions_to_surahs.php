<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Surah;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add basic descriptions for all surahs that don't have them
        $surahs = Surah::all();
        
        foreach ($surahs as $surah) {
            if (empty($surah->description_short)) {
                $description = "Surah {$surah->name_latin} adalah surah ke-{$surah->number} dalam Al-Quran yang terdiri dari {$surah->total_ayahs} ayat";
                
                if ($surah->revelation_place) {
                    $place = ucfirst($surah->revelation_place);
                    $description .= " dan diturunkan di {$place}";
                }
                
                $description .= ".";
                
                $surah->update([
                    'description_short' => $description
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration doesn't need a rollback since it only adds missing data
    }
};
