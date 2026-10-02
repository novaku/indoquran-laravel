<?php

namespace Tests\Unit\Models;

use App\Models\AdminOtpCode;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOtpCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_otp_returns_six_digit_string(): void
    {
        $otp = AdminOtpCode::generateOtp();

        $this->assertIsString($otp);
        $this->assertEquals(6, strlen($otp));
        $this->assertMatchesRegularExpression('/^[0-9]{6}$/', $otp);
    }

    public function test_create_for_email_invalidates_previous_otps_and_creates_new(): void
    {
        $email = 'admin@indoquran.web.id';

        $otp1 = AdminOtpCode::createForEmail($email, '127.0.0.1', 'Mozilla');
        $this->assertFalse($otp1->is_used);

        // Creating second OTP should invalidate first OTP
        $otp2 = AdminOtpCode::createForEmail($email, '127.0.0.1', 'Mozilla');

        $this->assertTrue($otp1->fresh()->is_used);
        $this->assertNotNull($otp1->fresh()->used_at);

        $this->assertFalse($otp2->is_used);
        $this->assertTrue($otp2->isValid());
        $this->assertEquals($email, $otp2->email);
        $this->assertEquals('127.0.0.1', $otp2->ip_address);
    }

    public function test_mark_as_used(): void
    {
        $otp = AdminOtpCode::createForEmail('admin@indoquran.web.id');
        $this->assertTrue($otp->isValid());

        $otp->markAsUsed();

        $this->assertTrue($otp->fresh()->is_used);
        $this->assertNotNull($otp->fresh()->used_at);
        $this->assertFalse($otp->fresh()->isValid());
    }

    public function test_is_valid_expired(): void
    {
        $otp = AdminOtpCode::create([
            'email' => 'admin@indoquran.web.id',
            'otp_code' => '123456',
            'expires_at' => Carbon::now()->subMinute(),
            'is_used' => false,
        ]);

        $this->assertFalse($otp->isValid());
    }

    public function test_find_valid_otp(): void
    {
        $email = 'admin@indoquran.web.id';
        $otp = AdminOtpCode::createForEmail($email);

        $found = AdminOtpCode::findValidOtp($email, $otp->otp_code);
        $this->assertNotNull($found);
        $this->assertEquals($otp->id, $found->id);

        $notFound = AdminOtpCode::findValidOtp($email, '000000');
        $this->assertNull($notFound);

        $wrongEmail = AdminOtpCode::findValidOtp('other@indoquran.web.id', $otp->otp_code);
        $this->assertNull($wrongEmail);
    }
}
