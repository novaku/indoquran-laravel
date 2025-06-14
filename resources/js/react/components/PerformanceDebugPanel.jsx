import React, { useState, useEffect } from 'react';
import useAdvancedPerformanceMonitor from '../hooks/useAdvancedPerformanceMonitor.js';

/**
 * Performance Debug Panel
 * Only visible in development mode
 * Shows real-time performance metrics and optimization suggestions
 */
const PerformanceDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  
  const { getMetrics, getOptimizationSuggestions } = useAdvancedPerformanceMonitor({
    logToConsole: false // We'll handle logging in the panel
  });

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Update metrics every 2 seconds
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getMetrics());
      setSuggestions(getOptimizationSuggestions());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    
    return () => clearInterval(interval);
  }, [getMetrics, getOptimizationSuggestions]);

  // Toggle panel with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (value, metric) => {
    if (metric === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Panel (Ctrl+Shift+P)"
      >
        📊
      </button>

      {/* Performance Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-auto">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Performance Monitor</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Core Web Vitals */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Core Web Vitals</h4>
              <div className="space-y-2">
                {Object.entries(metrics).map(([metric, data]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(data.rating)}`}>
                      {formatValue(data.value, metric)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory Info */}
            {performance.memory && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Memory Usage</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span>{Math.round(performance.memory.usedJSHeapSize / 1048576)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{Math.round(performance.memory.totalJSHeapSize / 1048576)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limit:</span>
                    <span>{Math.round(performance.memory.jsHeapSizeLimit / 1048576)}MB</span>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Info */}
            {navigator.connection && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Connection</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{navigator.connection.effectiveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downlink:</span>
                    <span>{navigator.connection.downlink} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RTT:</span>
                    <span>{navigator.connection.rtt}ms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Optimization Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Suggestions</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <div className="font-medium text-xs text-yellow-800 mb-1">
                        {suggestion.metric}
                      </div>
                      <div className="text-xs text-yellow-700">
                        {suggestion.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resource Count */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Resources</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Scripts:</span>
                  <span>{document.querySelectorAll('script').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stylesheets:</span>
                  <span>{document.querySelectorAll('link[rel="stylesheet"]').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>DOM Elements:</span>
                  <span>{document.querySelectorAll('*').length}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 border-t pt-2">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Shift+P</kbd> to toggle
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceDebugPanel;
