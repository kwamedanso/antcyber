// controllers/auth/login.controller.js
const authService = require('../../services/auth/auth.service.js');

// ============================================================================
// CONSTANTS
// ============================================================================

const REFRESH_TOKEN_COOKIE = 'refresh_token';

const REFRESH_COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth'
};

// ============================================================================
// HELPERS
// ============================================================================

const extractClientMeta = (req) => ({
    ip_address:
        req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||null,
    user_agent: req.get('user-agent') || null
});

// ============================================================================
// LOGIN
// ============================================================================

/**
 * POST /auth/login
 *
 * Body: { email, password, rememberMe? }
 *
 * Response 200: { success, data: { accessToken, user, sessionId, payload } }
 * Sets an httpOnly refresh_token cookie.
 */
const login = async (req, res, next) => {
    try {
        const { email, password, rememberMe = false } = req.body || {};

        
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REQUEST',
                message: 'Email and password are required.'
            });
        }
        
        const meta = extractClientMeta(req);

        const result = await authService.loginUser(
            { email, password, rememberMe: Boolean(rememberMe) },
            meta
        );

        const cookieMaxAge = new Date(result.refreshTokenExpiresAt).getTime() - Date.now();

        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
            ...REFRESH_COOKIE_BASE_OPTIONS,
            maxAge: cookieMaxAge
        });

        return res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
                user: result.user,
                sessionId: result.sessionId,
                payload: result.payload
            }
        });
    } catch (error) {
        if (error.code === 'PASSWORD_CHANGE_REQUIRED') {
            return res.status(403).json({
                success: false,
                code: 'PASSWORD_CHANGE_REQUIRED',
                message: error.message
            });
        }

        if (error.code === 'INVALID_CREDENTIALS') {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: error.message
            });
        }
        if (error.code === 'TWO_FACTOR_REQUIRED') {
            return res.status(403).json({
                success: false,
                code: 'TWO_FACTOR_REQUIRED',
                message: error.message
            });
        }
        if (error.code === 'ACCOUNT_LOCKED') {
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_LOCKED',
                message: error.message
            });
        }
        if (error.code === 'ACCOUNT_DEACTIVATED') {
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_DEACTIVATED',
                message: error.message
            });
        }

        return next(error);
    }
};

module.exports = {login};