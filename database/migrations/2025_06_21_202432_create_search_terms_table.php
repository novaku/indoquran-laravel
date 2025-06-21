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
        Schema::create('search_terms', function (Blueprint $table) {
            $table->id();
            $table->string('term')->index(); // Search term yang digunakan
            $table->integer('search_count')->default(1); // Counter untuk popularitas
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // User ID jika login
            $table->string('user_ip')->nullable(); // IP address untuk tracking anonymous users
            $table->timestamps();
            
            // Index untuk optimasi query
            $table->index(['term', 'search_count']);
            $table->index(['user_id', 'created_at']);
            $table->index('search_count'); // Untuk mendapatkan popular searches
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_terms');
    }
};
