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
        Schema::create('user_ayah_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('ayah_id')->constrained('ayahs')->onDelete('cascade');
            $table->boolean('is_favorite')->default(false);
            $table->text('notes')->nullable(); // Optional notes for the bookmark
            $table->timestamps();
            
            // Ensure a user can only bookmark an ayah once
            $table->unique(['user_id', 'ayah_id']);
            
            // Add indexes for better performance
            $table->index(['user_id', 'is_favorite']);
            $table->index('ayah_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_ayah_bookmarks');
    }
};
