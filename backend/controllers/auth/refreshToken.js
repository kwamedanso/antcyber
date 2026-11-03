// controllers/auth/refresh.controller.js
const authService = require('../../services/auth/auth.service.js');

const REFRESH_TOKEN_COOKIE = 'refresh_token';

const REFRESH_COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth'
};

/**
 * POST /auth/refresh
 *
 * Reads the refresh_token cookie, rotates it, and returns a new access token.
 *
 * Response 200: { success, data: { accessToken } }
 *
 */
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] || null;

        console.log(refreshToken);
        console.log(req.cookies);
        // return


        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                code: 'NO_REFRESH_TOKEN',
                message: 'No refresh token provided. Please log in.'
            });
        }

        const result = await authService.refreshAccessToken(refreshToken);

        const cookieMaxAge = new Date(result.refreshTokenExpiresAt).getTime() - Date.now();

        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
            ...REFRESH_COOKIE_BASE_OPTIONS,
            maxAge: cookieMaxAge
        });

        return res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken
            }
        });
    } catch (error) {
        // Any refresh failure clears the stale cookie.
        if (error.statusCode === 401) {
            res.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_COOKIE_BASE_OPTIONS);
        }

        return next(error);
    }
};

module.exports = { refresh };