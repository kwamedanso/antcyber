// controllers/staff/togglePortalAccess.js
const { togglePortalAccess } = require('../../services/staff/staff.service');

const togglePortalAccessController = async (req, res, next) => {
    try {
        const { userId } = req.params; // Uses the users.id UUID
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                message: 'is_active must be a boolean (true or false).'
            });
        }

        const result = await togglePortalAccess(userId, is_active, req.user.userId);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = { togglePortalAccessController };