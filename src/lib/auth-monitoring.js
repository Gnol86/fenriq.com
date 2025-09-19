// src/lib/auth-monitoring.js
import { headers } from "next/headers";

/**
 * Système de monitoring et logging avancé pour l'authentification
 * Optimisé pour debug et surveillance en production
 */

// Configuration des niveaux de log
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1, 
    INFO: 2,
    DEBUG: 3,
};

const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'development' 
    ? LOG_LEVELS.DEBUG 
    : LOG_LEVELS.INFO;

/**
 * Logger structuré pour l'authentification
 */
class AuthLogger {
    constructor() {
        this.sessionId = null;
        this.userId = null;
        this.orgId = null;
    }

    setContext(session) {
        this.sessionId = session?.session?.id;
        this.userId = session?.user?.id;
        this.orgId = session?.session?.activeOrganizationId;
    }

    _log(level, message, data = {}) {
        if (LOG_LEVELS[level] > CURRENT_LOG_LEVEL) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            service: 'AUTH',
            sessionId: this.sessionId,
            userId: this.userId,
            orgId: this.orgId,
            message,
            ...data,
        };

        // En développement : log pretty
        if (process.env.NODE_ENV === 'development') {
            const color = {
                ERROR: '\x1b[31m',
                WARN: '\x1b[33m', 
                INFO: '\x1b[36m',
                DEBUG: '\x1b[37m',
            }[level];
            
            console.log(
                `${color}[${level}]\x1b[0m ${timestamp} - ${message}`,
                Object.keys(data).length > 0 ? data : ''
            );
        } else {
            // En production : JSON structuré
            console.log(JSON.stringify(logEntry));
        }
    }

    error(message, data) { this._log('ERROR', message, data); }
    warn(message, data) { this._log('WARN', message, data); }
    info(message, data) { this._log('INFO', message, data); }
    debug(message, data) { this._log('DEBUG', message, data); }
}

// Instance globale du logger
export const authLogger = new AuthLogger();

/**
 * Middleware de monitoring pour les opérations d'auth
 */
export const withAuthMonitoring = (operation) => {
    return async (...args) => {
        const startTime = Date.now();
        const operationName = operation.name || 'unknownOperation';
        
        authLogger.info(`Starting ${operationName}`, { 
            args: args.length,
            timestamp: startTime 
        });

        try {
            const result = await operation(...args);
            const duration = Date.now() - startTime;
            
            authLogger.info(`Completed ${operationName}`, { 
                duration,
                success: true,
                resultType: typeof result 
            });
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            
            authLogger.error(`Failed ${operationName}`, {
                duration,
                error: error.message,
                stack: error.stack,
                errorType: error.constructor.name
            });
            
            throw error;
        }
    };
};

/**
 * Collecteur de métriques d'authentification
 */
class AuthMetrics {
    constructor() {
        this.metrics = new Map();
        this.startTime = Date.now();
    }

    increment(metric, value = 1, tags = {}) {
        const key = `${metric}:${JSON.stringify(tags)}`;
        const current = this.metrics.get(key) || { count: 0, tags, metric };
        current.count += value;
        current.lastUpdated = Date.now();
        this.metrics.set(key, current);
    }

    gauge(metric, value, tags = {}) {
        const key = `${metric}:${JSON.stringify(tags)}`;
        this.metrics.set(key, { 
            value, 
            tags, 
            metric, 
            type: 'gauge',
            lastUpdated: Date.now() 
        });
    }

    timing(metric, duration, tags = {}) {
        const key = `${metric}:timing:${JSON.stringify(tags)}`;
        const current = this.metrics.get(key) || { 
            count: 0, 
            total: 0, 
            min: Infinity, 
            max: 0,
            tags,
            metric,
            type: 'timing'
        };
        
        current.count++;
        current.total += duration;
        current.min = Math.min(current.min, duration);
        current.max = Math.max(current.max, duration);
        current.avg = current.total / current.count;
        current.lastUpdated = Date.now();
        
        this.metrics.set(key, current);
    }

