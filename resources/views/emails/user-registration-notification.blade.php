<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengguna Baru Terdaftar</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px 20px;
        }
        .user-info {
            background-color: #f9f9f9;
            border-left: 4px solid #4CAF50;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
        }
        .field {
            margin-bottom: 12px;
            display: flex;
            flex-wrap: wrap;
        }
        .field strong {
            color: #4CAF50;
            min-width: 120px;
            font-weight: 600;
        }
        .field span {
            flex: 1;
            color: #555;
        }
        .stats {
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }
        .stats h3 {
            margin: 0 0 10px 0;
            color: #2e7d32;
            font-size: 18px;
        }
        .stats p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .footer {
            background-color: #333;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .footer .app-name {
            font-weight: 600;
            color: #4CAF50;
        }
        .timestamp {
            background-color: #f0f0f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px 15px;
            }
            .field {
                flex-direction: column;
            }
            .field strong {
                min-width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">👤</div>
            <h1>Pengguna Baru Terdaftar!</h1>
            <p>Ada pengguna baru yang telah mendaftar di IndoQuran</p>
        </div>
        
        <div class="content">
            <p>Assalamu'alaikum,</p>
            
            <p>Kami dengan senang hati memberitahukan bahwa ada pengguna baru yang telah mendaftar di platform <strong>IndoQuran</strong>.</p>
            
            <div class="user-info">
                <h3 style="margin-top: 0; color: #2e7d32;">📋 Detail Pengguna Baru</h3>
                
                <div class="field">
                    <strong>Nama:</strong>
                    <span>{{ $user->name }}</span>
                </div>
                
                <div class="field">
                    <strong>Email:</strong>
                    <span>{{ $user->email }}</span>
                </div>
                
                <div class="field">
                    <strong>ID Pengguna:</strong>
                    <span>#{{ $user->id }}</span>
                </div>
                
                <div class="field">
                    <strong>Tanggal Daftar:</strong>
                    <span>{{ $user->created_at->format('d F Y, H:i') }} WIB</span>
                </div>
            </div>
            
            <div class="stats">
                <h3>📊 Statistik Platform</h3>
                <p>Pengguna ini adalah anggota ke-<strong>{{ \App\Models\User::count() }}</strong> yang bergabung dengan komunitas IndoQuran</p>
            </div>
            
            <div class="timestamp">
                <strong>⏰ Waktu Notifikasi:</strong> {{ now()->format('d F Y, H:i:s') }} WIB
            </div>
            
            <p>Semoga pengguna baru ini dapat memanfaatkan platform IndoQuran dengan baik untuk meningkatkan pemahaman dan kecintaan terhadap Al-Quran.</p>
            
            <p style="margin-bottom: 0;">Barakallahu fiikum,<br>
            <strong>Tim IndoQuran</strong></p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} <span class="app-name">IndoQuran</span> - Platform Al-Quran Digital Indonesia</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">
                Email otomatis ini dikirim untuk memberitahukan pendaftaran pengguna baru
            </p>
        </div>
    </div>
</body>
</html>
