<?php

namespace Tests\Unit\Services;

use App\Services\WhatsAppService;
use Tests\TestCase;

class WhatsAppServiceTest extends TestCase
{
    protected WhatsAppService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new WhatsAppService();
    }

    public function test_send_message_with_valid_indonesian_number_starting_with_0(): void
    {
        $result = $this->service->sendMessage('081234567890', 'Halo IndoQuran');

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('https://wa.me/6281234567890', $result['whatsapp_url']);
        $this->assertStringContainsString('text=Halo+IndoQuran', $result['whatsapp_url']);
        $this->assertEquals('WhatsApp URL generated successfully', $result['message']);
        $this->assertStringContainsString('*', $result['phone']);
    }

    public function test_send_message_with_valid_number_starting_with_62(): void
    {
        $result = $this->service->sendMessage('6281234567890', 'Testing 62');

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('https://wa.me/6281234567890', $result['whatsapp_url']);
    }

    public function test_send_message_with_valid_number_starting_with_plus_62(): void
    {
        $result = $this->service->sendMessage('+6281234567890', 'Testing +62');

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('https://wa.me/6281234567890', $result['whatsapp_url']);
    }

    public function test_send_message_with_formatted_number_spaces_and_dashes(): void
    {
        $result = $this->service->sendMessage('+62 812-3456-7890', 'Testing Format');

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('https://wa.me/6281234567890', $result['whatsapp_url']);
    }

    public function test_send_message_with_invalid_phone_number_returns_failure(): void
    {
        $result = $this->service->sendMessage('123', 'Testing Invalid');

        $this->assertFalse($result['success']);
        $this->assertEquals('Invalid phone number format', $result['error']);
    }

    public function test_send_password_reset_message(): void
    {
        $resetUrl = 'https://indoquran.web.id/reset-password/abc123token';
        $result = $this->service->sendPasswordResetMessage('081234567890', $resetUrl, 'Ahmad');

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('wa.me', $result['whatsapp_url']);
        $decodedUrl = urldecode($result['whatsapp_url']);
        $this->assertStringContainsString('Reset Password IndoQuran', $decodedUrl);
        $this->assertStringContainsString('Ahmad', $decodedUrl);
        $this->assertStringContainsString($resetUrl, $decodedUrl);
    }

    public function test_send_verification_code(): void
    {
        $code = '789123';
        $result = $this->service->sendVerificationCode('081234567890', $code);

        $this->assertTrue($result['success']);
        $decodedUrl = urldecode($result['whatsapp_url']);
        $this->assertStringContainsString('Kode Verifikasi IndoQuran', $decodedUrl);
        $this->assertStringContainsString($code, $decodedUrl);
    }

    public function test_test_connection_without_credentials(): void
    {
        config(['services.whatsapp.api_url' => null, 'services.whatsapp.api_key' => null]);
        $service = new WhatsAppService();
        $result = $service->testConnection();

        $this->assertFalse($result['success']);
        $this->assertEquals('WhatsApp API credentials not configured', $result['error']);
    }

    public function test_test_connection_with_credentials(): void
    {
        config(['services.whatsapp.api_url' => 'https://api.whatsapp.test', 'services.whatsapp.api_key' => 'secret_key']);
        $service = new WhatsAppService();
        $result = $service->testConnection();

        $this->assertTrue($result['success']);
        $this->assertEquals('WhatsApp service configured correctly', $result['message']);
    }
}
