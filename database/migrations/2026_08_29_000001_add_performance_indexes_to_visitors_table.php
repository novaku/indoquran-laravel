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
            // Covering index for date range visitor aggregations
            $table->index(['visited_at', 'ip_address'], 'visitors_visited_at_ip_index');
            
            // Covering index for recent popular pages (realtime stats)
            $table->index(['visited_at', 'page_url'], 'visitors_visited_at_page_url_index');

            // Composite index for rapid deduplication lookup in TrackVisitor middleware
            $table->index(['ip_address', 'page_url', 'visited_at'], 'visitors_ip_page_visited_index');

            // Index for referrer queries
            $table->index('referrer', 'visitors_referrer_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            $table->dropIndex('visitors_visited_at_ip_index');
            $table->dropIndex('visitors_visited_at_page_url_index');
            $table->dropIndex('visitors_ip_page_visited_index');
            $table->dropIndex('visitors_referrer_index');
        });
    }
};
