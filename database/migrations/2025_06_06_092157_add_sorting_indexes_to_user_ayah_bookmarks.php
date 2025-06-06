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
        Schema::table('user_ayah_bookmarks', function (Blueprint $table) {
            // Add index to optimize sorting queries with joins to ayahs table
            $table->index(['ayah_id', 'user_id'], 'user_ayah_bookmarks_sorting_index');
            $table->index('is_favorite', 'user_ayah_bookmarks_favorite_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_ayah_bookmarks', function (Blueprint $table) {
            $table->dropIndex('user_ayah_bookmarks_sorting_index');
            $table->dropIndex('user_ayah_bookmarks_favorite_index');
        });
    }
};
