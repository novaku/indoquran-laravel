<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AdminOtpCode extends Model
{
    protected $fillable = [
        'email',
        'otp_code',
        'expires_at',
        'is_used',
        'used_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Check if the OTP code is valid (not expired and not used)
     */
    public function isValid(): bool
    {
        return !$this->is_used && $this->expires_at->isFuture();
    }

    /**
     * Mark the OTP as used
     */
    public function markAsUsed(): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }

    /**
     * Generate a new 6-digit OTP code
     */
    public static function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new OTP for the given email
     */
    public static function createForEmail(string $email, ?string $ipAddress = null, ?string $userAgent = null): self
    {
        // Invalidate any existing unused OTPs for this email
        static::where('email', $email)
            ->where('is_used', false)
            ->update(['is_used' => true, 'used_at' => now()]);

        return static::create([
            'email' => $email,
            'otp_code' => static::generateOtp(),
            'expires_at' => Carbon::now()->addHour(), // 1 hour expiry
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Find a valid OTP for email and code
     */
    public static function findValidOtp(string $email, string $code): ?self
    {
        return static::where('email', $email)
            ->where('otp_code', $code)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();
    }
}
