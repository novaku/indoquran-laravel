<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

/**
 * Controller for tracking and displaying online users in realtime
 * Uses Redis sorted sets for efficient tracking with automatic expiration
 */
class OnlineUsersController extends Controller
{
    /**
     * Redis key for storing online users
     */
    private const ONLINE_USERS_KEY = 'online_users';
    
    /**
     * Time window to consider a user as "online" (in seconds)
     * 5 minutes = 300 seconds
     */
    private const ONLINE_THRESHOLD = 300;

    /**
     * Track a user visit (heartbeat)
     * Should be called periodically from the frontend
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function track(Request $request)
    {
        try {
            // Generate unique visitor ID based on IP and User Agent
            // This creates a reasonably unique identifier without requiring authentication
            $visitorId = $this->generateVisitorId($request);
            
            // Current timestamp
            $timestamp = now()->timestamp;
            
            // Add/update visitor in Redis sorted set
            // Score is the timestamp - this allows us to efficiently remove old entries
            Redis::zadd(self::ONLINE_USERS_KEY, $timestamp, $visitorId);
            
            // Remove visitors who haven't sent a heartbeat in the last ONLINE_THRESHOLD seconds
            $cutoffTime = $timestamp - self::ONLINE_THRESHOLD;
            Redis::zremrangebyscore(self::ONLINE_USERS_KEY, '-inf', $cutoffTime);
            
            // Get current online count
            $onlineCount = Redis::zcard(self::ONLINE_USERS_KEY);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Visitor tracked',
                'data' => [
                    'online_count' => (int) $onlineCount,
                    'visitor_id' => $visitorId
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error tracking online user: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to track visitor',
                'data' => [
                    'online_count' => 0
                ]
            ], 500);
        }
    }

    /**
     * Get current online users count
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function count()
    {
        try {
            // Clean up old visitors first
            $timestamp = now()->timestamp;
            $cutoffTime = $timestamp - self::ONLINE_THRESHOLD;
            Redis::zremrangebyscore(self::ONLINE_USERS_KEY, '-inf', $cutoffTime);
            
            // Get current count
            $onlineCount = Redis::zcard(self::ONLINE_USERS_KEY);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'online_count' => (int) $onlineCount,
                    'last_updated' => now()->toIso8601String()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting online users count: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get online count',
                'data' => [
                    'online_count' => 0
                ]
            ], 500);
        }
    }

    /**
     * Generate a unique visitor ID based on IP and User Agent
     * 
     * @param Request $request
     * @return string
     */
    private function generateVisitorId(Request $request): string
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent() ?? 'unknown';
        
        // Create a hash combining IP and User Agent
        // This provides reasonable uniqueness while maintaining privacy
        return hash('sha256', $ip . '|' . $userAgent);
    }
}
