<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balasan dari IndoQuran</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #10b981;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e0e0e0;
        }
        .original-message {
            background-color: #e5e7eb;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
        }
        .reply-message {
            background-color: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .signature {
            margin-top: 20px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🕌 IndoQuran</h1>
        <p>Balasan untuk Pesan Kontak Anda</p>
    </div>
    
    <div class="content">
        <p>Assalamu'alaikum {{ $contact->name }},</p>
        
        <p>Terima kasih telah menghubungi IndoQuran. Berikut adalah balasan untuk pesan Anda:</p>
        
        <div class="original-message">
            <h4>📩 Pesan Asli Anda:</h4>
            <p><strong>Subjek:</strong> {{ $contact->subject }}</p>
            <p><strong>Tanggal:</strong> {{ $contact->created_at->format('d M Y, H:i') }}</p>
            <div style="margin-top: 10px;">
                {{ nl2br(e($contact->message)) }}
            </div>
        </div>
        
        <div class="reply-message">
            <h4>💬 Balasan dari Tim IndoQuran:</h4>
            <div>
                {{ nl2br(e($reply_message)) }}
            </div>
        </div>
        
        <div class="signature">
            <p>Hormat kami,<br>
            <strong>{{ $admin_name }}</strong><br>
            Tim IndoQuran</p>
        </div>
        
        <p>Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami kembali.</p>
        
        <p>Barakallahu fiikum.</p>
    </div>
    
    <div class="footer">
        <p>© {{ date('Y') }} IndoQuran. Platform Al-Quran Digital Indonesia.</p>
        <p>Website: <a href="{{ url('/') }}" style="color: #10b981;">{{ url('/') }}</a></p>
        <p style="font-size: 12px; color: #999; margin-top: 15px;">
            Email ini dikirim secara otomatis. Mohon jangan membalas langsung ke email ini.
        </p>
    </div>
</body>
</html>
