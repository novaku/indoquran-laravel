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
        if (Schema::hasColumn('ayahs', 'text_english')) {
            Schema::table('ayahs', function (Blueprint $table) {
                $table->dropColumn('text_english');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ayahs', function (Blueprint $table) {
            $table->text('text_english')->nullable()->after('text_indonesian');
        });
    }
};
