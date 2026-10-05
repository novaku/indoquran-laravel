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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('identifier', 100)->nullable()->unique()->comment('Unique string ID for client tracking (e.g. notif-hadits-kategori-filter)');
            $table->string('title');
            $table->text('message');
            $table->string('link', 255)->default('/');
            $table->string('category', 100)->default('Fitur Baru');
            $table->string('type', 50)->default('feature');
            $table->string('badge_icon', 50)->default('book');
            $table->string('badge_color', 50)->default('bg-emerald-600');
            $table->string('image', 255)->default('/images/logo-icon.webp');
            $table->string('section', 20)->default('new')->comment('new or earlier');
            $table->string('time_ago', 50)->nullable()->comment('Static label override (e.g. Baru saja), null for dynamic');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'sort_order', 'published_at']);
            $table->index('section');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
