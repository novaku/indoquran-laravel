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
        Schema::create('tafsir_maudhui_verses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('tafsir_maudhui_topics')->onDelete('cascade');
            $table->integer('surah_number');
            $table->integer('ayah_number');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['topic_id', 'sort_order']);
            $table->index(['surah_number', 'ayah_number']);
            $table->unique(['topic_id', 'surah_number', 'ayah_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tafsir_maudhui_verses');
    }
};
