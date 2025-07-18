// Optimized Service Worker Registration for Mobile
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-mobile.js', {
      scope: '/',
      updateViaCache: 'none'
    }).then(registration => {
      console.log('SW: Registered successfully');
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
      
    }).catch(error => {
      console.log('SW: Registration failed');
    });
  });
  
  // Handle service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
