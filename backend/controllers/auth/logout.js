require('dotenv').config();
const { query } = require('../../utils/database/connection');
const { refreshTokenQueries } = require('../../utils/database/queries');

async function logout(req, res, next) {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.sendStatus(204); // No content - already logged out
    }

    const refreshToken = cookies.jwt;

    try {
        // Delete the token from database (if it exists)
        await query(refreshTokenQueries.deleteToken, [refreshToken]);

        // Also delete all expired tokens for cleanup
        await query(refreshTokenQueries.deleteExpiredTokens);

    } catch (error) {
        // Log error but still clear the cookie
        console.error('Error during token deletion:', error);
    } finally {
        // Always clear the cookie regardless of database operation success
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true, // Dynamic based on environment
            sameSite: 'strict', // Use 'strict' instead of 'None' for better security
            path: '/' // Ensure cookie is cleared from all paths
        });

        return res.sendStatus(204);
    }
}

module.exports = logout;