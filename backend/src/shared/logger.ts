// backend/src/shared/logger.ts
// Service de logging structuré avec Winston

import winston from 'winston';

export interface LogContext {
    gameId?: string;
    socketId?: string;
    action?: string;
    player?: string;
    error?: Error;
    [key: string]: unknown;
}

const LOG_LEVELS = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
};

const LOG_COLORS = {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
};

winston.addColors(LOG_COLORS);

const winstonLogger = winston.createLogger({
    levels: LOG_LEVELS,
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const context = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
                    return `[${timestamp}] ${level}: ${message}${context}`;
                }),
            ),
        }),
    ],
});

const formatContext = (context?: LogContext): Record<string, unknown> => {
    if (!context) return {};
    const { error, ...rest } = context;
    if (error) {
        return { ...rest, errorMessage: error.message, errorStack: error.stack };
    }
    return rest;
};

export const logger = {
    info: (message: string, context?: LogContext): void => {
        winstonLogger.log('info', message, formatContext(context));
    },

    warn: (message: string, context?: LogContext): void => {
        winstonLogger.log('warn', message, formatContext(context));
    },

    error: (message: string, context?: LogContext): void => {
        winstonLogger.log('error', message, formatContext(context));
    },

    fatal: (message: string, context?: LogContext): void => {
        winstonLogger.log('fatal', message, formatContext(context));
    },
};
