<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecurityController extends Controller
{
    /**
     * Handle CSP violation reports
     */
    public function cspViolationReport(Request $request)
    {
        // Get the violation report
        $report = $request->getContent();
        $decodedReport = json_decode($report, true);
        
        if ($decodedReport && isset($decodedReport['csp-report'])) {
            $violation = $decodedReport['csp-report'];
            
            // Check if this is an infird.com or similar malicious injection
            $isMaliciousInjection = $this->isMaliciousInjection($violation);
            
            // Log the violation with appropriate severity
            $logLevel = $isMaliciousInjection ? 'warning' : 'info';
            $logMessage = $isMaliciousInjection ? 
                'SECURITY: Blocked malicious script injection attempt' : 
                'CSP Violation detected';
            
            Log::channel('security')->$logLevel($logMessage, [
                'type' => 'csp_violation',
                'blocked_uri' => $violation['blocked-uri'] ?? null,
                'violated_directive' => $violation['violated-directive'] ?? null,
                'source_file' => $violation['source-file'] ?? null,
                'line_number' => $violation['line-number'] ?? null,
                'column_number' => $violation['column-number'] ?? null,
                'original_policy' => $violation['original-policy'] ?? null,
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'referrer' => $request->header('referer'),
                'timestamp' => now()->toISOString(),
                'is_malicious' => $isMaliciousInjection
            ]);
            
            // If this is a malicious injection, also track security stats
            if ($isMaliciousInjection) {
                $this->trackSecurityEvent('malicious_script_blocked', [
                    'source' => $violation['blocked-uri'] ?? 'unknown',
                    'method' => 'csp_violation'
                ]);
            }
        }
        
        // Always return 204 No Content (successful but no response body)
        return response('', 204);
    }
    
    /**
     * Check if a CSP violation is from a known malicious source
     */
    private function isMaliciousInjection(array $violation): bool
    {
        $blockedUri = $violation['blocked-uri'] ?? '';
        
        $maliciousPatterns = [
            'infird.com',
            'b50b7f30-3efc-40a4-958b-47c84a6ef83f',
            '5898d5bc-251a-4028-b882-b262a7cc68b7',
        ];
        
        foreach ($maliciousPatterns as $pattern) {
            if (strpos($blockedUri, $pattern) !== false) {
                return true;
            }
        }
        
        // Check for UUID-based CDN patterns
        if (preg_match('/\/cdn\/[a-f0-9\-]{36}/', $blockedUri)) {
            return true;
        }
        
        if (preg_match('/\/cdn\/[a-f0-9\-]+\?uuid=/', $blockedUri)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Track security events for monitoring
     */
    private function trackSecurityEvent(string $event, array $data = [])
    {
        // You can extend this to send to external monitoring services
        // For now, just log to security channel
        Log::channel('security')->info("Security Event: {$event}", $data);
    }
    
    /**
     * Get security statistics (for admin dashboard)
     */
    public function getSecurityStats(Request $request)
    {
        // This could be expanded to show security metrics
        // For now, return basic info
        return response()->json([
            'status' => 'active',
            'csp_enabled' => true,
            'anti_injection_enabled' => true,
            'last_check' => now()->toISOString(),
            'protection_layers' => [
                'Content Security Policy',
                'Anti-injection Scripts',
                'Security Headers',
                'Runtime Monitoring'
            ]
        ]);
    }
}
