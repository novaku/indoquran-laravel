<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Daftar 11 tabel kitab hadits lengkap (Kutubus Sittah, Kutubut Tis'ah & Fikih/Adab)
     *
     * @var array<string>
     */
    protected array $tables = [
        'hadits_shahih_bukhari',
        'hadits_shahih_muslim',
        'hadits_sunan_abu_daud',
        'hadits_sunan_tirmidzi',
        'hadits_sunan_nasai',
        'hadits_sunan_ibnu_majah',
        'hadits_musnad_ahmad',
        'hadits_muwatho_malik',
        'hadits_musnad_darimi',
        'hadits_musnad_syafii',
        'hadits_riyadhus_shalihin',
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
                    $table->string('kitab', 200);
                    $table->longText('arab');
                    $table->longText('terjemah');
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
