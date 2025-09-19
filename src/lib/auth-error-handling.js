// src/lib/auth-error-handling.js
import { authLogger, authMetrics } from "./auth-monitoring";

/**
 * Gestion d'erreurs robuste pour l'authentification
 * Provides fallbacks, retry logic, and graceful degradation
 */

// Types d'erreurs d'authentification
export const AuthErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED', 
    FORBIDDEN: 'FORBIDDEN',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    RATE_LIMITED: 'RATE_LIMITED',
    DATABASE_ERROR: 'DATABASE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Configuration des stratégies de retry
const RETRY_CONFIG = {
    NETWORK_ERROR: { attempts: 3, delay: 1000, backoff: 2 },
    DATABASE_ERROR: { attempts: 2, delay: 500, backoff: 1.5 },
    RATE_LIMITED: { attempts: 1, delay: 5000, backoff: 1 },
    DEFAULT: { attempts: 1, delay: 0, backoff: 1 }
};

/**
 * Classe d'erreur personnalisée pour l'authentification
 */
export class AuthError extends Error {
    constructor(message, type = AuthErrorTypes.UNKNOWN_ERROR, originalError = null, context = {}) {
        super(message);
        this.name = 'AuthError';
        this.type = type;
        this.originalError = originalError;
        this.context = context;
        this.timestamp = new Date().toISOString();
        this.retryable = this.isRetryable();
    }

    isRetryable() {
        return [
            AuthErrorTypes.NETWORK_ERROR,
            AuthErrorTypes.DATABASE_ERROR,
            AuthErrorTypes.RATE_LIMITED
        ].includes(this.type);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            type: this.type,
            timestamp: this.timestamp,
            context: this.context,
            retryable: this.retryable,
            stack: this.stack
        };
    }
}

/**
 * Analyse et catégorise les erreurs
 */
export const categorizeError = (error) => {
    if (!error) return AuthErrorTypes.UNKNOWN_ERROR;

    // Erreurs réseau
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || 
        error.message?.includes('fetch')) {
        return AuthErrorTypes.NETWORK_ERROR;
    }

    // Erreurs Better-Auth spécifiques
    if (error.name === 'APIError') {
        if (error.status === 401) return AuthErrorTypes.UNAUTHORIZED;
        if (error.status === 403) return AuthErrorTypes.FORBIDDEN;
        if (error.status === 429) return AuthErrorTypes.RATE_LIMITED;
        if (error.message?.includes('session')) return AuthErrorTypes.SESSION_EXPIRED;
    }

    // Erreurs de base de données
    if (error.code?.startsWith('P') || error.message?.includes('database') ||
        error.message?.includes('connection')) {
        return AuthErrorTypes.DATABASE_ERROR;
    }

    // Erreurs de validation
    if (error.name === 'ValidationError' || error.name === 'ZodError') {
        return AuthErrorTypes.VALIDATION_ERROR;
    }

    return AuthErrorTypes.UNKNOWN_ERROR;
};

/**
 * Wrapper avec retry automatique
 */
export const withRetry = (operation, customConfig = {}) => {
    return async (...args) => {
        let lastError;
        let attempts = 0;
        
        const executeWithRetry = async () => {
            try {
                return await operation(...args);
            } catch (error) {
                lastError = error;
                attempts++;
                
                const errorType = categorizeError(error);
                const config = { ...RETRY_CONFIG.DEFAULT, ...RETRY_CONFIG[errorType], ...customConfig };
                
                authLogger.warn(`Operation failed (attempt ${attempts}/${config.attempts})`, {
                    operation: operation.name,
                    error: error.message,
                    errorType,
                    attempt: attempts
                });

                authMetrics.increment('auth.errors.retry', 1, { 
                    operation: operation.name,
                    errorType,
                    attempt: attempts 
                });

                if (attempts >= config.attempts) {
                    throw new AuthError(
                        `Operation failed after ${attempts} attempts: ${error.message}`,
                        errorType,
                        error,
                        { attempts, operation: operation.name }
                    );
                }

                // Délai avec backoff exponentiel
                const delay = config.delay * Math.pow(config.backoff, attempts - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                return executeWithRetry();
            }
        };

        return executeWithRetry();
    };
};

/**
 * Circuit breaker pour éviter les appels répétés en cas de panne
 */
class CircuitBreaker {
    constructor(name, failureThreshold = 5, resetTimeout = 60000) {
        this.name = name;
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = 'HALF_OPEN';
                authLogger.info(`Circuit breaker ${this.name} transitioning to HALF_OPEN`);
            } else {
                throw new AuthError(
                    `Circuit breaker ${this.name} is OPEN`,
                    AuthErrorTypes.UNKNOWN_ERROR,
                    null,
                    { circuitBreaker: this.name, state: this.state }
                );
            }
        }

        try {
            const result = await operation();
            
            if (this.state === 'HALF_OPEN') {
                this.reset();
                authLogger.info(`Circuit breaker ${this.name} reset to CLOSED`);
            }
            
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            authLogger.error(`Circuit breaker ${this.name} OPENED`, {
                failureCount: this.failureCount,
                threshold: this.failureThreshold
            });
            
            authMetrics.increment('auth.circuit_breaker.opened', 1, { 
                name: this.name 
            });
        }
    }

    reset() {
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED';
    }
}

