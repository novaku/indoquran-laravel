<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First check if the table and column exist
        if (Schema::hasTable('search_terms') && Schema::hasColumn('search_terms', 'user_id')) {
            // Get foreign key constraints
            $foreignKeys = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'search_terms' AND COLUMN_NAME = 'user_id' AND CONSTRAINT_NAME != 'PRIMARY' AND TABLE_SCHEMA = DATABASE()");
            
            Schema::table('search_terms', function (Blueprint $table) use ($foreignKeys) {
                // Drop foreign key if it exists
                if (!empty($foreignKeys)) {
                    $table->dropForeign(['user_id']);
                }
                
                // Drop column
                $table->dropColumn('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('search_terms', function (Blueprint $table) {
            if (!Schema::hasColumn('search_terms', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->index(['user_id', 'created_at']);
            }
        });
    }
};
