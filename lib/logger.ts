// Simplified logger for Next.js environment
// Uses console in development/production since Winston doesn't work well in Edge runtime

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: string;
}

const formatMessage = (level: LogLevel, message: string): LogMessage => ({
    level,
    message,
    timestamp: new Date().toISOString(),
});

const shouldLog = (): boolean => {
    // Always log in development, or when not in test mode
    return process.env.NODE_ENV !== 'test';
};

export const logger = {
    info: (message: string): void => {
        if (shouldLog()) {
            console.log(JSON.stringify(formatMessage('info', message)));
        }
    },

    warn: (message: string): void => {
        if (shouldLog()) {
            console.warn(JSON.stringify(formatMessage('warn', message)));
        }
    },

    error: (message: string): void => {
        if (shouldLog()) {
            console.error(JSON.stringify(formatMessage('error', message)));
        }
    },

    debug: (message: string): void => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(JSON.stringify(formatMessage('debug', message)));
        }
    },
};

export default logger;
