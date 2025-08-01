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
        Schema::table('visitors', function (Blueprint $table) {
            // Modify existing columns
            $table->string('ip_address')->change();  // Remove the 45 character limit
            
            // Add length to page_url and referrer
            $table->string('page_url', 500)->nullable()->change();
            $table->string('referrer', 500)->nullable()->change();
            
            // Add new indexes
            $table->index('ip_address');
            $table->index('page_url');
            // The existing indexes will remain: 
            // - index(['ip_address', 'visited_at'])
            // - index('visited_at')
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            // Revert column changes
            $table->string('ip_address', 45)->change();
            $table->string('page_url')->nullable()->change();
            $table->string('referrer')->nullable()->change();
            
            // Drop new indexes
            $table->dropIndex(['ip_address']);
            $table->dropIndex(['page_url']);
        });
    }
};
