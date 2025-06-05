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
        Schema::table('surahs', function (Blueprint $table) {
            // Rename description to description_long
            $table->renameColumn('description', 'description_long');
            
            // Add description_short field after revelation_place
            $table->text('description_short')->nullable()->after('audio_urls');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surahs', function (Blueprint $table) {
            $table->renameColumn('description_long', 'description');
            $table->dropColumn('description_short');
        });
    }
};
