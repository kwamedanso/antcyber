// controllers/rbac/getUserAccess.js
const { getUserAccessDetails } = require('../../services/rbac/rbac.service');

const getUserAccessController = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const access = await getUserAccessDetails(userId);
        
        return res.status(200).json({
            message: 'User access retrieved successfully.',
            data: access
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getUserAccessController };