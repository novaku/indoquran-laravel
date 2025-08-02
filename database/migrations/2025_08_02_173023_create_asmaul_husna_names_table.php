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
        Schema::create('asmaul_husna_names', function (Blueprint $table) {
            $table->id();
            $table->integer('original_id')->unique(); // Original ID from JSON
            $table->string('arabic', 100); // Arabic name
            $table->string('latin', 100); // Latin transliteration
            $table->string('meaning', 200); // Indonesian meaning
            $table->text('description'); // Detailed description
            $table->string('slug', 150)->unique(); // URL-friendly slug
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['is_active', 'sort_order']);
            $table->index('original_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asmaul_husna_names');
    }
};
