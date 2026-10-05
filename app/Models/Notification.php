<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'identifier',
        'title',
        'message',
        'link',
        'category',
        'type',
        'badge_icon',
        'badge_color',
        'image',
        'section',
        'time_ago',
        'is_featured',
        'is_active',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    /**
     * Scope only active notifications
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered notifications
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')
            ->orderByDesc('published_at')
            ->orderByDesc('id');
    }

    /**
     * Scope by section ('new' or 'earlier')
     */
    public function scopeSection($query, string $section)
    {
        return $query->where('section', $section);
    }

    /**
     * Compute dynamic human readable time ago in Indonesian
     */
    public function getFormattedTimeAgoAttribute(): string
    {
        if (!empty($this->time_ago)) {
            return $this->time_ago;
        }

        $date = $this->published_at ?? $this->created_at;
        if (!$date) {
            return 'Baru saja';
        }

        $carbon = Carbon::parse($date)->locale('id');
        $diffMinutes = abs(now()->diffInMinutes($carbon));

        if ($diffMinutes < 5) {
            return 'Baru saja';
        }

        return $carbon->diffForHumans();
    }

    /**
     * Transform model to the format expected by the frontend NotificationDropdown
     */
    public function toResponseArray(): array
    {
        $date = $this->published_at ?? $this->created_at ?? now();

        return [
            'id' => $this->identifier ?: ('notif-' . $this->id),
            'title' => (string) $this->title,
            'message' => (string) $this->message,
            'link' => (string) ($this->link ?: '/'),
            'time_ago' => $this->formatted_time_ago,
            'timestamp' => Carbon::parse($date)->toIso8601String(),
            'category' => (string) ($this->category ?: 'Fitur Baru'),
            'type' => (string) ($this->type ?: 'feature'),
            'badge_icon' => (string) ($this->badge_icon ?: 'book'),
            'badge_color' => (string) ($this->badge_color ?: 'bg-emerald-600'),
            'image' => (string) ($this->image ?: '/images/logo-icon.webp'),
            'section' => (string) ($this->section ?: 'new'),
            'is_featured' => (bool) $this->is_featured,
        ];
    }
}
