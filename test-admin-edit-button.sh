#!/bin/bash

# Script untuk testing tombol edit admin di halaman artikel
# IndoQuran Laravel - Admin Edit Button Test

echo "=========================================="
echo "🧪 Admin Edit Button Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Langkah-langkah testing:${NC}"
echo ""
echo "1. Pastikan dev server sudah berjalan (./dev-env.sh)"
echo "2. Login sebagai admin di: http://127.0.0.1:8000/admin/login"
echo "3. Buka artikel: http://127.0.0.1:8000/artikel/test-judul"
echo "4. Cek apakah tombol 'Edit' (warna amber/kuning) muncul di sebelah tombol 'Bagikan'"
echo ""

echo -e "${YELLOW}🔍 Checking localStorage for admin session...${NC}"
echo ""

# Check if browser console command would work
echo -e "${GREEN}✅ Untuk test di browser console:${NC}"
echo ""
echo "// Check admin status"
echo "const adminUser = localStorage.getItem('admin_user');"
echo "if (adminUser) {"
echo "  const adminData = JSON.parse(adminUser);"
echo "  console.log('Admin logged in:', adminData.name);"
echo "  console.log('Is admin:', adminData.is_admin);"
echo "} else {"
echo "  console.log('No admin session found');"
echo "}"
echo ""

echo -e "${BLUE}📋 Checklist:${NC}"
echo "[ ] Dev server running on port 8000 & 5173"
echo "[ ] Logged in as admin"
echo "[ ] Can see article at /artikel/test-judul"
echo "[ ] Edit button (amber/yellow color) is visible"
echo "[ ] Clicking Edit button redirects to /admin/artikel/edit/{id}"
echo ""

echo -e "${GREEN}🎯 Expected Result:${NC}"
echo "- Tombol 'Edit' dengan icon pensil muncul di samping tombol 'Bagikan'"
echo "- Warna tombol: Amber/Kuning kecokelatan (bg-amber-600)"
echo "- Hover: Warna menjadi lebih gelap (bg-amber-700)"
echo "- Text 'Edit' tersembunyi di mobile, hanya tampil di desktop"
echo ""

echo -e "${RED}❌ Jika tombol tidak muncul:${NC}"
echo "1. Cek browser console untuk error"
echo "2. Pastikan login sebagai admin (bukan user biasa)"
echo "3. Hard refresh browser (Cmd+Shift+R atau Ctrl+Shift+R)"
echo "4. Cek localStorage dengan command di atas"
echo ""

echo "=========================================="
echo "Happy Testing! 🚀"
echo "=========================================="
