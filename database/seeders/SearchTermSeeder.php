<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SearchTermSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $popularSearchTerms = [
            ['term' => 'al-fatihah', 'search_count' => 150],
            ['term' => 'al-baqarah', 'search_count' => 120],
            ['term' => 'ya-sin', 'search_count' => 98],
            ['term' => 'ar-rahman', 'search_count' => 87],
            ['term' => 'al-kahf', 'search_count' => 76],
            ['term' => 'al-mulk', 'search_count' => 65],
            ['term' => 'al-waqiah', 'search_count' => 54],
            ['term' => 'al-isra', 'search_count' => 43],
            ['term' => 'al-ankabut', 'search_count' => 32],
            ['term' => 'al-fajr', 'search_count' => 28],
            ['term' => 'al-ikhlas', 'search_count' => 45],
            ['term' => 'al-falaq', 'search_count' => 38],
            ['term' => 'an-nas', 'search_count' => 42],
            ['term' => 'allah', 'search_count' => 200],
            ['term' => 'rahmat', 'search_count' => 89],
            ['term' => 'ampunan', 'search_count' => 67],
            ['term' => 'rezeki', 'search_count' => 78],
            ['term' => 'kasih sayang', 'search_count' => 56],
            ['term' => 'syukur', 'search_count' => 49],
            ['term' => 'doa', 'search_count' => 72]
        ];

        foreach ($popularSearchTerms as $searchTerm) {
            \App\Models\SearchTerm::create([
                'term' => $searchTerm['term'],
                'search_count' => $searchTerm['search_count'],
                'user_ip' => '127.0.0.1'
            ]);
        }
    }
}
