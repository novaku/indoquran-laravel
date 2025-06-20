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
        if (!Schema::hasTable('ayahs')) {
            Schema::create('ayahs', function (Blueprint $table) {
                $table->id();
                $table->unsignedSmallInteger('surah_number');
                $table->unsignedSmallInteger('ayah_number');
                $table->text('text_arabic');
                $table->text('text_latin');
                $table->text('text_indonesian');
                $table->unsignedSmallInteger('juz');
                $table->unsignedSmallInteger('page');
                $table->text('tafsir')->nullable();
                $table->json('audio_urls')->nullable();
                $table->timestamps();

                $table->unique(['surah_number', 'ayah_number']);
            });
        } else {
            Schema::table('ayahs', function (Blueprint $table) {
                if (!Schema::hasColumn('ayahs', 'audio_urls')) {
                    $table->json('audio_urls')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ayahs', function (Blueprint $table) {
            if (Schema::hasColumn('ayahs', 'audio_urls')) {
                $table->dropColumn('audio_urls');
            }
        });
    }
};
