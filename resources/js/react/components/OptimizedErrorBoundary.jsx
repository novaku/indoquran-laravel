import React, { Component } from 'react';

/**
 * Enhanced error boundary with retry functionality and better UX
 */
class OptimizedErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }
    
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        // Log error for debugging
        this.setState({
            error,
            errorInfo
        });

        // Log to external error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Error caught by ErrorBoundary:', error, errorInfo);
            // Here you could send to error reporting service like Sentry
        } else {
            console.error('Error caught by ErrorBoundary:', error, errorInfo);
        }
    }
    
    handleRetry = () => {
        const { maxRetries = 3 } = this.props;
        
        if (this.state.retryCount < maxRetries) {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: prevState.retryCount + 1
            }));
        }
    };
    
    render() {
        const { hasError, retryCount } = this.state;
        const { fallback: FallbackComponent, maxRetries = 3, children } = this.props;
        
        if (hasError) {
            // Custom fallback UI
            if (FallbackComponent) {
                return (
                    <FallbackComponent 
                        error={this.state.error}
                        onRetry={this.handleRetry}
                        canRetry={retryCount < maxRetries}
                        retryCount={retryCount}
                    />
                );
            }
            
            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md mx-auto text-center p-6">
                        <div className="mb-4">
                            <svg 
                                className="mx-auto h-12 w-12 text-gray-400" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
                                />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-4">
                            We encountered an error while loading this page. Please try again.
                        </p>
                        
                        {retryCount < maxRetries && (
                            <button
                                onClick={this.handleRetry}
                                className="
                                    inline-flex items-center px-4 py-2 
                                    bg-green-600 border border-transparent 
                                    rounded-md font-semibold text-xs text-white 
                                    uppercase tracking-widest 
                                    hover:bg-green-700 
                                    focus:bg-green-700 active:bg-green-900 
                                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                                    transition ease-in-out duration-150
                                "
                            >
                                Try Again ({maxRetries - retryCount} attempts left)
                            </button>
                        )}
                        
                        {retryCount >= maxRetries && (
                            <div className="text-sm text-gray-500">
                                <p>Please refresh the page or contact support if the problem persists.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="
                                        mt-2 inline-flex items-center px-3 py-1 
                                        bg-gray-200 border border-transparent 
                                        rounded text-xs text-gray-700 
                                        hover:bg-gray-300 
                                        transition ease-in-out duration-150
                                    "
                                >
                                    Refresh Page
                                </button>
                            </div>
                        )}
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        
        return children;
    }
}

export default OptimizedErrorBoundary;
