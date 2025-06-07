<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Font Testing</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #116937;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .font-test {
            font-size: 2rem;
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            direction: rtl;
            text-align: right;
        }
        .scheherazade {
            font-family: 'Scheherazade New', 'Scheherazade', serif;
        }
        @font-face {
            font-family: 'Scheherazade New';
            src: url('/fonts/ScheherazadeNew-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
    </style>
</head>
<body>
    <h1>Font Testing Page</h1>
    
    <h2>Available Fonts in Public Directory</h2>
    <table>
        <thead>
            <tr>
                <th>Font Name</th>
                <th>Path</th>
                <th>Size</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($fonts as $font)
                <tr>
                    <td>{{ $font['name'] }}</td>
                    <td><a href="{{ $font['path'] }}" target="_blank">{{ $font['path'] }}</a></td>
                    <td>{{ number_format($font['size'] / 1024, 2) }} KB</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3">No fonts found in public directory</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    
    <h2>Font Rendering Test</h2>
    <div class="font-test scheherazade">
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
    </div>
    
    <p><strong>Font Loading Status:</strong> <span id="status">Checking...</span></p>
    
    <script>
        document.fonts.ready.then(function() {
            const fontLoaded = document.fonts.check('1em "Scheherazade New"');
            document.getElementById('status').textContent = fontLoaded ? 'Loaded successfully' : 'Failed to load';
            document.getElementById('status').style.color = fontLoaded ? 'green' : 'red';
        });
    </script>
</body>
</html>
