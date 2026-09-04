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
        if (!Schema::hasTable('selected_prayers')) {
            Schema::create('selected_prayers', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('category')->index(); // e.g. al-quran, para-nabi, sehari-hari, perlindungan, dll
                $table->string('category_name');     // e.g. Doa Al-Qur'an, Doa Para Nabi
                $table->text('arabic');              // Teks Arab lengkap berharakat
                $table->text('latin');               // Transliterasi Latin
                $table->text('translation');         // Terjemahan Bahasa Indonesia
                $table->string('source')->nullable(); // Dalil / Riwayat (QS/Hadits)
                $table->text('fadhilah')->nullable(); // Keutamaan / Manfaat / Waktu membaca
                $table->integer('order')->default(0)->index();
                $table->timestamps();

                $table->index(['category', 'order']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('selected_prayers');
    }
};
