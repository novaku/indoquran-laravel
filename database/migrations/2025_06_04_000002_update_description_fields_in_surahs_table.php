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
            // Only rename if description exists and description_long doesn't
            if (Schema::hasColumn('surahs', 'description') && !Schema::hasColumn('surahs', 'description_long')) {
                $table->renameColumn('description', 'description_long');
            }
            // If description doesn't exist but we need description_long, create it
            else if (!Schema::hasColumn('surahs', 'description') && !Schema::hasColumn('surahs', 'description_long')) {
                $table->text('description_long')->nullable();
            }
            
            // Add description_short field after audio_urls if it doesn't exist
            if (!Schema::hasColumn('surahs', 'description_short')) {
                $table->text('description_short')->nullable()->after('audio_urls');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surahs', function (Blueprint $table) {
            // Only rename if description_long exists and description doesn't
            if (Schema::hasColumn('surahs', 'description_long') && !Schema::hasColumn('surahs', 'description')) {
                $table->renameColumn('description_long', 'description');
            } 
            // If both exist or neither exist, do nothing for this part
            
            // Drop description_short if it exists
            if (Schema::hasColumn('surahs', 'description_short')) {
                $table->dropColumn('description_short');
            }
        });
    }
};
