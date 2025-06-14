import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Auth redirect component that redirects based on authentication state
 * This approach avoids potential issues with direct Navigate usage
 */
export function AuthRedirect({ isAuthenticated, to, children }) {
  if (isAuthenticated) {
    return children;
  }
  
  return <Navigate to={to} replace />;
}

/**
 * Wrapper for protected routes
 */
export function ProtectedRoute({ isAuthenticated, redirectPath = '/auth/login', children }) {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
}