// Circuit breakers pour les opérations critiques
export const circuitBreakers = {
    database: new CircuitBreaker('database', 5, 30000),
    auth: new CircuitBreaker('auth', 3, 60000),
    permissions: new CircuitBreaker('permissions', 4, 45000)
};

/**
 * Wrapper avec circuit breaker
 */
export const withCircuitBreaker = (breakerName) => {
    return (operation) => {
        return async (...args) => {
            const breaker = circuitBreakers[breakerName];
            if (!breaker) {
                authLogger.error(`Circuit breaker ${breakerName} not found`);
                return operation(...args);
            }
            
            return breaker.execute(() => operation(...args));
        };
    };
};

/**
 * Fallback values pour différents types de données
 */
export const AuthFallbacks = {
    user: null,
    organization: null,
    permissions: [],
    role: 'guest',
    session: null,
    organizations: []
};

/**
 * Wrapper avec fallback automatique
 */
export const withFallback = (fallbackValue) => {
    return (operation) => {
        return async (...args) => {
            try {
                const result = await operation(...args);
                return result ?? fallbackValue;
            } catch (error) {
                const errorType = categorizeError(error);
                
                authLogger.warn(`Operation failed, using fallback`, {
                    operation: operation.name,
                    error: error.message,
                    errorType,
                    fallback: typeof fallbackValue
                });

                authMetrics.increment('auth.fallbacks.used', 1, { 
                    operation: operation.name,
                    errorType 
                });

                return fallbackValue;
            }
        };
    };
};

/**
 * Combine retry, circuit breaker et fallback
 */
export const withResilientAuth = (fallbackValue, breakerName = 'auth', retryConfig = {}) => {
    return (operation) => {
        return withFallback(fallbackValue)(
            withCircuitBreaker(breakerName)(
                withRetry(operation, retryConfig)
            )
        );
    };
};

/**
 * Error boundary personnalisé pour les composants auth
 */
export class AuthErrorBoundary {
    constructor() {
        this.errors = new Map();
    }

    captureError(error, context = {}) {
        const errorId = Math.random().toString(36).substring(7);
        const authError = error instanceof AuthError ? error : new AuthError(
            error.message || 'Unknown error',
            categorizeError(error),
            error,
            context
        );

        this.errors.set(errorId, {
            ...authError.toJSON(),
            id: errorId,
            context
        });

        authLogger.error('Auth error captured', {
            errorId,
            ...authError.toJSON()
        });

        authMetrics.increment('auth.errors.captured', 1, { 
            type: authError.type 
        });

        return errorId;
    }

    getError(errorId) {
        return this.errors.get(errorId);
    }

    clearError(errorId) {
        return this.errors.delete(errorId);
    }

    getAllErrors() {
        return Array.from(this.errors.values());
    }

    clear() {
        this.errors.clear();
    }
}

export const authErrorBoundary = new AuthErrorBoundary();

/**
 * Helper pour la gestion gracieuse d'erreurs dans les Server Components
 */
export const safeAuthOperation = async (operation, fallback = null) => {
    try {
        return await operation();
    } catch (error) {
        const errorId = authErrorBoundary.captureError(error, {
            component: 'ServerComponent',
            operation: operation.name
        });
        
        // En développement, on peut vouloir voir l'erreur
        if (process.env.NODE_ENV === 'development') {
            console.error(`Auth operation failed (${errorId}):`, error);
        }
        
        return fallback;
    }
};

/**
 * Status de santé du système d'auth
 */
export const getAuthHealthStatus = () => {
    const now = Date.now();
    const metrics = authMetrics.getMetrics();
    
    // Calcul du taux d'erreur récent (dernières 5 minutes)
    const recentErrors = metrics
        .filter(m => m.metric.includes('error') && now - m.lastUpdated < 300000)
        .reduce((sum, m) => sum + (m.count || 0), 0);
    
    const recentSuccess = metrics
        .filter(m => m.metric.includes('success') && now - m.lastUpdated < 300000)
        .reduce((sum, m) => sum + (m.count || 0), 0);
    
    const errorRate = recentSuccess > 0 ? recentErrors / (recentErrors + recentSuccess) : 0;
    
    // État des circuit breakers
    const breakerStatus = Object.entries(circuitBreakers).reduce((acc, [name, breaker]) => {
        acc[name] = {
            state: breaker.state,
            failures: breaker.failureCount,
            lastFailure: breaker.lastFailureTime
        };
        return acc;
    }, {});
    
    return {
        status: errorRate > 0.1 ? 'DEGRADED' : 'HEALTHY',
        errorRate: Math.round(errorRate * 100),
        circuitBreakers: breakerStatus,
        recentErrors,
        recentSuccess,
        timestamp: now
    };
};