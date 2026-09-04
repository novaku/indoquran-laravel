<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\Contact;
use App\Models\Prayer;
use App\Models\SearchTerm;
use App\Models\Surah;
use App\Models\Ayah;
use App\Models\AdminOtpCode;
use App\Models\Visitor;
use App\Mail\AdminOtpMail;

class AdminController extends Controller
{
    /**
     * Show the admin login form.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showLoginForm()
    {
        return response()->json([
            'message' => 'Admin login form ready'
        ]);
    }

    /**
     * Send OTP to admin email.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendOtp(Request $request)
    {
        Log::info('Admin OTP request received', [
            'email' => $request->get('email'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'csrf_token' => $request->header('X-CSRF-TOKEN'),
            'session_token' => csrf_token(),
            'session_id' => $request->session()->getId(),
            'session_started' => $request->session()->isStarted(),
            'headers' => $request->headers->all()
        ]);

        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Check if the email belongs to an admin user
        $user = User::where('email', $request->email)->first();
        
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Only admin users can request OTP.'
            ], 403);
        }

        try {
            // Create new OTP
            $otpCode = AdminOtpCode::createForEmail(
                $request->email,
                $request->ip(),
                $request->userAgent()
            );

            // Send OTP via email
            Mail::to($request->email)->send(new AdminOtpMail($otpCode));

            Log::info('Admin OTP sent successfully', [
                'email' => $request->email,
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'expires_at' => $otpCode->expires_at,
            ]);

            return response()->json([
                'message' => 'Kode OTP telah dikirim ke email Anda. Silakan periksa inbox.',
                'expires_at' => $otpCode->expires_at->format('Y-m-d H:i:s'),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send admin OTP', [
                'email' => $request->email,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal mengirim kode OTP. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Handle an admin login request with OTP.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'otp_code' => ['required', 'string', 'size:6'],
        ]);

        // Find admin user first
        $user = User::where('email', $credentials['email'])->first();
        
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Only admin users can access this area.'
            ], 403);
        }

        // Verify OTP
        $otpRecord = AdminOtpCode::findValidOtp($credentials['email'], $credentials['otp_code']);
        
        if (!$otpRecord) {
            Log::warning('Invalid admin OTP attempt', [
                'email' => $credentials['email'],
                'otp_code' => $credentials['otp_code'],
                'user_id' => $user->id,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'
            ], 422);
        }

        // Mark OTP as used
        $otpRecord->markAsUsed();

        // Log successful admin login
        Log::info('Admin user logged in successfully with OTP', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'otp_used' => $otpRecord->id,
        ]);

        // Login the user
        Auth::login($user, $request->boolean('remember'));

        // Always use session-based authentication for admin panel
        // The React admin panel relies on sessions, not tokens
        $request->session()->regenerate();
        
        Log::info('Admin session created', [
            'session_id' => $request->session()->getId(),
            'user_id' => $user->id,
            'auth_check' => Auth::check()
        ]);
        
        return response()->json([
            'message' => 'Admin logged in successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    /**
     * Handle an admin logout request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $userId = Auth::id();
        Log::info('Admin user logout request', [
            'user_id' => $userId,
            'session_id' => $request->session()->getId()
        ]);

        if ($user = Auth::user()) {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Admin logged out successfully'
        ]);
    }

    /**
     * Get admin dashboard data.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard(Request $request)
    {
        Log::info('Dashboard request received', [
            'auth_check' => Auth::check(),
            'user_id' => Auth::id(),
            'is_admin' => Auth::check() ? Auth::user()->isAdmin() : false,
            'session_id' => $request->session()->getId(),
            'headers' => $request->headers->all()
        ]);

        if (!Auth::check()) {
            Log::warning('Dashboard access denied - not authenticated');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!Auth::user()->isAdmin()) {
            Log::warning('Dashboard access denied - not admin', ['user_id' => Auth::id()]);
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        // Get statistics
        $stats = [
            'total_users' => User::count(),
            'total_articles' => \App\Models\Article::count(),
            'published_articles' => \App\Models\Article::where('status', 'published')->count(),
            'total_contacts' => Contact::count(),
            'total_prayers' => Prayer::count(),
            'total_search_terms' => SearchTerm::count(),
            'total_surahs' => Surah::count(),
            'total_ayahs' => Ayah::count(),
            'daily_visitors' => Visitor::getTodayVisitors(),
            'weekly_visitors' => Visitor::getWeeklyVisitors(),
            'monthly_visitors' => Visitor::getMonthlyVisitors(),
            'total_visitors' => Visitor::getTotalVisitors(),
        ];

        // Get recent activities
        $recent_contacts = Contact::latest()->take(5)->get();
        $recent_prayers = Prayer::with('user')->latest()->take(5)->get();
        $recent_users = User::latest()->take(5)->get();
        $popular_searches = SearchTerm::select('term')
            ->selectRaw('COUNT(*) as search_count')
            ->groupBy('term')
            ->orderByDesc('search_count')
            ->take(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_activities' => [
                'contacts' => $recent_contacts,
                'prayers' => $recent_prayers,
                'users' => $recent_users,
                'popular_searches' => $popular_searches,
            ],
            'traffic_data' => [
                'daily_traffic' => Visitor::getDailyTraffic(7),
                'hourly_traffic' => Visitor::getHourlyTraffic(),
                'popular_pages' => Visitor::getPopularPages(10),
                'popular_surahs' => $this->getPopularSurahsWithNames(),
            ]
        ]);
    }

    /**
     * Get popular surahs with their names from the database
     */
    private function getPopularSurahsWithNames()
    {
        try {
            $popularSurahs = Visitor::getPopularSurahs(10);
            
            return $popularSurahs->map(function ($item) {
                $surah = Surah::where('number', $item['surah_number'])->first();
                
                return [
                    'surah_number' => $item['surah_number'],
                    'surah_name' => $surah ? $surah->name : "Surah #{$item['surah_number']}",
                    'surah_name_arabic' => $surah ? $surah->name_arabic : '',
                    'visit_count' => $item['visit_count'],
                    'url' => $item['url']
                ];
            })->values();
        } catch (\Exception $e) {
            Log::error('Error getting popular surahs with names: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get users list for admin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUsers(Request $request)
    {
        if (!Auth::check() || !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = User::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $users = $query->latest()->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Get contacts list for admin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getContacts(Request $request)
    {
        if (!Auth::check() || !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Contact::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('subject', 'LIKE', "%{$search}%")
                  ->orWhere('message', 'LIKE', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $contacts = $query->latest()->paginate($perPage);

        return response()->json($contacts);
    }

    /**
     * Get prayers list for admin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPrayers(Request $request)
    {
        if (!Auth::check() || !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Prayer::with('user');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('content', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $prayers = $query->latest()->paginate($perPage);

        return response()->json($prayers);
    }

    /**
     * Get CSRF token for admin authentication.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCsrfToken(Request $request)
    {
        // Start session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }

        // Regenerate CSRF token to ensure it's fresh
        $request->session()->regenerateToken();
        
        $csrfToken = csrf_token();
        
        Log::info('CSRF token requested', [
            'session_id' => $request->session()->getId(),
            'csrf_token' => $csrfToken,
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip()
        ]);

        return response()->json([
            'csrf_token' => $csrfToken
        ]);
    }

    /**
     * Get admin prayer data for dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminPrayerData(Request $request)
    {
        if (!Auth::check() || !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get admin user
        $admin = Auth::user();

        // Get prayers data
        $prayers = Prayer::with('user')
            ->whereHas('user', function ($query) use ($admin) {
                $query->where('id', $admin->id);
            })
            ->get();

        return response()->json($prayers);
    }

    /**
     * Mark contact as read.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $contactId
     * @return \Illuminate\Http\JsonResponse
     */
    public function markContactAsRead(Request $request, $contactId)
    {
        if (!Auth::check() || !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $contact = Contact::findOrFail($contactId);
            $contact->is_read = true;
            $contact->save();

            Log::info('Contact marked as read', [
                'contact_id' => $contactId,
                'admin_id' => Auth::user()->id,
                'admin_email' => Auth::user()->email
            ]);

            return response()->json([
                'message' => 'Kontak berhasil ditandai sebagai sudah dibaca'
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking contact as read', [
                'contact_id' => $contactId,
                'error' => $e->getMessage(),
                'admin_id' => Auth::user()->id
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat menandai kontak sebagai sudah dibaca'
            ], 500);
        }
    }

    /**
     * Reply to contact message.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $contactId
     * @return \Illuminate\Http\JsonResponse
     */
    public function replyToContact(Request $request, $contactId)
    {
        if (!Auth::check() || !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:5000'
        ]);

        try {
            $contact = Contact::findOrFail($contactId);
            
            // Send email reply
            Mail::send('emails.contact-reply', [
                'contact' => $contact,
                'reply_message' => $request->message,
                'admin_name' => Auth::user()->name
            ], function ($message) use ($contact) {
                $message->to($contact->email, $contact->name)
                        ->subject('Re: ' . $contact->subject . ' - Balasan dari IndoQuran')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });

            // Mark as read after replying
            $contact->is_read = true;
            $contact->save();

            Log::info('Contact reply sent', [
                'contact_id' => $contactId,
                'contact_email' => $contact->email,
                'admin_id' => Auth::user()->id,
                'admin_email' => Auth::user()->email,
                'reply_length' => strlen($request->message)
            ]);

            return response()->json([
                'message' => 'Balasan berhasil dikirim'
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending contact reply', [
                'contact_id' => $contactId,
                'error' => $e->getMessage(),
                'admin_id' => Auth::user()->id
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat mengirim balasan'
            ], 500);
        }
    }
}
