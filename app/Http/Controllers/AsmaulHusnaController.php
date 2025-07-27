<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AsmaulHusnaController extends Controller
{
    /**
     * Display the asmaul husna page
     */
    public function index()
    {
        // Load the JSON file
        $jsonPath = resource_path('js/asmaul_husna.json');
        
        if (!File::exists($jsonPath)) {
            abort(404, 'File asmaul husna tidak ditemukan');
        }
        
        $jsonContent = File::get($jsonPath);
        $asmaulHusnaData = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            abort(500, 'Error parsing JSON file: ' . json_last_error_msg());
        }
        
        // SEO data for this page
        $seoData = [
            'metaTitle' => '99 Asmaul Husna - Nama-nama Indah Allah SWT | IndoQuran',
            'metaDescription' => 'Pelajari dan renungkan 99 Asmaul Husna, nama-nama indah Allah SWT dengan makna dan penjelasan lengkap dalam bahasa Indonesia.',
            'metaKeywords' => 'asmaul husna, nama allah, 99 nama allah, sifat allah, islam, doa',
            'canonicalUrl' => url('/asmaul-husna'),
            'ogImage' => url('/android-chrome-512x512.png'),
            'ogType' => 'website'
        ];
        
        return view('asmaul-husna', compact('asmaulHusnaData', 'seoData'));
    }
    
    /**
     * Get asmaul husna data as JSON API
     */
    public function api()
    {
        $jsonPath = resource_path('js/asmaul_husna.json');
        
        if (!File::exists($jsonPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }
        
        $jsonContent = File::get($jsonPath);
        $asmaulHusnaData = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['error' => 'Invalid JSON'], 500);
        }
        
        return response()->json($asmaulHusnaData);
    }
    
    /**
     * Search names by keyword
     */
    public function search(Request $request)
    {
        $keyword = $request->get('q', '');
        
        if (empty($keyword)) {
            return response()->json([]);
        }
        
        $jsonPath = resource_path('js/asmaul_husna.json');
        
        if (!File::exists($jsonPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }
        
        $jsonContent = File::get($jsonPath);
        $asmaulHusnaData = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['error' => 'Invalid JSON'], 500);
        }
        
        // Filter names based on keyword
        $filteredNames = array_filter($asmaulHusnaData, function($name) use ($keyword) {
            return isset($name['latin']) && stripos($name['latin'], $keyword) !== false || 
                   isset($name['meaning']) && stripos($name['meaning'], $keyword) !== false || 
                   isset($name['arabic']) && stripos($name['arabic'], $keyword) !== false ||
                   isset($name['description']) && stripos($name['description'], $keyword) !== false;
        });
        
        return response()->json([
            'names' => array_values($filteredNames),
            'total' => count($filteredNames)
        ]);
    }
}
