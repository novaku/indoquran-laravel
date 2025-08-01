// Enhanced Service Worker Registration for PageSpeed
(function() {
  'use strict';
  
  if (!('serviceWorker' in navigator)) {
    return;
  }
  
  // Register service worker with performance optimizations
  function registerSW() {
    navigator.serviceWorker.register('/sw-mobile.js', {
      scope: '/',
      updateViaCache: 'none'
    }).then(registration => {
      console.log('SW: Registered successfully');
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateAvailable();
          }
        });
      });
      
      // Periodic update check
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000); // Check every 5 minutes
      
    }).catch(error => {
      console.log('SW: Registration failed', error);
    });
  }
  
  // Show update notification
  function showUpdateAvailable() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('IndoQuran Update Available', {
        body: 'A new version is available. Refresh to update.',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        tag: 'app-update'
      });
    }
  }
  
  // Handle service worker messages
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'PERFORMANCE_DATA') {
      // Store performance data
      storePerformanceData(event.data.payload);
    }
  });
  
  // Store performance data for sync
  function storePerformanceData(data) {
    if ('indexedDB' in window) {
      const request = indexedDB.open('IndoQuranDB', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['performance'], 'readwrite');
        const store = transaction.objectStore('performance');
        store.add({
          ...data,
          timestamp: Date.now(),
          synced: false
        });
      };
    }
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerSW);
  } else {
    registerSW();
  }
  
  // Handle controller changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!window.isRefreshing) {
      window.isRefreshing = true;
      window.location.reload();
    }
  });
  
})();
