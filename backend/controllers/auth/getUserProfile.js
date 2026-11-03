// controllers/auth/.controller.js
const authService = require('../../services/auth/auth.service.js');

/**
 * GET /auth/me
 *
 * Returns the authenticated user's profile: user, roles, permissions.
 *
 * Requires: authenticate middleware (sets req.user.userId from JWT).
 *
 * Response 200: { success, data: { user, roles, permissions } }
 */
const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHENTICATED',
                message: 'Authentication required.'
            });
        }

        const profile = await authService.getUserProfile(userId);


        if (!profile) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = { getUserProfile };