<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

class FontController extends Controller
{
    public function testFonts()
    {
        $fontsPath = public_path('fonts');
        $fonts = [];
        
        if (File::exists($fontsPath)) {
            $fontFiles = File::files($fontsPath);
            foreach ($fontFiles as $file) {
                $fonts[] = [
                    'name' => $file->getFilename(),
                    'path' => asset('fonts/' . $file->getFilename()),
                    'size' => $file->getSize(),
                    'exists' => true
                ];
            }
        }
        
        return view('fonts-test', ['fonts' => $fonts]);
    }
}
