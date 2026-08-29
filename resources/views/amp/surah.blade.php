@extends('amp.layouts.app')

@section('title')
Surah {{ $surah->name_latin }} ({{ $surah->name_arabic }})
@endsection

@section('canonical')
{{ url("/surah/{$surah->number}") }}
@endsection

@section('content')
    <div class="surah-header" style="text-align: center; margin-bottom: 2rem;">
        <h2>Surah {{ $surah->name_latin }}</h2>
        <p>{{ $surah->revelation_place }} &bull; {{ $surah->total_ayahs }} Ayat</p>
    </div>

    <div class="ayahs-list">
        @foreach($surah->ayahs as $ayah)
            <div class="ayah-container" id="ayah-{{ $ayah->ayah_number }}">
                <div class="ayah-header">
                    <span class="ayah-number">{{ $surah->number }}:{{ $ayah->ayah_number }}</span>
                </div>
                
                <div class="arabic-text">
                    {{ $ayah->text_arabic }}
                </div>

                @if($ayah->text_latin)
                <div class="latin-text">
                    {{ $ayah->text_latin }}
                </div>
                @endif
                
                <div class="translation-text">
                    {{ $ayah->text_indonesian }}
                </div>
            </div>
        @endforeach
    </div>

    <div class="ad-container">
        <amp-ad width="100vw" height="320"
            type="adsense"
            data-ad-client="ca-pub-9994842285785390"
            data-ad-slot="1519827772"
            data-auto-format="rspv"
            data-full-width="">
            <div overflow=""></div>
        </amp-ad>
    </div>

    <div style="text-align: center; margin-top: 2rem;">
        <a href="{{ url("/surah/{$surah->number}") }}" style="display: inline-block; padding: 10px 20px; background: #1f2937; color: white; text-decoration: none; border-radius: 5px;">
            Lihat Versi Lengkap
        </a>
    </div>
@endsection
