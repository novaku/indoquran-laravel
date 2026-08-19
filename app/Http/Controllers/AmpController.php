<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AmpController extends Controller
{
    /**
     * Display the specified Surah in AMP format.
     *
    * @param string $number
    * @return \Illuminate\View\View|Response
     */
    public function showSurah(string $number)
    {
        $cacheKey = 'amp.surah.' . $number;
        $cacheDuration = 60 * 24; // 1 day in minutes

        // Use cache in production, direct DB in local
        $surah = app()->environment('production')
            ? Cache::remember($cacheKey, $cacheDuration, function () use ($number) {
                return Surah::with('ayahs')->where('number', $number)->firstOrFail();
            })
            : Surah::with('ayahs')->where('number', $number)->firstOrFail();

        return response()
            ->view('amp.surah', compact('surah'));
    }
}
