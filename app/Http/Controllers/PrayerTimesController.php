<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PrayerTimesController extends Controller
{
    /**
     * Get prayer times from Aladhan API
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPrayerTimes(Request $request)
    {
        $request->validate([
            'date' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'method' => 'sometimes|integer'
        ]);

        $date = $request->date;
        $latitude = $request->latitude;
        $longitude = $request->longitude;
        $method = $request->method ?? 11; // Default to method 11 if not provided
        
        try {
            $response = Http::get("https://api.aladhan.com/v1/timings/{$date}", [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'method' => $method
            ]);
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch prayer times from API',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
