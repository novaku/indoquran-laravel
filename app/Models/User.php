<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's ayah bookmarks.
     */
    public function ayahBookmarks(): HasMany
    {
        return $this->hasMany(UserAyahBookmark::class);
    }

    /**
     * Get the user's favorite ayahs.
     */
    public function favoriteAyahs(): BelongsToMany
    {
        return $this->belongsToMany(Ayah::class, 'user_ayah_bookmarks')
                    ->wherePivot('is_favorite', true)
                    ->withPivot(['is_favorite', 'notes', 'created_at'])
                    ->withTimestamps();
    }

    /**
     * Get all bookmarked ayahs (including non-favorites).
     */
    public function bookmarkedAyahs(): BelongsToMany
    {
        return $this->belongsToMany(Ayah::class, 'user_ayah_bookmarks')
                    ->withPivot(['is_favorite', 'notes', 'created_at'])
                    ->withTimestamps();
    }
}
