/**
 * Enhanced Anti-Injection Security Script
 * Specifically designed to block infird.com and similar malicious script injections
 * Created in response to: ff14b6f4-7f42-4825-9a18-3a041d3ea56c script injection attempt
 */

(function() {
    'use strict';
    
    // Known malicious patterns to block
    const MALICIOUS_PATTERNS = [
        'infird.com',
        'b50b7f30-3efc-40a4-958b-47c84a6ef83f',
        '5898d5bc-251a-4028-b882-b262a7cc68b7',
        /^https?:\/\/[^\/]+\/cdn\/[a-f0-9\-]{36}/,  // UUID-based CDN patterns
        /^https?:\/\/[^\/]+\/cdn\/[a-f0-9\-]+\?uuid=/,  // UUID query patterns
    ];
    
    // Log security events for monitoring
    const logSecurityEvent = (type, details) => {
        // Use a more informative console message format
        if (type.includes('BLOCKED')) {
            console.log(`🛡️ IndoQuran Security: ${type}`, details);
        } else {
            console.info(`🛡️ IndoQuran Security: ${type}`, details);
        }
        
        // Send to monitoring endpoint if available
        if (window.fetch && typeof window.trackSecurityEvent === 'function') {
            window.trackSecurityEvent(type, details);
        }
    };
    
    // Check if a URL matches any malicious pattern
    const isMaliciousUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        
        return MALICIOUS_PATTERNS.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(url);
            }
            return url.includes(pattern);
        });
    };
    
    // 1. Override document.createElement to prevent malicious script injection
    if (typeof document !== 'undefined' && document.createElement) {
        const originalCreateElement = document.createElement.bind(document);
        
        document.createElement = function(tagName) {
            const element = originalCreateElement(tagName);
            
            if (tagName && tagName.toLowerCase() === 'script') {
                // Override setAttribute to block malicious sources
                const originalSetAttribute = element.setAttribute.bind(element);
                element.setAttribute = function(name, value) {
                    if (name && name.toLowerCase() === 'src' && isMaliciousUrl(value)) {
                        console.log(`🛡️ IndoQuran Security: Blocked suspicious script src: ${value}`);
                        logSecurityEvent('BLOCKED_SCRIPT_INJECTION', {
                            method: 'createElement.setAttribute',
                            url: value,
                            tagName: tagName
                        });
                        return; // Block the operation
                    }
                    return originalSetAttribute(name, value);
                };
                
                // Override src property directly
                let srcValue = '';
                Object.defineProperty(element, 'src', {
                    set: function(value) {
                        if (isMaliciousUrl(value)) {
                            console.log(`🛡️ IndoQuran Security: Blocked suspicious script src: ${value}`);
                            logSecurityEvent('BLOCKED_SCRIPT_INJECTION', {
                                method: 'createElement.src',
                                url: value,
                                tagName: tagName
                            });
                            return; // Block the operation
                        }
                        srcValue = value;
                        this.setAttribute('src', value);
                    },
                    get: function() {
                        return srcValue || this.getAttribute('src');
                    },
                    configurable: true,
                    enumerable: true
                });
            }
            
            return element;
        };
    }
    
    // 2. Override fetch to block malicious requests
    if (typeof window !== 'undefined' && window.fetch) {
        const originalFetch = window.fetch.bind(window);
        
        window.fetch = function(resource, options = {}) {
            const url = typeof resource === 'string' ? resource : 
                       (resource && resource.url) || String(resource);
            
            if (isMaliciousUrl(url)) {
                logSecurityEvent('BLOCKED_FETCH_REQUEST', {
                    method: 'fetch',
                    url: url,
                    options: options
                });
                
                return Promise.reject(new Error(`Blocked malicious request to: ${url}`));
            }
            
            return originalFetch(resource, options);
        };
    }
    
    // 3. Override XMLHttpRequest to block malicious requests
    if (typeof window !== 'undefined' && window.XMLHttpRequest) {
        const OriginalXHR = window.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new OriginalXHR();
            const originalOpen = xhr.open.bind(xhr);
            
            xhr.open = function(method, url, ...args) {
                if (isMaliciousUrl(url)) {
                    logSecurityEvent('BLOCKED_XHR_REQUEST', {
                        method: 'XMLHttpRequest',
                        url: url,
                        httpMethod: method
                    });
                    
                    // Simulate a network error
                    setTimeout(() => {
                        if (xhr.onerror) xhr.onerror(new Error('Network error'));
                    }, 0);
                    return;
                }
                
                return originalOpen(method, url, ...args);
            };
            
            return xhr;
        };
        
        // Copy static properties
        Object.setPrototypeOf(window.XMLHttpRequest, OriginalXHR);
        Object.setPrototypeOf(window.XMLHttpRequest.prototype, OriginalXHR.prototype);
    }
    
    // 4. Monitor and block dynamic script insertions
    if (typeof document !== 'undefined' && document.head) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        node.tagName && node.tagName.toLowerCase() === 'script') {
                        
                        const src = node.src || node.getAttribute('src');
                        if (src && isMaliciousUrl(src)) {
                            logSecurityEvent('BLOCKED_DYNAMIC_SCRIPT', {
                                method: 'MutationObserver',
                                url: src,
                                innerHTML: node.innerHTML.substring(0, 100)
                            });
                            
                            // Remove the malicious script
                            if (node.parentNode) {
                                node.parentNode.removeChild(node);
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.head, {
            childList: true,
            subtree: true
        });
        
        // Also observe body for completeness
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            // If body doesn't exist yet, wait for it
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        }
    }
    
    // 5. Block eval and Function constructor for suspicious code
    if (typeof window !== 'undefined') {
        const originalEval = window.eval;
        const originalFunction = window.Function;
        
        window.eval = function(code) {
            if (typeof code === 'string' && MALICIOUS_PATTERNS.some(pattern => {
                if (pattern instanceof RegExp) return pattern.test(code);
                return code.includes(pattern);
            })) {
                logSecurityEvent('BLOCKED_EVAL_INJECTION', {
                    method: 'eval',
                    code: code.substring(0, 200)
                });
                throw new Error('Blocked malicious eval attempt');
            }
            return originalEval(code);
        };
        
        window.Function = function(...args) {
            const code = args[args.length - 1];
            if (typeof code === 'string' && MALICIOUS_PATTERNS.some(pattern => {
                if (pattern instanceof RegExp) return pattern.test(code);
                return code.includes(pattern);
            })) {
                logSecurityEvent('BLOCKED_FUNCTION_INJECTION', {
                    method: 'Function',
                    code: code.substring(0, 200)
                });
                throw new Error('Blocked malicious Function constructor attempt');
            }
            return originalFunction.apply(this, args);
        };
        
        // Preserve prototype
        window.Function.prototype = originalFunction.prototype;
    }
    
    // 6. CSP Violation Monitoring
    if (typeof document !== 'undefined') {
        document.addEventListener('securitypolicyviolation', (e) => {
            if (e.violatedDirective === 'script-src-elem' && isMaliciousUrl(e.blockedURI)) {
                logSecurityEvent('CSP_VIOLATION_BLOCKED', {
                    violatedDirective: e.violatedDirective,
                    blockedURI: e.blockedURI,
                    sourceFile: e.sourceFile,
                    lineNumber: e.lineNumber
                });
            }
        });
    }
    
    // 7. Initialize security monitoring
    const initSecurity = () => {
        logSecurityEvent('ANTI_INJECTION_LOADED', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            patternsCount: MALICIOUS_PATTERNS.length
        });
        
        // Set up periodic security check
        setInterval(() => {
            // Check for suspicious scripts in DOM
            const scripts = document.querySelectorAll('script[src]');
            let suspiciousCount = 0;
            
            scripts.forEach(script => {
                if (script.src && isMaliciousUrl(script.src)) {
                    suspiciousCount++;
                    logSecurityEvent('SUSPICIOUS_SCRIPT_DETECTED', {
                        url: script.src,
                        method: 'periodicCheck'
                    });
                    
                    // Remove if still in DOM
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }
            });
            
            if (suspiciousCount > 0) {
                logSecurityEvent('PERIODIC_CLEANUP', {
                    removedScripts: suspiciousCount
                });
            }
        }, 5000); // Check every 5 seconds
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }
    
    // Expose security API for monitoring
    window.IndoQuranSecurity = {
        isMaliciousUrl,
        logSecurityEvent,
        getSecurityStats: () => ({
            patternsCount: MALICIOUS_PATTERNS.length,
            timestamp: new Date().toISOString()
        }),
        
        // Enhanced security reporting
        reportThreat: (threatType, details) => {
            logSecurityEvent(threatType, details);
            
            // Also send to server if available
            if (window.fetch) {
                fetch('/api/security/stats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        type: 'client_threat_report',
                        threatType,
                        details,
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        url: window.location.href
                    })
                }).catch(error => {
                    console.warn('Failed to report threat to server:', error);
                });
            }
        },
        
        // Display security status in console
        displaySecurityStatus: () => {
            console.group('🛡️ IndoQuran Security Status');
            console.log('✅ Anti-injection protection: ACTIVE');
            console.log('✅ CSP monitoring: ACTIVE');
            console.log('✅ Runtime threat detection: ACTIVE');
            console.log('✅ Malicious pattern blocking: ACTIVE');
            console.log(`📊 Protected patterns: ${MALICIOUS_PATTERNS.length}`);
            console.log('ℹ️ Security violations in console are EXPECTED - they indicate protection is working!');
            console.groupEnd();
        }
    };
    
    // Display security status on load
    setTimeout(() => {
        if (window.IndoQuranSecurity) {
            window.IndoQuranSecurity.displaySecurityStatus();
        }
    }, 2000);
})();
