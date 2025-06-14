import { useState, useEffect, useRef } from 'react';

// Simple in-memory cache for API responses
const apiCache = new Map();
const cacheTimestamps = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useApiCache = (key, apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isValidCache = (cacheKey) => {
    const timestamp = cacheTimestamps.get(cacheKey);
    return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
  };

  const fetchData = async () => {
    if (!key) return;

    // Check cache first
    if (apiCache.has(key) && isValidCache(key)) {
      if (isMountedRef.current) {
        setData(apiCache.get(key));
        setLoading(false);
        setError(null);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (isMountedRef.current) {
        // Cache the result
        apiCache.set(key, result);
        cacheTimestamps.set(key, Date.now());
        
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [key, ...dependencies]);

  const refreshData = () => {
    // Clear cache for this key
    apiCache.delete(key);
    cacheTimestamps.delete(key);
    fetchData();
  };

  const clearCache = () => {
    apiCache.clear();
    cacheTimestamps.clear();
  };

  return {
    data,
    loading,
    error,
    refreshData,
    clearCache
  };
};

// Preload function for critical data
export const preloadData = async (key, apiCall) => {
  if (!apiCache.has(key) || !isValidCache(key)) {
    try {
      const result = await apiCall();
      apiCache.set(key, result);
      cacheTimestamps.set(key, Date.now());
    } catch (error) {
      console.warn('Preload failed for key:', key, error);
    }
  }
};

const isValidCache = (cacheKey) => {
  const timestamp = cacheTimestamps.get(cacheKey);
  return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
};
