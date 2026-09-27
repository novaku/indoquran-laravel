<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleComment extends Model
{
    use HasFactory;

    protected $table = 'article_comments';

    protected $fillable = [
        'article_id',
        'user_id',
        'name',
        'email',
        'content',
        'is_anonymous',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $appends = [
        'author_name',
        'time_ago'
    ];

    /**
     * Get the article this comment belongs to
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Get the registered user who wrote the comment (if logged in)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get author display name
     */
    public function getAuthorNameAttribute(): string
    {
        if ($this->is_anonymous) {
            return 'Hamba Allah';
        }

        if ($this->user_id && $this->user) {
            return $this->user->name ?? 'Hamba Allah';
        }

        if (!empty($this->name) && trim($this->name) !== '') {
            return trim($this->name);
        }

        return 'Hamba Allah';
    }

    /**
     * Get time ago formatted string
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at ? $this->created_at->diffForHumans() : '';
    }
}
