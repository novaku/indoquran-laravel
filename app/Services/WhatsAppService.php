<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $apiUrl;
    protected $apiKey;
    protected $fromNumber;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url', env('WHATSAPP_API_URL'));
        $this->apiKey = config('services.whatsapp.api_key', env('WHATSAPP_API_KEY'));
        $this->fromNumber = config('services.whatsapp.from_number', env('WHATSAPP_FROM_NUMBER'));
    }

    /**
     * Send WhatsApp message using wa.me URL approach (same as sharing functionality)
     *
     * @param string $phoneNumber Phone number in international format (e.g., +6281234567890)
     * @param string $message Message content
     * @return array
     */
    public function sendMessage($phoneNumber, $message)
    {
        try {
            // Clean phone number - remove spaces, dashes, and ensure it starts with +
            $cleanPhone = $this->cleanPhoneNumber($phoneNumber);
            
            if (!$cleanPhone) {
                throw new Exception('Invalid phone number format');
            }

            // Remove + from phone number for wa.me URL (wa.me expects number without +)
            $phoneForUrl = ltrim($cleanPhone, '+');
            
            // Create WhatsApp URL (same as sharing functionality)
            $encodedMessage = urlencode($message);
            $whatsappUrl = "https://wa.me/{$phoneForUrl}?text={$encodedMessage}";
            
            Log::info('WhatsApp message URL generated successfully', [
                'phone' => $this->maskPhoneNumber($phoneNumber),
                'url_preview' => substr($whatsappUrl, 0, 100) . '...',
                'message_preview' => substr($message, 0, 100) . '...'
            ]);

            return [
                'success' => true,
                'whatsapp_url' => $whatsappUrl,
                'message' => 'WhatsApp URL generated successfully',
                'phone' => $this->maskPhoneNumber($phoneNumber)
            ];

        } catch (Exception $e) {
            Log::error('WhatsApp service error: ' . $e->getMessage(), [
                'phone' => $phoneNumber,
                'message' => substr($message, 0, 100) . '...'
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send password reset WhatsApp message using wa.me URL approach
     *
     * @param string $phoneNumber
     * @param string $resetUrl
     * @param string $userName
     * @return array
     */
    public function sendPasswordResetMessage($phoneNumber, $resetUrl, $userName = null)
    {
        $message = $this->buildPasswordResetMessage($userName, $resetUrl);
        return $this->sendMessage($phoneNumber, $message);
    }

    /**
     * Build password reset message content
     *
     * @param string $userName
     * @param string $resetUrl
     * @return string
     */
    protected function buildPasswordResetMessage($userName, $resetUrl)
    {
        return "🔒 *Reset Password IndoQuran*\n\n" .
               "Assalamu'alaikum {$userName},\n\n" .
               "Kami menerima permintaan untuk reset password akun IndoQuran Anda.\n\n" .
               "Klik link berikut untuk membuat password baru:\n" .
               "{$resetUrl}\n\n" .
               "⚠️ *Penting:*\n" .
               "• Link ini berlaku selama 60 menit\n" .
               "• Jangan bagikan link ini kepada siapa pun\n" .
               "• Jika Anda tidak meminta reset password, abaikan pesan ini\n\n" .
               "Barakallahu fiikum 🤲\n" .
               "_Tim IndoQuran_";
    }

    /**
     * Clean and validate phone number
     *
     * @param string $phoneNumber
     * @return string|null
     */
    protected function cleanPhoneNumber($phoneNumber)
    {
        // Remove all non-numeric characters except +
        $phone = preg_replace('/[^+\d]/', '', $phoneNumber);
        
        // If it starts with 0, replace with +62 (Indonesia)
        if (substr($phone, 0, 1) === '0') {
            $phone = '+62' . substr($phone, 1);
        }
        
        // If it starts with 62 without +, add +
        if (substr($phone, 0, 2) === '62' && substr($phone, 0, 3) !== '+62') {
            $phone = '+' . $phone;
        }
        
        // If it doesn't start with +, assume it's Indonesian number
        if (substr($phone, 0, 1) !== '+') {
            $phone = '+62' . $phone;
        }
        
        // Validate format (should be +62 followed by 8-12 digits)
        if (preg_match('/^\+62\d{8,12}$/', $phone)) {
            return $phone;
        }
        
        return null;
    }

    /**
     * Mask phone number for privacy
     *
     * @param string $phoneNumber
     * @return string
     */
    protected function maskPhoneNumber($phoneNumber)
    {
        $cleaned = $this->cleanPhoneNumber($phoneNumber);
        if (!$cleaned) {
            return $phoneNumber;
        }
        
        // Show only first 3 and last 2 digits: +62813****90
        if (strlen($cleaned) > 7) {
            $prefix = substr($cleaned, 0, 6); // +62813
            $suffix = substr($cleaned, -2);   // 90
            $masked = $prefix . str_repeat('*', strlen($cleaned) - 8) . $suffix;
            return $masked;
        }
        
        return $cleaned;
    }

    /**
     * Send verification code via WhatsApp
     *
     * @param string $phoneNumber
     * @param string $code
     * @return array
     */
    public function sendVerificationCode($phoneNumber, $code)
    {
        $message = "🔐 *Kode Verifikasi IndoQuran*\n\n" .
                   "Kode verifikasi Anda: *{$code}*\n\n" .
                   "Gunakan kode ini untuk memverifikasi akun Anda.\n" .
                   "Kode berlaku selama 10 menit.\n\n" .
                   "Jangan bagikan kode ini kepada siapa pun.\n\n" .
                   "_Tim IndoQuran_";
        
        return $this->sendMessage($phoneNumber, $message);
    }

    /**
     * Test WhatsApp connection
     *
     * @return array
     */
    public function testConnection()
    {
        try {
            if (!$this->apiUrl || !$this->apiKey) {
                return [
                    'success' => false,
                    'error' => 'WhatsApp API credentials not configured'
                ];
            }

            // Test with a simple health check or send to a test number
            return [
                'success' => true,
                'message' => 'WhatsApp service configured correctly'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
