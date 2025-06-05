# Laravel Development Scripts

This directory contains helpful bash scripts for Laravel development workflow.

## 🎯 **RECOMMENDED: All-in-One Scripts**

### 🚀 `run.sh` - Complete Development Runner ⭐
**The ultimate script that does everything to get your web application running!**

**What it does:**
- ✅ Checks all prerequisites (PHP, Composer)
- ✅ Verifies Laravel project structure
- ✅ Installs dependencies if missing
- ✅ Sets up .env file if missing
- ✅ Generates application key if needed
- ✅ Creates SQLite database if needed
- ✅ Runs migrations
- ✅ Clears all caches completely
- ✅ Optimizes autoloader
- ✅ Handles port conflicts intelligently
- ✅ Starts development server
- ✅ Beautiful colored output with progress indicators
- ✅ **WORKS FROM FRESH CLONE TO RUNNING WEB APP**

**Usage:**
```bash
./run.sh
```

**Perfect for:**
- 🆕 Fresh project setup
- 🔄 Initial development setup
- 🛠️ Complete application setup

### 🔄 `refresh-and-run.sh` - Refresh & Run ⭐
**Efficient script for refreshing caches and starting the server in one command!**

**What it does:**
- ✅ Verifies Laravel project structure
- ✅ Clears all caches completely (config, view, route, optimization)
- ✅ Clears compiled class files
- ✅ Refreshes composer autoload
- ✅ Handles port conflicts intelligently
- ✅ Starts development server
- ✅ Beautiful colored output with progress indicators

**Usage:**
```bash
./refresh-and-run.sh
```

**Perfect for:**
- 🔄 Daily development workflow
- 🧹 Quick cache refresh and restart
- 🚀 Fast server startup

---

## 📋 Additional Scripts

### 🛠️ `dev.sh`
Interactive development helper with multiple options.

**Features:**
- Refresh all caches and views
- Start development server (port 8000 or 8080)
- Run migrations
- Seed database
- Fresh migration with seeding
- Run tests
- Install/Update dependencies
- Build assets (Vite)
- Watch assets (Vite dev)
- Clear all logs
- Show routes
- Laravel Tinker (REPL)

**Usage:**
```bash
./dev.sh
```

## Quick Commands

### 🎯 **FASTEST WAY TO START**
```bash
# Complete setup and run (first time setup) ⭐
./run.sh

# Quick cache refresh and run (daily development) ⭐
./refresh-and-run.sh
```

### Development Workflow
```bash
# Full development setup
./run.sh

# Refresh caches and run server
./refresh-and-run.sh

# Interactive development menu
./dev.sh
```

### Manual Commands
```bash
# Start server on specific port
php artisan serve --port=8080

# Clear specific cache
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed
```

## 🔧 What Each Script Does

| Script | Purpose | Best For |
|--------|---------|----------|
| `run.sh` ⭐ | Complete setup + run | Fresh setup, initial development |
| `refresh-and-run.sh` ⭐ | Refresh caches + run server | Daily development, quick restart |
| `dev.sh` | Interactive menu | Advanced options, power users |

## Notes

- ✅ All scripts work on **macOS/Linux/zsh**
- ✅ **No manual setup required** - scripts handle everything
- ✅ **Port conflict handling** - automatically resolves issues
- ✅ **Beautiful colored output** with progress indicators
- ✅ **Error handling** - fails gracefully with clear messages

## 🎉 Success Indicators

When `run.sh` completes successfully, you'll see:
```
================================================
           🎉 SETUP COMPLETED! 🎉             
================================================

✅ All systems ready!
ℹ️ Application URL: http://127.0.0.1:8080
```

When `refresh-and-run.sh` completes, you'll see:
```
================================================
       🎉 REFRESH COMPLETED! STARTING SERVER 🎉   
================================================

✅ All caches refreshed!
ℹ️ Application URL: http://127.0.0.1:8080
```

## Troubleshooting

### Permission Issues
```bash
chmod +x *.sh
```

### Dependencies Missing
The `run.sh` script will automatically install missing dependencies!

### Port Conflicts
The script will detect and offer solutions for port conflicts automatically.
