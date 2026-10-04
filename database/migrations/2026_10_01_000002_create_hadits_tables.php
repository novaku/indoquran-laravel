<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Daftar 7 tabel kitab hadits lengkap (Kutubus Sittah & Musnad Ahmad)
     *
     * @var array<string>
     */
    protected array $tables = [
        'hadits_shahih_al_bukhari',
        'hadits_shahih_muslim',
        'hadits_sunan_abu_dawud',
        'hadits_jami_at_tirmidzi',
        'hadits_sunan_an_nasai',
        'hadits_sunan_ibnu_majah',
        'hadits_musnad_ahmad',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (!Schema::hasTable($tableName)) {
                Schema::create($tableName, function (Blueprint $table) {
                    $table->id();
                    $table->unsignedInteger('no')->index();
                    $table->string('kitab', 255)->default('');
                    $table->string('kategori', 255)->nullable();
                    $table->longText('arab');
                    $table->longText('indonesia');
                    $table->longText('penjelasan')->nullable();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::dropIfExists($tableName);
        }
    }
};
