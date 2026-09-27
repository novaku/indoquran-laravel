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
        if (!Schema::hasTable('article_comments')) {
            Schema::create('article_comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('name')->nullable();
                $table->string('email')->nullable();
                $table->text('content');
                $table->boolean('is_anonymous')->default(false);
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamps();

                $table->index(['article_id', 'created_at']);
                $table->index('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_comments');
    }
};
