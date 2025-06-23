<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kode OTP Admin Panel IndoQuran</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            background-color: #22c55e;
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .title {
            color: #1f2937;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .otp-section {
            background-color: #f0fdf4;
            border: 2px solid #22c55e;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            color: #374151;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #22c55e;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        .expiry-info {
            color: #dc2626;
            font-size: 14px;
            font-weight: 500;
            margin-top: 15px;
        }
        .instructions {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
        }
        .instructions h3 {
            color: #1e40af;
            margin-top: 0;
            font-size: 18px;
        }
        .instructions ol {
            margin: 15px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 8px;
            color: #374151;
        }
        .security-notice {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .security-notice h4 {
            color: #dc2626;
            margin-top: 0;
            font-size: 16px;
        }
        .security-notice p {
            color: #374151;
            margin-bottom: 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #22c55e;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">IQ</div>
            <h1 class="title">Kode OTP Admin Panel</h1>
            <p class="subtitle">Verifikasi akses ke panel administrasi IndoQuran</p>
        </div>

        <div class="otp-section">
            <p class="otp-label">Kode Verifikasi Anda:</p>
            <div class="otp-code">{{ $otpCode->otp_code }}</div>
            <p class="expiry-info">
                Kode ini akan kadaluarsa pada: 
                <strong>{{ $otpCode->expires_at->format('d/m/Y H:i') }} WIB</strong>
            </p>
        </div>

        <div class="instructions">
            <h3>Cara Menggunakan Kode OTP:</h3>
            <ol>
                <li>Buka halaman login admin di browser Anda</li>
                <li>Masukkan email: <strong>kontak@indoquran.web.id</strong></li>
                <li>Masukkan kode OTP di atas pada kolom yang tersedia</li>
                <li>Klik tombol "Masuk ke Admin Panel"</li>
            </ol>
        </div>

        <div class="security-notice">
            <h4>⚠️ Penting untuk Keamanan:</h4>
            <p>
                • Jangan bagikan kode OTP ini kepada siapapun<br>
                • Kode ini hanya valid selama 1 jam<br>
                • Hanya gunakan untuk mengakses panel admin IndoQuran<br>
                • Jika Anda tidak meminta kode ini, abaikan email ini
            </p>
        </div>

        <div class="footer">
            <p>
                Email ini dikirim secara otomatis oleh sistem IndoQuran.<br>
                Untuk bantuan, hubungi: <a href="mailto:kontak@indoquran.web.id">kontak@indoquran.web.id</a>
            </p>
            <p style="margin-top: 15px;">
                <a href="https://indoquran.web.id">IndoQuran.web.id</a> - Platform Al-Quran Digital Indonesia
            </p>
        </div>
    </div>
</body>
</html>
