<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - IndoQuran</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fdf8;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #16a34a, #059669);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .logo {
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            font-size: 24px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #16a34a;
            margin-bottom: 20px;
        }
        .message {
            margin-bottom: 30px;
            color: #555;
            line-height: 1.8;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a, #059669);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: all 0.3s ease;
            text-align: center;
        }
        .reset-button:hover {
            background: linear-gradient(135deg, #15803d, #047857);
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(22, 163, 74, 0.3);
        }
        .info-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .info-box h3 {
            color: #0369a1;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .info-box p {
            margin: 5px 0;
            color: #0c4a6e;
            font-size: 14px;
        }
        .warning-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 13px;
            font-weight: 500;
        }
        .footer {
            background: #f9fafb;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 13px;
        }
        .link-fallback {
            word-break: break-all;
            background: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            color: #6b7280;
            margin-top: 15px;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 25px 20px;
            }
            .header {
                padding: 25px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📖</div>
            <h1>IndoQuran</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset Password Akun</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Assalamu'alaikum, {{ $user->name ?? 'Sahabat Muslim' }}
            </div>
            
            <div class="message">
                <p>Kami menerima permintaan untuk reset password akun IndoQuran Anda. Jika Anda meminta reset password, silakan klik tombol di bawah ini untuk membuat password baru.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="reset-button">
                    🔒 Reset Password Saya
                </a>
            </div>
            
            <div class="info-box">
                <h3>📋 Informasi Penting:</h3>
                <p>• Link reset password ini berlaku selama <strong>60 menit</strong></p>
                <p>• Setelah password diubah, Anda perlu login ulang</p>
                <p>• Pastikan membuat password yang kuat dan unik</p>
                <p>• Simpan password baru di tempat yang aman</p>
            </div>
            
            <div class="warning-box">
                <p>⚠️ Jika Anda tidak meminta reset password, abaikan email ini. Akun Anda tetap aman.</p>
            </div>
            
            <div class="message">
                <p>Jika tombol di atas tidak berfungsi, Anda dapat menyalin dan menempelkan URL berikut ke browser Anda:</p>
                <div class="link-fallback">
                    {{ $resetUrl }}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>IndoQuran - Baca Al-Quran Online</strong></p>
            <p>Email ini dikirim otomatis, mohon jangan membalas email ini.</p>
            <p>Jika Anda mengalami kesulitan, silakan hubungi support kami.</p>
            <p style="margin-top: 15px; color: #9ca3af;">
                © {{ date('Y') }} IndoQuran. Semua hak dilindungi.
            </p>
        </div>
    </div>
</body>
</html>
