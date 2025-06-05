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
        Schema::create('ayahs', function (Blueprint $table) {
            $table->id();
            $table->integer('surah_number')->nullable()->index();
            $table->integer('ayah_number')->nullable();
            $table->text('text_arabic')->nullable();
            $table->text('text_latin')->nullable();
            $table->integer('juz')->nullable();
            $table->integer('page')->nullable();
            $table->text('text_indonesian')->nullable();
            $table->text('tafsir')->nullable();
            $table->json('audio_urls')->nullable();
            $table->timestamps();
            
            // Create composite index
            $table->index(['surah_number', 'ayah_number'], 'ayahs_surah_number_in_surah_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ayahs');
    }
};
