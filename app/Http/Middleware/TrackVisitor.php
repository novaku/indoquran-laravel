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
            // Only track GET requests and avoid tracking admin, API, assets requests
            if (
                !$request->isMethod('GET') ||
                $request->is('admin/*') || 
                $request->is('api/*') || 
                $request->is('assets/*') || 
                $request->is('build/*') || 
                $request->is('storage/*') ||
                $request->is('fonts/*') ||
                $request->is('images/*') ||
                str_contains($request->path(), '.') // Skip file requests
            ) {
                return;
            }

            $ipAddress = $this->getClientIpAddress($request);
            $userAgent = $request->userAgent();
            $pageUrl = mb_substr($request->fullUrl(), 0, 500);
            $rawReferrer = $request->header('referer');
            $referrer = $rawReferrer ? mb_substr($rawReferrer, 0, 500) : null;
            $sessionId = $request->session()->getId();

            // Check if this is a unique visit (same IP, same page, within last 30 minutes)
            $recentVisit = Visitor::query()
                                 ->where('ip_address', $ipAddress)
                                 ->where('page_url', $pageUrl)
                                 ->where('visited_at', '>=', now()->subMinutes(30))
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
                Visitor::query()->where('visited_at', '<', now()->subDays(90))->delete();
            }

        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Error tracking visitor: ' . $e->getMessage());
        }
    }

    /**
     * Get the client's real IP address.
     *
     * @param Request $request
     * @return string
     */
    private function getClientIpAddress(Request $request): string
    {
        // Check for various headers that might contain the real IP
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            $ip = $request->server($header);
            if (!empty($ip) && $ip !== 'unknown') {
                // Handle comma-separated IPs (load balancers)
                if (str_contains($ip, ',')) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        // Fallback to request IP
        return $request->ip() ?? '0.0.0.0';
    }
}