    getMetrics() {
        return Array.from(this.metrics.values());
    }

    reset() {
        this.metrics.clear();
    }
}

export const authMetrics = new AuthMetrics();

/**
 * Decorator pour mesurer les performances
 */
export const measurePerformance = (metricName) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            const startTime = Date.now();
            
            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;
                
                authMetrics.timing(metricName, duration, { 
                    method: propertyKey,
                    success: true 
                });
                
                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                
                authMetrics.timing(metricName, duration, { 
                    method: propertyKey,
                    success: false,
                    error: error.constructor.name 
                });
                
                throw error;
            }
        };
        
        return descriptor;
    };
};

/**
 * Helper pour tracer les appels d'API auth
 */
export const traceAuthAPI = async (apiCall, operation, context = {}) => {
    const requestId = Math.random().toString(36).substring(7);
    const headersObj = await headers();
    
    const traceData = {
        requestId,
        operation,
        userAgent: headersObj.get('user-agent'),
        ip: headersObj.get('x-forwarded-for') || headersObj.get('x-real-ip'),
        ...context
    };

    authLogger.debug(`[TRACE] Starting ${operation}`, traceData);
    authMetrics.increment('auth.api.calls', 1, { operation });

    const startTime = Date.now();
    
    try {
        const result = await apiCall();
        const duration = Date.now() - startTime;
        
        authLogger.debug(`[TRACE] Completed ${operation}`, { 
            ...traceData, 
            duration,
            success: true 
        });
        
        authMetrics.timing('auth.api.duration', duration, { operation });
        authMetrics.increment('auth.api.success', 1, { operation });
        
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        
        authLogger.error(`[TRACE] Failed ${operation}`, { 
            ...traceData,
            duration,
            error: error.message,
            errorType: error.constructor.name 
        });
        
        authMetrics.timing('auth.api.duration', duration, { operation, error: true });
        authMetrics.increment('auth.api.errors', 1, { 
            operation, 
            errorType: error.constructor.name 
        });
        
        throw error;
    }
};

/**
 * Monitor pour les sessions suspectes
 */
export const detectSuspiciousActivity = (session, headers) => {
    const suspicious = [];
    
    // Vérification de l'IP
    const currentIP = headers.get('x-forwarded-for') || headers.get('x-real-ip');
    if (session?.ipAddress && session.ipAddress !== currentIP) {
        suspicious.push({
            type: 'IP_CHANGE',
            details: `IP changed from ${session.ipAddress} to ${currentIP}`,
            severity: 'MEDIUM'
        });
    }
    
    // Vérification de l'User-Agent
    const currentUA = headers.get('user-agent');
    if (session?.userAgent && session.userAgent !== currentUA) {
        suspicious.push({
            type: 'USER_AGENT_CHANGE', 
            details: 'User agent changed',
            severity: 'LOW'
        });
    }
    
    // Vérification de l'horaire (connexions à des heures inhabituelles)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
        suspicious.push({
            type: 'UNUSUAL_HOUR',
            details: `Login at ${hour}h`,
            severity: 'LOW'
        });
    }
    
    if (suspicious.length > 0) {
        authLogger.warn('Suspicious activity detected', {
            sessionId: session?.id,
            userId: session?.userId,
            activities: suspicious
        });
        
        authMetrics.increment('auth.suspicious.activity', 1, {
            types: suspicious.map(s => s.type).join(',')
        });
    }
    
    return suspicious;
};

/**
 * Endpoint pour récupérer les métriques (pour monitoring externe)
 */
export const getAuthMetrics = () => {
    const metrics = authMetrics.getMetrics();
    const uptime = Date.now() - authMetrics.startTime;
    
    return {
        uptime,
        metricsCount: metrics.length,
        metrics: metrics.map(m => ({
            name: m.metric,
            type: m.type || 'counter',
            value: m.value || m.count,
            tags: m.tags,
            lastUpdated: m.lastUpdated,
            ...(m.type === 'timing' && {
                avg: m.avg,
                min: m.min,
                max: m.max,
                count: m.count
            })
        }))
    };
};