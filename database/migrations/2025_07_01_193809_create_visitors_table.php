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
        if (!Schema::hasTable('visitors')) {
            Schema::create('visitors', function (Blueprint $table) {
                $table->id();
                $table->string('ip_address', 45);
                $table->text('user_agent')->nullable();
                $table->timestamp('visited_at');
                $table->string('page_url')->nullable();
                $table->string('referrer')->nullable();
                $table->string('session_id')->nullable();
                $table->timestamps();
                
                // Indexes for better performance
                $table->index(['ip_address', 'visited_at']);
                $table->index('visited_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
