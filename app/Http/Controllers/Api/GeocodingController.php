<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodingController extends Controller
{
    /**
     * Proxy requests to the Nominatim API
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function reverseGeocode(Request $request)
    {
        // Validate request parameters
        $validated = $request->validate([
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
            'zoom' => 'sometimes|integer|min:1|max:18',
            'format' => 'sometimes|in:json,xml,geojson'
        ]);

        // Default format to JSON if not specified
        $format = $validated['format'] ?? 'json';
        $zoom = $validated['zoom'] ?? 10;

        try {
            // Forward the request to Nominatim with appropriate headers
            $response = Http::withHeaders([
                'User-Agent' => config('app.name') . ' - ' . config('app.url'),
                'Accept-Language' => $request->header('Accept-Language', 'id,en')
            ])->get('https://nominatim.openstreetmap.org/reverse', [
                'format' => $format,
                'lat' => $validated['lat'],
                'lon' => $validated['lon'],
                'zoom' => $zoom
            ]);

            // Return the response from Nominatim
            return response($response->body(), $response->status())
                ->header('Content-Type', $response->header('Content-Type'));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch location data',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
