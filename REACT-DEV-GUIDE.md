# React Development with Hot Reload

## Quick Start

Your React views are now configured for automatic refresh during development! Here's how to use it:

### Method 1: Individual Servers (Recommended for Development)

1. **Start Vite Dev Server (for React Hot Reload):**
   ```bash
   npm run dev
   ```
   This runs on `http://localhost:5173`

2. **Start Laravel Server (in another terminal):**
   ```bash
   php artisan serve
   ```
   This runs on `http://localhost:8000`

3. **Access your React app:**
   Visit `http://localhost:8000/react` in your browser

### Method 2: Combined Script

Run both servers together:
```bash
npm run react:dev
```

Or use the shell script:
```bash
./dev-react.sh
```

## How Hot Reload Works

### ✅ What Gets Auto-Refreshed:
- **React Components** - Changes reflect instantly without losing state
- **CSS/Tailwind** - Styles update immediately
- **JavaScript modules** - Functions and logic update seamlessly

### 🔄 What Triggers Page Reload:
- **Blade templates** - Laravel views refresh the entire page
- **PHP files** - Backend changes reload the page
- **Route changes** - Routing modifications trigger reload

## Development Workflow

### 1. **React Component Changes:**
```jsx
// Edit any component in resources/js/react/
// Changes appear instantly without losing component state
```

### 2. **Testing Hot Reload:**
- Visit your React app at `http://localhost:8000/react`
- Try the test component counter
- Edit `resources/js/react/components/TestComponent.jsx`
- Watch changes appear instantly!

### 3. **CSS Changes:**
```css
/* Edit resources/css/app.css */
/* Styles update immediately */
```

## Available Scripts

```json
{
  "dev": "vite",                    // Start Vite dev server
  "dev:host": "vite --host",        // Expose to network
  "react:dev": "concurrently...",   // Run Laravel + Vite together
  "build": "vite build",            // Build for production
  "preview": "vite preview",        // Preview production build
  "watch": "vite build --watch"     // Watch build for changes
}
```

## Configuration Details

### Vite Config (`vite.config.js`):
- **Fast Refresh**: Enabled for React components
- **HMR**: Hot Module Replacement configured
- **File Watching**: Monitors React, Blade, and PHP files
- **Tailwind**: Integrated with hot reload

### Enhanced Features:
- **State Preservation**: Component state maintained during updates
- **Error Overlay**: Development errors shown in browser
- **Fast Builds**: Optimized for quick rebuilds
- **Network Access**: Use `npm run dev:host` to test on devices

## Troubleshooting

### If Hot Reload Isn't Working:

1. **Check both servers are running:**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   php artisan serve
   ```

2. **Hard refresh browser:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

3. **Restart dev server:** Stop and restart `npm run dev`

4. **Check browser console** for any JavaScript errors

### Common Issues:

- **Port conflicts**: Laravel (8000) and Vite (5173) must both be free
- **Cache issues**: Clear browser cache if changes don't appear
- **File permissions**: Ensure all files are readable

### CSP (Content Security Policy) Issues:

If you see errors like "Refused to load script blob:" in the console:

- ✅ **Fixed**: The project includes development CSP headers that allow hot reload
- The `ContentSecurityPolicy` middleware automatically allows blob/websocket URLs in local environment
- In production, CSP is more restrictive for security

### Browser Console Errors:

- **blob: script errors**: Should be resolved with the CSP configuration
- **WebSocket connection failed**: Check if Vite dev server is running on port 5173
- **React DevTools**: Install React Developer Tools browser extension for better debugging

## Production Build

When ready for production:
```bash
npm run build
```

This creates optimized assets in `public/build/` that Laravel will serve.

---

## Next Steps

1. **Remove Test Component**: After confirming hot reload works, remove the TestComponent from App.jsx
2. **Build Your Components**: Create React components in `resources/js/react/components/`
3. **Add Routes**: Update React Router routes in `App.jsx`
4. **Integrate APIs**: Connect to your Laravel API endpoints

Happy coding! 🚀
