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
        Schema::create('user_hadits_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('kitab_slug', 64);
            $table->unsignedInteger('hadits_number');
            $table->boolean('is_favorite')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Ensure a user can only bookmark a hadith once per book and number
            $table->unique(['user_id', 'kitab_slug', 'hadits_number'], 'user_hadits_unique');

            // Indexes for fast lookup and filtering
            $table->index(['user_id', 'is_favorite'], 'user_hadits_fav_idx');
            $table->index(['kitab_slug', 'hadits_number'], 'hadits_lookup_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_hadits_bookmarks');
    }
};
