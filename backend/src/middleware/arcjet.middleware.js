import aj from "../lib/arcjet.js";
import { config } from "../config/env.js";

// Middleware function to use Arcjet for request validation with robust error handling

export const arcjetProtection = async (req, res, next) => {
    // Skip Arcjet protection if not configured or in test environment
    if (!config.arcjetKey || process.env.NODE_ENV === 'test') {
        console.warn('⚠️ Arcjet protection skipped: Key not configured or test environment');
        return next();
    }

    try {
        // Validate that aj is properly initialized
        if (!aj || typeof aj.protect !== 'function') {
            console.error('❌ Arcjet instance not properly initialized');
            // In production, fail closed (block request). In development, fail open (allow request)
            if (config.isProduction()) {
                return res.status(503).json({ 
                    message: "Service temporarily unavailable",
                    error: "Security service not available"
                });
            }
            return next();
        }

        // Validate the request using Arcjet with timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Arcjet validation timeout')), 5000)
        );

        const decision = await Promise.race([
            aj.protect(req),
            timeoutPromise
        ]);

        // Handle different decision outcomes
        if (!decision) {
            console.error('❌ Arcjet returned null/undefined decision');
            // Fail open in development, fail closed in production
            if (config.isProduction()) {
                return res.status(503).json({ 
                    message: "Service temporarily unavailable" 
                });
            }
            return next();
        }

        // Check if request is allowed
        if (decision.conclusion === "ALLOW") {
            return next();
        }

        // Request was denied - provide specific error messages
        const denialReasons = [];
        
        // Check for rate limiting
        if (decision.reason?.isRateLimit()) {
            denialReasons.push("Rate limit exceeded");
            console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
            return res.status(429).json({ 
                message: "Too many requests. Please try again later.",
                retryAfter: decision.reason.resetTime || 60
            });
        }

        // Check for bot detection
        if (decision.reason?.isBot()) {
            denialReasons.push("Bot detected");
            console.warn(`⚠️ Bot detected: ${req.ip} - ${req.headers['user-agent']}`);
            return res.status(403).json({ 
                message: "Access denied: Automated traffic detected"
            });
        }

        // Check for shield (attack detection)
        if (decision.reason?.isShield()) {
            denialReasons.push("Potential attack detected");
            console.warn(`⚠️ Shield blocked request from IP: ${req.ip}`);
            return res.status(403).json({ 
                message: "Access denied: Request blocked for security reasons"
            });
        }

        // Generic denial
        console.warn(`⚠️ Request blocked by Arcjet: ${denialReasons.join(', ') || 'Unknown reason'}`);
        return res.status(403).json({ 
            message: "Access denied",
            reason: config.isDevelopment() ? denialReasons.join(', ') : undefined
        });

    } catch (error) {
        // Comprehensive error handling
        console.error('❌ Error in Arcjet middleware:', {
            message: error.message,
            stack: config.isDevelopment() ? error.stack : undefined,
            ip: req.ip,
            path: req.path,
            method: req.method
        });

        // Handle specific error types
        if (error.name === 'ArcjetError') {
            console.error('❌ Arcjet-specific error:', error.message);
        } else if (error.message?.includes('timeout')) {
            console.error('❌ Arcjet validation timeout');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.error('❌ Network error connecting to Arcjet service');
        } else if (error.name === 'TypeError') {
            console.error('❌ Type error in Arcjet validation:', error.message);
        }

        // Fail-safe behavior based on environment
        if (config.isProduction()) {
            // In production, fail closed for security
            return res.status(503).json({ 
                message: "Service temporarily unavailable. Please try again later."
            });
        } else {
            // In development, fail open to not block development
            console.warn('⚠️ Allowing request due to Arcjet error in development mode');
            return next();
        }
    }
};