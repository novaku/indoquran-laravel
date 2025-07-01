<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Visitor;
use Illuminate\Support\Facades\DB;

class TrackVisitor
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Track visitor asynchronously to avoid slowing down the response
        $this->trackVisitor($request);
        
        return $next($request);
    }

    private function trackVisitor(Request $request)
    {
        try {
            $ipAddress = $request->ip();
            $userAgent = $request->userAgent();
            $pageUrl = $request->fullUrl();
            $referrer = $request->header('referer');
            $sessionId = $request->session()->getId();

            // Only track once per IP per hour to avoid spam
            $recentVisit = Visitor::where('ip_address', $ipAddress)
                                 ->where('visited_at', '>', now()->subHour())
                                 ->exists();

            if (!$recentVisit) {
                Visitor::create([
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                    'visited_at' => now(),
                    'page_url' => $pageUrl,
                    'referrer' => $referrer,
                    'session_id' => $sessionId
                ]);
            }

            // Clean up old records (keep only last 90 days)
            if (rand(1, 100) === 1) { // 1% chance to run cleanup
                Visitor::where('visited_at', '<', now()->subDays(90))->delete();
            }

        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Error tracking visitor: ' . $e->getMessage());
        }
    }
}
