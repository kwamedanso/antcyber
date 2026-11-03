// controllers/auth/logout.controller.js
const authService = require('../../services/auth/auth.service.js');

const REFRESH_TOKEN_COOKIE = 'refresh_token';

const REFRESH_COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth'
};

/**
 * POST /auth/logout
 *
 * Unauthenticated route — identifies the session via the refresh cookie.
 * Works even when the access token has already expired.
 *
 * Body: { all?: boolean }
 *   all=true → revoke every session for the user (logout everywhere)
 *   default  → revoke only the session behind the current cookie
 *
 * The refresh cookie is always cleared, on success or failure.
 *
 * Response 200: { success, data: { revokedCount, revokedSessionIds } }
 */
const logout = async (req, res, next) => {
    try {
        const { all = false } = req.body || {};
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] || null;

        console.log(refreshToken)
        // No cookie → nothing to revoke. Idempotent success.
        if (!refreshToken) {
            res.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_COOKIE_BASE_OPTIONS);
            return res.status(200).json({
                success: true,
                data: { revokedCount: 0, revokedSessionIds: [] }
            });
        }

        const result = await authService.logoutByRefreshToken(refreshToken, {
            all: Boolean(all)
        });

        res.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_COOKIE_BASE_OPTIONS);

        return res.status(200).json({
            success: true,
            data: {
                revokedCount: result.revokedCount,
                revokedSessionIds: result.revokedSessionIds
            }
        });
    } catch (error) {
        try {
            res.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_COOKIE_BASE_OPTIONS);
        } catch (_) { /* ignore */ }
        return next(error);
    }
};

module.exports = { logout };