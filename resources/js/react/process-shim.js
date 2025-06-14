// Create a process shim for React 19 and Babel
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.NODE_ENV = import.meta.env.MODE === 'production' ? 'production' : 'development';
