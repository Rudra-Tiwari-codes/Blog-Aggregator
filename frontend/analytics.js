// ==============================================
// ANALYTICS & MONITORING CONFIGURATION
// ==============================================

class AnalyticsManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.pageLoadTime = Date.now();
        this.events = [];
        this.initialized = false;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    // Track page view
    trackPageView(pageName, metadata = {}) {
        this.track('page_view', {
            page: pageName,
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    // Track custom event
    track(eventName, properties = {}) {
        const event = {
            event: eventName,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            properties: {
                ...properties,
                userAgent: navigator.userAgent,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };

        this.events.push(event);

        // Send to analytics endpoint
        this.sendEvent(event);
    }

    // Send event to backend
    async sendEvent(event) {
        try {
            // Send to Vercel Analytics
            if (window.va) {
                window.va('event', event.event, event.properties);
            }

            // Send to custom analytics endpoint
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
                keepalive: true
            }).catch(() => { }); // Silent fail
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    // Track reading time
    trackReadTime(postId, timeSpent) {
        this.track('read_time', {
            postId,
            timeSpent,
            readPercentage: this.calculateReadPercentage()
        });
    }

    calculateReadPercentage() {
        const scrolled = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        return Math.round((scrolled / height) * 100);
    }

    // Track search queries
    trackSearch(query, resultsCount) {
        this.track('search', {
            query,
            resultsCount,
            searchDuration: Date.now() - this.searchStartTime
        });
    }

    // Track clicks
    trackClick(element, label) {
        this.track('click', {
            element,
            label,
            position: this.getElementPosition(element)
        });
    }

    getElementPosition(selector) {
        const el = document.querySelector(selector);
        if (!el) {return null;}
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY
        };
    }

    // Track errors
    trackError(error, context = {}) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            context
        });
    }

    // Track performance metrics
    trackPerformance() {
        if (!performance || !performance.timing) {return;}

        const timing = performance.timing;
        const metrics = {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,
            dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            load: timing.loadEventEnd - timing.loadEventStart,
            total: timing.loadEventEnd - timing.navigationStart,
            ttfb: timing.responseStart - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            fullyLoaded: timing.loadEventEnd - timing.navigationStart
        };

        this.track('performance', metrics);
    }

    // Initialize on page load
    init() {
        if (this.initialized) {return;}
        this.initialized = true;

        // Track page view
        this.trackPageView(document.title);

        // Track performance after load
        window.addEventListener('load', () => {
            setTimeout(() => this.trackPerformance(), 0);
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = this.calculateReadPercentage();
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (scrollPercent >= 25 && scrollPercent < 50) {
                    this.track('scroll_depth', { depth: 25 });
                } else if (scrollPercent >= 50 && scrollPercent < 75) {
                    this.track('scroll_depth', { depth: 50 });
                } else if (scrollPercent >= 75 && scrollPercent < 100) {
                    this.track('scroll_depth', { depth: 75 });
                } else if (scrollPercent >= 100) {
                    this.track('scroll_depth', { depth: 100 });
                }
            }
        }, { passive: true });

        // Track time on page
        this.timeOnPage = Date.now();
        window.addEventListener('beforeunload', () => {
            const duration = Date.now() - this.timeOnPage;
            this.track('time_on_page', { duration });
        });

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            this.track('visibility_change', {
                hidden: document.hidden
            });
        });
    }
}

// Initialize analytics
const analytics = new AnalyticsManager();

// Export for use in other files
window.analytics = analytics;

// ==============================================
// ERROR TRACKING
// ==============================================

class ErrorTracker {
    constructor() {
        this.errors = [];
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Catch global errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError({
                type: 'javascript',
                message,
                source,
                lineno,
                colno,
                error: error?.stack
            });
            return false;
        };

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'unhandled_promise',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
        });

        // Catch network errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: `Failed to load: ${event.target.src || event.target.href}`,
                    target: event.target.tagName
                });
            }
        }, true);
    }

    logError(errorData) {
        const error = {
            ...errorData,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: analytics.sessionId
        };

        this.errors.push(error);
        console.error('📛 Error tracked:', error);

        // Send to error tracking service
        analytics.trackError(error);

        // Also send to backend
        this.sendToBackend(error);
    }

    async sendToBackend(error) {
        try {
            await fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error),
                keepalive: true
            }).catch(() => { });
        } catch (e) {
            // Silent fail
        }
    }
}

// Initialize error tracking
const errorTracker = new ErrorTracker();
window.errorTracker = errorTracker;

// ==============================================
// EXPORTS
// ==============================================

export { analytics, errorTracker, AnalyticsManager, ErrorTracker };
