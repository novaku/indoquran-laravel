<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the column teks_latin exists
        if (Schema::hasColumn('ayahs', 'teks_latin')) {
            Schema::table('ayahs', function (Blueprint $table) {
                $table->renameColumn('teks_latin', 'text_latin');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if the column text_latin exists
        if (Schema::hasColumn('ayahs', 'text_latin')) {
            Schema::table('ayahs', function (Blueprint $table) {
                $table->renameColumn('text_latin', 'teks_latin');
            });
        }
    }
};
