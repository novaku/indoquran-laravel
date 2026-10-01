<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\UserRegistrationNotification;
use App\Mail\WelcomeNewUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

            $isNewUser = false;

            if ($user) {
                // Detect and update any changed or missing information from Google
                $updates = [];

                // Update full name if changed on Google
                if (!empty($name) && $user->name !== $name) {
                    $updates['name'] = $name;
                }

                // Update profile avatar if changed on Google
                if (!empty($avatar) && $user->avatar !== $avatar) {
                    $updates['avatar'] = $avatar;
                }

                // Update Google ID if previously missing or updated
                if (empty($user->google_id) || $user->google_id !== $googleId) {
                    $updates['google_id'] = $googleId;
                }

                // Update email if changed on Google and not already used by another user
                if (!empty($email) && $user->email !== $email) {
                    $emailTaken = User::where('email', $email)->where('id', '!=', $user->id)->exists();
                    if (!$emailTaken) {
                        $updates['email'] = $email;
                    }
                }

                // Set default password if none exists
                if (empty($user->password)) {
                    $updates['password'] = Hash::make('indoquran');
                }

                // Persist updates to the database
                if (!empty($updates)) {
                    $user->update($updates);
                    $user = $user->fresh();

                    Log::info('Existing user updated in database from Google login', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'updated_fields' => array_keys($updates),
                    ]);
                } else {
                    Log::info('Existing user logged in via Google (no database changes needed)', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                    ]);
                }
            } else {
                $isNewUser = true;

                // Save new user information into users table
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'password' => Hash::make('indoquran'),
                    'is_admin' => false,
                ]);

                Log::info('New user registered via Google Sign-In / One Tap', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                ]);

                // Send welcome email to the newly registered user
                try {
                    Mail::to($user->email)->send(new WelcomeNewUser($user));
                    Log::info('Welcome email sent successfully to new Google user', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'user_name' => $user->name,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to send welcome email to new Google user', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'user_name' => $user->name,
                        'error' => $e->getMessage(),
                    ]);
                }

                // Send email notification to admin about new user registration
                try {
                    Mail::to('kontak@indoquran.web.id')->send(new UserRegistrationNotification($user));
                    Log::info('User registration notification email sent for new Google user', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'user_name' => $user->name,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to send admin notification email for new Google user', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'user_name' => $user->name,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Log user in
            Auth::login($user, true);

            if ($request->hasSession()) {
                $request->session()->regenerate();
                $request->session()->save();
            }

            // Generate API Bearer token for React SPA
            /** @var \PHPOpenSourceSaver\JWTAuth\JWTGuard $guard */
            $guard = auth('api');
            $token = $guard->login($user);

            return response()->json([
                'user' => $user,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => $guard->getTTL() * 60,
                'is_new_user' => $isNewUser,
                'message' => $isNewUser 
                    ? 'Pendaftaran dengan Google berhasil. Selamat datang di IndoQuran!' 
                    : 'Login dengan Google berhasil.',
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
