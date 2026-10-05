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
            retryCount: 0,
            countdown: 2,
            isAutoRetrying: false
        };
        this.retryTimeout = null;
        this.countdownInterval = null;
        this.recoveryTimer = null;
    }
    
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        this.clearAllTimers();

        const { maxRetries = 3 } = this.props;
        const currentRetry = this.state.retryCount;
        const shouldAutoRetry = currentRetry < maxRetries;

        this.setState({
            error,
            errorInfo,
            isAutoRetrying: shouldAutoRetry,
            countdown: 2
        });

        // Log error
        console.error('Error caught by OptimizedErrorBoundary:', error, errorInfo);

        // Schedule auto retry if under maxRetries
        if (shouldAutoRetry) {
            // Countdown interval every 1 second
            this.countdownInterval = setInterval(() => {
                this.setState(prevState => {
                    if (prevState.countdown <= 1) {
                        return { countdown: 0 };
                    }
                    return { countdown: prevState.countdown - 1 };
                });
            }, 1000);

            // Trigger retry after 2 seconds
            this.retryTimeout = setTimeout(() => {
                this.handleRetry();
            }, 2000);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // If we transitioned from error to healthy render, wait to confirm recovery
        if (prevState.hasError && !this.state.hasError) {
            this.recoveryTimer = setTimeout(() => {
                // Successfully recovered! Reset retry counter
                this.setState({ retryCount: 0, isAutoRetrying: false });
            }, 4000);
        }
    }

    componentWillUnmount() {
        this.clearAllTimers();
    }

    clearAllTimers = () => {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        if (this.recoveryTimer) {
            clearTimeout(this.recoveryTimer);
            this.recoveryTimer = null;
        }
    };
    
    handleRetry = () => {
        this.clearAllTimers();
        const { maxRetries = 3 } = this.props;
        
        if (this.state.retryCount < maxRetries) {
            // Check if it's a dynamic module import / chunk load error
            const errorMessage = this.state.error?.message || '';
            const isChunkError = /Failed to fetch dynamically imported module|ChunkLoadError|Importing a module script failed/i.test(errorMessage);

            // If it's a chunk loading failure on second retry, hard reload usually solves stale bundle hashes
            if (isChunkError && this.state.retryCount >= 1) {
                window.location.reload();
                return;
            }

            this.setState(prevState => ({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: prevState.retryCount + 1,
                isAutoRetrying: false,
                countdown: 2
            }));
        }
    };
    
    render() {
        const { hasError, retryCount, countdown, isAutoRetrying } = this.state;
        const { fallback: FallbackComponent, maxRetries = 3, children } = this.props;
        
        if (hasError) {
            // Custom fallback UI if provided
            if (FallbackComponent) {
                return (
                    <FallbackComponent 
                        error={this.state.error}
                        onRetry={this.handleRetry}
                        canRetry={retryCount < maxRetries}
                        retryCount={retryCount}
                        countdown={countdown}
                        isAutoRetrying={isAutoRetrying}
                    />
                );
            }
            
            const attemptsLeft = maxRetries - retryCount;
            const canRetry = retryCount < maxRetries;

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                    <div className="max-w-md w-full mx-auto text-center p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                        {/* Icon status with pulse animation when auto retrying */}
                        <div className="relative mb-5 inline-flex items-center justify-center">
                            {canRetry && isAutoRetrying ? (
                                <div className="relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>
                                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                        <svg className="animate-spin h-7 w-7 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                                    <svg 
                                        className="h-7 w-7" 
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
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>

                        {canRetry ? (
                            <div className="mb-6 space-y-2">
                                <p className="text-gray-600 text-sm">
                                    Terjadi kendala saat memuat halaman ini. Sistem sedang mencoba memulihkan otomatis.
                                </p>
                                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Mencoba ulang dalam {countdown} detik... (Percobaan {retryCount + 1} dari {maxRetries})</span>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 space-y-2">
                                <p className="text-gray-600 text-sm">
                                    Halaman tidak dapat dipulihkan setelah {maxRetries} kali percobaan otomatis.
                                </p>
                                <p className="text-xs text-gray-500">
                                    Silakan muat ulang halaman atau kembali ke beranda.
                                </p>
                            </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                            {canRetry && (
                                <button
                                    onClick={this.handleRetry}
                                    className="
                                        inline-flex items-center justify-center px-4 py-2.5 
                                        bg-emerald-600 hover:bg-emerald-700 
                                        text-white rounded-xl font-semibold text-xs 
                                        shadow-sm hover:shadow transition-all cursor-pointer
                                    "
                                >
                                    Coba Sekarang ({attemptsLeft} tersisa)
                                </button>
                            )}

                            <button
                                onClick={() => window.location.reload()}
                                className="
                                    inline-flex items-center justify-center px-4 py-2.5 
                                    bg-gray-100 hover:bg-gray-200 text-gray-700 
                                    rounded-xl font-semibold text-xs transition-colors cursor-pointer
                                "
                            >
                                Refresh Halaman
                            </button>

                            <button
                                onClick={() => { window.location.href = '/'; }}
                                className="
                                    inline-flex items-center justify-center px-4 py-2.5 
                                    border border-gray-200 hover:bg-gray-50 text-gray-600 
                                    rounded-xl font-semibold text-xs transition-colors cursor-pointer
                                "
                            >
                                Ke Beranda
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left border-t border-gray-100 pt-4">
                                <summary className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-gray-700">
                                    Detail Error (Development)
                                </summary>
                                <pre className="mt-2 p-3 bg-red-50/70 border border-red-100 rounded-lg text-[11px] text-red-700 overflow-auto max-h-48 whitespace-pre-wrap font-mono">
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
