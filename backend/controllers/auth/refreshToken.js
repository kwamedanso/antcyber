require('dotenv').config();
const jwt = require('jsonwebtoken');
const { query } = require('../../utils/database/connection');
const { refreshTokenQueries } = require('../../utils/database/queries');

async function refreshToken(req, res, next) {
    const cookies = req.cookies;


    if (!cookies?.jwt) return res.status(401).json({ success: false, message: "Unauthorized" });

    const refreshToken = cookies.jwt;

    try {
        // First verify the token signature
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Get token details from database
        const userResult = await query(refreshTokenQueries.findTokenDetails, [refreshToken]);
        const tokenDetails = userResult.rows[0];


        if (!tokenDetails) {
            // Token is valid but not in DB - possible theft!
            await query(refreshTokenQueries.deleteAllTokensByUserId, [decoded.id]);
            return res.status(403).clearCookie('jwt', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/'
            }).json({
                success: false,
                message: "Token revoked"
            });
        }

        if (tokenDetails.user_id !== decoded.id) {
            await query(refreshTokenQueries.deleteAllTokensByUserId, [decoded.id]);
            return res.status(403).clearCookie('jwt', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/'
            }).json({
                success: false,
                message: "Token revoked"
            });
        }

        // Calculate if we should rotate the refresh token (sliding window)
        const now = new Date();
        const tokenAge = now - tokenDetails.created_at;
        const tokenLifetime = tokenDetails.expires_at - tokenDetails.created_at;
        const tokenAgePercentage = (tokenAge / tokenLifetime) * 100;

        // Determine rememberMe based on original token lifetime
        const originalTokenDays = Math.round(tokenLifetime / (24 * 60 * 60 * 1000));
        const rememberMe = originalTokenDays === 15;
        const newRefreshTokenExpiryDays = rememberMe ? 15 : 1;

        // Generate new access token
        const accessToken = jwt.sign(
            {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1m' }
        );

        let newRefreshToken = null;

        // Rotate refresh token if within last 50% of its life
        if (tokenAgePercentage >= 50) {
            // Delete old refresh token
            await query(refreshTokenQueries.deleteToken, [refreshToken]);

            // Generate new refresh token
            newRefreshToken = jwt.sign(
                {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role, 
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: `${newRefreshTokenExpiryDays}d` }
            );

            // Store new refresh token in database
            await query(refreshTokenQueries.createRefreshToken, [
                decoded.id,
                newRefreshToken,
                new Date(Date.now() + newRefreshTokenExpiryDays * 24 * 60 * 60 * 1000),
                req.ip,
                req.get('User-Agent')
            ]);

            // Set new refresh token cookie
            res.cookie('jwt', newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None', // Consider 'lax' instead of 'None' for better security
                maxAge: newRefreshTokenExpiryDays * 24 * 60 * 60 * 1000
            });
        }

        res.json({
            success: true,
            message: "Access Token generation successful.",
            accessToken: accessToken,
            tokenRotated: !!newRefreshToken, // Indicate if a new refresh token was issued
            user: {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            }
        });

    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            // Auto-cleanup expired/invalid tokens
            await query(refreshTokenQueries.deleteToken, [refreshToken]);
            return res.status(403).clearCookie('jwt', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/'
            }).json({
                success: false,
                message: "Invalid refresh token"
            });
        }
        next(err);
    }
}

module.exports = refreshToken;