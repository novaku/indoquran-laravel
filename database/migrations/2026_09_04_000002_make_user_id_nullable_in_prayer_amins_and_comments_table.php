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
        // 1. Update prayer_comments table
        Schema::table('prayer_comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
        });

        // 2. Update prayer_amins table
        Schema::table('prayer_amins', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            if (!Schema::hasColumn('prayer_amins', 'ip_address')) {
                $table->string('ip_address', 45)->nullable()->after('prayer_id')->index();
            }
            if (!Schema::hasColumn('prayer_amins', 'visitor_id')) {
                $table->string('visitor_id', 64)->nullable()->after('ip_address')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prayer_amins', function (Blueprint $table) {
            if (Schema::hasColumn('prayer_amins', 'visitor_id')) {
                $table->dropColumn('visitor_id');
            }
            if (Schema::hasColumn('prayer_amins', 'ip_address')) {
                $table->dropColumn('ip_address');
            }
            $table->foreignId('user_id')->nullable(false)->change();
        });

        Schema::table('prayer_comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
