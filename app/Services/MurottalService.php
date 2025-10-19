<?php

namespace App\Services;

class MurottalService
{
    protected $config;
    protected $baseUrl;
    
    public function __construct()
    {
        $this->config = config('reciters');
        $this->baseUrl = $this->config['base_url'];
    }
    
    /**
     * Get all available reciters
     */
    public function getAllReciters()
    {
        return $this->config['reciters'];
    }
    
    /**
     * Get recommended reciters
     */
    public function getRecommendedReciters()
    {
        $recommendedIds = $this->config['recommended'];
        $allReciters = $this->config['reciters'];
        
        return array_filter($allReciters, function($reciter) use ($recommendedIds) {
            return in_array($reciter['id'], $recommendedIds);
        });
    }
    
    /**
     * Get reciter by ID
     */
    public function getReciterById($id)
    {
        $reciters = $this->config['reciters'];
        
        foreach ($reciters as $reciter) {
            if ($reciter['id'] === $id || $reciter['id'] === (string)$id) {
                return $reciter;
            }
        }
        
        return null;
    }
    
    /**
     * Generate audio URL for a specific ayah
     * 
     * @param int $surahNumber Surah number (1-114)
     * @param int $ayahNumber Ayah number
     * @param string $reciterId Reciter ID
     * @return string Audio URL
     */
    public function getAyahAudioUrl($surahNumber, $ayahNumber, $reciterId = '2')
    {
        $reciter = $this->getReciterById($reciterId);
        
        if (!$reciter) {
            // Default to Abdul Basit Murattal 192kbps
            $reciter = $this->getReciterById('2');
        }
        
        // Format: SSSAAA (3 digits surah, 3 digits ayah)
        $filename = sprintf('%03d%03d.mp3', $surahNumber, $ayahNumber);
        
        return $this->baseUrl . $reciter['subfolder'] . '/' . $filename;
    }
    
    /**
     * Generate audio URLs for all ayahs in a surah
     * 
     * @param int $surahNumber Surah number (1-114)
     * @param int $ayahCount Number of ayahs in the surah
     * @param string $reciterId Reciter ID
     * @return array Array of audio URLs
     */
    public function getSurahAudioUrls($surahNumber, $ayahCount, $reciterId = '2')
    {
        $urls = [];
        
        for ($i = 1; $i <= $ayahCount; $i++) {
            $urls[$i] = $this->getAyahAudioUrl($surahNumber, $i, $reciterId);
        }
        
        return $urls;
    }
    
    /**
     * Get audio URLs for a specific ayah from all recommended reciters
     * 
     * @param int $surahNumber Surah number (1-114)
     * @param int $ayahNumber Ayah number
     * @return array Array of reciter info with audio URLs
     */
    public function getAyahAudioUrlsAllReciters($surahNumber, $ayahNumber)
    {
        $reciters = $this->config['reciters'];
        $urls = [];
        
        foreach ($reciters as $reciter) {
            $filename = sprintf('%03d%03d.mp3', $surahNumber, $ayahNumber);
            $urls[$reciter['id']] = [
                'reciter_id' => $reciter['id'],
                'reciter_name' => $reciter['name'],
                'bitrate' => $reciter['bitrate'],
                'style' => $reciter['style'],
                'url' => $this->baseUrl . $reciter['subfolder'] . '/' . $filename
            ];
        }
        
        return $urls;
    }
    
    /**
     * Get reciters grouped by style (murattal, mujawwad, etc.)
     */
    public function getRecitersByStyle()
    {
        $reciters = $this->config['reciters'];
        $grouped = [];
        
        foreach ($reciters as $reciter) {
            $style = $reciter['style'] ?? 'other';
            if (!isset($grouped[$style])) {
                $grouped[$style] = [];
            }
            $grouped[$style][] = $reciter;
        }
        
        return $grouped;
    }
    
    /**
     * Search reciters by name
     */
    public function searchReciters($query)
    {
        $reciters = $this->config['reciters'];
        $query = strtolower($query);
        
        return array_filter($reciters, function($reciter) use ($query) {
            return stripos($reciter['name'], $query) !== false;
        });
    }
}
