<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Carbon\Carbon;

class PasswordResetController extends Controller
{

    /**
     * Send password reset link via Email
     */
    public function sendResetLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.exists' => 'Email tidak terdaftar dalam sistem',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Generate reset token
        $token = Str::random(64);
        
        // Store token in database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // Send email with reset link
        try {
            $resetUrl = url('/password/reset?token=' . $token . '&email=' . urlencode($email));
            
            Mail::send('emails.password-reset', [
                'name' => $user->name,
                'resetUrl' => $resetUrl,
                'email' => $email
            ], function ($message) use ($email, $user) {
                $message->to($email, $user->name)
                        ->subject('Reset Password - IndoQuran');
            });

            return response()->json([
                'success' => true,
                'message' => 'Link reset password telah dikirim ke email Anda',
                'email' => $email
            ]);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Password reset email failed: ' . $e->getMessage());
            
            // Clean up the token
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email reset password. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Validate password reset token
     */
    public function validateToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak valid'
            ], 422);
        }

        $email = $request->email;
        $token = $request->token;

        // Check if token exists and is valid
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid'
            ], 400);
        }

        // Check if token matches
        if (!Hash::check($token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid'
            ], 400);
        }

        // Check if token is not expired (60 minutes)
        $tokenAge = Carbon::parse($resetRecord->created_at)->diffInMinutes(Carbon::now());
        if ($tokenAge > 60) {
            // Delete expired token
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            
            return response()->json([
                'success' => false,
                'message' => 'Token sudah kedaluwarsa'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token valid'
        ]);
    }

    /**
     * Reset password with new password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers()
            ],
        ], [
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.exists' => 'Email tidak terdaftar',
            'token.required' => 'Token wajib diisi',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $token = $request->token;
        $password = $request->password;

        // Validate token again
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$resetRecord || !Hash::check($token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kedaluwarsa'
            ], 400);
        }

        // Check token expiration
        $tokenAge = Carbon::parse($resetRecord->created_at)->diffInMinutes(Carbon::now());
        if ($tokenAge > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            
            return response()->json([
                'success' => false,
                'message' => 'Token sudah kedaluwarsa'
            ], 400);
        }

        // Update user password
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        try {
            $user->password = Hash::make($password);
            $user->save();

            // Delete the used token
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            // Optionally, revoke all existing tokens for security
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah'
            ]);

        } catch (\Exception $e) {
            Log::error('Password reset failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah password. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Mask phone number for display
     *
     * @param string $phone
     * @return string
     */
    protected function maskPhoneNumber($phone)
    {
        if (strlen($phone) <= 4) {
            return $phone;
        }
        
        return substr($phone, 0, 4) . str_repeat('*', strlen($phone) - 7) . substr($phone, -3);
    }
}
