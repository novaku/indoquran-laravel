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
        Schema::create('asmaul_husna_verses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('name_id')->constrained('asmaul_husna_names')->onDelete('cascade');
            $table->integer('surah_number'); // Surah number
            $table->integer('ayah_number'); // Ayah number  
            $table->text('text'); // Arabic verse text
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['name_id', 'sort_order']);
            $table->index(['surah_number', 'ayah_number']);
            
            // Unique constraint to prevent duplicate verse for same name
            $table->unique(['name_id', 'surah_number', 'ayah_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asmaul_husna_verses');
    }
};
