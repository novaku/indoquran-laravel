<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class TafsirMaudhuiController extends Controller
{
    /**
     * Display the tafsir maudhui page
     */
    public function index()
    {
        // Load the JSON file
        $jsonPath = resource_path('js/tafsir_maudhui_full.json');
        
        if (!File::exists($jsonPath)) {
            abort(404, 'File tafsir maudhui tidak ditemukan');
        }
        
        $jsonContent = File::get($jsonPath);
        $tafsirData = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            abort(500, 'Error parsing JSON file: ' . json_last_error_msg());
        }
        
        // SEO data for this page
        $seoData = [
            'metaTitle' => 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
            'metaDescription' => 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
            'metaKeywords' => 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
            'canonicalUrl' => url('/tafsir-maudhui'),
            'ogImage' => url('/android-chrome-512x512.png'),
            'ogType' => 'website'
        ];
        
        return view('tafsir-maudhui', compact('tafsirData', 'seoData'));
    }
    
    /**
     * Get tafsir data as JSON API
     */
    public function api()
    {
        $jsonPath = resource_path('js/tafsir_maudhui_full.json');
        
        if (!File::exists($jsonPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }
        
        $jsonContent = File::get($jsonPath);
        $tafsirData = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['error' => 'Invalid JSON'], 500);
        }
        
        return response()->json($tafsirData);
    }
    
    /**
     * Search topics by keyword
     */
    public function search(Request $request)
    {
        $keyword = $request->get('q', '');
        
        if (empty($keyword)) {
            return response()->json(['topics' => []]);
        }
        
        $jsonPath = resource_path('js/tafsir_maudhui_full.json');
        
        if (!File::exists($jsonPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }
        
        $jsonContent = File::get($jsonPath);
        $tafsirData = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['error' => 'Invalid JSON'], 500);
        }
        
        // Filter topics based on keyword
        $filteredTopics = array_filter($tafsirData['topics'], function($topic) use ($keyword) {
            return stripos($topic['topic'], $keyword) !== false || 
                   stripos($topic['description'], $keyword) !== false;
        });
        
        return response()->json([
            'topics' => array_values($filteredTopics),
            'total' => count($filteredTopics)
        ]);
    }
}
