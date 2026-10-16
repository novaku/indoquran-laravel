<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AmpController extends Controller
{
    /**
     * Display the specified Surah in AMP format or redirect to canonical version.
     *
     * @param string $number
     * @return \Illuminate\Http\RedirectResponse
     */
    public function showSurah(string $number)
    {
        return redirect(url("/surah/{$number}"), 301);
    }
}

