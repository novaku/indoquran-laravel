<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration fixes the juz values in the ayahs table with accurate 
     * Quranic juz divisions (1-30).
     */
    public function up(): void
    {
        // Accurate Juz mapping for Al-Quran
        $juzMappings = [
            1 => [['surah' => 1, 'start_ayah' => 1, 'end_ayah' => 7], ['surah' => 2, 'start_ayah' => 1, 'end_ayah' => 141]],
            2 => [['surah' => 2, 'start_ayah' => 142, 'end_ayah' => 252]],
            3 => [['surah' => 2, 'start_ayah' => 253, 'end_ayah' => 286], ['surah' => 3, 'start_ayah' => 1, 'end_ayah' => 92]],
            4 => [['surah' => 3, 'start_ayah' => 93, 'end_ayah' => 200], ['surah' => 4, 'start_ayah' => 1, 'end_ayah' => 23]],
            5 => [['surah' => 4, 'start_ayah' => 24, 'end_ayah' => 147]],
            6 => [['surah' => 4, 'start_ayah' => 148, 'end_ayah' => 176], ['surah' => 5, 'start_ayah' => 1, 'end_ayah' => 81]],
            7 => [['surah' => 5, 'start_ayah' => 82, 'end_ayah' => 120], ['surah' => 6, 'start_ayah' => 1, 'end_ayah' => 110]],
            8 => [['surah' => 6, 'start_ayah' => 111, 'end_ayah' => 165], ['surah' => 7, 'start_ayah' => 1, 'end_ayah' => 87]],
            9 => [['surah' => 7, 'start_ayah' => 88, 'end_ayah' => 206], ['surah' => 8, 'start_ayah' => 1, 'end_ayah' => 40]],
            10 => [['surah' => 8, 'start_ayah' => 41, 'end_ayah' => 75], ['surah' => 9, 'start_ayah' => 1, 'end_ayah' => 92]],
            11 => [['surah' => 9, 'start_ayah' => 93, 'end_ayah' => 129], ['surah' => 10, 'start_ayah' => 1, 'end_ayah' => 109], ['surah' => 11, 'start_ayah' => 1, 'end_ayah' => 5]],
            12 => [['surah' => 11, 'start_ayah' => 6, 'end_ayah' => 123], ['surah' => 12, 'start_ayah' => 1, 'end_ayah' => 52]],
            13 => [['surah' => 12, 'start_ayah' => 53, 'end_ayah' => 111], ['surah' => 13, 'start_ayah' => 1, 'end_ayah' => 43], ['surah' => 14, 'start_ayah' => 1, 'end_ayah' => 52]],
            14 => [['surah' => 15, 'start_ayah' => 1, 'end_ayah' => 99], ['surah' => 16, 'start_ayah' => 1, 'end_ayah' => 128]],
            15 => [['surah' => 17, 'start_ayah' => 1, 'end_ayah' => 111], ['surah' => 18, 'start_ayah' => 1, 'end_ayah' => 74]],
            16 => [['surah' => 18, 'start_ayah' => 75, 'end_ayah' => 110], ['surah' => 19, 'start_ayah' => 1, 'end_ayah' => 98], ['surah' => 20, 'start_ayah' => 1, 'end_ayah' => 135]],
            17 => [['surah' => 21, 'start_ayah' => 1, 'end_ayah' => 112], ['surah' => 22, 'start_ayah' => 1, 'end_ayah' => 78]],
            18 => [['surah' => 23, 'start_ayah' => 1, 'end_ayah' => 118], ['surah' => 24, 'start_ayah' => 1, 'end_ayah' => 64], ['surah' => 25, 'start_ayah' => 1, 'end_ayah' => 20]],
            19 => [['surah' => 25, 'start_ayah' => 21, 'end_ayah' => 77], ['surah' => 26, 'start_ayah' => 1, 'end_ayah' => 227], ['surah' => 27, 'start_ayah' => 1, 'end_ayah' => 55]],
            20 => [['surah' => 27, 'start_ayah' => 56, 'end_ayah' => 93], ['surah' => 28, 'start_ayah' => 1, 'end_ayah' => 88], ['surah' => 29, 'start_ayah' => 1, 'end_ayah' => 45]],
            21 => [['surah' => 29, 'start_ayah' => 46, 'end_ayah' => 69], ['surah' => 30, 'start_ayah' => 1, 'end_ayah' => 60], ['surah' => 31, 'start_ayah' => 1, 'end_ayah' => 34], ['surah' => 32, 'start_ayah' => 1, 'end_ayah' => 30], ['surah' => 33, 'start_ayah' => 1, 'end_ayah' => 30]],
            22 => [['surah' => 33, 'start_ayah' => 31, 'end_ayah' => 73], ['surah' => 34, 'start_ayah' => 1, 'end_ayah' => 54], ['surah' => 35, 'start_ayah' => 1, 'end_ayah' => 45], ['surah' => 36, 'start_ayah' => 1, 'end_ayah' => 27]],
            23 => [['surah' => 36, 'start_ayah' => 28, 'end_ayah' => 83], ['surah' => 37, 'start_ayah' => 1, 'end_ayah' => 182], ['surah' => 38, 'start_ayah' => 1, 'end_ayah' => 88], ['surah' => 39, 'start_ayah' => 1, 'end_ayah' => 31]],
            24 => [['surah' => 39, 'start_ayah' => 32, 'end_ayah' => 75], ['surah' => 40, 'start_ayah' => 1, 'end_ayah' => 85], ['surah' => 41, 'start_ayah' => 1, 'end_ayah' => 46]],
            25 => [['surah' => 41, 'start_ayah' => 47, 'end_ayah' => 54], ['surah' => 42, 'start_ayah' => 1, 'end_ayah' => 53], ['surah' => 43, 'start_ayah' => 1, 'end_ayah' => 89], ['surah' => 44, 'start_ayah' => 1, 'end_ayah' => 59], ['surah' => 45, 'start_ayah' => 1, 'end_ayah' => 37]],
            26 => [['surah' => 46, 'start_ayah' => 1, 'end_ayah' => 35], ['surah' => 47, 'start_ayah' => 1, 'end_ayah' => 38], ['surah' => 48, 'start_ayah' => 1, 'end_ayah' => 29], ['surah' => 49, 'start_ayah' => 1, 'end_ayah' => 18], ['surah' => 50, 'start_ayah' => 1, 'end_ayah' => 45], ['surah' => 51, 'start_ayah' => 1, 'end_ayah' => 30]],
            27 => [['surah' => 51, 'start_ayah' => 31, 'end_ayah' => 60], ['surah' => 52, 'start_ayah' => 1, 'end_ayah' => 49], ['surah' => 53, 'start_ayah' => 1, 'end_ayah' => 62], ['surah' => 54, 'start_ayah' => 1, 'end_ayah' => 55], ['surah' => 55, 'start_ayah' => 1, 'end_ayah' => 78], ['surah' => 56, 'start_ayah' => 1, 'end_ayah' => 96], ['surah' => 57, 'start_ayah' => 1, 'end_ayah' => 29]],
            28 => [['surah' => 58, 'start_ayah' => 1, 'end_ayah' => 22], ['surah' => 59, 'start_ayah' => 1, 'end_ayah' => 24], ['surah' => 60, 'start_ayah' => 1, 'end_ayah' => 13], ['surah' => 61, 'start_ayah' => 1, 'end_ayah' => 14], ['surah' => 62, 'start_ayah' => 1, 'end_ayah' => 11], ['surah' => 63, 'start_ayah' => 1, 'end_ayah' => 11], ['surah' => 64, 'start_ayah' => 1, 'end_ayah' => 18], ['surah' => 65, 'start_ayah' => 1, 'end_ayah' => 12], ['surah' => 66, 'start_ayah' => 1, 'end_ayah' => 12]],
            29 => [['surah' => 67, 'start_ayah' => 1, 'end_ayah' => 30], ['surah' => 68, 'start_ayah' => 1, 'end_ayah' => 52], ['surah' => 69, 'start_ayah' => 1, 'end_ayah' => 52], ['surah' => 70, 'start_ayah' => 1, 'end_ayah' => 44], ['surah' => 71, 'start_ayah' => 1, 'end_ayah' => 28], ['surah' => 72, 'start_ayah' => 1, 'end_ayah' => 28], ['surah' => 73, 'start_ayah' => 1, 'end_ayah' => 20], ['surah' => 74, 'start_ayah' => 1, 'end_ayah' => 56], ['surah' => 75, 'start_ayah' => 1, 'end_ayah' => 40], ['surah' => 76, 'start_ayah' => 1, 'end_ayah' => 31], ['surah' => 77, 'start_ayah' => 1, 'end_ayah' => 50]],
            30 => [
                ['surah' => 78, 'start_ayah' => 1, 'end_ayah' => 40], ['surah' => 79, 'start_ayah' => 1, 'end_ayah' => 46],
                ['surah' => 80, 'start_ayah' => 1, 'end_ayah' => 42], ['surah' => 81, 'start_ayah' => 1, 'end_ayah' => 29],
                ['surah' => 82, 'start_ayah' => 1, 'end_ayah' => 19], ['surah' => 83, 'start_ayah' => 1, 'end_ayah' => 36],
                ['surah' => 84, 'start_ayah' => 1, 'end_ayah' => 25], ['surah' => 85, 'start_ayah' => 1, 'end_ayah' => 22],
                ['surah' => 86, 'start_ayah' => 1, 'end_ayah' => 17], ['surah' => 87, 'start_ayah' => 1, 'end_ayah' => 19],
                ['surah' => 88, 'start_ayah' => 1, 'end_ayah' => 26], ['surah' => 89, 'start_ayah' => 1, 'end_ayah' => 30],
                ['surah' => 90, 'start_ayah' => 1, 'end_ayah' => 20], ['surah' => 91, 'start_ayah' => 1, 'end_ayah' => 15],
                ['surah' => 92, 'start_ayah' => 1, 'end_ayah' => 21], ['surah' => 93, 'start_ayah' => 1, 'end_ayah' => 11],
                ['surah' => 94, 'start_ayah' => 1, 'end_ayah' => 8], ['surah' => 95, 'start_ayah' => 1, 'end_ayah' => 8],
                ['surah' => 96, 'start_ayah' => 1, 'end_ayah' => 19], ['surah' => 97, 'start_ayah' => 1, 'end_ayah' => 5],
                ['surah' => 98, 'start_ayah' => 1, 'end_ayah' => 8], ['surah' => 99, 'start_ayah' => 1, 'end_ayah' => 8],
                ['surah' => 100, 'start_ayah' => 1, 'end_ayah' => 11], ['surah' => 101, 'start_ayah' => 1, 'end_ayah' => 11],
                ['surah' => 102, 'start_ayah' => 1, 'end_ayah' => 8], ['surah' => 103, 'start_ayah' => 1, 'end_ayah' => 3],
                ['surah' => 104, 'start_ayah' => 1, 'end_ayah' => 9], ['surah' => 105, 'start_ayah' => 1, 'end_ayah' => 5],
                ['surah' => 106, 'start_ayah' => 1, 'end_ayah' => 4], ['surah' => 107, 'start_ayah' => 1, 'end_ayah' => 7],
                ['surah' => 108, 'start_ayah' => 1, 'end_ayah' => 3], ['surah' => 109, 'start_ayah' => 1, 'end_ayah' => 6],
                ['surah' => 110, 'start_ayah' => 1, 'end_ayah' => 3], ['surah' => 111, 'start_ayah' => 1, 'end_ayah' => 5],
                ['surah' => 112, 'start_ayah' => 1, 'end_ayah' => 4], ['surah' => 113, 'start_ayah' => 1, 'end_ayah' => 5],
                ['surah' => 114, 'start_ayah' => 1, 'end_ayah' => 6]
            ],
        ];

        // Update each juz range
        foreach ($juzMappings as $juzNumber => $ranges) {
            foreach ($ranges as $range) {
                if ($range['start_ayah'] === $range['end_ayah']) {
                    // Single ayah
                    DB::table('ayahs')
                        ->where('surah_number', $range['surah'])
                        ->where('ayah_number', $range['start_ayah'])
                        ->update(['juz' => $juzNumber]);
                } else {
                    // Range of ayahs
                    DB::table('ayahs')
                        ->where('surah_number', $range['surah'])
                        ->whereBetween('ayah_number', [$range['start_ayah'], $range['end_ayah']])
                        ->update(['juz' => $juzNumber]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset all juz values to NULL
        DB::table('ayahs')->update(['juz' => null]);
    }
};
