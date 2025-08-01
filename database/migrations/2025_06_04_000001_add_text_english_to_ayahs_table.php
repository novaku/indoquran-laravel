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
        Schema::table('ayahs', function (Blueprint $table) {
            // Check if text_english column already exists
            if (!Schema::hasColumn('ayahs', 'text_english')) {
                // Add the text_english field after text_indonesian
                $table->text('text_english')->nullable()->after('text_indonesian');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ayahs', function (Blueprint $table) {
            if (Schema::hasColumn('ayahs', 'text_english')) {
                $table->dropColumn('text_english');
            }
        });
    }
};
