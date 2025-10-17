# 🚀 Quick Deployment Cheatsheet

## ⚠️ CRITICAL: No npm on Production Server!

```
┌──────────────────────────────────────────┐
│  BUILD LOCALLY → COMMIT → PUSH → DEPLOY │
└──────────────────────────────────────────┘
```

---

## 📍 Standard Deployment (3 Steps)

### **1️⃣ Local Machine**
```bash
npm run build
git add public/build
git commit -m "Build assets"
git push origin main
```

### **2️⃣ Production Server**
```bash
ssh user@indoquran.web.id
cd ~/public_html
./deploy-production.sh
```

### **3️⃣ Verify**
```bash
curl https://indoquran.web.id/
tail -f storage/logs/laravel.log
```

---

## 🔧 Common Commands

### Local (Development)
| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Build production | `npm run build` |
| Build optimized | `./build-production.sh` |
| Test build | `ls -lh public/build/assets/` |

### Production Server
| Task | Command |
|------|---------|
| Deploy | `./deploy-production.sh` |
| Clear cache | `php artisan cache:clear` |
| Check status | `php artisan quran:cache status` |
| Warm cache | `php artisan quran:cache warm-up` |
| View logs | `tail -f storage/logs/laravel.log` |
| Check routes | `php artisan route:list` |

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Manifest not found | Build locally → Commit → Push → Deploy |
| Vendor files missing | `npm run build` (local) → Commit → Push |
| Cache not working | Check Redis: `~/redis/status-redis.sh` |
| White screen | Check logs: `tail -f storage/logs/laravel.log` |
| CSS not loading | Clear cache: `php artisan config:clear` |

---

## ✅ Pre-Deployment Checklist

- [ ] Changes tested locally (`npm run dev`)
- [ ] Production build created (`npm run build`)
- [ ] Build files verified (`ls public/build/`)
- [ ] Code committed (`git add . && git commit`)
- [ ] Pushed to GitHub (`git push origin main`)
- [ ] Ready to deploy on server

---

## ❌ Don't Do This

```bash
# ❌ On production server:
ssh production
npm install      # NO npm on server!
npm run build    # NO npm on server!

# ✅ Correct way:
# Build on local → Push to git → Deploy pulls from git
```

---

## 📞 Emergency Recovery

### Application Broken
```bash
# On production server:
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
./deploy-production.sh
```

### Build Files Missing
```bash
# On local machine:
npm run build
git add public/build
git commit -m "Emergency: Add missing build"
git push origin main

# On production:
git pull origin main
./deploy-production.sh
```

---

## 📚 Documentation

- **Full Guide:** `docs/PRODUCTION_DEPLOYMENT_WORKFLOW.md`
- **Build Scripts:** `build-production.sh`, `build-optimized.sh`
- **Deploy Script:** `deploy-production.sh`
- **SEO Backend:** `docs/BACKEND_SEO_OPTIMIZATION_COMPLETE.md`

---

**Remember:** 
- 🏠 Build = Local Machine
- 🚀 Deploy = Production Server
- 📦 Transfer = Git (commit → push → pull)

