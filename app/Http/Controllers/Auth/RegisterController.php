<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\UserRegistrationNotification;
use App\Mail\WelcomeNewUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * Show the registration form.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showRegistrationForm()
    {
        return response()->json([
            'message' => 'Registration form ready'
        ]);
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Send email verification notification
        try {
            $user->sendEmailVerificationNotification();
            Log::info('Email verification notification sent', [
                'user_id' => $user->id,
                'user_email' => $user->email
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email verification notification', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage()
            ]);
        }

        Auth::login($user);

        // Send welcome email to the new user
        try {
            Mail::to($user->email)->send(new WelcomeNewUser($user));
            Log::info('Welcome email sent successfully to new user', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name
            ]);
        } catch (\Exception $e) {
            // Log the error but don't fail the registration process
            Log::error('Failed to send welcome email to new user', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name,
                'error' => $e->getMessage()
            ]);
        }

        // Send email notification to admin about new user registration
        try {
            Mail::to('kontak@indoquran.web.id')->send(new UserRegistrationNotification($user));
            Log::info('User registration notification email sent successfully', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name
            ]);
        } catch (\Exception $e) {
            // Log the error but don't fail the registration process
            Log::error('Failed to send user registration notification email', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'user' => $user,
            'message' => 'Registration successful. Please check your email to verify your account and get started with IndoQuran.',
            'email_verification_sent' => true,
            'welcome_email_sent' => true
        ]);
    }
}
