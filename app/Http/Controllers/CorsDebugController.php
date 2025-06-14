<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CorsDebugController extends Controller
{
    /**
     * Show the CORS debug page
     */
    public function index()
    {
        return view('cors-debug');
    }

    /**
     * Perform a test request and return the results
     */
    public function testRequest(Request $request)
    {
        $url = $request->input('url');
        $result = [
            'url' => $url,
            'success' => false,
            'error' => null,
            'response' => null,
            'headers' => null,
            'proxy_url' => null
        ];

        try {
            // Test direct request
            $response = Http::timeout(5)
                ->withoutVerifying()
                ->withHeaders([
                    'User-Agent' => 'IndoQuran-CorsDebugger/1.0',
                    'Origin' => url('/')
                ])
                ->get($url);

            $result['success'] = $response->successful();
            $result['status'] = $response->status();
            $result['headers'] = $response->headers();
            
            // Limited response body for safety
            $body = $response->body();
            $result['response'] = substr($body, 0, 500) . (strlen($body) > 500 ? '...[truncated]' : '');
            
            // Calculate proxy URL
            $parsedUrl = parse_url($url);
            if (isset($parsedUrl['host']) && strpos($parsedUrl['host'], 'indoquran.web.id') !== false) {
                $path = $parsedUrl['path'] ?? '';
                $query = isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '';
                $result['proxy_url'] = url('/proxy-assets' . $path . $query);
            }
            
        } catch (\Exception $e) {
            $result['error'] = $e->getMessage();
        }

        return response()->json($result);
    }
}
