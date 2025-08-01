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
        if (!Schema::hasTable('admin_otp_codes')) {
            Schema::create('admin_otp_codes', function (Blueprint $table) {
                $table->id();
                $table->string('email')->index();
                $table->string('otp_code', 6);
                $table->timestamp('expires_at');
                $table->boolean('is_used')->default(false);
                $table->timestamp('used_at')->nullable();
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_otp_codes');
    }
};
