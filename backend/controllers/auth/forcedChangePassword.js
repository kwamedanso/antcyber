// controllers/auth/forcedChangePassword.js
const { changePasswordWithCredentials } = require('../../services/auth/auth.service');

const forcedChangePasswordController = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Email, old password, and new password are required.'
            });
        }

        await changePasswordWithCredentials(
            email,
            oldPassword,
            newPassword,
            { ip_address: req.ip }
        );

        return res.status(200).json({
            message: 'Password updated successfully. You can now log in.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { forcedChangePasswordController };