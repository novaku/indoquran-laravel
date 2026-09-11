<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    /**
     * Handle Google One Tap / Google Sign-In credential response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleOneTap(Request $request)
    {
        $validated = $request->validate([
            'credential' => ['required', 'string'],
        ]);

        $credential = $validated['credential'];

        try {
            // Verify ID Token with Google tokeninfo endpoint
            $response = Http::timeout(10)->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $credential,
            ]);

            if (!$response->successful()) {
                Log::warning('Google token verification failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'message' => 'Verifikasi token Google gagal.',
                ], 401);
            }

            $payload = $response->json();
            $configuredClientId = config('services.google.client_id');

            // Verify audience if client_id is configured
            if (!empty($configuredClientId) && ($payload['aud'] ?? '') !== $configuredClientId) {
                Log::warning('Google token audience mismatch', [
                    'aud' => $payload['aud'] ?? null,
                    'expected' => $configuredClientId,
                ]);

                return response()->json([
                    'message' => 'Kredensial Google tidak sesuai untuk aplikasi ini.',
                ], 401);
            }

            $googleId = $payload['sub'] ?? null;
            $email = $payload['email'] ?? null;
            $name = $payload['name'] ?? ($payload['given_name'] ?? 'Pengguna Google');
            $avatar = $payload['picture'] ?? null;

            if (empty($googleId) || empty($email)) {
                return response()->json([
                    'message' => 'Data profil Google tidak lengkap (email atau ID tidak ditemukan).',
                ], 422);
            }

            // Find existing user by google_id or email
            $user = User::query()
                ->where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

            if ($user) {
                // Update missing Google info
                $updates = [];
                if (empty($user->google_id)) {
                    $updates['google_id'] = $googleId;
                }
                if (empty($user->avatar) && !empty($avatar)) {
                    $updates['avatar'] = $avatar;
                }
                if (empty($user->password)) {
                    $updates['password'] = Hash::make('indoquran');
                }
                if (!empty($updates)) {
                    $user->update($updates);
                }

                Log::info('Existing user logged in via Google', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            } else {
                // Create new user with default password 'indoquran'
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'password' => Hash::make('indoquran'),
                    'is_admin' => false,
                ]);

                Log::info('New user registered via Google One Tap', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }

            // Log user in
            Auth::login($user, true);

            if ($request->hasSession()) {
                $request->session()->regenerate();
                $request->session()->save();
            }

            // Generate API Bearer token for React SPA
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Login dengan Google berhasil.',
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing Google One Tap login', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat memproses login Google: ' . $e->getMessage(),
            ], 500);
        }
    }
}
