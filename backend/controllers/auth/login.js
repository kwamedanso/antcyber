require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../utils/database/connection');
const { userQueries, refreshTokenQueries } = require('../../utils/database/queries');
const { validateLogin } = require('../../utils/validators');

async function login(req, res, next) {
    const { email, password, rememberMe } = req.body;


    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.'
        });
    }

    try {
        const REFRESH_TOKEN_EXPIRY_LONG = '15d';
        const REFRESH_TOKEN_EXPIRY_SHORT = '1d';

        // Convert rememberMe to boolean properly
        const isRememberMe = rememberMe === "true" || rememberMe === true;
        const refreshTokenExpiresIn = isRememberMe ? REFRESH_TOKEN_EXPIRY_LONG : REFRESH_TOKEN_EXPIRY_SHORT;
        const refreshTokenMaxAge = isRememberMe ? 15 : 1;

        // Validate input
        const validation = validateLogin(email, password);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Find user
        const userResult = await query(userQueries.findUserByEmail, [email]);
        const user = userResult.rows[0];

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Create JWTs
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: refreshTokenExpiresIn }
        );


        const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenMaxAge * 24 * 60 * 60 * 1000);
        // const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];



        // Store refresh token in database
        await query(refreshTokenQueries.createRefreshToken, [
            user.id,
            refreshToken,
            refreshTokenExpiresAt,
            req.ip,
            req.get('User-Agent')
        ]);


        // Clean up old refresh tokens (optional - prevent too many tokens per user)
        await query(refreshTokenQueries.deleteExpiredTokens);

        const isProduction = process.env.NODE_ENV === 'production';
        // Set HTTP-only cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: refreshTokenMaxAge * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken: accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({  // ← Proper error response
            success: false,
            message: 'Internal server error during login'
        });
    }
}

module.exports = login