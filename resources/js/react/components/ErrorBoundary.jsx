import React from 'react';

class ErrorBoundary extends React.Component {
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
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.clearAllTimers();

        const maxRetries = this.props.maxRetries || 3;
        const currentRetry = this.state.retryCount;
        const shouldAutoRetry = currentRetry < maxRetries;

        // Log the error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        
        this.setState({
            error,
            errorInfo,
            isAutoRetrying: shouldAutoRetry,
            countdown: 2
        });

        if (shouldAutoRetry) {
            this.countdownInterval = setInterval(() => {
                this.setState(prevState => {
                    if (prevState.countdown <= 1) {
                        return { countdown: 0 };
                    }
                    return { countdown: prevState.countdown - 1 };
                });
            }, 1000);

            this.retryTimeout = setTimeout(() => {
                this.handleRetry();
            }, 2000);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.hasError && !this.state.hasError) {
            this.recoveryTimer = setTimeout(() => {
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
        const maxRetries = this.props.maxRetries || 3;

        if (this.state.retryCount < maxRetries) {
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
        const maxRetries = this.props.maxRetries || 3;
        const canRetry = retryCount < maxRetries;
        const attemptsLeft = maxRetries - retryCount;

        if (hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
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
                                <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h2>

                        {canRetry ? (
                            <div className="mb-6 space-y-2">
                                <p className="text-gray-600 text-sm">
                                    Terjadi kendala yang tidak terduga. Sistem sedang mencoba memulihkan otomatis.
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
                                    Silakan muat ulang halaman secara penuh.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                            {canRetry && (
                                <button
                                    onClick={this.handleRetry}
                                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                                >
                                    Coba Sekarang ({attemptsLeft} tersisa)
                                </button>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                            >
                                Refresh Halaman
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                            >
                                Ke Beranda
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <div className="bg-gray-100 rounded p-3 text-xs text-gray-800 overflow-auto max-h-32">
                                    <div className="font-semibold mb-1">Error:</div>
                                    <div className="mb-2">{this.state.error.toString()}</div>
                                    <div className="font-semibold mb-1">Stack Trace:</div>
                                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
